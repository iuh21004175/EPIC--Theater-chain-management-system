<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Đặt vé - EPIC CINEMAS</title>
    <link rel="stylesheet" href="{{$_ENV['URL_WEB_BASE']}}/css/tailwind.css">
    <script src="{{$_ENV['URL_WEB_BASE']}}/customer/js/dat-ve.js"></script>
</head>
<body class="bg-gray-50 text-gray-800 font-sans">
@include('customer.layout.header')
<main>
    <section id="thongTinPhim" class="container mx-auto max-w-screen-xl px-4">
        <!-- Thông tin phim sẽ load ở đây -->
    </section>

    <!-- Nội dung phim -->
    <section id="noiDungPhim" class="w-full px-4 mt-8">
        <!-- Nội dung phim sẽ load ở đây -->
    </section>

    <section class="w-full px-4 mt-8">
        <div class="w-full max-w-screen-xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <div class="flex items-center mb-4">
            <div class="w-1 h-6 bg-red-600 mr-2"></div>
            <h3 class="text-xl font-bold">Lịch Chiếu</h3>
        </div>

        <!-- Tabs chọn ngày -->
        <div class="flex items-center space-x-2 mb-6">
            <!-- Nút lùi -->
            <button id="prevDay" class="text-gray-400 hover:text-red-500 transition-colors p-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            <!-- Tabs ngày -->
            <div id="dayTabs" class="flex space-x-3 overflow-x-hidden flex-1"></div>

            <!-- Nút tiến -->
            <button id="nextDay" class="text-gray-400 hover:text-red-500 transition-colors p-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
            </button>

            <!-- Select thành phố -->
            <div class="w-48">
                <label for="citySelect" class="block text-gray-700 font-semibold mb-1 text-sm">Chọn Thành Phố</label>
                <select id="citySelect" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm">
                    <option value="tq">Toàn quốc</option>
                    <option value="sg">TP. Hồ Chí Minh</option>
                    <option value="hn">Hà Nội</option>
                    <option value="dn">Đà Nẵng</option>
                </select>
            </div>
            <div class="w-48">
                <label for="rapSelect" class="block text-gray-700 font-semibold mb-1 text-sm">Chọn Rạp</label>
                <select id="rapSelect" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm">
                    <option value="">Tất cả rạp</option>
                </select>
            </div>
        </div>
        <hr class="border-t-2 border-red-500 w-full mx-auto mb-10">
        <!-- Rạp chiếu -->
        <div class="space-y-6">
            <!-- Card rạp -->
            <div class="bg-gray-50 p-4 rounded-xl shadow-sm">
                <h4 class="text-lg font-semibold mb-2">Galaxy Nguyễn Du</h4>
                <span class="text-sm font-medium text-gray-600 mb-2 inline-block">2D Phụ Đề</span>
                <div class="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-2">
                    <button class="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-red-500 hover:text-white transition-colors">11:30</button>
                    <button class="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-red-500 hover:text-white transition-colors">12:15</button>
                    <button class="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-red-500 hover:text-white transition-colors">12:45</button>
                    <button class="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-red-500 hover:text-white transition-colors">13:15</button>
                    <button class="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-red-500 hover:text-white transition-colors">14:00</button>
                    <button class="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-red-500 hover:text-white transition-colors">14:30</button>
                </div>
            </div>

            <hr class="border-t-2 border-grey-500 w-full mx-auto mb-10">

            <div class="bg-gray-50 p-4 rounded-xl shadow-sm">
                <h4 class="text-lg font-semibold mb-2">Galaxy Tân Bình</h4>
                <span class="text-sm font-medium text-gray-600 mb-2 inline-block">2D Phụ Đề</span>
                <div class="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-2">
                    <button class="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-red-500 hover:text-white transition-colors">11:30</button>
                    <button class="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-red-500 hover:text-white transition-colors">12:15</button>
                    <button class="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-red-500 hover:text-white transition-colors">13:00</button>
                    <button class="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-red-500 hover:text-white transition-colors">14:00</button>
                    <button class="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-red-500 hover:text-white transition-colors">14:45</button>
                </div>
            </div>
        </div>
    </div>
</section>


    <!-- Bình luận & đánh giá -->
