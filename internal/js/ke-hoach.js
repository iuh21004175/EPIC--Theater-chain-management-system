// Các hàm tiện ích cho định dạng ngày tháng
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDateDisplay(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function parseDateFromAPI(dateString) {
    // Parse YYYY-MM-DD date format from API
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
}

function getDayName(date) {
    const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
    return days[date.getDay()];
}

// Thêm import Spinner từ file util/spinner.js
import Spinner from './util/spinner.js';

// Biến toàn cục
let keHoachData = [];
let moviesData = [];
let roomsData = [];
let currentPlanWeekStart = null;
let showtimeCounter = 1; // Đếm số suất chiếu trong modal
let currentSelectedDate = null; // Thêm biến toàn cục để lưu ngày đã chọn hiện tại
let weekOffset = 1; // 0 = tuần hiện tại, 1 = tuần kế tiếp, 2 = tuần kế tiếp + 1, -1 = tuần trước

document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo khi chuyển sang tab Kế hoạch
    const tabBtnKehoach = document.getElementById('tab-btn-kehoach');
    if (tabBtnKehoach) {
        tabBtnKehoach.addEventListener('click', function() {
            initializeKeHoachTab();
        });
    }
});

function initializeKeHoachTab() {
    // Khởi tạo event listeners và load dữ liệu
    setupKeHoachEventListeners();
    calculateNextWeek();
    loadMovies();
    loadRooms();
    loadKeHoach();
}

function setupKeHoachEventListeners() {
    const btnCreateNewPlan = document.getElementById('btn-create-new-plan');
    const btnAddShowtimeToPlan = document.getElementById('btn-add-showtime-to-plan');
    const btnClosePlanModal = document.getElementById('btn-close-plan-modal');
    const btnCancelPlan = document.getElementById('btn-cancel-plan');
    const btnAddAnotherShowtime = document.getElementById('btn-add-another-showtime');
    const btnSaveAllShowtimes = document.getElementById('btn-save-all-showtimes');
    const btnCancelPlanDelete = document.getElementById('btn-cancel-plan-delete');
    const btnPrevWeek = document.getElementById('btn-prev-week');
    const btnNextWeek = document.getElementById('btn-next-week');

    if (btnCreateNewPlan) {
        btnCreateNewPlan.addEventListener('click', openPlanModal);
    }
    if (btnAddShowtimeToPlan) {
        btnAddShowtimeToPlan.addEventListener('click', openPlanModal);
    }
    if (btnClosePlanModal) {
        btnClosePlanModal.addEventListener('click', closePlanModal);
    }
    if (btnCancelPlan) {
        btnCancelPlan.addEventListener('click', closePlanModal);
    }
    if (btnAddAnotherShowtime) {
        btnAddAnotherShowtime.addEventListener('click', addAnotherShowtime);
    }
    if (btnSaveAllShowtimes) {
        btnSaveAllShowtimes.addEventListener('click', handleSaveAllShowtimes);
    }
    if (btnCancelPlanDelete) {
        btnCancelPlanDelete.addEventListener('click', () => {
            document.getElementById('plan-confirm-modal').classList.add('hidden');
        });
    }
    if (btnPrevWeek) {
        btnPrevWeek.addEventListener('click', prevWeek);
    }
    if (btnNextWeek) {
        btnNextWeek.addEventListener('click', nextWeek);
    }
}

function calculateNextWeek() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = CN, 1 = T2, ..., 6 = T7
    
    // Tính thứ 2 của tuần HIỆN TẠI (không phải tuần sau)
    // Nếu hôm nay là CN (0) thì lùi 6 ngày, nếu T2 (1) thì lùi 0 ngày, T3 (2) lùi 1 ngày...
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    const currentWeekMonday = new Date(today);
    currentWeekMonday.setDate(today.getDate() - daysFromMonday);
    currentWeekMonday.setHours(0, 0, 0, 0);
    
    // Thêm weekOffset * 7 ngày để di chuyển giữa các tuần
    const targetMonday = new Date(currentWeekMonday);
    targetMonday.setDate(currentWeekMonday.getDate() + (weekOffset * 7));
    
    const targetSunday = new Date(targetMonday);
    targetSunday.setDate(targetMonday.getDate() + 6);
    
    currentPlanWeekStart = targetMonday;
    
    const weekRangeEl = document.getElementById('plan-week-range');
    if (weekRangeEl) {
        weekRangeEl.textContent = `${formatDateDisplay(targetMonday)} - ${formatDateDisplay(targetSunday)}`;
    }
    
    // Cập nhật label tuần nếu không phải tuần kế tiếp
    updateWeekOffsetLabel();
}

function prevWeek() {
    weekOffset--;
    calculateNextWeek();
    loadKeHoach();
}

function nextWeek() {
    weekOffset++;
    calculateNextWeek();
    loadKeHoach();
}

function updateWeekOffsetLabel() {
    const weekOffsetLabel = document.getElementById('week-offset-label');
    if (!weekOffsetLabel) return;
    
    if (weekOffset === 0) {
        weekOffsetLabel.textContent = "Tuần hiện tại";
        weekOffsetLabel.classList.remove('hidden');
    } else if (weekOffset === 1) {
        weekOffsetLabel.textContent = "Tuần kế tiếp";
        weekOffsetLabel.classList.remove('hidden');
    } else if (weekOffset > 1) {
        weekOffsetLabel.textContent = `Tuần kế tiếp + ${weekOffset - 1}`;
        weekOffsetLabel.classList.remove('hidden');
    } else if (weekOffset < 0) {
        weekOffsetLabel.textContent = `Tuần trước ${Math.abs(weekOffset)}`;
        weekOffsetLabel.classList.remove('hidden');
    }
}

function loadMovies() {
    const planListing = document.getElementById('plan-listing');
    const baseUrl = planListing.dataset.url || '';
    fetch(`${baseUrl}/api/phim`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                moviesData = data.data || [];
                console.log('Loaded movies:', moviesData.length);
            } else {
                console.error('Failed to load movies:', data.message);
                moviesData = [];
            }
        })
        .catch(error => {
            console.error('Error loading movies:', error);
            moviesData = [];
        });
}

function loadRooms() {
    const planListing = document.getElementById('plan-listing');
    const baseUrl = planListing?.dataset?.url || '';
    
    fetch(`${baseUrl}/api/phong-chieu`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                roomsData = data.data || [];
                console.log('Loaded rooms:', roomsData.length);
            } else {
                console.error('Failed to load rooms:', data.message);
                roomsData = [];
            }
        })
        .catch(error => {
            console.error('Error loading rooms:', error);
            roomsData = [];
        });
}

