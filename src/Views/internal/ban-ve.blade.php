@extends('internal.layout')

@section('title', 'Bán vé rạp phim')

@section('breadcrumbs')
<li>
    <div class="flex items-center">
        <svg class="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
        <span class="ml-1 text-gray-500 hover:text-gray-700 text-sm font-medium">Bán vé</span>
    </div>
</li>
@endsection

@section('content')
    <div class="px-4 py-6 max-w-5xl mx-auto">

        <h2 class="text-2xl font-bold mb-6 text-center text-red-600">Bán vé cho nhân viên</h2>

        <!-- Chọn ngày -->
        <div class="mb-4 flex items-center gap-2">
            <button id="prevDay" class="px-2 py-1 border rounded">«</button>
            <div id="dayTabs" class="flex gap-2 overflow-x-auto"></div>
            <button id="nextDay" class="px-2 py-1 border rounded">»</button>
        </div>

        <div id="step-movie" class="mb-6 max-w-5xl mx-auto">
        <h3 class="font-semibold mb-4 text-lg">Chọn phim</h3>
        <div id="danhSachPhim" class="grid grid-cols-3 gap-4"></div>
        <div id="loadSuatChieu" class="mt-4 hidden"></div>
    </div>

    <!-- Bước 3: Chọn ghế -->
    <div id="step-seat" class="mb-6 p-6 bg-white rounded-xl shadow-md hidden max-w-5xl mx-auto">
        <h2 class="text-2xl font-bold mb-6 text-red-600 text-center">Chọn ghế</h2>
        <div class="text-center mb-6">
            <div class="bg-gray-300 text-gray-700 font-semibold py-2 rounded-md">MÀN HÌNH</div>
        </div>
        <div id="seatContainer" class="grid gap-3"></div>
        <div class="mt-6 p-4 border rounded-md bg-gray-50">
            <p class="font-medium">Ghế đã chọn:</p>
            <p id="selected-seats" class="text-red-600 font-semibold">Chưa chọn</p>
        </div>
    </div>
    
    <!-- Bước 4: Combo bắp nước -->
    <div id="step-combo" class="mb-6 p-4 border rounded shadow bg-white hidden">
        <h3 class="font-semibold mb-2 text-lg">Chọn combo bắp nước</h3>
        <div id="foodContainer" class="grid grid-cols-2 gap-4"></div>
    </div>


    <!-- Bước 5: Summary -->
    <div id="step-summary" class="mb-6 p-4 border rounded shadow bg-gray-50 hidden">
        <h3 class="font-semibold mb-2 text-lg">Tóm tắt đơn hàng</h3>
        <ul id="order-summary" class="text-sm text-gray-700"></ul>
        <p class="font-bold mt-2">Tổng tiền: <span id="total-price">0 đ</span></p>
    </div>
    
    <!-- Bước 6: Chọn phương thức thanh toán -->
    <div id="step-payment" class="mb-6 p-4 border rounded shadow bg-white hidden">
        <h3 class="font-semibold mb-2 text-lg">Chọn phương thức thanh toán</h3>
        <div class="flex gap-4">
            <label class="flex items-center gap-2 border rounded p-2 cursor-pointer hover:bg-gray-100">
                <input type="radio" name="paymentMethod" value="cash" class="payment-radio">
                <span>Tiền mặt</span>
            </label>
            <label class="flex items-center gap-2 border rounded p-2 cursor-pointer hover:bg-gray-100">
                <input type="radio" name="paymentMethod" value="qr" class="payment-radio">
                <span>QR</span>
            </label>
        </div>
    </div>

    <div id="qrContainer" class="flex-1 transition-opacity duration-500 bg-white rounded-lg shadow-lg p-6 hidden">
        <h2 class="text-lg  text-center font-bold mb-4">Quét mã QR để thanh toán</h2>
        <img id="qrImage" src="" alt="QR Thanh toán" class="mx-auto mb-10">
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
    </div>


    <div class="text-center">
        <button id="confirm-btn" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 hidden">Xác nhận bán vé</button>
    </div>