<section class="w-full px-4 mt-8 mb-8">
  <div class="w-full max-w-screen-xl mx-auto bg-white rounded-xl shadow-lg p-6">
    <h3 class="text-xl font-bold mb-4">Bình luận & Đánh giá</h3>

    <!-- Form bình luận chính -->
    <form class="mb-6 space-y-4 p-4 border rounded-lg shadow-sm bg-white" id="commentForm">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold">T</div>
        <span class="font-semibold text-gray-800">Tuan Dung</span>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-sm font-medium">Đánh giá:</span>
        <div class="flex gap-1" id="starRating">
          <button type="button" data-value="1" class="text-2xl text-gray-300 hover:text-yellow-400">★</button>
          <button type="button" data-value="2" class="text-2xl text-gray-300 hover:text-yellow-400">★</button>
          <button type="button" data-value="3" class="text-2xl text-gray-300 hover:text-yellow-400">★</button>
          <button type="button" data-value="4" class="text-2xl text-gray-300 hover:text-yellow-400">★</button>
          <button type="button" data-value="5" class="text-2xl text-gray-300 hover:text-yellow-400">★</button>
        </div>
        <span id="ratingValue" class="ml-2 font-semibold text-gray-700">5</span>
      </div>

      <textarea placeholder="Viết bình luận của bạn..." name="comment" rows="3"
        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" required></textarea>

      <div class="mt-4 flex justify-end">
        <button type="submit"
          class="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg shadow hover:bg-red-600">Gửi bình luận</button>
      </div>
    </form>

    <!-- Danh sách bình luận -->
    <div id="commentList" class="space-y-4">

      <!-- Comment mẫu -->
      <div class="comment flex flex-col md:flex-row items-start md:items-center gap-4">
        <div class="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold">A</div>
        <div class="flex-1">
          <div class="flex items-center justify-between mb-1">
            <span class="font-semibold">An Nguyen</span>
            <div class="flex text-yellow-400">★★★★☆</div>
          </div>
          <p class="text-gray-700">Phim rất hay, cảnh quay đẹp và cảm xúc mãnh liệt!</p>
          <button class="text-sm text-red-500 mt-1 replyBtn">Trả lời</button>

          <!-- Khung reply (ẩn ban đầu) -->
          <form class="replyForm mt-2 space-y-2 hidden">
            <textarea placeholder="Viết trả lời..." rows="2"
              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"></textarea>
            <div class="flex justify-end">
              <button type="submit"
                class="px-4 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm">Gửi</button>
            </div>
          </form>

          <!-- Reply list -->
          <div class="replies ml-6 mt-2 space-y-2"></div>
        </div>
      </div>

      <!-- Có thể thêm nhiều comment tương tự -->
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
    const urlMinio = "{{ $_ENV['MINIO_SERVER_URL'] }}"; 
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

    function youtubeEmbed(url) {
        if (!url) return "";
        // match dạng full youtube hoặc rút gọn
        const regex = /(?:youtube\.com\/(?:.*v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/;
        const match = url.match(regex);
        if (match && match[1]) {
            return "https://www.youtube.com/embed/" + match[1];
        }
        return url; // fallback nếu không khớp
    }

    const rapSelect = document.getElementById('rapSelect');
    if (rapSelect) {
        fetch(baseUrl + "/api/rap-phim-khach")
            .then(res => res.json())
            .then(data => {
                console.log("Dữ liệu rạp:", data);

                // Check if rapMenu exists before trying to access its properties
                if (rapSelect) {
                    rapSelect.innerHTML = `<option value="">Chọn rạp</option>`;
                }

                if (data.success && data.data.length > 0) {
                    data.data.forEach(rap => {
                        const option = document.createElement("option");
                        option.value = rap.ten;
                        option.textContent = rap.ten;
                        if (rapSelect) {
                            rapSelect.appendChild(option);
                        }
                    });
                } else {
                    if (rapSelect) {
                        rapSelect.innerHTML = `<option value="">Không có rạp nào</option>`;
                    }
                }
            })
            .catch(err => {
                console.error("Lỗi load rạp:", err);
                if (rapSelect) {
                    rapSelect.innerHTML = `<option value="">Lỗi tải rạp</option>`;
                }
            });
    }
    
    document.querySelectorAll('.replyBtn').forEach(btn => {
        btn.addEventListener('click', () => {
        const form = btn.nextElementSibling;
        form.classList.toggle('hidden');
        });
    });

    // Handle submit reply
    document.querySelectorAll('.replyForm').forEach(form => {
        form.addEventListener('submit', e => {
        e.preventDefault();
        const textarea = form.querySelector('textarea');
        if (textarea.value.trim() === '') return;
        const replyDiv = document.createElement('div');
        replyDiv.className = 'bg-gray-100 p-2 rounded-lg text-gray-700';
        replyDiv.textContent = textarea.value;
        form.parentElement.querySelector('.replies').appendChild(replyDiv);
        textarea.value = '';
        form.classList.add('hidden');
        });
    });

    function loadThongTinPhim(phim) {
    const html = `
        <div class="relative w-full h-72 md:h-80 lg:h-96 bg-black">
            <img src="${urlMinio}/${phim.poster_url}" alt="${phim.ten_phim}" class="w-full h-full object-cover opacity-70">
            <div class="absolute inset-0 poster-overlay"></div>
            <div class="absolute inset-0 flex items-center justify-center">
                <button type="button" 
                        data-url="${youtubeEmbed(phim.trailer_url)}"
                        class="trailer-btn flex items-center justify-center w-[320px] h-[100px]  rounded-lg text-white font-semibold px-4 py-2 text-sm transition-all duration-300">
                         <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="circle-play" 
                            class="w-12 h-12 mr-3" role="img" xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 512 512">
                            <path fill="currentColor" 
                                d="M0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM188.3 
                                147.1c-7.6 4.2-12.3 12.3-12.3 20.9V344c0 8.7 
                                4.7 16.7 12.3 20.9s16.8 4.1 24.3-.5l144-88c7.1-4.4 
                                11.5-12.1 11.5-20.5s-4.4-16.1-11.5-20.5l-144-88c-7.4-4.5 
                                -16.7-4.7-24.3-.5z"></path>
                        </svg>
                </button>
            </div>
        </div>
        <div class="container mx-auto max-w-4xl px-4 mt-6 relative">
            <div class="flex flex-col md:flex-row gap-8">
                <div class="w-full md:w-1/3 flex-shrink-0 -mt-16 md:-mt-24">
                    <img src="${urlMinio}/${phim.poster_url}"  alt="${phim.ten_phim}" class="w-full rounded-xl shadow-lg">
                </div>
                <div class="w-full md:w-2/3 bg-white rounded-xl shadow-lg p-6">
                    <h1 class="text-3xl md:text-4xl font-bold flex items-center gap-2">
                        ${phim.ten_phim} <span class="text-sm px-2 py-1 bg-red-600 text-white font-bold rounded">${phim.do_tuoi}</span>
                    </h1>
                    <div class="text-gray-600 mt-1 text-sm md:text-base">
                        <span class="mr-4"><strong>Thời lượng:</strong> ${phim.thoi_luong} phút</span>
                        <span><strong>Khởi chiếu:</strong> ${new Date(phim.ngay_cong_chieu).toLocaleDateString("vi-VN")}</span>
                    </div>
                    <div class="flex items-center mt-2">
                            
                            <svg class="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 576 512">
                                <path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/>
                            </svg>
                            <span class="text-gray-800 font-semibold text-sm md:text-base">4.6 (300 votes)</span>
                        </div>
                    <div class="text-sm text-gray-700 space-y-1 mt-2">
                        <p><strong>Quốc gia:</strong> ${phim.quoc_gia}</p>
                        <p><strong>Thể loại:</strong> ${phim.the_loai.map(item => item.the_loai.ten).join(", ")}</p>
                        <p><strong>Đạo diễn:</strong> ${phim.dao_dien}</p>
                        <p><strong>Diễn viên:</strong> ${phim.dien_vien}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.getElementById('thongTinPhim').innerHTML = html;
    // Gắn sự kiện trailer
    document.querySelectorAll(".trailer-btn").forEach(btn => {
        btn.addEventListener("click", () => {
        const url = btn.getAttribute("data-url");
        if (url) {
            trailerIframe.src = url + (url.includes("?") ? "&" : "?") + "autoplay=1";
            trailerModal.classList.remove("hidden");
        }
        });
    });
    }
    function loadNoiDungPhim(phim) {
        const html =`
        <div class="w-full max-w-screen-xl mx-auto bg-white rounded-xl shadow-lg p-6">
            <div class="flex items-center mb-2">
                <div class="w-1 h-6 bg-red-600 mr-2"></div>
                <h3 class="text-xl font-bold">Nội dung phim</h3>
            </div>
            <p class="text-gray-700">
                ${phim.mo_ta}
            </p>
        </div>
        `;
        document.getElementById('noiDungPhim').innerHTML = html;
    }

    const pathParts = window.location.pathname.split("/");
    const idPhim = pathParts[pathParts.length - 1];

        fetch(`${baseUrl}/api/dat-ve/${idPhim}`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    loadThongTinPhim(data.data);
                    loadNoiDungPhim(data.data);
                }
            })
            .catch(err => console.error("Lỗi load phim:", err));
    </script>
</body>
</html>