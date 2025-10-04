<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<title>Đặt vé xem online - EPIC CINEMAS</title>
<link rel="stylesheet" href="{{ $_ENV['URL_WEB_BASE'] }}/css/tailwind.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
<link href="https://vjs.zencdn.net/7.20.3/video-js.css" rel="stylesheet">
    <script src="https://vjs.zencdn.net/7.20.3/video.min.js"></script>
    <!-- Quality Selector Plugin -->
    <script src="https://cdn.jsdelivr.net/npm/videojs-contrib-quality-levels@2.1.0/dist/videojs-contrib-quality-levels.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/videojs-hls-quality-selector@1.1.1/dist/videojs-hls-quality-selector.min.js"></script>
    
    <style>
        .quality-selector {
            margin: 10px 0;
        }
        .quality-selector select {
            padding: 5px 10px;
            font-size: 14px;
            border: 1px solid #ccc;
            border-radius: 4px;
            background-color: white;
        }
        .video-container {
            position: relative;
            max-width: 800px;
            margin: 0 auto;
        }
        .video-js .vjs-big-play-button {
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            font-size: 3em !important; /* chỉnh kích thước nút */
            border: none !important;
            background-color: rgba(0, 0, 0, 0.5) !important; /* nền mờ */
            color: white !important;
        }
    </style>
<body class="bg-gray-50 text-gray-800 font-sans">

@include('customer.layout.header')

