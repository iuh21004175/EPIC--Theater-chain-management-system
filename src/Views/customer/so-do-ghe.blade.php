<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sơ đồ ghế</title>
  <link rel="stylesheet" href="{{$_ENV['URL_WEB_BASE']}}/css/tailwind.css">
</head>
<body class="bg-gray-50 text-gray-800 font-sans">
@include('customer.layout.header')

<div id="thongTinPhim" class="flex flex-col md:flex-row max-w-6xl mx-auto px-4 mt-10">
    
</div>

<div class="flex flex-col md:flex-row max-w-6xl mx-auto px-4 mt-10 mb-10">
    
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
        <p id="countdownTimer" class="mt-4 text-center text-red-600 font-bold text-lg"></p>
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

        <div id="ticket_detail_box" class="mt-4"></div>
    </div>

    <!-- Bên phải: Thông tin phim + ghế đã chọn + tổng cộng -->
    <div id="movieInfo" class="w-full md:w-96 bg-white rounded-lg shadow-lg p-6 flex flex-col gap-4">
        <!-- Nội dung sẽ render bằng JS -->
    </div>
</div>
@include('customer.layout.footer')
<script>
const seatMap = document.getElementById("seatMap");
const chuthichContainer = document.getElementById("chuthich");
const movieInfo = document.getElementById("movieInfo");
const foodContainer = document.getElementById("foodContainer");
const qrContainer = document.getElementById("qrContainer");
const qrImage = document.getElementById("qrImage");
const success_pay_box = document.getElementById("success_pay_box");
const leftContainer = document.getElementById("leftContainer");
const thongTinPhim = document.getElementById("thongTinPhim");

const urlMinio = "{{ $_ENV['MINIO_SERVER_URL'] }}";

let selectedSeats = [];
let selectedFood = [];
let suatChieuData = null;
let selectedGiftCard = null;

// Giải mã base64 và lấy id phòng
function base64Decode(str) {
    return decodeURIComponent(escape(atob(str)));
}

