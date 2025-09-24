@extends('internal.layout')

@section('title', 'Duyệt suất chiếu - Chi tiết rạp')

@section('head')
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
<script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
<script type="module" src="{{$_ENV['URL_INTERNAL_BASE']}}/js/duyet-suat-chieu-chi-tiet.js"></script>
<style>
    .flatpickr-calendar { z-index: 9999 !important; }
    .time-slot { cursor: pointer; transition: all 0.2s; }
    .time-slot:hover { background-color: #f3f4f6; }
</style>
@endsection

@section('breadcrumbs')
<li>
    <div class="flex items-center">
        <svg class="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
        <span class="ml-1 text-gray-500 hover:text-gray-700 text-sm font-medium">Danh sách rạp</span>
    </div>
</li>
<li>
    <div class="flex items-center">
        <svg class="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
        <span class="ml-1 text-gray-500 hover:text-gray-700 text-sm font-medium">Duyệt suất chiếu</span>
    </div>
</li>
@endsection

@section('content')
<div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex items-center justify-between mb-6">
        <h1 class="text-xl font-bold text-gray-900">Duyệt suất chiếu</h1>
        <button id="btn-log" class="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-md flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 4h6a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Nhật ký
            <span id="log-badge" class="ml-2 inline-block min-w-[20px] px-1.5 py-0.5 rounded-full bg-red-600 text-white text-xs font-bold align-middle hidden"></span>
        </button>
    </div>
    <p id="cinema-name" class="text-sm text-gray-600 mt-1" data-soSuatChuaXem="{{$rapPhim['so_suat_chua_xem'] ?? 0}}">
        Rạp: <span class="font-medium">{{$rapPhim['ten']}}</span>
    </p>

    <!-- Tổng suất chiếu theo tình trạng của cả tuần -->
    <div class="flex items-center gap-2 mb-6 justify-center">
        <span class="bg-yellow-200 text-yellow-900 text-sm font-semibold px-3 py-1 rounded-full">
            Chờ duyệt (tuần): <span class="font-medium" id="waiting-approval-week">0</span>
        </span>
        <span class="bg-green-200 text-green-900 text-sm font-semibold px-3 py-1 rounded-full">
            Đã duyệt (tuần): <span class="font-medium" id="approved-week">0</span>
        </span>
        <span class="bg-red-200 text-red-900 text-sm font-semibold px-3 py-1 rounded-full">
            Từ chối (tuần): <span class="font-medium" id="rejected-week">0</span>
        </span>
        <span class="bg-blue-200 text-blue-900 text-sm font-semibold px-3 py-1 rounded-full">
            Chờ duyệt lại (tuần): <span class="font-medium" id="waiting-for-reapproval-week">0</span>
        </span>
    </div>

    <div class="mb-6">
        <div class="flex justify-between items-center mb-2">
            <h2 class="text-sm font-medium text-gray-700">Chọn ngày chiếu</h2>
            <div class="flex items-center space-x-2">
                <button id="prev-week" class="p-1 rounded-md hover:bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                </button>
                <span id="week-range" class="text-sm font-medium">—</span>
                <button id="next-week" class="p-1 rounded-md hover:bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>
        <div id="date-nav-container" class="grid grid-cols-7 gap-1"></div>
        <input type="hidden" id="date-picker" value="">
        <div class="mt-6 flex justify-between items-center">
            <div id="week-status" class="text-sm text-gray-600"></div>
            <div class="flex items-center space-x-2">
                <button id="btn-approve-week" class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md">Gửi duyệt/duyệt tuần</button>
            </div>
        </div>
    </div>
    <!-- Số suất chiếu theo tình trạng của ngày đang chọn -->
    <div class="flex items-center gap-2 mb-6">
        <span class="bg-yellow-50 text-yellow-700 text-sm font-semibold px-3 py-1 rounded-full">
            Chờ duyệt (ngày): <span class="font-medium" id="waiting-approval-day">0</span>
        </span>
        <span class="bg-green-50 text-green-700 text-sm font-semibold px-3 py-1 rounded-full">
            Đã duyệt (ngày): <span class="font-medium" id="approved-day">{{$so_suat_theo_ngay['da_duyet'] ?? 0}}</span>
        </span>
        <span class="bg-red-50 text-red-700 text-sm font-semibold px-3 py-1 rounded-full">
            Từ chối (ngày): <span class="font-medium" id="rejected-day">{{$so_suat_theo_ngay['tu_choi'] ?? 0}}</span>
        </span>
        <span class="bg-blue-50 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full">
            Chờ duyệt lại (ngày): <span class="font-medium" id="waiting-for-reapproval-day">{{$so_suat_theo_ngay['cho_duyet_lai'] ?? 0}}</span>
        </span>
    </div>
    <div id="showtime-listing" class="space-y-6 overflow-auto max-h-[60vh]" data-url="{{$_ENV['URL_WEB_BASE']}}" data-urlminio="{{$_ENV['MINIO_SERVER_URL']}}" data-rap="{{$rapPhim['id'] ?? ''}}">
    </div>

    <!-- Modal nhập lý do từ chối -->
    <div id="reject-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden z-50">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div class="p-6 border-b">
                <h2 class="text-xl font-bold text-gray-900">Nhập lý do từ chối</h2>
            </div>
            <div class="p-6">
                <textarea id="reject-reason" rows="4" class="w-full border rounded-md p-2" placeholder="Lý do từ chối..."></textarea>
                <div class="flex justify-end space-x-3 mt-4">
                    <button id="btn-cancel-reject" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md">Hủy</button>
                    <button id="btn-confirm-reject" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md">Xác nhận</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Overlay modal for log -->
    <div id="log-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden z-50">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div class="p-6 border-b flex justify-between items-center">
                <h2 class="text-xl font-bold text-gray-900">Nhật ký thao tác</h2>
                <button id="btn-close-log" class="text-gray-500 hover:text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div class="overflow-y-auto px-6 py-4 flex-1 max-h-[60vh]" id="log-content">
                <div class="text-gray-500 text-center">Đang tải nhật ký...</div>
            </div>
        </div>
    </div>

    <!-- Toast -->
    <div id="toast" class="fixed bottom-4 right-4 px-4 py-2 bg-green-500 text-white rounded-md shadow-lg transform transition-transform duration-300 translate-y-20 opacity-0">
        <span id="toast-message">Thao tác thành công</span>
    </div>
</div>
@endsection


