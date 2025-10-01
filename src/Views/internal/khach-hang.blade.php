@extends('internal.layout')

@section('title', 'Quản lý khách hàng')

@section('breadcrumbs')
<li>
    <div class="flex items-center">
        <svg class="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
        <span class="ml-1 text-gray-500 hover:text-gray-700 text-sm font-medium">Quản lý khách hàng</span>
    </div>
</li>
@endsection

@section('content')
<div class="px-4 py-6 max-w-7xl mx-auto">

    <div class="flex flex-col md:flex-row items-center justify-between mb-6 gap-3">
        <h2 class="text-2xl font-bold text-purple-600">Danh sách khách hàng</h2>
        <div class="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <input type="text" id="search-customer" placeholder="Tìm theo email hoặc SĐT" class="border rounded px-3 py-2 w-full md:w-64">
        </div>
    </div>

    <div class="overflow-x-auto bg-white border rounded shadow">
        <table class="w-full border-collapse text-left">
            <thead>
                <tr class="bg-gray-200">
                    <th class="p-3 border">Tên</th>
                    <th class="p-3 border">SĐT</th>
                    <th class="p-3 border">Email</th>
                    <th class="p-3 border">Trạng thái</th>
                    <th class="p-3 border">Hành động</th>
                </tr>
            </thead>
            <tbody id="customer-list">
                <!-- Dữ liệu sẽ render JS -->
            </tbody>
        </table>
    </div>

    <div id="pagination" class="mt-4 flex justify-center gap-2"></div>
</div>

<!-- Giữ lại modal cập nhật khách hàng -->
<div id="customer-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden z-50">
    <div class="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <h3 class="text-xl font-semibold mb-4 text-purple-600">Cập nhật khách hàng</h3>
        <button id="close-modal" class="absolute top-2 right-2 text-purple-600 hover:text-purple-800 text-2xl font-bold">&times;</button>

        <div class="space-y-4">
            <div>
                <label class="block font-medium mb-1">Tên khách hàng</label>
                <input type="text" id="customer-name" class="border rounded px-3 py-2 w-full bg-gray-100 cursor-not-allowed" readonly>
            </div>
            <div>
                <label class="block font-medium mb-1">Email</label>
                <input type="email" id="customer-email" class="border rounded px-3 py-2 w-full bg-gray-100 cursor-not-allowed" readonly>
            </div>
            <div>
                <label class="block font-medium mb-1">Số điện thoại</label>
                <input type="text" id="customer-phone" class="border rounded px-3 py-2 w-full bg-gray-100 cursor-not-allowed" readonly>
            </div>
            <div>
                <label class="block font-medium mb-1">Trạng thái</label>
                <select id="customer-status" class="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-purple-400">
                    <option value="1">Hoạt động</option>
                    <option value="0">Ngừng hoạt động</option>
                </select>
            </div>
        </div>

        <div class="mt-6 text-right">
            <button id="save-customer" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-purple-600">Lưu thay đổi</button>
        </div>
    </div>
</div>

