function getWeekRange(date = new Date()) {
    // Lấy ngày đầu tuần (thứ 2)
    const day = date.getDay();
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    const monday = new Date(date);
    monday.setDate(date.getDate() + diffToMonday);

    // Ngày cuối tuần (chủ nhật)
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    // Định dạng dd/mm/yyyy
    const format = d => d.toLocaleDateString('vi-VN');

    return {
        start: monday,
        end: sunday,
        label: `${format(monday)} - ${format(sunday)}`
    };
}

function renderWeekDays(monday) {
    const container = document.getElementById('date-nav-container');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const isToday = (new Date()).toDateString() === d.toDateString();
        const btn = document.createElement('button');
        btn.className = `w-full py-2 rounded text-sm font-medium border
            ${isToday ? 'bg-red-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`;
        btn.textContent = `${['T2','T3','T4','T5','T6','T7','CN'][i]}\n${d.getDate()}/${d.getMonth()+1}`;
        btn.style.whiteSpace = 'pre-line';
        btn.dataset.date = d.toISOString().slice(0,10);
        container.appendChild(btn);
    }
}

function renderModalWeekDays(monday) {
    const container = document.getElementById('modal-date-nav-container');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const btn = document.createElement('div');
        btn.className = 'text-center font-semibold py-2 bg-gray-100 rounded';
        btn.textContent = `${['T2','T3','T4','T5','T6','T7','CN'][i]}\n${d.getDate()}/${d.getMonth()+1}`;
        btn.style.whiteSpace = 'pre-line';
        container.appendChild(btn);
    }
}

function renderModalTableHeaders(monday) {
    const days = [
        { id: 'header-mon', label: 'Thứ 2' },
        { id: 'header-tue', label: 'Thứ 3' },
        { id: 'header-wed', label: 'Thứ 4' },
        { id: 'header-thu', label: 'Thứ 5' },
        { id: 'header-fri', label: 'Thứ 6' },
        { id: 'header-sat', label: 'Thứ 7' },
        { id: 'header-sun', label: 'CN' }
    ];
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const th = document.getElementById(days[i].id);
        if (th) {
            th.textContent = `${days[i].label} (${d.getDate()}/${d.getMonth() + 1})`;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    let currentWeek = new Date();
    let modalWeek = new Date(); // Thêm biến riêng cho modal
    const weekRangeSpan = document.getElementById('week-range');
    const modalWeekRangeSpan = document.getElementById('modal-week-range');
    const prevBtn = document.getElementById('prev-week');
    const nextBtn = document.getElementById('next-week');

    // Thêm nút chuyển tuần trong modal
    function addModalWeekNav() {
        const modal = document.getElementById('phancong-modal');
        if (!modal) return;
        let nav = document.getElementById('modal-week-nav');
        if (!nav) {
            nav = document.createElement('div');
            nav.id = 'modal-week-nav';
            nav.className = 'flex items-center gap-4 mb-4 justify-center';
            nav.innerHTML = `
                <button id="modal-prev-week" class="px-3 py-1 rounded border bg-white hover:bg-gray-100">&lt; Tuần trước</button>
                <span id="modal-week-label" class="font-semibold text-blue-700"></span>
                <button id="modal-next-week" class="px-3 py-1 rounded border bg-white hover:bg-gray-100">Tuần sau &gt;</button>
            `;
            // Chèn nav vào trước bảng phân công
            const form = modal.querySelector('form');
            if (form) form.parentNode.insertBefore(nav, form);
        }
    }

    function updateWeekDisplay() {
        const range = getWeekRange(currentWeek);
        if (weekRangeSpan) weekRangeSpan.textContent = range.label;
        renderWeekDays(range.start);
    }

    function updateModalWeekDisplay() {
        const range = getWeekRange(modalWeek);
        if (modalWeekRangeSpan) modalWeekRangeSpan.textContent = range.label;
        const modalWeekLabel = document.getElementById('modal-week-label');
        if (modalWeekLabel) modalWeekLabel.textContent = range.label;
        renderModalTableHeaders(range.start);
    }

    if (prevBtn) prevBtn.onclick = function() {
        currentWeek.setDate(currentWeek.getDate() - 7);
        updateWeekDisplay();
        // TODO: load lại dữ liệu tuần mới
    };
    if (nextBtn) nextBtn.onclick = function() {
        currentWeek.setDate(currentWeek.getDate() + 7);
        updateWeekDisplay();
        // TODO: load lại dữ liệu tuần mới
    };

    updateWeekDisplay();

    // Xử lý mở/đóng modal phân công
    const btnOpenModal = document.getElementById('btn-open-phancong-modal');
    const btnCloseModal = document.getElementById('btn-close-phancong-modal');
    const modal = document.getElementById('phancong-modal');

    if (btnOpenModal && modal) {
        btnOpenModal.addEventListener('click', () => {
            modal.classList.remove('hidden');
            modalWeek = new Date(currentWeek); // Khi mở modal, lấy tuần hiện tại
            addModalWeekNav();
            updateModalWeekDisplay();
        });
    }
    if (btnCloseModal && modal) {
        btnCloseModal.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }

    // Lắng nghe sự kiện cho nút tuần trong modal (sau khi đã render nav)
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'modal-prev-week') {
            modalWeek.setDate(modalWeek.getDate() - 7);
            updateModalWeekDisplay();
        }
        if (e.target && e.target.id === 'modal-next-week') {
            modalWeek.setDate(modalWeek.getDate() + 7);
            updateModalWeekDisplay();
        }
    });
});