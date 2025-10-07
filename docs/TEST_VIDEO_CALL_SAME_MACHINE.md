# Test Video Call trên cùng 1 máy

## Vấn đề

Khi test video call trên **cùng 1 máy** với 2 browser:
- **Browser 1** (Khách hàng) bật camera/mic → Chiếm quyền sử dụng
- **Browser 2** (Nhân viên) cố bật camera/mic → `NotAllowedError: Permission denied`

## Nguyên nhân

**1 camera/mic chỉ có thể được sử dụng bởi 1 ứng dụng tại 1 thời điểm!**

```javascript
// Browser 1: ✅ OK
await navigator.mediaDevices.getUserMedia({ audio: true, video: true });

// Browser 2: ❌ Error - Camera/mic đã bị chiếm bởi Browser 1
await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
// → NotAllowedError: Permission denied
```

## Giải pháp

### Option 1: CHỈ Browser đầu tiên bật camera/mic (✅ RECOMMENDED)

**Logic mới:**
- **Browser vào TRƯỚC** (thường là khách hàng): Tự động bật camera/mic
- **Browser vào SAU** (thường là nhân viên): KHÔNG bật camera/mic, chỉ nhận video từ bên kia

```javascript
// Trong user-joined handler
socket.on('user-joined', async (data) => {
    // ❌ KHÔNG tự động bật camera/mic
    // Tránh conflict khi test trên cùng 1 máy
    if (!localStream) {
        console.log('⚠️ Chưa có local stream, nhưng sẽ không tự động bật');
        console.log('💡 Người dùng có thể bật camera/mic thủ công bằng nút điều khiển');
    }
    
    // Tạo peer connection (có thể không có local stream)
    createPeerConnection();
    await createOffer();
});
```

### Option 2: Test với 2 máy khác nhau (✅ IDEAL)

- **Máy 1**: Khách hàng vào `http://192.168.x.x/rapphim/video-call?room=...`
- **Máy 2**: Nhân viên vào `http://192.168.x.x/rapphim/internal/video-call?room=...`

→ Mỗi máy có camera/mic riêng, không bị conflict

### Option 3: Sử dụng Virtual Camera (Advanced)

Cài đặt virtual camera software:
- **OBS Studio** với Virtual Camera
- **ManyCam**
- **XSplit VCam**

→ Tạo nhiều virtual camera để test trên cùng 1 máy

## Luồng test trên cùng 1 máy

### Bước 1: Browser 1 (Khách hàng) vào trước

```
1. Mở Chrome → http://localhost/rapphim/video-call?room=video_5_...
2. ✅ Tự động bật camera/mic (đã chiếm quyền)
3. Đang chờ nhân viên...
```

**Console logs:**
```
✅ Socket connected
✅ Đã tham gia room
👥 Số người trong room: 1
🎥 Có 2 người, tự động bật camera/mic... (chưa có người thứ 2)
Đang chờ nhân viên tư vấn...
```

### Bước 2: Browser 2 (Nhân viên) vào sau

```
1. Mở Edge → http://localhost/rapphim/internal/video-call?room=video_5_...
2. ⚠️ KHÔNG bật camera/mic (tránh conflict)
3. ✅ Nhận video từ khách hàng
4. Hiển thị video khách hàng, video nhân viên để trống
```

**Console logs:**
```
✅ Socket connected
✅ Đã tham gia room
👥 Số người trong room: 2
⚠️ Chưa có local stream, nhưng sẽ không tự động bật để tránh conflict
📥 Nhận offer từ: customer
💡 Tạo peer connection mà không có local tracks (chỉ nhận video)
✅ Peer connection created
📤 Gửi answer
🧊 Nhận ICE candidate từ: customer
✅ Đã thêm ICE candidate
🧊 ICE connection state: connected ✅
📺 Nhận remote stream
```

### Bước 3: Nhân viên có thể bật camera/mic thủ công (OPTIONAL)

Nếu muốn test 2 chiều:
1. **Tắt camera/mic của khách hàng** (click nút tắt)
2. **Bật camera/mic của nhân viên** (click nút bật)
3. Lúc này nhân viên sẽ chiếm quyền camera/mic

## Kết quả mong đợi

### Kịch bản 1: Chỉ khách hàng có camera/mic

| Browser | Local Video | Remote Video |
|---------|------------|--------------|
| Khách hàng (Chrome) | ✅ Hiển thị camera | ❌ Trống (vì nhân viên không có stream) |
| Nhân viên (Edge) | ❌ Trống | ✅ Hiển thị camera khách hàng |

**Đây là kịch bản NORMAL khi test trên cùng 1 máy!**

### Kịch bản 2: Cả 2 đều có camera/mic (cần 2 máy hoặc virtual camera)

| Browser | Local Video | Remote Video |
|---------|------------|--------------|
| Khách hàng | ✅ Hiển thị camera | ✅ Hiển thị camera nhân viên |
| Nhân viên | ✅ Hiển thị camera | ✅ Hiển thị camera khách hàng |