function startCountdown(duration, donhangId) {
    const countdownEl = document.getElementById("countdownTimer");
    const soDoGheUrl = window.location.href;
    let time = duration; // tính bằng giây
    const interval = setInterval(() => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        countdownEl.textContent = `Thời gian còn lại: ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
        time--;

        // Hết giờ thì quay về trang chủ
        if (time < 0) {
            clearInterval(interval);
            alert("Hết thời gian thanh toán. Vui lòng đặt lại!");
            window.location.href = soDoGheUrl; // quay về trang sơ đồ ghế
        }
    }, 1000);
}
const pathParts = window.location.pathname.split("/");
const slugWithId = pathParts[pathParts.length - 1];
const decoded = base64Decode(slugWithId);
const idPhong = decoded.replace(salt, "");

const apiUrl = `${baseUrl}/api/so-do-ghe/${idPhong}`;


    function slugify(str) {
        return str
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // bỏ dấu tiếng Việt
            .replace(/[^a-z0-9]+/g, "-") // thay ký tự đặc biệt thành "-"
            .replace(/^-+|-+$/g, ""); // bỏ dấu - thừa
    }

    function base64Encode(str) {
        return btoa(unescape(encodeURIComponent(str)));
    }
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
        const encoded = base64Encode(data.phim.id + salt);
        thongTinPhim.innerHTML = `
            <nav class="text-gray-600 text-sm mb-4" aria-label="Breadcrumb">
                <ol class="list-reset flex">
                    <li><a href="${baseUrl}" class="text-blue-600 hover:underline">Trang chủ</a></li>
                    <li><span class="mx-2">/</span></li>
                    <li><a href="${baseUrl}/dat-ve/${slugify(data.phim.ten_phim)}-${encoded}" class="text-blue-600 hover:underline">Đặt vé</a></li>
                    <li><span class="mx-2">/</span></li>
                    <li class="text-gray-500">${data.phim.ten_phim}</li>
                </ol>
            </nav>
        `;
        // Render thông tin phim
        movieInfo.innerHTML = `
            <div class="flex gap-4">
                <img src="${urlMinio}/${data.phim.poster_url}" alt="Poster phim" class="w-24 h-32 object-cover rounded">
                <div class="flex-1 flex flex-col justify-between">
                    <div>
                        <h2 class="text-lg font-bold">${data.phim.ten_phim}</h2>
                        <p class="text-gray-500">${data.phong.loai_phongchieu.toUpperCase() } Phụ Đề - 
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
                <div id="giftCardContainer" class="mt-2 hidden">
                    <select id="giftCardSelect" class="w-full p-2 border rounded text-center">
                        <option value="">Chọn thẻ quà tặng</option>
                    </select>
                    <p id="giftMsg" class="mt-2 text-center text-red-600 font-semibold"></p>
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
        const giftCardContainer = document.getElementById("giftCardContainer");

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

            if (ghe.trang_thai === 1) {
                seat.classList.add("bg-gray-400", "text-white", "cursor-not-allowed", "shadow-inner");
            } else if (ghe.trang_thai === 2) {
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
            giftCardContainer.classList.remove("hidden");
            // Load đồ ăn theo rạp
            loadFood(data.phong.id_rapphim);
            loadGiftCards();
        });
        function random9Digits() { return Math.floor(100000000 + Math.random() * 900000000); }
        // Nút thanh toán
        document.getElementById("btnThanhToan").addEventListener("click", async () => {
            try {
                const totalSeats = selectedSeats.reduce((sum, s) => sum + s.gia, 0);
                const totalFood = selectedFood.reduce((sum, f) => sum + f.gia * f.quantity, 0);
                const totalBefore = totalSeats + totalFood;

                // Trừ gift card nếu có
                let total = totalBefore;
                let usedGiftAmount = 0;
                
                if (selectedGiftCard) {
                    usedGiftAmount = selectedGiftCard.used; // số tiền dùng
                    total = totalBefore - usedGiftAmount;
                    if (total < 0) total = 0;
                }

                const trangThai = (total === 0) ? 2 : 1; // 2 = đã đặt, 1 = giữ chỗ
                // Tạo đơn hàng
                const maVe = random9Digits();
                const resDH = await fetch(`${baseUrl}/api/tao-don-hang`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        suat_chieu_id: suatChieuData.suat_chieu.id,
                        thequatang_id: selectedGiftCard ? selectedGiftCard.id : null,
                        the_qua_tang_su_dung: usedGiftAmount,
                        tong_tien: totalBefore, // tổng trước khi giảm
                        ma_ve: maVe,
                        trang_thai: trangThai
                    })
                });
                const jDH = await resDH.json();
                if (!jDH.success) throw new Error(jDH.message);
                const donhangId = jDH.data.id;

                const trangThaiVe = (total === 0) ? 2 : 1; 
                // Tạo vé
                const resVe = await fetch(`${baseUrl}/api/tao-ve`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        donhang_id: donhangId,
                        suat_chieu_id: suatChieuData.suat_chieu.id,
                        trang_thai: trangThaiVe,
                        seats: selectedSeats.map(s => ({
                            ghe_id: s.ghe_id,
                            gia_ve: s.gia
                        }))
                    })
                });
                const jVe = await resVe.json();
                if (!jVe.success) throw new Error(jVe.message);

                // Tạo chi tiết đơn hàng
                for (const f of selectedFood) {
                    const resSP = await fetch(`${baseUrl}/api/tao-chi-tiet-don-hang`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            donhang_id: donhangId,
                            sanpham_id: f.id,
                            so_luong: f.quantity,
                            don_gia: f.gia,
                            thanh_tien: f.gia * f.quantity
                        })
                    });
                    const jSP = await resSP.json();
                    if (!jSP.success) throw new Error(jSP.message || "Lỗi lưu chi tiết đơn hàng");
                }

                // Nếu có gift card thì cập nhật DB
                if (selectedGiftCard && usedGiftAmount > 0) {
                    const remaining = selectedGiftCard.amount - usedGiftAmount;
                    await fetch(`${baseUrl}/api/sua-gia-tri-the`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            id: selectedGiftCard.id,
                            gia_tri: remaining   // cập nhật còn lại chứ không phải số đã dùng
                        })
                    });
                }

                if (total === 0) {
                    // Trường hợp thanh toán = 0 (chỉ dùng gift card) → hiển thị thành công ngay
                    movieInfo.classList.add("hidden");
                    qrContainer.classList.add("hidden");
                    foodContainer.classList.add("hidden");
                    success_pay_box.classList.remove("hidden");

                    await handlePaymentSuccess(donhangId);

                    // Gửi mail xác nhận luôn
                    await fetch(`${baseUrl}/api/gui-don-hang`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            don_hang: { ma_ve: maVe },
                            phim: {
                                rap: suatChieuData.rap.ten,
                                ma_ve: maVe,
                                dia_chi: suatChieuData.rap.dia_chi,
                                ten_phim: suatChieuData.phim.ten_phim,
                                phong: suatChieuData.phong.ten,
                                suat_chieu:
                                    new Date(suatChieuData.suat_chieu.bat_dau).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
                                    " " +
                                    new Date(suatChieuData.suat_chieu.bat_dau).toLocaleDateString("vi-VN", {
                                        weekday: "long",
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric"
                                    })
                            },
                            ve: selectedSeats.map(s => ({ so_ghe: s.so_ghe, gia: s.gia })),
                            thuc_an: selectedFood.map(f => ({
                                ten: f.ten,
                                so_luong: f.quantity,
                                gia: f.gia,
                                tong: f.gia * f.quantity
                            }))
                        })
                    });
                } else {
                    // Vẫn phải thanh toán → hiện QR như bình thường
                    foodContainer.classList.add("hidden");
                    qrContainer.classList.remove("hidden");
                    thanhToanContainer.classList.add("hidden");
                    qrImage.src = `https://qr.sepay.vn/img?bank=TPBank&acc=10001198354&template=compact&amount=${total}&des=DH${donhangId}`;
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
                                movieInfo.classList.add("hidden");
                                qrContainer.classList.add("hidden");
                                foodContainer.classList.add("hidden");
                                success_pay_box.classList.remove("hidden");
                                clearInterval(interval);

                                await handlePaymentSuccess(donhangId);

                                // Gửi mail sau khi thanh toán
                                await fetch(`${baseUrl}/api/gui-don-hang`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        don_hang: { ma_ve: maVe },
                                        phim: {
                                            rap: suatChieuData.rap.ten,
                                            ma_ve: maVe,
                                            dia_chi: suatChieuData.rap.dia_chi,
                                            ten_phim: suatChieuData.phim.ten_phim,
                                            phong: suatChieuData.phong.ten,
                                            suat_chieu:
                                                new Date(suatChieuData.suat_chieu.bat_dau).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
                                                " " +
                                                new Date(suatChieuData.suat_chieu.bat_dau).toLocaleDateString("vi-VN", {
                                                    weekday: "long",
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric"
                                                })
                                        },
                                        ve: selectedSeats.map(s => ({ so_ghe: s.so_ghe, gia: s.gia })),
                                        thuc_an: selectedFood.map(f => ({
                                            ten: f.ten,
                                            so_luong: f.quantity,
                                            gia: f.gia,
                                            tong: f.gia * f.quantity
                                        }))
                                    })
                                });
                            }
                        } catch (e) {
                            console.log("Lỗi check trạng thái:", e);
                        }
                    }, 1000);
                }
            } catch (e) {
                console.error("Lỗi thanh toán:", e);
            }
        });

            
        } catch (err) {
            seatMap.innerHTML = `<p class="text-red-500">Lỗi khi tải dữ liệu: ${err.message}</p>`;
        }
}

