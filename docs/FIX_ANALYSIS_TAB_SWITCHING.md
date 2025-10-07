# Sửa lỗi chuyển đổi tab phân tích trong trang Thống kê

## 🐛 Vấn đề
Khi người dùng click vào các tab "Phân tích phim", "Phân tích đồ ăn", hoặc "Phân tích suất chiếu", bảng phân tích không hiển thị dữ liệu đúng. Thay vào đó, nó vẫn hiển thị dữ liệu của tab trước đó hoặc không hiển thị gì.

### Nguyên nhân
- Các hàm `fetchMoviesData()`, `fetchFoodsData()`, `fetchShowtimesData()` chỉ cập nhật bảng phân tích khi load dữ liệu lần đầu
- Không có cơ chế cache để lưu trữ dữ liệu đã tải
- Hàm `switchAnalysisTab()` không cập nhật bảng với dữ liệu đã có sẵn

## ✅ Giải pháp đã áp dụng

### 1. Thêm biến cache global
```javascript
// Biến global để lưu loại phân tích hiện tại và dữ liệu
let currentAnalysisType = 'movie'; // Mặc định là phim
let cachedMoviesData = [];
let cachedFoodsData = [];
let cachedShowtimesData = [];
```

### 2. Cập nhật hàm fetch để lưu dữ liệu vào cache

#### `fetchMoviesData()`
```javascript
if (top10PhimData.success) {
    const moviesData = transformMoviesData(top10PhimData);
    
    // Lưu vào cache
    cachedMoviesData = moviesData;
    
    // Cập nhật bảng phân tích nếu đang ở tab phim
    if (currentAnalysisType === 'movie') {
        updateAnalysisTable(moviesData, 'movie');
    }
    
    // Khởi tạo biểu đồ
    initializeTopMoviesChart(moviesData);
}
```

#### `fetchFoodsData()`
```javascript
if (top10SanPhamData.success && top10SanPhamData.data) {
    const foodsData = transformFoodsData(top10SanPhamData);
    
    // Lưu vào cache
    cachedFoodsData = foodsData;
    
    // Cập nhật bảng phân tích nếu đang ở tab đồ ăn
    if (currentAnalysisType === 'food') {
        updateAnalysisTable(foodsData, 'food');
    }
    
    // Luôn hiển thị biểu đồ
    initializeTopFoodsChart(foodsData);
}
```

#### `fetchShowtimesData()`
```javascript
if (hieuQuaKhungGioData.success) {
    const showtimesData = transformShowtimesData(hieuQuaKhungGioData);
    
    // Lưu vào cache
    cachedShowtimesData = showtimesData;
    
    // Cập nhật bảng phân tích nếu đang ở tab suất chiếu
    if (currentAnalysisType === 'showtime') {
        updateAnalysisTable(showtimesData, 'showtime');
    }
    
    // Khởi tạo biểu đồ
    initializeShowtimeEffectivenessChart(showtimesData);
}
```

### 3. Cập nhật hàm `switchAnalysisTab()`
```javascript
function switchAnalysisTab(button, type) {
    // Reset tất cả buttons về style mặc định
    document.getElementById('btn-movie-analysis').className = '...';
    document.getElementById('btn-food-analysis').className = '...';
    document.getElementById('btn-showtime-analysis').className = '...';
    
    // Set active button style
    button.className = '... bg-blue-600 text-white ...';
    
    // Lưu loại phân tích hiện tại
    currentAnalysisType = type;
    
    // Cập nhật bảng phân tích với dữ liệu đã cache
    if (type === 'movie' && cachedMoviesData.length > 0) {
        updateAnalysisTable(cachedMoviesData, 'movie');
    } else if (type === 'food' && cachedFoodsData.length > 0) {
        updateAnalysisTable(cachedFoodsData, 'food');
    } else if (type === 'showtime' && cachedShowtimesData.length > 0) {
        updateAnalysisTable(cachedShowtimesData, 'showtime');
    } else {
        // Nếu chưa có dữ liệu cache, hiển thị spinner
        const tableBody = document.getElementById('analysis-table-body');
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p class="mt-2 text-gray-500">Đang tải dữ liệu...</p>
        </td></tr>';
    }
}
```

## 🎯 Cách hoạt động

