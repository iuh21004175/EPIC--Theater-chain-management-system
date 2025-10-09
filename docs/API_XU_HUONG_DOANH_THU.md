# API Xu Hướng Doanh Thu Toàn Rạp

## Mô tả
API này cung cấp dữ liệu xu hướng doanh thu và vé bán theo thời gian cho toàn bộ chuỗi rạp hoặc một rạp cụ thể, phục vụ cho biểu đồ thống kê.

---

## 1. API Xu Hướng Doanh Thu

### Endpoint
```
GET /api/thong-ke-toan-rap/xu-huong-doanh-thu
```

### Mô tả
Lấy dữ liệu xu hướng doanh thu (vé + F&B) theo ngày/tuần/tháng

### Tham số (Query Parameters)

| Tham số | Kiểu | Bắt buộc | Mô tả | Ví dụ |
|---------|------|----------|-------|-------|
| `tuNgay` | string | Có | Ngày bắt đầu (Y-m-d) | `2024-09-01` |
| `denNgay` | string | Có | Ngày kết thúc (Y-m-d) | `2024-10-08` |
| `idRap` | mixed | Không | ID rạp hoặc 'all' cho tất cả | `all` hoặc `1` |
| `loaiXuHuong` | string | Không | Loại xu hướng: `daily`, `weekly`, `monthly` | `daily` |

### Request Example
```
GET /api/thong-ke-toan-rap/xu-huong-doanh-thu?tuNgay=2024-09-01&denNgay=2024-10-08&idRap=all&loaiXuHuong=daily
```

### Response Success (200 OK)

#### Xu hướng theo ngày (daily)
```json
{
  "success": true,
  "data": {
    "loai_xu_huong": "daily",
    "danh_sach_nhan": ["01/09", "02/09", "03/09", "04/09", "..."],
    "chi_tiet": [
      {
        "ngay": "2024-09-01",
        "ngay_hien_thi": "01/09",
        "doanh_thu_ve": 25000000,
        "doanh_thu_fnb": 8500000,
        "tong_doanh_thu": 33500000
      },
      {
        "ngay": "2024-09-02",
        "ngay_hien_thi": "02/09",
        "doanh_thu_ve": 32000000,
        "doanh_thu_fnb": 12000000,
        "tong_doanh_thu": 44000000
      }
    ]
  }
}
```

#### Xu hướng theo tuần (weekly)
```json
{
  "success": true,
  "data": {
    "loai_xu_huong": "weekly",
    "danh_sach_nhan": ["Tuần 1", "Tuần 2", "Tuần 3", "..."],
    "chi_tiet": [
      {
        "tuan": 1,
        "tu_ngay": "01/09",
        "den_ngay": "07/09",
        "ngay_hien_thi": "01/09 - 07/09",
        "doanh_thu_ve": 180000000,
        "doanh_thu_fnb": 65000000,
        "tong_doanh_thu": 245000000
      },
      {
        "tuan": 2,
        "tu_ngay": "08/09",
        "den_ngay": "14/09",
        "ngay_hien_thi": "08/09 - 14/09",
        "doanh_thu_ve": 195000000,
        "doanh_thu_fnb": 72000000,
        "tong_doanh_thu": 267000000
      }
    ]
  }
}
```

#### Xu hướng theo tháng (monthly)
```json
{
  "success": true,
  "data": {
    "loai_xu_huong": "monthly",
    "danh_sach_nhan": ["09/2024", "10/2024"],
    "chi_tiet": [
      {
        "thang": "09",
        "nam": "2024",
        "ngay_hien_thi": "09/2024",
        "doanh_thu_ve": 750000000,
        "doanh_thu_fnb": 280000000,
        "tong_doanh_thu": 1030000000
      },
      {
        "thang": "10",
        "nam": "2024",
        "ngay_hien_thi": "10/2024",
        "doanh_thu_ve": 820000000,
        "doanh_thu_fnb": 310000000,
        "tong_doanh_thu": 1130000000
      }
    ]
  }
}
```

### Response Error (4xx/5xx)
```json
{
  "success": false,
  "message": "Thông báo lỗi chi tiết"
}
```

---

## 2. API Xu Hướng Vé Bán

### Endpoint
```
GET /api/thong-ke-toan-rap/xu-huong-ve-ban
```

### Mô tả
Lấy dữ liệu xu hướng số vé bán ra theo ngày/tuần/tháng

### Tham số (Query Parameters)

| Tham số | Kiểu | Bắt buộc | Mô tả | Ví dụ |
|---------|------|----------|-------|-------|
| `tuNgay` | string | Có | Ngày bắt đầu (Y-m-d) | `2024-09-01` |
| `denNgay` | string | Có | Ngày kết thúc (Y-m-d) | `2024-10-08` |
| `idRap` | mixed | Không | ID rạp hoặc 'all' cho tất cả | `all` hoặc `1` |
| `loaiXuHuong` | string | Không | Loại xu hướng: `daily`, `weekly`, `monthly` | `daily` |

