# API Thống Kê Toàn Rạp

## 📊 Tổng quan

API này cung cấp thống kê tổng quan về hoạt động kinh doanh của toàn chuỗi rạp hoặc từng rạp cụ thể, bao gồm:
- **Tổng doanh thu** (Vé + F&B)
- **Tổng vé bán**
- **Tỉ lệ lấp đầy** (%)
- **Doanh thu F&B**

Với khả năng **so sánh với kỳ trước** để phân tích xu hướng tăng/giảm.

---

## 🔗 Endpoint

```
GET /api/v1/thong-ke-toan-rap
```

**Quyền truy cập:** 
- Quản lý chuỗi rạp
- Admin

---

## 📥 Request Parameters

### Query Parameters

| Tham số | Kiểu | Bắt buộc | Mặc định | Mô tả |
|---------|------|----------|----------|-------|
| `tuNgay` | string | Không | Ngày đầu tháng hiện tại | Ngày bắt đầu (format: `Y-m-d`)<br>Ví dụ: `2024-01-01` |
| `denNgay` | string | Không | Ngày cuối tháng hiện tại | Ngày kết thúc (format: `Y-m-d`)<br>Ví dụ: `2024-01-31` |
| `idRap` | string/int | Không | `all` | ID rạp cần xem thống kê<br>- `all`: Tất cả rạp<br>- `1`, `2`, `3`...: ID rạp cụ thể |
| `soSanh` | string | Không | `false` | So sánh với kỳ trước<br>- `true`: Hiển thị % thay đổi<br>- `false`: Không so sánh |

---

## 📤 Response Format

### ✅ Success Response (200 OK)

```json
{
    "success": true,
    "data": {
        "tong_doanh_thu": 5750000000,
        "tong_ve_ban": 115000,
        "ty_le_lap_day": 68.5,
        "doanh_thu_fnb": 1250000000,
        "so_sanh": {
            "phan_tram_thay_doi_doanh_thu": 12.5,
            "phan_tram_thay_doi_ve_ban": 8.7,
            "phan_tram_thay_doi_lap_day": -2.3,
            "phan_tram_thay_doi_fnb": 15.2
        },
        "thong_tin_khoang_thoi_gian": {
            "tu_ngay": "2024-01-01",
            "den_ngay": "2024-01-31",
            "so_ngay": 31
        }
    }
}
```

### ❌ Error Response (400/500)

```json
{
    "success": false,
    "message": "Lỗi: Chi tiết lỗi ở đây"
}
```

---

## 📊 Response Fields

### Chỉ số chính

| Field | Kiểu | Mô tả |
|-------|------|-------|
| `tong_doanh_thu` | number | Tổng doanh thu (Vé + F&B) trong kỳ (VNĐ) |
| `tong_ve_ban` | number | Tổng số vé đã bán |
| `ty_le_lap_day` | number | Tỉ lệ lấp đầy trung bình (%) |
| `doanh_thu_fnb` | number | Doanh thu từ F&B (VNĐ) |

### So sánh với kỳ trước (nếu `soSanh=true`)

| Field | Kiểu | Mô tả |
|-------|------|-------|
| `phan_tram_thay_doi_doanh_thu` | number | % thay đổi doanh thu<br>- Dương: tăng<br>- Âm: giảm |
| `phan_tram_thay_doi_ve_ban` | number | % thay đổi số vé bán |
| `phan_tram_thay_doi_lap_day` | number | % thay đổi tỉ lệ lấp đầy |
| `phan_tram_thay_doi_fnb` | number | % thay đổi doanh thu F&B |

### Thông tin khoảng thời gian

| Field | Kiểu | Mô tả |
|-------|------|-------|
| `tu_ngay` | string | Ngày bắt đầu |
| `den_ngay` | string | Ngày kết thúc |
| `so_ngay` | number | Số ngày trong khoảng thống kê |

---

## 🔍 Ví dụ Sử Dụng

### 1️⃣ Xem tất cả rạp trong 30 ngày qua (không so sánh)

**Request:**
```http
GET /api/v1/thong-ke-toan-rap?tuNgay=2024-10-01&denNgay=2024-10-30&idRap=all&soSanh=false
```

**Response:**
```json
{
    "success": true,
    "data": {
        "tong_doanh_thu": 5750000000,
        "tong_ve_ban": 115000,
        "ty_le_lap_day": 68.5,
        "doanh_thu_fnb": 1250000000,
        "so_sanh": null,
        "thong_tin_khoang_thoi_gian": {
            "tu_ngay": "2024-10-01",
            "den_ngay": "2024-10-30",
            "so_ngay": 30
        }
    }
}
```

