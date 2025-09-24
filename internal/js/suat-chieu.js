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
    const perRoomTimes = document.getElementById('per-room-times');
    const singleTimeRow = document.getElementById('single-time-row');
    
    // Buttons
    const btnAddShowtime = document.getElementById('btn-add-showtime');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnSubmitWeek = document.getElementById('btn-submit-week');
    const weekStatus = document.getElementById('week-status');
    const btnCancel = document.getElementById('btn-cancel');
    const btnCancelDelete = document.getElementById('btn-cancel-delete');
    const btnConfirmDelete = document.getElementById('btn-confirm-delete');
    
    let moviesData = [];
    let roomsData = [];
    let nhatKyData = []; // Lưu nhật ký toàn cục
    function fetchNhatKy() {
    const logBadge = document.getElementById('log-badge');
    fetch(`${showtimeListing.dataset.url}/api/nhat-ky-suat-chieu`)
        .then(res => res.json())
        .then(data => {
            if (data.success && Array.isArray(data.data)) {
                nhatKyData = data.data;
                // Đếm số nhật ký mới
                const soMoi = nhatKyData.filter(item => item.rap_da_xem == 0).length;
                if (logBadge) {
                    if (soMoi > 0) {
                        logBadge.textContent = soMoi;
                        logBadge.classList.remove('hidden');
                    } else {
                        logBadge.classList.add('hidden');
                    }
                }
            }
        });
    }
    fetchNhatKy(); // Gọi khi tải trang
    const btnLog = document.getElementById('btn-log');
        const logModal = document.getElementById('log-modal');
        const btnCloseLog = document.getElementById('btn-close-log');
        btnLog.addEventListener('click', () => {
            // Gọi API đánh dấu đã xem nhật ký
            fetch(`${showtimeListing.dataset.url}/api/nhat-ky-suat-chieu/rap-da-xem`, {
                method: 'PUT'
            }).then(() => {
                // Ẩn badge sau khi đã xem
                const logBadge = document.getElementById('log-badge');
                if (logBadge) logBadge.classList.add('hidden');
            });

            logModal.classList.remove('hidden');
            const logContent = document.getElementById('log-content');
            if (!logContent) return;
            if (!nhatKyData.length) {
                logContent.innerHTML = '<div class="text-gray-500 text-center">Chưa có nhật ký.</div>';
                return;
            }
            const actionColors = {
                0: 'bg-blue-50 text-blue-700',     // Tạo
                1: 'bg-yellow-50 text-yellow-800', // Cập nhật
                2: 'bg-red-50 text-red-700',       // Xóa
                3: 'bg-green-50 text-green-700',   // Duyệt
                4: 'bg-gray-100 text-gray-700',    // Từ chối
                default: 'bg-gray-50 text-gray-700'
            };
            const rows = nhatKyData.map(item => {
                const time = new Date(item.created_at);
                const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')} ${time.getDate().toString().padStart(2, '0')}/${(time.getMonth()+1).toString().padStart(2, '0')}/${time.getFullYear()}`;
                const batdauStr = item.batdau
                    ? ' - ' + (() => {
                        const d = new Date(item.batdau);
                        return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} ${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`;
                    })()
                    : '';
                const hanhDong = ({
                    0: 'Tạo',
                    1: 'Cập nhật',
                    2: 'Xóa',
                    3: 'Duyệt',
                    4: 'Từ chối'
                })[item.hanh_dong] ?? 'Khác';
                const colorClass = actionColors[item.hanh_dong] || actionColors.default;
                const phim = item.ten_phim ? ` - ${item.ten_phim}` : '';
                const batdau = item.batdau ? `${batdauStr}` : '';
                const isNew = item.rap_da_xem == 0;
                return `
                    <div class="py-2 border-b last:border-0 ${colorClass}">
                        <div class="text-sm flex flex-wrap items-center">
                            <span class="font-medium">${hanhDong}</span>${phim}${batdau}
                            ${isNew ? '<span class="ml-2 inline-block px-2 py-0.5 text-xs rounded bg-yellow-400 text-white align-middle">Mới</span>' : ''}
                        </div>
                        <div class="text-xs text-gray-500">${timeStr}</div>
                    </div>
                `;
            }).join('');
            logContent.innerHTML = `<div>${rows}</div>`;
        });
    btnCloseLog.addEventListener('click', () => {
        logModal.classList.add('hidden');
    });
    logModal.addEventListener('click', (e) => {
        if (e.target === logModal) logModal.classList.add('hidden');
    });
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
    
    // Đặt giá trị date-picker là ngày hiện tại nếu chưa có
    if (!datePicker.value) {
        const defaultDate = new Date();
        datePicker.value = formatDateDisplay(defaultDate);
    }
    // Chuyển sang format YYYY-MM-DD để load showtimes
    const selectedDateAPI = formatDate(parseDateFromDisplay(datePicker.value));
    loadShowtimes(selectedDateAPI);
    loadRooms();
    
    // Event listeners
    btnAddShowtime.addEventListener('click', openAddModal);
    btnCloseModal.addEventListener('click', closeModal);
    if (btnSubmitWeek) {
        btnSubmitWeek.addEventListener('click', onSubmitWeekClick);
    }
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
        
        const selectedRooms = Array.from(roomSelect.selectedOptions)
            .map(opt => opt.value)
            .filter(val => val);
        const id = showtimeId.value;
        if (id && selectedRooms.length !== 1) {
                showToast('Vui lòng chọn đúng 1 phòng chiếu khi cập nhật', 'error');
                Spinner.hide();
                return;
            }
        if (!id && selectedRooms.length === 0) {
            showToast('Vui lòng chọn ít nhất một phòng chiếu', 'error');
            Spinner.hide();
            return;
        }
        try {
            // Kiểm tra trùng suất chiếu
            for (const roomId of selectedRooms) {
                const startValue = getStartTimeForRoom(roomId) || startTime.value;
                const batdauRoom = `${showtimeDate.value} ${startValue}`;
                const checkUrl = `${showtimeListing.dataset.url}/api/suat-chieu/kiem-tra-hop-le?batdau=${encodeURIComponent(batdauRoom)}&id_phong_chieu=${roomId}&thoi_luong_phim=${selectedMovieInfo.dataset.duration}`;
                const checkRes = await fetch(checkUrl, { method: 'GET' });
                const checkData = await checkRes.json();
                if (!checkData.success) {
                    showToast(checkData.message, 'error');
                    Spinner.hide();
                    return;
                }
            }
        } catch (e) {
            showToast('Lỗi kiểm tra suất chiếu', 'error');
            Spinner.hide();
            return;
        }
        const body = JSON.stringify({
            id_phim: selectedMovieId.value,
            id_phongChieu: parseInt(selectedRooms[0]),
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
                // Thêm mới
                if (selectedRooms.length > 1) {
                    for (const roomId of selectedRooms) {
                        const startVal = getStartTimeForRoom(roomId) || startTime.value;
                        if (!startVal) { data = { success: false, message: 'Vui lòng chọn giờ bắt đầu cho từng phòng' }; break; }
                        const batdauR = `${showtimeDate.value} ${startVal}`;
                        const endVal = calculateEndFromStart(startVal);
                        const ketthucR = `${showtimeDate.value} ${endVal}`;
                        const resp = await fetch(`${showtimeListing.dataset.url}/api/suat-chieu`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            body: new URLSearchParams({
                                id_phim: selectedMovieId.value,
                                list_phongChieu: [roomId],
                                batdau: batdauR,
                                ketthuc: ketthucR
                            })
                        });
                        const js = await resp.json();
                        if (!js.success) { data = js; break; }
                        data = js;
                    }
            } else {
                res = await fetch(`${showtimeListing.dataset.url}/api/suat-chieu`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                        id_phim: selectedMovieId.value,
                        list_phongChieu: selectedRooms,
                        batdau,
                        ketthuc
                    })
                });
            data = await res.json();
                }
            }
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
    roomSelect.addEventListener('change', () => {
        renderPerRoomTimeInputs();
        generateSuggestedTimes();
    });
    
    // Functions
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    function formatDateDisplay(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${day}/${month}/${year}`;
    }
    
    function parseDateFromDisplay(dateStr) {
        // Chuyển từ DD/MM/YYYY sang Date object
        const parts = dateStr.split('/');
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Tháng trong JavaScript là 0-11
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day);
    }
    
    function parseDateFromAPI(dateStr) {
        // Chuyển từ YYYY-MM-DD sang Date object
        return new Date(dateStr);
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
        await Promise.all([fetchMovies(), fetchRooms()]);
        fillRoomSelect();

        // Thêm lại thuộc tính multiple khi thêm mới
        roomSelect.setAttribute('multiple', 'multiple');
        // Gán ngày chiếu theo date-picker hiện tại
        const dateDisplay = document.getElementById('date-picker').value;
        const dateAPI = dateDisplay && dateDisplay.includes('/')
            ? formatDate(parseDateFromDisplay(dateDisplay))
            : (dateDisplay || formatDate(new Date()));
        showtimeDate.value = dateAPI;
        // Khởi tạo khung giờ gợi ý + input theo phòng
        generateSuggestedTimes();
        renderPerRoomTimeInputs();
        showtimeModal.classList.remove('hidden');
    }
    
    async function openEditModal(id) {
        Spinner.show({ target: showtimeModal, text: 'Đang tải...' });
        resetForm();
        modalTitle.textContent = 'Cập nhật suất chiếu';
        showtimeId.value = id;
        await Promise.all([fetchMovies(), fetchRooms()]);
        fillRoomSelect();

        // Bỏ thuộc tính multiple khi cập nhật
        roomSelect.removeAttribute('multiple');

        const dateDisplay = document.getElementById('date-picker').value;
        const date = formatDate(parseDateFromDisplay(dateDisplay)); // Chuyển sang YYYY-MM-DD
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
    
    function validateForm() {
        // Simple validation
        if (!selectedMovieId.value) {
            showToast('Vui lòng chọn phim', 'error');
            return false;
        }
        const selectedRooms = Array.from(roomSelect.selectedOptions)
            .map(opt => opt.value)
            .filter(Boolean);
        if (selectedRooms.length === 0) {
            showToast('Vui lòng chọn phòng chiếu', 'error');
            return false;
        }
        
        // Nếu nhiều phòng, yêu cầu từng phòng phải có giờ bắt đầu
        if (selectedRooms.length > 1) {
            for (const roomId of selectedRooms) {
                const startVal = getStartTimeForRoom(roomId);
                if (!startVal) {
                    const roomName = getRoomNameById(roomId) || `phòng ${roomId}`;
                    showToast(`Vui lòng nhập giờ bắt đầu cho ${roomName}`, 'error');
                    return false;
                }
            }
            return true;
        }
        
        // Một phòng: kiểm tra input chung
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
                        status: s.tinh_trang,
                        date: date,
                        reason: s.ly_do || '',
                        start_time: s.batdau.substr(11,5),
                        end_time: s.ketthuc.substr(11,5)
                    });
                });
                const moviesWithShowtimes = Object.values(movieMap);
                displayShowtimes(moviesWithShowtimes, date);
                updateControlsLock();
            } else {
                showtimeListing.innerHTML = '<div class="text-center py-8 text-gray-500">Không có dữ liệu suất chiếu</div>';
            }
            // Không cập nhật date-picker.value ở đây để giữ format DD/MM/YYYY
        } catch (e) {
            showtimeListing.innerHTML = '<div class="text-center py-8 text-red-500">Lỗi tải dữ liệu suất chiếu</div>';
        } finally {
            Spinner.hide();
        }
    }

    function getWeekStartFromAnyDate(dateStr) {
        // dateStr: YYYY-MM-DD
        const d = new Date(dateStr);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        d.setHours(0,0,0,0);
        return formatDate(d);
    }


    function updateControlsLock() {
        if (!weekStatus) return;
        const text = weekStatus.textContent || '';
        const locked = text.includes('Chờ duyệt') || text.includes('Đã duyệt');
        document.querySelectorAll('.btn-edit, .btn-delete').forEach(btn => {
            if (locked) {
                btn.setAttribute('disabled', 'true');
                btn.classList.add('opacity-50', 'pointer-events-none');
            } else {
                btn.removeAttribute('disabled');
                btn.classList.remove('opacity-50', 'pointer-events-none');
            }
        });
        if (btnAddShowtime) btnAddShowtime.style.display = locked ? 'none' : '';
    }

    async function onSubmitWeekClick() {
        const dateDisplay = document.getElementById('date-picker').value;
        const dateAPI = formatDate(parseDateFromDisplay(dateDisplay));
        const weekStart = getWeekStartFromAnyDate(dateAPI);
        if (!confirm('Bạn có chắc chắn muốn gửi kế hoạch chiếu phim cho tuần này để xét duyệt không? Sau khi gửi, bạn sẽ không thể chỉnh sửa.')) return;
        Spinner.show({ text: 'Đang gửi duyệt...' });
        try {
            const res = await fetch(`${showtimeListing.dataset.url}/api/suat-chieu/gui-duyet-tuan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ week_start: weekStart })
            });
            const data = await res.json();
            if (data.success) {
                showToast('Gửi duyệt thành công');
                await fetchWeekStatus(dateAPI);
                updateControlsLock();
            } else {
                showToast(data.message || 'Gửi duyệt thất bại', 'error');
            }
        } catch (e) {
            showToast('Gửi duyệt thất bại', 'error');
        }
        Spinner.hide();
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
            
            const showtimesHtml = movie.showtimes.map(showtime => {
                const status = showtimeStatusLabel(showtime.status);
                // Kiểm tra hết hạn
                const now = new Date();
                // Tạo đối tượng Date từ ngày và giờ kết thúc
                const endDateTime = new Date(`${showtime.date}T${showtime.end_time}:00`);
                const isExpired = endDateTime < now;
                const isEditable = showtime.status != 1 && !isExpired; // Không cho sửa/xóa nếu đã duyệt hoặc đã hết hạn

                return `
                    <div class="flex col border-t py-3 px-4 gap-1">
                        <div class="flex flex-col sm:flex-row sm:items-center gap-1">
                            <div class="font-medium min-w-24">${showtime.start_time} - ${showtime.end_time}</div>
                            <span class="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded ml-0 sm:ml-2">${showtime.room_name}</span>
                            <span class="px-2 py-1 rounded text-xs font-semibold ${status.color}">${status.text}</span>
                            ${showtime.status == 2 ? `<span class="text-xs text-gray-500 italic ml-2">Lý do ${showtime.reason}</span>` : ''}
                        </div>
                        <div class="flex items-center ml-auto space-x-2">
                            ${
                                isExpired
                                ? `<span class="text-xs text-gray-400 italic">Đã hết hạn</span>`
                                : (isEditable ? `
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
                                ` : '')
                            }
                        </div>
                    </div>
                `;
            }).join('');
            
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
        const date = showtimeDate.value || '';
        let duration = selectedMovieInfo.dataset.duration;
        duration = /^\d+$/.test(duration) ? duration : '';

        const selectedRooms = Array.from(roomSelect.selectedOptions)
            .map(opt => opt.value)
            .filter(Boolean);

        if (!movieId || selectedRooms.length === 0 || !date || !duration) {
            suggestedTimes.innerHTML = '<div class="p-2 text-sm text-gray-500">Vui lòng chọn phim, phòng chiếu và ngày chiếu</div>';
            return;
        }

        const fetches = selectedRooms.map(roomId => {
        const url = `${showtimeListing.dataset.url}/api/suat-chieu/tao-khung-gio-goi-y?ngay=${date}&id_phong_chieu=${roomId}&thoi_luong_phim=${duration}`;
            return fetch(url)
            .then(res => res.json())
                .then(data => ({ roomId, times: (data.success && Array.isArray(data.data)) ? data.data : [] }))
                .catch(() => ({ roomId, times: null }));
        });

        Promise.all(fetches).then(results => {
        suggestedTimes.innerHTML = '';
            results.forEach(({ roomId, times }) => {
                const roomName = getRoomNameById(roomId) || `Phòng ${roomId}`;
                const group = document.createElement('div');
                group.className = 'mb-5 p-4 border rounded-lg bg-gray-50';

                const title = document.createElement('div');
                title.className = 'text-base font-bold text-blue-700 mb-3';
                title.textContent = `Khung giờ ${roomName}`;
                group.appendChild(title);

                const container = document.createElement('div');
                container.className = 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3';

                if (times === null) {
                    container.innerHTML = '<div class="p-2 text-sm text-red-500 col-span-full">Lỗi lấy khung giờ gợi ý</div>';
                } else if (times.length === 0) {
                    container.innerHTML = '<div class="p-2 text-sm text-gray-500 col-span-full">Không có khung giờ gợi ý phù hợp</div>';
                } else {
                    times.forEach(time => {
                        const label = extractTimeLabel(time);
                        const timeSlot = document.createElement('button');
                        timeSlot.type = 'button';
                        timeSlot.className = 'time-slot border rounded-full py-2 px-3 text-center text-sm font-medium bg-white shadow hover:bg-blue-50 whitespace-nowrap text-blue-700 border-blue-200';
                        timeSlot.textContent = label;
                        // Disable nếu là ngày hôm nay và giờ < hiện tại
                        if (shouldDisableTime(showtimeDate.value, label)) {
                            timeSlot.disabled = true;
                            timeSlot.classList.add('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
                            timeSlot.title = 'Đã qua giờ cho phép';
                        }
            timeSlot.addEventListener('click', function() {
                            if (this.disabled) return;
                            const roomInput = document.getElementById(`start-time-room-${roomId}`);
                            if (roomInput) {
                                roomInput.value = label;
                                autoUpdateEndForRoom(roomId);
                            } else {
                                startTime.value = label;
                updateEndTime();
                            }
                            document.querySelectorAll('.time-slot').forEach(slot => slot.classList.remove('selected', 'bg-blue-600', 'text-white', 'border-blue-600'));
                            this.classList.add('selected', 'bg-blue-600', 'text-white', 'border-blue-600');
                        });
                        container.appendChild(timeSlot);
                    });
                }

                group.appendChild(container);
                suggestedTimes.appendChild(group);
            });
        });
    }

    function getRoomNameById(id) {
        const room = roomsData.find(r => String(r.id) === String(id));
        return room ? room.ten : '';
    }
    function renderPerRoomTimeInputs() {
        if (!perRoomTimes) return;
        const selectedRooms = Array.from(roomSelect.selectedOptions).map(o => o.value).filter(Boolean);
        if (selectedRooms.length <= 1) {
            perRoomTimes.classList.add('hidden');
            if (singleTimeRow) singleTimeRow.classList.remove('hidden');
            return;
        }
        perRoomTimes.innerHTML = '';
        perRoomTimes.classList.remove('hidden');
        if (singleTimeRow) singleTimeRow.classList.add('hidden');
        selectedRooms.forEach(roomId => {
            const roomName = getRoomNameById(roomId) || `Phòng ${roomId}`;
            const row = document.createElement('div');
            row.className = 'p-3 border rounded-md bg-white';
            row.innerHTML = `
                <div class="text-sm font-medium text-gray-700 mb-2">${roomName}</div>
                <div class="flex gap-2">
                    <div class="flex-1">
                        <label class="block text-xs text-gray-500 mb-1">Giờ bắt đầu</label>
                        <input type="text" id="start-time-room-${roomId}" class="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm" placeholder="Chọn giờ bắt đầu">
                    </div>
                    <div class="flex-1">
                        <label class="block text-xs text-gray-500 mb-1">Giờ kết thúc</label>
                        <input type="text" id="end-time-room-${roomId}" class="border-gray-300 rounded-md shadow-sm block w-full sm:text-sm" disabled>
                    </div>
                </div>`;
            perRoomTimes.appendChild(row);
            const input = row.querySelector(`#start-time-room-${roomId}`);
            flatpickr(input, { enableTime: true, noCalendar: true, dateFormat: 'H:i', minTime: '08:00', maxTime: '23:00', onChange: () => autoUpdateEndForRoom(roomId) });
        });
    }
    function getStartTimeForRoom(roomId) {
        const el = document.getElementById(`start-time-room-${roomId}`);
        return el ? el.value : '';
    }
    function calculateEndFromStart(startVal) {
        const movieDuration = parseInt(selectedMovieInfo.dataset.duration, 10) || 0;
        if (!startVal || movieDuration <= 0) return '';
        const [h, m] = startVal.split(':').map(Number);
        let minutes = h * 60 + m + movieDuration + 30;
        const endHours = Math.floor(minutes / 60);
        const endMins = minutes % 60;
        return `${String(endHours).padStart(2,'0')}:${String(endMins).padStart(2,'0')}`;
    }
    function autoUpdateEndForRoom(roomId) {
        const endEl = document.getElementById(`end-time-room-${roomId}`);
        const startVal = getStartTimeForRoom(roomId);
        if (!endEl) return;
        endEl.value = calculateEndFromStart(startVal);
    }
    function extractTimeLabel(value) {
        // Lấy đúng định dạng HH:MM từ chuỗi bất kỳ
        const m = String(value).match(/\b(\d{1,2}:\d{2})\b/);
        return m ? m[1].padStart(5, '0') : String(value);
    }
    function shouldDisableTime(dateStr, timeStr) {
        // dateStr: YYYY-MM-DD, timeStr: HH:MM
        if (!dateStr || !timeStr) return false;
        const now = new Date();
        const [h, m] = timeStr.split(':').map(Number);
        const slot = new Date(dateStr + 'T' + String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ':00');
        // Chỉ disable nếu là cùng ngày hôm nay và slot < hiện tại
        const isSameDay = now.toISOString().slice(0,10) === dateStr;
        return isSameDay && slot < now;
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
        if (!weekRangeDisplay || !currentWeekStart) return;
        
        const weekEnd = new Date(currentWeekStart);
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
            today.setHours(0,0,0,0);
            selectedDate = formatDateDisplay(today);
            document.getElementById('date-picker').value = selectedDate;
        }
        
        // Parse date - date-picker hiển thị DD/MM/YYYY
        let baseDate;
        if (selectedDate.includes('/')) {
            // Format DD/MM/YYYY từ date-picker
            baseDate = parseDateFromDisplay(selectedDate);
        } else {
            // Format YYYY-MM-DD từ API
            baseDate = parseDateFromAPI(selectedDate);
        }
        
        baseDate.setHours(0,0,0,0);
        currentWeekStart = getMonday(baseDate); // Tuần bắt đầu từ thứ 2
        updateWeekDisplay();
        // Chuyển sang format YYYY-MM-DD cho renderWeekDays
        const selectedDateAPI = formatDate(baseDate);
        renderWeekDays(currentWeekStart, selectedDateAPI);
        
        prevWeekBtn.addEventListener('click', () => {
            currentWeekStart.setDate(currentWeekStart.getDate() - 7);
            updateWeekDisplay();
            // Cập nhật date-picker với ngày đầu tuần mới (format DD/MM/YYYY)
            const newDateDisplay = formatDateDisplay(currentWeekStart);
            const newDateAPI = formatDate(currentWeekStart);
            document.getElementById('date-picker').value = newDateDisplay;
            renderWeekDays(currentWeekStart, newDateAPI);
            loadShowtimes(newDateAPI);
        });
        
        nextWeekBtn.addEventListener('click', () => {
            currentWeekStart.setDate(currentWeekStart.getDate() + 7);
            updateWeekDisplay();
            // Cập nhật date-picker với ngày đầu tuần mới (format DD/MM/YYYY)
            const newDateDisplay = formatDateDisplay(currentWeekStart);
            const newDateAPI = formatDate(currentWeekStart);
            document.getElementById('date-picker').value = newDateDisplay;
            renderWeekDays(currentWeekStart, newDateAPI);
            loadShowtimes(newDateAPI);
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
                // Cập nhật date-picker với format DD/MM/YYYY
                const dateDisplay = formatDateDisplay(new Date(formattedDate));
                document.getElementById('date-picker').value = dateDisplay;
                // Cập nhật currentWeekStart để tuần hiển thị đúng
                currentWeekStart = getMonday(new Date(formattedDate));
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
        
        const dateValue = datePicker.value;
        let selectedDate;
        
        if (dateValue.includes('/')) {
            selectedDate = parseDateFromDisplay(dateValue);
        } else {
            selectedDate = parseDateFromAPI(dateValue);
        }
        
        const today = new Date();
        today.setHours(0,0,0,0);
        selectedDate.setHours(0,0,0,0);

        if (selectedDate < today) {
            btnAddShowtime.classList.add('hidden');
        } else {
            btnAddShowtime.classList.remove('hidden');
        }
    }

    // Gọi hàm này khi chọn ngày hoặc khi load trang
    if (document.getElementById('date-picker')) {
        updateAddShowtimeButtonVisibility();
        document.getElementById('date-picker').addEventListener('change', updateAddShowtimeButtonVisibility);
    }

    // Trong các hàm điều hướng tuần/ngày, sau khi cập nhật ngày, cũng gọi updateAddShowtimeButtonVisibility();
});

function showtimeStatusLabel(status) {
    console.log('Status:', status);
    switch (status) {
        case 0: return { text: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800' };
        case 1: return { text: 'Đã duyệt', color: 'bg-green-100 text-green-800' };
        case 2: return { text: 'Từ chối', color: 'bg-red-100 text-red-800' };
        case 3: return { text: 'Chờ duyệt lại', color: 'bg-blue-100 text-blue-800' };
        default: return { text: 'Không xác định', color: 'bg-gray-100 text-gray-800' };
    }
}