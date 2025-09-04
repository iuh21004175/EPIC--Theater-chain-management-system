document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const accountsList = document.getElementById('accounts-list');
    const btnAddAccount = document.getElementById('btn-add-account');
    const modalAddAccount = document.getElementById('modal-add-account');
    const modalEditAccount = document.getElementById('modal-edit-account');
    const modalAssignCinema = document.getElementById('modal-assign-cinema');
    const btnSubmitAdd = document.getElementById('btn-submit-add');
    const btnSubmitEdit = document.getElementById('btn-submit-edit');
    const btnSubmitAssign = document.getElementById('btn-submit-assign');
    const btnUnassign = document.getElementById('btn-unassign');
    const btnApplyFilters = document.getElementById('btn-apply-filters');
    const cancelButtons = document.querySelectorAll('.btn-cancel');
    const toast = document.getElementById('toast-notification');

    // Filters
    const filterStatus = document.getElementById('filter-status');
    const filterAssignment = document.getElementById('filter-assignment');
    const filterSearch = document.getElementById('filter-search');

    // Form elements
    const formAddAccount = document.getElementById('form-add-account');
    const formEditAccount = document.getElementById('form-edit-account');
    const formAssignCinema = document.getElementById('form-assign-cinema');
    const resetPasswordCheckbox = document.getElementById('edit-account-reset-password');
    const resetPasswordFields = document.getElementById('reset-password-fields');

    // Event for reset password checkbox
    resetPasswordCheckbox.addEventListener('change', function() {
        if (this.checked) {
            resetPasswordFields.classList.remove('hidden');
        } else {
            resetPasswordFields.classList.add('hidden');
        }
    });

    // Sample data for demonstration
    const sampleAccounts = [
        { id: 1, fullname: 'Nguyễn Văn A', email: 'nguyenvana@epiccinema.vn', phone: '0912345678', active: true, cinema_id: 1, cinema_name: 'EPIC Hà Nội' },
        { id: 2, fullname: 'Trần Thị B', email: 'tranthib@epiccinema.vn', phone: '0923456789', active: true, cinema_id: 2, cinema_name: 'EPIC Hồ Chí Minh' },
        { id: 3, fullname: 'Lê Văn C', email: 'levanc@epiccinema.vn', phone: '0934567890', active: false, cinema_id: null, cinema_name: null },
        { id: 4, fullname: 'Phạm Thị D', email: 'phamthid@epiccinema.vn', phone: '0945678901', active: true, cinema_id: null, cinema_name: null },
        { id: 5, fullname: 'Hoàng Văn E', email: 'hoangvane@epiccinema.vn', phone: '0956789012', active: true, cinema_id: 3, cinema_name: 'EPIC Đà Nẵng' }
    ];

    const sampleCinemas = [
        { id: 1, name: 'EPIC Hà Nội', assigned: true },
        { id: 2, name: 'EPIC Hồ Chí Minh', assigned: true },
        { id: 3, name: 'EPIC Đà Nẵng', assigned: true },
        { id: 4, name: 'EPIC Cần Thơ', assigned: false },
        { id: 5, name: 'EPIC Hải Phòng', assigned: false },
        { id: 6, name: 'EPIC Nha Trang', assigned: false }
    ];

    // Load accounts list
    function loadAccounts() {
        // In a real app, this would be an API call with filters
        const statusFilter = filterStatus.value;
        const assignmentFilter = filterAssignment.value;
        const searchTerm = filterSearch.value.toLowerCase();

        // Filter the accounts based on the selected filters
        const filteredAccounts = sampleAccounts.filter(account => {
            // Status filter
            if (statusFilter !== 'all') {
                if (statusFilter === 'active' && !account.active) return false;
                if (statusFilter === 'inactive' && account.active) return false;
            }

            // Assignment filter
            if (assignmentFilter !== 'all') {
                if (assignmentFilter === 'assigned' && !account.cinema_id) return false;
                if (assignmentFilter === 'unassigned' && account.cinema_id) return false;
            }

            // Search term
            if (searchTerm) {
                const searchFields = [
                    account.fullname.toLowerCase(),
                    account.email.toLowerCase(),
                    account.phone.toLowerCase(),
                    account.cinema_name ? account.cinema_name.toLowerCase() : ''
                ];
                return searchFields.some(field => field.includes(searchTerm));
            }

            return true;
        });

        setTimeout(() => {
            renderAccounts(filteredAccounts);
        }, 300);
    }

    // Render accounts list
    function renderAccounts(accounts) {
        if (!accounts || accounts.length === 0) {
            accountsList.innerHTML = `
                <li class="px-6 py-4 flex items-center">
                    <div class="w-full text-center text-gray-500">Không tìm thấy tài khoản nào</div>
                </li>
            `;
            return;
        }

        accountsList.innerHTML = '';
        accounts.forEach(account => {
            const listItem = document.createElement('li');
            listItem.className = 'px-6 py-4 flex items-center justify-between hover:bg-gray-50';
            
            const statusBadge = account.active 
                ? '<span class="status-badge active">Đang hoạt động</span>' 
                : '<span class="status-badge inactive">Đã khóa</span>';
            
            const assignmentBadge = account.cinema_id 
                ? `<span class="status-badge assigned">Quản lý: ${account.cinema_name}</span>` 
                : '<span class="status-badge unassigned">Chưa phân công</span>';
            
            listItem.innerHTML = `
                <div>
                    <h3 class="text-lg font-medium text-gray-900">${account.fullname}</h3>
                    <p class="text-sm text-gray-500">${account.email}</p>
                    <p class="text-sm text-gray-500">SĐT: ${account.phone || 'Chưa cập nhật'}</p>
                    <div class="mt-2 flex items-center space-x-2">
                        ${statusBadge}
                        ${assignmentBadge}
                    </div>
                </div>
                <div class="flex space-x-2">
                    <button type="button" class="btn-assign inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500" data-id="${account.id}">
                        <svg class="-ml-1 mr-1 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.168 1.168a4 4 0 00-2.929.986L9 13.92l-1.046-1.046a4 4 0 00-2.929-.986l1.168-1.168A3 3 0 007 8.172z" clip-rule="evenodd" />
                        </svg>
                        Phân công
                    </button>
                    <button type="button" class="btn-edit inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" data-id="${account.id}">
                        <svg class="-ml-1 mr-1 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Sửa
                    </button>
                </div>
            `;
            accountsList.appendChild(listItem);
        });

        // Add event listeners to buttons
        document.querySelectorAll('.btn-edit').forEach(button => {
            button.addEventListener('click', function() {
                const accountId = parseInt(this.getAttribute('data-id'));
                openEditModal(accountId);
            });
        });

        document.querySelectorAll('.btn-assign').forEach(button => {
            button.addEventListener('click', function() {
                const accountId = parseInt(this.getAttribute('data-id'));
                openAssignModal(accountId);
            });
        });
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
    function validateForm(formData, isAdd = true) {
        let isValid = true;
        const errors = {};
        
        // Validate fullname
        if (!formData.fullname || formData.fullname.trim() === '') {
            errors.fullname = 'Họ và tên không được để trống';
            isValid = false;
        }
        
        // Validate email for new accounts
        if (isAdd) {
            if (!formData.email || formData.email.trim() === '') {
                errors.email = 'Email không được để trống';
                isValid = false;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                errors.email = 'Email không hợp lệ';
                isValid = false;
            } else if (sampleAccounts.some(account => account.email === formData.email)) {
                errors.email = 'Email đã được sử dụng';
                isValid = false;
            }
        }
        
        // Validate password for new accounts or when resetting password
        if (isAdd || (formData.reset_password && formData.reset_password === 'on')) {
            if (!formData.password || formData.password.length < 8) {
                errors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
                isValid = false;
            } else if (!/[A-Z]/.test(formData.password) || !/[a-z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
                errors.password = 'Mật khẩu phải có ít nhất một chữ hoa, một chữ thường và một số';
                isValid = false;
            }
            
            if (formData.password !== formData.password_confirm) {
                errors.password_confirm = 'Xác nhận mật khẩu không khớp';
                isValid = false;
            }
        }
        
        // Validate phone
        if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone)) {
            errors.phone = 'Số điện thoại không hợp lệ';
            isValid = false;
        }
        
        // Show errors if any
        const prefix = isAdd ? '' : 'edit-';
        Object.keys(errors).forEach(field => {
            const errorElement = document.getElementById(`${prefix}${field}-error`);
            if (errorElement) {
                errorElement.textContent = errors[field];
                errorElement.classList.remove('hidden');
            }
        });
        
        // Clear previous error messages for valid fields
        ['fullname', 'email', 'password', 'password_confirm', 'phone'].forEach(field => {
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
        formAddAccount.reset();
        
        // Clear error messages
        document.querySelectorAll('#form-add-account .text-red-600').forEach(el => {
            el.textContent = '';
            el.classList.add('hidden');
        });
        
        // Show modal
        modalAddAccount.classList.remove('hidden');
    }

    // Open Edit Modal
    function openEditModal(accountId) {
        // Get account data
        const account = sampleAccounts.find(acc => acc.id === accountId);
        if (!account) return;
        
        // Populate form
        document.getElementById('edit-account-id').value = account.id;
        document.getElementById('edit-account-fullname').value = account.fullname;
        document.getElementById('edit-account-email').value = account.email;
        document.getElementById('edit-account-phone').value = account.phone || '';
        document.getElementById('edit-account-active').checked = account.active;
        
        // Reset password fields
        document.getElementById('edit-account-reset-password').checked = false;
        resetPasswordFields.classList.add('hidden');
        document.getElementById('edit-account-password').value = '';
        document.getElementById('edit-account-password-confirm').value = '';
        
        // Clear error messages
        document.querySelectorAll('#form-edit-account .text-red-600').forEach(el => {
            el.textContent = '';
            el.classList.add('hidden');
        });
        
        // Show modal
        modalEditAccount.classList.remove('hidden');
    }

    // Open Assign Modal
    function openAssignModal(accountId) {
        // Get account data
        const account = sampleAccounts.find(acc => acc.id === accountId);
        if (!account) return;
        
        // Populate form
        document.getElementById('assign-account-id').value = account.id;
        document.getElementById('assign-account-name').textContent = `Tài khoản: ${account.fullname} (${account.email})`;
        
        // Get cinema dropdown
        const cinemaDropdown = document.getElementById('assign-cinema-id');
        cinemaDropdown.innerHTML = '<option value="">-- Chọn rạp phim --</option>';
        
        // Add cinema options
        sampleCinemas.forEach(cinema => {
            // Only show unassigned cinemas or the cinema already assigned to this account
            if (!cinema.assigned || (account.cinema_id && cinema.id === account.cinema_id)) {
                const option = document.createElement('option');
                option.value = cinema.id;
                option.textContent = cinema.name;
                
                // Select current cinema if assigned
                if (account.cinema_id && cinema.id === account.cinema_id) {
                    option.selected = true;
                }
                
                cinemaDropdown.appendChild(option);
            }
        });
        
        // Show/hide unassign button
        if (account.cinema_id) {
            btnUnassign.classList.remove('hidden');
        } else {
            btnUnassign.classList.add('hidden');
        }
        
        // Clear error messages
        document.getElementById('assign-cinema-error').textContent = '';
        document.getElementById('assign-cinema-error').classList.add('hidden');
        
        // Show modal
        modalAssignCinema.classList.remove('hidden');
    }

    // Close modals
    function closeModals() {
        modalAddAccount.classList.add('hidden');
        modalEditAccount.classList.add('hidden');
        modalAssignCinema.classList.add('hidden');
    }

    // Add new account
    function addAccount() {
        const formData = {
            fullname: document.getElementById('account-fullname').value.trim(),
            email: document.getElementById('account-email').value.trim(),
            password: document.getElementById('account-password').value,
            password_confirm: document.getElementById('account-password-confirm').value,
            phone: document.getElementById('account-phone').value.trim()
        };
        
        // Validate form
        if (!validateForm(formData, true)) {
            return;
        }
        
        // In a real app, this would be an API call
        // For demo, we'll just add it to our sample data
        const newAccount = {
            id: sampleAccounts.length + 1,
            fullname: formData.fullname,
            email: formData.email,
            phone: formData.phone,
            active: true,
            cinema_id: null,
            cinema_name: null
        };
        
        sampleAccounts.push(newAccount);
        
        // Close modal
        closeModals();
        
        // Show success message
        showToast('Tạo tài khoản mới thành công');
        
        // Refresh the list
        loadAccounts();
    }

    // Update account
    function updateAccount() {
        const accountId = parseInt(document.getElementById('edit-account-id').value);
        const resetPassword = document.getElementById('edit-account-reset-password').checked;
        
        const formData = {
            fullname: document.getElementById('edit-account-fullname').value.trim(),
            phone: document.getElementById('edit-account-phone').value.trim(),
            active: document.getElementById('edit-account-active').checked,
            reset_password: resetPassword ? 'on' : 'off'
        };
        
        if (resetPassword) {
            formData.password = document.getElementById('edit-account-password').value;
            formData.password_confirm = document.getElementById('edit-account-password-confirm').value;
        }
        
        // Validate form
        if (!validateForm(formData, false)) {
            return;
        }
        
        // In a real app, this would be an API call
        // For demo, we'll just update our sample data
        const index = sampleAccounts.findIndex(acc => acc.id === accountId);
        if (index !== -1) {
            sampleAccounts[index] = {
                ...sampleAccounts[index],
                fullname: formData.fullname,
                phone: formData.phone,
                active: formData.active
            };
        }
        
        // Close modal
        closeModals();
        
        // Show success message
        showToast('Cập nhật thông tin tài khoản thành công');
        
        // Refresh the list
        loadAccounts();
    }

    // Assign cinema to account
    function assignCinema() {
        const accountId = parseInt(document.getElementById('assign-account-id').value);
        const cinemaId = parseInt(document.getElementById('assign-cinema-id').value);
        
        if (!cinemaId) {
            document.getElementById('assign-cinema-error').textContent = 'Vui lòng chọn rạp phim';
            document.getElementById('assign-cinema-error').classList.remove('hidden');
            return;
        }
        
        // Get account and cinema
        const account = sampleAccounts.find(acc => acc.id === accountId);
        const cinema = sampleCinemas.find(cin => cin.id === cinemaId);
        
        if (!account || !cinema) return;
        
        // Check if account already has a cinema
        if (account.cinema_id && account.cinema_id !== cinemaId) {
            // Unassign from previous cinema
            const prevCinema = sampleCinemas.find(cin => cin.id === account.cinema_id);
            if (prevCinema) {
                prevCinema.assigned = false;
            }
        }
        
        // Assign cinema to account
        account.cinema_id = cinemaId;
        account.cinema_name = cinema.name;
        cinema.assigned = true;
        
        // Close modal
        closeModals();
        
        // Show success message
        showToast(`Đã phân công ${account.fullname} quản lý rạp ${cinema.name}`);
        
        // Refresh the list
        loadAccounts();
    }

    // Unassign cinema from account
    function unassignCinema() {
        const accountId = parseInt(document.getElementById('assign-account-id').value);
        
        // Get account
        const account = sampleAccounts.find(acc => acc.id === accountId);
        if (!account || !account.cinema_id) return;
        
        // Get cinema
        const cinema = sampleCinemas.find(cin => cin.id === account.cinema_id);
        const cinemaName = account.cinema_name;
        
        // Unassign cinema from account
        if (cinema) {
            cinema.assigned = false;
        }
        
        account.cinema_id = null;
        account.cinema_name = null;
        
        // Close modal
        closeModals();
        
        // Show success message
        showToast(`Đã hủy phân công ${account.fullname} quản lý rạp ${cinemaName}`);
        
        // Refresh the list
        loadAccounts();
    }

    // Event Listeners
    btnAddAccount.addEventListener('click', openAddModal);
    
    cancelButtons.forEach(button => {
        button.addEventListener('click', closeModals);
    });
    
    btnSubmitAdd.addEventListener('click', addAccount);
    
    btnSubmitEdit.addEventListener('click', updateAccount);
    
    btnSubmitAssign.addEventListener('click', assignCinema);
    
    btnUnassign.addEventListener('click', unassignCinema);
    
    btnApplyFilters.addEventListener('click', loadAccounts);
    
    // When clicking outside the modal content, close the modal
    window.addEventListener('click', function(event) {
        if (event.target === modalAddAccount || event.target === modalEditAccount || event.target === modalAssignCinema) {
            closeModals();
        }
    });

    // Initialize
    loadAccounts();
});