function loadKeHoach() {
    const planListing = document.getElementById('plan-listing');
    if (!planListing || !currentPlanWeekStart) return;

    const baseUrl = planListing.dataset.url || '';
    const weekEnd = new Date(currentPlanWeekStart);
    weekEnd.setDate(currentPlanWeekStart.getDate() + 6);
    
    const batDau = formatDate(currentPlanWeekStart);
    const ketThuc = formatDate(weekEnd);

    // Hiển thị spinner
    try {
        Spinner.show({ target: planListing, text: 'Đang tải kế hoạch...' });
    } catch (e) {
        console.log('Spinner not available');
        planListing.innerHTML = '<div class="text-center py-8">Đang tải...</div>';
    }

    fetch(`${baseUrl}/api/ke-hoach-suat-chieu?batdau=${batDau}&ketthuc=${ketThuc}`)
        .then(res => res.json())
        .then(data => {
            try {
                Spinner.hide();
            } catch (e) {
                console.log('Spinner not available');
            }
            
            if (data.success) {
                // API bây giờ trả về trực tiếp mảng chi tiết suất chiếu (không còn nested trong ke_hoach_chi_tiet)
                keHoachData = [];
                if (data.data && data.data.length > 0) {
                    data.data.forEach(chiTiet => {
                        keHoachData.push({
                            id: chiTiet.id,
                            id_kehoach: chiTiet.id_kehoach,
                            id_phim: chiTiet.id_phim,
                            ten_phim: chiTiet.phim?.ten_phim || 'Không rõ',
                            id_phong_chieu: chiTiet.id_phongchieu,
                            ten_phong: chiTiet.phong_chieu?.ten || 'Không rõ',
                            gio_bat_dau: chiTiet.batdau.substring(11, 16),
                            gio_ket_thuc: chiTiet.ketthuc.substring(11, 16),
                            ngay_chieu: chiTiet.batdau.substring(0, 10),
                            ghi_chu: chiTiet.ghi_chu || '',
                            tinh_trang: chiTiet.tinh_trang || 0,
                            // Giữ lại reference đến phim để có thể lấy poster
                            phim: chiTiet.phim,
                            phong_chieu: chiTiet.phong_chieu
                        });
                    });
                }
                
                renderKeHoach();
                console.log('Loaded plans:', keHoachData.length);
            } else {
                console.error('Failed to load plans:', data.message);
                keHoachData = [];
                renderKeHoach();
            }
        })
        .catch(error => {
            try {
                Spinner.hide();
            } catch (e) {
                console.log('Spinner not available');
            }
            console.error('Error loading plans:', error);
            keHoachData = [];
            renderKeHoach();
        });
}function renderKeHoach() {
    const emptyState = document.getElementById('empty-state');
    const planContent = document.getElementById('plan-content');
    const planStatusBadge = document.getElementById('plan-status-badge');
    const totalShowtimesBadge = document.getElementById('total-showtimes-badge');
    const showtimesByDay = document.getElementById('showtimes-by-day');
    
    if (!emptyState || !planContent) return;

    // Cập nhật status badge
    if (planStatusBadge) {
        if (keHoachData.length === 0) {
            planStatusBadge.className = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-700';
            planStatusBadge.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Chưa có kế hoạch
            `;
        } else {
            planStatusBadge.className = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800';
            planStatusBadge.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Chưa hoàn thành
            `;
        }
    }

    // Cập nhật badge tổng số suất chiếu NGAY khi render (cho cả empty state)
    if (totalShowtimesBadge) {
        totalShowtimesBadge.textContent = `${keHoachData.length} suất chiếu`;
    }

    if (keHoachData.length === 0) {
        emptyState.classList.remove('hidden');
        planContent.classList.add('hidden');
        
        // ⚠️ LOGIC ĐÚNG:
        // weekOffset > 0 → Các tuần tương lai → CHO PHÉP TẠO
        // weekOffset <= 0  → Tuần hiện tại/trước → CHỈ XEM
        if (weekOffset <= 0) {
            // Tuần hiện tại hoặc tuần trước: CHỈ XEM, KHÔNG TẠO
            emptyState.innerHTML = `
                <div class="text-center py-16">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <h3 class="text-xl font-semibold text-gray-700 mb-2">Chưa có kế hoạch cho tuần này</h3>
                    <p class="text-gray-500 mb-4">Không thể tạo kế hoạch cho ${weekOffset === 0 ? 'tuần hiện tại' : 'tuần đã qua'}</p>
                    <button disabled class="px-6 py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed inline-flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                        </svg>
                        Chỉ xem (${weekOffset === 0 ? 'Tuần hiện tại' : 'Tuần trước'})
                    </button>
                </div>
            `;
        } else {
            // Các tuần tương lai: CHO PHÉP TẠO
            emptyState.innerHTML = `
                <div class="text-center py-16">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 class="text-xl font-semibold text-gray-700 mb-2">Chưa có kế hoạch cho tuần này</h3>
                    <p class="text-gray-500 mb-4">Tạo kế hoạch mới để bắt đầu lên lịch chiếu phim</p>
                    <button id="btn-create-new-plan" class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition inline-flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                        </svg>
                        Tạo kế hoạch tuần mới
                    </button>
                </div>
            `;
            
            // Gắn event listener cho nút vừa tạo
            setTimeout(() => {
                const btnCreateNewPlan = document.getElementById('btn-create-new-plan');
                if (btnCreateNewPlan) {
                    btnCreateNewPlan.addEventListener('click', openPlanModal);
                }
            }, 0);
        }
        return;
    }
    
    // Hiển thị plan content khi có dữ liệu
    emptyState.classList.add('hidden');
    planContent.classList.remove('hidden');
    
    // Cập nhật badge tổng số suất chiếu (cả khi có data)
    if (totalShowtimesBadge) {
        totalShowtimesBadge.textContent = `${keHoachData.length} suất chiếu`;
    }

    // Nhóm theo ngày
    const groupedByDate = {};
    keHoachData.forEach(plan => {
        const dateKey = plan.ngay_chieu;
        if (!groupedByDate[dateKey]) {
            groupedByDate[dateKey] = [];
        }
        groupedByDate[dateKey].push(plan);
    });

    let html = '';
    const planListing = document.getElementById('plan-listing');
    const urlMinio = planListing?.dataset?.urlminio || '';

    Object.keys(groupedByDate).sort().forEach(dateKey => {
        const plans = groupedByDate[dateKey];
        const dateObj = parseDateFromAPI(dateKey);
        const dayName = getDayName(dateObj);
        
        html += `
            <div class="border rounded-lg p-4 bg-gradient-to-r from-gray-50 to-blue-50">
                <h3 class="font-bold text-lg mb-3 text-gray-800 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                    </svg>
                    ${dayName}, ${formatDateDisplay(dateObj)}
                </h3>
                <div class="space-y-2">
        `;

        plans.forEach(plan => {
          console.log('Rendering plan:', plan);
            // Lấy poster từ cấu trúc dữ liệu API
            // ⚠️ LOGIC ĐÚNG: Chỉ cho phép xóa nếu weekOffset > 0 (các tuần tương lai) VÀ chưa duyệt (tinh_trang != 1)
            const canDelete = weekOffset > 0 && plan.tinh_trang != 1;
            
            // Xác định trạng thái
            let statusBadge = '';
            if (plan.tinh_trang == 0) {
                statusBadge = '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Chờ duyệt</span>';
            } else if (plan.tinh_trang == 1) {
                statusBadge = '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Đã duyệt</span>';
            } else if (plan.tinh_trang == 2) {
                statusBadge = '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Từ chối</span>';
            }
            
            html += `
                <div class="flex items-center p-3 bg-white rounded-md border border-gray-200 hover:shadow-md transition">
                    <img src="${urlMinio}/${plan.phim.poster_url}" alt="${plan.ten_phim}" class="w-12 h-16 object-cover rounded mr-3" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27100%27 height=%27100%27%3E%3Crect fill=%27%23e2e8f0%27 width=%27100%27 height=%27100%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 dominant-baseline=%27middle%27 text-anchor=%27middle%27 font-size=%2740%27%3E🎬%3C/text%3E%3C/svg%3E'">
                    <div class="flex-1">
                        <div class="flex items-center gap-2">
                            <h4 class="font-medium text-gray-900">${plan.ten_phim}</h4>
                            ${statusBadge}
                        </div>
                        <p class="text-sm text-gray-600">
                            <span class="font-medium text-blue-600">${plan.ten_phong}</span> · 
                            ${plan.gio_bat_dau}
                        </p>
                    </div>
                    ${canDelete ? `
                        <button class="btn-delete-plan text-red-600 hover:text-red-700 p-2" data-plan-id="${plan.id}" title="Xóa suất chiếu">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                            </svg>
                        </button>
                    ` : `
                        <div class="p-2 text-gray-400" title="${plan.tinh_trang == 1 ? 'Không thể xóa suất chiếu đã duyệt' : 'Không thể xóa suất chiếu của tuần hiện tại hoặc đã qua'}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                            </svg>
                        </div>
                    `}
                </div>
            `;
        });

        html += '</div></div>';
    });

    if (showtimesByDay) {
        showtimesByDay.innerHTML = html;
    }
    
    // Re-attach event listeners - XÓA setTimeout để event gắn ngay lập tức
    const btnAddShowtimeToPlan = document.getElementById('btn-add-showtime-to-plan');
    if (btnAddShowtimeToPlan && !btnAddShowtimeToPlan.hasAttribute('data-listener')) {
        // ⚠️ LOGIC ĐÚNG:
        // weekOffset > 0 → Các tuần tương lai → CHO PHÉP THÊM
        // weekOffset <= 0  → Tuần hiện tại/trước → CHỈ XEM
        if (weekOffset <= 0) {
            // Tuần hiện tại hoặc tuần trước: CHỈ XEM, KHÔNG THÊM
            btnAddShowtimeToPlan.disabled = true;
            btnAddShowtimeToPlan.classList.remove('bg-blue-600', 'hover:bg-blue-700');
            btnAddShowtimeToPlan.classList.add('bg-gray-400', 'cursor-not-allowed', 'opacity-60');
            btnAddShowtimeToPlan.title = 'Không thể thêm suất chiếu cho tuần hiện tại hoặc đã qua';
            
            // Thay đổi icon và text
            btnAddShowtimeToPlan.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                </svg>
                Chỉ xem
            `;
        } else {
            // Tuần kế tiếp trở đi: CHO PHÉP THÊM
            btnAddShowtimeToPlan.disabled = false;
            btnAddShowtimeToPlan.classList.remove('bg-gray-400', 'cursor-not-allowed', 'opacity-60');
            btnAddShowtimeToPlan.classList.add('bg-blue-600', 'hover:bg-blue-700');
            btnAddShowtimeToPlan.title = 'Thêm suất chiếu mới vào kế hoạch';
            
            btnAddShowtimeToPlan.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M15.232 5.232a2.5 2.5 0 00-3.535 0l-6.25 6.25a1 1 0 00-.263.465l-1 3.5a1 1 0 001.263 1.263l3.5-1a1 1 0 00.465-.263l6.25-6.25a2.5 2.5 0 000-3.535zm-2.121 1.414l2.121 2.121-6.25 6.25-2.121-2.121 6.25-6.25z" clip-rule="evenodd" />
              </svg>
              Chỉnh sửa kế hoạch
            `;
            
            btnAddShowtimeToPlan.addEventListener('click', openPlanModal);
        }
        btnAddShowtimeToPlan.setAttribute('data-listener', 'true');
    }
    
    // ✅ Event delegation HIỆU QUẢ: Gắn 1 listener duy nhất trên container cha
    if (showtimesByDay) {
        // Xóa listener cũ nếu có (tránh duplicate)
        const oldListener = showtimesByDay._deleteListener;
        if (oldListener) {
            showtimesByDay.removeEventListener('click', oldListener);
        }
        
        // Tạo listener mới
        const deleteListener = function(e) {
            const deleteBtn = e.target.closest('.btn-delete-plan');
            if (deleteBtn) {
                e.preventDefault();
                e.stopPropagation();
                const planId = deleteBtn.getAttribute('data-plan-id');
                console.log('🗑️ Delete button clicked, plan ID:', planId);
                deletePlan(planId);
            }
        };
        
        // Gắn listener mới
        showtimesByDay.addEventListener('click', deleteListener);
        // Lưu reference để xóa sau này
        showtimesByDay._deleteListener = deleteListener;
    }
}

