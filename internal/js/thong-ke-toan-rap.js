// Import Spinner
import Spinner from './util/spinner.js';

document.addEventListener('DOMContentLoaded', function() {
    // Khai báo biến charts trong phạm vi hàm để tránh lỗi tham chiếu
    let revenueChart = null;
    let ticketsChart = null;
    let theaterPerformanceChart = null;
    let revenueBreakdownChart = null;
    let weeklyPerformanceChart = null;
    let hourlyPerformanceChart = null;
    let fnbPerTicketChart = null;

    // Variables for date range filter
    const dateRangeSelector = document.getElementById('date-range');
    const dateStartInput = document.getElementById('date-start');
    const dateEndInput = document.getElementById('date-end');
    const customDateContainer = document.querySelector('.date-range-custom');
    const applyFilterBtn = document.getElementById('btn-apply-filter');
    const compareToggle = document.getElementById('toggle-compare');
    const cinemaFilter = document.getElementById('cinema-filter');
    
    // Initialize state variables BEFORE using them
    let currentDateRange = 7;
    let compareWithPrevious = false;
    let selectedCinema = 'all';
    let currentTimePeriod = 'daily';

    // Set up initial dates FIRST before fetching data
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Format dates as YYYY-MM-DD
    const todayStr = today.toISOString().split('T')[0];
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
    
    dateStartInput.value = sevenDaysAgoStr;
    dateEndInput.value = todayStr;

    console.log('Initial dates set:', { start: sevenDaysAgoStr, end: todayStr });

    // Bắt đầu khởi tạo dữ liệu khi trang đã tải xong
    try {
        loadCinemaList(); // Load danh sách rạp trước
        initializeKPICards();
        initializeCharts();
        initializeTables();
        updateLastUpdateTime();
        populateAllFilmsTable()
    } catch (error) {
        console.error('Lỗi khởi tạo:', error);
    }
    
    // Load danh sách rạp phim từ API
    async function loadCinemaList() {
        try {
            const response = await fetch('/rapphim/api/rap-phim', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Cinema list API response:', result);

            if (result.success && result.data) {
                const cinemaSelect = document.getElementById('cinema-filter');
                
                // Xóa các option cũ (trừ option "Tất cả rạp")
                cinemaSelect.innerHTML = '<option value="all" selected>Tất cả rạp</option>';
                
                // Thêm các rạp từ API
                result.data.forEach(cinema => {
                    const option = document.createElement('option');
                    option.value = cinema.id;
                    option.textContent = cinema.ten;
                    cinemaSelect.appendChild(option);
                });

                console.log('Cinema list loaded successfully');
            } else {
                console.error('Invalid cinema list data structure:', result);
            }
        } catch (error) {
            console.error('Error loading cinema list:', error);
            // Giữ nguyên option mặc định nếu có lỗi
        }
    }
    
    // Update last update time
    function updateLastUpdateTime() {
        const lastUpdateElement = document.getElementById('last-update');
        if (lastUpdateElement) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('vi-VN', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
            });
            lastUpdateElement.textContent = timeString;
        }
    }
    
    // Update time every minute
    setInterval(updateLastUpdateTime, 60000);

    // Date range selector event
    dateRangeSelector.addEventListener('change', function() {
        if (this.value === 'custom') {
            customDateContainer.classList.remove('hidden');
        } else {
            customDateContainer.classList.add('hidden');
            currentDateRange = parseInt(this.value);
            
            // Tự động điều chỉnh time period dựa trên số ngày
            if (currentDateRange <= 7) {
                currentTimePeriod = 'daily';
            } else if (currentDateRange <= 60) {
                currentTimePeriod = 'weekly';
            } else {
                currentTimePeriod = 'monthly';
            }
            
            // Update active state cho time filter buttons
            updateTimeFilterButtons();
        }
    });

    // Apply filter event
    applyFilterBtn.addEventListener('click', function() {
        compareWithPrevious = compareToggle.checked;
        selectedCinema = cinemaFilter.value;

        if (dateRangeSelector.value === 'custom') {
            // Custom date range logic
            const startDate = new Date(dateStartInput.value);
            const endDate = new Date(dateEndInput.value);
            // Calculate difference in days
            const diffTime = Math.abs(endDate - startDate);
            currentDateRange = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            // Tự động điều chỉnh time period dựa trên số ngày
            if (currentDateRange <= 7) {
                currentTimePeriod = 'daily';
            } else if (currentDateRange <= 60) {
                currentTimePeriod = 'weekly';
            } else {
                currentTimePeriod = 'monthly';
            }
            
            // Update active state cho time filter buttons
            updateTimeFilterButtons();
        }
        
        // Update all charts and data
        updateAllData();
    });

    // Time period filter for charts
    const timeFilters = document.querySelectorAll('.time-filter');
    timeFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            // Update active filter
            timeFilters.forEach(btn => {
                btn.classList.remove('filter-active');
                btn.classList.remove('bg-red-500', 'text-white', 'border-red-500');
                btn.classList.add('bg-white', 'text-gray-700', 'border-gray-300');
            });
            this.classList.add('filter-active');
            this.classList.remove('bg-white', 'text-gray-700', 'border-gray-300');
            this.classList.add('bg-red-500', 'text-white', 'border-red-500');
            
            // Update time period
            currentTimePeriod = this.getAttribute('data-period');
            
            // Update charts
            updateChartsByTimePeriod();
        });
    });

    // Function to update time filter buttons active state
    function updateTimeFilterButtons() {
        timeFilters.forEach(btn => {
            const period = btn.getAttribute('data-period');
            btn.classList.remove('filter-active');
            btn.classList.remove('bg-red-500', 'text-white', 'border-red-500');
            btn.classList.add('bg-white', 'text-gray-700', 'border-gray-300');
            
            if (period === currentTimePeriod) {
                btn.classList.add('filter-active');
                btn.classList.remove('bg-white', 'text-gray-700', 'border-gray-300');
                btn.classList.add('bg-red-500', 'text-white', 'border-red-500');
            }
        });
    }

    // Initialize time filter buttons on page load
    updateTimeFilterButtons();

    // Utility functions
    function formatCurrency(value) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    }

    function formatNumber(value) {
        return new Intl.NumberFormat('vi-VN').format(value);
    }

    function formatPercent(value) {
        return new Intl.NumberFormat('vi-VN', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value / 100);
    }

    function getRandomData(min, max, length) {
        return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min);
    }

    function getDates(days) {
        const dates = [];
        const today = new Date();
        
        for (let i = days; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            dates.push(date.toISOString().split('T')[0]);
        }
        
        return dates;
    }

    function showToast(message) {
        // Create toast element if it doesn't exist
        let toast = document.getElementById('toast-notification');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast-notification';
            toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg transform transition-all duration-300 translate-y-20 opacity-0';
            document.body.appendChild(toast);
        }
        
        // Set message and show
        toast.textContent = message;
        toast.classList.remove('translate-y-20', 'opacity-0');
        
        // Hide after 3 seconds
        setTimeout(() => {
            toast.classList.add('translate-y-20', 'opacity-0');
        }, 3000);
    }

    // KPI Cards Functions
    async function initializeKPICards() {
        await fetchAndUpdateKPICards();
    }

    async function updateKPICards() {
        await fetchAndUpdateKPICards();
    }

    async function fetchAndUpdateKPICards() {
        // Hiển thị spinner cho từng KPI card
        const spinnerRevenue = Spinner.show({
            target: document.getElementById('total-revenue').parentElement,
            text: 'Đang tải...',
            size: 'sm'
        });
        const spinnerTickets = Spinner.show({
            target: document.getElementById('total-tickets').parentElement,
            text: 'Đang tải...',
            size: 'sm'
        });
        const spinnerOccupancy = Spinner.show({
            target: document.getElementById('avg-occupancy').parentElement,
            text: 'Đang tải...',
            size: 'sm'
        });
        const spinnerFnb = Spinner.show({
            target: document.getElementById('fnb-revenue').parentElement,
            text: 'Đang tải...',
            size: 'sm'
        });

        hideTrendIndicators();

        try {
            // Get filter values
            const tuNgay = dateStartInput.value;
            const denNgay = dateEndInput.value;
            const idRap = selectedCinema;
            const soSanh = compareWithPrevious;

            // Build API URL
            const params = new URLSearchParams({
                tuNgay: tuNgay,
                denNgay: denNgay,
                idRap: idRap,
                soSanh: soSanh ? 'true' : 'false'
            });

            const baseUrl = document.getElementById('btn-apply-filter').dataset.url || '';
            const apiUrl = `${baseUrl}/api/thong-ke-toan-rap/tong-quat?${params.toString()}`;

            // Fetch data from API
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success && result.data) {
                const data = result.data;

                // Update KPI values
                document.getElementById('total-revenue').textContent = formatCurrency(data.tong_doanh_thu || 0);
                document.getElementById('total-tickets').textContent = formatNumber(data.tong_ve_ban || 0);
                document.getElementById('avg-occupancy').textContent = formatPercent(data.ty_le_lap_day || 0);
                document.getElementById('fnb-revenue').textContent = formatCurrency(data.doanh_thu_fnb || 0);

                // Update trend indicators if comparison is enabled
                if (soSanh && data.so_sanh) {
                    updateTrendIndicator('revenue-trend', data.so_sanh.doanh_thu_phan_tram_thay_doi || 0);
                    updateTrendIndicator('tickets-trend', data.so_sanh.ve_phan_tram_thay_doi || 0);
                    updateTrendIndicator('occupancy-trend', data.so_sanh.ty_le_lap_day_phan_tram_thay_doi || 0);
                    updateTrendIndicator('fnb-trend', data.so_sanh.fnb_phan_tram_thay_doi || 0);
                } else {
                    hideTrendIndicators();
                }
            } else {
                throw new Error(result.message || 'Không thể tải dữ liệu');
            }

        } catch (error) {
            console.error('Error fetching KPI data:', error);
            showToast('Lỗi khi tải dữ liệu: ' + error.message);

            // Show default values on error
            document.getElementById('total-revenue').textContent = formatCurrency(0);
            document.getElementById('total-tickets').textContent = formatNumber(0);
            document.getElementById('avg-occupancy').textContent = formatPercent(0);
            document.getElementById('fnb-revenue').textContent = formatCurrency(0);
            hideTrendIndicators();
        } finally {
            // Ẩn spinner cho từng KPI card
            Spinner.hide(spinnerRevenue);
            Spinner.hide(spinnerTickets);
            Spinner.hide(spinnerOccupancy);
            Spinner.hide(spinnerFnb);
        }
    }

    function showLoadingState() {
        document.getElementById('total-revenue').textContent = '---';
        document.getElementById('total-tickets').textContent = '---';
        document.getElementById('avg-occupancy').textContent = '---';
        document.getElementById('fnb-revenue').textContent = '---';
    }

    function hideTrendIndicators() {
        const trendElements = ['revenue-trend', 'tickets-trend', 'occupancy-trend', 'fnb-trend'];
        trendElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.style.display = 'none';
            }
        });
    }

    function updateTrendIndicator(elementId, changePercent) {
        const element = document.getElementById(elementId);
        if (!element) return;

        // Show the element
        element.style.display = 'inline-flex';

        const iconElement = element.querySelector('svg');
        const textElement = element.querySelector('span');
        
        const percentValue = parseFloat(changePercent);
        textElement.textContent = `${percentValue > 0 ? '+' : ''}${percentValue.toFixed(1)}%`;
        
        // Remove all existing classes
        element.className = 'inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-full border';
        
        if (percentValue > 0) {
            // Positive trend - green
            element.classList.add('bg-green-100', 'text-green-700', 'border-green-300');
            iconElement.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />';
        } else if (percentValue < 0) {
            // Negative trend - red
            element.classList.add('bg-red-100', 'text-red-700', 'border-red-300');
            iconElement.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />';
        } else {
            // No change - gray
            element.classList.add('bg-gray-100', 'text-gray-700', 'border-gray-300');
            iconElement.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14" />';
        }
    }

    // Charts Initialization Functions
    function initializeRevenueChart() {
        const chartElement = document.querySelector("#revenue-chart");
        if (!chartElement) {
            console.error("Revenue chart container not found");
            return;
        }

        // Khởi tạo biểu đồ với dữ liệu trống
        const options = {
            series: [{
                name: 'Doanh thu',
                data: []
            }],
            chart: {
                type: 'area',
                height: 350,
                zoom: {
                    enabled: true
                },
                toolbar: {
                    show: false
                }
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: 'smooth',
                width: 2
            },
            colors: ['#EF4444'],
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.7,
                    opacityTo: 0.2,
                    stops: [0, 100]
                }
            },
            xaxis: {
                categories: [],
                labels: {
                    formatter: function(value) {
                        return value; // Đã format từ API
                    }
                }
            },
            yaxis: {
                labels: {
                    formatter: function(value) {
                        // Tự động chọn đơn vị phù hợp
                        if (value >= 1000000) {
                            return (value / 1000000).toFixed(1) + ' tr';
                        } else if (value >= 1000) {
                            return (value / 1000).toFixed(0) + ' k';
                        } else {
                            return value.toFixed(0);
                        }
                    }
                }
            },
            tooltip: {
                y: {
                    formatter: function(value) {
                        return formatCurrency(value);
                    }
                }
            },
            noData: {
                text: 'Đang tải dữ liệu...',
                align: 'center',
                verticalAlign: 'middle',
                style: {
                    fontSize: '16px',
                    color: '#999'
                }
            }
        };
        
        // Khởi tạo biểu đồ
        revenueChart = new ApexCharts(chartElement, options);
        revenueChart.render();
        
        // Load dữ liệu ngay lập tức
        fetchRevenueChartData();
    }

    function initializeTicketsChart() {
        const chartElement = document.querySelector("#tickets-chart");
        if (!chartElement) {
            console.error("Tickets chart container not found");
            return;
        }

        // Khởi tạo biểu đồ với dữ liệu trống
        const options = {
            series: [{
                name: 'Số vé bán',
                data: []
            }],
            chart: {
                type: 'area',
                height: 350,
                zoom: {
                    enabled: true
                },
                toolbar: {
                    show: false
                }
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: 'smooth',
                width: 2
            },
            colors: ['#3B82F6'],
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.7,
                    opacityTo: 0.2,
                    stops: [0, 100]
                }
            },
            xaxis: {
                categories: [],
                labels: {
                    formatter: function(value) {
                        return value; // Đã format từ API
                    }
                }
            },
            tooltip: {
                y: {
                    formatter: function(value) {
                        return formatNumber(value) + ' vé';
                    }
                }
            },
            noData: {
                text: 'Đang tải dữ liệu...',
                align: 'center',
                verticalAlign: 'middle',
                style: {
                    fontSize: '16px',
                    color: '#999'
                }
            }
        };
        
        // Khởi tạo biểu đồ
        ticketsChart = new ApexCharts(chartElement, options);
        ticketsChart.render();
        
        // Load dữ liệu ngay lập tức
        fetchTicketsChartData();
    }

    function initializeTheaterPerformanceChart() {
        const chartElement = document.querySelector("#theater-performance-chart");
        if (!chartElement) {
            console.error("Theater performance chart container not found");
            return;
        }

        // Khởi tạo biểu đồ với dữ liệu trống
        const options = {
            series: [{
                name: 'Doanh thu',
                data: []
            }],
            chart: {
                type: 'bar',
                height: 350,
                toolbar: {
                    show: false
                }
            },
            colors: ['#10B981'],
            plotOptions: {
                bar: {
                    borderRadius: 4,
                    horizontal: false,
                    columnWidth: '55%',
                    endingShape: 'rounded'
                },
            },
            dataLabels: {
                enabled: false
            },
            xaxis: {
                categories: [],
            },
            yaxis: {
                title: {
                    text: 'Doanh thu (tỷ đồng)'
                },
                labels: {
                    formatter: function(value) {
                        return (value / 1000000000).toFixed(1);
                    }
                }
            },
            tooltip: {
                y: {
                    formatter: function(value) {
                        return formatCurrency(value);
                    }
                }
            },
            noData: {
                text: 'Đang tải dữ liệu...',
                align: 'center',
                verticalAlign: 'middle',
                style: {
                    fontSize: '16px',
                    color: '#999'
                }
            }
        };
        
        theaterPerformanceChart = new ApexCharts(chartElement, options);
        theaterPerformanceChart.render();
        
        // Load dữ liệu ngay lập tức
        fetchTheaterPerformanceData();
    }

    function initializeRevenueBreakdownChart() {
        const chartElement = document.querySelector("#revenue-breakdown-chart");
        if (!chartElement) {
            console.error("Revenue breakdown chart container not found");
            return;
        }

        const options = {
            series: [],
            chart: {
                type: 'donut',
                height: 350
            },
            labels: [],
            colors: ['#EF4444', '#F59E0B'], // Chỉ 2 màu: Đỏ (Vé phim) và Cam (F&B)
            responsive: [{
                breakpoint: 480,
                options: {
                    chart: {
                        width: 200
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }],
            tooltip: {
                y: {
                    formatter: function(value) {
                        return value.toFixed(1) + '%';
                    }
                }
            },
            noData: {
                text: 'Đang tải dữ liệu...',
                align: 'center',
                verticalAlign: 'middle',
                style: {
                    fontSize: '16px',
                    color: '#999'
                }
            }
        };
        
        revenueBreakdownChart = new ApexCharts(chartElement, options);
        revenueBreakdownChart.render();
        
        // Load dữ liệu ngay lập tức
        fetchRevenueBreakdownData();
    }

    function initializeWeeklyPerformanceChart() {
        const chartElement = document.querySelector("#weekly-performance-chart");
        if (!chartElement) {
            console.error("Weekly performance chart container not found");
            return;
        }

        const options = {
            series: [{
                name: 'Vé bán',
                type: 'column',
                data: []
            }, {
                name: 'Tỷ lệ lấp đầy',
                type: 'line',
                data: []
            }],
            chart: {
                height: 350,
                type: 'line',
                stacked: false,
                toolbar: {
                    show: false
                }
            },
            stroke: {
                width: [0, 3],
                curve: 'smooth'
            },
            plotOptions: {
                bar: {
                    columnWidth: '50%'
                }
            },
            colors: ['#10B981', '#F59E0B'],
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
                categories: ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'],
            },
            yaxis: [{
                title: {
                    text: 'Vé bán',
                },
                seriesName: 'Vé bán'
            }, {
                opposite: true,
                title: {
                    text: 'Tỷ lệ lấp đầy (%)'
                },
                seriesName: 'Tỷ lệ lấp đầy',
                min: 0,
                max: 100
            }],
            tooltip: {
                shared: true,
                intersect: false,
                y: [{
                    formatter: function(y) {
                        return formatNumber(y) + " vé";
                    }
                }, {
                    formatter: function(y) {
                        return y + "%";
                    }
                }]
            },
            noData: {
                text: 'Đang tải dữ liệu...',
                align: 'center',
                verticalAlign: 'middle',
                style: {
                    fontSize: '16px',
                    color: '#999'
                }
            }
        };
        
        weeklyPerformanceChart = new ApexCharts(chartElement, options);
        weeklyPerformanceChart.render();
        
        // Load dữ liệu ngay lập tức
        fetchWeeklyPerformanceData();
    }

    function initializeHourlyPerformanceChart() {
        const chartElement = document.querySelector("#hourly-performance-chart");
        if (!chartElement) {
            console.error("Hourly performance chart container not found");
            return;
        }

        const options = {
            series: [{
                name: 'Tỷ lệ lấp đầy',
                data: []
            }],
            chart: {
                type: 'area',
                height: 350,
                toolbar: {
                    show: false
                }
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: 'smooth',
                width: 2
            },
            colors: ['#8B5CF6'],
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.7,
                    opacityTo: 0.2,
                    stops: [0, 100]
                }
            },
            xaxis: {
                categories: []
            },
            yaxis: {
                title: {
                    text: 'Tỷ lệ lấp đầy (%)'
                },
                min: 0,
                max: 100
            },
            tooltip: {
                y: {
                    formatter: function(value) {
                        return value + '%';
                    }
                }
            },
            noData: {
                text: 'Đang tải dữ liệu...',
                align: 'center',
                verticalAlign: 'middle',
                style: {
                    fontSize: '16px',
                    color: '#999'
                }
            }
        };
        
        hourlyPerformanceChart = new ApexCharts(chartElement, options);
        hourlyPerformanceChart.render();
        
        // Load dữ liệu ngay lập tức
        fetchHourlyPerformanceData();
    }

    function initializeFnBPerTicketChart() {
        const chartElement = document.querySelector("#fnb-per-ticket-chart");
        if (!chartElement) {
            console.error("F&B per ticket chart container not found");
            return;
        }

        // Khởi tạo biểu đồ với dữ liệu trống
        const options = {
            series: [{
                name: 'F&B/Đơn hàng',
                data: []
            }],
            chart: {
                type: 'bar',
                height: 350,
                toolbar: {
                    show: false
                }
            },
            plotOptions: {
                bar: {
                    borderRadius: 4,
                    columnWidth: '70%',
                }
            },
            colors: ['#F59E0B'],
            dataLabels: {
                enabled: false
            },
            xaxis: {
                categories: [],
                labels: {
                    rotate: -45,
                    rotateAlways: false,
                    hideOverlappingLabels: true,
                    trim: true,
                    style: {
                        fontSize: '11px'
                    }
                },
                tickPlacement: 'on'
            },
            yaxis: {
                title: {
                    text: 'VNĐ/đơn hàng'
                },
                labels: {
                    formatter: function(value) {
                        if (value >= 1000000) {
                            return (value / 1000000).toFixed(1) + 'M';
                        } else if (value >= 1000) {
                            return (value / 1000).toFixed(0) + 'K';
                        }
                        return value.toFixed(0);
                    }
                }
            },
            tooltip: {
                y: {
                    formatter: function(value) {
                        return formatCurrency(value) + '/đơn hàng';
                    }
                }
            },
            noData: {
                text: 'Đang tải dữ liệu...',
                align: 'center',
                verticalAlign: 'middle',
                style: {
                    fontSize: '16px',
                    color: '#999'
                }
            }
        };
        
        fnbPerTicketChart = new ApexCharts(chartElement, options);
        fnbPerTicketChart.render();
        
        // Load dữ liệu ngay lập tức
        fetchFnBPerOrderData();
    }

    // Master initialization function
    function initializeCharts() {
        // Wrap each initialization in try-catch to prevent errors from stopping initialization of other charts
        try { initializeRevenueChart(); } catch (e) { console.error("Error initializing revenue chart:", e); }
        try { initializeTicketsChart(); } catch (e) { console.error("Error initializing tickets chart:", e); }
        try { initializeTheaterPerformanceChart(); } catch (e) { console.error("Error initializing theater performance chart:", e); }
        try { initializeRevenueBreakdownChart(); } catch (e) { console.error("Error initializing revenue breakdown chart:", e); }
        // try { initializeWeeklyPerformanceChart(); } catch (e) { console.error("Error initializing weekly performance chart:", e); }
        // try { initializeHourlyPerformanceChart(); } catch (e) { console.error("Error initializing hourly performance chart:", e); }
        try { initializeFnBPerTicketChart(); } catch (e) { console.error("Error initializing F&B per ticket chart:", e); }
    }

    // Update charts function
    function updateAllData() {
        // This function would fetch real data from an API based on filters
        // For demo, we'll update with new random data
        updateKPICards();
        updateCharts();
        updateTables();
        
        // Show a toast notification
        showToast('Dữ liệu đã được cập nhật');
    }

    function updateChartsByTimePeriod() {
        // Update charts based on time period selection
        if (revenueChart) updateRevenueChart();
        if (ticketsChart) updateTicketsChart();
    }

    function updateCharts() {
        if (revenueChart) updateRevenueChart();
        if (ticketsChart) updateTicketsChart();
        if (theaterPerformanceChart) updateTheaterPerformanceChart();
        if (revenueBreakdownChart) updateRevenueBreakdownChart();
        if (weeklyPerformanceChart) updateWeeklyPerformanceChart();
        if (hourlyPerformanceChart) updateHourlyPerformanceChart();
        if (fnbPerTicketChart) updateFnBPerTicketChart();
    }

    function updateRevenueChart() {
        // Fetch real data from API
        fetchRevenueChartData();
    }

    async function fetchRevenueChartData() {
        // Hiển thị spinner
        const chartElement = document.querySelector("#revenue-chart");
        const spinner = Spinner.show({
            target: chartElement.parentElement,
            text: 'Đang tải dữ liệu doanh thu...',
            size: 'md'
        });

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

            console.log('Fetching revenue chart data from:', apiUrl);

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success && result.data) {
                const data = result.data;
                const categories = data.danh_sach_nhan;
                const revenueData = data.chi_tiet.map(item => item.tong_doanh_thu);
                
                // Xác định số lượng label để hiển thị dựa trên số ngày
                const dataCount = categories.length;
                let tickAmount = dataCount;
                let rotate = -45;
                
                if (currentTimePeriod === 'daily') {
                    if (dataCount > 30) {
                        tickAmount = 15; // Chỉ hiển thị 15 labels
                        rotate = -45;
                    } else if (dataCount > 15) {
                        tickAmount = Math.ceil(dataCount / 2);
                        rotate = -45;
                    } else if (dataCount > 7) {
                        tickAmount = dataCount;
                        rotate = -45;
                    } else {
                        tickAmount = dataCount;
                        rotate = 0;
                    }
                } else if (currentTimePeriod === 'weekly') {
                    tickAmount = Math.min(dataCount, 8);
                    rotate = -45;
                } else { // monthly
                    tickAmount = dataCount;
                    rotate = -45;
                }
                
                revenueChart.updateOptions({
                    xaxis: {
                        categories: categories,
                        tickAmount: tickAmount,
                        labels: {
                            formatter: function(value) {
                                return value; // Already formatted from API
                            },
                            rotate: rotate,
                            rotateAlways: rotate !== 0,
                            hideOverlappingLabels: true,
                            trim: true,
                            style: {
                                fontSize: '11px'
                            }
                        }
                    },
                    yaxis: {
                        labels: {
                            formatter: function(value) {
                                // Tự động chọn đơn vị phù hợp
                                if (value >= 1000000) {
                                    return (value / 1000000).toFixed(1) + ' tr';
                                } else if (value >= 1000) {
                                    return (value / 1000).toFixed(0) + ' k';
                                } else {
                                    return value.toFixed(0);
                                }
                            }
                        }
                    }
                });
                
                revenueChart.updateSeries([{
                    name: 'Doanh thu',
                    data: revenueData
                }]);
                
                console.log('Revenue chart updated successfully');
            } else {
                console.error('API returned error:', result.message);
                showToast('Không thể tải dữ liệu doanh thu');
            }

        } catch (error) {
            console.error('Error fetching revenue chart data:', error);
            showToast('Lỗi khi tải dữ liệu doanh thu');
        } finally {
            // Ẩn spinner
            Spinner.hide(spinner);
        }
    }

    function updateTicketsChart() {
        // Fetch real data from API
        fetchTicketsChartData();
    }

    async function fetchTicketsChartData() {
        // Show spinner
        const chartElement = document.querySelector("#tickets-chart");
        const spinner = Spinner.show({
            target: chartElement.parentElement,
            text: 'Đang tải dữ liệu vé bán...',
            size: 'md'
        });

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
            const apiUrl = `${baseUrl}/api/thong-ke-toan-rap/xu-huong-ve-ban?${params.toString()}`;

            console.log('Fetching tickets chart data from:', apiUrl);

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success && result.data) {
                const data = result.data;
                const categories = data.danh_sach_nhan;
                const ticketsData = data.chi_tiet.map(item => item.so_ve_ban);
                
                // Xác định số lượng label để hiển thị dựa trên số ngày
                const dataCount = categories.length;
                let tickAmount = dataCount;
                let rotate = -45;
                
                if (currentTimePeriod === 'daily') {
                    if (dataCount > 30) {
                        tickAmount = 15;
                        rotate = -45;
                    } else if (dataCount > 15) {
                        tickAmount = Math.ceil(dataCount / 2);
                        rotate = -45;
                    } else if (dataCount > 7) {
                        tickAmount = dataCount;
                        rotate = -45;
                    } else {
                        tickAmount = dataCount;
                        rotate = 0;
                    }
                } else if (currentTimePeriod === 'weekly') {
                    tickAmount = Math.min(dataCount, 8);
                    rotate = -45;
                } else {
                    tickAmount = dataCount;
                    rotate = -45;
                }
                
                ticketsChart.updateOptions({
                    xaxis: {
                        categories: categories,
                        tickAmount: tickAmount,
                        labels: {
                            formatter: function(value) {
                                return value; // Already formatted from API
                            },
                            rotate: rotate,
                            rotateAlways: rotate !== 0,
                            hideOverlappingLabels: true,
                            trim: true,
                            style: {
                                fontSize: '11px'
                            }
                        }
                    }
                });
                
                ticketsChart.updateSeries([{
                    name: 'Số vé bán',
                    data: ticketsData
                }]);
            } else {
                console.error('API returned error:', result.message);
                showToast('error', 'Lỗi khi tải dữ liệu vé bán: ' + (result.message || 'Không xác định'));
            }

        } catch (error) {
            console.error('Error fetching tickets chart data:', error);
            showToast('error', 'Lỗi khi tải dữ liệu vé bán: ' + error.message);
        } finally {
            // Hide spinner
            Spinner.hide(spinner);
        }
    }

    function updateTheaterPerformanceChart() {
        fetchTheaterPerformanceData();
    }

    async function fetchTheaterPerformanceData() {
        const chartContainer = document.querySelector("#theater-performance-chart");
        if (!chartContainer) return;

        // Hiển thị spinner
        const spinner = Spinner.show({
            target: chartContainer.parentElement,
            text: 'Đang tải dữ liệu...',
            size: 'md',
            overlay: true
        });

        try {
            // Lấy tham số từ date filter
            const tuNgay = dateStartInput.value;
            const denNgay = dateEndInput.value;
            const idRap = selectedCinema;

            // Tạo base URL giống như các API khác
            const baseUrl = document.getElementById('btn-apply-filter')?.dataset.url || '';
            const params = new URLSearchParams({
                tuNgay: tuNgay,
                denNgay: denNgay,
                idRap: idRap
            });

            const apiUrl = `${baseUrl}/api/thong-ke-toan-rap/hieu-suat-theo-rap?${params}`;
            console.log('Fetching theater performance data from:', apiUrl);

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Theater performance API response:', result);

            if (result.success && result.data) {
                const data = result.data;
                
                // Chuẩn bị dữ liệu cho biểu đồ
                const tenRap = data.danh_sach_rap.map(item => item.ten_rap);
                const doanhThu = data.danh_sach_rap.map(item => item.doanh_thu);

                // Cập nhật biểu đồ
                theaterPerformanceChart.updateOptions({
                    xaxis: {
                        categories: tenRap
                    }
                });

                theaterPerformanceChart.updateSeries([{
                    name: 'Doanh thu',
                    data: doanhThu
                }]);

                console.log('Theater performance chart updated successfully');
            } else {
                console.error('API returned error:', result.message);
                showToast('Lỗi khi tải dữ liệu hiệu suất rạp: ' + (result.message || 'Không xác định'));
            }

        } catch (error) {
            console.error('Error fetching theater performance data:', error);
            showToast('Lỗi khi tải dữ liệu hiệu suất rạp: ' + error.message);
        } finally {
            // Hide spinner
            Spinner.hide(spinner);
        }
    }

    function updateRevenueBreakdownChart() {
        fetchRevenueBreakdownData();
    }

    async function fetchRevenueBreakdownData() {
        const chartElement = document.querySelector("#revenue-breakdown-chart");
        if (!chartElement) return;

        // Hiển thị spinner
        const spinner = Spinner.show({
            target: chartElement.parentElement,
            text: 'Đang tải dữ liệu...',
            size: 'md',
            overlay: true
        });

        try {
            // Lấy tham số từ date filter
            const tuNgay = dateStartInput.value;
            const denNgay = dateEndInput.value;
            const idRap = selectedCinema;

            const baseUrl = document.getElementById('btn-apply-filter')?.dataset.url || '';
            const params = new URLSearchParams({
                tuNgay: tuNgay,
                denNgay: denNgay,
                idRap: idRap
            });

            const apiUrl = `${baseUrl}/api/thong-ke-toan-rap/co-cau-doanh-thu?${params}`;
            console.log('Fetching revenue breakdown data from:', apiUrl);

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Revenue breakdown API response:', result);

            if (result.success && result.data) {
                const data = result.data;
                
                // Chuẩn bị dữ liệu cho biểu đồ donut
                const labels = data.chi_tiet.map(item => item.loai);
                const series = data.chi_tiet.map(item => item.phan_tram);
                const colors = data.chi_tiet.map(item => item.mau_sac);

                // Cập nhật biểu đồ
                revenueBreakdownChart.updateOptions({
                    labels: labels,
                    colors: colors
                });

                revenueBreakdownChart.updateSeries(series);

                console.log('Revenue breakdown chart updated successfully');
            } else {
                console.error('API returned error:', result.message);
                showToast('Lỗi khi tải dữ liệu cơ cấu doanh thu: ' + (result.message || 'Không xác định'));
            }

        } catch (error) {
            console.error('Error fetching revenue breakdown data:', error);
            showToast('Lỗi khi tải dữ liệu cơ cấu doanh thu: ' + error.message);
        } finally {
            // Hide spinner
            Spinner.hide(spinner);
        }
    }

    // function updateWeeklyPerformanceChart() {
    //     fetchWeeklyPerformanceData();
    // }

    // async function fetchWeeklyPerformanceData() {
    //     const chartElement = document.querySelector("#weekly-performance-chart");
    //     if (!chartElement) return;

    //     // Hiển thị spinner
    //     const spinner = Spinner.show({
    //         target: chartElement.parentElement,
    //         text: 'Đang tải dữ liệu...',
    //         size: 'md',
    //         overlay: true
    //     });

    //     try {
    //         // Lấy tham số từ date filter
    //         const tuNgay = dateStartInput.value;
    //         const denNgay = dateEndInput.value;
    //         const idRap = selectedCinema;

    //         const baseUrl = document.getElementById('btn-apply-filter')?.dataset.url || '';
    //         const params = new URLSearchParams({
    //             tuNgay: tuNgay,
    //             denNgay: denNgay,
    //             idRap: idRap
    //         });

    //         const apiUrl = `${baseUrl}/api/thong-ke-toan-rap/hieu-suat-theo-ngay-trong-tuan?${params}`;
    //         console.log('Fetching weekly performance data from:', apiUrl);

    //         const response = await fetch(apiUrl, {
    //             method: 'GET',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Accept': 'application/json'
    //             }
    //         });

    //         if (!response.ok) {
    //             throw new Error(`HTTP error! status: ${response.status}`);
    //         }

    //         const result = await response.json();
    //         console.log('Weekly performance API response:', result);

    //         if (result.success && result.data) {
    //             const data = result.data;
                
    //             // Chuẩn bị dữ liệu cho biểu đồ
    //             const categories = data.danh_sach.map(item => item.ngay);
    //             const veBanData = data.danh_sach.map(item => item.so_ve_ban);
    //             const tyLeLapDayData = data.danh_sach.map(item => item.ty_le_lap_day);

    //             // Cập nhật biểu đồ
    //             weeklyPerformanceChart.updateOptions({
    //                 xaxis: {
    //                     categories: categories
    //                 }
    //             });

    //             weeklyPerformanceChart.updateSeries([{
    //                 name: 'Vé bán',
    //                 type: 'column',
    //                 data: veBanData
    //             }, {
    //                 name: 'Tỷ lệ lấp đầy',
    //                 type: 'line',
    //                 data: tyLeLapDayData
    //             }]);

    //             console.log('Weekly performance chart updated successfully');
    //         } else {
    //             console.error('API returned error:', result.message);
    //             showToast('Lỗi khi tải dữ liệu hiệu suất theo tuần: ' + (result.message || 'Không xác định'));
    //         }

    //     } catch (error) {
    //         console.error('Error fetching weekly performance data:', error);
    //         showToast('Lỗi khi tải dữ liệu hiệu suất theo tuần: ' + error.message);
    //     } finally {
    //         // Hide spinner
    //         Spinner.hide(spinner);
    //     }
    // }

    // function updateHourlyPerformanceChart() {
    //     fetchHourlyPerformanceData();
    // }

    // async function fetchHourlyPerformanceData() {
    //     const chartElement = document.querySelector("#hourly-performance-chart");
    //     if (!chartElement) return;

    //     // Hiển thị spinner
    //     const spinner = Spinner.show({
    //         target: chartElement.parentElement,
    //         text: 'Đang tải dữ liệu...',
    //         size: 'md',
    //         overlay: true
    //     });

    //     try {
    //         // Lấy tham số từ date filter
    //         const tuNgay = dateStartInput.value;
    //         const denNgay = dateEndInput.value;
    //         const idRap = selectedCinema;

    //         const baseUrl = document.getElementById('btn-apply-filter')?.dataset.url || '';
    //         const params = new URLSearchParams({
    //             tuNgay: tuNgay,
    //             denNgay: denNgay,
    //             idRap: idRap
    //         });

    //         const apiUrl = `${baseUrl}/api/thong-ke-toan-rap/hieu-suat-theo-gio-trong-ngay?${params}`;
    //         console.log('Fetching hourly performance data from:', apiUrl);

    //         const response = await fetch(apiUrl, {
    //             method: 'GET',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Accept': 'application/json'
    //             }
    //         });

    //         if (!response.ok) {
    //             throw new Error(`HTTP error! status: ${response.status}`);
    //         }

    //         const result = await response.json();
    //         console.log('Hourly performance API response:', result);

    //         if (result.success && result.data) {
    //             const data = result.data;
                
    //             // Chuẩn bị dữ liệu cho biểu đồ
    //             const categories = data.danh_sach.map(item => item.gio);
    //             const tyLeLapDayData = data.danh_sach.map(item => item.ty_le_lap_day);

    //             // Cập nhật biểu đồ
    //             hourlyPerformanceChart.updateOptions({
    //                 xaxis: {
    //                     categories: categories
    //                 }
    //             });

    //             hourlyPerformanceChart.updateSeries([{
    //                 name: 'Tỷ lệ lấp đầy',
    //                 data: tyLeLapDayData
    //             }]);

    //             console.log('Hourly performance chart updated successfully');
    //         } else {
    //             throw new Error(result.message || 'Không có dữ liệu');
    //         }
    //     } catch (error) {
    //         console.error('Error fetching hourly performance data:', error);
    //         showToast('Lỗi khi tải dữ liệu hiệu suất theo giờ: ' + error.message);
    //     } finally {
    //         // Hide spinner
    //         Spinner.hide(spinner);
    //     }
    // }

    function updateFnBPerTicketChart() {
        fetchFnBPerOrderData();
    }

    async function fetchFnBPerOrderData() {
        const chartElement = document.querySelector("#fnb-per-ticket-chart");
        if (!chartElement) return;
        const spinner = Spinner.show({
            target: chartElement.parentElement,
            text: 'Đang tải dữ liệu...',
            size: 'md',
            overlay: true
        });
        try {
            // Build API URL
            const tuNgay = dateStartInput.value || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];
            const denNgay = dateEndInput.value || new Date().toISOString().split('T')[0];
            const idRap = selectedCinema || 'all';
            
            const apiUrl = `/rapphim/api/thong-ke-toan-rap/ti-le-doanh-thu-fnb-tren-don-hang?tuNgay=${tuNgay}&denNgay=${denNgay}&idRap=${idRap}`;
            
            console.log('Fetching F&B per Order data:', apiUrl);
            
            const response = await fetch(apiUrl);
            const result = await response.json();
            
            console.log('F&B per Order API response:', result);
            
            if (result.success && result.data && result.data.danh_sach) {
                const danhSach = result.data.danh_sach;
                
                // Extract categories (dates) and data (average F&B per order)
                const categories = danhSach.map(item => item.ngay);
                const dataValues = danhSach.map(item => item.trung_binh_fnb_tren_don_hang);
                
                // Smart X-axis label management
                const dataCount = categories.length;
                let tickAmount = dataCount;
                let rotate = -45;
                
                if (currentTimePeriod === 'daily') {
                    if (dataCount > 30) {
                        // Rất nhiều ngày: chỉ hiển thị ~15 nhãn
                        tickAmount = 15;
                        rotate = -45;
                    } else if (dataCount > 15) {
                        // Nhiều ngày: hiển thị 1 nửa nhãn
                        tickAmount = Math.ceil(dataCount / 2);
                        rotate = -45;
                    } else if (dataCount > 7) {
                        // Vừa phải: hiển thị tất cả nhưng xoay
                        tickAmount = dataCount;
                        rotate = -45;
                    } else {
                        // Ít ngày: hiển thị tất cả ngang
                        tickAmount = dataCount;
                        rotate = 0;
                    }
                } else if (currentTimePeriod === 'weekly') {
                    tickAmount = Math.min(8, dataCount);
                    rotate = -45;
                } else { // monthly
                    tickAmount = dataCount;
                    rotate = -45;
                }
                
                // Update chart
                fnbPerTicketChart.updateOptions({
                    xaxis: {
                        categories: categories,
                        tickAmount: tickAmount,
                        labels: {
                            rotate: rotate,
                            rotateAlways: rotate !== 0,
                            hideOverlappingLabels: true,
                            trim: true,
                            style: {
                                fontSize: '11px'
                            }
                        }
                    }
                });
                
                fnbPerTicketChart.updateSeries([{
                    name: 'F&B/Đơn hàng',
                    data: dataValues
                }]);
                
                console.log('F&B per Order chart updated successfully');
            } else {
                console.error('Invalid F&B per Order data structure:', result);
                showToast('Không thể tải dữ liệu F&B trên đơn hàng');
            }
        } catch (error) {
            console.error('Error fetching F&B per Order data:', error);
            showToast('Lỗi khi tải dữ liệu F&B trên đơn hàng');
        }
        finally {
            Spinner.hide(spinner);
        }
    }

    // Tables functions
    function initializeTables() {
        populateTopFilmsTable();
        populateTopFnBTable();
    }

    function updateTables() {
        populateTopFilmsTable();
        populateTopFnBTable();
    }

    function populateTopFilmsTable() {
        const tableBody = document.getElementById('top-films-table');
        if (!tableBody) return;
        
        // Show loading
        tableBody.innerHTML = '<tr><td colspan="3" class="text-center py-4"></td></tr>';
        
        fetchTopFilms();
    }
    
    async function fetchTopFilms() {
        const tableBody = document.getElementById('top-films-table');
        if (!tableBody) return;
        
        // Tìm container của bảng để hiển thị spinner
        const tableContainer = tableBody.closest('.bg-white, .card, [class*="bg-"]') || tableBody.parentElement?.parentElement;
        
        // Hiển thị spinner
        const spinner = tableContainer ? Spinner.show({
            target: tableContainer,
            text: 'Đang tải dữ liệu...',
            size: 'md',
        }) : null;
        
        try {
            const tuNgay = dateStartInput.value;
            const denNgay = dateEndInput.value;
            const idRap = selectedCinema;
            
            const params = new URLSearchParams({
                tuNgay: tuNgay,
                denNgay: denNgay,
                idRap: idRap
            });
            
            const baseUrl = document.getElementById('btn-apply-filter').dataset.url || '';
            const apiUrl = `${baseUrl}/api/thong-ke-toan-rap/top-10-phim?${params.toString()}`;
            
            console.log('Fetching top films from:', apiUrl);
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success && result.data && result.data.danh_sach) {
                tableBody.innerHTML = '';
                
                result.data.danh_sach.forEach(film => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td class="px-3 py-2">
                            <div class="text-sm font-medium text-gray-900">${film.ten_phim}</div>
                        </td>
                        <td class="px-3 py-2 text-right">
                            <div class="text-sm text-gray-900">${formatCurrency(film.doanh_thu)}</div>
                        </td>
                        <td class="px-3 py-2 text-right">
                            <div class="text-sm text-gray-900">${formatNumber(film.so_ve_ban)}</div>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });
                
                console.log('Top films loaded successfully');
            } else {
                tableBody.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-gray-500">Không có dữ liệu</td></tr>';
            }
        } catch (error) {
            console.error('Error fetching top films:', error);
            tableBody.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-red-500">Lỗi khi tải dữ liệu</td></tr>';
        } finally {
            // Ẩn spinner
            if (spinner) {
                Spinner.hide(spinner);
            }
        }
    }

    function populateTopFnBTable() {
        fetchTopFnBProducts();
    }
    
    async function fetchTopFnBProducts() {
        const tableBody = document.getElementById('top-fnb-table');
        if (!tableBody) return;

        // Hiển thị loading state trong bảng
        const spinner = Spinner.show({
            target: document.getElementById('fnb-analysis'),
            text: 'Đang tải dữ liệu...',
            size: 'md',
        });

        try {
            // Đọc baseUrl từ data attribute
            const baseUrl = document.getElementById('btn-apply-filter').dataset.url || '';
            
            // Lấy giá trị filter
            const tuNgay = document.getElementById('date-start')?.value || '';
            const denNgay = document.getElementById('date-end')?.value || '';
            const idRap = document.getElementById('cinema-filter')?.value || 'all';

            // Xây dựng URL với query parameters
            const params = new URLSearchParams({
                tuNgay: tuNgay,
                denNgay: denNgay,
                idRap: idRap
            });

            const url = `${baseUrl}/api/thong-ke-toan-rap/top-10-san-pham-ban-chay?${params}`;
            console.log('Fetching top F&B products from:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Top F&B products API response:', result);

            if (result.success && result.data && result.data.danh_sach) {
                const data = result.data.danh_sach;
                
                // Clear existing rows
                tableBody.innerHTML = '';
                
                // Populate table with API data
                data.forEach((item, index) => {
                    const row = document.createElement('tr');
                    row.className = 'hover:bg-gray-50 transition-colors';
                    row.innerHTML = `
                        <td class="px-3 py-2">
                            <div class="flex items-center">
                                <span class="text-sm font-bold text-gray-500 mr-3">${index + 1}</span>
                                <div class="text-sm font-medium text-gray-900">${item.ten_san_pham}</div>
                            </div>
                        </td>
                        <td class="px-3 py-2 text-right">
                            <div class="text-sm text-gray-900">${formatNumber(item.so_luong)}</div>
                        </td>
                        <td class="px-3 py-2 text-right">
                            <div class="text-sm font-semibold text-gray-900">${formatCurrency(item.doanh_thu)}</div>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });

                console.log('Top F&B table updated successfully with', data.length, 'products');
            } else {
                throw new Error(result.message || 'Không thể tải dữ liệu sản phẩm F&B');
            }
        } catch (error) {
            console.error('Error fetching top F&B products:', error);
            showToast('Lỗi khi tải danh sách sản phẩm F&B: ' + error.message);
            
            // Hiển thị thông báo lỗi trong bảng
            tableBody.innerHTML = `
                <tr>
                    <td colspan="3" class="px-6 py-8 text-center text-gray-500">
                        <i class="fas fa-exclamation-triangle text-red-500 text-2xl mb-2"></i>
                        <p>Không thể tải dữ liệu. Vui lòng thử lại sau.</p>
                    </td>
                </tr>
            `;
        } finally {
            // Ẩn spinner
            Spinner.hide(spinner);
        }
    }

    // --- All films revenue table ---
    function populateAllFilmsTable() {
        fetchAndPopulateAllFilms();
    }

    async function fetchAndPopulateAllFilms() {
        const tbody = document.getElementById('all-film-revenue-body');
        if (!tbody) return;

        tbody.innerHTML = '<tr><td colspan="6" class="px-4 py-6 text-center text-sm text-gray-500">Đang tải dữ liệu...</td></tr>';

        try {
            const tuNgay = document.getElementById('date-start')?.value || '';
            const denNgay = document.getElementById('date-end')?.value || '';
            const idRap = document.getElementById('cinema-filter')?.value || 'all';
            const baseUrl = document.getElementById('btn-apply-filter')?.dataset?.url || '';

            const endpoint = (baseUrl ? baseUrl.replace(/\/+$/, '') : '') + '/api/thong-ke-toan-rap/doanh-thu-phim';
            const url = `${endpoint}?tuNgay=${encodeURIComponent(tuNgay)}&denNgay=${encodeURIComponent(denNgay)}&idRap=${encodeURIComponent(idRap)}`;

            console.log('Fetching all films revenue from', url);

            const resp = await fetch(url, { credentials: 'same-origin' });
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            const body = await resp.json();

            if (!body || !body.data || !Array.isArray(body.data.danh_sach)) {
                tbody.innerHTML = '<tr><td colspan="6" class="px-4 py-6 text-center text-sm text-gray-500">Không có dữ liệu</td></tr>';
                return;
            }

            const rows = body.data.danh_sach;
            if (rows.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="px-4 py-6 text-center text-sm text-gray-500">Không có phim trong cơ sở dữ liệu</td></tr>';
                return;
            }

            const html = rows.map(r => {

                const poster = `<img src="${tbody.dataset.urlminio}/${r.poster_url}" alt="" class="h-12 w-8 object-cover rounded">`;
                return `
                    <tr class="hover:bg-gray-50">
                        <td class="px-4 py-3 text-sm text-gray-700">${r.id ?? ''}</td>
                        <td class="px-4 py-3">${poster}</td>
                        <td class="px-4 py-3 text-sm text-gray-800">${r.ten_phim}</td>
                        <td class="px-4 py-3 text-sm text-gray-800 text-right">${formatCurrency(r.doanh_thu_ve ?? 0)}</td>
                        <td class="px-4 py-3 text-sm text-gray-800 text-right">${formatCurrency(r.doanh_thu_mua ?? 0)}</td>
                        <td class="px-4 py-3 text-sm text-gray-900 font-bold text-right">${formatCurrency(r.tong_doanh_thu ?? 0)}</td>
                    </tr>`;
            }).join('');

            tbody.innerHTML = html;
        } catch (err) {
            console.error('Failed to load all films revenue', err);
            tbody.innerHTML = '<tr><td colspan="6" class="px-4 py-6 text-center text-sm text-gray-500">Lỗi khi tải dữ liệu</td></tr>';
        }
    }

});