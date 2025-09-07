  <!DOCTYPE html>
  <html lang="vi">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title id="title"></title>
    <link rel="stylesheet" href="{{$_ENV['URL_WEB_BASE']}}/css/tailwind.css">
    <script src="{{$_ENV['URL_WEB_BASE']}}/customer/js/rap.js"></script>
  </head>
  <body class="bg-gray-100 min-h-screen">

    <!-- Header -->
    @include('customer.layout.header')

    <!-- Main content -->
    <main class="py-10 px-4 sm:px-6 lg:px-8">
      <div class="max-w-6xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">

        <!-- Title -->
        <header class="p-6 sm:p-8 border-b border-gray-200">
          <h1 id="rapTen" class="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
            
          </h1>
        </header>

        <!-- Body -->
        <section class="p-6 sm:p-8 space-y-10">

          <!-- Thông tin rạp -->
          <div>
            <h2 class="text-2xl font-bold text-gray-800 mb-4">Thông tin rạp</h2>
            <ul id="rapInfo" class="list-disc list-inside space-y-2 text-gray-700">
              <li>
                <span class="font-semibold">Địa chỉ:</span>
              </li>
              <li>
                <span class="font-semibold">Hotline:</span>
                <a href="tel:19002224" class="text-blue-600 hover:underline">19002224</a>
              </li>
            </ul>
          </div>
        </section>
      </div>

      <!-- PHIM -->
      <section class="max-w-6xl mx-auto px-4 py-10">
        <h2 class="text-2xl font-bold text-gray-900 border-l-4 border-blue-600 pl-3 mb-6">PHIM</h2>

        <!-- Tabs chọn ngày -->
        <div class="flex items-center gap-2 mb-8">
          <button id="prevDay" class="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">«</button>
          <div id="dayTabs" class="flex gap-2 overflow-x-auto"></div>
          <button id="nextDay" class="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">»</button>
        </div>

        <!-- Danh sách phim -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <!-- Phim 1 -->
          <div class="group relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition cursor-pointer" data-movie="mua-do" data-name="Mưa Đỏ">
            <img src="https://res.cloudinary.com/dtkm5uyx1/image/upload/v1756787663/mua-do-500_1755156035605_amofs8.jpg"
                alt="Mưa Đỏ"
                class="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500">
            <div class="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      
            </div>
            <p class="mb-5 mt-3 text-center font-bold text-gray-800">Mưa Đỏ</p>
          </div>

          <!-- Phim 2 -->
          <div class="group relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition cursor-pointer" data-movie="lam-giau" data-name="Làm Giàu Với Ma: Cuộc Chiến Hột Xoàn">
            <img src="https://res.cloudinary.com/dtkm5uyx1/image/upload/v1756787663/mua-do-500_1755156035605_amofs8.jpg"
                alt="Mưa Đỏ"
                class="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500">
            <div class="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">

            </div>
            <p class="mb-5 mt-3 text-center font-bold text-gray-800">Làm Giàu Với Ma: Cuộc Chiến Hột Xoàn</p>
          </div>
        </div>

        <!-- Section suất chiếu -->
        <div id="loadSuatChieu" class="mt-10 hidden" data-movie=""></div>

      </section>

    </main>

    <!-- Footer -->
    @include('customer.layout.footer')

  </body>
  <script>
      document.addEventListener("DOMContentLoaded", () => {
          // Lấy ID rạp từ URL
          const pathParts = window.location.pathname.split("/");
          const idRap = pathParts[pathParts.length - 1];

          fetch(`${baseUrl}/api/rap/${idRap}`)
              .then(res => res.json())
              .then(data => {
                  if (data.success && data.data) {
                      const rap = data.data[0];
                      console.log(rap);
                      // Gắn vào tiêu đề
                      document.getElementById("rapTen").textContent = rap.ten;
                      document.getElementById("title").textContent = rap.ten;

                      // Gắn vào phần thông tin
                      const infoSection = document.getElementById("rapInfo");
                      infoSection.innerHTML = `
                          <li><span class="font-semibold">Địa chỉ:</span> ${rap.dia_chi}</li>
                      `;
                  }
              })
              .catch(err => console.error("Lỗi load rạp:", err));
      });
  </script>
  </html>