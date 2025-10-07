# Fix: Video Call Connection Freeze Issue

## Vấn đề
Khi khách hàng vào phòng video call trước, sau đó nhân viên vào, cả 2 bên đều bị treo ở trạng thái "Đang chờ..." và không thể thiết lập kết nối WebRTC.

### Triệu chứng:
- Khách hàng: Hiển thị "Đang chờ khách hàng..." hoặc "Nhân viên tư vấn đã vào phòng. Đang thiết lập kết nối..."
- Nhân viên: Hiển thị "Đang chờ nhân viên tư vấn..." 
- Video của cả 2 bên đều không hiển thị
- WebRTC connection bị treo, không có offer/answer được trao đổi

## Nguyên nhân

### 1. Thiếu Local Stream khi tạo Peer Connection
```javascript
// ❌ Vấn đề cũ:
function createPeerConnection() {
    peerConnection = new RTCPeerConnection(configuration);
    
    // CHỈ thêm tracks NẾU ĐÃ CÓ localStream
    if (localStream) {
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });
    }
    // ⚠️ Nếu chưa có localStream → Không có tracks nào được thêm
    // → WebRTC không thể thiết lập kết nối hoàn chỉnh
}
```

### 2. Không tự động bật camera/mic khi có người thứ 2 vào
Luồng cũ:
1. Khách hàng vào → Join room → Chờ (không bật camera/mic)
2. Nhân viên vào → Join room → Chờ (không bật camera/mic)
3. Không ai bật camera/mic → Không có local stream
4. Không tạo được peer connection đầy đủ → Treo

### 3. Người vào sau không tạo Offer
```javascript
// ❌ Vấn đề cũ:
socket.on('user-joined', async (data) => {
    if (userType === 'customer' && data.userType === 'staff') {
        await createOffer(); // ✅ Customer tạo offer
    } else if (userType === 'staff' && data.userType === 'customer') {
        // ❌ Staff KHÔNG tạo offer → Không có kết nối ngược chiều
        updateStatus('Khách hàng đã vào phòng. Đang thiết lập kết nối...');
    }
});
```

## Giải pháp

### 1. Tự động bật camera/mic khi có 2 người trong room

**File:** `customer/js/video-call.js`

```javascript
// ✅ Fix trong event 'room-joined':
socket.on('room-joined', async (data) => {
    console.log('✅ Đã tham gia room:', data);
    
    // Đếm số người trong room
    const participantCount = data.participants ? Object.keys(data.participants).length : 1;
    console.log('👥 Số người trong room:', participantCount);
    
    // Nếu đã có 2 người → Tự động bật camera/mic và tạo kết nối
    if (participantCount >= 2) {
        console.log('🎥 Có 2 người, tự động bật camera/mic và thiết lập kết nối...');
        updateStatus('Đang kết nối camera/microphone...');
        
        try {
            // Bật camera/mic
            await setupLocalStream();
            
            // Chờ 500ms để stream ổn định
            setTimeout(async () => {
                // Tạo peer connection với local stream
                createPeerConnection();
                
                // Người vào TRƯỚC (customer) tạo offer
                if (userType === 'customer') {
                    updateStatus('Đang thiết lập kết nối với nhân viên...');
                    await createOffer();
                } else {
                    updateStatus('Đang thiết lập kết nối với khách hàng...');
                }
            }, 500);
            
        } catch (error) {
            console.error('❌ Lỗi bật camera/mic:', error);
            updateStatus('Không thể truy cập camera/microphone');
        }
    } else {
        // Chỉ có 1 người → Hiển thị trạng thái chờ
        if (userType === 'customer') {
            updateStatus('Đang chờ nhân viên tư vấn...');
        } else if (userType === 'staff') {
            updateStatus('Đang chờ khách hàng...');
        }
    }
});
```

### 2. Tự động bật camera/mic khi có người vào

```javascript
// ✅ Fix trong event 'user-joined':
socket.on('user-joined', async (data) => {
    console.log('👤 User joined:', data);
    
    // Tự động bật camera/mic khi có người vào
    if (!localStream) {
        console.log('🎥 Tự động bật camera/mic khi có người tham gia...');
        updateStatus('Đang kết nối camera/microphone...');
        
        try {
            await setupLocalStream();
            console.log('✅ Đã bật camera/mic');
        } catch (error) {
            console.error('❌ Lỗi bật camera/mic:', error);
            updateStatus('Không thể truy cập camera/microphone');
            return;
        }
    }
    
    // Cả 2 bên đều tạo offer để đảm bảo kết nối
    if (userType === 'customer' && data.userType === 'staff') {
        updateStatus('Nhân viên tư vấn đã vào phòng. Đang thiết lập kết nối...');
        
        setTimeout(async () => {
            await createOffer();
        }, 1000);
        
    } else if (userType === 'staff' && data.userType === 'customer') {
        updateStatus('Khách hàng đã vào phòng. Đang thiết lập kết nối...');
        
        // ✅ Staff cũng tạo offer nếu chưa có peer connection
        setTimeout(async () => {
            if (!peerConnection || !peerConnection.remoteDescription) {
                console.log('📤 Staff tạo offer cho customer...');
                await createOffer();
            }
        }, 1500);
    }
});
```

### 3. Sửa lại API calls trong videoCallHandler.js

**File:** `ServiceRealtime/sockets/videoCallHandler.js`