---

### 2️⃣ Xem rạp cụ thể (ID=2) với so sánh kỳ trước

**Request:**
```http
GET /api/v1/thong-ke-toan-rap?tuNgay=2024-10-01&denNgay=2024-10-30&idRap=2&soSanh=true
```

**Response:**
```json
{
    "success": true,
    "data": {
        "tong_doanh_thu": 1850000000,
        "tong_ve_ban": 37000,
        "ty_le_lap_day": 72.3,
        "doanh_thu_fnb": 420000000,
        "so_sanh": {
            "phan_tram_thay_doi_doanh_thu": 8.2,
            "phan_tram_thay_doi_ve_ban": 5.4,
            "phan_tram_thay_doi_lap_day": -1.8,
            "phan_tram_thay_doi_fnb": 12.7
        },
        "thong_tin_khoang_thoi_gian": {
            "tu_ngay": "2024-10-01",
            "den_ngay": "2024-10-30",
            "so_ngay": 30
        }
    }
}
```

---

### 3️⃣ Xem mặc định (tháng hiện tại, tất cả rạp)

**Request:**
```http
GET /api/v1/thong-ke-toan-rap
```

**Response:**
```json
{
    "success": true,
    "data": {
        "tong_doanh_thu": 6200000000,
        "tong_ve_ban": 124000,
        "ty_le_lap_day": 70.1,
        "doanh_thu_fnb": 1350000000,
        "so_sanh": null,
        "thong_tin_khoang_thoi_gian": {
            "tu_ngay": "2024-10-01",
            "den_ngay": "2024-10-31",
            "so_ngay": 31
        }
    }
}
```

---

## 💻 Code JavaScript Mẫu

### Fetch API

```javascript
async function fetchThongKeToanRap(tuNgay, denNgay, idRap = 'all', soSanh = false) {
    const params = new URLSearchParams({
        tuNgay: tuNgay,
        denNgay: denNgay,
        idRap: idRap,
        soSanh: soSanh.toString()
    });
    
    try {
        const response = await fetch(`/api/v1/thong-ke-toan-rap?${params}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('Dữ liệu thống kê:', result.data);
            return result.data;
        } else {
            console.error('Lỗi:', result.message);
            return null;
        }
    } catch (error) {
        console.error('Network error:', error);
        return null;
    }
}

// Sử dụng
fetchThongKeToanRap('2024-10-01', '2024-10-30', 'all', true)
    .then(data => {
        if (data) {
            document.getElementById('total-revenue').textContent = 
                new Intl.NumberFormat('vi-VN', { 
                    style: 'currency', 
                    currency: 'VND' 
                }).format(data.tong_doanh_thu);
            
            document.getElementById('total-tickets').textContent = 
                data.tong_ve_ban.toLocaleString('vi-VN');
            
            document.getElementById('avg-occupancy').textContent = 
                data.ty_le_lap_day.toFixed(1) + '%';
            
            document.getElementById('fnb-revenue').textContent = 
                new Intl.NumberFormat('vi-VN', { 
                    style: 'currency', 
                    currency: 'VND' 
                }).format(data.doanh_thu_fnb);
            
            // Nếu có so sánh
            if (data.so_sanh) {
                updateTrendIndicator('revenue-trend', data.so_sanh.phan_tram_thay_doi_doanh_thu);
                updateTrendIndicator('tickets-trend', data.so_sanh.phan_tram_thay_doi_ve_ban);
                updateTrendIndicator('occupancy-trend', data.so_sanh.phan_tram_thay_doi_lap_day);
                updateTrendIndicator('fnb-trend', data.so_sanh.phan_tram_thay_doi_fnb);
            }
        }
    });

