@extends('internal.layout')

@section('title', 'Quản lý suất chiếu')

@section('head')
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
<script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
<script type="module" src="{{$_ENV['URL_INTERNAL_BASE']}}/js/suat-chieu.js"></script>
<style>
    .flatpickr-calendar {
        z-index: 9999 !important;
    }
    .time-slot {
        cursor: pointer;
        transition: all 0.2s;
    }
    .time-slot:hover {
        background-color: #f3f4f6;
    }
    .time-slot.selected {
        background-color: #2563eb !important;
        color: #fff !important;
        border-color: #2563eb !important;
        font-weight: bold;
    }
</style>
@endsection

@section('breadcrumbs')
<li>
    <div class="flex items-center">
        <svg class="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
        <span class="ml-1 text-gray-500 hover:text-gray-700 text-sm font-medium">Quản lý suất chiếu</span>
    </div>
</li>
@endsection

@section('content')
<div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex items-center justify-between mb-6">
        <h1 class="text-xl font-bold text-gray-900">Quản lý suất chiếu</h1>
        <button id="btn-log" class="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-md flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 4h6a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Nhật ký
        </button>
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
                <!-- Nội dung nhật ký sẽ được cập nhật bằng JavaScript -->
                <div class="text-gray-500 text-center">Đang tải nhật ký...</div>
            </div>
        </div>
    </div>

    <!-- Bộ lọc và chọn ngày - Phương án 1: Navigation theo tuần -->
    <div class="mb-6">
        <div class="flex justify-between items-center mb-2">
            <h2 class="text-sm font-medium text-gray-700">Chọn ngày chiếu</h2>
            <div class="flex items-center space-x-2">
                <button id="prev-week" class="p-1 rounded-md hover:bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                </button>
                <span id="week-range" class="text-sm font-medium">03/09 - 09/09/2025</span>
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
                <button id="btn-add-showtime" class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
                Thêm suất chiếu mới
                </button>
            </div>
        </div>
    </div>

    <!-- Danh sách phim và suất chiếu -->
    <div id="showtime-listing" class="space-y-6 overflow-auto max-h-[60vh]" data-url="{{$_ENV['URL_WEB_BASE']}}" data-urlminio="{{$_ENV['MINIO_SERVER_URL']}}">
        <!-- Nội dung sẽ được cập nhật bằng JavaScript -->
        
    </div>

    <!-- Modal thêm/cập nhật suất chiếu -->
    <div id="showtime-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden z-50">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div class="p-6 border-b flex justify-between items-center">
                <h2 id="modal-title" class="text-xl font-bold text-gray-900">Thêm suất chiếu mới</h2>
                <button id="btn-close-modal" class="text-gray-500 hover:text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div class="overflow-y-auto px-6 py-4 flex-1 max-h-[60vh]">
                <form id="showtime-form">
                    <input type="hidden" id="showtime-id" name="id" value="">
                    <input type="hidden" id="showtime-date" name="date" value="">

                    <!-- Chọn phim -->
                    <div class="mb-4">
                        <label for="movie-search" class="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm phim</label>
                        <div class="relative">
                            <input type="text" id="movie-search" class="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm" placeholder="Nhập tên phim..." autocomplete="off">
                            <input type="hidden" id="selected-movie-id" name="movie_id">
                            <div id="movie-search-results" class="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md hidden max-h-60 overflow-auto"></div>
                        </div>
                        <div id="selected-movie-info" class="mt-2 hidden">
                            <div class="flex items-center p-2 border rounded-md bg-gray-50">
                                <img id="selected-movie-poster" src="" alt="Movie poster" class="w-12 h-16 object-cover mr-3">
                                <div>
                                    <h4 id="selected-movie-title" class="font-medium"></h4>
                                    <p id="selected-movie-duration" class="text-sm text-gray-600"></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Chọn phòng chiếu -->
                    <div class="mb-4">
                        <label for="room-select" class="block text-sm font-medium text-gray-700 mb-1">Phòng chiếu</label>
                        <select id="room-select" name="room_id" multiple class="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm">
                            <option value="">-- Chọn phòng chiếu --</option>
                            <!-- Danh sách phòng sẽ được tải bằng JavaScript -->
                        </select>
                        <p class="text-xs text-gray-500 mt-1">Giữ Ctrl (Windows) hoặc Cmd (Mac) để chọn nhiều phòng</p>
                    </div>

                    <!-- Khung giờ -->
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Thời gian chiếu</label>
                        <div class="flex space-x-2" id="single-time-row">
                            <div class="flex-1">
                                <label for="start-time" class="block text-xs text-gray-500 mb-1">Giờ bắt đầu</label>
                                <input type="text" id="start-time" name="start_time" class="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm" placeholder="Chọn giờ bắt đầu">
                            </div>
                            <div class="flex-1">
                                <label for="end-time" class="block text-xs text-gray-500 mb-1">Giờ kết thúc</label>
                                <input type="text" id="end-time" name="end_time" class="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm" disabled>
                            </div>
                        </div>
                        <div id="per-room-times" class="space-y-4 hidden"></div>
                    </div>

                    <!-- Khung giờ gợi ý -->
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Khung giờ gợi ý</label>
                        <div id="suggested-times" class="space-y-4">
                            <!-- Các khung giờ sẽ được tạo bằng JavaScript -->
                        </div>
                    </div>
                </form>
            </div>
            <div class="flex justify-end space-x-3 mt-6 px-6 py-3 border-t">
                <button type="button" id="btn-cancel" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md">Hủy</button>
                <button type="submit" form="showtime-form" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">Lưu</button>
            </div>
        </div>
    </div>

    <!-- Modal xác nhận -->
    <div id="confirm-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden z-50">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div class="p-6">
                <h2 class="text-xl font-bold text-gray-900 mb-4">Xác nhận xóa</h2>
                <p class="text-gray-700 mb-6">Bạn có chắc chắn muốn xóa suất chiếu này? Hành động này không thể hoàn tác.</p>
                <div class="flex justify-end space-x-3">
                    <button id="btn-cancel-delete" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md">Hủy</button>
                    <button id="btn-confirm-delete" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md">Xóa</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Toast notification -->
    <div id="toast" class="fixed bottom-4 right-4 px-4 py-2 bg-green-500 text-white rounded-md shadow-lg transform transition-transform duration-300 translate-y-20 opacity-0">
        <span id="toast-message">Thao tác thành công</span>
    </div>
</div>


@endsection