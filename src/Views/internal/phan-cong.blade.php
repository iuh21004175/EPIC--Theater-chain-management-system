@extends('internal.layout')

@section('title', 'Quản lý phân công nhân viên')

@section('head')
    <script src="https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/dayjs@1/plugin/isoWeek.js"></script>
    <script>
        dayjs.extend(window.dayjs_plugin_isoWeek);
    </script>
    <script type="module" src="{{$_ENV['URL_INTERNAL_BASE']}}/js/phan-cong.js"></script>
    <script type="module" src="{{$_ENV['URL_INTERNAL_BASE']}}/js/vi-tri-lam-viec.js"></script>
    <style>
    .phancong-tooltip {
        min-width: 220px;
        pointer-events: none;
        transition: opacity 0.1s;
    }
    </style>
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
        <div class="flex flex-col lg:flex-row gap-6">
            <!-- Cột 1: Nhân viên -->
            <div class="lg:w-1/4 w-full bg-white rounded-lg shadow p-4 flex flex-col min-h-[400px]">
                <h3 class="text-lg font-bold mb-2">Nhân viên</h3>
                <div id="nv-list" class="flex-1 overflow-y-auto space-y-2 pr-2 min-h-[300px]" data-url="{{$_ENV['URL_WEB_BASE']}}">
                    <!-- JS render thẻ nhân viên -->
                </div>
                <!-- Thanh phân trang nhân viên -->
                <div id="nv-pagination-bar" class="flex justify-center mt-2 gap-1"></div>
            </div>
            <!-- Cột 2: Lịch phân công -->
            <div class="lg:w-3/4 w-full bg-white rounded-lg shadow p-4 flex flex-col">
                <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div class="flex items-center gap-3">
                        <button id="btn-prev-week" class="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700">&lt;</button>
                        <h3 id="week-title" class="text-lg font-bold"></h3>
                        <button id="btn-next-week" class="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700">&gt;</button>
                    </div>
                    <div class="flex gap-2">
                        <button id="btn-copy-week" class="bg-gray-200 px-3 py-1 rounded">Sao chép tuần trước</button>
                        <button id="btn-template" class="bg-gray-200 px-3 py-1 rounded">Bố cục</button>
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table id="phancong-main-table" class="min-w-full border text-center bg-white rounded-lg shadow">
                        <thead>
                            <tr id="phancong-header-row">
                                <!-- JS sẽ render các ngày thứ 2 -> CN -->
                            </tr>
                        </thead>
                        <tbody id="phancong-main-tbody" data-url="{{$_ENV['URL_WEB_BASE']}}">
                            <!-- JS sẽ render các hàng ca sáng, chiều, tối -->
                        </tbody>
                    </table>
                </div>
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

<!-- Modal Bố cục -->
<div id="modal-template" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 hidden">
    <div class="bg-white rounded-lg shadow-lg w-full max-w-3xl">
        <div class="flex justify-between items-center border-b px-6 py-4">
            <h2 class="text-lg font-bold">Thiết lập bố cục nhân sự</h2>
            <button id="btn-close-template" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        <div class="px-6 py-4">
            <div class="mb-4">
                <nav class="flex gap-2" id="nav-ca">
                    <button class="ca-btn px-3 py-1 rounded bg-blue-600 text-white" data-ca="morning">Ca sáng</button>
                    <button class="ca-btn px-3 py-1 rounded bg-gray-200 text-gray-700" data-ca="afternoon">Ca chiều</button>
                    <button class="ca-btn px-3 py-1 rounded bg-gray-200 text-gray-700" data-ca="evening">Ca tối</button>
                </nav>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full border text-center" >
                    <thead>
                        <tr>
                            <th class="border px-4 py-2 bg-gray-100">Vị trí / Ngày</th>
                            <th class="border px-4 py-2 bg-gray-100">Ngày thường</th>
                            <th class="border px-4 py-2 bg-gray-100">Cuối tuần</th>
                            <th class="border px-4 py-2 bg-gray-100">Ngày lễ</th>
                            <th class="border px-4 py-2 bg-gray-100">Ngày tết</th>
                        </tr>
                    </thead>
                    <tbody id="template-table-body" data-url="{{$_ENV['URL_WEB_BASE']}}">
                        <!-- JS render các vị trí và input số lượng -->
                    </tbody>
                </table>
            </div>
        </div>
        <div class="flex justify-end gap-2 px-6 py-4 border-t">
            <button id="btn-save-template" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Lưu</button>
            <button id="btn-cancel-template" class="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Hủy</button>
        </div>
    </div>
</div>

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