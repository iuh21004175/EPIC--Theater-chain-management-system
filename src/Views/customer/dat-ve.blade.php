<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<title>Đặt vé - EPIC CINEMAS</title>
<link rel="stylesheet" href="{{ $_ENV['URL_WEB_BASE'] }}/css/tailwind.css">
</head>
<body class="bg-gray-50 text-gray-800 font-sans">

@include('customer.layout.header')

<main>
    <!-- Thông tin phim -->
    <section id="thongTinPhim" class="container mx-auto max-w-screen-xl px-4 mt-6"></section>

    <!-- Nội dung phim -->
    <section id="noiDungPhim" class="w-full px-4 mt-8"></section>

    <!-- Lịch chiếu -->
    <section class="w-full px-4 mt-8">
        <div class="w-full max-w-screen-xl mx-auto bg-white rounded-xl shadow-lg p-6">
            <div class="flex items-center mb-4">
                <div class="w-1 h-6 bg-red-600 mr-2"></div>
                <h3 class="text-xl font-bold">Lịch Chiếu</h3>
            </div>

            <!-- Tabs chọn ngày -->
            <div class="flex items-center space-x-2 mb-6">
                <button id="prevDay" class="text-gray-400 hover:text-red-500 transition-colors p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <div id="dayTabs" class="flex space-x-3 overflow-x-hidden flex-1"></div>

                <button id="nextDay" class="text-gray-400 hover:text-red-500 transition-colors p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                </button>

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

            <div id="suatChieu" class="space-y-6"></div>
        </div>
    </section>

    <!-- Bình luận & đánh giá -->
    <section class="w-full px-4 mt-8 mb-8">
      <div class="w-full max-w-screen-xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h3 class="text-xl font-bold mb-4">Bình luận & Đánh giá</h3>

        <form class="mb-6 space-y-4 p-4 border rounded-lg shadow-sm bg-white" id="commentForm">
          <div class="flex items-center gap-4">
                <?php if (isset($_SESSION['user'])): 
                    $user = $_SESSION['user']; 
                    $hoten = $user['ho_ten'];
                ?>
                <div class="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold"><?php echo strtoupper($hoten[0]); ?></div>
                <span class="font-semibold text-gray-800"><?php echo htmlspecialchars($hoten); ?></span>
                <?php endif; ?>
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

    // DOM elements
    const trailerModal = document.getElementById("trailerModal");
    const closeModal = document.getElementById("closeModal");
    const trailerIframe = document.getElementById("trailerIframe");
    const rapSelect = document.getElementById('rapSelect');
    const dayTabs = document.getElementById('dayTabs');
    const nextBtn = document.getElementById('nextDay');
    const prevBtn = document.getElementById('prevDay');
    const suatChieuDiv = document.getElementById('suatChieu');
    const stars = document.querySelectorAll('#starRating button');
    const ratingValue = document.getElementById('ratingValue');
    const commentForm = document.getElementById('commentForm');
    const commentList = document.getElementById('commentList');

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

    stars.forEach(star => {
        star.addEventListener('click', () => {
            currentRating = star.dataset.value;
            updateStars(currentRating);
        });
    });

    updateStars(currentRating);

    // Trailer modal
    closeModal.addEventListener("click", () => {
        trailerModal.classList.add("hidden");
        trailerIframe.src = "";
    });

    trailerModal.addEventListener("click", (e) => {
        if (e.target === trailerModal) {
            trailerModal.classList.add("hidden");
            trailerIframe.src = "";
        }
    });

    function getYouTubeEmbedUrl(url) {
        if (!url) return "";
        const regex = /(?:youtube\.com\/(?:.*v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/;
        const match = url.match(regex);
        if (match && match[1]) return "https://www.youtube.com/embed/" + match[1];
        return url;
    }

    // Load rạp
    function loadRap() {
        if (!rapSelect) return;
        fetch(baseUrl + "/api/rap-phim-khach")
            .then(res => res.json())
            .then(data => {
                rapSelect.innerHTML = '<option value="">Chọn rạp</option>';
                if (data.success && data.data.length) {
                    data.data.forEach(rap => {
                        const option = document.createElement("option");
                        option.value = rap.ten;
                        option.textContent = rap.ten;
                        rapSelect.appendChild(option);
                    });
                } else {
                    rapSelect.innerHTML = '<option value="">Không có rạp</option>';
                }
            })
            .catch(err => {
                console.error("Lỗi load rạp:", err);
                rapSelect.innerHTML = '<option value="">Lỗi tải rạp</option>';
            });
    }
    loadRap();

    function base64Decode(str) { return decodeURIComponent(escape(atob(str))); }
    function base64Encode(str) { return btoa(unescape(encodeURIComponent(str))); }

    const pathParts = window.location.pathname.split("/");
    const slugWithId = pathParts[pathParts.length - 1];  
    const encodedId = slugWithId.split("-").pop();
    const decoded = base64Decode(encodedId); 
    const idPhim = decoded.replace(salt, "");   

    let allSuatChieu = [];

    function renderSuatChieu() {
        const selectedDate = getSelectedDate();
        console.log("Ngày đã chọn:", selectedDate);
        const filtered = allSuatChieu.filter(suat => suat.batdau.split(" ")[0] === selectedDate);

        if (!filtered.length) {
            suatChieuDiv.innerHTML = '<p class="text-gray-500">Chưa có suất chiếu cho ngày này.</p>';
            return;
        }

        const groupedByRap = {};
        filtered.forEach(suat => {
            const rapName = suat.phong_chieu.rap_chieu_phim.ten || "Không xác định";
            if (!groupedByRap[rapName]) groupedByRap[rapName] = [];
            groupedByRap[rapName].push(suat);
        });

        suatChieuDiv.innerHTML = Object.entries(groupedByRap).map(([rapName, suats]) => {
            const groupedByLoai = {};
            suats.forEach(suat => {
                const loaiChieu = (suat.phong_chieu.loai_phongchieu || "Không xác định").toUpperCase();
                if (!groupedByLoai[loaiChieu]) groupedByLoai[loaiChieu] = [];
                groupedByLoai[loaiChieu].push(suat);
            });

            const loaiHtml = Object.entries(groupedByLoai).map(([loaiChieu, suatsLoai]) => {
                const suatHtml = suatsLoai.map(suat => {
                    const batDau = new Date(suat.batdau).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                    return `<button type="button" class="suat-btn px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-red-500 hover:text-white transition-colors"
                        data-suat-id="${suat.id}" data-phong-id="${suat.phong_chieu.id}" data-rap-id="${suat.phong_chieu.rap_chieu_phim.id}">${batDau}</button>`;
                }).join(' ');
                return `<div class="flex items-center mb-2"><span class="font-medium mr-4 min-w-[80px]">${loaiChieu}</span><div class="flex flex-wrap gap-2">${suatHtml}</div></div>`;
            }).join('');

            return `<div class="bg-gray-50 p-4 rounded-xl shadow-sm mb-6"><h4 class="text-lg font-semibold mb-4" data-phong-id="${suats[0].phong_chieu.id}">${rapName}</h4>${loaiHtml}</div><hr class="border-t-2 border-grey-500 w-full mx-auto mb-10">`;
        }).join('');

        document.querySelectorAll('.suat-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.suat-btn').forEach(b => {
                    b.classList.remove('bg-red-600', 'text-white');
                    b.classList.add('bg-white', 'text-gray-700');
                });
                btn.classList.remove('bg-white', 'text-gray-700');
                btn.classList.add('bg-red-600', 'text-white');

                const suatId = btn.dataset.suatId;
                const encoded = base64Encode(suatId + salt);

                fetch(`${baseUrl}/api/check-login`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.status === "success") {
                            window.location.href = `${baseUrl}/so-do-ghe/${encoded}`;
                        } else {
                            alert("Vui lòng đăng nhập!");
                        }
                    }).catch(err => { console.error(err); alert("Không thể xác thực đăng nhập"); });
            });
        });
    }

    function loadSuatChieu() {
        const selectedDate = getSelectedDate();
        fetch(`${baseUrl}/api/suat-chieu-khach?ngay=${selectedDate}&id_phim=${idPhim}`)
            .then(res => res.json())
            .then(data => {
                allSuatChieu = Array.isArray(data.data) ? data.data : [];
                renderSuatChieu();
            }).catch(err => console.error("Lỗi load suất chiếu:", err));
    }

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
                if (url) {
                    trailerIframe.src = url + (url.includes("?") ? "&" : "?") + "autoplay=1";
                    trailerModal.classList.remove("hidden");
                }
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

    function loadDanhSachCmt(danhGia) {
        const commentList = document.getElementById('commentList');
        const averageRatingSpan = document.getElementById('averageRating');

        if (!danhGia || danhGia.length === 0) {
            commentList.innerHTML = '<p class="text-gray-500">Chưa có bình luận nào.</p>';
            if (averageRatingSpan) averageRatingSpan.textContent = '0.0 (0 votes)';
            return;
        }

        const totalStars = danhGia.reduce((sum, cmt) => sum + (cmt.so_sao || 0), 0);
        const avgStars = (totalStars / danhGia.length).toFixed(1);
        if (averageRatingSpan) averageRatingSpan.textContent = `${avgStars} (${danhGia.length} votes)`;

        const html = danhGia.map(cmt => {
            const stars = '★'.repeat(cmt.so_sao) + '☆'.repeat(5 - cmt.so_sao);
            const ngayGui = new Date(cmt.created_at || cmt.ngay_tao).toLocaleString('vi-VN', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
            return `<div class="p-4 bg-gray-50 rounded-lg shadow-sm">
                <div class="flex items-center gap-3 mb-2">
                    <div class="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold">
                        ${cmt.khach_hang.ho_ten.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p class="font-semibold text-gray-800">${cmt.khach_hang.ho_ten}</p>
                        <div class="flex text-sm text-yellow-400">${stars}</div>
                    </div>
                </div>
                <p class="text-gray-700">${cmt.cmt}</p>
                <p class="text-gray-400 text-xs mt-1">${ngayGui}</p>
            </div>`;
        }).join('');

        commentList.innerHTML = html;
    }

    commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const comment = commentForm.querySelector('textarea[name="comment"]').value;

        // Kiểm tra login trước khi gửi
        try {
            const loginCheck = await fetch(`${baseUrl}/api/check-login`);
            const loginData = await loginCheck.json();

            if (loginData.status !== "success") {
                alert("Vui lòng đăng nhập để gửi bình luận!");
                return;
            }
        } catch(err) {
            console.error(err);
            alert("Không thể xác thực đăng nhập");
            return;
        }
        
        try {
            const res = await fetch(`${baseUrl}/api/them-danh-gia`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phim_id: idPhim, so_sao: parseInt(ratingValue.textContent), cmt: comment })
            });
            const data = await res.json();
            if (data.success) {
                alert('Gửi đánh giá thành công!');
                commentForm.querySelector('textarea[name="comment"]').value = '';
                currentRating = 5; updateStars(currentRating);

                const resDanhGia = await fetch(`${baseUrl}/api/doc-danh-gia/${idPhim}`);
                const dataDanhGia = await resDanhGia.json();
                if (dataDanhGia.success) loadDanhSachCmt(dataDanhGia.data);
            } else alert('Lỗi: ' + data.message);
        } catch (err) { console.error(err); alert('Lỗi server'); }
    });

    // Load thông tin phim + suất chiếu + bình luận
    fetch(`${baseUrl}/api/dat-ve/${idPhim}`)
        .then(res => res.json())
        .then(data => {
            if (data.success && data.data) {
                loadThongTinPhim(data.data);
                loadNoiDungPhim(data.data);
                loadSuatChieu();

                // Load danh sách đánh giá
                fetch(baseUrl + "/api/doc-danh-gia/" + idPhim)
                    .then(res => res.json())
                    .then(data => { if (data.success) loadDanhSachCmt(data.data); });
            }
        }).catch(err => console.error(err));

    // --- Day Tabs ---
    const visibleDays = 7;
    let currentStartIndex = 0;
    let activeIndex = -1;
    const allDays = [];
    const today = new Date();
    for (let i=0;i<30;i++){ const d=new Date(today); d.setDate(today.getDate()+i); allDays.push(d); }

    function formatDate(d){ return ("0"+d.getDate()).slice(-2)+"/"+("0"+(d.getMonth()+1)).slice(-2);}
    function formatWeekday(d){ return ["CN","T2","T3","T4","T5","T6","T7"][d.getDay()]; }

    function renderDayTabs(){
        dayTabs.innerHTML='';
        for(let i=currentStartIndex;i<currentStartIndex+visibleDays;i++){
            if(!allDays[i]) continue;
            const btn=document.createElement('button');
            btn.className='flex-shrink-0 text-center px-4 py-2 rounded-lg border border-gray-300 font-semibold text-gray-700 hover:bg-red-500 hover:text-white transition-colors';
            btn.innerHTML=`${formatWeekday(allDays[i])}<br>${formatDate(allDays[i])}`;
            btn.dataset.index=i;
            if(activeIndex===-1 && i===0){ btn.classList.add('bg-red-600','text-white'); activeIndex=0; }
            else if(i===activeIndex){ btn.classList.add('bg-red-600','text-white'); }
            dayTabs.appendChild(btn);
        }
    }

    function getSelectedDate(){ return activeIndex>=0 ? allDays[activeIndex].toISOString().split('T')[0] : today.toISOString().split('T')[0]; }

    dayTabs.addEventListener('click', e=>{
        const btn = e.target.closest('button'); if(!btn) return;
        dayTabs.querySelectorAll('button').forEach(b=>{ b.classList.remove('bg-red-600','text-white'); b.classList.add('text-gray-700','border-gray-300'); });
        btn.classList.add('bg-red-600','text-white'); activeIndex=parseInt(btn.dataset.index); loadSuatChieu();
    });

    nextBtn.addEventListener('click',()=>{ if(currentStartIndex+visibleDays<allDays.length){ currentStartIndex++; renderDayTabs(); } });
    prevBtn.addEventListener('click',()=>{ if(currentStartIndex>0){ currentStartIndex--; renderDayTabs(); } });
    renderDayTabs();

});
</script>
</body>
</html>
