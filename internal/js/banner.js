import Spinner from './util/spinner.js';

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const addBannerBtn = document.getElementById('add-banner-btn');
    const bannerModal = document.getElementById('banner-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const bannerForm = document.getElementById('banner-form');
    const bannerIdInput = document.getElementById('banner-id');
    const modalTitle = document.getElementById('modal-title');
    const bannerImageInput = document.getElementById('banner-image');
    const uploadArea = document.getElementById('upload-area');
    const uploadPlaceholder = document.getElementById('upload-placeholder');
    const previewContainer = document.getElementById('preview-container');
    const imagePreview = document.getElementById('image-preview');
    const changeImageBtn = document.getElementById('change-image');
    const saveBannerBtn = document.getElementById('save-banner');
    const cancelBannerBtn = document.getElementById('cancel-banner');
    const deleteBannerBtn = document.getElementById('delete-banner');
    const sortableContainer = document.getElementById('sortable-container');
    const slideshowPreview = document.getElementById('slideshow-preview');
    const slideshowImages = document.getElementById('slideshow-images');
    const noBannersMessage = document.getElementById('no-banners-message');
    const prevSlideBtn = document.getElementById('prev-slide');
    const nextSlideBtn = document.getElementById('next-slide');
    const deleteModal = document.getElementById('delete-modal');
    const deletePreview = document.getElementById('delete-preview');
    const cancelDeleteBtn = document.getElementById('cancel-delete');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    const toastNotification = document.getElementById('toast-notification');
    const bannerList = document.getElementById('banner-list');
    const noBannersRow = document.getElementById('no-banners-row');
    const noBannersSortable = document.getElementById('no-banners-sortable');
    // Ẩn nút thay đổi trạng thái nếu không dùng
    const changeStatusBtn = document.getElementById('change-status-banner');
    if (changeStatusBtn) changeStatusBtn.classList.add('hidden');
    const imageError = document.getElementById('image-error');
    const statusRow = document.getElementById('modal-status-row');

    // API endpoints
    const API_BASE = `${bannerList.dataset.url}/api/banner`;

    // Sample data for testing (would be fetched from server in production)
    let banners = [];
    let currentSlideIndex = 0;
    let deletingBannerId = null;

    // Initialize date pickers
    initDatePickers();
    // Initialize sortable for banner order management
    initSortable();

    // Load initial data
    loadBanners();
    updateSlideshowPreview();

    // Event listeners
    addBannerBtn.addEventListener('click', openAddModal);
    closeModalBtn.addEventListener('click', closeModal);
    cancelBannerBtn.addEventListener('click', closeModal);
    uploadArea.addEventListener('click', triggerFileInput);
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('drop', handleDrop);
    bannerImageInput.addEventListener('change', handleFileSelect);
    changeImageBtn.addEventListener('click', triggerFileInput);
    saveBannerBtn.addEventListener('click', handleSaveBanner);
    deleteBannerBtn.addEventListener('click', openDeleteModal);
    cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    confirmDeleteBtn.addEventListener('click', deleteBanner);
    prevSlideBtn.addEventListener('click', showPrevSlide);
    nextSlideBtn.addEventListener('click', showNextSlide);

    // API functions
    async function fetchBanners() {
        const spinner = Spinner.show({ target: bannerList, overlay: true, text: 'Đang tải...' });
        try {
            const res = await fetch(API_BASE, { method: 'GET' });
            const data = await res.json();
            return data.data || [];
        } finally {
            Spinner.hide(spinner);
        }
    }

    async function addBanner(formData) {
        const spinner = Spinner.show({ target: bannerModal, overlay: true, text: 'Đang thêm banner...' });
        try {
            const res = await fetch(API_BASE, {
                method: 'POST',
                body: formData
            });
            return await res.json();
        } finally {
            Spinner.hide(spinner);
        }
    }

    async function updateBannerImage(id, formData) {
        const spinner = Spinner.show({ target: bannerModal, overlay: true, text: 'Đang cập nhật...' });
        try {
            const res = await fetch(`${API_BASE}/${id}`, {
                method: 'PUT',
                body: formData
            });
            return await res.json();
        } finally {
            Spinner.hide(spinner);
        }
    }

    async function deleteBannerApi(id) {
        const spinner = Spinner.show({ target: deleteModal, overlay: true, text: 'Đang xóa...' });
        try {
            const res = await fetch(`${API_BASE}/${id}`, {
                method: 'DELETE'
            });
            return await res.json();
        } finally {
            Spinner.hide(spinner);
        }
    }

    async function updateSideShowOrder(ids) {
        const spinner = Spinner.show({ target: sortableContainer, overlay: true, text: 'Đang lưu thứ tự...' });
        try {
            const res = await fetch(`${API_BASE}/cap-nhat-side-show`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids })
            });
            return await res.json();
        } finally {
            Spinner.hide(spinner);
        }
    }

    // Functions
    function initDatePickers() {
        flatpickr('.date-picker', {
            dateFormat: 'd/m/Y',
            locale: 'vn',
            minDate: 'today'
        });
    }

    function initSortable() {
        new Sortable(sortableContainer, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            handle: '.handle',
            onEnd: async function() {
                // Lấy thứ tự mới
                const orderedBannerIds = Array.from(sortableContainer.querySelectorAll('.sortable-item')).map(
                    item => parseInt(item.dataset.id)
                );
                // Gửi lên server
                await updateSideShowOrder(orderedBannerIds);
                // Sau khi cập nhật thành công, load lại dữ liệu
                await loadSideShowData();
                showToast('Lưu thứ tự hiển thị thành công');
            }
        });
    }

    async function loadBanners() {
        banners = await fetchBanners();

        if (banners.length === 0) {
            noBannersRow.classList.remove('hidden');
            noBannersSortable.classList.remove('hidden');
            return;
        }

        noBannersRow.classList.add('hidden');
        noBannersSortable.classList.add('hidden');

        banners.sort((a, b) => a.order - b.order);

        bannerList.innerHTML = '';
        sortableContainer.innerHTML = '';

        banners.forEach(banner => {
            const row = createBannerTableRow(banner);
            bannerList.appendChild(row);
        });
    }

    function createBannerTableRow(banner) {
        const row = document.createElement('tr');
        row.classList.add('cursor-pointer', 'hover:bg-blue-50', 'transition-colors');

        
        const isActive = banner.trang_thai

        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <img src="${bannerList.dataset.urlminio}/${banner.anh_url}" alt="${banner.title || ''}" class="h-16 w-24 object-cover rounded">
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isActive == 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                    ${isActive == 1 ? 'Đang hiển thị' : 'Không hiển thị'}
                </span>
            </td>
        `;

        row.addEventListener('click', () => openEditModal(banner.id));
        return row;
    }


    async function updateSlideshowPreview() {
        const bannersSideShow = await loadSideShowData();

        if (!bannersSideShow || bannersSideShow.length === 0) {
            noBannersMessage.classList.remove('hidden');
            slideshowImages.classList.add('hidden');
            prevSlideBtn.classList.add('hidden');
            nextSlideBtn.classList.add('hidden');
            return;
        }

        noBannersMessage.classList.add('hidden');
        slideshowImages.classList.remove('hidden');
        slideshowImages.innerHTML = '';

        bannersSideShow.forEach((banner, index) => {

            const slide = document.createElement('div');
            slide.classList.add('absolute', 'inset-0', 'transition-opacity', 'duration-500');
            if (index !== 0) slide.classList.add('opacity-0');
            slide.innerHTML = `
                <img src="${bannerList.dataset.urlminio}/${banner.anh_url}" 
                     class="max-w-full max-h-full object-contain mx-auto my-auto block" 
                     style="width:1200px; height:600px;" alt="">
            `;
            slideshowImages.appendChild(slide);
        });

        // Navigation
        if (bannersSideShow.length > 1) {
            prevSlideBtn.classList.remove('hidden');
            nextSlideBtn.classList.remove('hidden');
        } else {
            prevSlideBtn.classList.add('hidden');
            nextSlideBtn.classList.add('hidden');
        }
    }

    function showPrevSlide() {
        const slides = slideshowImages.querySelectorAll('div');
        slides[currentSlideIndex].classList.add('opacity-0');

        currentSlideIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
        slides[currentSlideIndex].classList.remove('opacity-0');
    }

    function showNextSlide() {
        const slides = slideshowImages.querySelectorAll('div');
        slides[currentSlideIndex].classList.add('opacity-0');

        currentSlideIndex = (currentSlideIndex + 1) % slides.length;
        slides[currentSlideIndex].classList.remove('opacity-0');
    }

    function openAddModal() {
        // Reset form
        bannerForm.reset();
        bannerIdInput.value = '';

        // Update modal title and button text
        modalTitle.textContent = 'Thêm banner mới';
        saveBannerBtn.textContent = 'Thêm';

        // Hide delete button
        deleteBannerBtn.classList.add('hidden');

        // Reset image preview
        uploadPlaceholder.classList.remove('hidden');
        previewContainer.classList.add('hidden');

        // Ẩn trạng thái khi thêm mới
        if (statusRow) statusRow.classList.add('hidden');
        // Ẩn nút thay đổi trạng thái
        if (changeStatusBtn) changeStatusBtn.classList.add('hidden');

        // Clear validation errors
        clearValidationErrors();

        // Show modal
        bannerModal.classList.remove('hidden');
    }

    function openEditModal(bannerId) {
        // Find banner by ID
        const banner = banners.find(b => b.id === bannerId);
        if (!banner) return;

        // Reset form and fill with banner data
        bannerForm.reset();
        bannerIdInput.value = banner.id;


        // Show image preview
        imagePreview.src = `${bannerList.dataset.urlminio}/${banner.anh_url}`;
        uploadPlaceholder.classList.add('hidden');
        previewContainer.classList.remove('hidden');

        // Update modal title and button text
        modalTitle.textContent = 'Cập nhật banner';
        saveBannerBtn.textContent = 'Lưu';

        // Show delete button
        deleteBannerBtn.classList.remove('hidden');

        // Hiện trạng thái khi sửa
        if (statusRow) statusRow.classList.remove('hidden');

        // Hiển thị trạng thái hiện tại
        const statusSpan = document.getElementById('modal-banner-status');
        const isActive = banner.trang_thai;
        if (statusSpan) {
            statusSpan.textContent = isActive == 1 ? 'Đang hiển thị' : 'Không hiển thị';
            statusSpan.className = 'inline-block px-3 py-1 rounded-full text-xs font-semibold ' +
                (isActive == 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800');
        }

        // Hiện nút thay đổi trạng thái
        changeStatusBtn.classList.remove('hidden');

        // Gán sự kiện thay đổi trạng thái
        changeStatusBtn.onclick = async function() {
            const nextStatus = isActive ? 0 : 1;
            const nextStatusText = nextStatus ? 'Đang hiển thị' : 'Không hiển thị';
            if (!confirm(`Bạn có chắc chắn muốn chuyển trạng thái banner sang "${nextStatusText}"?`)) return;

            // Gọi API thay đổi trạng thái
            const spinner = Spinner.show({ target: bannerModal, overlay: true, text: 'Đang cập nhật trạng thái...' });
            try {
                // Lấy danh sách các item trong sortable-container
                const items = sortableContainer.querySelectorAll('.sortable-item');
                const soLuong = items.length || 0;

                // Nếu có ít nhất 1 banner, lấy thứ tự tiếp theo là soLuong + 1
                const thuTuTiepTheo = soLuong + 1;

                // Khi cập nhật trạng thái, truyền thuTu vào API
                await fetch(`${API_BASE}/${banner.id}/trang-thai`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        trangThai: nextStatus,
                        thuTu: nextStatus == 1 ? thuTuTiepTheo : null
                    })
                });
                showToast('Đã thay đổi trạng thái banner');
                closeModal();
                loadBanners();
                updateSlideshowPreview();
            } finally {
                Spinner.hide(spinner);
            }
        };

        // Clear validation errors
        clearValidationErrors();
        bannerModal.classList.remove('hidden');
    }

    function closeModal() {
        bannerModal.classList.add('hidden');
    }

    function openDeleteModal() {
        const bannerId = parseInt(bannerIdInput.value);
        const banner = banners.find(b => b.id === bannerId);
        if (!banner) return;

        // Set banner info in delete modal
        deletePreview.src = `${bannerList.dataset.urlminio}/${banner.anh_url}`;

        // Store banner ID for deletion
        deletingBannerId = bannerId;

        // Hide banner modal and show delete modal
        bannerModal.classList.add('hidden');
        deleteModal.classList.remove('hidden');
    }

    function closeDeleteModal() {
        deleteModal.classList.add('hidden');
        deletingBannerId = null;
    }

    async function deleteBanner() {
        if (deletingBannerId === null) return;
        await deleteBannerApi(deletingBannerId);
        closeDeleteModal();
        loadBanners();
        updateSlideshowPreview();
        showToast('Xóa banner thành công');
    }

    function triggerFileInput() {
        bannerImageInput.click();
    }

    function handleDragOver(e) {
        e.preventDefault();
        uploadArea.classList.add('border-blue-500');
    }

    function handleDrop(e) {
        e.preventDefault();
        uploadArea.classList.remove('border-blue-500');

        if (e.dataTransfer.files.length) {
            bannerImageInput.files = e.dataTransfer.files;
            handleFileSelect();
        }
    }

    function handleFileSelect() {
        const file = bannerImageInput.files[0];
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        const maxSize = 2 * 1024 * 1024;

        if (!validTypes.includes(file.type)) {
            imageError.textContent = 'Chỉ chấp nhận file JPG, PNG hoặc GIF';
            imageError.classList.remove('hidden');
            return;
        }

        if (file.size > maxSize) {
            imageError.textContent = 'Kích thước file không được vượt quá 2MB';
            imageError.classList.remove('hidden');
            return;
        }

        imageError.classList.add('hidden');

        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            uploadPlaceholder.classList.add('hidden');
            previewContainer.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }

    async function handleSaveBanner() {
        if (!validateForm()) return;

        const bannerId = bannerIdInput.value ? parseInt(bannerIdInput.value) : null;

        const formData = new FormData();
        if (bannerImageInput.files[0]) {
            formData.append('AnhUrl', bannerImageInput.files[0]);
        }

        if (bannerId) {
            await updateBannerImage(bannerId, formData);
            showToast('Cập nhật banner thành công');
        } else {
            await addBanner(formData);
            showToast('Thêm banner mới thành công');
        }

        closeModal();
        loadBanners();
        updateSlideshowPreview();
    }

    async function saveOrder() {
        const orderedBannerIds = Array.from(sortableContainer.querySelectorAll('.sortable-item')).map(
            item => parseInt(item.dataset.id)
        );
        await updateSideShowOrder(orderedBannerIds);
        updateSlideshowPreview();
        showToast('Lưu thứ tự hiển thị thành công');
    }

    function validateForm() {
        let isValid = true;
        clearValidationErrors();


        // Validate image for new banners
        const bannerId = bannerIdInput.value;
        if (!bannerId && !bannerImageInput.files[0] && !imagePreview.src) {
            imageError.textContent = 'Vui lòng tải lên hình ảnh banner';
            imageError.classList.remove('hidden');
            isValid = false;
        }

        return isValid;
    }

    function clearValidationErrors() {
        imageError.classList.add('hidden');
    }

    function showToast(message) {
        toastNotification.textContent = message;
        toastNotification.classList.remove('translate-y-20', 'opacity-0');
        setTimeout(() => {
            toastNotification.classList.add('translate-y-20', 'opacity-0');
        }, 3000);
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }


    async function loadSideShowData() {
        const spinner1 = Spinner.show({ target: slideshowPreview, overlay: true, text: 'Đang tải slideshow...' });
        const spinner2 = Spinner.show({ target: sortableContainer, overlay: true, text: 'Đang tải...' });
        let bannersSideShow =  [];
        try {
            const res = await fetch(`${bannerList.dataset.url}/api/banner/side-show`, { method: 'GET' });
            const data = await res.json();
            bannersSideShow = data.data || [];

            // Cập nhật slideshow preview
            if (!bannersSideShow.length) {
                noBannersMessage.classList.remove('hidden');
                slideshowImages.classList.add('hidden');
                prevSlideBtn.classList.add('hidden');
                nextSlideBtn.classList.add('hidden');
            } else {
                noBannersMessage.classList.add('hidden');
                slideshowImages.classList.remove('hidden');
                slideshowImages.innerHTML = '';
                bannersSideShow.forEach((banner, index) => {
                    const slide = document.createElement('div');
                    slide.classList.add('absolute', 'inset-0', 'transition-opacity', 'duration-500');
                    if (index !== 0) slide.classList.add('opacity-0');
                    slide.innerHTML = `
                        <img src="${bannerList.dataset.urlminio}/${banner.anh_url}" 
                             class="max-w-full max-h-full object-contain mx-auto my-auto block" 
                             style="width:1200px; height:600px;" alt="">
                    `;
                    slideshowImages.appendChild(slide);
                });
                if (bannersSideShow.length > 1) {
                    prevSlideBtn.classList.remove('hidden');
                    nextSlideBtn.classList.remove('hidden');
                } else {
                    prevSlideBtn.classList.add('hidden');
                    nextSlideBtn.classList.add('hidden');
                }
            }

            // Cập nhật sortable-container
            sortableContainer.innerHTML = '';
            if (!bannersSideShow.length) {
                noBannersSortable.classList.remove('hidden');
            } else {
                noBannersSortable.classList.add('hidden');
                bannersSideShow.forEach(banner => {
                    const item = document.createElement('div');
                    item.classList.add('bg-white', 'rounded-lg', 'shadow', 'overflow-hidden', 'sortable-item');
                    item.dataset.id = banner.id;
                    item.innerHTML = `
                        <div class="relative" height: 150px;">
                            <img 
                                src="${bannerList.dataset.urlminio}/${banner.anh_url}" 
                                alt="" 
                                class="w-full h-full object-contain bg-gray-100"
                                style="aspect-ratio: 1200 / 600; width: 100%; height: 100%;"
                            >
                            <div class="absolute top-0 right-0 bg-white bg-opacity-75 rounded-bl p-1 handle cursor-move">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
                                </svg>
                            </div>
                        </div>
                    `;
                    sortableContainer.appendChild(item);
                });
            }
        } finally {
            Spinner.hide(spinner1);
            Spinner.hide(spinner2);
        }
        return bannersSideShow;
    }
});