async function handlePaymentSuccess(donhangId) {
  try {
    // Hiện box thanh toán thành công
    const successBox = document.getElementById("success_pay_box");
    successBox.classList.remove("hidden");
    successBox.classList.add("opacity-100");

    // Gọi API lấy chi tiết đơn hàng
    const res = await fetch(`${baseUrl}/api/doc-chi-tiet-don-hang/${donhangId}`);
    if (!res.ok) throw new Error(`HTTP lỗi ${res.status}`);

    const data = await res.json();
    const ve = Array.isArray(data.data) ? data.data[0] : data.data;

    // Chuẩn bị dữ liệu
    const startTime = ve?.ve?.[0]?.suat_chieu?.batdau ? new Date(ve.ve[0].suat_chieu.batdau) : null;
    const isCancelled = ve.trang_thai === "cancelled";
    const canCancel = ve.trang_thai === "paid"; // tuỳ bạn quy định trạng thái

    // Tạo HTML chi tiết vé
    let html = `
      <div class="relative ${isCancelled ? 'modal-cancelled' : ''} space-y-2 p-2 max-h-[80vh] overflow-y-auto">
        ${isCancelled ? `<div class="modal-cancelled-overlay"><span>Đã hoàn vé</span></div>` : ''}
        <div class="p-3 bg-white rounded shadow">a
          <h5 class="font-bold text-lg flex items-center gap-2">
            ${ve.ve?.[0]?.suat_chieu?.phim?.ten_phim || 'Không xác định'}
            <span class="inline-block px-2 py-0.5 text-xs font-semibold text-white bg-red-500 rounded">
              ${ve.ve?.[0]?.suat_chieu?.phim?.do_tuoi || 'C'}
            </span>
          </h5>
        </div>
        <div class="p-3 bg-white rounded shadow text-sm text-gray-700 grid grid-cols-2 gap-4">
          <div class="space-y-1">
            <p><span class="font-semibold">Rạp:</span> ${ve.ve?.[0]?.suat_chieu?.phong_chieu?.rap_chieu_phim?.ten || '-'}</p>
            <p><span class="font-semibold">Phòng:</span> ${ve.ve?.[0]?.suat_chieu?.phong_chieu?.ten || '-'}</p>
            <p><span class="font-semibold">Loại phòng:</span> ${(ve.ve?.[0]?.suat_chieu?.phong_chieu?.loai_phongchieu || '-').toUpperCase()}</p>
          </div>
          <div class="space-y-1">
            <p><span class="font-semibold">Ngày chiếu:</span> ${startTime ? startTime.toLocaleDateString('vi-VN',{ weekday:'long', day:'2-digit', month:'2-digit', year:'numeric' }) : '-'}</p>
            <p><span class="font-semibold">Thời gian:</span> 
              ${startTime ? startTime.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'}) : '-'} - 
              ${ve.ve?.[0]?.suat_chieu?.ketthuc ? new Date(ve.ve[0].suat_chieu.ketthuc).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'}) : '-'}
            </p>
            <p><span class="font-semibold">Tổng tiền:</span> ${Number(ve.tong_tien || 0).toLocaleString()} ₫</p>
          </div>
        </div>
        <div class="p-2 bg-white rounded shadow text-sm">
          <span class="font-semibold">Ghế:</span> <span>${ve.ve?.map(v=>v.ghe?.so_ghe).filter(Boolean).join(', ') || '-'}</span>
        </div>
        <div class="p-3 bg-white rounded shadow text-sm text-gray-700 grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <div>
              <h4 class="font-semibold mb-1">Thức ăn kèm:</h4>
              ${ve.ve?.flatMap(v=>v.don_hang?.chi_tiet_don_hang||[]).map(item=>`
                <div class="flex justify-between border-b border-gray-100 py-1">
                  <span>${item.san_pham?.ten || '-'} x ${item.so_luong || 0}</span>
                  <span class="font-semibold">${Number(item.thanh_tien || 0).toLocaleString()} ₫</span>
                </div>`).join('') || '<p>Không có</p>'}
            </div>
            <div>
              <h4 class="font-semibold mb-1">Thẻ quà tặng:</h4>
              <div class="flex justify-between border-b border-gray-100 py-1">
                ${ve.the_qua_tang_su_dung > 0 ? `<span>${Number(ve.the_qua_tang_su_dung || 0).toLocaleString()} ₫</span>` : '<span>Không có</span>'}
              </div>
            </div>
          </div>
          <div class="flex flex-col items-center gap-1">
            <span class="font-semibold text-sm">Mã vé</span>
            <span class="text-blue-600 font-mono text-base">${ve.ma_ve || '-'}</span>
            <img src="${ve.qr_code || ''}" alt="QR Code" class="w-24 h-24 ${ve.qr_code ? '' : 'hidden'}">
          </div>
        </div>
        ${canCancel ? `
          <div class="p-2 bg-white rounded shadow text-sm">
            <button id="btnCancelTicket" class="w-full bg-red-600 text-white px-3 py-2 rounded">Hoàn vé</button>
          </div>` : ''
        }
      </div>
      <div class="bg-red-600 text-white p-2 bg-white rounded shadow text-sm mt-2">
            <button onclick="window.location.href=baseUrl" 
                    class="w-full bg-red-600 text-white px-3 py-2 rounded">
                Quay về trang chủ
            </button>
    </div>
    `;

    // Chèn vào dưới success_pay_box
    document.getElementById("ticket_detail_box").innerHTML = html;

  } catch (err) {
    console.error(err);
    alert("Lỗi khi lấy chi tiết vé.");
  }
}

