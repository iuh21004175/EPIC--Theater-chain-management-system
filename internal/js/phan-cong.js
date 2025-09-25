document.addEventListener('DOMContentLoaded', async function() {
    // Lấy danh sách vị trí công việc từ API
    let viTriCongViecs = [];
    let phanCongTuan = []; // Lưu dữ liệu phân công của tuần hiện tại
    const tbody = document.getElementById('template-table-body');
    // Fetch vị trí công việc từ API
    async function fetchViTriCongViecs() {
        try {
            const url = tbody?.dataset.url;
            const res = await fetch(`${url}/api/vi-tri-cong-viec`);
            const data = await res.json();  
            if (data.success && Array.isArray(data.data)) {
                viTriCongViecs = data.data;
                
            } else {
                viTriCongViecs = [];
            }
        } catch (e) {
            viTriCongViecs = [];
        }
    }
    async function fetchPhanCongTuan(startDate, endDate) {
        const url = phancongMainTbody.dataset.url || '';
        const res = await fetch(`${url}/api/phan-cong?bat_dau=${startDate}&ket_thuc=${endDate}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
            phanCongTuan = data.data;
        } else {
            phanCongTuan = [];
        }
    }
    await fetchViTriCongViecs();
    
    const ngayTypes = [
        { key: "thuong", label: "Ngày thường" },
        { key: "cuoituan", label: "Cuối tuần" },
        { key: "le", label: "Ngày lễ" },
        { key: "tet", label: "Ngày tết" }
    ];
    const caTypes = [
        { key: "morning", label: "Ca sáng" },
        { key: "afternoon", label: "Ca chiều" },
        { key: "evening", label: "Ca tối" }
    ];
    let currentCa = "morning";
    let templateData = {}; // {ca: {vitri: {ngay: value}}}

    

    // Render bảng bố cục
    function renderTemplateTable() {
        tbody.innerHTML = viTriCongViecs.map(vt => `
            <tr>
                <td class="border px-4 py-2 bg-gray-50 text-left">${vt.ten}</td>
                ${ngayTypes.map(ngay => `
                    <td class="border px-2 py-2">
                        <input type="number" min="0" class="w-16 border rounded px-2 py-1 text-center"
                            value="${(templateData[currentCa]?.[vt.id]?.[ngay.key] ?? '')}"
                            data-vitri="${vt.id}" data-ngay="${ngay.key}" />
                    </td>
                `).join('')}
            </tr>
        `).join('');
        // Lưu dữ liệu khi nhập
        tbody.querySelectorAll('input[type="number"]').forEach(input => {
            input.oninput = function() {
                if (!templateData[currentCa]) templateData[currentCa] = {};
                if (!templateData[currentCa][this.dataset.vitri]) templateData[currentCa][this.dataset.vitri] = {};
                templateData[currentCa][this.dataset.vitri][this.dataset.ngay] = this.value;
            };
        });
    }

    // Hiển thị modal
    document.getElementById('btn-template').onclick = async function() {
        document.getElementById('modal-template').classList.remove('hidden');
        renderTemplateTable();
    };
    document.getElementById('btn-close-template').onclick =
    document.getElementById('btn-cancel-template').onclick = function() {
        document.getElementById('modal-template').classList.add('hidden');
    };

    // Chuyển ca
    document.querySelectorAll('.ca-btn').forEach(btn => {
        btn.onclick = function() {
            document.querySelectorAll('.ca-btn').forEach(b => b.classList.remove('bg-blue-600', 'text-white', 'bg-gray-200', 'text-gray-700'));
            this.classList.add('bg-blue-600', 'text-white');
            currentCa = this.dataset.ca;
            renderTemplateTable();
        };
    });

    // Lưu bố cục (tùy ý xử lý)
    document.getElementById('btn-save-template').onclick = function() {
        document.getElementById('modal-template').classList.add('hidden');
        // alert(JSON.stringify(templateData));
    };

    // --- Nhân viên phân trang ---
    let nhanViens = [];
    let nvPagination = { current_page: 1, per_page: 10, total: 0, total_pages: 1 };
    const nvList = document.getElementById('nv-list');
    const nvPaginationBar = document.getElementById('nv-pagination-bar');

    async function fetchNhanViens(page = 1) {
        try {
            const url = nvList.dataset.url || '';
            const res = await fetch(`${url}/api/nhan-vien?page=${page}&per_page=10`);
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                nhanViens = data.data;
                nvPagination = data.pagination;
            } else {
                nhanViens = [];
                nvPagination = { current_page: 1, per_page: 10, total: 0, total_pages: 1 };
            }
        } catch (e) {
            nhanViens = [];
            nvPagination = { current_page: 1, per_page: 10, total: 0, total_pages: 1 };
        }
    }

    function renderNhanVienList() {
        nvList.innerHTML = nhanViens.filter(nv => nv.trang_thai == 1).map(nv => {
            const hasAvatar = nv.avatar_url && nv.avatar_url.trim() !== '';
            const firstChar = nv.ten ? nv.ten.trim().charAt(0) : '?';
            return `
            <div class="nv-card flex items-center gap-2 p-2 border rounded bg-gray-50 hover:bg-blue-50 cursor-move"
             draggable="true" data-id="${nv.id}">
            ${
                hasAvatar
                ? `<img src="${nv.avatar_url}" class="w-10 h-10 rounded-full border" alt="${firstChar}">`
                : `<div class="w-10 h-10 flex items-center justify-center rounded-full border bg-gray-300 text-gray-700 font-bold text-lg">${firstChar}</div>`
            }
            <div>
                <div class="font-semibold">${nv.ten}</div>
                
            </div>
            
            </div>
            `;
        }).join('');
        // Drag event
        nvList.querySelectorAll('.nv-card').forEach(card => {
            card.addEventListener('dragstart', function(e) {
                e.dataTransfer.setData('nvId', this.dataset.id);
            });
        });
        renderNvPagination();
    }

    function renderNvPagination() {
        if (nvPagination.total_pages <= 1) {
            nvPaginationBar.innerHTML = '';
            return;
        }
        let html = '';
        for (let i = 1; i <= nvPagination.total_pages; i++) {
            html += `<button class="px-2 py-1 rounded ${i === nvPagination.current_page ? 'bg-blue-600 text-white' : 'bg-gray-200'}" data-page="${i}">${i}</button>`;
        }
        nvPaginationBar.innerHTML = html;
        nvPaginationBar.querySelectorAll('button').forEach(btn => {
            btn.onclick = async function() {
                await fetchNhanViens(Number(this.dataset.page));
                renderNhanVienList();
            };
        });
    }

    let currentWeekStart = dayjs().startOf('week').add(1, 'day'); // Thứ 2 tuần hiện tại

    function updateWeekTitle() {
        const weekTitle = document.getElementById('week-title');
        const weekNumber = currentWeekStart.isoWeek();
        const start = currentWeekStart.format('DD/MM/YYYY');
        const end = currentWeekStart.add(6, 'day').format('DD/MM/YYYY');
        weekTitle.textContent = `Tuần ${weekNumber} (${start} - ${end})`;
    }

    // --- Phân công ---
    const phancongHeaderRow = document.getElementById('phancong-header-row');
    const phancongMainTbody = document.getElementById('phancong-main-tbody');
    const caLabels = [
        { key: 'morning', label: 'Ca sáng' },
        { key: 'afternoon', label: 'Ca chiều' },
        { key: 'evening', label: 'Ca tối' }
    ];
    const thuLabels = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];

    let ngayLoaiMap = {}; // { 'YYYY-MM-DD': 'le' | 'tet' | 'cuoituan' | 'thuong' }

    async function fetchLoaiNgayOfWeek(startDay) {
        // Gọi API lấy danh sách ngày đặc biệt trong tháng
        const thang = startDay.month() + 1;
        const nam = startDay.year();
        const url = tbody?.dataset.url || '';
        const res = await fetch(`${url}/api/gan-ngay/${thang}-${nam}`);
        const data = await res.json();
        ngayLoaiMap = {};
        if (data.success && Array.isArray(data.data)) {
            data.data.forEach(item => {
                ngayLoaiMap[item.ngay] = item.loai_ngay === 'Ngày tết' ? 'tet'
                    : item.loai_ngay === 'Ngày lễ' ? 'le'
                    : 'dac_biet';
            });
        }
    }

    function getLoaiNgay(date) {
        const iso = date.format('YYYY-MM-DD');
        if (ngayLoaiMap[iso] === 'le') return 'le';
        if (ngayLoaiMap[iso] === 'tet') return 'tet';
        if (date.day() === 0) return 'cuoituan'; // Chủ nhật
        if (date.day() === 6) return 'cuoituan'; // Thứ 7
        return 'thuong';
    }

    function getCellBgClass(loai) {
        switch (loai) {
            case 'le': return 'bg-yellow-100';
            case 'tet': return 'bg-red-100';
            case 'cuoituan': return 'bg-blue-50';
            default: return 'bg-white';
        }
    }

    function renderPhanCongTable() {
        // Render header
        let days = [];
        let today = dayjs();
        let d = currentWeekStart;
        phancongHeaderRow.innerHTML = `<th class="border px-4 py-2 bg-gray-100">Ca / Ngày</th>` +
            Array.from({length: 7}).map((_, i) => {
                const day = d.add(i, 'day');
                days.push(day);
                const isToday = day.isSame(today, 'day');
                return `<th class="border px-4 py-2 ${isToday ? 'bg-green-200 font-bold' : 'bg-gray-100'}">${thuLabels[i]}<br><span class="text-xs">${day.format('DD/MM')}</span></th>`;
            }).join('');

        // Render body
        phancongMainTbody.innerHTML = caLabels.map(ca => {
            return `<tr>
                <td class="border px-4 py-2 bg-gray-50 font-semibold">${ca.label}</td>
                ${days.map(day => {
                    const loai = getLoaiNgay(day);
                    // Xác định giờ bắt đầu của ca
                    let caHour = 8;
                    if (ca.key === 'afternoon') caHour = 14;
                    if (ca.key === 'evening') caHour = 18;
                    const cellTime = dayjs(day.format('YYYY-MM-DD') + ` ${caHour}:00`, 'YYYY-MM-DD HH:mm');
                    const now = dayjs();
                    // Nếu thời gian ô < hiện tại thì thêm class đặc biệt
                    const isPast = cellTime.isBefore(now, 'minute');
                    let cellClass = '';
                    if (isPast) {
                        cellClass = 'bg-gray-300 text-gray-500 opacity-80 border-gray-300';
                    } else {
                        cellClass = getCellBgClass(loai);
                    }
                    return `<td class="border px-2 py-2 phancong-cell ${cellClass}" 
                        data-ca="${ca.key}" data-date="${day.format('YYYY-MM-DD')}" 
                        data-loai="${loai}">
                        <div class="phancong-dropzone min-h-[40px]"></div>
                    </td>`;
                }).join('')}
            </tr>`;
        }).join('');
        // Drag & drop logic có thể bổ sung ở đây

        // Kích hoạt drag & drop cho các ô phân công
        phancongMainTbody.querySelectorAll('.phancong-dropzone').forEach(dropzone => {
            dropzone.addEventListener('dragover', function(e) {
                const nvId = e.dataTransfer.getData('nvId');
                // Lấy thông tin ngày và ca của ô
                const cell = this.closest('.phancong-cell');
                const dateStr = cell.dataset.date;
                const ca = cell.dataset.ca;
                // Xác định giờ bắt đầu của ca
                let caHour = 8; // Ca sáng
                if (ca === 'afternoon') caHour = 14;
                if (ca === 'evening') caHour = 18;
                const cellTime = dayjs(dateStr + ` ${caHour}:00`, 'YYYY-MM-DD HH:mm');
                const now = dayjs();
                // Nếu thời gian ô < hiện tại thì không cho phép thả
                if (cellTime.isBefore(now, 'minute')) {
                    e.preventDefault();
                    this.classList.remove('ring', 'ring-blue-400');
                    this.style.cursor = 'not-allowed';
                    e.dataTransfer.dropEffect = 'none';
                    return;
                }
                // Kiểm tra trùng nhân viên
                if (nvId && this.querySelector(`.phancong-nv[data-id="${nvId}"]`)) {
                    e.preventDefault();
                    this.classList.remove('ring', 'ring-blue-400');
                    this.style.cursor = 'not-allowed';
                    e.dataTransfer.dropEffect = 'none';
                } else {
                    e.preventDefault();
                    this.classList.add('ring', 'ring-blue-400');
                    this.style.cursor = 'pointer';
                    e.dataTransfer.dropEffect = 'copy';
                }
            });
            dropzone.addEventListener('dragleave', function() {
                this.classList.remove('ring', 'ring-blue-400');
                this.style.cursor = '';
            });
            dropzone.addEventListener('drop', async function(e) {
                // Lấy thông tin ngày và ca của ô
                const cell = this.closest('.phancong-cell');
                const dateStr = cell.dataset.date;
                const ca = cell.dataset.ca;
                let caHour = 8;
                if (ca === 'afternoon') caHour = 14;
                if (ca === 'evening') caHour = 18;
                const cellTime = dayjs(dateStr + ` ${caHour}:00`, 'YYYY-MM-DD HH:mm');
                const now = dayjs();
                // Nếu thời gian ô < hiện tại thì không cho phép thả
                if (cellTime.isBefore(now, 'minute')) {
                    this.classList.remove('ring', 'ring-blue-400');
                    this.style.cursor = '';
                    return;
                }
                e.preventDefault();
                this.classList.remove('ring', 'ring-blue-400');
                this.style.cursor = '';
                const nvId = e.dataTransfer.getData('nvId');
                if (!nvId || this.querySelector(`.phancong-nv[data-id="${nvId}"]`)) return;
                const nv = nhanViens.find(nv => nv.id == nvId);
                if (!nv) return;

                // Hiện modal chọn vị trí công việc
                const modal = document.createElement('div');
                modal.className = "fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[9999]";
                modal.innerHTML = `
                    <div class="bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
                        <h3 class="text-lg font-bold mb-4">Chọn vị trí công việc</h3>
                        <div id="vitri-modal-list" class="mb-4 text-left"></div>
                        <div class="flex justify-end gap-2">
                            <button id="vitri-modal-cancel" class="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Hủy</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);

                // Load danh sách vị trí công việc
                const vitriListDiv = modal.querySelector('#vitri-modal-list');
                if (viTriCongViecs.length) {
                    vitriListDiv.innerHTML = viTriCongViecs.map(vt => `
                        <button class="vitri-modal-item w-full text-left px-3 py-2 rounded hover:bg-blue-100 border mb-2" data-id="${vt.id}" data-ten="${vt.ten}">
                            ${vt.ten}
                        </button>
                    `).join('');
                    // Chọn vị trí
                    vitriListDiv.querySelectorAll('.vitri-modal-item').forEach(btn => {
                        btn.onclick = async () => {
                            // Gọi API tạo phân công
                            const formData = new FormData();
                            formData.append('id_nhanvien', nv.id);
                            formData.append('id_congviec', btn.dataset.id);
                            formData.append('ngay', dateStr);
                            formData.append('ca', ca === 'morning' ? 'Ca sáng' : ca === 'afternoon' ? 'Ca chiều' : 'Ca tối');

                            const url = nvList.dataset.url || '';
                            const res = await fetch(`${url}/api/phan-cong`, {
                                method: 'POST',
                                body: formData
                            });
                            const data = await res.json();
                            if (data.success && data.data && data.data.id) {
                                // Thêm nhân viên vào ô với id phân công
                                this.insertAdjacentHTML('beforeend', `
                                    <div class="phancong-nv flex items-center gap-1 bg-blue-100 rounded px-2 py-1 text-xs font-medium mt-1 relative group"
                                        data-id="${nv.id}" data-vitri="${btn.dataset.id}" data-phancong-id="${data.data.id}">
                                        ${nv.avatar_url && nv.avatar_url.trim() !== ''
                                            ? `<img src="${nv.avatar_url}" class="w-6 h-6 rounded-full border">`
                                            : `<div class="w-6 h-6 flex items-center justify-center rounded-full border bg-gray-300 text-gray-700 font-bold text-xs">${nv.ten.trim().charAt(0).toUpperCase()}</div>`
                                        }
                                        <span>${nv.ten}</span>
                                        <button type="button" class="phancong-nv-remove ml-1 text-gray-500 hover:text-red-600 rounded-full w-4 h-4 flex items-center justify-center absolute -top-1 -right-1 bg-white border border-gray-300 group-hover:visible invisible" title="Xóa">
                                            &times;
                                        </button>
                                    </div>
                                `);
                                // Gắn sự kiện xóa cho nút vừa thêm
                                const lastNv = this.querySelector('.phancong-nv:last-child .phancong-nv-remove');
                                if (lastNv) {
                                    lastNv.onclick = async function(e) {
                                        e.stopPropagation();
                                        const nvDiv = this.closest('.phancong-nv');
                                        const cell = this.closest('.phancong-cell');
                                        const phanCongId = nvDiv.getAttribute('data-phancong-id');
                                        if (phanCongId) {
                                            await fetch(`${url}/api/phan-cong/${phanCongId}`, { method: 'DELETE' });
                                        }
                                        nvDiv.remove();
                                        if (cell && cell.querySelectorAll('.phancong-nv').length === 0 && cell._phancongTooltip) {
                                            cell._phancongTooltip.remove();
                                            cell._phancongTooltip = null;
                                        }
                                    };
                                }
                                modal.remove();
                            } else {
                                alert('Không thể phân công. Vui lòng thử lại!');
                                modal.remove();
                            }
                        };
                    });
                } else {
                    vitriListDiv.innerHTML = '<div class="text-red-500">Không có vị trí công việc nào.</div>';
                }

                // Đóng modal
                modal.querySelector('#vitri-modal-cancel').onclick = () => modal.remove();
                modal.onclick = e => { if (e.target === modal) modal.remove(); };
            });
        });
        phancongMainTbody.querySelectorAll('.phancong-cell').forEach(cell => {
            cell.onmouseenter = function(e) {
                const nvs = this.querySelectorAll('.phancong-nv');
                if (!nvs.length) return;
                // Tính tổng số nhân viên theo vị trí (theo tên vị trí)
                const vitriMap = {};
                nvs.forEach(nvDiv => {
                    const vitriId = nvDiv.dataset.vitri || 'Chưa chọn';
                    // Lấy tên vị trí công việc từ biến toàn cục
                    const vitriObj = viTriCongViecs.find(vt => String(vt.id) === String(vitriId));
                    const vitriTen = vitriObj ? vitriObj.ten : vitriId;
                    if (!vitriMap[vitriTen]) vitriMap[vitriTen] = [];
                    vitriMap[vitriTen].push(nvDiv.querySelector('span').innerText);
                });
                // Tạo nội dung tooltip
                let html = `<div class="font-semibold mb-1">Danh sách nhân viên:</div>`;
                Object.entries(vitriMap).forEach(([vitri, ds]) => {
                    html += `<div class="mb-1"><span class="font-medium">${vitri}</span> <span class="text-xs text-gray-500">(${ds.length})</span><br>
                        <span class="ml-2 text-xs">${ds.join(', ')}</span>
                    </div>`;
                });
                // Tạo overlay
                let tooltip = document.createElement('div');
                tooltip.className = "phancong-tooltip absolute z-50 bg-white border rounded shadow-lg p-3 text-left text-sm";
                tooltip.style.top = (this.getBoundingClientRect().top + window.scrollY + this.offsetHeight + 4) + "px";
                tooltip.style.left = (this.getBoundingClientRect().left + window.scrollX) + "px";
                tooltip.innerHTML = html;
                document.body.appendChild(tooltip);
                this._phancongTooltip = tooltip;
            };
            cell.onmouseleave = function() {
                if (this._phancongTooltip) {
                    this._phancongTooltip.remove();
                    this._phancongTooltip = null;
                }
                // Xóa mọi tooltip còn sót lại trên body (phòng trường hợp lỗi)
                document.querySelectorAll('.phancong-tooltip').forEach(tip => tip.remove());
            };
        });
        // Sau khi render xong bảng...
        phanCongTuan.forEach(pc => {
            // Xác định ca key
            let caKey = '';
            if (pc.ca === 'Ca sáng') caKey = 'morning';
            else if (pc.ca === 'Ca chiều') caKey = 'afternoon';
            else if (pc.ca === 'Ca tối') caKey = 'evening';
            // Tìm đúng ô
            const cell = phancongMainTbody.querySelector(`.phancong-cell[data-date="${pc.ngay}"][data-ca="${caKey}"] .phancong-dropzone`);
            if (cell) {
                // Lấy thông tin nhân viên và vị trí công việc từ object trả về
                const nv = pc.nhan_vien;
                const vt = pc.cong_viec;
                cell.insertAdjacentHTML('beforeend', `
                    <div class="phancong-nv flex items-center gap-1 bg-blue-100 rounded px-2 py-1 text-xs font-medium mt-1 relative group"
                        data-id="${nv ? nv.id : pc.id_nhanvien}" data-vitri="${vt ? vt.id : pc.id_congviec}" data-phancong-id="${pc.id}">
                        ${nv && nv.avatar_url && nv.avatar_url.trim() !== ''
                            ? `<img src="${nv.avatar_url}" class="w-6 h-6 rounded-full border">`
                            : `<div class="w-6 h-6 flex items-center justify-center rounded-full border bg-gray-300 text-gray-700 font-bold text-xs">${nv && nv.ten ? nv.ten.trim().charAt(0).toUpperCase() : '?'}</div>`
                        }
                        <span>${nv ? nv.ten : 'NV'}</span>
                        <button type="button" class="phancong-nv-remove ml-1 text-gray-500 hover:text-red-600 rounded-full w-4 h-4 flex items-center justify-center absolute -top-1 -right-1 bg-white border border-gray-300 group-hover:visible invisible" title="Xóa">
                            &times;
                        </button>
                    </div>
                `);
            }
        });
        // Gắn lại sự kiện xóa cho tất cả nút xóa nhân viên trong ô
        phancongMainTbody.querySelectorAll('.phancong-nv-remove').forEach(btn => {
            btn.onclick = async function(e) {
                e.stopPropagation();
                const nvDiv = this.closest('.phancong-nv');
                const cell = this.closest('.phancong-cell');
                const phanCongId = nvDiv.getAttribute('data-phancong-id');
                const url = nvList.dataset.url || '';
                if (phanCongId) {
                    await fetch(`${url}/api/phan-cong/${phanCongId}`, { method: 'DELETE' });
                }
                nvDiv.remove();
                cell._phancongTooltip.remove();
                cell._phancongTooltip = null;
            };
        });
    }

    // Khi chuyển tuần, fetch lại loại ngày và render bảng
    async function reloadPhanCongTable() {
        await fetchLoaiNgayOfWeek(currentWeekStart);
        // Lấy ngày bắt đầu và kết thúc tuần
        const start = currentWeekStart.format('YYYY-MM-DD');
        const end = currentWeekStart.add(6, 'day').format('YYYY-MM-DD');
        await fetchPhanCongTuan(start, end);
        renderPhanCongTable();
    }

    // Sửa lại sự kiện chuyển tuần:
    document.getElementById('btn-prev-week').onclick = async function() {
        currentWeekStart = currentWeekStart.subtract(7, 'day');
        updateWeekTitle();
        await reloadPhanCongTable();
    };
    document.getElementById('btn-next-week').onclick = async function() {
        currentWeekStart = currentWeekStart.add(7, 'day');
        updateWeekTitle();
        await reloadPhanCongTable();
    };

    // --- Khởi tạo ---
    await reloadPhanCongTable();
    await fetchNhanViens(1);
    renderNhanVienList();
    updateWeekTitle();

});