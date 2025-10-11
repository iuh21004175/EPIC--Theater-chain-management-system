# Fix Mirror & Coordinate System - Giải thích chi tiết

## 📋 Tóm tắt vấn đề

Khi làm việc với video stream và face detection, có 3 "thế giới" với hệ tọa độ khác nhau:

1. **Video Stream (gốc)** - Không mirror
2. **Video Display (CSS)** - Mirror để user thấy như gương
3. **Face Detection (face-api.js)** - Tọa độ từ video gốc (không mirror)

## 🎯 Mục tiêu

- ✅ User nhìn video như gương (nghiêng trái → ảnh nghiêng trái)
- ✅ Khung xanh di chuyển cùng chiều với đầu user
- ✅ Ảnh thumbnail hiển thị như gương (matching với video)
- ✅ Ảnh gửi lên server là ảnh gốc (không mirror) để AI xử lý

## 🔍 Phân tích chi tiết

### 1. Video Element

```html
<video id="video" style="transform: scaleX(-1)"></video>
```

**Chức năng:**
- CSS `transform: scaleX(-1)` chỉ thay đổi **VISUAL** (cách user nhìn)
- Video stream **BÊN TRONG** vẫn là ảnh gốc (KHÔNG mirror)
- `video.videoWidth`, `video.videoHeight` là kích thước gốc

**Kết quả:**
- User nghiêng đầu TRÁI → Video hiển thị nghiêng TRÁI (như gương)
- `video.captureStream()` vẫn cho ảnh gốc KHÔNG mirror

### 2. Canvas Overlay (Khung xanh)

```html
<canvas id="overlay" style="transform: scaleX(-1)"></canvas>
```

**Tại sao cần mirror:**
- face-api.js phát hiện khuôn mặt từ video element
- Trả về tọa độ `(x, y, width, height)` từ video **TRƯỚC KHI** CSS transform
- Nếu vẽ trực tiếp lên overlay KHÔNG mirror → khung xanh ngược chiều

**Flow:**

```
Video Stream (gốc)
    ↓ (face-api.js detect)
face-api.js returns: { x: 100, y: 50, width: 200, height: 300 }
    ↓ (coordinates từ video gốc)
Canvas vẽ ở: ctx.strokeRect(100, 50, 200, 300)
    ↓ (nếu overlay KHÔNG mirror)
Khung xanh hiển thị ở vị trí 100px từ BÊN TRÁI (gốc)
    ↓ (nhưng video BỊ MIRROR)
Khung xanh KHÔNG khớp với khuôn mặt trên video
```

**Giải pháp:**

```css
#overlay {
    transform: scaleX(-1); /* Mirror overlay cùng với video */
}
```

**Kết quả:**
- Khung xanh mirror cùng video → hiển thị đúng vị trí
- User nghiêng TRÁI → khung xanh di chuyển CÙNG CHIỀU

### 3. Canvas Capture (Chụp ảnh)

```javascript
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

// VẼ TRỰC TIẾP - KHÔNG MIRROR
ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
```

**Tại sao KHÔNG mirror:**
- `ctx.drawImage(video, ...)` lấy dữ liệu từ **MediaStream gốc**
- CSS transform **KHÔNG ảnh hưởng** đến dữ liệu stream
- Ảnh chụp ra là ảnh gốc (đúng với dữ liệu camera)

**Lưu ý quan trọng:**

```javascript
// ❌ SAI - Nếu mirror canvas
ctx.scale(-1, 1);
ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
// → Ảnh bị flip → Gửi lên server AI sẽ xử lý SAI
```

**Giải pháp:**
- Chụp ảnh KHÔNG mirror (ảnh gốc)
- Gửi ảnh gốc lên server
- AI xử lý ảnh gốc (chuẩn)

### 4. Thumbnail Display

```css
.captured-image img {
    transform: scaleX(-1); /* Mirror thumbnail để match với video */
}
```

**Tại sao cần mirror:**
- Ảnh chụp là ảnh gốc (KHÔNG mirror)
- User đã quen nhìn video mirror
- Nếu thumbnail hiển thị ảnh gốc → User thấy lạ (ngược với video)

**Kết quả:**
- Thumbnail mirror → User thấy giống với video (tự nhiên)
- Base64 string gửi lên server vẫn là ảnh gốc (đúng)

## 📊 Bảng so sánh

| Element | CSS Transform | Dữ liệu bên trong | Mục đích |
|---------|---------------|-------------------|----------|
| `#video` | `scaleX(-1)` | Không mirror | UX - User thấy như gương |
| `#overlay` | `scaleX(-1)` | Mirror | Khung xanh khớp với video |
| Canvas capture | Không | Không mirror | Ảnh gốc cho AI xử lý |
| `.captured-image img` | `scaleX(-1)` | Không mirror | Thumbnail như gương |

## 🔄 Flow hoàn chỉnh

```
Camera → MediaStream (gốc, không mirror)
    ↓
<video> với CSS scaleX(-1)
    ↓ (Visual: mirror)
User nhìn video như gương ✓
    ↓
face-api.js detect từ video
    ↓ (Tọa độ từ stream gốc)
Canvas overlay với CSS scaleX(-1)
    ↓ (Visual: mirror)
Khung xanh di chuyển cùng chiều ✓
    ↓
ctx.drawImage(video, 0, 0, w, h) - KHÔNG mirror
    ↓ (Ảnh gốc)
Base64 string (ảnh gốc) → Server AI ✓
    ↓
<img src="base64..."> với CSS scaleX(-1)
    ↓ (Visual: mirror)
Thumbnail hiển thị như gương ✓
```

