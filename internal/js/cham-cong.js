document.addEventListener("DOMContentLoaded", function () {
    const API_URL = document.getElementById('registrationStatus').dataset.url + '/api';
        const video = document.getElementById('video');
        const canvas = document.getElementById('canvas');
        const loadingModal = document.getElementById('loadingModal');
        let stream = null;
    
        // Check registration status
        async function checkRegistrationStatus() {
            try {
                const response = await fetch(`${API_URL}/cham-cong/kiem-tra-dang-ky`);
                const result = await response.json();

                const statusContent = document.getElementById('statusContent');
                if (result.success) {
                    statusContent.innerHTML = `
                        <div class="text-center">
                            <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-2">
                                <svg class="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                </svg>
                            </div>
                            <p class="text-green-700 font-medium">Đã đăng ký khuôn mặt</p>
                            <p class="text-gray-600 text-sm mt-1">Ngày đăng ký: ${new Date(result.data.ngay_dang_ky).toLocaleDateString('vi-VN')}</p>
                        </div>
                    `;
                    document.getElementById('cameraSection').classList.remove('hidden');
                    startCamera();
                } else {
                    statusContent.innerHTML = `
                        <div class="text-center">
                            <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 mb-2">
                                <svg class="h-6 w-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                                </svg>
                            </div>
                            <p class="text-yellow-700 font-medium">Chưa đăng ký khuôn mặt</p>
                            <p class="text-gray-600 text-sm mt-1 mb-3">Bạn cần đăng ký khuôn mặt trước khi chấm công</p>
                            <a href="{{$_ENV['URL_INTERNAL_BASE']}}/dang-ky-khuon-mat" class="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                                Đăng ký ngay
                            </a>
                        </div>
                    `;
                }
            } catch (err) {
                console.error('Error checking registration:', err);
            }
        }

        // Start camera
        async function startCamera() {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { 
                        width: 640, 
                        height: 480,
                        facingMode: 'user'
                    } 
                });
                video.srcObject = stream;
            } catch (err) {
                alert('Không thể truy cập camera: ' + err.message);
            }
        }

        // Capture and recognize face
        async function captureAndRecognize(type) {
                // Use video native resolution for canvas but honor displayed mirroring
                    // Force capture size to 800x600 so uploaded images match desired dimensions
                    canvas.width = 800;
                    canvas.height = 600;
                const ctx = canvas.getContext('2d');
                // Detect if the video element is visually flipped via CSS (e.g. transform: scaleX(-1))
                let isFlipped = false;
                try {
                    const cs = window.getComputedStyle(video);
                    if (cs && cs.transform && (cs.transform.includes('-1') || cs.transform.includes('scaleX(-1)'))) {
                        isFlipped = true;
                    }
                } catch (e) {
                    // ignore
                }

                ctx.save();
                if (isFlipped) {
                    // flip horizontally so captured image matches what user sees on screen
                    ctx.translate(canvas.width, 0);
                    ctx.scale(-1, 1);
                }
                    // Draw the video frame scaled to 800x600
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                ctx.restore();
            
            loadingModal.classList.remove('hidden');

            try {
                // Convert canvas to blob (binary) and send as multipart/form-data to match registration
                const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
                if (!blob) throw new Error('Không thể tạo Blob từ canvas');

                const formData = new FormData();
                formData.append('image', blob, 'face.jpg');
                formData.append('loai', type);

                const response = await fetch(`${API_URL}/cham-cong/cham-cong`, {
                    method: 'POST',
                    body: formData // browser sets Content-Type multipart/form-data automatically
                });

                const result = await response.json();
                loadingModal.classList.add('hidden');

                if (result.success) {
                    showSuccessMessage(result);
                    loadHistory();
                } else {
                    alert('✗ ' + result.message);
                }
            } catch (err) {
                loadingModal.classList.add('hidden');
                alert('Lỗi: ' + err.message);
            }
        }

        // Show success message
        function showSuccessMessage(result) {
            const msg = result.data;
            let message = `✓ ${result.message}\n\n`;
            message += `Nhân viên: ${msg.ten}\n`;
            
            alert(message);
        }

        // Load attendance history
        // async function loadHistory() {
        //     try {
                
        //         const response = await fetch(`${API_URL}/cham-cong/lich-su?per_page=10`);
        //         const result = await response.json();

        //         const tbody = document.getElementById('historyTableBody');
        //         if (result.success && result.data.length > 0) {
        //             tbody.innerHTML = result.data.map(record => {
        //                 const gioVao = record.gio_vao ? new Date(record.gio_vao) : null;
        //                 const gioRa = record.gio_ra ? new Date(record.gio_ra) : null;
        //                 const soGio = gioVao && gioRa ? 
        //                     ((gioRa - gioVao) / 3600000).toFixed(2) : '-';
                        
        //                 const trangThai = record.trang_thai || 'Đúng giờ';
        //                 const badgeColor = {
        //                     'Đúng giờ': 'bg-green-100 text-green-800',
        //                     'Muộn': 'bg-red-100 text-red-800',
        //                     'Sớm': 'bg-blue-100 text-blue-800',
        //                     'Nghỉ': 'bg-gray-100 text-gray-800'
        //                 }[trangThai] || 'bg-gray-100 text-gray-800';

        //                 return `
        //                     <tr>
        //                         <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        //                             ${new Date(record.ngay_cham).toLocaleDateString('vi-VN')}
        //                         </td>
        //                         <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        //                             ${gioVao ? gioVao.toLocaleTimeString('vi-VN') : '-'}
        //                         </td>
        //                         <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        //                             ${gioRa ? gioRa.toLocaleTimeString('vi-VN') : '-'}
        //                         </td>
        //                         <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        //                             ${soGio}
        //                         </td>
        //                         <td class="px-6 py-4 whitespace-nowrap">
        //                             <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badgeColor}">
        //                                 ${trangThai}
        //                             </span>
        //                         </td>
        //                     </tr>
        //                 `;
        //             }).join('');
        //         } else {
        //             tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">Chưa có lịch sử chấm công</td></tr>';
        //         }
        //     } catch (err) {
        //         console.error('Error loading history:', err);
        //     }
        // }

        // Load attendance history by year and month
        async function loadHistory() {
            try {
                const response = await fetch(`${API_URL}/cham-cong/lich-su`);
                const result = await response.json();

                const tbody = document.getElementById('historyTableBody');
                if (result.success && result.data.length > 0) {
                    tbody.innerHTML = result.data.map(record => {
                        const ngayCham = record.ngay || record.ngay_cham;
                        const gioVao = record.gio_vao ? new Date(record.gio_vao) : null;
                        const gioRa = record.gio_ra ? new Date(record.gio_ra) : null;
                        const soGio = gioVao && gioRa ? ((gioRa - gioVao) / 3600000).toFixed(2) : '-';

                        const trangThai = record.trang_thai || 'Đúng giờ';
                        const badgeColor = {
                            'Đúng giờ': 'bg-green-100 text-green-800',
                            'Muộn': 'bg-red-100 text-red-800',
                            'Sớm': 'bg-blue-100 text-blue-800',
                            'Nghỉ': 'bg-gray-100 text-gray-800'
                        }[trangThai] || 'bg-gray-100 text-gray-800';

                        return `
                            <tr>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    ${ngayCham ? new Date(ngayCham).toLocaleDateString('vi-VN') : '-'}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    ${gioVao ? gioVao.toLocaleTimeString('vi-VN') : '-'}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    ${gioRa ? gioRa.toLocaleTimeString('vi-VN') : '-'}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    ${soGio}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badgeColor}">
                                        ${trangThai}
                                    </span>
                                </td>
                            </tr>
                        `;
                    }).join('');
                } else {
                    tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">Chưa có lịch sử chấm công</td></tr>';
                }
            } catch (err) {
                console.error('Error loading history:', err);
            }
        }

        // Event listeners
        document.getElementById('btnCheckin')?.addEventListener('click', () => captureAndRecognize('checkin'));
        document.getElementById('btnCheckout')?.addEventListener('click', () => captureAndRecognize('checkout'));
        document.getElementById('btnRefresh')?.addEventListener('click', loadHistory);

        // Initialize
        checkRegistrationStatus();
        loadHistory();

        // Cleanup
        window.addEventListener('beforeunload', () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        });
});