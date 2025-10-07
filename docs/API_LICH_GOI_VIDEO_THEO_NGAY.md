# API Lấy Lịch Gọi Video Theo Ngày

## Thông tin chung

API này cho phép khách hàng lấy danh sách các lịch gọi video tư vấn đã đặt theo ngày cụ thể.

---

## Endpoint

```
GET /api/lich-goi-video-theo-ngay
```

**Base URL:** `http://localhost/rapphim`

**Full URL:** `http://localhost/rapphim/api/lich-goi-video-theo-ngay?ngay=2025-10-07`

---

## Yêu cầu

### Query Parameters

| Tham số | Kiểu | Bắt buộc | Mô tả | Ví dụ |
|---------|------|----------|-------|-------|
| `ngay` | string | ✅ Có | Ngày cần lấy lịch (format: YYYY-MM-DD) | `2025-10-07` |

### Authentication

- **Required:** ✅ Có
- **Method:** Session-based (khách hàng phải đăng nhập)
- **Session key:** `$_SESSION['user']['id']`

### Headers

```
Content-Type: application/json
Cookie: PHPSESSID=...
```

---

## Response

### Success Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "gio": "09:00",
      "ten_rap": "EPIC Nguyễn Văn Cừ",
      "noi_dung": "Tư vấn về chương trình khuyến mãi",
      "mo_ta": "Muốn hỏi chi tiết về các chương trình ưu đãi tháng 10",
      "trang_thai": "Chờ xác nhận",
      "trang_thai_code": 1,
      "nhan_vien": null,
      "room_id": null,
      "thoi_gian_dat": "2025-10-07 09:00:00",
      "thoi_gian_bat_dau": null,
      "thoi_gian_ket_thuc": null
    },
    {
      "id": 2,
      "gio": "14:30",
      "ten_rap": "EPIC Võ Văn Ngân",
      "noi_dung": "Tư vấn về vé VIP",
      "mo_ta": "Hỏi về quyền lợi thành viên VIP",
      "trang_thai": "Đã xác nhận",
      "trang_thai_code": 2,
      "nhan_vien": "Nguyễn Văn A",
      "room_id": "video_2_1728298765",
      "thoi_gian_dat": "2025-10-07 14:30:00",
      "thoi_gian_bat_dau": null,
      "thoi_gian_ket_thuc": null
    }
  ]
}
```

### Error Responses

#### 400 Bad Request - Thiếu tham số ngày

```json
{
  "success": false,
  "message": "Thiếu tham số ngày (format: YYYY-MM-DD)"
}
```

#### 400 Bad Request - Định dạng ngày không hợp lệ

```json
{
  "success": false,
  "message": "Định dạng ngày không hợp lệ. Vui lòng sử dụng YYYY-MM-DD"
}
```

#### 401 Unauthorized - Chưa đăng nhập

```json
{
  "success": false,
  "message": "Vui lòng đăng nhập để tiếp tục"
}
```

---

## Response Fields

### Data Object Fields

| Field | Kiểu | Mô tả |
|-------|------|-------|
| `id` | integer | ID của lịch gọi video |
| `gio` | string | Giờ đặt lịch (format: HH:MM) |
| `ten_rap` | string | Tên rạp chiếu phim |
| `noi_dung` | string | Chủ đề tư vấn |
| `mo_ta` | string | Mô tả chi tiết nội dung tư vấn |
| `trang_thai` | string | Trạng thái dạng text (Chờ xác nhận, Đã xác nhận, Đang gọi, Hoàn thành, Đã hủy) |
| `trang_thai_code` | integer | Mã trạng thái (1-5) |
| `nhan_vien` | string\|null | Tên nhân viên tư vấn (nếu đã có) |
| `room_id` | string\|null | ID phòng gọi video (nếu đã được xác nhận) |
| `thoi_gian_dat` | datetime | Thời gian đặt lịch (YYYY-MM-DD HH:MM:SS) |
| `thoi_gian_bat_dau` | datetime\|null | Thời gian bắt đầu cuộc gọi |
| `thoi_gian_ket_thuc` | datetime\|null | Thời gian kết thúc cuộc gọi |

### Trạng thái (trang_thai_code)

| Code | Tên | Mô tả |
|------|-----|-------|
| 1 | Chờ xác nhận | Lịch đang chờ nhân viên nhận |
| 2 | Đã xác nhận | Đã có nhân viên nhận tư vấn |
| 3 | Đang gọi | Cuộc gọi đang diễn ra |
| 4 | Hoàn thành | Cuộc gọi đã hoàn thành |
| 5 | Đã hủy | Lịch đã bị hủy |

---

## Business Logic

### Service Layer (`Sc_GoiVideo::khachHangLayLichTheoNgay`)

1. **Xác thực người dùng:**
   - Lấy `id_khachhang` từ session: `$_SESSION['user']['id']`
   - Chỉ trả về lịch của khách hàng đang đăng nhập

2. **Validate ngày:**
   - Kiểm tra format ngày phải đúng YYYY-MM-DD
   - Sử dụng `DateTime::createFromFormat()` để validate

3. **Truy vấn database:**
   - Lọc theo `id_khachhang` và ngày trong `thoi_gian_dat`
   - Eager load relationships: `rapphim`, `nhanvien`
   - Sắp xếp theo `thoi_gian_dat` tăng dần

4. **Format dữ liệu:**
   - Chuyển trạng thái code sang text hiển thị
   - Trích xuất giờ từ `thoi_gian_dat`
   - Bỏ các trường không cần thiết

---

## Ví dụ sử dụng

### JavaScript (Fetch API)

```javascript
const baseUrl = 'http://localhost/rapphim';
const ngay = '2025-10-07';

