document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.getElementById('lich-table-body');
    const appElement = document.getElementById('duyet-lich-goi-video-app');
    const urlBase = appElement?.dataset.url;
    // Fallback: Nếu không có data-urlinternal, dùng urlBase + '/internal'
    const urlInternal = appElement?.dataset.urlinternal;
    
    // Kiểm tra nếu element không tồn tại (không phải trang tư vấn)
    if (!tableBody || !urlBase) {
        console.warn('Missing required elements or data attributes');
        return;
    }
    
    console.log('🔧 Config:', { urlBase, urlInternal });

    // Kết nối Socket.IO
    const socket = io('http://localhost:3000/video');

    // Biến để track xem đã load dữ liệu chưa
    let dataLoaded = false;

    // Load danh sách lịch
    async function loadDanhSachLich() {
        try {
            const response = await fetch(`${urlBase}/api/goi-video/danh-sach-lich`);
            const result = await response.json();

            if (result.success) {
                renderDanhSachLich(result.data);
                dataLoaded = true;
            } else {
                tableBody.innerHTML = `<tr><td colspan="6" class="px-6 py-4 text-center text-sm text-red-500">${result.message}</td></tr>`;
            }
        } catch (error) {
            console.error('Lỗi load danh sách:', error);
        }
    }

    // Render danh sách
    function renderDanhSachLich(danhSach) {
        if (danhSach.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">Không có lịch gọi video</td></tr>`;
            return;
        }

        tableBody.innerHTML = danhSach.map(lich => `
            <tr>
                <td class="px-6 py-4">
                    <div class="text-sm font-medium">${lich.khachhang.ho_ten}</div>
                    <div class="text-sm text-gray-500">${lich.khachhang.email}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm">${lich.chu_de}</div>
                </td>
                <td class="px-6 py-4 text-sm">${formatDateTime(lich.thoi_gian_dat)}</td>
                <td class="px-6 py-4">${getTrangThaiBadge(lich.trang_thai)}</td>
                <td class="px-6 py-4 text-sm">${lich.nhanvien ? lich.nhanvien.ho_ten : '-'}</td>
                <td class="px-6 py-4 text-right">${getActions(lich)}</td>
            </tr>
        `).join('');

        attachEventListeners();
    }

    function getTrangThaiBadge(trangThai) {
        const badges = {
            1: '<span class="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Chờ NV</span>',
            2: '<span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Đã chọn NV</span>',
            3: '<span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Đang gọi</span>',
            4: '<span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Hoàn thành</span>'
        };
        return badges[trangThai] || '';
    }

    function getActions(lich) {
        if (lich.trang_thai === 1) {
            // Trạng thái "Chờ nhân viên" - Cho phép chọn tư vấn
            return `<button class="btn-chon text-blue-600 hover:text-blue-900 font-medium" data-id="${lich.id}">Chọn tư vấn</button>`;
        } else if (lich.trang_thai === 2) {
            // Trạng thái "Đã chọn NV" - Hiển thị nút Gọi và Hủy
            // ✅ Dùng urlInternal để link đến /internal/video-call
            return `<a href="${urlInternal}/video-call?room=${lich.room_id}" 
                       class="inline-block px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors mr-2">
                        <i class="fas fa-video mr-1"></i> Gọi ngay
                    </a>
                    <button class="btn-huy px-4 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors" 
                            data-id="${lich.id}">
                        <i class="fas fa-times mr-1"></i> Hủy
                    </button>`;
        } else if (lich.trang_thai === 3) {
            // Trạng thái "Đang gọi" - Cho phép vào lại room
            return `<a href="${urlInternal}/video-call?room=${lich.room_id}" 
                       class="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors">
                        <i class="fas fa-video mr-1"></i> Vào lại
                    </a>`;
        }
        return '<span class="text-gray-400">-</span>';
    }

    function attachEventListeners() {
        document.querySelectorAll('.btn-chon').forEach(btn => {
            btn.addEventListener('click', async function() {
                if (confirm('Bạn muốn nhận tư vấn cho khách hàng này?')) {
                    await chonTuVan(this.dataset.id);
                }
            });
        });

        document.querySelectorAll('.btn-huy').forEach(btn => {
            btn.addEventListener('click', async function() {
                if (confirm('Bạn muốn hủy tư vấn?')) {
                    await huyTuVan(this.dataset.id);
                }
            });
        });
    }

    async function chonTuVan(idLich) {
        const response = await fetch(`${urlBase}/api/goi-video/${idLich}/chon-tu-van`, { method: 'POST' });
        const result = await response.json();
        alert(result.message);
        if (result.success) loadDanhSachLich();
    }

    async function huyTuVan(idLich) {
        const response = await fetch(`${urlBase}/api/goi-video/${idLich}/huy`, { method: 'POST' });
        const result = await response.json();
        alert(result.message);
        if (result.success) loadDanhSachLich();
    }

    function formatDateTime(dt) {
        const d = new Date(dt);
        return `${d.toLocaleDateString('vi-VN')} ${d.toLocaleTimeString('vi-VN')}`;
    }

    socket.on('lichgoivideo:moi', () => loadDanhSachLich());

    // Load dữ liệu khi tab video được active
    const btnVideo = document.getElementById('tab-btn-video');
    if (btnVideo) {
        btnVideo.addEventListener('click', function() {
            // Load dữ liệu lần đầu khi click vào tab
            if (!dataLoaded) {
                loadDanhSachLich();
            }
        });
    } else {
        // Nếu không có tab (trang riêng), load ngay
        loadDanhSachLich();
    }
});
