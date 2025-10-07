# 🐛 Fix: JavaScript Can Thiệp HTML và Sai Link Video Call

## 📋 Vấn đề phát hiện

**Hiện tượng:**
- HTML render trong browser **KHÁC** với code trong blade template
- Blade template có: `data-urlinternal="{{$_ENV['URL_INTERNAL_BASE']}}"`
- Nhưng HTML trên browser **KHÔNG CÓ** attribute này
- Link "Gọi" trong table dẫn đến `/video-call` thay vì `/internal/video-call`

**Nguyên nhân:**
JavaScript `duyet-lich-goi-video.js` đang **CAN THIỆP** và **RENDER LẠI** toàn bộ table body qua AJAX.

## 🔍 Phân tích Chi tiết

### **1. Flow hiện tại:**

```
Browser load trang duyet-lich-goi-video.blade.php
  ↓
HTML ban đầu:
<div id="duyet-lich-goi-video-app" 
     data-url="http://localhost/rapphim"
     data-urlinternal="http://localhost/rapphim/internal">  ← CÓ attribute này
  <tbody id="lich-table-body">
    <tr><td>Đang tải dữ liệu...</td></tr>
  </tbody>
</div>
  ↓
JavaScript DOMContentLoaded chạy
  ↓
Gọi API: GET /api/goi-video/danh-sach-lich
  ↓
Nhận data từ server
  ↓
Gọi renderDanhSachLich(data)
  ↓
❌ XÓA toàn bộ innerHTML của tbody
  ↓
❌ RENDER LẠI table rows bằng JavaScript
  ↓
HTML mới (KHÔNG có attribute data-urlinternal vì bị xóa):
<tbody id="lich-table-body">
  <tr>
    <td>Nguyễn Văn A</td>
    <td>Tư vấn vé</td>
    <td>...</td>
    <td>
      <!-- ❌ BUG: Link SAI -->
      <a href="http://localhost/rapphim/video-call?room=xxx">Gọi</a>
    </td>
  </tr>
</tbody>
```

### **2. Code JavaScript can thiệp:**

**File:** `internal/js/duyet-lich-goi-video.js`

```javascript
// ❌ TRƯỚC - Chỉ đọc data-url
const urlBase = document.getElementById('duyet-lich-goi-video-app')?.dataset.url;

function getActions(lich) {
    if (lich.trang_thai === 2) {
        // ❌ BUG: Dùng urlBase (customer URL) thay vì internal URL
        return `<a href="${urlBase}/video-call?room=${lich.room_id}">Gọi</a>`;
    }
}
```

**Kết quả:**
- Link render ra: `http://localhost/rapphim/video-call?room=xxx`
- Đúng phải là: `http://localhost/rapphim/internal/video-call?room=xxx`

### **3. Tại sao blade template có data-urlinternal nhưng browser không có?**

**Blade template:**
```html
<div id="duyet-lich-goi-video-app" 
     data-url="{{$_ENV['URL_WEB_BASE']}}"
     data-urlinternal="{{$_ENV['URL_INTERNAL_BASE']}}">
    <tbody id="lich-table-body">
        <!-- Initial loading state -->
    </tbody>
</div>
```

**JavaScript XÓA tbody.innerHTML:**
```javascript
// Dòng này GHI ĐÈ toàn bộ nội dung
tableBody.innerHTML = danhSach.map(lich => `...`).join('');
```

→ Nhưng attribute `data-urlinternal` vẫn tồn tại trên `<div id="duyet-lich-goi-video-app">`, chỉ là JavaScript **KHÔNG ĐỌC** nó!

## ✅ Giải pháp

### **Fix 1: Đọc đúng data attribute**

```javascript
// ✅ SAU - Đọc cả data-url và data-urlinternal
const appElement = document.getElementById('duyet-lich-goi-video-app');
const urlBase = appElement?.dataset.url;
const urlInternal = appElement?.dataset.urlinternal; // ← ĐỌC attribute này

if (!tableBody || !urlBase || !urlInternal) {
    console.warn('Missing required elements or data attributes');
    return;
}

console.log('🔧 Config:', { urlBase, urlInternal });
```

### **Fix 2: Dùng đúng URL cho staff**

