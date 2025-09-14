<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title id="title"></title>
<link rel="stylesheet" href="{{$_ENV['URL_WEB_BASE']}}/css/tailwind.css">
</head>
<body class="bg-gray-100 min-h-screen">

  <!-- Header -->
  @include('customer.layout.header')

  <main class="py-10 px-4 sm:px-6 lg:px-8">
    <div class="max-w-6xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
      <header class="p-6 sm:p-8 border-b border-gray-200">
        <h1 id="rapTen" class="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight"></h1>
      </header>

      <section class="p-6 sm:p-8 space-y-10">
        <div>
          <h2 class="text-2xl font-bold text-gray-800 mb-4">Thông tin rạp</h2>
          <ul id="rapInfo" class="list-disc list-inside space-y-2 text-gray-700">
            <li><span class="font-semibold">Địa chỉ:</span></li>
            <li><span class="font-semibold">Hotline:</span> <a href="tel:19002224" class="text-blue-600 hover:underline">19002224</a></li>
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
      <div id="listPhim" class="grid grid-cols-2 md:grid-cols-4 gap-6"></div>

      <!-- Section suất chiếu -->
      <div id="loadSuatChieu" class="mt-10 hidden" data-movie=""></div>
    </section>

  </main>

  <!-- Footer -->
  @include('customer.layout.footer')

