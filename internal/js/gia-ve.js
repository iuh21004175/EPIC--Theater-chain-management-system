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
            });
        });
        
        // Add time surcharge
        document.getElementById('add-time-surcharge').addEventListener('click', function() {
            const container = document.getElementById('time-surcharges-container');
            const newItem = document.createElement('div');
            newItem.className = 'time-surcharge-item grid grid-cols-1 md:grid-cols-7 gap-4 items-end mb-6';
            newItem.innerHTML = `
                <div class="md:col-span-2">
                    <label class="input-group-label">Giờ bắt đầu</label>
                    <input type="time" name="time_start[]" class="price-input text-center">
                </div>
                <div class="md:col-span-2">
                    <label class="input-group-label">Giờ kết thúc</label>
                    <input type="time" name="time_end[]" class="price-input text-center">
                </div>
                <div class="md:col-span-2">
                    <label class="input-group-label">Phụ thu</label>
                    <div class="price-input-container">
                        <span class="price-input-icon-left">₫</span>
                        <input type="number" name="time_surcharge[]" class="price-input" placeholder="0">
                        <span class="price-input-icon-right">VND</span>
                    </div>
                </div>
                <div class="md:col-span-1 flex items-center justify-center md:justify-end">
                    <button type="button" class="remove-time-surcharge inline-flex items-center p-3 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
            `;
            container.appendChild(newItem);
            
            // Add event listener to new remove button
            newItem.querySelector('.remove-time-surcharge').addEventListener('click', function() {
                container.removeChild(newItem);
            });
        });
        
        // Remove time surcharge
        document.querySelectorAll('.remove-time-surcharge').forEach(button => {
            button.addEventListener('click', function() {
                const item = this.closest('.time-surcharge-item');
                item.parentNode.removeChild(item);
            });
        });
        
        // Basic Price Form Submit
        document.getElementById('basic-price-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Reset error messages
            document.querySelectorAll('.invalid-feedback').forEach(el => el.classList.add('hidden'));
            
            // Get values
            const regularPrice = document.getElementById('regular_price').value;
            const weekendPrice = document.getElementById('weekend_price').value;
            const holidayPrice = document.getElementById('holiday_price').value;
            const newyearPrice = document.getElementById('newyear_price').value;
            
            // Validate
            let isValid = true;
            
            if (!regularPrice || regularPrice <= 0) {
                document.getElementById('regular_price_error').classList.remove('hidden');
                isValid = false;
            }
            
            if (!weekendPrice || weekendPrice <= 0) {
                document.getElementById('weekend_price_error').classList.remove('hidden');
                isValid = false;
            }
            
            if (!holidayPrice || holidayPrice <= 0) {
                document.getElementById('holiday_price_error').classList.remove('hidden');
                isValid = false;
            }
            
            if (!newyearPrice || newyearPrice <= 0) {
                document.getElementById('newyear_price_error').classList.remove('hidden');
                isValid = false;
            }
            
            if (isValid) {
                // In real app, we would submit data to server
                // For demo purposes, show success toast
                showSuccessToast('Cập nhật giá vé cơ bản thành công');
            }
        });
        
        // Surcharge Form Submit
        document.getElementById('surcharge-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Reset error messages
            document.querySelectorAll('.invalid-feedback').forEach(el => el.classList.add('hidden'));
            
            // Validate (simplified)
            let isValid = true;
            const surchargeInputs = ['surcharge_3d', 'surcharge_imax2d', 'surcharge_imax3d', 'surcharge_vip', 'surcharge_couple', 'surcharge_premium'];
            
            surchargeInputs.forEach(id => {
                const value = document.getElementById(id).value;
                if (value === '' || value < 0) {
                    document.getElementById(`${id}_error`).classList.remove('hidden');
                    isValid = false;
                }
            });
            
            // Check time surcharges
            const timeStarts = document.getElementsByName('time_start[]');
            const timeEnds = document.getElementsByName('time_end[]');
            const timeSurcharges = document.getElementsByName('time_surcharge[]');
            
            for (let i = 0; i < timeStarts.length; i++) {
                if (!timeStarts[i].value || !timeEnds[i].value || !timeSurcharges[i].value || timeSurcharges[i].value < 0) {
                    isValid = false;
                    // In a real app, we would add specific error messages for time surcharges
                }
            }
            
            if (isValid) {
                // In real app, we would submit data to server
                // For demo purposes, show success toast
                showSuccessToast('Cập nhật phụ thu thành công');
            }
        });
        
        // Success toast handling
        function showSuccessToast(message) {
            const toast = document.getElementById('success-toast');
            const toastMessage = document.getElementById('toast-message');
            
            toastMessage.textContent = message;
            toast.classList.remove('opacity-0', 'translate-y-full');
            toast.classList.add('opacity-100', 'translate-y-0');
            
            setTimeout(() => {
                hideToast();
            }, 5000);
        }
        
        function hideToast() {
            const toast = document.getElementById('success-toast');
            toast.classList.add('opacity-0', 'translate-y-full');
            toast.classList.remove('opacity-100', 'translate-y-0');
        }
        
        document.getElementById('close-toast').addEventListener('click', hideToast);
    });