# API Tỉ lệ doanh thu F&B trên mỗi đơn hàng

## Mô tả
API này trả về dữ liệu để hiển thị biểu đồ cột thể hiện **doanh thu F&B trung bình trên mỗi đơn hàng** theo từng ngày trong khoảng thời gian được chọn.

## Endpoint
```
GET /rapphim/api/thong-ke-toan-rap/ti-le-doanh-thu-fnb-tren-don-hang
```

## Quyền truy cập
- **Quản lý chuỗi rạp**

## Tham số (Query Parameters)

| Tham số | Kiểu | Bắt buộc | Mô tả | Mặc định |
|---------|------|----------|-------|----------|
| `tuNgay` | string | Không | Ngày bắt đầu (format: YYYY-MM-DD) | Ngày đầu tháng hiện tại |
| `denNgay` | string | Không | Ngày kết thúc (format: YYYY-MM-DD) | Ngày cuối tháng hiện tại |
| `idRap` | mixed | Không | ID của rạp cụ thể hoặc 'all' cho tất cả rạp | 'all' |

## Ví dụ Request

### Tất cả rạp trong tháng hiện tại
```http
GET /rapphim/api/thong-ke-toan-rap/ti-le-doanh-thu-fnb-tren-don-hang
```

### Rạp cụ thể với khoảng thời gian tùy chỉnh
```http
GET /rapphim/api/thong-ke-toan-rap/ti-le-doanh-thu-fnb-tren-don-hang?tuNgay=2025-09-08&denNgay=2025-10-08&idRap=3
```

## Response

### Thành công (200 OK)
```json
{
  "success": true,
  "data": {
    "danh_sach": [
      {
        "ngay": "8/9",
        "ngay_day_du": "2025-09-08",
        "tong_doanh_thu_fnb": 2750000,
        "so_don_hang": 85,
        "trung_binh_fnb_tren_don_hang": 32353
      },
      {
        "ngay": "9/9",
        "ngay_day_du": "2025-09-09",
        "tong_doanh_thu_fnb": 3120000,
        "so_don_hang": 92,
        "trung_binh_fnb_tren_don_hang": 33913
      },
      {
        "ngay": "10/9",
        "ngay_day_du": "2025-09-10",
        "tong_doanh_thu_fnb": 2890000,
        "so_don_hang": 78,
        "trung_binh_fnb_tren_don_hang": 37051
      }
    ],
    "thoi_gian": {
      "tu_ngay": "2025-09-08",
      "den_ngay": "2025-10-08"
    }
  }
}
```

### Lỗi (400/500)
```json
{
  "success": false,
  "message": "Chi tiết lỗi"
}
```

## Cấu trúc dữ liệu Response

### `danh_sach` (array)
Mảng chứa dữ liệu theo từng ngày trong khoảng thời gian

| Field | Kiểu | Mô tả |
|-------|------|-------|
| `ngay` | string | Ngày hiển thị (format: d/m) |
| `ngay_day_du` | string | Ngày đầy đủ (format: Y-m-d) |
| `tong_doanh_thu_fnb` | float | Tổng doanh thu F&B trong ngày (VNĐ) |
| `so_don_hang` | int | Số đơn hàng có mua F&B trong ngày |
| `trung_binh_fnb_tren_don_hang` | float | Doanh thu F&B trung bình trên mỗi đơn hàng (VNĐ) |

### `thoi_gian` (object)
Thông tin về khoảng thời gian được query

| Field | Kiểu | Mô tả |
|-------|------|-------|
| `tu_ngay` | string | Ngày bắt đầu (Y-m-d) |
| `den_ngay` | string | Ngày kết thúc (Y-m-d) |

## Logic tính toán

### Công thức
```
Trung bình F&B trên đơn hàng = Tổng doanh thu F&B / Số đơn hàng
```

### Quy tắc
1. **Chỉ tính đơn hàng đã thanh toán**: `donhang.trang_thai = 2`
2. **Tính tất cả sản phẩm F&B** trong `chitiet_donhang`
3. **Doanh thu F&B** = SUM(số lượng × đơn giá) của tất cả sản phẩm
4. **Số đơn hàng** = COUNT(DISTINCT donhang.id) có chứa sản phẩm F&B
5. Nếu không có đơn hàng nào trong ngày → trung_binh = 0

## Biểu đồ Frontend

### Loại biểu đồ
- **Bar Chart (Biểu đồ cột)** - ApexCharts

