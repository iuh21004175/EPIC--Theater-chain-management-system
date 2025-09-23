import Spinner from "./util/spinner.js";
document.addEventListener('DOMContentLoaded', async function() {
    // Đổi id cho đúng giao diện mới
    const rapList = document.getElementById('rap-list');
    const rapPhimList = document.getElementById('rap-phim-list');
    const selectedRapTitle = document.getElementById('selected-rap-title');
    const movieStockList = document.getElementById('movie-stock-list');
    const movieStockPagination = document.getElementById('movie-stock-pagination');
    const urlWebBase = movieStockList.dataset.url;
    const urlMinio = movieStockList.dataset.urlminio;

    let allPhim = [];
    let allRap = [];
    let currentRapId = null;
    let movieStockPage = 1;
    let movieStockTotalPages = 1;

    // Lấy danh sách rạp
    const rapSpinner = Spinner.show({ target: rapList, overlay: true, text: 'Đang tải danh sách rạp...' });
    const rapRes = await fetch(`${rapList.dataset.url}/api/rap-phim`);
    const rapData = await rapRes.json();
    Spinner.hide(rapSpinner);
    allRap = rapData.data || [];

    // Render danh sách rạp
    function renderRapList() {
        rapList.innerHTML = allRap.map(rap => `
            <div class="rap-item flex items-center px-3 py-2 rounded cursor-pointer ${currentRapId == rap.id ? 'selected' : ''}" data-id="${rap.id}">
                <input type="hidden" class="mr-2 rap-checkbox" data-id="${rap.id}">
                <span>${rap.ten}</span>
            </div>
        `).join('');
        // Sự kiện chọn rạp
        rapList.querySelectorAll('.rap-item').forEach(item => {
            item.addEventListener('click', function(e) {
                // Không trigger khi click vào checkbox
                if (e.target.classList.contains('rap-checkbox')) return;
                rapList.querySelectorAll('.rap-item').forEach(b => b.classList.remove('selected'));
                this.classList.add('selected');
                currentRapId = this.dataset.id;
                selectedRapTitle.textContent = `Phim được phân phối cho: ${this.querySelector('span').textContent.trim()}`;
                document.getElementById('movie-stock-title').textContent = `Phim chưa phân phối cho rạp:  ${this.querySelector('span').textContent.trim()}`;
                loadPhimOfRap(currentRapId);
            });
        });
    }

    // Render kho phim (cột 1)
    function renderMovieStockList(phimArr) {
        movieStockList.innerHTML = phimArr.map(renderMovieCard).join('');
        // Gán drag event cho từng card
        movieStockList.querySelectorAll('.movie-card').forEach(card => {
            card.addEventListener('dragstart', handleDragStart);
        });
    }

    function renderMovieCard(phim) {
        const trangThai = getTrangThaiPhim(phim);
        let theLoais = '';
        const listTheLoai = [];
        phim.the_loai.forEach(theLoai => {
            const tl = theLoai.the_loai
            if (tl && !listTheLoai.includes(tl)) {
                listTheLoai.push(tl.ten);
            }
        });
        
        listTheLoai.forEach(element => {
            theLoais += `<span class="inline-block bg-gray-200 rounded px-2 py-0.5 mr-1">${element}</span>`;
        });
        return `
        <div class="movie-card" draggable="true" data-id="${phim.id}">
            <img src="${movieStockList.dataset.urlminio}/${phim.poster_url}" class="poster" alt="">
            <div>
                <div class="font-semibold">${phim.ten_phim}</div>
                <div>
                    <span class="inline-block px-2 py-0.5 rounded text-xs"
                          style="background:${trangThai.color};color:${trangThai.textColor}">
                        ${trangThai.text}
                    </span>
                    <span class="ml-2 text-xs text-gray-500">${phim.thoi_luong} phút</span>
                </div>
                <div class="text-xs text-gray-400">${theLoais}</div>
            </div>
        </div>
        `;
    }

    function handleDragStart(e) {
        e.dataTransfer.setData('phimId', this.dataset.id);
    }

    // Kéo thả vào cột 3 để phân phối
    rapPhimList.addEventListener('dragover', e => e.preventDefault());
    rapPhimList.addEventListener('drop', async function(e) {
        e.preventDefault();
        const phimId = e.dataTransfer.getData('phimId');
        if (!phimId || !currentRapId) return;

        // Hiển thị spinner khi phân phối phim
        const spinner = Spinner.show({ target: rapPhimList, overlay: true, text: 'Đang phân phối phim...' });
        try {
            await fetch(`${rapPhimList.dataset.url}/api/phan-phoi-phim/them`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_rap: currentRapId,
                    phim_id: phimId
                })
            });
            // Sau khi phân phối, load lại danh sách phim của rạp và kho phim
            await loadPhimOfRap(currentRapId);
            await loadMovieStockList(movieStockPage, getMovieStockFilters());
        } finally {
            Spinner.hide(spinner);
        }
    });

    // Load phim đã phân phối cho rạp
    async function loadPhimOfRap(rapId) {
        const spinner = Spinner.show({ target: rapPhimList, overlay: true, text: 'Đang tải phim của rạp...' });
        rapPhimList.innerHTML = '<div class="col-span-full text-gray-400">Đang tải...</div>';
        const res = await fetch(`${rapPhimList.dataset.url}/api/phan-phoi-phim/${rapId}`);
        const data = await res.json();
        Spinner.hide(spinner);

        const phimDaPhanPhoi = data.success && Array.isArray(data.data) ? data.data : [];
        if (phimDaPhanPhoi.length === 0) {
            rapPhimList.innerHTML = '<div class="col-span-full text-gray-400">Chưa có phim nào được phân phối cho rạp này.</div>';
            return;
        }
        rapPhimList.innerHTML = phimDaPhanPhoi.map(renderPhimOfRap).join('');
        // Sự kiện gỡ phim khỏi rạp (dùng API PUT /phan-phoi-phim/xoa)
        rapPhimList.querySelectorAll('.btn-remove-phanphoi').forEach(btn => {
            btn.addEventListener('click', async function() {
                if (!confirm('Bạn chắc chắn muốn bỏ phân phối phim này khỏi rạp?')) return;
                const spinner = Spinner.show({ target: rapPhimList, overlay: true, text: 'Đang xóa phân phối...' });
                try {
                    await fetch(`${rapPhimList.dataset.url}/api/phan-phoi-phim/xoa`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_rap: currentRapId,
                            phim_id: this.dataset.id
                        })
                    });
                    await loadPhimOfRap(currentRapId);
                    await loadMovieStockList(movieStockPage, getMovieStockFilters());
                } finally {
                    Spinner.hide(spinner);
                }
            });
        });
    }

    function renderPhimOfRap(phim) {
        const trangThai = getTrangThaiPhim(phim);
        return `
        <div class="flex items-center gap-3 border rounded px-3 py-2 bg-gray-50">
            <img src="${movieStockList.dataset.urlminio}/${phim.poster_url}" class="w-10 h-14 object-cover rounded">
            <div class="flex-1">
                <div class="font-semibold">${phim.ten_phim}</div>
                <span class="inline-block px-2 py-0.5 rounded text-xs mt-1"
                    style="background:${trangThai.color};color:${trangThai.textColor}">
                    ${trangThai.text}
                </span>
            </div>
            <button class="btn-remove-phanphoi text-red-600" data-id="${phim.id}">Gỡ</button>
        </div>
        `;
    }


    // Khởi tạo giao diện
    renderRapList();
    renderMovieStockList(allPhim);

    // Tự động chọn rạp đầu tiên nếu có
    if (allRap.length > 0) {
        rapList.querySelector('.rap-item').click();
    }

    // ================== PHÂN TRANG VÀ TÌM KIẾM PHIM ================== //
    // Load danh sách phim với phân trang và bộ lọc
    async function loadMovieStockList(page = 1, filters = {}) {
        const spinner = Spinner.show({ target: movieStockList, overlay: true, text: 'Đang tải phim...' });
        movieStockList.innerHTML = `<div class="text-center py-8 text-gray-400">Đang tải phim...</div>`;
        movieStockPagination.innerHTML = '';

        // Xây dựng query string
        const params = new URLSearchParams({ page, ...filters, idRap: currentRapId || null }).toString();
        const res = await fetch(`${urlWebBase}/api/phim/?${params}`);
        const data = await res.json();

        // Gán lại danh sách phim hiện tại
        allPhim = data.data || [];

        if (!data.success || !data.data.length) {
            movieStockList.innerHTML = `<div class="text-center py-8 text-gray-400">Không có phim nào</div>`;
            return;
        }

        // Render card phim
        movieStockList.innerHTML = data.data.map(phim => `
            <div class="movie-card" draggable="true" data-id="${phim.id}">
                <img src="${urlMinio}/${phim.poster_url}" class="poster" alt="">
                <div>
                    <div class="font-semibold">${phim.ten_phim}</div>
                    <div>
                        <span class="inline-block px-2 py-0.5 rounded text-xs" style="background:${phim.trang_thai==1?'#4CAF50':'#FFC107'};color:${phim.trang_thai==1?'#fff':'#000'}">
                            ${phim.trang_thai==1?'Đang chiếu':'Sắp chiếu'}
                        </span>
                        <span class="ml-2 text-xs text-gray-500">${phim.thoi_luong} phút</span>
                    </div>
                    <div class="text-xs text-gray-400">${Array.isArray(phim.the_loai) ? phim.the_loai.map(tl => tl.the_loai?.ten).filter(Boolean).join(', ') : ''}</div>
                </div>
            </div>
        `).join('');

        // Gán drag event cho từng card
        movieStockList.querySelectorAll('.movie-card').forEach(card => {
            card.addEventListener('dragstart', function(e) {
                e.dataTransfer.setData('phimId', this.dataset.id);
            });
        });

        // Phân trang
        movieStockPage = data.pagination?.current_page || 1;
        movieStockTotalPages = data.pagination?.total_pages || 1;
        renderMovieStockPagination();
        Spinner.hide(spinner);
    }

    function renderMovieStockPagination() {
        let html = '';
        // Previous
        html += `<a href="#" class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 ${movieStockPage === 1 ? 'pointer-events-none opacity-50' : ''}" data-page="${movieStockPage - 1}">
            <span class="sr-only">Previous</span>
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" /></svg>
        </a>`;

        // Trang đầu
        if (movieStockPage > 3) {
            html += `<a href="#" class="relative inline-flex items-center px-4 py-2 text-sm font-semibold bg-white text-gray-700" data-page="1">1</a>`;
            if (movieStockPage > 4) html += `<span class="px-2">...</span>`;
        }

        // Các trang lân cận
        for (let i = Math.max(1, movieStockPage - 2); i <= Math.min(movieStockTotalPages, movieStockPage + 2); i++) {
            html += `<a href="#" aria-current="${movieStockPage === i ? 'page' : ''}" class="relative inline-flex items-center px-4 py-2 text-sm font-semibold ${movieStockPage === i ? 'bg-red-600 text-white' : 'bg-white text-gray-700'} focus:z-20" data-page="${i}">${i}</a>`;
        }

        // Trang cuối
        if (movieStockPage < movieStockTotalPages - 2) {
            if (movieStockPage < movieStockTotalPages - 3) html += `<span class="px-2">...</span>`;
            html += `<a href="#" class="relative inline-flex items-center px-4 py-2 text-sm font-semibold bg-white text-gray-700" data-page="${movieStockTotalPages}">${movieStockTotalPages}</a>`;
        }

        // Next
        html += `<a href="#" class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 ${movieStockPage === movieStockTotalPages ? 'pointer-events-none opacity-50' : ''}" data-page="${movieStockPage + 1}">
            <span class="sr-only">Next</span>
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5-4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" /></svg>
        </a>`;
        movieStockPagination.innerHTML = html;

        // Sự kiện chuyển trang
        movieStockPagination.querySelectorAll('a[data-page]').forEach(a => {
            a.addEventListener('click', function(e) {
                e.preventDefault();
                const page = parseInt(this.getAttribute('data-page'));
                if (page >= 1 && page <= movieStockTotalPages && page !== movieStockPage) {
                    loadMovieStockList(page, getMovieStockFilters());
                }
            });
        });
    }

    // Lấy filter từ input
    function getMovieStockFilters() {
        return {
            tuKhoaTimKiem: document.getElementById('search-movie').value.trim(),
            trangThai: document.getElementById('filter-movie-status').value,
            theLoaiId: document.getElementById('filter-movie-genre').value,
            doTuoi: document.getElementById('filter-movie-rating').value
        };
    }

    // Sự kiện filter/tìm kiếm
    document.getElementById('search-movie').addEventListener('input', () => loadMovieStockList(1, getMovieStockFilters()));
    document.getElementById('filter-movie-status').addEventListener('change', () => loadMovieStockList(1, getMovieStockFilters()));
    document.getElementById('filter-movie-genre').addEventListener('change', () => loadMovieStockList(1, getMovieStockFilters()));
    document.getElementById('filter-movie-rating').addEventListener('change', () => loadMovieStockList(1, getMovieStockFilters()));

    // Gọi lần đầu khi vào tab
    loadMovieStockList();

    function getTrangThaiPhim(phim) {
        if (phim.trang_thai == 1) {
            return { text: 'Đang chiếu', color: '#4CAF50', textColor: '#fff' };
        }
        if (phim.trang_thai == 0) {
            return { text: 'Sắp chiếu', color: '#FFC107', textColor: '#000' };
        }
        // -1 hoặc giá trị khác
        return { text: 'Ngừng chiếu', color: '#9E9E9E', textColor: '#fff' };
    }
});