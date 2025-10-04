@extends('internal.layout')

@section('title', 'Quản lý đơn hàng')

@section('breadcrumbs')
<li>
    <div class="flex items-center">
        <svg class="flex-shrink-0 h-5 w-5 text-gray-400" 
             xmlns="http://www.w3.org/2000/svg" 
             viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" 
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 
                     7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 
                     0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                  clip-rule="evenodd" />
        </svg>
        <span class="ml-1 text-gray-500 hover:text-gray-700 text-sm font-medium">
            Quản lý đơn hàng
        </span>
    </div>
</li>
@endsection

@section('content')
<div class="px-4 py-6 max-w-7xl mx-auto">
    <div class="flex flex-col md:flex-row items-center justify-between mb-6 gap-3">
        <h2 class="text-2xl font-bold text-blue-600">Danh sách đơn hàng</h2>
        <div class="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <input type="text" id="search-order" placeholder="Tìm theo mã đơn / khách hàng" 
                   class="border rounded px-3 py-2 w-full md:w-64">
        </div>
    </div>

    <div class="overflow-x-auto bg-white border rounded shadow">
        <table class="w-full border-collapse text-left">
            <thead>
                <tr class="bg-gray-200">
                    <th class="p-3 border">Mã đơn</th>
                    <th class="p-3 border">Khách hàng</th>
                    <th class="p-3 border">Ngày đặt</th>
                    <th class="p-3 border">Tổng tiền</th>
                    <th class="p-3 border">Trạng thái</th>
                    <th class="p-3 border">Hành động</th>
                </tr>
            </thead>
            <tbody id="order-list">
                <!-- Render JS -->
            </tbody>
        </table>
    </div>

    <div id="pagination" class="mt-4 flex justify-center gap-2"></div>
</div>

<!-- Modal Chi tiết đơn hàng -->
<div id="order-detail-modal" 
     class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden z-50">
  <div class="bg-white rounded shadow-lg w-full max-w-3xl p-6 relative max-h-[90vh] overflow-y-auto">
    <h3 class="text-xl font-semibold mb-4 text-blue-600">Chi tiết đơn hàng</h3>
    <button id="close-order-detail" 
            class="absolute top-2 right-2 text-red-500 hover:text-red-700">✕</button>
    <div id="order-detail-content">
        <!-- Render JS -->
    </div>
  </div>
</div>
<?php
 $idRap = $_SESSION['UserInternal']['ID_RapPhim'] ?? null;
?>

