# Test API Hiệu Suất Theo Rạp

## API Endpoint
```
GET /api/thong-ke-toan-rap/hieu-suat-theo-rap
```

## Full URL
```
http://localhost/rapphim/api/thong-ke-toan-rap/hieu-suat-theo-rap?tuNgay=2025-09-08&denNgay=2025-10-08&idRap=all
```

## Test Steps

### 1. Test trực tiếp trong Browser
Mở URL sau trong browser:
```
http://localhost/rapphim/api/thong-ke-toan-rap/hieu-suat-theo-rap?tuNgay=2025-09-08&denNgay=2025-10-08&idRap=all
```

### 2. Test với Postman/Thunder Client
- Method: GET
- URL: `http://localhost/rapphim/api/thong-ke-toan-rap/hieu-suat-theo-rap`
- Query Params:
  - tuNgay: 2025-09-08
  - denNgay: 2025-10-08
  - idRap: all

### 3. Expected Response
```json
{
  "success": true,
  "data": {
    "danh_sach_rap": [
      {
        "id_rap": 1,
        "ten_rap": "EPIC Hà Nội",
        "doanh_thu": 2250000000,
        "so_don_hang": 1500,
        "so_khach_hang": 1200,
        "phan_tram_dong_gop": 35.5
      },
      {
        "id_rap": 2,
        "ten_rap": "EPIC Hồ Chí Minh",
        "doanh_thu": 1850000000,
        "so_don_hang": 1300,
        "so_khach_hang": 1000,
        "phan_tram_dong_gop": 29.2
      }
    ],
    "tong_doanh_thu": 6330000000,
    "so_rap": 4,
    "thoi_gian": {
      "tu_ngay": "2025-09-08",
      "den_ngay": "2025-10-08"
    }
  }
}
```

## Troubleshooting

### Nếu gặp lỗi 404:
1. Kiểm tra file `.htaccess` trong thư mục `api/`
2. Đảm bảo URL có prefix `/rapphim/api/`
3. Kiểm tra route được định nghĩa trong `routes/apiv1.php` line ~103

### Nếu gặp lỗi 500:
1. Kiểm tra log PHP error
2. Kiểm tra database connection
3. Kiểm tra các model: DonHang, SuatChieu, PhongChieu, RapPhim

### Nếu gặp lỗi SQL:
1. Kiểm tra tên bảng trong database:
   - `donhang`
   - `suatchieu`
   - `phongchieu`
   - `rapphim`
2. Kiểm tra foreign key relationships

## JavaScript Integration

Trong file `thong-ke-toan-rap.js`, API được gọi như sau:

```javascript
const baseUrl = document.getElementById('btn-apply-filter')?.dataset.url || '';
// baseUrl = 'http://localhost/rapphim'

const apiUrl = `${baseUrl}/api/thong-ke-toan-rap/hieu-suat-theo-rap?${params}`;
// apiUrl = 'http://localhost/rapphim/api/thong-ke-toan-rap/hieu-suat-theo-rap?tuNgay=...'
```

## Verification Checklist
- [ ] Route được định nghĩa trong `routes/apiv1.php`
- [ ] Controller method `hieuSuatTheoRapToanRap()` tồn tại trong `Ctrl_ThongKe`
- [ ] Service method `hieuSuatTheoRap()` tồn tại trong `Sc_ThongKe`
- [ ] Database có dữ liệu mẫu trong các bảng liên quan
- [ ] `.env` có cấu hình `URL_WEB_BASE=http://localhost/rapphim`
- [ ] HTML có attribute `data-url` trong button `btn-apply-filter`
- [ ] JavaScript đã được cập nhật và browser cache đã clear
