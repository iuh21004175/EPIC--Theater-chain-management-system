# 🧪 Hướng dẫn Test Video Call System - EPIC Cinema

## 📋 Tổng quan

Tài liệu này hướng dẫn test toàn bộ hệ thống video call từ đầu đến cuối, bao gồm:
- Đặt lịch gọi video (API)
- Nhân viên xác nhận
- Real-time notification qua Socket.IO
- Khách hàng tham gia video call
- WebRTC connection

## 🚀 Yêu cầu trước khi test

### 1. **Môi trường phát triển**
```bash
✅ PHP 7.4+ với PDO MySQL
✅ MySQL 5.7+ hoặc MariaDB
✅ Node.js 14+ (cho Socket.IO server)
✅ Redis Server (cho pub/sub)
✅ Browser hiện đại (Chrome 90+, Firefox 88+, Edge 90+)
```

### 2. **Khởi động các services**

#### **Redis Server:**
```bash
# Windows (nếu cài qua Chocolatey)
redis-server

# Hoặc chạy từ installation directory
cd C:\Program Files\Redis
redis-server.exe
```

#### **Socket.IO Server:**
```bash
cd i:\Final\Code\ServiceRealtime
npm install
node server.js

# Expected output:
# Socket.IO server running on port 3000
# Redis Subscriber connected
```

#### **PHP Development Server:**
```bash
cd i:\Final\Code\ChuoiRapChieuPhim1
php -S localhost:80 -t .

# Hoặc dùng XAMPP/WAMP/Laravel Valet
```

### 3. **Database Setup**

Kiểm tra các bảng cần thiết:
```sql
-- Kiểm tra bảng lich_goi_video
SELECT * FROM lich_goi_video LIMIT 5;

-- Kiểm tra bảng webrtc_sessions
SELECT * FROM webrtc_sessions LIMIT 5;

-- Kiểm tra bảng rap_phim
SELECT ID_Rap, TenRap FROM rap_phim;
```

## 🎬 Test Case 1: Đặt lịch gọi video (Customer)

### **Bước 1: Mở trang đặt lịch**

```
URL: http://localhost/rapphim/tu-van/dat-lich-goi-video
```

**Expected:**
- ✅ Trang hiển thị lịch (FullCalendar)
- ✅ Có nút "Đặt lịch gọi video"
- ✅ Console log: `✅ Socket connected: <socket_id>`

### **Bước 2: Chọn ngày giờ và đặt lịch**

1. Click vào một ngày trên calendar
2. Form đặt lịch hiển thị
3. Điền thông tin:
   - Chọn rạp
   - Giờ: `14:00`
   - Nội dung: `Tư vấn về vé xem phim`
   - Số điện thoại: `0902599450`
4. Click "Đặt lịch"

**Expected response:**
```json
{
  "success": true,
  "message": "Đặt lịch thành công",
  "data": {
    "id": 123,
    "id_khach_hang": 1,
    "id_rap": 1,
    "ngay": "2025-01-07",
    "gio": "14:00",
    "noi_dung": "Tư vấn về vé xem phim",
    "so_dien_thoai": "0902599450",
    "trang_thai": "Chờ nhân viên"
  }
}
```

**Verify:**
```sql
-- Kiểm tra record trong database
SELECT * FROM lich_goi_video 
WHERE id_khach_hang = 1 
ORDER BY created_at DESC 
LIMIT 1;
```

### **Bước 3: Kiểm tra real-time update**

**Expected:**
- ✅ Calendar tự động reload và hiển thị lịch vừa đặt
- ✅ Badge màu xanh dương: "Chờ nhân viên"
- ✅ Console log: `📅 Lịch đã được cập nhật`

## 👨‍💼 Test Case 2: Nhân viên xác nhận (Staff)

### **Bước 1: Nhân viên login**

```
URL: http://localhost/rapphim/internal/dang-nhap
Credentials: (Tài khoản nhân viên)
```

### **Bước 2: Vào trang duyệt lịch**

```
URL: http://localhost/rapphim/internal/duyet-lich-goi-video
```

**Expected:**
- ✅ Hiển thị danh sách lịch chờ duyệt
- ✅ Lịch vừa đặt xuất hiện với trạng thái "Chờ nhân viên"

### **Bước 3: Chọn tư vấn**

1. Tìm lịch của khách hàng
2. Click nút "Chọn tư vấn"

**Expected Backend:**
```php
// API được gọi: POST /api/nhan-vien-chon-tu-van
{
  "id_lich": 123
}
```

