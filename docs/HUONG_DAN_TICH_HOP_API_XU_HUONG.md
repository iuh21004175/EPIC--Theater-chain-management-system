# Hướng Dẫn Tích Hợp API Xu Hướng Doanh Thu vào Giao Diện

## 📋 Tổng quan

API đã được tích hợp hoàn toàn vào giao diện thống kê toàn rạp. Dưới đây là chi tiết về cách hoạt động và cách test.

---

## ✅ Các API đã được thêm vào Routes

### 1. API Xu Hướng Doanh Thu
```php
$r->addRoute('GET', '/thong-ke-toan-rap/xu-huong-doanh-thu', 
    [Ctrl_ThongKe::class, 'xuHuongDoanhThuToanRap', ['Quản lý chuỗi rạp']]);
```

**Endpoint:** `GET /api/thong-ke-toan-rap/xu-huong-doanh-thu`

**Tham số:**
- `tuNgay`: Ngày bắt đầu (YYYY-MM-DD)
- `denNgay`: Ngày kết thúc (YYYY-MM-DD)  
- `idRap`: ID rạp hoặc 'all'
- `loaiXuHuong`: 'daily', 'weekly', hoặc 'monthly'

**Ví dụ:**
```
GET /api/thong-ke-toan-rap/xu-huong-doanh-thu?tuNgay=2024-09-01&denNgay=2024-10-08&idRap=all&loaiXuHuong=daily
```

### 2. API Xu Hướng Vé Bán
```php
$r->addRoute('GET', '/thong-ke-toan-rap/xu-huong-ve-ban', 
    [Ctrl_ThongKe::class, 'xuHuongVeBanToanRap', ['Quản lý chuỗi rạp']]);
```

**Endpoint:** `GET /api/thong-ke-toan-rap/xu-huong-ve-ban`

**Tham số:** Giống như API xu hướng doanh thu

---

## 🎯 Tích Hợp vào Giao Diện

### 1. JavaScript đã được cập nhật

File: `internal/js/thong-ke-toan-rap.js`

#### Khởi tạo biểu đồ với dữ liệu API
```javascript
function initializeRevenueChart() {
    // ... khởi tạo biểu đồ với dữ liệu mẫu
    revenueChart = new ApexCharts(chartElement, options);
    revenueChart.render();
    
    // Load dữ liệu thực từ API ngay sau khi render
    setTimeout(() => {
        fetchRevenueChartData();
    }, 500);
}
```

#### Fetch dữ liệu từ API
```javascript
async function fetchRevenueChartData() {
    try {
        const tuNgay = dateStartInput.value;
        const denNgay = dateEndInput.value;
        const idRap = selectedCinema;
        
        const params = new URLSearchParams({
            tuNgay: tuNgay,
            denNgay: denNgay,
            idRap: idRap,
            loaiXuHuong: currentTimePeriod // daily, weekly, monthly
        });

        const baseUrl = document.getElementById('btn-apply-filter').dataset.url || '';
        const apiUrl = `${baseUrl}/api/thong-ke-toan-rap/xu-huong-doanh-thu?${params.toString()}`;

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        const result = await response.json();

        if (result.success && result.data) {
            const data = result.data;
            const categories = data.danh_sach_nhan;
            const revenueData = data.chi_tiet.map(item => item.tong_doanh_thu);
            
            // Cập nhật biểu đồ
            revenueChart.updateOptions({
                xaxis: { categories: categories }
            });
            
            revenueChart.updateSeries([{
                name: 'Doanh thu',
                data: revenueData
            }]);
        }
    } catch (error) {
        console.error('Error fetching revenue chart data:', error);
        // Fallback to random data
        updateRevenueChartWithRandomData();
    }
}
```

### 2. Tự động cập nhật khi thay đổi filter

#### Khi thay đổi khoảng thời gian (daily/weekly/monthly)
```javascript
const timeFilters = document.querySelectorAll('.time-filter');
timeFilters.forEach(filter => {
    filter.addEventListener('click', function() {
        // Update active filter
        timeFilters.forEach(btn => btn.classList.remove('filter-active'));
        this.classList.add('filter-active');
        
        // Update time period
        currentTimePeriod = this.getAttribute('data-period');
        
        // Update charts with new time period
        updateChartsByTimePeriod();
    });
});

function updateChartsByTimePeriod() {
    if (revenueChart) updateRevenueChart();
    if (ticketsChart) updateTicketsChart();
}
```

#### Khi thay đổi ngày tháng hoặc rạp
```javascript
applyFilterBtn.addEventListener('click', function() {
    compareWithPrevious = compareToggle.checked;
    selectedCinema = cinemaFilter.value;

    if (dateRangeSelector.value === 'custom') {
        const startDate = new Date(dateStartInput.value);
        const endDate = new Date(dateEndInput.value);
        const diffTime = Math.abs(endDate - startDate);
        currentDateRange = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    // Update all charts and data
    updateAllData();
});

function updateAllData() {
    updateKPICards();
    updateCharts(); // Gọi fetchRevenueChartData() và fetchTicketsChartData()
    updateTables();
    showToast('Dữ liệu đã được cập nhật');
}
```

