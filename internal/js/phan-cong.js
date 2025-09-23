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

function renderMainTableHeaders(monday) {
    const days = [
        { id: 'main-header-mon', label: 'Thứ 2' },
        { id: 'main-header-tue', label: 'Thứ 3' },
        { id: 'main-header-wed', label: 'Thứ 4' },
        { id: 'main-header-thu', label: 'Thứ 5' },
        { id: 'main-header-fri', label: 'Thứ 6' },
        { id: 'main-header-sat', label: 'Thứ 7' },
        { id: 'main-header-sun', label: 'CN' }
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

let selectedDayIndex = null; // Lưu chỉ số ngày được chọn (0-6), null nếu không chọn

function highlightTodayColumn(monday) {
    for (let i = 0; i < 7; i++) {
        // Header
        const th = document.getElementById(['main-header-mon','main-header-tue','main-header-wed','main-header-thu','main-header-fri','main-header-sat','main-header-sun'][i]);
        if (th) th.className = 'border px-4 py-4 text-base font-semibold'; // reset
        // Ca sáng
        const td1 = document.getElementById(`main-cell-morning-${i}`);
        if (td1) td1.className = 'border px-4 py-12 align-top min-h-[96px] min-w-[140px] bg-white hover:bg-gray-50 transition-colors duration-150';
        // Ca chiều
        const td2 = document.getElementById(`main-cell-afternoon-${i}`);
        if (td2) td2.className = 'border px-4 py-12 align-top min-h-[96px] min-w-[140px] bg-white hover:bg-gray-50 transition-colors duration-150';
        // Ca tối
        const td3 = document.getElementById(`main-cell-evening-${i}`);
        if (td3) td3.className = 'border px-4 py-12 align-top min-h-[96px] min-w-[140px] bg-white hover:bg-gray-50 transition-colors duration-150';
    }
    // Xác định hôm nay
    const today = new Date();
    today.setHours(0,0,0,0);
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        d.setHours(0,0,0,0);
        const th = document.getElementById(['main-header-mon','main-header-tue','main-header-wed','main-header-thu','main-header-fri','main-header-sat','main-header-sun'][i]);
        const td1 = document.getElementById(`main-cell-morning-${i}`);
        const td2 = document.getElementById(`main-cell-afternoon-${i}`);
        const td3 = document.getElementById(`main-cell-evening-${i}`);
        if (d.getTime() === today.getTime()) {
            // Active cho ngày hôm nay (đỏ)
            if (th) th.classList.add('bg-red-600', 'text-white');
            if (td1) td1.classList.add('bg-red-50');
            if (td2) td2.classList.add('bg-red-50');
            if (td3) td3.classList.add('bg-red-50');
        } else if (selectedDayIndex === i) {
            // Active cho ngày được chọn (xanh)
            if (th) th.classList.add('bg-blue-600', 'text-white');
            if (td1) td1.classList.add('bg-blue-50', 'border-blue-500', 'border-2');
            if (td2) td2.classList.add('bg-blue-50', 'border-blue-500', 'border-2');
            if (td3) td3.classList.add('bg-blue-50', 'border-blue-500', 'border-2');
        }
    }
}

// Gắn sự kiện click cho các header ngày
function addHeaderClickEvents(monday) {
    const headerIds = [
        'main-header-mon','main-header-tue','main-header-wed','main-header-thu',
        'main-header-fri','main-header-sat','main-header-sun'
    ];
    headerIds.forEach((id, i) => {
        const th = document.getElementById(id);
        if (th) {
            th.style.cursor = 'pointer';
            th.onclick = () => {
                // Nếu click vào hôm nay thì bỏ chọn, chỉ giữ active đỏ
                const d = new Date(monday);
                d.setDate(monday.getDate() + i);
                d.setHours(0,0,0,0);
                const today = new Date();
                today.setHours(0,0,0,0);
                if (d.getTime() === today.getTime()) {
                    selectedDayIndex = null;
                } else {
                    selectedDayIndex = i;
                }
                highlightTodayColumn(monday);
            };
        }
    });
}

// Gọi hàm này mỗi khi đổi tuần
function updateWeekDisplay() {
    const range = getWeekRange(currentWeek);
    if (weekRangeSpan) weekRangeSpan.textContent = range.label;
    renderMainTableHeaders(range.start);
    highlightTodayColumn(range.start);
    addHeaderClickEvents(range.start);
}

document.addEventListener('DOMContentLoaded', () => {
    window.currentWeek = new Date();
    window.weekRangeSpan = document.getElementById('week-range');
    const prevBtn = document.getElementById('prev-week');
    const nextBtn = document.getElementById('next-week');

    if (prevBtn) prevBtn.onclick = function() {
        currentWeek.setDate(currentWeek.getDate() - 7);
        updateWeekDisplay();
    };
    if (nextBtn) nextBtn.onclick = function() {
        currentWeek.setDate(currentWeek.getDate() + 7);
        updateWeekDisplay();
    };

    updateWeekDisplay();
});