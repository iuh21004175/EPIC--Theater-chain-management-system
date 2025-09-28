<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Chat trực tuyến - EPIC CINEMAS</title>
  <link rel="stylesheet" href="{{$_ENV['URL_WEB_BASE']}}/css/tailwind.css">
  <script type="module" src="{{$_ENV['URL_WEB_BASE']}}/js/chat-truc-tuyen.js"></script>
</head>
<body class="bg-gray-50 text-gray-800 font-sans">
@include('customer.layout.header')


<main>
  <section class="container mx-auto max-w-screen-xl px-4 py-16">
    <h2 class="text-3xl font-bold text-center mb-10">Chat trực tuyến với rạp</h2>
    <hr class="border-t-2 border-blue-500 w-48 mx-auto mb-10">
    <!-- Modal tạo phiên chat -->
    <div id="modalCreateSession" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 hidden">
      <div class="bg-white rounded-xl shadow-lg w-full max-w-md p-8 relative">
        <button id="closeModalCreateSession" class="absolute top-3 right-4 text-2xl text-gray-400 hover:text-red-500">&times;</button>
        <h3 class="text-xl font-bold mb-6 text-center">Tạo phiên chat mới</h3>
        <select id="cinemaSelect" class="w-full p-3 rounded-lg border border-gray-300 mb-6">
          <option value="">-- Chọn rạp --</option>
          <option value="rap1">EPIC Cinema Nguyễn Văn Bảo</option>
          <option value="rap2">EPIC Cinema Quận 7</option>
          <option value="rap3">EPIC Cinema Bình Dương</option>
        </select>
        <button id="startChatBtn" class="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition w-full">Tạo phiên chat</button>
      </div>
    </div>

    <!-- Danh sách phiên chat -->
    <div id="chatSessionList" class="max-w-md mx-auto mb-10">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-semibold">Danh sách phiên chat</h3>
        <button id="openModalCreateSession" class="bg-blue-600 text-white px-4 py-1 rounded-full font-semibold hover:bg-blue-700 transition">+ Tạo phiên mới</button>
      </div>
      <ul id="sessionListUl" class="divide-y divide-gray-200 bg-white rounded-xl shadow">
        <!-- Các phiên chat sẽ render ở đây -->
      </ul>
    </div>

    <!-- Chatbox Messenger style -->
    <div id="chatboxFb" class="chatbox-fb" style="display:none;">
      <div class="chatbox-fb-header flex items-center justify-between px-5 py-3 bg-gradient-to-r from-blue-700 to-blue-400 text-white">
        <span id="chatboxTitle" class="font-semibold text-lg">Chat với rạp</span>
        <button id="closeChatBtn" class="text-white text-2xl font-bold hover:text-red-200" title="Đóng">&times;</button>
      </div>
      <div id="chatboxMessages" class="chatbox-fb-messages flex-1 overflow-y-auto bg-gray-50 p-4 flex flex-col gap-2"></div>
      <form id="chatboxForm" class="chatbox-fb-input flex border-t bg-white p-3 gap-2">
        <input id="chatboxInput" type="text" placeholder="Nhập tin nhắn..." autocomplete="off" class="flex-1 px-4 py-2 rounded-full bg-gray-100 border border-gray-300 focus:outline-none" />
        <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition">Gửi</button>
      </form>
    </div>
  </section>
</main>

<style>
  .chatbox-fb {
    background: #fff;
    border-radius: 1.25rem;
    box-shadow: 0 4px 32px 0 rgba(37,99,235,0.10);
    border: 1px solid #e5e7eb;
    max-width: 420px;
    min-width: 320px;
    min-height: 480px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    z-index: 50;
    transition: box-shadow 0.2s;
  }
  .chatbox-fb-header {
    background: linear-gradient(90deg, #2563eb 60%, #60a5fa 100%);
    color: #fff;
    padding: 1rem 1.25rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: 600;
    font-size: 1.1rem;
  }
  .chatbox-fb-messages {
    flex: 1;
    overflow-y: auto;
    background: #f3f6fa;
    padding: 1.25rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .chatbox-fb-input input {
    flex: 1;
    border: none;
    outline: none;
    background: #f3f6fa;
    border-radius: 1.25rem;
    padding: 0.5rem 1rem;
    font-size: 1rem;
  }
  .chatbox-fb-input button {
    background: #2563eb;
    color: #fff;
    border: none;
    border-radius: 1.25rem;
    padding: 0.5rem 1.5rem;
    font-weight: 600;
    font-size: 1rem;
    transition: background 0.2s;
  }
  .chatbox-fb-input button:hover {
    background: #1d4ed8;
  }
  .chatbox-fb-message {
    max-width: 80%;
    padding: 0.5rem 1rem;
    border-radius: 1.25rem;
    font-size: 1rem;
    word-break: break-word;
    display: inline-block;
  }
  .chatbox-fb-message.user {
    background: #2563eb;
    color: #fff;
    align-self: flex-end;
    border-bottom-right-radius: 0.25rem;
  }
  .chatbox-fb-message.staff {
    background: #e5e7eb;
    color: #222;
    align-self: flex-start;
    border-bottom-left-radius: 0.25rem;
  }
  .chatbox-fb-select {
    margin: 2rem auto 0 auto;
    max-width: 400px;
    background: #fff;
    border-radius: 1.25rem;
    box-shadow: 0 4px 32px 0 rgba(37,99,235,0.10);
    border: 1px solid #e5e7eb;
    padding: 2rem 2rem 1.5rem 2rem;
    text-align: center;
  }
</style>

@include('customer.layout.footer')
<script>
    // Không cho hiển thị nút chatbot AI
    document.addEventListener('DOMContentLoaded', function() {
        // Mã JavaScript ở đây
        document.getElementById('btn-open-chat').style.display = 'none';
    });
</script>