<script>
document.addEventListener('DOMContentLoaded', () => {
    const idRap = <?php echo $idRap !== null ? (int)$idRap : 'null'; ?>;
    const baseUrl = "{{ $_ENV['URL_WEB_BASE'] }}";
    const orderList = document.getElementById('order-list');
    const searchInput = document.getElementById('search-order');
    const pagination = document.getElementById('pagination');
    const detailModal = document.getElementById('order-detail-modal');
    const closeDetailBtn = document.getElementById('close-order-detail');
    const detailContent = document.getElementById('order-detail-content');

    let orders = [];
    let filteredOrders = [];
    const rowsPerPage = 10;
    let currentPage = 1;
    // Fetch đơn hàng
    fetch(`${baseUrl}/api/doc-don-hang-theo-rap/${idRap}`)
    .then(res => res.json())
    .then(data => {
        if (data.success && Array.isArray(data.data)) {
            orders = [...data.data];
            console.log(orders);
            filteredOrders = [...orders];
            renderOrders();
        }
    });

    function renderOrders(list = filteredOrders, page = currentPage) {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const pageItems = list.slice(start, end);

        orderList.innerHTML = '';
        pageItems.forEach(o => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="p-3 border">${o.ma_ve}</td>
                <td class="p-3 border">${o.user?.ho_ten || '-'}</td>
                <td class="p-3 border">${o.ngay_dat}</td>
                <td class="p-3 border">${Number(o.tong_tien).toLocaleString()} ₫</td>
                <td class="p-3 border">${renderTrangThai(o.trang_thai)}</td>
                <td class="p-3 border">
                    <button class="view-detail px-2 py-1 bg-blue-500 text-white rounded" data-id="${o.id}">
                        Xem
                    </button>
                </td>
            `;
            orderList.appendChild(tr);
        });
        renderPagination(list);
    }

    function renderPagination(list) {
        const totalPages = Math.ceil(list.length / rowsPerPage);
        pagination.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            btn.className = `px-3 py-1 border rounded ${i===currentPage?'bg-blue-500 text-white':'bg-white hover:bg-blue-100'}`;
            btn.addEventListener('click', () => {
                currentPage = i;
                renderOrders(list, currentPage);
            });
            pagination.appendChild(btn);
        }
    }

    function renderTrangThai(trang_thai) {
        switch(Number(trang_thai)) {
            case 2: return '<span class="text-green-600 font-semibold">Đã thanh toán</span>';
            case 1: return '<span class="text-orange-500 font-semibold">Chờ thanh toán</span>';
            case 0: return '<span class="text-red-600 font-semibold">Đã hủy</span>';
            default: return '<span class="text-gray-500">Không xác định</span>';
        }
    }

    // Xem chi tiết
    orderList.addEventListener('click', e => {
        if (!e.target.classList.contains('view-detail')) return;

        const id = e.target.dataset.id;
        fetch(`${baseUrl}/api/doc-chi-tiet-don-hang/${id}`)
            .then(res => res.json())
            .then(data => {
                if (!data.success) {
                    detailContent.innerHTML = `<p class="text-center text-gray-500">Không có dữ liệu.</p>`;
                    detailModal.classList.remove('hidden');
                    return;
                }

                const dh = Array.isArray(data.data) ? data.data[0] : data.data;
                const isCancelled = Number(dh.trang_thai) === 0;

                const startTime = dh.ve?.[0]?.suat_chieu?.batdau ? new Date(dh.ve[0].suat_chieu.batdau) : null;
                const now = new Date();
                const canCancel = !isCancelled && startTime && (now < new Date(startTime.getTime() - 15 * 60 * 1000));

                let html = `
                    <div class="space-y-3 p-2 max-h-[80vh] overflow-y-auto relative ${isCancelled ? 'modal-cancelled' : ''}">
                        ${isCancelled ? `<div class="modal-cancelled-overlay"><span>Đã hoàn vé</span></div>` : ''}

                        <!-- Thông tin khách hàng và nhân viên -->
                        <div class="p-3 bg-white rounded shadow text-sm text-gray-700 grid grid-cols-2 gap-4">
                            <div>
                                <h4 class="font-bold text-lg mb-2 text-blue-600">Thông tin khách hàng</h4>
                                <p><span class="font-semibold">Họ tên:</span> ${dh.ve?.[0]?.khachhang?.ho_ten || '-'}</p>
                                <p><span class="font-semibold">Email:</span> ${dh.ve?.[0]?.khachhang?.email || '-'}</p>
                                <p><span class="font-semibold">Số điện thoại:</span> ${dh.ve?.[0]?.khachhang?.so_dien_thoai || '-'}</p>
                            </div>
                            <div>
                                <h4 class="font-bold text-lg mb-2 text-green-600">Thông tin nhân viên</h4>
                                <p><span class="font-semibold">Họ tên:</span> ${dh.ve?.[0]?.don_hang?.nhan_vien?.nguoi_dung_internals?.ten || '-'}</p>
                                <p><span class="font-semibold">Email:</span> ${dh.ve?.[0]?.don_hang?.nhan_vien?.nguoi_dung_internals?.email || '-'}</p>
                                <p><span class="font-semibold">Số điện thoại:</span> ${dh.ve?.[0]?.don_hang?.nhan_vien?.nguoi_dung_internals?.dien_thoai || '-'}</p>
                            </div>
                        </div>

                        <!-- Thông tin phim -->
                        <div class="p-3 bg-white rounded shadow">
                            <h5 class="font-bold text-lg flex items-center gap-2">
                                ${dh.ve?.[0]?.suat_chieu?.phim?.ten_phim || 'Không xác định'}
                                <span class="inline-block px-2 py-0.5 text-xs font-semibold text-white bg-red-500 rounded">
                                    ${dh.ve?.[0]?.suat_chieu?.phim?.do_tuoi || 'C'}
                                </span>
                            </h5>
                        </div>

                        <!-- Thông tin rạp -->
                        <div class="p-3 bg-white rounded shadow text-sm text-gray-700 grid grid-cols-2 gap-4">
                            <div class="space-y-1">
                                <p><span class="font-semibold">Rạp:</span> ${dh.ve?.[0]?.suat_chieu?.phong_chieu?.rap_chieu_phim?.ten || '-'}</p>
                                <p><span class="font-semibold">Phòng:</span> ${dh.ve?.[0]?.suat_chieu?.phong_chieu?.ten || '-'}</p>
                                <p><span class="font-semibold">Loại phòng:</span> ${(dh.ve?.[0]?.suat_chieu?.phong_chieu?.loai_phongchieu || '-').toUpperCase()}</p>
                            </div>
                            <div class="space-y-1">
                                <p><span class="font-semibold">Ngày chiếu:</span> ${startTime ? startTime.toLocaleDateString('vi-VN', { weekday:'long', day:'2-digit', month:'2-digit', year:'numeric' }) : '-'}</p>
                                <p><span class="font-semibold">Thời gian:</span> ${startTime ? startTime.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'}) : '-'} - ${dh.ve?.[0]?.suat_chieu?.ketthuc ? new Date(dh.ve[0].suat_chieu.ketthuc).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'}) : '-'}</p>
                                <p><span class="font-semibold">Tổng tiền:</span> ${Number(dh.tong_tien || 0).toLocaleString()} ₫</p>
                            </div>
                        </div>

                        <!-- Ghế -->
                        <div class="p-2 bg-white rounded shadow text-sm">
                            <span class="font-semibold">Ghế:</span>
                            <span>${dh.ve?.map(v=>v.ghe?.so_ghe).filter(Boolean).join(', ') || '-'}</span>
                        </div>

                        <!-- Thức ăn + Thẻ quà tặng + Mã vé -->
                        <div class="p-3 bg-white rounded shadow text-sm text-gray-700 grid grid-cols-2 gap-4">
                            <div class="space-y-2">
                                <div>
                                    <h4 class="font-semibold mb-1">Thức ăn kèm:</h4>
                                    ${dh.ve?.flatMap(v=>v.don_hang?.chi_tiet_don_hang||[]).map(item=> `
                                        <div class="flex justify-between border-b border-gray-100 py-1">
                                            <span>${item.san_pham?.ten || '-'} x ${item.so_luong || 0}</span>
                                            <span class="font-semibold">${Number(item.thanh_tien || 0).toLocaleString()} ₫</span>
                                        </div>
                                    `).join('') || '<p>Không có</p>'}
                                </div>

                                <div>
                                    <h4 class="font-semibold mb-1">Thẻ quà tặng:</h4>
                                    <div class="flex justify-between border-b border-gray-100 py-1">
                                        ${dh.the_qua_tang_su_dung > 0 ? `<span>${Number(dh.the_qua_tang_su_dung || 0).toLocaleString()} ₫</span>` : '<span>Không có</span>'}
                                    </div>
                                </div>

                                <div>
                                    <h4 class="font-semibold mb-1">Phương thức thanh toán:</h4>
                                    <div class="flex justify-between border-b border-gray-100 py-1">
                                        <span>${dh.phuong_thuc_thanh_toan===1?'Chuyển khoản':dh.phuong_thuc_thanh_toan===2?'Tiền mặt':'Không xác định'}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="flex flex-col items-center gap-1">
                                <span class="font-semibold text-sm">Mã vé</span>
                                <span class="text-blue-600 font-mono text-base">${dh.ma_ve || '-'}</span>
                                <img src="${dh.qr_code || ''}" alt="QR Code" class="w-24 h-24 ${dh.qr_code ? '' : 'hidden'}">
                            </div>
                        </div>

                        ${canCancel ? `
                        <div class="p-2 bg-white rounded shadow text-sm">
                            <button id="btnCancelTicket" class="w-full bg-red-600 text-white px-3 py-2 rounded">Hoàn vé</button>
                        </div>` : ''}
                    </div>
                `;

                detailContent.innerHTML = html;
                detailModal.classList.remove('hidden');

                // Gắn event listener cho nút Hoàn vé nếu có
                const btnCancelTicket = document.getElementById('btnCancelTicket');
                btnCancelTicket?.addEventListener('click', async () => {
                    if(!confirm("LƯU Ý: Số tiền đã thanh toán sẽ được hoàn lại vào Thẻ quà tặng EPIC.\nBạn có chắc muốn hoàn vé này?")) return;

                    try {
                        // Cập nhật trạng thái đơn hàng
                        await fetch(`${baseUrl}/api/cap-nhat-trang-thai-don-hang`, {
                            method:'PUT',
                            headers:{'Content-Type':'application/json'},
                            body: JSON.stringify({id: dh.id})
                        });

                        // Cập nhật trạng thái vé
                        for(const v of dh.ve){
                            const donHangId = v.don_hang?.id;
                            if(donHangId){
                                await fetch(`${baseUrl}/api/cap-nhat-trang-thai-ve`, {
                                    method:'PUT',
                                    headers:{'Content-Type':'application/json'},
                                    body: JSON.stringify({donhang_id: donHangId})
                                });
                            }
                        }

                        alert(`Vé ${dh.ma_ve || dh.id} đã được hủy. Số tiền hoàn lại đã vào thẻ quà tặng.`);
                        detailModal.classList.add('hidden');

                        // Cập nhật trạng thái trong danh sách
                        orders = orders.map(o => o.id === dh.id ? {...o, trang_thai:0} : o);
                        filteredOrders = filteredOrders.map(o => o.id === dh.id ? {...o, trang_thai:0} : o);
                        renderOrders();
                    } catch(err){
                        console.error(err);
                        alert("Lỗi khi hủy vé: "+err.message);
                    }
                });
            });
    });

    closeDetailBtn.addEventListener('click', () => detailModal.classList.add('hidden'));
    

    // Tìm kiếm
    searchInput.addEventListener('input', () => {
        const q = searchInput.value.toLowerCase();
        filteredOrders = orders.filter(o =>
            (o.ma_ve || '').toLowerCase().includes(q) ||
            (o.user?.ho_ten || '').toLowerCase().includes(q)
        );
        renderOrders();
    });
});
</script>
@endsection
