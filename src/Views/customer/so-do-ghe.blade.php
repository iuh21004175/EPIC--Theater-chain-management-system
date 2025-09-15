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
          <div class="w-12 h-12 rounded-xl shadow-md flex items-center justify-center text-white font-bold bg-gray-400"></div> 
          <span>Đang chọn</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-12 h-12 rounded-xl bg-white-400 flex items-center justify-center shadow-md">
            🎟️
          </div>
          <span>Đã đặt</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Chọn đồ ăn -->
  <div id="foodContainer" class="flex-1 transition-opacity duration-500 bg-white rounded-lg shadow-lg p-6 hidden">
    <h2 class="text-lg font-bold mb-4">Chọn bắp & nước</h2>
  </div>

  <!-- QR thanh toán -->
  <div id="qrContainer" class="flex-1 transition-opacity duration-500 bg-white rounded-lg shadow-lg p-6 hidden">
    <h2 class="text-lg  text-center font-bold mb-4">Quét mã QR để thanh toán</h2>
    <img id="qrImage" src="" alt="QR Thanh toán" class="mx-auto">
    <p class="mt-4 text-center text-gray-600">Vui lòng quét QR để hoàn tất thanh toán</p>
  </div>
  <div id="success_pay_box" class="flex-1 transition-opacity duration-500 bg-white rounded-lg shadow-lg p-6 hidden">
  <h2 class="text-success flex justify-center items-center gap-2">
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="bi bi-check-circle text-success" viewBox="0 0 16 16">
      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
      <path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05"/>
    </svg>
    Thanh toán thành công
  </h2>
  <p class="text-center text-success">Chúng mừng bạn đã đặt vé thành công!</p>
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
const foodContainer = document.getElementById("foodContainer");
const qrContainer = document.getElementById("qrContainer");
const qrImage = document.getElementById("qrImage");
const success_pay_box = document.getElementById("success_pay_box");
const leftContainer = document.getElementById("leftContainer");

const baseUrl = "{{ $_ENV['URL_WEB_BASE'] }}";
const urlMinio = "{{ $_ENV['MINIO_SERVER_URL'] }}";
const salt = "{{ $_ENV['URL_SALT'] }}";

let selectedSeats = [];
let selectedFood = [];
let suatChieuData = null;

// Giải mã base64 và lấy id phòng
function base64Decode(str) {
    return decodeURIComponent(escape(atob(str)));
}
const pathParts = window.location.pathname.split("/");
const slugWithId = pathParts[pathParts.length - 1];
const decoded = base64Decode(slugWithId);
const idPhong = decoded.replace(salt, "");

const apiUrl = `${baseUrl}/api/so-do-ghe/${idPhong}`;