function openPlanModal() {
    const planModal = document.getElementById('plan-modal');

    if (planModal) {
        planModal.classList.remove('hidden');
    }

    // Reset counter và danh sách suất
    showtimeCounter = 1;

    // Render day selector và chọn Thứ 2 mặc định
    renderDaySelector();
}

function closePlanModal() {
    const planModal = document.getElementById('plan-modal');
    if (planModal) {
        planModal.classList.add('hidden');
    }
    
    // Xóa cache suggested times khi đóng modal
    for (let key in suggestedTimesCache) {
        delete suggestedTimesCache[key];
    }
}

function deletePlan(idKeHoachChiTiet) {
    console.log('🗑️ [deletePlan] Called with ID:', idKeHoachChiTiet);
    
    // Show confirmation modal
    const confirmModal = document.getElementById('plan-confirm-modal');
    if (!confirmModal) {
        console.error('❌ Modal #plan-confirm-modal not found!');
        return;
    }

    // Show modal
    confirmModal.classList.remove('hidden');
    console.log('✅ Modal shown');

    // Get buttons (they already exist in HTML)
    const btnCancel = document.getElementById('btn-cancel-plan-delete');
    const btnConfirm = document.getElementById('btn-confirm-plan-delete');
    
    if (!btnCancel || !btnConfirm) {
        console.error('❌ Buttons not found!', { btnCancel, btnConfirm });
        return;
    }

    // Remove old event listeners by cloning (prevents duplicate listeners)
    const newBtnCancel = btnCancel.cloneNode(true);
    const newBtnConfirm = btnConfirm.cloneNode(true);
    btnCancel.parentNode.replaceChild(newBtnCancel, btnCancel);
    btnConfirm.parentNode.replaceChild(newBtnConfirm, btnConfirm);

    // Handle cancel
    newBtnCancel.addEventListener('click', () => {
        console.log('🚫 Delete cancelled');
        confirmModal.classList.add('hidden');
    });

    // Handle confirm delete
    newBtnConfirm.addEventListener('click', async () => {
        console.log('✅ Delete confirmed, calling API...');
        confirmModal.classList.add('hidden');
        
        try {
            Spinner.show({ text: 'Đang xóa...' });
        } catch (e) {
            console.log('Spinner not available');
        }

        try {
            const planListing = document.getElementById('plan-listing');
            const baseUrl = planListing?.dataset?.url || '';
            const apiUrl = `${baseUrl}/api/ke-hoach-suat-chieu/${idKeHoachChiTiet}`;
            
            console.log('🌐 Calling DELETE API:', apiUrl);
            
            const response = await fetch(apiUrl, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('📡 API Response status:', response.status);
            const result = await response.json();
            console.log('📦 API Result:', result);

            if (result.success) {
                showSuccess('Đã xóa suất chiếu khỏi kế hoạch');
                // Reload the plan to reflect changes
                await loadKeHoach();
            } else {
                showError(result.message || 'Có lỗi xảy ra khi xóa suất chiếu');
            }
        } catch (error) {
            console.error('❌ Error deleting showtime from plan:', error);
            showError('Không thể kết nối đến máy chủ: ' + error.message);
        } finally {
            try {
                Spinner.hide();
            } catch (e) {
                console.log('Spinner not available');
            }
        }
    });
}

function createShowtimeItem(index) {
    return `
        <div class="showtime-item border rounded-lg p-4 bg-gray-50" data-index="${index}" data-id="" data-status="0">
            <div class="flex justify-between items-center mb-3">
                <h3 class="font-semibold text-gray-900 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                    Suất chiếu #<span class="showtime-number">${index + 1}</span>
                    <span class="showtime-status-badge ml-2 text-xs px-2 py-0.5 rounded-full hidden" data-index="${index}"></span>
                </h3>
                <button type="button" class="btn-remove-showtime text-red-600 hover:text-red-700 ${index === 0 ? 'hidden' : ''}" data-index="${index}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- Chọn phim -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Phim <span class="text-red-500">*</span>
                    </label>
                    <div class="relative">
                        <input 
                            type="text" 
                            class="plan-movie-search w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="Tìm phim..."
                            autocomplete="off"
                            data-index="${index}"
                        >
                        <input type="hidden" class="plan-selected-movie-id" data-index="${index}">
                        <div class="plan-movie-results absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto hidden" data-index="${index}"></div>
                    </div>
                    <div class="plan-selected-movie-info mt-2 hidden" data-index="${index}">
                        <div class="flex items-center p-2 bg-blue-50 rounded-md border border-blue-200">
                            <img class="plan-movie-poster w-8 h-10 object-cover rounded mr-2" src="" alt="">
                            <div>
                                <h4 class="plan-movie-title text-xs font-medium text-gray-900"></h4>
                                <p class="plan-movie-duration text-xs text-gray-600"></p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Chọn phòng -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Phòng chiếu <span class="text-red-500">*</span>
                    </label>
                    <select class="plan-room-select w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm" data-index="${index}">
                        <option value="">-- Chọn phòng --</option>
                        ${roomsData.map(room => `<option value="${room.id}">${room.ten}</option>`).join('')}
                    </select>
                </div>

                <!-- Chọn giờ -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Giờ bắt đầu <span class="text-red-500">*</span>
                    </label>
                    <input 
                        type="text" 
                        class="plan-start-time w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="HH:mm"
                        data-index="${index}" 
                        readonly
                    >
                    <p class="text-xs text-gray-500 mt-1">
                        Kết thúc: <span class="plan-end-time text-blue-600 font-medium" data-index="${index}">--:--</span>
                    </p>
                </div>
            </div>
            
            <!-- Khung giờ gợi ý -->
            <div class="mt-4 plan-suggested-times-container hidden" data-index="${index}">
                <label class="block text-sm font-medium text-gray-700 mb-2">Khung giờ gợi ý</label>
                <div class="plan-suggested-times grid grid-cols-6 gap-2" data-index="${index}">
                    <!-- Thời gian gợi ý sẽ được render ở đây -->
                </div>
            </div>
        </div>
    `;
}

function initializeShowtimeItem(index) {
    // Khởi tạo movie search
    const movieSearch = document.querySelector(`.plan-movie-search[data-index="${index}"]`);
    if (movieSearch) {
        movieSearch.addEventListener('input', (e) => handleMovieSearch(e, index));
    }

    // Khởi tạo room select - XÓA TẤT CẢ CACHE khi thay đổi phòng
    const roomSelect = document.querySelector(`.plan-room-select[data-index="${index}"]`);
    if (roomSelect) {
        roomSelect.addEventListener('change', () => {
            // Xóa TOÀN BỘ cache để đảm bảo load lại với dữ liệu mới nhất
            for (let key in suggestedTimesCache) {
                delete suggestedTimesCache[key];
            }
            console.log('✨ [Room Changed] Cleared ALL cache, will reload with latest modal data');
            
            // Load suggested times với dữ liệu mới
            loadSuggestedTimesForPlan(index);
        });
    }

    // Khởi tạo nút xóa
    const removeBtn = document.querySelector(`.btn-remove-showtime[data-index="${index}"]`);
    if (removeBtn) {
        removeBtn.addEventListener('click', () => removeShowtime(index));
    }
}

function addAnotherShowtime() {
    const showtimesList = document.getElementById('showtimes-list');
    if (!showtimesList) return;

    // Kiểm tra tất cả suất hiện tại đã chọn giờ bắt đầu chưa
    const showtimeItems = document.querySelectorAll('.showtime-item');
    for (let item of showtimeItems) {
        const index = item.dataset.index;
        const startTimeInput = document.querySelector(`.plan-start-time[data-index="${index}"]`);
        
        if (!startTimeInput || !startTimeInput.value) {
            showError('Vui lòng chọn giờ bắt đầu cho tất cả suất chiếu trước khi thêm suất mới');
            return;
        }
    }

    const newIndex = showtimeCounter++;
    const newItem = createShowtimeItem(newIndex);
    showtimesList.insertAdjacentHTML('beforeend', newItem);
    
    initializeShowtimeItem(newIndex);
    updateTotalShowtimesCount();
    updateShowtimeNumbers();
}

function removeShowtime(index) {
    const showtimeItem = document.querySelector(`.showtime-item[data-index="${index}"]`);
    if (showtimeItem) {
        showtimeItem.remove();
        updateTotalShowtimesCount();
        updateShowtimeNumbers();
    }
}

function updateShowtimeNumbers() {
    const showtimeItems = document.querySelectorAll('.showtime-item');
    showtimeItems.forEach((item, idx) => {
        const numberSpan = item.querySelector('.showtime-number');
        if (numberSpan) {
            numberSpan.textContent = idx + 1;
        }
        
        // Hiện/ẩn nút xóa (không cho xóa nếu chỉ còn 1)
        const removeBtn = item.querySelector('.btn-remove-showtime');
        if (removeBtn) {
            if (showtimeItems.length === 1) {
                removeBtn.classList.add('hidden');
            } else {
                removeBtn.classList.remove('hidden');
            }
        }
    });
}

function updateTotalShowtimesCount() {
    const totalCount = document.getElementById('total-showtimes-count');
    const count = document.querySelectorAll('.showtime-item').length;
    if (totalCount) {
        totalCount.textContent = count;
    }
}

function renderDaySelector() {
    const daySelector = document.getElementById('plan-day-selector');
    if (!daySelector || !currentPlanWeekStart) return;

    daySelector.innerHTML = '';
    const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(currentPlanWeekStart);
        date.setDate(currentPlanWeekStart.getDate() + i);
        const dateStr = formatDate(date);
        
        const dayBtn = document.createElement('button');
        dayBtn.type = 'button';
        dayBtn.className = `plan-day-btn px-3 py-2 border rounded-md text-sm hover:bg-gray-100 transition ${i === 0 ? 'bg-green-600 text-white border-green-600' : ''}`;
        dayBtn.dataset.date = dateStr;
        dayBtn.innerHTML = `
            <div class="font-medium">${days[i]}</div>
            <div class="text-xs ${i === 0 ? 'text-green-100' : 'text-gray-500'}">${date.getDate()}/${date.getMonth() + 1}</div>
        `;
        
        dayBtn.addEventListener('click', function() {
            document.querySelectorAll('.plan-day-btn').forEach(btn => {
                btn.classList.remove('bg-green-600', 'text-white', 'border-green-600');
                btn.querySelector('.text-xs').classList.remove('text-green-100');
                btn.querySelector('.text-xs').classList.add('text-gray-500');
            });
            
            this.classList.add('bg-green-600', 'text-white', 'border-green-600');
            this.querySelector('.text-xs').classList.remove('text-gray-500');
            this.querySelector('.text-xs').classList.add('text-green-100');
            
            // Lưu ngày đã chọn và tải danh sách suất chiếu
            currentSelectedDate = dateStr;
            loadShowtimesByDate(dateStr);
        });
        
        daySelector.appendChild(dayBtn);
    }
    
    // Đặt ngày mặc định là thứ 2
    if (currentPlanWeekStart) {
        currentSelectedDate = formatDate(currentPlanWeekStart);
        loadShowtimesByDate(currentSelectedDate);
    }
}

