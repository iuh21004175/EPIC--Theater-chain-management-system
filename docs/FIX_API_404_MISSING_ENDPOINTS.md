# 🔧 Fix: API 404 Error - Missing Endpoints and CORS

## 📋 Vấn đề

**Console logs:**
```
📹 Client kết nối video namespace: H9s-m06hjed16e5ZAAAP
🔐 Kiểm tra quyền tham gia room: video_3_1759808920, User: 6, Type: staff
✅ User 6 (staff) đã tham gia room video_3_1759808920
Lỗi cập nhật trạng thái: Request failed with status code 404  ← BUG!
```

**Nguyên nhân:**
1. ❌ API endpoints `/api/goi-video/bat-dau` và `/api/goi-video/ket-thuc` đã khai báo route nhưng **thiếu Controller methods**
2. ❌ API **không có CORS headers** → Socket.IO server (Node.js) không gọi được

## 🔍 Phân tích Chi tiết

### **1. Missing Controller Methods:**

**File: `routes/apiv1.php`**
```php
// ✅ Routes ĐÃ CÓ
$r->addRoute('POST', '/goi-video/bat-dau', [Ctrl_GoiVideo::class, 'batDauCuocGoi']);
$r->addRoute('POST', '/goi-video/ket-thuc', [Ctrl_GoiVideo::class, 'ketThucCuocGoi']);
```

**File: `src/Controllers/Ctrl_GoiVideo.php`**
```php
// ❌ Methods CHƯA CÓ
// public function batDauCuocGoi() { ... }  ← Missing!
// public function ketThucCuocGoi() { ... } ← Missing!
```

**Kết quả:**
- Route có → FastRoute dispatch OK
- Controller method không có → **404 Not Found**

### **2. Missing CORS Headers:**

**File: `api/index.php`**
```php
// ❌ BEFORE - Không có CORS
<?php
    session_start();
    $uri = $_SERVER['REQUEST_URI'];
    // ...
?>
```

**Vấn đề:**
- Socket.IO server (localhost:3000) gọi API (localhost/rapphim/api)
- Browser/Node.js block vì **CORS policy**
- API không trả về `Access-Control-Allow-Origin` header

## ✅ Giải pháp

### **Fix 1: Thêm Controller Methods**

**File: `src/Controllers/Ctrl_GoiVideo.php`**

```php
// API: Bắt đầu cuộc gọi (gọi từ Socket.IO server)
public function batDauCuocGoi() {
    $data = json_decode(file_get_contents('php://input'), true);
    $roomId = $data['room_id'] ?? null;
    
    if (!$roomId) {
        return [
            'success' => false,
            'message' => 'Thiếu room_id'
        ];
    }

    $scGoiVideo = new Sc_GoiVideo();
    
    try {
        $lich = $scGoiVideo->batDauCuocGoi($roomId);
        
        return [
            'success' => true,
            'message' => 'Đã bắt đầu cuộc gọi',
            'data' => $lich
        ];
    } catch (\Exception $e) {
        return [
            'success' => false,
            'message' => $e->getMessage()
        ];
    }
}

// API: Kết thúc cuộc gọi (gọi từ Socket.IO server)
public function ketThucCuocGoi() {
    $data = json_decode(file_get_contents('php://input'), true);
    $roomId = $data['room_id'] ?? null;
    
    if (!$roomId) {
        return [
            'success' => false,
            'message' => 'Thiếu room_id'
        ];
    }

    $scGoiVideo = new Sc_GoiVideo();
    
    try {
        $lich = $scGoiVideo->ketThucCuocGoi($roomId);
        
        return [
            'success' => true,
            'message' => 'Đã kết thúc cuộc gọi',
            'data' => $lich
        ];
    } catch (\Exception $e) {
        return [
            'success' => false,
            'message' => $e->getMessage()
        ];
    }
}
```

### **Fix 2: Thêm CORS Headers**