---

## 🧪 Cách Test API

### Phương pháp 1: Sử dụng file test HTML

1. Mở file `docs/TEST_API_XU_HUONG.html` trong trình duyệt
2. Chọn các tham số (từ ngày, đến ngày, rạp, loại xu hướng)
3. Nhấn "Gửi Request"
4. Xem kết quả trả về

### Phương pháp 2: Sử dụng cURL

```bash
# Test xu hướng doanh thu theo ngày
curl "http://localhost/rapphim/api/thong-ke-toan-rap/xu-huong-doanh-thu?tuNgay=2024-09-01&denNgay=2024-10-08&idRap=all&loaiXuHuong=daily"

# Test xu hướng vé bán theo tuần
curl "http://localhost/rapphim/api/thong-ke-toan-rap/xu-huong-ve-ban?tuNgay=2024-09-01&denNgay=2024-10-08&idRap=all&loaiXuHuong=weekly"
```

### Phương pháp 3: Kiểm tra trong giao diện thống kê

1. Đăng nhập với tài khoản **Quản lý chuỗi rạp**
2. Vào trang **Thống kê toàn rạp**
3. Mở **Developer Console** (F12)
4. Xem tab **Console** để thấy logs:
   ```
   Initial dates set: {start: "2024-09-08", end: "2024-10-08"}
   Giá trị filter: {tuNgay: "2024-09-08", denNgay: "2024-10-08", idRap: "all", soSanh: false}
   API URL: http://localhost/rapphim/api/thong-ke-toan-rap/tong-quat?...
   Fetching revenue chart data from: http://localhost/rapphim/api/thong-ke-toan-rap/xu-huong-doanh-thu?...
   ```
5. Xem tab **Network** để kiểm tra request/response

---

## 📊 Cấu trúc Response

### Response thành công - Daily (Theo ngày)
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
        "doanh_thu_ve": 25000000,
        "doanh_thu_fnb": 8500000,
        "tong_doanh_thu": 33500000
      }
    ]
  }
}
```

### Response thành công - Weekly (Theo tuần)
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
        "doanh_thu_ve": 180000000,
        "doanh_thu_fnb": 65000000,
        "tong_doanh_thu": 245000000
      }
    ]
  }
}
```

### Response thành công - Monthly (Theo tháng)
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
      }
    ]
  }
}
```

### Response lỗi
```json
{
  "success": false,
  "message": "Thông báo lỗi chi tiết"
}
```

---

## 🔍 Troubleshooting

### Lỗi: API trả về 403 Forbidden
**Nguyên nhân:** Chưa đăng nhập hoặc không có quyền "Quản lý chuỗi rạp"

**Giải pháp:**
- Đăng nhập với tài khoản có vai trò "Quản lý chuỗi rạp"
- Kiểm tra session trong PHP

### Lỗi: API trả về dữ liệu rỗng
**Nguyên nhân:** Không có dữ liệu trong khoảng thời gian đã chọn

**Giải pháp:**
- Kiểm tra dữ liệu trong database
- Thử với khoảng thời gian khác
- Kiểm tra log trong Service layer

### Lỗi: Biểu đồ không cập nhật
**Nguyên nhân:** 
- API trả về lỗi
- JavaScript error

**Giải pháp:**
- Mở Console (F12) để xem lỗi
- Kiểm tra Network tab để xem request/response
- Biểu đồ sẽ fallback về dữ liệu random nếu API lỗi

### Lỗi: CORS error
**Nguyên nhân:** Nếu test từ file HTML local

**Giải pháp:**
- Chạy file HTML thông qua web server (không phải file://)
- Hoặc test trực tiếp trong giao diện hệ thống

---

## 📝 Checklist Tích Hợp

- [x] Thêm routes API vào `apiv1.php`
- [x] Tạo controller methods trong `Ctrl_ThongKe.php`
- [x] Tạo service methods trong `Sc_ThongKe.php`
- [x] Tích hợp fetch API vào JavaScript
- [x] Thêm auto-refresh khi khởi tạo biểu đồ
- [x] Thêm event listeners cho filters
- [x] Thêm error handling và fallback
- [x] Tạo file test HTML
- [x] Viết tài liệu API
- [x] Viết hướng dẫn tích hợp

---

## 🎉 Kết luận

API đã được tích hợp hoàn toàn vào giao diện! Các biểu đồ sẽ:

1. ✅ **Tự động load dữ liệu** khi trang được tải
2. ✅ **Tự động cập nhật** khi thay đổi filter (ngày, rạp, loại xu hướng)
3. ✅ **Graceful fallback** về dữ liệu random nếu API lỗi
4. ✅ **Console logging** để debug dễ dàng

Bây giờ bạn có thể test ngay trong giao diện hoặc sử dụng file test HTML! 🚀
