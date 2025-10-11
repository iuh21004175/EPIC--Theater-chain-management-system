# 🐛 Debug: Ảnh Chụp Màu Đen (Black Images)

## ❌ Vấn đề

Khi hệ thống tự động chụp ảnh, các ảnh hiển thị **màu đen hoàn toàn** thay vì khuôn mặt.

## 🔍 Nguyên nhân có thể

### 1. Canvas Flip Transformation (ĐÃ FIX)
**Vấn đề**: Code cũ sử dụng `ctx.scale(-1, 1)` để flip ảnh, nhưng điều này có thể gây lỗi render

**Code cũ (SAI)**:
```javascript
ctx.translate(canvas.width, 0);
ctx.scale(-1, 1);
ctx.drawImage(video, 0, 0);
```

**Code mới (ĐÚNG)**:
```javascript
ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
```

### 2. Video chưa sẵn sàng
**Vấn đề**: Chụp ảnh trước khi video có đủ dữ liệu

**Giải pháp**: Kiểm tra `video.readyState`
```javascript
if (video.readyState !== video.HAVE_ENOUGH_DATA) {
    console.warn('Video not ready');
    return;
}
```

### 3. Kích thước video = 0
**Vấn đề**: `videoWidth` hoặc `videoHeight` = 0

**Giải pháp**: Validate trước khi chụp
```javascript
if (canvas.width === 0 || canvas.height === 0) {
    console.error('Invalid dimensions');
    return;
}
```

## ✅ Các Fix đã áp dụng

### Fix 1: Loại bỏ Canvas Flip
```javascript
// TRƯỚC (có vấn đề)
ctx.translate(canvas.width, 0);
ctx.scale(-1, 1);
ctx.drawImage(video, 0, 0);

// SAU (hoạt động tốt)
ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
```

### Fix 2: Kiểm tra Video Ready State
```javascript
if (video.readyState !== video.HAVE_ENOUGH_DATA) {
    console.warn('Video not ready, skipping capture');
    return;
}
```

### Fix 3: Validate Dimensions
```javascript
if (canvas.width === 0 || canvas.height === 0) {
    console.error('Invalid video dimensions:', canvas.width, canvas.height);
    return;
}
```

### Fix 4: Validate Image Data
```javascript
if (imageData.length < 1000) {
    console.error('Captured image too small, might be black');
    return;
}
```

### Fix 5: Tăng JPEG Quality
```javascript
// TRƯỚC: quality = 0.8
const imageData = canvas.toDataURL('image/jpeg', 0.8);

// SAU: quality = 0.9
const imageData = canvas.toDataURL('image/jpeg', 0.9);
```

### Fix 6: Đợi Video "canplay" Event
```javascript
video.addEventListener('canplay', () => {
    console.log('Video can play now');
    startFaceDetection();
});
```

## 🧪 Cách Debug

### Bước 1: Mở Console (F12)

### Bước 2: Kiểm tra Video Metadata
Khi camera khởi động, bạn sẽ thấy:
```
Video metadata loaded: {
    width: 640,
    height: 480,
    readyState: 4
}
Video can play now
```

**Nếu width/height = 0 → Lỗi camera!**

### Bước 3: Dùng nút "Test Chụp Thủ Công"
Click nút debug màu xám để test chụp ảnh thủ công

Console sẽ hiển thị:
```
Manual test capture triggered
Video state: {
    readyState: 4,
    width: 640,
    height: 480,
    paused: false,
    ended: false
}
Image 1 captured, size: 52341 bytes
```

**Nếu size < 1000 bytes → Ảnh đen!**

### Bước 4: Kiểm tra Base64 Image
Copy một trong các ảnh base64 và paste vào browser:
```
data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...
```

Nếu hiển thị màu đen → Vấn đề ở phía capture

## 🔧 Troubleshooting

### Vấn đề 1: Tất cả ảnh đều đen
**Nguyên nhân**: Canvas transformation sai

**Giải pháp**: 
1. Đã fix bằng cách loại bỏ flip
2. Refresh page (Ctrl + F5)
3. Thử nút test

### Vấn đề 2: Một số ảnh đen, một số OK
**Nguyên nhân**: Video lag hoặc timing issue

**Giải pháp**:
- Tăng `captureDelay` từ 2000ms → 3000ms
- Giảm `detectionInterval` từ 100ms → 200ms

### Vấn đề 3: Video không hiển thị
**Nguyên nhân**: Camera permission hoặc browser không hỗ trợ

**Giải pháp**:
1. Cho phép camera trong browser settings
2. Dùng Chrome/Firefox (tránh Safari)
3. Dùng HTTPS hoặc localhost

### Vấn đề 4: Ảnh bị ngược (mirrored)
**Lưu ý**: Đây KHÔNG phải lỗi!

- Video hiển thị mirrored (như gương) để UX tốt hơn
- Nhưng ảnh chụp KHÔNG nên mirror (để AI xử lý đúng)
- Backend Python API xử lý face recognition không cần mirror

**Nếu muốn mirror ảnh**:
```javascript
// Thêm vào hàm captureImage()
ctx.translate(canvas.width, 0);
ctx.scale(-1, 1);
ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
```

## 📊 Expected Console Output

### Khi Load Trang:
```
Loading models from: http://localhost/rapphim/internal/models
Models loaded successfully from local
Video metadata loaded: { width: 640, height: 480, readyState: 4 }
Video can play now
```

### Khi Phát Hiện Khuôn Mặt:
```
(Không có log cụ thể, nhưng status indicator sẽ hiển thị "Phát hiện 1 khuôn mặt")
```

### Khi Chụp Ảnh:
```
Image 1 captured, size: 52341 bytes
Image 2 captured, size: 48923 bytes
Image 3 captured, size: 51234 bytes
```

**Size > 10000 bytes = OK**  
**Size < 1000 bytes = ẢNH ĐEN**

### Khi Test Chụp:
```
Manual test capture triggered
Video state: {
    readyState: 4,
    width: 640,
    height: 480,
    paused: false,
    ended: false
}
Image X captured, size: XXXXX bytes
```

## 🎯 Checklist Kiểm Tra

- [ ] Console không có error khi load models
- [ ] Video metadata hiển thị width/height > 0
- [ ] readyState = 4 (HAVE_ENOUGH_DATA)
- [ ] Nút test chụp hoạt động
- [ ] Console log "Image X captured, size: >10000 bytes"
- [ ] Ảnh trong console (base64) hiển thị đúng khuôn mặt
- [ ] Thumbnail ảnh không phải màu đen

## 🚀 Sau Khi Fix

1. **Ctrl + F5** để hard refresh
2. **Mở Console** để xem logs
3. **Test nút debug** để chụp thủ công
4. **Kiểm tra size** của ảnh trong console
5. Nếu OK → Để hệ thống tự động chụp

## 📝 Notes

- **Ảnh không mirror** là đúng (để AI xử lý)
- **Video mirror** là UX choice (người dùng thấy như gương)
- **Base64 image size** nên > 10KB (khoảng 50KB là OK)
- **JPEG quality 0.9** là cân bằng giữa size và quality

---

**Nếu vẫn lỗi**: Gửi Console log và screenshot để debug thêm