## 🧪 Testing

### Test 1: Khung xanh di chuyển đúng chiều

1. Mở trang đăng ký khuôn mặt
2. Nghiêng đầu **SANG TRÁI**
3. **Expected**: Khung xanh di chuyển **SANG TRÁI** (cùng chiều)
4. Nghiêng đầu **SANG PHẢI**
5. **Expected**: Khung xanh di chuyển **SANG PHẢI** (cùng chiều)

### Test 2: Ảnh thumbnail hiển thị đúng

1. Chụp 1 ảnh (tự động hoặc manual)
2. Xem thumbnail bên phải
3. **Expected**: 
   - Ảnh KHÔNG màu đen ✓
   - Khuôn mặt trong thumbnail cùng hướng với video ✓
   - User nhìn thumbnail giống như nhìn video ✓

### Test 3: Ảnh gửi server là ảnh gốc

1. Mở DevTools → Tab **Network**
2. Chụp 1 ảnh
3. Xem request `/api/cham-cong/dang-ky-khuon-mat`
4. Click vào request → Tab **Preview**
5. **Expected**: 
   - Ảnh có khuôn mặt rõ ràng ✓
   - Kích thước ~50KB ✓
   - Ảnh là ảnh gốc (có thể khác hướng với thumbnail - OK) ✓

## 🐛 Debugging

### Vấn đề: Khung xanh vẫn ngược chiều

**Nguyên nhân:**
- Overlay chưa có CSS `transform: scaleX(-1)`

**Kiểm tra:**
```javascript
const overlay = document.getElementById('overlay');
console.log(getComputedStyle(overlay).transform); 
// Phải thấy: "matrix(-1, 0, 0, 1, 0, 0)" (scaleX -1)
```

**Fix:**
```css
#overlay {
    transform: scaleX(-1);
}
```

### Vấn đề: Thumbnail màu đen

**Nguyên nhân:**
- Video chưa sẵn sàng (`readyState !== 4`)
- Hoặc canvas đang bị mirror 2 lần

**Kiểm tra:**
```javascript
console.log('Video ready:', video.readyState); // Phải = 4
console.log('Image size:', imageData.length); // Phải >50000 bytes
```

**Fix:**
- Đợi video ready: `video.readyState === video.HAVE_ENOUGH_DATA`
- Vẽ KHÔNG mirror: `ctx.drawImage(video, 0, 0, w, h)`

### Vấn đề: AI không nhận diện được

**Nguyên nhân:**
- Ảnh gửi lên server bị mirror

**Kiểm tra:**
```javascript
// Trong Python AI service
img = face_recognition.load_image_file(image_path)
print(img.shape) # Phải thấy (480, 640, 3)
```

**Fix:**
- Chụp ảnh KHÔNG mirror (như code hiện tại)

## 📝 Code tham khảo

### CSS

```css
/* Video - Mirror để user thấy như gương */
#video {
    transform: scaleX(-1);
}

/* Overlay - Mirror để khung xanh khớp với video */
#overlay {
    transform: scaleX(-1);
}

/* Thumbnail - Mirror để user thấy giống video */
.captured-image img {
    transform: scaleX(-1);
}
```

### JavaScript - Draw face box

```javascript
// face-api.js returns coordinates từ video gốc
const box = detection.detection.box;

// Vẽ TRỰC TIẾP - overlay đã mirror rồi
ctx.strokeRect(box.x, box.y, box.width, box.height);
```

### JavaScript - Capture image

```javascript
const canvas = document.createElement('canvas');
canvas.width = video.videoWidth;
canvas.height = video.videoHeight;

const ctx = canvas.getContext('2d');

// VẼ TRỰC TIẾP - KHÔNG mirror
// Ảnh gốc cho AI xử lý
ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

const imageData = canvas.toDataURL('image/jpeg', 0.9);
// imageData là ảnh gốc (không mirror)
```

## ✅ Checklist

- [x] Video mirror để user thấy như gương
- [x] Overlay mirror để khung xanh di chuyển cùng chiều
- [x] Canvas capture KHÔNG mirror (ảnh gốc cho AI)
- [x] Thumbnail mirror để user thấy giống video
- [x] Base64 string là ảnh gốc (không mirror)
- [x] AI nhận ảnh gốc và xử lý đúng

## 📚 Tài liệu liên quan

- [HTMLMediaElement.captureStream()](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/captureStream)
- [CSS transform: scaleX()](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/scaleX)
- [CanvasRenderingContext2D.drawImage()](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage)
- [face-api.js Documentation](https://github.com/justadudewhohacks/face-api.js)

---

**Lưu ý cuối cùng:**

> CSS `transform` chỉ thay đổi **VISUAL** (cách hiển thị), KHÔNG thay đổi dữ liệu bên trong element. 
> MediaStream từ camera luôn là dữ liệu gốc, không bị ảnh hưởng bởi CSS transform.

Đó là lý do tại sao:
- Video **VISUAL** mirror → User thấy tự nhiên
- Canvas capture **DATA** không mirror → AI xử lý chính xác
- Thumbnail **VISUAL** mirror → User thấy giống video
