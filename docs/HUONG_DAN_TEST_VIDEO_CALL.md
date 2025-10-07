# Hướng dẫn test chức năng Video Call

## Các URL quan trọng

### Cho Khách hàng:
- **Trang đặt lịch gọi video**: `http://localhost/rapphim/tu-van/dat-lich-goi-video`
- **Trang video call**: `http://localhost/rapphim/video-call?room={room_id}`

### Cho Nhân viên (Internal):
- **Trang duyệt lịch gọi video**: `http://localhost/rapphim/internal/duyet-lich-goi-video`

## Flow hoàn chỉnh

### 1. Khách hàng đặt lịch
1. Đăng nhập tài khoản khách hàng
2. Truy cập: `http://localhost/rapphim/tu-van/dat-lich-goi-video`
3. Chọn ngày, giờ, rạp, nhập nội dung tư vấn và số điện thoại
4. Click "Đặt lịch"
5. Hệ thống sẽ tạo lịch với trạng thái "Chờ nhân viên" (trang_thai = 1)

**API được gọi:**
```
POST http://localhost/rapphim/api/dat-lich-goi-video
Body: {
  "id_rap": "1",
  "ngay": "2025-10-07",
  "gio": "11:00",
  "noi_dung": "Tư vấn về lịch chiếu phim",
  "so_dien_thoai": "0902599450"
}
```

### 2. Nhân viên xem và chọn tư vấn
1. Đăng nhập tài khoản nhân viên
2. Truy cập: `http://localhost/rapphim/internal/duyet-lich-goi-video`
3. Xem danh sách lịch chờ (trạng thái "Chờ NV")
4. Click nút "Chọn tư vấn"
5. Hệ thống sẽ:
   - Cập nhật trạng thái thành "Đã chọn NV" (trang_thai = 2)
   - Tạo `room_id` duy nhất (format: `video_{id_lich}_{timestamp}`)
   - Tạo record trong bảng `webrtc_sessions`
   - Lưu thông tin vào Redis
   - Publish event qua Redis để thông báo khách hàng

**API được gọi:**
```
POST http://localhost/rapphim/api/goi-video/{id_lich}/chon-tu-van
```

### 3. Nhân viên bắt đầu gọi
1. Sau khi chọn tư vấn, nút "Chọn tư vấn" sẽ chuyển thành nút "Gọi"
2. Click nút "Gọi"
3. Hệ thống chuyển đến trang video call với URL:
   ```
   http://localhost/rapphim/video-call?room=video_3_1759808920
   ```

### 4. Khách hàng tham gia cuộc gọi
1. Khách hàng nhận được thông báo (qua WebSocket/Redis) về việc nhân viên đã chọn tư vấn
2. Khách hàng truy cập link video call (có thể được gửi qua email/SMS hoặc hiển thị trong trang)
3. Cả hai bên (khách hàng và nhân viên) sẽ vào cùng một room để video call

## Các trạng thái của lịch gọi video

| Mã | Tên | Mô tả |
|----|-----|-------|
| 1 | CHO_NHAN_VIEN | Lịch vừa được tạo, chờ nhân viên chọn |
| 2 | DA_CHON_NV | Nhân viên đã chọn, có thể bắt đầu gọi |
| 3 | DANG_GOI | Cuộc gọi đang diễn ra |
| 4 | HOAN_THANH | Cuộc gọi đã kết thúc |
| 5 | HUY | Lịch đã bị hủy |

## Cấu trúc database cần thiết

### Bảng `lich_goi_video`
```sql
CREATE TABLE `lich_goi_video` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_khachhang` int NOT NULL,
  `id_rapphim` int NOT NULL,
  `id_nhanvien` int DEFAULT NULL,
  `chu_de` varchar(255) NOT NULL,
  `mo_ta` text,
  `thoi_gian_dat` datetime NOT NULL,
  `room_id` varchar(100) DEFAULT NULL,
  `trang_thai` tinyint NOT NULL DEFAULT '1',
  `thoi_gian_bat_dau` datetime DEFAULT NULL,
  `thoi_gian_ket_thuc` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);
```

### Bảng `webrtc_sessions`
```sql
CREATE TABLE `webrtc_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_lich_goi_video` int NOT NULL,
  `room_id` varchar(100) NOT NULL,
  `peer_id_khachhang` varchar(100) DEFAULT NULL,
  `peer_id_nhanvien` varchar(100) DEFAULT NULL,
  `trang_thai` tinyint NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);
```

## Các API endpoints

### 1. Đặt lịch gọi video (Khách hàng)
```
POST /api/dat-lich-goi-video
Body: {
  "id_rap": "1",
  "ngay": "2025-10-07",
  "gio": "11:00",
  "noi_dung": "Nội dung tư vấn",
  "so_dien_thoai": "0902599450"
}
```

### 2. Lấy danh sách lịch theo ngày (Khách hàng)
```
GET /api/lich-goi-video-theo-ngay?ngay=2025-10-07
```

### 3. Lấy danh sách lịch chờ (Nhân viên)
```
GET /api/goi-video/danh-sach-lich
```

### 4. Chọn tư vấn (Nhân viên)
```
POST /api/goi-video/{id_lich}/chon-tu-van
```

### 5. Hủy tư vấn (Nhân viên)
```
POST /api/goi-video/{id_lich}/huy
```

## Kiểm tra lỗi thường gặp

### 1. Lỗi 404 - Trang không tìm thấy
- **Nguyên nhân**: Route chưa được định nghĩa
- **Giải pháp**: Đã thêm route `/video-call` vào `routes/customer.php`

### 2. Lỗi "Field 'room_id' doesn't have a default value"
- **Nguyên nhân**: Model `WebRTCSession` thiếu `room_id` trong `fillable`
- **Giải pháp**: Đã thêm `'room_id'` vào `fillable` array

### 3. Lỗi session không đồng nhất
- **Nguyên nhân**: Code dùng `$_SESSION['UserInternal']['ID']` ở một nơi và `$_SESSION['UserInternal']['ID_NhanVien']` ở nơi khác
- **Giải pháp**: Đã thống nhất dùng `$_SESSION['UserInternal']['ID']`

## Redis Events

Hệ thống sử dụng Redis pub/sub để thông báo real-time:

1. **lichgoivideo:moi** - Khi có lịch mới được tạo
2. **lichgoivideo:dachon** - Khi nhân viên chọn tư vấn
3. **lichgoivideo:huy** - Khi nhân viên hủy tư vấn

## Socket.IO Integration

Frontend connect tới Socket.IO server:
```javascript
const socket = io('http://localhost:3000/video');
socket.on('lichgoivideo:moi', () => loadDanhSachLich());
```

## Lưu ý khi test

1. Đảm bảo Redis server đang chạy
2. Đảm bảo Socket.IO server (ServiceRealtime) đang chạy trên port 3000
3. Đăng nhập đúng loại user (khách hàng hoặc nhân viên)
4. Kiểm tra console browser để xem các API call và errors
5. Room ID phải được truyền đúng trong URL: `/video-call?room=video_3_1759808920`
