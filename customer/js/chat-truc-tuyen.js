import { socket } from "./util/socket.js";
import CustomerSpinner from "./util/spinner-khach-hang.js";
import Pusher from "pusher-js";

// =====================
// Khởi tạo Pusher notify
// =====================
let pusher = null;
document.addEventListener("DOMContentLoaded", function () {
    const userId = document.getElementById("userid").value;
    if (userId) {
        pusher = new Pusher("03dc77ca859c49e35e41", {
            cluster: "ap1",
            forceTLS: true
        });
        const channel = pusher.subscribe(`khachhang-${userId}`);
        channel.bind("new-message", function (data) {
            console.log("Pusher notify:", data);
            showNotifyBox(data.preview || data.noi_dung);
        });
    }
});

// =====================
// Notify mini-box (ẩn sau 3-4s)
// =====================
function showNotifyBox(msg) {
    let notifyBox = document.getElementById("notifyBox");
    if (!notifyBox) {
        notifyBox = document.createElement("div");
        notifyBox.id = "notifyBox";
        notifyBox.className = "fixed bottom-20 right-6 bg-white shadow-lg rounded-lg border border-gray-200 w-64 z-50 hidden transition-opacity duration-500";
        notifyBox.innerHTML = `
            <div class="p-3 flex items-start space-x-2 cursor-pointer">
                <div class="flex-shrink-0">💬</div>
                <div class="flex-1">
                    <p class="text-sm text-gray-800 font-semibold">Tin nhắn mới</p>
                    <p id="messages" class="text-xs text-gray-600 mt-1"></p>
                </div>
            </div>
        `;
        document.body.appendChild(notifyBox);
    }

    const messages = notifyBox.querySelector("#messages");
    messages.textContent = msg;

    notifyBox.style.display = "block";
    notifyBox.style.opacity = "1";

    setTimeout(() => {
        notifyBox.style.opacity = "0";
        setTimeout(() => {
            notifyBox.style.display = "none";
        }, 500);
    }, 4000);

    notifyBox.onclick = () => {
        notifyBox.style.display = "none";
        const chatboxFb = document.getElementById("chatboxFb");
        chatboxFb.style.display = "flex";
    };
}


// Khởi tạo khi DOM loaded
document.addEventListener('DOMContentLoaded', function() {
    // Ẩn modal tạo phiên chat ban đầu
    const modalCreateSession = document.getElementById('modalCreateSession');
    modalCreateSession.classList.add('hidden');
    
    // Hiển thị danh sách phiên chat
    const chatSessionList = document.getElementById('chatSessionList');
    chatSessionList.style.display = 'block';
    
    const modalLogin = document.getElementById('modalLogin');
    const userId = document.getElementById('userid').value;
    const body = document.body;
    function openModal(modal) { // Hiển thị modal đăng nhập
        modal.classList.add('is-open');
        body.classList.add('modal-open');
    }
    // Tải danh sách phiên chat từ server
    if(!userId){
        alert("Vui lòng đăng nhập!");
        openModal(modalLogin);
        return;
    }
    loadChatSessions();
    
    // Xử lý sự kiện
    setupEventListeners();
    
    // Setup socket listener
    setupSocketListeners();
});

// Thiết lập các listener cho socket
function setupSocketListeners() {
    // Lắng nghe sự kiện nhận tin nhắn từ nhân viên
    socket.on("nhan-vien-gui-tin-nhan", function(data) {
        try {
            // Parse dữ liệu JSON nhận được
            const messageData = JSON.parse(data);
            console.log("Tin nhắn từ nhân viên:", messageData);
            
            // Tạo object message với format phù hợp để hiển thị
            const message = {
                id: Date.now(), // ID tạm thời
                noi_dung: messageData.noi_dung,
                nguoi_gui: 2, // 2 = nhân viên
                created_at: new Date().toISOString(),
                // Thêm các trường cần thiết để xác định và xử lý hình ảnh
                loai_noidung: messageData.loai_noidung,
                is_image: messageData.is_image
            };
            
            // Kiểm tra xem tin nhắn có phải là cho phiên chat hiện tại không
            if (window.currentChatSession && messageData.id_phienchat == window.currentChatSession.id) {
                // Thêm tin nhắn vào khu vực chat
                appendNewMessage(message);
                
                // Phát âm thanh thông báo
                // playNotificationSound();
                
                // Cập nhật trạng thái phiên chat sang "đang hoạt động" nếu đang ở trạng thái "chờ phản hồi"
                updateSessionStatusIfNeeded();
            } else {
                // Nếu không phải phiên chat hiện tại, hiển thị thông báo có tin nhắn mới
                showNewMessageNotification(messageData.id_phienchat);
            }
            
            // Cập nhật tin nhắn mới nhất trong danh sách phiên chat (bất kể là phiên chat hiện tại hay không)
            updateLatestMessageInSessionList(messageData.id_phienchat, message);
            
        } catch (error) {
            console.error("Lỗi xử lý tin nhắn từ nhân viên:", error);
        }
    });
}