// Load sơ đồ ghế
async function loadSeats() {
    try {
        const res = await fetch(apiUrl);
        const json = await res.json();
        if (!json.success) {
            seatMap.innerHTML = `<p class="text-red-500">${json.message}</p>`;
            return;
        }

        const data = json.data;
        suatChieuData = data;

        // Render thông tin phim
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
                        <span class="font-bold">${data.rap?.ten || ""}</span> - ${data.phong.ten}
                    </p>
                    <p class="text-gray-600 text-sm">
                        Suất: <span class="font-bold">${new Date(data.suat_chieu.bat_dau).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span> 
                        - <span class="font-bold">${new Date(data.suat_chieu.bat_dau).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'})}</span>
                    </p>
                </div>
            </div>
            <hr class="border-gray-200">
            <div id="selectedSeatsContainer"><div class="text-gray-500 text-sm">Chưa chọn ghế</div></div>
            <hr class="border-gray-200">
            <div class="flex flex-col gap-2">
                <div class="flex justify-between font-bold text-lg">
                    <span>Tổng cộng</span>
                    <span id="totalPrice">0 ₫</span>
                </div>
                <div id="continueContainer" class="mt-2 hidden">
                    <button id="continueBtn" class="w-full bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 transition">Tiếp tục</button>
                </div>
                <div id="thanhToanContainer" class="mt-2 hidden">
                    <button id="btnThanhToan" class="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition">Thanh toán</button>
                </div>
            </div>
        `;

        const selectedSeatsContainer = document.getElementById("selectedSeatsContainer");
        const totalPriceEl = document.getElementById("totalPrice");
        const continueContainer = document.getElementById("continueContainer");
        const thanhToanContainer = document.getElementById("thanhToanContainer");

        // Render chú thích loại ghế
        const seatTypes = {};
        data.phong.soDoGhe.forEach(ghe => {
            if (ghe.loai_ghe) seatTypes[ghe.loai_ghe.ten] = ghe.loai_ghe.ma_mau;
        });
        Object.keys(seatTypes).forEach(ten => {
            const div = document.createElement("div");
            div.className = "flex items-center gap-2";
            div.innerHTML = `<div class="w-12 h-12 rounded-xl shadow-md flex items-center justify-center text-white font-bold" style="background-color:${seatTypes[ten]}">${ten[0]}</div>
                             <span>${ten}</span>`;
            chuthichContainer.appendChild(div);
        });

        // Render sơ đồ ghế
        seatMap.style.gridTemplateColumns = `repeat(${data.phong.socot_ghe}, minmax(0, 1fr))`;
        data.phong.soDoGhe.forEach(ghe => {
            const seat = document.createElement("div");
            if (!ghe.loaighe_id) {
                seat.className = "w-12 h-12 rounded-xl bg-transparent"; 
                seatMap.appendChild(seat);
                return;
            }
            seat.textContent = ghe.so_ghe;
            seat.className = "flex items-center justify-center w-12 h-12 text-sm font-bold rounded-xl cursor-pointer transition transform hover:scale-105 select-none shadow-md";

            if (ghe.trang_thai === "giu_cho") {
                seat.classList.add("bg-gray-400", "text-white", "cursor-not-allowed", "shadow-inner");
            } else if (ghe.trang_thai === "da_dat") {
                seat.style.backgroundColor = "white"; 
                seat.innerHTML = "🎟️";
                seat.classList.add("text-white", "cursor-not-allowed", "shadow-inner");
            } else {
                seat.style.backgroundColor = ghe.loai_ghe.ma_mau;
                seat.classList.add("text-white", "hover:opacity-80");
                seat.dataset.gheId = ghe.id;
                seat.dataset.loaighe_id = ghe.loaighe_id;
                seat.dataset.ngay = data.suat_chieu.bat_dau.split(' ')[0];
                seat.dataset.dinhdang = data.phong.loai_phongchieu;

                seat.addEventListener("click", () =>
                    toggleSeat(seat, ghe.loai_ghe.ma_mau, selectedSeatsContainer, totalPriceEl, continueContainer)
                );
            }
            seatMap.appendChild(seat);
        });

        // Nút tiếp tục → hiển thị đồ ăn
        document.getElementById("continueBtn").addEventListener("click", () => {
            leftContainer.classList.add("hidden");
            foodContainer.classList.remove("hidden");
            continueContainer.classList.add("hidden");
            thanhToanContainer.classList.remove("hidden");

            // Load đồ ăn theo rạp
            loadFood(data.phong.id_rapphim)
        });
        function random9Digits() { return Math.floor(100000000 + Math.random() * 900000000); }
        // Nút thanh toán
        document.getElementById("btnThanhToan").addEventListener("click", async () => {
    try {
        const totalSeats = selectedSeats.reduce((sum, s) => sum + s.gia, 0);
        const totalFood = selectedFood.reduce((sum, f) => sum + f.gia, 0);
        const total = totalSeats + totalFood;

        // Tạo đơn hàng
        const maVe = random9Digits();
        const resDH = await fetch(`${baseUrl}/api/tao-don-hang`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                suat_chieu_id: suatChieuData.suat_chieu.id,
                tong_tien: total,
                ma_ve: maVe
            })
        }); 
        const jDH = await resDH.json();
        if (!jDH.success) throw new Error(jDH.message);
        const donhangId = jDH.data.id;

        // Tạo vé
        const resVe = await fetch(`${baseUrl}/api/tao-ve`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                donhang_id: donhangId,
                suat_chieu_id: suatChieuData.suat_chieu.id,
                seats: selectedSeats.map(s => ({ ghe_id: s.ghe_id }))
            })
        });
        const jVe = await resVe.json();
        if (!jVe.success) throw new Error(jVe.message);

        // Hiển thị QR
        foodContainer.classList.add("hidden");
        qrContainer.classList.remove("hidden");
        qrImage.src = `https://qr.sepay.vn/img?bank=TPBank&acc=10001198354&template=compact&amount=${total}&des=DH${donhangId}`;

        // Kiểm tra trạng thái thanh toán
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`${baseUrl}/api/lay-trang-thai`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ donhang_id: donhangId })
                });
                const status = await res.json();
                if (status.payment_status === "Paid") {
                    // Hiển thị thông báo thành công
                    movieInfo.classList.add("hidden");
                    qrContainer.classList.add("hidden");
                    foodContainer.classList.add("hidden");
                    success_pay_box.classList.remove("hidden");

                    clearInterval(interval);

                    // Gửi mail xác nhận
                    try {
                        const mailRes = await fetch(`${baseUrl}/api/gui-don-hang`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                don_hang: {
                                    ma_ve: jVe.data[0]?.ma_ve || "",
                                    qr: qrImage.src
                                },
                                phim: {
                                    rap: suatChieuData.rap.ten,
                                    ma_ve: maVe,
                                    dia_chi: suatChieuData.rap.dia_chi,
                                    ten_phim: suatChieuData.phim.ten_phim,
                                    phong: suatChieuData.phong.ten,
                                    suat_chieu: new Date(suatChieuData.suat_chieu.bat_dau)
                                        .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
                                        ' ' +
                                        new Date(suatChieuData.suat_chieu.bat_dau)
                                        .toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
                                },
                                ve: selectedSeats.map(s => ({ so_ghe: s.so_ghe, gia: s.gia })),
                                thuc_an: selectedFood
                            })
                        });
                        const mailJson = await mailRes.json();
                        console.log(mailJson.message);
                    } catch (e) {
                        console.error("Lỗi gửi mail:", e);
                    }
                }
            } catch (e) {
                console.log("Lỗi check trạng thái:", e);
            }
        }, 1000);

    } catch (e) {
        console.error("Lỗi thanh toán:", e);
    }
});

            
    } catch (err) {
        seatMap.innerHTML = `<p class="text-red-500">Lỗi khi tải dữ liệu: ${err.message}</p>`;
    }
}

