# API Top 10 Phim & Sản Phẩm - Thống Kê Toàn Rạp

## 1. API Top 10 Phim Có Doanh Thu Cao Nhất

### Endpoint
```
GET /api/thong-ke-toan-rap/top-10-phim
```

### Mô tả
API trả về danh sách 10 phim có doanh thu cao nhất trong khoảng thời gian chỉ định.

### Tham số (Query Parameters)

| Tham số | Kiểu | Bắt buộc | Mặc định | Mô tả |
|---------|------|----------|----------|-------|
| tuNgay | string | Không | Ngày đầu tháng | Ngày bắt đầu (format: Y-m-d) |
| denNgay | string | Không | Ngày cuối tháng | Ngày kết thúc (format: Y-m-d) |
| idRap | mixed | Không | 'all' | ID rạp cụ thể hoặc 'all' cho tất cả rạp |

### Ví dụ Request

```http
GET /api/thong-ke-toan-rap/top-10-phim?tuNgay=2025-09-01&denNgay=2025-09-30&idRap=all
```

### Response Success (200 OK)

```json
{
    "success": true,
    "data": {
        "danh_sach": [
            {
                "id_phim": 1,
                "ten_phim": "Avengers: Endgame",
                "hinh_anh": "https://example.com/avengers.jpg",
                "doanh_thu": 1250000000,
                "so_ve_ban": 25000
            },
            {
                "id_phim": 2,
                "ten_phim": "Spider-Man: No Way Home",
                "hinh_anh": "https://example.com/spiderman.jpg",
                "doanh_thu": 980000000,
                "so_ve_ban": 19600
            }
        ],
        "tong_so": 10
    }
}
```

### Cấu trúc dữ liệu danh_sach

| Field | Kiểu | Mô tả |
|-------|------|-------|
| id_phim | integer | ID của phim |
| ten_phim | string | Tên phim |
| hinh_anh | string | URL hình ảnh poster phim |
| doanh_thu | float | Tổng doanh thu từ vé (VNĐ) |
| so_ve_ban | integer | Tổng số vé đã bán |

---

## 2. API Top 10 Sản Phẩm F&B Có Doanh Thu Cao Nhất

### Endpoint
```
GET /api/thong-ke-toan-rap/top-10-san-pham
```

### Mô tả
API trả về danh sách 10 sản phẩm F&B có doanh thu cao nhất trong khoảng thời gian chỉ định.

### Tham số (Query Parameters)

| Tham số | Kiểu | Bắt buộc | Mặc định | Mô tả |
|---------|------|----------|----------|-------|
| tuNgay | string | Không | Ngày đầu tháng | Ngày bắt đầu (format: Y-m-d) |
| denNgay | string | Không | Ngày cuối tháng | Ngày kết thúc (format: Y-m-d) |
| idRap | mixed | Không | 'all' | ID rạp cụ thể hoặc 'all' cho tất cả rạp |

### Ví dụ Request

```http
GET /api/thong-ke-toan-rap/top-10-san-pham?tuNgay=2025-09-01&denNgay=2025-09-30&idRap=all
```

### Response Success (200 OK)

```json
{
    "success": true,
    "data": {
        "danh_sach": [
            {
                "id_san_pham": 1,
                "ten_san_pham": "Bắp rang bơ (lớn)",
                "hinh_anh": "https://example.com/popcorn.jpg",
                "doanh_thu": 1750000000,
                "so_luong_ban": 35000
            },
            {
                "id_san_pham": 2,
                "ten_san_pham": "Coca-Cola (vừa)",
                "hinh_anh": "https://example.com/coca.jpg",
                "doanh_thu": 980000000,
                "so_luong_ban": 28000
            }
        ],
        "tong_so": 10
    }
}
```

### Cấu trúc dữ liệu danh_sach

| Field | Kiểu | Mô tả |
|-------|------|-------|
| id_san_pham | integer | ID của sản phẩm |
| ten_san_pham | string | Tên sản phẩm |
| hinh_anh | string | URL hình ảnh sản phẩm |
| doanh_thu | float | Tổng doanh thu từ sản phẩm (VNĐ) |
| so_luong_ban | integer | Tổng số lượng đã bán |

---

## Response Error

### 400 Bad Request
```json
{
    "success": false,
    "message": "Tham số không hợp lệ"
}
```

### 401 Unauthorized
```json
{
    "success": false,
    "message": "Không có quyền truy cập"
}
```

### 500 Internal Server Error
```json
{
    "success": false,
    "message": "Lỗi hệ thống: [Chi tiết lỗi]"
}
```

---

## Lưu ý

1. **Phân quyền**: Chỉ tài khoản có role `Quản lý chuỗi rạp` mới được phép truy cập
2. **Sắp xếp**: Danh sách luôn được sắp xếp theo doanh thu giảm dần
3. **Giới hạn**: Chỉ trả về tối đa 10 bản ghi
4. **Doanh thu**:
   - API phim: Tính từ giá vé đã thanh toán
   - API sản phẩm: Tính từ số lượng × giá bán của đơn hàng đã thanh toán
5. **Filter rạp**: 
   - Dùng `idRap=all` để xem tất cả rạp
   - Dùng `idRap=123` để xem rạp cụ thể

---

## Ví dụ sử dụng

### JavaScript (Fetch API)

```javascript
// Top 10 phim
async function fetchTop10Films() {
    const params = new URLSearchParams({
        tuNgay: '2025-09-01',
        denNgay: '2025-09-30',
        idRap: 'all'
    });
    
    const response = await fetch(`/api/thong-ke-toan-rap/top-10-phim?${params}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    });
    
    const result = await response.json();
    if (result.success) {
        console.log('Top 10 phim:', result.data.danh_sach);
    }
}

// Top 10 sản phẩm
async function fetchTop10Products() {
    const params = new URLSearchParams({
        tuNgay: '2025-09-01',
        denNgay: '2025-09-30',
        idRap: 'all'
    });
    
    const response = await fetch(`/api/thong-ke-toan-rap/top-10-san-pham?${params}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    });
    
    const result = await response.json();
    if (result.success) {
        console.log('Top 10 sản phẩm:', result.data.danh_sach);
    }
}
```

### cURL

```bash
# Top 10 phim
curl -X GET "http://localhost/rapphim/api/thong-ke-toan-rap/top-10-phim?tuNgay=2025-09-01&denNgay=2025-09-30&idRap=all" \
  -H "Accept: application/json"

# Top 10 sản phẩm
curl -X GET "http://localhost/rapphim/api/thong-ke-toan-rap/top-10-san-pham?tuNgay=2025-09-01&denNgay=2025-09-30&idRap=all" \
  -H "Accept: application/json"
```
