@extends('internal.layout')

@section('title', 'Duyệt yêu cầu')

@section('breadcrumbs')
<li>
    <div class="flex items-center">
        <svg class="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
        <span class="ml-1 text-gray-500 hover:text-gray-700 text-sm font-medium">Duyệt yêu cầu</span>
    </div>
</li>
@endsection

@section('content')
<div class="px-4 py-6 max-w-6xl mx-auto">

    <h2 class="text-2xl font-bold mb-6 text-center text-blue-600">Duyệt yêu cầu</h2>

    <!-- Tabs -->
    <div class="mb-6 border-b border-gray-200">
        <nav class="-mb-px flex space-x-4" aria-label="Tabs">
            <button class="tab-btn py-2 px-4 text-blue-600 border-b-2 border-blue-600 font-medium" data-tab="leave">Duyệt nghỉ làm</button>
            <button class="tab-btn py-2 px-4 text-gray-500 hover:text-blue-600 border-b-2 border-transparent font-medium" data-tab="article">Duyệt bài viết</button>
        </nav>
    </div>

    <!-- Duyệt nghỉ làm -->
    <div id="leave" class="tab-content">
        <div class="p-4 border rounded shadow bg-white">
            <h3 class="font-semibold mb-4">Danh sách yêu cầu nghỉ làm</h3>
            <table class="w-full border-collapse text-left">
                <thead>
                    <tr class="bg-gray-200">
                        <th class="p-2 border">Nhân viên</th>
                        <th class="p-2 border">Vị trí</th>
                        <th class="p-2 border">Ngày</th>
                        <th class="p-2 border">Ca</th>
                        <th class="p-2 border">Lý do</th>
                        <th class="p-2 border text-center">Trạng thái</th>
                        <th class="p-2 border text-center">Hành động</th>
                    </tr>
                </thead>
                <tbody id="leave-list">
                    <tr>
                        <td colspan="7" class="text-center text-gray-500 p-4">Đang tải dữ liệu...</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Duyệt bài viết -->
    <div id="article" class="tab-content hidden">
        <!-- Danh sách bài viết -->
        <div class="p-4 border rounded shadow bg-white" id="article-list-wrap">
            <h3 class="font-semibold mb-4">Danh sách bài viết chờ duyệt</h3>
            <table class="w-full border-collapse text-left">
                <thead>
                    <tr class="bg-gray-200">
                        <th class="p-2 border">Tác giả</th>
                        <th class="p-2 border">Tiêu đề</th>
                        <th class="p-2 border">Ngày tạo</th>
                        <th class="p-2 border text-center">Trạng thái</th>
                        <th class="p-2 border text-center">Hành động</th>
                    </tr>
                </thead>
                <tbody id="article-list">
                    <tr><td colspan="5" class="text-center text-gray-500 p-4">Đang tải dữ liệu...</td></tr>
                </tbody>
            </table>
        </div>

        <!-- Form xem & duyệt bài viết -->
        <div class="p-4 border rounded shadow bg-white hidden mt-6" id="article-detail">
            <h3 class="font-semibold mb-4 text-blue-600">📄 Xem / Duyệt bài viết</h3>

            <div class="mb-4">
                <label class="block font-medium mb-1">Tiêu đề</label>
                <input type="text" id="article-title" class="border rounded px-3 py-2 w-full bg-gray-100" readonly>
            </div>

            <div class="mb-4">
                <label class="block font-medium mb-1">Nội dung</label>
                <textarea id="article-content" rows="10" class="border rounded px-3 py-2 w-full"></textarea>
            </div>

            <div class="mb-4">
                <label class="block font-medium mb-1">Ảnh bài viết</label>
                <img id="article-image" class="hidden mt-2 max-h-64 rounded border">
            </div>

            <div class="text-right">
                <button id="approve-btn" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">✅ Duyệt</button>
                <button id="reject-btn" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 ml-2">❌ Từ chối</button>
                <button id="back-btn" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 ml-2">🔙 Quay lại</button>
            </div>
        </div>
    </div>
</div>