**File: `api/index.php`**

```php
<?php
    session_start();
    
    // CORS Headers để cho phép Socket.IO server gọi API
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Content-Type: application/json');
    
    // Handle preflight OPTIONS request
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
    
    $uri = $_SERVER['REQUEST_URI'];
    if (stripos($uri, '/rapphim/api/') === 0) {
        $_SERVER['REQUEST_URI'] = str_ireplace('/rapphim/api/', '/', $uri);
    }
    
    require __DIR__ . '/../vendor/autoload.php';
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__.'/..');
    $dotenv->load();
    require __DIR__ . '/../config/database.php';
    require __DIR__ . '/../routes/apiv1.php';
?>
```

## 📊 API Flow

### **Luồng gọi API:**

```
Socket.IO Server (Node.js: localhost:3000)
  ↓
axios.post('http://localhost/rapphim/api/goi-video/bat-dau', {
    room_id: 'video_3_1759808920'
})
  ↓
PHP API (localhost/rapphim/api/index.php)
  ↓
Check CORS Headers ✅
  ↓
FastRoute Dispatch → Ctrl_GoiVideo::batDauCuocGoi()
  ↓
Sc_GoiVideo::batDauCuocGoi($roomId)
  ↓
Update database:
  - LichGoiVideo: trang_thai = DANG_GOI
  - WebRTCSession: trang_thai = KET_NOI
  ↓
Return JSON response
```

### **Request/Response:**

**Request:**
```http
POST /rapphim/api/goi-video/bat-dau HTTP/1.1
Host: localhost
Content-Type: application/json
Origin: http://localhost:3000

{
  "room_id": "video_3_1759808920"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Đã bắt đầu cuộc gọi",
  "data": {
    "id": 3,
    "trang_thai": 3,
    "thoi_gian_bat_dau": "2025-01-07 12:30:45"
  }
}
```

**Response (Error - Before Fix):**
```http
HTTP/1.1 404 Not Found
```

**Response (Error - Missing room_id):**
```json
{
  "success": false,
  "message": "Thiếu room_id"
}
```

## 🧪 Test Cases

### **Test 1: API bat-dau**

**Steps:**
1. Customer và Staff join room
2. Socket.IO gọi API `POST /api/goi-video/bat-dau`
3. Check database

**Expected:**
```sql
SELECT * FROM lich_goi_video WHERE room_id = 'video_3_1759808920';
-- trang_thai: 3 (DANG_GOI)
-- thoi_gian_bat_dau: '2025-01-07 12:30:45'

SELECT * FROM webrtc_sessions WHERE room_id = 'video_3_1759808920';
-- trang_thai: 2 (KET_NOI)
```

**Console logs:**
```
✅ User 6 (staff) đã tham gia room video_3_1759808920
✅ Đã cập nhật trạng thái: Đang gọi  ← FIXED!
```

### **Test 2: API ket-thuc**

**Steps:**
1. Cả 2 user disconnect
2. Socket.IO gọi API `POST /api/goi-video/ket-thuc`
3. Check database

**Expected:**
```sql
SELECT * FROM lich_goi_video WHERE room_id = 'video_3_1759808920';
-- trang_thai: 4 (HOAN_THANH)
-- thoi_gian_ket_thuc: '2025-01-07 12:45:30'

SELECT * FROM webrtc_sessions WHERE room_id = 'video_3_1759808920';
-- trang_thai: 3 (NGAT)
```

### **Test 3: CORS Headers**

**Test từ Node.js:**
```javascript
const axios = require('axios');

axios.post('http://localhost/rapphim/api/goi-video/bat-dau', {
    room_id: 'video_3_1759808920'
})
.then(response => {
    console.log('✅ API call success:', response.data);
})
.catch(error => {
    console.error('❌ API call failed:', error.message);
});
```

**Expected:**
```
✅ API call success: { success: true, message: 'Đã bắt đầu cuộc gọi', ... }
```