// Cập nhật tin nhắn mới nhất trong danh sách phiên chat
function updateLatestMessageInSessionList(sessionId, message) {
    const sessionItem = document.querySelector(`[data-session-id="${sessionId}"]`);
    if (sessionItem) {
        // Cập nhật nội dung tin nhắn mới nhất
        const messagePreview = sessionItem.querySelector('p.text-sm');
        if (messagePreview) {
            messagePreview.textContent = truncateText(message.noi_dung, 50);
            messagePreview.title = message.noi_dung;
            
            // Làm nổi bật nội dung tin nhắn mới
            messagePreview.classList.add('font-semibold');
        }
        
        // Cập nhật thời gian
        const timestampElement = sessionItem.querySelector('p.text-xs.text-gray-400');
        if (timestampElement) {
            timestampElement.textContent = 'Vừa xong';
        }
        
        // Di chuyển phiên chat lên đầu danh sách nếu không phải phiên chat hiện tại
        if (!window.currentChatSession || sessionId != window.currentChatSession.id) {
            const sessionListUl = document.getElementById('sessionListUl');
            if (sessionListUl.firstChild) {
                sessionListUl.insertBefore(sessionItem.parentElement, sessionListUl.firstChild);
            }
            
            // Tăng số tin nhắn chưa đọc nếu không phải phiên chat hiện tại
            // và người gửi là nhân viên (nguoi_gui = 2) hoặc hệ thống (nguoi_gui = null)
            if (message.nguoi_gui === 2 || message.nguoi_gui === null) {
                let unreadBadge = sessionItem.querySelector('.bg-red-500');
                if (unreadBadge) {
                    // Nếu đã có badge, tăng số lên 1
                    let count = parseInt(unreadBadge.textContent) || 0;
                    unreadBadge.textContent = count + 1;
                } else {
                    // Nếu chưa có badge, thêm mới với số là 1
                    const badgeContainer = sessionItem.querySelector('.flex.items-center');
                    if (badgeContainer) {
                        const newBadge = document.createElement('span');
                        newBadge.className = 'bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1 ml-2';
                        newBadge.textContent = '1';
                        badgeContainer.appendChild(newBadge);
                    }
                }
                
                // Thêm class highlight cho phiên chat có tin nhắn chưa đọc
                sessionItem.classList.add('bg-blue-50');
            }
        }
        
        // Cập nhật trạng thái phiên chat sang "Đã trả lời" nếu đang ở trạng thái "chờ phản hồi"
        // và người gửi là nhân viên (nguoi_gui = 2)
        if (message.nguoi_gui === 2) {
            const statusSpan = sessionItem.querySelector('.bg-yellow-100');
            if (statusSpan) {
                statusSpan.className = 'bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full';
                statusSpan.textContent = 'Đã trả lời';
            }
        }
    }
}

// Thêm tin nhắn mới vào cuối danh sách chat
function appendNewMessage(message) {
    const chatboxMessages = document.getElementById('chatboxMessages');
    
    // Tạo phần tử tin nhắn mới
    const messageDiv = createMessageElement(message);
    
    // Thêm tin nhắn vào cuối danh sách
    chatboxMessages.appendChild(messageDiv);
    
    // Cuộn xuống để hiển thị tin nhắn mới nhất
    chatboxMessages.scrollTop = chatboxMessages.scrollHeight;
}

// Phát âm thanh thông báo khi có tin nhắn mới
function playNotificationSound() {
    try {
        // Kiểm tra xem sessionListUl có tồn tại không
        const sessionList = document.getElementById('sessionListUl');
        if (!sessionList || !sessionList.dataset.url) {
            console.warn("Không thể xác định đường dẫn cho âm thanh thông báo");
            return;
        }
        
        // Đường dẫn tới file âm thanh
        const audioPath = `${sessionList.dataset.url}/audio/notification.mp3`;
        
        // Kiểm tra trước khi tạo đối tượng Audio
        fetch(audioPath, { method: 'HEAD' })
            .then(response => {
                if (response.ok) {
                    const audio = new Audio(audioPath);
                    audio.volume = 0.5;
                    
                    // Xử lý promise từ audio.play()
                    const playPromise = audio.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(error => {
                            console.warn("Không thể phát âm thanh:", error.message);
                        });
                    }
                } else {
                    throw new Error("File âm thanh không tồn tại");
                }
            })
            .catch(error => {
                console.warn("Lỗi khi tải file âm thanh:", error.message);
            });
    } catch (e) {
        console.warn("Không thể phát âm thanh thông báo:", e);
    }
}

// Cập nhật trạng thái phiên chat nếu cần
function updateSessionStatusIfNeeded() {
    if (window.currentChatSession && window.currentChatSession.trang_thai === 1) {
        // Cập nhật trạng thái phiên chat hiện tại sang "Đã trả lời"
        window.currentChatSession.trang_thai = 0;
        
        // Cập nhật hiển thị trong danh sách phiên chat
        const sessionItem = document.querySelector(`[data-session-id="${window.currentChatSession.id}"]`);
        if (sessionItem) {
            const statusSpan = sessionItem.querySelector('.bg-yellow-100');
            if (statusSpan) {
                statusSpan.className = 'bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full';
                statusSpan.textContent = 'Đã trả lời';
            }
        }
    }
}

// Hiển thị thông báo khi có tin nhắn mới trong phiên chat khác
function showNewMessageNotification(sessionId) {
    // Tìm phiên chat trong danh sách
    const sessionItem = document.querySelector(`[data-session-id="${sessionId}"]`);
    if (sessionItem) {
        // Thêm hiệu ứng nhấp nháy hoặc highlight
        sessionItem.classList.add('bg-blue-50', 'animate-pulse');
        
        // Thêm badge thông báo tin nhắn mới nếu chưa có
        if (!sessionItem.querySelector('.new-message-badge')) {
            const badge = document.createElement('span');
            badge.className = 'new-message-badge absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center';
            badge.textContent = '!';
            sessionItem.style.position = 'relative';
            sessionItem.appendChild(badge);
        }
        
        // Tùy chọn: Hiển thị toast thông báo
        showToastNotification(`Có tin nhắn mới từ phiên chat #${sessionId}`);
    }
    
    // Nếu cần, cập nhật danh sách phiên chat để hiển thị tin nhắn mới nhất
    // Bạn có thể gọi loadChatSessions() ở đây nếu muốn làm mới toàn bộ danh sách
}

