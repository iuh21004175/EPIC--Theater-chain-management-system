# Hướng dẫn Khách hàng tham gia Video Call

## Flow hoàn chỉnh

### 1. Khách hàng đặt lịch
**URL**: `http://localhost/rapphim/tu-van/goi-video` hoặc `http://localhost/rapphim/tu-van/dat-lich-goi-video`

**Các bước:**
1. Khách hàng đăng nhập
2. Chọn ngày, giờ, rạp
3. Nhập nội dung tư vấn và số điện thoại
4. Click "Xác nhận đặt lịch"
5. Lịch được tạo với trạng thái **"Chờ xác nhận"** (trang_thai = 1)

### 2. Nhân viên xác nhận lịch
**URL**: `http://localhost/rapphim/internal/duyet-lich-goi-video`

**Các bước:**
1. Nhân viên đăng nhập
2. Xem danh sách lịch chờ
3. Click nút **"Chọn tư vấn"**
4. Hệ thống tự động:
   - Tạo `room_id` duy nhất
   - Cập nhật trạng thái thành **"Đã xác nhận"** (trang_thai = 2)
   - Lưu thông tin vào Redis
   - **Publish event** `lichgoivideo:dachon` qua Redis

### 3. Khách hàng nhận thông báo real-time ⚡

Khi nhân viên xác nhận:
- Socket.IO server nhận event từ Redis
- Gửi thông báo đến khách hàng qua socket
- Trang đặt lịch của khách hàng tự động:
  - Hiển thị toast **"Nhân viên đã xác nhận lịch tư vấn của bạn!"**
  - Reload danh sách lịch
  - Hiển thị nút **"Tham gia cuộc gọi"** màu xanh

### 4. Khách hàng tham gia cuộc gọi 📞

**2 cách để tham gia:**

#### Cách 1: Từ trang đặt lịch
1. Vào `http://localhost/rapphim/tu-van/goi-video`
2. Chọn ngày có lịch đã xác nhận
3. Trong danh sách lịch tư vấn, sẽ thấy nút **"Tham gia cuộc gọi"**
4. Click vào nút này

#### Cách 2: Nhân viên gửi link
- Link: `http://localhost/rapphim/video-call?room={room_id}`
- Khách hàng chỉ cần click vào link

### 5. Trong phòng video call 🎥

**Xác thực quyền truy cập:**
- Socket.IO server kiểm tra:
  - Room ID có tồn tại trong Redis không?
  - User ID có khớp với `id_khachhang` trong room không?
  - Nếu đúng → Cho phép tham gia
  - Nếu sai → Hiển thị lỗi "Bạn không có quyền tham gia cuộc gọi này"

**Khi cả 2 bên vào room:**
- Tự động cập nhật trạng thái thành **"Đang gọi"** (trang_thai = 3)
- Thiết lập kết nối WebRTC
- Bắt đầu video call

### 6. Kết thúc cuộc gọi 📴

**Khi 1 trong 2 người rời:**
- Socket.IO phát hiện disconnect
- Nếu không còn ai trong room:
  - Gọi API kết thúc cuộc gọi
  - Cập nhật trạng thái thành **"Hoàn thành"** (trang_thai = 4)
  - Xóa thông tin room khỏi Redis

---

## Giao diện khách hàng

### Trạng thái lịch & Màu sắc

| Trạng thái | Màu Badge | Hành động |
|-----------|----------|-----------|
| Chờ xác nhận | Xanh dương | Chờ nhân viên |
| Đã xác nhận | Xanh lá | ✅ Nút "Tham gia cuộc gọi" |
| Đang gọi | Đỏ | ✅ Nút "Tham gia cuộc gọi" |
| Hoàn thành | Xám | Không có nút |

### Nút "Tham gia cuộc gọi"

**Hiển thị khi:**
- Trạng thái = "Đã xác nhận" HOẶC "Đang gọi"
- `room_id` tồn tại

**Giao diện:**
```html
<a href="/video-call?room={room_id}" 
   class="inline-flex items-center px-4 py-2 bg-green-600 text-white">
    <svg>...</svg> <!-- Icon video camera -->
    Tham gia cuộc gọi
</a>
```

---

## Các sự kiện Socket.IO

### Client (Khách hàng)

**Kết nối:**
```javascript
const socket = io('http://localhost:3000/video');
```

**Lắng nghe sự kiện:**
```javascript
// Khi nhân viên chọn tư vấn
socket.on('lichgoivideo:dachon', (data) => {
    console.log('Nhân viên đã xác nhận:', data);
    // data: { id_lich, id_khachhang, id_nhanvien, room_id }
    
    // Reload danh sách
    fetchVideoCallsByDate(selectedDate);
    
    // Hiển thị thông báo
    showSuccessToast('Nhân viên đã xác nhận lịch tư vấn của bạn!');
});

// Khi nhân viên hủy
socket.on('lichgoivideo:huy', (data) => {
    console.log('Nhân viên đã hủy:', data);
    // Reload danh sách
    fetchVideoCallsByDate(selectedDate);
});
```