### Cấu hình
```javascript
{
  series: [{
    name: 'F&B/Đơn hàng',
    data: [32353, 33913, 37051, ...]
  }],
  chart: {
    type: 'bar',
    height: 350
  },
  colors: ['#F59E0B'],
  xaxis: {
    categories: ['8/9', '9/9', '10/9', ...]
  },
  yaxis: {
    title: { text: 'VNĐ/đơn hàng' }
  }
}
```

### Màu sắc
- **Cột**: `#F59E0B` (Amber 500)

## Database Schema

### Bảng liên quan
1. **donhang**
   - `id` (PK)
   - `ngay_dat` (datetime)
   - `trang_thai` (int: 2 = Đã thanh toán)
   - `tong_tien` (decimal)

2. **chitiet_donhang**
   - `id` (PK)
   - `donhang_id` (FK → donhang.id)
   - `sanpham_id` (FK → san_pham.id)
   - `so_luong` (int)
   - `don_gia` (decimal)

3. **san_pham**
   - `id` (PK)
   - `ten` (varchar)
   - `id_rapphim` (FK → rapphim.id)

### Query SQL (Tóm tắt)
```sql
SELECT 
    DATE(donhang.ngay_dat) as ngay,
    SUM(chitiet_donhang.so_luong * chitiet_donhang.don_gia) as tong_doanh_thu_fnb,
    COUNT(DISTINCT donhang.id) as so_don_hang
FROM chitiet_donhang
INNER JOIN donhang ON chitiet_donhang.donhang_id = donhang.id
INNER JOIN san_pham ON chitiet_donhang.sanpham_id = san_pham.id
WHERE donhang.ngay_dat BETWEEN ? AND ?
  AND donhang.trang_thai = 2
  [AND san_pham.id_rapphim = ?]  -- Nếu filter theo rạp
GROUP BY DATE(donhang.ngay_dat)
ORDER BY ngay ASC
```

## Use Case

### Mục đích
1. **Phân tích hiệu quả bán hàng F&B**: Xem khách hàng chi tiêu bao nhiêu tiền cho F&B mỗi lần mua
2. **Theo dõi xu hướng**: Xác định ngày nào khách hàng chi tiêu nhiều hơn cho F&B
3. **Đánh giá chiến lược**: Kiểm tra hiệu quả của các chương trình khuyến mãi combo
4. **So sánh giữa các rạp**: Xem rạp nào có doanh thu F&B trên đơn hàng cao hơn

### Ví dụ thực tế
- **Ngày thường**: 25.000 - 30.000 VNĐ/đơn hàng
- **Cuối tuần**: 35.000 - 40.000 VNĐ/đơn hàng (cao hơn do combo gia đình)
- **Ngày lễ**: 40.000 - 50.000 VNĐ/đơn hàng (cao nhất)

## Notes

### Performance
- API xử lý từng ngày riêng biệt nên phù hợp với khoảng thời gian ≤ 31 ngày
- Với khoảng thời gian dài hơn, cân nhắc thêm tham số `loai_xuat_hien` (daily/weekly)

### Edge Cases
1. **Không có đơn hàng**: Trả về `trung_binh_fnb_tren_don_hang = 0`
2. **Đơn hàng không có F&B**: Không tính vào số liệu (chỉ tính đơn có mua F&B)
3. **Múi giờ**: Sử dụng `ngay_dat` để xác định ngày (không phải created_at)

## Testing

### Test Cases
1. **Tất cả rạp, tháng hiện tại** - Kiểm tra logic mặc định
2. **Rạp cụ thể, khoảng 7 ngày** - Kiểm tra filter theo rạp
3. **Khoảng thời gian không có dữ liệu** - Kiểm tra xử lý empty data
4. **Ngày đầu/cuối tháng** - Kiểm tra boundary conditions

### Sample Request để test
```bash
curl -X GET "http://localhost/rapphim/api/thong-ke-toan-rap/ti-le-doanh-thu-fnb-tren-don-hang?tuNgay=2025-09-08&denNgay=2025-10-08&idRap=all" \
  -H "Cookie: session_id=xxx"
```

## Changelog

### Version 1.0.0 (2025-10-08)
- ✅ Tạo API endpoint mới
- ✅ Tích hợp với frontend (ApexCharts)
- ✅ Hỗ trợ filter theo rạp và thời gian
- ✅ Tính toán trung bình F&B trên đơn hàng chính xác
