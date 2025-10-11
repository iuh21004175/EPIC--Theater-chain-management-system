# 🎥 Hệ thống Đăng ký Khuôn mặt với Video Stream Tự động

## ✨ Tính năng

### Đăng ký khuôn mặt tự động
- **Phát hiện khuôn mặt real-time** sử dụng face-api.js
- **Tự động chụp** khi phát hiện khuôn mặt (đếm ngược 2 giây)
- **Thu thập 3-5 ảnh** từ nhiều góc độ
- **Hiển thị khung màu xanh** bao quanh khuôn mặt
- **Progress bar** và countdown timer

### Chấm công bằng khuôn mặt
- **Nhận diện tự động** từ video stream
- **Check-in / Check-out** với độ tin cậy cao
- **Lịch sử chấm công** với filter theo ngày
- **Trạng thái**: Đúng giờ, Muộn, Sớm

## 🔧 Cài đặt

### 1. Đã hoàn thành
✅ Đã fix lỗi `faceapi is not defined`:
   - Đổi từ `defer` sang load trực tiếp
   - Thêm check `typeof faceapi !== 'undefined'`
   - Timeout 10s nếu không load được

✅ Đã cấu hình load models từ local:
   - Models ở `internal/models/`
   - Fallback tự động sang CDN nếu local lỗi
   - Console log chi tiết

### 2. Kiểm tra models (đã có sẵn)

Đảm bảo các file sau có trong `internal/models/`:

```
✅ tiny_face_detector_model-shard1
✅ tiny_face_detector_model-weights_manifest.json
✅ face_landmark_68_model-shard1
✅ face_landmark_68_model-weights_manifest.json
```

### 3. Kiểm tra .htaccess (đã đúng)

File `internal/.htaccess` đã được cấu hình để serve các file tĩnh:

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]
```

### 4. Cấu hình .env (đã đúng)

```env
URL_INTERNAL_BASE=http://localhost/rapphim/internal
URL_WEB_BASE=http://localhost/rapphim
PYTHON_API_URL=http://localhost:5000
```

## 🚀 Sử dụng

### Đăng ký khuôn mặt (Nhân viên)

1. Đăng nhập với vai trò **Nhân viên**
2. Truy cập: `/internal/dang-ky-khuon-mat`
3. **Tự động**:
   - Camera bật
   - Hệ thống phát hiện khuôn mặt
   - Hiển thị khung màu xanh
4. **Di chuyển đầu** nhẹ (trái, phải, thẳng)
5. Hệ thống tự động chụp 3-5 ảnh
6. Bấm **"Đăng ký khuôn mặt"**

### Chấm công (Nhân viên)

1. Truy cập: `/internal/cham-cong`
2. Kiểm tra trạng thái đăng ký
3. Nếu đã đăng ký → Camera tự động bật
4. Bấm **"Check In"** hoặc **"Check Out"**
5. Hệ thống nhận diện và ghi nhận

## 🐛 Xử lý lỗi

### Lỗi: "faceapi is not defined"
✅ **ĐÃ FIX**: Script face-api.js được load trực tiếp (không dùng `defer`)

### Lỗi: Không load được models
✅ **ĐÃ FIX**: Hệ thống tự động fallback sang CDN:
1. Thử load từ local: `http://localhost/rapphim/internal/models`
2. Nếu lỗi → Load từ CDN: `https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model`
3. Xem Console để biết chi tiết

### Kiểm tra trong Console

Mở **Developer Tools** (F12) → **Console**:

```javascript
// Nếu thành công
Loading models from: http://localhost/rapphim/internal/models
Models loaded successfully from local

// Nếu fallback CDN
Error loading local models: ...
Fallback to CDN: https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model
Models loaded successfully from CDN
```

### Lỗi 404 khi load models

**Nguyên nhân**: Server không serve được file models

**Giải pháp**:
1. Kiểm tra thư mục tồn tại: `internal/models/`
2. Kiểm tra quyền truy cập (CHMOD 755)
3. Xóa cache browser (Ctrl + Shift + R)
4. Hệ thống sẽ tự động dùng CDN

### Camera không bật

**Nguyên nhân**: 
- Trình duyệt chặn camera
- HTTPS required (một số browser)

**Giải pháp**:
1. Cho phép truy cập camera trong browser
2. Sử dụng `localhost` (được miễn HTTPS)
3. Hoặc cấu hình SSL certificate

## 📊 Luồng hoạt động

