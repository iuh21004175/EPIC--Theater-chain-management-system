@extends('internal.layout')

@section('title', 'Quản lý phân công nhân viên')

@section('head')
    <script type="module" src="{{$_ENV['URL_INTERNAL_BASE']}}/js/phan-cong.js"></script>
    <script type="module" src="{{$_ENV['URL_INTERNAL_BASE']}}/js/vi-tri-lam-viec.js"></script>
  
@endsection

@section('breadcrumbs')
<li>
    <div class="flex items-center">
        <svg class="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
        <span class="ml-4 text-gray-500 font-medium">Quản lý phân công nhân viên</span>
    </div>
</li>
<li>
    <div class="flex items-center ml-4 space-x-2">
        <svg class="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
        <div class="flex rounded-md shadow-sm">
            <button id="tab-btn-phancong" class="tab-btn px-4 py-2 text-sm font-medium rounded-l-md bg-red-600 text-white" aria-current="page">
                Phân công
            </button>
            <button id="tab-btn-vitri" class="tab-btn px-4 py-2 text-sm font-medium rounded-r-md border border-gray-200 text-gray-700">
                Vị trí công việc
            </button>
        </div>
    </div>
</li>
@endsection

@section('content')
    <div id="tab-phancong" class="tab-content">
        <div class="bg-white shadow rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-bold">Lịch phân công tuần này</h3>
                <div class="flex gap-2">
                    <!-- <button id="btn-quick-phancong" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Phân công nhanh
                    </button> -->
                    <button id="btn-open-phancong-modal" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                        Phân công
                    </button>
                </div>
            </div>
            <div class="flex items-center gap-4 mb-4">
                <button id="prev-week" class="px-3 py-1 rounded border bg-white hover:bg-gray-100">&lt; Tuần trước</button>
                <span id="week-range" class="font-semibold text-blue-700"></span>
                <button id="next-week" class="px-3 py-1 rounded border bg-white hover:bg-gray-100">Tuần sau &gt;</button>
            </div>
                
            <div id="phancong-schedule-list" class="overflow-x-auto">
                <table class="min-w-full border text-center bg-white rounded-lg shadow">
                    <thead>
                        <tr>
                            <th class="border px-4 py-4 bg-gray-100 text-base font-bold sticky left-0 z-10">Ca / Ngày</th>
                            <th class="border px-4 py-4 text-base font-semibold" id="main-header-mon"></th>
                            <th class="border px-4 py-4 text-base font-semibold" id="main-header-tue"></th>
                            <th class="border px-4 py-4 text-base font-semibold" id="main-header-wed"></th>
                            <th class="border px-4 py-4 text-base font-semibold" id="main-header-thu"></th>
                            <th class="border px-4 py-4 text-base font-semibold" id="main-header-fri"></th>
                            <th class="border px-4 py-4 text-base font-semibold" id="main-header-sat"></th>
                            <th class="border px-4 py-4 text-base font-semibold" id="main-header-sun"></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="border px-4 py-8 font-semibold bg-gray-50 text-base sticky left-0 z-10">Ca sáng</td>
                            @for($i=0;$i<7;$i++)
                            <td class="border px-4 py-12 align-top min-h-[96px] min-w-[140px] bg-white hover:bg-gray-50 transition-colors duration-150"
                                id="main-cell-morning-{{$i}}">
                                <!-- JS sẽ render nội dung phân công ca sáng tại đây -->
                            </td>
                            @endfor
                        </tr>
                        <tr>
                            <td class="border px-4 py-8 font-semibold bg-gray-50 text-base sticky left-0 z-10">Ca chiều</td>
                            @for($i=0;$i<7;$i++)
                            <td class="border px-4 py-12 align-top min-h-[96px] min-w-[140px] bg-white hover:bg-gray-50 transition-colors duration-150"
                                id="main-cell-afternoon-{{$i}}">
                                <!-- JS sẽ render nội dung phân công ca chiều tại đây -->
                            </td>
                            @endfor
                        </tr>
                        <tr>
                            <td class="border px-4 py-8 font-semibold bg-gray-50 text-base sticky left-0 z-10">Ca tối</td>
                            @for($i=0;$i<7;$i++)
                            <td class="border px-4 py-12 align-top min-h-[96px] min-w-[140px] bg-white hover:bg-gray-50 transition-colors duration-150"
                                id="main-cell-evening-{{$i}}">
                                <!-- JS sẽ render nội dung phân công ca tối tại đây -->
                            </td>
                            @endfor
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    <div id="tab-vitri" class="tab-content hidden">
        <div class="bg-white shadow rounded-lg p-6">
            <h3 class="text-lg font-bold mb-4">Quản lý vị trí công việc</h3>
            <form id="vitri-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium mb-1">Tên vị trí công việc</label>
                    <input type="text" id="input-vitri" class="w-full border rounded px-3 py-2" placeholder="Nhập tên vị trí công việc">
                </div>
                <div>
                    <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Thêm vị trí</button>
                </div>
            </form>
            <div class="mt-8">
                <h4 class="font-semibold mb-2">Danh sách vị trí công việc</h4>
                <div id="vitri-list" class="overflow-x-auto" data-url="{{$_ENV['URL_WEB_BASE']}}">
                    <!-- JS sẽ render bảng vị trí công việc tại đây -->
                </div>
            </div>
        </div>
    </div>    
        
@endsection

<script>
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Đổi màu tab
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('bg-red-600', 'text-white'));
            this.classList.add('bg-red-600', 'text-white');
            // Ẩn tất cả tab-content
            document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
            // Hiện tab được chọn
            const tabId = this.id.replace('tab-btn-', 'tab-');
            document.getElementById(tabId).classList.remove('hidden');
        });
    });
});
</script>