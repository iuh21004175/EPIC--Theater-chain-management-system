import Spinner from './util/spinner.js';

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
    const searchInput = document.getElementById('search');
    
    // Error message elements
    const nameError = document.getElementById('name-error');
    const phoneError = document.getElementById('phone-error');
    const emailError = document.getElementById('email-error');
    const usernameError = document.getElementById('username-error');
    const passwordError = document.getElementById('password-error');
    
    // Sample data for testing (would be fetched from server in production)
    let employees = [
        {
            id: 1,
            name: 'Nguyễn Văn A',
            phone: '0123456789',
            email: 'nguyenvana@example.com',
            username: 'nguyenvana',
            status: 'active'
        },
        {
            id: 2,
            name: 'Trần Thị B',
            phone: '0987654321',
            email: 'tranthib@example.com',
            username: 'tranthib',
            status: 'active'
        },
        {
            id: 3,
            name: 'Lê Văn C',
            phone: '0369852147',
            email: 'levanc@example.com',
            username: 'levanc',
            status: 'inactive'
        }
    ];
    
    // Variables for status change
    let changingEmployeeId = null;
    let newStatus = null;
    
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
    if (statusFilter) {
        statusFilter.addEventListener('change', applyFilters);
    }

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
    
    // Phone number validation
    employeePhoneInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
    
    // Functions
    
    function loadEmployees() {
        // Show spinner while loading
        const container = employeeList.closest('.overflow-x-auto');
        const spinner = Spinner.show({
            target: container,
            text: 'Đang tải danh sách nhân viên...'
        });
        
        // Fetch from API
        fetch(`${employeeList.dataset.url}/api/nhan-vien`)
            // .then(response => response.text())
            // .then(text => console.log(text) || text) // Log raw response text for debugging
            .then(response => response.json())
            .then(data => {
                // Hide spinner
                Spinner.hide(spinner);
                
                if (data.success && data.data) {
                    // Map API data to our employee format
                    employees = data.data.map(item => ({
                        id: item.id,
                        name: item.ten,
                        phone: item.dien_thoai,
                        email: item.email,
                        username: item.tai_khoan?.tendangnhap || 'N/A',
                        status: item.trang_thai !== 0 ? 'active' : 'inactive'
                    }));
                    
                    // Continue with rendering employees
                    renderEmployees();
                } else {
                    showToast('Không thể tải danh sách nhân viên', true);
                    noEmployees.classList.remove('hidden');
                }
            })
            .catch(error => {
                // Hide spinner
                Spinner.hide(spinner);
                
                // Show error message
                showToast('Lỗi kết nối: ' + error.message, true);
                console.error('Error:', error);
                noEmployees.classList.remove('hidden');
            });
    }

    // Separate render function for cleaner code
    function renderEmployees() {
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
        if (statusFilter && statusFilter.value !== 'all') {
            filtered = filtered.filter(employee => employee.status === statusFilter.value);
        }
        
        // Apply search filter
        if (searchInput) {
            const searchTerm = searchInput.value.toLowerCase().trim();
            if (searchTerm) {
                filtered = filtered.filter(employee => 
                    employee.name.toLowerCase().includes(searchTerm) ||
                    employee.email.toLowerCase().includes(searchTerm) ||
                    employee.phone.includes(searchTerm) ||
                    employee.username.toLowerCase().includes(searchTerm)
                );
            }
        }
        
        return filtered;
    }
    
    function applyFilters() {
        loadEmployees();
    }
    
    function createEmployeeTableRow(employee) {
    const row = document.createElement('tr');
    
    // Add cursor-pointer and hover effect to indicate clickable row
    row.classList.add('cursor-pointer', 'hover:bg-gray-50', 'transition', 'duration-150');
    
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
            <div class="text-sm text-gray-900">${employee.username}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
            ${statusBadge.outerHTML}
        </td>
        <!-- Removed "Thao tác" cell with edit button -->
    `;
    
    // Add event listener to the entire row
    row.addEventListener('click', () => openEditModal(employee.id));
    
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
        
        // Show spinner
        const spinner = Spinner.show({
            target: employeeModal,
            text: employeeId ? 'Đang cập nhật nhân viên...' : 'Đang thêm nhân viên mới...'
        });
        
        if (employeeId) {
            // Update existing employee (keeping local update for now)
            const index = employees.findIndex(e => e.id === employeeId);
            if (index !== -1) {
                employees[index] = {
                    ...employees[index],
                    name,
                    phone,
                    email,
                    username
                };
                
                // Hide spinner and show success
                Spinner.hide(spinner);
                closeModal();
                showToast('Cập nhật thông tin thành công');
                loadEmployees();
            }
        } else {
            // Create FormData object instead of JSON
            const formData = new FormData();
            formData.append('ten', name);
            formData.append('dien_thoai', phone);
            formData.append('email', email);
            formData.append('ten_dang_nhap', username);
            formData.append('mat_khau', password);
            
            // Make API call with FormData
            fetch(`${employeeList.dataset.url}/api/nhan-vien`, {
                method: 'POST',
                // No Content-Type header needed - browser sets it automatically
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                // Hide spinner
                Spinner.hide(spinner);
                
                if (data.success) {
                    // Close modal
                    closeModal();
                    
                    // Show success message
                    showToast(data.message || 'Thêm nhân viên mới thành công');
                    
                    // Add the new employee to our local array for UI update
                    const newEmployee = {
                        id: data.data?.id || Date.now(), // Use returned ID if available
                        name,
                        phone,
                        email,
                        username,
                        status: 'active'
                    };
                    
                    employees.push(newEmployee);
                    loadEmployees();
                } else {
                    // Show error message
                    showToast(data.message || 'Thêm nhân viên thất bại', true);
                }
            })
            .catch(error => {
                // Hide spinner
                Spinner.hide(spinner);
                
                // Show error message
                showToast('Lỗi kết nối: ' + error.message, true);
                console.error('Error:', error);
            });
        }
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
        
        return isValid;
    }
    
    function clearValidationErrors() {
        nameError.classList.add('hidden');
        phoneError.classList.add('hidden');
        emailError.classList.add('hidden');
        usernameError.classList.add('hidden');
        passwordError.classList.add('hidden');
    }
    
    function showToast(message, isError = false) {
        toastNotification.textContent = message;
        
        // Set color based on message type
        if (isError) {
            toastNotification.classList.remove('bg-green-500');
            toastNotification.classList.add('bg-red-500');
        } else {
            toastNotification.classList.remove('bg-red-500');
            toastNotification.classList.add('bg-green-500');
        }
        
        toastNotification.classList.remove('translate-y-20', 'opacity-0');
        
        setTimeout(() => {
            toastNotification.classList.add('translate-y-20', 'opacity-0');
        }, 3000);
    }
});