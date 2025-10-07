# Fix Lỗi Video Call Permission Error

## 📋 Vấn đề

**Lỗi gặp phải:**
```
NotAllowedError: Permission denied
```

**Nguyên nhân:**
- Trình duyệt hiện đại yêu cầu **user interaction** (user phải click button) trước khi cho phép truy cập camera/microphone
- Code cũ tự động gọi `getUserMedia()` ngay khi tải trang → bị trình duyệt chặn
- Đây là chính sách bảo mật của Chrome, Firefox, Safari để bảo vệ người dùng

## ✅ Giải pháp đã triển khai

### 1. **Thêm màn hình chờ (Waiting Screen)**

**File:** `src/Views/customer/video-call.blade.php`

```html
<!-- Màn hình chờ với nút "Tham gia cuộc gọi" -->
<div id="waitingScreen" class="fixed inset-0 bg-gray-900 z-50">
    <button id="joinCallBtn">
        <i class="fas fa-phone-alt mr-2"></i>
        Tham gia cuộc gọi
    </button>
</div>

<!-- Main video call (ẩn ban đầu) -->
<main id="videoCallContainer" class="hidden">
    <!-- Video interface -->
</main>

<!-- Hidden user info từ session -->
<input type="hidden" id="userid" value="{{ $_SESSION['UserCustomer']['ID'] ?? '' }}">
<input type="hidden" id="username" value="{{ $_SESSION['UserCustomer']['HoTen'] ?? '' }}">
```

### 2. **Restructure JavaScript flow**

**File:** `customer/js/video-call.js`

**Luồng cũ (SAI):**
```javascript
// ❌ Gọi ngay khi load trang → BỊ CHẶN
document.addEventListener('DOMContentLoaded', function() {
    init(); // Tự động gọi getUserMedia()
});
```

**Luồng mới (ĐÚNG):**
```javascript
// ✅ Chỉ gọi sau khi user click button
joinCallBtn.addEventListener('click', async function() {
    await initVideoCall(); // Gọi getUserMedia() SAU KHI user click
});

async function initVideoCall() {
    // Bây giờ mới yêu cầu quyền truy cập
    await setupLocalStream();
    
    // Ẩn màn hình chờ, hiển thị video
    waitingScreen.classList.add('hidden');
    videoCallContainer.classList.remove('hidden');
    
    // Kết nối Socket.IO
    await setupSocketConnection();
}
```

### 3. **Xử lý lỗi chi tiết**

```javascript
function handleInitError(error) {
    let errorMessage = 'Không thể kết nối cuộc gọi';
    
    if (error.name === 'NotAllowedError') {
        errorMessage = 'Bạn đã từ chối quyền truy cập camera/microphone.\n\n' +
                      'Vui lòng:\n' +
                      '1. Nhấn vào biểu tượng khóa/camera trên thanh địa chỉ\n' +
                      '2. Cho phép truy cập Camera và Microphone\n' +
                      '3. Tải lại trang và thử lại';
    } else if (error.name === 'NotFoundError') {
        errorMessage = 'Không tìm thấy camera hoặc microphone.\n\n' +
                      'Vui lòng kiểm tra:\n' +
                      '• Camera/microphone đã được kết nối\n' +
                      '• Thiết bị hoạt động bình thường';
    } else if (error.name === 'NotReadableError') {
        errorMessage = 'Không thể truy cập camera/microphone.\n\n' +
                      'Có thể một ứng dụng khác đang sử dụng thiết bị.';
    }
    
    alert(errorMessage);
    
    // Cho phép user thử lại
    joinCallBtn.disabled = false;
    joinCallBtn.innerHTML = '<i class="fas fa-phone-alt mr-2"></i>Thử lại';
}
```

## 🎯 Kiến trúc mới

### **Flow diagram:**

```
1. User vào trang video-call?room=xxx
   ↓
2. Hiển thị màn hình chờ với nút "Tham gia cuộc gọi"
   ↓
3. User click nút → TRIGGER user interaction
   ↓
4. Gọi getUserMedia() → Trình duyệt hiển thị popup xin phép
   ↓
5. User cho phép → Setup video call
   ↓
6. Ẩn màn hình chờ, hiển thị video interface
   ↓
7. Kết nối Socket.IO và WebRTC
```

## 📦 Files đã thay đổi

### 1. **src/Views/customer/video-call.blade.php**

**Thay đổi:**
- Thêm `<input type="hidden">` để lấy `userId` từ session PHP
- Thêm `<div id="waitingScreen">` với nút "Tham gia cuộc gọi"
- Thêm class `hidden` cho `#videoCallContainer`
- Thêm `<p id="statusText">` để cập nhật trạng thái real-time

### 2. **customer/js/video-call.js**

