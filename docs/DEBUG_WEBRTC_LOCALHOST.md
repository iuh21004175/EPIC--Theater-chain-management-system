# Debug WebRTC trên Localhost

## Vấn đề
Khi cả khách hàng và nhân viên đều test trên cùng 1 máy (localhost), video call bị treo ở trạng thái "Đang chờ..." và không thiết lập kết nối WebRTC.

## Nguyên nhân phân tích

### 1. **STUN Server không cần thiết trên localhost**
- Khi test trên cùng 1 máy, cả 2 browser đều ở localhost
- WebRTC có thể kết nối trực tiếp qua local network
- STUN server vẫn hoạt động nhưng không phải nguyên nhân chính

### 2. **Vấn đề thực sự: ICE Candidates Exchange**
- **ICE (Interactive Connectivity Establishment)** là protocol để tìm đường kết nối tốt nhất
- WebRTC cần trao đổi ICE candidates giữa 2 peers
- Nếu ICE candidates không được gửi/nhận đúng cách → Kết nối thất bại

### 3. **Timing Issues**
- Người vào trước tạo offer → Chưa có ai nhận
- Người vào sau nhận offer → Cần tạo answer
- Nếu timing không khớp → Peer connection không hoàn thành

## Các bước debug

### 1. **Kiểm tra ICE Gathering State**
```javascript
peerConnection.onicegatheringstatechange = () => {
    console.log('📡 ICE gathering state:', peerConnection.iceGatheringState);
};
```

Các state:
- `new`: Chưa bắt đầu
- `gathering`: Đang thu thập candidates
- `complete`: Đã thu thập xong

### 2. **Kiểm tra ICE Connection State**
```javascript
peerConnection.oniceconnectionstatechange = () => {
    console.log('🧊 ICE connection state:', peerConnection.iceConnectionState);
};
```

Các state:
- `new`: Chưa bắt đầu
- `checking`: Đang kiểm tra candidates
- `connected`: Đã kết nối thành công ✅
- `failed`: Thất bại ❌

### 3. **Kiểm tra ICE Candidates**
```javascript
peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
        console.log('🧊 ICE candidate:', event.candidate.type, event.candidate.candidate);
    } else {
        console.log('✅ ICE gathering complete');
    }
};
```

Loại candidates:
- `host`: Local network (quan trọng nhất cho localhost)
- `srflx`: Server reflexive (qua STUN)
- `relay`: Relayed (qua TURN)

### 4. **Kiểm tra Peer Connection State**
```javascript
peerConnection.onconnectionstatechange = () => {
    console.log('🔗 Connection state:', peerConnection.connectionState);
};
```

## Giải pháp đã áp dụng

### 1. **Tự động bật camera/mic khi có người thứ 2 vào**
```javascript
socket.on('room-joined', async (data) => {
    const participantCount = Object.keys(data.participants).length;
    if (participantCount >= 2) {
        await setupLocalStream(); // Tự động bật camera/mic
        createPeerConnection();
        if (userType === 'customer') {
            await createOffer();
        }
    }
});
```

### 2. **Người vào sau cũng tạo offer nếu cần**
```javascript
socket.on('user-joined', async (data) => {
    if (!localStream) {
        await setupLocalStream();
    }
    
    if (userType === 'staff' && data.userType === 'customer') {
        setTimeout(async () => {
            if (!peerConnection || !peerConnection.remoteDescription) {
                await createOffer();
            }
        }, 1500);
    }
});
```

### 3. **Thêm logging chi tiết**
- ICE gathering state
- ICE connection state
- ICE candidates (type và candidate string)
- Offer/Answer exchange

## Cách test đúng

### 1. **Test trên localhost:**
```bash
# Mở 2 browser khác nhau
# Browser 1: Chrome (Khách hàng)
http://localhost/rapphim/video-call?room=video_5_1759818190

# Browser 2: Edge hoặc Firefox (Nhân viên)
http://localhost/rapphim/internal/video-call?room=video_5_1759818190
```

### 2. **Xem console logs:**
```
📡 ICE gathering state: gathering
🧊 Gửi ICE candidate: host candidate:...192.168.x.x...
🧊 Nhận ICE candidate từ: staff
✅ Đã thêm ICE candidate
🧊 ICE connection state: checking
🧊 ICE connection state: connected ✅
🔗 Connection state: connected ✅
📺 Nhận remote stream
```

### 3. **Kiểm tra Node.js server logs:**
```
📤 Offer từ customer trong room video_5_1759818190
📥 Answer từ staff trong room video_5_1759818190
🧊 ICE candidate từ customer trong room video_5_1759818190: host
🧊 ICE candidate từ staff trong room video_5_1759818190: host
```

## Lưu ý quan trọng

### ✅ Đúng:
- Test trên 2 browser khác nhau (Chrome + Edge)
- Test trên 2 tab khác nhau (có thể bị giới hạn camera/mic)
- Cho phép camera/mic trên cả 2 browser
- Kiểm tra console logs chi tiết

### ❌ Sai:
- Đổi STUN server (không phải vấn đề chính)
- Sửa API endpoints (không liên quan)
- Restart Node.js liên tục mà không xem logs

## API không liên quan đến vấn đề này

- `URL_API` vs `URL_WEB`: Chỉ ảnh hưởng đến cập nhật trạng thái database
- `/api/goi-video/bat-dau`: Chỉ update `trang_thai = 3` trong database
- `/api/goi-video/ket-thuc`: Chỉ update `trang_thai = 4` trong database

**WebRTC hoạt động độc lập với API backend!**

## Tài liệu tham khảo
- [WebRTC ICE](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Connectivity)
- [RTCPeerConnection](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection)
- [ICE Candidate Types](https://webrtcglossary.com/ice/)
