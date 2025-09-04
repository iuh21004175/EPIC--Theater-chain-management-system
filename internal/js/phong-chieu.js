import SeatLayoutPresets from './seat-layout-presets.js';

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const roomsList = document.getElementById('rooms-list');
    const btnAddRoom = document.getElementById('btn-add-room');
    const modalAddRoom = document.getElementById('modal-add-room');
    const modalEditRoom = document.getElementById('modal-edit-room');
    const modalStatusChange = document.getElementById('modal-status-change');
    const btnSubmitAdd = document.getElementById('btn-submit-add');
    const btnSubmitEdit = document.getElementById('btn-submit-edit');
    const btnConfirmStatusChange = document.getElementById('btn-confirm-status-change');
    const btnApplyFilters = document.getElementById('btn-apply-filters');
    const btnGenerateLayout = document.getElementById('btn-generate-layout');
    const btnEditGenerateLayout = document.getElementById('btn-edit-generate-layout');
    const cancelButtons = document.querySelectorAll('.btn-cancel');
    const toast = document.getElementById('toast-notification');

    // Filters
    const filterStatus = document.getElementById('filter-status');
    const filterType = document.getElementById('filter-type');
    const filterSearch = document.getElementById('filter-search');

    // Form elements
    const formAddRoom = document.getElementById('form-add-room');
    const formEditRoom = document.getElementById('form-edit-room');
    const seatLayoutContainer = document.getElementById('seat-layout');
    const editSeatLayoutContainer = document.getElementById('edit-seat-layout');
    const seatLayoutData = document.getElementById('seat-layout-data');
    const editSeatLayoutData = document.getElementById('edit-seat-layout-data');

    // State
    let currentSeatType = 'regular';
    let statusChangeData = null;

    // Sample data for demonstration
    const sampleRooms = [
        { 
            id: 1, 
            name: 'Phòng chiếu 1', 
            code: 'P01', 
            description: 'Phòng chiếu tiêu chuẩn với 100 ghế', 
            type: '2d', 
            status: 'active',
            seat_layout: generateSampleLayout(10, 10)
        },
        { 
            id: 2, 
            name: 'Phòng chiếu 2', 
            code: 'P02', 
            description: 'Phòng chiếu 3D với 120 ghế', 
            type: '3d', 
            status: 'active',
            seat_layout: generateSampleLayout(10, 12)
        },
        { 
            id: 3, 
            name: 'Phòng chiếu IMAX', 
            code: 'P03', 
            description: 'Phòng chiếu IMAX với màn hình lớn và 150 ghế', 
            type: 'imax-3d', 
            status: 'maintenance',
            seat_layout: generateSampleLayout(10, 15)
        },
        { 
            id: 4, 
            name: 'Phòng chiếu VIP', 
            code: 'P04', 
            description: 'Phòng chiếu VIP với ghế đôi và dịch vụ cao cấp', 
            type: '2d', 
            status: 'inactive',
            seat_layout: generateSampleLayout(8, 10, true)
        }
    ];

    // Generate sample seat layout for demo
    function generateSampleLayout(rows, cols, includeSpecial = false) {
        const layout = [];
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        
        for (let i = 0; i < rows; i++) {
            const row = [];
            for (let j = 0; j < cols; j++) {
                // Add some variety to the seat types
                let seatType = 'regular';
                
                // Add VIP seats in the middle rows
                if (i >= Math.floor(rows / 4) && i < Math.floor(rows * 3 / 4) && 
                    j >= Math.floor(cols / 4) && j < Math.floor(cols * 3 / 4)) {
                    seatType = 'vip';
                }
                
                // Add some premium seats
                if (i < 3 && j >= Math.floor(cols / 3) && j < Math.floor(cols * 2 / 3)) {
                    seatType = 'premium';
                }
                
                // Add sweet box if requested
                if (includeSpecial && i % 4 === 0 && j % (cols - 1) === 0 && j > 0) {
                    seatType = 'sweet-box';
                }
                
                // Add some empty spaces
                if ((i === 0 || i === rows - 1) && (j === 0 || j === cols - 1)) {
                    seatType = 'empty';
                }
                
                row.push({
                    id: `${alphabet[i]}${j + 1}`,
                    type: seatType
                });
            }
            layout.push(row);
        }
        
        return layout;
    }

    // Load rooms list
    function loadRooms() {
        // In a real app, this would be an API call with filters
        const statusFilter = filterStatus.value;
        const typeFilter = filterType.value;
        const searchTerm = filterSearch.value.toLowerCase();

        // Filter the rooms based on the selected filters
        const filteredRooms = sampleRooms.filter(room => {
            // Status filter
            if (statusFilter !== 'all' && room.status !== statusFilter) return false;
            
            // Type filter
            if (typeFilter !== 'all' && room.type !== typeFilter) return false;
            
            // Search term
            if (searchTerm) {
                const searchFields = [
                    room.name.toLowerCase(),
                    room.code.toLowerCase(),
                    room.description ? room.description.toLowerCase() : ''
                ];
                return searchFields.some(field => field.includes(searchTerm));
            }
            
            return true;
        });

        setTimeout(() => {
            renderRooms(filteredRooms);
        }, 300);
    }

    // Render rooms list
    function renderRooms(rooms) {
        if (!rooms || rooms.length === 0) {
            roomsList.innerHTML = `
                <li class="px-6 py-4 flex items-center">
                    <div class="w-full text-center text-gray-500">Không tìm thấy phòng chiếu nào</div>
                </li>
            `;
            return;
        }

        roomsList.innerHTML = '';
        rooms.forEach(room => {
            const listItem = document.createElement('li');
            listItem.className = 'px-6 py-4 flex items-center justify-between hover:bg-gray-50';
            
            // Get room type display name
            let roomTypeName = '';
            let roomTypeClass = '';
            switch (room.type) {
                case '2d':
                    roomTypeName = '2D';
                    roomTypeClass = 'type-2d';
                    break;
                case '3d':
                    roomTypeName = '3D';
                    roomTypeClass = 'type-3d';
                    break;
                case 'imax-2d':
                    roomTypeName = 'IMAX 2D';
                    roomTypeClass = 'type-imax-2d';
                    break;
                case 'imax-3d':
                    roomTypeName = 'IMAX 3D';
                    roomTypeClass = 'type-imax-3d';
                    break;
            }
            
            // Get status display name
            let statusName = '';
            let statusClass = '';
            switch (room.status) {
                case 'active':
                    statusName = 'Đang hoạt động';
                    statusClass = 'active';
                    break;
                case 'maintenance':
                    statusName = 'Đang bảo trì';
                    statusClass = 'maintenance';
                    break;
                case 'inactive':
                    statusName = 'Ngưng hoạt động';
                    statusClass = 'inactive';
                    break;
            }
            
            // Count seats by type
            const seatCounts = countSeats(room.seat_layout);
            
            listItem.innerHTML = `
                <div>
                    <div class="flex items-center">
                        <h3 class="text-lg font-medium text-gray-900">${room.name}</h3>
                        <span class="ml-2 text-sm text-gray-500">(${room.code})</span>
                    </div>
                    <p class="text-sm text-gray-500">${room.description || 'Không có mô tả'}</p>
                    <div class="mt-2 flex items-center space-x-2">
                        <span class="room-type-badge ${roomTypeClass}">${roomTypeName}</span>
                        <span class="status-badge ${statusClass}">${statusName}</span>
                    </div>
                    <div class="mt-1 text-sm text-gray-500">
                        <span>Sức chứa: ${seatCounts.total} ghế</span>
                        <span class="ml-2">(${seatCounts.regular} thường, ${seatCounts.vip} VIP, ${seatCounts.premium} premium, ${seatCounts.sweetBox} ghế đôi)</span>
                    </div>
                </div>
                <div class="flex space-x-2">
                    <button type="button" class="btn-change-status inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500" data-id="${room.id}" data-status="${room.status}">
                        <svg class="-ml-1 mr-1 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        Thay đổi trạng thái
                    </button>
                    <button type="button" class="btn-edit inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" data-id="${room.id}">
                        <svg class="-ml-1 mr-1 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Sửa
                    </button>
                </div>
            `;
            roomsList.appendChild(listItem);
        });

        // Add event listeners to buttons
        document.querySelectorAll('.btn-edit').forEach(button => {
            button.addEventListener('click', function() {
                const roomId = parseInt(this.getAttribute('data-id'));
                openEditModal(roomId);
            });
        });

        document.querySelectorAll('.btn-change-status').forEach(button => {
            button.addEventListener('click', function() {
                const roomId = parseInt(this.getAttribute('data-id'));
                const currentStatus = this.getAttribute('data-status');
                openStatusChangeModal(roomId, currentStatus);
            });
        });
    }

    // Count seats by type from layout
    function countSeats(layout) {
        const counts = {
            regular: 0,
            vip: 0,
            premium: 0,
            sweetBox: 0,
            empty: 0,
            total: 0
        };
        
        layout.forEach(row => {
            row.forEach(seat => {
                if (seat.type !== 'empty') {
                    counts.total++;
                    
                    if (seat.type === 'regular') counts.regular++;
                    else if (seat.type === 'vip') counts.vip++;
                    else if (seat.type === 'premium') counts.premium++;
                    else if (seat.type === 'sweet-box') counts.sweetBox++;
                } else {
                    counts.empty++;
                }
            });
        });
        
        return counts;
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

    // Update the setupSeatTypeSelection function to work with the new table
    function setupSeatTypeSelection() {
        // Get all seat type cells from the table
        const seatTypeCells = document.querySelectorAll('.seat-type-table th, .seat-type-table td');
        
        // Add click event listeners to the cells
        seatTypeCells.forEach(cell => {
            cell.addEventListener('click', function() {
                const type = this.getAttribute('data-type');
                if (!type) return;
                
                // Remove active class from all cells
                const table = this.closest('.seat-type-table');
                table.querySelectorAll('th, td').forEach(cell => {
                    cell.classList.remove('active');
                });
                
                // Add active class to the clicked cell and its corresponding cell in the other row
                const isHeader = this.tagName.toLowerCase() === 'th';
                const index = Array.from(this.parentNode.children).indexOf(this);
                
                // Select both the header and color cell for the same column
                table.querySelector(`th:nth-child(${index + 1})[data-type="${type}"]`).classList.add('active');
                table.querySelector(`td:nth-child(${index + 1})[data-type="${type}"]`).classList.add('active');
                
                // Update current seat type
                currentSeatType = type;
                
                // Also update the hidden buttons for compatibility
                const modal = this.closest('#modal-add-room, #modal-edit-room');
                if (modal) {
                    const hiddenButtons = modal.querySelectorAll('.seat-type-btn');
                    hiddenButtons.forEach(btn => {
                        if (btn.getAttribute('data-type') === type) {
                            btn.classList.add('active');
                        } else {
                            btn.classList.remove('active');
                        }
                    });
                    
                    // Update the type message
                    const typeMessage = modal.querySelector('.current-type-message');
                    if (typeMessage) {
                        const typeName = table.querySelector(`th[data-type="${type}"]`).textContent.trim();
                        typeMessage.innerHTML = `<strong>Loại ghế đang chọn:</strong> <span class="type-${currentSeatType}">${typeName}</span>`;
                        
                        // Add animation to draw attention
                        typeMessage.classList.add('pulse-once');
                        setTimeout(() => {
                            typeMessage.classList.remove('pulse-once');
                        }, 500);
                    }
                    
                    // Highlight matching seats
                    const seatContainer = modal.querySelector('.seat-grid');
                    if (seatContainer) {
                        // First, remove highlighting from all seats
                        seatContainer.querySelectorAll('.seat').forEach(seat => {
                            seat.classList.remove('highlight-seat');
                        });
                        
                        // Then highlight seats of the selected type
                        seatContainer.querySelectorAll(`.seat.${currentSeatType}`).forEach(seat => {
                            seat.classList.add('highlight-seat');
                            seat.classList.add('pulse-once');
                            setTimeout(() => {
                                seat.classList.remove('pulse-once');
                            }, 500);
                        });
                    }
                }
            });
        });

        // Keep the original function logic as a fallback but comment it out
        /*
        // Get all seat type buttons
        const seatTypeButtons = document.querySelectorAll('.seat-type-btn');
        
        // Update button styles to match the legend colors
        seatTypeButtons.forEach(button => {
            const type = button.getAttribute('data-type');
            switch(type) {
                case 'regular':
                    button.style.backgroundColor = '#B8B8B8';
                    button.style.color = '#333';
                    button.style.borderColor = '#999';
                    break;
                case 'vip':
                    button.style.backgroundColor = '#D35D89';
                    button.style.color = 'white';
                    button.style.borderColor = '#D35D89';
                    break;
                case 'premium':
                    button.style.backgroundColor = '#9C182F';
                    button.style.color = 'white';
                    button.style.borderColor = '#9C182F';
                    break;
                case 'sweet-box':
                    button.style.backgroundColor = '#E91E63';
                    button.style.color = 'white';
                    button.style.borderColor = '#E91E63';
                    break;
                case 'empty':
                    // Keep the empty style as is
                    break;
            }
            
            // Add click event listeners
            button.addEventListener('click', function(e) {
                e.preventDefault(); // Prevent default button behavior
                
                // Remove active class from all options in the same container
                const container = this.closest('.seat-type-bar');
                if (container) {
                    container.querySelectorAll('.seat-type-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                } else {
                    // Fallback to all buttons
                    seatTypeButtons.forEach(btn => btn.classList.remove('active'));
                }
                
                // Add active class to the clicked option
                this.classList.add('active');
                
                // Update current seat type
                currentSeatType = this.getAttribute('data-type');
                
                // Find the modal containing this button
                const modal = this.closest('#modal-add-room, #modal-edit-room');
                if (modal) {
                    // Update the type message
                    const typeMessage = modal.querySelector('.current-type-message');
                    if (typeMessage) {
                        const typeName = this.textContent.trim();
                        typeMessage.innerHTML = `<strong>Loại ghế đang chọn:</strong> <span class="type-${currentSeatType}">${typeName}</span>`;
                        
                        // Add animation to draw attention
                        typeMessage.classList.add('pulse-once');
                        setTimeout(() => {
                            typeMessage.classList.remove('pulse-once');
                        }, 500);
                    }
                    
                    // Highlight the legend item
                    modal.querySelectorAll('.legend-item').forEach(item => {
                        item.classList.remove('active-legend');
                        if (item.getAttribute('data-type') === currentSeatType) {
                            item.classList.add('active-legend');
                        }
                    });
                    
                    // Highlight matching seats
                    const seatContainer = modal.querySelector('.seat-grid');
                    if (seatContainer) {
                        // First, remove highlighting from all seats
                        seatContainer.querySelectorAll('.seat').forEach(seat => {
                            seat.classList.remove('highlight-seat');
                        });
                        
                        // Then highlight seats of the selected type
                        seatContainer.querySelectorAll(`.seat.${currentSeatType}`).forEach(seat => {
                            seat.classList.add('highlight-seat');
                            seat.classList.add('pulse-once');
                            setTimeout(() => {
                                seat.classList.remove('pulse-once');
                            }, 500);
                        });
                    }
                }
            });
        });
        */
    }

    // Enhanced generate seat layout function to match reference image
    function generateSeatLayout(rows, columns, container, layoutDataInput) {
        // Clear previous content
        container.innerHTML = '';
        const columnHeaders = document.getElementById(container.id === 'seat-layout' ? 'column-headers' : 'edit-column-headers');
        if (columnHeaders) columnHeaders.innerHTML = '';
        
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const layout = [];
        
        // Generate column headers
        if (columnHeaders) {
            columnHeaders.innerHTML = ''; // Clear previous headers
            
            // Add empty space for row labels
            const emptyHeader = document.createElement('div');
            emptyHeader.className = 'w-8';
            columnHeaders.appendChild(emptyHeader);
            
            for (let j = 0; j < columns; j++) {
                const header = document.createElement('div');
                header.className = 'column-header';
                header.textContent = j + 1;
                columnHeaders.appendChild(header);
            }
        }
        
        // Generate rows
        for (let i = 0; i < rows; i++) {
            const rowData = [];
            const rowElement = document.createElement('div');
            rowElement.className = 'seat-row';
            
            // Add row label with letter
            const rowLabel = document.createElement('div');
            rowLabel.className = 'row-label';
            rowLabel.textContent = alphabet[i];
            rowElement.appendChild(rowLabel);
            
            // Add seats
            for (let j = 0; j < columns; j++) {
                // Calculate seat id (A1, A2, etc.)
                const seatId = `${alphabet[i]}${j + 1}`;
                const seatType = 'regular';
                rowData.push({ id: seatId, type: seatType });
                
                // Create seat element
                const seatElement = document.createElement('div');
                seatElement.className = `seat ${seatType}`;
                seatElement.setAttribute('data-seat-id', seatId);
                seatElement.setAttribute('data-row', i);
                seatElement.setAttribute('data-col', j);
                seatElement.textContent = seatId; 
                
                // Important: Clone the layout array to avoid reference issues
                const layoutArray = JSON.parse(JSON.stringify(layout));
                
                // Add the enhanced click handler with the layout data directly
                addSeatClickHandler(seatElement, i, j, layoutArray, layoutDataInput);
                
                rowElement.appendChild(seatElement);
            }
            
            // Add row to layout
            layout.push(rowData);
            container.appendChild(rowElement);
        }
        
        // Update the hidden input with the initial layout
        layoutDataInput.value = JSON.stringify(layout);
        
        // Show visual feedback
        const modal = container.closest('#modal-add-room, #modal-edit-room');
        if (modal) {
            const feedbackMessage = modal.querySelector('.seat-change-feedback');
            if (feedbackMessage) {
                feedbackMessage.innerHTML = `<strong>Thành công!</strong> Đã tạo sơ đồ ghế với ${rows} hàng và ${columns} cột.`;
                feedbackMessage.classList.remove('hidden');
                
                // Auto-hide after a few seconds
                clearTimeout(feedbackMessage.hideTimeout);
                feedbackMessage.hideTimeout = setTimeout(() => {
                    feedbackMessage.classList.add('hidden');
                }, 3000);
            }
        }
        
        return layout;
    }

    // Similarly, update the loadSeatLayout function for consistency
    function loadSeatLayout(layout, container, layoutDataInput) {
        if (!layout || !layout.length) return;
        
        // Clear previous content
        container.innerHTML = '';
        const columnHeaders = document.getElementById('edit-column-headers');
        if (columnHeaders) columnHeaders.innerHTML = '';
        
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        
        // Generate column headers
        if (columnHeaders) {
            columnHeaders.innerHTML = ''; // Clear previous headers
            
            // Add empty space for row labels
            const emptyHeader = document.createElement('div');
            emptyHeader.className = 'w-8';
            columnHeaders.appendChild(emptyHeader);
            
            for (let j = 0; j < layout[0].length; j++) {
                const header = document.createElement('div');
                header.className = 'column-header';
                header.textContent = j + 1;
                columnHeaders.appendChild(header);
            }
        }
        
        // Load rows and seats
        for (let i = 0; i < layout.length; i++) {
            const row = layout[i];
            const rowElement = document.createElement('div');
            rowElement.className = 'seat-row';
            
            // Add row label
            const rowLabel = document.createElement('div');
            rowLabel.className = 'row-label';
            rowLabel.textContent = alphabet[i];
            rowElement.appendChild(rowLabel);
            
            for (let j = 0; j < row.length; j++) {
                const seat = row[j];
                
                // Create seat element
                const seatElement = document.createElement('div');
                seatElement.className = `seat ${seat.type}`;
                seatElement.setAttribute('data-seat-id', seat.id);
                seatElement.setAttribute('data-row', i);
                seatElement.setAttribute('data-col', j);
                seatElement.textContent = seat.id;  // Show seat ID instead of column number
                seatElement.title = seat.id;
                
                // Important: Make sure to use the correct layout reference
                // Create a clean copy of the layout to avoid reference issues
                const layoutCopy = JSON.parse(JSON.stringify(layout));
                
                // Add the enhanced click handler with the layout data directly
                addSeatClickHandler(seatElement, i, j, layoutCopy, layoutDataInput);
                
                rowElement.appendChild(seatElement);
            }
            
            container.appendChild(rowElement);
        }
        
        // Update the hidden input with the loaded layout
        layoutDataInput.value = JSON.stringify(layout);
    }

    // Fix the addSeatClickHandler function to properly handle the layout data
    function addSeatClickHandler(seatElement, row, col, layout, layoutDataInput) {
        seatElement.addEventListener('click', function() {
            // Ensure the layout is properly referenced 
            // This is where the error is occurring - we need to reference the right layout object
            
            // Get the current layout data from the hidden input to ensure we're working with the latest data
            let currentLayoutData;
            try {
                currentLayoutData = JSON.parse(layoutDataInput.value);
            } catch (e) {
                console.error("Error parsing layout data:", e);
                showToast("Lỗi dữ liệu sơ đồ ghế", true);
                return;
            }
            
            // Safety check for the layout data structure
            if (!currentLayoutData || !Array.isArray(currentLayoutData) || 
                !currentLayoutData[row] || !currentLayoutData[row][col]) {
                console.error("Invalid layout data structure");
                showToast("Lỗi dữ liệu sơ đồ ghế", true);
                return;
            }
            
            // Now safely access the previous type
            const previousType = currentLayoutData[row][col].type;
            
            // Update the seat type in the data model
            currentLayoutData[row][col].type = currentSeatType;
            
            // Update the visual appearance
            this.className = `seat ${currentSeatType}`;
            
            // Add animation for visual feedback
            this.classList.add('seat-change-animation');
            setTimeout(() => {
                this.classList.remove('seat-change-animation');
            }, 500);
            
            // Update the hidden input with the updated layout
            layoutDataInput.value = JSON.stringify(currentLayoutData);
            
            // Show feedback message
            const modal = this.closest('#modal-add-room, #modal-edit-room');
            if (modal) {
                const feedbackMessage = modal.querySelector('.seat-change-feedback');
                if (feedbackMessage) {
                    const seatId = this.getAttribute('data-seat-id');
                    feedbackMessage.innerHTML = `Ghế <strong>${seatId}</strong> đã được thay đổi từ 
                        <span class="type-${previousType}">${getTypeName(previousType)}</span> thành 
                        <span class="type-${currentSeatType}">${getTypeName(currentSeatType)}</span>`;
                    feedbackMessage.classList.remove('hidden');
                    
                    // Auto-hide after a few seconds
                    clearTimeout(feedbackMessage.hideTimeout);
                    feedbackMessage.hideTimeout = setTimeout(() => {
                        feedbackMessage.classList.add('hidden');
                    }, 3000);
                }
            }
        });
    }

    // Add the missing getTypeName function
    function getTypeName(type) {
        switch(type) {
            case 'regular': return 'Ghế thường';
            case 'vip': return 'Ghế VIP';
            case 'premium': return 'Ghế Premium';
            case 'sweet-box': return 'Sweet Box';
            case 'empty': return 'Lối đi';
            default: return type;
        }
    }

    // Open Add Modal - Fix the seat type selection reset
    function openAddModal() {
        // Reset form
        formAddRoom.reset();
        
        // Clear error messages
        document.querySelectorAll('#form-add-room .text-red-600').forEach(el => {
            el.textContent = '';
            el.classList.add('hidden');
        });
        
        // Reset seat layout
        seatLayoutContainer.innerHTML = '';
        seatLayoutData.value = '';
        
        // Reset seat type selection in the table
        const tableCells = document.querySelectorAll('#modal-add-room .seat-type-table th, #modal-add-room .seat-type-table td');
        tableCells.forEach(cell => {
            if (cell.getAttribute('data-type') === 'regular') {
                cell.classList.add('active');
            } else {
                cell.classList.remove('active');
            }
        });
        currentSeatType = 'regular';
        
        // Update the type message to show regular seats initially
        const typeMessage = document.querySelector('#modal-add-room .current-type-message');
        if (typeMessage) {
            typeMessage.innerHTML = '<strong>Loại ghế đang chọn:</strong> <span class="type-regular">Ghế thường</span>';
        }
        
        // Show modal
        modalAddRoom.classList.remove('hidden');
    }

    // Open Edit Modal - Fix the seat type selection reset
    function openEditModal(roomId) {
        // Get room data
        const room = sampleRooms.find(r => r.id === roomId);
        if (!room) return;
        
        // Populate form
        document.getElementById('edit-room-id').value = room.id;
        document.getElementById('edit-room-name').value = room.name;
        document.getElementById('edit-room-code').value = room.code;
        document.getElementById('edit-room-description').value = room.description || '';
        document.getElementById('edit-room-type').value = room.type;
        document.getElementById('edit-room-status').value = room.status;
        
        // Set seat rows and columns
        document.getElementById('edit-seat-rows').value = room.seat_layout.length;
        document.getElementById('edit-seat-columns').value = room.seat_layout[0].length;
        
        // Load seat layout
        loadSeatLayout(room.seat_layout, editSeatLayoutContainer, editSeatLayoutData);
        
        // Reset seat type selection in the table
        const tableCells = document.querySelectorAll('#modal-edit-room .seat-type-table th, #modal-edit-room .seat-type-table td');
        tableCells.forEach(cell => {
            if (cell.getAttribute('data-type') === 'regular') {
                cell.classList.add('active');
            } else {
                cell.classList.remove('active');
            }
        });
        currentSeatType = 'regular';
        
        // Update the type message to show regular seats initially
        const typeMessage = document.querySelector('#modal-edit-room .current-type-message');
        if (typeMessage) {
            typeMessage.innerHTML = '<strong>Loại ghế đang chọn:</strong> <span class="type-regular">Ghế thường</span>';
        }
        
        // Clear error messages
        document.querySelectorAll('#form-edit-room .text-red-600').forEach(el => {
            el.textContent = '';
            el.classList.add('hidden');
        });
        
        // Show modal
        modalEditRoom.classList.remove('hidden');
    }

    // Open Status Change Modal
    function openStatusChangeModal(roomId, currentStatus) {
        const room = sampleRooms.find(r => r.id === roomId);
        if (!room) return;
        
        let newStatus = '';
        let statusAction = '';
        
        if (currentStatus === 'active') {
            newStatus = 'maintenance';
            statusAction = 'chuyển sang trạng thái Bảo trì';
        } else if (currentStatus === 'maintenance') {
            newStatus = 'inactive';
            statusAction = 'ngừng hoạt động';
        } else if (currentStatus === 'inactive') {
            newStatus = 'active';
            statusAction = 'kích hoạt lại';
        }
        
        // Set confirmation message
        document.getElementById('status-change-title').textContent = `Xác nhận thay đổi trạng thái`;
        document.getElementById('status-change-message').textContent = `Bạn có chắc chắn muốn ${statusAction} phòng chiếu "${room.name}" không?`;
        
        // Store data for the confirmation
        statusChangeData = {
            roomId: roomId,
            newStatus: newStatus
        };
        
        // Show modal
        modalStatusChange.classList.remove('hidden');
    }

    // Close modals
    function closeModals() {
        [modalAddRoom, modalEditRoom, modalStatusChange].forEach(modal => {
            modal.classList.add('hidden');
        });
    }

    // Add event listeners
    function setupEventListeners() {
        // Add room button
        btnAddRoom.addEventListener('click', openAddModal);
        
        // Generate layout buttons
        btnGenerateLayout.addEventListener('click', function() {
            const rows = parseInt(document.getElementById('seat-rows').value);
            const columns = parseInt(document.getElementById('seat-columns').value);
            
            console.log(`Generating layout with ${rows} rows and ${columns} columns`);
            
            if (rows > 0 && rows <= 26 && columns > 0 && columns <= 20) {
                const layout = generateSeatLayout(rows, columns, seatLayoutContainer, seatLayoutData);
                
                // Apply some default patterns to make the layout more visually appealing
                for (let i = 0; i < rows; i++) {
                    for (let j = 0; j < columns; j++) {
                        // Add some patterns based on position
                        if (i < 2 && j >= Math.floor(columns/3) && j < Math.floor(columns*2/3)) {
                            // Premium seats in front center
                            layout[i][j].type = 'premium';
                        } else if (i >= 2 && i < rows-2 && j >= Math.floor(columns/4) && j < Math.floor(columns*3/4)) {
                            // VIP seats in middle
                            layout[i][j].type = 'vip';
                        }
                        
                        // Update the visual appearance
                        const seatElement = seatLayoutContainer.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                        if (seatElement) {
                            seatElement.className = `seat ${layout[i][j].type}`;
                        }
                    }
                }
                
                // Update the layout data
                seatLayoutData.value = JSON.stringify(layout);
                
                showToast('Đã tạo sơ đồ ghế thành công');
            } else {
                showToast('Số hàng và số cột không hợp lệ', true);
            }
        });
        
        btnEditGenerateLayout.addEventListener('click', function() {
            const rows = parseInt(document.getElementById('edit-seat-rows').value);
            const columns = parseInt(document.getElementById('edit-seat-columns').value);
            
            if (rows > 0 && rows <= 26 && columns > 0 && columns <= 20) {
                const layout = generateSeatLayout(rows, columns, editSeatLayoutContainer, editSeatLayoutData);
                
                // Apply some default patterns to make the layout more visually appealing
                for (let i = 0; i < rows; i++) {
                    for (let j = 0; j < columns; j++) {
                        // Add some patterns based on position
                        if (i < 2 && j >= Math.floor(columns/3) && j < Math.floor(columns*2/3)) {
                            // Premium seats in front center
                            layout[i][j].type = 'premium';
                        } else if (i >= 2 && i < rows-2 && j >= Math.floor(columns/4) && j < Math.floor(columns*3/4)) {
                            // VIP seats in middle
                            layout[i][j].type = 'vip';
                        }
                        
                        // Update the visual appearance
                        const seatElement = editSeatLayoutContainer.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                        if (seatElement) {
                            seatElement.className = `seat ${layout[i][j].type}`;
                        }
                    }
                }
                
                // Update the layout data
                editSeatLayoutData.value = JSON.stringify(layout);
                
                showToast('Đã tạo lại sơ đồ ghế thành công');
            } else {
                showToast('Số hàng và số cột không hợp lệ', true);
            }
        });
        
        // Preset buttons
        document.querySelectorAll('.preset-btn').forEach(button => {
            button.addEventListener('click', function() {
                const preset = this.getAttribute('data-preset');
                
                // Determine which container to use
                const isEditContext = this.closest('#modal-edit-room') !== null;
                const container = isEditContext ? editSeatLayoutContainer : seatLayoutContainer;
                const layoutDataInput = isEditContext ? editSeatLayoutData : seatLayoutData;
                
                // Apply the preset
                applyPresetLayout(preset, container, layoutDataInput);
            });
        });
        
        // Cancel buttons for modals
        cancelButtons.forEach(button => {
            button.addEventListener('click', closeModals);
        });
        
        // Submit add form
        btnSubmitAdd.addEventListener('click', function() {
            const formData = {
                name: document.getElementById('room-name').value,
                code: document.getElementById('room-code').value,
                description: document.getElementById('room-description').value,
                type: document.getElementById('room-type').value,
                status: document.getElementById('room-status').value,
                seat_layout: document.getElementById('seat-layout-data').value
            };
            
            // Parse the seat layout
            if (formData.seat_layout) {
                try {
                    formData.seat_layout = JSON.parse(formData.seat_layout);
                } catch (e) {
                    showToast('Sơ đồ ghế không hợp lệ', true);
                    return;
                }
            }
            
            // Validate form
            if (!validateForm(formData)) {
                return;
            }
            
            // Add new room (in a real app, this would be an API call)
            const newId = sampleRooms.length > 0 ? Math.max(...sampleRooms.map(r => r.id)) + 1 : 1;
            const newRoom = {
                id: newId,
                name: formData.name,
                code: formData.code,
                description: formData.description,
                type: formData.type,
                status: formData.status,
                seat_layout: formData.seat_layout
            };
            
            sampleRooms.push(newRoom);
            
            // Close modal and reload rooms
            closeModals();
            loadRooms();
            
            // Show success message
            showToast('Thêm phòng chiếu thành công');
        });
        
        // Submit edit form
        btnSubmitEdit.addEventListener('click', function() {
            const formData = {
                id: document.getElementById('edit-room-id').value,
                name: document.getElementById('edit-room-name').value,
                code: document.getElementById('edit-room-code').value,
                description: document.getElementById('edit-room-description').value,
                type: document.getElementById('edit-room-type').value,
                status: document.getElementById('edit-room-status').value,
                seat_layout: document.getElementById('edit-seat-layout-data').value
            };
            
            // Parse the seat layout
            if (formData.seat_layout) {
                try {
                    formData.seat_layout = JSON.parse(formData.seat_layout);
                } catch (e) {
                    showToast('Sơ đồ ghế không hợp lệ', true);
                    return;
                }
            }
            
            // Validate form
            if (!validateForm(formData, false)) {
                return;
            }
            
            // Update room (in a real app, this would be an API call)
            const roomIndex = sampleRooms.findIndex(r => r.id === parseInt(formData.id));
            if (roomIndex !== -1) {
                sampleRooms[roomIndex] = {
                    ...sampleRooms[roomIndex],
                    name: formData.name,
                    code: formData.code,
                    description: formData.description,
                    type: formData.type,
                    status: formData.status,
                    seat_layout: formData.seat_layout
                };
                
                // Close modal and reload rooms
                closeModals();
                loadRooms();
                
                // Show success message
                showToast('Cập nhật phòng chiếu thành công');
            } else {
                showToast('Không tìm thấy phòng chiếu', true);
            }
        });
        
        // Confirm status change
        btnConfirmStatusChange.addEventListener('click', function() {
            if (!statusChangeData) return;
            
            const { roomId, newStatus } = statusChangeData;
            
            // Update room status (in a real app, this would be an API call)
            const roomIndex = sampleRooms.findIndex(r => r.id === roomId);
            if (roomIndex !== -1) {
                sampleRooms[roomIndex].status = newStatus;
                
                // Close modal and reload rooms
                closeModals();
                loadRooms();
                
                // Show success message
                showToast('Thay đổi trạng thái phòng chiếu thành công');
            } else {
                showToast('Không tìm thấy phòng chiếu', true);
            }
            
            // Reset status change data
            statusChangeData = null;
        });
        
        // Apply filters
        btnApplyFilters.addEventListener('click', loadRooms);
        
        // Quick search as you type
        filterSearch.addEventListener('input', function() {
            // Debounce the search to avoid too many reloads
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                loadRooms();
            }, 300);
        });
    }

    // Validate form
    function validateForm(formData, isAdd = true) {
        let isValid = true;
        const errors = {};
        
        // Validate name
        if (!formData.name || formData.name.trim() === '') {
            errors.name = 'Tên phòng chiếu không được để trống';
            isValid = false;
        }
        
        // Validate code
        if (!formData.code || formData.code.trim() === '') {
            errors.code = 'Mã phòng không được để trống';
            isValid = false;
        } else {
            // Check for uniqueness if adding new room or changing code
            const existingRoom = sampleRooms.find(room => 
                room.code === formData.code && 
                (isAdd || parseInt(room.id) !== parseInt(formData.id))
            );
            
            if (existingRoom) {
                errors.code = 'Mã phòng đã tồn tại';
                isValid = false;
            }
        }
        
        // Validate type
        if (!formData.type || formData.type === '') {
            errors.type = 'Vui lòng chọn loại phòng chiếu';
            isValid = false;
        }
        
        // Validate seat layout
        if (!formData.seat_layout) {
            errors.seat_layout = 'Vui lòng tạo sơ đồ ghế';
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
        ['name', 'code', 'description', 'type', 'seat-layout'].forEach(field => {
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

    // Initialize the page
    function initPage() {
        setupSeatTypeSelection();
        setupEventListeners();
        loadRooms();
        
        // Add debug info
        console.log('Seat management initialized - Seat type selection should now work correctly');
    }

    // Run initialization
    initPage();
});