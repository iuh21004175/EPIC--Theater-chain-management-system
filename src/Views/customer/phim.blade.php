<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Xem Phim - EPIC CINEMAS</title>
  <link rel="stylesheet" href="{{$_ENV['URL_WEB_BASE']}}/css/tailwind.css">
</head>
<body class="bg-gray-50 text-gray-800 font-sans">
  
  @include('customer.layout.header')

  <!-- Nội dung -->
  <main class="container mx-auto max-w-screen-xl px-4 py-16">
    
    <!-- Search & Filter -->
    <div class="flex flex-col items-center gap-6 mb-10">
      <!-- Search + Filter -->
      <div class="flex flex-col md:flex-row items-center gap-4">
        <!-- Search -->
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input 
            type="text" 
            placeholder="Tìm kiếm phim..."
            class="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-full bg-white 
                  focus:border-red-500 focus:outline-none focus:ring-0 transition"
          />
        </div>

        <!-- Filter -->
        <div class="relative">
          <select 
            class="appearance-none w-48 pl-4 pr-8 py-2 border border-gray-300 rounded-full bg-white 
                  focus:border-red-500 focus:ring-0 outline-none transition">
            <option value="">Tất cả thể loại</option>
            <option>Hành động</option>
            <option>Hài</option>
            <option>Tình cảm</option>
            <option>Kinh dị</option>
            <option>Hoạt hình</option>
          </select>
          <!-- Icon dropdown -->
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▾</span>
        </div>
      </div>

      <!-- Tabs -->
      <div class="inline-flex bg-gray-100 rounded-full shadow-inner p-1">
        <button class="tab-btn px-6 py-2 rounded-full bg-red-600 text-white font-semibold transition" data-tab="now-showing">
          Đang chiếu
        </button>
        <button class="tab-btn px-6 py-2 rounded-full text-gray-700 font-semibold transition" data-tab="coming-soon">
          Sắp chiếu
        </button>
      </div>
    </div>

    <!-- Now Showing -->
    <section id="now-showing" class="tab-content grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      <!-- Movie Card -->
      <div class="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300">
        <img src="https://via.placeholder.com/300x450?text=Movie+1" class="w-full h-auto" alt="">
        <div class="p-4">
          <h3 class="font-bold text-lg">Tên Phim 1</h3>
          <p class="text-gray-600 text-sm">Hành động, Viễn tưởng</p>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300">
        <img src="https://via.placeholder.com/300x450?text=Movie+2" class="w-full h-auto" alt="">
        <div class="p-4">
          <h3 class="font-bold text-lg">Tên Phim 2</h3>
          <p class="text-gray-600 text-sm">Hài, Lãng mạn</p>
        </div>
      </div>
    </section>

    <!-- Coming Soon -->
    <section id="coming-soon" class="tab-content hidden grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      <div class="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300">
        <img src="https://via.placeholder.com/300x450?text=Movie+3" class="w-full h-auto" alt="">
        <div class="p-4">
          <h3 class="font-bold text-lg">Tên Phim 3</h3>
          <p class="text-gray-600 text-sm">Kinh dị</p>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300">
        <img src="https://via.placeholder.com/300x450?text=Movie+4" class="w-full h-auto" alt="">
        <div class="p-4">
          <h3 class="font-bold text-lg">Tên Phim 4</h3>
          <p class="text-gray-600 text-sm">Hoạt hình, Phiêu lưu</p>
        </div>
      </div>
    </section>
  </main>

  <div class="mt-16">
    @include('customer.layout.footer')
  </div>

  <script>
    // Tab switching
    const tabs = document.querySelectorAll(".tab-btn");
    const contents = document.querySelectorAll(".tab-content");

    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => {
          t.classList.remove("bg-red-600", "text-white");
          t.classList.add("text-gray-700");
        });
        tab.classList.add("bg-red-600", "text-white");

        contents.forEach(c => c.classList.add("hidden"));
        document.getElementById(tab.dataset.tab).classList.remove("hidden");
      });
    });
  </script>
</body>
</html>
