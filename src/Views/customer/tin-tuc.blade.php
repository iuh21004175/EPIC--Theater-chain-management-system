<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Dữ Liệu Điện Ảnh Đồ Sộ Nhất Việt Nam | EPIC CINEMAS</title>
  <link rel="stylesheet" href="{{$_ENV['URL_WEB_BASE']}}/css/tailwind.css">
</head>
<body class="bg-gray-50 text-gray-800 font-sans">
@include('customer.layout.header')

<div class="max-w-5xl mx-auto p-6">
    <h1 class="text-2xl font-bold border-l-4 border-red-500 pl-2 mb-4">
      PHIM ĐIỆN ẢNH
    </h1>
    
    <!-- Bộ lọc phim -->
<div class="flex flex-wrap gap-2 mb-6 pb-4 border-b border-red-500">
  <!-- Thể loại -->
  <div class="flex-1 min-w-[120px]">
    <select id="theLoaiMenu" class="w-full border border-gray-300 rounded px-3 py-2 text-sm">
      <option value="">Thể loại</option>
    </select>
  </div>

  <!-- Quốc gia -->
  <div class="flex-1 min-w-[120px]">
    <select class="w-full border border-gray-300 rounded px-3 py-2 text-sm">
      <option value="">Quốc gia</option>
      <option value="viet-nam">Việt Nam</option>
      <option value="my">Mỹ</option>
      <option value="han-quoc">Hàn Quốc</option>
    </select>
  </div>

  <!-- Năm -->
  <div class="flex-1 min-w-[120px]">
    <select class="w-full border border-gray-300 rounded px-3 py-2 text-sm">
      <option value="">Năm</option>
      <option value="2025">2025</option>
      <option value="2024">2024</option>
      <option value="2023">2023</option>
    </select>
  </div>

  <!-- Đang chiếu / Sắp chiếu -->
  <div class="flex-1 min-w-[140px]">
    <select class="w-full border border-gray-300 rounded px-3 py-2 text-sm">
      <option value="">Đang chiếu / Sắp chiếu</option>
      <option value="dang-chieu">Đang chiếu</option>
      <option value="sap-chieu">Sắp chiếu</option>
    </select>
  </div>

  <!-- Xem nhiều nhất -->
  <div class="flex-1 min-w-[140px]">
    <select class="w-full border border-gray-300 rounded px-3 py-2 text-sm">
      <option value="">Xem nhiều nhất</option>
      <option value="1">1 tuần</option>
      <option value="2">1 tháng</option>
      <option value="3">3 tháng</option>
    </select>
  </div>
</div>

    <!-- Container phim -->
    <div class="phim-container"></div>

    <!-- Phân trang -->
    <div id="pagination" class="flex justify-center mt-6 space-x-2"></div>
</div>

@include('customer.layout.footer')

<script>
document.addEventListener("DOMContentLoaded", () => {
    const baseUrl = "{{ $_ENV['URL_WEB_BASE'] }}";
    const urlMinio = "{{ $_ENV['MINIO_SERVER_URL'] }}";
    const salt = "{{ $_ENV['URL_SALT'] }}";

    const container = document.querySelector(".phim-container");
    const paginationContainer = document.getElementById("pagination");
    const theLoaiMenu = document.getElementById("theLoaiMenu");

    let currentPage = 1;
    let currentTuKhoa = "";
    let currentLoai = "";

    function slugify(str) {
        return str
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    function base64Encode(str) {
        return btoa(unescape(encodeURIComponent(str)));
    }

    function renderPhim(phim) {
        const encoded = base64Encode(phim.id + salt);
        const html = `
        <a href="${baseUrl}/tin-tuc/${slugify(phim.ten_phim)}-${encoded}" class="bg-white rounded-lg shadow-md flex mb-6 block no-underline">
            <img src="${urlMinio}/${phim.poster_url}" alt="${phim.ten_phim}" class="w-48 h-32 flex-shrink-0 object-cover rounded-l-lg">
            <div class="p-4 flex flex-col justify-between flex-1">
                <div>
                    <h2 class="text-lg font-semibold text-gray-800">${phim.ten_phim}</h2>
                    <p class="text-gray-600 text-sm mt-2 line-clamp-2">${phim.mo_ta}</p>
                </div>
            </div>
        </a>
        `;
        container.insertAdjacentHTML("beforeend", html);
    }

    function renderPagination(totalPages, currentPage) {
        paginationContainer.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            btn.className = `px-3 py-1 rounded border ${i === currentPage ? 'bg-red-500 text-white' : 'bg-white text-gray-800'}`;
            btn.addEventListener('click', () => {
                currentPage = i;
                loadPhim(currentTuKhoa, currentLoai, currentPage);
            });
            paginationContainer.appendChild(btn);
        }
    }

    async function loadPhim(tuKhoa = "", theLoaiId = "", page = 1) {
        container.innerHTML = '<p class="text-gray-500">Đang tải...</p>';

        try {
            const url = new URL(baseUrl + "/api/phim-dien-anh");
            if (tuKhoa) url.searchParams.append("tuKhoaTimKiem", tuKhoa);
            if (theLoaiId) url.searchParams.append("theLoaiId", theLoaiId);
            url.searchParams.append("page", page);

            const res = await fetch(url);
            const data = await res.json();

            container.innerHTML = '';
            if (data.success && data.data.length > 0) {
                data.data.forEach(phim => renderPhim(phim));
                renderPagination(data.pagination.total_pages, data.pagination.current_page);
            } else {
                container.innerHTML = '<p class="text-gray-500">Không có phim nào.</p>';
            }
        } catch (err) {
            console.error("Lỗi load phim:", err);
            container.innerHTML = '<p class="text-red-500">Lỗi khi tải dữ liệu phim.</p>';
        }
    }

    // Load thể loại vào select
    async function loadTheLoai() {
        try {
            const res = await fetch(baseUrl + "/api/loai-phim");
            const data = await res.json();
            if (data.success && data.data.length > 0) {
                theLoaiMenu.innerHTML = '<option value="">Tất cả thể loại</option>';
                data.data.forEach(loai => {
                    const option = document.createElement("option");
                    option.value = loai.id;
                    option.textContent = loai.ten;
                    theLoaiMenu.appendChild(option);
                });
            } else {
                theLoaiMenu.innerHTML = '<option value="">Không có thể loại</option>';
            }
        } catch (err) {
            console.error("Lỗi load thể loại:", err);
        }
    }

    // Khi chọn thể loại
    theLoaiMenu.addEventListener("change", () => {
        currentLoai = theLoaiMenu.value;
        currentPage = 1;
        loadPhim(currentTuKhoa, currentLoai, currentPage);
    });

    // Khởi tạo
    loadTheLoai();
    loadPhim();
});
</script>

</body>
</html>
