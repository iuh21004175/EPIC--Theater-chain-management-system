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
    
    // Demo data
    const demoMovies = [
        { 
            id: 1, 
            title: "Avengers: Endgame", 
            duration: 181,
            poster: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg"
        },
        { 
            id: 2, 
            title: "Joker", 
            duration: 122,
            poster: "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg"
        },
        { 
            id: 3, 
            title: "Parasite", 
            duration: 132,
            poster: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg"
        },
        { 
            id: 4, 
            title: "Dune", 
            duration: 155,
            poster: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg"
        },
        { 
            id: 5, 
            title: "Spider-Man: No Way Home", 
            duration: 148,
            poster: "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg"
        }
    ];

    const demoRooms = [
        { id: 1, name: "Phòng 1", capacity: 120 },
        { id: 2, name: "Phòng 2", capacity: 80 },
        { id: 3, name: "Phòng 3", capacity: 150 },
        { id: 4, name: "Phòng 4 - IMAX", capacity: 200 },
        { id: 5, name: "Phòng 5 - VIP", capacity: 50 }
    ];

    let demoShowtimes = [
        {
            id: 1,
            movie_id: 1,
            movie_title: "Avengers: Endgame",
            movie_poster: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
            movie_duration: 181,
            room_id: 4,
            room_name: "Phòng 4 - IMAX",
            date: "2025-09-04",
            start_time: "10:00",
            end_time: "13:01"
        },
        {
            id: 2,
            movie_id: 1,
            movie_title: "Avengers: Endgame",
            movie_poster: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
            movie_duration: 181,
            room_id: 1,
            room_name: "Phòng 1",
            date: "2025-09-04",
            start_time: "14:30",
            end_time: "17:31"
        },
        {
            id: 3,
            movie_id: 1,
            movie_title: "Avengers: Endgame",
            movie_poster: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
            movie_duration: 181,
            room_id: 2,
            room_name: "Phòng 2",
            date: "2025-09-04",
            start_time: "19:00",
            end_time: "22:01"
        },
        {
            id: 4,
            movie_id: 2,
            movie_title: "Joker",
            movie_poster: "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
            movie_duration: 122,
            room_id: 3,
            room_name: "Phòng 3",
            date: "2025-09-04",
            start_time: "11:30",
            end_time: "13:32"
        },
        {
            id: 5,
            movie_id: 2,
            movie_title: "Joker",
            movie_poster: "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
            movie_duration: 122,
            room_id: 5,
            room_name: "Phòng 5 - VIP",
            date: "2025-09-04",
            start_time: "18:00",
            end_time: "20:02"
        },
        {
            id: 6,
            movie_id: 3,
            movie_title: "Parasite",
            movie_poster: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
            movie_duration: 132,
            room_id: 2,
            room_name: "Phòng 2",
            date: "2025-09-05",
            start_time: "13:00",
            end_time: "15:12"
        }
    ];

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
            .then(data => {
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
    
    // Load initial data
    loadShowtimes(formatDate(today));
    loadRooms();
    
    // Event listeners
    btnAddShowtime.addEventListener('click', openAddModal);
    btnCloseModal.addEventListener('click', closeModal);
    btnCancel.addEventListener('click', closeModal);
    btnCancelDelete.addEventListener('click', () => {
        confirmModal.classList.add('hidden');
    });
    
    showtimeForm.addEventListener('submit', handleFormSubmit);
    movieSearch.addEventListener('input', debounce(handleMovieSearch, 300));
    
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
    
    function openEditModal(id) {
        resetForm();
        modalTitle.textContent = 'Cập nhật suất chiếu';
        showtimeId.value = id;
        
        // Find showtime in demo data
        const showtime = demoShowtimes.find(s => s.id === parseInt(id));
        
        if (showtime) {
            showtimeDate.value = showtime.date;
            selectedMovieId.value = showtime.movie_id;
            startTime.value = showtime.start_time;
            endTime.value = showtime.end_time;
            roomSelect.value = showtime.room_id;
            movieSearch.value = showtime.movie_title;
            
            // Display movie info
            selectedMovieInfo.classList.remove('hidden');
            selectedMoviePoster.src = showtime.movie_poster;
            selectedMovieTitle.textContent = showtime.movie_title;
            selectedMovieDuration.textContent = `${showtime.movie_duration} phút`;
            selectedMovieInfo.dataset.duration = showtime.movie_duration;
            
            // Generate suggested times
            generateSuggestedTimes();
            
            showtimeModal.classList.remove('hidden');
        } else {
            showToast('Không tìm thấy thông tin suất chiếu', 'error');
        }
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
    
    function handleFormSubmit(event) {
        event.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            return;
        }
        
        const formData = new FormData(showtimeForm);
        const isUpdate = formData.get('id') !== '';
        
        // Demo data handling
        if (isUpdate) {
            const id = parseInt(formData.get('id'));
            const index = demoShowtimes.findIndex(s => s.id === id);
            
            if (index !== -1) {
                // Get selected movie and room
                const movieId = parseInt(formData.get('movie_id'));
                const roomId = parseInt(formData.get('room_id'));
                const movie = demoMovies.find(m => m.id === movieId);
                const room = demoRooms.find(r => r.id === roomId);
                
                // Update showtime
                demoShowtimes[index] = {
                    ...demoShowtimes[index],
                    movie_id: movieId,
                    movie_title: movie.title,
                    movie_poster: movie.poster,
                    movie_duration: movie.duration,
                    room_id: roomId,
                    room_name: room.name,
                    date: formData.get('date'),
                    start_time: formData.get('start_time'),
                    end_time: formData.get('end_time')
                };
            }
        } else {
            // Create new showtime
            const movieId = parseInt(formData.get('movie_id'));
            const roomId = parseInt(formData.get('room_id'));
            const movie = demoMovies.find(m => m.id === movieId);
            const room = demoRooms.find(r => r.id === roomId);
            
            const newShowtime = {
                id: demoShowtimes.length > 0 ? Math.max(...demoShowtimes.map(s => s.id)) + 1 : 1,
                movie_id: movieId,
                movie_title: movie.title,
                movie_poster: movie.poster,
                movie_duration: movie.duration,
                room_id: roomId,
                room_name: room.name,
                date: formData.get('date'),
                start_time: formData.get('start_time'),
                end_time: formData.get('end_time')
            };
            
            demoShowtimes.push(newShowtime);
        }
        
        closeModal();
        loadShowtimes(formData.get('date'));
        showToast(isUpdate ? 'Cập nhật suất chiếu thành công' : 'Thêm suất chiếu thành công');
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
    
    function loadShowtimes(date) {
        showtimeListing.innerHTML = '<div class="text-center py-8 text-gray-500">Đang tải dữ liệu...</div>';
        
        // Filter showtimes by date
        const showtimesByDate = demoShowtimes.filter(s => s.date === date);
        
        // Group by movie
        const moviesWithShowtimes = [];
        const movieIds = [...new Set(showtimesByDate.map(s => s.movie_id))];
        
        movieIds.forEach(movieId => {
            const showtimesForMovie = showtimesByDate.filter(s => s.movie_id === movieId);
            if (showtimesForMovie.length > 0) {
                const movie = {
                    id: movieId,
                    title: showtimesForMovie[0].movie_title,
                    duration: showtimesForMovie[0].movie_duration,
                    poster: showtimesForMovie[0].movie_poster,
                    showtimes: showtimesForMovie
                };
                moviesWithShowtimes.push(movie);
            }
        });
        
        displayShowtimes(moviesWithShowtimes, date);
        
        // Đảm bảo cập nhật giá trị input ẩn
        document.getElementById('date-picker').value = date;
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
        // Remove from demo data
        demoShowtimes = demoShowtimes.filter(s => s.id !== id);
        confirmModal.classList.add('hidden');
        loadShowtimes(formatDate(flatpickrInstance.selectedDates[0]));
        showToast('Xóa suất chiếu thành công');
    }
    
    function loadRooms() {
        roomSelect.innerHTML = '<option value="">-- Chọn phòng chiếu --</option>';
        
        demoRooms.forEach(room => {
            const option = document.createElement('option');
            option.value = room.id;
            option.textContent = `${room.name} - ${room.capacity} ghế`;
            roomSelect.appendChild(option);
        });
    }
    
    function generateSuggestedTimes() {
        suggestedTimes.innerHTML = '';
        
        if (!selectedMovieId.value) {
            return;
        }
        
        // Generate standard time slots
        const standardTimes = [
            '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', 
            '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', 
            '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
            '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
            '20:00', '20:30', '21:00', '21:30', '22:00'
        ];
        
        displayAvailableTimes(standardTimes);
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
    function initWeekNavigation() {
        const prevWeekBtn = document.getElementById('prev-week');
        const nextWeekBtn = document.getElementById('next-week');
        const weekRangeDisplay = document.getElementById('week-range');
        // Lấy ngày hiện tại từ date-picker hoặc hôm nay
        let selectedDate = document.getElementById('date-picker').value;
        if (!selectedDate) {
            const today = new Date();
            today.setHours(0,0,0,0);
            selectedDate = `${today.getFullYear()}-${(today.getMonth()+1).toString().padStart(2,'0')}-${today.getDate().toString().padStart(2,'0')}`;
            document.getElementById('date-picker').value = selectedDate;
        }
        let baseDate = new Date(selectedDate);
        baseDate.setHours(0,0,0,0);
        let currentWeekStart = getMonday(baseDate);
        function updateWeekDisplay() {
            const weekEnd = new Date(currentWeekStart);
            weekEnd.setDate(currentWeekStart.getDate() + 6);
            const formatDay = date => {
                const day = date.getDate().toString().padStart(2, '0');
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                return `${day}/${month}`;
            };
            weekRangeDisplay.textContent = `${formatDay(currentWeekStart)} - ${formatDay(weekEnd)}/${currentWeekStart.getFullYear()}`;
        }
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

    function renderWeekDays(currentWeekStart, selectedDateStr) {
        const container = document.getElementById('date-nav-container');
        if (!container) return;
        container.innerHTML = '';
        const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        for (let i = 0; i < 7; i++) {
            const itemDate = new Date(currentWeekStart);
            itemDate.setDate(currentWeekStart.getDate() + i);
            const day = itemDate.getDate();
            const month = itemDate.getMonth() + 1;
            const year = itemDate.getFullYear();
            const dayOfWeek = days[itemDate.getDay()];
            const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const isSelected = formattedDate === selectedDateStr;
            const itemDiv = document.createElement('div');
            itemDiv.className = 'date-nav-item';
            itemDiv.dataset.date = formattedDate;
            itemDiv.innerHTML = `<div class="text-center p-2 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors">
                <p class="text-xs font-medium ${isSelected ? 'text-blue-600' : 'text-gray-500'}">${dayOfWeek}</p>
                <p class="text-lg font-bold ${isSelected ? 'text-blue-600' : ''}">${day.toString().padStart(2, '0')}</p>
                <p class="text-xs ${isSelected ? 'text-blue-600' : 'text-gray-500'}">${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}</p>
            </div>`;
            if (isSelected) {
                itemDiv.querySelector('div').classList.add('border-blue-500', 'bg-blue-50');
            }
            itemDiv.addEventListener('click', function() {
                document.getElementById('date-picker').value = formattedDate;
                renderWeekDays(currentWeekStart, formattedDate);
                loadShowtimes(formattedDate);
                updateAddShowtimeButtonVisibility();
            });
            container.appendChild(itemDiv);
        }
    }

    // Chức năng điều hướng 7 ngày (Phương án 2)
    function initSevenDayNavigation() {
        const prevPeriodBtn = document.getElementById('prev-period');
        const nextPeriodBtn = document.getElementById('next-period');
        const dateRangeDisplay = document.getElementById('date-range');
        const dateItems = document.querySelectorAll('.date-nav-item');
        
        let currentPeriodStart = new Date();
        currentPeriodStart.setHours(0, 0, 0, 0);
        
        // Cập nhật hiển thị khoảng thời gian hiện tại
        updatePeriodDisplay();
        
        prevPeriodBtn.addEventListener('click', () => {
            currentPeriodStart.setDate(currentPeriodStart.getDate() - 7);
            updatePeriodDisplay();
            updateDateNavItems();
        });
        
        nextPeriodBtn.addEventListener('click', () => {
            currentPeriodStart.setDate(currentPeriodStart.getDate() + 7);
            updatePeriodDisplay();
            updateDateNavItems();
        });
        
        // Thêm sự kiện click cho các mục ngày
        dateItems.forEach(item => {
            item.addEventListener('click', () => {
                const selectedDate = item.dataset.date;
                
                // Cập nhật trạng thái đã chọn
                dateItems.forEach(el => {
                    const itemDiv = el.querySelector('div');
                    itemDiv.classList.remove('border-blue-500', 'bg-blue-50');
                    itemDiv.querySelectorAll('p').forEach(p => p.classList.remove('text-blue-600'));
                });
                
                const selectedDiv = item.querySelector('div');
                selectedDiv.classList.add('border-blue-500', 'bg-blue-50');
                selectedDiv.querySelectorAll('p').forEach(p => p.classList.add('text-blue-600'));
                
                // Cập nhật giá trị ngày đã chọn
                document.getElementById('date-picker').value = selectedDate;
                
                // Tải suất chiếu cho ngày đã chọn
                loadShowtimes(selectedDate);
            });
        });
        
        function updatePeriodDisplay() {
            const periodEnd = new Date(currentPeriodStart);
            periodEnd.setDate(periodEnd.getDate() + 6);
            
            const formatDay = date => {
                const day = date.getDate().toString().padStart(2, '0');
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                return `${day}/${month}`;
            };
            
            dateRangeDisplay.textContent = `${formatDay(currentPeriodStart)} - ${formatDay(periodEnd)}/${currentPeriodStart.getFullYear()}`;
        }
        
        function updateDateNavItems() {
            const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            dateItems.forEach((item, index) => {
                const itemDate = new Date(currentPeriodStart);
                itemDate.setDate(currentPeriodStart.getDate() + index);
                
                const day = itemDate.getDate();
                const month = itemDate.getMonth() + 1;
                const year = itemDate.getFullYear();
                const dayOfWeek = days[itemDate.getDay()];
                const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                
                item.dataset.date = formattedDate;
                
                const itemDiv = item.querySelector('div');
                const paragraphs = item.querySelectorAll('p');
                
                // Đặt nội dung cho các mục
                if (index === 0 && itemDate.getTime() === today.getTime()) {
                    paragraphs[0].textContent = 'Hôm nay';
                } else if (index === 1 && new Date(today.getTime() + 24 * 60 * 60 * 1000).getTime() === itemDate.getTime()) {
                    paragraphs[0].textContent = 'Ngày mai';
                } else {
                    paragraphs[0].textContent = dayOfWeek;
                }
                
                paragraphs[1].textContent = day.toString().padStart(2, '0');
                
                if (index === 0 && itemDate.getTime() === today.getTime()) {
                    paragraphs[2].textContent = dayOfWeek;
                } else if (index === 1 && new Date(today.getTime() + 24 * 60 * 60 * 1000).getTime() === itemDate.getTime()) {
                    paragraphs[2].textContent = dayOfWeek;
                } else {
                    paragraphs[2].textContent = `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
                }
                
                // Kiểm tra nếu là ngày hiện tại
                const isSelected = formattedDate === document.getElementById('date-picker').value;
                
                // Cập nhật trạng thái
                itemDiv.classList.remove('border-blue-500', 'bg-blue-50');
                paragraphs.forEach(p => p.classList.remove('text-blue-600'));
                
                if (isSelected) {
                    itemDiv.classList.add('border-blue-500', 'bg-blue-50');
                    paragraphs.forEach(p => p.classList.add('text-blue-600'));
                }
            });
        }
    }

    function getMonday(date) {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust for Sunday
        const monday = new Date(date);
        monday.setDate(diff);
        monday.setHours(0, 0, 0, 0);
        return monday;
    }

    // Khởi tạo navigation theo tuần (Phương án 1)
    if (document.getElementById('prev-week')) {
        initWeekNavigation();
    }
    
    // Khởi tạo navigation 7 ngày (Phương án 2)
    if (document.getElementById('prev-period')) {
        initSevenDayNavigation();
    }

    function updateAddShowtimeButtonVisibility() {
        const btnAddShowtime = document.getElementById('btn-add-showtime');
        const datePicker = document.getElementById('date-picker');
        if (!btnAddShowtime || !datePicker) return;
        const selectedDate = new Date(datePicker.value);
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