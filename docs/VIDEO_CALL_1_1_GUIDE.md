# Hệ thống gọi video 1:1 - Tư vấn khách hàng

## Tổng quan

Hệ thống cho phép khách hàng đặt lịch gọi video với nhân viên tư vấn. Nhân viên chọn tư vấn cho khách hàng nào thì chỉ nhân viên đó mới có thể tham gia cuộc gọi. Các nhân viên khác hoặc khách hàng khác không thể tham gia.

## Kiến trúc

### 1. Database Schema

**Bảng `LichGoiVideo`:**
- `id`: ID lịch
- `id_khachhang`: Khách hàng đặt lịch
- `id_rapphim`: Rạp phim
- `id_nhanvien`: Nhân viên được chọn (NULL = chưa có NV)
- `room_id`: ID phòng WebRTC (được tạo khi NV chọn tư vấn)
- `trang_thai`: 1=Chờ NV, 2=Đã chọn NV, 3=Đang gọi, 4=Hoàn thành, 5=Hủy

**Bảng `WebRTCSession`:**
- Lưu trạng thái kết nối WebRTC
- Peer ID của khách hàng và nhân viên

### 2. Flow hoạt động

#### A. Khách hàng đặt lịch
1. Khách hàng điền form: rạp, chủ đề, thời gian
2. API tạo record trong `LichGoiVideo` với `trang_thai = 1` (Chờ nhân viên)
3. Redis publish event `lichgoivideo:moi` để thông báo cho nhân viên rạp đó

#### B. Nhân viên chọn tư vấn
1. Nhân viên xem danh sách lịch chờ của rạp mình
2. Nhân viên click "Chọn tư vấn"
3. API:
   - Cập nhật `id_nhanvien` và `trang_thai = 2`
   - Tạo `room_id` duy nhất: `video_{id_lich}_{timestamp}`
   - Lưu thông tin room vào Redis với key `videoroom:{room_id}`
   - Tạo record trong `WebRTCSession`
4. Redis publish event `lichgoivideo:dachon` để thông báo cho khách hàng

#### C. Tham gia cuộc gọi
1. **Khách hàng:** Nhận thông báo → Click link video call với `?room={room_id}`
2. **Nhân viên:** Click "Bắt đầu gọi" → Mở trang video call với `?room={room_id}`
3. Trang video call:
   - Load `room_id` từ URL
   - Xác định `userId` và `userType` (customer/staff)
   - Kết nối Socket.IO namespace `/video`
   - Emit `join-room` với: `{ roomId, userId, userType }`

#### D. Socket.IO xác thực quyền
Server kiểm tra:
```javascript
// Lấy room info từ Redis
const roomInfo = await redis.get(`videoroom:${roomId}`);

if (userType === 'customer') {
    // Khách hàng: phải đúng người đặt lịch
    if (userId != roomInfo.id_khachhang) {
        reject('Bạn không có quyền tham gia cuộc gọi này');
    }
} else if (userType === 'staff') {
    // Nhân viên: phải đúng người được chọn
    if (userId != roomInfo.id_nhanvien) {
        reject('Cuộc gọi này đã được nhân viên khác nhận');
    }
}
```

#### E. WebRTC Signaling
1. Cả 2 bên đều join room thành công
2. Khách hàng (người đến sau) tạo **offer**
3. Nhân viên nhận offer → tạo **answer**
4. Trao đổi **ICE candidates**
5. Kết nối P2P thành công

#### F. Kết thúc cuộc gọi
1. Một trong hai bên click "End call"
2. Socket emit `leave-room`
3. Server kiểm tra: nếu không còn ai → gọi API `/goi-video/ket-thuc`
4. Cập nhật `trang_thai = 4` và `thoi_gian_ket_thuc`
5. Xóa `videoroom:{room_id}` khỏi Redis

## API Endpoints

### 1. Khách hàng đặt lịch
```
POST /api/goi-video/dat-lich
Body: {
    "id_rapphim": 1,
    "chu_de": "Tư vấn đặt vé",
    "mo_ta": "Muốn biết về combo",
    "thoi_gian_dat": "2025-10-06 14:00:00"
}
```