<!-- Modal Lịch sử giao dịch -->
<div id="history-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden z-50">
    <div class="bg-white rounded shadow-lg w-full max-w-2xl p-6 relative">
        <h3 class="text-xl font-semibold mb-4 text-cyan-600" id="history-title">Lịch sử khách hàng</h3>
        <button id="close-history-modal" class="absolute top-2 right-2 text-red-500 hover:text-red-700">&times;</button>

        <div class="overflow-x-auto">
            <table class="w-full border-collapse text-left">
                <thead>
                    <tr class="bg-gray-200">
                        <th class="p-2 border">Mã đơn</th>
                        <th class="p-2 border">Ngày</th>
                        <th class="p-2 border">Số tiền</th>
                        <th class="p-2 border">Trạng thái</th>
                        <th class="p-2 border">Chi tiết</th>
                    </tr>
                </thead>
                <tbody id="history-list">
                    <!-- Dữ liệu sẽ render JS -->
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- Modal Chi tiết giao dịch -->
<div id="transaction-detail-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden z-50">
  <div class="bg-white rounded shadow-lg w-full max-w-3xl p-6 relative max-h-[90vh] overflow-y-auto">
    <h3 class="text-xl font-semibold mb-4 text-purple-600">Chi tiết giao dịch</h3>
    <button id="close-transaction-detail" class="absolute top-2 right-2 text-red-500 hover:text-red-700">&times;</button>
    <div id="transaction-detail-content">
        <!-- Render JS -->
    </div>
  </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', () => {
    const baseUrl = "{{ $_ENV['URL_WEB_BASE'] }}";
    const closeModalBtn = document.getElementById('close-modal');
    const modal = document.getElementById('customer-modal');

    const nameInput = document.getElementById('customer-name');
    const phoneInput = document.getElementById('customer-phone');
    const emailInput = document.getElementById('customer-email');
    const statusInput = document.getElementById('customer-status');
    const saveBtn = document.getElementById('save-customer');
    const customerList = document.getElementById('customer-list');
    const searchInput = document.getElementById('search-customer');
    const pagination = document.getElementById('pagination');

    const historyModal = document.getElementById('history-modal');
    const closeHistoryBtn = document.getElementById('close-history-modal');
    const historyList = document.getElementById('history-list');
    const historyTitle = document.getElementById('history-title');
    const detailModal = document.getElementById('transaction-detail-modal');
    const closeDetailBtn = document.getElementById('close-transaction-detail');
    const detailContent = document.getElementById('transaction-detail-content');

    // Data chính
    let customers = [];
    let filteredCustomers = [];
    const rowsPerPage = 5;
    let currentPage = 1;

    // Fetch khách hàng
    fetch(baseUrl + '/api/doc-khach-hang')
        .then(res => res.json())
        .then(data => {
            if (data.success && Array.isArray(data.data)) {
                customers = [...data.data];
                filteredCustomers = [...customers];
                renderCustomers();
            } else {
                customerList.innerHTML = `
                    <tr><td colspan="5" class="text-center text-gray-500 py-4">
                        Không có khách hàng nào.
                    </td></tr>`;
            }
        })
        .catch(err => {
            console.error('Fetch Error:', err);
            customerList.innerHTML = `
                <tr><td colspan="5" class="text-center text-red-500 py-4">
                    Lỗi kết nối máy chủ.
                </td></tr>`;
        });

    // Render khách hàng
    function renderCustomers(list = filteredCustomers, page = currentPage) {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const pageItems = list.slice(start, end);

        customerList.innerHTML = '';
        pageItems.forEach(c => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="p-3 border">${c.ho_ten}</td>
                <td class="p-3 border">${c.so_dien_thoai}</td>
                <td class="p-3 border">${c.email}</td>
                <td class="p-3 border">
                    ${Number(c.trang_thai) === 1
                        ? `<span class="px-2 py-1 text-xs rounded bg-green-100 text-green-800">Hoạt động</span>`
                        : `<span class="px-2 py-1 text-xs rounded bg-red-100 text-red-800">Ngừng hoạt động</span>`
                    }
                </td>
                <td class="p-3 border flex gap-2">
                    <button class="edit px-2 py-1 bg-yellow-400 text-white rounded" data-id="${c.id}">Sửa</button>
                    <button class="history px-2 py-1 bg-red-500 text-white rounded" data-id="${c.id}">Lịch sử</button>
                </td>
            `;
            customerList.appendChild(tr);
        });

        renderPagination(list);
    }

    function renderPagination(list) {
        const totalPages = Math.ceil(list.length / rowsPerPage);
        pagination.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            btn.className = `px-3 py-1 border rounded ${i===currentPage?'bg-purple-500 text-white':'bg-white hover:bg-purple-100'}`;
            btn.addEventListener('click', () => {
                currentPage = i;
                renderCustomers(list, currentPage);
            });
            pagination.appendChild(btn);
        }
    }

    closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));
    closeHistoryBtn.addEventListener('click', () => historyModal.classList.add('hidden'));
    closeDetailBtn.addEventListener('click', () => detailModal.classList.add('hidden'));

    // Click trong bảng
    customerList.addEventListener('click', e => {
        const id = parseInt(e.target.dataset.id);
        if (e.target.classList.contains('edit')) {
            const c = customers.find(c => c.id === id);
            if (!c) return;
            nameInput.value = c.ho_ten;
            phoneInput.value = c.so_dien_thoai;
            emailInput.value = c.email;
            statusInput.value = c.trang_thai; 
            modal.classList.remove('hidden');
        }
        if (e.target.classList.contains('history')) {
            const c = customers.find(c => c.id === id);
            historyTitle.textContent = `Lịch sử của ${c.ho_ten}`;

            fetch(baseUrl + '/api/doc-giao-dich/' + id)
                .then(res => res.json())
                .then(data => {
                    historyList.innerHTML = '';
                    if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                        data.data.forEach(t => {
                            const tr = document.createElement('tr');
                            tr.innerHTML = `
                                <td class="p-2 border">${t.ma_ve}</td>
                                <td class="p-2 border">${t.ngay_dat}</td>
                                <td class="p-2 border">${parseFloat(t.tong_tien).toLocaleString()} đ</td>
                                <td class="p-2 border">
                                    ${renderTrangThai(t.trang_thai)}
                                </td>
                                <td class="p-2 border">
                                    <button class="view-detail px-2 py-1 bg-blue-500 text-white rounded" data-id="${t.id}">Chi tiết</button>
                                </td>
                            `;
                            historyList.appendChild(tr);
                        });
                    } else {
                        historyList.innerHTML = `
                            <tr>
                                <td colspan="5" class="text-center text-gray-500 py-4">
                                    Chưa có giao dịch
                                </td>
                            </tr>`;
                    }
                    historyModal.classList.remove('hidden');
                })
                .catch(err => {
                    console.error('Fetch Error:', err);
                    historyList.innerHTML = `
                        <tr>
                            <td colspan="5" class="text-center text-red-500 py-4">
                                Lỗi khi tải dữ liệu
                            </td>
                        </tr>`;
                    historyModal.classList.remove('hidden');
                });
        }
    });

    historyList.addEventListener('click', e => {
        if (e.target.classList.contains('view-detail')) {
            const donhangId = e.target.dataset.id;

            fetch(`${baseUrl}/api/doc-chi-tiet-don-hang/${donhangId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        const ve = Array.isArray(data.data) ? data.data[0] : data.data;

                        let startTime = ve.ve?.[0]?.suat_chieu?.batdau 
                            ? new Date(ve.ve[0].suat_chieu.batdau) 
                            : null;

                        const isCancelled = Number(ve.trang_thai) === 0;
                        const canCancel = Number(ve.trang_thai) === 2; // chỉ hoàn vé khi đã thanh toán

                        let html = `
                        <div class="relative ${isCancelled ? 'modal-cancelled' : ''} space-y-2 p-2 max-h-[80vh] overflow-y-auto">
                            ${isCancelled ? `<div class="modal-cancelled-overlay"><span>Đã hoàn vé</span></div>` : ''}

                            <!-- Thông tin phim -->
                            <div class="p-3 bg-white rounded shadow">
                                <h5 class="font-bold text-lg flex items-center gap-2">
                                    ${ve.ve?.[0]?.suat_chieu?.phim?.ten_phim || 'Không xác định'}
                                    <span class="inline-block px-2 py-0.5 text-xs font-semibold text-white bg-red-500 rounded">
                                        ${ve.ve?.[0]?.suat_chieu?.phim?.do_tuoi || 'C'}
                                    </span>
                                </h5>
                            </div>

                            <!-- Thông tin rạp -->
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

                            <!-- Ghế -->
                            <div class="p-2 bg-white rounded shadow text-sm">
                                <span class="font-semibold">Ghế:</span>
                                <span>${ve.ve?.map(v=>v.ghe?.so_ghe).filter(Boolean).join(', ') || '-'}</span>
                            </div>

                            <!-- Thức ăn + Mã vé -->
                            <div class="p-3 bg-white rounded shadow text-sm text-gray-700 grid grid-cols-2 gap-4">
                                <div class="space-y-2">
                                    <div>
                                        <h4 class="font-semibold mb-1">Thức ăn kèm:</h4>
                                        ${
                                            ve.ve?.flatMap(v=>v.don_hang?.chi_tiet_don_hang||[])
                                                .map(item=> `
                                                    <div class="flex justify-between border-b border-gray-100 py-1">
                                                        <span>${item.san_pham?.ten || '-'} x ${item.so_luong || 0}</span>
                                                        <span class="font-semibold">${Number(item.thanh_tien || 0).toLocaleString()} ₫</span>
                                                    </div>
                                                `).join('') || '<p>Không có</p>'
                                        }
                                    </div>

                                    <div>
                                        <h4 class="font-semibold mb-1">Thẻ quà tặng:</h4>
                                        <div class="flex justify-between border-b border-gray-100 py-1">
                                            ${ve.the_qua_tang_su_dung > 0 
                                                ? `<span>${Number(ve.the_qua_tang_su_dung || 0).toLocaleString()} ₫</span>` 
                                                : '<span>Không có</span>'
                                            }
                                        </div>
                                    </div>
                                </div>

                                <div class="flex flex-col items-center gap-1">
                                    <span class="font-semibold text-sm">Mã vé</span>
                                    <span class="text-blue-600 font-mono text-base">${ve.ma_ve || '-'}</span>
                                    <img src="${ve.qr_code || ''}" alt="QR Code" class="w-24 h-24 ${ve.qr_code ? '' : 'hidden'}">
                                </div>
                            </div>
                        </div>
                        `;

                        detailContent.innerHTML = html;
                    } else {
                        detailContent.innerHTML = '<p class="text-center text-gray-500">Không có dữ liệu chi tiết.</p>';
                    }
                    detailModal.classList.remove('hidden');
                })
                .catch(err => {
                    console.error(err);
                    detailContent.innerHTML = '<p class="text-center text-red-500">Lỗi khi tải chi tiết.</p>';
                    detailModal.classList.remove('hidden');
                });
        }
    });

    function renderTrangThai(trang_thai) {
        switch (Number(trang_thai)) {
            case 2: return '<span class="text-green-600 font-semibold">Đã thanh toán</span>';
            case 1: return '<span class="text-orange-500 font-semibold">Chờ thanh toán</span>';
            case 0: return '<span class="text-red-600 font-semibold">Đã hủy</span>';
            default: return '<span class="text-gray-500">Không xác định</span>';
        }
    }

    // Tìm kiếm
    searchInput.addEventListener('input', () => {
        const q = searchInput.value.toLowerCase();
        filteredCustomers = customers.filter(c =>
            c.email.toLowerCase().includes(q) || c.so_dien_thoai.includes(q)
        );
        renderCustomers();
    });

    saveBtn.addEventListener('click', () => {
        const id = parseInt(document.querySelector('.edit[data-id]').dataset.id || 0);
        if (!id) return;

        const trangThaiMoi = statusInput.value; // 0 hoặc 1

        fetch(`${baseUrl}/api/trang-thai-khach-hang/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ trang_thai: trangThaiMoi })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                // Cập nhật mảng customers để render lại
                const idx = customers.findIndex(c => c.id === id);
                if (idx !== -1) {
                    customers[idx].trang_thai = Number(trangThaiMoi);
                }
                filteredCustomers = [...customers];
                renderCustomers(filteredCustomers, currentPage);
                modal.classList.add('hidden');
                alert('Cập nhật trạng thái thành công');
            } else {
                alert(data.message || 'Cập nhật thất bại');
            }
        })
        .catch(err => {
            console.error(err);
            alert('Có lỗi xảy ra khi cập nhật trạng thái');
        });
    });
});
</script>
@endsection