// Hiển thị toast thông báo
function showToastNotification(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-y-full transition-transform duration-300';
    toast.innerHTML = `
        <div class="flex items-center">
            <span class="mr-2">💬</span>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-y-full');
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        toast.classList.add('translate-y-full');
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 5000);
}

// Tải danh sách phiên chat từ API
async function loadChatSessions() {
    const spinner = CustomerSpinner.show({
        target: '#sessionListUl',
        text: 'Đang tải danh sách phiên chat...',
        type: 'cinema',
        theme: 'blue',
        size: 'md'
    });

    try {
        const response = await fetch(`${document.getElementById('sessionListUl').dataset.url}/api/danh-sach-phien-chat-khach-hang`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const result = await response.json();
        
        if (result.success) {
            renderChatSessions(result.data);
        } else {
            console.error('Lỗi tải danh sách phiên chat:', result.message);
            showErrorMessage('Không thể tải danh sách phiên chat. Vui lòng thử lại!');
        }
    } catch (error) {
        console.error('Lỗi kết nối:', error);
        showErrorMessage('Lỗi kết nối. Vui lòng kiểm tra internet và thử lại!');
    } finally {
        CustomerSpinner.hide(spinner);
    }
}

// Render danh sách phiên chat với số tin nhắn chưa đọc
function renderChatSessions(sessions) {
    const sessionListUl = document.getElementById('sessionListUl');
    sessionListUl.innerHTML = '';
    
    if (sessions.length === 0) {
        sessionListUl.innerHTML = `
            <li class="p-4 text-center text-gray-500">
                <div class="flex flex-col items-center py-8">
                    <div class="text-6xl mb-4">💬</div>
                    <p class="text-lg font-medium mb-2">Chưa có phiên chat nào</p>
                    <p class="text-sm">Hãy tạo phiên chat mới để được hỗ trợ!</p>
                </div>
            </li>
        `;
        return;
    }
    
    sessions.forEach(session => {
        const statusInfo = getSessionStatus(session.trang_thai);
        const lastMessage = session.tin_nhan && session.tin_nhan.length > 0 
            ? session.tin_nhan[0].noi_dung 
            : session.chu_de;
        const timestamp = formatTimestamp(session.updated_at);
        
        // Kiểm tra số tin nhắn chưa đọc
        const unreadCount = session.so_tin_nhan_chua_doc || 0;
        const unreadBadge = unreadCount > 0 
            ? `<span class="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1 ml-2">${unreadCount}</span>`
            : '';
            
        const sessionItem = document.createElement('li');
        
        // Thêm class highlight cho phiên chat có tin nhắn chưa đọc
        const highlightClass = unreadCount > 0 ? 'bg-blue-50' : '';
        
        sessionItem.innerHTML = `
            <div class="p-4 ${highlightClass} hover:bg-gray-50 cursor-pointer transition-colors relative" data-session-id="${session.id}">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center">
                        <h4 class="font-semibold text-gray-800">${session.chu_de} - #${session.id}</h4>
                        ${unreadBadge}
                    </div>
                    <span class="${statusInfo.class}">${statusInfo.text}</span>
                </div>
                <div class="flex items-center justify-between mb-1">
                    <span class="text-xs text-gray-500 italic">${session.rapphim?.ten || 'Rạp phim'}</span>
                </div>
                <p class="text-sm ${unreadCount > 0 ? 'font-semibold' : ''} text-gray-600 mb-1" title="${lastMessage}">
                    ${truncateText(lastMessage, 50)}
                </p>
                <p class="text-xs text-gray-400">${timestamp}</p>
            </div>
        `;
        
        sessionItem.addEventListener('click', () => openChatSession(session));
        sessionListUl.appendChild(sessionItem);
    });
}

// Lấy trạng thái phiên chat
function getSessionStatus(status) {
    const statusMap = {
        0: { class: 'bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full', text: 'Đã trả lời' },
        1: { class: 'bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full', text: 'Chờ phản hồi' },
        2: { class: 'bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full', text: 'Đã đóng' }
    };
    return statusMap[status] || statusMap[1];
}

// Format thời gian
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
        return 'Hôm nay ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 2) {
        return 'Hôm qua';
    } else if (diffDays <= 7) {
        return `${diffDays - 1} ngày trước`;
    } else {
        return date.toLocaleDateString('vi-VN');
    }
}

// Cắt ngắn text
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Hiển thị thông báo lỗi
function showErrorMessage(message) {
    const sessionListUl = document.getElementById('sessionListUl');
    sessionListUl.innerHTML = `
        <li class="p-4 text-center">
            <div class="flex flex-col items-center py-8 text-red-500">
                <div class="text-6xl mb-4">⚠️</div>
                <p class="text-lg font-medium mb-2">Có lỗi xảy ra</p>
                <p class="text-sm mb-4">${message}</p>
                <button onclick="loadChatSessions()" class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
                    Thử lại
                </button>
            </div>
        </li>
    `;
}

// Biến global để quản lý phân trang
let currentChatPagination = {
    hasMore: false,
    loading: false,
    oldestMessageId: null,
    isInitialLoad: true
};

// Mở phiên chat
function openChatSession(session) {
    const chatboxFb = document.getElementById('chatboxFb');
    const chatboxTitle = document.getElementById('chatboxTitle');
    const chatboxMessages = document.getElementById('chatboxMessages');

    chatboxTitle.textContent = `${session.chu_de || 'Chủ đề'} - #${session.id}`;
    chatboxMessages.innerHTML = '';
    
    // Reset pagination
    currentChatPagination = {
        hasMore: false,
        loading: false,
        oldestMessageId: null,
        isInitialLoad: true
    };
    
    // Lưu session hiện tại
    window.currentChatSession = session;

    // Hiển thị chatbox trước
    chatboxFb.style.display = 'flex';

    // Tải tin nhắn của phiên chat với spinner
    loadChatMessages(session.id);
    
    // Thêm event listener cho infinite scroll
    setupInfiniteScroll();

    // Reset số tin nhắn chưa đọc trong UI
    resetUnreadCountUI(session.id);
}
function resetUnreadCountUI(sessionId) {
    const sessionItem = document.querySelector(`[data-session-id="${sessionId}"]`);
    if (sessionItem) {
        // Xóa badge số tin nhắn chưa đọc
        const unreadBadge = sessionItem.querySelector('.bg-red-500');
        if (unreadBadge) {
            unreadBadge.remove();
        }
        
        // Bỏ highlight phiên chat
        sessionItem.classList.remove('bg-blue-50');
        
        // Bỏ in đậm cho nội dung tin nhắn
        const messagePreview = sessionItem.querySelector('p.text-sm');
        if (messagePreview) {
            messagePreview.classList.remove('font-semibold');
        }
        
        // Xóa indicator thông báo tin nhắn mới nếu có
        const newMessageBadge = sessionItem.querySelector('.new-message-badge');
        if (newMessageBadge) {
            newMessageBadge.remove();
        }
        
        // Dừng hiệu ứng nhấp nháy nếu có
        sessionItem.classList.remove('animate-pulse');
    }
}
// Thiết lập infinite scroll
function setupInfiniteScroll() {
    const chatboxMessages = document.getElementById('chatboxMessages');
    
    // Remove existing listener to prevent duplicates
    chatboxMessages.removeEventListener('scroll', handleScroll);
    chatboxMessages.addEventListener('scroll', handleScroll);
}