// Hàm tải danh sách suất chiếu theo ngày
function loadShowtimesByDate(dateStr) {
    // Lấy danh sách suất chiếu đã có cho ngày này từ kế hoạch
    const showtimesForDate = keHoachData.filter(plan => plan.ngay_chieu === dateStr);
    const showtimesList = document.getElementById('showtimes-list');
    
    // Reset danh sách
    showtimeCounter = 1;
    if (showtimesList) {
        if (showtimesForDate.length === 0) {
            // Nếu không có suất chiếu nào, hiện một form trống
            showtimesList.innerHTML = createShowtimeItem(0);
            initializeShowtimeItem(0);
        } else {
            // Nếu có suất chiếu, hiện tất cả cho ngày đó
            showtimesList.innerHTML = '';
            showtimesForDate.forEach((showtime, index) => {
                showtimesList.insertAdjacentHTML('beforeend', createShowtimeItem(index));
                initializeShowtimeItem(index);
                
                // Lưu ID và trạng thái của suất chiếu cũ
                const showtimeItem = document.querySelector(`.showtime-item[data-index="${index}"]`);
                if (showtimeItem && showtime.id) {
                    showtimeItem.setAttribute('data-id', showtime.id);
                    showtimeItem.setAttribute('data-status', showtime.tinh_trang || 0);
                }
                
                // Điền thông tin suất chiếu vào form
                setTimeout(() => {
                    selectMovie(showtime.id_phim, index);
                    
                    const roomSelect = document.querySelector(`.plan-room-select[data-index="${index}"]`);
                    if (roomSelect) roomSelect.value = showtime.id_phong_chieu;
                    
                    const startTimeInput = document.querySelector(`.plan-start-time[data-index="${index}"]`);
                    if (startTimeInput) {
                        startTimeInput.value = showtime.gio_bat_dau.substring(0, 5);
                        calculateEndTime(index);
                    }
                    
                    const noteInput = document.querySelector(`.plan-note[data-index="${index}"]`);
                    if (noteInput && showtime.ghi_chu) noteInput.value = showtime.ghi_chu;
                    
                    // Hiển thị badge trạng thái và disable input nếu đã duyệt
                    const tinhTrang = showtime.tinh_trang || 0;
                    const statusBadge = document.querySelector(`.showtime-status-badge[data-index="${index}"]`);
                    const movieSearchInput = document.querySelector(`.plan-movie-search[data-index="${index}"]`);
                    const removeBtn = document.querySelector(`.btn-remove-showtime[data-index="${index}"]`);
                    
                    if (tinhTrang == 1) {
                        // Đã duyệt - disable tất cả input
                        if (statusBadge) {
                            statusBadge.textContent = 'Đã duyệt';
                            statusBadge.className = 'showtime-status-badge ml-2 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800';
                            statusBadge.classList.remove('hidden');
                        }
                        if (movieSearchInput) movieSearchInput.disabled = true;
                        if (roomSelect) roomSelect.disabled = true;
                        if (startTimeInput) startTimeInput.disabled = true;
                        if (removeBtn) removeBtn.classList.add('hidden');
                        
                        // Thêm visual cue
                        if (showtimeItem) {
                            showtimeItem.classList.remove('bg-gray-50');
                            showtimeItem.classList.add('bg-green-50', 'border-green-200');
                        }
                    } else if (tinhTrang == 2) {
                        // Từ chối
                        if (statusBadge) {
                            statusBadge.textContent = 'Từ chối';
                            statusBadge.className = 'showtime-status-badge ml-2 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800';
                            statusBadge.classList.remove('hidden');
                        }
                        // Vẫn cho phép chỉnh sửa suất bị từ chối, hiển thị khung giờ gợi ý
                        loadSuggestedTimesForPlan(index);
                    } else {
                        // Chờ duyệt - cho phép chỉnh sửa, hiển thị khung giờ gợi ý
                        if (statusBadge) {
                            statusBadge.textContent = 'Chờ duyệt';
                            statusBadge.className = 'showtime-status-badge ml-2 text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800';
                            statusBadge.classList.remove('hidden');
                        }
                        loadSuggestedTimesForPlan(index);
                    }
                    
                    showtimeCounter++;
                }, 100);
            });
        }
        updateTotalShowtimesCount();
        updateShowtimeNumbers();
    }
    
    // Hiển thị ngày đã chọn trong header modal
    const selectedDate = new Date(dateStr);
    const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
    const dayName = dayNames[selectedDate.getDay()];
    
    const modalHeader = document.querySelector('#plan-modal h2');
    if (modalHeader) {
        modalHeader.innerHTML = `Thêm suất chiếu cho <span class="text-blue-100">${dayName}, ${formatDateDisplay(selectedDate)}</span>`;
    }
}