</div>
<?php
 $idRap = $_SESSION['UserInternal']['ID_RapPhim'] ?? null;
?>
<script>
document.addEventListener('DOMContentLoaded', () => {

    const idRap = <?php echo $idRap !== null ? (int)$idRap : 'null'; ?>;
    const baseUrl = "{{ $_ENV['URL_WEB_BASE'] }}";
    const urlMinio = "{{ $_ENV['MINIO_SERVER_URL'] }}";

    const dayTabs = document.getElementById('dayTabs');
    const nextBtn = document.getElementById('nextDay');
    const prevBtn = document.getElementById('prevDay');
    const foodContainer = document.getElementById('foodContainer');
    const qrContainer = document.getElementById("qrContainer");
    const qrImage = document.getElementById("qrImage");
    const success_pay_box = document.getElementById("success_pay_box");

    let startDate = new Date(), visibleDays=11, currentStartIndex=0;
    let allDays = Array.from({length:30},(_,i)=>{
        let d=new Date(startDate);
        d.setDate(d.getDate()+i);
        return d;
    });

    function formatDate(d){ return ("0"+d.getDate()).slice(-2)+"/"+("0"+(d.getMonth()+1)).slice(-2); }
    function formatWeekday(d){ return ["CN","Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7"][d.getDay()]; }

    let activeIndex = 0; // chỉ số ngày đang chọn

    function getSelectedDate() {
        const d = allDays[activeIndex] || new Date();
        return d.getFullYear() + "-" + ("0" + (d.getMonth()+1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
    }

    function renderDays(){
        dayTabs.innerHTML='';
        for(let i=currentStartIndex;i<currentStartIndex+visibleDays;i++){
            if(!allDays[i]) continue;
            const btn=document.createElement('button');
            btn.className='flex-shrink-0 text-center px-4 py-2 rounded-lg border border-gray-300 font-semibold text-gray-700 hover:bg-red-500 hover:text-white transition-colors';
            btn.innerHTML=`${formatWeekday(allDays[i])}<br>${formatDate(allDays[i])}`;

            // Nếu là ngày đang active thì tô đỏ luôn
            if (i === activeIndex) {
                btn.classList.add('bg-red-600', 'text-white');
            }

            btn.addEventListener('click', ()=>{ 
                activeIndex = i; // cập nhật ngày đã chọn
                dayTabs.querySelectorAll('button').forEach(b=>{
                    b.classList.remove('bg-red-600','text-white');
                    
                }); 
                btn.classList.add('bg-red-600','text-white'); 

                // In ra ngày đã chọn
                console.log("Ngày đã chọn:", getSelectedDate());
                // Ví dụ: gọi API load phim theo rạp và ngày
                fetchPhimTheoRap(idRap, getSelectedDate());
            });
            dayTabs.appendChild(btn);
        }
        const firstBtn = dayTabs.querySelector('button');
        if(firstBtn){ 
            firstBtn.classList.add('bg-red-600','text-white'); 
            activeIndex = currentStartIndex; 
            console.log("Ngày mặc định:", getSelectedDate());
            // Có thể fetch phim ngay từ đầu
            fetchPhimTheoRap(idRap, getSelectedDate());
        }
    }
    nextBtn.addEventListener('click',()=>{ if(currentStartIndex+visibleDays<allDays.length){currentStartIndex++; renderDays();} });
    prevBtn.addEventListener('click',()=>{ if(currentStartIndex>0){currentStartIndex--; renderDays();} });
    renderDays();


    // Load phim theo rạp + ngày
    async function fetchPhimTheoRap(idRap, ngay) {
        try {
        const res = await fetch(`${baseUrl}/api/phim-theo-rap/${idRap}?ngay=${ngay}`);
        const data = await res.json();
        const listPhim = document.getElementById('danhSachPhim');
        listPhim.innerHTML = '';

        if (data.success && data.data && data.data.length > 0) {
            data.data.forEach(phim => {
            const phimHTML = `
                <div class="group relative cursor-pointer border rounded p-4 text-center hover:shadow-lg" data-movie="${phim.id}" data-name="${phim.ten_phim}">
                    <img src="${urlMinio}/${phim.poster_url}"  alt="${phim.ten_phim}"  class="mx-auto mb-2">
                    <h4 class="font-semibold">${phim.ten_phim}</h4>
                </div>
            `;
            listPhim.insertAdjacentHTML('beforeend', phimHTML);
            });
            attachMovieClickEvents();
        } else {
            // Nếu không có phim thì hiện thông báo
            listPhim.innerHTML = `
            <div class="col-span-full py-10 text-gray-500 font-semibold">
                Hiện tại chưa có phim nào được chiếu trong ngày này.
            </div>
            `;
        }
        } catch (err) {
        console.error('Lỗi load phim theo rạp:', err);
        const listPhim = document.getElementById('listPhim');
        listPhim.innerHTML = `
            <div class="col-span-full text-center py-10 text-red-500 font-semibold">
            Lỗi khi tải danh sách phim. Vui lòng thử lại sau.
            </div>
        `;
        }
    }

    const stepSeat = document.getElementById('step-seat');
    const stepCombo = document.getElementById('step-combo');
    const stepSummary = document.getElementById('step-summary');
    const stepPayment = document.getElementById('step-payment');
    const confirmBtn = document.getElementById('confirm-btn');
    const orderSummary = document.getElementById('order-summary');
    const totalPriceEl = document.getElementById('total-price');
    // const seatPrice =  0;
    let selectedSeats = []; 
    let selectedFood = [];
    
    function loadSuatChieu(idPhim, movieName) {
        const selectedDate = getSelectedDate();
        fetch(`${baseUrl}/api/suat-chieu-khach?ngay=${selectedDate}&id_phim=${idPhim}&id_rapphim=${idRap}`)
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
            loadSuatChieuEl.innerHTML = `<p class="text-gray-500 font-semibold">Chưa có suất chiếu trong ngày.</p>`;
            loadSuatChieuEl.classList.remove('hidden');
            return;
        }

        // Nhóm theo Rạp
        const groupedByRap = {};
        suatChieu.forEach(suat => {
            const rapName = suat.phong_chieu.rap_chieu_phim.ten || "Không xác định";
            if (!groupedByRap[rapName]) groupedByRap[rapName] = [];
            groupedByRap[rapName].push(suat);
        });

        // Render HTML
        let html = `<div class="showtimes mt-4 bg-gray-50 p-4 rounded-lg shadow-inner">
                        <h3 class="font-semibold mb-4">Suất chiếu: ${movieName}</h3>`;

        html += Object.entries(groupedByRap).map(([rapName, suats]) => {
            // Nhóm theo loại phòng chiếu
            const groupedByLoai = {};
            suats.forEach(suat => {
                const loaiChieu = (suat.phong_chieu.loai_phongchieu || "Không xác định").toUpperCase();
                if (!groupedByLoai[loaiChieu]) groupedByLoai[loaiChieu] = [];
                groupedByLoai[loaiChieu].push(suat);
            });

            // Render loại phòng
            const loaiHtml = Object.entries(groupedByLoai).map(([loaiChieu, suatsLoai]) => {
                // Sắp xếp theo giờ bắt đầu
                suatsLoai.sort((a, b) => new Date(a.batdau) - new Date(b.batdau));

                const suatHtml = suatsLoai.map(suat => {
                const gioChieu = new Date(suat.batdau).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                    return `<button 
                                type="button"
                                class="suat-btn px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 
                                    hover:bg-red-500 hover:text-white transition-colors"
                                data-suat-id="${suat.id}" 
                                data-phong-id="${suat.phong_chieu.id}" 
                                data-rap-id="${suat.phong_chieu.rap_chieu_phim.id}"
                                data-full='${JSON.stringify(suat)}'>
                                ${gioChieu}
                            </button>`;
                }).join(' ');

                return `<div class="flex items-center mb-2">
                            <span class="font-medium w-24 inline-block">${loaiChieu}</span>
                            <div class="flex flex-wrap gap-2">${suatHtml}</div>
                        </div>`;
            }).join('');

            return `<div class="bg-white p-4 rounded-xl shadow mb-6">
                        ${loaiHtml}
                    </div>`;
        }).join('');

        html += `</div>`;
        loadSuatChieuEl.innerHTML = html;
        loadSuatChieuEl.classList.remove('hidden');

        // Gắn sự kiện click cho từng suất
        const salt = "{{ $_ENV['URL_SALT'] }}";
        document.querySelectorAll('.suat-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.suat-btn').forEach(b => {
                b.classList.remove("bg-red-600", "text-white");
                b.classList.add("bg-white", "text-gray-700");
            });

            // Trước khi thêm màu đỏ, remove bg-white + text-gray-700 khỏi nút đang chọn
            btn.classList.remove("bg-white", "text-gray-700");
            btn.classList.add("bg-red-600", "text-white");

                const suatId = btn.dataset.suatId;
                selectedSuatChieu = JSON.parse(btn.dataset.full); 
                loadSeats(suatId);
                loadFood(btn.dataset.rapId); // <-- chỉ load food **1 lần khi chọn suất chiếu**
            });
        });
    }
    

 // --- Tạo ghế ---
