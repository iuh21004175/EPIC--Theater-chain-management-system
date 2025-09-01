document.addEventListener('DOMContentLoaded', function() {
        // Modals
        const modals = {
            addCinema: document.getElementById('add-cinema-modal'),
            editCinema: document.getElementById('edit-cinema-modal'),
            confirmStatus: document.getElementById('confirm-status-modal')
        };
        
        // Open Add Cinema Modal
        document.getElementById('btn-add-cinema').addEventListener('click', function() {
            openModal(modals.addCinema);
        });
        
        // Cinema rows click handler
        const cinemaItems = document.querySelectorAll('.cinema-item');
        cinemaItems.forEach(item => {
            item.addEventListener('click', function() {
                const cinemaId = this.getAttribute('data-id');
                // Highlight selected row
                cinemaItems.forEach(row => row.classList.remove('bg-gray-100'));
                this.classList.add('bg-gray-100');
                
                // Load cinema data and show edit modal
                loadCinemaData(cinemaId);
                openModal(modals.editCinema);
            });
        });
        
        // Toggle Status Button Click
        document.getElementById('toggle-status-btn').addEventListener('click', function() {
            const cinemaId = document.getElementById('edit-cinema-id').value;
            const currentStatus = document.getElementById('edit-cinema-status').value;
            
            let newStatus = currentStatus === 'active' ? 'inactive' : 'active';
            let statusText = newStatus === 'active' ? 'kích hoạt' : 'ngừng hoạt động';
            
            // Set confirmation message
            document.getElementById('confirm-status-message').textContent = 
                `Bạn có chắc chắn muốn ${statusText} rạp phim này không?`;
            
            // Store cinema ID for later use
            document.getElementById('confirm-status-modal').setAttribute('data-cinema-id', cinemaId);
            document.getElementById('confirm-status-modal').setAttribute('data-new-status', newStatus);
            
            // Show confirmation dialog
            openModal(modals.confirmStatus);
        });
        
        // Confirm status change
        document.getElementById('confirm-status-ok').addEventListener('click', function() {
            const confirmModal = document.getElementById('confirm-status-modal');
            const cinemaId = confirmModal.getAttribute('data-cinema-id');
            const newStatus = confirmModal.getAttribute('data-new-status');
            
            // Update status in edit form
            document.getElementById('edit-cinema-status').value = newStatus;
            
            // Update status indicator in edit form
            const statusIndicator = document.getElementById('status-indicator');
            statusIndicator.classList.remove('status-active', 'status-inactive');
            
            if (newStatus === 'active') {
                statusIndicator.textContent = 'Đang hoạt động';
                statusIndicator.classList.add('status-active');
            } else {
                statusIndicator.textContent = 'Ngừng hoạt động';
                statusIndicator.classList.add('status-inactive');
            }
            
            // Update cinema row in list
            updateCinemaStatusInList(cinemaId, newStatus);
            
            // Close confirmation modal
            closeModal(modals.confirmStatus);
            
            // Show success message
            alert('Thay đổi trạng thái thành công');
        });
        
        // Cancel status change
        document.getElementById('confirm-status-cancel').addEventListener('click', function() {
            closeModal(modals.confirmStatus);
        });
        
        // Add Cinema Form Submit
        document.getElementById('add-cinema-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('cinema-name').value;
            const address = document.getElementById('cinema-address').value;
            const manager = document.getElementById('cinema-manager').value;
            
            let isValid = validateCinemaForm(name, address, manager, 'cinema');
            
            if (isValid) {
                // In a real application, submit data via AJAX
                // For demo purposes:
                alert('Thêm rạp phim thành công!');
                closeModal(modals.addCinema);
                addCinemaToList(name, address, manager);
                document.getElementById('add-cinema-form').reset();
            }
        });
        
        // Edit Cinema Form Submit
        document.getElementById('edit-cinema-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const cinemaId = document.getElementById('edit-cinema-id').value;
            const name = document.getElementById('edit-cinema-name').value;
            const address = document.getElementById('edit-cinema-address').value;
            const manager = document.getElementById('edit-cinema-manager').value;
            
            let isValid = validateCinemaForm(name, address, manager, 'edit-cinema');
            
            if (isValid) {
                // In a real application, submit data via AJAX
                // For demo purposes:
                alert('Cập nhật thông tin rạp phim thành công!');
                updateCinemaInList(cinemaId, name, address, manager);
                closeModal(modals.editCinema);
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
        
        // Search functionality
        const searchInput = document.getElementById('search');
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const cinemaRows = document.querySelectorAll('.cinema-item');
            let hasVisibleRows = false;
            
            cinemaRows.forEach(row => {
                const name = row.querySelector('td:first-child').textContent.toLowerCase();
                const address = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
                
                if (name.includes(searchTerm) || address.includes(searchTerm)) {
                    row.classList.remove('hidden');
                    hasVisibleRows = true;
                } else {
                    row.classList.add('hidden');
                }
            });
            
            // Show/hide "No results" message
            const noResultsMessage = document.getElementById('no-results-message');
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
        
        function validateCinemaForm(name, address, manager, prefix) {
            let isValid = true;
            
            // Validate name (required)
            if (!name) {
                document.getElementById(`${prefix}-name-error`).classList.remove('hidden');
                isValid = false;
            } else {
                document.getElementById(`${prefix}-name-error`).classList.add('hidden');
            }
            
            // Validate address (required)
            if (!address) {
                document.getElementById(`${prefix}-address-error`).classList.remove('hidden');
                isValid = false;
            } else {
                document.getElementById(`${prefix}-address-error`).classList.add('hidden');
            }
            
            // Validate manager (required)
            if (!manager) {
                document.getElementById(`${prefix}-manager-error`).classList.remove('hidden');
                isValid = false;
            } else {
                document.getElementById(`${prefix}-manager-error`).classList.add('hidden');
            }
            
            return isValid;
        }
        
        function loadCinemaData(cinemaId) {
            // In a real application, this would fetch data via AJAX
            document.getElementById('edit-cinema-id').value = cinemaId;
            
            const cinemaRow = document.querySelector(`.cinema-item[data-id="${cinemaId}"]`);
            const status = cinemaRow.getAttribute('data-status');
            document.getElementById('edit-cinema-status').value = status;
            
            // Update status indicator
            const statusIndicator = document.getElementById('status-indicator');
            statusIndicator.classList.remove('status-active', 'status-inactive');
            statusIndicator.classList.add(`status-${status}`);
            statusIndicator.textContent = status === 'active' ? 'Đang hoạt động' : 'Ngừng hoạt động';
            
            if (cinemaId === '1') {
                document.getElementById('edit-cinema-name').value = 'EPIC Cinema - Quận 1';
                document.getElementById('edit-cinema-address').value = '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh';
                document.getElementById('edit-cinema-manager').value = 'Nguyễn Văn A';
            } else if (cinemaId === '2') {
                document.getElementById('edit-cinema-name').value = 'EPIC Cinema - Quận 7';
                document.getElementById('edit-cinema-address').value = '456 Nguyễn Thị Thập, Quận 7, TP. Hồ Chí Minh';
                document.getElementById('edit-cinema-manager').value = 'Trần Văn B';
            } else if (cinemaId === '3') {
                document.getElementById('edit-cinema-name').value = 'EPIC Cinema - Hà Nội';
                document.getElementById('edit-cinema-address').value = '789 Nguyễn Trãi, Thanh Xuân, Hà Nội';
                document.getElementById('edit-cinema-manager').value = 'Lê Thị C';
            }
        }
        
        function updateCinemaStatusInList(cinemaId, status) {
            const cinemaRow = document.querySelector(`.cinema-item[data-id="${cinemaId}"]`);
            if (cinemaRow) {
                cinemaRow.setAttribute('data-status', status);
                const statusCell = cinemaRow.querySelector('td:nth-child(4) span');
                statusCell.classList.remove('status-active', 'status-inactive');
                statusCell.classList.add(`status-${status}`);
                statusCell.textContent = status === 'active' ? 'Đang hoạt động' : 'Ngừng hoạt động';
            }
        }
        
        function updateCinemaInList(cinemaId, name, address, manager) {
            const cinemaRow = document.querySelector(`.cinema-item[data-id="${cinemaId}"]`);
            if (cinemaRow) {
                cinemaRow.querySelector('td:nth-child(1) div').textContent = name;
                cinemaRow.querySelector('td:nth-child(2) div').textContent = address;
                cinemaRow.querySelector('td:nth-child(3) div').textContent = manager;
            }
        }
        
        function addCinemaToList(name, address, manager) {
            // In a real application, we would get the new ID from the server
            const newId = Date.now().toString();
            
            const tbody = document.querySelector('table tbody');
            const newRow = document.createElement('tr');
            newRow.className = 'cinema-item cursor-pointer hover:bg-gray-50';
            newRow.setAttribute('data-id', newId);
            newRow.setAttribute('data-status', 'active');
            
            newRow.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${name}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">${address}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">${manager}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full status-active">
                        Đang hoạt động
                    </span>
                </td>
            `;
            
            tbody.prepend(newRow);
            
            // Add event listener to the new row
            newRow.addEventListener('click', function() {
                const cinemaId = this.getAttribute('data-id');
                // Highlight selected row
                document.querySelectorAll('.cinema-item').forEach(row => row.classList.remove('bg-gray-100'));
                this.classList.add('bg-gray-100');
                
                // Load cinema data and show edit modal
                loadCinemaData(cinemaId);
                openModal(modals.editCinema);
            });
        }
    });