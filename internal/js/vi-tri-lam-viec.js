import Spinner from './util/spinner.js';

// Hiển thị toast thông báo
function showToast(msg, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed top-6 right-6 z-[9999] px-4 py-2 rounded shadow text-white text-sm transition-all ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

// Render danh sách vị trí công việc
async function fetchAndRenderViTri() {
    const listDiv = document.getElementById('vitri-list');
    if (!listDiv) return;
    const spinner = Spinner.show({ target: listDiv, text: 'Đang tải...' });
    try {
        const res = await fetch(`${listDiv.dataset.url}/api/vi-tri-cong-viec`);
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Lỗi lấy danh sách vị trí');
        // Render table
        let html = `<table class="min-w-full border text-left"><thead>
            <tr>
                <th class="border px-3 py-2 bg-gray-100">#</th>
                <th class="border px-3 py-2 bg-gray-100">Tên vị trí</th>
                <th class="border px-3 py-2 bg-gray-100">Thao tác</th>
            </tr></thead><tbody>`;
        data.data.forEach((vt, idx) => {
            html += `<tr>
                <td class="border px-3 py-2">${idx + 1}</td>
                <td class="border px-3 py-2">
                    <span class="vitri-ten" data-id="${vt.id}" data-ten="${vt.ten}">${vt.ten}</span>
                </td>
                <td class="border px-3 py-2">
                    <button class="btn-sua-vitri text-blue-600 underline text-sm" data-id="${vt.id}" data-ten="${vt.ten}">Sửa</button>
                </td>
            </tr>`;
        });
        html += '</tbody></table>';
        listDiv.innerHTML = html;
    } catch (e) {
        listDiv.innerHTML = `<div class="text-red-600 py-4">${e.message}</div>`;
    } finally {
        Spinner.hide(spinner);
    }
}

// Thêm vị trí công việc
document.getElementById('vitri-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const input = document.getElementById('input-vitri');
    const listDiv = document.getElementById('vitri-list');
    if (!input.value.trim()) {
        showToast('Vui lòng nhập tên vị trí', 'error');
        return;
    }
    const btn = e.target.querySelector('button[type=submit]');
    const oldHtml = btn.innerHTML;
    const spinner = Spinner.show({ target: btn, size: 'sm' });
    btn.disabled = true;
    try {
        const res = await fetch(`${listDiv.dataset.url}/api/vi-tri-cong-viec`, {
            method: 'POST',
            body: new URLSearchParams({ ten: input.value.trim() }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Lỗi thêm vị trí');
        showToast('Thêm vị trí thành công');
        input.value = '';
        fetchAndRenderViTri();
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        Spinner.hide(spinner);
        btn.innerHTML = oldHtml;
        btn.disabled = false;
    }
});

// Sửa vị trí công việc (inline)
document.addEventListener('click', async e => {
    if (e.target.classList.contains('btn-sua-vitri')) {
        const id = e.target.dataset.id;
        const oldTen = e.target.dataset.ten;
        const newTen = prompt('Nhập tên vị trí mới:', oldTen);
        const listDiv = document.getElementById('vitri-list');
        if (newTen === null || newTen.trim() === '' || newTen === oldTen) return;
        const spinner = Spinner.show({ target: e.target, size: 'sm' });
        e.target.disabled = true;
        try {
            const res = await fetch(`${listDiv.dataset.url}/api/vi-tri-cong-viec/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ten: newTen.trim() }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || 'Lỗi sửa vị trí');
            showToast('Đã sửa vị trí thành công');
            fetchAndRenderViTri();
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            Spinner.hide(spinner);
            e.target.disabled = false;
        }
    }
});

// Tải danh sách vị trí khi vào tab
document.addEventListener('DOMContentLoaded', () => {
    fetchAndRenderViTri();
    // Nếu dùng tab động, có thể thêm sự kiện để gọi fetchAndRenderViTri khi chuyển tab
});

