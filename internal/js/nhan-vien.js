document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const addEmployeeBtn = document.getElementById('add-employee-btn');
    const employeeModal = document.getElementById('employee-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const employeeForm = document.getElementById('employee-form');
    const employeeIdInput = document.getElementById('employee-id');
    const modalTitle = document.getElementById('modal-title');
    const employeeNameInput = document.getElementById('employee-name');
    const employeePhoneInput = document.getElementById('employee-phone');
    const employeeEmailInput = document.getElementById('employee-email');
    const employeeUsernameInput = document.getElementById('employee-username');
    const employeePasswordInput = document.getElementById('employee-password');
    const employeeRoleInput = document.getElementById('employee-role');
    const passwordContainer = document.getElementById('password-container');
    const saveEmployeeBtn = document.getElementById('save-employee');
    const cancelEmployeeBtn = document.getElementById('cancel-employee');
    const statusToggleBtn = document.getElementById('status-toggle');
    const employeeList = document.getElementById('employee-list');
    const noEmployees = document.getElementById('no-employees');
    const statusModal = document.getElementById('status-modal');
    const statusModalTitle = document.getElementById('status-modal-title');
    const statusMessage = document.getElementById('status-message');
    const cancelStatusChangeBtn = document.getElementById('cancel-status-change');
    const confirmStatusChangeBtn = document.getElementById('confirm-status-change');
    const toastNotification = document.getElementById('toast-notification');
    const statusFilter = document.getElementById('status-filter');
    const roleFilter = document.getElementById('role-filter');
    const searchInput = document.getElementById('search');
    
    // Error message elements
    const nameError = document.getElementById('name-error');
    const phoneError = document.getElementById('phone-error');
    const emailError = document.getElementById('email-error');
    const usernameError = document.getElementById('username-error');
    const passwordError = document.getElementById('password-error');
    const roleError = document.getElementById('role-error');
    
    // Sample data for testing (would be fetched from server in production)
    let employees = [
        {
            id: 1,
            name: 'Nguyễn Văn A',
            phone: '0123456789',
            email: 'nguyenvana@example.com',
            username: 'nguyenvana',
            role: 'ticket-seller',
            status: 'active'
        },
        {
            id: 2,
            name: 'Trần Thị B',
            phone: '0987654321',
            email: 'tranthib@example.com',
            username: 'tranthib',
            role: 'food-service',
            status: 'active'
        },
        {
            id: 3,
            name: 'Lê Văn C',
            phone: '0369852147',
            email: 'levanc@example.com',
            username: 'levanc',
            role: 'ticket-checker',
            status: 'inactive'
        }
    ];
    
    // Variables for status change
    let changingEmployeeId = null;
    let newStatus = null;
    
    // Role display mapping
    const roleDisplayNames = {
        'ticket-seller': 'Nhân viên bán vé',
        'food-service': 'Nhân viên bán thức ăn',
        'ticket-checker': 'Nhân viên soát vé',
        'cleaner': 'Nhân viên vệ sinh'
    };
    
    // Load initial data
    loadEmployees();
    
    // Event listeners
    addEmployeeBtn.addEventListener('click', openAddModal);
    closeModalBtn.addEventListener('click', closeModal);
    cancelEmployeeBtn.addEventListener('click', closeModal);
    saveEmployeeBtn.addEventListener('click', handleSaveEmployee);
    statusToggleBtn.addEventListener('click', openStatusModal);
    cancelStatusChangeBtn.addEventListener('click', closeStatusModal);
    confirmStatusChangeBtn.addEventListener('click', changeEmployeeStatus);
    
    // Filters
    statusFilter.addEventListener('change', applyFilters);
    roleFilter.addEventListener('change', applyFilters);
    searchInput.addEventListener('input', applyFilters);
    
    // Phone number validation
    employeePhoneInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
    
    // Functions
    
    function loadEmployees() {
        // In a real app, you would fetch employees from the server
        if (employees.length === 0) {
            noEmployees.classList.remove('hidden');
            return;
        }
        
        noEmployees.classList.add('hidden');
        
        // Clear existing content
        employeeList.innerHTML = '';
        
        // Apply filters
        const filteredEmployees = filterEmployees();
        
        // If no employees match filters
        if (filteredEmployees.length === 0) {
            const noResultsRow = document.createElement('tr');
            noResultsRow.classList.add('text-center');
            noResultsRow.innerHTML = `
                <td colspan="6" class="px-6 py-8 text-gray-500">
                    Không tìm thấy nhân viên phù hợp với bộ lọc
                </td>
            `;
            employeeList.appendChild(noResultsRow);
            return;
        }
        
        // Populate employee list
        filteredEmployees.forEach(employee => {
            const row = createEmployeeTableRow(employee);
            employeeList.appendChild(row);
        });
    }
    
    function filterEmployees() {
        let filtered = [...employees];
        
        // Apply status filter
        if (statusFilter.value !== 'all') {
            filtered = filtered.filter(employee => employee.status === statusFilter.value);
        }
        
        // Apply role filter
        if (roleFilter.value !== 'all') {
            filtered = filtered.filter(employee => employee.role === roleFilter.value);
        }
        
        // Apply search filter
        const searchTerm = searchInput.value.toLowerCase().trim();
        if (searchTerm) {
            filtered = filtered.filter(employee => 
                employee.name.toLowerCase().includes(searchTerm) ||
                employee.email.toLowerCase().includes(searchTerm) ||
                employee.phone.includes(searchTerm) ||
                employee.username.toLowerCase().includes(searchTerm)
            );
        }
        
        return filtered;
    }
    
    function applyFilters() {
        loadEmployees();
    }
    
    function createEmployeeTableRow(employee) {
        const row = document.createElement('tr');
        
        // Create status badge
        const statusBadge = document.createElement('span');
        statusBadge.classList.add('px-2', 'inline-flex', 'text-xs', 'leading-5', 'font-semibold', 'rounded-full');
        
        if (employee.status === 'active') {
            statusBadge.classList.add('bg-green-100', 'text-green-800');
            statusBadge.textContent = 'Đang làm việc';
        } else {
            statusBadge.classList.add('bg-red-100', 'text-red-800');
            statusBadge.textContent = 'Đã nghỉ việc';
        }
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span class="text-lg font-medium text-gray-600">${employee.name.charAt(0)}</span>
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${employee.name}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${employee.phone}</div>
                <div class="text-sm text-gray-500">${employee.email}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${roleDisplayNames[employee.role] || employee.role}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${employee.username}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                ${statusBadge.outerHTML}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button class="text-blue-600 hover:text-blue-900 mr-3 edit-employee" data-id="${employee.id}">Sửa</button>
            </td>
        `;
        
        // Add event listener to edit button
        row.querySelector('.edit-employee').addEventListener('click', () => openEditModal(employee.id));
        
        return row;
    }
    
    function openAddModal() {
        // Reset form
        employeeForm.reset();
        employeeIdInput.value = '';
        
        // Update modal title and button text
        modalTitle.textContent = 'Thêm nhân viên mới';
        saveEmployeeBtn.textContent = 'Thêm';
        
        // Show password field
        passwordContainer.classList.remove('hidden');
        
        // Hide status toggle button
        statusToggleBtn.classList.add('hidden');
        
        // Clear validation errors
        clearValidationErrors();
        
        // Show modal
        employeeModal.classList.remove('hidden');
    }
    
    function openEditModal(employeeId) {
        // Find employee by ID
        const employee = employees.find(e => e.id === employeeId);
        if (!employee) return;
        
        // Reset form and fill with employee data
        employeeForm.reset();
        employeeIdInput.value = employee.id;
        employeeNameInput.value = employee.name;
        employeePhoneInput.value = employee.phone;
        employeeEmailInput.value = employee.email;
        employeeUsernameInput.value = employee.username;
        employeeRoleInput.value = employee.role;
        
        // Hide password field for editing
        passwordContainer.classList.add('hidden');
        
        // Update modal title and button text
        modalTitle.textContent = 'Cập nhật thông tin nhân viên';
        saveEmployeeBtn.textContent = 'Lưu';
        
        // Update status toggle button
        statusToggleBtn.classList.remove('hidden');
        if (employee.status === 'active') {
            statusToggleBtn.textContent = 'Nghỉ việc';
            statusToggleBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
            statusToggleBtn.classList.add('bg-red-600', 'hover:bg-red-700');
        } else {
            statusToggleBtn.textContent = 'Kích hoạt';
            statusToggleBtn.classList.remove('bg-red-600', 'hover:bg-red-700');
            statusToggleBtn.classList.add('bg-green-600', 'hover:bg-green-700');
        }
        
        // Clear validation errors
        clearValidationErrors();
        
        // Show modal
        employeeModal.classList.remove('hidden');
    }
    
    function closeModal() {
        employeeModal.classList.add('hidden');
    }
    
    function openStatusModal() {
        const employeeId = parseInt(employeeIdInput.value);
        const employee = employees.find(e => e.id === employeeId);
        if (!employee) return;
        
        // Set status change info
        changingEmployeeId = employeeId;
        
        if (employee.status === 'active') {
            statusModalTitle.textContent = 'Xác nhận nghỉ việc';
            statusMessage.textContent = `Bạn có chắc chắn muốn chuyển nhân viên "${employee.name}" sang trạng thái nghỉ việc không?`;
            confirmStatusChangeBtn.textContent = 'Nghỉ việc';
            confirmStatusChangeBtn.classList.add('bg-red-600', 'hover:bg-red-700');
            confirmStatusChangeBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
            newStatus = 'inactive';
        } else {
            statusModalTitle.textContent = 'Xác nhận kích hoạt';
            statusMessage.textContent = `Bạn có chắc chắn muốn kích hoạt lại nhân viên "${employee.name}" không?`;
            confirmStatusChangeBtn.textContent = 'Kích hoạt';
            confirmStatusChangeBtn.classList.add('bg-green-600', 'hover:bg-green-700');
            confirmStatusChangeBtn.classList.remove('bg-red-600', 'hover:bg-red-700');
            newStatus = 'active';
        }
        
        // Hide employee modal and show status modal
        employeeModal.classList.add('hidden');
        statusModal.classList.remove('hidden');
    }
    
    function closeStatusModal() {
        statusModal.classList.add('hidden');
        // Show employee modal again
        employeeModal.classList.remove('hidden');
        changingEmployeeId = null;
        newStatus = null;
    }
    
    function changeEmployeeStatus() {
        if (changingEmployeeId === null || newStatus === null) return;
        
        // Find employee
        const employeeIndex = employees.findIndex(e => e.id === changingEmployeeId);
        if (employeeIndex === -1) return;
        
        // Update status
        employees[employeeIndex].status = newStatus;
        
        // Close modals
        statusModal.classList.add('hidden');
        employeeModal.classList.add('hidden');
        
        // Reset variables
        changingEmployeeId = null;
        newStatus = null;
        
        // Reload employees
        loadEmployees();
        
        // Show success message
        showToast('Thay đổi trạng thái thành công');
    }
    
    function handleSaveEmployee() {
        // Validate form
        if (!validateForm()) return;
        
        // Get form data
        const employeeId = employeeIdInput.value ? parseInt(employeeIdInput.value) : null;
        const name = employeeNameInput.value.trim();
        const phone = employeePhoneInput.value.trim();
        const email = employeeEmailInput.value.trim();
        const username = employeeUsernameInput.value.trim();
        const password = employeePasswordInput.value;
        const role = employeeRoleInput.value;
        
        if (employeeId) {
            // Update existing employee
            const index = employees.findIndex(e => e.id === employeeId);
            if (index !== -1) {
                employees[index] = {
                    ...employees[index],
                    name,
                    phone,
                    email,
                    username,
                    role
                };
            }
            
            showToast('Cập nhật thông tin thành công');
        } else {
            // Check if username or email already exists
            if (employees.some(e => e.username === username)) {
                usernameError.textContent = 'Tên đăng nhập đã tồn tại';
                usernameError.classList.remove('hidden');
                return;
            }
            
            if (employees.some(e => e.email === email)) {
                emailError.textContent = 'Email đã được sử dụng';
                emailError.classList.remove('hidden');
                return;
            }
            
            // Add new employee
            const newEmployee = {
                id: Date.now(), // Generate unique ID
                name,
                phone,
                email,
                username,
                role,
                status: 'active'
            };
            
            employees.push(newEmployee);
            showToast('Thêm nhân viên mới thành công');
        }
        
        // Close modal
        closeModal();
        
        // Reload employees
        loadEmployees();
    }
    
    function validateForm() {
        let isValid = true;
        clearValidationErrors();
        
        // Validate name
        if (!employeeNameInput.value.trim()) {
            nameError.classList.remove('hidden');
            isValid = false;
        }
        
        // Validate phone
        const phoneRegex = /^[0-9]{10}$/;
        if (!employeePhoneInput.value.trim() || !phoneRegex.test(employeePhoneInput.value.trim())) {
            phoneError.classList.remove('hidden');
            isValid = false;
        }
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!employeeEmailInput.value.trim() || !emailRegex.test(employeeEmailInput.value.trim())) {
            emailError.classList.remove('hidden');
            isValid = false;
        }
        
        // Validate username
        if (!employeeUsernameInput.value.trim()) {
            usernameError.classList.remove('hidden');
            isValid = false;
        }
        
        // Validate password (only for new employees)
        if (!employeeIdInput.value && (!employeePasswordInput.value || employeePasswordInput.value.length < 8)) {
            passwordError.classList.remove('hidden');
            isValid = false;
        }
        
        // Validate role
        if (!employeeRoleInput.value) {
            roleError.classList.remove('hidden');
            isValid = false;
        }
        
        return isValid;
    }
    
    function clearValidationErrors() {
        nameError.classList.add('hidden');
        phoneError.classList.add('hidden');
        emailError.classList.add('hidden');
        usernameError.classList.add('hidden');
        passwordError.classList.add('hidden');
        roleError.classList.add('hidden');
    }
    
    function showToast(message) {
        toastNotification.textContent = message;
        toastNotification.classList.remove('translate-y-20', 'opacity-0');
        
        setTimeout(() => {
            toastNotification.classList.add('translate-y-20', 'opacity-0');
        }, 3000);
    }
});