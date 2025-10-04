import Spinner from "./util/spinner.js";
document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra ApexCharts đã load chưa
    if (typeof ApexCharts === 'undefined') {
        console.error('ApexCharts not loaded');
        alert('Thư viện biểu đồ chưa được tải. Vui lòng tải lại trang.');
        return;
    }
    
    // Xử lý bộ lọc thời gian
    const dateRangeSelect = document.getElementById('date-range');
    const customDateRange = document.getElementById('custom-date-range');

    dateRangeSelect.addEventListener('change', function() {
        if (this.value === 'custom') {
            customDateRange.classList.remove('hidden');
        } else {
            customDateRange.classList.add('hidden');
            fetchData(this.value);
        }
    });

    document.getElementById('apply-date-range').addEventListener('click', function() {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        if (startDate && endDate) {
            fetchData('custom', { startDate, endDate });
        } else {
            alert('Vui lòng chọn ngày bắt đầu và ngày kết thúc');
        }
    });

    // Xử lý xuất dữ liệu
    document.getElementById('btn-export-data').addEventListener('click', function() {
        exportData();
    });

    // Hiển thị spinner ngay khi trang tải
    preShowAllSpinners();
    
    // Khởi tạo dữ liệu mẫu và biểu đồ khi trang được tải
    initializeDashboard();
    fetchData('7days');
});

// Khởi tạo dashboard với dữ liệu mẫu
function initializeDashboard() {
    try {
        // Kiểm tra ApexCharts đã load
        if (typeof ApexCharts === 'undefined') {
            console.error('ApexCharts not loaded');
            return;
        }
        
        // Xóa tất cả biểu đồ hiện tại để tránh duplicate
        destroyAllCharts();
        
        // Đảm bảo dữ liệu mẫu có đủ cả đồ ăn
        const sampleData = generateSampleDataWithFoods();
        
        // Cập nhật dữ liệu tổng quan
        updateOverviewData(sampleData.overview);
        
        // Không khởi tạo biểu đồ trống vì chúng ta sẽ hiển thị spinner
        // và chờ dữ liệu thực từ API
        
        // Cập nhật bảng phân tích
        updateAnalysisTable(sampleData.movies, 'movie');
        
        // Hiển thị đề xuất kinh doanh
        updateBusinessRecommendations(sampleData.recommendations);
    } catch (error) {
        console.error('Error initializing dashboard:', error);
    }
}

// Cập nhật hàm generateSampleDataWithFoods
function generateSampleDataWithFoods() {
    const data = generateSampleData();
    
    // Đảm bảo dữ liệu mẫu cho đồ ăn luôn có giá trị giống với phim (trống khi mới load)
    data.foods = [];
    
    return data;
}

// Hàm tạo dữ liệu mẫu cho việc demo
// Thay thế hàm generateSampleData để sử dụng dữ liệu từ API
function generateSampleData() {
    return {
        overview: {
            totalRevenue: 0,
            revenueTrend: 0,
            totalCustomers: 0,
            customerTrend: 0,
            occupancyRate: 0,
            occupancyTrend: 0,
            foodPerCustomer: 0,
            foodTrend: 0
        },
        revenueByDate: [],
        revenueDistribution: [],
        movies: [],
        foods: [],
        showtimes: [],
        customerTrends: [],
        recommendations: []
    };
}

// Hàm để lấy dữ liệu từ API
async function fetchDataFromAPI(dateRange, params = {}) {
    const urlBase = document.getElementById('thong-ke-app').dataset.url
    try {
        // Xác định ngày bắt đầu và kết thúc dựa trên dateRange
        let startDate, endDate;
        
        if (dateRange === 'custom' && params.startDate && params.endDate) {
            startDate = params.startDate;
            endDate = params.endDate;
        } else {
            const today = new Date();
            endDate = formatDateForAPI(today);
            
            if (dateRange === '7days') {
                const sevenDaysAgo = new Date(today);
                sevenDaysAgo.setDate(today.getDate() - 7);
                startDate = formatDateForAPI(sevenDaysAgo);
            } else if (dateRange === '30days') {
                const thirtyDaysAgo = new Date(today);
                thirtyDaysAgo.setDate(today.getDate() - 30);
                startDate = formatDateForAPI(thirtyDaysAgo);
            } else if (dateRange === '90days') {
                const ninetyDaysAgo = new Date(today);
                ninetyDaysAgo.setDate(today.getDate() - 90);
                startDate = formatDateForAPI(ninetyDaysAgo);
            } else if (dateRange === 'year') {
                const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
                startDate = formatDateForAPI(firstDayOfYear);
            } else {
                // Mặc định 7 ngày
                const sevenDaysAgo = new Date(today);
                sevenDaysAgo.setDate(today.getDate() - 7);
                startDate = formatDateForAPI(sevenDaysAgo);
            }
        }
        
        // Đảm bảo gọi đúng API cho top 10 sản phẩm
        const [tongQuatData, phanTichData, top10PhimData, top10SanPhamData, 
               hieuQuaKhungGioData, xuHuongKhachHangData, chiTietData] = await Promise.all([
            fetchAPI(`${urlBase}/api/thong-ke/tong-quat?tuNgay=${startDate}&denNgay=${endDate}`),
            fetchAPI(`${urlBase}/api/thong-ke/phan-tich?tuNgay=${startDate}&denNgay=${endDate}`),
            fetchAPI(`${urlBase}/api/thong-ke/doanh-thu-top-10-phim?tuNgay=${startDate}&denNgay=${endDate}`),
            // Sửa đường dẫn API này
            fetchAPI(`${urlBase}/api/thong-ke/doanh-thu-top-10-san-pham?tuNgay=${startDate}&denNgay=${endDate}`),
            fetchAPI(`${urlBase}/api/thong-ke/hieu-qua-khung-gio-suat-chieu?tuNgay=${startDate}&denNgay=${endDate}`),
            fetchAPI(`${urlBase}/api/thong-ke/xu-huong-khach-hang-theo-thoi-gian?tuNgay=${startDate}&denNgay=${endDate}`),
            fetchAPI(`${urlBase}/api/thong-ke/chi-tiet?tuNgay=${startDate}&denNgay=${endDate}`)
        ]);
        
        // Chuyển đổi dữ liệu từ API thành định dạng mà biểu đồ cần
        const transformedData = transformAPIData(
            tongQuatData, 
            phanTichData,
            top10PhimData,
            top10SanPhamData,
            hieuQuaKhungGioData,
            xuHuongKhachHangData,
            chiTietData
        );
        
        return transformedData;
    } catch (error) {
        console.error('Error fetching data from API:', error);
        // Trả về dữ liệu mẫu nếu có lỗi
        return generateSampleDataFallback();
    }
}

