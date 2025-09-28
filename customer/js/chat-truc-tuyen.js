import { socket } from "./util/socket.js";

// Khởi tạo khi DOM loaded
document.addEventListener('DOMContentLoaded', function() {
    // Ẩn modal tạo phiên chat ban đầu
    const modalCreateSession = document.getElementById('modalCreateSession');
    modalCreateSession.classList.add('hidden');
    
    // Hiển thị danh sách phiên chat
    const chatSessionList = document.getElementById('chatSessionList');
    chatSessionList.style.display = 'block';
    
    // Tải danh sách phiên chat từ server
    loadChatSessions();
    
    // Xử lý sự kiện
    setupEventListeners();
});

// Tải danh sách phiên chat
function loadChatSessions() {
    // Giả lập dữ liệu phiên chat (thay bằng API call thực tế)
    const sessions = [
        { id: 1, cinemaName: 'EPIC Cinema Nguyễn Văn Bảo', lastMessage: 'Xin chào! Tôi cần hỗ trợ...', timestamp: '10:30', status: 'active' },
        { id: 2, cinemaName: 'EPIC Cinema Quận 7', lastMessage: 'Cảm ơn bạn đã hỗ trợ', timestamp: 'Hôm qua', status: 'closed' },
        { id: 3, cinemaName: 'EPIC Cinema Bình Dương', lastMessage: 'Tôi muốn đặt vé...', timestamp: '15:20', status: 'active' }
    ];
    
    renderChatSessions(sessions);
}

// Render danh sách phiên chat
function renderChatSessions(sessions) {
    const sessionListUl = document.getElementById('sessionListUl');
    sessionListUl.innerHTML = '';
    
    if (sessions.length === 0) {
        sessionListUl.innerHTML = `
            <li class="p-4 text-center text-gray-500">
                Chưa có phiên chat nào. Hãy tạo phiên chat mới!
            </li>
        `;
        return;
    }
    
    sessions.forEach(session => {
        const statusBadge = session.status === 'active' 
            ? '<span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Đang hoạt động</span>'
            : '<span class="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">Đã đóng</span>';
            
        const sessionItem = document.createElement('li');
        sessionItem.innerHTML = `
            <div class="p-4 hover:bg-gray-50 cursor-pointer transition-colors" data-session-id="${session.id}">
                <div class="flex items-center justify-between mb-2">
                    <h4 class="font-semibold text-gray-800">${session.cinemaName}</h4>
                    ${statusBadge}
                </div>
                <p class="text-sm text-gray-600 mb-1">${session.lastMessage}</p>
                <p class="text-xs text-gray-400">${session.timestamp}</p>
            </div>
        `;
        
        sessionItem.addEventListener('click', () => openChatSession(session));
        sessionListUl.appendChild(sessionItem);
    });
}

// Mở phiên chat
function openChatSession(session) {
    const chatboxFb = document.getElementById('chatboxFb');
    const chatboxTitle = document.getElementById('chatboxTitle');
    const chatboxMessages = document.getElementById('chatboxMessages');
    
    chatboxTitle.textContent = `Chat với ${session.cinemaName}`;
    chatboxMessages.innerHTML = '';
    
    // Tải tin nhắn của phiên chat (giả lập)
    loadChatMessages(session.id);
    
    // Hiển thị chatbox
    chatboxFb.style.display = 'flex';
}

// Tải tin nhắn của phiên chat
function loadChatMessages(sessionId) {
    // Giả lập tin nhắn (thay bằng API call thực tế)
    const messages = [
        { sender: 'user', content: 'Xin chào! Tôi cần hỗ trợ đặt vé', timestamp: '10:25' },
        { sender: 'staff', content: 'Chào bạn! Tôi có thể giúp gì cho bạn?', timestamp: '10:26' },
        { sender: 'user', content: 'Tôi muốn đặt vé xem phim Avatar vào tối nay', timestamp: '10:27' }
    ];
    
    renderChatMessages(messages);
}