<script>
document.addEventListener("DOMContentLoaded", () => {
  const baseUrl = "{{ $_ENV['URL_WEB_BASE'] }}";
  const urlMinio = "{{ $_ENV['MINIO_SERVER_URL'] }}";

  // Giải mã base64 + salt
  function base64Decode(str) {
      return decodeURIComponent(escape(atob(str)));
  }
  const pathParts = window.location.pathname.split("/");
  const slugWithId = pathParts[pathParts.length - 1];  
  const encodedId = slugWithId.split("-").pop();
  const salt = "{{ $_ENV['URL_SALT'] }}";
  const decoded = base64Decode(encodedId); 
  const idRap = decoded.replace(salt, ""); 

  // -------------------
  // Load thông tin rạp
  async function fetchRap(idRap) {
    try {
      const res = await fetch(`${baseUrl}/api/rap/${idRap}`);
      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) {
        const rap = data.data[0];
        document.getElementById("rapTen").textContent = rap.ten;
        document.getElementById("title").textContent = rap.ten;
        document.getElementById("rapInfo").innerHTML = `
          <li><span class="font-semibold">Địa chỉ:</span> ${rap.dia_chi}</li>
          <li><span class="font-semibold">Hotline:</span> <a href="tel:19002224" class="text-blue-600 hover:underline">19002224</a></li>
        `;
      }
    } catch (err) {
      console.error("Lỗi load rạp:", err);
    }
  }

  // -------------------
  // Tab ngày
  const dayTabs = document.getElementById('dayTabs');
  const nextBtn = document.getElementById('nextDay');
  const prevBtn = document.getElementById('prevDay');
  const visibleDays = 7;
  let currentStartIndex = 0;
  let activeIndex = 0;

  const startDate = new Date();
  const allDays = [];
  for (let i=0; i<30; i++){
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    allDays.push(d);
  }

  function formatDate(d) {
    return ("0" + d.getDate()).slice(-2) + "/" + ("0" + (d.getMonth()+1)).slice(-2);
  }
  function formatWeekday(d){
    const weekdays = ["Chủ Nhật","Thứ Hai","Thứ Ba","Thứ Tư","Thứ Năm","Thứ Sáu","Thứ Bảy"];
    return weekdays[d.getDay()];
  }
  function getSelectedDate() {
    const d = allDays[activeIndex] || new Date();
    return d.getFullYear() + "-" + ("0" + (d.getMonth()+1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
  }
  function renderDays() {
  dayTabs.innerHTML = '';
  for (let i=currentStartIndex; i<currentStartIndex+visibleDays; i++){
    if(!allDays[i]) continue;
    const btn = document.createElement('button');
    btn.className = 'flex-shrink-0 px-4 py-2 rounded-lg font-semibold border transition-colors text-sm';
    btn.innerHTML = `${formatWeekday(allDays[i])}<br>${formatDate(allDays[i])}`;
    if(i===activeIndex){
      btn.classList.add('bg-red-600','text-white','border-red-600');
    } else {
      btn.classList.add('bg-gray-100','hover:bg-gray-200','text-gray-800','border-gray-300');
    }

    btn.addEventListener('click', ()=> {
      activeIndex = i;
      renderDays();

      // Ẩn khung suất chiếu
      const loadSuatChieuEl = document.getElementById('loadSuatChieu');
      loadSuatChieuEl.classList.add('hidden');
      loadSuatChieuEl.dataset.movie = '';

      // Xóa nút "Đã chọn" trên các phim
      document.querySelectorAll('.mark-selected').forEach(btn => btn.remove());

      fetchPhimTheoRap(idRap, getSelectedDate());
    });
    dayTabs.appendChild(btn);
  }
}

  nextBtn.addEventListener('click', () => {
    if(currentStartIndex+visibleDays < allDays.length){
      currentStartIndex++;
      renderDays();
    }
  });
  prevBtn.addEventListener('click', () => {
    if(currentStartIndex>0){
      currentStartIndex--;
      renderDays();
    }
  });

  // -------------------
  // Load phim theo rạp + ngày
  async function fetchPhimTheoRap(idRap, ngay) {
    try {
      const res = await fetch(`${baseUrl}/api/phim-theo-rap/${idRap}?ngay=${ngay}`);
      const data = await res.json();
      const listPhim = document.getElementById('listPhim');
      listPhim.innerHTML = '';
      if (data.success && data.data) {
        data.data.forEach(phim => {
          const phimHTML = `
            <div class="group relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition cursor-pointer" data-movie="${phim.id}" data-name="${phim.ten_phim}">
              <img src="${urlMinio}/${phim.poster_url}" alt="${phim.ten_phim}" class="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500">
              <p class="mb-5 mt-3 text-center font-bold text-gray-800">${phim.ten_phim}</p>
            </div>
          `;
          listPhim.insertAdjacentHTML('beforeend', phimHTML);
        });
        attachMovieClickEvents();
      }
    } catch (err) {
      console.error('Lỗi load phim theo rạp:', err);
    }
  }

  // -------------------
  // Load suất chiếu theo phim
  function loadSuatChieu(idPhim, movieName) {
    const selectedDate = getSelectedDate();
    fetch(`${baseUrl}/api/suat-chieu-khach?ngay=${selectedDate}&id_phim=${idPhim}`)
      .then(res => res.json())
      .then(data => {
        const suatChieu = Array.isArray(data.data) ? data.data : [];
        renderSuatChieu(suatChieu, movieName);
      })
      .catch(err => console.error("Lỗi load suất chiếu:", err));
  }

  function renderSuatChieu(suatChieu, movieName) {
    const loadSuatChieuEl = document.getElementById('loadSuatChieu');

    if (!suatChieu || suatChieu.length === 0) {
        loadSuatChieuEl.innerHTML = `<p class="text-gray-500 font-semibold">Chưa có phim chiếu trong ngày.</p>`;
    } else {
        // Sắp xếp theo giờ bắt đầu tăng dần
        suatChieu.sort((a, b) => new Date(a.batdau) - new Date(b.batdau));

        let html = `<div class="showtimes mt-4 bg-gray-50 p-4 rounded-lg shadow-inner">
                        <h3 class="font-semibold mb-2">Suất chiếu: ${movieName}</h3>
                        <div class="flex gap-2 flex-wrap">`;

        suatChieu.forEach(suat => {
            const gioChieu = new Date(suat.batdau).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            html += `<button 
                        class="px-3 py-1 bg-white border rounded-lg hover:bg-red-600 hover:text-white transition suat-btn"
                        data-suat-id="${suat.id}"
                        data-phong-id="${suat.phong_chieu.id}"
                        data-rap-id="${suat.phong_chieu.rap_chieu_phim.id}">
                        ${gioChieu}
                     </button>`;
        });

        html += `</div></div>`;
        loadSuatChieuEl.innerHTML = html;

        // Gắn sự kiện click cho từng nút suất chiếu
        const salt = "{{ $_ENV['URL_SALT'] }}"; // nếu dùng server blade
        document.querySelectorAll('.suat-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const suatId = btn.dataset.suatId;
                const phongId = btn.dataset.phongId;
                const rapId = btn.dataset.rapId;

                // encode base64
                function base64Encode(str) {
                    return btoa(unescape(encodeURIComponent(str)));
                }
                const encoded = base64Encode(suatId + salt);

                console.log("Chọn suất chiếu ID:", suatId);
                console.log("Chọn phòng chiếu ID:", phongId);
                console.log("Chọn rạp ID:", rapId);

                // Chuyển trang
                window.location.href = `${baseUrl}/so-do-ghe/${encoded}`;
            });
        });
    }

    loadSuatChieuEl.classList.remove('hidden');
    loadSuatChieuEl.scrollIntoView({behavior: "smooth"});
}



  // -------------------
  // Gắn sự kiện click phim
  function attachMovieClickEvents() {
    document.querySelectorAll('.group[data-movie]').forEach(card => {
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        const movieKey = card.dataset.movie;
        const movieName = card.dataset.name;
        const loadSuatChieuEl = document.getElementById('loadSuatChieu');

        // Ẩn nếu click lại phim đã chọn
        if(loadSuatChieuEl.dataset.movie === movieKey && !loadSuatChieuEl.classList.contains('hidden')) {
          loadSuatChieuEl.classList.add('hidden');
          document.querySelectorAll('.mark-selected').forEach(btn => btn.remove());
          return;
        }

        document.querySelectorAll('.mark-selected').forEach(btn => btn.remove());

        loadSuatChieuEl.dataset.movie = movieKey;
        loadSuatChieu(movieKey, movieName);

        const markBtn = document.createElement('div');
        markBtn.textContent = "Đã chọn";
        markBtn.className = "mark-selected absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded";
        card.appendChild(markBtn);
      });
    });
  }

  // -------------------
  // Init
  fetchRap(idRap);
  renderDays();
  fetchPhimTheoRap(idRap, getSelectedDate());
});
</script>


</body>
</html>