### 2. Nhân viên lấy danh sách lịch
```
GET /api/goi-video/danh-sach-lich
Auth: Nhân viên
Response: [
    {
        "id": 1,
        "khachhang": {...},
        "chu_de": "...",
        "trang_thai": 1,
        "id_nhanvien": null,
        "room_id": null
    }
]
```

### 3. Nhân viên chọn tư vấn
```
POST /api/goi-video/{id}/chon-tu-van
Auth: Nhân viên
Response: {
    "success": true,
    "data": {
        "lich": {...},
        "room_id": "video_1_1696578000"
    }
}
```

### 4. Kiểm tra trạng thái lịch
```
GET /api/goi-video/{id}/trang-thai
Auth: Khách hàng
```

### 5. Hủy tư vấn
```
POST /api/goi-video/{id}/huy
Auth: Nhân viên
```

## Socket.IO Events

### Client → Server

**`join-room`**
```javascript
{
    roomId: "video_1_1696578000",
    userId: 123,
    userType: "customer" // hoặc "staff"
}
```

**`offer`**
```javascript
{
    roomId: "video_1_1696578000",
    offer: RTCSessionDescription
}
```

**`answer`**
```javascript
{
    roomId: "video_1_1696578000",
    answer: RTCSessionDescription
}
```

**`ice-candidate`**
```javascript
{
    roomId: "video_1_1696578000",
    candidate: RTCIceCandidate
}
```

**`leave-room`**
```javascript
// Không cần data
```

### Server → Client

**`room-joined`**
```javascript
{
    roomId: "video_1_1696578000",
    participants: { customer: "socketId1", staff: "socketId2" }
}
```

**`join-error`**
```javascript
{
    message: "Bạn không có quyền tham gia cuộc gọi này"
}
```

**`user-joined`**
```javascript
{
    userId: 456,
    userType: "staff",
    socketId: "abc123"
}
```

**`user-left`**
```javascript
{
    userId: 456,
    userType: "staff"
}
```

## Bảo mật

### 1. Xác thực quyền tham gia
- Thông tin room lưu trong Redis với key `videoroom:{room_id}`
- Chỉ có `id_khachhang` và `id_nhanvien` trong room info mới được phép join
- Socket.IO kiểm tra nghiêm ngặt trước khi cho vào room

### 2. Room ID duy nhất
- Format: `video_{id_lich}_{timestamp}`
- Không thể đoán được
- TTL trong Redis: 24h

### 3. Session validation
- Kiểm tra session của user trước khi tham gia
- userId phải match với session hiện tại

## Sử dụng

### Khách hàng
1. Vào trang "Đặt lịch gọi video"
2. Chọn rạp, nhập thông tin, đặt lịch
3. Chờ nhân viên chọn tư vấn
4. Nhận thông báo → Click link tham gia cuộc gọi

### Nhân viên
1. Vào trang "Duyệt lịch gọi video"
2. Xem danh sách lịch chờ
3. Click "Chọn tư vấn" cho lịch muốn nhận
4. Click "Bắt đầu gọi" để vào cuộc gọi
5. Tư vấn cho khách hàng
6. Click "End call" khi xong

## Testing

### Test case 1: Nhân viên A chọn tư vấn
- Nhân viên B không thể tham gia cuộc gọi của A
- Khách hàng khác không thể tham gia

### Test case 2: Khách hàng A đặt lịch
- Khách hàng B không thể tham gia cuộc gọi của A

### Test case 3: Chưa có nhân viên chọn
- Khách hàng không thể tham gia (room chưa được tạo)

## Troubleshooting

### Lỗi "Room không tồn tại"
- Room đã hết hạn (24h)
- Room chưa được tạo (nhân viên chưa chọn tư vấn)

### Lỗi "Bạn không có quyền"
- Sai userId hoặc userType
- Nhân viên khác đang tư vấn

### Video không hiển thị
- Kiểm tra quyền camera/mic
- Kiểm tra ICE candidates
- Kiểm tra firewall/NAT

## Files quan trọng

- `src/Models/LichGoiVideo.php` - Model lịch gọi video
- `src/Services/Sc_GoiVideo.php` - Service logic
- `src/Controllers/Ctrl_GoiVideo.php` - Controller
- `ServiceRealtime/sockets/videoCallHandler.js` - Socket.IO handler
- `customer/js/video-call-updated.js` - Client WebRTC
- `internal/js/duyet-lich-goi-video.js` - Nhân viên quản lý lịch
