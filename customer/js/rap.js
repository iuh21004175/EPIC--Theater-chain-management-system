document.addEventListener('DOMContentLoaded', function() {
    const showtimesData = {
    "mua-do": ["17:00","18:00","19:00","19:30","20:15"],
    "lam-giau": ["16:30","18:00","19:30","20:45"]
    };

    document.querySelectorAll('.group[data-movie]').forEach(card => {
    card.addEventListener('click', (e) => {
        e.stopPropagation();
        const movieKey = card.dataset.movie;
        const movieName = card.dataset.name;
        const loadSuatChieu = document.getElementById('loadSuatChieu');

        // Nếu đang hiển thị cùng phim → tắt
        if(loadSuatChieu.dataset.movie === movieKey && !loadSuatChieu.classList.contains('hidden')) {
        loadSuatChieu.classList.add('hidden');
        // Ẩn nút đánh dấu
        const markBtn = card.querySelector('.mark-selected');
        if(markBtn) markBtn.remove();
        return;
        }

        // Ẩn tất cả nút “Đã chọn” của các phim khác
        document.querySelectorAll('.mark-selected').forEach(btn => btn.remove());

        // Render HTML suất chiếu
        let html = `<div class="showtimes mt-4 bg-gray-50 p-4 rounded-lg shadow-inner">
                    <h3 class="font-semibold mb-2">Suất chiếu: ${movieName}</h3>
                    <div class="space-y-2">
                        <div class="flex items-center gap-2">
                        <span class="w-24 font-semibold text-gray-700">2D Phụ Đề</span>
                        <div class="flex gap-2 flex-wrap">`;

        showtimesData[movieKey].forEach(time => {
        html += `<button class="px-3 py-1 bg-white border rounded-lg hover:bg-red-600 hover:text-white transition">${time}</button>`;
        });

        html += `   </div>
                    </div>
                </div>`;

        loadSuatChieu.innerHTML = html;
        loadSuatChieu.dataset.movie = movieKey;
        loadSuatChieu.classList.remove('hidden');
        loadSuatChieu.scrollIntoView({behavior: "smooth"});

        // Thêm nút đánh dấu "Đã chọn" cho phim hiện tại
        const markBtn = document.createElement('div');
        markBtn.textContent = "Đã chọn";
        markBtn.className = "mark-selected absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded";
        card.appendChild(markBtn);
    });
    });

    // Danh sách ngày
    const dayTabs = document.getElementById('dayTabs');
    const nextBtn = document.getElementById('nextDay');
    const prevBtn = document.getElementById('prevDay');

    let startDate = new Date();
    let visibleDays = 7;
    let currentStartIndex = 0;
    let allDays = [];
    let activeIndex = 0;

    for (let i = 0; i < 30; i++) {
    let d = new Date(startDate);
    d.setDate(d.getDate() + i);
    allDays.push(d);
    }

    function formatDate(d) {
    return ("0" + d.getDate()).slice(-2) + "/" + ("0" + (d.getMonth() + 1)).slice(-2);
    }

    function formatWeekday(d) {
    const weekdays = ["Chủ Nhật","Thứ Hai","Thứ Ba","Thứ Tư","Thứ Năm","Thứ Sáu","Thứ Bảy"];
    return weekdays[d.getDay()];
    }

    function renderDays() {
    dayTabs.innerHTML = '';
    for (let i = currentStartIndex; i < currentStartIndex + visibleDays; i++) {
        if (!allDays[i]) continue;

        const btn = document.createElement('button');
        btn.className = 'flex-shrink-0 px-4 py-2 rounded-lg font-semibold border transition-colors text-sm';
        btn.innerHTML = `${formatWeekday(allDays[i])}<br>${formatDate(allDays[i])}`;

        if (i === activeIndex) {
        btn.classList.add('bg-red-600','text-white','border-red-600');
        } else {
        btn.classList.add('bg-gray-100','hover:bg-gray-200','text-gray-800','border-gray-300');
        }

        btn.addEventListener('click', () => {
        activeIndex = i;
        renderDays();
        console.log("Chọn ngày:", allDays[i]);
        // TODO: load phim/suất chiếu theo ngày
        });

        dayTabs.appendChild(btn);
    }
    }

    nextBtn.addEventListener('click', () => {
    if (currentStartIndex + visibleDays < allDays.length) {
        currentStartIndex++;
        renderDays();
    }
    });
    prevBtn.addEventListener('click', () => {
    if (currentStartIndex > 0) {
        currentStartIndex--;
        renderDays();
    }
    });

    renderDays();
});