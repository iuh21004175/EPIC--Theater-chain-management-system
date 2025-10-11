@extends('internal.layout')

@section('title', 'Chấm công')

@section('head')
<style>
    #video {
        transform: scaleX(-1);
        border-radius: 8px;
    }
</style>
@endsection

@section('breadcrumbs')
<li>
    <div class="flex items-center">
        <svg class="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
        <span class="ml-4 text-sm font-medium text-gray-500">Chấm công</span>
    </div>
</li>
@endsection

@section('content')
<div class="mb-6">
    <h2 class="text-2xl font-semibold text-gray-800">Chấm công bằng khuôn mặt</h2>
</div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Camera & Attendance -->
            <div class="lg:col-span-2 space-y-6">
                <!-- Registration Status -->
                <div id="registrationStatus" class="bg-white rounded-lg shadow p-6" data-url="{{$_ENV['URL_WEB_BASE']}}">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Trạng thái đăng ký</h3>
                    <div id="statusContent" class="flex items-center justify-center py-4">
                        <svg class="animate-spin h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span class="ml-2 text-gray-500">Đang kiểm tra...</span>
                    </div>
                </div>

                <!-- Camera -->
                <div id="cameraSection" class="bg-white rounded-lg shadow p-6 hidden">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Camera nhận diện</h3>
                    <div class="relative">
                        <video id="video" width="100%" height="auto" autoplay></video>
                        <canvas id="canvas" style="display: none;"></canvas>
                    </div>
                    <div class="mt-4 grid grid-cols-2 gap-3">
                        <button id="btnCheckin" class="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium">
                            ✓ Check In
                        </button>
                        <button id="btnCheckout" class="bg-orange-600 text-white px-6 py-3 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium">
                            → Check Out
                        </button>
                    </div>
                </div>
            </div>

            <!-- Today's Attendance -->
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Chấm công hôm nay</h3>
                <div id="todayAttendance" class="space-y-4">
                    <p class="text-gray-500 text-center py-4">Chưa có dữ liệu</p>
                </div>
            </div>
        </div>

        <!-- Attendance History -->
        <div class="mt-6 bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium text-gray-900">Lịch sử chấm công</h3>
                <button id="btnRefresh" class="text-blue-600 hover:text-blue-700">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                </button>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giờ vào</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giờ ra</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số giờ</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody id="historyTableBody" class="bg-white divide-y divide-gray-200">
                        <tr>
                            <td colspan="5" class="px-6 py-4 text-center text-gray-500">Đang tải...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Loading Modal -->
        <div id="loadingModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div class="mt-3 text-center">
                    <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                        <svg class="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                    <h3 class="text-lg leading-6 font-medium text-gray-900 mt-4">Đang nhận diện...</h3>
                    <p class="text-sm text-gray-500 mt-2">Vui lòng giữ khuôn mặt trong khung hình</p>
                </div>
            </div>
        </div>
    </main>

    <script type="module" src="{{$_ENV['URL_INTERNAL_BASE']}}/js/cham-cong.js">
        
    </script>
@endsection