### Request Example
```
GET /api/thong-ke-toan-rap/xu-huong-ve-ban?tuNgay=2024-09-01&denNgay=2024-10-08&idRap=all&loaiXuHuong=daily
```

### Response Success (200 OK)

#### Xu hướng theo ngày (daily)
```json
{
  "success": true,
  "data": {
    "loai_xu_huong": "daily",
    "danh_sach_nhan": ["01/09", "02/09", "03/09", "..."],
    "chi_tiet": [
      {
        "ngay": "2024-09-01",
        "ngay_hien_thi": "01/09",
        "so_ve_ban": 450
      },
      {
        "ngay": "2024-09-02",
        "ngay_hien_thi": "02/09",
        "so_ve_ban": 620
      }
    ]
  }
}
```

#### Xu hướng theo tuần (weekly)
```json
{
  "success": true,
  "data": {
    "loai_xu_huong": "weekly",
    "danh_sach_nhan": ["Tuần 1", "Tuần 2", "..."],
    "chi_tiet": [
      {
        "tuan": 1,
        "tu_ngay": "01/09",
        "den_ngay": "07/09",
        "ngay_hien_thi": "01/09 - 07/09",
        "so_ve_ban": 3250
      },
      {
        "tuan": 2,
        "tu_ngay": "08/09",
        "den_ngay": "14/09",
        "ngay_hien_thi": "08/09 - 14/09",
        "so_ve_ban": 3580
      }
    ]
  }
}
```

#### Xu hướng theo tháng (monthly)
```json
{
  "success": true,
  "data": {
    "loai_xu_huong": "monthly",
    "danh_sach_nhan": ["09/2024", "10/2024"],
    "chi_tiet": [
      {
        "thang": "09",
        "nam": "2024",
        "ngay_hien_thi": "09/2024",
        "so_ve_ban": 14250
      },
      {
        "thang": "10",
        "nam": "2024",
        "ngay_hien_thi": "10/2024",
        "so_ve_ban": 15680
      }
    ]
  }
}
```

---

## Cách sử dụng trong Frontend

### 1. Lấy dữ liệu xu hướng doanh thu theo ngày
```javascript
const response = await fetch('/api/thong-ke-toan-rap/xu-huong-doanh-thu?tuNgay=2024-09-01&denNgay=2024-10-08&idRap=all&loaiXuHuong=daily');
const result = await response.json();

if (result.success) {
  const categories = result.data.danh_sach_nhan;
  const revenueData = result.data.chi_tiet.map(item => item.tong_doanh_thu);
  
  // Cập nhật biểu đồ ApexCharts
  chart.updateOptions({
    xaxis: { categories: categories }
  });
  chart.updateSeries([{
    name: 'Doanh thu',
    data: revenueData
  }]);
}
```

### 2. Lấy dữ liệu xu hướng theo tuần
```javascript
const response = await fetch('/api/thong-ke-toan-rap/xu-huong-doanh-thu?tuNgay=2024-09-01&denNgay=2024-10-08&idRap=all&loaiXuHuong=weekly');
// Xử lý tương tự
```

### 3. Lấy dữ liệu vé bán theo tháng
```javascript
const response = await fetch('/api/thong-ke-toan-rap/xu-huong-ve-ban?tuNgay=2024-01-01&denNgay=2024-12-31&idRap=1&loaiXuHuong=monthly');
// Xử lý tương tự
```

---

## Lưu ý

1. **Định dạng ngày**: Phải theo chuẩn `Y-m-d` (ví dụ: `2024-09-01`)
2. **idRap**: 
   - Sử dụng `all` để lấy dữ liệu toàn chuỗi rạp
   - Sử dụng ID cụ thể (số) để lấy dữ liệu của một rạp
3. **loaiXuHuong**: 
   - `daily`: Hiển thị theo từng ngày (phù hợp với khoảng thời gian ngắn)
   - `weekly`: Hiển thị theo tuần (phù hợp với khoảng 1-3 tháng)
   - `monthly`: Hiển thị theo tháng (phù hợp với khoảng >= 3 tháng)
4. **Quyền truy cập**: Chỉ dành cho `Quản lý chuỗi rạp`

---

## Error Codes

| Code | Message | Mô tả |
|------|---------|-------|
| 400 | Bad Request | Thiếu tham số bắt buộc hoặc định dạng sai |
| 401 | Unauthorized | Chưa đăng nhập |
| 403 | Forbidden | Không có quyền truy cập |
| 500 | Internal Server Error | Lỗi server |
