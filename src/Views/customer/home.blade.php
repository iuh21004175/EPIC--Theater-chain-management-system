<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Trang chủ - EPIC CINEMAS</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="{{$_ENV['URL_WEB_BASE']}}/css/tailwind.css">
    <style>
@keyframes slide {
  0%   { transform: translateX(0); }
  33%  { transform: translateX(-100%); }
  66%  { transform: translateX(-200%); }
  100% { transform: translateX(0); }
}
.animate-slide {
  width: 300%;
  animation: slide 15s infinite;
}
</style>
</head>
<body class="bg-gray-50 text-gray-800 font-sans">
@include('customer.layout.header')

<main>
    <!-- Banner -->
    <section class="relative w-full h-72 md:h-80 lg:h-96 overflow-hidden rounded-xl shadow-lg">
  <div class="w-full h-full flex animate-slide">
    <img src="https://res.cloudinary.com/dtkm5uyx1/image/upload/v1756787663/mua-do-500_1755156035605_amofs8.jpg"
         class="w-full h-full object-cover flex-shrink-0">
    <img src="https://picsum.photos/1200/600?1"
         class="w-full h-full object-cover flex-shrink-0">
    <img src="https://picsum.photos/1200/600?2"
         class="w-full h-full object-cover flex-shrink-0">
  </div>
  <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/80"></div>
</section>

    <!-- Phim mới -->
    <section class="container mx-auto max-w-screen-xl px-4 py-16">
        <h2 class="text-3xl font-bold text-center mb-10">Phim Mới</h2>
        <hr class="border-t-2 border-red-500 w-48 mx-auto mb-10">
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            <div class="relative rounded-xl overflow-hidden shadow-lg group">
                <img src="https://res.cloudinary.com/dtkm5uyx1/image/upload/v1756787663/mua-do-500_1755156035605_amofs8.jpg"
                    alt="Mưa Đỏ"
                    class="w-full h-[400px] object-cover transition-transform duration-300 group-hover:scale-105">

                <!-- Overlay -->
                <div class="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <a href="{{$_ENV['URL_WEB_BASE']}}/dat-ve" 
                       class="flex items-center justify-center w-[140px] h-[40px] rounded-lg text-white font-semibold px-3 py-2 text-sm bg-red-600 hover:bg-red-500 transition-all duration-300">
                        🎟 Mua vé
                    </a>
                    <button type="button" 
                        data-url="https://www.youtube.com/embed/-Ir9rPvqwuw?si=WMWP6j-Z5XtVVKs6"
                        class="trailer-btn flex items-center justify-center w-[140px] h-[40px] border border-white rounded-lg text-white font-semibold px-4 py-2 text-sm hover:bg-red-500 hover:border-transparent transition-all duration-300">
                        <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="circle-play" class="w-4 h-4 mr-2" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                            <path fill="currentColor" d="M0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM188.3 147.1c-7.6 4.2-12.3 12.3-12.3 20.9V344c0 8.7 4.7 16.7 12.3 20.9s16.8 4.1 24.3-.5l144-88c7.1-4.4 11.5-12.1 11.5-20.5s-4.4-16.1-11.5-20.5l-144-88c-7.4-4.5-16.7-4.7-24.3-.5z"></path>
                        </svg>
                        Trailer
                    </button>
                </div>

                <!-- Rating -->
                <div class="absolute bottom-20 right-2 flex items-center z-20">
                    <svg class="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 576 512">
                        <path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/>
                    </svg>
                    <span class="text-white font-bold text-lg">4.6</span>
                </div>

                <!-- T13 -->
                <div class="absolute bottom-14 right-2 flex items-center z-20">
                    <span class="inline-flex items-center justify-center px-2 py-1 bg-red-500 text-white text-sm font-bold rounded">
                        T13
                    </span>
                </div>

                <!-- Tên phim -->
                <div class="text-left bg-gray-50">
                    <h3 class="font-bold text-lg text-gray-900 py-2 ml-2">Mưa Đỏ</h3>
                </div>
            </div>    
        </div>
    </section>

    <!-- Phim được xem nhiều nhất -->
    <section class="container mx-auto max-w-screen-xl px-4 py-16">
        <h2 class="text-3xl font-bold text-center mb-10">Phim Được Xem Nhiều Nhất</h2>
        <hr class="border-t-2 border-red-500 w-48 mx-auto mb-10">>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            <div class="relative rounded-xl overflow-hidden shadow-lg group">
                <img src="https://res.cloudinary.com/dtkm5uyx1/image/upload/v1756787663/mua-do-500_1755156035605_amofs8.jpg"
                    alt="Mưa Đỏ"
                    class="w-full h-[400px] object-cover transition-transform duration-300 group-hover:scale-105">

                <!-- Overlay -->
                <div class="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <a href="{{$_ENV['URL_WEB_BASE']}}/dat-ve" 
                       class="flex items-center justify-center w-[140px] h-[40px] rounded-lg text-white font-semibold px-3 py-2 text-sm bg-red-600 hover:bg-red-500 transition-all duration-300">
                        🎟 Mua vé
                    </a>
                    <button type="button" 
                        data-url="https://www.youtube.com/embed/-Ir9rPvqwuw?si=WMWP6j-Z5XtVVKs6"
                        class="trailer-btn flex items-center justify-center w-[140px] h-[40px] border border-white rounded-lg text-white font-semibold px-4 py-2 text-sm hover:bg-red-500 hover:border-transparent transition-all duration-300">
                        <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="circle-play" class="w-4 h-4 mr-2" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                            <path fill="currentColor" d="M0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM188.3 147.1c-7.6 4.2-12.3 12.3-12.3 20.9V344c0 8.7 4.7 16.7 12.3 20.9s16.8 4.1 24.3-.5l144-88c7.1-4.4 11.5-12.1 11.5-20.5s-4.4-16.1-11.5-20.5l-144-88c-7.4-4.5-16.7-4.7-24.3-.5z"></path>
                        </svg>
                        Trailer
                    </button>
                </div>

                <!-- Rating -->
                <div class="absolute bottom-20 right-2 flex items-center z-20">
                    <svg class="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 576 512">
                        <path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/>
                    </svg>
                    <span class="text-white font-bold text-lg">4.6</span>
                </div>

                <!-- T13 -->
                <div class="absolute bottom-14 right-2 flex items-center z-20">
                    <span class="inline-flex items-center justify-center px-2 py-1 bg-red-500 text-white text-sm font-bold rounded">
                        T13
                    </span>
                </div>

                <!-- Tên phim -->
                <div class="text-left bg-gray-50">
                    <h3 class="font-bold text-lg text-gray-900 py-2 ml-2">Mưa Đỏ</h3>
                </div>
            </div>    
        </div>
    </section>
</main>

@include('customer.layout.footer')

<!-- Modal Trailer -->
<div id="trailerModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 hidden">
  <div class="bg-black rounded-xl shadow-lg w-[90%] max-w-3xl relative">
    <!-- Nút đóng -->
    <button id="closeModal" 
      class="absolute top-2 right-2 text-white text-2xl font-bold hover:text-red-500">&times;</button>

    <!-- Video -->
    <div class="aspect-video">
      <iframe id="trailerIframe" class="w-full h-full rounded-xl"
        src="" title="Trailer" frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen>
      </iframe>
    </div>
  </div>
</div>

<script>
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
</script>

</body>
</html>