// Các hàm tiện ích (cần thêm nếu chưa có)
function handleMovieSearch(e, index) {
    const searchText = e.target.value.trim().toLowerCase();
    const resultsContainer = document.querySelector(`.plan-movie-results[data-index="${index}"]`);
    
    if (!resultsContainer) return;
    
    if (searchText.length < 2) {
        resultsContainer.classList.add('hidden');
        return;
    }
    
    const filteredMovies = moviesData.filter(movie => 
        movie.ten_phim.toLowerCase().includes(searchText)
    );
    
    if (filteredMovies.length === 0) {
        resultsContainer.innerHTML = '<div class="p-3 text-gray-500 text-center">Không tìm thấy phim</div>';
    } else {
        const planListing = document.getElementById('plan-listing');
        const urlMinio = planListing?.dataset?.urlminio || '';
        
        resultsContainer.innerHTML = filteredMovies.map(movie => `
            <div class="p-2 hover:bg-gray-100 cursor-pointer flex items-center movie-result" data-movie-id="${movie.id}" data-index="${index}">
                <img src="${urlMinio}/${movie.poster_url}" alt="${movie.ten_phim}" class="w-8 h-10 object-cover rounded mr-2">
                <div>
                    <div class="text-sm font-medium">${movie.ten_phim}</div>
                    <div class="text-xs text-gray-500">${movie.thoi_luong} phút</div>
                </div>
            </div>
        `).join('');
        
        // Thêm event listeners cho các kết quả
        document.querySelectorAll(`.movie-result[data-index="${index}"]`).forEach(item => {
            item.addEventListener('click', () => {
                const movieId = item.dataset.movieId;
                selectMovie(movieId, index);
                resultsContainer.classList.add('hidden');
            });
        });
    }
    
    resultsContainer.classList.remove('hidden');
}

function selectMovie(movieId, index) {
    const movie = moviesData.find(m => m.id == movieId);
    if (!movie) return;
    
    const planListing = document.getElementById('plan-listing');
    const urlMinio = planListing?.dataset?.urlminio || '';
    
    // Cập nhật input tìm kiếm
    const searchInput = document.querySelector(`.plan-movie-search[data-index="${index}"]`);
    if (searchInput) searchInput.value = movie.ten_phim;
    
    // Cập nhật hidden input
    const hiddenInput = document.querySelector(`.plan-selected-movie-id[data-index="${index}"]`);
    if (hiddenInput) hiddenInput.value = movie.id;
    
    // Hiển thị thông tin phim đã chọn
    const infoDiv = document.querySelector(`.plan-selected-movie-info[data-index="${index}"]`);
    if (infoDiv) {
        infoDiv.classList.remove('hidden');
        
        const posterImg = infoDiv.querySelector('.plan-movie-poster');
        if (posterImg) posterImg.src = `${urlMinio}/${movie.poster_url}`;
        
        const titleEl = infoDiv.querySelector('.plan-movie-title');
        if (titleEl) titleEl.textContent = movie.ten_phim;
        
        const durationEl = infoDiv.querySelector('.plan-movie-duration');
        if (durationEl) durationEl.textContent = `${movie.thoi_luong} phút`;
    }
    
    // Ẩn kết quả tìm kiếm
    const resultsDiv = document.querySelector(`.plan-movie-results[data-index="${index}"]`);
    if (resultsDiv) resultsDiv.classList.add('hidden');
    
    // Load suggested times nếu đã chọn phòng
    loadSuggestedTimesForPlan(index);
}

