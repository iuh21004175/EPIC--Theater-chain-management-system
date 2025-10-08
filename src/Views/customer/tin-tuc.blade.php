<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Tin Tức Điện Ảnh Mới Nhất | EPIC CINEMAS</title>
  <link rel="stylesheet" href="{{ $_ENV['URL_WEB_BASE'] }}/css/tailwind.css">
  <style>
    /* Fallback nếu chưa cài plugin line-clamp */
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  </style>
</head>

<body class="bg-gray-50 text-gray-800 font-sans min-h-screen flex flex-col">
  @include('customer.layout.header')

  <main class="flex-1">
    <div class="max-w-5xl mx-auto p-6">
      <h1 class="text-2xl font-bold border-l-4 border-red-500 pl-2 mb-6 uppercase tracking-wide">
        Tin tức điện ảnh
      </h1>

      <!-- Danh sách tin tức -->
      <div id="tinTucContainer" class="space-y-6"></div>
    </div>
  </main>

  @include('customer.layout.footer')

  <script>
    const urlMinio = "{{ $_ENV['MINIO_SERVER_URL'] }}";
    const tinTucContainer = document.getElementById('tinTucContainer');

    // Hàm tạo slug an toàn
    function slugify(str) {
      if (!str || typeof str !== 'string') return 'bai-viet';
      return str
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    // Hàm render nhanh hơn (dùng build chuỗi HTML rồi gắn 1 lần)
    function renderTinTucList(list) {
      if (!list.length) {
        tinTucContainer.innerHTML = `<p class="text-center text-gray-500">Không có tin tức nào.</p>`;
        return;
      }

      const html = list.map(tintuc => {
        const link = `${baseUrl}/chi-tiet-tin-tuc/${slugify(tintuc.tieu_de)}-${tintuc.id}`;
        const image = `${urlMinio}/${tintuc.anh_tin_tuc || 'default.jpg'}`;
        const title = tintuc.tieu_de || 'Không có tiêu đề';
        const content = (tintuc.noi_dung || '').replace(/<[^>]*>/g, ''); // loại thẻ HTML ngắn gọn
        const date = new Date(tintuc.ngay_tao).toLocaleDateString('vi-VN');

        return `
          <a href="${link}" class="block bg-white shadow rounded overflow-hidden hover:shadow-lg transition flex flex-col md:flex-row">
            <img src="${image}" alt="${title}" class="w-full md:w-1/3 h-56 object-cover">
            <div class="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h2 class="text-xl font-semibold mb-2 hover:text-red-500 line-clamp-2">${title}</h2>
                <p class="text-sm text-gray-600 mb-3 line-clamp-3">${content}</p>
              </div>
              <div class="text-xs text-gray-500 flex justify-between items-center">
                <span>Ngày đăng: ${date}</span>
              </div>
            </div>
          </a>
        `;
      }).join("");

      tinTucContainer.innerHTML = html;
    }

    // Gọi API 1 lần, render toàn bộ nhanh
    fetch(`${baseUrl}/api/doc-tin-tuc`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          renderTinTucList(data.data);
        } else {
          tinTucContainer.innerHTML = `<p class="text-center text-gray-500">Không có tin tức nào.</p>`;
        }
      })
      .catch(err => {
        console.error("Lỗi tải tin tức:", err);
        tinTucContainer.innerHTML = `<p class="text-center text-red-500">Đã xảy ra lỗi khi tải tin tức.</p>`;
      });
  </script>
</body>
</html>
