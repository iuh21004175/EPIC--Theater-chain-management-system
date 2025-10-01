@extends('internal.layout')

@section('title', 'Quản lý yêu cầu')

@section('breadcrumbs')
<li>
    <div class="flex items-center">
        <svg class="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
        <span class="ml-1 text-gray-500 hover:text-gray-700 text-sm font-medium">Quản lý yêu cầu</span>
    </div>
</li>
@endsection

@section('content')
<div class="px-4 py-6 max-w-4xl mx-auto">

    <h2 class="text-2xl font-bold mb-6 text-center text-blue-600">Quản lý yêu cầu</h2>

    <!-- Tabs -->
    <div class="mb-6 border-b border-gray-200">
        <nav class="-mb-px flex space-x-4" aria-label="Tabs">
            <button class="tab-btn py-2 px-4 text-blue-600 border-b-2 border-blue-600 font-medium" data-tab="leave">Gửi nghỉ làm</button>
            <button class="tab-btn py-2 px-4 text-gray-500 hover:text-blue-600 border-b-2 border-transparent font-medium" data-tab="article">Gửi viết bài</button>
        </nav>
    </div>

    <!-- Tab content -->
    <div id="leave" class="tab-content">
        <div class="mb-6 p-4 border rounded shadow bg-white">
            <h3 class="font-semibold mb-4">Thông tin yêu cầu nghỉ làm</h3>

            <div class="mb-4">
                <label class="block font-medium mb-1">Chọn ngày nghỉ</label>
                <input type="date" id="leave-date" class="border rounded px-3 py-2 w-full">
            </div>

            <div class="mb-4">
                <label class="block font-medium mb-1">Chọn ca</label>
                <select id="leave-shift" class="border rounded px-3 py-2 w-full">
                    <option value="">-- Chọn ca --</option>
                    <option value="0">Ca sáng</option>
                    <option value="1">Ca chiều</option>
                    <option value="2">Ca tối</option>
                </select>
            </div>

            <div class="mb-4">
                <label class="block font-medium mb-1">Lý do</label>
                <textarea id="leave-reason" rows="3" class="border rounded px-3 py-2 w-full" placeholder="Nhập lý do xin nghỉ"></textarea>
            </div>

            <div class="text-right">
                <button id="send-request" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Gửi yêu cầu</button>
            </div>
        </div>

        <!-- Danh sách yêu cầu đã gửi -->
        <div class="mb-6 p-4 border rounded shadow bg-gray-50">
            <h3 class="font-semibold mb-4">Danh sách yêu cầu đã gửi</h3>
            <table class="w-full border-collapse text-left">
                <thead>
                    <tr class="bg-gray-200">
                        <th class="p-2 border">Ngày</th>
                        <th class="p-2 border">Ca</th>
                        <th class="p-2 border">Lý do</th>
                        <th class="p-2 border">Trạng thái</th>
                    </tr>
                </thead>
                <tbody id="leave-requests">
                    <!-- Các hàng sẽ được render JS -->
                </tbody>
            </table>
        </div>
    </div>

    <div id="article" class="tab-content hidden">
        <div class="mb-6 p-4 border rounded shadow bg-white">
            <h3 class="font-semibold mb-4">Gửi viết bài chờ duyệt</h3>

            <div class="mb-4">
                <label class="block font-medium mb-1">Tiêu đề bài viết</label>
                <input type="text" id="article-title" class="border rounded px-3 py-2 w-full" placeholder="Nhập tiêu đề">
            </div>

            <div class="mb-4">
                <label class="block font-medium mb-1">Nội dung</label>
                <textarea id="article-content" rows="5" class="border rounded px-3 py-2 w-full" placeholder="Nhập nội dung bài viết"></textarea>
            </div>

            <div class="text-right">
                <button id="send-article" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Gửi bài</button>
            </div>
        </div>

        <div class="mb-6 p-4 border rounded shadow bg-gray-50">
            <h3 class="font-semibold mb-4">Danh sách bài viết chờ duyệt</h3>
            <table class="w-full border-collapse text-left">
                <thead>
                    <tr class="bg-gray-200">
                        <th class="p-2 border">Tiêu đề</th>
                        <th class="p-2 border">Trạng thái</th>
                    </tr>
                </thead>
                <tbody id="article-requests">
                    <!-- Các hàng sẽ được render JS -->
                </tbody>
            </table>
        </div>
    </div>

