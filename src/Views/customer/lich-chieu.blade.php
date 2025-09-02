<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Đặt vé - EPIC CINEMAS</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="{{$_ENV['URL_WEB_BASE']}}/css/tailwind.css">
</head>
<body class="bg-gray-100 font-sans">

@include('customer.layout.header')

<!-- Bước chọn -->
<div class="max-w-3xl mx-auto mt-6">
  <ul class="flex border-b text-gray-500">
    <li class="mr-6">
      <span class="inline-block py-2 px-4 text-red-600 border-b-2 border-red-600 font-medium">Chọn phim / Rạp / Suất</span>
    </li>
    <li class="mr-6">
      <span class="inline-block py-2 px-4 cursor-not-allowed opacity-50">Chọn ghế</span>
    </li>
    <li class="mr-6">
      <span class="inline-block py-2 px-4 cursor-not-allowed opacity-50">Chọn thức ăn</span>
    </li>
    <li class="mr-6">
      <span class="inline-block py-2 px-4 cursor-not-allowed opacity-50">Thanh toán</span>
    </li>
    <li>
      <span class="inline-block py-2 px-4 cursor-not-allowed opacity-50">Xác nhận</span>
    </li>
  </ul>
</div>

<!-- Bước 1: Chọn phim -->
<div id="step-1" class="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md mt-10">
  <h2 class="text-2xl font-bold mb-6 text-red-600">Chọn phim / Rạp / Suất</h2>

  <div class="mb-4">
    <label class="block mb-1 font-medium">Chọn vị trí:</label>
    <select id="location" class="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600">
      <option>Thừa Thiên Huế</option>
      <option>Hà Nội</option>
      <option>TP. Hồ Chí Minh</option>
    </select>
  </div>

  <div class="mb-4">
    <label class="block mb-1 font-medium">Chọn phim:</label>
    <select id="movie" class="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600">
      <option value="Mưa Đỏ" data-age="T13" data-img="https://via.placeholder.com/120x180.png?text=Mua+Do">Mưa Đỏ</option>
      <option value="Phim B" data-age="P" data-img="https://via.placeholder.com/120x180.png?text=Phim+B">Phim B</option>
    </select>
  </div>

  <div class="mb-4">
    <label class="block mb-1 font-medium">Chọn rạp:</label>
    <select id="theater" class="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600">
      <option>Galaxy Aeon Mall Huế</option>
      <option>Cinestar Huế</option>
    </select>
  </div>

  <div class="mb-4 relative">
  <label class="block mb-2 font-medium">Chọn ngày:</label>

  <!-- Nút lùi -->
  <button id="prevDay" class="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors p-2 z-10">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
    </svg>
  </button>

  <!-- Tabs ngày -->
  <div id="dayTabs" class="flex space-x-2 overflow-x-hidden px-8"></div>

  <!-- Nút tiến -->
  <button id="nextDay" class="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors p-2 z-10">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
    </svg>
  </button>
</div>


  <div class="mb-4">
    <label class="block mb-2 font-medium">Chọn suất chiếu:</label>
    <div class="flex flex-wrap gap-2">
      <button data-time="20:15" class="px-4 py-2 border border-red-600 rounded-md text-red-600 hover:bg-red-600 hover:text-white transition">20:15</button>
      <button data-time="20:45" class="px-4 py-2 border border-red-600 rounded-md text-red-600 hover:bg-red-600 hover:text-white transition">20:45</button>
      <button data-time="21:15" class="px-4 py-2 border border-red-600 rounded-md text-red-600 hover:bg-red-600 hover:text-white transition">21:15</button>
      <button data-time="22:00" class="px-4 py-2 border border-red-600 rounded-md text-red-600 hover:bg-red-600 hover:text-white transition">22:00</button>
      <button data-time="22:30" class="px-4 py-2 border border-red-600 rounded-md text-red-600 hover:bg-red-600 hover:text-white transition">22:30</button>
    </div>
  </div>

  <div class="summary flex items-start p-4 border border-gray-200 rounded-md bg-gray-50 mb-6">
    <img src="https://via.placeholder.com/120x180.png?text=Mua+Do" alt="Poster" class="w-32 rounded-md mr-4">
    <div>
      <h3 id="summary-movie" class="text-xl font-semibold">Mưa Đỏ</h3>
      <p id="summary-theater" class="text-gray-700">Galaxy Aeon Mall Huế</p>
      <p id="summary-time" class="text-gray-700">Suất: 20:45</p>
      <p class="text-gray-800 font-medium mt-2">Tổng cộng: 0 đ</p>
    </div>
  </div>

  <button class="btn-next w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-md transition">Tiếp tục</button>
</div>

