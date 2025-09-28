@extends('internal.layout')

@section('title', 'Xem lịch làm việc')

@section('breadcrumbs')
<li>
    <div class="flex items-center">
        <svg class="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
        <span class="ml-1 text-gray-500 hover:text-gray-700 text-sm font-medium">Lịch làm việc</span>
    </div>
</li>
@endsection

@section('content')
<div class="bg-white shadow-xl rounded-xl overflow-hidden">
    <!-- Header -->
    <div class="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
        <h2 class="text-xl font-bold text-gray-800">Lịch làm việc theo tuần</h2>
        <div class="flex space-x-2">
            <button id="prev-week" class="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg shadow-sm">&lt; Trước</button>
            <button id="current-week" class="px-3 py-2 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded-lg shadow-sm">Tuần này</button>
            <button id="next-week" class="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg shadow-sm">Sau &gt;</button>
        </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
        <table class="w-full border-collapse table-fixed">
            <thead>
                <tr id="week-header" class="bg-gray-100 text-gray-700 text-center text-sm font-semibold"></tr>
            </thead>
            <tbody class="text-center text-sm">
                <tr>
                    <td class="p-3 border bg-yellow-100 font-medium w-[100px]">Sáng</td>
                </tr>
                <tr>
                    <td class="p-3 border bg-yellow-100 font-medium">Chiều</td>
                </tr>
                <tr>
                    <td class="p-3 border bg-yellow-100 font-medium">Tối</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

<script>
document.addEventListener("DOMContentLoaded", () => {
    const weekHeader = document.getElementById("week-header");
    const prevBtn = document.getElementById("prev-week");
    const nextBtn = document.getElementById("next-week");
    const currentBtn = document.getElementById("current-week");
    const shifts = ["Ca sáng", "Ca chiều", "Ca tối"];

    // chỉnh lại cho đúng với route backend
    const baseUrl = "{{ $_ENV['URL_WEB_BASE'] }}"; 
    const apiBaseUrl = baseUrl + "/api/phan-cong-theo-nv";

    let currentMonday = getMonday(new Date());

    function getMonday(d) {
        d = new Date(d);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    }

    function formatDate(date) {
        return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
    }

    function formatDateISO(date) {
        return date.toISOString().split("T")[0]; // yyyy-mm-dd
    }

    async function renderWeek(startDate) {
        // clear header
        weekHeader.innerHTML = "";

        // Cột "Ca"
        const caCell = document.createElement("th");
        caCell.className = "p-3 border w-[100px] bg-gray-50";
        caCell.innerText = "Ca";
        weekHeader.appendChild(caCell);

        // 7 cột ngày
        const days = ["Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7","CN"];
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            dates.push(new Date(date));

            const th = document.createElement("th");
            th.className = "p-3 border text-center";
            th.innerHTML = `
                <div class="flex flex-col items-center">
                    <span class="font-semibold">${days[i]}</span>
                    <span class="text-blue-600 text-xs">${formatDate(date)}</span>
                </div>`;
            weekHeader.appendChild(th);
        }

        // clear body
        document.querySelectorAll("tbody tr").forEach(row => {
            row.querySelectorAll("td:not(:first-child)").forEach(td => td.remove());
        });

        // fetch dữ liệu từ API
        const batDau = formatDateISO(dates[0]);
        const ketThuc = formatDateISO(dates[6]);
        let data = [];
        try {
            const res = await fetch(`${apiBaseUrl}?bat_dau=${batDau}&ket_thuc=${ketThuc}`, {
                credentials: "include" // để gửi session PHP
            });
            const json = await res.json();
            if (json.success) data = json.data;
        } catch (e) {
            console.error("Fetch error:", e);
        }

        // fill vào bảng
        document.querySelectorAll("tbody tr").forEach((row, rowIndex) => {
            const shiftName = shifts[rowIndex];
            for (let i = 0; i < 7; i++) {
                const td = document.createElement("td");
                td.className = "p-3 border align-top text-left min-h-[100px]";

                const dateStr = formatDateISO(dates[i]);
             
                const jobs = data.filter(item => item.ngay === dateStr && item.ca === shiftName);

                if (jobs.length > 0) {
                    jobs.forEach(job => {
                        const div = document.createElement("div");
                        div.className = "bg-blue-50 border border-blue-200 text-blue-800 p-2 rounded-lg mb-2 shadow-sm text-left";
                        div.innerHTML = `
                            <p class="font-semibold text-sm">${job.cong_viec?.ten ?? "Không rõ"}</p>
                            <p class="text-xs text-gray-600">👤 ${job.nhan_vien?.ten ?? ""}</p>
                        `;
                        td.appendChild(div);
                    });
                } else {
                    td.innerHTML = `<span class="text-gray-400 italic text-xs">—</span>`;
                }

                row.appendChild(td);
            }
        });
    }

    renderWeek(currentMonday);

    prevBtn.addEventListener("click", () => {
        currentMonday.setDate(currentMonday.getDate() - 7);
        renderWeek(currentMonday);
    });
    nextBtn.addEventListener("click", () => {
        currentMonday.setDate(currentMonday.getDate() + 7);
        renderWeek(currentMonday);
    });
    currentBtn.addEventListener("click", () => {
        currentMonday = getMonday(new Date());
        renderWeek(currentMonday);
    });
});
</script>
@endsection