**Database changes:**
```sql
-- Cập nhật trạng thái
UPDATE lich_goi_video 
SET trang_thai = 2,  -- DA_CHON_NV
    id_nhan_vien = 5
WHERE id = 123;

-- Tạo WebRTC session
INSERT INTO webrtc_sessions 
(room_id, id_lich_goi_video, ...) 
VALUES ('room_abc123', 123, ...);
```

**Redis publish:**
```redis
PUBLISH lichgoivideo:dachon '{"id_lich": 123, "room_id": "room_abc123"}'
```

### **Bước 4: Verify real-time notification**

**ServiceRealtime logs:**
```
📨 Received message on channel: lichgoivideo:dachon
📤 Looking up customer socket ID for customer: 1
✅ Found socket ID: <customer_socket_id>
📤 Emitting to specific customer socket: <socket_id>
```

## 🔔 Test Case 3: Khách hàng nhận notification

### **Quan sát trang khách hàng**

**Màn hình:** `http://localhost/rapphim/tu-van/dat-lich-goi-video`

**Expected (real-time):**
1. **Toast notification xuất hiện:**
   ```
   ✅ Lịch gọi video đã được xác nhận!
   Bạn có thể tham gia cuộc gọi ngay bây giờ.
   ```

2. **Badge đổi màu:**
   - Từ: `<span class="bg-blue-500">Chờ nhân viên</span>`
   - Thành: `<span class="bg-green-500">Đã xác nhận</span>`

3. **Nút "Tham gia cuộc gọi" xuất hiện:**
   ```html
   <a href="http://localhost/rapphim/video-call?room=room_abc123" 
      class="bg-green-600">
       Tham gia cuộc gọi
   </a>
   ```

**Console logs:**
```javascript
✅ Socket connected: <socket_id>
📨 Lịch đã được xác nhận: {id_lich: 123, room_id: "room_abc123"}
📅 Tự động reload danh sách lịch
✨ Toast notification displayed
```

## 🎥 Test Case 4: Tham gia video call

### **Bước 1: Click "Tham gia cuộc gọi"**

**URL được navigate:** `http://localhost/rapphim/video-call?room=room_abc123`

**Expected:**
- ✅ Hiển thị màn hình chờ với nút "Tham gia cuộc gọi"
- ✅ Không có popup xin phép camera/mic (chưa click nút)

### **Bước 2: Click nút "Tham gia cuộc gọi"**

**Expected sequence:**

1. **Browser popup:**
   ```
   localhost wants to:
   ○ Use your camera
   ○ Use your microphone
   
   [Block] [Allow]
   ```

2. **User clicks "Allow":**
   - ✅ Màn hình chờ biến mất
   - ✅ Video interface hiển thị
   - ✅ Local video hiển thị camera của user
   - ✅ Status: "Đang kết nối..."

3. **Socket.IO connection:**
   ```javascript
   // Console logs:
   ✅ Socket connected: <socket_id>
   📤 Joining room: room_abc123
   ✅ Đã tham gia room
   ```

4. **WebRTC negotiation:**
   ```javascript
   // Console logs:
   ➕ Added track: audio
   ➕ Added track: video
   📤 Gửi offer
   📥 Nhận answer từ: staff
   🧊 Gửi ICE candidate
   🧊 Nhận ICE candidate từ: staff
   ✅ Peer connection established
   📺 Nhận remote stream: <stream_id>
   ```

5. **Video connected:**
   - ✅ Remote video hiển thị nhân viên
   - ✅ Status: "Đã kết nối thành công!"
   - ✅ Timer bắt đầu đếm: `00:00`
   - ✅ Call quality: "Tốt" (màu xanh)

### **Bước 3: Test các chức năng**

#### **Test Mute Microphone:**
```
1. Click nút microphone
Expected:
  - Icon đổi từ fa-microphone → fa-microphone-slash
  - Button đổi màu: bg-gray-700 → bg-red-600
  - Console: Audio track.enabled = false
```

#### **Test Disable Camera:**
```
1. Click nút camera
Expected:
  - Icon đổi từ fa-video → fa-video-slash
  - Button đổi màu: bg-gray-700 → bg-red-600
  - Local video đen (track disabled)
  - Console: Video track.enabled = false
```