// Load danh sách thẻ quà tặng từ DB
async function loadGiftCards() {
    try {
        const res = await fetch(`${baseUrl}/api/doc-the-qua-tang`);
        const json = await res.json();
        if (!json.success || !json.data) return;

        const select = document.getElementById("giftCardSelect");

        // xóa option cũ (nếu có)
        select.innerHTML = '<option value="">Chọn thẻ quà tặng</option>';

        json.data.forEach(card => {
            const option = document.createElement("option");
            option.value = card.id;
            option.textContent = card.ten
                ? `${card.ten} - Giảm ${Number(card.gia_tri).toLocaleString()} ₫`
                : `Giảm ${Number(card.gia_tri).toLocaleString()} ₫`;
            option.dataset.value = String(card.gia_tri);
            select.appendChild(option);
        });

        select.addEventListener("change", () => {
            const opt = select.selectedOptions[0];
            if (!opt || !opt.value) {
                // hủy chọn thẻ
                selectedGiftCard = null;
                applyGift(null, 0);
                return;
            }
            const id = opt.value;
            const val = parseInt(opt.dataset.value, 10) || 0;
            applyGift(id, val);
        });
    } catch (e) {
        console.error("Lỗi load gift card:", e);
    }
}


// Áp dụng thẻ quà tặng
function applyGift(cardId, amount) {
    const totalSeats = selectedSeats.reduce((sum, s) => sum + s.gia, 0);
    const totalFood = selectedFood.reduce((sum, f) => sum + f.gia * f.quantity, 0);
    const totalBefore = totalSeats + totalFood;

    let total = totalBefore;
    let used = 0; 

    if (amount > 0 && cardId) {
        if (amount >= totalBefore) {
            used = totalBefore;
            total = 0;
        } else {
            used = amount;
            total = totalBefore - amount;
        }

        document.getElementById("giftMsg").textContent =
            `Đã áp dụng thẻ quà tặng giảm ${used.toLocaleString()} ₫`;

        selectedGiftCard = {
            id: cardId,
            amount: amount,     // giá trị gốc
            used: used,         // đã dùng
            remaining: amount - used // số dư còn lại
        };
    } else {
        document.getElementById("giftMsg").textContent = "";
        selectedGiftCard = null;
    }

    document.getElementById("totalPrice").textContent = `${total.toLocaleString()} ₫`;
}


