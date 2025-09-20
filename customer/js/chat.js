import { io } from "https://cdn.socket.io/4.8.1/socket.io.esm.min.js";
document.addEventListener('DOMContentLoaded', function() {
    const btnOpen = document.getElementById('btn-open-chat');
    const btnClose = document.getElementById('btn-close-chat');
    const panel = document.getElementById('chatbox-panel');
    const form = document.getElementById('chatbox-form');
    const input = document.getElementById('chatbox-input');
    const messages = document.getElementById('chatbox-messages');

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
        socket.on('ai-response', (data) => {
            // messages.innerHTML += `<div class="mb-2 text-left text-gray-500"><b>AI:</b> <span class="inline-block bg-gray-100 rounded px-2 py-1">${data.message}</span></div>`;
            // scrollToBottom();
        });
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
        const msg = input.value.trim();
        if (!msg) return;
        messages.innerHTML += `<div class="mb-2 text-right"><b>Bạn:</b> <span class="inline-block bg-blue-100 text-blue-900 rounded px-2 py-1">${msg}</span></div>`;
        input.value = '';
        messages.innerHTML += `<div class="mb-2 text-left text-gray-500"><b>AI:</b> <span class="inline-block bg-gray-100 rounded px-2 py-1"><i>Đang trả lời...</i></span></div>`;
        scrollToBottom();
        // Gửi tin nhắn lên server realtime (nếu có socket)
        if (socket) {
            socket.emit('khach-hang-gui-tin-nhan', msg);
        } else {
            // Nếu không có socket, có thể gửi API thường ở đây
            messages.innerHTML += `<div class="mb-2 text-left text-gray-500"><b>AI:</b> <span class="inline-block bg-gray-100 rounded px-2 py-1"><i>Không thể kết nối AI.</i></span></div>`;
            scrollToBottom();
        }
    };

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && panel) panel.classList.add('hidden');
    });

});