# API Duyệt/Từ chối Kế hoạch Suất chiếu

## 📋 Tổng quan

Tài liệu này mô tả chi tiết về workflow và API endpoints cho việc duyệt/từ chối kế hoạch suất chiếu.

## 🔄 Workflow

```
Quản lý rạp tạo kế hoạch tuần
    ↓
KeHoachChiTiet (tinh_trang = 0 - Chờ duyệt)
    ↓
Quản lý chuỗi rạp xem xét
    ↓
    ├── DUYỆT (tinh_trang = 1)
    │     ↓
    │   1. Cập nhật KeHoachChiTiet.tinh_trang = 1
    │   2. Tạo record mới trong SuatChieu (tinh_trang = 1)
    │   3. Ghi log vào LogSuatChieu (hanh_dong = 5)
    │     ↓
    │   Suất chiếu có thể bán vé
    │
    └── TỪ CHỐI (tinh_trang = 2)
          ↓
        1. Cập nhật KeHoachChiTiet.tinh_trang = 2
        2. Lưu ly_do_tu_choi
          ↓
        Quản lý rạp có thể chỉnh sửa lại
```

## 🎯 Thiết kế dữ liệu

### Tại sao KHÔNG tạo bảng log mới?

**Quyết định: Sử dụng lại bảng `log_suatchieu` hiện có**

**Lý do:**

1. ✅ **Tập trung log**: Tất cả nhật ký liên quan đến suất chiếu ở một nơi
2. ✅ **Tránh dư thừa**: Không cần tạo bảng mới với cấu trúc tương tự
3. ✅ **Mở rộng dễ dàng**: Thêm giá trị `hanh_dong = 5` (Duyệt từ kế hoạch)
4. ✅ **Tương thích**: Cùng cấu trúc với log suất chiếu thường

### Cấu trúc bảng

#### KeHoachChiTiet
```sql
CREATE TABLE `kehoach_chitiet` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `id_kehoach` INT NOT NULL,
  `id_phim` INT NOT NULL,
  `id_phongchieu` INT NOT NULL,
  `batdau` DATETIME NOT NULL,
  `ketthuc` DATETIME NOT NULL,
  `tinh_trang` TINYINT(1) DEFAULT 0 COMMENT '0-Chờ duyệt, 1-Đã duyệt, 2-Từ chối',
  `ly_do_tu_choi` TEXT NULL COMMENT 'Lý do từ chối',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### LogSuatChieu (Cập nhật)
```sql
-- Thêm giá trị mới cho hanh_dong:
-- 0 - Tạo
-- 1 - Cập nhật
-- 2 - Xóa
-- 3 - Duyệt (suất chiếu thường)
-- 4 - Từ chối (suất chiếu thường)
-- 5 - Duyệt từ kế hoạch (MỚI)
```

## 🚀 API Endpoints

### 1. Duyệt suất chiếu đơn lẻ

**Endpoint:** `POST /api/ke-hoach-suat-chieu/{id}/duyet`

**Quyền:** Quản lý chuỗi rạp

**Mô tả:** Duyệt một suất chiếu trong kế hoạch, tạo suất chiếu thực tế

**Request:**
```http
POST /api/ke-hoach-suat-chieu/123/duyet
Content-Type: application/json
```

**Response thành công:**
```json
{
  "success": true,
  "message": "Duyệt suất chiếu trong kế hoạch thành công",
  "data": {
    "ke_hoach_chi_tiet": {
      "id": 123,
      "id_kehoach": 45,
      "id_phim": 10,
      "id_phongchieu": 5,
      "batdau": "2025-10-15 14:00:00",
      "ketthuc": "2025-10-15 16:30:00",
      "tinh_trang": 1,
      "ly_do_tu_choi": null
    },
    "suat_chieu": {
      "id": 789,
      "id_phim": 10,
      "id_phongchieu": 5,
      "batdau": "2025-10-15 14:00:00",
      "ketthuc": "2025-10-15 16:30:00",
      "tinh_trang": 1
    }
  }
}
```

**Response lỗi:**
```json
{
  "success": false,
  "message": "Suất chiếu này đã được duyệt trước đó"
}
```

**Hành động:**
1. Cập nhật `KeHoachChiTiet.tinh_trang = 1`
2. Xóa `KeHoachChiTiet.ly_do_tu_choi` (nếu có)
3. Tạo record mới trong `SuatChieu` với `tinh_trang = 1`
4. Ghi log vào `LogSuatChieu` với `hanh_dong = 5`

**Validation:**
- ✅ Kiểm tra kế hoạch chi tiết tồn tại
- ✅ Không cho duyệt lại nếu đã duyệt (`tinh_trang = 1`)
- ✅ Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu

---

### 2. Từ chối suất chiếu

**Endpoint:** `POST /api/ke-hoach-suat-chieu/{id}/tu-choi`

**Quyền:** Quản lý chuỗi rạp

**Mô tả:** Từ chối suất chiếu trong kế hoạch

**Request:**
```http
POST /api/ke-hoach-suat-chieu/123/tu-choi
Content-Type: application/json
```

**Response thành công:**
```json
{
  "success": true,
  "message": "Từ chối suất chiếu trong kế hoạch thành công",
  "data": {
    "id": 123,
    "id_kehoach": 45,
    "id_phim": 10,
    "id_phongchieu": 5,
    "batdau": "2025-10-15 14:00:00",
    "ketthuc": "2025-10-15 16:30:00",
    "tinh_trang": 2
  }
}
```

**Response lỗi:**
```json
{
  "success": false,
  "message": "Không thể từ chối suất chiếu đã được duyệt"
}
```

**Hành động:**
1. Cập nhật `KeHoachChiTiet.tinh_trang = 2`
2. KHÔNG tạo suất chiếu thực tế
3. KHÔNG ghi log (chỉ cập nhật trạng thái kế hoạch)

**Validation:**
- ✅ Kiểm tra kế hoạch chi tiết tồn tại
- ✅ Không cho từ chối nếu đã duyệt (`tinh_trang = 1`)

---

### 3. Duyệt toàn bộ tuần

**Endpoint:** `POST /api/ke-hoach-suat-chieu/duyet-tuan`

**Quyền:** Quản lý chuỗi rạp

**Mô tả:** Duyệt tất cả suất chiếu chờ duyệt trong tuần

**Request:**
```http
POST /api/ke-hoach-suat-chieu/duyet-tuan
Content-Type: application/json