function calculateEndTime(index) {
    const movieIdInput = document.querySelector(`.plan-selected-movie-id[data-index="${index}"]`);
    const startTimeInput = document.querySelector(`.plan-start-time[data-index="${index}"]`);
    const endTimeSpan = document.querySelector(`.plan-end-time[data-index="${index}"]`);
    
    if (!movieIdInput || !startTimeInput || !endTimeSpan) return;
    
    const movieId = movieIdInput.value;
    const startTime = startTimeInput.value;
    
    if (!movieId || !startTime) {
        endTimeSpan.textContent = '--:--';
        return;
    }
    
    const movie = moviesData.find(m => m.id == movieId);
    if (!movie) return;
    
    // Parse start time
    const [hours, minutes] = startTime.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return;
    
    // Calculate end time
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0);
    
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + movie.thoi_luong);
    
    // Format end time
    const endHours = endDate.getHours().toString().padStart(2, '0');
    const endMinutes = endDate.getMinutes().toString().padStart(2, '0');
    
    endTimeSpan.textContent = `${endHours}:${endMinutes}`;
}

// Hàm thu thập tất cả suất chiếu hiện tại trong modal (để gửi lên API)
function getAllCurrentShowtimesInModal() {
    const showtimeItems = document.querySelectorAll('.showtime-item');
    const showtimes = [];
    
    showtimeItems.forEach(item => {
        const index = item.dataset.index;
        const id = item.getAttribute('data-id') || null; // Lấy ID nếu có (suất cũ)
        const status = item.getAttribute('data-status') || '0'; // Lấy trạng thái
        
        // ⚠️ Bỏ qua suất đã duyệt (không gửi lên server vì không được phép chỉnh sửa)
        if (status == '1') {
            console.log(`⏭️ [getAllCurrentShowtimesInModal] Skip approved showtime at index ${index}`);
            return; // Skip suất này
        }
        
        const movieIdInput = document.querySelector(`.plan-selected-movie-id[data-index="${index}"]`);
        const roomSelect = document.querySelector(`.plan-room-select[data-index="${index}"]`);
        const startTimeInput = document.querySelector(`.plan-start-time[data-index="${index}"]`);
        const endTimeSpan = document.querySelector(`.plan-end-time[data-index="${index}"]`); // Đây là SPAN không phải INPUT
        
        // endTimeSpan là <span> nên dùng .textContent, và kiểm tra !== '--:--'
        const endTimeText = endTimeSpan?.textContent?.trim();
        
        if (movieIdInput?.value && roomSelect?.value && startTimeInput?.value && endTimeText && endTimeText !== '--:--' && currentSelectedDate) {
            const showtimeData = {
                modalIndex: index, // Thêm index để biết suất chiếu này thuộc item nào
                id_phim: parseInt(movieIdInput.value),
                id_phongchieu: parseInt(roomSelect.value),
                batdau: `${currentSelectedDate} ${startTimeInput.value}:00`,
                ketthuc: `${currentSelectedDate} ${endTimeText}:00`
            };
            
            // Thêm ID nếu có (để backend biết đây là suất cũ cần chỉnh sửa)
            if (id) {
                showtimeData.id = parseInt(id);
            }
            
            showtimes.push(showtimeData);
        }
    });
    
    console.log(`📋 [getAllCurrentShowtimesInModal] Collected ${showtimes.length} showtimes:`, showtimes);
    return showtimes;
}

// Cache suggested times theo ngày+phòng để tránh gọi API nhiều lần
const suggestedTimesCache = {};

// Hàm load thời gian gợi ý cho kế hoạch (chỉ gọi API 1 lần cho mỗi ngày+phòng, lọc ở frontend)
async function loadSuggestedTimesForPlan(index) {
    const movieIdInput = document.querySelector(`.plan-selected-movie-id[data-index="${index}"]`);
    const roomSelect = document.querySelector(`.plan-room-select[data-index="${index}"]`);
    const suggestedTimesContainer = document.querySelector(`.plan-suggested-times-container[data-index="${index}"]`);
    const suggestedTimesDiv = document.querySelector(`.plan-suggested-times[data-index="${index}"]`);
    
    if (!movieIdInput || !roomSelect || !currentSelectedDate) return;
    
    const movieId = movieIdInput.value;
    const roomId = roomSelect.value;
    
    if (!movieId || !roomId) {
        // Ẩn suggested times nếu chưa đủ thông tin
        if (suggestedTimesContainer) suggestedTimesContainer.classList.add('hidden');
        return;
    }
    
    const movie = moviesData.find(m => m.id == movieId);
    if (!movie) return;
    
    // Hiển thị container
    if (suggestedTimesContainer) suggestedTimesContainer.classList.remove('hidden');
    
    // Kiểm tra cache - key là ngày + phòng
    const cacheKey = `${currentSelectedDate}_${roomId}`;
    let allSuggestedTimes = suggestedTimesCache[cacheKey];
    
    // Nếu chưa có trong cache, gọi API
    if (!allSuggestedTimes) {
        // Show loading
        if (suggestedTimesDiv) {
            suggestedTimesDiv.innerHTML = '<p class="text-sm text-gray-500 col-span-6 text-center">Đang tải khung giờ gợi ý...</p>';
        }
        
        try {
            const planListing = document.getElementById('plan-listing');
            const baseUrl = planListing?.dataset?.url || '';
            
            // Gọi API đơn giản, không gửi modal data
            const response = await fetch(`${baseUrl}/api/ke-hoach-suat-chieu/tao-khung-gio-goi-y?ngay=${currentSelectedDate}&id_phong_chieu=${roomId}&thoi_luong_phim=${movie.thoi_luong}`);
            const result = await response.json();
            
            if (result.success && result.data && result.data.length > 0) {
                // Lưu vào cache
                allSuggestedTimes = result.data;
                suggestedTimesCache[cacheKey] = allSuggestedTimes;
            } else {
                if (suggestedTimesDiv) {
                    suggestedTimesDiv.innerHTML = '<p class="text-sm text-red-500 col-span-6 text-center">Không có khung giờ phù hợp</p>';
                }
                return;
            }
        } catch (error) {
            console.error('Error loading suggested times:', error);
            if (suggestedTimesDiv) {
                suggestedTimesDiv.innerHTML = '<p class="text-sm text-red-500 col-span-6 text-center">Lỗi khi tải khung giờ gợi ý</p>';
            }
            return;
        }
    }
    
    // Lọc ở frontend: loại bỏ các khung giờ trong vùng ảnh hưởng của các suất đã thêm trong modal
    const allShowtimes = getAllCurrentShowtimesInModal();
    const otherShowtimes = allShowtimes.filter(showtime => showtime.modalIndex != index);
    
    console.log(`🔍 [Filter Debug] Suất #${parseInt(index)+1}:`);
    console.log('  - Tất cả suất trong modal:', allShowtimes);
    console.log('  - Suất khác (loại trừ hiện tại):', otherShowtimes);
    console.log('  - Phòng hiện tại:', roomId);
    
    const BUFFER_MINUTES = 30; // 30 phút vệ sinh giữa các suất
    
    const filteredTimes = allSuggestedTimes.filter(time => {
        // Parse khung giờ đang xét thành Date để so sánh
        const [timeHours, timeMinutes] = time.split(':').map(Number);
        const timeStart = new Date(currentSelectedDate);
        timeStart.setHours(timeHours, timeMinutes, 0, 0);
        const timeEnd = new Date(timeStart);
        timeEnd.setMinutes(timeEnd.getMinutes() + movie.thoi_luong);
        
        // Kiểm tra xem khung giờ này có xung đột với suất nào khác không
        return !otherShowtimes.some(showtime => {
            // Chỉ kiểm tra cùng phòng và cùng ngày
            if (showtime.id_phongchieu != roomId) return false;
            if (!showtime.batdau.startsWith(currentSelectedDate)) return false;
            
            // Parse thời gian của suất chiếu đã có
            const showtimeStart = new Date(showtime.batdau);
            const showtimeEnd = new Date(showtime.ketthuc);
            
            // Tạo vùng ảnh hưởng: trừ 30p trước bắt đầu, cộng 30p sau kết thúc
            const zoneCamStart = new Date(showtimeStart);
            zoneCamStart.setMinutes(zoneCamStart.getMinutes() - BUFFER_MINUTES);
            const zoneCamEnd = new Date(showtimeEnd);
            zoneCamEnd.setMinutes(zoneCamEnd.getMinutes() + BUFFER_MINUTES);
            
            // Kiểm tra xung đột: khung giờ mới có nằm trong vùng cấm không
            return (timeStart < zoneCamEnd && timeEnd > zoneCamStart);
        });
    });
    
    // Render các khung giờ đã lọc
    if (filteredTimes.length > 0) {
        renderSuggestedTimesForPlan(filteredTimes, index);
    } else {
        if (suggestedTimesDiv) {
            suggestedTimesDiv.innerHTML = '<p class="text-sm text-yellow-600 col-span-6 text-center">Các khung giờ đã được sử dụng. Vui lòng nhập thủ công.</p>';
        }
    }
}

