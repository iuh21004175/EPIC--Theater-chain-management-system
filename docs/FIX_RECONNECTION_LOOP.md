# Fix: Vòng lặp ngắt kết nối khi nhân viên F5 / tham gia lại

## Vấn đề

Khi nhân viên F5 hoặc rời phòng rồi tham gia lại:

1. **Nhân viên disconnect** → Server emit `user-left` cho khách hàng
2. **Khách hàng nhận `user-left`** → Alert "Nhân viên đã rời..." → `endCall()` sau 2s → Disconnect
3. **Khách hàng disconnect** → Server emit `user-left` cho nhân viên mới
4. **Nhân viên nhận `user-left`** → Alert "Khách hàng đã rời..." → `endCall()` → Disconnect
5. **Vòng lặp vô tận!** 🔄❌

## Nguyên nhân

```javascript
// ❌ Logic CŨ - SAI
socket.on('user-left', (data) => {
    alert('Nhân viên/Khách hàng đã rời khỏi cuộc gọi');
    setTimeout(() => endCall(), 2000); // ← Tự động endCall() → Disconnect → Vòng lặp!
});
```

**Vấn đề**: Khi một người disconnect (tạm thời để F5), người còn lại cũng tự động `endCall()` → Cả 2 disconnect → Không ai còn trong room!

## Giải pháp

### 1. **KHÔNG tự động endCall() khi user-left**

Thay vào đó:
- **Reset peer connection** để sẵn sàng kết nối lại
- **Giữ nguyên socket connection**
- **Hiển thị trạng thái chờ** người kia quay lại

```javascript
// ✅ Logic MỚI - ĐÚNG
socket.on('user-left', (data) => {
    console.log('👋 User left:', data);
    
    // Reset peer connection để sẵn sàng kết nối lại
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    
    // Dừng remote stream
    if (remoteStream) {
        remoteStream.getTracks().forEach(track => track.stop());
        remoteVideo.srcObject = null;
        remoteStream = null;
    }
    
    // Hiển thị trạng thái chờ
    updateStatus('Nhân viên tư vấn đã ngắt kết nối. Đang chờ kết nối lại...');
    showConnectionStatus();
    
    console.log('⏳ Sẵn sàng kết nối lại khi người kia quay lại');
});
```

### 2. **Reset peer connection khi user-joined**

Khi người kia tham gia lại, cần **reset peer connection cũ** trước khi tạo mới:

```javascript
socket.on('user-joined', async (data) => {
    console.log('👤 User joined:', data);
    
    // Reset peer connection cũ nếu có
    if (peerConnection) {
        console.log('🔄 Reset peer connection cũ để tạo kết nối mới');
        peerConnection.close();
        peerConnection = null;
    }
    
    // Dừng remote stream cũ
    if (remoteStream) {
        remoteStream.getTracks().forEach(track => track.stop());
        remoteVideo.srcObject = null;
        remoteStream = null;
    }
    
    // Bật camera/mic nếu chưa có
    if (!localStream) {
        await setupLocalStream();
    }
    
    // Tạo peer connection mới
    createPeerConnection();
    
    // Tạo offer
    setTimeout(async () => {
        await createOffer();
    }, 1000);
});
```

### 3. **Bật camera/mic tự động khi nhận offer**

Khi nhận offer từ người kia, cần bật camera/mic nếu chưa có:

```javascript
async function handleOffer(offer) {
    try {
        // Bật camera/mic nếu chưa có
        if (!localStream) {
            console.log('🎥 Nhận offer, tự động bật camera/mic...');
            await setupLocalStream();
        }
        
        createPeerConnection();
        
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        
        socket.emit('answer', { roomId, answer });
    } catch (error) {
        console.error('Lỗi xử lý offer:', error);
    }
}
```

## Luồng hoạt động mới

### Trường hợp 1: Nhân viên F5 (refresh)

1. **Nhân viên F5** → Browser reload → Socket disconnect
2. **Server emit `user-left`** → Khách hàng nhận
3. **Khách hàng:**
   - ✅ Reset peer connection
   - ✅ Dừng remote stream
   - ✅ Hiển thị "Đang chờ nhân viên tư vấn kết nối lại..."
   - ✅ **GIỮ NGUYÊN socket connection**
4. **Nhân viên load lại trang** → Socket connect lại → Join room
5. **Server emit `user-joined`** → Khách hàng nhận
6. **Khách hàng:**
   - ✅ Reset peer connection cũ (nếu có)
   - ✅ Tạo peer connection mới
   - ✅ Tạo offer cho nhân viên
