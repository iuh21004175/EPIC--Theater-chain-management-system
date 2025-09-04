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

    <!-- Bước 1: Chọn phim -->
    <div id="step-movie" class="mb-6">
        <h3 class="font-semibold mb-4 text-lg">Chọn phim</h3>
        <div class="grid grid-cols-3 gap-4">
            <div class="group relative cursor-pointer border rounded p-4 text-center hover:shadow-lg" data-movie="1" data-name="Avengers: Endgame">
                <img src="https://via.placeholder.com/120x180.png?text=Avengers" alt="Avengers" class="mx-auto mb-2">
                <h4 class="font-semibold">Avengers: Endgame</h4>
            </div>
            <div class="group relative cursor-pointer border rounded p-4 text-center hover:shadow-lg" data-movie="2" data-name="Spider-Man: No Way Home">
                <img src="https://via.placeholder.com/120x180.png?text=Spider-Man" alt="Spider-Man" class="mx-auto mb-2">
                <h4 class="font-semibold">Spider-Man: No Way Home</h4>
            </div>
            <div class="group relative cursor-pointer border rounded p-4 text-center hover:shadow-lg" data-movie="3" data-name="The Batman">
                <img src="https://via.placeholder.com/120x180.png?text=The+Batman" alt="The Batman" class="mx-auto mb-2">
                <h4 class="font-semibold">The Batman</h4>
            </div>
        </div>

        <!-- Nơi render suất chiếu -->
        <div id="loadSuatChieu" class="mt-4 hidden"></div>
    </div>

    <!-- Bước 3: Chọn ghế -->
    <div id="step-seat" class="mb-6 p-6 bg-white rounded-xl shadow-md hidden max-w-4xl mx-auto">
        <h2 class="text-2xl font-bold mb-6 text-red-600 text-center">Chọn ghế</h2>
        <div class="text-center mb-6">
            <div class="bg-gray-300 text-gray-700 font-semibold py-2 rounded-md">MÀN HÌNH</div>
        </div>
        <div id="seatContainer" class="grid gap-3">
            @foreach(['A','B','C','D','E'] as $row)
            <div class="flex justify-center gap-2" data-row="{{ $row }}">
                <span class="w-6 text-gray-600 font-semibold">{{ $row }}</span>
                @for($i=1;$i<=10;$i++)
                    <button class="seat w-8 h-8 bg-green-200 rounded transition hover:bg-blue-300">{{ $i }}</button>
                @endfor
            </div>
            @endforeach
        </div>
        <div class="mt-6 p-4 border rounded-md bg-gray-50">
            <p class="font-medium">Ghế đã chọn:</p>
            <p id="selected-seats" class="text-red-600 font-semibold">Chưa chọn</p>
        </div>
    </div>

    <!-- Bước 4: Combo bắp nước -->
    <div id="step-combo" class="mb-6 p-4 border rounded shadow bg-white hidden">
        <h3 class="font-semibold mb-2 text-lg">Chọn combo bắp nước</h3>
        <div class="grid grid-cols-2 gap-4">
            <div class="border rounded p-4 flex flex-col items-center combo" data-price="50000">
                <img src="https://via.placeholder.com/80x80.png?text=Bap+Nuoc" alt="Combo 1" class="mb-2">
                <h4 class="font-semibold text-center">Combo 1: 1 Bắp + 1 Nước</h4>
                <p class="text-gray-600">50.000 đ</p>
                <div class="flex items-center mt-2 gap-2">
                    <button class="decrease px-2 py-1 bg-gray-200 rounded">-</button>
                    <span class="quantity">0</span>
                    <button class="increase px-2 py-1 bg-gray-200 rounded">+</button>
                </div>
            </div>
            <div class="border rounded p-4 flex flex-col items-center combo" data-price="90000">
                <img src="https://via.placeholder.com/80x80.png?text=Bap+Nuoc+2" alt="Combo 2" class="mb-2">
                <h4 class="font-semibold text-center">Combo 2: 2 Bắp + 2 Nước</h4>
                <p class="text-gray-600">90.000 đ</p>
                <div class="flex items-center mt-2 gap-2">
                    <button class="decrease px-2 py-1 bg-gray-200 rounded">-</button>
                    <span class="quantity">0</span>
                    <button class="increase px-2 py-1 bg-gray-200 rounded">+</button>
                </div>
            </div>
        </div>
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

    <div class="text-center">
        <button id="confirm-btn" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 hidden">Xác nhận bán vé</button>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', () => {
    // --- Ngày ---
    const dayTabs = document.getElementById('dayTabs');
    const nextBtn = document.getElementById('nextDay');
    const prevBtn = document.getElementById('prevDay');
    let startDate = new Date(), visibleDays=14, currentStartIndex=0;
    let allDays = Array.from({length:30},(_,i)=>{
        let d=new Date(startDate);
        d.setDate(d.getDate()+i);
        return d;
    });

    function formatDate(d){ return ("0"+d.getDate()).slice(-2)+"/"+("0"+(d.getMonth()+1)).slice(-2); }
    function formatWeekday(d){ return ["Chủ Nhật","Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7"][d.getDay()]; }

    function renderDays(){
        dayTabs.innerHTML='';
        for(let i=currentStartIndex;i<currentStartIndex+visibleDays;i++){
            if(!allDays[i]) continue;
            const btn=document.createElement('button');
            btn.className='flex-shrink-0 text-center px-4 py-2 rounded-lg border border-gray-300 font-semibold text-gray-700 hover:bg-red-500 hover:text-white transition-colors';
            btn.innerHTML=`${formatWeekday(allDays[i])}<br>${formatDate(allDays[i])}`;
            btn.addEventListener('click', ()=>{ 
                dayTabs.querySelectorAll('button').forEach(b=>{
                    b.classList.remove('bg-red-600','text-white');
                    b.classList.add('bg-white','text-black');
                }); 
                btn.classList.add('bg-red-600','text-white'); 
            });
            dayTabs.appendChild(btn);
        }
        const firstBtn = dayTabs.querySelector('button');
        if(firstBtn){ firstBtn.classList.add('bg-red-600','text-white'); }
    }
    nextBtn.addEventListener('click',()=>{ if(currentStartIndex+visibleDays<allDays.length){currentStartIndex++; renderDays();} });
    prevBtn.addEventListener('click',()=>{ if(currentStartIndex>0){currentStartIndex--; renderDays();} });
    renderDays();

    const showtimesData = {
        "1": ["10:00","13:00","16:00","19:00"],
        "2": ["11:00","14:00","17:00","20:00"],
        "3": ["12:00","15:00","18:00","21:00"]
    };

    const loadSuatChieu = document.getElementById('loadSuatChieu');
    const stepSeat = document.getElementById('step-seat');
    const stepCombo = document.getElementById('step-combo');
    const stepSummary = document.getElementById('step-summary');
    const stepPayment = document.getElementById('step-payment');
    const confirmBtn = document.getElementById('confirm-btn');
    const seatPrice = 100000;
    let selectedSeats = [];

    // --- Chọn phim & suất chiếu ---
    document.querySelectorAll('.group[data-movie]').forEach(card => {
        card.addEventListener('click', e => {
            e.stopPropagation();
            const movieKey = card.dataset.movie;
            const movieName = card.dataset.name;

            // Remove mark cũ
            document.querySelectorAll('.mark-selected').forEach(btn => btn.remove());

            // Render suất chiếu
            let html = `<div class="showtimes mt-4 bg-gray-50 p-4 rounded-lg shadow-inner">
                <h3 class="font-semibold mb-2">Suất chiếu: ${movieName}</h3>
                <div class="space-y-2">
                    <div class="flex items-center gap-2">
                    <span class="w-24 font-semibold text-gray-700">2D Phụ Đề</span>
                    <div class="flex gap-2 flex-wrap">`;
            showtimesData[movieKey].forEach(time=>{
                html += `<button class="px-3 py-1 bg-white text-black border rounded-lg showtime-btn">${time}</button>`;
            });
            html += `</div></div></div>`;
            loadSuatChieu.innerHTML = html;
            loadSuatChieu.dataset.movie = movieKey;
            loadSuatChieu.classList.remove('hidden');
            loadSuatChieu.scrollIntoView({behavior:"smooth"});

            const markBtn = document.createElement('div');
            markBtn.textContent = "Đã chọn";
            markBtn.className = "mark-selected absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded";
            card.appendChild(markBtn);

            // --- Chọn suất chiếu ---
            loadSuatChieu.querySelectorAll('.showtime-btn').forEach(btn=>{
                btn.addEventListener('click', ()=>{
                    // Reset tất cả button về trắng
                    loadSuatChieu.querySelectorAll('.showtime-btn').forEach(b=>{
                        b.style.backgroundColor='white';
                        b.style.color='black';
                    });
                    btn.style.backgroundColor='#dc2626'; // bg-red-600
                    btn.style.color='white';

                    // Hiện step
                    stepSeat.classList.remove('hidden');
                    stepCombo.classList.remove('hidden');
                    stepSummary.classList.remove('hidden');
                    stepPayment.classList.remove('hidden');
                    confirmBtn.classList.remove('hidden');

                    selectedSeats = [];
                    document.getElementById('selected-seats').textContent = 'Chưa chọn';

                    // Reset ghế
                    const seatButtons = document.querySelectorAll('.seat');
                    const soldSeats = ['A3','B5','C7','D2','E9'];
                    seatButtons.forEach(s=>{
                        const seatId = s.parentElement.dataset.row + s.textContent;
                        if(soldSeats.includes(seatId)){
                            s.style.backgroundColor='#9ca3af'; // gray-400
                            s.style.color='white';
                            s.style.cursor='not-allowed';
                        } else {
                            s.style.backgroundColor='#bbf7d0'; // green-200
                            s.style.color='black';
                            s.style.cursor='pointer';
                        }
                    });

                    updateSummary();
                });
            });
        });
    });

    // --- Chọn ghế ---
    document.querySelectorAll('.seat').forEach(btn=>{
        const soldSeats = ['A3','B5','C7','D2','E9'];
        const seatId = btn.parentElement.dataset.row + btn.textContent;
        const selectedSeatsEl = document.getElementById('selected-seats');

        btn.addEventListener('click',()=>{
            if(soldSeats.includes(seatId)) return;

            if(selectedSeats.includes(seatId)){
                selectedSeats = selectedSeats.filter(s => s!==seatId);
                btn.style.backgroundColor='#bbf7d0'; // xanh
                btn.style.color='black';
            } else {
                selectedSeats.push(seatId);
                btn.style.backgroundColor='#dc2626'; // đỏ
                btn.style.color='white';
            }

            selectedSeatsEl.textContent = selectedSeats.length>0 ? selectedSeats.join(', ') : 'Chưa chọn';
            updateSummary();
        });
    });

    // --- Combo ---
    const comboEls = document.querySelectorAll('.combo');
    comboEls.forEach(el=>{
        const qtyEl = el.querySelector('.quantity');
        el.querySelector('.increase').addEventListener('click',()=>{
            qtyEl.textContent = parseInt(qtyEl.textContent)+1;
            updateSummary();
        });
        el.querySelector('.decrease').addEventListener('click',()=>{
            qtyEl.textContent = Math.max(0, parseInt(qtyEl.textContent)-1);
            updateSummary();
        });
    });

    // --- Summary ---
    const orderSummary = document.getElementById("order-summary");
    const totalPriceEl = document.getElementById("total-price");
    function updateSummary(){
        orderSummary.innerHTML=''; let total=0;
        if(selectedSeats.length){
            const li=document.createElement('li');
            li.innerText=`Ghế: ${selectedSeats.join(', ')} (${selectedSeats.length} x ${seatPrice.toLocaleString()} đ)`;
            orderSummary.appendChild(li);
            total+=selectedSeats.length*seatPrice;
        }
        comboEls.forEach(el=>{
            const qty=parseInt(el.querySelector('.quantity').textContent)||0;
            const price=parseInt(el.dataset.price)||0;
            if(qty>0){
                const li=document.createElement('li');
                li.innerText=`${qty} x ${el.querySelector('h4').innerText} (${price.toLocaleString()} đ)`;
                orderSummary.appendChild(li);
                total+=qty*price;
            }
        });
        totalPriceEl.innerText = total.toLocaleString()+' đ';
    }

    // --- Confirm ---
    confirmBtn.addEventListener('click', ()=>{
        const selectedPayment = document.querySelector('.payment-radio:checked');
        if(!selectedPayment){
            alert('Vui lòng chọn phương thức thanh toán!');
            return;
        }

        alert(`Bán vé thành công! Tổng tiền: ${totalPriceEl.innerText}\nPhương thức: ${selectedPayment.value==='cash'?'Tiền mặt':'QR'}`);

        // Reset tất cả
        stepSeat.classList.add('hidden');
        stepCombo.classList.add('hidden');
        stepSummary.classList.add('hidden');
        stepPayment.classList.add('hidden');
        confirmBtn.classList.add('hidden');
        selectedSeats=[];
        updateSummary();
        comboEls.forEach(el=>el.querySelector('.quantity').textContent=0);
        loadSuatChieu.classList.add('hidden');
        document.querySelectorAll('.mark-selected').forEach(btn=>btn.remove());
        document.querySelectorAll('.payment-radio').forEach(r=>r.checked=false);
    });
});
</script>

@endsection
