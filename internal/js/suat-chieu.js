import Spinner from './util/spinner.js';

// Khai báo biến toàn cục cho navigation tuần
let currentWeekStart;

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const datePicker = document.getElementById('date-picker');
    const showtimeModal = document.getElementById('showtime-modal');
    const confirmModal = document.getElementById('confirm-modal');
    const showtimeListing = document.getElementById('showtime-listing');
    const showtimeForm = document.getElementById('showtime-form');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    // Form fields
    const showtimeId = document.getElementById('showtime-id');
    const showtimeDate = document.getElementById('showtime-date');
    const modalTitle = document.getElementById('modal-title');
    const movieSearch = document.getElementById('movie-search');
    const selectedMovieId = document.getElementById('selected-movie-id');
    const movieSearchResults = document.getElementById('movie-search-results');
    const selectedMovieInfo = document.getElementById('selected-movie-info');
    const selectedMoviePoster = document.getElementById('selected-movie-poster');
    const selectedMovieTitle = document.getElementById('selected-movie-title');
    const selectedMovieDuration = document.getElementById('selected-movie-duration');
    const roomSelect = document.getElementById('room-select');
    const startTime = document.getElementById('start-time');
    const endTime = document.getElementById('end-time');
    const suggestedTimes = document.getElementById('suggested-times');
    
    // Buttons
    const btnAddShowtime = document.getElementById('btn-add-showtime');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnCancel = document.getElementById('btn-cancel');
    const btnCancelDelete = document.getElementById('btn-cancel-delete');
    const btnConfirmDelete = document.getElementById('btn-confirm-delete');
    
    let moviesData = [];
    let roomsData = [];

    function fetchMovies() {
        return fetch(`${showtimeListing.dataset.url}/api/phim`)
            .then(res => res.json())
            .then(data => {
                if (data.success && Array.isArray(data.data)) {
                    moviesData = data.data;
                } else {`${showtimeListing.dataset.url}/api/phim`
                    moviesData = [];
                }
            });
    }

    function fetchRooms() {
        return fetch(`${showtimeListing.dataset.url}/api/phong-chieu`)
            .then(res => res.json())
            .then( data => {
                if (data.success && Array.isArray(data.data)) {
                    roomsData = data.data;
                } else {
                    roomsData = [];
                }
            });
    }

    function fillRoomSelect() {
        roomSelect.innerHTML = '<option value="">-- Chọn phòng chiếu --</option>';
        roomsData.forEach(room => {
            const option = document.createElement('option');
            option.value = room.id;
            option.textContent = `${room.ten} - ${room.so_luong_ghe} ghế`;
            roomSelect.appendChild(option);
        });
    }

    // Initialize date picker
    const today = new Date();
    const flatpickrInstance = flatpickr(datePicker, {
        dateFormat: 'd/m/Y',
        minDate: today,
        defaultDate: today,
        locale: {
            firstDayOfWeek: 1
        },
        onChange: function(selectedDates) {
            loadShowtimes(formatDate(selectedDates[0]));
        }
    });
    
    // Initialize time pickers
    flatpickr(startTime, {
        enableTime: true,
        noCalendar: true,
        dateFormat: "H:i",
        minTime: "08:00",
        maxTime: "23:00",
        onChange: function(selectedDates, dateStr) {
            if (selectedMovieId.value) {
                updateEndTime();
            }
        }
    });
    
    // Đặt giá trị date-picker là ngày 09/09/2025 nếu chưa có
    if (!datePicker.value) {
        const defaultDate = new Date(); // Tháng 9 là 8
        console.log(defaultDate);
        datePicker.value = formatDate(defaultDate);
    }
    // Khởi tạo navigation tuần và load dữ liệu đúng thứ tự
    if (document.getElementById('prev-week')) {
        initWeekNavigation();
    }
    loadShowtimes(datePicker.value);
    loadRooms();
    
    // Event listeners
    btnAddShowtime.addEventListener('click', openAddModal);
    btnCloseModal.addEventListener('click', closeModal);
    btnCancel.addEventListener('click', closeModal);
    btnCancelDelete.addEventListener('click', () => {
        confirmModal.classList.add('hidden');
    });
    
    showtimeForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        if (!validateForm()) return;
        Spinner.show({ target: showtimeModal, text: 'Đang xử lý...' });
        const batdau = `${showtimeDate.value} ${startTime.value}`;
        const ketthuc = `${showtimeDate.value} ${endTime.value}`;
        const checkUrl = `${showtimeListing.dataset.url}/api/suat-chieu/kiem-tra-hop-le?batdau=${encodeURIComponent(batdau)}&id_phong_chieu=${roomSelect.value}&thoi_luong_phim=${selectedMovieInfo.dataset.duration}`;
        try {
            const checkRes = await fetch(checkUrl, { method: 'GET' });
            const checkData = await checkRes.json();
            if (!checkData.success) {
                showToast(checkData.message, 'error');
                Spinner.hide();
                return;
            }
        } catch (e) {
            showToast('Lỗi kiểm tra suất chiếu', 'error');
            Spinner.hide();
            return;
        }
        const id = showtimeId.value;
        const body = JSON.stringify({
            id_phim: selectedMovieId.value,
            id_phongchieu: roomSelect.value,
            batdau,
            ketthuc
        });
        try {
            let res, data;
            if (id) {
                res = await fetch(`${showtimeListing.dataset.url}/api/suat-chieu/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body
                });
            } else {
                res = await fetch(`${showtimeListing.dataset.url}/api/suat-chieu`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                        id_phim: selectedMovieId.value,
                        id_phongchieu: roomSelect.value,
                        batdau,
                        ketthuc
                    })
                });
            }
            data = await res.json();
            if (data.success) {
                closeModal();
                loadShowtimes(showtimeDate.value);
                showToast(id ? 'Cập nhật suất chiếu thành công' : 'Thêm suất chiếu thành công');
            } else {
                showToast(data.message, 'error');
            }
        } catch (e) {
            showToast(id ? 'Lỗi cập nhật suất chiếu' : 'Lỗi thêm suất chiếu', 'error');
        }
        Spinner.hide();
    });
    movieSearch.addEventListener('input', debounce(handleMovieSearch, 300));
    roomSelect.addEventListener('change', generateSuggestedTimes);
    
    // Functions
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    function displayDate(date) {
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(date).toLocaleDateString('vi-VN', options);
    }
    
    function updateEndTime() {
        // Calculate end time based on movie duration and start time
        const movieDuration = parseInt(selectedMovieInfo.dataset.duration, 10) || 0;
        
        if (startTime.value && movieDuration > 0) {
            const [hours, minutes] = startTime.value.split(':').map(Number);
            let startMinutes = hours * 60 + minutes;
            let endMinutes = startMinutes + movieDuration + 30; // Add 30 minutes for ads/cleanup
            
            const endHours = Math.floor(endMinutes / 60);
            const endMins = endMinutes % 60;
            
            endTime.value = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
        } else {
            endTime.value = '';
        }
    }
    
    async function openAddModal() {
        resetForm();
        modalTitle.textContent = 'Thêm suất chiếu mới';
        showtimeId.value = '';
        showtimeDate.value = formatDate(flatpickrInstance.selectedDates[0]);
        await Promise.all([fetchMovies(), fetchRooms()]);
        fillRoomSelect();
        showtimeModal.classList.remove('hidden');
        generateSuggestedTimes();
    }
    
    async function openEditModal(id) {
        Spinner.show({ target: showtimeModal, text: 'Đang tải...' });
        resetForm();
        modalTitle.textContent = 'Cập nhật suất chiếu';
        showtimeId.value = id;
        await Promise.all([fetchMovies(), fetchRooms()]);
        fillRoomSelect();
        const date = document.getElementById('date-picker').value;
        let showtime = null;
        try {
            const res = await fetch(`${showtimeListing.dataset.url}/api/suat-chieu?ngay=${date}`);
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                showtime = data.data.find(s => s.id === id);
            }
        } catch (e) {}
        if (showtime) {
            showtimeDate.value = showtime.batdau.substr(0, 10);
            selectedMovieId.value = showtime.phim.id;
            startTime.value = showtime.batdau.substr(11,5);
            endTime.value = showtime.ketthuc.substr(11,5);
            roomSelect.value = showtime.phong_chieu.id;
            movieSearch.value = showtime.phim.ten_phim;
            const movie = moviesData.find(m => m.id === showtime.phim.id);
            if (movie) {
                selectedMovieInfo.classList.remove('hidden');
                selectedMoviePoster.src = `${showtimeListing.dataset.urlminio}/${movie.poster_url}`;
                selectedMovieTitle.textContent = movie.ten_phim;
                selectedMovieDuration.textContent = `${movie.thoi_luong} phút`;
                selectedMovieInfo.dataset.duration = movie.thoi_luong;
            }
            generateSuggestedTimes();
            showtimeModal.classList.remove('hidden');
        } else {
            showToast('Không tìm thấy thông tin suất chiếu', 'error');
        }
        Spinner.hide();
    }
    
    function closeModal() {
        showtimeModal.classList.add('hidden');
        resetForm();
    }
    
    function resetForm() {
        showtimeForm.reset();
        selectedMovieId.value = '';
        selectedMovieInfo.classList.add('hidden');
        movieSearchResults.innerHTML = '';
        movieSearchResults.classList.add('hidden');
        suggestedTimes.innerHTML = '';
    }
    
    async function handleFormSubmit(event) {
        event.preventDefault();
        if (!validateForm()) return;
        Spinner.show({ target: showtimeModal, text: 'Đang xử lý...' });
        const batdau = `${showtimeDate.value} ${startTime.value}`;
        const ketthuc = `${showtimeDate.value} ${endTime.value}`;
        const checkUrl = `${showtimeListing.dataset.url}/api/suat-chieu/kiem-tra-hop-le?batdau=${encodeURIComponent(batdau)}&id_phong_chieu=${roomSelect.value}&thoi_luong_phim=${selectedMovieInfo.dataset.duration}`;
        try {
            const checkRes = await fetch(checkUrl, { method: 'GET' });
            const checkData = await checkRes.json();
            if (!checkData.success) {
                showToast(checkData.message, 'error');
                Spinner.hide();
                return;
            }
        } catch (e) {
            showToast('Lỗi kiểm tra suất chiếu', 'error');
            Spinner.hide();
            return;
        }
        const id = showtimeId.value;
        const body = JSON.stringify({
            id_phim: selectedMovieId.value,
            id_phongchieu: roomSelect.value,
            batdau,
            ketthuc
        });
        try {
            let res, data;
            if (id) {
                res = await fetch(`${showtimeListing.dataset.url}/api/suat-chieu/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body
                });
            } else {
                res = await fetch(`${showtimeListing.dataset.url}/api/suat-chieu`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                        id_phim: selectedMovieId.value,
                        id_phongchieu: roomSelect.value,
                        batdau,
                        ketthuc
                    })
                });
            }
            data = await res.json();
            if (data.success) {
                closeModal();
                loadShowtimes(showtimeDate.value);
                showToast(id ? 'Cập nhật suất chiếu thành công' : 'Thêm suất chiếu thành công');
            } else {
                showToast(data.message, 'error');
            }
        } catch (e) {
            showToast(id ? 'Lỗi cập nhật suất chiếu' : 'Lỗi thêm suất chiếu', 'error');
        }
        Spinner.hide();
    }
    
    function validateForm() {
        // Simple validation
        if (!selectedMovieId.value) {
            showToast('Vui lòng chọn phim', 'error');
            return false;
        }
        
        if (!roomSelect.value) {
            showToast('Vui lòng chọn phòng chiếu', 'error');
            return false;
        }
        
        if (!startTime.value) {
            showToast('Vui lòng chọn giờ bắt đầu', 'error');
            return false;
        }
        
        return true;
    }
    
    function handleMovieSearch() {
        const query = movieSearch.value.trim().toLowerCase();
        if (query.length < 2) {
            movieSearchResults.innerHTML = '';
            movieSearchResults.classList.add('hidden');
            return;
        }
        const filteredMovies = moviesData.filter(movie =>
            movie.ten_phim && movie.ten_phim.toLowerCase().includes(query)
        );
        displayMovieResults(filteredMovies);
    }
    
    function displayMovieResults(movies) {
        movieSearchResults.innerHTML = '';
        if (movies.length === 0) {
            movieSearchResults.innerHTML = '<div class="p-3 text-sm text-gray-500">Không tìm thấy phim</div>';
            movieSearchResults.classList.remove('hidden');
            return;
        }
        movies.forEach(movie => {
            const poster = `${showtimeListing.dataset.urlminio}/${movie.poster_url}`;
            const item = document.createElement('div');
            item.className = 'p-2 hover:bg-gray-100 cursor-pointer flex items-center';
            item.innerHTML = `
                <img src="${poster}" alt="${movie.ten_phim}" class="w-10 h-14 object-cover mr-2">
                <div>
                    <div class="font-medium">${movie.ten_phim}</div>
                    <div class="text-xs text-gray-600">${movie.thoi_luong || ''} phút</div>
                </div>
            `;
            item.addEventListener('click', () => {
                selectedMovieId.value = movie.id;
                movieSearch.value = movie.ten_phim;
                selectedMovieInfo.classList.remove('hidden');
                selectedMoviePoster.src = poster;
                selectedMovieTitle.textContent = movie.ten_phim;
                selectedMovieDuration.textContent = `${movie.thoi_luong || ''} phút`;
                selectedMovieInfo.dataset.duration = movie.thoi_luong || 0;
                movieSearchResults.classList.add('hidden');
                if (startTime.value) {
                    updateEndTime();
                }
                generateSuggestedTimes();
            });
            movieSearchResults.appendChild(item);
        });
        movieSearchResults.classList.remove('hidden');
    }
    
    async function loadShowtimes(date) {
        Spinner.show({ text: 'Đang tải suất chiếu...' });
        try {
            showtimeListing.innerHTML = '<div class="text-center py-8 text-gray-500">Đang tải dữ liệu...</div>';
            const res = await fetch(`${showtimeListing.dataset.url}/api/suat-chieu?ngay=${date}`);
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                const showtimes = data.data;
                const movieMap = {};
                showtimes.forEach(s => {
                    const movieId = s.phim.id;
                    if (!movieMap[movieId]) {
                        movieMap[movieId] = {
                            id: movieId,
                            title: s.phim.ten_phim,
                            duration: s.phim.thoi_luong,
                            poster: `${showtimeListing.dataset.urlminio}/${s.phim.poster_url}`,
                            showtimes: []
                        };
                    }
                    movieMap[movieId].showtimes.push({
                        id: s.id,
                        movie_id: movieId,
                        movie_title: s.phim.ten_phim,
                        movie_poster: `${showtimeListing.dataset.urlminio}/${s.phim.poster_url}`,
                        movie_duration: s.phim.thoi_luong,
                        room_id: s.phong_chieu.id,
                        room_name: s.phong_chieu.ten,
                        date: date,
                        start_time: s.batdau.substr(11,5),
                        end_time: s.ketthuc.substr(11,5)
                    });
                });
                const moviesWithShowtimes = Object.values(movieMap);
                displayShowtimes(moviesWithShowtimes, date);
            } else {
                showtimeListing.innerHTML = '<div class="text-center py-8 text-gray-500">Không có dữ liệu suất chiếu</div>';
            }
            document.getElementById('date-picker').value = date;
        } catch (e) {
            showtimeListing.innerHTML = '<div class="text-center py-8 text-red-500">Lỗi tải dữ liệu suất chiếu</div>';
        } finally {
            Spinner.hide();
        }
    }
    
    function displayShowtimes(movies, date) {
        if (movies.length === 0) {
            showtimeListing.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-gray-500 mb-4">Chưa có suất chiếu nào vào ngày ${displayDate(date)}</p>
                </div>
            `;
            return;
        }
        
        showtimeListing.innerHTML = '';
        
        movies.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.className = 'bg-white border rounded-lg overflow-hidden shadow-sm mb-6';
            
            const showtimesHtml = movie.showtimes.map(showtime => `
                <div class="flex flex-col sm:flex-row sm:items-center border-t py-3 px-4 gap-2">
                    <div class="flex items-center">
                        <div class="font-medium min-w-24">${showtime.start_time} - ${showtime.end_time}</div>
                        <span class="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded ml-2">${showtime.room_name}</span>
                    </div>
                    <div class="flex items-center ml-auto space-x-2 mt-2 sm:mt-0">
                        <button class="btn-edit text-blue-600 hover:text-blue-800" data-id="${showtime.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                        </button>
                        <button class="btn-delete text-red-600 hover:text-red-800" data-id="${showtime.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            `).join('');
            
            movieCard.innerHTML = `
                <div class="flex p-4">
                    <img src="${movie.poster}" alt="${movie.title}" class="w-16 h-24 object-cover rounded mr-4">
                    <div>
                        <h3 class="font-bold text-lg">${movie.title}</h3>
                        <p class="text-sm text-gray-600">${movie.duration} phút</p>
                    </div>
                </div>
                <div class="showtimes">
                    ${showtimesHtml}
                </div>
            `;
            
            showtimeListing.appendChild(movieCard);
        });
        
        // Add event listeners for edit and delete buttons
        document.querySelectorAll('.btn-edit').forEach(button => {
            button.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                openEditModal(id);
            });
        });
        
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                confirmModal.classList.remove('hidden');
                
                btnConfirmDelete.onclick = function() {
                    deleteShowtime(id);
                };
            });
        });
    }
    
    function deleteShowtime(id) {
        Spinner.show({ text: 'Đang xóa...' });
        fetch(`${showtimeListing.dataset.url}/api/suat-chieu/${id}`, {
            method: 'DELETE'
        })
        .then(res => res.json())
        .then(data => {
            confirmModal.classList.add('hidden');
            if (data.success) {
                loadShowtimes(formatDate(flatpickrInstance.selectedDates[0]));
                showToast('Xóa suất chiếu thành công');
            } else {
                showToast(data.message, 'error');
            }
        })
        .catch(() => {
            showToast('Lỗi xóa suất chiếu', 'error');
        })
        .finally(() => {
            Spinner.hide();
        });
    }
    
    function loadRooms() {
        roomSelect.innerHTML = '<option value="">-- Chọn phòng chiếu --</option>';
    }
    
    function generateSuggestedTimes() {
        suggestedTimes.innerHTML = '';
        const movieId = selectedMovieId.value || '';
        const roomId = roomSelect.value || '';
        const date = showtimeDate.value || '';
        let duration = selectedMovieInfo.dataset.duration;
        duration = /^\d+$/.test(duration) ? duration : '';

        if (!movieId || !roomId || !date || !duration) {
            suggestedTimes.innerHTML = '<div class="p-2 text-sm text-gray-500">Vui lòng chọn phim, phòng chiếu và ngày chiếu</div>';
            return;
        }

        const url = `${showtimeListing.dataset.url}/api/suat-chieu/tao-khung-gio-goi-y?ngay=${date}&id_phong_chieu=${roomId}&thoi_luong_phim=${duration}`;
        fetch(url)
            .then(res => res.json())
            .then(data => {
                if (data.success && Array.isArray(data.data)) {
                    displayAvailableTimes(data.data);
                } else {
                    suggestedTimes.innerHTML = '<div class="p-2 text-sm text-gray-500">Không có khung giờ gợi ý phù hợp</div>';
                }
            })
            .catch(() => {
                suggestedTimes.innerHTML = '<div class="p-2 text-sm text-red-500">Lỗi lấy khung giờ gợi ý</div>';
            });
    }
    
    function displayAvailableTimes(times) {
        suggestedTimes.innerHTML = '';
        
        times.forEach(time => {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot border rounded-md py-1 px-2 text-center text-sm';
            timeSlot.textContent = time;
            
            timeSlot.addEventListener('click', function() {
                startTime.value = time;
                updateEndTime();
                
                // Remove 'selected' class from all time slots
                document.querySelectorAll('.time-slot').forEach(slot => {
                    slot.classList.remove('selected');
                });
                
                // Add 'selected' class to the clicked time slot
                this.classList.add('selected');
            });
            
            suggestedTimes.appendChild(timeSlot);
        });
    }
    
    function showToast(message, type = 'success') {
        toastMessage.textContent = message;
        
        if (type === 'error') {
            toast.classList.remove('bg-green-500');
            toast.classList.add('bg-red-500');
        } else {
            toast.classList.remove('bg-red-500');
            toast.classList.add('bg-green-500');
        }
        
        // Show toast
        toast.classList.remove('translate-y-20', 'opacity-0');
        
        // Hide toast after 3 seconds
        setTimeout(() => {
            toast.classList.add('translate-y-20', 'opacity-0');
        }, 3000);
    }
    
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }
    
    // Click outside to close dropdowns
    document.addEventListener('click', function(event) {
        if (!movieSearch.contains(event.target) && !movieSearchResults.contains(event.target)) {
            movieSearchResults.classList.add('hidden');
        }
    });
    
    // Các biến và hàm hiện có trong file đã được giữ nguyên

    // Chức năng điều hướng theo tuần (Phương án 1)
    function updateWeekDisplay() {
        const weekRangeDisplay = document.getElementById('week-range');
        const currentWeekStart = new Date();
        const weekEnd = new Date();
        weekEnd.setDate(currentWeekStart.getDate() + 6);
        const formatDay = date => {
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`; // DD/MM/YYYY
        };
        weekRangeDisplay.textContent = `${formatDay(currentWeekStart)} - ${formatDay(weekEnd)}`;
    }

    function initWeekNavigation() {
        const prevWeekBtn = document.getElementById('prev-week');
        const nextWeekBtn = document.getElementById('next-week');
        let selectedDate = document.getElementById('date-picker').value;
        if (!selectedDate) {
            const today = new Date();
            //console.log(today)
            today.setHours(0,0,0,0);
            selectedDate = formatDate(today);
            document.getElementById('date-picker').value = selectedDate;
        }
        const parts = selectedDate.split('/');
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Tháng trong JavaScript là 0-11
        let year = parseInt(parts[2], 10);
        let baseDate = new Date(year, month, day);
        baseDate.setHours(0,0,0,0);
        currentWeekStart = new Date(baseDate); // Tuần bắt đầu từ ngày đang chọn
        updateWeekDisplay();
        renderWeekDays(currentWeekStart, selectedDate);
        prevWeekBtn.addEventListener('click', () => {
            currentWeekStart.setDate(currentWeekStart.getDate() - 7);
            updateWeekDisplay();
            renderWeekDays(currentWeekStart, document.getElementById('date-picker').value);
        });
        nextWeekBtn.addEventListener('click', () => {
            currentWeekStart.setDate(currentWeekStart.getDate() + 7);
            updateWeekDisplay();
            renderWeekDays(currentWeekStart, document.getElementById('date-picker').value);
        });
    }

    function getMonday(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Nếu Chủ nhật thì lùi về Thứ 2 tuần trước
        d.setDate(diff);
        d.setHours(0,0,0,0);
        return d;
    }

    function renderWeekDays(currentWeekStart, selectedDateStr) {
        const container = document.getElementById('date-nav-container');
        if (!container) return;
        container.innerHTML = '';
        const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
        const monday = getMonday(currentWeekStart);
        const today = new Date();
        today.setHours(0,0,0,0);
        for (let i = 0; i < 7; i++) {
            const itemDate = new Date(monday);
            itemDate.setDate(monday.getDate() + i);
            itemDate.setHours(0,0,0,0);
            const day = itemDate.getDate();
            const month = itemDate.getMonth() + 1;
            const year = itemDate.getFullYear();
            const dayOfWeek = days[i];
            const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const isSelected = formattedDate === selectedDateStr;
            const isToday = itemDate.getTime() === today.getTime();
            const itemDiv = document.createElement('div');
            itemDiv.className = 'date-nav-item';
            itemDiv.dataset.date = formattedDate;
            itemDiv.innerHTML = `<div class="text-center p-2 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors">
                <p class="text-xs font-medium ${isSelected ? 'text-blue-600' : isToday ? 'text-green-600' : 'text-gray-500'}">${dayOfWeek}</p>
                <p class="text-lg font-bold ${isSelected ? 'text-blue-600' : isToday ? 'text-green-600' : ''}">${day.toString().padStart(2, '0')}</p>
                <p class="text-xs ${isSelected ? 'text-blue-600' : isToday ? 'text-green-600' : 'text-gray-500'}">${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}</p>
            </div>`;
            const div = itemDiv.querySelector('div');
            if (isSelected) {
                div.classList.add('border-blue-500', 'bg-blue-50');
            }
            if (isToday) {
                div.classList.add('border-green-500', 'bg-green-50');
            }
            itemDiv.addEventListener('click', function() {
                document.getElementById('date-picker').value = formattedDate;
                currentWeekStart = new Date(formattedDate); // Tuần bắt đầu từ ngày đang chọn
                updateWeekDisplay();
                renderWeekDays(currentWeekStart, formattedDate);
                loadShowtimes(formattedDate);
                updateAddShowtimeButtonVisibility();
            });
            container.appendChild(itemDiv);
        }
    }

    // Khởi tạo navigation tuần và load dữ liệu đúng thứ tự
    if (document.getElementById('prev-week')) {
        initWeekNavigation();
    }

    function updateAddShowtimeButtonVisibility() {
        const btnAddShowtime = document.getElementById('btn-add-showtime');
        const datePicker = document.getElementById('date-picker');
        if (!btnAddShowtime || !datePicker) return;
        const parts = datePicker.value.split('/');
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Tháng trong JavaScript là 0-11
        let year = parseInt(parts[2], 10);
        const selectedDate = new Date(year, month, day);
        const today = new Date();
        today.setHours(0,0,0,0);
        selectedDate.setHours(0,0,0,0);
        if (selectedDate < today) {
            btnAddShowtime.style.display = 'none';
        } else {
            btnAddShowtime.style.display = '';
        }
    }

    // Gọi hàm này khi chọn ngày hoặc khi load trang
    if (document.getElementById('date-picker')) {
        updateAddShowtimeButtonVisibility();
        document.getElementById('date-picker').addEventListener('change', updateAddShowtimeButtonVisibility);
    }

    // Trong các hàm điều hướng tuần/ngày, sau khi cập nhật ngày, cũng gọi updateAddShowtimeButtonVisibility();
});