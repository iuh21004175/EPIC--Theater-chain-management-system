<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sơ đồ ghế</title>
  <link rel="stylesheet" href="{{$_ENV['URL_WEB_BASE']}}/css/tailwind.css">
</head>
<body class="bg-gray-100 min-h-screen flex flex-col items-center py-10">

<div class="flex flex-col md:flex-row gap-6 max-w-6xl w-full px-4">

  <!-- Bên trái: Sơ đồ ghế -->
  <div id="leftContainer" class="flex-1 transition-opacity duration-500">
    <div class="w-full text-white text-center py-3 rounded-lg mb-6 
                shadow-2xl tracking-wider font-bold text-lg
                bg-gray-900 border border-gray-800">
      MÀN HÌNH
    </div>

    <div id="seatMap" class="grid gap-4 mb-6"
         style="grid-template-columns: repeat(10, minmax(0, 1fr));">
      <!-- Ghế sẽ được JS render -->
    </div>

    <!-- Chú thích -->
    <div class="mt-6 space-y-3">
      <h2 class="text-lg font-semibold text-gray-700">Chú thích</h2>
      <div id="chuthich" class="flex flex-wrap gap-6">
        <div class="flex items-center gap-2">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-700 shadow-lg"></div>
          <span>Đang chọn</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-12 h-12 rounded-xl shadow-md flex items-center justify-center text-white font-bold bg-gray-400"></div> 
          <span>Đã đặt</span>
        </div>
      </div>
    </div>
  </div>
  <div id="foodContainer" class="flex-1 transition-opacity duration-500 bg-white rounded-lg shadow-lg p-6 hidden">
    <h2 class="text-lg font-bold">Chọn bắp & nước</h2>
  </div>
  <!-- Bên phải: Thông tin phim + ghế đã chọn + tổng cộng -->
  <div id="movieInfo" class="w-full md:w-96 bg-white rounded-lg shadow-lg p-6 flex flex-col gap-4">
    <!-- Nội dung sẽ render bằng JS -->
  </div>


  
</div>

