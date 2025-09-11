<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Đặt vé - EPIC CINEMAS</title>
  <link rel="stylesheet" href="{{$_ENV['URL_WEB_BASE']}}/css/tailwind.css">
</head>
<body class="bg-gray-100 font-sans">
  @include('customer.layout.header')

  <!-- Bước chọn -->
  <div class="max-w-4xl mx-auto mt-6 ">
    <ul class="flex justify-center border-b text-gray-500">
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
  <div id="step-1" class="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md mt-10">
    <h2 class="text-2xl font-bold mb-6 text-red-600">Chọn phim / Rạp / Suất</h2>
    <div id="step-movie" class="mb-6">
      <h3 class="font-semibold mb-4 text-lg">Chọn phim</h3>
      <div class="grid grid-cols-3 gap-4">
        <div class="group relative cursor-pointer border rounded p-4 text-center hover:shadow-lg" data-movie="1" data-name="Avengers: Endgame">
          <img src="https://via.placeholder.com/120x180.png?text=Avengers" alt="Avengers" class="mx-auto mb-2">
          <h4 class="font-semibold">Avengers: Endgame</h4>
        </div>
        <div class="group relative cursor-pointer border rounded p-4 text-center hover:shadow-lg" data-movie="2" data-name="Spider-Man: No Way Home">
          <img src="https://via.placeholder.com/120x180.png?text=Spider-Man" alt="Spider-Man" class="mx-auto mb-2">
          <h4 class="font-semibold">Spider-Man: No Way Home</h4>
        </div>
        <div class="group relative cursor-pointer border rounded p-4 text-center hover:shadow-lg" data-movie="3" data-name="The Batman">
          <img src="https://via.placeholder.com/120x180.png?text=The+Batman" alt="The Batman" class="mx-auto mb-2">
          <h4 class="font-semibold">The Batman</h4>
        </div>
      </div>
      <!-- Nơi render suất chiếu -->
      <div id="loadSuatChieu" class="mt-4 hidden"></div>
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
  <div id="step-2" class="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md mt-10 hidden">
    <h2 class="text-2xl font-bold mb-6 text-red-600">Chọn ghế</h2>
    <div class="text-center mb-6">
      <div class="bg-gray-300 text-gray-700 font-semibold py-2 rounded-md">Màn hình</div>
    </div>
    <div class="grid gap-3">
      <div class="flex justify-center gap-2" data-row="A">
        <span class="w-6 text-gray-600">A</span>
        <button class="seat">1</button><button class="seat">2</button><button class="seat">3</button><button class="seat">4</button><button class="seat">5</button><button class="seat">6</button><button class="seat">7</button><button class="seat">8</button>
      </div>
      <div class="flex justify-center gap-2" data-row="B">
        <span class="w-6 text-gray-600">B</span>
        <button class="seat">1</button><button class="seat">2</button><button class="seat">3</button><button class="seat">4</button><button class="seat">5</button><button class="seat">6</button><button class="seat">7</button><button class="seat">8</button>
      </div>
      <div class="flex justify-center gap-2" data-row="C">
        <span class="w-6 text-gray-600">C</span>
        <button class="seat">1</button><button class="seat">2</button><button class="seat">3</button><button class="seat">4</button><button class="seat">5</button><button class="seat">6</button><button class="seat">7</button><button class="seat">8</button>
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
  <div id="step-3" class="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md mt-10 hidden">
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
  <div id="step-4" class="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md mt-10 hidden">
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
  <div id="step-5" class="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md mt-10 hidden">
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

  <div class="mt-16">@include('customer.layout.footer')</div>

  <script>
  document.addEventListener('DOMContentLoaded', function () {
    const movieCards = document.querySelectorAll('[data-movie]');
    const loadSuatChieu = document.getElementById('loadSuatChieu');
    const summaryMovie = document.getElementById('summary-movie');
    const summaryTheater = document.getElementById('summary-theater');
    const summaryTime = document.getElementById('summary-time');
    const summaryImg = document.querySelector('.summary img');
    let selectedMovie = null, selectedTime = null, selectedSeats = [];

    const showtimesData = {
      "1": ["10:00", "13:00", "16:00", "19:00"],
      "2": ["11:00", "14:00", "17:00", "20:00"],
      "3": ["12:00", "15:00", "18:00", "21:00"]
    };

    // Chọn phim
    movieCards.forEach(card => {
      card.addEventListener('click', () => {
        movieCards.forEach(c => c.classList.remove('border-red-600'));
        card.classList.add('border-red-600');
        selectedMovie = {id: card.dataset.movie, name: card.dataset.name, img: card.querySelector('img').src};
        renderShowtimes(selectedMovie.id); updateSummary();
      });
    });

    // Render suất chiếu
    function renderShowtimes(movieId) {
      loadSuatChieu.innerHTML = "";
      if (showtimesData[movieId]) {
        let html = `<h3 class="font-semibold mb-2">Suất chiếu: ${selectedMovie.name}</h3><div class="flex gap-2 flex-wrap">`;
        showtimesData[movieId].forEach(time => {
          html += `<button data-time="${time}" class="showtime-btn px-3 py-1 border rounded-lg hover:bg-red-600 hover:text-white">${time}</button>`;
        });
        html += "</div>";
        loadSuatChieu.innerHTML = html; loadSuatChieu.classList.remove('hidden');
        loadSuatChieu.querySelectorAll('.showtime-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            loadSuatChieu.querySelectorAll('.showtime-btn').forEach(b => b.classList.remove('bg-red-600','text-white'));
            btn.classList.add('bg-red-600','text-white'); selectedTime = btn.dataset.time; updateSummary();
          });
        });
      }
    }

    function updateSummary() {
      if (selectedMovie) {summaryMovie.textContent = selectedMovie.name; summaryImg.src = selectedMovie.img;}
      summaryTheater.textContent = "Galaxy Nguyễn Du"; summaryTime.textContent = selectedTime || "--";
    }

    // Chọn ghế
    const seatButtons = document.querySelectorAll('.seat');
    const selectedSeatsEl = document.getElementById('selected-seats');
    seatButtons.forEach(seat => {
      seat.classList.add("px-3","py-2","border","rounded-md","hover:bg-gray-200");
      seat.addEventListener('click', () => {
        const row = seat.parentElement.dataset.row, seatNumber = seat.textContent.trim(), seatId = row+seatNumber;
        if (selectedSeats.includes(seatId)) {selectedSeats = selectedSeats.filter(s => s !== seatId); seat.classList.remove('bg-red-600','text-white');}
        else {selectedSeats.push(seatId); seat.classList.add('bg-red-600','text-white');}
        selectedSeatsEl.textContent = selectedSeats.length > 0 ? selectedSeats.join(', ') : 'Chưa chọn';
      });
    });

    // Thức ăn
    const foodInputs = document.querySelectorAll('#step-3 input[type="number"]');
    function getFoodSummary() {
      let arr = []; foodInputs.forEach((input, idx) => {const qty = parseInt(input.value)||0; if (qty>0){if(idx===0)arr.push(`${qty} x Combo 1`);if(idx===1)arr.push(`${qty} x Combo 2`);} });
      return arr.length>0?arr.join(', '):'Không chọn';
    }

    // Steps
    let currentStep = 0;
    const stepEls = [document.getElementById('step-1'),document.getElementById('step-2'),document.getElementById('step-3'),document.getElementById('step-4'),document.getElementById('step-5')];
    const steps = document.querySelectorAll('.max-w-4xl ul li span');

    // Next buttons + ràng buộc
    document.querySelectorAll('.btn-next').forEach(btn => {
      btn.addEventListener('click', () => {
        if (currentStep===0 && (!selectedMovie || !selectedTime)) {alert("Vui lòng chọn phim và suất chiếu trước!"); return;}
        if (currentStep===1 && selectedSeats.length===0) {alert("Vui lòng chọn ít nhất 1 ghế!"); return;}
        if (currentStep < steps.length-1) {
          steps[currentStep].classList.remove('text-red-600','border-b-2','border-red-600','font-medium');
          steps[currentStep].classList.add('cursor-not-allowed','opacity-50','text-gray-500');
          stepEls[currentStep].classList.add('hidden');
          currentStep++;
          steps[currentStep].classList.remove('cursor-not-allowed','opacity-50','text-gray-500');
          steps[currentStep].classList.add('text-red-600','border-b-2','border-red-600','font-medium');
          stepEls[currentStep].classList.remove('hidden');
        }
        if (currentStep===4) {
          document.getElementById('confirm-movie').textContent = selectedMovie?.name||'';
          document.getElementById('confirm-theater').textContent = summaryTheater.textContent;
          document.getElementById('confirm-time').textContent = selectedTime||'--';
          document.getElementById('confirm-seats').textContent = selectedSeats.join(', ')||'Chưa chọn';
          document.getElementById('confirm-food').textContent = getFoodSummary();
        }
      });
    });

    // Back buttons
    function goBack(stepFrom, stepTo) {
      steps[stepFrom].classList.remove('text-red-600','border-b-2','border-red-600','font-medium');
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
  });
  </script>
</body>
</html>