// Render thời gian gợi ý
function renderSuggestedTimesForPlan(times, index) {
    const suggestedTimesDiv = document.querySelector(`.plan-suggested-times[data-index="${index}"]`);
    if (!suggestedTimesDiv) return;
    
    suggestedTimesDiv.innerHTML = times.map(time => `
        <button 
            type="button" 
            class="px-3 py-2 text-sm font-medium border border-gray-300 rounded-md hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 transition suggested-time-btn"
            data-time="${time}"
            data-index="${index}"
        >
            ${time}
        </button>
    `).join('');
    
    // Add click handlers
    suggestedTimesDiv.querySelectorAll('.suggested-time-btn').forEach(btn => {
        btn.addEventListener('click', () => selectSuggestedTime(btn.dataset.time, btn.dataset.index));
    });
}

// Chọn thời gian gợi ý (không cần validate vì đã lọc ở loadSuggestedTimesForPlan)
function selectSuggestedTime(time, index) {
    const startTimeInput = document.querySelector(`.plan-start-time[data-index="${index}"]`);
    const roomSelect = document.querySelector(`.plan-room-select[data-index="${index}"]`);
    const movieIdInput = document.querySelector(`.plan-selected-movie-id[data-index="${index}"]`);
    
    if (!startTimeInput || !roomSelect || !movieIdInput) return;
    
    const movie = moviesData.find(m => m.id == movieIdInput.value);
    if (!movie) return;
    
    // Set giá trị (không cần validate vì khung giờ gợi ý đã được lọc)
    startTimeInput.value = time;
    calculateEndTime(index);
    
    console.log(`✅ [Time Selected] Suất #${parseInt(index)+1} chọn giờ ${time}`);
    
    // XÓA TẤT CẢ CACHE để các suất khác sẽ reload và lọc lại với dữ liệu mới
    for (let key in suggestedTimesCache) {
        delete suggestedTimesCache[key];
    }
    console.log('✨ [Cache Cleared] Xóa tất cả cache sau khi chọn giờ');
    
    // Force reload suggested times cho các suất KHÁC đã chọn phòng
    const allShowtimeItems = document.querySelectorAll('.showtime-item');
    allShowtimeItems.forEach(item => {
        const itemIndex = item.dataset.index;
        if (itemIndex != index) {
            const itemRoomSelect = document.querySelector(`.plan-room-select[data-index="${itemIndex}"]`);
            const itemMovieInput = document.querySelector(`.plan-selected-movie-id[data-index="${itemIndex}"]`);
            
            // Nếu suất khác đã chọn phòng và phim, reload suggested times
            if (itemRoomSelect?.value && itemMovieInput?.value) {
                console.log(`🔄 [Force Reload] Suất #${parseInt(itemIndex)+1} reload suggested times`);
                loadSuggestedTimesForPlan(itemIndex);
            }
        }
    });
    
    // Highlight selected button
    const buttons = document.querySelectorAll(`.suggested-time-btn[data-index="${index}"]`);
    buttons.forEach(btn => {
        if (btn.dataset.time === time) {
            btn.classList.add('bg-blue-600', 'text-white', 'border-blue-600');
            btn.classList.remove('hover:bg-blue-50');
        } else {
            btn.classList.remove('bg-blue-600', 'text-white', 'border-blue-600');
            btn.classList.add('hover:bg-blue-50');
        }
    });
}

// Hàm validateShowtimeForPlan đã được bỏ - validation giờ được xử lý bằng cách lọc ở frontend

function handleSaveAllShowtimes() {
    const showtimeItems = document.querySelectorAll('.showtime-item');
    if (!showtimeItems.length || !currentSelectedDate) return;
    
    // Validate all items
    let hasError = false;
    const danhSachSuatChieu = [];
    
    showtimeItems.forEach((item, idx) => {
        const index = item.dataset.index;
        
        // Check movie selection
        const movieIdInput = item.querySelector(`.plan-selected-movie-id`);
        if (!movieIdInput || !movieIdInput.value) {
            showError(`Suất #${idx + 1}: Vui lòng chọn phim`);
            hasError = true;
            return;
        }
        
        // Check room selection
        const roomSelect = item.querySelector(`.plan-room-select`);
        if (!roomSelect || !roomSelect.value) {
            showError(`Suất #${idx + 1}: Vui lòng chọn phòng chiếu`);
            hasError = true;
            return;
        }
        
        // Check time
        const startTimeInput = item.querySelector(`.plan-start-time`);
        if (!startTimeInput || !startTimeInput.value) {
            showError(`Suất #${idx + 1}: Vui lòng chọn giờ bắt đầu`);
            hasError = true;
            return;
        }
        
        // Get movie to calculate end time
        const movie = moviesData.find(m => m.id == movieIdInput.value);
        if (!movie) {
            showError(`Suất #${idx + 1}: Không tìm thấy thông tin phim`);
            hasError = true;
            return;
        }
        
        // Calculate end time
        const [hours, minutes] = startTimeInput.value.split(':').map(Number);
        const startDate = new Date(currentSelectedDate + ' ' + startTimeInput.value + ':00');
        const endDate = new Date(startDate);
        endDate.setMinutes(endDate.getMinutes() + movie.thoi_luong);
        
        // Format datetime for database
        const batDau = `${currentSelectedDate} ${startTimeInput.value}:00`;
        const ketThuc = `${currentSelectedDate} ${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}:00`;
        
        // Get note
        const noteInput = item.querySelector(`.plan-note`);
        const ghiChu = noteInput ? noteInput.value : '';
        
        danhSachSuatChieu.push({
            id_phim: parseInt(movieIdInput.value),
            id_phongchieu: parseInt(roomSelect.value),
            batdau: batDau,
            ketthuc: ketThuc,
            ghi_chu: ghiChu
        });
    });
    
    if (hasError) return;
    
    // Calculate week start and end
    const weekStart = new Date(currentPlanWeekStart);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const batDauTuan = formatDate(weekStart);
    const ketThucTuan = formatDate(weekEnd);
    
    // Send to API
    const planListing = document.getElementById('plan-listing');
    const baseUrl = planListing?.dataset?.url || '';
    
    Spinner.show({ text: 'Đang lưu kế hoạch...' });
    
    fetch(`${baseUrl}/api/ke-hoach-suat-chieu`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            batdau: batDauTuan,
            ketthuc: ketThucTuan,
            ngay_chieu: currentSelectedDate, // ✅ Gửi ngày chiếu để backend xóa suất cũ của ngày này
            suat_chieu: danhSachSuatChieu
        })
    })
    .then(res => res.json())
    .then(data => {
        Spinner.hide();
        if (data.success) {
            showSuccess('Lưu kế hoạch thành công!');
            closePlanModal();
            loadKeHoach(); // Reload to show updated plan
        } else {
            showError(data.message || 'Lỗi khi lưu kế hoạch');
        }
    })
    .catch(error => {
        Spinner.hide();
        console.error('Error saving plan:', error);
        showError('Lỗi khi lưu kế hoạch: ' + error.message);
    });
}



