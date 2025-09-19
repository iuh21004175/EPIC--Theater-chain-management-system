document.addEventListener('DOMContentLoaded', async function() {
    const sidebar = document.getElementById('sidebar-rap-list');
    const phimList = document.getElementById('phim-of-rap-list');
    const rapTitle = document.getElementById('rap-title');
    const formPhanPhoi = document.getElementById('form-phan-phoi-phim');
    let allPhim = [];
    let allRap = [];
    let currentRapId = null;

    // Lấy danh sách rạp
    const rapRes = await fetch(`${sidebar.dataset.url}/api/rap-phim`);
    const rapData = await rapRes.json();
    allRap = rapData.data || [];

    // Lấy danh sách phim
    const phimRes = await fetch(`${phimList.dataset.url}/api/phim/`);
    const phimData = await phimRes.json();
        // Modal phân phối phim mới
    const btnOpenModal = document.getElementById('btn-open-phanphoi-modal');
    const btnCloseModal = document.getElementById('btn-close-phanphoi-modal');
    const phanPhoiModal = document.getElementById('phanphoi-modal');
    const searchInput = document.getElementById('search-movie-phanphoi');
    const phanPhoiMovieList = document.getElementById('phanphoi-movie-list');
    allPhim = phimData.data || [];

    // Render sidebar rạp
    sidebar.innerHTML = allRap.map(rap => `
        <li>
            <button type="button" class="w-full text-left px-3 py-2 rounded hover:bg-blue-100 transition ${currentRapId === rap.id ? 'bg-blue-200 font-bold' : ''}" data-id="${rap.id}">
                ${rap.ten}
            </button>
        </li>
    `).join('');

    // Sự kiện chọn rạp
    sidebar.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', function() {
            sidebar.querySelectorAll('button').forEach(b => b.classList.remove('bg-blue-200', 'font-bold'));
            this.classList.add('bg-blue-200', 'font-bold');
            currentRapId = this.dataset.id;
            rapTitle.textContent = `Phân phối phim cho rạp: ${this.textContent.trim()}`;
            loadPhimOfRap(currentRapId);
        });
    });

    // Khi chọn rạp, chỉ render các phim đã phân phối
    async function loadPhimOfRap(rapId) {
        phimList.innerHTML = '<div class="col-span-full text-gray-400">Đang tải...</div>';
        const res = await fetch(`${phimList.dataset.url}/api/phan-phoi-phim/${rapId}`);
        const data = await res.json();
        const phimIds = data.success && Array.isArray(data.data) ? data.data.map(p => p.id_phim) : [];
        // Lấy thông tin phim đã phân phối
        const phimDaPhanPhoi = allPhim.filter(phim => phimIds.includes(phim.id));
        if (phimDaPhanPhoi.length === 0) {
            phimList.innerHTML = '<div class="col-span-full text-gray-400">Chưa có phim nào được phân phối cho rạp này.</div>';
            return;
        }
        phimList.innerHTML = phimDaPhanPhoi.map(phim => `
            <div class="flex items-center justify-between border rounded px-3 py-2 bg-gray-50">
                <span>${phim.ten_phim} <span class="text-xs text-gray-400">(${phim.thoi_luong} phút)</span></span>
                <button class="btn-remove-phanphoi text-red-600 hover:text-red-800" data-phim-id="${phim.id}">Bỏ phân phối</button>
            </div>
        `).join('');

        // Sự kiện bỏ phân phối
        phimList.querySelectorAll('.btn-remove-phanphoi').forEach(btn => {
            btn.addEventListener('click', async function() {
                if (!confirm('Bạn chắc chắn muốn bỏ phân phối phim này khỏi rạp?')) return;
                await fetch(`${phimList.dataset.url}/api/phan-phoi-phim/${currentRapId}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phim_id: this.dataset.phimId })
                });
                loadPhimOfRap(currentRapId);
            });
        });
    }

    // Sự kiện submit lưu phân phối
    if (formPhanPhoi) {
        formPhanPhoi.addEventListener('submit', async function(e) {
            e.preventDefault();
            if (!currentRapId) {
                alert('Vui lòng chọn rạp!');
                return;
            }
            const phimIds = Array.from(formPhanPhoi.querySelectorAll('input[name="phim_ids[]"]:checked')).map(i => i.value);
            const res = await fetch(`${phimList.dataset.url}/api/phan-phoi-phim/${currentRapId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phim_ids: phimIds })
            });
            const data = await res.json();
            if (data.success) {
                alert('Lưu phân phối thành công!');
            } else {
                alert(data.message || 'Lưu phân phối thất bại!');
            }
        });
    }


    if (btnOpenModal) {
        btnOpenModal.addEventListener('click', async function() {
            if (!currentRapId) return;
            phanPhoiModal.classList.remove('opacity-0', 'pointer-events-none');
            renderPhanPhoiMovieList('');
            searchInput.value = '';
        });
    }
    if (btnCloseModal) {
        btnCloseModal.addEventListener('click', function() {
            phanPhoiModal.classList.add('opacity-0', 'pointer-events-none');
        });
    }
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            renderPhanPhoiMovieList(this.value);
        });
    }

    async function renderPhanPhoiMovieList(keyword) {
        // Lấy lại danh sách phim đã phân phối cho rạp
        const res = await fetch(`${phimList.dataset.url}/api/phan-phoi-phim/${currentRapId}`);
        const data = await res.json();
        const phimIds = data.success && Array.isArray(data.data) ? data.data.map(p => p.id_phim) : [];
        // Lọc phim chưa phân phối
        let phimChuaPhanPhoi = allPhim.filter(phim => !phimIds.includes(phim.id));
        if (keyword) {
            phimChuaPhanPhoi = phimChuaPhanPhoi.filter(phim => phim.ten_phim.toLowerCase().includes(keyword.toLowerCase()));
        }
        if (phimChuaPhanPhoi.length === 0) {
            phanPhoiMovieList.innerHTML = '<div class="text-gray-400 text-center">Không tìm thấy phim phù hợp.</div>';
            return;
        }
        phanPhoiMovieList.innerHTML = phimChuaPhanPhoi.map(phim => `
            <div class="flex items-center justify-between border rounded px-3 py-2 bg-white">
                <span>${phim.ten_phim} <span class="text-xs text-gray-400">(${phim.thoi_luong} phút)</span></span>
                <button class="btn-add-phanphoi bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded" data-phim-id="${phim.id}">Phân phối</button>
            </div>
        `).join('');

        // Sự kiện phân phối
        phanPhoiMovieList.querySelectorAll('.btn-add-phanphoi').forEach(btn => {
            btn.addEventListener('click', async function() {
                await fetch(`${phimList.dataset.url}/api/phan-phoi-phim/${currentRapId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phim_ids: [this.dataset.phimId] })
                });
                phanPhoiModal.classList.add('opacity-0', 'pointer-events-none');
                loadPhimOfRap(currentRapId);
            });
        });
    }

    // Tự động chọn rạp đầu tiên nếu có
    if (allRap.length > 0) {
        sidebar.querySelector('button').click();
    }
});