async function loadSeats(suatId) {
    try {
        const res = await fetch(`${baseUrl}/api/so-do-ghe/${suatId}`);
        const data = await res.json();

        if (!data.success || !data.data || !data.data.phong) {
            alert("Không tìm thấy phòng chiếu!");
            return;
        }

        stepSeat.classList.remove("hidden");
        const seatContainer = document.getElementById("seatContainer");
        seatContainer.innerHTML = "";

        const grouped = {};
        data.data.phong.soDoGhe.forEach(ghe => {
            const row = ghe.so_ghe[0];
            if (!grouped[row]) grouped[row] = [];
            grouped[row].push(ghe);
        });

        Object.keys(grouped).forEach(rowKey => {
            const rowDiv = document.createElement("div");
            rowDiv.className = "flex justify-center gap-2";

            const rowLabel = document.createElement("span");
            rowLabel.className = "flex items-center justify-center w-12 h-12 text-sm font-bold rounded-xl cursor-pointer transition transform hover:scale-105 select-none shadow-md";
            rowLabel.textContent = rowKey;
            rowDiv.appendChild(rowLabel);

            grouped[rowKey].forEach(ghe => {
                const btn = document.createElement("button");
                btn.className = "flex items-center justify-center w-12 h-12 text-sm font-bold rounded-xl cursor-pointer transition transform hover:scale-105 select-none shadow-md";

                if (!ghe.loaighe_id) {
                    btn.className = "w-12 h-12 rounded-xl bg-transparent"; 
                    btn.disabled = true;
                } else if (ghe.trang_thai === 1) {
                    btn.style.backgroundColor = "gray"; 
                    btn.classList.add("bg-gray-400", "text-white", "cursor-not-allowed", "shadow-inner"); 
                } else if (ghe.trang_thai === 2) {
                    btn.style.backgroundColor = "white"; 
                    btn.innerHTML = "🎟️";
                    btn.classList.add("text-white", "cursor-not-allowed", "shadow-inner");
                } else {
                    btn.textContent = ghe.so_ghe;
                    btn.style.backgroundColor = ghe.loai_ghe.ma_mau;
                    btn.dataset.originalColor = ghe.loai_ghe.ma_mau; // lưu màu gốc ngay
                    btn.classList.add("hover:opacity-80");

                    // Gán dataset
                    btn.dataset.gheId = ghe.id;
                    btn.dataset.loaighe_id = ghe.loaighe_id;
                    btn.dataset.ngay = data.data.suat_chieu?.bat_dau?.split(' ')[0] || getSelectedDate();
                    btn.dataset.dinhdang = data.data.phong.loai_phongchieu;

                    btn.addEventListener("click", () => toggleSeat(btn, ghe.id));
                }

                rowDiv.appendChild(btn);
            });

            seatContainer.appendChild(rowDiv);
        });

    } catch (err) {
        console.error("Lỗi load ghế:", err);
        alert("Không load được sơ đồ ghế!");
    }
}

