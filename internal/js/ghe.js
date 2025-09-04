document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const seatTypesList = document.getElementById('seat-types-list');
    const btnAddSeatType = document.getElementById('btn-add-seat-type');
    const modalAddSeatType = document.getElementById('modal-add-seat-type');
    const modalEditSeatType = document.getElementById('modal-edit-seat-type');
    const btnSubmitAdd = document.getElementById('btn-submit-add');
    const btnSubmitEdit = document.getElementById('btn-submit-edit');
    const cancelButtons = document.querySelectorAll('.btn-cancel');
    const toast = document.getElementById('toast-notification');

    // Form elements
    const formAddSeatType = document.getElementById('form-add-seat-type');
    const formEditSeatType = document.getElementById('form-edit-seat-type');

    // Sample data for demonstration
    const sampleSeatTypes = [
        { id: 1, name: 'VIP', description: 'Ghế cao cấp với thiết kế thoải mái hơn', color: '#EF4444', price: 50000 },
        { id: 2, name: 'Đôi', description: 'Ghế đôi dành cho cặp đôi', color: '#F59E0B', price: 100000 },
        { id: 3, name: 'Thường', description: 'Ghế tiêu chuẩn', color: '#3B82F6', price: 0 },
        { id: 4, name: 'Premium', description: 'Ghế cao cấp với không gian rộng hơn', color: '#8B5CF6', price: 70000 }
    ];

    // Load seat types list
    function loadSeatTypes() {
        // In a real app, this would be an API call
        setTimeout(() => {
            renderSeatTypes(sampleSeatTypes);
        }, 500);
    }

    // Render seat types list
    function renderSeatTypes(seatTypes) {
        if (!seatTypes || seatTypes.length === 0) {
            seatTypesList.innerHTML = `
                <li class="px-6 py-4 flex items-center">
                    <div class="w-full text-center text-gray-500">Chưa có loại ghế nào</div>
                </li>
            `;
            return;
        }

        seatTypesList.innerHTML = '';
        seatTypes.forEach(seatType => {
            const listItem = document.createElement('li');
            listItem.className = 'px-6 py-4 flex items-center justify-between hover:bg-gray-50';
            listItem.innerHTML = `
                <div class="flex items-center">
                    <span class="seat-type-icon" style="background-color: ${seatType.color}"></span>
                    <div>
                        <h3 class="text-lg font-medium text-gray-900">${seatType.name}</h3>
                        <p class="text-sm text-gray-500">${seatType.description || 'Không có mô tả'}</p>
                        <p class="text-sm mt-1">Phụ thu: <span class="seat-price">${formatCurrency(seatType.price)}</span></p>
                    </div>
                </div>
                <div class="flex space-x-2">
                    <button type="button" class="btn-edit inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" data-id="${seatType.id}">
                        <svg class="-ml-1 mr-1 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Sửa
                    </button>
                </div>
            `;
            seatTypesList.appendChild(listItem);
        });

        // Add event listeners to edit buttons
        document.querySelectorAll('.btn-edit').forEach(button => {
            button.addEventListener('click', function() {
                const seatTypeId = parseInt(this.getAttribute('data-id'));
                openEditModal(seatTypeId);
            });
        });
    }

    // Format currency
    function formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    }

    // Show toast notification
    function showToast(message, isError = false) {
        toast.textContent = message;
        toast.classList.remove('translate-y-20', 'opacity-0', 'bg-green-500', 'bg-red-500');
        toast.classList.add(isError ? 'bg-red-500' : 'bg-green-500');
        
        // Show the toast
        setTimeout(() => {
            toast.classList.remove('translate-y-20', 'opacity-0');
        }, 10);
        
        // Hide the toast after 3 seconds
        setTimeout(() => {
            toast.classList.add('translate-y-20', 'opacity-0');
        }, 3000);
    }

    // Validate form
    function validateForm(formData, isEdit = false) {
        let isValid = true;
        const errors = {};
        
        // Validate name
        if (!formData.name || formData.name.trim() === '') {
            errors.name = 'Tên loại ghế không được để trống';
            isValid = false;
        }
        
        // Validate price
        if (formData.price < 0) {
            errors.price = 'Phụ thu không được âm';
            isValid = false;
        }
        
        // Show errors if any
        const prefix = isEdit ? 'edit-' : '';
        Object.keys(errors).forEach(field => {
            const errorElement = document.getElementById(`${prefix}${field}-error`);
            if (errorElement) {
                errorElement.textContent = errors[field];
                errorElement.classList.remove('hidden');
            }
        });
        
        // Clear previous error messages for valid fields
        ['name', 'description', 'price'].forEach(field => {
            if (!errors[field]) {
                const errorElement = document.getElementById(`${prefix}${field}-error`);
                if (errorElement) {
                    errorElement.textContent = '';
                    errorElement.classList.add('hidden');
                }
            }
        });
        
        return isValid;
    }

    // Open Add Modal
    function openAddModal() {
        // Reset form
        formAddSeatType.reset();
        document.getElementById('seat-type-color').value = '#EF4444';
        document.getElementById('seat-type-price').value = '0';
        
        // Clear error messages
        document.querySelectorAll('#form-add-seat-type .text-red-600').forEach(el => {
            el.textContent = '';
            el.classList.add('hidden');
        });
        
        // Show modal
        modalAddSeatType.classList.remove('hidden');
    }

    // Open Edit Modal
    function openEditModal(seatTypeId) {
        // In a real app, this would be an API call to get the seat type details
        const seatType = sampleSeatTypes.find(st => st.id === seatTypeId);
        if (!seatType) return;
        
        // Populate form
        document.getElementById('edit-seat-type-id').value = seatType.id;
        document.getElementById('edit-seat-type-name').value = seatType.name;
        document.getElementById('edit-seat-type-description').value = seatType.description || '';
        document.getElementById('edit-seat-type-color').value = seatType.color;
        document.getElementById('edit-seat-type-price').value = seatType.price;
        
        // Clear error messages
        document.querySelectorAll('#form-edit-seat-type .text-red-600').forEach(el => {
            el.textContent = '';
            el.classList.add('hidden');
        });
        
        // Show modal
        modalEditSeatType.classList.remove('hidden');
    }

    // Close modals
    function closeModals() {
        modalAddSeatType.classList.add('hidden');
        modalEditSeatType.classList.add('hidden');
    }

    // Add new seat type
    function addSeatType() {
        const formData = {
            name: document.getElementById('seat-type-name').value.trim(),
            description: document.getElementById('seat-type-description').value.trim(),
            color: document.getElementById('seat-type-color').value,
            price: parseInt(document.getElementById('seat-type-price').value) || 0
        };
        
        // Validate form
        if (!validateForm(formData)) {
            return;
        }
        
        // In a real app, this would be an API call
        // For demo, we'll just add it to our sample data
        const newSeatType = {
            id: sampleSeatTypes.length + 1,
            ...formData
        };
        
        sampleSeatTypes.push(newSeatType);
        
        // Close modal
        closeModals();
        
        // Show success message
        showToast('Thêm loại ghế mới thành công');
        
        // Refresh the list
        renderSeatTypes(sampleSeatTypes);
    }

    // Update seat type
    function updateSeatType() {
        const seatTypeId = parseInt(document.getElementById('edit-seat-type-id').value);
        const formData = {
            name: document.getElementById('edit-seat-type-name').value.trim(),
            description: document.getElementById('edit-seat-type-description').value.trim(),
            color: document.getElementById('edit-seat-type-color').value,
            price: parseInt(document.getElementById('edit-seat-type-price').value) || 0
        };
        
        // Validate form
        if (!validateForm(formData, true)) {
            return;
        }
        
        // In a real app, this would be an API call
        // For demo, we'll just update our sample data
        const index = sampleSeatTypes.findIndex(st => st.id === seatTypeId);
        if (index !== -1) {
            sampleSeatTypes[index] = {
                ...sampleSeatTypes[index],
                ...formData
            };
        }
        
        // Close modal
        closeModals();
        
        // Show success message
        showToast('Cập nhật thông tin loại ghế thành công');
        
        // Refresh the list
        renderSeatTypes(sampleSeatTypes);
    }

    // Event Listeners
    btnAddSeatType.addEventListener('click', openAddModal);
    
    cancelButtons.forEach(button => {
        button.addEventListener('click', closeModals);
    });
    
    btnSubmitAdd.addEventListener('click', addSeatType);
    
    btnSubmitEdit.addEventListener('click', updateSeatType);
    
    // When clicking outside the modal content, close the modal
    window.addEventListener('click', function(event) {
        if (event.target === modalAddSeatType || event.target === modalEditSeatType) {
            closeModals();
        }
    });

    // Initialize
    loadSeatTypes();
});