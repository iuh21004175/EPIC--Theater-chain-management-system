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

    // Set up initial dates
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    dateStartInput.valueAsDate = thirtyDaysAgo;
    dateEndInput.valueAsDate = today;

    // Initialize state
    let currentDateRange = 30;
    let compareWithPrevious = false;
    let selectedCinema = 'all';
    let currentTimePeriod = 'daily';

    // Date range selector event
    dateRangeSelector.addEventListener('change', function() {
        if (this.value === 'custom') {
            customDateContainer.classList.remove('hidden');
        } else {
            customDateContainer.classList.add('hidden');
            currentDateRange = parseInt(this.value);
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
        }
        
        // Update all charts and data
        updateAllData();
    });

    // Time period filter for charts
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
    function initializeKPICards() {
        document.getElementById('total-revenue').textContent = formatCurrency(5750000000);
        document.getElementById('total-tickets').textContent = formatNumber(115000);
        document.getElementById('avg-occupancy').textContent = formatPercent(68.5);
        document.getElementById('fnb-revenue').textContent = formatCurrency(1250000000);
        
        document.getElementById('revenue-trend').querySelector('span').textContent = '+12.5%';
        document.getElementById('tickets-trend').querySelector('span').textContent = '+8.7%';
        document.getElementById('occupancy-trend').querySelector('span').textContent = '-2.3%';
        document.getElementById('fnb-trend').querySelector('span').textContent = '+15.2%';
    }

    function updateKPICards() {
        // Update with random data for demo
        const revenueChange = (Math.random() * 20 - 5).toFixed(1);
        const ticketsChange = (Math.random() * 20 - 5).toFixed(1);
        const occupancyChange = (Math.random() * 10 - 5).toFixed(1);
        const fnbChange = (Math.random() * 25 - 5).toFixed(1);
        
        document.getElementById('total-revenue').textContent = formatCurrency(Math.floor(Math.random() * 2000000000) + 5000000000);
        document.getElementById('total-tickets').textContent = formatNumber(Math.floor(Math.random() * 50000) + 100000);
        document.getElementById('avg-occupancy').textContent = formatPercent(Math.floor(Math.random() * 20) + 60);
        document.getElementById('fnb-revenue').textContent = formatCurrency(Math.floor(Math.random() * 500000000) + 1000000000);
        
        // Update trends
        updateTrendIndicator('revenue-trend', revenueChange);
        updateTrendIndicator('tickets-trend', ticketsChange);
        updateTrendIndicator('occupancy-trend', occupancyChange);
        updateTrendIndicator('fnb-trend', fnbChange);
    }

    function updateTrendIndicator(elementId, changePercent) {
        const element = document.getElementById(elementId);
        const iconElement = element.querySelector('svg');
        const textElement = element.querySelector('span');
        
        textElement.textContent = `${changePercent > 0 ? '+' : ''}${changePercent}%`;
        
        if (changePercent > 0) {
            element.classList.add('stats-card-trend-up');
            element.classList.remove('stats-card-trend-down');
            iconElement.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />';
        } else {
            element.classList.add('stats-card-trend-down');
            element.classList.remove('stats-card-trend-up');
            iconElement.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />';
        }
    }

    // Charts Initialization Functions
    function initializeRevenueChart() {
        const chartElement = document.querySelector("#revenue-chart");
        if (!chartElement) {
            console.error("Revenue chart container not found");
            return;
        }

        const dates = getDates(30);
        const revenueData = getRandomData(10000000, 50000000, 31);
        
        const options = {
            series: [{
                name: 'Doanh thu',
                data: revenueData
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
                categories: dates,
                labels: {
                    formatter: function(value) {
                        const date = new Date(value);
                        return date.getDate() + '/' + (date.getMonth() + 1);
                    }
                }
            },
            yaxis: {
                labels: {
                    formatter: function(value) {
                        return formatCurrency(value).replace('₫', '') + ' tr';
                    }
                }
            },
            tooltip: {
                y: {
                    formatter: function(value) {
                        return formatCurrency(value);
                    }
                }
            }
        };
        
        // Khởi tạo biểu đồ và lưu vào biến sau khi khởi tạo
        revenueChart = new ApexCharts(chartElement, options);
        revenueChart.render();
    }

    function initializeTicketsChart() {
        const chartElement = document.querySelector("#tickets-chart");
        if (!chartElement) {
            console.error("Tickets chart container not found");
            return;
        }

        const dates = getDates(30);
        const ticketData = getRandomData(200, 1000, 31);
        
        const options = {
            series: [{
                name: 'Số vé bán',
                data: ticketData
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
                categories: dates,
                labels: {
                    formatter: function(value) {
                        const date = new Date(value);
                        return date.getDate() + '/' + (date.getMonth() + 1);
                    }
                }
            },
            tooltip: {
                y: {
                    formatter: function(value) {
                        return formatNumber(value) + ' vé';
                    }
                }
            }
        };
        
        ticketsChart = new ApexCharts(chartElement, options);
        ticketsChart.render();
    }

    function initializeTheaterPerformanceChart() {
        const chartElement = document.querySelector("#theater-performance-chart");
        if (!chartElement) {
            console.error("Theater performance chart container not found");
            return;
        }

        const options = {
            series: [{
                name: 'Doanh thu',
                data: [2250000000, 1850000000, 975000000, 675000000]
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
                categories: ['EPIC Hà Nội', 'EPIC Hồ Chí Minh', 'EPIC Đà Nẵng', 'EPIC Cần Thơ'],
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
            }
        };
        
        theaterPerformanceChart = new ApexCharts(chartElement, options);
        theaterPerformanceChart.render();
    }

    function initializeRevenueBreakdownChart() {
        const chartElement = document.querySelector("#revenue-breakdown-chart");
        if (!chartElement) {
            console.error("Revenue breakdown chart container not found");
            return;
        }

        const options = {
            series: [65, 20, 10, 5],
            chart: {
                type: 'donut',
                height: 350
            },
            labels: ['Vé phim', 'Đồ ăn & Thức uống', 'Quảng cáo', 'Khác'],
            colors: ['#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6'],
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
                        return value + '%';
                    }
                }
            }
        };
        
        revenueBreakdownChart = new ApexCharts(chartElement, options);
        revenueBreakdownChart.render();
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
                data: [3100, 2400, 1800, 2100, 2850, 4200, 5100]
            }, {
                name: 'Tỷ lệ lấp đầy',
                data: [62, 48, 36, 42, 57, 84, 89]
            }],
            chart: {
                type: 'line',
                height: 350,
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
            }, {
                opposite: true,
                title: {
                    text: 'Tỷ lệ lấp đầy (%)'
                },
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
            }
        };
        
        weeklyPerformanceChart = new ApexCharts(chartElement, options);
        weeklyPerformanceChart.render();
    }

    function initializeHourlyPerformanceChart() {
        const chartElement = document.querySelector("#hourly-performance-chart");
        if (!chartElement) {
            console.error("Hourly performance chart container not found");
            return;
        }

        const hours = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];
        const occupancyData = [35, 40, 45, 50, 55, 60, 65, 70, 85, 90, 80, 75, 60, 40];
        
        const options = {
            series: [{
                name: 'Tỷ lệ lấp đầy',
                data: occupancyData
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
                categories: hours
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
            }
        };
        
        hourlyPerformanceChart = new ApexCharts(chartElement, options);
        hourlyPerformanceChart.render();
    }

    function initializeFnBPerTicketChart() {
        const chartElement = document.querySelector("#fnb-per-ticket-chart");
        if (!chartElement) {
            console.error("F&B per ticket chart container not found");
            return;
        }

        const dates = getDates(30).slice(0, 15); // Use only 15 days for clarity
        const fnbPerTicketData = [];
        
        for (let i = 0; i < 15; i++) {
            fnbPerTicketData.push((Math.random() * 15000) + 20000);
        }
        
        const options = {
            series: [{
                name: 'F&B/Vé',
                data: fnbPerTicketData
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
                categories: dates,
                labels: {
                    formatter: function(value) {
                        const date = new Date(value);
                        return date.getDate() + '/' + (date.getMonth() + 1);
                    },
                    rotate: -45,
                    rotateAlways: false
                },
                tickPlacement: 'on'
            },
            yaxis: {
                title: {
                    text: 'VNĐ/vé'
                },
                labels: {
                    formatter: function(value) {
                        return formatCurrency(value).replace('₫', '');
                    }
                }
            },
            tooltip: {
                y: {
                    formatter: function(value) {
                        return formatCurrency(value) + '/vé';
                    }
                }
            }
        };
        
        fnbPerTicketChart = new ApexCharts(chartElement, options);
        fnbPerTicketChart.render();
    }

    // Master initialization function
    function initializeCharts() {
        // Wrap each initialization in try-catch to prevent errors from stopping initialization of other charts
        try { initializeRevenueChart(); } catch (e) { console.error("Error initializing revenue chart:", e); }
        try { initializeTicketsChart(); } catch (e) { console.error("Error initializing tickets chart:", e); }
        try { initializeTheaterPerformanceChart(); } catch (e) { console.error("Error initializing theater performance chart:", e); }
        try { initializeRevenueBreakdownChart(); } catch (e) { console.error("Error initializing revenue breakdown chart:", e); }
        try { initializeWeeklyPerformanceChart(); } catch (e) { console.error("Error initializing weekly performance chart:", e); }
        try { initializeHourlyPerformanceChart(); } catch (e) { console.error("Error initializing hourly performance chart:", e); }
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
        // Generate random data based on current time period and date range
        const dates = getDates(currentDateRange);
        const revenueData = getRandomData(10000000, 50000000, currentDateRange + 1);
        
        let categories = dates;
        let groupedData = revenueData;
        
        // Group data based on time period
        if (currentTimePeriod === 'weekly') {
            categories = [];
            groupedData = [];
            for (let i = 0; i < dates.length; i += 7) {
                const weekEnd = Math.min(i + 6, dates.length - 1);
                categories.push(`${dates[i]} - ${dates[weekEnd]}`);
                
                // Calculate average for the week
                const weekData = revenueData.slice(i, weekEnd + 1);
                const weekSum = weekData.reduce((sum, value) => sum + value, 0);
                groupedData.push(weekSum);
            }
        } else if (currentTimePeriod === 'monthly') {
            // Group by month
            const monthlyData = {};
            dates.forEach((date, index) => {
                const month = date.substring(0, 7); // YYYY-MM
                if (!monthlyData[month]) {
                    monthlyData[month] = [];
                }
                monthlyData[month].push(revenueData[index]);
            });
            
            categories = Object.keys(monthlyData).map(month => {
                const date = new Date(month);
                return `${date.getMonth() + 1}/${date.getFullYear()}`;
            });
            
            groupedData = Object.values(monthlyData).map(values => {
                return values.reduce((sum, value) => sum + value, 0);
            });
        }
        
        revenueChart.updateOptions({
            xaxis: {
                categories: categories
            }
        });
        
        revenueChart.updateSeries([{
            name: 'Doanh thu',
            data: groupedData
        }]);
    }

    function updateTicketsChart() {
        // Similar logic to revenue chart but for ticket data
        const dates = getDates(currentDateRange);
        const ticketData = getRandomData(200, 1000, currentDateRange + 1);
        
        let categories = dates;
        let groupedData = ticketData;
        
        // Group data based on time period
        if (currentTimePeriod === 'weekly') {
            categories = [];
            groupedData = [];
            for (let i = 0; i < dates.length; i += 7) {
                const weekEnd = Math.min(i + 6, dates.length - 1);
                categories.push(`${dates[i]} - ${dates[weekEnd]}`);
                
                // Calculate sum for the week
                const weekData = ticketData.slice(i, weekEnd + 1);
                const weekSum = weekData.reduce((sum, value) => sum + value, 0);
                groupedData.push(weekSum);
            }
        } else if (currentTimePeriod === 'monthly') {
            // Group by month
            const monthlyData = {};
            dates.forEach((date, index) => {
                const month = date.substring(0, 7); // YYYY-MM
                if (!monthlyData[month]) {
                    monthlyData[month] = [];
                }
                monthlyData[month].push(ticketData[index]);
            });
            
            categories = Object.keys(monthlyData).map(month => {
                const date = new Date(month);
                return `${date.getMonth() + 1}/${date.getFullYear()}`;
            });
            
            groupedData = Object.values(monthlyData).map(values => {
                return values.reduce((sum, value) => sum + value, 0);
            });
        }
        
        ticketsChart.updateOptions({
            xaxis: {
                categories: categories
            }
        });
        
        ticketsChart.updateSeries([{
            name: 'Số vé bán',
            data: groupedData
        }]);
    }

    function updateTheaterPerformanceChart() {
        const cinemas = ['EPIC Hà Nội', 'EPIC Hồ Chí Minh', 'EPIC Đà Nẵng', 'EPIC Cần Thơ'];
        const newData = getRandomData(500000000, 2500000000, 4);
        
        theaterPerformanceChart.updateSeries([{
            name: 'Doanh thu',
            data: newData
        }]);
    }

    function updateRevenueBreakdownChart() {
        const newData = [
            Math.floor(Math.random() * 10) + 60, // Vé phim
            Math.floor(Math.random() * 10) + 15, // F&B
            Math.floor(Math.random() * 5) + 5,   // Quảng cáo
            Math.floor(Math.random() * 5) + 3    // Khác
        ];
        
        revenueBreakdownChart.updateSeries(newData);
    }

    function updateWeeklyPerformanceChart() {
        const ticketData = getRandomData(1500, 5500, 7);
        const occupancyData = getRandomData(30, 95, 7);
        
        weeklyPerformanceChart.updateSeries([{
            name: 'Vé bán',
            data: ticketData
        }, {
            name: 'Tỷ lệ lấp đầy',
            data: occupancyData
        }]);
    }

    function updateHourlyPerformanceChart() {
        const newData = getRandomData(20, 95, 14);
        
        hourlyPerformanceChart.updateSeries([{
            name: 'Tỷ lệ lấp đầy',
            data: newData
        }]);
    }

    function updateFnBPerTicketChart() {
        const dates = getDates(currentDateRange).slice(0, 15);
        const newData = [];
        
        for (let i = 0; i < 15; i++) {
            newData.push((Math.random() * 15000) + 20000);
        }
        
        fnbPerTicketChart.updateOptions({
            xaxis: {
                categories: dates
            }
        });
        
        fnbPerTicketChart.updateSeries([{
            name: 'F&B/Vé',
            data: newData
        }]);
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
        
        tableBody.innerHTML = '';
        
        const films = [
            { name: 'Avengers: Endgame', revenue: 1250000000, tickets: 25000 },
            { name: 'Spider-Man: No Way Home', revenue: 980000000, tickets: 19600 },
            { name: 'Demon Slayer: Mugen Train', revenue: 850000000, tickets: 17000 },
            { name: 'The Batman', revenue: 720000000, tickets: 14400 },
            { name: 'Fast & Furious 9', revenue: 650000000, tickets: 13000 },
            { name: 'Black Widow', revenue: 580000000, tickets: 11600 },
            { name: 'Eternals', revenue: 520000000, tickets: 10400 },
            { name: 'No Time to Die', revenue: 480000000, tickets: 9600 },
            { name: 'Shang-Chi', revenue: 450000000, tickets: 9000 },
            { name: 'Venom: Let There Be Carnage', revenue: 420000000, tickets: 8400 }
        ];
        
        films.forEach(film => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-3 py-2">
                    <div class="text-sm font-medium text-gray-900">${film.name}</div>
                </td>
                <td class="px-3 py-2 text-right">
                    <div class="text-sm text-gray-900">${formatCurrency(film.revenue)}</div>
                </td>
                <td class="px-3 py-2 text-right">
                    <div class="text-sm text-gray-900">${formatNumber(film.tickets)}</div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    function populateTopFnBTable() {
        const tableBody = document.getElementById('top-fnb-table');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        const fnbItems = [
            { name: 'Bắp rang bơ (lớn)', quantity: 35000, revenue: 1750000000 },
            { name: 'Coca-Cola (vừa)', quantity: 28000, revenue: 980000000 },
            { name: 'Combo Family', quantity: 15000, revenue: 1200000000 },
            { name: 'Combo Sweet Couple', quantity: 20000, revenue: 900000000 },
            { name: 'Bắp rang caramel', quantity: 12000, revenue: 720000000 },
            { name: 'Nachos phô mai', quantity: 10000, revenue: 650000000 },
            { name: 'Trà sữa trân châu', quantity: 9500, revenue: 570000000 },
            { name: 'Hotdog', quantity: 8000, revenue: 480000000 },
            { name: 'Nước suối', quantity: 15000, revenue: 225000000 },
            { name: 'Kẹo M&M', quantity: 7500, revenue: 300000000 }
        ];
        
        fnbItems.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-3 py-2">
                    <div class="text-sm font-medium text-gray-900">${item.name}</div>
                </td>
                <td class="px-3 py-2 text-right">
                    <div class="text-sm text-gray-900">${formatNumber(item.quantity)}</div>
                </td>
                <td class="px-3 py-2 text-right">
                    <div class="text-sm text-gray-900">${formatCurrency(item.revenue)}</div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Bắt đầu khởi tạo dữ liệu khi trang đã tải xong
    try {
        initializeKPICards();
        initializeCharts();
        initializeTables();
    } catch (error) {
        console.error("Error during initialization:", error);
    }
});