import { io } from "https://cdn.socket.io/4.8.1/socket.io.esm.min.js";
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

    function openModal(modal) { // Hiển thị modal đăng nhập
        modal.classList.add('is-open');
        body.classList.add('modal-open');
    }
    // Kết nối tới server realtime nếu URL được cung cấp
    const urlRealtiem = document.getElementById('ai-chatbox').dataset.urlrealtiem;
    let socket;
    if (urlRealtiem) {
        socket = io(urlRealtiem);
        socket.on('connect', () => {
            // console.log('Kết nối tới server realtime thành công');
        });
        socket.on('disconnect', () => {
            // console.log('Mất kết nối tới server realtime');
        });
        socket.on('bot-ai-gui-tin-nhan', function(message) {
            // Xóa dòng "Đang trả lời..."
            const typing = messages.querySelector('.ai-typing');
            if (typing) typing.remove();
            // Hiển thị tin nhắn AI
            messages.innerHTML += `<div class="mb-2 text-left text-gray-500"><b>AI:</b> <span class="inline-block bg-gray-100 rounded px-2 py-1">${message}</span></div>`;
            // Bật lại input và nút gửi
            input.disabled = false;
            form.querySelector('button[type="submit"]')?.removeAttribute('disabled');
            scrollToBottom();
        });
    }
    if(userId && socket){
        socket.emit('khach-hang-truc-tuyen', userId);
    }
    function scrollToBottom() {
        messages.scrollTop = messages.scrollHeight;
    }

    if (btnOpen && panel) btnOpen.onclick = () => {
        panel.classList.remove('hidden');
        btnOpen.classList.add('hidden');
        setTimeout(() => input && input.focus(), 200);
        scrollToBottom();

    };
    if (btnClose && panel) btnClose.onclick = () => {
        panel.classList.add('hidden');
        btnOpen.classList.remove('hidden');
    };
    if (form && input && messages) form.onsubmit = function(e) {
        e.preventDefault();
        if(!userId){
            openModal(modalLogin);
            panel.classList.add('hidden');
            btnOpen.classList.remove('hidden');
            return;
        }
        const msg = input.value.trim();
        if (!msg) return;
        messages.innerHTML += `<div class="mb-2 text-right"><b>Bạn:</b> <span class="inline-block bg-blue-100 text-blue-900 rounded px-2 py-1">${msg}</span></div>`;
        input.value = '';
        // Thêm dòng "Đang trả lời..." với class để dễ xóa
        messages.innerHTML += `<div class="mb-2 text-left text-gray-500 ai-typing"><b>AI:</b> <span class="inline-block bg-gray-100 rounded px-2 py-1"><i>Đang trả lời...</i></span></div>`;
        // Vô hiệu hóa input và nút gửi
        input.disabled = true;
        form.querySelector('button[type="submit"]')?.setAttribute('disabled', 'disabled');
        scrollToBottom();
        // Gửi tin nhắn lên server realtime (nếu có socket)
        if (socket) {
            socket.emit('khach-hang-gui-tin-nhan', JSON.stringify({msg, id: userId}));
        } else {
            // Nếu không có socket, có thể gửi API thường ở đây
            const typing = messages.querySelector('.ai-typing');
            if (typing) typing.remove();
            messages.innerHTML += `<div class="mb-2 text-left text-gray-500"><b>AI:</b> <span class="inline-block bg-gray-100 rounded px-2 py-1"><i>Không thể kết nối AI.</i></span></div>`;
            input.disabled = false;
            form.querySelector('button[type="submit"]')?.removeAttribute('disabled');
            scrollToBottom();
        }
    };

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && panel) panel.classList.add('hidden');
    });

});