### **Test 4: Test CORS với cURL:**

```bash
curl -X OPTIONS http://localhost/rapphim/api/goi-video/bat-dau \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

**Expected headers:**
```
< HTTP/1.1 200 OK
< Access-Control-Allow-Origin: *
< Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
< Access-Control-Allow-Headers: Content-Type, Authorization
```

## 🎯 Root Cause Analysis

### **Tại sao bug này xảy ra?**

1. **Routes được add trước khi implement Controller:**
   - Developer add routes trong `apiv1.php`
   - Quên implement methods trong Controller
   - Không test API trước khi deploy

2. **CORS không được config từ đầu:**
   - API chỉ được gọi từ browser (same-origin)
   - Không nghĩ đến việc Node.js server cũng cần gọi API
   - Thiếu CORS headers → Cross-origin requests bị block

3. **Không có API testing:**
   - Không test với Postman/cURL
   - Không có unit tests cho API endpoints
   - Chỉ phát hiện lỗi khi chạy thực tế

## 🔧 Best Practices

### **1. Luôn test API sau khi thêm route:**

```bash
# Test với cURL
curl -X POST http://localhost/rapphim/api/goi-video/bat-dau \
  -H "Content-Type: application/json" \
  -d '{"room_id": "test_123"}'
```

### **2. Implement Controller method ngay sau khi add route:**

```php
// ❌ BAD - Add route trước, implement sau
$r->addRoute('POST', '/new-api', [Ctrl::class, 'newMethod']);
// TODO: Implement newMethod() later

// ✅ GOOD - Implement ngay
$r->addRoute('POST', '/new-api', [Ctrl::class, 'newMethod']);
// Method đã có sẵn trong Controller
```

### **3. CORS cho production:**

```php
// ❌ BAD - Allow all origins
header('Access-Control-Allow-Origin: *');

// ✅ GOOD - Restrict origins
$allowedOrigins = ['http://localhost:3000', 'https://yourdomain.com'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
}
```

### **4. API response consistent:**

```php
// ✅ ALWAYS return this format
return [
    'success' => true|false,
    'message' => 'Human readable message',
    'data' => [...] // optional
];
```

## 📚 Related Files

### **Modified:**
1. ✅ `src/Controllers/Ctrl_GoiVideo.php` - Added `batDauCuocGoi()` and `ketThucCuocGoi()`
2. ✅ `api/index.php` - Added CORS headers

### **Already correct (no changes):**
- ✅ `routes/apiv1.php` - Routes already declared
- ✅ `src/Services/Sc_GoiVideo.php` - Service methods already exist
- ✅ `sockets/videoCallHandler.js` - Axios calls already configured

## ✨ Kết quả sau fix

### **Before (Bug):**
```
Socket.IO: axios.post('/api/goi-video/bat-dau')
  ↓
❌ 404 Not Found
  ↓
Console: "Lỗi cập nhật trạng thái: Request failed with status code 404"
```

### **After (Fixed):**
```
Socket.IO: axios.post('/api/goi-video/bat-dau')
  ↓
✅ 200 OK
  ↓
Database updated:
  - lich_goi_video.trang_thai = 3 (DANG_GOI)
  - webrtc_sessions.trang_thai = 2 (KET_NOI)
  ↓
Console: "✅ Đã cập nhật trạng thái"
```

### **Benefits:**

1. ✅ **API hoạt động:** Socket.IO có thể gọi được
2. ✅ **CORS OK:** Cross-origin requests được chấp nhận
3. ✅ **Database sync:** Trạng thái cuộc gọi được update đúng
4. ✅ **No more 404:** Controller methods đầy đủ

---

**Fix date:** 2025-01-07  
**Issue:** API 404 - Missing controller methods and CORS  
**Root cause:** Routes declared but methods not implemented, no CORS headers  
**Solution:** Added controller methods and CORS headers  
**Status:** ✅ Fixed and ready to test
