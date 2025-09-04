document.addEventListener('DOMContentLoaded', function() {
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

    // Xử lý chuyển đổi tab phân tích
    const btnMovieAnalysis = document.getElementById('btn-movie-analysis');
    const btnFoodAnalysis = document.getElementById('btn-food-analysis');
    const btnShowtimeAnalysis = document.getElementById('btn-showtime-analysis');

    btnMovieAnalysis.addEventListener('click', function() {
        switchAnalysisTab(this, 'movie');
    });

    btnFoodAnalysis.addEventListener('click', function() {
        switchAnalysisTab(this, 'food');
    });

    btnShowtimeAnalysis.addEventListener('click', function() {
        switchAnalysisTab(this, 'showtime');
    });

    // Xử lý xuất dữ liệu
    document.getElementById('btn-export-data').addEventListener('click', function() {
        exportData();
    });

    // Xử lý khi thay đổi loại thống kê
    document.getElementById('filter-type').addEventListener('change', function() {
        const dateRange = dateRangeSelect.value;
        if (dateRange === 'custom') {
            const startDate = document.getElementById('start-date').value;
            const endDate = document.getElementById('end-date').value;
            if (startDate && endDate) {
                fetchData('custom', { startDate, endDate, filterType: this.value });
            }
        } else {
            fetchData(dateRange, { filterType: this.value });
        }
    });

    // Khởi tạo dữ liệu mẫu và biểu đồ khi trang được tải
    initializeDashboard();
});

// Khởi tạo dashboard với dữ liệu mẫu
function initializeDashboard() {
    // Dữ liệu mẫu (trong thực tế, dữ liệu sẽ được lấy từ API)
    const sampleData = generateSampleData();
    
    // Hiển thị dữ liệu tổng quan
    updateOverviewData(sampleData.overview);
    
    // Khởi tạo các biểu đồ
    initializeCharts(sampleData);
    
    // Cập nhật bảng phân tích
    updateAnalysisTable(sampleData.movies, 'movie');
    
    // Hiển thị đề xuất kinh doanh
    updateBusinessRecommendations(sampleData.recommendations);
}