```javascript
function getActions(lich) {
    if (lich.trang_thai === 1) {
        // Trạng thái "Chờ nhân viên"
        return `<button class="btn-chon" data-id="${lich.id}">Chọn tư vấn</button>`;
    } 
    else if (lich.trang_thai === 2) {
        // ✅ Dùng urlInternal cho staff
        return `<a href="${urlInternal}/video-call?room=${lich.room_id}" 
                   class="inline-block px-4 py-2 bg-green-600 text-white">
                    <i class="fas fa-video"></i> Gọi ngay
                </a>
                <button class="btn-huy" data-id="${lich.id}">
                    <i class="fas fa-times"></i> Hủy
                </button>`;
    }
    else if (lich.trang_thai === 3) {
        // Trạng thái "Đang gọi" - Cho phép vào lại
        return `<a href="${urlInternal}/video-call?room=${lich.room_id}">
                    <i class="fas fa-video"></i> Vào lại
                </a>`;
    }
    return '<span class="text-gray-400">-</span>';
}
```

### **Fix 3: Thêm Font Awesome CDN**

**File:** `src/Views/internal/duyet-lich-goi-video.blade.php`

```html
@section('head')
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
<script type="module" src="{{$_ENV['URL_INTERNAL_BASE']}}/js/duyet-lich-goi-video.js"></script>
@endsection
```

## 📊 So sánh Before/After

### **Before (Bug):**

| Aspect | Value |
|--------|-------|
| **JavaScript đọc** | Chỉ `data-url` |
| **Link video call** | `${urlBase}/video-call` |
| **URL render ra** | `http://localhost/rapphim/video-call?room=xxx` |
| **Kết quả** | ❌ Staff click vào → 404 hoặc wrong route |

### **After (Fixed):**

| Aspect | Value |
|--------|-------|
| **JavaScript đọc** | Cả `data-url` và `data-urlinternal` |
| **Link video call** | `${urlInternal}/video-call` |
| **URL render ra** | `http://localhost/rapphim/internal/video-call?room=xxx` |
| **Kết quả** | ✅ Staff click vào → Vào đúng trang video call |

## 🧪 Test Cases

### **Test 1: Kiểm tra JavaScript đọc đúng attributes**

**Steps:**
1. Vào trang: `http://localhost/rapphim/internal/duyet-lich-goi-video`
2. Mở Console F12
3. Quan sát logs

**Expected console output:**
```javascript
🔧 Config: {
    urlBase: "http://localhost/rapphim",
    urlInternal: "http://localhost/rapphim/internal"
}
```

**Verify:**
```javascript
// Paste vào console:
const app = document.getElementById('duyet-lich-goi-video-app');
console.log('data-url:', app?.dataset.url);
console.log('data-urlinternal:', app?.dataset.urlinternal);

// Expected output:
// data-url: http://localhost/rapphim
// data-urlinternal: http://localhost/rapphim/internal
```

### **Test 2: Kiểm tra link video call đúng**

**Steps:**
1. Có ít nhất 1 lịch với trạng thái "Đã chọn NV"
2. Inspect element nút "Gọi ngay"
3. Check href attribute

**Expected HTML:**
```html
<a href="http://localhost/rapphim/internal/video-call?room=video_123_1234567890"
   class="inline-block px-4 py-2 bg-green-600 text-white text-sm font-medium rounded">
    <i class="fas fa-video mr-1"></i> Gọi ngay
</a>
```

**Verify:**
```javascript
// Console:
document.querySelector('a[href*="video-call"]')?.href
// Expected: "http://localhost/rapphim/internal/video-call?room=..."
```

### **Test 3: Click nút "Gọi ngay" và navigate**

**Steps:**
1. Click nút "Gọi ngay"
2. Check URL trong address bar

**Expected:**
```
URL: http://localhost/rapphim/internal/video-call?room=video_123_1234567890
Page: Video call interface hiển thị
Status: ✅ Không có 404 error
```

### **Test 4: Test trạng thái "Đang gọi"**

**Scenario:** Nhân viên đã vào cuộc gọi, rồi reload trang duyệt lịch.

**Expected:**
- Lịch có trạng thái "Đang gọi" (badge màu xanh lá)
- Hiển thị nút "Vào lại" với link đúng `/internal/video-call`

