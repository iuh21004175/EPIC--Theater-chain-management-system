document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const addBannerBtn = document.getElementById('add-banner-btn');
    const bannerModal = document.getElementById('banner-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const bannerForm = document.getElementById('banner-form');
    const bannerIdInput = document.getElementById('banner-id');
    const modalTitle = document.getElementById('modal-title');
    const saveOrderBtn = document.getElementById('save-order-btn');
    const bannerTitleInput = document.getElementById('banner-title');
    const bannerLinkInput = document.getElementById('banner-link');
    const bannerStartDateInput = document.getElementById('banner-start-date');
    const bannerEndDateInput = document.getElementById('banner-end-date');
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
    const deleteTitle = document.getElementById('delete-title');
    const deleteDates = document.getElementById('delete-dates');
    const cancelDeleteBtn = document.getElementById('cancel-delete');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    const toastNotification = document.getElementById('toast-notification');
    const bannerList = document.getElementById('banner-list');
    const noBannersRow = document.getElementById('no-banners-row');
    const noBannersSortable = document.getElementById('no-banners-sortable');
    
    // Error message elements
    const titleError = document.getElementById('title-error');
    const linkError = document.getElementById('link-error');
    const startDateError = document.getElementById('start-date-error');
    const endDateError = document.getElementById('end-date-error');
    const imageError = document.getElementById('image-error');
    
    // Sample data for testing (would be fetched from server in production)
    let banners = [
        {
            id: 1,
            title: 'Banner Khuyến Mãi Hè',
            link: 'https://example.com/khuyen-mai-he',
            startDate: '2025-06-01',
            endDate: '2025-08-31',
            image: 'https://placehold.co/1200x400/FF5733/FFFFFF/png?text=Banner+Khuyen+Mai+He',
            order: 1
        },
        {
            id: 2,
            title: 'Ra Mắt Phim Mới',
            link: 'https://example.com/phim-moi',
            startDate: '2025-09-01',
            endDate: '2025-09-30',
            image: 'https://placehold.co/1200x400/33A8FF/FFFFFF/png?text=Ra+Mat+Phim+Moi',
            order: 2
        }
    ];
    
    // Current slide index for preview
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
    saveOrderBtn.addEventListener('click', saveOrder);
    prevSlideBtn.addEventListener('click', showPrevSlide);
    nextSlideBtn.addEventListener('click', showNextSlide);
    
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
            onEnd: function() {
                // Update slideshow preview after reordering
                updateSlideshowPreview();
            }
        });
    }
    
    function loadBanners() {
        // In a real app, you would fetch banners from the server
        if (banners.length === 0) {
            noBannersRow.classList.remove('hidden');
            noBannersSortable.classList.remove('hidden');
            return;
        }
        
        noBannersRow.classList.add('hidden');
        noBannersSortable.classList.add('hidden');
        
        // Sort banners by order
        banners.sort((a, b) => a.order - b.order);
        
        // Clear existing content
        bannerList.innerHTML = '';
        sortableContainer.innerHTML = '';
        
        // Populate banner list and sortable items
        banners.forEach(banner => {
            // Add to table list
            const row = createBannerTableRow(banner);
            bannerList.appendChild(row);
            
            // Add to sortable container
            const sortableItem = createSortableItem(banner);
            sortableContainer.appendChild(sortableItem);
        });
    }
    
    function createBannerTableRow(banner) {
        const row = document.createElement('tr');
        
        // Format dates for display
        const startDate = formatDate(banner.startDate);
        const endDate = formatDate(banner.endDate);
        
        // Check if banner is active
        const today = new Date();
        const isActive = new Date(banner.startDate) <= today && new Date(banner.endDate) >= today;
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <img src="${banner.image}" alt="${banner.title}" class="h-16 w-24 object-cover rounded">
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${banner.title}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500 truncate max-w-xs">${banner.link}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">${startDate} - ${endDate}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                    ${isActive ? 'Đang hiển thị' : 'Không hiển thị'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button class="text-blue-600 hover:text-blue-900 mr-3 edit-banner" data-id="${banner.id}">Sửa</button>
            </td>
        `;
        
        // Add event listener to edit button
        row.querySelector('.edit-banner').addEventListener('click', () => openEditModal(banner.id));
        
        return row;
    }
    
    function createSortableItem(banner) {
        const item = document.createElement('div');
        item.classList.add('bg-white', 'rounded-lg', 'shadow', 'overflow-hidden', 'sortable-item');
        item.dataset.id = banner.id;
        
        item.innerHTML = `
            <div class="relative">
                <img src="${banner.image}" alt="${banner.title}" class="w-full h-32 object-cover">
                <div class="absolute top-0 right-0 bg-white bg-opacity-75 rounded-bl p-1 handle cursor-move">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
                    </svg>
                </div>
            </div>
            <div class="p-3">
                <p class="font-medium text-gray-900 truncate">${banner.title}</p>
                <p class="text-sm text-gray-500 truncate">${banner.link}</p>
            </div>
        `;
        
        return item;
    }
    
    function updateSlideshowPreview() {
        if (banners.length === 0) {
            noBannersMessage.classList.remove('hidden');
            slideshowImages.classList.add('hidden');
            prevSlideBtn.classList.add('hidden');
            nextSlideBtn.classList.add('hidden');
            return;
        }
        
        noBannersMessage.classList.add('hidden');
        slideshowImages.classList.remove('hidden');
        
        // Get banners in order from sortable container
        const orderedBannerIds = Array.from(sortableContainer.querySelectorAll('.sortable-item')).map(
            item => parseInt(item.dataset.id)
        );
        
        // Reorder banners array based on the sortable order
        const orderedBanners = orderedBannerIds.map(id => banners.find(banner => banner.id === id));
        
        // Clear slideshow
        slideshowImages.innerHTML = '';
        
        // Add each banner to slideshow
        orderedBanners.forEach((banner, index) => {
            const slide = document.createElement('div');
            slide.classList.add('absolute', 'inset-0', 'transition-opacity', 'duration-500');
            
            if (index !== currentSlideIndex) {
                slide.classList.add('opacity-0');
            }
            
            slide.innerHTML = `
                <img src="${banner.image}" alt="${banner.title}" class="w-full h-full object-cover">
                <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-3">
                    <p class="font-medium">${banner.title}</p>
                    <p class="text-sm text-gray-300 truncate">${banner.link}</p>
                </div>
            `;
            
            slideshowImages.appendChild(slide);
        });
        
        // Show navigation if there are multiple banners
        if (orderedBanners.length > 1) {
            prevSlideBtn.classList.remove('hidden');
            nextSlideBtn.classList.remove('hidden');
        } else {
            prevSlideBtn.classList.add('hidden');
            nextSlideBtn.classList.add('hidden');
        }
        
        // Reset current slide index if it's out of bounds
        if (currentSlideIndex >= orderedBanners.length) {
            currentSlideIndex = 0;
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
        bannerTitleInput.value = banner.title;
        bannerLinkInput.value = banner.link;
        
        // Format dates for display in picker
        const startDate = formatDate(banner.startDate);
        const endDate = formatDate(banner.endDate);
        
        bannerStartDateInput._flatpickr.setDate(startDate);
        bannerEndDateInput._flatpickr.setDate(endDate);
        
        // Show image preview
        imagePreview.src = banner.image;
        uploadPlaceholder.classList.add('hidden');
        previewContainer.classList.remove('hidden');
        
        // Update modal title and button text
        modalTitle.textContent = 'Cập nhật banner';
        saveBannerBtn.textContent = 'Lưu';
        
        // Show delete button
        deleteBannerBtn.classList.remove('hidden');
        
        // Clear validation errors
        clearValidationErrors();
        
        // Show modal
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
        deletePreview.src = banner.image;
        deleteTitle.textContent = banner.title;
        deleteDates.textContent = `${formatDate(banner.startDate)} - ${formatDate(banner.endDate)}`;
        
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
    
    function deleteBanner() {
        if (deletingBannerId === null) return;
        
        // In a real app, you would send a DELETE request to the server
        // For now, we'll just remove from our local array
        banners = banners.filter(banner => banner.id !== deletingBannerId);
        
        // Close modal
        closeDeleteModal();
        
        // Reload banners
        loadBanners();
        updateSlideshowPreview();
        
        // Show success message
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
        
        // Validate file type and size
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        const maxSize = 2 * 1024 * 1024; // 2MB
        
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
        
        // Preview image
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            uploadPlaceholder.classList.add('hidden');
            previewContainer.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
    
    function handleSaveBanner() {
        // Validate form
        if (!validateForm()) return;
        
        // Get form data
        const bannerId = bannerIdInput.value ? parseInt(bannerIdInput.value) : null;
        const title = bannerTitleInput.value.trim();
        const link = bannerLinkInput.value.trim();
        const startDateFormatted = formatDateForStorage(bannerStartDateInput._flatpickr.selectedDates[0]);
        const endDateFormatted = formatDateForStorage(bannerEndDateInput._flatpickr.selectedDates[0]);
        
        // In a real app, you would upload the image to the server and get a URL
        // For now, we'll use the preview URL if available, or a placeholder
        // Replace Vietnamese characters with ASCII equivalents for the URL text parameter
        const simplifiedTitle = title.normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")  // Remove accents
            .replace(/[đĐ]/g, d => d === 'đ' ? 'd' : 'D'); // Replace Vietnamese d/D
            
        const imageUrl = imagePreview.src || `https://placehold.co/1200x400/33A8FF/FFFFFF/png?text=${encodeURIComponent(simplifiedTitle)}`;
        
        if (bannerId) {
            // Update existing banner
            const index = banners.findIndex(b => b.id === bannerId);
            if (index !== -1) {
                banners[index] = {
                    ...banners[index],
                    title,
                    link,
                    startDate: startDateFormatted,
                    endDate: endDateFormatted,
                    image: imageUrl
                };
            }
            
            showToast('Cập nhật banner thành công');
        } else {
            // Add new banner
            const newBanner = {
                id: Date.now(), // Generate unique ID
                title,
                link,
                startDate: startDateFormatted,
                endDate: endDateFormatted,
                image: imageUrl,
                order: banners.length + 1
            };
            
            banners.push(newBanner);
            showToast('Thêm banner mới thành công');
        }
        
        // Close modal
        closeModal();
        
        // Reload banners
        loadBanners();
        updateSlideshowPreview();
    }
    
    function saveOrder() {
        // Get ordered banner IDs from sortable container
        const orderedBannerIds = Array.from(sortableContainer.querySelectorAll('.sortable-item')).map(
            item => parseInt(item.dataset.id)
        );
        
        // Update order in banners array
        orderedBannerIds.forEach((id, index) => {
            const banner = banners.find(b => b.id === id);
            if (banner) {
                banner.order = index + 1;
            }
        });
        
        // In a real app, you would send the updated order to the server
        
        // Update slideshow preview
        updateSlideshowPreview();
        
        // Show success message
        showToast('Lưu thứ tự hiển thị thành công');
    }
    
    function validateForm() {
        let isValid = true;
        clearValidationErrors();
        
        // Validate title
        if (!bannerTitleInput.value.trim()) {
            titleError.classList.remove('hidden');
            isValid = false;
        }
        
        // Validate link
        const linkValue = bannerLinkInput.value.trim();
        if (!linkValue || !isValidUrl(linkValue)) {
            linkError.classList.remove('hidden');
            isValid = false;
        }
        
        // Validate start date
        if (!bannerStartDateInput._flatpickr.selectedDates[0]) {
            startDateError.classList.remove('hidden');
            isValid = false;
        }
        
        // Validate end date
        if (!bannerEndDateInput._flatpickr.selectedDates[0]) {
            endDateError.textContent = 'Vui lòng chọn ngày kết thúc';
            endDateError.classList.remove('hidden');
            isValid = false;
        } else if (
            bannerStartDateInput._flatpickr.selectedDates[0] &&
            bannerEndDateInput._flatpickr.selectedDates[0] < bannerStartDateInput._flatpickr.selectedDates[0]
        ) {
            endDateError.textContent = 'Ngày kết thúc phải sau ngày bắt đầu';
            endDateError.classList.remove('hidden');
            isValid = false;
        }
        
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
        titleError.classList.add('hidden');
        linkError.classList.add('hidden');
        startDateError.classList.add('hidden');
        endDateError.classList.add('hidden');
        imageError.classList.add('hidden');
    }
    
    function showToast(message) {
        toastNotification.textContent = message;
        toastNotification.classList.remove('translate-y-20', 'opacity-0');
        
        setTimeout(() => {
            toastNotification.classList.add('translate-y-20', 'opacity-0');
        }, 3000);
    }
    
    // Utility functions
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
    
    function formatDateForStorage(date) {
        return date.toISOString().split('T')[0];
    }
    
    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
});