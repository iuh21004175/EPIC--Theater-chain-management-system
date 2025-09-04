@extends('internal.layout')

@section('title', 'Xem lương theo tháng')

@section('breadcrumbs')
<li>
    <div class="flex items-center">
        <svg class="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
        <span class="ml-1 text-gray-500 hover:text-gray-700 text-sm font-medium">Bảng lương tháng</span>
    </div>
</li>
@endsection

@section('content')
<div class="px-4 py-6">
    <div class="flex justify-between items-center mb-4">
        <div>
            <button id="prev-month" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg shadow">&lt; Tháng trước</button>
            <button id="next-month" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg shadow">Tháng sau &gt;</button>
        </div>
        <h2 id="month-title" class="text-xl font-bold text-gray-800"></h2>
    </div>

    <div class="overflow-x-auto">
        <table class="w-full table-fixed border-collapse">
            <thead>
                <tr class="bg-gray-100 text-gray-700 text-sm font-semibold text-center">
                    <th class="p-2 border w-[40px]">Ngày</th>
                    <th class="p-2 border w-[80px]">Ca</th>
                    <th class="p-2 border w-[80px]">Giờ làm</th>
                    <th class="p-2 border w-[80px]">Hệ số</th>
                    <th class="p-2 border w-[120px]">Tiền lương (đ)</th>
                </tr>
            </thead>
            <tbody id="salary-body" class="text-center text-sm">
                <!-- Dữ liệu sẽ render ở đây -->
            </tbody>
            <tfoot>
                <tr class="bg-gray-200 font-semibold text-center">
                    <td colspan="4" class="p-2 border text-right">Tổng lương:</td>
                    <td id="total-salary" class="p-2 border text-green-700">0 đ</td>
                </tr>
            </tfoot>
        </table>
    </div>
</div>

<script>
document.addEventListener("DOMContentLoaded", () => {
    const salaryBody = document.getElementById("salary-body");
    const totalSalaryEl = document.getElementById("total-salary");
    const monthTitle = document.getElementById("month-title");
    const prevBtn = document.getElementById("prev-month");
    const nextBtn = document.getElementById("next-month");
    const currentBtn = document.getElementById("current-month");

    let currentDate = new Date(); // tháng hiện tại

    // Dữ liệu mẫu
    const sampleData = []; 
    const shifts = ["Sáng","Chiều","Tối"];
    
    // Tạo dữ liệu mẫu cho 1 tháng
    function generateSampleData(year, month) {
        sampleData.length = 0;
        const daysInMonth = new Date(year, month+1, 0).getDate();
        for(let d=1; d<=daysInMonth; d++){
            shifts.forEach(shift=>{
                const hours = Math.floor(Math.random()*4)+4; // 4-7 giờ
                const heSo = (Math.random()*1+1).toFixed(2); // 1.00-2.00
                const amount = Math.floor(hours*100000*heSo);
                sampleData.push({
                    day: d,
                    shift,
                    hours,
                    heSo,
                    amount
                });
            });
        }
    }

    function renderMonth(date){
        const year = date.getFullYear();
        const month = date.getMonth();
        monthTitle.innerText = `${date.toLocaleString('vi-VN',{month:'long'})} ${year}`;
        generateSampleData(year, month);

        salaryBody.innerHTML = '';
        let total = 0;
        sampleData.forEach(item=>{
            total += item.amount;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="p-2 border">${item.day}</td>
                <td class="p-2 border">${item.shift}</td>
                <td class="p-2 border">${item.hours}</td>
                <td class="p-2 border">${item.heSo}</td>
                <td class="p-2 border text-green-700 font-semibold">${item.amount.toLocaleString()} đ</td>
            `;
            salaryBody.appendChild(tr);
        });
        totalSalaryEl.innerText = total.toLocaleString()+' đ';
    }

    renderMonth(currentDate);

    prevBtn.addEventListener('click',()=>{
        currentDate.setMonth(currentDate.getMonth()-1);
        renderMonth(currentDate);
    });
    nextBtn.addEventListener('click',()=>{
        currentDate.setMonth(currentDate.getMonth()+1);
        renderMonth(currentDate);
    });
    currentBtn.addEventListener('click',()=>{
        currentDate = new Date();
        renderMonth(currentDate);
    });
});
</script>
@endsection
