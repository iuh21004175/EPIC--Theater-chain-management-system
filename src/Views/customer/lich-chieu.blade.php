<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Đặt vé - EPIC CINEMAS</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="{{$_ENV['URL_WEB_BASE']}}/css/tailwind.css">
  <script src="{{$_ENV['URL_WEB_BASE']}}/customer/js/lich-chieu.js"></script>
</head>
<body class="bg-gray-100 font-sans">

@include('customer.layout.header')

<!-- Bước chọn -->
<div class="max-w-4xl mx-auto mt-6">
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
<div id="step-1" class="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md mt-10">
  <h2 class="text-2xl font-bold mb-6 text-red-600">Chọn phim / Rạp / Suất</h2>

  <div class="mb-4">
    <label class="block mb-1 font-medium">Chọn vị trí:</label>
    <select id="location" class="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600">
      <option>Chọn thành phố</option>
      <option>Thừa Thiên Huế</option>
      <option>Hà Nội</option>
      <option>TP. Hồ Chí Minh</option>
    </select>
  </div>

  <div class="mb-4">
    <label class="block mb-1 font-medium">Chọn phim:</label>
    <select id="movie" class="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600">
      <option>Chọn phim</option>
      <option value="Mưa Đỏ" data-age="T13" data-img="https://via.placeholder.com/120x180.png?text=Mua+Do">Mưa Đỏ</option>
      <option value="Phim B" data-age="P" data-img="https://via.placeholder.com/120x180.png?text=Phim+B">Phim B</option>
    </select>
  </div>

  <div class="mb-4">
    <label class="block mb-1 font-medium">Chọn rạp:</label>
    <select id="theater" class="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600">
      <option>Chọn rạp</option>
      <option>Galaxy Aeon Mall Huế - 9km</option>
      <option>Cinestar Huế - 7km</option>
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
<div id="step-2" class="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md mt-10 hidden">
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

<div class="mt-16">
  @include('customer.layout.footer')
</div>