// Render tin nhắn chat
function renderChatMessages(messages) {
    const chatboxMessages = document.getElementById('chatboxMessages');
    chatboxMessages.innerHTML = '';
    
    messages.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbox-fb-message ${message.sender}`;
        messageDiv.textContent = message.content;
        chatboxMessages.appendChild(messageDiv);
    });
    
    // Scroll xuống cuối
    chatboxMessages.scrollTop = chatboxMessages.scrollHeight;
}

// Thiết lập event listeners
function setupEventListeners() {
    // Mở modal tạo phiên chat mới
    const openModalBtn = document.getElementById('openModalCreateSession');
    const modalCreateSession = document.getElementById('modalCreateSession');
    const closeModalBtn = document.getElementById('closeModalCreateSession');
    
    openModalBtn.addEventListener('click', () => {
        modalCreateSession.classList.remove('hidden');
    });
    
    closeModalBtn.addEventListener('click', () => {
        modalCreateSession.classList.add('hidden');
    });
    
    // Đóng modal khi click bên ngoài
    modalCreateSession.addEventListener('click', (e) => {
        if (e.target === modalCreateSession) {
            modalCreateSession.classList.add('hidden');
        }
    });
    
    // Tạo phiên chat mới
    const startChatBtn = document.getElementById('startChatBtn');
    startChatBtn.addEventListener('click', () => {
        const cinemaSelect = document.getElementById('cinemaSelect');
        if (cinemaSelect.value) {
            createNewChatSession(cinemaSelect.value);
            modalCreateSession.classList.add('hidden');
        } else {
            alert('Vui lòng chọn rạp');
        }
    });
    
    // Đóng chatbox
    const closeChatBtn = document.getElementById('closeChatBtn');
    closeChatBtn.addEventListener('click', () => {
        const chatboxFb = document.getElementById('chatboxFb');
        chatboxFb.style.display = 'none';
    });
    
    // Gửi tin nhắn
    const chatboxForm = document.getElementById('chatboxForm');
    chatboxForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('chatboxInput');
        if (input.value.trim()) {
            sendMessage(input.value.trim());
            input.value = '';
        }
    });
}

// Tạo phiên chat mới
function createNewChatSession(cinemaValue) {
    const cinemaNames = {
        'rap1': 'EPIC Cinema Nguyễn Văn Bảo',
        'rap2': 'EPIC Cinema Quận 7', 
        'rap3': 'EPIC Cinema Bình Dương'
    };
    
    const newSession = {
        id: Date.now(),
        cinemaName: cinemaNames[cinemaValue],
        lastMessage: 'Phiên chat mới được tạo',
        timestamp: 'Vừa xong',
        status: 'active'
    };
    
    // Thêm vào đầu danh sách
    const sessionListUl = document.getElementById('sessionListUl');
    const sessionItem = document.createElement('li');
    sessionItem.innerHTML = `
        <div class="p-4 hover:bg-gray-50 cursor-pointer transition-colors" data-session-id="${newSession.id}">
            <div class="flex items-center justify-between mb-2">
                <h4 class="font-semibold text-gray-800">${newSession.cinemaName}</h4>
                <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Đang hoạt động</span>
            </div>
            <p class="text-sm text-gray-600 mb-1">${newSession.lastMessage}</p>
            <p class="text-xs text-gray-400">${newSession.timestamp}</p>
        </div>
    `;
    
    sessionItem.addEventListener('click', () => openChatSession(newSession));
    sessionListUl.insertBefore(sessionItem, sessionListUl.firstChild);
    
    // Mở phiên chat mới
    openChatSession(newSession);
}

// Gửi tin nhắn
function sendMessage(content) {
    const chatboxMessages = document.getElementById('chatboxMessages');
    
    // Thêm tin nhắn của user
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chatbox-fb-message user';
    messageDiv.textContent = content;
    chatboxMessages.appendChild(messageDiv);
    
    // Scroll xuống cuối
    chatboxMessages.scrollTop = chatboxMessages.scrollHeight;
    
    // Giả lập phản hồi từ staff (thay bằng socket emit thực tế)
    setTimeout(() => {
        const staffReply = document.createElement('div');
        staffReply.className = 'chatbox-fb-message staff';
        staffReply.textContent = 'Cảm ơn bạn đã nhắn tin. Chúng tôi sẽ hỗ trợ bạn ngay!';
        chatboxMessages.appendChild(staffReply);
        chatboxMessages.scrollTop = chatboxMessages.scrollHeight;
    }, 1000);
}
