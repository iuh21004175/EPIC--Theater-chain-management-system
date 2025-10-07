# 🚀 Quick Test Guide - API Duyệt Kế hoạch

## 📝 Checklist Trước Khi Test

### 1. Chạy Migration
```sql
-- Kết nối MySQL
mysql -u root -p

-- Chọn database
USE ten_database_cua_ban;

-- Chạy migration
ALTER TABLE `kehoach_chitiet` 
ADD COLUMN `ly_do_tu_choi` TEXT NULL COMMENT 'Lý do từ chối (nếu tinh_trang = 2)' AFTER `tinh_trang`;

-- Kiểm tra
DESCRIBE kehoach_chitiet;
-- Phải thấy cột ly_do_tu_choi mới
```

### 2. Kiểm tra Code
- ✅ `Sc_KeHoachSuatChieu.php` - Thêm 3 methods mới
- ✅ `Ctrl_KeHoachSuatChieu.php` - Thêm 3 methods mới
- ✅ `KeHoachChiTiet.php` - Thêm `ly_do_tu_choi` vào fillable
- ✅ `LogSuatChieu.php` - Cập nhật comment `hanh_dong`
- ✅ `apiv1.php` - Thêm 3 routes mới

---

## 🧪 Test Cases với Postman/curl

### Test 1: Duyệt suất chiếu đơn lẻ

**Chuẩn bị:**
1. Tạo kế hoạch với ít nhất 1 suất chiếu (`tinh_trang = 0`)
2. Lấy ID của suất chiếu đó

**Request:**
```bash
curl -X POST "http://localhost/api/ke-hoach-suat-chieu/123/duyet" \
  -H "Content-Type: application/json" \
  -H "Cookie: PHPSESSID=your_session_id"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Duyệt suất chiếu trong kế hoạch thành công",
  "data": {
    "ke_hoach_chi_tiet": { "tinh_trang": 1, ... },
    "suat_chieu": { "id": 789, ... }
  }
}
```

**Kiểm tra Database:**
```sql
-- 1. Kiểm tra kế hoạch chi tiết
SELECT * FROM kehoach_chitiet WHERE id = 123;
-- tinh_trang phải = 1

-- 2. Kiểm tra suất chiếu mới được tạo
SELECT * FROM suatchieu WHERE id = 789;
-- Phải có record mới

-- 3. Kiểm tra log
SELECT * FROM log_suatchieu WHERE id_suatchieu = 789;
-- hanh_dong phải = 5
```

---

### Test 2: Từ chối suất chiếu

**Request:**
```bash
curl -X POST "http://localhost/api/ke-hoach-suat-chieu/124/tu-choi" \
  -H "Content-Type: application/json" \
  -H "Cookie: PHPSESSID=your_session_id"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Từ chối suất chiếu trong kế hoạch thành công",
  "data": {
    "tinh_trang": 2
  }
}
```

**Kiểm tra Database:**
```sql
SELECT tinh_trang FROM kehoach_chitiet WHERE id = 124;
-- tinh_trang = 2

-- Không có suất chiếu mới
SELECT COUNT(*) FROM suatchieu WHERE id_phongchieu = (
  SELECT id_phongchieu FROM kehoach_chitiet WHERE id = 124
);
```

---

### Test 3: Duyệt toàn bộ tuần

**Request:**
```bash
curl -X POST "http://localhost/api/ke-hoach-suat-chieu/duyet-tuan" \
  -H "Content-Type: application/json" \
  -H "Cookie: PHPSESSID=your_session_id" \
  -d '{
    "batdau": "2025-10-13",
    "ketthuc": "2025-10-19",
    "id_rap": 5
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Duyệt toàn bộ tuần thành công",
  "data": {
    "count": 15,
    "suat_chieu": [ ... ]
  }
}
```

**Kiểm tra Database:**
```sql
-- Tất cả suất chiếu trong tuần phải được duyệt
SELECT COUNT(*) 
FROM kehoach_chitiet kc
JOIN phongchieu pc ON kc.id_phongchieu = pc.id
WHERE pc.id_rapphim = 5
  AND kc.batdau BETWEEN '2025-10-13' AND '2025-10-19'
  AND kc.tinh_trang = 1;
-- Count phải = 15

-- Phải có 15 suất chiếu mới
SELECT COUNT(*) 
FROM suatchieu sc
JOIN phongchieu pc ON sc.id_phongchieu = pc.id
WHERE pc.id_rapphim = 5
  AND sc.batdau BETWEEN '2025-10-13' AND '2025-10-19';

-- Phải có 15 log mới
SELECT COUNT(*) 
FROM log_suatchieu ls
WHERE ls.hanh_dong = 5
  AND ls.batdau BETWEEN '2025-10-13' AND '2025-10-19';
```

---

### Test 4: Edge Cases

#### 4.1. Duyệt lại suất chiếu đã duyệt
```bash
curl -X POST "http://localhost/api/ke-hoach-suat-chieu/123/duyet" \
  -H "Content-Type: application/json"
```
**Expected:**
```json
{
  "success": false,
  "message": "Suất chiếu này đã được duyệt trước đó"
}
```

#### 4.2. Từ chối suất chiếu đã duyệt
```bash
curl -X POST "http://localhost/api/ke-hoach-suat-chieu/123/tu-choi" \
  -H "Content-Type: application/json"
```
**Expected:**
```json
{
  "success": false,
  "message": "Không thể từ chối suất chiếu đã được duyệt"
}
```