<script src="https://cdn.tiny.cloud/1/tluao2wh6pnxfechhnbj6wumfwolk3sulz86lkh62iu2mmjm/tinymce/6/tinymce.min.js" referrerpolicy="origin"></script>
<script>
document.addEventListener('DOMContentLoaded', () => {
    const baseUrl = "{{ $_ENV['URL_WEB_BASE'] }}";
    const urlMinio = "{{ $_ENV['MINIO_SERVER_URL'] }}";
    

    // Tabs 
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('text-blue-600','border-blue-600'));
            tabs.forEach(t => t.classList.add('text-gray-500','border-transparent'));
            tab.classList.add('text-blue-600','border-blue-600');
            tab.classList.remove('text-gray-500','border-transparent');
            contents.forEach(c => c.classList.add('hidden'));
            document.getElementById(tab.dataset.tab).classList.remove('hidden');
        });
    });

    // Load yêu cầu nghỉ
    async function fetchYeuCau() {
        const tbody = document.getElementById('leave-list');
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-gray-500 p-4">Đang tải dữ liệu...</td></tr>`;
        try {
            const res = await fetch(`${baseUrl}/api/doc-yeu-cau-da-gui`);
            const data = await res.json();
            if (!data.success || !data.data?.length) {
                tbody.innerHTML = `<tr><td colspan="7" class="text-center text-gray-500 p-4">Không có yêu cầu nào.</td></tr>`;
                return;
            }
            tbody.innerHTML = data.data.map(r => {
                const color = r.trang_thai==2?'bg-green-500':r.trang_thai==3?'bg-red-500':'bg-yellow-500';
                const text = r.trang_thai==2?'Đã duyệt':r.trang_thai==3?'Từ chối':'Chờ duyệt';
                return `
                    <tr>
                        <td class="p-2 border">${r.nhan_vien?.ten || '(Không rõ)'}</td>
                        <td class="p-2 border">${r.cong_viec?.ten || '-'}</td>
                        <td class="p-2 border">${new Date(r.ngay).toLocaleDateString('vi-VN')}</td>
                        <td class="p-2 border">${r.ca || '-'}</td>
                        <td class="p-2 border">${r.ly_do || '(Không có lý do)'}</td>
                        <td class="p-2 border text-center"><span class="px-2 py-1 text-white rounded ${color}">${text}</span></td>
                        <td class="p-2 border text-center">
                            ${r.trang_thai===1?`
                                <button class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600" onclick="duyetYeuCau(${r.id},true)">Duyệt</button>
                                <button class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 ml-2" onclick="duyetYeuCau(${r.id},false)">Từ chối</button>`:'-'}
                        </td>
                    </tr>`;
            }).join('');
        } catch { tbody.innerHTML=`<tr><td colspan="7" class="text-center text-red-500 p-4">Lỗi tải dữ liệu.</td></tr>`; }
    }

    window.duyetYeuCau = async (id,chapNhan)=>{
        if(!confirm(chapNhan?'Duyệt yêu cầu này?':'Từ chối yêu cầu này?'))return;
        await fetch(`${baseUrl}/api/duyet-yeu-cau-nghi/${id}`,{
            method:'PUT',headers:{'Content-Type':'application/json'},
            body:JSON.stringify({trang_thai:chapNhan?2:3})
        });fetchYeuCau();
    };

    // TinyMCE init
    tinymce.init({selector:'#article-content',height:400,menubar:false,toolbar:'undo redo | bold italic | alignleft aligncenter alignright'});

    // --- Duyệt & chỉnh sửa bài viết ---
const listWrap = document.getElementById('article-list-wrap');
const listBody = document.getElementById('article-list');
const detail = document.getElementById('article-detail');
const articleTitle = document.getElementById('article-title');
const img = document.getElementById('article-image');
const btnApprove = document.getElementById('approve-btn');
const btnReject = document.getElementById('reject-btn');
const btnBack = document.getElementById('back-btn');

let currentArticleId = null;

// === Thêm nút cập nhật bài viết ===
const updateBtn = document.createElement('button');
updateBtn.id = 'update-article-btn';
updateBtn.className = 'px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2';
updateBtn.textContent = '💾 Cập nhật bài viết';
detail.querySelector('.text-right').prepend(updateBtn);
updateBtn.classList.add('hidden');

// --- Fetch danh sách bài viết ---
async function fetchTinTuc() {
    listBody.innerHTML = `<tr><td colspan="5" class="text-center text-gray-500 p-4">Đang tải...</td></tr>`;
    const res = await fetch(`${baseUrl}/api/doc-tin-tuc-da-gui`);
    const data = await res.json();

    if (!data.success || !data.data?.length) {
        listBody.innerHTML = `<tr><td colspan="5" class="text-center text-gray-500 p-4">Không có bài viết nào.</td></tr>`;
        return;
    }

    listBody.innerHTML = data.data.map(bv => {
        const color = bv.trang_thai == 2 ? 'bg-green-500' :
                      bv.trang_thai == 3 ? 'bg-red-500' :
                      'bg-yellow-500';
        const text = bv.trang_thai == 2 ? 'Đã duyệt' :
                     bv.trang_thai == 3 ? 'Từ chối' :
                     'Chờ duyệt';
        return `
            <tr>
                <td class="p-2 border">${bv.tac_gia.ten || '(Không rõ)'}</td>
                <td class="p-2 border">${bv.tieu_de}</td>
                <td class="p-2 border">${new Date(bv.ngay_tao).toLocaleDateString('vi-VN')}</td>
                <td class="p-2 border text-center">
                    <span class="px-2 py-1 rounded text-white ${color}">${text}</span>
                </td>
                <td class="p-2 border text-center">
                    <button class="text-blue-600 hover:underline" onclick="xemTinTuc(${bv.id})">Xem & chỉnh sửa</button>
                </td>
            </tr>
        `;
    }).join('');
}

// --- Xem & chỉnh sửa bài viết ---
window.xemTinTuc = async (id) => {
    const res = await fetch(`${baseUrl}/api/chi-tiet-tin-tuc/${id}`);
    const data = await res.json();
    if (!data.success) return alert('Không tải được bài viết.');

    const bv = data.data;
    currentArticleId = id;

    // Đổ dữ liệu vào form
    articleTitle.value = bv.tieu_de;
    tinymce.get('article-content').setContent(bv.noi_dung || '');

    if (bv.anh_tin_tuc) {
        img.src = `${urlMinio}/${bv.anh_tin_tuc}`;
        img.classList.remove('hidden');
    } else {
        img.classList.add('hidden');
    }

    // Chuyển giao diện
    listWrap.classList.add('hidden');
    detail.classList.remove('hidden');
    updateBtn.classList.remove('hidden');
};

// --- Cập nhật bài viết ---
updateBtn.addEventListener('click', async () => {
    const title = articleTitle.value.trim();
    const content = tinymce.get('article-content').getContent();

    if (!currentArticleId) return alert('Không xác định bài để cập nhật.');
    if (!title || !content) return alert('Vui lòng nhập tiêu đề và nội dung.');

    const fd = new FormData();
    fd.append('tieu_de', title);
    fd.append('noi_dung', content);

    const imageInput = document.createElement('input');
    imageInput.type = 'file';
    imageInput.accept = 'image/*';

    // (Tùy chọn) Nếu bạn muốn chọn lại ảnh mới
    // có thể thêm trường input ảnh vào form hoặc bỏ qua dòng này

    const res = await fetch(`${baseUrl}/api/sua-tin-tuc/${currentArticleId}`, {
        method: 'POST',
        body: fd
    });
    const data = await res.json();

    if (data.success) {
        alert('Cập nhật thành công!');
        updateBtn.classList.add('hidden');
        fetchTinTuc();
    } else alert('Lỗi: ' + data.message);
});

// --- Duyệt / Từ chối ---
btnApprove.addEventListener('click', () => updateTrangThai(2));
btnReject.addEventListener('click', () => updateTrangThai(3));

async function updateTrangThai(status) {
    if (!currentArticleId) return;
    if (!confirm(status == 2 ? 'Duyệt bài viết này?' : 'Từ chối bài viết này?')) return;

    const res = await fetch(`${baseUrl}/api/duyet-tin-tuc/${currentArticleId}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ trang_thai: status })
    });

    const data = await res.json();
    if (data.success) {
        alert(status == 2 ? 'Đã duyệt bài viết!' : 'Đã từ chối!');
        btnBack.click();
        fetchTinTuc();
    } else alert('Lỗi cập nhật trạng thái.');
}

// --- Quay lại danh sách ---
btnBack.addEventListener('click', () => {
    detail.classList.add('hidden');
    listWrap.classList.remove('hidden');
    currentArticleId = null;
});

// --- Khởi động ---
fetchTinTuc();
    fetchYeuCau();

});
</script>
@endsection