// Toggle ghế
async function toggleSeat(seat, baseColor, selectedSeatsContainer, totalPriceEl, continueContainer) {
    const seatNum = seat.textContent;

    if (seat.classList.contains("ring-4")) {
        // Bỏ chọn ghế
        seat.style.backgroundColor = baseColor;
        seat.classList.remove("ring-4", "ring-red-600");
        selectedSeats = selectedSeats.filter(s => s.so_ghe !== seatNum);
    } else {
        // Lấy giá ghế
        let gia = seat.dataset.price ? parseInt(seat.dataset.price) : 0;

        if (!gia || gia === 0) {
            const ngay = seat.dataset.ngay;
            const dinhDangPhim = seat.dataset.dinhdang;
            const loaiGheId = seat.dataset.loaighe_id;

            try {
                const res = await fetch(`${baseUrl}/api/tinh-gia-ve/${loaiGheId}/${ngay}/${encodeURIComponent(dinhDangPhim)}`);
                const j = await res.json();
                if (j.success) {
                    gia = parseInt(j.data);
                    seat.dataset.price = gia; // lưu lại giá vào dataset
                } else {
                    console.error("Không lấy được giá:", j);
                }
            } catch (e) {
                console.error("Lỗi khi lấy giá ghế:", e);
            }
        }

        if (!gia || gia === 0) {
            alert("Không thể lấy giá vé. Vui lòng thử lại!");
            return; // tránh push giá 0 vào selectedSeats
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
        selectedSeatsContainer.innerHTML = '<div class="text-gray-500 text-sm">Chưa chọn ghế</div>';
        continueContainer.classList.add("hidden");
    } 
    if (selectedSeats.length > 8) {
            alert("Bạn chỉ được chọn tối đa 8 ghế!");
            return;
    }
    else {
        // Xử lý ghế: gom nhóm theo giá
        const groupedSeats = selectedSeats.reduce((acc, seat) => {
            const key = seat.gia; // có thể đổi thành seat.loai_ghe nếu muốn gom theo loại ghế
            if (!acc[key]) {
                acc[key] = { gia: seat.gia, ghe: [] };
            }
            acc[key].ghe.push(seat.so_ghe);
            return acc;
        }, {});

        Object.values(groupedSeats).forEach(group => {
            const div = document.createElement("div");
            div.className = "flex justify-between mb-1 items-center";
            div.innerHTML = `
                <span>Ghế ${group.ghe.join(", ")}</span>
                <span>${(group.gia * group.ghe.length).toLocaleString()} ₫</span>
            `;
            selectedSeatsContainer.appendChild(div);
        });

        // Xử lý sản phẩm 
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

function updateSelectedSeat(selectedSeatsContainer, totalPriceEl, continueContainer) {
    // Xóa nội dung cũ
    selectedSeatsContainer.innerHTML = '';

    // Nếu chưa chọn ghế và chưa chọn sản phẩm
    if (selectedSeats.length === 0 && selectedFood.length === 0) {
        selectedSeatsContainer.innerHTML = '<div class="text-gray-500 text-sm">Chưa chọn ghế</div>';
        continueContainer.classList.add("hidden");
    } else {
        // Xử lý ghế: gom nhóm theo giá
        const groupedSeats = selectedSeats.reduce((acc, seat) => {
            const key = seat.gia; // có thể đổi thành seat.loai_ghe nếu muốn gom theo loại ghế
            if (!acc[key]) {
                acc[key] = { gia: seat.gia, ghe: [] };
            }
            acc[key].ghe.push(seat.so_ghe);
            return acc;
        }, {});

        Object.values(groupedSeats).forEach(group => {
            const div = document.createElement("div");
            div.className = "flex justify-between mb-1 items-center";
            div.innerHTML = `
                <span>Ghế ${group.ghe.join(", ")}</span>
                <span>${(group.gia * group.ghe.length).toLocaleString()} ₫</span>
            `;
            selectedSeatsContainer.appendChild(div);
        });

        // Xử lý sản phẩm 
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

        continueContainer.classList.add("hidden");
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

            div.innerHTML = `
                <div class="flex items-center gap-3">
                    <img src="${urlMinio}/${sp.hinh_anh}" alt="${sp.ten}" class="w-16 h-16 object-cover rounded">
                    <div>
                        <div class="font-semibold">${sp.ten}</div>
                        <div class="text-sm text-gray-500">${sp.gia.toLocaleString()} ₫</div>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <button class="px-3 py-1 bg-gray-300 rounded minusBtn">-</button>
                    <span class="font-bold quantity">0</span>
                    <button class="px-3 py-1 bg-gray-300 text-white rounded plusBtn">+</button>
                </div>
            `;

            const minusBtn = div.querySelector(".minusBtn");
            const plusBtn = div.querySelector(".plusBtn");
            const quantityEl = div.querySelector(".quantity");

            let quantity = 0;

            plusBtn.addEventListener("click", () => {
                quantity++;
                quantityEl.textContent = quantity;

                // update selectedFood
                const existing = selectedFood.find(f => f.id === sp.id);
                if (existing) {
                    existing.quantity = quantity;
                } else {
                    selectedFood.push({ id: sp.id, ten: sp.ten, gia: sp.gia, quantity });
                }
                updateSelectedSeat(
                    document.getElementById("selectedSeatsContainer"),
                    document.getElementById("totalPrice"),
                    continueContainer
                );
            });

            minusBtn.addEventListener("click", () => {
                if (quantity > 0) {
                    quantity--;
                    quantityEl.textContent = quantity;

                    const existing = selectedFood.find(f => f.id === sp.id);
                    if (existing) {
                        existing.quantity = quantity;
                        if (quantity === 0) {
                            selectedFood = selectedFood.filter(f => f.id !== sp.id);
                        }
                    }
                    updateSelectedSeat(
                        document.getElementById("selectedSeatsContainer"),
                        document.getElementById("totalPrice"),
                        continueContainer
                    );
                }
            });

            foodContainer.appendChild(div);
        });
    } catch (e) {
        console.error("Lỗi load food:", e);
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
loadGiftCards();
</script>

</body>
</html>