// Xử lý sự kiện scroll
function handleScroll() {
    const chatboxMessages = document.getElementById('chatboxMessages');
    
    // Kiểm tra nếu scroll lên đầu (hoặc gần đầu)
    if (chatboxMessages.scrollTop <= 100 && 
        currentChatPagination.hasMore && 
        !currentChatPagination.loading &&
        window.currentChatSession) {
        
        loadMoreMessages();
    }
}

// Tải tin nhắn của phiên chat
async function loadChatMessages(sessionId, isLoadMore = false) {
    const chatboxMessages = document.getElementById('chatboxMessages');
    
    if (!isLoadMore) {
        currentChatPagination.loading = true;
        
        // Hiển thị spinner trong chatbox cho lần load đầu tiên
        const spinner = CustomerSpinner.show({
            target: '#chatboxMessages',
            text: 'Đang tải tin nhắn...',
            type: 'film',
            theme: 'blue',
            size: 'sm',
            overlay: false
        });
    }

    try {
        // Xây dựng URL với tham số phân trang
        let url = `${document.getElementById('sessionListUl').dataset.url}/api/chi-tiet-phien-chat/${sessionId}?per_page=15`;
        
        if (isLoadMore && currentChatPagination.oldestMessageId) {
            url += `&last_message_id=${currentChatPagination.oldestMessageId}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const result = await response.json();
        
        if (result.success) {
            // Cập nhật thông tin phân trang
            currentChatPagination.hasMore = result.pagination.has_more;
            currentChatPagination.oldestMessageId = result.pagination.oldest_message_id;
            
            if (isLoadMore) {
                // Thêm tin nhắn vào đầu danh sách (infinite scroll)
                prependChatMessages(result.data);
            } else {
                // Render tin nhắn thay thế (load lần đầu)
                renderChatMessages(result.data, result.pagination);
            }
        } else {
            console.error('Lỗi tải tin nhắn:', result.message);
            if (!isLoadMore) {
                showChatboxError('Không thể tải tin nhắn. Vui lòng thử lại!');
            }
        }
    } catch (error) {
        console.error('Lỗi kết nối:', error);
        if (!isLoadMore) {
            showChatboxError('Lỗi kết nối. Vui lòng kiểm tra internet!');
        }
    } finally {
        if (!isLoadMore) {
            CustomerSpinner.hide();
        }
        currentChatPagination.loading = false;
    }
}

// Tải thêm tin nhắn (infinite scroll)
async function loadMoreMessages() {
    if (!window.currentChatSession || currentChatPagination.loading) {
        return;
    }
    
    currentChatPagination.loading = true;
    
    // Hiển thị loading indicator nhỏ ở đầu danh sách
    showLoadMoreIndicator();
    
    try {
        await loadChatMessages(window.currentChatSession.id, true);
    } finally {
        hideLoadMoreIndicator();
        currentChatPagination.loading = false;
    }
}

// Hiển thị loading indicator cho load more
function showLoadMoreIndicator() {
    const chatboxMessages = document.getElementById('chatboxMessages');
    
    // Remove existing indicator
    const existingIndicator = document.getElementById('load-more-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'load-more-indicator';
    loadingIndicator.className = 'flex justify-center items-center py-2 text-xs text-gray-500';
    loadingIndicator.innerHTML = `
        <div class="flex items-center">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
            <span>Đang tải tin nhắn cũ hơn...</span>
        </div>
    `;
    
    chatboxMessages.insertBefore(loadingIndicator, chatboxMessages.firstChild);
}

// Ẩn loading indicator
function hideLoadMoreIndicator() {
    const indicator = document.getElementById('load-more-indicator');
    if (indicator) {
        indicator.remove();
    }
}

// Thêm tin nhắn vào đầu danh sách (cho infinite scroll)
function prependChatMessages(messages) {
    const chatboxMessages = document.getElementById('chatboxMessages');
    const currentScrollHeight = chatboxMessages.scrollHeight;
    const currentScrollTop = chatboxMessages.scrollTop;
    
    messages.forEach((message, index) => {
        const messageDiv = createMessageElement(message);
        
        // Chèn vào sau load-more-indicator hoặc đầu danh sách
        const indicator = document.getElementById('load-more-indicator');
        if (indicator) {
            chatboxMessages.insertBefore(messageDiv, indicator.nextSibling);
        } else {
            chatboxMessages.insertBefore(messageDiv, chatboxMessages.firstChild);
        }
    });
    
    // Duy trì vị trí scroll
    const newScrollHeight = chatboxMessages.scrollHeight;
    chatboxMessages.scrollTop = currentScrollTop + (newScrollHeight - currentScrollHeight);
}



// Thêm hàm hiển thị ảnh kích thước đầy đủ
function showFullImage(imageUrl) {
    // Tìm hoặc tạo image viewer
    let imageViewer = document.getElementById('image-viewer');
    
    if (!imageViewer) {
        imageViewer = document.createElement('div');
        imageViewer.id = 'image-viewer';
        imageViewer.className = 'fixed top-0 left-0 w-full h-full bg-black bg-opacity-90 z-50 flex items-center justify-center';
        imageViewer.innerHTML = `
            <button class="absolute top-4 right-4 text-white text-4xl">&times;</button>
            <img id="full-image" class="max-w-[90%] max-h-[90%] object-contain" src="" />
        `;
        
        // Thêm event listener đóng viewer
        imageViewer.addEventListener('click', function(e) {
            if (e.target === imageViewer || e.target.tagName === 'BUTTON') {
                imageViewer.classList.add('hidden');
            }
        });
        
        document.body.appendChild(imageViewer);
    } else {
        imageViewer.classList.remove('hidden');
    }
    
    // Cập nhật nguồn ảnh
    const fullImage = document.getElementById('full-image');
    fullImage.src = imageUrl;
}

// Cập nhật hàm gửi tin nhắn text thông thường
function sendMessage(content) {
    if (!window.currentChatSession) {
        alert('Vui lòng chọn phiên chat trước khi gửi tin nhắn');
        return;
    }

    const chatboxMessages = document.getElementById('chatboxMessages');
    
    // Tạo dữ liệu tin nhắn
    const messageData = {
        id: Date.now(),
        noi_dung: content,
        nguoi_gui: 1, // 1 = khách hàng
        created_at: new Date().toISOString(),
        loai_noi_dung: 1 // 1 = Text
    };
    
    // Thêm tin nhắn vào khu vực chat
    const messageDiv = createMessageElement(messageData);
    chatboxMessages.appendChild(messageDiv);
    
    // Scroll xuống cuối
    chatboxMessages.scrollTop = chatboxMessages.scrollHeight;
    
    // Cập nhật trạng thái phiên chat sang "Chờ phản hồi"
    if (window.currentChatSession.trang_thai === 0) {
        // Cập nhật trạng thái phiên chat hiện tại sang "Chờ phản hồi"
        window.currentChatSession.trang_thai = 1;
        
        // Cập nhật hiển thị trong danh sách phiên chat
        updateSessionStatusToWaiting();
    }
    
    // Cập nhật tin nhắn cuối cùng trong danh sách phiên chat
    updateOwnMessageInSessionList(window.currentChatSession.id, messageData);
    
    // Gửi tin nhắn qua socket
    socket.emit('khach-hang-tu-van-gui-tin-nhan', JSON.stringify({
        id_phienchat: window.currentChatSession.id,
        idPhienChat: window.currentChatSession.id,
        noi_dung: content,
        noiDung: content,
        loai_noi_dung: 1, // 1 = Text
        loaiNoiDung: 1,
        nguoiGui: 1
    }));
}

// Thêm hàm mới để cập nhật tin nhắn của chính khách hàng trong danh sách phiên chat
function updateOwnMessageInSessionList(sessionId, message) {
    const sessionItem = document.querySelector(`[data-session-id="${sessionId}"]`);
    if (sessionItem) {
        // Cập nhật nội dung tin nhắn mới nhất
        const messagePreview = sessionItem.querySelector('p.text-sm');
        if (messagePreview) {
            messagePreview.textContent = truncateText(message.noi_dung, 50);
            messagePreview.title = message.noi_dung;
        }
        
        // Cập nhật thời gian
        const timestampElement = sessionItem.querySelector('p.text-xs.text-gray-400');
        if (timestampElement) {
            timestampElement.textContent = 'Vừa xong';
        }
        
        // Di chuyển phiên chat này lên đầu danh sách
        const sessionListUl = document.getElementById('sessionListUl');
        if (sessionListUl.firstChild) {
            sessionListUl.insertBefore(sessionItem.parentElement, sessionListUl.firstChild);
        }
    }
}

// Thêm hàm mới để cập nhật trạng thái phiên chat sang "Chờ phản hồi"
function updateSessionStatusToWaiting() {
    if (!window.currentChatSession) return;
    
    const sessionItem = document.querySelector(`[data-session-id="${window.currentChatSession.id}"]`);
    if (sessionItem) {
        // Tìm và cập nhật trạng thái trong UI
        const statusSpan = sessionItem.querySelector('.bg-green-100');
        if (statusSpan) {
            statusSpan.className = 'bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full';
            statusSpan.textContent = 'Chờ phản hồi';
        }
        
        // Cập nhật trạng thái cho phiên chat hiện tại
        window.currentChatSession.trang_thai = 1;
    }
}

// Tạo phiên chat mới với API
async function createNewChatSession(cinemaId, topic) {
    const spinner = CustomerSpinner.show({
        text: 'Đang tạo phiên chat...',
        type: 'cinema',
        theme: 'blue'
    });

    try {
        const response = await fetch(`${document.getElementById('sessionListUl').dataset.url}/api/tao-phien-chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                'id_rapphim': cinemaId,
                'chu_de': topic
            })
        });

        const result = await response.json();
        
        if (result.success) {
            // Reload danh sách phiên chat
            await loadChatSessions();
            
            // Hiển thị thông báo thành công
            showSuccessMessage('Tạo phiên chat thành công!');
            
            // Mở phiên chat mới được tạo
            if (result.data) {
                // Add cinema info to session data
                const cinemaSelect = document.getElementById('cinemaSelect');
                const selectedOption = cinemaSelect.options[cinemaSelect.selectedIndex];
                const cinemaName = selectedOption.text;
                
                result.data.rapphim = { ten: cinemaName };
                result.data.chu_de = topic;
                
                setTimeout(() => openChatSession(result.data), 500);
            }
        } else {
            alert('Lỗi: ' + result.message);
        }
    } catch (error) {
        console.error('Lỗi tạo phiên chat:', error);
        alert('Lỗi kết nối. Vui lòng thử lại!');
    } finally {
        CustomerSpinner.hide(spinner);
    }
}