</div>

<script>
document.addEventListener('DOMContentLoaded', () => {
    // Tab switching
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => {
                t.classList.remove('text-blue-600', 'border-blue-600');
                t.classList.add('text-gray-500', 'border-transparent');
            });
            tab.classList.add('text-blue-600', 'border-blue-600');
            tab.classList.remove('text-gray-500', 'border-transparent');

            contents.forEach(c => c.classList.add('hidden'));
            document.getElementById(tab.dataset.tab).classList.remove('hidden');
        });
    });

    // --- Nghỉ làm ---
    const sendBtn = document.getElementById('send-request');
    const leaveDate = document.getElementById('leave-date');
    const leaveShift = document.getElementById('leave-shift');
    const leaveReason = document.getElementById('leave-reason');
    const leaveRequests = document.getElementById('leave-requests');

    let requests = [
        { date: '2025-09-01', shift: 0, reason: 'Bệnh', status: 'Chờ duyệt' },
        { date: '2025-09-03', shift: 1, reason: 'Việc gia đình', status: 'Đã duyệt' }
    ];

    function renderLeaveRequests(){
        leaveRequests.innerHTML = '';
        requests.forEach(r => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="p-2 border">${r.date}</td>
                <td class="p-2 border">${['Ca sáng','Ca chiều','Ca tối'][r.shift]}</td>
                <td class="p-2 border">${r.reason}</td>
                <td class="p-2 border">
                    <span class="px-2 py-1 rounded text-white ${r.status==='Đã duyệt'?'bg-green-500':r.status==='Từ chối'?'bg-red-500':'bg-yellow-500'}">${r.status}</span>
                </td>
            `;
            leaveRequests.appendChild(tr);
        });
    }
    renderLeaveRequests();

    sendBtn.addEventListener('click', ()=>{
        if(!leaveDate.value || leaveShift.value==='' || !leaveReason.value.trim()){
            alert('Vui lòng điền đầy đủ thông tin!');
            return;
        }

        requests.push({
            date: leaveDate.value,
            shift: parseInt(leaveShift.value),
            reason: leaveReason.value.trim(),
            status: 'Chờ duyệt'
        });

        leaveDate.value='';
        leaveShift.value='';
        leaveReason.value='';
        renderLeaveRequests();
        alert('Yêu cầu đã được gửi!');
    });

    // --- Viết bài ---
    const sendArticleBtn = document.getElementById('send-article');
    const articleTitle = document.getElementById('article-title');
    const articleContent = document.getElementById('article-content');
    const articleRequests = document.getElementById('article-requests');

    let articles = [
        { title: 'Bài viết 1', status: 'Chờ duyệt' },
        { title: 'Bài viết 2', status: 'Đã duyệt' }
    ];

    function renderArticleRequests(){
        articleRequests.innerHTML = '';
        articles.forEach(a => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="p-2 border">${a.title}</td>
                <td class="p-2 border">
                    <span class="px-2 py-1 rounded text-white ${a.status==='Đã duyệt'?'bg-green-500':'bg-yellow-500'}">${a.status}</span>
                </td>
            `;
            articleRequests.appendChild(tr);
        });
    }
    renderArticleRequests();

    sendArticleBtn.addEventListener('click', ()=>{
        if(!articleTitle.value.trim() || !articleContent.value.trim()){
            alert('Vui lòng điền đầy đủ thông tin!');
            return;
        }

        articles.push({
            title: articleTitle.value.trim(),
            status: 'Chờ duyệt'
        });

        articleTitle.value='';
        articleContent.value='';
        renderArticleRequests();
        alert('Bài viết đã được gửi!');
    });
});
</script>
@endsection
