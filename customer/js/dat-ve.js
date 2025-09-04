document.addEventListener('DOMContentLoaded', function() {
    const trailerModal = document.getElementById("trailerModal");
    const closeModal = document.getElementById("closeModal");
    const trailerIframe = document.getElementById("trailerIframe");

    // bắt sự kiện tất cả nút Trailer
    document.querySelectorAll(".trailer-btn").forEach(btn => {
        btn.addEventListener("click", () => {
        const url = btn.getAttribute("data-url");
        trailerIframe.src = url + "&autoplay=1";
        trailerModal.classList.remove("hidden");
        });
    });

    // đóng modal
    closeModal.addEventListener("click", () => {
        trailerModal.classList.add("hidden");
        trailerIframe.src = "";
    });

    // bấm ra ngoài cũng đóng
    trailerModal.addEventListener("click", (e) => {
        if (e.target === trailerModal) {
        trailerModal.classList.add("hidden");
        trailerIframe.src = "";
        }
    });
    const stars = document.querySelectorAll('#starRating button');
    const ratingValue = document.getElementById('ratingValue');
    let currentRating = 5; // mặc định 5 sao

    // Cập nhật màu sao
    function updateStars(rating) {
        stars.forEach(star => {
            if(star.dataset.value <= rating){
                star.classList.add('text-yellow-400');
                star.classList.remove('text-gray-300');
            } else {
                star.classList.add('text-gray-300');
                star.classList.remove('text-yellow-400');
            }
        });
    }

    // Click vào sao
    stars.forEach(star => {
        star.addEventListener('click', () => {
            currentRating = star.dataset.value;
            ratingValue.textContent = currentRating;
            updateStars(currentRating);
        });
    });

    // Khi load trang, tô 5 sao
    updateStars(currentRating);


    const dayTabs = document.getElementById('dayTabs');
    const nextBtn = document.getElementById('nextDay');
    const prevBtn = document.getElementById('prevDay');

    let startDate = new Date(); // Hôm nay
    let visibleDays = 7; // số ngày hiển thị
    let currentStartIndex = 0; // chỉ số ngày đầu tiên đang hiển thị
    let allDays = [];
    let activeIndex = 0; // chỉ số ngày đang được chọn trong allDays

    // Tạo danh sách ngày (30 ngày từ hôm nay)
    for (let i = 0; i < 30; i++) {
        let d = new Date(startDate);
        d.setDate(d.getDate() + i);
        allDays.push(d);
    }

    // Hàm format
    function formatDate(d) { 
        return ("0"+d.getDate()).slice(-2) + "/" + ("0"+(d.getMonth()+1)).slice(-2); 
    }

    function formatWeekday(d) { 
        const weekdays = ["Chủ Nhật","Thứ Hai","Thứ Ba","Thứ Tư","Thứ Năm","Thứ Sáu","Thứ Bảy"];
        return weekdays[d.getDay()];
    }

    // Render ngày
    function renderDays() {
        dayTabs.innerHTML = '';
        for (let i = currentStartIndex; i < currentStartIndex + visibleDays; i++) {
            if(!allDays[i]) continue;

            const btn = document.createElement('button');
            btn.className = 'flex-shrink-0 text-center px-4 py-2 rounded-lg border border-gray-300 font-semibold text-gray-700 hover:bg-red-500 hover:text-white transition-colors';
            btn.innerHTML = `${formatWeekday(allDays[i])}<br>${formatDate(allDays[i])}`;

            // Tô màu nếu là active
            if(i === activeIndex) {
                btn.classList.add('bg-red-600','text-white');
                btn.classList.remove('text-gray-700','border-gray-300');
            }

            // Click vào ngày
            btn.addEventListener('click', () => {
                activeIndex = i;
                renderDays(); // re-render để cập nhật màu
            });

            dayTabs.appendChild(btn);
        }
    }

    // Nút ">"
    nextBtn.addEventListener('click', () => {
        if(currentStartIndex + visibleDays < allDays.length){
            currentStartIndex++;
            renderDays();
        }
    });

    // Nút "<"
    prevBtn.addEventListener('click', () => {
        if(currentStartIndex > 0){
            currentStartIndex--;
            renderDays();
        }
    });

    // Render lần đầu
    renderDays();
});