// Toggle ghế
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
                    gia = parseInt(j.data);
                    seat.dataset.price = gia;
                }
            } catch (e) {
                console.error("Lỗi khi lấy giá ghế:", e);
            }
        }
        seat.classList.add("ring-4", "ring-red-600");
        selectedSeats.push({
            so_ghe: seatNum,
            ghe_id: seat.dataset.gheId,
            loaighe_id: seat.dataset.loaighe_id,
            gia
        });
    }
    updateSelectedSeats(selectedSeatsContainer, totalPriceEl, continueContainer);
}

// Cập nhật ghế đã chọn + tổng tiền
function updateSelectedSeats(selectedSeatsContainer, totalPriceEl, continueContainer) {
    // Xóa nội dung cũ
    selectedSeatsContainer.innerHTML = '';

    // Nếu chưa chọn ghế và chưa chọn sản phẩm
    if (selectedSeats.length === 0 && selectedFood.length === 0) {
        selectedSeatsContainer.innerHTML = '<div class="text-gray-500 text-sm">Chưa chọn ghế hoặc sản phẩm</div>';
        continueContainer.classList.add("hidden");
    } else {
        // Ghế
        selectedSeats.forEach(s => {
            const div = document.createElement("div");
            div.className = "flex justify-between mb-1 items-center";
            div.innerHTML = `
                <span>Ghế ${s.so_ghe}</span>
                <span>${s.gia.toLocaleString()} ₫</span>
            `;
            selectedSeatsContainer.appendChild(div);
        });

        // Sản phẩm
        selectedFood.forEach((f, index) => {
            const div = document.createElement("div");
            div.className = "flex justify-between mb-1 items-center";
            div.innerHTML = `
                <span>${f.ten} x${f.quantity}</span>
                <div class="flex items-center gap-2">
                    <span>${(f.gia * f.quantity).toLocaleString()} ₫</span>
                    <button class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs" data-index="${index}">Xóa</button>
                </div>
            `;
            selectedSeatsContainer.appendChild(div);

            // Thêm sự kiện xóa
            div.querySelector("button").addEventListener("click", () => {
                selectedFood.splice(index, 1); // xóa sản phẩm khỏi mảng
                updateSelectedSeats(selectedSeatsContainer, totalPriceEl, continueContainer); // cập nhật lại danh sách
            });
        });

        continueContainer.classList.remove("hidden");
    }

    // Tính tổng
    const totalSeats = selectedSeats.reduce((sum, s) => sum + s.gia, 0);
    const totalFood = selectedFood.reduce((sum, f) => sum + f.gia * f.quantity, 0);
    totalPriceEl.textContent = `${(totalSeats + totalFood).toLocaleString()} ₫`;
}