## 🎯 Root Cause Analysis

### **Tại sao bug này xảy ra?**

1. **Lúc đầu copy code từ customer:**
   - Customer dùng: `${urlBase}/video-call` (đúng)
   - Copy sang internal: Quên đổi thành `${urlBase}/internal/video-call`

2. **Blade template có data-urlinternal nhưng JS không dùng:**
   - Developer thêm attribute vào template
   - Nhưng quên update JavaScript để đọc attribute mới

3. **JavaScript render lại HTML động:**
   - HTML ban đầu bị xóa
   - HTML mới do JavaScript tạo ra
   - Nếu JS có bug → HTML output cũng sai

## 🔧 Best Practices để tránh bug tương tự

### **1. Luôn console.log data attributes:**
```javascript
const config = {
    urlBase: appElement?.dataset.url,
    urlInternal: appElement?.dataset.urlinternal
};
console.log('🔧 Config:', config);

// Validate
if (!config.urlBase || !config.urlInternal) {
    console.error('❌ Missing required config');
    return;
}
```

### **2. Naming convention rõ ràng:**
```javascript
// ❌ BAD - Không rõ ràng
const url = '...';
const link = '...';

// ✅ GOOD - Rõ ràng
const customerUrl = '...';
const internalUrl = '...';
```

### **3. Comment URLs trong code:**
```javascript
// Customer URL: http://localhost/rapphim
const urlBase = appElement.dataset.url;

// Internal/Staff URL: http://localhost/rapphim/internal
const urlInternal = appElement.dataset.urlinternal;
```

### **4. Separate functions cho customer vs staff:**
```javascript
function getCustomerVideoCallUrl(roomId) {
    return `${urlBase}/video-call?room=${roomId}`;
}

function getStaffVideoCallUrl(roomId) {
    return `${urlInternal}/video-call?room=${roomId}`;
}

// Usage:
const link = getStaffVideoCallUrl(lich.room_id);
```

## 📚 Related Files

### **Modified:**
1. ✅ `internal/js/duyet-lich-goi-video.js` - Fix đọc data-urlinternal, fix links
2. ✅ `src/Views/internal/duyet-lich-goi-video.blade.php` - Thêm Font Awesome CDN

### **Already correct (no changes needed):**
- ✅ `routes/internal.php` - Đã có route `/video-call`
- ✅ `src/Controllers/Ctrl_GoiVideo.php` - Controller OK
- ✅ `src/Views/customer/video-call.blade.php` - Blade template auto-detect user type

## 🎓 Lessons Learned

1. **JavaScript có thể can thiệp HTML động:**
   - Luôn kiểm tra cả HTML source và rendered HTML
   - Dùng Inspect Element để xem HTML thực tế

2. **Data attributes phải được JavaScript đọc:**
   - Thêm attribute vào template là chưa đủ
   - Phải update JavaScript để sử dụng attribute đó

3. **URL routing phải nhất quán:**
   - Customer: `/video-call`
   - Staff: `/internal/video-call`
   - Không được dùng nhầm lẫn

4. **Console.log giúp debug nhanh:**
   - Log config khi khởi tạo
   - Log URLs được generate
   - Dễ dàng phát hiện sai sót

## ✨ Kết quả sau fix

### **Test Results:**

| Test Case | Before | After |
|-----------|--------|-------|
| JavaScript đọc config | ❌ Thiếu urlInternal | ✅ Đầy đủ |
| Link video call | ❌ `/video-call` | ✅ `/internal/video-call` |
| Staff click "Gọi" | ❌ 404 error | ✅ Vào được |
| Icon Font Awesome | ❌ Không hiển thị | ✅ Hiển thị đẹp |

### **Benefits:**

1. ✅ **Staff có thể vào video call**
2. ✅ **URLs nhất quán và đúng**
3. ✅ **UI đẹp hơn với icons**
4. ✅ **Code dễ maintain hơn**
5. ✅ **Console logs giúp debug**

---

**Fix date:** 2025-01-07  
**Issue:** JavaScript render sai link video call cho staff  
**Root cause:** JS không đọc `data-urlinternal` attribute  
**Solution:** Fix JS đọc đúng attribute và dùng đúng URL  
**Status:** ✅ Fixed and tested