**Thay đổi:**
- Xóa hàm `init()` tự động chạy
- Thêm `joinCallBtn.addEventListener('click')` để trigger manual
- Tách hàm `initVideoCall()` chỉ chạy sau user click
- Thêm `handleInitError()` để xử lý lỗi chi tiết
- Thêm `updateStatus()` để hiển thị trạng thái từng bước
- Cải thiện error handling cho các loại lỗi khác nhau

## 🧪 Test Cases

### **Test 1: User cho phép quyền truy cập**
```
✅ Expected:
1. Click "Tham gia cuộc gọi"
2. Trình duyệt hiển thị popup xin phép
3. Click "Allow"
4. Màn hình chờ biến mất
5. Video interface hiển thị với camera hoạt động
6. Kết nối Socket.IO thành công
```

### **Test 2: User từ chối quyền truy cập**
```
✅ Expected:
1. Click "Tham gia cuộc gọi"
2. Trình duyệt hiển thị popup
3. Click "Block" hoặc "Deny"
4. Hiển thị alert với hướng dẫn chi tiết
5. Nút "Tham gia cuộc gọi" đổi thành "Thử lại"
6. User có thể click "Thử lại" để thử lại
```

### **Test 3: Không có camera/microphone**
```
✅ Expected:
1. Click "Tham gia cuộc gọi"
2. Hiển thị lỗi "NotFoundError"
3. Alert thông báo không tìm thấy thiết bị
4. Hướng dẫn kiểm tra kết nối thiết bị
```

### **Test 4: Thiết bị đang được sử dụng**
```
✅ Expected:
1. Click "Tham gia cuộc gọi"
2. Hiển thị lỗi "NotReadableError"
3. Alert thông báo thiết bị đang được sử dụng
4. Hướng dẫn đóng ứng dụng khác
```

## 🔧 Cách test trên browser

### **Chrome/Edge:**

1. **Reset permissions:**
   ```
   - Click vào icon khóa/camera bên trái thanh địa chỉ
   - Click "Site settings"
   - Tìm "Camera" và "Microphone"
   - Đặt thành "Ask (default)"
   - Reload trang
   ```

2. **Test block scenario:**
   ```
   - Vào trang video-call
   - Click "Tham gia cuộc gọi"
   - Click "Block" trong popup
   - Xác nhận alert hiển thị đúng
   - Xác nhận nút đổi thành "Thử lại"
   ```

3. **Test allow scenario:**
   ```
   - Reset permissions
   - Click "Tham gia cuộc gọi"
   - Click "Allow"
   - Xác nhận video hiển thị
   ```

### **Firefox:**

1. **Reset permissions:**
   ```
   - Click vào icon camera bên trái thanh địa chỉ
   - Click "Clear These Permissions"
   - Reload trang
   ```

2. Test tương tự Chrome

## 📚 Browser Permissions Best Practices

### ✅ **DO:**
- Luôn yêu cầu permission SAU user interaction (click, tap, etc.)
- Hiển thị UI rõ ràng để user biết sắp yêu cầu quyền
- Xử lý TẤT CẢ các loại lỗi có thể xảy ra
- Cung cấp hướng dẫn chi tiết khi bị từ chối
- Cho phép user thử lại dễ dàng

### ❌ **DON'T:**
- Gọi `getUserMedia()` ngay khi load trang
- Gọi trong `DOMContentLoaded` hoặc `window.onload`
- Bỏ qua error handling
- Không giải thích tại sao cần quyền truy cập

## 🌐 Browser Support

| Browser | Version | Requires User Interaction |
|---------|---------|---------------------------|
| Chrome  | 47+     | ✅ Yes (since v47)        |
| Firefox | 52+     | ✅ Yes (since v52)        |
| Safari  | 11+     | ✅ Yes (since v11)        |
| Edge    | 79+     | ✅ Yes (Chromium-based)   |

## 📖 Tài liệu tham khảo

- [MDN: MediaDevices.getUserMedia()](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [Chrome: Feature Policy](https://developer.chrome.com/docs/privacy-security/permissions/)
- [W3C: Permission API](https://www.w3.org/TR/permissions/)

## 🎓 Lessons Learned

1. **User interaction là BẮT BUỘC** cho các API nhạy cảm (camera, mic, location, etc.)
2. **Error handling phải chi tiết** để giúp user tự khắc phục
3. **UI/UX quan trọng** - màn hình chờ giúp user hiểu flow
4. **Browser policies thay đổi** - luôn test trên nhiều browser

## ✨ Kết quả sau khi fix

- ✅ Không còn lỗi `NotAllowedError: Permission denied`
- ✅ User experience tốt hơn với màn hình chờ rõ ràng
- ✅ Error handling đầy đủ cho mọi tình huống
- ✅ Tuân thủ browser security policies
- ✅ Dễ dàng thử lại khi bị lỗi

---

**Tác giả:** GitHub Copilot  
**Ngày:** 2025-01-07  
**Version:** 2.0 (Fixed Permission Error)