// Load đồ ăn theo rạp
async function loadFood(idRap) {
    // Reset container
    foodContainer.innerHTML = `<h2 class="text-lg font-bold mb-4">Chọn bắp & nước</h2>`;

    try {
        const res = await fetch(`${baseUrl}/api/lay-san-pham-khach/${idRap}`);
        const json = await res.json();

        if (!json.success || !json.data || json.data.length === 0) {
            const p = document.createElement("p");
            p.textContent = "Chưa có sản phẩm nào";
            foodContainer.appendChild(p);
            return;
        }

        json.data.forEach(sp => {
            const div = document.createElement("div");
            div.className = "flex justify-between items-center mb-4 p-2 border rounded-lg shadow-sm";

            // Tạo nội dung
            div.innerHTML = `
                <div class="flex items-center gap-3">
                    <img src="${urlMinio}/${sp.hinh_anh}" alt="${sp.ten}" class="w-16 h-16 object-cover rounded">
                    <div>
                        <div class="font-semibold">${sp.ten}</div>
                        <div class="text-sm text-gray-500">${sp.gia.toLocaleString()} ₫</div>
                    </div>
                </div>
                <button class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onclick="addFood(${sp.id}, ${sp.gia}, \`${sp.ten}\`)">
                    Thêm
                </button>
            `;
            foodContainer.appendChild(div);
        });

    } catch (e) {
        console.error("Lỗi load đồ ăn:", e);
        const p = document.createElement("p");
        p.textContent = "Lỗi khi tải sản phẩm";
        foodContainer.appendChild(p);
    }
}


// Hàm cập nhật tổng tiền riêng
function updateTotal() {
    const selectedSeatsContainer = document.getElementById("selectedSeatsContainer");
    const totalPriceEl = document.getElementById("totalPrice");

    // Xóa nội dung cũ
    selectedSeatsContainer.innerHTML = '';

    // Nếu chưa chọn ghế và chưa chọn sản phẩm
    if (selectedSeats.length === 0 && selectedFood.length === 0) {
        selectedSeatsContainer.innerHTML = '<div class="text-gray-500 text-sm">Chưa chọn ghế hoặc sản phẩm</div>';
        continueContainer.classList.add("hidden");
    } else {
        // Ghế
        selectedSeats.forEach(s => {
            const div = document.createElement("div");
            div.className = "flex justify-between mb-1 items-center";
            div.innerHTML = `
                <span>Ghế ${s.so_ghe}</span>
                <span>${s.gia.toLocaleString()} ₫</span>
            `;
            selectedSeatsContainer.appendChild(div);
        });

        // Sản phẩm
        selectedFood.forEach((f, index) => {
            const div = document.createElement("div");
            div.className = "flex justify-between mb-1 items-center";
            div.innerHTML = `
                <span>${f.ten} x${f.quantity}</span>
                <div class="flex items-center gap-2">
                    <span>${(f.gia * f.quantity).toLocaleString()} ₫</span>
                    <button class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs" data-index="${index}">Xóa</button>
                </div>
            `;
            selectedSeatsContainer.appendChild(div);

            // Thêm sự kiện xóa
            div.querySelector("button").addEventListener("click", () => {
                selectedFood.splice(index, 1);
                updateTotal(); // gọi lại hàm cập nhật
            });
        });

        continueContainer.classList.add("hidden");
    }

    // Tính tổng
    const totalSeats = selectedSeats.reduce((sum, s) => sum + s.gia, 0);
    const totalFood = selectedFood.reduce((sum, f) => sum + f.gia * f.quantity, 0);
    totalPriceEl.textContent = `${(totalSeats + totalFood).toLocaleString()} ₫`;
}

// Thêm đồ ăn
function addFood(id, gia, ten) {
    const exist = selectedFood.find(f => f.id === id);
    if (!exist) selectedFood.push({ id, gia, ten, quantity: 1 });
    else exist.quantity++;
    
    // Chỉ gọi hàm cập nhật tổng tiền
    updateTotal();
}

loadSeats();
</script>

</body>
</html>