// Hàm helper để gọi API
async function fetchAPI(endpoint) {
    try {
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error(`API call failed: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        return { success: false, data: null };
    }
}

// Hàm để chuyển đổi định dạng ngày cho API
function formatDateForAPI(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Hàm chuyển đổi dữ liệu từ API thành định dạng mà biểu đồ cần
function transformAPIData(tongQuatData, phanTichData, top10PhimData, top10SanPhamData, 
                         hieuQuaKhungGioData, xuHuongKhachHangData, chiTietData) {
    // Xử lý dữ liệu tổng quan
    const overview = transformOverviewData(tongQuatData);
    
    // Xử lý dữ liệu phân tích doanh thu theo ngày
    const revenueByDate = transformRevenueByDateData(phanTichData);
    
    // Xử lý dữ liệu phân bổ doanh thu
    const revenueDistribution = transformRevenueDistributionData(phanTichData);
    
    // Xử lý dữ liệu top 10 phim
    const movies = transformMoviesData(top10PhimData);
    
    // Xử lý dữ liệu top 10 sản phẩm
    const foods = transformFoodsData(top10SanPhamData);
    
    // Xử lý dữ liệu hiệu quả theo khung giờ
    const showtimes = transformShowtimesData(hieuQuaKhungGioData);
    
    // Xử lý dữ liệu xu hướng khách hàng
    const customerTrends = transformCustomerTrendsData(xuHuongKhachHangData);
    
    // Tạo đề xuất kinh doanh dựa trên dữ liệu
    const recommendations = generateRecommendations(
        overview, movies, foods, showtimes, customerTrends
    );
    
    return {
        overview,
        revenueByDate,
        revenueDistribution,
        movies,
        foods,
        showtimes,
        customerTrends,
        recommendations
    };
}

// Hàm chuyển đổi dữ liệu tổng quan
function transformOverviewData(tongQuatData) {
    if (!tongQuatData || !tongQuatData.success || !tongQuatData.data) {
        return {
            totalRevenue: 0,
            revenueTrend: 0,
            totalCustomers: 0,
            customerTrend: 0,
            occupancyRate: 0,
            occupancyTrend: 0,
            foodPerCustomer: 0,
            foodTrend: 0
        };
    }
    
    const data = tongQuatData.data;
    
    return {
        totalRevenue: parseFloat(data.kyHienTai.tongDoanhThu),
        revenueTrend: calculateTrend(data.kyHienTai.tongDoanhThu, data.kyTruoc.tongDoanhThu),
        totalCustomers: data.kyHienTai.soLuongKhachHang,
        customerTrend: calculateTrend(data.kyHienTai.soLuongKhachHang, data.kyTruoc.soLuongKhachHang),
        occupancyRate: data.kyHienTai.tiLeLapDayGhe,
        occupancyTrend: calculateTrend(data.kyHienTai.tiLeLapDayGhe, data.kyTruoc.tiLeLapDayGhe),
        foodPerCustomer: data.kyHienTai.doanhThuDoAnUongBinhQuan,
        foodTrend: calculateTrend(data.kyHienTai.doanhThuDoAnUongBinhQuan, data.kyTruoc.doanhThuDoAnUongBinhQuan)
    };
}

// Hàm tính phần trăm thay đổi
function calculateTrend(current, previous) {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
}

// Hàm để chuyển đổi dữ liệu doanh thu theo ngày
function transformRevenueByDateData(phanTichData) {
    if (!phanTichData || !phanTichData.success || !phanTichData.data || !phanTichData.data.chi_tiet_theo_ngay) {
        return [];
    }
    
    return phanTichData.data.chi_tiet_theo_ngay.map(item => ({
        date: item.ngay_formatted,
        total: item.tong_doanh_thu,
        ticket: item.doanh_thu_ve,
        food: item.doanh_thu_san_pham
    }));
}

// Hàm để chuyển đổi dữ liệu phân bổ doanh thu
function transformRevenueDistributionData(phanTichData) {
    if (!phanTichData || !phanTichData.success || !phanTichData.data || !phanTichData.data.tong_ket) {
        return [
            { name: 'Vé phim', value: 75 },
            { name: 'Đồ ăn & Đồ uống', value: 20 }
        ];
    }
    
    const tongDoanhThu = phanTichData.data.tong_ket.tong_doanh_thu_ve + phanTichData.data.tong_ket.tong_doanh_thu_san_pham;
    
    if (tongDoanhThu === 0) {
        return [
            { name: 'Vé phim', value: 75 },
            { name: 'Đồ ăn & Đồ uống', value: 20 }
        ];
    }
    
    const phanTramVe = Math.round((phanTichData.data.tong_ket.tong_doanh_thu_ve / tongDoanhThu) * 100);
    const phanTramDoAn = Math.round((phanTichData.data.tong_ket.tong_doanh_thu_san_pham / tongDoanhThu) * 100);
    const phanTramKhac = 100 - phanTramVe - phanTramDoAn;
    
    return [
        { name: 'Vé phim', value: phanTramVe },
        { name: 'Đồ ăn & Đồ uống', value: phanTramDoAn }
    ];
}

// Hàm chuyển đổi dữ liệu top 10 phim
function transformMoviesData(top10PhimData) {
    if (!top10PhimData || !top10PhimData.success || !top10PhimData.data || !top10PhimData.data.top_10_phim) {
        return [];
    }
    
    return top10PhimData.data.top_10_phim.map(phim => ({
        name: phim.ten_phim,
        revenue: phim.doanh_thu_ve,
        tickets: phim.so_luot || 0,
        contribution: phim.ty_le_dong_gop || 0,
        trend: phim.so_voi_ky_truoc?.ty_le || 0
    }));
}

// Hàm chuyển đổi dữ liệu top 10 sản phẩm
function transformFoodsData(top10SanPhamData) {
    if (!top10SanPhamData || !top10SanPhamData.success || !top10SanPhamData.data) {
        console.error('Invalid API response structure:', top10SanPhamData);
        return [];
    }
    
    // Kiểm tra cấu trúc dữ liệu
    console.log('API data structure:', top10SanPhamData.data);
    
    // Lấy mảng top_10_san_pham từ dữ liệu API
    // Đảm bảo cấu trúc dữ liệu phù hợp với API thực tế
    const sanPhamList = top10SanPhamData.data.top_10_san_pham || [];
    
    if (sanPhamList.length === 0) {
        console.warn('No products found in API data');
        return [];
    }
    
    return sanPhamList.map(sanPham => {
        // Tính tỷ lệ thay đổi so với kỳ trước (nếu có)
        let trend = 0;
        if (sanPham.so_voi_ky_truoc && typeof sanPham.so_voi_ky_truoc.ty_le !== 'undefined') {
            trend = sanPham.so_voi_ky_truoc.ty_le;
            if (sanPham.so_voi_ky_truoc.tang === false) {
                trend = -trend; // Đổi dấu nếu là giảm
            }
        }
        
        // Đảm bảo thuộc tính được lấy đúng từ API response
        return {
            id: sanPham.id || sanPham.id_san_pham,
            name: sanPham.ten_san_pham || sanPham.ten || 'Không có tên',
            revenue: parseFloat(sanPham.doanh_thu || 0),
            quantity: parseInt(sanPham.so_luot || sanPham.so_luong_ban || 0, 10),
            contribution: parseFloat(sanPham.ty_le_dong_gop || 0),
            trend: trend
        };
    });
}

// Hàm chuyển đổi dữ liệu hiệu quả theo khung giờ
function transformShowtimesData(hieuQuaKhungGioData) {
    if (!hieuQuaKhungGioData || !hieuQuaKhungGioData.success || !hieuQuaKhungGioData.data || !hieuQuaKhungGioData.data.chi_tiet_theo_khung_gio) {
        return [];
    }
    
    return hieuQuaKhungGioData.data.chi_tiet_theo_khung_gio.map(item => ({
        time: item.khung_gio,
        occupancy: item.ty_le_lap_day,
        revenue: item.tong_doanh_thu,
        contribution: item.ty_le_dong_gop || 0,
        trend: item.so_voi_ky_truoc?.ty_le || 0
    }));
}

// Hàm chuyển đổi dữ liệu xu hướng khách hàng
function transformCustomerTrendsData(xuHuongKhachHangData) {
    if (!xuHuongKhachHangData || !xuHuongKhachHangData.success || !xuHuongKhachHangData.data || !xuHuongKhachHangData.data.chi_tiet_theo_ngay) {
        return [];
    }
    
    return xuHuongKhachHangData.data.chi_tiet_theo_ngay.map(item => {
        let weekday = 0;
        let weekend = 0;
        
        // Phân loại khách hàng theo ngày trong tuần
        if (item.la_cuoi_tuan) {
            weekend = item.so_luong_khach;
        } else {
            weekday = item.so_luong_khach;
        }
        
        return {
            date: item.ngay_formatted,
            total: item.so_luong_khach,
            weekend,
            weekday
        };
    });
}

// Hàm tạo đề xuất kinh doanh dựa trên dữ liệu
function generateRecommendations(overview, movies, foods, showtimes, customerTrends) {
    const recommendations = [];
    
    // Đề xuất về khung giờ hiệu quả nhất
    if (showtimes && showtimes.length > 0) {
        // Tìm khung giờ có tỷ lệ lấp đầy cao nhất
        const bestOccupancyShowtime = [...showtimes].sort((a, b) => b.occupancy - a.occupancy)[0];
        
        if (bestOccupancyShowtime && bestOccupancyShowtime.occupancy > 75) {
            recommendations.push({
                title: "Tối ưu giờ chiếu phim",
                content: `Khung giờ ${bestOccupancyShowtime.time} đạt hiệu suất cao nhất với tỷ lệ lấp đầy ${bestOccupancyShowtime.occupancy}%. Nên tăng số lượng suất chiếu các bộ phim được ưa chuộng trong khung giờ này.`,
                type: "success"
            });
        }
        
        // Tìm khung giờ có tỷ lệ lấp đầy thấp nhất
        const worstOccupancyShowtime = [...showtimes].sort((a, b) => a.occupancy - b.occupancy)[0];
        
        if (worstOccupancyShowtime && worstOccupancyShowtime.occupancy < 50) {
            recommendations.push({
                title: "Cảnh báo doanh thu",
                content: `Doanh thu các suất chiếu ${worstOccupancyShowtime.time} có tỷ lệ lấp đầy thấp (${worstOccupancyShowtime.occupancy}%). Cân nhắc giảm giá vé hoặc tạo chương trình khuyến mãi để thu hút khách hàng.`,
                type: "warning"
            });
        }
    }
    
    // Đề xuất về sản phẩm bán chạy
    if (foods && foods.length > 0) {
        // Tìm sản phẩm có xu hướng tăng mạnh nhất
        const bestTrendFood = [...foods].sort((a, b) => b.trend - a.trend)[0];
        
        if (bestTrendFood && bestTrendFood.trend > 10) {
            recommendations.push({
                title: "Khuyến mãi đồ ăn",
                content: `${bestTrendFood.name} có xu hướng tăng ${bestTrendFood.trend}%. Nên tạo thêm các combo mới kết hợp với sản phẩm này để tăng doanh thu F&B.`,
                type: "info"
            });
        }
    }
    
    // Đề xuất về phim
    if (movies && movies.length > 0) {
        // Tìm phim có doanh thu cao nhất
        const bestMovie = movies[0];
        
        if (bestMovie) {
            recommendations.push({
                title: "Phim có doanh thu cao",
                content: `"${bestMovie.name}" đang là phim có doanh thu cao nhất (${formatCurrency(bestMovie.revenue)}). Nên tăng số lượng suất chiếu và quảng bá mạnh hơn.`,
                type: "success"
            });
        }
    }
    
    // Nếu không có đề xuất nào
    if (recommendations.length === 0) {
        recommendations.push({
            title: "Chưa có đủ dữ liệu để đưa ra đề xuất",
            content: "Hãy chọn khoảng thời gian khác hoặc đợi có thêm dữ liệu để nhận đề xuất cụ thể hơn.",
            type: "info"
        });
    }
    
    return recommendations;
}

// Dữ liệu mẫu dự phòng khi API không hoạt động
function generateSampleDataFallback() {
    return {
        overview: {
            totalRevenue: 340000,
            revenueTrend: 0,
            totalCustomers: 4,
            customerTrend: 0,
            occupancyRate: 0.6,
            occupancyTrend: 0,
            foodPerCustomer: 7500,
            foodTrend: 0
        },
        revenueByDate: [
            { date: '22/09', total: 50000, ticket: 40000, food: 10000 },
            { date: '23/09', total: 45000, ticket: 35000, food: 10000 },
            { date: '24/09', total: 60000, ticket: 50000, food: 10000 },
            { date: '25/09', total: 55000, ticket: 45000, food: 10000 },
            { date: '26/09', total: 40000, ticket: 30000, food: 10000 },
            { date: '27/09', total: 50000, ticket: 40000, food: 10000 },
            { date: '28/09', total: 40000, ticket: 30000, food: 10000 }
        ],
        revenueDistribution: [
            { name: 'Vé phim', value: 80 },
            { name: 'Đồ ăn & Đồ uống', value: 20 }
        ],
        movies: [
            { name: 'Đứa Con Của Thời Tiết', revenue: 310000, tickets: 3, contribution: 91, trend: 0 },
        ],
        foods: [
            { name: 'Bắp rang bơ (lớn)', revenue: 30000, quantity: 3, contribution: 100, trend: 0 },
        ],
        showtimes: [
            { time: '10:00 - 12:00', occupancy: 45, revenue: 85000, contribution: 25, trend: 0 },
            { time: '12:00 - 14:00', occupancy: 62, revenue: 120000, contribution: 35, trend: 0 },
            { time: '14:00 - 16:00', occupancy: 58, revenue: 110000, contribution: 32, trend: 0 },
            { time: '18:00 - 20:00', occupancy: 25, revenue: 25000, contribution: 8, trend: 0 },
        ],
        customerTrends: [
            { date: '22/09', total: 1, weekend: 0, weekday: 1 },
            { date: '23/09', total: 0, weekend: 0, weekday: 0 },
            { date: '24/09', total: 2, weekend: 0, weekday: 2 },
            { date: '25/09', total: 0, weekend: 0, weekday: 0 },
            { date: '26/09', total: 0, weekend: 0, weekday: 0 },
            { date: '27/09', total: 0, weekend: 0, weekday: 0 },
            { date: '28/09', total: 1, weekend: 1, weekday: 0 }
        ],
        recommendations: [
            {
                title: "Đề xuất dựa trên dữ liệu hiện có",
                content: "Nên tập trung vào các suất chiếu từ 10:00 - 14:00 vì có tỷ lệ lấp đầy cao nhất.",
                type: "success"
            },
            {
                title: "Doanh thu đồ ăn",
                content: "Bắp rang bơ là sản phẩm bán chạy nhất. Nên tạo thêm các combo kết hợp với sản phẩm này.",
                type: "info"
            }
        ]
    };
}

// Thay thế hàm fetchData hiện tại với phiên bản được cải tiến
async function fetchData(dateRange, params = {}) {
    console.log('Fetching data for:', dateRange, params);
    
    try {
        // Xác định ngày bắt đầu và kết thúc dựa trên dateRange
        let startDate, endDate;
        
        if (dateRange === 'custom' && params.startDate && params.endDate) {
            startDate = params.startDate;
            endDate = params.endDate;
        } else {
            const today = new Date();
            endDate = formatDateForAPI(today);
            
            if (dateRange === '7days') {
                const sevenDaysAgo = new Date(today);
                sevenDaysAgo.setDate(today.getDate() - 7);
                startDate = formatDateForAPI(sevenDaysAgo);
            } else if (dateRange === '30days') {
                const thirtyDaysAgo = new Date(today);
                thirtyDaysAgo.setDate(today.getDate() - 30);
                startDate = formatDateForAPI(thirtyDaysAgo);
            } else if (dateRange === '90days') {
                const ninetyDaysAgo = new Date(today);
                ninetyDaysAgo.setDate(today.getDate() - 90);
                startDate = formatDateForAPI(ninetyDaysAgo);
            } else if (dateRange === 'year') {
                const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
                startDate = formatDateForAPI(firstDayOfYear);
            } else {
                // Mặc định 7 ngày
                const sevenDaysAgo = new Date(today);
                sevenDaysAgo.setDate(today.getDate() - 7);
                startDate = formatDateForAPI(sevenDaysAgo);
            }
        }

        // Khởi tạo dữ liệu trống và xóa biểu đồ hiện tại
        destroyAllCharts();
        
        // Đảm bảo spinner hiển thị trên tất cả biểu đồ
        preShowAllSpinners();
        
        // Đợi một khoảnh khắc để đảm bảo spinner được hiển thị trước khi bắt đầu fetch dữ liệu
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Gọi và hiển thị dữ liệu tổng quan (spinner riêng cho mỗi box)
        fetchOverviewData(startDate, endDate);
        
        // Các API khác được gọi riêng biệt
        fetchRevenueAnalysisData(startDate, endDate);
        fetchFoodsData(startDate, endDate);
        fetchMoviesData(startDate, endDate);
        fetchShowtimesData(startDate, endDate);        
        // Gọi API xu hướng khách hàng
        fetchCustomerTrendsData(startDate, endDate);
    } catch (error) {
        console.error('Error in fetchData:', error);
    }
}

// Hàm để hiển thị dữ liệu tổng quan với spinner
async function fetchOverviewData(startDate, endDate) {
    const urlBase = document.getElementById('thong-ke-app').dataset.url
    // Lấy các phần tử cần hiển thị dữ liệu
    const revenueElement = document.getElementById('total-revenue');
    const customersElement = document.getElementById('total-customers');
    const occupancyElement = document.getElementById('occupancy-rate');
    const foodElement = document.getElementById('food-per-customer');
    
    // Thêm class loading vào các phần tử
    [revenueElement, customersElement, occupancyElement, foodElement].forEach(el => {
        if (el) el.classList.add('animate-pulse');
    });
    
    try {
        // Tạo promise để gọi API
        const fetchPromise = async () => {
            const tongQuatData = await fetchAPI(`${urlBase}/api/thong-ke/tong-quat?tuNgay=${startDate}&denNgay=${endDate}`);
            
            if (tongQuatData.success) {
                updateOverviewData(transformOverviewData(tongQuatData));
            } else {
                throw new Error('API responded with an error');
            }
            
            return tongQuatData;
        };
        
        // Sử dụng Spinner.during để hiển thị spinner trong khi chờ đợi Promise
        await Spinner.during(fetchPromise(), {
            target: document.querySelector('.p-4'), // Parent container of overview boxes
            text: 'Đang tải dữ liệu tổng quan...'
        });
    } catch (error) {
        console.error('Error in fetchOverviewData:', error);
        // Hiển thị thông báo lỗi
        [revenueElement, customersElement, occupancyElement, foodElement].forEach(el => {
            if (el) el.textContent = 'Lỗi dữ liệu';
        });
    } finally {
        // Xóa class loading khỏi các phần tử
        [revenueElement, customersElement, occupancyElement, foodElement].forEach(el => {
            if (el) el.classList.remove('animate-pulse');
        });
    }
}

// Implementation with explicit spinner control
async function fetchRevenueAnalysisData(startDate, endDate) {
    const urlBase = document.getElementById('thong-ke-app').dataset.url
    const revenueChartElement = document.querySelector("#revenue-chart");
    const distributionChartElement = document.querySelector("#revenue-distribution-chart");
    
    if (!revenueChartElement || !distributionChartElement) return;
    
    // Đảm bảo container có position để định vị spinner
    if (getComputedStyle(revenueChartElement).position === 'static') {
        revenueChartElement.style.position = 'relative';
    }
    if (getComputedStyle(distributionChartElement).position === 'static') {
        distributionChartElement.style.position = 'relative';
    }
    
    // Đảm bảo container có chiều cao đủ để hiển thị spinner
    if (revenueChartElement.clientHeight < 100) {
        revenueChartElement.style.minHeight = '320px';
    }
    if (distributionChartElement.clientHeight < 100) {
        distributionChartElement.style.minHeight = '320px';
    }
    
    // Show spinners for both charts
    const revenueSpinner = showChartSpinner('revenue-chart');
    const distributionSpinner = showChartSpinner('revenue-distribution-chart');
    
    try {
        // Gọi API phân tích doanh thu
        const phanTichData = await fetchAPI(`${urlBase}/api/thong-ke/phan-tich?tuNgay=${startDate}&denNgay=${endDate}`);
        
        if (phanTichData.success) {
            // Cập nhật biểu đồ doanh thu
            const revenueData = transformRevenueByDateData(phanTichData);
            initializeRevenueChart(revenueData);
            
            // Cập nhật biểu đồ phân bổ doanh thu
            const distributionData = transformRevenueDistributionData(phanTichData);
            initializeRevenueDistributionChart(distributionData);
        } else {
            throw new Error('API responded with an error');
        }
    } catch (error) {
        console.error('Error in fetchRevenueAnalysisData:', error);
        // Hiển thị thông báo lỗi
        showChartError('revenue-chart', 'Không thể tải dữ liệu doanh thu');
        showChartError('revenue-distribution-chart', 'Không thể tải dữ liệu phân bổ doanh thu');
    } finally {
        // Ẩn spinner khi hoàn tất hoặc có lỗi
        if (revenueSpinner) {
            hideChartSpinner(revenueSpinner);
        }
        if (distributionSpinner) {
            hideChartSpinner(distributionSpinner);
        }
        
        // Đảm bảo container trở về trạng thái bình thường
        if (revenueChartElement && revenueChartElement.style.minHeight === '320px') {
            setTimeout(() => {
                revenueChartElement.style.minHeight = '';
            }, 100);
        }
        if (distributionChartElement && distributionChartElement.style.minHeight === '320px') {
            setTimeout(() => {
                distributionChartElement.style.minHeight = '';
            }, 100);
        }
    }
}

// Hàm để hiển thị dữ liệu phim với spinner
async function fetchMoviesData(startDate, endDate) {
    const urlBase = document.getElementById('thong-ke-app').dataset.url
    const chartContainer = document.getElementById('top-movies-chart');
    
    if (!chartContainer) return;
    
    // Đảm bảo container có position để định vị spinner
    if (getComputedStyle(chartContainer).position === 'static') {
        chartContainer.style.position = 'relative';
    }
    
    // Đảm bảo container có chiều cao đủ để hiển thị spinner
    if (chartContainer.clientHeight < 100) {
        chartContainer.style.minHeight = '320px';
    }
    
    // Hiển thị spinner cho biểu đồ
    const chartSpinner = showChartSpinner('top-movies-chart');
    
    try {
        // Gọi API và xử lý dữ liệu
        const top10PhimData = await fetchAPI(`${urlBase}/api/thong-ke/doanh-thu-top-10-phim?tuNgay=${startDate}&denNgay=${endDate}`);
        
        if (top10PhimData.success) {
            // Cập nhật biểu đồ top phim
            const moviesData = transformMoviesData(top10PhimData);
            
            // Cập nhật bảng phân tích
            updateAnalysisTable(moviesData, 'movie');
            
            // Khởi tạo biểu đồ
            initializeTopMoviesChart(moviesData);
        } else {
            console.error('Error fetching movies data:', top10PhimData);
            // Hiển thị thông báo lỗi
            showChartError('top-movies-chart', 'Không thể tải dữ liệu top phim');
            showTableError('analysis-table-body', 'Không thể tải dữ liệu phân tích phim');
        }
    } catch (error) {
        console.error('Error in fetchMoviesData:', error);
        // Hiển thị thông báo lỗi
        showChartError('top-movies-chart', 'Lỗi kết nối khi tải dữ liệu top phim');
        showTableError('analysis-table-body', 'Lỗi kết nối khi tải dữ liệu phân tích phim');
    } finally {
        // Đảm bảo spinner được ẩn đi bất kể có lỗi hay không
        if (chartSpinner) {
            hideChartSpinner(chartSpinner);
        }
        
        // Đảm bảo container trở về trạng thái bình thường
        if (chartContainer && chartContainer.style.minHeight === '320px') {
            // Chỉ reset minHeight nếu chúng ta đã thiết lập nó
            setTimeout(() => {
                chartContainer.style.minHeight = '';
            }, 100); // Nhỏ delay để đảm bảo chart đã render xong
        }
    }
}

// Cập nhật hàm fetchFoodsData
async function fetchFoodsData(startDate, endDate) {
    const urlBase = document.getElementById('thong-ke-app').dataset.url;
    const chartContainer = document.getElementById('top-foods-chart');
    
    if (!chartContainer) return;
    
    // Đảm bảo container có position để định vị spinner
    if (getComputedStyle(chartContainer).position === 'static') {
        chartContainer.style.position = 'relative';
    }
    
    // Đảm bảo container có chiều cao đủ để hiển thị spinner
    if (chartContainer.clientHeight < 100) {
        chartContainer.style.minHeight = '320px';
    }
    
    // Hiển thị spinner cho biểu đồ
    const chartSpinner = showChartSpinner('top-foods-chart');
    
    try {
        // Sửa đường dẫn API - đảm bảo đúng với route đã định nghĩa
        const top10SanPhamData = await fetchAPI(`${urlBase}/api/thong-ke/doanh-thu-top-10-san-pham?tuNgay=${startDate}&denNgay=${endDate}`);
        
        console.log('API response for top 10 foods:', top10SanPhamData); // Log để kiểm tra response
        
        if (top10SanPhamData.success && top10SanPhamData.data) {
            const foodsData = transformFoodsData(top10SanPhamData);
            
            // Cập nhật bảng phân tích
            updateAnalysisTable(foodsData, 'food');
            
            // Luôn hiển thị biểu đồ, ngay cả khi không có dữ liệu
            initializeTopFoodsChart(foodsData);
            
            // Nếu dữ liệu rỗng hoặc toàn số 0, hiển thị thông báo nhỏ bên dưới biểu đồ
            if (foodsData.length === 0 || foodsData.every(item => item.revenue === 0)) {
                addChartMessage('top-foods-chart', 'Doanh thu sản phẩm trong khoảng thời gian này đều là 0');
            }
        } else {
            console.error('Error fetching foods data:', top10SanPhamData);
            // Vẫn hiển thị biểu đồ trống thay vì thông báo lỗi
            initializeTopFoodsChart([]);
            showTableError('analysis-table-body', 'Không thể tải dữ liệu phân tích sản phẩm');
        }
    } catch (error) {
        console.error('Error in fetchFoodsData:', error);
        // Vẫn hiển thị biểu đồ trống thay vì thông báo lỗi
        initializeTopFoodsChart([]);
        showTableError('analysis-table-body', 'Lỗi kết nối khi tải dữ liệu phân tích sản phẩm');
    } finally {
        // Đảm bảo spinner được ẩn đi bất kể có lỗi hay không
        if (chartSpinner) {
            hideChartSpinner(chartSpinner);
        }
        
        // Đảm bảo container trở về trạng thái bình thường
        if (chartContainer && chartContainer.style.minHeight === '320px') {
            // Chỉ reset minHeight nếu chúng ta đã thiết lập nó
            setTimeout(() => {
                chartContainer.style.minHeight = '';
            }, 100); // Nhỏ delay để đảm bảo chart đã render xong
        }
    }
}

// Hàm để hiển thị suất chiếu với spinner
async function fetchShowtimesData(startDate, endDate) {
    const urlBase = document.getElementById('thong-ke-app').dataset.url
    const chartContainer = document.getElementById('showtime-effectiveness-chart');
    const tableContainer = document.getElementById('analysis-table-body');
    
    if (!chartContainer) return;
    
    // Đảm bảo container có position để định vị spinner
    if (getComputedStyle(chartContainer).position === 'static') {
        chartContainer.style.position = 'relative';
    }
    
    // Đảm bảo container có chiều cao đủ để hiển thị spinner
    if (chartContainer.clientHeight < 100) {
        chartContainer.style.minHeight = '320px';
    }
    
    // Hiển thị spinner cho biểu đồ
    const chartSpinner = showChartSpinner('showtime-effectiveness-chart');
    
    try {
        // Gọi API hiệu quả khung giờ
        const hieuQuaKhungGioData = await fetchAPI(`${urlBase}/api/thong-ke/hieu-qua-khung-gio-suat-chieu?tuNgay=${startDate}&denNgay=${endDate}`);
        
        if (hieuQuaKhungGioData.success) {
            // Cập nhật biểu đồ hiệu quả khung giờ
            const showtimesData = transformShowtimesData(hieuQuaKhungGioData);
            
            // Cập nhật bảng phân tích
            updateAnalysisTable(showtimesData, 'showtime');
            
            // Khởi tạo biểu đồ
            initializeShowtimeEffectivenessChart(showtimesData);
        } else {
            console.error('Error fetching showtimes data:', hieuQuaKhungGioData);
            // Hiển thị thông báo lỗi
            showChartError('showtime-effectiveness-chart', 'Không thể tải dữ liệu hiệu quả khung giờ');
            if (tableContainer) {
                showTableError('analysis-table-body', 'Không thể tải dữ liệu phân tích suất chiếu');
            }
        }
    } catch (error) {
        console.error('Error in fetchShowtimesData:', error);
        // Hiển thị thông báo lỗi
        showChartError('showtime-effectiveness-chart', 'Lỗi kết nối khi tải dữ liệu hiệu quả khung giờ');
        if (tableContainer) {
            showTableError('analysis-table-body', 'Lỗi kết nối khi tải dữ liệu phân tích suất chiếu');
        }
    } finally {
        // Đảm bảo spinner được ẩn đi bất kể có lỗi hay không
        if (chartSpinner) {
            hideChartSpinner(chartSpinner);
        }
        
        // Đảm bảo container trở về trạng thái bình thường
        if (chartContainer && chartContainer.style.minHeight === '320px') {
            // Chỉ reset minHeight nếu chúng ta đã thiết lập nó
            setTimeout(() => {
                chartContainer.style.minHeight = '';
            }, 100); // Nhỏ delay để đảm bảo chart đã render xong
        }
    }
}

// Hàm để hiển thị dữ liệu xu hướng khách hàng với spinner
async function fetchCustomerTrendsData(startDate, endDate) {
    const urlBase = document.getElementById('thong-ke-app').dataset.url;
    const customerTrendsElement = document.querySelector("#customer-trends-chart");
    
    if (!customerTrendsElement) return;
    
    // Đảm bảo container có position để định vị spinner
    if (getComputedStyle(customerTrendsElement).position === 'static') {
        customerTrendsElement.style.position = 'relative';
    }
    
    // Đảm bảo container có chiều cao đủ để hiển thị spinner
    if (customerTrendsElement.clientHeight < 100) {
        customerTrendsElement.style.minHeight = '320px';
    }
    
    // Hiển thị spinner cho biểu đồ xu hướng khách hàng
    const trendsChartSpinner = showChartSpinner('customer-trends-chart');
    const recommendationsSpinner = showSectionSpinner('business-recommendations');
    
    try {
        // Gọi API xu hướng khách hàng
        const xuHuongKhachHangData = await fetchAPI(`${urlBase}/api/thong-ke/xu-huong-khach-hang-theo-thoi-gian?tuNgay=${startDate}&denNgay=${endDate}`);
        
        if (xuHuongKhachHangData.success) {
            // Cập nhật biểu đồ xu hướng khách hàng
            const trendsData = transformCustomerTrendsData(xuHuongKhachHangData);
            initializeCustomerTrendsChart(trendsData);
            
            // Gọi API chi tiết để lấy thêm dữ liệu cho đề xuất
            const chiTietData = await fetchAPI(`${urlBase}/api/thong-ke/chi-tiet?tuNgay=${startDate}&denNgay=${endDate}`);

            if (chiTietData.success) {
                // Kết hợp dữ liệu để tạo đề xuất kinh doanh
                let adaptedData = {
                    success: true,
                    data: {
                        kyHienTai: {
                            tongDoanhThu: chiTietData.data.tong_ket?.tong_doanh_thu || 0,
                            soLuongKhachHang: xuHuongKhachHangData.data.tong_ket?.tong_so_khach || 0,
                            tiLeLapDayGhe: chiTietData.data.tong_ket?.ty_le_lap_day_trung_binh || 0,
                            doanhThuDoAnUongBinhQuan: chiTietData.data.tong_ket?.doanh_thu_do_an_binh_quan || 0
                        },
                        kyTruoc: {
                            tongDoanhThu: 0,
                            soLuongKhachHang: 0,
                            tiLeLapDayGhe: 0,
                            doanhThuDoAnUongBinhQuan: 0
                        }
                    }
                };

                const recommendations = generateRecommendations(
                    transformOverviewData(adaptedData),
                    transformMoviesData({success: true, data: {top_10_phim: chiTietData.data.phan_tich_phim || []}}),
                    transformFoodsData({success: true, data: {top_10_san_pham: chiTietData.data.phan_tich_do_an || []}}),
                    transformShowtimesData({success: true, data: {chiTietData: chiTietData.data.phan_tich_suat_chieu || []}}),
                    trendsData
                );
                
                // Cập nhật phần đề xuất kinh doanh
                updateBusinessRecommendations(recommendations);
            } else {
                console.error('Error fetching detail data for recommendations:', chiTietData);
                // Hiển thị đề xuất mặc định
                updateBusinessRecommendations([{
                    title: "Không thể tạo đề xuất chi tiết",
                    content: "Dữ liệu chi tiết không khả dụng. Vui lòng thử lại sau.",
                    type: "info"
                }]);
            }
        } else {
            console.error('Error fetching customer trends data:', xuHuongKhachHangData);
            // Hiển thị thông báo lỗi
            showChartError('customer-trends-chart', 'Không thể tải dữ liệu xu hướng khách hàng');
            // Hiển thị đề xuất mặc định
            updateBusinessRecommendations([{
                title: "Không thể tạo đề xuất",
                content: "Dữ liệu xu hướng khách hàng không khả dụng. Vui lòng thử lại sau.",
                type: "info"
            }]);
        }
    } catch (error) {
        console.error('Error in fetchCustomerTrendsData:', error);
        // Hiển thị thông báo lỗi
        showChartError('customer-trends-chart', 'Lỗi kết nối khi tải dữ liệu xu hướng khách hàng');
        // Hiển thị đề xuất mặc định
        updateBusinessRecommendations([{
            title: "Lỗi kết nối",
            content: "Không thể kết nối để tải dữ liệu đề xuất. Vui lòng thử lại sau.",
            type: "warning"
        }]);
    } finally {
        // Đảm bảo spinner được ẩn đi bất kể có lỗi hay không
        if (trendsChartSpinner) {
            hideChartSpinner(trendsChartSpinner);
        }
        if (recommendationsSpinner) {
            hideSpinner(recommendationsSpinner);
        }
        
        // Đảm bảo container trở về trạng thái bình thường
        if (customerTrendsElement && customerTrendsElement.style.minHeight === '320px') {
            // Chỉ reset minHeight nếu chúng ta đã thiết lập nó
            setTimeout(() => {
                customerTrendsElement.style.minHeight = '';
            }, 100); // Nhỏ delay để đảm bảo chart đã render xong
        }
    }
}

// Khởi tạo tất cả các biểu đồ
function initializeCharts(data) {
    initializeRevenueChart(data.revenueByDate);
    initializeRevenueDistributionChart(data.revenueDistribution);
    initializeTopMoviesChart(data.movies);
    initializeTopFoodsChart(data.foods);
    initializeShowtimeEffectivenessChart(data.showtimes);
    initializeCustomerTrendsChart(data.customerTrends);
}

// Biểu đồ doanh thu
function initializeRevenueChart(data) {
    const chartElement = document.querySelector("#revenue-chart");
    if (!chartElement) {
        console.error("Revenue chart container not found");
        return;
    }
    
    // Destroy previous chart instance if exists
    if (charts.revenueChart) {
        charts.revenueChart.destroy();
        charts.revenueChart = null;
    }
    
    // Xóa nội dung hiện tại của container, trừ spinner
    const children = [...chartElement.children];
    for (const child of children) {
        if (!child.classList.contains('spinner-container')) {
            chartElement.removeChild(child);
        }
    }
    
    const options = {
        series: [
            {
                name: 'Tổng doanh thu',
                type: 'line',
                data: data.map(item => item.total)
            },
            {
                name: 'Doanh thu vé',
                type: 'column',
                data: data.map(item => item.ticket)
            },
            {
                name: 'Doanh thu đồ ăn',
                type: 'column',
                data: data.map(item => item.food)
            }
        ],
        chart: {
            height: 320,
            type: 'line',
            stacked: false,
            toolbar: {
                show: true
            },
            zoom: {
                enabled: true
            },
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800
            },
            fontFamily: 'inherit',
            background: 'transparent',
            parentHeightOffset: 0
        },
        plotOptions: {
            bar: {
                columnWidth: '50%'
            }
        },
        stroke: {
            width: [4, 0, 0],
            curve: 'smooth'
        },
        xaxis: {
            categories: data.map(item => item.date)
        },
        yaxis: {
            title: {
                text: 'Doanh thu (VNĐ)'
            },
            labels: {
                formatter: function(val) {
                    return formatCurrencyShort(val);
                }
            }
        },
        legend: {
            position: 'top'
        },
        fill: {
            opacity: 1
        },
        colors: ['#1E40AF', '#3B82F6', '#93C5FD'],
        tooltip: {
            y: {
                formatter: function(val) {
                    return formatCurrency(val);
                }
            }
        }
    };

    try {
        // Tạo biểu đồ mới và lưu tham chiếu
        charts.revenueChart = new ApexCharts(chartElement, options);
        charts.revenueChart.render();
    } catch (error) {
        console.error("Error rendering revenue chart:", error);
        showChartError('revenue-chart', 'Lỗi khi hiển thị biểu đồ doanh thu');
    }
}

// Biểu đồ phân bổ doanh thu
function initializeRevenueDistributionChart(data) {
    const chartElement = document.querySelector("#revenue-distribution-chart");
    if (!chartElement) {
        console.error("Revenue distribution chart container not found");
        return;
    }
    
    // Destroy previous chart instance if exists
    if (charts.revenueDistributionChart) {
        charts.revenueDistributionChart.destroy();
        charts.revenueDistributionChart = null;
    }
    
    // Xóa nội dung hiện tại của container, trừ spinner
    const children = [...chartElement.children];
    for (const child of children) {
        if (!child.classList.contains('spinner-container')) {
            chartElement.removeChild(child);
        }
    }
    
    const options = {
        series: data.map(item => item.value),
        chart: {
            height: 320,
            type: 'pie',
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800
            },
            fontFamily: 'inherit',
            background: 'transparent',
            parentHeightOffset: 0
        },
        labels: data.map(item => item.name),
        colors: ['#3B82F6', '#10B981', '#F59E0B'],
        legend: {
            position: 'bottom'
        },
        responsive: [{
            breakpoint: 480,
            options: {
                chart: {
                    width: 300
                },
                legend: {
                    position: 'bottom'
                }
            }
        }],
        tooltip: {
            y: {
                formatter: function(val) {
                    return val + '%';
                }
            }
        }
    };
    
    try {
        // Tạo biểu đồ mới và lưu tham chiếu
        charts.revenueDistributionChart = new ApexCharts(chartElement, options);
        charts.revenueDistributionChart.render();
    } catch (error) {
        console.error("Error rendering revenue distribution chart:", error);
        showChartError('revenue-distribution-chart', 'Lỗi khi hiển thị biểu đồ phân bổ doanh thu');
    }
}

// Biểu đồ top 10 phim
function initializeTopMoviesChart(data) {
    const chartElement = document.querySelector("#top-movies-chart");
    if (!chartElement) {
        console.error("Top movies chart container not found");
        return;
    }
    
    // Destroy previous chart instance if exists
    if (charts.topMoviesChart) {
        charts.topMoviesChart.destroy();
        charts.topMoviesChart = null;
    }
    
    // Xóa nội dung hiện tại của container, trừ spinner
    const children = [...chartElement.children];
    for (const child of children) {
        if (!child.classList.contains('spinner-container')) {
            chartElement.removeChild(child);
        }
    }
    
    // Kiểm tra xem biểu đồ có rỗng không
    if (!data || data.length === 0) {
        showChartError('top-movies-chart', 'Không có dữ liệu phim', false);
        return;
    }
    
    // Sắp xếp theo doanh thu giảm dần
    const sortedData = [...data].sort((a, b) => b.revenue - a.revenue).slice(0, 10);
    
    // Kiểm tra nếu dữ liệu toàn số 0
    if (sortedData.every(item => item.revenue === 0)) {
        showChartError('top-movies-chart', 'Chưa có dữ liệu doanh thu phim trong khoảng thời gian này', false);
        return;
    }
    
    const options = {
        series: [{
            name: 'Doanh thu',
            data: sortedData.map(movie => movie.revenue)
        }],
        chart: {
            type: 'bar',
            height: 350,
            toolbar: {
                show: true
            }
        },
        plotOptions: {
            bar: {
                horizontal: true,
                barHeight: '70%',
                distributed: true,
                dataLabels: {
                    position: 'top'
                }
            }
        },
        colors: ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE', 
                 '#2563EB', '#1D4ED8', '#1E40AF', '#1E3A8A', '#172554'],
        dataLabels: {
            enabled: true,
            formatter: function(val) {
                return formatCurrencyShort(val);
            },
            offsetX: 30,
            style: {
                fontSize: '12px',
                colors: ['#304758']
            }
        },
        stroke: {
            width: 1,
            colors: ['#fff']
        },
        xaxis: {
            categories: sortedData.map(movie => movie.name),
            labels: {
                formatter: function(val) {
                    return formatCurrencyShort(val);
                }
            }
        },
        yaxis: {
            labels: {
                show: true
            }
        },
        tooltip: {
            y: {
                formatter: function(val) {
                    return formatCurrency(val);
                }
            }
        }
    };

    try {
        // Tạo biểu đồ mới và lưu tham chiếu
        charts.topMoviesChart = new ApexCharts(chartElement, options);
        charts.topMoviesChart.render();
    } catch (error) {
        console.error("Error rendering top movies chart:", error);
        showChartError('top-movies-chart', 'Lỗi khi hiển thị biểu đồ top phim');
    }
}

// Biểu đồ top 10 sản phẩm
function initializeTopFoodsChart(data) {
    const chartElement = document.querySelector("#top-foods-chart");
    if (!chartElement) {
        console.error("Top foods chart container not found");
        return;
    }
    
    // Destroy previous chart instance if exists
    if (charts.topFoodsChart) {
        charts.topFoodsChart.destroy();
        charts.topFoodsChart = null;
    }
    
    // Xóa nội dung hiện tại của container, trừ spinner
    const children = [...chartElement.children];
    for (const child of children) {
        if (!child.classList.contains('spinner-container')) {
            chartElement.removeChild(child);
        }
    }
    
    // Kiểm tra xem biểu đồ có rỗng không
    if (!data || data.length === 0) {
        showChartError('top-foods-chart', 'Không có dữ liệu sản phẩm', false);
        return;
    }
    
    // Sắp xếp theo doanh thu giảm dần
    const sortedData = [...data].sort((a, b) => b.revenue - a.revenue).slice(0, 10);
    
    // Kiểm tra nếu dữ liệu toàn số 0
    if (sortedData.every(item => item.revenue === 0)) {
        showChartError('top-foods-chart', 'Chưa có dữ liệu doanh thu sản phẩm trong khoảng thời gian này', false);
        return;
    }
    
    const options = {
        series: [{
            name: 'Doanh thu',
            data: sortedData.map(food => food.revenue)
        }],
        chart: {
            type: 'bar',
            height: 350,
            toolbar: {
                show: true
            }
        },
        plotOptions: {
            bar: {
                horizontal: true,
                barHeight: '70%',
                distributed: true,
                dataLabels: {
                    position: 'top'
                }
            }
        },
        colors: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5', 
                 '#059669', '#047857', '#065F46', '#064E3B', '#022C22'],
        dataLabels: {
            enabled: true,
            formatter: function(val) {
                return formatCurrencyShort(val);
            },
            offsetX: 30,
            style: {
                fontSize: '12px',
                colors: ['#304758']
            }
        },
        stroke: {
            width: 1,
            colors: ['#fff']
        },
        xaxis: {
            categories: sortedData.map(food => food.name),
            labels: {
                formatter: function(val) {
                    return formatCurrencyShort(val);
                }
            }
        },
        yaxis: {
            labels: {
                show: true
            }
        },
        tooltip: {
            y: {
                formatter: function(val) {
                    return formatCurrency(val);
                }
            }
        }
    };

    try {
        // Tạo biểu đồ mới và lưu tham chiếu
        charts.topFoodsChart = new ApexCharts(chartElement, options);
        charts.topFoodsChart.render();
    } catch (error) {
        console.error("Error rendering top foods chart:", error);
        showChartError('top-foods-chart', 'Lỗi khi hiển thị biểu đồ top sản phẩm');
    }
}

// Hàm hiển thị lỗi trong biểu đồ được cập nhật
function showChartError(containerId, message, showRetryButton = true) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Xóa spinner trước khi hiển thị lỗi
    const existingSpinner = container.querySelector('.epic-spinner-container');
    if (existingSpinner) {
        existingSpinner.remove();
    }
    
    // Xóa nội dung hiện tại ngoài spinner
    const children = [...container.children];
    for (const child of children) {
        if (!child.classList.contains('epic-spinner-container')) {
            container.removeChild(child);
        }
    }
    
    // Tạo thông báo lỗi
    const errorDiv = document.createElement('div');
    errorDiv.className = 'flex flex-col items-center justify-center h-full';
    
    let errorHTML = `
        <svg class="h-12 w-12 text-red-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p class="text-gray-700">${message}</p>
    `;
    
    if (showRetryButton) {
        errorHTML += `
            <button class="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none" onclick="retryLoadData()">
                Thử lại
            </button>
        `;
    }
    
    errorDiv.innerHTML = errorHTML;
    container.appendChild(errorDiv);
}

// Biểu đồ hiệu quả theo khung giờ chiếu
function initializeShowtimeEffectivenessChart(data) {
    const chartElement = document.querySelector("#showtime-effectiveness-chart");
    if (!chartElement) {
        console.error("Showtime effectiveness chart container not found");
        return;
    }
    
    // Destroy previous chart instance if exists
    if (charts.showtimeEffectivenessChart) {
        charts.showtimeEffectivenessChart.destroy();
        charts.showtimeEffectivenessChart = null;
    }
    
    // Xóa nội dung hiện tại của container, trừ spinner
    const children = [...chartElement.children];
    for (const child of children) {
        if (!child.classList.contains('spinner-container')) {
            chartElement.removeChild(child);
        }
    }
    
    // Kiểm tra xem biểu đồ có rỗng không
    if (!data || data.length === 0) {
        showChartError('showtime-effectiveness-chart', 'Không có dữ liệu khung giờ chiếu', false);
        return;
    }
    
    const options = {
        series: [{
            name: 'Tỷ lệ lấp đầy',
            type: 'column',
            data: data.map(item => item.occupancy)
        }, {
            name: 'Doanh thu',
            type: 'line',
            data: data.map(item => item.revenue / 1000000)
        }],
        chart: {
            height: 350,
            type: 'line',
            stacked: false
        },
        stroke: {
            width: [0, 4],
            curve: 'smooth'
        },
        plotOptions: {
            bar: {
                columnWidth: '50%'
            }
        },
        fill: {
            opacity: [0.85, 1],
            gradient: {
                inverseColors: false,
                shade: 'light',
                type: "vertical",
                opacityFrom: 0.85,
                opacityTo: 0.55,
                stops: [0, 100, 100, 100]
            }
        },
        markers: {
            size: 0
        },
        xaxis: {
            categories: data.map(item => item.time)
        },
        yaxis: [{
            title: {
                text: 'Tỷ lệ lấp đầy (%)',
            },
            min: 0,
            max: 100
        }, {
            opposite: true,
            title: {
                text: 'Doanh thu (Triệu VNĐ)'
            }
        }],
        tooltip: {
            shared: true,
            intersect: false,
            y: [{
                formatter: function (y) {
                    if(typeof y !== "undefined") {
                        return y.toFixed(0) + "%";
                    }
                    return y;
                }
            }, {
                formatter: function (y) {
                    if(typeof y !== "undefined") {
                        return formatCurrency(y * 1000000);
                    }
                    return y;
                }
            }]
        },
        colors: ['#F59E0B', '#7C3AED']
    };

    try {
        // Tạo biểu đồ mới và lưu tham chiếu
        charts.showtimeEffectivenessChart = new ApexCharts(chartElement, options);
        charts.showtimeEffectivenessChart.render();
    } catch (error) {
        console.error("Error rendering showtime effectiveness chart:", error);
        showChartError('showtime-effectiveness-chart', 'Lỗi khi hiển thị biểu đồ hiệu quả khung giờ');
    }
}

// Biểu đồ xu hướng khách hàng
function initializeCustomerTrendsChart(data) {
    const chartElement = document.querySelector("#customer-trends-chart");
    if (!chartElement) {
        console.error("Customer trends chart container not found");
        return;
    }
    
    // Destroy previous chart instance if exists
    if (charts.customerTrendsChart) {
        charts.customerTrendsChart.destroy();
        charts.customerTrendsChart = null;
    }
    
    // Xóa nội dung hiện tại của container, trừ spinner
    const children = [...chartElement.children];
    for (const child of children) {
        if (!child.classList.contains('spinner-container')) {
            chartElement.removeChild(child);
        }
    }
    
    const options = {
        series: [{
            name: 'Tổng khách',
            data: data.map(item => item.total)
        }, {
            name: 'Cuối tuần',
            data: data.map(item => item.weekend)
        }, {
            name: 'Ngày thường',
            data: data.map(item => item.weekday)
        }],
        chart: {
            type: 'area',
            height: 320, // Adjusted height to match other charts
            stacked: false,
            toolbar: {
                show: true
            },
            zoom: {
                enabled: true
            },
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800
            },
            fontFamily: 'inherit',
            background: 'transparent',
            parentHeightOffset: 0
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth',
            width: [3, 2, 2]
        },
        xaxis: {
            categories: data.map(item => item.date),
        },
        yaxis: {
            title: {
                text: 'Số lượng khách'
            },
        },
        tooltip: {
            shared: true,
            intersect: false,
        },
        fill: {
            type: 'gradient',
            gradient: {
                opacityFrom: 0.6,
                opacityTo: 0.1,
            }
        },
        colors: ['#7C3AED', '#F59E0B', '#10B981']
    };

    try {
        // Tạo biểu đồ mới và lưu tham chiếu
        charts.customerTrendsChart = new ApexCharts(chartElement, options);
        charts.customerTrendsChart.render();
    } catch (error) {
        console.error("Error rendering customer trends chart:", error);
        showChartError('customer-trends-chart', 'Lỗi khi hiển thị biểu đồ xu hướng khách hàng');
    }
}

// Hàm cập nhật bảng phân tích
function updateAnalysisTable(data, type) {
    const tableBody = document.getElementById('analysis-table-body');
    const tableHeader = document.getElementById('analysis-table-header');
    
    // Cập nhật header của bảng theo loại phân tích
    let headerHTML = `
        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            ${type === 'movie' ? 'Tên phim' : type === 'food' ? 'Tên đồ ăn/đồ uống' : 'Khung giờ'}
        </th>
        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Doanh thu
        </th>
        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            ${type === 'movie' || type === 'food' ? 'Số lượt' : 'Tỷ lệ lấp đầy'}
        </th>
        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Tỷ lệ đóng góp
        </th>
        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            So với kỳ trước
        </th>
    `;
    tableHeader.innerHTML = headerHTML;
    
    // Xóa dữ liệu cũ
    tableBody.innerHTML = '';
    
    // Thêm dữ liệu mới
    data.forEach(item => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        
        const quantityOrOccupancy = type === 'showtime' 
            ? `${item.occupancy}%` 
            : formatNumber(type === 'movie' ? item.tickets : item.quantity);
            
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ${item.name || item.time}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${formatCurrency(item.revenue)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${quantityOrOccupancy}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${item.contribution}%
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                ${getTrendBadge(item.trend)}
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Hàm cập nhật đề xuất kinh doanh
function updateBusinessRecommendations(recommendations) {
    const container = document.getElementById('business-recommendations');
    container.innerHTML = '';
    
    recommendations.forEach(rec => {
        const colorClass = rec.type === 'success' 
            ? 'bg-green-50 text-green-800 text-green-700' 
            : rec.type === 'warning' 
                ? 'bg-yellow-50 text-yellow-800 text-yellow-700' 
                : 'bg-blue-50 text-blue-800 text-blue-700';
        
        const iconClass = rec.type === 'success' 
            ? 'text-green-400' 
            : rec.type === 'warning' 
                ? 'text-yellow-400' 
                : 'text-blue-400';
                
        const iconSvg = rec.type === 'success' 
            ? '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />' 
            : rec.type === 'warning' 
                ? '<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />' 
                : '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clip-rule="evenodd" />';
        
        const recHTML = `
        <div class="${colorClass} p-4 rounded-md">
            <div class="flex">
                <div class="flex-shrink-0">
                    <svg class="h-5 w-5 ${iconClass}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        ${iconSvg}
                    </svg>
                </div>
                <div class="ml-3">
                    <h3 class="text-sm font-medium">${rec.title}</h3>
                    <div class="mt-2 text-sm">
                        <p>${rec.content}</p>
                    </div>
                </div>
            </div>
        </div>
        `;
        
        container.innerHTML += recHTML;
    });
}

// Hàm chuyển đổi tab phân tích
function switchAnalysisTab(button, type) {
    // Reset all buttons to default style
    document.getElementById('btn-movie-analysis').className = 'px-3 py-2 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';
    document.getElementById('btn-food-analysis').className = 'px-3 py-2 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';
    document.getElementById('btn-showtime-analysis').className = 'px-3 py-2 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';
    
    // Set active button style
    button.className = 'px-3 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';
    
    // Fetch data based on tab
    const dateRange = document.getElementById('date-range').value;
    if (dateRange === 'custom') {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        if (startDate && endDate) {
            fetchData('custom', { startDate, endDate, filterType: type });
        }
    } else {
        fetchData(dateRange, { filterType: type });
    }
}

// Xuất dữ liệu (mô phỏng)
function exportData() {
    alert('Đang xuất dữ liệu ra file Excel...');
    // Trong thực tế, đây sẽ gọi một API để tải về file Excel
}

// Các hàm định dạng dữ liệu
function formatCurrency(value) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

function formatCurrencyShort(value) {
    if (value >= 1000000000) {
        return (value / 1000000000).toFixed(1) + ' tỷ';
    } else if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + ' tr';
    } else if (value >= 1000) {
        return (value / 1000).toFixed(1) + ' k';
    }
    return value;
}

function formatNumber(value) {
    return new Intl.NumberFormat('vi-VN').format(value);
}

// Sửa hàm formatTrend để làm nổi bật số phần trăm
function formatTrend(value) {
    const isPositive = value >= 0;
    const arrow = isPositive ? '↑' : '↓';
    const colorClass = isPositive ? 'text-white font-bold' : 'text-white font-bold';
    const bgColorClass = isPositive ? 'bg-green-600 px-2 py-1 rounded' : 'bg-red-600 px-2 py-1 rounded';
    
    const span = document.createElement('span');
    span.className = `${colorClass} ${bgColorClass}`;
    span.textContent = `${arrow} ${Math.abs(value).toFixed(1)}%`;
    
    return span.outerHTML;
}

// Cập nhật hàm getTrendBadge để có cùng phong cách
function getTrendBadge(value) {
    const isPositive = value >= 0;
    const arrow = isPositive ? '↑' : '↓';
    const colorClass = isPositive ? 'bg-green-600 text-white' : 'bg-red-600 text-white';
    
    const span = document.createElement('span');
    span.className = `${colorClass} px-2 py-1 text-xs font-bold rounded-full`;
    span.textContent = `${arrow} ${Math.abs(value).toFixed(1)}%`;
    
    return span.outerHTML;
}

// Hiển thị spinner trong box thống kê
function showBoxSpinner(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return null;
    
    // Lưu giá trị hiện tại
    const currentValue = element.textContent;
    
    // Sử dụng Spinner module với tùy chọn kích thước nhỏ và không có overlay
    const spinner = Spinner.show({
        target: element,
        size: 'sm',
        overlay: false,
        text: 'Đang tải...'
    });
    
    return {
        element,
        currentValue,
        spinner
    };
}

// Ẩn spinner trong box thống kê
function hideBoxSpinner(spinnerInfo) {
    if (!spinnerInfo || !spinnerInfo.spinner) return;
    
    // Ẩn spinner
    Spinner.hide(spinnerInfo.spinner);
}

// Hiển thị spinner trong biểu đồ
function showChartSpinner(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return null;
    
    // Đảm bảo container có position để định vị spinner
    if (getComputedStyle(container).position === 'static') {
        container.style.position = 'relative';
    }
    
    // Đảm bảo container có chiều cao đủ để hiển thị spinner
    if (container.clientHeight < 100) {
        container.style.minHeight = '320px';
    }
    
    // Xóa nội dung hiện tại ngoài spinner
    const children = [...container.children];
    for (const child of children) {
        if (!child.classList.contains('epic-spinner-container') && 
            !child.classList.contains('chart-error')) {
            container.removeChild(child);
        }
    }
    
    // Xóa spinner hiện tại nếu có
    const existingSpinner = container.querySelector('.epic-spinner-container');
    if (existingSpinner) {
        existingSpinner.remove();
    }
    
    // Tạo phần tử container trống trước khi thêm spinner
    container.innerHTML = '';
    
    // Sử dụng Spinner module với z-index cao để đảm bảo hiển thị trên cùng
    return Spinner.show({
        target: container,
        size: 'md',
        overlay: true,
        text: 'Đang tải biểu đồ...',
        zIndex: 1000 // Đặt z-index cao hơn các phần tử khác
    });
}

// Đảm bảo spinner hiển thị đủ lâu
const spinnerShowTimes = {};

// Ẩn spinner trong biểu đồ
function hideChartSpinner(spinner) {
    if (!spinner) return;
    
    try {
        // Lấy ID của spinner (thường là một timestamp)
        const spinnerId = spinner.id;
        if (!spinnerId) {
            Spinner.hide(spinner);
            return;
        }
        
        // Ghi lại thời điểm spinner xuất hiện nếu chưa có
        if (!spinnerShowTimes[spinnerId]) {
            spinnerShowTimes[spinnerId] = Date.now();
        }
        
        // Tính toán thời gian đã hiển thị
        const showTime = Date.now() - spinnerShowTimes[spinnerId];
        const minShowTime = 800; // Thời gian tối thiểu spinner hiển thị (0.8 giây)
        
        if (showTime < minShowTime) {
            // Nếu spinner chưa hiển thị đủ lâu, đợi thêm một lúc
            setTimeout(() => {
                Spinner.hide(spinner);
                // Xóa khỏi object theo dõi sau khi đã ẩn
                delete spinnerShowTimes[spinnerId];
            }, minShowTime - showTime);
        } else {
            // Nếu đã hiển thị đủ lâu, ẩn spinner ngay lập tức
            Spinner.hide(spinner);
            // Xóa khỏi object theo dõi
            delete spinnerShowTimes[spinnerId];
        }
    } catch (error) {
        console.error('Error hiding spinner:', error);
        
        // Trong trường hợp có lỗi, vẫn cố gắng ẩn spinner
        try {
            Spinner.hide(spinner);
        } catch {}
    }
}

// Hiển thị spinner trong bảng
function showTableSpinner(tableBodyId) {
    const tableBody = document.getElementById(tableBodyId);
    if (!tableBody) return null;
    
    // Thay vì thay thế nội dung, thêm spinner trên bảng
    const parentElement = tableBody.parentElement;
    
    // Đảm bảo parentElement có position để định vị spinner
    if (getComputedStyle(parentElement).position === 'static') {
        parentElement.style.position = 'relative';
    }
    
    return Spinner.show({
        target: parentElement,
        text: 'Đang tải dữ liệu...',
        overlay: true
    });
}

// Ẩn spinner trong bảng
function hideTableSpinner(spinner) {
    Spinner.hide(spinner);
}

// Hiển thị spinner trong một section
function showSectionSpinner(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return null;
    
    // Đảm bảo section có position để định vị spinner
    if (getComputedStyle(section).position === 'static') {
        section.style.position = 'relative';
    }
    
    // Xóa spinner hiện tại nếu có
    const existingSpinner = section.querySelector('.epic-spinner-container');
    if (existingSpinner) {
        existingSpinner.remove();
    }
    
    // Xác định nội dung dựa trên sectionId
    let spinnerText = 'Đang tải dữ liệu...';
    if (sectionId === 'business-recommendations') {
        spinnerText = 'Đang phân tích dữ liệu để tạo đề xuất...';
    }
    
    return Spinner.show({
        target: section,
        text: spinnerText,
        overlay: true,
        zIndex: 1000,
        color: '#3B82F6' // Màu xanh để nổi bật hơn
    });
}

// Ẩn spinner trong một section với hiệu ứng trễ tối thiểu
function hideSpinner(spinner) {
    if (!spinner) return;
    
    try {
        // Lấy ID của spinner
        const spinnerId = spinner.id;
        if (!spinnerId) {
            Spinner.hide(spinner);
            return;
        }
        
        // Ghi lại thời điểm spinner xuất hiện nếu chưa có
        if (!spinnerShowTimes[spinnerId]) {
            spinnerShowTimes[spinnerId] = Date.now();
        }
        
        // Tính toán thời gian đã hiển thị
        const showTime = Date.now() - spinnerShowTimes[spinnerId];
        const minShowTime = 1000; // Thời gian tối thiểu spinner hiển thị (1 giây)
        
        if (showTime < minShowTime) {
            // Nếu spinner chưa hiển thị đủ lâu, đợi thêm một lúc
            setTimeout(() => {
                Spinner.hide(spinner);
                // Xóa khỏi object theo dõi sau khi đã ẩn
                delete spinnerShowTimes[spinnerId];
            }, minShowTime - showTime);
        } else {
            // Nếu đã hiển thị đủ lâu, ẩn spinner ngay lập tức
            Spinner.hide(spinner);
            // Xóa khỏi object theo dõi
            delete spinnerShowTimes[spinnerId];
        }
    } catch (error) {
        console.error('Error hiding spinner:', error);
        
        // Trong trường hợp có lỗi, vẫn cố gắng ẩn spinner
        try {
            Spinner.hide(spinner);
        } catch {}
    }
}


// Hiển thị lỗi trong bảng
function showTableError(tableBodyId, message) {
    const tableBody = document.getElementById(tableBodyId);
    if (!tableBody) return;
    
    tableBody.innerHTML = `
        <tr>
            <td colspan="5" class="px-6 py-8 text-center">
                <div class="flex flex-col items-center justify-center">
                    <svg class="h-8 w-8 text-red-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p class="text-gray-700">${message}</p>
                    <button class="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none" onclick="retryLoadData()">
                        Thử lại
                    </button>
                </div>
            </td>
        </tr>
    `;
}

// Hiển thị thông báo bên dưới biểu đồ
function addChartMessage(containerId, message) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Kiểm tra xem đã có thông báo nào chưa
    const existingMessage = container.querySelector('.chart-message');
    if (existingMessage) {
        existingMessage.textContent = message;
        return;
    }
    
    // Tạo thông báo mới
    const messageElement = document.createElement('div');
    messageElement.className = 'chart-message text-center text-sm text-gray-500 mt-2';
    messageElement.textContent = message;
    
    // Thêm vào cuối container
    container.appendChild(messageElement);
}

// Hàm thử lại tải dữ liệu
function retryLoadData() {
    const dateRange = document.getElementById('date-range').value;
    if (dateRange === 'custom') {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        if (startDate && endDate) {
            fetchData('custom', { startDate, endDate });
        }
    } else {
        fetchData(dateRange);
    }
}

// Cập nhật hàm updateOverviewData để hiển thị dữ liệu tổng quan
function updateOverviewData(overview) {
    // Cập nhật tổng doanh thu
    document.getElementById('total-revenue').textContent = formatCurrency(overview.totalRevenue);
    
    // Cập nhật xu hướng doanh thu
    const revenueTrendElement = document.getElementById('revenue-trend');
    revenueTrendElement.innerHTML = formatTrend(overview.revenueTrend);
    
    // Cập nhật số lượng khách hàng
    document.getElementById('total-customers').textContent = formatNumber(overview.totalCustomers);
    
    // Cập nhật xu hướng khách hàng
    const customerTrendElement = document.getElementById('customer-trend');
    customerTrendElement.innerHTML = formatTrend(overview.customerTrend);
    
    // Cập nhật tỷ lệ lấp đầy
    document.getElementById('occupancy-rate').textContent = overview.occupancyRate.toFixed(1) + '%';
    
    // Cập nhật xu hướng tỷ lệ lấp đầy
    const occupancyTrendElement = document.getElementById('occupancy-trend');
    occupancyTrendElement.innerHTML = formatTrend(overview.occupancyTrend);
    
    
    // Cập nhật doanh thu đồ ăn/khách
    document.getElementById('food-per-customer').textContent = formatCurrency(overview.foodPerCustomer);
    
    // Cập nhật xu hướng doanh thu đồ ăn/khách
    const foodTrendElement = document.getElementById('food-trend');
    foodTrendElement.innerHTML = formatTrend(overview.foodTrend);
}

// Biến để lưu trữ tham chiếu tới các biểu đồ
const charts = {
    revenueChart: null,
    revenueDistributionChart: null,
    topMoviesChart: null,
    topFoodsChart: null,
    showtimeEffectivenessChart: null,
    customerTrendsChart: null
};

// Hàm để xóa tất cả biểu đồ hiện tại
function destroyAllCharts() {
    Object.values(charts).forEach(chart => {
        if (chart) {
            try {
                chart.destroy();
            } catch (error) {
                console.error('Error destroying chart:', error);
            }
        }
    });
    
    // Reset các tham chiếu
    for (let key in charts) {
        charts[key] = null;
    }
    
    // Clean up any orphaned ApexCharts elements
    document.querySelectorAll('.apexcharts-canvas').forEach(element => {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    });
}

// Thêm hàm để tạo dữ liệu mẫu cho đồ ăn
function getSampleFoodsData() {
    return [
        { name: 'Bắp rang bơ (lớn)', revenue: 0, quantity: 0, contribution: 0, trend: 0 },
        { name: 'Coca Cola (lớn)', revenue: 0, quantity: 0, contribution: 0, trend: 0 },
        { name: 'Combo bắp + nước', revenue: 0, quantity: 0, contribution: 0, trend: 0 },
        { name: 'Khoai tây chiên', revenue: 0, quantity: 0, contribution: 0, trend: 0 },
        { name: 'Nachos', revenue: 0, quantity: 0, contribution: 0, trend: 0 }
    ];
}

// Hiển thị spinner trên tất cả biểu đồ ngay khi trang tải
function preShowAllSpinners() {
    // Xóa các biểu đồ hiện tại để tránh xung đột
    destroyAllCharts();
    
    // Thêm một chút trễ để đảm bảo DOM đã được cập nhật
    setTimeout(() => {
        // Hiển thị spinner cho các chỉ số tổng quan
        const overviewElements = [
            'total-revenue', 
            'total-customers', 
            'occupancy-rate', 
            'food-per-customer'
        ];
        
        overviewElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                // Thêm hiệu ứng nhấp nháy để biểu thị đang tải
                element.classList.add('animate-pulse', 'text-gray-300');
            }
        });
    
        // Danh sách các container cần hiển thị spinner
        const chartContainers = [
            'revenue-chart',
            'revenue-distribution-chart',
            'top-movies-chart',
            'top-foods-chart',
            'showtime-effectiveness-chart',
            'customer-trends-chart'
        ];
        
        // Hiển thị spinner cho mỗi container biểu đồ
        chartContainers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                // Xóa nội dung hiện tại để tránh xung đột
                container.innerHTML = '';
                
                // Đảm bảo container có position để định vị spinner
                container.style.position = 'relative';
                
                // Đảm bảo container có chiều cao đủ để hiển thị spinner
                container.style.minHeight = '320px';
                
                // Hiển thị spinner với văn bản tùy chỉnh theo từng biểu đồ
                const spinnerText = containerId === 'revenue-chart' ? 'Đang tải dữ liệu doanh thu...' :
                                  containerId === 'revenue-distribution-chart' ? 'Đang tải dữ liệu phân bổ doanh thu...' :
                                  containerId === 'top-movies-chart' ? 'Đang tải dữ liệu top phim...' :
                                  containerId === 'top-foods-chart' ? 'Đang tải dữ liệu top sản phẩm...' :
                                  containerId === 'showtime-effectiveness-chart' ? 'Đang tải dữ liệu suất chiếu...' :
                                  containerId === 'customer-trends-chart' ? 'Đang tải dữ liệu xu hướng khách hàng...' :
                                  'Đang tải dữ liệu...';
                                  
                const spinner = Spinner.show({
                    target: container,
                    size: 'md',
                    overlay: true,
                    text: spinnerText,
                    color: '#3B82F6' // Màu xanh để nổi bật hơn
                });
            }
        });
        
        // Hiển thị spinner cho khu vực đề xuất
        const recommendationsContainer = document.getElementById('business-recommendations');
        if (recommendationsContainer) {
            // Xóa nội dung hiện tại để tránh xung đột
            recommendationsContainer.innerHTML = '';
            
            showSectionSpinner('business-recommendations');
        }
        
        // Hiển thị spinner cho bảng phân tích
        const analysisTable = document.getElementById('analysis-table-body');
        if (analysisTable) {
            // Hiển thị một hàng spinner trong bảng
            analysisTable.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-8 text-center">
                        <div class="flex flex-col items-center justify-center">
                            <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                            <p class="mt-2 text-gray-700">Đang tải dữ liệu phân tích...</p>
                        </div>
                    </td>
                </tr>
            `;
        }
    }, 100);
}

//# sourceMappingURL=main.js.map