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
            
            <button id="open-modal" 
                class="flex items-center px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                <svg class="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" 
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Thêm khách hàng
            </button>
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

<!-- Modal thêm/sửa khách hàng -->
<div id="customer-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden z-50">
    <div class="bg-white rounded shadow-lg w-full max-w-md p-6 relative">
        <h3 class="text-xl font-semibold mb-4 text-purple-600">Thêm khách hàng</h3>
        <button id="close-modal" class="absolute top-2 right-2 text-red-500 hover:text-red-700 text-2xl font-bold">&times;</button>

        <div class="space-y-4">
            <div>
                <label class="block font-medium mb-1">Tên khách hàng</label>
                <input type="text" id="customer-name" class="border rounded px-3 py-2 w-full" placeholder="Nhập tên khách hàng">
            </div>
            <div>
                <label class="block font-medium mb-1">Số điện thoại</label>
                <input type="text" id="customer-phone" class="border rounded px-3 py-2 w-full" placeholder="Nhập số điện thoại">
            </div>
            <div>
                <label class="block font-medium mb-1">Email</label>
                <input type="email" id="customer-email" class="border rounded px-3 py-2 w-full" placeholder="Nhập email">
            </div>
            <div>
                <label class="block font-medium mb-1">Trạng thái</label>
                <select id="customer-status" class="border rounded px-3 py-2 w-full">
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Ngừng hoạt động</option>
                </select>
            </div>
        </div>

        <div class="mt-6 text-right">
            <button id="save-customer" class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">Lưu</button>
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
                    </tr>
                </thead>
                <tbody id="history-list">
                    <!-- Dữ liệu sẽ render JS -->
                </tbody>
            </table>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', () => {
    const openModalBtn = document.getElementById('open-modal');
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

    // Mock dữ liệu khách hàng
    let customers = [
        { id: 1, name: 'Nguyễn Văn A', phone: '0123456789', email: 'a@example.com', status: 'active' },
        { id: 2, name: 'Trần Thị B', phone: '0987654321', email: 'b@example.com', status: 'inactive' },
        { id: 3, name: 'Lê Văn C', phone: '0912345678', email: 'c@gmail.com', status: 'active' },
        { id: 4, name: 'Phạm D', phone: '0934567890', email: 'd@gmail.com', status: 'active' },
        { id: 5, name: 'Hoàng E', phone: '0909876543', email: 'e@gmail.com', status: 'inactive' }
    ];

    // Mock lịch sử giao dịch
    const transactionHistory = {
        1: [
            { orderId: 'DH001', date: '2025-09-01', amount: 500000, status: 'Hoàn thành' },
            { orderId: 'DH005', date: '2025-09-10', amount: 250000, status: 'Đang xử lý' }
        ],
        2: [
            { orderId: 'DH002', date: '2025-09-03', amount: 300000, status: 'Hủy' }
        ],
        3: [
            { orderId: 'DH003', date: '2025-09-05', amount: 450000, status: 'Hoàn thành' }
        ]
    };

    let filteredCustomers = [...customers];
    const rowsPerPage = 5;
    let currentPage = 1;

    function renderCustomers(list = filteredCustomers, page = currentPage){
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const pageItems = list.slice(start, end);

        customerList.innerHTML = '';
        pageItems.forEach(c => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="p-3 border">${c.name}</td>
                <td class="p-3 border">${c.phone}</td>
                <td class="p-3 border">${c.email}</td>
                <td class="p-3 border">
                    ${
                        c.status === 'active'
                        ? `<span class="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                            </svg>
                            Hoạt động
                        </span>`
                        : `<span class="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                            Ngừng hoạt động
                        </span>`
                    }
                </td>
                <td class="p-3 border flex gap-2">
                    <button class="edit px-2 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500" data-id="${c.id}">Sửa</button>
                    <button class="delete px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600" data-id="${c.id}">Xóa</button>
                    <button class="history px-2 py-1 bg-cyan-500 text-white rounded hover:bg-cyan-600" data-id="${c.id}">Lịch sử</button>
                </td>
            `;
            customerList.appendChild(tr);
        });

        renderPagination(list);
    }

    function renderPagination(list){
        const totalPages = Math.ceil(list.length / rowsPerPage);
        pagination.innerHTML = '';

        for(let i=1; i<=totalPages; i++){
            const btn = document.createElement('button');
            btn.textContent = i;
            btn.className = `px-3 py-1 rounded border ${i===currentPage?'bg-purple-500 text-white':'bg-white text-gray-700 hover:bg-purple-200'}`;
            btn.addEventListener('click', () => {
                currentPage = i;
                renderCustomers(list, currentPage);
            });
            pagination.appendChild(btn);
        }
    }

    renderCustomers();

    openModalBtn.addEventListener('click', () => modal.classList.remove('hidden'));
    closeModalBtn.addEventListener('click', () => { modal.classList.add('hidden'); resetForm(); });
    closeHistoryBtn.addEventListener('click', () => historyModal.classList.add('hidden'));

    function resetForm() {
        nameInput.value = '';
        phoneInput.value = '';
        emailInput.value = '';
        statusInput.value = 'active';
    }

    saveBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();
        const email = emailInput.value.trim();
        const status = statusInput.value;
        if(!name || !phone || !email){
            alert('Vui lòng điền đầy đủ thông tin!');
            return;
        }
        const newCustomer = { id: Date.now(), name, phone, email, status };
        customers.push(newCustomer);
        filteredCustomers = [...customers];
        currentPage = Math.ceil(filteredCustomers.length / rowsPerPage);
        renderCustomers();
        alert('Khách hàng đã được thêm!');
        modal.classList.add('hidden');
        resetForm();
    });

    customerList.addEventListener('click', e=>{
        const id = parseInt(e.target.dataset.id);
        if(e.target.classList.contains('delete')){
            if(confirm('Bạn có chắc muốn xóa khách hàng này?')){
                customers = customers.filter(c => c.id !== id);
                filteredCustomers = [...customers];
                if((currentPage-1)*rowsPerPage >= filteredCustomers.length) currentPage--;
                renderCustomers();
            }
        }
        if(e.target.classList.contains('edit')){
            const customer = customers.find(c => c.id === id);
            nameInput.value = customer.name;
            phoneInput.value = customer.phone;
            emailInput.value = customer.email;
            statusInput.value = customer.status;
            modal.classList.remove('hidden');
            customers = customers.filter(c => c.id !== id);
            filteredCustomers = [...customers];
            if((currentPage-1)*rowsPerPage >= filteredCustomers.length) currentPage--;
            renderCustomers();
        }
        if(e.target.classList.contains('history')){
            const customer = customers.find(c => c.id === id);
            historyTitle.textContent = `Lịch sử giao dịch của ${customer.name}`;
            const history = transactionHistory[id] || [];
            historyList.innerHTML = '';
            history.forEach(t=>{
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="p-2 border">${t.orderId}</td>
                    <td class="p-2 border">${t.date}</td>
                    <td class="p-2 border">${t.amount.toLocaleString()} đ</td>
                    <td class="p-2 border">
                        <span class="px-2 py-1 rounded text-white ${t.status==='Hoàn thành'?'bg-green-500':t.status==='Đang xử lý'?'bg-yellow-500':'bg-red-500'}">
                            ${t.status}
                        </span>
                    </td>
                `;
                historyList.appendChild(tr);
            });
            historyModal.classList.remove('hidden');
        }
    });

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        filteredCustomers = customers.filter(c => 
            c.email.toLowerCase().includes(query) || c.phone.includes(query)
        );
        currentPage = 1;
        renderCustomers();
    });
});
</script>
@endsection