<!-- Bước 2: Chọn ghế -->
<div id="step-2" class="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md mt-10 hidden">
  <h2 class="text-2xl font-bold mb-6 text-red-600">Chọn ghế</h2>

  <div class="text-center mb-6">
    <div class="bg-gray-300 text-gray-700 font-semibold py-2 rounded-md">Màn hình</div>
  </div>

  <div class="grid gap-3">
    <div class="flex justify-center gap-2" data-row="A">
      <span class="w-6 text-gray-600">A</span>
      <button class="seat">1</button>
      <button class="seat">2</button>
      <button class="seat">3</button>
      <button class="seat">4</button>
      <button class="seat">5</button>
      <button class="seat">6</button>
      <button class="seat">7</button>
      <button class="seat">8</button>
    </div>
    <div class="flex justify-center gap-2" data-row="B">
      <span class="w-6 text-gray-600">B</span>
      <button class="seat">1</button>
      <button class="seat">2</button>
      <button class="seat">3</button>
      <button class="seat">4</button>
      <button class="seat">5</button>
      <button class="seat">6</button>
      <button class="seat">7</button>
      <button class="seat">8</button>
    </div>
    <div class="flex justify-center gap-2" data-row="C">
      <span class="w-6 text-gray-600">C</span>
      <button class="seat">1</button>
      <button class="seat">2</button>
      <button class="seat">3</button>
      <button class="seat">4</button>
      <button class="seat">5</button>
      <button class="seat">6</button>
      <button class="seat">7</button>
      <button class="seat">8</button>
    </div>
  </div>

  <div class="mt-6 p-4 border rounded-md bg-gray-50">
    <p class="font-medium">Ghế đã chọn:</p>
    <p id="selected-seats" class="text-red-600 font-semibold">Chưa chọn</p>
  </div>

  <div class="mt-6 flex gap-4">
    <button id="back-step-1" class="w-1/2 py-3 border border-gray-400 rounded-md hover:bg-gray-100">Quay lại</button>
    <button class="btn-next w-1/2 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-md transition">Tiếp tục</button>
  </div>
</div>

<!-- Bước 3: Chọn thức ăn -->
<div id="step-3" class="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md mt-10 hidden">
  <h2 class="text-2xl font-bold mb-6 text-red-600">Chọn thức ăn</h2>
  <div class="grid grid-cols-2 gap-4">
    <div class="p-4 border rounded-md">
      <h3 class="font-semibold">Combo 1 - 1 Bắp + 1 Nước</h3>
      <p class="text-gray-600">Giá: 50.000đ</p>
      <input type="number" min="0" value="0" class="mt-2 w-16 p-1 border rounded">
    </div>
    <div class="p-4 border rounded-md">
      <h3 class="font-semibold">Combo 2 - 2 Bắp + 2 Nước</h3>
      <p class="text-gray-600">Giá: 90.000đ</p>
      <input type="number" min="0" value="0" class="mt-2 w-16 p-1 border rounded">
    </div>
  </div>
  <div class="mt-6 flex gap-4">
    <button id="back-step-2" class="w-1/2 py-3 border border-gray-400 rounded-md hover:bg-gray-100">Quay lại</button>
    <button class="btn-next w-1/2 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-md transition">Tiếp tục</button>
  </div>
</div>

<!-- Bước 4: Thanh toán -->
<div id="step-4" class="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md mt-10 hidden">
  <h2 class="text-2xl font-bold mb-6 text-red-600">Thanh toán</h2>
  <div class="mb-4">
    <label class="block font-medium">Phương thức thanh toán:</label>
    <select class="w-full p-2 border rounded-md">
      <option>Ví MoMo</option>
      <option>Thẻ ATM</option>
      <option>Visa/MasterCard</option>
    </select>
  </div>
  <div class="mt-6 flex gap-4">
    <button id="back-step-3" class="w-1/2 py-3 border border-gray-400 rounded-md hover:bg-gray-100">Quay lại</button>
    <button class="btn-next w-1/2 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-md transition">Tiếp tục</button>
  </div>
</div>

<!-- Bước 5: Xác nhận -->
<div id="step-5" class="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md mt-10 hidden">
  <h2 class="text-2xl font-bold mb-6 text-red-600">Xác nhận đặt vé</h2>
  <p class="mb-4">Vui lòng kiểm tra lại thông tin đặt vé trước khi xác nhận.</p>
  <div class="p-4 border rounded-md bg-gray-50">
    <p><strong>Phim:</strong> <span id="confirm-movie">Mưa Đỏ</span></p>
    <p><strong>Rạp:</strong> <span id="confirm-theater">Galaxy Aeon Mall Huế</span></p>
    <p><strong>Suất:</strong> <span id="confirm-time">20:45</span></p>
    <p><strong>Ghế:</strong> <span id="confirm-seats">Chưa chọn</span></p>
    <p><strong>Thức ăn:</strong> <span id="confirm-food">Không chọn</span></p>
  </div>
  <div class="mt-6 flex gap-4">
    <button id="back-step-4" class="w-1/2 py-3 border border-gray-400 rounded-md hover:bg-gray-100">Quay lại</button>
    <button class="w-1/2 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-md transition">Xác nhận</button>
  </div>
</div>

<div class="mt-16">
  @include('customer.layout.footer')
</div>

<script>
  const showtimeButtons = document.querySelectorAll('button[data-time]');
  const summaryMovie = document.getElementById('summary-movie');
  const summaryTheater = document.getElementById('summary-theater');
  const summaryTime = document.getElementById('summary-time');
  const summaryImg = document.querySelector('.summary img');
  const movieSelect = document.getElementById('movie');
  const theaterSelect = document.getElementById('theater');
  const steps = document.querySelectorAll('.max-w-3xl ul li span');

  let selectedTime = '20:45';

  showtimeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      showtimeButtons.forEach(b => b.classList.remove('bg-red-600','text-white'));
      showtimeButtons.forEach(b => b.classList.add('text-red-600'));
      btn.classList.add('bg-red-600','text-white');
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

</script>