#### 4.3. Duyệt ID không tồn tại
```bash
curl -X POST "http://localhost/api/ke-hoach-suat-chieu/99999/duyet" \
  -H "Content-Type: application/json"
```
**Expected:**
```json
{
  "success": false,
  "message": "Không tìm thấy suất chiếu trong kế hoạch"
}
```

---

## 🎨 Test Frontend

### 1. Mở trang duyệt kế hoạch
```
http://localhost/internal/duyet-suat-chieu-chi-tiet?id=5
```

### 2. Chuyển sang tab "Kế hoạch"
- Click nút "Kế hoạch"
- Phải hiện danh sách suất chiếu tuần

### 3. Test duyệt từng suất
- Click nút "Duyệt" trên một suất chiếu
- Badge phải chuyển từ vàng (Chờ duyệt) → xanh (Đã duyệt)
- Các nút action phải mất

### 4. Test từ chối
- Click nút "Từ chối" trên một suất chiếu
- Confirm dialog phải hiện
- Sau khi xác nhận, badge phải chuyển từ vàng → đỏ (Từ chối)

### 5. Test duyệt cả tuần
- Click nút "Duyệt toàn bộ tuần"
- Confirm dialog phải hiện
- Sau khi xác nhận, tất cả suất chờ duyệt → đã duyệt

---

## 🐛 Debug Checklist

### Nếu API trả về lỗi 404:
1. ✅ Kiểm tra routes đã được đăng ký trong `apiv1.php`
2. ✅ Clear cache: xóa folder `cache/`
3. ✅ Kiểm tra URL có đúng format không

### Nếu API trả về lỗi 500:
1. ✅ Kiểm tra log PHP: `php_error.log`
2. ✅ Kiểm tra namespace: `use App\Models\SuatChieu;`
3. ✅ Kiểm tra database connection
4. ✅ Kiểm tra foreign key constraints

### Nếu transaction lỗi:
1. ✅ Kiểm tra `SuatChieu` model có đúng fillable không
2. ✅ Kiểm tra `LogSuatChieu` model
3. ✅ Kiểm tra relationship: `phim()`, `phongChieu()`

### Nếu frontend không hoạt động:
1. ✅ Mở Console (F12), xem có lỗi JavaScript không
2. ✅ Kiểm tra Network tab, xem API response
3. ✅ Kiểm tra `duyet-ke-hoach.js` đã load chưa
4. ✅ Kiểm tra `baseUrl` có đúng không

---

## 📊 Kiểm tra toàn diện

### SQL Script để verify
```sql
-- 1. Đếm số suất chiếu theo trạng thái
SELECT 
    tinh_trang,
    CASE 
        WHEN tinh_trang = 0 THEN 'Chờ duyệt'
        WHEN tinh_trang = 1 THEN 'Đã duyệt'
        WHEN tinh_trang = 2 THEN 'Từ chối'
    END as trang_thai,
    COUNT(*) as so_luong
FROM kehoach_chitiet
GROUP BY tinh_trang;

-- 2. Kiểm tra tính nhất quán: mỗi kế hoạch đã duyệt phải có suất chiếu
SELECT 
    kc.id,
    kc.tinh_trang,
    COUNT(sc.id) as so_suat_chieu
FROM kehoach_chitiet kc
LEFT JOIN suatchieu sc ON (
    kc.id_phim = sc.id_phim 
    AND kc.id_phongchieu = sc.id_phongchieu
    AND kc.batdau = sc.batdau
)
WHERE kc.tinh_trang = 1
GROUP BY kc.id
HAVING COUNT(sc.id) = 0;
-- Kết quả phải rỗng (không có kế hoạch đã duyệt mà thiếu suất chiếu)

-- 3. Kiểm tra log
SELECT 
    hanh_dong,
    CASE hanh_dong
        WHEN 5 THEN 'Duyệt từ kế hoạch'
        ELSE 'Khác'
    END as loai,
    COUNT(*) as so_luong
FROM log_suatchieu
WHERE hanh_dong = 5
GROUP BY hanh_dong;

-- 4. Kiểm tra lý do từ chối
SELECT 
    id,
    id_phim,
    tinh_trang,
    ly_do_tu_choi
FROM kehoach_chitiet
WHERE tinh_trang = 2
  AND ly_do_tu_choi IS NOT NULL;
```

---

## ✅ Definition of Done

API được coi là hoàn thành khi:

- [x] Migration chạy thành công
- [x] Duyệt suất chiếu → tạo SuatChieu + log
- [x] Từ chối suất chiếu → lưu lý do
- [x] Duyệt toàn tuần → tất cả được duyệt
- [x] Không thể duyệt/từ chối suất đã duyệt
- [x] Transaction hoạt động (rollback khi lỗi)
- [x] Frontend gọi API thành công
- [x] Toast notification hiển thị
- [x] Badge cập nhật theo trạng thái
- [x] Không có lỗi PHP
- [x] Không có lỗi JavaScript
- [x] Database integrity đảm bảo

---

**Người test:** ______________  
**Ngày test:** ______________  
**Kết quả:** ☐ Pass / ☐ Fail  
**Ghi chú:** ________________