```
┌─────────────────────────────────────────┐
│ 1. Load trang đăng ký khuôn mặt         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 2. Check faceapi loaded?                │
│    - Nếu chưa → Đợi 100ms, check lại    │
│    - Timeout 10s → Báo lỗi              │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 3. Load models                           │
│    a) Thử local: /internal/models        │
│    b) Nếu lỗi → CDN fallback             │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 4. Khởi động camera                      │
│    - getUserMedia API                    │
│    - Video stream 640x480                │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 5. Phát hiện khuôn mặt (100ms interval)  │
│    - TinyFaceDetector                    │
│    - Vẽ khung màu xanh                   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 6. Phát hiện 1 khuôn mặt?                │
│    ├─ CÓ → Đếm ngược 2s → Chụp          │
│    └─ KHÔNG → Hủy countdown              │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 7. Chụp đủ 3-5 ảnh?                      │
│    ├─ CHƯA → Lặp lại bước 5              │
│    └─ ĐỦ → Dừng detection                │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 8. User bấm "Đăng ký khuôn mặt"          │
│    - POST /api/cham-cong/dang-ky-khuon-mat│
│    - Python API xử lý embeddings         │
│    - Lưu vào ChromaDB + MySQL            │
└─────────────────────────────────────────┘
```

## 🎯 Tối ưu hóa

### Hiệu năng
- Phát hiện face mỗi 100ms (không lag)
- TinyFaceDetector (nhẹ, nhanh)
- Canvas overlay (không ảnh hưởng video)
- Tự động dừng khi đủ ảnh

### UX/UI
- Indicator trạng thái màu sắc:
  - 🟡 Vàng: Đang tải
  - 🔵 Xanh dương: Sẵn sàng
  - 🟢 Xanh lá: Đang phát hiện
  - 🔴 Đỏ: Lỗi
- Progress bar mượt mà
- Countdown timer rõ ràng
- Thumbnail có số thứ tự (#1, #2, #3...)
- Hover để xóa ảnh

### Bảo mật
- Kiểm tra session nhân viên
- CSRF protection (nếu có)
- Rate limiting API (khuyến nghị)
- Validation ảnh (format, size)

## 📝 API Endpoints

### POST /api/cham-cong/dang-ky-khuon-mat
**Request**:
```json
{
  "images": [
    "data:image/jpeg;base64,...",
    "data:image/jpeg;base64,...",
    "data:image/jpeg;base64,..."
  ]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Đăng ký khuôn mặt thành công",
  "data": {
    "num_valid_images": 3,
    "employee_id": "123"
  }
}
```

### POST /api/cham-cong/cham-cong
**Request**:
```json
{
  "image": "data:image/jpeg;base64,...",
  "loai": "checkin"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Check-in thành công",
  "data": {
    "employee_id": 123,
    "employee_name": "Nguyễn Văn A",
    "gio_vao": "2025-01-09 08:00:00",
    "trang_thai": "Đúng giờ",
    "confidence": 95.5
  }
}
```

## 🔍 Troubleshooting

### 1. Models không load từ local
**Triệu chứng**: Console hiển thị "Error loading local models"

**Giải pháp**: Hệ thống tự động dùng CDN, không cần xử lý

### 2. Không phát hiện khuôn mặt
**Nguyên nhân**:
- Ánh sáng kém
- Khuôn mặt quá nhỏ
- Góc nghiêng quá nhiều

**Giải pháp**:
- Đứng gần camera hơn
- Bật đèn
- Nhìn thẳng vào camera

### 3. Chụp ảnh bị mờ
**Nguyên nhân**: Camera chất lượng thấp

**Giải pháp**: Trong code đã set quality = 0.8 (80%), có thể giảm nếu cần:
```javascript
const imageData = canvas.toDataURL('image/jpeg', 0.8); // 0.5-1.0
```

## 📚 Công nghệ

- **face-api.js** v0.22.2 - Face detection & landmarks
- **TinyFaceDetector** - Lightweight model (224x224)
- **Canvas API** - Drawing overlays
- **getUserMedia API** - Camera access
- **TailwindCSS** - Styling
- **Python Flask** - Backend API
- **ChromaDB** - Vector embeddings
- **MySQL** - Relational data

## 🎉 Kết quả

✅ Video stream tự động phát hiện và chụp khuôn mặt  
✅ Không cần bấm nút chụp thủ công  
✅ Fallback CDN khi local models lỗi  
✅ UI/UX trực quan với progress bar  
✅ Console logging chi tiết để debug  
✅ Xử lý lỗi gracefully  

---

**Phát triển bởi**: EPIC Cinema System  
**Ngày cập nhật**: 2025-01-09  
**Version**: 2.0 (Video Stream Auto-Capture)