// --- Chọn ghế ---
async function toggleSeat(seat, seatId) {
    const selectedSeatsEl = document.getElementById("selected-seats");
    const seatNum = seat.textContent;
    const index = selectedSeats.findIndex(s => s.id === seatId);

    if (seat.classList.contains("ring-4") || index !== -1) {
        // Bỏ chọn ghế
        seat.style.backgroundColor = seat.dataset.originalColor;
        seat.classList.remove("ring-4", "ring-red-600");
        if (index !== -1) selectedSeats.splice(index, 1);
    } else {
        // Chọn ghế
        seat.classList.add("ring-4", "ring-red-600");

        let gia = seat.dataset.price ? parseInt(seat.dataset.price) : 0;
        if (!gia) {
            try {
                const res = await fetch(`${baseUrl}/api/tinh-gia-ve/${seat.dataset.loaighe_id}/${seat.dataset.ngay}/${encodeURIComponent(seat.dataset.dinhdang)}`);
                const j = await res.json();
                if (j.success && j.data) gia = parseInt(j.data);
            } catch (e) { console.error(e); }
            seat.dataset.price = gia;
        }

        selectedSeats.push({ id: seatId, so_ghe: seatNum, gia });
    }

    selectedSeatsEl.textContent = selectedSeats.length ? selectedSeats.map(s => s.so_ghe).join(", ") : "Chưa chọn";

    // Hiển thị các bước
    if (selectedSeats.length > 0) {
        stepCombo.classList.remove('hidden');
        stepSummary.classList.remove('hidden');
        stepPayment.classList.remove('hidden');
        confirmBtn.classList.remove('hidden');
    } else {
        stepCombo.classList.add('hidden');
        stepSummary.classList.add('hidden');
        stepPayment.classList.add('hidden');
        confirmBtn.classList.add('hidden');
    }

    updateSummary();
}

    async function loadFood(idRap) {
        foodContainer.innerHTML = '';
        selectedFood = [];
        try {
            const res = await fetch(`${baseUrl}/api/lay-san-pham-khach/${idRap}`);
            const json = await res.json();
            console.log(json);
            if(!json.success || !json.data || json.data.length===0){ 
                foodContainer.innerHTML='<p>Chưa có sản phẩm nào</p>'; 
                return; 
            }
            json.data.forEach(sp=>{
                const div = document.createElement("div");
                div.className="flex flex-col items-center border rounded p-2 shadow-sm";
                div.innerHTML = `
                    <img src="${urlMinio}/${sp.hinh_anh}" alt="${sp.ten}" class="w-20 h-20 object-cover rounded mb-2">
                    <h4 class="text-center font-semibold mb-1">${sp.ten}</h4>
                    <div class="text-sm text-gray-600 mb-2">${sp.gia.toLocaleString()} ₫</div>
                    <div class="flex items-center gap-2">
                        <button class="px-2 py-1 bg-gray-200 rounded minusBtn">-</button>
                        <span class="quantity font-bold">0</span>
                        <button class="px-2 py-1 bg-gray-200 rounded plusBtn">+</button>
                    </div>
                `;
                const minusBtn = div.querySelector(".minusBtn");
                const plusBtn = div.querySelector(".plusBtn");
                const quantityEl = div.querySelector(".quantity");
                let quantity = 0;

                plusBtn.addEventListener("click", ()=>{
                    quantity++;
                    quantityEl.textContent = quantity;
                    const existing = selectedFood.find(f=>f.id===sp.id);
                    if(existing) existing.quantity = quantity;
                    else selectedFood.push({id:sp.id,ten:sp.ten,gia:sp.gia,quantity});
                    updateSummary();
                });

                minusBtn.addEventListener("click", ()=>{
                    if(quantity>0){
                        quantity--;
                        quantityEl.textContent = quantity;
                        const existing = selectedFood.find(f=>f.id===sp.id);
                        if(existing){
                            existing.quantity = quantity;
                            if(quantity===0) selectedFood = selectedFood.filter(f=>f.id!==sp.id);
                        }
                        updateSummary();
                    }
                });

                foodContainer.appendChild(div);
            });
        } catch(err){
            console.error(err);
            foodContainer.innerHTML='<p>Lỗi khi tải sản phẩm</p>';
        }
    }

    // --- Chọn phim & suất chiếu ---
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

    function updateSummary() {
    orderSummary.innerHTML = '';
    let total = 0;

    if (selectedSeats.length) {
        const seatTotal = selectedSeats.reduce((sum, s) => sum + s.gia, 0);
        const li = document.createElement('li');
        li.innerText = `Ghế: ${selectedSeats.map(s => s.so_ghe).join(', ')} (${seatTotal.toLocaleString()} đ)`;
        orderSummary.appendChild(li);
        total += seatTotal;
    }

    selectedFood.forEach(f => {
        const li = document.createElement('li');
        li.innerText = `${f.quantity} x ${f.ten} (${f.gia.toLocaleString()} đ)`;
        orderSummary.appendChild(li);
        total += f.quantity * f.gia;
    });

    totalPriceEl.innerText = total.toLocaleString() + ' đ';
}