fetch(`${baseUrl}/api/lich-goi-video-theo-ngay?ngay=${ngay}`)
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            console.log('Danh sách lịch:', data.data);
            // Hiển thị danh sách lịch
            renderScheduledVideoCalls(data.data);
        } else {
            console.error('Lỗi:', data.message);
        }
    })
    .catch(error => {
        console.error('Network error:', error);
    });
```

### cURL

```bash
curl -X GET \
  'http://localhost/rapphim/api/lich-goi-video-theo-ngay?ngay=2025-10-07' \
  -H 'Cookie: PHPSESSID=your_session_id' \
  -H 'Content-Type: application/json'
```

### PHP

```php
<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost/rapphim/api/lich-goi-video-theo-ngay?ngay=2025-10-07');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_COOKIE, 'PHPSESSID=' . session_id());

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
if ($data['success']) {
    print_r($data['data']);
}
?>
```

---

## Database Schema

### Bảng: `lich_goi_video`

```sql
CREATE TABLE IF NOT EXISTS lich_goi_video (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_khachhang INT NOT NULL,
    id_rapphim INT NOT NULL,
    id_nhanvien INT,
    chu_de VARCHAR(255) NOT NULL,
    mo_ta TEXT,
    thoi_gian_dat DATETIME NOT NULL,
    room_id VARCHAR(100),
    trang_thai TINYINT NOT NULL DEFAULT 1,
    thoi_gian_bat_dau DATETIME,
    thoi_gian_ket_thuc DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_khachhang) REFERENCES khach_hang(id),
    FOREIGN KEY (id_rapphim) REFERENCES rap_phim(id),
    FOREIGN KEY (id_nhanvien) REFERENCES nguoi_dung_internal(id)
);
```

---

## Testing

### Test Case 1: Lấy lịch ngày có dữ liệu

**Request:**
```
GET /api/lich-goi-video-theo-ngay?ngay=2025-10-07
```

**Expected:**
- Status: 200 OK
- Response: Mảng các lịch gọi video của khách hàng trong ngày 2025-10-07

### Test Case 2: Lấy lịch ngày không có dữ liệu

**Request:**
```
GET /api/lich-goi-video-theo-ngay?ngay=2025-12-31
```

**Expected:**
- Status: 200 OK
- Response: Mảng rỗng `[]`

### Test Case 3: Thiếu tham số ngày

**Request:**
```
GET /api/lich-goi-video-theo-ngay
```

**Expected:**
- Status: 400 Bad Request
- Message: "Thiếu tham số ngày (format: YYYY-MM-DD)"

### Test Case 4: Format ngày sai

**Request:**
```
GET /api/lich-goi-video-theo-ngay?ngay=07-10-2025
```

**Expected:**
- Status: 400 Bad Request
- Message: "Định dạng ngày không hợp lệ. Vui lòng sử dụng YYYY-MM-DD"

### Test Case 5: Chưa đăng nhập

**Request:**
```
GET /api/lich-goi-video-theo-ngay?ngay=2025-10-07
(Không có session)
```

**Expected:**
- Status: 401 Unauthorized
- Redirect to login page hoặc error message

---

## Files Modified

### 1. Service Layer
**File:** `src/Services/Sc_GoiVideo.php`
- Thêm method: `khachHangLayLichTheoNgay($ngay)`

### 2. Controller Layer
**File:** `src/Controllers/Ctrl_GoiVideo.php`
- Thêm method: `khachHangLayLichTheoNgay()`

### 3. Routes
**File:** `routes/apiv1.php`
- Thêm route: `GET /lich-goi-video-theo-ngay`

### 4. Frontend
**File:** `customer/js/dat-lich-goi-video.js`
- Đã sử dụng API endpoint mới trong function `fetchVideoCallsByDate()`

---

## Security Notes

1. **Authentication:** API yêu cầu khách hàng đăng nhập
2. **Authorization:** Chỉ trả về lịch của khách hàng đang đăng nhập
3. **Input Validation:** Validate format ngày để tránh SQL injection
4. **XSS Prevention:** Sanitize output khi hiển thị trên frontend

---

## Performance

- **Cache:** Có thể cache kết quả theo ngày với TTL ngắn (5-10 phút)
- **Index:** Đảm bảo có index trên `(id_khachhang, thoi_gian_dat)`
- **Pagination:** Không cần thiết vì số lượng lịch trong 1 ngày thường ít

---

## Future Enhancements

1. ✅ Thêm filter theo trạng thái: `?trang_thai=1,2`
2. ✅ Thêm sort options: `?sort=asc|desc`
3. ✅ Thêm range query: `?tu_ngay=2025-10-01&den_ngay=2025-10-07`
4. ✅ Thêm pagination cho nhiều kết quả
5. ✅ Real-time updates qua WebSocket khi trạng thái thay đổi

---

**Phiên bản:** 1.0  
**Ngày tạo:** 2025-10-07  
**Tác giả:** Dev Team