<script>
    const seatMap = document.getElementById("seatMap");
    const chuthichContainer = document.getElementById("chuthich");
    const movieInfo = document.getElementById("movieInfo");
    const baseUrl = "{{ $_ENV['URL_WEB_BASE'] }}";
    const urlMinio = "{{ $_ENV['MINIO_SERVER_URL'] }}";
    const salt = "{{ $_ENV['URL_SALT'] }}";
    const leftContainer = document.getElementById("leftContainer");
    let selectedSeats = [];

    function base64Decode(str) {
      return decodeURIComponent(escape(atob(str)));
    }

    // API phòng chiếu
    const pathParts = window.location.pathname.split("/");
    const slugWithId = pathParts[pathParts.length - 1];  
    const decoded = base64Decode(slugWithId); 
    const idPhong = decoded.replace(salt, ""); 
    const apiUrl = `${baseUrl}/api/so-do-ghe/${idPhong}`;

    function loadSeats() {
      fetch(apiUrl)
        .then(res => res.json())
        .then(json => {
          if (!json.success) {
            seatMap.innerHTML = `<p class="text-red-500">${json.message}</p>`;
            return;
          }

          const data = json.data;

          // Render thông tin phim + ghế đã chọn + tổng cộng + nút tiếp tục
          movieInfo.innerHTML = `
            <div class="flex gap-4">
              <img src="${urlMinio}/${data.phim.poster_url}" alt="Poster phim" class="w-24 h-32 object-cover rounded">
              <div class="flex-1 flex flex-col justify-between">
                <div>
                  <h2 class="text-lg font-bold">${data.phim.ten_phim}</h2>
                  <p class="text-gray-500">2D Phụ Đề - 
                    <span class="bg-red-500 text-white px-2 rounded">${data.phim.do_tuoi}</span>
                  </p>
                </div>
                <p class="text-gray-600 mt-2 text-sm">
                  <span class="font-bold">${data.rap.ten}</span> - ${data.phong.ten}
                </p>
                <p class="text-gray-600 text-sm">
                  Suất: <span class="font-bold">${new Date(data.suat_chieu.bat_dau).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span> 
                  - <span class="font-bold">${new Date(data.suat_chieu.bat_dau).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'})}</span>
                </p>
              </div>
            </div>

            <hr class="border-gray-200">

            <div id="selectedSeatsContainer">
              <div class="text-gray-500 text-sm">Chưa chọn ghế</div>
            </div>

            <hr class="border-gray-200">

            <div class="flex flex-col gap-2">
              <div class="flex justify-between font-bold text-lg">
                <span>Tổng cộng</span>
                <span id="totalPrice">0 ₫</span>
              </div>

              <div id="continueContainer" class="mt-2 hidden">
                <button id="continueBtn" class="w-full bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 transition">
                  Tiếp tục
                </button>
              </div>
            </div>
          `;

          const selectedSeatsContainer = document.getElementById("selectedSeatsContainer");
          const totalPriceEl = document.getElementById("totalPrice");
          const continueContainer = document.getElementById("continueContainer");
          const foodContainer = document.getElementById("foodContainer");

          // Grid số cột
          seatMap.style.gridTemplateColumns = `repeat(${data.socot_ghe}, minmax(0, 1fr))`;

          // Render chú thích loại ghế
          const seatTypes = {};
          data.phong.soDoGhe.forEach(ghe => {
            if (ghe.loai_ghe) seatTypes[ghe.loai_ghe.ten] = ghe.loai_ghe.ma_mau;
          });

          Object.keys(seatTypes).forEach(ten => {
            const div = document.createElement("div");
            div.className = "flex items-center gap-2";
            div.innerHTML = `
              <div class="w-12 h-12 rounded-xl shadow-md flex items-center justify-center text-white font-bold" style="background-color:${seatTypes[ten]}">${ten[0]}</div>
              <span>${ten}</span>
            `;
            chuthichContainer.appendChild(div);
          });

          // Render sơ đồ ghế
          data.phong.soDoGhe.forEach(ghe => {
            
            const seat = document.createElement("div");
            
            if (!ghe.loaighe_id) {
              // Ghế null → hiển thị lối đi
              seat.className =
                "w-12 h-12 rounded-xl bg-transparent"; // ô trống, không click
              seatMap.appendChild(seat);
              return;
            }
            seat.textContent = ghe.so_ghe;
            seat.className =
              "flex items-center justify-center w-12 h-12 text-sm font-bold rounded-xl cursor-pointer transition transform hover:scale-105 select-none shadow-md";

            if (ghe.trang_thai === "da_dat" || !ghe.loai_ghe) {
              seat.classList.add("bg-gray-400", "text-white", "cursor-not-allowed", "shadow-inner");
            } else {
              seat.style.backgroundColor = ghe.loai_ghe.ma_mau;
              seat.classList.add("text-white", "hover:opacity-80");

              // Gán data để toggleSeat dùng
              seat.dataset.loaighe_id = ghe.loaighe_id;
              seat.dataset.ngay = data.suat_chieu.bat_dau.split(' ')[0];
              seat.dataset.dinhdang = data.phong.loai_phongchieu;

              seat.addEventListener("click", () =>
                toggleSeat(seat, ghe.loai_ghe.ma_mau, selectedSeatsContainer, totalPriceEl, continueContainer)
              );
            }
            seatMap.appendChild(seat);
          });
            // Xử lý ẩn ghế khi bấm Tiếp tục, hiển thị sản phẩm ăn uống
            const continueBtn = document.getElementById("continueBtn");
            continueBtn.addEventListener("click", () => {
              leftContainer.style.transition = "opacity 0.5s";
              leftContainer.style.opacity = 0;          
              leftContainer.style.pointerEvents = "none"; 

              leftContainer.classList.add("hidden"); // ẩn sơ đồ ghế
              foodContainer.classList.remove("hidden");
            });
        })
        .catch(err => {
          seatMap.innerHTML = `<p class="text-red-500">Lỗi khi tải dữ liệu: ${err.message}</p>`;
        });
    }

    // Hàm chọn/bỏ chọn ghế
    async function toggleSeat(seat, baseColor, selectedSeatsContainer, totalPriceEl, continueContainer) {
      const seatNum = seat.textContent;

      if (seat.classList.contains("ring-4")) {
        seat.style.backgroundColor = baseColor;
        seat.classList.remove("ring-4", "ring-red-600");
        selectedSeats = selectedSeats.filter(s => s.so_ghe !== seatNum);
      } else {
        let gia = seat.dataset.price ? parseInt(seat.dataset.price) : 0;

        if (!gia) {
          const ngay = seat.dataset.ngay;
          const dinhDangPhim = seat.dataset.dinhdang;
          const loaiGheId = seat.dataset.loaighe_id;

          try {
            const res = await fetch(`${baseUrl}/api/tinh-gia-ve/${loaiGheId}/${ngay}/${dinhDangPhim}`);
            const j = await res.json();
            if (j.success) {
              gia = j.data;
              seat.dataset.price = gia;
            }
          } catch (e) {
            console.error("Lỗi khi lấy giá ghế:", e);
          }
        }

        seat.classList.add("ring-4", "ring-red-600");
        selectedSeats.push({ so_ghe: seatNum, gia });
      }

      updateSelectedSeats(selectedSeatsContainer, totalPriceEl, continueContainer);
    }

    // Cập nhật danh sách ghế đã chọn + tổng tiền + hiển thị nút
    function updateSelectedSeats(selectedSeatsContainer, totalPriceEl, continueContainer) {
      if (selectedSeats.length === 0) {
        selectedSeatsContainer.innerHTML = '<div class="text-gray-500 text-sm">Chưa chọn ghế</div>';
        continueContainer.classList.add("hidden");
      } else {
        selectedSeatsContainer.innerHTML = '';
        selectedSeats.forEach(s => {
          const div = document.createElement("div");
          div.className = "flex justify-between mb-1";
          div.innerHTML = `<span>1x Ghế đơn</span><span>${s.gia.toLocaleString()} ₫</span>`;

          const seatDiv = document.createElement("div");
          seatDiv.className = "flex justify-between text-gray-500 text-sm";
          seatDiv.innerHTML = `<span>Ghế: ${s.so_ghe}</span>`;
          selectedSeatsContainer.appendChild(div);
          selectedSeatsContainer.appendChild(seatDiv);
        });
        continueContainer.classList.remove("hidden");
      }

      const total = selectedSeats.reduce((sum, s) => sum + s.gia, 0);
      totalPriceEl.textContent = `${total.toLocaleString()} ₫`;
    }

    loadSeats();
</script>

</body>
</html>
