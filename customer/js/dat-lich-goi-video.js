document.addEventListener('DOMContentLoaded', function() {
    const baseUrl = window.location.origin;
    let currentMonth = new Date();
    let selectedDate = null;
    
    // Khởi tạo trang
    updateCalendar();
    loadCinemas();
    
    // Event listeners
    document.getElementById('prev-month').addEventListener('click', () => {
        currentMonth.setMonth(currentMonth.getMonth() - 1);
        updateCalendar();
    });
    
    document.getElementById('next-month').addEventListener('click', () => {
        currentMonth.setMonth(currentMonth.getMonth() + 1);
        updateCalendar();
    });
    
    document.getElementById('booking-form').addEventListener('submit', handleFormSubmit);
    
    document.getElementById('close-modal').addEventListener('click', () => {
        document.getElementById('booking-modal').classList.add('hidden');
        document.getElementById('booking-modal').classList.remove('flex');
    });
    
    document.getElementById('close-confirmation').addEventListener('click', () => {
        document.getElementById('confirmation-modal').classList.add('hidden');
        document.getElementById('confirmation-modal').classList.remove('flex');
    });
    
    // Kiểm tra login
    function checkLogin(callback) {
        const userid = document.getElementById('userid').value;
        if (!userid) {
            callback(false, null);
            return;
        }
        callback(true, { id: userid });
    }
    
    // Load danh sách rạp
    function loadCinemas() {
        fetch(`${baseUrl}/api/rap-chieu-phim`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    renderCinemas(data.data);
                } else {
                    // Dữ liệu giả nếu API lỗi
                    const cinemaData = [
                        { id: 1, ten_rap: 'EPIC Cinema - Cầu Giấy' },
                        { id: 2, ten_rap: 'EPIC Cinema - Royal City' },
                        { id: 3, ten_rap: 'EPIC Cinema - Times City' },
                        { id: 4, ten_rap: 'EPIC Cinema - Hà Đông' }
                    ];
                    renderCinemas(cinemaData);
                }
            })
            .catch(error => {
                console.error('Lỗi khi tải danh sách rạp:', error);
                
                // Dữ liệu giả nếu API lỗi
                const cinemaData = [
                    { id: 1, ten_rap: 'EPIC Cinema - Cầu Giấy' },
                    { id: 2, ten_rap: 'EPIC Cinema - Royal City' },
                    { id: 3, ten_rap: 'EPIC Cinema - Times City' },
                    { id: 4, ten_rap: 'EPIC Cinema - Hà Đông' }
                ];
                renderCinemas(cinemaData);
            });
    }
    
    // Render danh sách rạp
    function renderCinemas(cinemaData) {
        const cinemaSelect = document.getElementById('cinema-select');
        const options = cinemaData.map(cinema => 
            `<option value="${cinema.id}">${cinema.ten_rap}</option>`
        ).join('');
        
        cinemaSelect.innerHTML = '<option value="">Chọn rạp chiếu phim</option>' + options;
    }
    
    // Cập nhật calendar
    function updateCalendar() {
        const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        
        // Cập nhật tiêu đề tháng
        const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 
                           'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
        document.getElementById('current-month').textContent = `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;
        
        // Tính toán số ngày để hiển thị đầy đủ lịch
        let firstDay = firstDayOfMonth.getDay(); // 0 = Chủ Nhật, 1 = Thứ 2
        firstDay = firstDay === 0 ? 7 : firstDay; // Đổi Chủ Nhật thành 7 để phù hợp với thứ tự Thứ 2 - Chủ Nhật
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let calendarHTML = '';
        
        // Thêm các ô trống trước ngày đầu tiên của tháng
        for (let i = 1; i < firstDay; i++) {
            calendarHTML += '<div class="border border-gray-200 p-2 h-24 bg-gray-50"></div>';
        }
        
        // Thêm các ngày trong tháng
        for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const isPast = date < today;
            const isToday = date.toDateString() === today.toDateString();
            
            let dayClass = 'border p-2 h-24 transition-all duration-200';
            let dayContent = `<span class="text-sm font-medium ${isToday ? 'text-red-600' : ''}">${day}</span>`;
            
            if (isPast) {
                dayClass += ' bg-gray-100 text-gray-400 cursor-not-allowed';
            } else if (isToday) {
                dayClass += ' bg-red-50 border-red-200 hover:bg-red-100 cursor-pointer';
            } else {
                dayClass += ' bg-white hover:bg-blue-50 hover:border-blue-300 cursor-pointer';
            }
            
            calendarHTML += `<div class="${dayClass}" data-date="${formatDateForApi(date)}">${dayContent}</div>`;
        }
        
        document.getElementById('calendar-grid').innerHTML = calendarHTML;
        
        // Add event listeners to available days
        document.querySelectorAll('#calendar-grid div:not(.bg-gray-100)').forEach(dayElement => {
            if (!dayElement.classList.contains('cursor-not-allowed')) {
                dayElement.addEventListener('click', () => selectDate(dayElement));
            }
        });
    }
    
    // Chọn ngày
    function selectDate(dayElement) {
        if (!dayElement.dataset.date) return;
        
        selectedDate = dayElement.dataset.date;
        
        // Show booking modal
        showBookingModal(selectedDate);
    }
    
    // Hiển thị modal đặt lịch
    function showBookingModal(dateString) {
        checkLogin((isLoggedIn, user) => {
            if (!isLoggedIn) {
                showErrorToast('Vui lòng đăng nhập để đặt lịch');
                // Redirect to login or show login modal
                if (document.getElementById('modalLogin')) {
                    document.getElementById('modalLogin').classList.add('is-open');
                    document.body.classList.add('modal-open');
                } 
                return;
            }

            document.getElementById('selected-date').value = formatDateDisplay(dateString);
            
            // Reset form
            document.getElementById('cinema-select').value = '';
            document.getElementById('time-select').value = '';
            document.getElementById('consultation-content').value = '';
            document.getElementById('phone-number').value = '';
            
            // Show modal
            document.getElementById('booking-modal').classList.remove('hidden');
            document.getElementById('booking-modal').classList.add('flex');
        });
    }
    
    // Xử lý submit form
    function handleFormSubmit(e) {
        e.preventDefault();
        
        const cinema = document.getElementById('cinema-select').value;
        const time = document.getElementById('time-select').value;
        const content = document.getElementById('consultation-content').value;
        const phone = document.getElementById('phone-number').value;
        
        // Validate
        if (!cinema) {
            showErrorToast('Vui lòng chọn rạp chiếu phim');
            return;
        }
        
        if (!time) {
            showErrorToast('Vui lòng chọn thời gian');
            return;
        }
        
        if (!content.trim()) {
            showErrorToast('Vui lòng mô tả nội dung tư vấn');
            return;
        }
        
        if (!phone.trim()) {
            showErrorToast('Vui lòng nhập số điện thoại');
            return;
        }
        
        const formData = {
            id_rap: cinema,
            ngay: selectedDate,
            gio: time,
            noi_dung: content,
            so_dien_thoai: phone
        };
        
        // Submit booking
        fetch(`${baseUrl}/api/dat-lich-goi-video`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                // Hide booking modal
                document.getElementById('booking-modal').classList.add('hidden');
                document.getElementById('booking-modal').classList.remove('flex');
                
                // Show confirmation modal
                document.getElementById('confirmation-modal').classList.remove('hidden');
                document.getElementById('confirmation-modal').classList.add('flex');
            } else {
                showErrorToast(data.message || 'Có lỗi xảy ra khi đặt lịch');
            }
        })
        .catch(error => {
            console.error('Lỗi khi đặt lịch:', error);
            showErrorToast('Có lỗi xảy ra khi đặt lịch');
        });
    }
    
    // Toast notifications
    function showSuccessToast(message) {
        showToast(message, 'success');
    }
    
    function showErrorToast(message) {
        showToast(message, 'error');
    }
    
    function showToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 text-white ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} toast`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('opacity-0');
            toast.style.transition = 'opacity 0.5s';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 500);
        }, 3000);
    }
    
    // Utility functions
    function formatDateForApi(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    function formatDateDisplay(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }
});