<main>
    <!-- Thông tin phim -->
    <section id="thongTinPhim" class="container mx-auto max-w-screen-xl px-4 mt-6"></section>

    <!-- Nội dung phim -->
    <section id="noiDungPhim" class="w-full px-4 mt-8 hidden"></section>
    <section id="QR" class="w-full px-4 mt-8 hidden"></section>
    <!-- Video phim -->
    <section class="w-full px-4 mt-8">
        <div id="suatChieu" class="w-full max-w-screen-xl mx-auto bg-white rounded-xl shadow-lg p-6">
            <p class="text-gray-500">Đang tải video phim...</p>
        </div>
    </section>

    <!-- Bình luận & đánh giá -->
    <section class="w-full px-4 mt-8 mb-8">
      <div class="w-full max-w-screen-xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h3 class="text-xl font-bold mb-4">Bình luận & Đánh giá</h3>

        <form class="mb-6 space-y-4 p-4 border rounded-lg shadow-sm bg-white" id="commentForm">
            <?php 
            $user = $_SESSION['user'] ?? null;
            $hoten = ($user && is_array($user) && isset($user['ho_ten'])) ? $user['ho_ten'] : "Người dùng";
            ?>

            <?php if ($user && is_array($user)): ?>
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold">
                        <?= strtoupper($hoten[0]) ?>
                    </div>
                    <span class="font-semibold text-gray-800"><?= htmlspecialchars($hoten) ?></span>
                </div>
            <?php endif; ?>

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
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"></textarea>

          <div class="mt-4 flex justify-end">
            <button type="submit"
              class="btn-gui px-6 py-2 bg-red-500 text-white font-semibold rounded-lg shadow hover:bg-red-600">Gửi bình luận</button>
          </div>
        </form>

        <div id="commentList" class="space-y-4">
            <p class="text-gray-500">Đang tải bình luận...</p>
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
document.addEventListener('DOMContentLoaded', () => {
    const urlMinio = "{{ $_ENV['MINIO_SERVER_URL'] }}";
    const baseUrl = "{{ $_ENV['URL_WEB_BASE'] }}";
    const salt = "{{ $_ENV['URL_SALT'] }}";

    const trailerModal = document.getElementById("trailerModal");
    const closeModal = document.getElementById("closeModal");
    const trailerIframe = document.getElementById("trailerIframe");
    const stars = document.querySelectorAll('#starRating button');
    const ratingValue = document.getElementById('ratingValue');
    const commentForm = document.getElementById('commentForm');
    const commentList = document.getElementById('commentList');
    const modalLogin = document.getElementById('modalLogin');
    const body = document.body;
    const noiDungPhim = document.getElementById('noiDungPhim');
    const QR = document.getElementById('QR');

    let allSuatChieu = [];
    let lastComments = [];
    const currentUserId = <?php echo $user ? (int)$user['id'] : 'null'; ?>;

    function openModal(modal) { // Hiển thị modal đăng nhập
        modal.classList.add('is-open');
        body.classList.add('modal-open');
    }

    let currentRating = 5;

    function updateStars(rating) {
        stars.forEach(star => {
            if (star.dataset.value <= rating) {
                star.classList.add('text-yellow-400');
                star.classList.remove('text-gray-300');
            } else {
                star.classList.remove('text-yellow-400');
                star.classList.add('text-gray-300');
            }
        });
        ratingValue.textContent = rating;
    }
    stars.forEach(star => star.addEventListener('click', () => { currentRating = star.dataset.value; updateStars(currentRating); }));
    updateStars(currentRating);

    closeModal.addEventListener("click", () => { trailerModal.classList.add("hidden"); trailerIframe.src = ""; });
    trailerModal.addEventListener("click", (e) => { if(e.target===trailerModal){ trailerModal.classList.add("hidden"); trailerIframe.src=""; }});

    function getYouTubeEmbedUrl(url) {
        if (!url) return "";
        const regex = /(?:youtube\.com\/(?:.*v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/;
        const match = url.match(regex);
        if (match && match[1]) return "https://www.youtube.com/embed/" + match[1];
        return url;
    }

    function base64Decode(str){ return decodeURIComponent(escape(atob(str))); }
    function base64Encode(str){ return btoa(unescape(encodeURIComponent(str))); }

    const pathParts = window.location.pathname.split("/");
    const slugWithId = pathParts[pathParts.length - 1];  
    const encodedId = slugWithId.split("-").pop();
    const decoded = base64Decode(encodedId); 
    const idPhim = decoded.replace(salt, "");   

    function loadThongTinPhim(phim) {
        const html = `
            <div class="relative w-full h-72 md:h-80 lg:h-96 bg-black">
                <img src="${urlMinio}/${phim.poster_url}" alt="${phim.ten_phim}" class="w-full h-full object-cover opacity-70">
                <div class="absolute inset-0 flex items-center justify-center">
                    <button type="button" data-url="${getYouTubeEmbedUrl(phim.trailer_url)}" class="trailer-btn flex items-center justify-center w-[320px] h-[100px] rounded-lg text-white font-semibold px-4 py-2 text-sm transition-all duration-300"> <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="circle-play" class="w-12 h-12 mr-3" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"> <path fill="currentColor" d="M0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM188.3 147.1c-7.6 4.2-12.3 12.3-12.3 20.9V344c0 8.7 4.7 16.7 12.3 20.9s16.8 4.1 24.3-.5l144-88c7.1-4.4 11.5-12.1 11.5-20.5s-4.4-16.1-11.5-20.5l-144-88c-7.4-4.5 -16.7-4.7-24.3-.5z"></path> </svg> </button>
                </div>
            </div>
            <div class="container mx-auto max-w-4xl px-4 mt-6 relative">
                <div class="flex flex-col md:flex-row gap-8">
                    <div class="w-full md:w-1/3 flex-shrink-0 -mt-16 md:-mt-24">
                        <img src="${urlMinio}/${phim.poster_url}" alt="${phim.ten_phim}" class="w-full rounded-xl shadow-lg">
                    </div>
                    <div class="w-full md:w-2/3 bg-white rounded-xl shadow-lg p-6">
                        <h1 class="text-3xl md:text-4xl font-bold">${phim.ten_phim} <span class="text-sm px-2 py-1 bg-red-600 text-white font-bold rounded">${phim.do_tuoi}</span></h1>
                        <p><strong>Thời lượng:</strong> ${phim.thoi_luong} phút | <strong>Khởi chiếu:</strong> ${new Date(phim.ngay_cong_chieu).toLocaleDateString("vi-VN")}</p>
                        <div class="flex items-center mt-2">
                            <svg class="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 576 512"> <path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/> </svg>
                            <span id="averageRating" class="text-gray-800 font-semibold text-sm md:text-base">0.0 (0 votes)</span>
                        </div>
                        <p><strong>Quốc gia:</strong> ${phim.quoc_gia}</p>
                        <p><strong>Thể loại:</strong> ${phim.the_loai.map(t=>t.the_loai.ten).join(", ")}</p>
                        <p><strong>Đạo diễn:</strong> ${phim.dao_dien}</p>
                        <p><strong>Diễn viên:</strong> ${phim.dien_vien}</p>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('thongTinPhim').innerHTML = html;
        document.querySelectorAll(".trailer-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const url = btn.getAttribute("data-url");
                if (url) { trailerIframe.src = url + (url.includes("?") ? "&" : "?") + "autoplay=1"; trailerModal.classList.remove("hidden"); }
            });
        });
    }

    function loadNoiDungPhim(phim) {
        const html = `<div class="w-full max-w-screen-xl mx-auto bg-white rounded-xl shadow-lg p-6">
            <h3 class="text-xl font-bold mb-2">Nội dung phim</h3>
            <p class="text-gray-700">${phim.mo_ta}</p>
        </div>`;
        document.getElementById('noiDungPhim').innerHTML = html;
    }
    
    function renderVideoPhim(phim, goiFull = false) {
    const suatChieuDiv = document.getElementById('suatChieu');
    const videoUrl = `${urlMinio}/private/${phim.video_url}`;
    const filename = phim.video_url.split('/').pop() || "video.mp4";

    function startCountdown(duration, donhangId) {
        const countdownEl = document.getElementById("countdownTimer");
        const soDoGheUrl = window.location.href;
        let time = duration; // giây

        const interval = setInterval(() => {
            const minutes = Math.floor(time / 60);
            const seconds = time % 60;
            countdownEl.textContent = `Thời gian còn lại: ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
            time--;

            if (time < 0) {
                clearInterval(interval);
                alert("Hết thời gian thanh toán. Vui lòng đặt lại!");
                window.location.href = soDoGheUrl;
            }
        }, 1000);
    }

    // Lấy trạng thái mua phim từ server
    fetch(`${baseUrl}/api/lay-trang-thai-mua-phim?khachHangId=${currentUserId}`)
        .then(res => res.json())
        .then(data => {
            let daMua = false;
            if (data.success && data.trang_thai === 2) {
                daMua = true; // Nếu trạng thái trả về là 2 => đã mua
            }
            const duocXem = daMua || goiFull;

            suatChieuDiv.innerHTML = `
                <div class="video-container w-full max-w-4xl mx-auto">
                    <!-- Selector chất lượng đặt ngoài video -->
                    <div class="quality-selector mb-2">
                        <label for="quality-select" class="mr-2">Chọn chất lượng:</label>
                        <select id="quality-select" class="border px-2 py-1 rounded">
                            <option value="auto">Tự động</option>
                        </select>
                    </div>

                    <div class="relative aspect-video rounded-xl overflow-hidden shadow-lg">
                        <video 
                            id="my-video" 
                            class="video-js vjs-default-skin ${duocXem ? '' : 'filter blur-sm'}" 
                            controls 
                            preload="auto" 
                            data-setup='{}'>
                            ${duocXem 
                                ? `<source src="${urlMinio}/private/${phim.video_url}" type="application/x-mpegURL">`
                            : ''}
                            <p class="vjs-no-js">
                                To view this video please enable JavaScript, and consider upgrading to a web browser that
                                <a href="https://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a>.
                            </p>
                        </video>

                        ${!duocXem 
                            ? `<div class="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white gap-4">
                                <p class="text-xl font-semibold">Bạn chưa mua gói để xem phim này!</p>
                                <button id="buyMovieBtn" class="px-6 py-2 bg-red-500 rounded-lg hover:bg-red-600 font-semibold">
                                    <i class="fas fa-ticket-alt"></i> Mua gói
                                </button>
                                </div>` 
                            : ''
                        }
                    </div>

                    ${duocXem ? `
                    <div class="w-full flex justify-end mt-3">
                        <button id="downloadVideoBtn" 
                            class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold">
                            <i class="fas fa-download"></i> Tải xuống
                        </button>
                    </div>` : ''}
                </div>
                `;

            // Khởi tạo video player sau khi render DOM
            initVideoPlayer();

            // Nút mua phim
            if (!duocXem) {
                const random9Digits = () => Math.floor(100000000 + Math.random() * 900000000);
                const maVe = random9Digits();

                document.getElementById('buyMovieBtn').addEventListener('click', async () => {
                    try {
                        // Check login khi bấm
                        const resLogin = await fetch(`${baseUrl}/api/check-login`);
                        const loginData = await resLogin.json();

                        if (loginData.status !== "success") {
                            alert("Bạn chưa đăng nhập!");
                            openModal(modalLogin);
                            return;
                        }

                        const userName = loginData.user?.ho_ten || 'Khách';
                        const userInitial = userName.charAt(0).toUpperCase();

                        // Tạo đơn hàng
                        const resDH = await fetch(`${baseUrl}/api/tao-don-hang`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                                // phim_id: idPhim,
                                tong_tien: 30000,
                                ma_ve: maVe,
                                phuong_thuc_mua: 1
                            })
                        });
                        const jDH = await resDH.json();
                        if (!jDH.success) throw new Error(jDH.message);
                        const donhangId = jDH.data.id;

                        // Tạo mua phim / cập nhật trạng thái
                        const resMua = await fetch(`${baseUrl}/api/them-mua-phim`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                don_hang_id: donhangId,
                                phim_id: idPhim,
                                so_tien: 30000
                            })
                        });
                        const jMua = await resMua.json();
                        if (!jMua.success) throw new Error(jMua.message);

                        suatChieu.classList.add("hidden");
                        const soTien = 30000;
                        const qrUrl = `https://qr.sepay.vn/img?bank=TPBank&acc=10001198354&template=compact&amount=${soTien}&des=DH${donhangId}`;

                        QR.innerHTML = `
                            <div class="w-full max-w-screen-xl mx-auto bg-white rounded-xl shadow-lg p-6 text-center">
                                <h3 class="text-lg font-bold mb-4">Quét QR để thanh toán</h3>
                                <img src="${qrUrl}" alt="QR Thanh toán" class="mx-auto w-80 h-80" />
                                <p class="mt-4 text-gray-500 text-lg">Số tiền: ${soTien.toLocaleString()}đ</p>
                                <p id="countdownTimer" class="mt-4 text-red-500 font-bold text-lg"></p>
                            </div>
                        `;
                        QR.classList.remove("hidden");

                        // Bắt đầu đếm ngược 5 phút
                        startCountdown(300, donhangId);

                        const interval = setInterval(async () => {
                            try {
                                const res = await fetch(`${baseUrl}/api/lay-trang-thai`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ donhang_id: donhangId })
                                });
                                const status = await res.json();
                                if (status.payment_status === "Paid") {
                                    QR.classList.add("hidden");
                                    suatChieu.classList.remove("hidden");
                                    renderVideoPhim(phim, goiFull);
                                    clearInterval(interval);
                                }
                            } catch (e) {
                                console.log("Lỗi check trạng thái:", e);
                            }
                        }, 1000);

                    } catch (err) {
                        alert("Mua phim thất bại: " + err.message);
                    }
                });
            }

            // Nút download
            if (duocXem) {
                const btn = document.getElementById('downloadVideoBtn');
                btn.addEventListener('click', () => {
                    fetch(videoUrl)
                        .then(res => res.blob())
                        .then(blob => {
                            const link = document.createElement("a");
                            link.href = window.URL.createObjectURL(blob);
                            link.download = filename;
                            document.body.appendChild(link);
                            link.click();
                            link.remove();
                        });
                });
            }
        })
        .catch(err => {
            console.error("Lỗi khi lấy trạng thái mua phim:", err);
        });
}

    function initVideoPlayer() {
        const videoEl = document.getElementById('my-video');
        if (!videoEl) return; // nếu chưa có video thì thoát

        // Nếu đã tồn tại player trước đó thì destroy
        if (videojs.getPlayer('my-video')) {
            videojs.getPlayer('my-video').dispose();
        }

        const player = videojs('my-video', {
            fluid: true,
            responsive: true,
            html5: {
                hls: {
                    overrideNative: !videojs.browser.IS_SAFARI
                }
            }
        });

        player.ready(function() {
            console.log('Video player is ready');

            // Khởi tạo quality levels và quality selector
            const qualityLevels = player.qualityLevels();
            const qualitySelector = document.getElementById('quality-select');

            // Xóa option cũ
            qualitySelector.innerHTML = '<option value="auto">Tự động</option>';

            qualityLevels.on('addqualitylevel', function(event) {
                const quality = event.qualityLevel;
                console.log('Quality level added:', quality);

                const option = document.createElement('option');
                option.value = quality.height + 'p';
                option.textContent = quality.height + 'p (' + Math.round(quality.bitrate / 1000) + ' kbps)';
                option.setAttribute('data-index', qualityLevels.length - 1);
                qualitySelector.appendChild(option);
            });

            qualitySelector.addEventListener('change', function() {
                const selectedValue = this.value;

                if (selectedValue === 'auto') {
                    for (let i = 0; i < qualityLevels.length; i++) {
                        qualityLevels[i].enabled = true;
                    }
                } else {
                    for (let i = 0; i < qualityLevels.length; i++) {
                        qualityLevels[i].enabled = false;
                    }
                    const selectedOption = this.options[this.selectedIndex];
                    const qualityIndex = selectedOption.getAttribute('data-index');
                    if (qualityIndex !== null) {
                        qualityLevels[qualityIndex].enabled = true;
                    }
                }
            });

            player.on('error', function() {
                const error = player.error();
                console.error('Video error:', error);
                alert('Lỗi phát video: ' + (error.message || 'Không thể phát video'));
            });

            player.on('loadstart', () => console.log('Video loading started'));
            player.on('loadedmetadata', () => console.log('Video metadata loaded', qualityLevels));
            player.on('canplay', () => console.log('Video can start playing'));

            
        });
    }

 
    // function renderVideoPhim(phim) {
    //     const suatChieuDiv = document.getElementById('suatChieu');

    //     const videoUrl = `${urlMinio}/${phim.video_url}`;
    //     // Lấy tên file từ đường dẫn (sau dấu / cuối cùng)
    //     const filename = phim.video_url.split('/').pop() || "video.mp4";

    //     suatChieuDiv.innerHTML = `
    //         <div class="flex flex-col items-center w-full max-w-5xl mx-auto">
    //             <div class="flex items-center mb-4 justify-start w-full">
    //                 <div class="w-1 h-6 bg-red-600 mr-2"></div>
    //                 <h3 class="text-xl font-bold">Phim: ${phim.ten_phim}</h3>
    //             </div>
    //             <div class="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg mb-2">
    //                 <video controls class="w-full h-full rounded-xl">
    //                     <source src="${videoUrl}" type="video/mp4">
    //                     Trình duyệt của bạn không hỗ trợ video.
    //                 </video>
    //             </div>
    //             <div class="w-full flex justify-end">
    //                 <button id="downloadVideoBtn" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold">
    //                     <i class="fas fa-download"></i> Tải xuống
    //                 </button>
    //             </div>
    //         </div>
    //     `;

    //     // Xử lý nút download
    //     const btn = document.getElementById('downloadVideoBtn');
    //     btn.addEventListener('click', () => {
    //         fetch(videoUrl)
    //             .then(res => res.blob())
    //             .then(blob => {
    //                 const link = document.createElement("a");
    //                 link.href = window.URL.createObjectURL(blob);
    //                 link.download = filename; 
    //                 document.body.appendChild(link);
    //                 link.click();
    //                 link.remove();
    //             })
    //             .catch(err => console.error("Lỗi tải video:", err));
    //     });
    // }
    function escapeHtml(unsafe) {
        if (unsafe === null || unsafe === undefined) return '';
        return String(unsafe)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    function fetchComments() {
        fetch(baseUrl + "/api/doc-danh-gia/" + idPhim)
            .then(res => res.json())
            .then(data => { 
                if (data.success) {
                    loadDanhSachCmt(data.data, currentUserId);
                } else {
                    commentList.innerHTML = '<p class="text-gray-500">Không tải được bình luận.</p>';
                }
            })
            .catch(err => console.error("Lỗi load bình luận:", err));
    }

    function loadDanhSachCmt(danhGia, currentUserId) {
        if (!Array.isArray(danhGia)) danhGia = []; // đảm bảo luôn là mảng
        lastComments = danhGia;

        const averageRatingSpan = document.getElementById('averageRating');
        if (danhGia.length === 0) {
            commentList.innerHTML = '<p class="text-gray-500">Chưa có bình luận nào.</p>';
            if (averageRatingSpan) averageRatingSpan.textContent = '0.0 (0 votes)';
            return;
        }

        const totalStars = danhGia.reduce((sum, cmt) => sum + (cmt.so_sao || 0), 0);
        const avgStars = (totalStars / danhGia.length).toFixed(1);
        if (averageRatingSpan) averageRatingSpan.textContent = `${avgStars} (${danhGia.length} votes)`;

        const html = danhGia.map(cmt => {
            const starsStr = '★'.repeat(cmt.so_sao) + '☆'.repeat(5 - cmt.so_sao);
            const ngayGui = new Date(cmt.created_at || cmt.ngay_tao).toLocaleString('vi-VN', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });

            let actionButtons = '';
            if (currentUserId !== null && cmt.khachhang_id === currentUserId) {
                actionButtons = `
                    <div class="mt-2 flex gap-2 text-sm">
                        <button class="text-blue-500 hover:underline" onclick="editComment(${cmt.id})">Sửa</button>
                        <button class="text-red-500 hover:underline" onclick="deleteComment(${cmt.id})">Xóa</button>
                    </div>
                `;
            }

            return `<div class="p-4 bg-gray-50 rounded-lg shadow-sm" id="cmt-${cmt.id}">
                <div class="flex items-center gap-3 mb-2">
                    <div class="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold">
                        ${cmt.khach_hang?.ho_ten?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                        <p class="font-semibold text-gray-800">${cmt.khach_hang?.ho_ten || 'Khách'}</p>
                        <div class="flex text-sm text-yellow-400">${starsStr}</div>
                    </div>
                </div>
                <div class="comment-body text-gray-700" id="cmt-body-${cmt.id}">${escapeHtml(cmt.cmt)}</div>
                <p class="text-gray-400 text-xs mt-1">${ngayGui}</p>
                ${actionButtons}
            </div>`;
        }).join('');
        commentList.innerHTML = html;
    }

     commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const commentTextarea = commentForm.querySelector('textarea[name="comment"]');
            const comment = commentTextarea.value.trim();
            if (!comment) return alert('Nội dung bình luận không được rỗng.');

            fetch(`${baseUrl}/api/check-login`)
            .then(res => res.json())
            .then(loginData => {
                if (loginData.status !== "success") throw "not logged in";

                const userName = loginData.user?.ho_ten || 'Khách';
                const userInitial = userName.charAt(0).toUpperCase();

                return fetch(`${baseUrl}/api/them-danh-gia`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        phim_id: idPhim, 
                        so_sao: parseInt(ratingValue.textContent), 
                        cmt: comment 
                    })
                })
                .then(res => res.json())
                .then(data => {
            if (!data.success) return alert('Gửi thất bại: ' + (data.message || 'Server trả về lỗi'));

            const newComment = data.data;
            lastComments.push(newComment);

            const commentList = document.getElementById('commentList');
            if (commentList) {
                const starsStr = Array.from({length: 5}, (_, i) => 
                    `<span class="${i < (newComment.so_sao || 0) ? 'text-yellow-400' : 'text-gray-300'}">★</span>`
                ).join('');

                const now = new Date();
                    const ngayGui = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')} ${now.getDate().toString().padStart(2,'0')}/${(now.getMonth()+1).toString().padStart(2,'0')}/${now.getFullYear()}`;

                const actionButtons = `
                    <div class="flex gap-2 mt-1">
                        <div class="mt-2 flex gap-2 text-sm">
                            <button onclick="editComment(${newComment.id})" class="text-blue-500 hover:underline">Sửa</button>
                            <button onclick="deleteComment(${newComment.id})" class="text-red-500 hover:underline">Xóa</button>
                        </div>
                    </div>
                `;

                const div = document.createElement('div');
                div.id = `cmt-${newComment.id}`;
                div.innerHTML = `
                    <div class="p-4 bg-gray-50 rounded-lg shadow-sm">
                        <div class="flex items-center gap-3 mb-2">
                            <div class="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold">
                                ${userInitial}
                            </div>
                            <div>
                                <p class="font-semibold text-gray-800">${userName}</p>
                                <div class="flex text-sm text-yellow-400">${starsStr}</div>
                            </div>
                        </div>
                        <div class="comment-body text-gray-700" id="cmt-body-${newComment.id}">
                            ${escapeHtml(newComment.cmt)}
                        </div>
                        <p class="text-gray-400 text-xs mt-1">${ngayGui}</p>
                        ${actionButtons}
                    </div>
                `;
                commentList.prepend(div);
            }

            // Reset form
            commentTextarea.value = '';
            currentRating = 5;
            updateStars(currentRating);
            fetchComments();

            // Cập nhật rating tổng thể
            const totalStars = lastComments.reduce((sum, cmt) => sum + (cmt.so_sao || 0), 0);
            const avgStars = (lastComments.length ? (totalStars / lastComments.length).toFixed(1) : 0);
            const averageRatingSpan = document.getElementById('averageRating');
            if (averageRatingSpan) averageRatingSpan.textContent = `${avgStars} (${lastComments.length} votes)`;

            alert('Gửi bình luận thành công!');
        });
    })
        .catch(err => {
            if (err !== "not logged in") {
                console.error('Lỗi server khi gửi bình luận:', err);
                alert('Lỗi server khi gửi bình luận.');
            } else {
                openModal(modalLogin);
                alert("Vui lòng đăng nhập để gửi bình luận!");
            }
        });
    });

    // Sửa bình luận
    window.editComment = function(id) {
        const commentObj = lastComments.find(c => c.id === id);
        if (!commentObj) return alert("Không tìm thấy bình luận.");

        const bodyDiv = document.getElementById(`cmt-body-${id}`);
        if (!bodyDiv) return;
        if (bodyDiv.querySelector('textarea')) return;

        let originalText = commentObj.cmt || '';
        let originalSao = commentObj.so_sao || 5;

        bodyDiv.innerHTML = `
            <textarea id="edit-area-${id}" rows="3" class="w-full p-2 border rounded">${escapeHtml(originalText)}</textarea>
            <div class="flex items-center gap-2 mt-2">
                <span class="text-sm font-medium">Đánh giá:</span>
                <div class="flex gap-1" id="edit-star-${id}">
                    ${[1,2,3,4,5].map(i => `<button type="button" data-value="${i}" class="text-2xl ${i <= originalSao ? 'text-yellow-400':'text-gray-300'}">★</button>`).join('')}
                </div>
            </div>
            <div class="mt-2 flex gap-2">
                <button class="px-3 py-1 bg-gray-300 rounded" id="save-edit-${id}">Lưu</button>
                <button class="px-3 py-1 bg-gray-300 rounded" id="cancel-edit-${id}">Hủy</button>
            </div>
        `;

        const editStars = bodyDiv.querySelectorAll(`#edit-star-${id} button`);
        editStars.forEach(star => {
            star.addEventListener('click', () => {
                originalSao = parseInt(star.dataset.value);
                editStars.forEach(s => {
                    s.classList.toggle('text-yellow-400', parseInt(s.dataset.value) <= originalSao);
                    s.classList.toggle('text-gray-300', parseInt(s.dataset.value) > originalSao);
                });
            });
        });

        document.getElementById(`cancel-edit-${id}`).addEventListener('click', () => {
            bodyDiv.innerHTML = escapeHtml(originalText);
        });

        document.getElementById(`save-edit-${id}`).addEventListener('click', () => {
            const newText = document.getElementById(`edit-area-${id}`).value.trim();
            if (!newText) return alert('Nội dung bình luận không được rỗng.');

            fetch(`${baseUrl}/api/sua-danh-gia/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cmt: newText, so_sao: originalSao })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    // Cập nhật trực tiếp DOM
                    const bodyDiv = document.getElementById(`cmt-body-${id}`);
                    if(bodyDiv){
                        bodyDiv.innerHTML = escapeHtml(newText);
                    }
                    const commentObj = lastComments.find(c => c.id === id);
                    if(commentObj){
                        commentObj.cmt = newText;
                        commentObj.so_sao = originalSao;
                    }
                    fetchComments();

                    // Cập nhật rating tổng thể
                    const totalStars = lastComments.reduce((sum, cmt) => sum + (cmt.so_sao || 0), 0);
                    const avgStars = (totalStars / lastComments.length).toFixed(1);
                    const averageRatingSpan = document.getElementById('averageRating');
                    if (averageRatingSpan) averageRatingSpan.textContent = `${avgStars} (${lastComments.length} votes)`;
                } else {
                    alert('Lỗi sửa bình luận: ' + (data.message || 'Server trả về lỗi'));
                }
            })
            .catch(err => {
                console.error('Lỗi sửa bình luận:', err);
                alert('Lỗi khi gọi server để sửa bình luận.');
            });
        });
    };

    // Xóa bình luận
    window.deleteComment = function(id) {
        if (!confirm('Bạn có chắc muốn xóa bình luận này?')) return;

        fetch(`${baseUrl}/api/xoa-danh-gia/${id}`, { method: 'DELETE' })
            .then(res => res.text()) // Lấy raw text để kiểm tra JSON
            .then(text => {
                let data;
                try {
                    data = JSON.parse(text);
                } catch (e) {
                    console.error('Server trả về không phải JSON:', text);
                    alert('Lỗi server: dữ liệu trả về không hợp lệ.');
                    return;
                }

                if (data.success) {
                    // Xóa DOM của bình luận
                    const commentDiv = document.getElementById(`cmt-${id}`);
                    if (commentDiv) commentDiv.remove();

                    // Xóa khỏi mảng local
                    lastComments = lastComments.filter(c => c.id !== id);
                    fetchComments();
                    // Cập nhật rating tổng thể
                    const totalStars = lastComments.reduce((sum, c) => sum + (c.so_sao || 0), 0);
                    const avgStars = lastComments.length ? (totalStars / lastComments.length).toFixed(1) : 0;
                    const averageRatingSpan = document.getElementById('averageRating');
                    if (averageRatingSpan) averageRatingSpan.textContent = `${avgStars} (${lastComments.length} votes)`;

                } else {
                    alert('Xóa thất bại: ' + (data.message || 'Server trả về lỗi'));
                }
            })
            .catch(err => {
                console.error('Lỗi xóa bình luận:', err);
                alert('Lỗi khi gọi server để xóa bình luận.');
            });
    };


    // Load thông tin phim + video + bình luận
    fetch(`${baseUrl}/api/dat-ve/${idPhim}`)
        .then(res => res.json())
        .then(data => {
            if (data.success && data.data) {
                loadThongTinPhim(data.data);
                loadNoiDungPhim(data.data);
                renderVideoPhim(data.data);
                // Load danh sách đánh giá
                fetch(baseUrl + "/api/doc-danh-gia/" + idPhim)
                    .then(res => res.json())
                    .then(data => { if (data.success) loadDanhSachCmt(data.data,  currentUserId); });
            }
        }).catch(err => console.error(err));
});
</script>
</body>
</html>