#### **Test Screen Share:**
```
1. Click nút chia sẻ màn hình
Expected:
  - Browser popup xin chọn màn hình/cửa sổ
  - Sau khi chọn, local video hiển thị màn hình
  - Remote peer nhận được màn hình
  - Button đổi màu: bg-gray-700 → bg-red-600
  
2. Click lại để dừng
Expected:
  - Local video quay về camera
  - Button về màu: bg-gray-700
```

#### **Test Chat:**
```
1. Gõ tin nhắn: "Xin chào"
2. Click gửi
Expected:
  - Tin nhắn xuất hiện bên phải (màu xám)
  - Hiển thị thời gian
  - Auto scroll to bottom
```

#### **Test End Call:**
```
1. Click nút "Kết thúc cuộc gọi" (đỏ)
Expected:
  - Modal "Cuộc gọi đã kết thúc" hiển thị
  - Tất cả tracks bị stop
  - Socket.IO disconnect
  - Peer connection close
  - Console: 🔴 Kết thúc cuộc gọi
```

## 🐛 Test Error Scenarios

### **Scenario 1: User từ chối quyền camera/mic**

**Steps:**
1. Vào `/video-call?room=xxx`
2. Click "Tham gia cuộc gọi"
3. Click "Block" trong popup

**Expected:**
```
Alert hiển thị:
"Bạn đã từ chối quyền truy cập camera/microphone.

Vui lòng:
1. Nhấn vào biểu tượng khóa/camera trên thanh địa chỉ
2. Cho phép truy cập Camera và Microphone
3. Tải lại trang và thử lại"

Nút đổi thành: "Thử lại"
```

### **Scenario 2: Không có camera/microphone**

**Steps:**
1. Ngắt kết nối camera/mic
2. Vào `/video-call?room=xxx`
3. Click "Tham gia cuộc gọi"

**Expected:**
```
Alert:
"Không tìm thấy camera hoặc microphone.

Vui lòng kiểm tra:
• Camera/microphone đã được kết nối
• Thiết bị hoạt động bình thường
• Không có ứng dụng nào khác đang sử dụng"
```

### **Scenario 3: Socket.IO server offline**

**Steps:**
1. Stop ServiceRealtime (Ctrl+C)
2. Click "Tham gia cuộc gọi"

**Expected:**
```
Status: "Lỗi kết nối máy chủ. Đang thử lại..."
Console: ❌ Socket connection error
```

### **Scenario 4: Redis server offline**

**Steps:**
1. Stop Redis server
2. Nhân viên click "Chọn tư vấn"

**Expected:**
```
Backend log:
❌ Redis connection error
Không thể publish event

Khách hàng không nhận được notification (silent fail)
```

### **Scenario 5: WebRTC connection failed**

**Steps:**
1. Block ICE candidates (network firewall)
2. Tham gia cuộc gọi

**Expected:**
```
Connection state: "failed"
Alert: "Kết nối thất bại. Vui lòng thử lại."
Modal kết thúc cuộc gọi hiển thị
```

## 📊 Monitoring & Debugging

### **Browser Console Commands:**

#### **Check Socket.IO status:**
```javascript
// Paste vào console
console.log('Socket connected:', socket?.connected);
console.log('Socket ID:', socket?.id);
console.log('Room ID:', roomId);
```

#### **Check WebRTC stats:**
```javascript
// Kiểm tra connection state
console.log('Connection state:', peerConnection?.connectionState);
console.log('ICE connection state:', peerConnection?.iceConnectionState);
console.log('Signaling state:', peerConnection?.signalingState);

// Xem tracks
console.log('Local tracks:', localStream?.getTracks());
console.log('Remote tracks:', remoteStream?.getTracks());
```

#### **Monitor network quality:**
```javascript
// Get stats
peerConnection.getStats().then(stats => {
    stats.forEach(report => {
        if (report.type === 'inbound-rtp' && report.kind === 'video') {
            console.log('Video stats:', {
                bytesReceived: report.bytesReceived,
                packetsLost: report.packetsLost,
                jitter: report.jitter
            });
        }
    });
});
```

### **ServiceRealtime Logs:**

Theo dõi terminal chạy `node server.js`:

```bash
# Good connection:
✅ Socket connected: <socket_id>
📤 User joined room: room_abc123
📨 Received message on channel: lichgoivideo:dachon
✅ Found socket ID for customer
📤 Emitting to customer socket

# Error scenarios:
❌ Redis connection error
❌ Socket disconnected: <socket_id>
⚠️ Room not found: room_xxx
```

### **PHP Backend Logs:**

Enable error logging:
```php
// config.php
ini_set('display_errors', 1);
error_reporting(E_ALL);
```