// Hiển thị thông báo lỗi trong chatbox
function showChatboxError(message) {
    const chatboxMessages = document.getElementById('chatboxMessages');
    chatboxMessages.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full text-red-500">
            <div class="text-4xl mb-2">⚠️</div>
            <p class="text-sm text-center mb-3">${message}</p>
            <button onclick="loadChatMessages(window.currentChatSession.id)" 
                    class="bg-red-500 text-white px-4 py-2 rounded-lg text-xs hover:bg-red-600 transition">
                Thử lại
            </button>
        </div>
    `;
}

// Hiển thị thông báo thành công
function showSuccessMessage(message) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
    toast.innerHTML = `
        <div class="flex items-center">
            <span class="mr-2">✓</span>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Make loadChatSessions available globally for retry button
window.loadChatSessions = loadChatSessions;

// Thêm CSS cho animations nếu cần
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
    }
    .animate-pulse {
        animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
`;
document.head.appendChild(style);

// Thêm biến global để quản lý file đã chọn
let selectedImageFile = null;

// Cập nhật nội dung của hàm setupEventListeners đã tồn tại trước đó (dòng ~207)
function setupEventListeners() {
    // Mở modal tạo phiên chat mới
    const openModalBtn = document.getElementById('openModalCreateSession');
    const modalCreateSession = document.getElementById('modalCreateSession');
    const closeModalBtn = document.getElementById('closeModalCreateSession');
    
    if (openModalBtn) {
        openModalBtn.addEventListener('click', () => {
            modalCreateSession.classList.remove('hidden');
        });
    }
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            modalCreateSession.classList.add('hidden');
            // Reset form
            document.getElementById('cinemaSelect').value = '';
            document.getElementById('chatTopic').value = '';
        });
    }
    
    // Đóng modal khi click bên ngoài
    if (modalCreateSession) {
        modalCreateSession.addEventListener('click', (e) => {
            if (e.target === modalCreateSession) {
                modalCreateSession.classList.add('hidden');
                // Reset form
                document.getElementById('cinemaSelect').value = '';
                document.getElementById('chatTopic').value = '';
            }
        });
    }
    
    // Tạo phiên chat mới
    const startChatBtn = document.getElementById('startChatBtn');
    if (startChatBtn) {
        startChatBtn.addEventListener('click', async (e) => {
            e.preventDefault(); // Ngăn form submit
            
            const cinemaSelect = document.getElementById('cinemaSelect');
            const chatTopic = document.getElementById('chatTopic');
            
            if (cinemaSelect.value && chatTopic.value.trim()) {
                await createNewChatSession(cinemaSelect.value, chatTopic.value.trim());
                modalCreateSession.classList.add('hidden');
                // Reset form
                cinemaSelect.value = '';
                chatTopic.value = '';
            } else {
                alert('Vui lòng chọn rạp và nhập chủ đề chat');
            }
        });
    }
    
    // Đóng chatbox
    const closeChatBtn = document.getElementById('closeChatBtn');
    if (closeChatBtn) {
        closeChatBtn.addEventListener('click', () => {
            const chatboxFb = document.getElementById('chatboxFb');
            chatboxFb.style.display = 'none';
            window.currentChatSession = null;
        });
    }
    
    // Xử lý upload ảnh
    const fileInput = document.getElementById('chatbox-upload');
    const imagePreviewContainer = document.getElementById('image-preview');
    const previewImage = document.getElementById('preview-image');
    const imageName = document.getElementById('image-name');
    const imageSize = document.getElementById('image-size');
    const removeImageBtn = document.getElementById('remove-image');
    
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            // Kiểm tra kích thước file (giới hạn 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('Kích thước file quá lớn. Giới hạn 2MB.');
                fileInput.value = '';
                return;
            }
            
            // Kiểm tra loại file
            if (!file.type.match('image.*')) {
                alert('Vui lòng chọn file hình ảnh.');
                fileInput.value = '';
                return;
            }
            
            // Lưu file đã chọn
            selectedImageFile = file;
            
            // Hiển thị preview
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                imageName.textContent = file.name;
                imageSize.textContent = formatFileSize(file.size);
                imagePreviewContainer.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        });
    }
    
    // Xóa ảnh đã chọn
    // Hàm định dạng kích thước file
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
    
    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', function() {
            selectedImageFile = null;
            fileInput.value = '';
            imagePreviewContainer.classList.add('hidden');
        });
    }
    
    // Gửi tin nhắn - Ngăn form submit
    const chatboxForm = document.getElementById('chatboxForm');
    if (chatboxForm) {
        chatboxForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const input = document.getElementById('chatboxInput');
            const message = input.value.trim();
            
            // Kiểm tra xem có tin nhắn text hoặc ảnh không
            if (!message && !selectedImageFile) return;
            
            // Nếu có ảnh, sử dụng API upload ảnh
            if (selectedImageFile) {
                await sendMessageWithImage(message, selectedImageFile);
            } else {
                // Gửi tin nhắn text thông thường
                sendMessage(message);
            }
            
            // Xóa input và reset ảnh
            input.value = '';
            if (selectedImageFile) {
                selectedImageFile = null;
                fileInput.value = '';
                imagePreviewContainer.classList.add('hidden');
            }
        });
    }
    
    // Xử lý Enter key trong input
    const chatboxInput = document.getElementById('chatboxInput');
    if (chatboxInput) {
        chatboxInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); // Ngăn xuống dòng
                
                if (chatboxInput.value.trim()) {
                    sendMessage(chatboxInput.value.trim());
                    chatboxInput.value = '';
                }
            }
        });
    }
}

// Hàm gửi tin nhắn kèm ảnh qua socket
async function sendMessageWithImage(message, imageFile) {
    if (!window.currentChatSession) {
        alert('Vui lòng chọn phiên chat trước khi gửi tin nhắn');
        return;
    }
    
    const chatboxMessages = document.getElementById('chatboxMessages');
    
    // Tạo dữ liệu tin nhắn tạm thời để hiển thị ngay lập tức
    const messageData = {
        id: Date.now(),
        noi_dung: message,
        nguoi_gui: 1, // 1 = khách hàng
        created_at: new Date().toISOString(),
        has_image: true, // Đánh dấu là có ảnh
        loai_noi_dung: 2 // 2 = Hình ảnh
    };
    
    // Thêm tin nhắn vào khu vực chat (optimistic UI)
    const messageDiv = createMessageElement(messageData);
    chatboxMessages.appendChild(messageDiv);
    
    // Đánh dấu ảnh đang tải
    const imageContainer = messageDiv.querySelector('.message-image-container');
    if (imageContainer) {
        imageContainer.classList.add('image-uploading');
    }
    
    // Cuộn xuống cuối
    chatboxMessages.scrollTop = chatboxMessages.scrollHeight;
    
    // Cập nhật trạng thái phiên chat sang "Chờ phản hồi" nếu cần
    if (window.currentChatSession.trang_thai === 0) {
        window.currentChatSession.trang_thai = 1;
        updateSessionStatusToWaiting();
    }
    
    try {
        console.log('Đang gửi ảnh qua socket...');
        // Chuyển ảnh thành base64 để gửi qua socket
        const base64Image = await convertImageToBase64(imageFile);
        
        const byteCharacters = atob(base64Image);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });
        const imageUrl = URL.createObjectURL(blob);
        // Chuẩn bị dữ liệu gửi qua socket
        const defaultMessage = message || "Ảnh đã gửi";
        const socketData = {
            // Gửi cả hai format để đảm bảo tương thích
            id_phienchat: window.currentChatSession.id,
            idPhienChat: window.currentChatSession.id,
            noi_dung: defaultMessage, 
            noiDung: defaultMessage,
            loai_noi_dung: 2, // 2 = Hình ảnh
            loaiNoiDung: 2,
            nguoiGui: 1,
            image_data: base64Image,
            file_name: imageFile.name,
            file_type: imageFile.type,
            file_size: imageFile.size
        };
        
        // Gửi tin nhắn qua socket
        socket.emit('khach-hang-tu-van-gui-tin-nhan', JSON.stringify(socketData));
        
        // Cập nhật tin nhắn cuối cùng trong danh sách phiên chat
        updateOwnMessageInSessionList(window.currentChatSession.id, messageData);
        
        // Lắng nghe phản hồi từ server về việc lưu ảnh
        //const imageUploadResult = await waitForSocketResponse('image-upload-result', 30000); // timeout 30s
        
         const imageElement = messageDiv.querySelector('.message-image');
            if (imageElement) {
                imageElement.src = imageUrl;
                imageElement.dataset.fullImage = imageUrl;
                imageContainer.classList.remove('image-uploading');
            }
            
            // Cập nhật messageData với URL ảnh từ server
            messageData.image_url = imageUrl;
    } catch (error) {
        console.error('Lỗi khi gửi ảnh qua socket:', error);
        
        // Xử lý lỗi UI
        if (imageContainer) {
            imageContainer.classList.remove('image-uploading');
            imageContainer.classList.add('image-error');
        }
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'text-red-500 text-sm mt-1';
        errorDiv.textContent = 'Lỗi khi tải lên ảnh. Vui lòng thử lại.';
        messageDiv.appendChild(errorDiv);
    }
}

// Hàm chuyển đổi file ảnh thành base64
function convertImageToBase64(imageFile) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]); // Lấy phần base64 sau dấu phẩy
        reader.onerror = error => reject(error);
        reader.readAsDataURL(imageFile);
    });
}


// Tạo hàm renderChatMessages để hiển thị tin nhắn
function renderChatMessages(messages, pagination) {
    const chatboxMessages = document.getElementById('chatboxMessages');
    
    // Xóa nội dung cũ nếu đây không phải là load more
    if (currentChatPagination.isInitialLoad) {
        chatboxMessages.innerHTML = '';
        currentChatPagination.isInitialLoad = false;
    }
    
    // Kiểm tra nếu không có tin nhắn
    if (!messages || messages.length === 0) {
        // Hiển thị tin nhắn chào mừng nếu là lần đầu tiên load
        if (chatboxMessages.children.length === 0) {
            const welcomeMessage = {
                id: 0,
                noi_dung: 'Chào mừng bạn đến với EPIC Cinemas! Hãy để lại câu hỏi, chúng tôi sẽ phản hồi trong thời gian sớm nhất.',
                nguoi_gui: null, // Hệ thống
                created_at: new Date().toISOString()
            };
            
            const welcomeDiv = createMessageElement(welcomeMessage);
            chatboxMessages.appendChild(welcomeDiv);
        }
        return;
    }
    
    // Hiển thị các tin nhắn từ mới đến cũ
    messages.forEach(message => {
        const messageDiv = createMessageElement(message);
        chatboxMessages.appendChild(messageDiv);
    });
    
    // Hiển thị chỉ báo nếu còn tin nhắn cũ hơn
    if (pagination && pagination.has_more) {
        const loadMoreDiv = document.createElement('div');
        loadMoreDiv.className = 'text-center text-xs text-gray-500 py-3';
        loadMoreDiv.innerHTML = 'Cuộn lên để xem tin nhắn cũ hơn';
        chatboxMessages.insertBefore(loadMoreDiv, chatboxMessages.firstChild);
    }
    
    // Cuộn xuống dưới cùng khi load lần đầu
    chatboxMessages.scrollTop = chatboxMessages.scrollHeight;
}

// Cập nhật hàm tạo element cho tin nhắn để hỗ trợ loại nội dung
function createMessageElement(message) {
    const messageDiv = document.createElement('div');
    
    // Xác định loại người gửi: 1 = khách hàng, 2 = nhân viên, null = hệ thống
    let senderClass = 'staff';
    let senderName = 'Nhân viên';
    
    if (message.nguoi_gui === 1) {
        senderClass = 'user';
        senderName = 'Bạn';
    } else if (message.nguoi_gui === null) {
        senderClass = 'staff system';
        senderName = 'Hệ thống';
    }
    
    messageDiv.className = `chatbox-fb-message ${senderClass}`;
    
    // Format thời gian
    const messageTime = new Date(message.created_at).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Tạo phần header của tin nhắn
    const headerDiv = document.createElement('div');
    headerDiv.className = 'flex items-center justify-between mb-2 text-xs opacity-70';
    headerDiv.innerHTML = `
        <span>${senderName}</span>
        &nbsp; 
        <span>${messageTime}</span>
    `;
    messageDiv.appendChild(headerDiv);
    
    // Kiểm tra loại nội dung: 2 = Hình ảnh
    if (message.loai_noidung == 2 || message.has_image || message.image_url) {
        // Tin nhắn có ảnh
        // Nếu có nội dung text, và loại nội dung không phải là ảnh hoặc nội dung không có dạng URL hình ảnh
        if (message.noi_dung && message.noi_dung.trim() !== '' && (message.loai_noidung !== 2 || !message.noi_dung.includes('/chat-images/'))) {
            const textDiv = document.createElement('div');
            textDiv.style.lineHeight = '1.4';
            textDiv.style.wordWrap = 'break-word';
            textDiv.className = 'mb-2';
            textDiv.innerHTML = `<a href="${document.getElementById('chatboxMessages').dataset.urlminio}/hinh-anh/` +  message.noi_dung + `" target="_blank">${message.noi_dung}</a>`;
            //messageDiv.appendChild(textDiv);
        }
        
        // Tạo container cho ảnh
        const imageContainer = document.createElement('div');
        imageContainer.className = 'message-image-container';
        
        // Tạo phần tử ảnh
        const img = document.createElement('img');
        img.className = 'message-image cursor-pointer';
        img.loading = 'lazy';
        img.alt = 'Hình ảnh';
        // Xác định nguồn ảnh
        if (message.image_url) {
            img.src = message.image_url;
            img.dataset.fullImage = message.image_url;
            img.onclick = () => showFullImage(message.image_url);
        } else if (message.loai_noidung == 2 && message.noi_dung) {
            // Nếu loai_noidung là 2 và noi_dung là URL ảnh
            img.src = `${document.getElementById('chatboxMessages').dataset.urlminio}/hinh-anh/` + message.noi_dung;
            img.dataset.fullImage = message.noi_dung;
            img.onclick = () => showFullImage(message.noi_dung);
        } else if (selectedImageFile && (message.has_image || message.loai_noidung === 2)) {
            // Nếu đang upload ảnh (optimistic UI)
            img.src = URL.createObjectURL(selectedImageFile);
            img.onclick = () => showFullImage(img.src);
        } else {
            // Ảnh đang tải hoặc chưa có
            img.src = `${document.getElementById('sessionListUl').dataset.url}/images/loading-image.png`;
        }
        
        imageContainer.appendChild(img);
        messageDiv.appendChild(imageContainer);
        
    } else {
        // Tin nhắn text thông thường
        const contentDiv = document.createElement('div');
        contentDiv.style.lineHeight = '1.4';
        contentDiv.style.wordWrap = 'break-word';
        contentDiv.innerHTML = message.noi_dung;
        messageDiv.appendChild(contentDiv);
    }
    
    return messageDiv;
}
