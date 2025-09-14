import Spinner from "./util/spinner.js";
document.addEventListener('DOMContentLoaded', function() {
    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all tabs
            tabBtns.forEach(b => {
                b.classList.remove('bg-red-600', 'text-white');
                b.classList.add('bg-white', 'text-gray-700', 'border', 'border-gray-200');
            });
            
            // Add active class to clicked tab
            this.classList.remove('bg-white', 'text-gray-700', 'border', 'border-gray-200');
            this.classList.add('bg-red-600', 'text-white');
            
            // Hide all tab contents
            tabContents.forEach(content => {
                content.classList.remove('active');
            });
            
            // Show corresponding tab content
            const tabId = this.id.replace('tab-btn-', 'tab-');
            document.getElementById(tabId).classList.add('active');
            
            // Load data for the active tab
            loadTabData(tabId);
        });
    });

    // Modals
    const modals = {
        addProduct: document.getElementById('add-product-modal'),
        editProduct: document.getElementById('edit-product-modal'),
        addCategory: document.getElementById('add-category-modal'),
        editCategory: document.getElementById('edit-category-modal'),
        addCombo: document.getElementById('add-combo-modal'),
        editCombo: document.getElementById('edit-combo-modal')
    };
    
    // Open Add Product Modal
    document.getElementById('btn-add-product').addEventListener('click', function() {
        // Load categories for combobox
        const categorySelect = document.getElementById('product-category');
        const url = document.getElementById('category-list').dataset.url + '/api/danh-muc';
        fetch(url)
            .then(res => res.json())
            .then(data => {
                // Xóa các option cũ
                categorySelect.innerHTML = '<option value="">Chọn danh mục</option>';
                if (data.success && Array.isArray(data.data)) {
                    data.data.forEach(cat => {
                        const option = document.createElement('option');
                        option.value = cat.id;
                        option.textContent = cat.ten;
                        categorySelect.appendChild(option);
                    });
                }
            });
        openModal(modals.addProduct);
    });
    
    // Open Add Category Modal
    document.getElementById('btn-add-category').addEventListener('click', function() {
        openModal(modals.addCategory);
    });
    
    // Open Add Combo Modal
    document.getElementById('btn-add-combo').addEventListener('click', function() {
        openModal(modals.addCombo);
        resetComboForm();
    });
    
    // Product rows click handler
    const productItems = document.querySelectorAll('.product-item');
    productItems.forEach(item => {
        item.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            // Highlight selected row
            productItems.forEach(row => row.classList.remove('bg-gray-100'));
            this.classList.add('bg-gray-100');
            
            // Load product data and show edit modal
            loadProductData(productId);
            openModal(modals.editProduct);
        });
    });
    
    // Category items click handler
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            const categoryId = this.getAttribute('data-id');
            // Highlight selected row
            categoryItems.forEach(row => row.classList.remove('bg-gray-100'));
            this.classList.add('bg-gray-100');
            
            // Load category data and show edit modal
            loadCategoryData(categoryId);
            openModal(modals.editCategory);
        });
    });
    
    // Combo items click handler
    const comboItems = document.querySelectorAll('.combo-item');
    comboItems.forEach(item => {
        item.addEventListener('click', function() {
            const comboId = this.getAttribute('data-id');
            comboItems.forEach(row => row.classList.remove('bg-gray-100'));
            this.classList.add('bg-gray-100');
            
            loadComboData(comboId);
            openModal(modals.editCombo);
        });
    });
    
    // Add Product Form Submit
    document.getElementById('add-product-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('product-name').value.trim();
        const category = document.getElementById('product-category').value;
        const price = document.getElementById('product-price').value;
        const imageInput = document.getElementById('product-image');
        const description = document.getElementById('product-description').value.trim();
        const hasImage = imageInput.files && imageInput.files.length > 0;
        let isValid = validateProductForm(name, category, price, hasImage);
        if (isValid) {
            const spinner = Spinner.show({text: 'Đang thêm sản phẩm...'});
            const formData = new FormData();
            formData.append('ten', name);
            formData.append('danh_muc_id', category);
            formData.append('gia', price);
            formData.append('mo_ta', description);
            if (hasImage) {
                formData.append('hinh_anh', imageInput.files[0]);
            }
            fetch(document.querySelector('.product-item').parentElement.dataset.url + '/api/san-pham', {
                method: 'POST',
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                Spinner.hide(spinner);
                if (data.success) {
                    showSuccessToast('Thêm sản phẩm thành công!');
                    closeModal(modals.addProduct);
                    setTimeout(() => {
                        location.reload();
                    }, 1000);
                } else {
                    showSuccessToast(data.message || 'Thêm sản phẩm thất bại!');
                }
            })
            .catch(() => {
                Spinner.hide(spinner);
                showSuccessToast('Có lỗi khi gửi dữ liệu!');
            });
        }
    });
    
    // Edit Product Form Submit
    document.getElementById('edit-product-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const productId = document.getElementById('edit-product-id').value;
        const name = document.getElementById('edit-product-name').value;
        const category = document.getElementById('edit-product-category').value;
        const price = document.getElementById('edit-product-price').value;
        const description = document.getElementById('edit-product-description').value;
        
        let isValid = validateProductForm(name, category, price, true, 'edit-');
        
        if (isValid) {
            // In a real application, submit data via AJAX
            // For demo purposes:
            showSuccessToast('Cập nhật thông tin sản phẩm thành công!');
            closeModal(modals.editProduct);
            
            // Update the product in the list (in a real app, we would refresh or update the UI)
            setTimeout(() => {
                location.reload(); // Simple refresh for demo
            }, 1000);
        }
    });
    
    // Edit Category Form Submit
    document.getElementById('edit-category-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const categoryId = document.getElementById('edit-category-id').value;
        const name = document.getElementById('edit-category-name').value;
        
        let isValid = validateCategoryForm(name, 'edit-');
        
        if (isValid) {
            // In a real application, submit data via AJAX
            // For demo purposes:
            closeModal(modals.editCategory);
            
        }
    });
    
    // Add Combo Form Submit
    document.getElementById('add-combo-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('combo-name').value;
        const price = document.getElementById('combo-price').value;
        const hasImage = comboImageInput.files && comboImageInput.files.length > 0;
        const description = document.getElementById('combo-description').value;
        const productsList = document.getElementById('combo-products-list');
        const hasProducts = productsList.children.length > 0;
        
        let isValid = validateComboForm(name, price, hasImage, hasProducts);
        
        if (isValid) {
            showSuccessToast('Thêm combo thành công!');
            closeModal(modals.addCombo);
            
            setTimeout(() => {
                location.reload(); // Simple refresh for demo
            }, 1000);
        }
    });
    
    // Edit Combo Form Submit
    document.getElementById('edit-combo-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const comboId = document.getElementById('edit-combo-id').value;
        const name = document.getElementById('edit-combo-name').value;
        const price = document.getElementById('edit-combo-price').value;
        const description = document.getElementById('edit-combo-description').value;
        const productsList = document.getElementById('edit-combo-products-list');
        const hasProducts = productsList.children.length > 0;
        
        let isValid = validateComboForm(name, price, true, hasProducts, 'edit-');
        
        if (isValid) {
            showSuccessToast('Cập nhật combo thành công!');
            closeModal(modals.editCombo);
            
            setTimeout(() => {
                location.reload(); // Simple refresh for demo
            }, 1000);
        }
    });
    
    // Close modals with close buttons
    const closeButtons = document.querySelectorAll('.modal-close, .modal-close-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Close modals when clicking on overlay
    const overlays = document.querySelectorAll('.modal-overlay');
    overlays.forEach(overlay => {
        overlay.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Image handling for add product form
    const selectImageBtn = document.getElementById('select-image-btn');
    const productImageInput = document.getElementById('product-image');
    const previewImage = document.getElementById('preview-image');
    const imagePreviewPlaceholder = document.querySelector('.image-preview-placeholder');
    
    selectImageBtn.addEventListener('click', function() {
        productImageInput.click();
    });
    
    productImageInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                previewImage.classList.remove('hidden');
                imagePreviewPlaceholder.classList.add('hidden');
            };
            
            reader.readAsDataURL(this.files[0]);
        }
    });
    
    // Image handling for edit product form
    const editSelectImageBtn = document.getElementById('edit-select-image-btn');
    const editProductImageInput = document.getElementById('edit-product-image');
    const editPreviewImage = document.getElementById('edit-preview-image');
    
    editSelectImageBtn.addEventListener('click', function() {
        editProductImageInput.click();
    });
    
    editProductImageInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                editPreviewImage.src = e.target.result;
            };
            
            reader.readAsDataURL(this.files[0]);
        }
    });
    
    // Image handling for add combo form
    const comboSelectImageBtn = document.getElementById('combo-select-image-btn');
    const comboImageInput = document.getElementById('combo-image');
    const comboPreviewImage = document.getElementById('combo-preview-image');
    const comboImagePreviewPlaceholder = document.querySelector('#add-combo-modal .image-preview-placeholder');
    
    comboSelectImageBtn.addEventListener('click', function() {
        comboImageInput.click();
    });
    
    comboImageInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                comboPreviewImage.src = e.target.result;
                comboPreviewImage.classList.remove('hidden');
                comboImagePreviewPlaceholder.classList.add('hidden');
            };
            
            reader.readAsDataURL(this.files[0]);
        }
    });
    
    // Image handling for edit combo form
    const editComboSelectImageBtn = document.getElementById('edit-combo-select-image-btn');
    const editComboImageInput = document.getElementById('edit-combo-image');
    const editComboPreviewImage = document.getElementById('edit-combo-preview-image');
    
    editComboSelectImageBtn.addEventListener('click', function() {
        editComboImageInput.click();
    });
    
    editComboImageInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                editComboPreviewImage.src = e.target.result;
            };
            
            reader.readAsDataURL(this.files[0]);
        }
    });
    
    // Add product to combo
    document.getElementById('btn-add-product-to-combo').addEventListener('click', function() {
        const productSearch = document.getElementById('combo-product-search').value;
        const quantity = parseInt(document.getElementById('combo-product-quantity').value);
        
        if (!productSearch || quantity < 1) {
            alert('Vui lòng nhập tên sản phẩm và số lượng');
            return;
        }
        
        // In a real app, you would search for the product in the database
        // For demo purposes, let's just add a mock product
        addProductToComboList('combo-products-list', {
            id: Date.now().toString(), // unique ID for demo
            name: productSearch,
            price: Math.floor(Math.random() * 50000) + 10000,
            quantity: quantity
        });
        
        updateComboTotalValue();
        
        // Clear inputs
        document.getElementById('combo-product-search').value = '';
        document.getElementById('combo-product-quantity').value = '1';
        
        // Hide empty message if visible
        document.getElementById('combo-empty-message').style.display = 'none';
    });
    
    // Add product to edit combo
    document.getElementById('btn-add-product-to-edit-combo').addEventListener('click', function() {
        const productSearch = document.getElementById('edit-combo-product-search').value;
        const quantity = parseInt(document.getElementById('edit-combo-product-quantity').value);
        
        if (!productSearch || quantity < 1) {
            alert('Vui lòng nhập tên sản phẩm và số lượng');
            return;
        }
        
        // In a real app, you would search for the product in the database
        // For demo purposes, let's just add a mock product
        addProductToComboList('edit-combo-products-list', {
            id: Date.now().toString(), // unique ID for demo
            name: productSearch,
            price: Math.floor(Math.random() * 50000) + 10000,
            quantity: quantity
        });
        
        updateEditComboTotalValue();
        
        // Clear inputs
        document.getElementById('edit-combo-product-search').value = '';
        document.getElementById('edit-combo-product-quantity').value = '1';
        
        // Hide empty message if visible
        document.getElementById('edit-combo-empty-message').style.display = 'none';
    });
    
    // Search product functionality
    document.getElementById('btn-search-product').addEventListener('click', function() {
        const searchTerm = document.getElementById('search-product').value.toLowerCase();
        const categoryFilter = document.getElementById('filter-category').value;
        
        const productRows = document.querySelectorAll('.product-item');
        let hasVisibleRows = false;
        
        productRows.forEach(row => {
            const name = row.querySelector('td:first-child').textContent.toLowerCase();
            const description = row.querySelector('td:last-child').textContent.toLowerCase();
            const rowCategoryId = getCategoryIdFromRow(row);
            
            const matchesSearch = searchTerm === '' || name.includes(searchTerm) || description.includes(searchTerm);
            const matchesCategory = categoryFilter === '' || rowCategoryId === categoryFilter;
            
            if (matchesSearch && matchesCategory) {
                row.classList.remove('hidden');
                hasVisibleRows = true;
            } else {
                row.classList.add('hidden');
            }
        });
        
        // Show/hide "No results" message
        const noResultsMessage = document.getElementById('no-results-products');
        if (hasVisibleRows) {
            noResultsMessage.classList.add('hidden');
            noResultsMessage.classList.remove('flex');
        } else {
            noResultsMessage.classList.remove('hidden');
            noResultsMessage.classList.add('flex');
        }
    });
    
    // Helper Functions
    function openModal(modal) {
        document.body.classList.add('modal-active');
        modal.classList.add('opacity-100');
        modal.classList.remove('opacity-0', 'pointer-events-none');
    }
    
    function closeModal(modal) {
        document.body.classList.remove('modal-active');
        modal.classList.add('opacity-0', 'pointer-events-none');
        modal.classList.remove('opacity-100');
    }
    
    function validateProductForm(name, category, price, hasImage, prefix = '') {
        let isValid = true;
        prefix = prefix || '';
        // Reset error messages
        document.querySelectorAll('.invalid-feedback').forEach(el => el.classList.add('hidden'));
        // Validate name (required)
        if (!name) {
            document.getElementById(`${prefix}product-name-error`).classList.remove('hidden');
            isValid = false;
        }
        // Validate category (required)
        if (!category) {
            document.getElementById(`${prefix}product-category-error`).classList.remove('hidden');
            isValid = false;
        }
        // Validate price (required and must be positive)
        if (!price || price <= 0) {
            document.getElementById(`${prefix}product-price-error`).classList.remove('hidden');
            isValid = false;
        }
        // Validate image for new products
        if (prefix === '') {
            const imageInput = document.getElementById('product-image');
            if (!imageInput.files || imageInput.files.length === 0) {
                document.getElementById('product-image-error').classList.remove('hidden');
                isValid = false;
            }
        }
        return isValid;
    }
    
    function validateCategoryForm(name, prefix = '') {
        let isValid = true;
        prefix = prefix || '';
        
        // Reset error messages
        document.querySelectorAll('.invalid-feedback').forEach(el => el.classList.add('hidden'));
        
        // Validate name (required)
        if (!name) {
            document.getElementById(`${prefix}category-name-error`).classList.remove('hidden');
            isValid = false;
        }
        
        return isValid;
    }
    
    function validateComboForm(name, price, hasImage, hasProducts, prefix = '') {
        let isValid = true;
        prefix = prefix || '';
        
        // Reset error messages
        document.querySelectorAll(`#${prefix ? 'edit' : 'add'}-combo-modal .invalid-feedback`).forEach(el => el.classList.add('hidden'));
        
        // Validate name (required)
        if (!name) {
            document.getElementById(`${prefix}combo-name-error`).classList.remove('hidden');
            isValid = false;
        }
        
        // Validate price (required and must be positive)
        if (!price || price <= 0) {
            document.getElementById(`${prefix}combo-price-error`).classList.remove('hidden');
            isValid = false;
        }
        
        // Validate image for new combos
        if (prefix === '' && !hasImage) {
            document.getElementById('combo-image-error').classList.remove('hidden');
            isValid = false;
        }
        
        // Validate that at least one product is added
        if (!hasProducts) {
            document.getElementById(`${prefix}combo-products-error`).classList.remove('hidden');
            isValid = false;
        }
        
        return isValid;
    }
    
    function loadProductData(productId) {
        // In a real application, this would fetch data via AJAX
        document.getElementById('edit-product-id').value = productId;
        
        // Demo data for each product
        if (productId === '1') {
            document.getElementById('edit-product-name').value = 'Bắp rang bơ';
            document.getElementById('edit-product-category').value = '1';
            document.getElementById('edit-product-price').value = '45000';
            document.getElementById('edit-product-description').value = 'Bắp rang bơ thơm ngon, giòn rụm';
            document.getElementById('edit-preview-image').src = ``;
        } else if (productId === '2') {
            document.getElementById('edit-product-name').value = 'Coca-Cola (L)';
            document.getElementById('edit-product-category').value = '2';
            document.getElementById('edit-product-price').value = '35000';
            document.getElementById('edit-product-description').value = 'Coca-Cola size lớn 500ml';
            document.getElementById('edit-preview-image').src = ``;
        } else if (productId === '3') {
            document.getElementById('edit-product-name').value = 'Nachos pho mát';
            document.getElementById('edit-product-category').value = '3';
            document.getElementById('edit-product-price').value = '55000';
            document.getElementById('edit-product-description').value = 'Nachos giòn với sốt phô mai béo ngậy';
            document.getElementById('edit-preview-image').src = ``;
        }
    }

    function loadCategoryData(categoryId) {
        if (window.loadCategoryData) {
            window.loadCategoryData(categoryId);
        } else {
            // Fallback implementation
            document.getElementById('edit-category-id').value = categoryId;
            
            // Demo data for each category
            if (categoryId === '1') {
                document.getElementById('edit-category-name').value = 'Bắp rang';
            } else if (categoryId === '2') {
                document.getElementById('edit-category-name').value = 'Nước uống';
            } else if (categoryId === '3') {
                document.getElementById('edit-category-name').value = 'Đồ ăn nhẹ';
            } else if (categoryId === '4') {
                document.getElementById('edit-category-name').value = 'Combo';
            }
        }
    }

    function loadComboData(comboId) {
        document.getElementById('edit-combo-id').value = comboId;
        
        // Clear previous products
        document.getElementById('edit-combo-products-list').innerHTML = '';
        
        // Demo data for each combo
        if (comboId === '1') {
            document.getElementById('edit-combo-name').value = 'Combo Big Share';
            document.getElementById('edit-combo-price').value = '120000';
            document.getElementById('edit-combo-description').value = 'Combo dành cho 2-3 người xem phim, tiết kiệm hơn so với mua lẻ.';
            document.getElementById('edit-combo-preview-image').src = ``;
            
            // Add demo products
            addProductToComboList('edit-combo-products-list', {
                id: '1',
                name: 'Bắp rang bơ lớn',
                price: 45000,
                quantity: 1
            });
            
            addProductToComboList('edit-combo-products-list', {
                id: '2',
                name: 'Coca-Cola vừa',
                price: 35000,
                quantity: 2
            });
            
            addProductToComboList('edit-combo-products-list', {
                id: '3',
                name: 'Nachos',
                price: 55000,
                quantity: 1
            });
            
            updateEditComboTotalValue();
        } else if (comboId === '2') {
            document.getElementById('edit-combo-name').value = 'Combo Sweet Couple';
            document.getElementById('edit-combo-price').value = '90000';
            document.getElementById('edit-combo-description').value = 'Combo lý tưởng cho cặp đôi, tiết kiệm 15% so với mua lẻ.';
            document.getElementById('edit-combo-preview-image').src = ``;
            
            // Add demo products
            addProductToComboList('edit-combo-products-list', {
                id: '1',
                name: 'Bắp rang bơ vừa',
                price: 35000,
                quantity: 1
            });
            
            addProductToComboList('edit-combo-products-list', {
                id: '2',
                name: 'Coca-Cola nhỏ',
                price: 30000,
                quantity: 2
            });
            
            updateEditComboTotalValue();
        } else if (comboId === '3') {
            document.getElementById('edit-combo-name').value = 'Combo Family';
            document.getElementById('edit-combo-price').value = '180000';
            document.getElementById('edit-combo-description').value = 'Combo dành cho gia đình hoặc nhóm bạn 4-5 người.';
            document.getElementById('edit-combo-preview-image').src = ``;
            
            // Add demo products
            addProductToComboList('edit-combo-products-list', {
                id: '1',
                name: 'Bắp rang bơ lớn',
                price: 45000,
                quantity: 2
            });
            
            addProductToComboList('edit-combo-products-list', {
                id: '2',
                name: 'Coca-Cola vừa',
                price: 35000,
                quantity: 4
            });
            
            addProductToComboList('edit-combo-products-list', {
                id: '3',
                name: 'Nachos',
                price: 55000,
                quantity: 2
            });
            
            updateEditComboTotalValue();
        }
    }

    function showSuccessToast(message) {
        const toast = document.getElementById('success-toast');
        const toastMessage = document.getElementById('toast-message');
        
        toastMessage.textContent = message;
        toast.classList.remove('opacity-0', 'translate-y-full');
        toast.classList.add('opacity-100', 'translate-y-0');
        
        setTimeout(() => {
            hideToast();
        }, 3000);
    }

    function hideToast() {
        const toast = document.getElementById('success-toast');
        toast.classList.add('opacity-0', 'translate-y-full');
        toast.classList.remove('opacity-100', 'translate-y-0');
    }

    function getCategoryIdFromRow(row) {
        // Get category info from the row
        const categoryCell = row.querySelector('td:nth-child(2)');
        // Extract category ID from a data attribute or using another method
        // For demo purposes, let's assume we have a data attribute on the cell
        return categoryCell.getAttribute('data-id');
    }
    
    // Helper functions for combo functionality
    function addProductToComboList(listId, product) {
        const productsList = document.getElementById(listId);
        
        // Check if product already exists in the list
        const existingRow = productsList.querySelector(`[data-product-id="${product.id}"]`);
        if (existingRow) {
            // Update quantity instead of adding new row
            const quantityCell = existingRow.querySelector('.product-quantity');
            const currentQuantity = parseInt(quantityCell.textContent);
            const newQuantity = currentQuantity + product.quantity;
            quantityCell.textContent = newQuantity;
            
            const priceCell = existingRow.querySelector('.product-total');
            const unitPrice = product.price;
            priceCell.textContent = formatPrice(unitPrice * newQuantity);
            
            return;
        }
        
        const row = document.createElement('tr');
        row.className = 'combo-product-item';
        row.setAttribute('data-product-id', product.id);
        row.innerHTML = `
            <td class="px-4 py-2 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="text-sm font-medium text-gray-900">${product.name}</div>
                    <input type="hidden" name="product_ids[]" value="${product.id}">
                    <input type="hidden" class="product-unit-price" value="${product.price}">
                </div>
            </td>
            <td class="px-4 py-2 whitespace-nowrap">
                <div class="text-sm text-gray-900 product-quantity">${product.quantity}</div>
                <input type="hidden" name="product_quantities[]" value="${product.quantity}">
            </td>
            <td class="px-4 py-2 whitespace-nowrap">
                <div class="text-sm text-gray-900 product-total">${formatPrice(product.price * product.quantity)}</div>
            </td>
            <td class="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                <button type="button" class="text-red-600 hover:text-red-900 remove-combo-product">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                </button>
            </td>
        `;
        
        // Add event listener to remove button
        row.querySelector('.remove-combo-product').addEventListener('click', function() {
            row.remove();
            
            // Update total value
            if (listId === 'combo-products-list') {
                updateComboTotalValue();
                
                // Show empty message if no products left
                if (productsList.children.length === 0) {
                    document.getElementById('combo-empty-message').style.display = 'block';
                }
            } else {
                updateEditComboTotalValue();
                
                // Show empty message if no products left
                if (productsList.children.length === 0) {
                    document.getElementById('edit-combo-empty-message').style.display = 'block';
                }
            }
        });
        
        productsList.appendChild(row);
    }

    function updateComboTotalValue() {
        const productsList = document.getElementById('combo-products-list');
        let total = 0;
        
        productsList.querySelectorAll('.combo-product-item').forEach(row => {
            const unitPrice = parseInt(row.querySelector('.product-unit-price').value);
            const quantity = parseInt(row.querySelector('.product-quantity').textContent);
            total += unitPrice * quantity;
        });
        
        document.getElementById('combo-total-value').textContent = formatPrice(total);
    }

    function updateEditComboTotalValue() {
        const productsList = document.getElementById('edit-combo-products-list');
        let total = 0;
        
        productsList.querySelectorAll('.combo-product-item').forEach(row => {
            const unitPrice = parseInt(row.querySelector('.product-unit-price').value);
            const quantity = parseInt(row.querySelector('.product-quantity').textContent);
            total += unitPrice * quantity;
        });
        
        document.getElementById('edit-combo-total-value').textContent = formatPrice(total);
    }

    function formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    }

    function resetComboForm() {
        document.getElementById('combo-name').value = '';
        document.getElementById('combo-price').value = '';
        document.getElementById('combo-description').value = '';
        document.getElementById('combo-products-list').innerHTML = '';
        document.getElementById('combo-empty-message').style.display = 'block';
        document.getElementById('combo-total-value').textContent = '0₫';
        
        // Reset image preview
        comboPreviewImage.classList.add('hidden');
        comboImagePreviewPlaceholder.classList.remove('hidden');
        comboImageInput.value = '';
        
        // Reset errors
        document.querySelectorAll('#add-combo-modal .invalid-feedback').forEach(el => el.classList.add('hidden'));
    }

    // Load data for each tab
    function loadTabData(tabId) {
        switch(tabId) {
            case 'tab-products':
                loadProducts();
                break;
            case 'tab-categories':
                loadCategories();
                break;
            case 'tab-combos':
                loadCombos();
                break;
        }
    }

    // Load products data
    function loadProducts() {
        const spinner = Spinner.show({text: 'Đang tải danh sách sản phẩm...'});
        
        // In a real application, you would fetch from API
        // For demo purposes, we'll simulate loading
        setTimeout(() => {
            Spinner.hide(spinner);
            console.log('Products loaded');
            // Here you would update the products table with fresh data
        }, 1000);
    }

    // Load categories data - use function from danh-muc-san-pham.js
    function loadCategories() {
        if (window.loadCategories) {
            window.loadCategories();
        } else {
            // Fallback if danh-muc-san-pham.js is not loaded
            const spinner = Spinner.show({text: 'Đang tải danh sách danh mục...'});
            setTimeout(() => {
                Spinner.hide(spinner);
            }, 1000);
        }
    }

    // Load combos data - use function from combo-san-pham.js
    function loadCombos() {
        if (window.loadCombos) {
            window.loadCombos();
        } else {
            // Fallback if combo-san-pham.js is not loaded
            const spinner = Spinner.show({text: 'Đang tải danh sách combo...'});
            setTimeout(() => {
                Spinner.hide(spinner);
            }, 1000);
        }
    }

    // Render categories (helper function for loadCategories)
    function renderCategories(categories = []) {
        if (window.renderCategories) {
            window.renderCategories(categories);
        } else {
            // Fallback if danh-muc-san-pham.js is not loaded
            const categoryList = document.getElementById('category-list');
            if (!categoryList) return;
            
            categoryList.innerHTML = '';
            if (!categories || categories.length === 0) {
                categoryList.innerHTML = '<li class="px-4 py-4 text-gray-400">Chưa có danh mục nào</li>';
                return;
            }
            
            categories.forEach(cat => {
                const li = document.createElement('li');
                li.className = 'category-item cursor-pointer hover:bg-gray-50';
                li.setAttribute('data-id', cat.id);
                li.innerHTML = `
                    <a href="#" class="block">
                        <div class="px-4 py-4 sm:px-6 flex items-center">
                            <div class="w-full">
                                <p class="text-sm font-medium text-indigo-600">${cat.ten}</p>
                                <p class="mt-2 text-sm text-gray-500">Số sản phẩm: ${cat.so_sanpham ?? 0}</p>
                            </div>
                        </div>
                    </a>
                `;
                categoryList.appendChild(li);
            });
            
            // Re-attach click handlers for category items
            attachCategoryClickHandlers();
        }
    }

    // Attach click handlers for category items
    function attachCategoryClickHandlers() {
        if (window.attachCategoryClickHandlers) {
            window.attachCategoryClickHandlers();
        } else {
            // Fallback implementation
            const categoryItems = document.querySelectorAll('.category-item');
            categoryItems.forEach(item => {
                item.addEventListener('click', function() {
                    const categoryId = this.getAttribute('data-id');
                    // Highlight selected row
                    categoryItems.forEach(row => row.classList.remove('bg-gray-100'));
                    this.classList.add('bg-gray-100');
                    
                    // Load category data and show edit modal
                    loadCategoryData(categoryId);
                    openModal(modals.editCategory);
                });
            });
        }
    }

    // Load initial data when page loads
    loadTabData('tab-products');
});