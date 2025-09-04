document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements - Tabs
    const tabSchedule = document.getElementById('tab-schedule');
    const tabRules = document.getElementById('tab-rules');
    const contentSchedule = document.getElementById('content-schedule');
    const contentRules = document.getElementById('content-rules');

    // DOM Elements - Schedule
    const scheduleDateInput = document.getElementById('schedule-date');
    const btnPrevDay = document.getElementById('btn-prev-day');
    const btnToday = document.getElementById('btn-today');
    const btnNextDay = document.getElementById('btn-next-day');
    const selectedDateDisplay = document.getElementById('selected-date-display');
    const btnSaveSchedule = document.getElementById('btn-save-schedule');

    // DOM Elements - Shifts
    const btnAddEmployees = document.querySelectorAll('.btn-add-employee');
    const btnRemoveEmployees = document.querySelectorAll('.btn-remove-employee');

    // DOM Elements - Modal
    const modalAddEmployee = document.getElementById('modal-add-employee');
    const selectedShiftText = document.getElementById('selected-shift-text');
    const selectedShiftInput = document.getElementById('selected-shift');
    const employeeSearch = document.getElementById('employee-search');
    const availableEmployees = document.getElementById('available-employees');
    const btnAddSelectedEmployees = document.getElementById('btn-add-selected-employees');
    const btnCancelModal = document.querySelectorAll('.btn-cancel');

    // DOM Elements - Rules
    const btnSaveRules = document.getElementById('btn-save-rules');

    // DOM Elements - Toast
    const toast = document.getElementById('toast-notification');

    // Initialize flatpickr date picker
    const datePicker = flatpickr(scheduleDateInput, {
        dateFormat: "d/m/Y",
        locale: "vn",
        minDate: "today",
        maxDate: new Date().fp_incr(14), // Limit to 14 days from today
        disableMobile: "true"
    });

    // Set default date to today
    const today = new Date();
    datePicker.setDate(today);
    updateSelectedDateDisplay(today);

    // Tab switching
    tabSchedule.addEventListener('click', function(e) {
        e.preventDefault();
        showTab('schedule');
    });

    tabRules.addEventListener('click', function(e) {
        e.preventDefault();
        showTab('rules');
    });

    function showTab(tabName) {
        // Hide all tabs and remove active class
        contentSchedule.classList.add('hidden');
        contentRules.classList.add('hidden');
        tabSchedule.classList.remove('tab-active');
        tabRules.classList.remove('tab-active');

        // Show selected tab and add active class
        if (tabName === 'schedule') {
            contentSchedule.classList.remove('hidden');
            tabSchedule.classList.add('tab-active');
        } else if (tabName === 'rules') {
            contentRules.classList.remove('hidden');
            tabRules.classList.add('tab-active');
        }
    }

    // Date navigation
    btnPrevDay.addEventListener('click', function() {
        const currentDate = datePicker.selectedDates[0];
        const prevDate = new Date(currentDate);
        prevDate.setDate(prevDate.getDate() - 1);
        
        // Don't go before today
        if (prevDate >= new Date().setHours(0, 0, 0, 0)) {
            datePicker.setDate(prevDate);
            loadScheduleData(prevDate);
            updateSelectedDateDisplay(prevDate);
        }
    });

    btnToday.addEventListener('click', function() {
        const todayDate = new Date();
        datePicker.setDate(todayDate);
        loadScheduleData(todayDate);
        updateSelectedDateDisplay(todayDate);
    });

    btnNextDay.addEventListener('click', function() {
        const currentDate = datePicker.selectedDates[0];
        const nextDate = new Date(currentDate);
        nextDate.setDate(nextDate.getDate() + 1);
        
        // Don't go beyond 14 days from today
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 14);
        
        if (nextDate <= maxDate) {
            datePicker.setDate(nextDate);
            loadScheduleData(nextDate);
            updateSelectedDateDisplay(nextDate);
        }
    });

    // Date picker change event
    scheduleDateInput.addEventListener('change', function() {
        const selectedDate = datePicker.selectedDates[0];
        loadScheduleData(selectedDate);
        updateSelectedDateDisplay(selectedDate);
    });

    // Update date display
    function updateSelectedDateDisplay(date) {
        const options = { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' };
        const dateString = date.toLocaleDateString('vi-VN', options);
        selectedDateDisplay.innerHTML = `Phân công cho ngày: <span class="font-bold">${dateString}</span>`;
    }

    // Load schedule data for selected date
    function loadScheduleData(date) {
        // In a real application, this would be an API call
        // For demo, we'll simulate with setTimeout
        
        // Convert date to string format for API
        const dateString = date.toISOString().split('T')[0];
        
        // Show loading state
        document.getElementById('morning-employees').innerHTML = '<div class="text-center py-2 text-gray-500">Đang tải...</div>';
        document.getElementById('afternoon-employees').innerHTML = '<div class="text-center py-2 text-gray-500">Đang tải...</div>';
        document.getElementById('evening-employees').innerHTML = '<div class="text-center py-2 text-gray-500">Đang tải...</div>';
        
        // Simulate API call
        setTimeout(() => {
            // Sample data - would come from API in real app
            const sampleData = {
                morning: [
                    { id: 1, name: 'Nguyễn Văn A' },
                    { id: 2, name: 'Trần Thị B' },
                    { id: 3, name: 'Lê Văn C' },
                ],
                afternoon: [
                    { id: 4, name: 'Phạm Thị D' },
                    { id: 5, name: 'Hoàng Văn E' },
                    { id: 6, name: 'Vũ Thị F' },
                    { id: 7, name: 'Đặng Văn G' },
                ],
                evening: [
                    { id: 8, name: 'Ngô Văn H' },
                    { id: 9, name: 'Bùi Thị I' },
                    { id: 10, name: 'Trần Văn K' },
                ]
            };
            
            // Update max employees for each shift
            document.getElementById('morning-max').textContent = 4;
            document.getElementById('afternoon-max').textContent = 5;
            document.getElementById('evening-max').textContent = 5;
            
            // Update employee counts
            document.getElementById('morning-count').textContent = sampleData.morning.length;
            document.getElementById('afternoon-count').textContent = sampleData.afternoon.length;
            document.getElementById('evening-count').textContent = sampleData.evening.length;
            
            // Render employees for each shift
            renderEmployees('morning-employees', sampleData.morning);
            renderEmployees('afternoon-employees', sampleData.afternoon);
            renderEmployees('evening-employees', sampleData.evening);
            
            // Re-attach remove employee event handlers
            attachRemoveEmployeeEvents();
        }, 500);
    }

    // Render employees for a shift
    function renderEmployees(containerId, employees) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        
        if (employees.length === 0) {
            container.innerHTML = '<div class="text-center py-2 text-gray-500">Chưa có nhân viên nào</div>';
            return;
        }
        
        employees.forEach(employee => {
            const employeeTag = document.createElement('div');
            employeeTag.className = 'employee-tag';
            employeeTag.innerHTML = `
                <span>${employee.name}</span>
                <button type="button" data-employee-id="${employee.id}" class="btn-remove-employee">
                    <svg class="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                        <path stroke-linecap="round" stroke-width="1.5" d="M1 1l6 6m0-6L1 7" />
                    </svg>
                </button>
            `;
            container.appendChild(employeeTag);
        });
    }

    // Attach remove employee event handlers
    function attachRemoveEmployeeEvents() {
        document.querySelectorAll('.btn-remove-employee').forEach(button => {
            button.addEventListener('click', function() {
                const employeeId = this.getAttribute('data-employee-id');
                const employeeTag = this.closest('.employee-tag');
                const shiftContainer = this.closest('[id$="-employees"]');
                const shiftId = shiftContainer.id.split('-')[0]; // 'morning', 'afternoon', or 'evening'
                
                // Remove from UI
                employeeTag.remove();
                
                // Update count
                const countElement = document.getElementById(`${shiftId}-count`);
                countElement.textContent = parseInt(countElement.textContent) - 1;
                
                // Show toast
                showToast('Đã loại bỏ nhân viên khỏi ca làm việc');
            });
        });
    }

    // Add employee button click event
    btnAddEmployees.forEach(button => {
        button.addEventListener('click', function() {
            const shift = this.getAttribute('data-shift');
            openAddEmployeeModal(shift);
        });
    });

    // Open add employee modal
    function openAddEmployeeModal(shift) {
        // Set selected shift
        selectedShiftInput.value = shift;
        
        // Update modal title
        let shiftName = 'ca làm việc';
        if (shift === 'morning') shiftName = 'ca sáng';
        else if (shift === 'afternoon') shiftName = 'ca chiều';
        else if (shift === 'evening') shiftName = 'ca tối';
        selectedShiftText.textContent = shiftName;
        
        // Reset search
        employeeSearch.value = '';
        
        // Load available employees
        loadAvailableEmployees(shift);
        
        // Show modal
        modalAddEmployee.classList.remove('hidden');
    }

    // Load available employees for a shift
    function loadAvailableEmployees(shift) {
        // In a real application, this would be an API call
        // For demo, we'll use static data
        
        // Get current employees in the shift
        const currentEmployeeIds = [];
        document.querySelectorAll(`#${shift}-employees .btn-remove-employee`).forEach(button => {
            currentEmployeeIds.push(parseInt(button.getAttribute('data-employee-id')));
        });
        
        // Sample available employees - would come from API in real app
        const allEmployees = [
            { id: 1, name: 'Nguyễn Văn A' },
            { id: 2, name: 'Trần Thị B' },
            { id: 3, name: 'Lê Văn C' },
            { id: 4, name: 'Phạm Thị D' },
            { id: 5, name: 'Hoàng Văn E' },
            { id: 6, name: 'Vũ Thị F' },
            { id: 7, name: 'Đặng Văn G' },
            { id: 8, name: 'Ngô Văn H' },
            { id: 9, name: 'Bùi Thị I' },
            { id: 10, name: 'Trần Văn K' },
            { id: 11, name: 'Đinh Văn L' },
            { id: 12, name: 'Lý Thị M' },
            { id: 13, name: 'Hồ Văn N' },
            { id: 14, name: 'Đỗ Thị P' },
            { id: 15, name: 'Nguyễn Văn Q' }
        ];
        
        // Filter out employees already in the shift
        const availableEmployeesList = allEmployees.filter(employee => !currentEmployeeIds.includes(employee.id));
        
        // Render available employees
        renderAvailableEmployees(availableEmployeesList);
    }

    // Render available employees in modal
    function renderAvailableEmployees(employees) {
        availableEmployees.innerHTML = '';
        
        if (employees.length === 0) {
            availableEmployees.innerHTML = '<li class="px-4 py-3 text-center text-gray-500">Không có nhân viên khả dụng</li>';
            return;
        }
        
        employees.forEach(employee => {
            const li = document.createElement('li');
            li.className = 'px-4 py-3 flex items-center hover:bg-gray-50 cursor-pointer';
            li.innerHTML = `
                <input type="checkbox" id="emp-${employee.id}" data-employee-id="${employee.id}" data-employee-name="${employee.name}" class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded">
                <label for="emp-${employee.id}" class="ml-3 block text-sm font-medium text-gray-700 cursor-pointer">${employee.name}</label>
            `;
            availableEmployees.appendChild(li);
            
            // Add click event for the entire row
            li.addEventListener('click', function(e) {
                // Don't toggle if clicking on the checkbox itself
                if (e.target.type !== 'checkbox') {
                    const checkbox = this.querySelector('input[type="checkbox"]');
                    checkbox.checked = !checkbox.checked;
                }
            });
        });
    }

    // Filter available employees when searching
    employeeSearch.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const employeeItems = availableEmployees.querySelectorAll('li');
        
        employeeItems.forEach(item => {
            const label = item.querySelector('label');
            if (!label) return;
            
            const employeeName = label.textContent.toLowerCase();
            if (employeeName.includes(searchTerm)) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    });

    // Add selected employees to shift
    btnAddSelectedEmployees.addEventListener('click', function() {
        const shift = selectedShiftInput.value;
        const shiftContainer = document.getElementById(`${shift}-employees`);
        const countElement = document.getElementById(`${shift}-count`);
        const maxElement = document.getElementById(`${shift}-max`);
        
        // Get current count and max
        let currentCount = parseInt(countElement.textContent);
        const maxCount = parseInt(maxElement.textContent);
        
        // Get selected employees
        const selectedCheckboxes = availableEmployees.querySelectorAll('input[type="checkbox"]:checked');
        if (selectedCheckboxes.length === 0) {
            showToast('Vui lòng chọn ít nhất một nhân viên', true);
            return;
        }
        
        // Check if adding would exceed max
        if (currentCount + selectedCheckboxes.length > maxCount) {
            showToast(`Không thể thêm quá ${maxCount} nhân viên vào ca này`, true);
            return;
        }
        
        // Clear "no employees" message if present
        if (shiftContainer.querySelector('.text-center')) {
            shiftContainer.innerHTML = '';
        }
        
        // Add selected employees
        selectedCheckboxes.forEach(checkbox => {
            const employeeId = checkbox.getAttribute('data-employee-id');
            const employeeName = checkbox.getAttribute('data-employee-name');
            
            const employeeTag = document.createElement('div');
            employeeTag.className = 'employee-tag';
            employeeTag.innerHTML = `
                <span>${employeeName}</span>
                <button type="button" data-employee-id="${employeeId}" class="btn-remove-employee">
                    <svg class="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                        <path stroke-linecap="round" stroke-width="1.5" d="M1 1l6 6m0-6L1 7" />
                    </svg>
                </button>
            `;
            shiftContainer.appendChild(employeeTag);
            
            // Increment count
            currentCount++;
        });
        
        // Update count
        countElement.textContent = currentCount;
        
        // Attach remove events to new buttons
        attachRemoveEmployeeEvents();
        
        // Close modal
        modalAddEmployee.classList.add('hidden');
        
        // Show toast
        showToast(`Đã thêm ${selectedCheckboxes.length} nhân viên vào ca làm việc`);
    });

    // Close modal
    btnCancelModal.forEach(button => {
        button.addEventListener('click', function() {
            modalAddEmployee.classList.add('hidden');
        });
    });

    // Click outside modal to close
    modalAddEmployee.addEventListener('click', function(e) {
        if (e.target === modalAddEmployee) {
            modalAddEmployee.classList.add('hidden');
        }
    });

    // Save schedule changes
    btnSaveSchedule.addEventListener('click', function() {
        // Get selected date
        const selectedDate = datePicker.selectedDates[0];
        const dateString = selectedDate.toISOString().split('T')[0];
        
        // Collect employees from each shift
        const scheduleData = {
            date: dateString,
            shifts: {
                morning: collectEmployeesFromShift('morning'),
                afternoon: collectEmployeesFromShift('afternoon'),
                evening: collectEmployeesFromShift('evening')
            }
        };
        
        // In a real application, this would be an API call
        // For demo, we'll simulate with setTimeout
        showToast('Đang lưu thay đổi...', false, false);
        
        // Simulate API call
        setTimeout(() => {
            console.log('Saving schedule data:', scheduleData);
            showToast('Đã lưu thay đổi lịch làm việc thành công');
        }, 1000);
    });

    // Collect employees from a shift
    function collectEmployeesFromShift(shift) {
        const employees = [];
        document.querySelectorAll(`#${shift}-employees .employee-tag`).forEach(tag => {
            const button = tag.querySelector('.btn-remove-employee');
            if (button) {
                const id = button.getAttribute('data-employee-id');
                const name = tag.querySelector('span').textContent;
                employees.push({ id: parseInt(id), name });
            }
        });
        return employees;
    }

    // Save rules changes
    btnSaveRules.addEventListener('click', function() {
        // Collect rules data for each shift
        const rulesData = {
            shifts: {
                morning: {
                    maxStaff: parseInt(document.getElementById('morning-max-staff').value),
                    days: {
                        monday: document.getElementById('morning-mon').checked,
                        tuesday: document.getElementById('morning-tue').checked,
                        wednesday: document.getElementById('morning-wed').checked,
                        thursday: document.getElementById('morning-thu').checked,
                        friday: document.getElementById('morning-fri').checked,
                        saturday: document.getElementById('morning-sat').checked,
                        sunday: document.getElementById('morning-sun').checked
                    }
                },
                afternoon: {
                    maxStaff: parseInt(document.getElementById('afternoon-max-staff').value),
                    days: {
                        monday: document.getElementById('afternoon-mon').checked,
                        tuesday: document.getElementById('afternoon-tue').checked,
                        wednesday: document.getElementById('afternoon-wed').checked,
                        thursday: document.getElementById('afternoon-thu').checked,
                        friday: document.getElementById('afternoon-fri').checked,
                        saturday: document.getElementById('afternoon-sat').checked,
                        sunday: document.getElementById('afternoon-sun').checked
                    }
                },
                evening: {
                    maxStaff: parseInt(document.getElementById('evening-max-staff').value),
                    days: {
                        monday: document.getElementById('evening-mon').checked,
                        tuesday: document.getElementById('evening-tue').checked,
                        wednesday: document.getElementById('evening-wed').checked,
                        thursday: document.getElementById('evening-thu').checked,
                        friday: document.getElementById('evening-fri').checked,
                        saturday: document.getElementById('evening-sat').checked,
                        sunday: document.getElementById('evening-sun').checked
                    }
                }
            }
        };
        
        // In a real application, this would be an API call
        // For demo, we'll simulate with setTimeout
        showToast('Đang lưu quy tắc...', false, false);
        
        // Simulate API call
        setTimeout(() => {
            console.log('Saving rules data:', rulesData);
            showToast('Đã lưu quy tắc lập lịch thành công');
        }, 1000);
    });

    // Show toast notification
    function showToast(message, isError = false, autoHide = true) {
        // Set toast content and style
        toast.textContent = message;
        
        if (isError) {
            toast.classList.remove('bg-green-500');
            toast.classList.add('bg-red-500');
        } else {
            toast.classList.remove('bg-red-500');
            toast.classList.add('bg-green-500');
        }
        
        // Show toast
        toast.classList.remove('translate-y-20', 'opacity-0');
        
        // Auto hide after 3 seconds if enabled
        if (autoHide) {
            setTimeout(() => {
                toast.classList.add('translate-y-20', 'opacity-0');
            }, 3000);
        }
    }

    // Initial data load
    loadScheduleData(today);
});