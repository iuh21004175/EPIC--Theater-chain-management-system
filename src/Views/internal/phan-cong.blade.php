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
                <button id="btn-open-phancong-modal" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                    Phân công
                </button>
            </div>
            <div class="flex items-center gap-4 mb-4">
                <button id="prev-week" class="px-3 py-1 rounded border bg-white hover:bg-gray-100">&lt; Tuần trước</button>
                <span id="week-range" class="font-semibold text-blue-700"></span>
                <button id="next-week" class="px-3 py-1 rounded border bg-white hover:bg-gray-100">Tuần sau &gt;</button>
            </div>
            <div id="date-nav-container" class="grid grid-cols-7 gap-1 mb-6"></div>
                
            <div id="phancong-schedule-list" class="overflow-x-auto">
                <!-- JS sẽ render bảng phân công tuần tại đây -->
            </div>
        </div>

        <!-- Modal phân công cho 1 tuần -->
        <div id="phancong-modal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 hidden">
            <div class="bg-white rounded-lg shadow-lg w-full max-w-5xl p-6 relative"> <!-- Đổi max-w-3xl thành max-w-5xl -->
                <button id="btn-close-phancong-modal" class="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-2xl">&times;</button>
                <h4 class="text-lg font-bold mb-4">Phân công nhân viên cho tuần <span id="modal-week-range"></span></h4>
                <div class="mb-4 flex justify-end">
                    <button id="btn-auto-phancong" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Phân công tự động
                    </button>
                </div>
                <form id="phancong-form-modal">
                    <!-- Bảng phân công ca làm việc -->
                    <div class="overflow-x-auto">
                        <table class="min-w-full border text-center" id="phancong-shift-table">
                            <thead>
                                <tr>
                                    <th class="border px-2 py-1 bg-gray-100">Ca / Ngày</th>
                                    <th class="border px-2 py-1" id="header-mon"></th>
                                    <th class="border px-2 py-1" id="header-tue"></th>
                                    <th class="border px-2 py-1" id="header-wed"></th>
                                    <th class="border px-2 py-1" id="header-thu"></th>
                                    <th class="border px-2 py-1" id="header-fri"></th>
                                    <th class="border px-2 py-1" id="header-sat"></th>
                                    <th class="border px-2 py-1" id="header-sun"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="border px-2 py-1 font-semibold bg-gray-50">Ca sáng</td>
                                    @for($i=0;$i<7;$i++)
                                    <td class="border px-2 py-6 align-top">
                                        <div class="min-h-[64px] min-w-[120px] flex flex-col gap-2 items-center" id="cell-morning-{{$i}}">
                                            <!-- Danh sách nhân viên sẽ được JS render vào đây -->
                                            <button type="button"
                                                class="add-nv-btn w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-blue-500 hover:text-white text-2xl"
                                                data-shift="morning" data-day="{{$i}}" title="Thêm nhân viên">
                                                +
                                            </button>
                                        </div>
                                    </td>
                                    @endfor
                                </tr>
                                <tr>
                                    <td class="border px-2 py-1 font-semibold bg-gray-50">Ca chiều</td>
                                    @for($i=0;$i<7;$i++)
                                    <td class="border px-2 py-6 align-top">
                                        <div class="min-h-[64px] min-w-[120px] flex flex-col gap-2 items-center" id="cell-afternoon-{{$i}}">
                                            <!-- Danh sách nhân viên sẽ được JS render vào đây -->
                                            <button type="button"
                                                class="add-nv-btn w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-blue-500 hover:text-white text-2xl"
                                                data-shift="afternoon" data-day="{{$i}}" title="Thêm nhân viên">
                                                +
                                            </button>
                                        </div>
                                    </td>
                                    @endfor
                                </tr>
                                <tr>
                                    <td class="border px-2 py-1 font-semibold bg-gray-50">Ca tối</td>
                                    @for($i=0;$i<7;$i++)
                                    <td class="border px-2 py-6 align-top">
                                        <div class="min-h-[64px] min-w-[120px] flex flex-col gap-2 items-center" id="cell-evening-{{$i}}">
                                            <!-- Danh sách nhân viên sẽ được JS render vào đây -->
                                            <button type="button"
                                                class="add-nv-btn w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-blue-500 hover:text-white text-2xl"
                                                data-shift="evening" data-day="{{$i}}" title="Thêm nhân viên">
                                                +
                                            </button>
                                        </div>
                                    </td>
                                    @endfor
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="mt-4 flex justify-end">
                        <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                            Lưu phân công tuần
                        </button>
                    </div>
                </form>
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