// Hàm tạo dữ liệu mẫu cho việc demo
function generateSampleData() {
    return {
        overview: {
            totalRevenue: 1250000000,
            revenueTrend: 8.5,
            totalCustomers: 28500,
            customerTrend: 12.3,
            occupancyRate: 72.5,
            occupancyTrend: -2.1,
            foodPerCustomer: 68000,
            foodTrend: 5.7
        },
        revenueByDate: [
            { date: '01/08', total: 32500000, ticket: 25000000, food: 7500000 },
            { date: '02/08', total: 35000000, ticket: 27000000, food: 8000000 },
            { date: '03/08', total: 41200000, ticket: 31000000, food: 10200000 },
            { date: '04/08', total: 38700000, ticket: 29500000, food: 9200000 },
            { date: '05/08', total: 42500000, ticket: 32000000, food: 10500000 },
            { date: '06/08', total: 51000000, ticket: 38000000, food: 13000000 },
            { date: '07/08', total: 57000000, ticket: 42000000, food: 15000000 }
        ],
        revenueDistribution: [
            { name: 'Vé phim', value: 75 },
            { name: 'Đồ ăn & Đồ uống', value: 20 },
            { name: 'Khác', value: 5 }
        ],
        movies: [
            { name: 'Avengers: Endgame', revenue: 250000000, tickets: 12500, contribution: 20, trend: 15 },
            { name: 'Spider-Man: No Way Home', revenue: 180000000, tickets: 9000, contribution: 14.4, trend: 8 },
            { name: 'Avatar 2', revenue: 165000000, tickets: 8250, contribution: 13.2, trend: -5 },
            { name: 'The Batman', revenue: 130000000, tickets: 6500, contribution: 10.4, trend: 12 },
            { name: 'Dune', revenue: 95000000, tickets: 4750, contribution: 7.6, trend: -2 },
            { name: 'Black Widow', revenue: 85000000, tickets: 4250, contribution: 6.8, trend: -10 },
            { name: 'Shang-Chi', revenue: 75000000, tickets: 3750, contribution: 6, trend: 3 },
            { name: 'No Time to Die', revenue: 72000000, tickets: 3600, contribution: 5.76, trend: -8 },
            { name: 'Venom 2', revenue: 68000000, tickets: 3400, contribution: 5.44, trend: 1 },
            { name: 'Fast & Furious 9', revenue: 60000000, tickets: 3000, contribution: 4.8, trend: -15 }
        ],
        foods: [
            { name: 'Bắp rang bơ (lớn)', revenue: 62000000, quantity: 12400, contribution: 24.8, trend: 10 },
            { name: 'Coca Cola (lớn)', revenue: 45000000, quantity: 15000, contribution: 18, trend: 5 },
            { name: 'Combo bắp + nước', revenue: 35000000, quantity: 3500, contribution: 14, trend: 20 },
            { name: 'Khoai tây chiên', revenue: 28000000, quantity: 7000, contribution: 11.2, trend: 15 },
            { name: 'Nachos', revenue: 22000000, quantity: 4400, contribution: 8.8, trend: -3 },
            { name: 'Nước suối', revenue: 18000000, quantity: 9000, contribution: 7.2, trend: 2 },
            { name: 'Trà sữa', revenue: 15000000, quantity: 3000, contribution: 6, trend: 25 },
            { name: 'Snack mix', revenue: 12000000, quantity: 3000, contribution: 4.8, trend: -5 },
            { name: 'Sandwich', revenue: 10000000, quantity: 2000, contribution: 4, trend: 8 },
            { name: 'Kem', revenue: 8000000, quantity: 2000, contribution: 3.2, trend: -10 }
        ],
        showtimes: [
            { time: '10:00 - 12:00', occupancy: 45, revenue: 85000000, contribution: 6.8, trend: -5 },
            { time: '12:00 - 14:00', occupancy: 62, revenue: 120000000, contribution: 9.6, trend: 8 },
            { time: '14:00 - 16:00', occupancy: 58, revenue: 110000000, contribution: 8.8, trend: 3 },
            { time: '16:00 - 18:00', occupancy: 67, revenue: 130000000, contribution: 10.4, trend: 5 },
            { time: '18:00 - 20:00', occupancy: 90, revenue: 220000000, contribution: 17.6, trend: 15 },
            { time: '20:00 - 22:00', occupancy: 95, revenue: 250000000, contribution: 20, trend: 10 },
            { time: '22:00 - 24:00', occupancy: 75, revenue: 180000000, contribution: 14.4, trend: -2 }
        ],
        customerTrends: [
            { date: '01/08', total: 3800, weekend: 2200, weekday: 1600 },
            { date: '02/08', total: 4000, weekend: 2300, weekday: 1700 },
            { date: '03/08', total: 4200, weekend: 2400, weekday: 1800 },
            { date: '04/08', total: 4100, weekend: 2350, weekday: 1750 },
            { date: '05/08', total: 4300, weekend: 2450, weekday: 1850 },
            { date: '06/08', total: 4500, weekend: 2600, weekday: 1900 },
            { date: '07/08', total: 4600, weekend: 2700, weekday: 1900 }
        ],
        recommendations: [
            {
                title: "Tối ưu giờ chiếu phim",
                content: "Khung giờ 18:00 - 22:00 đạt hiệu suất cao nhất với tỷ lệ lấp đầy hơn 90%. Nên tăng số lượng suất chiếu các bộ phim được ưa chuộng trong khung giờ này.",
                type: "success"
            },
            {
                title: "Khuyến mãi đồ ăn",
                content: "Combo bắp + nước có xu hướng tăng 20%. Nên tạo thêm các combo mới kết hợp các món bán chạy để tăng doanh thu F&B.",
                type: "info"
            },
            {
                title: "Cảnh báo doanh thu",
                content: "Doanh thu các suất chiếu sáng (10:00 - 12:00) đang giảm 5%. Cân nhắc giảm giá vé hoặc tạo chương trình khuyến mãi để thu hút khách hàng.",
                type: "warning"
            }
        ]
    };
}