Kiểm tra logs:
```bash
# XAMPP
tail -f C:/xampp/apache/logs/error.log

# Laravel/custom
tail -f storage/logs/laravel.log
```

### **Redis Monitoring:**

```bash
# Monitor real-time commands
redis-cli MONITOR

# Check pub/sub channels
redis-cli PUBSUB CHANNELS lichgoivideo:*

# Check key expiry
redis-cli GET customer_socket:<customer_id>
```

## ✅ Checklist hoàn chỉnh

### **Pre-flight checks:**
- [ ] Redis server chạy (port 6379)
- [ ] Socket.IO server chạy (port 3000)
- [ ] PHP server chạy (port 80)
- [ ] Database có dữ liệu test
- [ ] Browser đã cho phép camera/mic

### **API Tests:**
- [ ] POST `/api/dat-lich-goi-video` → 200 OK
- [ ] GET `/tu-van/dat-lich-goi-video` → hiển thị calendar
- [ ] POST `/api/nhan-vien-chon-tu-van` → 200 OK
- [ ] GET `/video-call?room=xxx` → hiển thị waiting screen

### **Socket.IO Tests:**
- [ ] Customer socket connect thành công
- [ ] Staff socket connect thành công
- [ ] Event `lichgoivideo:dachon` được emit
- [ ] Customer nhận được notification
- [ ] Room join/leave hoạt động

### **WebRTC Tests:**
- [ ] Local stream setup thành công
- [ ] Offer/Answer exchange thành công
- [ ] ICE candidates exchange
- [ ] Peer connection established
- [ ] Remote stream hiển thị
- [ ] Microphone mute/unmute
- [ ] Camera on/off
- [ ] Screen share
- [ ] End call cleanup

### **Error Handling Tests:**
- [ ] Permission denied → hiển thị hướng dẫn
- [ ] Device not found → error message
- [ ] Socket disconnect → reconnect
- [ ] WebRTC failed → alert và cleanup
- [ ] Redis offline → graceful degradation

## 🎯 Performance Benchmarks

### **Expected Response Times:**

| Action | Expected Time | Acceptable |
|--------|---------------|------------|
| API đặt lịch | < 200ms | < 500ms |
| Socket.IO connect | < 100ms | < 300ms |
| getUserMedia() | < 1000ms | < 3000ms |
| WebRTC connect | < 3000ms | < 5000ms |
| Redis pub/sub | < 50ms | < 100ms |

### **Video Quality Thresholds:**

| Metric | Good | Acceptable | Poor |
|--------|------|------------|------|
| Packet Loss | < 1% | < 5% | > 5% |
| Jitter | < 30ms | < 100ms | > 100ms |
| Latency | < 150ms | < 300ms | > 300ms |
| FPS | 30 fps | 15 fps | < 15 fps |

## 📞 Troubleshooting

### **Problem: Không nhận được notification**

**Checklist:**
1. Kiểm tra Redis running: `redis-cli PING` → PONG
2. Kiểm tra ServiceRealtime logs có error không
3. Verify Redis subscription: `redis-cli PUBSUB NUMSUB lichgoivideo:dachon`
4. Check customer socket ID trong Redis: `redis-cli GET customer_socket:1`
5. Mở console khách hàng, xem có log `Socket connected` không

### **Problem: Video không hiển thị**

**Checklist:**
1. Kiểm tra permission: `navigator.permissions.query({name: 'camera'})`
2. Verify tracks: `localStream.getTracks()` → có audio và video không
3. Check peer connection: `peerConnection.connectionState` → 'connected'?
4. Kiểm tra remote stream: `remoteVideo.srcObject` có giá trị không
5. Test camera độc lập: Mở camera trong tab khác

### **Problem: Lỗi NotAllowedError**

**Solution:**
1. Reset permissions: Chrome → Site Settings → Reset permissions
2. Đảm bảo HTTPS (nếu production)
3. Verify user click button trước khi gọi getUserMedia()
4. Check `joinCallBtn.addEventListener('click')` được gắn đúng

## 📖 References

- [WebRTC Documentation](https://webrtc.org/getting-started/overview)
- [Socket.IO Docs](https://socket.io/docs/v4/)
- [MDN getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [Redis Pub/Sub](https://redis.io/docs/manual/pubsub/)

---

**Tác giả:** GitHub Copilot  
**Ngày tạo:** 2025-01-07  
**Version:** 2.0 - Comprehensive Testing Guide