{
  "batdau": "2025-10-13",
  "ketthuc": "2025-10-19",
  "id_rap": 5
}
```

**Response thành công:**
```json
{
  "success": true,
  "message": "Duyệt toàn bộ tuần thành công",
  "data": {
    "count": 15,
    "suat_chieu": [
      {
        "id": 789,
        "id_phim": 10,
        "id_phongchieu": 5,
        "batdau": "2025-10-15 14:00:00",
        "ketthuc": "2025-10-15 16:30:00",
        "tinh_trang": 1
      },
      // ... 14 suất chiếu khác
    ]
  }
}
```

**Response không có gì để duyệt:**
```json
{
  "success": true,
  "message": "Không có suất chiếu nào chờ duyệt trong tuần này",
  "data": {
    "count": 0,
    "suat_chieu": []
  }
}
```

**Hành động:**
1. Tìm tất cả `KeHoachChiTiet` với:
   - `tinh_trang = 0` (Chờ duyệt)
   - `batdau BETWEEN [batdau, ketthuc]`
   - `phongChieu.id_rapphim = id_rap` (nếu có)
2. Với mỗi suất chiếu:
   - Cập nhật `tinh_trang = 1`
   - Tạo `SuatChieu` mới
   - Ghi log với `hanh_dong = 5`
3. Sử dụng transaction cho toàn bộ tuần

**Validation:**
- ✅ `batdau` và `ketthuc` là bắt buộc
- ✅ `id_rap` là optional (nếu không có thì duyệt tất cả rạp)
- ✅ Chỉ duyệt suất chiếu có `tinh_trang = 0`

---

## 💻 Frontend Integration

### JavaScript (duyet-ke-hoach.js)

#### Duyệt suất chiếu đơn lẻ
```javascript
async function approveShowtime(showtimeId) {
    try {
        showSpinner('Đang duyệt suất chiếu...');
        
        const response = await fetch(`${baseUrl}/api/ke-hoach-suat-chieu/${showtimeId}/duyet`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Duyệt suất chiếu thành công', 'success');
            loadKeHoach(); // Reload danh sách
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        showToast('Có lỗi xảy ra', 'error');
    } finally {
        hideSpinner();
    }
}
```

#### Từ chối suất chiếu
```javascript
async function rejectShowtime(showtimeId) {
    try {
        showSpinner('Đang từ chối suất chiếu...');
        
        const response = await fetch(`${baseUrl}/api/ke-hoach-suat-chieu/${showtimeId}/tu-choi`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Từ chối suất chiếu thành công', 'success');
            loadKeHoach();
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        showToast('Có lỗi xảy ra', 'error');
    } finally {
        hideSpinner();
    }
}
```

#### Duyệt toàn bộ tuần
```javascript
async function approveAllWeek() {
    const confirm = await showConfirm('Bạn có chắc muốn duyệt tất cả suất chiếu chờ duyệt trong tuần?');
    if (!confirm) return;
    
    try {
        showSpinner('Đang duyệt toàn bộ tuần...');
        
        const response = await fetch(`${baseUrl}/api/ke-hoach-suat-chieu/duyet-tuan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                batdau: formatDate(currentWeekStart),
                ketthuc: formatDate(currentWeekEnd),
                id_rap: currentRapId
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast(`Đã duyệt ${result.data.count} suất chiếu`, 'success');
            loadKeHoach();
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        showToast('Có lỗi xảy ra', 'error');
    } finally {
        hideSpinner();
    }
}
```

---

## 🔒 Bảo mật & Validation

### Backend Validation

#### Service Layer (Sc_KeHoachSuatChieu.php)
```php
// 1. Kiểm tra tồn tại
if (!$keHoachChiTiet) {
    throw new \Exception('Không tìm thấy suất chiếu trong kế hoạch');
}

// 2. Kiểm tra trạng thái
if ($keHoachChiTiet->tinh_trang == 1) {
    throw new \Exception('Suất chiếu này đã được duyệt');
}

// 3. Transaction
\Illuminate\Support\Facades\DB::beginTransaction();
try {
    // ... thực hiện các thay đổi
    \Illuminate\Support\Facades\DB::commit();
} catch (\Exception $e) {
    \Illuminate\Support\Facades\DB::rollBack();
    throw $e;
}
```

### Frontend Validation

```javascript
// 1. Kiểm tra quyền
if (currentUserRole !== 'Quản lý chuỗi rạp') {
    showToast('Bạn không có quyền thực hiện thao tác này', 'error');
    return;
}

// 2. Kiểm tra trạng thái
if (showtime.tinh_trang == 1) {
    showToast('Suất chiếu đã được duyệt', 'warning');
    return;
}

// 3. Confirm trước khi duyệt hàng loạt
const confirmed = await showConfirm('Duyệt tất cả suất chiếu?');
if (!confirmed) return;
```

---

## 📊 Database Migration

### Chạy migration
```bash
# Kết nối MySQL
mysql -u root -p

# Chọn database
USE ten_database;

# Chạy migration
SOURCE i:/Final/Code/ChuoiRapChieuPhim1/database/migrations/add_ly_do_tu_choi_to_kehoach_chitiet.sql;

# Kiểm tra
DESCRIBE kehoach_chitiet;
```

### Rollback (nếu cần)
```sql
ALTER TABLE `kehoach_chitiet` DROP COLUMN `ly_do_tu_choi`;
```

---

## 🧪 Testing

### Test Cases

#### 1. Duyệt suất chiếu thành công
```
Given: Suất chiếu có tinh_trang = 0
When: POST /api/ke-hoach-suat-chieu/{id}/duyet
Then: 
  - KeHoachChiTiet.tinh_trang = 1
  - Tạo mới SuatChieu
  - Tạo log với hanh_dong = 5
```

#### 2. Không thể duyệt lại
```
Given: Suất chiếu có tinh_trang = 1
When: POST /api/ke-hoach-suat-chieu/{id}/duyet
Then: HTTP 200 với success = false, message = "Đã được duyệt"
```

#### 3. Từ chối với lý do
```
Given: Suất chiếu có tinh_trang = 0
When: POST /api/ke-hoach-suat-chieu/{id}/tu-choi với ly_do
Then:
  - KeHoachChiTiet.tinh_trang = 2
  - KeHoachChiTiet.ly_do_tu_choi = ly_do
  - KHÔNG tạo SuatChieu
```

#### 4. Duyệt toàn tuần
```
Given: 5 suất chiếu có tinh_trang = 0 trong tuần
When: POST /api/ke-hoach-suat-chieu/duyet-tuan
Then:
  - Tất cả 5 suất có tinh_trang = 1
  - Tạo 5 SuatChieu mới
  - Tạo 5 log với hanh_dong = 5
```

---

## 🐛 Troubleshooting

### Lỗi thường gặp

#### 1. "Không tìm thấy suất chiếu trong kế hoạch"
**Nguyên nhân:** ID không tồn tại hoặc đã bị xóa
**Giải pháp:** Kiểm tra ID trong request

#### 2. "Suất chiếu này đã được duyệt trước đó"
**Nguyên nhân:** `tinh_trang = 1`
**Giải pháp:** Refresh danh sách, không cho phép duyệt lại

#### 3. Transaction rollback
**Nguyên nhân:** Lỗi khi tạo SuatChieu hoặc log
**Giải pháp:** Kiểm tra:
- Foreign key constraints
- Required fields trong SuatChieu
- Database connection

#### 4. Log không được ghi
**Nguyên nhân:** Thiếu relationship hoặc dữ liệu phim
**Giải pháp:** Đảm bảo load relationship: `with(['phim', 'phongChieu'])`

---

## 📝 Changelog

### Version 1.0 (2025-10-06)
- ✅ Thêm API duyệt/từ chối kế hoạch
- ✅ Thêm cột `ly_do_tu_choi` vào `kehoach_chitiet`
- ✅ Thêm `hanh_dong = 5` vào `log_suatchieu`
- ✅ Implement transaction cho data integrity
- ✅ Validation đầy đủ cho các edge cases
- ✅ Frontend integration với duyet-ke-hoach.js

---

## 👥 Team

**Developer:** AI Assistant  
**Date:** October 6, 2025  
**Project:** Chuỗi Rạp Chiếu Phim  
**Module:** Quản lý kế hoạch suất chiếu
