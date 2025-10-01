import { socket } from './util/socket.js';
document.addEventListener('DOMContentLoaded', function() {
    const modalLogin = document.getElementById('modalLogin');
    const userId = document.getElementById('userid').value;
    const body = document.body;
    const btnOpen = document.getElementById('btn-open-chat');
    const btnClose = document.getElementById('btn-close-chat');
    const panel = document.getElementById('chatbox-panel');
    const form = document.getElementById('chatbox-form');
    const input = document.getElementById('chatbox-input');
    const messages = document.getElementById('chatbox-messages');
    const quickMessages = document.getElementById('quick-messages');
    
    // Biến để theo dõi trạng thái đã load lịch sử chat hay chưa
    let historyLoaded = false;
    
    // Mảng để lưu lịch sử chat
    let chatHistory = [];
    
    // Danh sách các tin nhắn nhanh theo chủ đề
    const quickMessageCategories = {
        phim: [
            "Phim đang chiếu hôm nay?",
            "Phim sắp chiếu là gì?",
            "Phim nào đang hot nhất?",
            "Phim có phụ đề tiếng Việt không?",
            "Phim này phù hợp với trẻ em không?"
        ],
        rapphim: [
            "Địa chỉ rạp?",
            "Rạp có chỗ đậu xe không?", 
            "Rạp mở cửa mấy giờ?",
            "Rạp có bao nhiêu phòng chiếu?",
            "Có phòng chiếu VIP không?"
        ],
        suatchieu: [
            "Suất chiếu phim hôm nay?",
            "Suất chiếu cuối cùng là mấy giờ?",
            "Còn vé cho suất 20h không?",
            "Suất chiếu sớm nhất là mấy giờ?",
            "Lịch chiếu cuối tuần này?"
        ],
        giave: [
            "Giá vé là bao nhiêu?",
            "Có giảm giá cho học sinh/sinh viên không?",
            "Giá vé ngày lễ có đắt hơn không?",
            "Combo vé và bắp nước giá sao?",
            "Có ưu đãi cho thành viên không?"
        ]
    };
    
    // Khởi tạo các tin nhắn nhanh
    function initQuickMessages(category = 'phim') {
        if (!quickMessages) return;
        
        // Tạo thanh danh mục
        if (!document.getElementById('quick-topics')) {
            const topicsDiv = document.createElement('div');
            topicsDiv.id = 'quick-topics';
            
            // Thêm bọc container để cải thiện layout
            const topicsContainer = document.createElement('div');
            topicsContainer.className = 'flex w-full justify-between space-x-1';
            topicsDiv.appendChild(topicsContainer);
            
            for (const cat in quickMessageCategories) {
                const btn = document.createElement('button');
                btn.className = `topic-btn ${cat === category ? 'active' : ''}`;
                btn.dataset.category = cat;
                
                switch(cat) {
                    case 'phim': btn.textContent = '🎬 Phim'; break;
                    case 'rapphim': btn.textContent = '🏢 Rạp'; break;
                    case 'suatchieu': btn.textContent = '🕒 Lịch'; break;
                    case 'giave': btn.textContent = '💰 Giá vé'; break;
                    default: btn.textContent = cat;
                }
                
                btn.addEventListener('click', function() {
                    document.querySelectorAll('.topic-btn').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    initQuickMessages(this.dataset.category);
                });
                
                topicsContainer.appendChild(btn);
            }
            
            quickMessages.parentNode.insertBefore(topicsDiv, quickMessages);
        }
        
        // Tạo các nút tin nhắn nhanh
        const messages = quickMessageCategories[category] || [];
        quickMessages.innerHTML = '';

        const container = document.createElement('div');
        container.className = 'flex space-x-2 pb-1'; // Thêm pb-1 để tránh bị cắt khi overflow

        messages.forEach(msg => {
            const btn = document.createElement('button');
            btn.className = 'px-3 py-1.5 bg-white text-blue-700 rounded-full text-xs border border-blue-200 hover:bg-blue-100 transition whitespace-nowrap flex-shrink-0';
            btn.textContent = msg;
            btn.addEventListener('click', () => {
                // Điền nội dung vào ô input
                if (input) {
                    input.value = msg;
                    input.focus();
                }
            });
            container.appendChild(btn);
        });

        quickMessages.appendChild(container);
    }

    function openModal(modal) { // Hiển thị modal đăng nhập
        modal.classList.add('is-open');
        body.classList.add('modal-open');
    }
    
    socket.on('connect', () => {
        // console.log('Kết nối tới server realtime thành công');
    });
    
    socket.on('disconnect', () => {
        // console.log('Mất kết nối tới server realtime');
    });
    
    socket.on('bot-ai-gui-tin-nhan', function(message) {
        console.log('Tin nhắn từ AI:', message);
        // Xóa dòng "Đang trả lời..."
        const typing = messages.querySelector('.ai-typing');
        if (typing) typing.remove();
        // Hiển thị tin nhắn AI
        appendMessage('AI', message, 'left');
        // Bật lại input và nút gửi
        input.disabled = false;
        form.querySelector('button[type="submit"]')?.removeAttribute('disabled');
        scrollToBottom();
        
        // Thêm tin nhắn từ AI vào lịch sử
        chatHistory.push({
            id: Date.now(),
            noi_dung: message,
            nguoi_gui: null, // AI
            created_at: new Date().toISOString()
        });
        
        // Gọi API lưu tin nhắn AI vào cookie
        saveMessageToCookie(message, null); // null = từ AI
    });
    
    if(userId && socket){
        socket.emit('khach-hang-truc-tuyen', userId);
    }
    
    function scrollToBottom() {
        messages.scrollTop = messages.scrollHeight;
    }

    // Hàm thêm tin nhắn vào khung chat
    function appendMessage(sender, content, position) {
        const messageClass = position === 'left' ? 'text-left text-gray-500' : 'text-right';
        const bubbleClass = position === 'left' ? 'bg-gray-100' : 'bg-blue-100 text-blue-900';
        const senderName = position === 'left' ? 'AI:' : 'Bạn:';
        
        messages.innerHTML += `
            <div class="mb-2 ${messageClass}">
                <b>${senderName}</b> 
                <span class="inline-block ${bubbleClass} rounded px-2 py-1">${content}</span>
            </div>
        `;
    }
    
    // Hàm gọi API lưu tin nhắn vào cookie
    async function saveMessageToCookie(message, nguoiGui = 1) {
        try {
            const response = await fetch(`${panel.dataset.url}/api/gui-tin-nhan-chatbot`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    'message': message,
                    'nguoi_gui': nguoiGui
                })
            });
            
            const result = await response.json();
            if (!result.success) {
                console.warn('Không thể lưu tin nhắn vào lịch sử chat:', result.error);
            }
        } catch (error) {
            console.error('Lỗi khi lưu tin nhắn vào lịch sử chat:', error);
        }
    }
    
    // Hàm lấy lịch sử chat từ API
    async function loadChatHistory() {
        if (historyLoaded) return; // Tránh load lại nhiều lần
        
        try {
            messages.innerHTML = '<div class="text-center py-4 text-gray-500"><i>Đang tải lịch sử chat...</i></div>';

            const response = await fetch(`${panel.dataset.url}/api/lich-su-chat`);
            const data = await response.json();
            
            if (data.success && data.data && Array.isArray(data.data)) {
                messages.innerHTML = ''; // Xóa thông báo đang tải
                
                // Cập nhật lịch sử chat
                chatHistory = data.data;
                
                // Hiển thị lịch sử chat
                chatHistory.forEach(msg => {
                    if (msg.nguoi_gui === 1) { // Người dùng
                        appendMessage('Bạn', msg.noi_dung, 'right');
                    } else { // AI hoặc hệ thống
                        appendMessage('AI', msg.noi_dung, 'left');
                    }
                });
                
                historyLoaded = true;
            } else {
                messages.innerHTML = '<div class="text-center py-4 text-gray-500"><i>Không thể tải lịch sử chat.</i></div>';
                chatHistory = [];
            }
        } catch (error) {
            console.error('Lỗi khi tải lịch sử chat:', error);
            messages.innerHTML = '<div class="text-center py-4 text-gray-500"><i>Đã xảy ra lỗi khi tải lịch sử chat.</i></div>';
            chatHistory = [];
        }
        
        scrollToBottom();
    }

    if (btnOpen && panel) btnOpen.onclick = () => {
        panel.classList.remove('hidden');
        btnOpen.classList.add('hidden');
        setTimeout(() => input && input.focus(), 200);
        
        if(userId && socket){
            // Load lịch sử chat khi mở chatbox
            loadChatHistory();
        }
        
        // Khởi tạo tin nhắn nhanh
        initQuickMessages();
        
        scrollToBottom();
    };
    
    if (btnClose && panel) btnClose.onclick = () => {
        panel.classList.add('hidden');
        btnOpen.classList.remove('hidden');
    };
    
    if (form && input && messages) form.onsubmit = function(e) {
        e.preventDefault();
        if(!userId){
            alert("Vui lòng đăng nhập!");
            openModal(modalLogin);
            panel.classList.add('hidden');
            btnOpen.classList.remove('hidden');
            return;
        }
        
        const msg = input.value.trim();
        if (!msg) return;
        
        // Hiển thị tin nhắn người dùng
        appendMessage('Bạn', msg, 'right');
        input.value = '';
        
        // Thêm tin nhắn mới vào lịch sử chat
        const newUserMessage = {
            id: Date.now(),
            noi_dung: msg,
            nguoi_gui: 1, // User
            created_at: new Date().toISOString()
        };
        chatHistory.push(newUserMessage);
        
        // Gọi API lưu tin nhắn người dùng vào cookie
        saveMessageToCookie(msg, 1); // 1 = từ khách hàng
        
        // Thêm dòng "Đang trả lời..." với class để dễ xóa
        messages.innerHTML += `<div class="mb-2 text-left text-gray-500 ai-typing"><b>AI:</b> <span class="inline-block bg-gray-100 rounded px-2 py-1"><i>Đang trả lời...</i></span></div>`;
        
        // Vô hiệu hóa input và nút gửi
        input.disabled = true;
        form.querySelector('button[type="submit"]')?.setAttribute('disabled', 'disabled');
        scrollToBottom();
        
        // Gửi tin nhắn lên server realtime (nếu có socket)
        if (socket) {
            // Gửi tin nhắn mới và toàn bộ lịch sử chat
            socket.emit('khach-hang-gui-tin-nhan', JSON.stringify({
                msg: msg, 
                id: userId,
                history: chatHistory // Gửi toàn bộ lịch sử chat
            }));
        } else {
            // Nếu không có socket, có thể gửi API thường ở đây
            const typing = messages.querySelector('.ai-typing');
            if (typing) typing.remove();
            appendMessage('AI', 'Không thể kết nối AI.', 'left');
            input.disabled = false;
            form.querySelector('button[type="submit"]')?.removeAttribute('disabled');
            scrollToBottom();
        }
    };

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && panel) panel.classList.add('hidden');
    });
});

document.addEventListener('DOMContentLoaded', function() {
    // Khi đã tạo xong chatbox và các nút
    const toolbar = document.querySelector('.category-toolbar');
    if (toolbar) {
        const buttons = toolbar.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.addEventListener('click', function() {
                buttons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                initQuickMessages(this.dataset.category);
            });
        });
    }
});