function updateTrendIndicator(elementId, changePercent) {
    const element = document.getElementById(elementId);
    const iconElement = element.querySelector('svg');
    const textElement = element.querySelector('span');
    
    textElement.textContent = `${changePercent > 0 ? '+' : ''}${changePercent.toFixed(1)}%`;
    
    // Thay đổi màu sắc và icon dựa vào tăng/giảm
    if (changePercent > 0) {
        element.classList.remove('bg-red-100', 'text-red-700', 'border-red-300');
        element.classList.add('bg-green-100', 'text-green-700', 'border-green-300');
        iconElement.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />';
    } else {
        element.classList.remove('bg-green-100', 'text-green-700', 'border-green-300');
        element.classList.add('bg-red-100', 'text-red-700', 'border-red-300');
        iconElement.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />';
    }
}
```

---

## 🔐 Authentication

API này yêu cầu **authentication token** trong header:

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Chỉ **Quản lý chuỗi rạp** và **Admin** mới có quyền truy cập.

---

## 📐 Công Thức Tính

### 1. Tổng Doanh Thu
```
Tổng Doanh Thu = Doanh Thu Vé + Doanh Thu F&B
```

### 2. Doanh Thu Vé
```
Doanh Thu Vé = SUM(gia_ve) 
WHERE trang_thai = 2 (Đã thanh toán)
AND created_at BETWEEN tuNgay AND denNgay
```

### 3. Doanh Thu F&B
```
Doanh Thu F&B = SUM(so_luong * gia) 
WHERE trang_thai = 2 (Đã thanh toán)
AND created_at BETWEEN tuNgay AND denNgay
```

### 4. Tỉ Lệ Lấp Đầy
```
Tỉ Lệ Lấp Đầy = (Tổng Vé Đã Bán / Tổng Số Ghế) * 100
```

### 5. Phần Trăm Thay Đổi
```
% Thay Đổi = ((Giá Trị Hiện Tại - Giá Trị Kỳ Trước) / Giá Trị Kỳ Trước) * 100
```

**Kỳ Trước** được tính bằng cách lùi lại **số ngày** bằng khoảng thống kê:
- Nếu thống kê 30 ngày (1/10 - 30/10)
- Kỳ trước sẽ là 30 ngày trước đó (1/9 - 30/9)

---

## 🎯 Use Cases

### 1. Dashboard Tổng Quan
Hiển thị 4 KPI cards ở trang chủ với số liệu real-time

### 2. Báo Cáo Theo Rạp
So sánh hiệu suất của từng rạp trong chuỗi

### 3. Phân Tích Xu Hướng
Theo dõi tăng/giảm theo thời gian để điều chỉnh chiến lược

### 4. Báo Cáo Quản Lý
Xuất báo cáo định kỳ (tuần/tháng/quý) cho ban lãnh đạo

---

## 🧪 Testing

### Postman Collection

```json
{
    "name": "Thống Kê Toàn Rạp",
    "request": {
        "method": "GET",
        "header": [
            {
                "key": "Accept",
                "value": "application/json"
            }
        ],
        "url": {
            "raw": "{{baseUrl}}/api/v1/thong-ke-toan-rap?tuNgay=2024-10-01&denNgay=2024-10-30&idRap=all&soSanh=true",
            "host": ["{{baseUrl}}"],
            "path": ["api", "v1", "thong-ke-toan-rap"],
            "query": [
                {
                    "key": "tuNgay",
                    "value": "2024-10-01"
                },
                {
                    "key": "denNgay",
                    "value": "2024-10-30"
                },
                {
                    "key": "idRap",
                    "value": "all"
                },
                {
                    "key": "soSanh",
                    "value": "true"
                }
            ]
        }
    }
}
```

---

## 📈 Performance Notes

- **Cache:** API có thể cache kết quả trong 5 phút để giảm tải database
- **Pagination:** Không áp dụng vì chỉ trả về 4 chỉ số tổng hợp
- **Query Optimization:** Sử dụng JOIN và index để tăng tốc độ truy vấn
- **Response Time:** < 500ms cho khoảng thời gian 30 ngày

---

## 🐛 Error Codes

| Code | Message | Giải pháp |
|------|---------|-----------|
| 400 | Invalid date format | Kiểm tra format ngày (Y-m-d) |
| 401 | Unauthorized | Cần đăng nhập với quyền phù hợp |
| 403 | Forbidden | Không có quyền truy cập |
| 404 | Cinema not found | ID rạp không tồn tại |
| 500 | Internal server error | Liên hệ admin |

---

## 📝 Changelog

### v1.0.0 (2024-10-07)
- ✨ Phát hành API thống kê toàn rạp
- ✅ Hỗ trợ filter theo rạp và khoảng thời gian
- ✅ Tính toán 4 KPI chính: Doanh thu, Vé bán, Lấp đầy, F&B
- ✅ So sánh với kỳ trước

---

## 🤝 Support

Nếu gặp vấn đề, vui lòng liên hệ:
- **Email:** support@epiccinema.vn
- **Slack:** #api-support
- **Docs:** [Internal Wiki](https://wiki.epiccinema.vn)
