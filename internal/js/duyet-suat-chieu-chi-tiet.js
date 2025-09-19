import Spinner from './util/spinner.js';

let currentWeekStart;

document.addEventListener('DOMContentLoaded', function() {
    const showtimeListing = document.getElementById('showtime-listing');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const cinemaNameEl = document.getElementById('cinema-name');

    const btnApproveWeek = document.getElementById('btn-approve-week');

    const rejectModal = document.getElementById('reject-modal');
    const rejectReason = document.getElementById('reject-reason');
    const btnCancelReject = document.getElementById('btn-cancel-reject');
    const btnConfirmReject = document.getElementById('btn-confirm-reject');

    const rapId = showtimeListing.dataset.rap;
    let listSuatChieuChuaXem = [];
    let selectedDate = null;

    // Kiểm tra rạp có suất chiếu chưa xem không

    // Nếu có thì fetch dữ liệu tìm số suất chiếu chưa xem
    if(parseInt(cinemaNameEl.dataset.soSuatChuaXem) > 0){
        fetch(`${showtimeListing.dataset.url}/api/suat-chieu/chua-xem/${rapId}`)
        .then(res => res.json())
        .then(data => {
            if(data.success){
                listSuatChieuChuaXem = data.data;
                // Lây ngày chọn là ngày của suất chiếu chưa xem đầu tiên
                if(listSuatChieuChuaXem.length > 0){
                    selectedDate = listSuatChieuChuaXem[0].batdau;
                
                }
            }
        })
        .catch((e) => {
            console.error('Lỗi khi lấy suất chiếu chưa xem: ', e);
        });
    }
    else{
        // Nếu không có suất chiếu chưa xem thì lấy ngày hiện tại
        selectedDate = new Date().toISOString().split('T')[0];
    }

    // Khởi tạo ngày mặc định
    const datePicker = document.getElementById('date-picker');
    const today = new Date();
    datePicker.value = formatDateDisplay(today);
    const selectedDateAPI = formatDate(today);

    initWeekNavigation();
    loadShowtimes(selectedDateAPI);

    btnApproveWeek.addEventListener('click', async function() {
        // Endpoint placeholder: gửi duyệt/duyệt tuần theo rạp
        const weekStart = getWeekStartFromAnyDate(formatDate(parseDateFromDisplay(datePicker.value)));
        Spinner.show({ text: 'Đang gửi duyệt tuần...' });
        try {
            const res = await fetch(`${showtimeListing.dataset.url}/api/duyet-suat-chieu/gui-duyet-tuan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ week_start: weekStart, id_rap: rapId })
            });
            const data = await res.json();
            if (data.success) {
                showToast('Gửi duyệt tuần thành công');
            } else {
                showToast(data.message || 'Gửi duyệt tuần thất bại', 'error');
            }
        } catch (e) {
            showToast('Gửi duyệt tuần thất bại', 'error');
        }
        Spinner.hide();
    });

    btnCancelReject.addEventListener('click', () => {
        rejectModal.classList.add('hidden');
        rejectReason.value = '';
        btnConfirmReject.onclick = null;
    });
 

    async function loadShowtimes(date) {
        Spinner.show({ text: 'Đang tải suất chiếu...' });
        try {
            const res = await fetch(`${showtimeListing.dataset.url}/api/suat-chieu?ngay=${date}&id_rap=${rapId}`);
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                const grouped = groupByMovie(data.data);
                displayShowtimes(grouped, date);

                // Tổng hợp số lượng theo tình trạng
                const tinhTrangCounter = {
                    cho_duyet: 0,
                    da_duyet: 0,
                    tu_choi: 0,
                    cho_duyet_lai: 0
                };
                data.data.forEach(item => {
                    switch (item.tinh_trang) {
                        case 0: // Chờ duyệt
                            tinhTrangCounter.cho_duyet++;
                            break;
                        case 1: // Đã duyệt
                            tinhTrangCounter.da_duyet++;
                            break;
                        case 2: // Từ chối
                            tinhTrangCounter.tu_choi++;
                            break;
                        case 3: // Chờ duyệt lại
                            tinhTrangCounter.cho_duyet_lai++;
                            break;
                    }
                });

                // Cập nhật vào HTML
                document.getElementById('waiting-approval-day').textContent = tinhTrangCounter.cho_duyet;
                document.getElementById('approved-day').textContent = tinhTrangCounter.da_duyet;
                document.getElementById('rejected-day').textContent = tinhTrangCounter.tu_choi;
                document.getElementById('waiting-for-reapproval-day').textContent = tinhTrangCounter.cho_duyet_lai;
            } else {
                showtimeListing.innerHTML = '<div class="text-center py-8 text-gray-500">Không có dữ liệu suất chiếu</div>';
                // Reset badge về 0 nếu không có dữ liệu
                document.getElementById('waiting-approval-day').textContent = 0;
                document.getElementById('approved-day').textContent = 0;
                document.getElementById('rejected-day').textContent = 0;
                document.getElementById('waiting-for-reapproval-day').textContent = 0;
            }
        } catch (e) {
            console.error('Lỗi khi tải dữ liệu suất chiếu: ', e);
            showtimeListing.innerHTML = '<div class="text-center py-8 text-red-500">Lỗi tải dữ liệu suất chiếu</div>';
            // Reset badge về 0 khi lỗi
            document.getElementById('waiting-approval-day').textContent = 0;
            document.getElementById('approved-day').textContent = 0;
            document.getElementById('rejected-day').textContent = 0;
            document.getElementById('waiting-for-reapproval-day').textContent = 0;
        } finally {
            Spinner.hide();
        }
    }

    function groupByMovie(showtimes) {
        const map = {};
        showtimes.forEach(s => {
            const movieId = s.phim.id;
            if (!map[movieId]) {
                map[movieId] = {
                    id: movieId,
                    title: s.phim.ten_phim,
                    duration: s.phim.thoi_luong,
                    poster: `${showtimeListing.dataset.urlminio}/${s.phim.poster_url}`,
                    showtimes: []
                };
            }
            map[movieId].showtimes.push({
                id: s.id,
                room_name: s.phong_chieu.ten,
                start_time: s.batdau.substr(11,5),
                end_time: s.ketthuc.substr(11,5),
                status: s.tinh_trang
            });
        });
        return Object.values(map);
    }

    function displayShowtimes(movies, date) {
        showtimeListing.innerHTML = '';
        if (!movies.length) {
            showtimeListing.innerHTML = `<div class="text-center py-8 text-gray-500">Chưa có suất chiếu nào vào ngày ${displayDate(date)}</div>`;
            return;
        }
        let hasPending = false;
        movies.forEach(movie => {
            const card = document.createElement('div');
            card.className = 'bg-white border rounded-lg overflow-hidden shadow-sm mb-6';
            const showtimesHtml = movie.showtimes.map(s => {
                const st = showtimeStatusLabel(s.status);
                // Kiểm tra hết hạn
                const now = new Date();
                const endTime = new Date(`${date}T${s.end_time}:00`);
                const isExpired = endTime < now;
                // console.log({now, endTime, isExpired, status: s.status});
                return `
                <div class="flex col border-t py-3 px-4 gap-1">
                    <div class="flex flex-col sm:flex-row sm:items-center gap-1">
                        <div class="font-medium min-w-24">${s.start_time} - ${s.end_time}</div>
                        <span class="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded ml-0 sm:ml-2">${s.room_name}</span>
                        <span class="px-2 py-1 rounded text-xs font-semibold ${st.color}">${st.text}</span>
                    </div>
                    <div class="flex items-center ml-auto space-x-2">
                        ${
                            isExpired
                            ? `<span class="text-xs text-gray-400 italic">Đã hết hạn</span>`
                            : ((s.status == 0 || s.status == 3) ? `
                                <button class="btn-approve flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 transition" data-id="${s.id}">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                                    Duyệt
                                </button>
                                <button class="btn-reject flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 transition" data-id="${s.id}">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    Từ chối
                                </button>
                            ` : '')
                        }
                    </div>
                </div>`;
            }).join('');
            card.innerHTML = `
                <div class="flex p-4">
                    <img src="${movie.poster}" alt="${movie.title}" class="w-16 h-24 object-cover rounded mr-4">
                    <div>
                        <h3 class="font-bold text-lg">${movie.title}</h3>
                        <p class="text-sm text-gray-600">${movie.duration} phút</p>
                    </div>
                </div>
                <div class="showtimes">${showtimesHtml}</div>
            `;
            showtimeListing.appendChild(card);
        });


        document.querySelectorAll('.btn-approve').forEach(btn => {
            btn.addEventListener('click', () => approveShowtime(parseInt(btn.dataset.id)));
        });
        document.querySelectorAll('.btn-reject').forEach(btn => {
            btn.addEventListener('click', () => openRejectModal(parseInt(btn.dataset.id)));
        });

    }

    async function approveShowtime(id) {
        Spinner.show({ text: 'Đang duyệt...' });
        try {
            const res = await fetch(`${showtimeListing.dataset.url}/api/duyet-suat-chieu/${id}/duyet`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                showToast('Duyệt thành công');
                reloadByPicker();
            } else {
                showToast(data.message || 'Duyệt thất bại', 'error');
            }
        } catch (e) {
            showToast('Duyệt thất bại', 'error');
        }
        Spinner.hide();
    }

    function openRejectModal(id, dateForAll = null) {
        rejectReason.value = '';
        rejectModal.classList.remove('hidden');
        btnConfirmReject.onclick = async () => {
            const reason = rejectReason.value.trim();
            if (!reason) { showToast('Vui lòng nhập lý do từ chối', 'error'); return; }
            rejectModal.classList.add('hidden');
            if (id) await rejectShowtime(id, reason); else await rejectAllDay(dateForAll, reason);
        };
    }

    async function rejectShowtime(id, reason) {
        Spinner.show({ text: 'Đang từ chối...' });
        try {
            const res = await fetch(`${showtimeListing.dataset.url}/api/duyet-suat-chieu/${id}/tu-choi`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ly_do: reason })
            });
            const data = await res.json();
            if (data.success) {
                showToast('Từ chối thành công');
                reloadByPicker();
            } else {
                showToast(data.message || 'Từ chối thất bại', 'error');
            }
        } catch (e) {
            showToast('Từ chối thất bại', 'error');
        }
        Spinner.hide();
    }

    async function approveAllDay(date) {
        Spinner.show({ text: 'Đang duyệt tất cả...' });
        try {
            const res = await fetch(`${showtimeListing.dataset.url}/api/duyet-suat-chieu/approve-day`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ ngay: date, id_rap: rapId })
            });
            const data = await res.json();
            if (data.success) { showToast('Duyệt tất cả thành công'); reloadByPicker(); }
            else { showToast(data.message || 'Duyệt tất cả thất bại', 'error'); }
        } catch (e) { showToast('Duyệt tất cả thất bại', 'error'); }
        Spinner.hide();
    }

    async function rejectAllDay(date, reason) {
        Spinner.show({ text: 'Đang từ chối tất cả...' });
        try {
            const res = await fetch(`${showtimeListing.dataset.url}/api/duyet-suat-chieu/reject-day`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ ngay: date, id_rap: rapId, ly_do: reason })
            });
            const data = await res.json();
            if (data.success) { showToast('Từ chối tất cả thành công'); reloadByPicker(); }
            else { showToast(data.message || 'Từ chối tất cả thất bại', 'error'); }
        } catch (e) { showToast('Từ chối tất cả thất bại', 'error'); }
        Spinner.hide();
    }

    function reloadByPicker() {
        const value = document.getElementById('date-picker').value;
        const date = formatDate(parseDateFromDisplay(value));
        loadShowtimes(date);
    }

    function showToast(message, type = 'success') {
        toastMessage.textContent = message;
        if (type === 'error') { toast.classList.remove('bg-green-500'); toast.classList.add('bg-red-500'); }
        else { toast.classList.remove('bg-red-500'); toast.classList.add('bg-green-500'); }
        toast.classList.remove('translate-y-20', 'opacity-0');
        setTimeout(() => { toast.classList.add('translate-y-20', 'opacity-0'); }, 3000);
    }

    // Helpers: Ngày/tuần và status
    function formatDate(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
    function formatDateDisplay(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${d}/${m}/${y}`;
    }
    function parseDateFromDisplay(str) {
        const [d, m, y] = str.split('/').map(Number);
        return new Date(y, m - 1, d);
    }
    function displayDate(date) {
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(date).toLocaleDateString('vi-VN', options);
    }
    function getWeekStartFromAnyDate(dateStr) {
        const d = new Date(dateStr);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff); d.setHours(0,0,0,0);
        return formatDate(d);
    }
    function getMonday(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff); d.setHours(0,0,0,0); return d;
    }
    function showtimeStatusLabel(status) {
        switch (status) {
            case 0: return { text: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800' };
            case 1: return { text: 'Đã duyệt', color: 'bg-green-100 text-green-800' };
            case 2: return { text: 'Từ chối', color: 'bg-red-100 text-red-800' };
            case 3: return { text: 'Chờ duyệt lại', color: 'bg-blue-100 text-blue-800' };
            default: return { text: 'Không xác định', color: 'bg-gray-100 text-gray-800' };
        }
    }

    // Week navigation (tương tự trang quản lý suất)
    function updateWeekDisplay() {
        const weekRangeDisplay = document.getElementById('week-range');
        if (!weekRangeDisplay || !currentWeekStart) return;
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(currentWeekStart.getDate() + 6);
        const formatDay = date => {
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        };
        weekRangeDisplay.textContent = `${formatDay(currentWeekStart)} - ${formatDay(weekEnd)}`;
    }
    function renderWeekDays(currentStart, selectedDateStr) {
        const container = document.getElementById('date-nav-container');
        if (!container) return; container.innerHTML = '';
        const days = ['T2','T3','T4','T5','T6','T7','CN'];
        const monday = getMonday(currentStart);
        const today = new Date(); today.setHours(0,0,0,0);
        for (let i=0;i<7;i++) {
            const itemDate = new Date(monday); itemDate.setDate(monday.getDate()+i); itemDate.setHours(0,0,0,0);
            const day = itemDate.getDate(); const month = itemDate.getMonth()+1; const year = itemDate.getFullYear();
            const dayOfWeek = days[i];
            const formattedDate = `${year}-${month.toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}`;
            const isSelected = formattedDate === selectedDateStr;
            const isToday = itemDate.getTime() === today.getTime();
            const itemDiv = document.createElement('div');
            itemDiv.className = 'date-nav-item';
            itemDiv.dataset.date = formattedDate;
            itemDiv.innerHTML = `<div class="text-center p-2 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors">
                <p class="text-xs font-medium ${isSelected ? 'text-blue-600' : isToday ? 'text-green-600' : 'text-gray-500'}">${dayOfWeek}</p>
                <p class="text-lg font-bold ${isSelected ? 'text-blue-600' : isToday ? 'text-green-600' : ''}">${day.toString().padStart(2,'0')}</p>
                <p class="text-xs ${isSelected ? 'text-blue-600' : isToday ? 'text-green-600' : 'text-gray-500'}">${month.toString().padStart(2,'0')}/${year.toString().slice(-2)}</p>
            </div>`;
            const div = itemDiv.querySelector('div');
            if (isSelected) { div.classList.add('border-blue-500','bg-blue-50'); }
            if (isToday) { div.classList.add('border-green-500','bg-green-50'); }
            itemDiv.addEventListener('click', function() {
                const dateDisplay = formatDateDisplay(new Date(formattedDate));
                document.getElementById('date-picker').value = dateDisplay;
                currentWeekStart = getMonday(new Date(formattedDate));
                updateWeekDisplay();
                renderWeekDays(currentWeekStart, formattedDate);
                loadShowtimes(formattedDate);
            });
            container.appendChild(itemDiv);
        }
    }
    function initWeekNavigation() {
        const prevWeekBtn = document.getElementById('prev-week');
        const nextWeekBtn = document.getElementById('next-week');
        let selectedDate = document.getElementById('date-picker').value;
        if (!selectedDate) {
            const today = new Date(); today.setHours(0,0,0,0);
            selectedDate = formatDateDisplay(today);
            document.getElementById('date-picker').value = selectedDate;
        }
        let baseDate;
        if (selectedDate.includes('/')) baseDate = parseDateFromDisplay(selectedDate); else baseDate = new Date(selectedDate);
        baseDate.setHours(0,0,0,0);
        currentWeekStart = getMonday(baseDate);
        updateWeekDisplay();
        const selectedDateAPI = formatDate(baseDate);
        renderWeekDays(currentWeekStart, selectedDateAPI);
        prevWeekBtn.addEventListener('click', () => {
            currentWeekStart.setDate(currentWeekStart.getDate() - 7);
            updateWeekDisplay();
            const newDateDisplay = formatDateDisplay(currentWeekStart);
            const newDateAPI = formatDate(currentWeekStart);
            document.getElementById('date-picker').value = newDateDisplay;
            renderWeekDays(currentWeekStart, newDateAPI);
            loadShowtimes(newDateAPI);
        });
        nextWeekBtn.addEventListener('click', () => {
            currentWeekStart.setDate(currentWeekStart.getDate() + 7);
            updateWeekDisplay();
            const newDateDisplay = formatDateDisplay(currentWeekStart);
            const newDateAPI = formatDate(currentWeekStart);
            document.getElementById('date-picker').value = newDateDisplay;
            renderWeekDays(currentWeekStart, newDateAPI);
            loadShowtimes(newDateAPI);
        });
    }
});