function random9Digits() { return Math.floor(100000000 + Math.random() * 900000000); }
    // --- Confirm ---
        confirmBtn.addEventListener('click', async () => {
        const selectedPayment = document.querySelector('.payment-radio:checked');
        if (!selectedPayment) { alert('Vui lòng chọn phương thức thanh toán!'); return; }

        const paymentMethod = selectedPayment.value;

        if (!selectedSuatChieu) {
            alert('Vui lòng chọn suất chiếu trước khi tạo đơn hàng!');
            return;
        }

        if (paymentMethod === 'cash') {
            try {
                const totalSeats = selectedSeats.reduce((sum, s) => sum + s.gia, 0);
                const totalFood = selectedFood.reduce((sum, f) => sum + f.gia * f.quantity, 0);
                const totalBefore = totalSeats + totalFood;
                const trangThai = 2;
                const maVe = Math.floor(100000000 + Math.random() * 900000000);

                // Tạo đơn hàng
                const resDH = await fetch(`${baseUrl}/api/tao-don-hang-nv`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        suat_chieu_id: selectedSuatChieu.id,
                        thequatang_id: null,
                        the_qua_tang_su_dung: 0,
                        tong_tien: totalBefore,
                        phuong_thuc_thanh_toan: 2,
                        ma_ve: maVe,
                        trang_thai: trangThai
                    })
                });
                const text = await resDH.text();
                console.log("Raw response:", text);

                let jDH;
                try {
                    jDH = JSON.parse(text);
                } catch(e) {
                    console.error("Response không phải JSON:", text);
                    alert("Lỗi server, xem console để biết chi tiết");
                    return;
                }

                if (!jDH.success) throw new Error(jDH.message || "Lỗi tạo đơn hàng");
                const donhangId = jDH.data.id;

                // Tạo vé
                await fetch(`${baseUrl}/api/tao-ve`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        donhang_id: donhangId,
                        suat_chieu_id: selectedSuatChieu.id,
                        trang_thai: 2,
                        seats: selectedSeats.map(s => ({ ghe_id: s.id }))
                    })
                });

                // Tạo chi tiết đơn hàng (combo bắp nước)
                for (const f of selectedFood) {
                    await fetch(`${baseUrl}/api/tao-chi-tiet-don-hang`, {
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
                }

                alert(`Bán vé thành công! Tổng tiền: ${totalBefore.toLocaleString()} đ\nPhương thức: Tiền mặt`);

                // Reset UI
                stepSeat.classList.add('hidden');
                stepCombo.classList.add('hidden');
                stepSummary.classList.add('hidden');
                stepPayment.classList.add('hidden');
                confirmBtn.classList.add('hidden');
                
                selectedSeats = [];
                selectedFood = [];
                selectedSuatChieu = null;
                updateSummary();
                document.querySelectorAll('.quantity').forEach(q => q.textContent = 0);
                document.querySelectorAll('.mark-selected').forEach(btn => btn.remove());
                document.querySelectorAll('.payment-radio').forEach(r => r.checked = false);

            } catch (err) {
                console.error(err);
                alert('Lỗi khi tạo đơn hàng tiền mặt: ' + err.message);
            }
        } else if (paymentMethod === 'qr') {
            const totalSeats = selectedSeats.reduce((sum, s) => sum + s.gia, 0);
            const totalFood = selectedFood.reduce((sum, f) => sum + f.gia * f.quantity, 0);
            const totalBefore = totalSeats + totalFood;
            const trangThai = 1;
            const maVe = Math.floor(100000000 + Math.random() * 900000000);

            // Tạo đơn hàng
                const resDH = await fetch(`${baseUrl}/api/tao-don-hang-nv`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        suat_chieu_id: selectedSuatChieu.id,
                        thequatang_id: null,
                        the_qua_tang_su_dung: 0,
                        tong_tien: totalBefore,
                        phuong_thuc_thanh_toan: 2,
                        ma_ve: maVe,
                        trang_thai: trangThai
                    })
                });
                const text = await resDH.text();
                console.log("Raw response:", text);

                let jDH;
                try {
                    jDH = JSON.parse(text);
                } catch(e) {
                    console.error("Response không phải JSON:", text);
                    alert("Lỗi server, xem console để biết chi tiết");
                    return;
                }

                if (!jDH.success) throw new Error(jDH.message || "Lỗi tạo đơn hàng");
                const donhangId = jDH.data.id;

                // Tạo vé
                await fetch(`${baseUrl}/api/tao-ve`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        donhang_id: donhangId,
                        suat_chieu_id: selectedSuatChieu.id,
                        trang_thai: 1,
                        seats: selectedSeats.map(s => ({ ghe_id: s.id }))
                    })
                });

                // Tạo chi tiết đơn hàng (combo bắp nước)
                for (const f of selectedFood) {
                    await fetch(`${baseUrl}/api/tao-chi-tiet-don-hang`, {
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
                }


            qrContainer.classList.remove("hidden");
            qrImage.src = `https://qr.sepay.vn/img?bank=TPBank&acc=10001198354&template=compact&amount=${totalBefore}&des=DH${donhangId}`;

            const interval = setInterval(async () => {
                try {
                    const res = await fetch(`${baseUrl}/api/lay-trang-thai`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ donhang_id: donhangId })
                    });
                    const status = await res.json();

                    // Nếu thanh toán thành công
                    if (status.payment_status === "Paid") {
                        qrContainer.classList.add("hidden");        // Ẩn QR
                        success_pay_box.classList.remove("hidden"); // Hiện thông báo
                        clearInterval(interval);

                        // Reset các bước
                        stepSeat.classList.add('hidden');
                        stepCombo.classList.add('hidden');
                        stepSummary.classList.add('hidden');
                        stepPayment.classList.add('hidden');
                        confirmBtn.classList.add('hidden');

                        selectedSeats = [];
                        selectedFood = [];
                        selectedSuatChieu = null;
                        updateSummary();
                        document.querySelectorAll('.quantity').forEach(q => q.textContent = 0);
                        document.querySelectorAll('.mark-selected').forEach(btn => btn.remove());
                        document.querySelectorAll('.payment-radio').forEach(r => r.checked = false);
                    }
                } catch (e) {
                    console.log("Lỗi check trạng thái:", e);
                }
            }, 1000);               
            
        }
    });
});
</script>

@endsection
