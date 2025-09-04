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
    <div class="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
        <h2 class="text-xl font-bold text-gray-800">Lịch làm việc theo tuần</h2>
        <div class="flex space-x-2">
            <button id="prev-week" class="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg shadow-sm">&lt; Trở về</button>
            <button id="next-week" class="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg shadow-sm">Tiếp &gt;</button>
        </div>
    </div>

    <div class="overflow-x-auto">
        <table class="w-full table-fixed border-collapse">
            <thead>
                <tr id="week-header" class="bg-gray-100 text-gray-700 text-center text-sm font-semibold">
                    </tr>
            </thead>
            <tbody class="text-center text-sm">
                <tr id="shift-sang" class="hover:bg-gray-50">
                    <td class="p-3 border bg-yellow-100 font-medium w-[120px] h-[600px] !important">Sáng</td>
                </tr>
                <tr id="shift-chieu" class="hover:bg-gray-50">
                    <td class="p-3 border bg-yellow-100 font-medium h-[600px] !important">Chiều</td>
                </tr>
                <tr id="shift-toi" class="hover:bg-gray-50">
                    <td class="p-3 border bg-yellow-100 font-medium h-[600px] !important">Tối</td>
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
    const shifts = ["Sáng", "Chiều", "Tối"];

    // Dữ liệu mẫu cho lịch làm việc.
    // dayOfWeek: 2-7 tương ứng với Thứ 2-7. Chủ Nhật là 8.
    const sampleData = [
        { dayOfWeek: 2, shift: "Sáng", job: "Họp dự án A", location: "Phòng họp 101" },
        { dayOfWeek: 3, shift: "Chiều", job: "Kiểm tra báo cáo tài chính", location: "Văn phòng" },
        { dayOfWeek: 4, shift: "Tối", job: "Lập kế hoạch marketing Q4", location: "Tại nhà" },
        { dayOfWeek: 4, shift: "Sáng", job: "Gặp gỡ khách hàng", location: "Quán cà phê X" },
        { dayOfWeek: 5, shift: "Chiều", job: "Đào tạo nhân viên mới", location: "Phòng đào tạo" },
        { dayOfWeek: 6, shift: "Sáng", job: "Tổng kết công việc tuần", location: "Văn phòng" },
        { dayOfWeek: 7, shift: "Tối", job: "Viết blog về công ty", location: "Tại nhà" },
        { dayOfWeek: 8, shift: "Tối", job: "Nghiên cứu thị trường", location: "Thư viện thành phố" },
    ];

    let currentMonday = getMonday(new Date());

    function getMonday(d) {
        d = new Date(d);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    }

    function formatDate(date) {
        return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    }
    
    // Hàm tạo và hiển thị dữ liệu mẫu
    function renderSampleData(day, shift, cell) {
        const dayOfWeek = day.getDay() === 0 ? 8 : day.getDay() + 1;
        const jobs = sampleData.filter(d => d.dayOfWeek === dayOfWeek && d.shift === shift);
        
        if (jobs.length > 0) {
            cell.innerHTML = "";
            jobs.forEach(job => {
                const jobDiv = document.createElement("div");
                jobDiv.className = "bg-blue-200 text-blue-800 p-2 rounded-lg mb-2 shadow-sm text-left";
                jobDiv.innerHTML = `
                    <p class="font-semibold text-sm">${job.job}</p>
                    <p class="text-xs text-gray-700">Tại: ${job.location}</p>
                `;
                cell.appendChild(jobDiv);
            });
        }
    }

    function renderWeek(startDate) {
        weekHeader.innerHTML = "";
        
        // ô "Lịch làm việc"
        const caHocCell = document.createElement("th");
        caHocCell.className = "p-3 border w-[120px] bg-gray-50";
        caHocCell.innerText = "Lịch làm việc";
        weekHeader.appendChild(caHocCell);

        const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);

            const th = document.createElement("th");
            // Thay đổi chiều rộng của các cột ngày
            th.className = "p-3 border w-[320px] min-w-[320px]";
            th.innerHTML = `
                <div class="flex flex-col">
                    <span class="font-semibold">${days[i]}</span>
                    <span class="text-blue-600 text-xs">${formatDate(date)}</span>
                </div>`;
            weekHeader.appendChild(th);
        }

        // update body
        document.querySelectorAll("tbody tr").forEach((row, rowIndex) => {
            const shiftName = shifts[rowIndex];
            // clear cũ (chừa cột đầu tiên)
            row.querySelectorAll("td:not(:first-child)").forEach(td => td.remove());

            for (let i = 0; i < 7; i++) {
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + i);

                const td = document.createElement("td");
                // Thay đổi chiều rộng của các ô nội dung
                td.className = "p-3 border w-[320px] min-h-[600px] !important hover:bg-gray-50 cursor-pointer align-top";
                td.innerHTML = `<span class="text-gray-400 italic"></span>`;
                
                // Thêm dữ liệu mẫu vào ô
                renderSampleData(date, shiftName, td);

                row.appendChild(td);
            }
        });
    }

    // render tuần hiện tại
    renderWeek(currentMonday);

    // event buttons
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