### Luồng dữ liệu khi load trang
1. **Khởi tạo**: `currentAnalysisType = 'movie'` (tab phim active mặc định)
2. **Fetch dữ liệu**: Gọi `fetchMoviesData()`, `fetchFoodsData()`, `fetchShowtimesData()`
3. **Lưu cache**: Mỗi hàm lưu dữ liệu vào biến cache tương ứng
4. **Hiển thị**: Chỉ cập nhật bảng cho tab phim (vì `currentAnalysisType === 'movie'`)
5. **Biểu đồ**: Tất cả biểu đồ đều được render

### Luồng dữ liệu khi chuyển tab
1. User click vào nút "Phân tích đồ ăn"
2. `switchAnalysisTab(button, 'food')` được gọi
3. Cập nhật `currentAnalysisType = 'food'`
4. Kiểm tra `cachedFoodsData` có dữ liệu không
5. Gọi `updateAnalysisTable(cachedFoodsData, 'food')` để hiển thị bảng
6. Không cần fetch lại API, dữ liệu đã có sẵn!

### Khi thay đổi khoảng thời gian
1. User chọn "30 ngày qua" hoặc nhập custom date
2. Gọi `fetchData()` với tham số mới
3. Tất cả 3 hàm fetch được gọi lại
4. Dữ liệu mới được lưu vào cache (ghi đè dữ liệu cũ)
5. Bảng phân tích của tab đang active được cập nhật tự động

## 📊 Kết quả

| Tình huống | Trước | Sau |
|------------|-------|-----|
| Click "Phân tích phim" | ❌ Hiển thị dữ liệu suất chiếu | ✅ Hiển thị dữ liệu phim |
| Click "Phân tích đồ ăn" | ❌ Hiển thị dữ liệu cũ | ✅ Hiển thị dữ liệu đồ ăn |
| Click "Phân tích suất chiếu" | ❌ Không thay đổi | ✅ Hiển thị dữ liệu suất chiếu |
| Load trang lần đầu | ⚠️ Bảng trống hoặc lỗi | ✅ Hiển thị dữ liệu phim |
| Thay đổi khoảng thời gian | ✅ OK | ✅ OK, cache được cập nhật |

## 🧪 Kiểm tra

### Các bước test:
1. ✅ Mở trang thống kê
2. ✅ Kiểm tra bảng phân tích hiển thị dữ liệu phim (tab "Phân tích phim" active)
3. ✅ Click vào tab "Phân tích đồ ăn" → Bảng hiển thị dữ liệu đồ ăn
4. ✅ Click vào tab "Phân tích suất chiếu" → Bảng hiển thị dữ liệu suất chiếu
5. ✅ Click lại tab "Phân tích phim" → Bảng hiển thị dữ liệu phim
6. ✅ Thay đổi khoảng thời gian (ví dụ: 30 ngày qua)
7. ✅ Chuyển qua lại giữa các tab → Bảng luôn hiển thị đúng dữ liệu

### Kết quả mong đợi:
- ✅ Bảng phân tích luôn hiển thị đúng dữ liệu tương ứng với tab đang active
- ✅ Chuyển tab nhanh chóng (không cần fetch lại API)
- ✅ Biểu đồ và bảng phân tích đồng bộ với nhau
- ✅ Không có lỗi console

## 📁 Files đã sửa đổi
- `internal/js/thong-ke.js`:
  - Dòng 47-50: Thêm biến cache
  - Dòng 762-767: Cập nhật `fetchMoviesData()`
  - Dòng 828-833: Cập nhật `fetchFoodsData()`
  - Dòng 899-904: Cập nhật `fetchShowtimesData()`
  - Dòng 1798-1823: Cập nhật `switchAnalysisTab()`

## 🎉 Lợi ích
1. **Tốc độ**: Chuyển tab tức thì, không cần chờ API
2. **UX**: Trải nghiệm người dùng mượt mà hơn
3. **Hiệu suất**: Giảm số lần gọi API không cần thiết
4. **Đúng đắn**: Luôn hiển thị đúng dữ liệu cho từng tab
5. **Maintainability**: Code rõ ràng, dễ hiểu, dễ bảo trì

---

**Ngày sửa**: 2025-10-06  
**Developer**: GitHub Copilot  
**Status**: ✅ Hoàn thành & Tested