// Thêm dữ liệu demo thay vì gọi API

// Demo data cho phim
const demoMovies = [
  {
    id: 1,
    ten_phim: 'Avengers: Endgame',
    poster: 'demo/avengers.jpg',
    thoi_luong: 180,
    trang_thai: 'Đang chiếu'
  },
  {
    id: 2,
    ten_phim: 'Spider-Man: No Way Home',
    poster: 'demo/spiderman.jpg',
    thoi_luong: 148,
    trang_thai: 'Đang chiếu'
  },
  {
    id: 3,
    ten_phim: 'Black Panther: Wakanda Forever',
    poster: 'demo/blackpanther.jpg',
    thoi_luong: 161,
    trang_thai: 'Sắp chiếu'
  },
  {
    id: 4,
    ten_phim: 'Doctor Strange in the Multiverse of Madness',
    poster: 'demo/doctorstrange.jpg',
    thoi_luong: 126,
    trang_thai: 'Đang chiếu'
  },
  {
    id: 5,
    ten_phim: 'Thor: Love and Thunder',
    poster: 'demo/thor.jpg',
    thoi_luong: 119,
    trang_thai: 'Đang chiếu'
  },
  {
    id: 6,
    ten_phim: 'Eternals',
    poster: 'demo/eternals.jpg',
    thoi_luong: 156,
    trang_thai: 'Sắp chiếu'
  }
];

// Demo data cho phòng chiếu
const demoRooms = [
  { id: 1, ten_phong: 'Phòng 1' },
  { id: 2, ten_phong: 'Phòng 2' },
  { id: 3, ten_phong: 'Phòng 3' },
  { id: 4, ten_phong: 'Phòng VIP' },
  { id: 5, ten_phong: 'Phòng IMAX' }
];

// Hàm tạo kế hoạch demo dựa trên tuần được chọn
function generateDemoPlans(weekStartDate) {
  if (!weekStartDate) return [];
  
  // Tạo một danh sách các kế hoạch demo
  const plans = [];
  const numPlans = weekOffset === 0 ? 12 : (weekOffset > 0 ? 5 : 18); // Số lượng suất tùy thuộc vào tuần
  
  for (let i = 0; i < 7; i++) { // 7 ngày trong tuần
    const date = new Date(weekStartDate);
    date.setDate(weekStartDate.getDate() + i);
    const dateStr = formatDate(date);
    
    // Số suất chiếu cho ngày này (phân phối ngẫu nhiên trong tuần)
    const numShowtimesForDay = i < 5 ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 2) + 2;
    
    for (let j = 0; j < numShowtimesForDay; j++) {
      // Chọn phim ngẫu nhiên
      const movie = demoMovies[Math.floor(Math.random() * demoMovies.length)];
      
      // Chọn phòng ngẫu nhiên
      const room = demoRooms[Math.floor(Math.random() * demoRooms.length)];
      
      // Tạo giờ chiếu ngẫu nhiên (8:00 - 22:00)
      const hour = Math.floor(Math.random() * 14) + 8;
      const minute = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
      const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      plans.push({
        id: plans.length + 1,
        id_phim: movie.id,
        id_phong_chieu: room.id,
        phim: movie,
        phong_chieu: room,
        ngay_chieu: dateStr,
        gio_bat_dau: startTime,
        gio_ket_thuc: calculateEndTimeForDemo(startTime, movie.thoi_luong),
        ghi_chu: Math.random() > 0.7 ? 'Suất chiếu đặc biệt' : '',
        trang_thai: 'Chưa hoàn thành'
      });
    }
  }
  
  return plans;
}

function calculateEndTimeForDemo(startTime, durationMinutes) {
  const [hours, minutes] = startTime.split(':').map(Number);
  
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0);
  
  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + durationMinutes);
  
  const endHours = endDate.getHours().toString().padStart(2, '0');
  const endMinutes = endDate.getMinutes().toString().padStart(2, '0');
  
  return `${endHours}:${endMinutes}`;
}

function showSuccess(message) {
  const toast = document.getElementById('plan-toast');
  if (!toast) return;
  
  toast.className = 'fixed bottom-4 right-4 px-4 py-2 bg-green-500 text-white rounded-md shadow-lg transform transition-transform duration-300 z-50';
  toast.innerHTML = `
    <div class="flex items-center">
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      <span>${message}</span>
    </div>
  `;
  
  toast.classList.remove('translate-y-20', 'opacity-0');
  
  setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0');
  }, 3000);
}

function showError(message) {
  const toast = document.getElementById('plan-toast');
  if (!toast) return;
  
  toast.className = 'fixed bottom-4 right-4 px-4 py-2 bg-red-500 text-white rounded-md shadow-lg transform transition-transform duration-300 z-50';
  toast.innerHTML = `
    <div class="flex items-center">
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <span>${message}</span>
    </div>
  `;
  
  toast.classList.remove('translate-y-20', 'opacity-0');
  
  setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0');
  }, 3000);
}

// 3. Xóa đoạn code trùng lặp để sửa lỗi
// Xóa cả đoạn này:
/*
function loadMovies() {
  moviesData = [...demoMovies];
  console.log('Loaded demo movies:', moviesData.length);
}

function loadRooms() {
  roomsData = [...demoRooms];
  console.log('Loaded demo rooms:', roomsData.length);
}

function loadKeHoach() {
  const planListing = document.getElementById('plan-listing');
  if (!planListing || !currentPlanWeekStart) return;

  // Hiển thị spinner để trải nghiệm giống thực tế
  try {
    Spinner.show({ target: planListing, text: 'Đang tải kế hoạch...' });
  } catch (e) {
    console.log('Spinner not available');
    // Tạo spinner đơn giản nếu không có Spinner module
    planListing.innerHTML = '<div class="text-center py-8">Đang tải...</div>';
  }

  // Giả lập thời gian tải
  setTimeout(() => {
    try {
      Spinner.hide();
    } catch (e) {
      console.log('Spinner not available');
    }
    
    // Generate demo plans based on the current week
    keHoachData = generateDemoPlans(currentPlanWeekStart);
    
    // Render kế hoạch từ dữ liệu demo
    renderKeHoach();
    
    console.log('Loaded demo plans:', keHoachData.length);
  }, 800); // Giả lập độ trễ 800ms
}
*/

// Đảm bảo CSS cho poster placeholder
document.addEventListener('DOMContentLoaded', function() {
  // Thêm CSS cho poster placeholder
  const style = document.createElement('style');
  style.textContent = `
    .plan-movie-poster:not([src]), .plan-movie-poster[src=""] {
      background-color: #e2e8f0;
      position: relative;
    }
    .plan-movie-poster:not([src])::after, .plan-movie-poster[src=""]::after {
      content: '🎬';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 16px;
    }
  `;
  document.head.appendChild(style);
});
document.addEventListener('DOMContentLoaded', function() {
  // Thêm CSS cho poster placeholder
  const style = document.createElement('style');
  style.textContent = `
    .plan-movie-poster:not([src]), .plan-movie-poster[src=""] {
      background-color: #e2e8f0;
      position: relative;
    }
    .plan-movie-poster:not([src])::after, .plan-movie-poster[src=""]::after {
      content: '🎬';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 16px;
    }
  `;
  document.head.appendChild(style);
});