### Server (Node.js)

**Subscribe Redis channels:**
```javascript
subscriber.subscribe("lichgoivideo:moi");
subscriber.subscribe("lichgoivideo:dachon");
subscriber.subscribe("lichgoivideo:huy");
```

**Xử lý và emit:**
```javascript
subscriber.on("message", async (channel, message) => {
    if (channel === "lichgoivideo:dachon") {
        const data = JSON.parse(message);
        
        // Lấy socket ID của khách hàng
        const socketId = await redis.get(`khach-hang-${data.id_khachhang}`);
        
        if(socketId) {
            // Gửi đến khách hàng cụ thể
            io.to(socketId).emit("lichgoivideo:dachon", data);
        }
        
        // Broadcast đến namespace video
        io.of('/video').emit('lichgoivideo:dachon', data);
    }
});
```

---

## API Endpoints liên quan

### 1. Lấy danh sách lịch theo ngày
```
GET /api/lich-goi-video-theo-ngay?ngay=2025-10-07
```

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": 3,
            "gio": "11:00",
            "ten_rap": "EPIC Cinema - Cầu Giấy",
            "noi_dung": "Tư vấn về lịch chiếu phim",
            "mo_ta": "Số điện thoại: 0902599450",
            "trang_thai": "Đã xác nhận",
            "trang_thai_code": 2,
            "nhan_vien": "Nguyễn Văn A",
            "room_id": "video_3_1759808920",
            "thoi_gian_dat": "2025-10-07 11:00:00"
        }
    ]
}
```

### 2. Nhân viên chọn tư vấn
```
POST /api/goi-video/{id_lich}/chon-tu-van
```

**Response:**
```json
{
    "success": true,
    "message": "Đã nhận tư vấn cho khách hàng",
    "data": {
        "lich": {...},
        "room_id": "video_3_1759808920"
    }
}
```

### 3. Bắt đầu cuộc gọi (tự động)
```
POST /api/goi-video/bat-dau
Body: { "room_id": "video_3_1759808920" }
```

### 4. Kết thúc cuộc gọi (tự động)
```
POST /api/goi-video/ket-thuc
Body: { "room_id": "video_3_1759808920" }
```

---

## Test Flow

### Test Case 1: Flow đầy đủ

1. ✅ Khách hàng đặt lịch
2. ✅ Nhân viên xác nhận
3. ✅ Khách hàng nhận thông báo real-time
4. ✅ Nút "Tham gia" hiển thị
5. ✅ Click vào nút
6. ✅ Kiểm tra quyền truy cập
7. ✅ Video call hoạt động
8. ✅ Kết thúc cuộc gọi

### Test Case 2: Khách hàng khác cố truy cập

1. Khách hàng A đặt lịch
2. Nhân viên xác nhận → tạo `room_id`
3. Khách hàng B cố dùng link room của A
4. ✅ Hệ thống từ chối: "Bạn không có quyền tham gia cuộc gọi này"

### Test Case 3: Nhân viên hủy

1. Khách hàng đặt lịch
2. Nhân viên chọn tư vấn
3. Khách hàng thấy nút "Tham gia"
4. Nhân viên click "Hủy"
5. ✅ Khách hàng nhận thông báo
6. ✅ Nút "Tham gia" biến mất
7. ✅ Trạng thái về "Chờ xác nhận"

---

## Checklist triển khai

- [x] API lấy lịch theo ngày
- [x] API nhân viên chọn tư vấn
- [x] Route `/video-call` cho khách hàng
- [x] Socket.IO namespace `/video`
- [x] Redis pub/sub channels
- [x] JavaScript hiển thị nút "Tham gia"
- [x] JavaScript lắng nghe sự kiện real-time
- [x] Kiểm tra quyền truy cập room
- [x] WebRTC signaling
- [x] Tự động cập nhật trạng thái

---

## Lưu ý quan trọng ⚠️

1. **Redis server phải chạy** để pub/sub hoạt động
2. **Socket.IO server (ServiceRealtime)** phải chạy trên port 3000
3. **Khách hàng phải đăng nhập** để nhận thông báo real-time
4. **Room ID** chỉ hợp lệ trong 24h (TTL trong Redis)
5. **Chỉ khách hàng đặt lịch** mới có quyền vào room đó
6. **Chỉ nhân viên được chọn** mới có quyền vào room đó

---

## Khắc phục sự cố

### Vấn đề: Không nhận được thông báo
- Kiểm tra Redis server
- Kiểm tra Socket.IO connection
- Xem console log trong browser

### Vấn đề: Không thấy nút "Tham gia"
- Kiểm tra trạng thái lịch (phải là "Đã xác nhận")
- Kiểm tra `room_id` có tồn tại không
- F5 reload trang

### Vấn đề: Lỗi khi click "Tham gia"
- Kiểm tra route `/video-call` đã được thêm chưa
- Kiểm tra `room_id` trong URL
- Kiểm tra đã đăng nhập chưa