// Hàm fetch dữ liệu từ API (mô phỏng)
function fetchData(dateRange, params = {}) {
    console.log('Fetching data for:', dateRange, params);
    // Trong môi trường thực tế, đây sẽ là một API call
    // Ở đây chúng ta sử dụng dữ liệu mẫu
    const sampleData = generateSampleData();
    
    // Cập nhật UI với dữ liệu mới
    updateOverviewData(sampleData.overview);
    initializeCharts(sampleData);
    
    const filterType = params.filterType || 'all';
    let analysisData = sampleData.movies;
    if (filterType === 'food') {
        analysisData = sampleData.foods;
    } else if (filterType === 'showtime') {
        analysisData = sampleData.showtimes;
    }
    
    updateAnalysisTable(analysisData, filterType);
    updateBusinessRecommendations(sampleData.recommendations);
}

// Cập nhật dữ liệu tổng quan
function updateOverviewData(data) {
    document.getElementById('total-revenue').textContent = formatCurrency(data.totalRevenue);
    document.getElementById('revenue-trend').innerHTML = formatTrend(data.revenueTrend);
    document.getElementById('total-customers').textContent = formatNumber(data.totalCustomers);
    document.getElementById('customer-trend').innerHTML = formatTrend(data.customerTrend);
    document.getElementById('occupancy-rate').textContent = `${data.occupancyRate}%`;
    document.getElementById('occupancy-trend').innerHTML = formatTrend(data.occupancyTrend);
    document.getElementById('food-per-customer').textContent = formatCurrency(data.foodPerCustomer);
    document.getElementById('food-trend').innerHTML = formatTrend(data.foodTrend);
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
            height: 350,
            type: 'line',
            stacked: false,
            toolbar: {
                show: true
            },
            zoom: {
                enabled: true
            }
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

    const chart = new ApexCharts(document.querySelector("#revenue-chart"), options);
    chart.render();
}

// Biểu đồ phân bổ doanh thu
function initializeRevenueDistributionChart(data) {
    const options = {
        series: data.map(item => item.value),
        chart: {
            height: 350,
            type: 'pie'
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

    const chart = new ApexCharts(document.querySelector("#revenue-distribution-chart"), options);
    chart.render();
}

// Biểu đồ top 10 phim
function initializeTopMoviesChart(data) {
    // Sắp xếp theo doanh thu giảm dần
    const sortedData = [...data].sort((a, b) => b.revenue - a.revenue).slice(0, 10);
    
    const options = {
        series: [{
            name: 'Doanh thu',
            data: sortedData.map(movie => movie.revenue)
        }],
        chart: {
            type: 'bar',
            height: 350
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

    const chart = new ApexCharts(document.querySelector("#top-movies-chart"), options);
    chart.render();
}

// Biểu đồ top 10 đồ ăn
function initializeTopFoodsChart(data) {
    // Sắp xếp theo doanh thu giảm dần
    const sortedData = [...data].sort((a, b) => b.revenue - a.revenue).slice(0, 10);
    
    const options = {
        series: [{
            name: 'Doanh thu',
            data: sortedData.map(food => food.revenue)
        }],
        chart: {
            type: 'bar',
            height: 350
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

    const chart = new ApexCharts(document.querySelector("#top-foods-chart"), options);
    chart.render();
}

// Biểu đồ hiệu quả theo khung giờ chiếu
function initializeShowtimeEffectivenessChart(data) {
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

    const chart = new ApexCharts(document.querySelector("#showtime-effectiveness-chart"), options);
    chart.render();
}

// Biểu đồ xu hướng khách hàng
function initializeCustomerTrendsChart(data) {
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
            height: 350,
            stacked: false,
            toolbar: {
                show: true
            },
            zoom: {
                enabled: true
            }
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

    const chart = new ApexCharts(document.querySelector("#customer-trends-chart"), options);
    chart.render();
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