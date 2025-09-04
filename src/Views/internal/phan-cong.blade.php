@extends('internal.layout')

@section('title', 'Quản lý phân công nhân viên')

@section('head')
    <script type="module" src="{{$_ENV['URL_INTERNAL_BASE']}}/js/phan-cong.js"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
    <script src="https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/vn.js"></script>
    <style>
        .tab-active {
            @apply text-red-600 border-b-2 border-red-600 font-medium;
        }
        .shift-card {
            @apply border rounded-lg p-4 mb-4 bg-white shadow-sm hover:shadow-md transition-shadow;
        }
        .shift-card.morning {
            @apply border-l-4 border-l-yellow-500;
        }
        .shift-card.afternoon {
            @apply border-l-4 border-l-blue-500;
        }
        .shift-card.evening {
            @apply border-l-4 border-l-purple-500;
        }
        .employee-tag {
            @apply inline-flex items-center rounded-full bg-gray-100 py-1 pl-2 pr-1 text-sm font-medium text-gray-700 mr-2 mb-2;
        }
        .employee-tag button {
            @apply flex-shrink-0 ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-500 focus:outline-none focus:bg-gray-500 focus:text-white;
        }
    </style>
@endsection

@section('breadcrumbs')
<li>
    <div class="flex items-center">
        <svg class="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
        <span class="ml-1 text-gray-500 hover:text-gray-700 text-sm font-medium">Phân công nhân viên</span>
    </div>
</li>
@endsection