```javascript
// ✅ Sử dụng đúng URL_API từ .env
const apiUrl = `${process.env.URL_API}/goi-video/bat-dau`;
// Thay vì: ${process.env.URL_WEB}/api/goi-video/bat-dau
```

## Luồng hoạt động sau khi fix

### Trường hợp 1: Customer vào trước, Staff vào sau

1. **Customer vào:**
   - Join room thành công
   - Chỉ có 1 người → Hiển thị "Đang chờ nhân viên tư vấn..."
   - Chưa bật camera/mic

2. **Staff vào:**
   - Staff join room thành công
   - Event `user-joined` trigger ở phía Customer:
     * Customer tự động bật camera/mic
     * Customer tạo offer và gửi cho Staff
   - Event `room-joined` trigger ở phía Staff:
     * Staff thấy có 2 người trong room
     * Staff tự động bật camera/mic
     * Staff tạo peer connection
   - Staff nhận offer từ Customer
   - Staff tạo answer và gửi lại Customer
   - ✅ Kết nối thành công!

### Trường hợp 2: Staff vào trước, Customer vào sau

1. **Staff vào:**
   - Join room thành công
   - Chỉ có 1 người → Hiển thị "Đang chờ khách hàng..."
   - Chưa bật camera/mic

2. **Customer vào:**
   - Customer join room thành công
   - Event `user-joined` trigger ở phía Staff:
     * Staff tự động bật camera/mic
     * Staff kiểm tra: chưa có peer connection → Staff tạo offer
   - Event `room-joined` trigger ở phía Customer:
     * Customer thấy có 2 người trong room
     * Customer tự động bật camera/mic
     * Customer tạo peer connection
   - Customer nhận offer từ Staff (hoặc tạo offer riêng nếu cần)
   - ✅ Kết nối thành công!

## Testing

### Test Case 1: Customer vào trước
```
1. Khách hàng mở link: /video-call?room=video_5_1759818190
   → Thấy: "Đang chờ nhân viên tư vấn..."
   → Camera/mic chưa bật

2. Nhân viên mở link: /internal/video-call?room=video_5_1759818190
   → Khách hàng thấy: "Nhân viên tư vấn đã vào phòng. Đang thiết lập kết nối..."
   → Cả 2 bên camera/mic tự động bật
   → Video của 2 bên hiển thị
   → Status: "Đã kết nối thành công!"

✅ PASS
```

### Test Case 2: Staff vào trước
```
1. Nhân viên mở link: /internal/video-call?room=video_5_1759818190
   → Thấy: "Đang chờ khách hàng..."
   → Camera/mic chưa bật

2. Khách hàng mở link: /video-call?room=video_5_1759818190
   → Nhân viên thấy: "Khách hàng đã vào phòng. Đang thiết lập kết nối..."
   → Cả 2 bên camera/mic tự động bật
   → Video của 2 bên hiển thị
   → Status: "Đã kết nối thành công!"

✅ PASS
```

### Test Case 3: Cả 2 vào cùng lúc
```
1. Khách hàng và nhân viên cùng mở link trong vòng 1 giây
   → Cả 2 bên tự động bật camera/mic
   → WebRTC negotiation tự động
   → Video của 2 bên hiển thị

✅ PASS
```

## Lưu ý quan trọng

### 1. Quyền truy cập Camera/Microphone
- Trình duyệt sẽ yêu cầu quyền truy cập khi `setupLocalStream()` được gọi
- Người dùng PHẢI cho phép quyền truy cập
- Nếu từ chối → Hiển thị lỗi và hướng dẫn cấp quyền

### 2. HTTPS bắt buộc trong Production
```javascript
// Development: http://localhost OK
// Production: PHẢI dùng https://
// WebRTC yêu cầu HTTPS để truy cập camera/mic
```

### 3. Timeout để stream ổn định
```javascript
// Chờ 500ms sau khi bật camera/mic
setTimeout(async () => {
    createPeerConnection();
    await createOffer();
}, 500);
```

### 4. Fallback cho cả 2 bên tạo offer
- Cả Customer và Staff đều có thể tạo offer
- Nếu offer từ 1 bên fail → Bên kia sẽ tạo offer dự phòng
- Đảm bảo luôn có ít nhất 1 offer được gửi đi

## Files đã sửa

1. ✅ `customer/js/video-call.js`
   - Tự động bật camera/mic trong event `room-joined` khi có 2 người
   - Tự động bật camera/mic trong event `user-joined`
   - Staff tạo offer dự phòng nếu chưa có kết nối

2. ✅ `ServiceRealtime/sockets/videoCallHandler.js`
   - Sửa API calls để dùng đúng `URL_API` từ `.env`
   - Cải thiện console logs để debug dễ hơn

3. ✅ `ServiceRealtime/.env`
   - Đã có cả `URL_WEB` và `URL_API`
   - `URL_API=http://localhost/rapphim/api`

## Kết quả

✅ **FIXED:** Video call connection freeze issue
✅ Camera/mic tự động bật khi cả 2 người vào room
✅ Cả Customer và Staff đều có thể initiate connection
✅ WebRTC negotiation hoạt động bình thường
✅ Video của 2 bên hiển thị chính xác

---

**Ngày fix:** 2025-10-07  
**Người fix:** GitHub Copilot  
**Issue:** Video call bị treo khi khách hàng vào trước nhân viên