7. **Nhân viên nhận offer:**
   - ✅ Bật camera/mic tự động
   - ✅ Tạo peer connection
   - ✅ Tạo answer
8. **✅ Kết nối lại thành công!**

### Trường hợp 2: Khách hàng F5

1. **Khách hàng F5** → Browser reload → Socket disconnect
2. **Server emit `user-left`** → Nhân viên nhận
3. **Nhân viên:**
   - ✅ Reset peer connection
   - ✅ Dừng remote stream
   - ✅ Hiển thị "Đang chờ khách hàng kết nối lại..."
   - ✅ **GIỮ NGUYÊN socket connection**
4. **Khách hàng load lại** → Socket connect → Join room
5. **Server emit `user-joined`** → Nhân viên nhận
6. **Nhân viên:**
   - ✅ Reset peer connection cũ
   - ✅ Tạo peer connection mới
   - ✅ Tạo offer cho khách hàng
7. **✅ Kết nối lại thành công!**

## So sánh trước và sau

| Tình huống | Logic CŨ (❌ SAI) | Logic MỚI (✅ ĐÚNG) |
|------------|------------------|-------------------|
| User A disconnect | User B nhận `user-left` → `endCall()` → Disconnect | User B reset peer connection → Giữ socket → Chờ A quay lại |
| User A join lại | User B đã disconnect → Không còn ai trong room | User B vẫn online → Nhận `user-joined` → Tạo kết nối mới |
| Kết quả | ❌ Vòng lặp disconnect vô tận | ✅ Reconnection tự động thành công |

## Files đã sửa

### 1. `customer/js/video-call.js`

**Thay đổi:**
- ✅ `socket.on('user-left')`: Không còn `endCall()`, chỉ reset peer connection
- ✅ `socket.on('user-joined')`: Reset peer connection cũ trước khi tạo mới
- ✅ `handleOffer()`: Tự động bật camera/mic nếu chưa có

**Dòng code quan trọng:**
```javascript
// Line ~300: user-left handler
socket.on('user-left', (data) => {
    // Reset peer connection, KHÔNG endCall()
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    updateStatus('Đang chờ kết nối lại...');
    // ❌ KHÔNG còn: setTimeout(() => endCall(), 2000);
});

// Line ~240: user-joined handler
socket.on('user-joined', async (data) => {
    // Reset peer connection cũ
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    // Tạo peer connection mới
    createPeerConnection();
    await createOffer();
});

// Line ~487: handleOffer
async function handleOffer(offer) {
    // Bật camera/mic nếu chưa có
    if (!localStream) {
        await setupLocalStream();
    }
    createPeerConnection();
    // ... tạo answer
}
```

## Lưu ý quan trọng

### ✅ Đúng:
- Reset peer connection khi người kia disconnect
- Giữ nguyên socket connection để nhận sự kiện `user-joined`
- Tự động bật camera/mic khi nhận offer
- Luôn reset peer connection cũ trước khi tạo mới

### ❌ Sai:
- Tự động `endCall()` khi nhận `user-left` (gây vòng lặp!)
- Không reset peer connection cũ → Conflict với connection mới
- Không bật camera/mic khi nhận offer → WebRTC không có tracks

## Test cases

### Test 1: Nhân viên F5
1. Khách hàng vào trước
2. Nhân viên vào, kết nối thành công
3. Nhân viên F5 (refresh)
4. **Kết quả mong đợi**: Khách hàng thấy "Đang chờ...", nhân viên load lại → Kết nối lại thành công ✅

### Test 2: Khách hàng F5
1. Khách hàng và nhân viên đang gọi
2. Khách hàng F5
3. **Kết quả mong đợi**: Nhân viên thấy "Đang chờ...", khách hàng load lại → Kết nối lại thành công ✅

### Test 3: Cả 2 F5 liên tục
1. Khách hàng F5
2. Nhân viên F5
3. Khách hàng F5 lại
4. **Kết quả mong đợi**: Không bị vòng lặp, người nào vào sau sẽ thấy người kia và kết nối ✅

## Tài liệu tham khảo
- [WebRTC Reconnection Best Practices](https://webrtc.org/getting-started/peer-connections)
- [Socket.IO Reconnection](https://socket.io/docs/v4/client-options/#reconnection)