@section('content')
    <!-- Page header -->
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Quản lý phân công nhân viên</h1>
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-200 mb-6">
        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
            <a href="#" id="tab-schedule" class="tab-active py-4 px-1 text-sm font-medium">
                Phân công
            </a>
            <a href="#" id="tab-rules" class="text-gray-500 hover:text-gray-700 py-4 px-1 text-sm font-medium">
                Quy tắc lập lịch
            </a>
        </nav>
    </div>

    <!-- Phân công tab content -->
    <div id="content-schedule" class="mb-6">
        <div class="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <div class="mb-6">
                <label for="schedule-date" class="block text-sm font-medium text-gray-700 mb-2">Chọn ngày phân công</label>
                <div class="flex space-x-4">
                    <input type="text" id="schedule-date" class="focus:ring-red-500 focus:border-red-500 block w-full sm:w-64 shadow-sm sm:text-sm border-gray-300 rounded-md" placeholder="Chọn ngày">
                    <button id="btn-prev-day" class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                        <svg class="-ml-0.5 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                        Ngày trước
                    </button>
                    <button id="btn-today" class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                        Hôm nay
                    </button>
                    <button id="btn-next-day" class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                        Ngày sau
                        <svg class="-mr-0.5 ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>

            <h3 class="text-lg font-medium text-gray-900 mb-4" id="selected-date-display">Phân công cho ngày: <span class="font-bold">Hôm nay, 03/09/2025</span></h3>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Ca sáng -->
                <div class="shift-card morning">
                    <div class="flex justify-between items-center mb-4">
                        <h4 class="text-md font-medium text-gray-900">Ca sáng (08:00 - 12:00)</h4>
                        <span class="bg-yellow-100 text-yellow-800 text-xs font-medium py-1 px-2 rounded">
                            <span id="morning-count">3</span>/<span id="morning-max">4</span> nhân viên
                        </span>
                    </div>
                    <div class="mb-4 min-h-20" id="morning-employees">
                        <div class="employee-tag">
                            <span>Nguyễn Văn A</span>
                            <button type="button" data-employee-id="1" class="btn-remove-employee">
                                <svg class="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                                    <path stroke-linecap="round" stroke-width="1.5" d="M1 1l6 6m0-6L1 7" />
                                </svg>
                            </button>
                        </div>
                        <div class="employee-tag">
                            <span>Trần Thị B</span>
                            <button type="button" data-employee-id="2" class="btn-remove-employee">
                                <svg class="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                                    <path stroke-linecap="round" stroke-width="1.5" d="M1 1l6 6m0-6L1 7" />
                                </svg>
                            </button>
                        </div>
                        <div class="employee-tag">
                            <span>Lê Văn C</span>
                            <button type="button" data-employee-id="3" class="btn-remove-employee">
                                <svg class="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                                    <path stroke-linecap="round" stroke-width="1.5" d="M1 1l6 6m0-6L1 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <button type="button" data-shift="morning" class="btn-add-employee w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                        <svg class="-ml-1 mr-1 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                        </svg>
                        Thêm nhân viên
                    </button>
                </div>

                <!-- Ca chiều -->
                <div class="shift-card afternoon">
                    <div class="flex justify-between items-center mb-4">
                        <h4 class="text-md font-medium text-gray-900">Ca chiều (12:00 - 18:00)</h4>
                        <span class="bg-blue-100 text-blue-800 text-xs font-medium py-1 px-2 rounded">
                            <span id="afternoon-count">4</span>/<span id="afternoon-max">5</span> nhân viên
                        </span>
                    </div>
                    <div class="mb-4 min-h-20" id="afternoon-employees">
                        <div class="employee-tag">
                            <span>Phạm Thị D</span>
                            <button type="button" data-employee-id="4" class="btn-remove-employee">
                                <svg class="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                                    <path stroke-linecap="round" stroke-width="1.5" d="M1 1l6 6m0-6L1 7" />
                                </svg>
                            </button>
                        </div>
                        <div class="employee-tag">
                            <span>Hoàng Văn E</span>
                            <button type="button" data-employee-id="5" class="btn-remove-employee">
                                <svg class="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                                    <path stroke-linecap="round" stroke-width="1.5" d="M1 1l6 6m0-6L1 7" />
                                </svg>
                            </button>
                        </div>
                        <div class="employee-tag">
                            <span>Vũ Thị F</span>
                            <button type="button" data-employee-id="6" class="btn-remove-employee">
                                <svg class="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                                    <path stroke-linecap="round" stroke-width="1.5" d="M1 1l6 6m0-6L1 7" />
                                </svg>
                            </button>
                        </div>
                        <div class="employee-tag">
                            <span>Đặng Văn G</span>
                            <button type="button" data-employee-id="7" class="btn-remove-employee">
                                <svg class="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                                    <path stroke-linecap="round" stroke-width="1.5" d="M1 1l6 6m0-6L1 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <button type="button" data-shift="afternoon" class="btn-add-employee w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                        <svg class="-ml-1 mr-1 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                        </svg>
                        Thêm nhân viên
                    </button>
                </div>

                <!-- Ca tối -->
                <div class="shift-card evening">
                    <div class="flex justify-between items-center mb-4">
                        <h4 class="text-md font-medium text-gray-900">Ca tối (18:00 - 22:00)</h4>
                        <span class="bg-purple-100 text-purple-800 text-xs font-medium py-1 px-2 rounded">
                            <span id="evening-count">3</span>/<span id="evening-max">5</span> nhân viên
                        </span>
                    </div>
                    <div class="mb-4 min-h-20" id="evening-employees">
                        <div class="employee-tag">
                            <span>Ngô Văn H</span>
                            <button type="button" data-employee-id="8" class="btn-remove-employee">
                                <svg class="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                                    <path stroke-linecap="round" stroke-width="1.5" d="M1 1l6 6m0-6L1 7" />
                                </svg>
                            </button>
                        </div>
                        <div class="employee-tag">
                            <span>Bùi Thị I</span>
                            <button type="button" data-employee-id="9" class="btn-remove-employee">
                                <svg class="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                                    <path stroke-linecap="round" stroke-width="1.5" d="M1 1l6 6m0-6L1 7" />
                                </svg>
                            </button>
                        </div>
                        <div class="employee-tag">
                            <span>Trần Văn K</span>
                            <button type="button" data-employee-id="10" class="btn-remove-employee">
                                <svg class="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                                    <path stroke-linecap="round" stroke-width="1.5" d="M1 1l6 6m0-6L1 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <button type="button" data-shift="evening" class="btn-add-employee w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                        <svg class="-ml-1 mr-1 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                        </svg>
                        Thêm nhân viên
                    </button>
                </div>
            </div>

            <div class="flex justify-end mt-6">
                <button type="button" id="btn-save-schedule" class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                    <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    Lưu thay đổi
                </button>
            </div>
        </div>
    </div>

    <!-- Quy tắc lập lịch tab content -->
    <div id="content-rules" class="mb-6 hidden">
        <div class="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-6">Thiết lập quy tắc lập lịch tự động</h3>
            
            <div class="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm text-yellow-700">
                            Hệ thống sẽ tự động lập lịch làm việc cho tuần tiếp theo vào 00:00 giờ Chủ nhật hàng tuần. Thay đổi số lượng nhân viên tối đa cho từng ca để hệ thống phân công phù hợp.
                        </p>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Quy tắc ca sáng -->
                <div class="border rounded-lg p-4">
                    <h4 class="text-md font-medium text-gray-900 mb-4">Ca sáng (08:00 - 12:00)</h4>
                    
                    <div class="mb-4">
                        <label for="morning-max-staff" class="block text-sm font-medium text-gray-700 mb-1">Số nhân viên tối đa</label>
                        <div class="flex items-center">
                            <input type="number" id="morning-max-staff" min="1" max="10" value="4" class="focus:ring-red-500 focus:border-red-500 block w-20 shadow-sm sm:text-sm border-gray-300 rounded-md">
                            <span class="ml-2 text-sm text-gray-500">nhân viên</span>
                        </div>
                    </div>

                    <div class="grid grid-cols-7 gap-1 mb-4">
                        <div class="text-center">
                            <label for="morning-mon" class="block text-xs font-medium text-gray-700 mb-1">T2</label>
                            <input type="checkbox" id="morning-mon" checked class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded">
                        </div>
                        <div class="text-center">
                            <label for="morning-tue" class="block text-xs font-medium text-gray-700 mb-1">T3</label>
                            <input type="checkbox" id="morning-tue" checked class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded">
                        </div>
                        <div class="text-center">
                            <label for="morning-wed" class="block text-xs font-medium text-gray-700 mb-1">T4</label>
                            <input type="checkbox" id="morning-wed" checked class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded">
                        </div>
                        <div class="text-center">
                            <label for="morning-thu" class="block text-xs font-medium text-gray-700 mb-1">T5</label>
                            <input type="checkbox" id="morning-thu" checked class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded">
                        </div>
                        <div class="text-center">
                            <label for="morning-fri" class="block text-xs font-medium text-gray-700 mb-1">T6</label>
                            <input type="checkbox" id="morning-fri" checked class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded">
                        </div>
                        <div class="text-center">
                            <label for="morning-sat" class="block text-xs font-medium text-gray-700 mb-1">T7</label>
                            <input type="checkbox" id="morning-sat" checked class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded">
                        </div>
                        <div class="text-center">
                            <label for="morning-sun" class="block text-xs font-medium text-gray-700 mb-1">CN</label>
                            <input type="checkbox" id="morning-sun" checked class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded">
                        </div>
                    </div>
                </div>

                <!-- Quy tắc ca chiều -->
                <div class="border rounded-lg p-4">
                    <h4 class="text-md font-medium text-gray-900 mb-4">Ca chiều (12:00 - 18:00)</h4>
                    
                    <div class="mb-4">
                        <label for="afternoon-max-staff" class="block text-sm font-medium text-gray-700 mb-1">Số nhân viên tối đa</label>
                        <div class="flex items-center">
                            <input type="number" id="afternoon-max-staff" min="1" max="10" value="5" class="focus:ring-red-500 focus:border-red-500 block w-20 shadow-sm sm:text-sm border-gray-300 rounded-md">
                            <span class="ml-2 text-sm text-gray-500">nhân viên</span>
                        </div>
                    </div>

                    <div class="grid grid-cols-7 gap-1 mb-4">
                        <div class="text-center">
                            <label for="afternoon-mon" class="block text-xs font-medium text-gray-700 mb-1">T2</label>
                            <input type="checkbox" id="afternoon-mon" checked class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded">
                        </div>
                        <div class="text-center">
                            <label for="afternoon-tue" class="block text-xs font-medium text-gray-700 mb-1">T3</label>
                            <input type="checkbox" id="afternoon-tue" checked class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded">
                        </div>
                        <div class="text-center">
                            <label for="afternoon-wed" class="block text-xs font-medium text-gray-700 mb-1">T4</label>
                            <input type="checkbox" id="afternoon-wed" checked class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded">
                        </div>
                        <div class="text-center">
                            <label for="afternoon-thu" class="block text-xs font-medium text-gray-700 mb-1">T5</label>
                            <input type="checkbox" id="afternoon-thu" checked class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded">
                        </div>
                        <div class="text-center">
                            <label for="afternoon-fri" class="block text-xs font-medium text-gray-700 mb-1">T6</label>
                            <input type="checkbox" id="afternoon-fri" checked class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded">
                        </div>
                        <div class="text-center">
                            <label for="afternoon-sat" class="block text-xs font-medium text-gray-700 mb-1">T7</label>
                            <input type="checkbox" id="afternoon-sat" checked class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded">
                        </div>
                        <div class="text-center">
                            <label for="afternoon-sun" class="block text-xs font-medium text-gray-700 mb-1">CN</label>
                            <input type="checkbox" id="afternoon-sun" checked class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded">
                        </div>
                    </div>
                </div>

                <!-- Quy tắc ca tối -->
                <div class="border rounded-lg p-4">
                    <h4 class="text-md font-medium text-gray-900 mb-4">Ca tối (18:00 - 22:00)</h4>
                    
                    <div class="mb-4">
                        <label for="evening-max-staff" class="block text-sm font-medium text-gray-700 mb-1">Số nhân viên tối đa</label>
                        <div class="flex items-center">
                            <input type="number" id="evening-max-staff" min="1" max="10" value="5" class="focus:ring-red-500 focus:border-red-500 block w-20 shadow-sm sm:text-sm border-gray-300 rounded-md">
                            <span class="ml-2 text-sm text-gray-500">nhân viên</span>
                        </div>
                    </div>

                    <div class="grid grid-cols-7 gap-1 mb-4">
                        <div class="text-center">
                            <label for="evening-mon" class="block text-xs font-medium text-gray-700 mb-1">T2</label>
                            <input type="checkbox" id="evening-mon" checked class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded">
                        </div>
                        <div class="text-center">
                            <label for="evening-tue" class="block text-xs font-medium text-gray-700 mb-1">T3</label>
                            <input type="checkbox" id="evening-tue" checked class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded">
                        </div>
                        <div class="text-center">
                            <label for="evening-wed" class="block text-xs font-medium text-gray-700 mb-1">T4</label>
                            <input type="checkbox" id="evening-wed" checked class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded">
                        </div>
                        <div class="text-center">
                            <label for="evening-thu" class="block text-xs font-medium text-gray-700 mb-1">T5</label>
                            <input type="checkbox" id="evening-thu" checked class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded">
                        </div>
                        <div class="text-center">
                            <label for="evening-fri" class="block text-xs font-medium text-gray-700 mb-1">T6</label>
                            <input type="checkbox" id="evening-fri" checked class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded">
                        </div>
                        <div class="text-center">
                            <label for="evening-sat" class="block text-xs font-medium text-gray-700 mb-1">T7</label>
                            <input type="checkbox" id="evening-sat" checked class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded">
                        </div>
                        <div class="text-center">
                            <label for="evening-sun" class="block text-xs font-medium text-gray-700 mb-1">CN</label>
                            <input type="checkbox" id="evening-sun" checked class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded">
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex justify-end mt-6">
                <button type="button" id="btn-save-rules" class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                    <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    Lưu thay đổi
                </button>
            </div>
        </div>
    </div>

    <!-- Modal thêm nhân viên -->
    <div id="modal-add-employee" class="fixed inset-0 overflow-y-auto hidden" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div class="sm:flex sm:items-start">
                        <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                            <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
                                <path fill-rule="evenodd" d="M8 3a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0V7H6a1 1 0 110-2h1V4a1 1 0 011-1z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                            <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                Thêm nhân viên vào <span id="selected-shift-text">ca sáng</span>
                            </h3>
                            <div class="mt-4">
                                <input type="hidden" id="selected-shift" value="">
                                <input type="text" id="employee-search" class="focus:ring-red-500 focus:border-red-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md mb-4" placeholder="Tìm kiếm nhân viên...">
                                
                                <div class="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                                    <ul class="divide-y divide-gray-200" id="available-employees">
                                        <li class="px-4 py-3 flex items-center hover:bg-gray-50 cursor-pointer">
                                            <input type="checkbox" id="emp-11" class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded">
                                            <label for="emp-11" class="ml-3 block text-sm font-medium text-gray-700 cursor-pointer">Đinh Văn L</label>
                                        </li>
                                        <li class="px-4 py-3 flex items-center hover:bg-gray-50 cursor-pointer">
                                            <input type="checkbox" id="emp-12" class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded">
                                            <label for="emp-12" class="ml-3 block text-sm font-medium text-gray-700 cursor-pointer">Lý Thị M</label>
                                        </li>
                                        <li class="px-4 py-3 flex items-center hover:bg-gray-50 cursor-pointer">
                                            <input type="checkbox" id="emp-13" class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded">
                                            <label for="emp-13" class="ml-3 block text-sm font-medium text-gray-700 cursor-pointer">Hồ Văn N</label>
                                        </li>
                                        <li class="px-4 py-3 flex items-center hover:bg-gray-50 cursor-pointer">
                                            <input type="checkbox" id="emp-14" class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded">
                                            <label for="emp-14" class="ml-3 block text-sm font-medium text-gray-700 cursor-pointer">Đỗ Thị P</label>
                                        </li>
                                        <li class="px-4 py-3 flex items-center hover:bg-gray-50 cursor-pointer">
                                            <input type="checkbox" id="emp-15" class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded">
                                            <label for="emp-15" class="ml-3 block text-sm font-medium text-gray-700 cursor-pointer">Nguyễn Văn Q</label>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button type="button" id="btn-add-selected-employees" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
                        Thêm nhân viên đã chọn
                    </button>
                    <button type="button" class="btn-cancel mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                        Hủy
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Toast thông báo -->
    <div id="toast-notification" class="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg transform transition-all duration-300 translate-y-20 opacity-0">
        <!-- Nội dung thông báo sẽ được thêm bằng JavaScript -->
    </div>
@endsection