document.addEventListener('DOMContentLoaded', function() {
    const showtimeButtons = document.querySelectorAll('button[data-time]');
    const summaryMovie = document.getElementById('summary-movie');
    const summaryTheater = document.getElementById('summary-theater');
    const summaryTime = document.getElementById('summary-time');
    const summaryImg = document.querySelector('.summary img');
    const movieSelect = document.getElementById('movie');
    const theaterSelect = document.getElementById('theater');
    const steps = document.querySelectorAll('.max-w-4xl ul li span');

    let selectedTime = '20:45';

    showtimeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            showtimeButtons.forEach(b => {
                b.classList.remove('bg-red-600', 'text-white');
                b.classList.add('border-red-600', 'text-red-600', 'hover:bg-red-600', 'hover:text-white');
            });
            btn.classList.remove('border-red-600', 'text-red-600');
            btn.classList.add('bg-red-600', 'text-white');

            selectedTime = btn.dataset.time;
            updateSummary();
        });
    });

    movieSelect.addEventListener('change', updateSummary);
    theaterSelect.addEventListener('change', updateSummary);

    function updateSummary() {
        summaryMovie.textContent = movieSelect.value;
        summaryTheater.textContent = theaterSelect.value;
        summaryTime.textContent = 'Suất: ' + selectedTime;
        summaryImg.src = movieSelect.selectedOptions[0].dataset.img;
    }

    document.querySelector('button[data-time="20:45"]').classList.add('bg-red-600','text-white');

    let currentStep = 0;
    const stepEls = [
        document.getElementById('step-1'),
        document.getElementById('step-2'),
        document.getElementById('step-3'),
        document.getElementById('step-4'),
        document.getElementById('step-5')
    ];

    document.querySelectorAll('.btn-next').forEach(btn => {
        btn.addEventListener('click', () => {
        if (currentStep < steps.length - 1) {
            steps[currentStep].classList.remove('text-red-600','border-red-600','font-medium');
            steps[currentStep].classList.add('cursor-not-allowed','opacity-50','text-gray-500');
            stepEls[currentStep].classList.add('hidden');
            currentStep++;
            steps[currentStep].classList.remove('cursor-not-allowed','opacity-50','text-gray-500');
            steps[currentStep].classList.add('text-red-600','border-b-2','border-red-600','font-medium');
            stepEls[currentStep].classList.remove('hidden');
        }
        if (currentStep === 4) {
            document.getElementById('confirm-movie').textContent = movieSelect.value;
            document.getElementById('confirm-theater').textContent = theaterSelect.value;
            document.getElementById('confirm-time').textContent = selectedTime;
            document.getElementById('confirm-seats').textContent = selectedSeats.join(', ') || 'Chưa chọn';
            document.getElementById('confirm-food').textContent = 'Sẽ cập nhật từ input thức ăn';
        }
        });
    });

    function goBack(stepFrom, stepTo) {
        steps[stepFrom].classList.remove('text-red-600','border-red-600','font-medium');
        steps[stepFrom].classList.add('cursor-not-allowed','opacity-50','text-gray-500');
        stepEls[stepFrom].classList.add('hidden');
        currentStep = stepTo;
        steps[stepTo].classList.remove('cursor-not-allowed','opacity-50','text-gray-500');
        steps[stepTo].classList.add('text-red-600','border-b-2','border-red-600','font-medium');
        stepEls[stepTo].classList.remove('hidden');
    }

        document.getElementById('back-step-1').addEventListener('click', () => goBack(1,0));
    document.getElementById('back-step-2').addEventListener('click', () => goBack(2,1));
    document.getElementById('back-step-3').addEventListener('click', () => goBack(3,2));
    document.getElementById('back-step-4').addEventListener('click', () => goBack(4,3));

    // ---- Chọn ghế ----
    const seatButtons = document.querySelectorAll('.seat');
    const selectedSeatsEl = document.getElementById('selected-seats');
    let selectedSeats = [];

    seatButtons.forEach(seat => {
        seat.classList.add("px-3","py-2","border","rounded-md","hover:bg-gray-200");
        seat.addEventListener('click', () => {
        const row = seat.parentElement.dataset.row;
        const seatNumber = seat.textContent;
        const seatId = row + seatNumber;

        if (selectedSeats.includes(seatId)) {
            selectedSeats = selectedSeats.filter(s => s !== seatId);
            seat.classList.remove('bg-red-600','text-white');
        } else {
            selectedSeats.push(seatId);
            seat.classList.add('bg-red-600','text-white');
        }

        selectedSeatsEl.textContent = selectedSeats.length > 0 ? selectedSeats.join(', ') : 'Chưa chọn';
        });
    });

    // ---- Thức ăn ----
    const foodInputs = document.querySelectorAll('#step-3 input[type="number"]');
    function getFoodSummary() {
        let foodSummary = [];
        foodInputs.forEach((input, idx) => {
        const qty = parseInt(input.value) || 0;
        if (qty > 0) {
            if (idx === 0) foodSummary.push(`${qty} x Combo 1`);
            if (idx === 1) foodSummary.push(`${qty} x Combo 2`);
        }
        });
        return foodSummary.length > 0 ? foodSummary.join(', ') : 'Không chọn';
    }

    // Khi đến bước xác nhận thì cập nhật thức ăn
    document.querySelectorAll('.btn-next').forEach(btn => {
        btn.addEventListener('click', () => {
        if (currentStep === 4) {
            document.getElementById('confirm-food').textContent = getFoodSummary();
        }
        });
    });

    const dayTabs = document.getElementById('dayTabs');
    const nextBtn = document.getElementById('nextDay');
    const prevBtn = document.getElementById('prevDay');

    let startDate = new Date(); // Hôm nay
    let visibleDays = 6; // số ngày hiển thị
    let currentStartIndex = 0;
    let allDays = [];

    // Tạo danh sách ngày (30 ngày từ hôm nay)
    for(let i = 0; i < 30; i++){
        let d = new Date(startDate);
        d.setDate(d.getDate() + i);
        allDays.push(d);
    }

    // Hàm format
    function formatDate(d){ return ("0"+d.getDate()).slice(-2) + "/" + ("0"+(d.getMonth()+1)).slice(-2); }
    function formatWeekday(d){ 
        const weekdays = ["Chủ Nhật","Thứ Hai","Thứ Ba","Thứ Tư","Thứ Năm","Thứ Sáu","Thứ Bảy"];
        return weekdays[d.getDay()];
    }

    // Render ngày
    function renderDays(){
        dayTabs.innerHTML = '';
        for(let i = currentStartIndex; i < currentStartIndex + visibleDays; i++){
            if(!allDays[i]) continue;
            const btn = document.createElement('button');
            btn.className = 'flex-shrink-0 text-center px-4 py-2 rounded-lg border border-gray-300 font-semibold text-gray-700 hover:bg-red-500 hover:text-white transition-colors';
            btn.innerHTML = `${formatWeekday(allDays[i])}<br>${formatDate(allDays[i])}`;

            // Click vào ngày -> active
            btn.addEventListener('click', ()=>{
                const allBtns = dayTabs.querySelectorAll('button');
                allBtns.forEach(b=>{
                    b.classList.remove('bg-red-600','text-white');
                    b.classList.add('text-gray-700','border-gray-300');
                });
                btn.classList.add('bg-red-600','text-white');
                btn.classList.remove('text-gray-700','border-gray-300');
            });

            dayTabs.appendChild(btn);
        }

        // Mặc định tô màu ngày đầu tiên
        const firstBtn = dayTabs.querySelector('button');
        if(firstBtn){
            firstBtn.classList.add('bg-red-600','text-white');
            firstBtn.classList.remove('text-gray-700','border-gray-300');
        }
    }

    // Nút tiến
    nextBtn.addEventListener('click', ()=>{
        if(currentStartIndex + visibleDays < allDays.length){
            currentStartIndex++;
            renderDays();
        }
    });

    // Nút lùi
    prevBtn.addEventListener('click', ()=>{
        if(currentStartIndex > 0){
            currentStartIndex--;
            renderDays();
        }
    });

    // Render lần đầu
    renderDays();

});