## WebRTC hoạt động như thế nào khi chỉ 1 bên có stream?

### Peer Connection vẫn hoạt động bình thường!

```javascript
// Browser 1: Có local stream
peerConnection.addTrack(audioTrack, localStream);
peerConnection.addTrack(videoTrack, localStream);
await peerConnection.createOffer(); // Offer có 2 tracks

// Browser 2: KHÔNG có local stream
// KHÔNG addTrack nào cả
await peerConnection.createAnswer(); // Answer vẫn OK, chỉ không gửi tracks ngược lại
```

### ICE Candidates vẫn được trao đổi

```
Browser 1 → Server → Browser 2: Gửi ICE candidates
Browser 2 → Server → Browser 1: Gửi ICE candidates
✅ Kết nối thành công!
```

### Remote Stream

```javascript
// Browser 2 (không có local stream)
peerConnection.ontrack = (event) => {
    console.log('📺 Nhận remote stream'); // ✅ Nhận được video từ Browser 1
    remoteVideo.srcObject = event.streams[0]; // ✅ Hiển thị video
};
```

## Code changes

### 1. Không tự động bật camera/mic trong user-joined

```javascript
// ❌ CŨ: Tự động bật → Conflict!
socket.on('user-joined', async (data) => {
    if (!localStream) {
        await setupLocalStream(); // ← Error khi browser thứ 2!
    }
});

// ✅ MỚI: Không bật tự động
socket.on('user-joined', async (data) => {
    if (!localStream) {
        console.log('⚠️ Chưa có local stream, nhưng không bật tự động');
        console.log('💡 Có thể bật thủ công bằng nút điều khiển');
    }
    createPeerConnection(); // Tạo connection mà không cần local tracks
    await createOffer();
});
```

### 2. Không tự động bật camera/mic khi nhận offer

```javascript
// ❌ CŨ: Tự động bật → Conflict!
async function handleOffer(offer) {
    if (!localStream) {
        await setupLocalStream(); // ← Error!
    }
    createPeerConnection();
    // ...
}

// ✅ MỚI: Không bật tự động
async function handleOffer(offer) {
    if (!localStream) {
        console.log('⚠️ Nhận offer nhưng chưa có local stream');
        console.log('💡 Tạo peer connection mà không có local tracks');
    }
    createPeerConnection(); // OK, không cần local stream
    // ...
}
```

### 3. createPeerConnection() hoạt động mà không cần local stream

```javascript
function createPeerConnection() {
    peerConnection = new RTCPeerConnection(configuration);

    // CHỈ thêm local tracks NẾU ĐÃ CÓ localStream
    if (localStream) {
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });
    } else {
        console.log('⚠️ Tạo peer connection mà không có local tracks');
    }

    // Nhận remote stream - Vẫn hoạt động!
    peerConnection.ontrack = (event) => {
        remoteVideo.srcObject = event.streams[0]; // ✅ OK
    };
    
    // ... các handler khác
}
```

## Lưu ý quan trọng

### ✅ Đúng khi test trên cùng 1 máy:
- Chỉ 1 browser có camera/mic (thường là browser vào trước)
- Browser còn lại chỉ nhận video, không gửi video
- WebRTC connection vẫn hoạt động bình thường
- Remote video hiển thị OK

### ❌ Sai khi test trên cùng 1 máy:
- Cố bật camera/mic ở cả 2 browser → Conflict!
- Nghĩ rằng cả 2 bên phải có camera/mic → Không cần thiết!
- Alert lỗi "Permission denied" → Đây là hành vi bình thường!

### ✅ Test đúng cách:
1. **Khách hàng vào trước** → Bật camera/mic tự động
2. **Nhân viên vào sau** → Không bật, chỉ nhận video
3. **Kiểm tra**: Nhân viên có thấy video khách hàng không? → OK!

### 💡 Test production (2 máy thật):
- Mỗi máy có camera/mic riêng
- Cả 2 browser đều bật camera/mic
- Test đầy đủ tính năng 2 chiều

## Files đã sửa

- `customer/js/video-call.js`:
  - Line ~264: Bỏ tự động `setupLocalStream()` trong `user-joined`
  - Line ~491: Bỏ tự động `setupLocalStream()` trong `handleOffer()`
  - Cho phép `createPeerConnection()` hoạt động mà không có local stream

## Test checklist

- [ ] Browser 1 vào trước, bật camera/mic tự động ✅
- [ ] Browser 2 vào sau, KHÔNG báo lỗi Permission denied ✅
- [ ] Browser 2 nhận được video từ Browser 1 ✅
- [ ] ICE connection state: connected ✅
- [ ] Peer connection state: connected ✅
- [ ] Remote video hiển thị bình thường ✅
- [ ] Không có lỗi trong console (trừ log thông báo) ✅
