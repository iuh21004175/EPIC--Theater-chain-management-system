<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="{{$_ENV['URL_INTERNAL_BASE']}}/css/tailwind.css">
    <title>Bảng điều khiển - EPIC CINEMA</title>
    <style>
        .tooltip {
            position: relative;
        }
        .tooltip::before {
            content: attr(data-tooltip);
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            padding: 5px 10px;
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s, visibility 0.3s;
            z-index: 100;
            margin-bottom: 5px;
            pointer-events: none;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        .tooltip:hover::before {
            opacity: 1;
            visibility: visible;
        }
    </style>
</head>
<body class="bg-gray-100 min-h-screen">
    <!-- Header -->
    <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div class="flex items-center">
                <svg class="h-8 w-8 text-red-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
                <h1 class="text-xl font-bold text-gray-900">EPIC CINEMA</h1>
            </div>
            <div class="flex items-center">
                <span class="mr-4 text-gray-600">Xin chào, {{$_SESSION['UserInternal']['VaiTro']}}</span>
                <a href="{{$_ENV['URL_INTERNAL_BASE']}}/dang-xuat" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm">Đăng xuất</a>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 class="text-2xl font-semibold text-gray-800 mb-8">Chức năng</h2>
        
        <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            @if($_SESSION['UserInternal']['VaiTro'] == 'Admin')
            <!-- Quản lý rạp phim -->
            <a href="{{$_ENV['URL_INTERNAL_BASE']}}/rap-phim" class="tooltip flex flex-col items-center bg-white rounded-md shadow hover:shadow-md p-4 transition-all hover:translate-y-[-2px]" data-tooltip="Quản lý danh sách rạp phim">
                <div class="w-12 h-12 flex items-center justify-center bg-indigo-100 rounded-full mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </div>
                <span class="text-xs text-center font-medium text-gray-700">Rạp phim</span>
            </a>
            <!-- Quản lý banner -->
            <a href="{{$_ENV['URL_INTERNAL_BASE']}}/quan-ly-banner" class="tooltip flex flex-col items-center bg-white rounded-md shadow hover:shadow-md p-4 transition-all hover:translate-y-[-2px]" data-tooltip="Quản lý banner">
                <div class="w-12 h-12 flex items-center justify-center bg-sky-100 rounded-full mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <span class="text-xs text-center font-medium text-gray-700">Quản lý banner</span>
            </a>
            <!-- Quản lý tài khoản -->
            <a href="{{$_ENV['URL_INTERNAL_BASE']}}/quan-ly-tai-khoan" class="tooltip flex flex-col items-center bg-white rounded-md shadow hover:shadow-md p-4 transition-all hover:translate-y-[-2px]" data-tooltip="Quản lý tài khoản">
                <div class="w-12 h-12 flex items-center justify-center bg-fuchsia-100 rounded-full mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-fuchsia-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <span class="text-xs text-center font-medium text-gray-700">Quản lý tài khoản</span>
            </a>
            @elseif($_SESSION['UserInternal']['VaiTro'] == 'Quản lý chuỗi rạp')
             
            <!-- Quản lý phim -->
            <a href="{{$_ENV['URL_INTERNAL_BASE']}}/phim" class="tooltip flex flex-col items-center bg-white rounded-md shadow hover:shadow-md p-4 transition-all hover:translate-y-[-2px]" data-tooltip="Quản lý phim">
                <div class="w-12 h-12 flex items-center justify-center bg-red-100 rounded-full mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                    </svg>
                </div>
                <span class="text-xs text-center font-medium text-gray-700">Phim</span>
            </a>
            <!-- Quản lý giá vé -->
            <a href="{{$_ENV['URL_INTERNAL_BASE']}}/gia-ve" class="tooltip flex flex-col items-center bg-white rounded-md shadow hover:shadow-md p-4 transition-all hover:translate-y-[-2px]" data-tooltip="Quản lý giá vé">
                <div class="w-12 h-12 flex items-center justify-center bg-green-100 rounded-full mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                </div>
                <span class="text-xs text-center font-medium text-gray-700">Giá vé</span>
            </a>
            <!-- Quản lý sản phẩm ăn uống -->
            <a href="{{$_ENV['URL_INTERNAL_BASE']}}/san-pham-an-uong" class="tooltip flex flex-col items-center bg-white rounded-md shadow hover:shadow-md p-4 transition-all hover:translate-y-[-2px]" data-tooltip="Quản lý sản phẩm ăn uống">
                <div class="w-12 h-12 flex items-center justify-center bg-pink-100 rounded-full mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>
                <span class="text-xs text-center font-medium text-gray-700">Sản phẩm ăn uống</span>
            </a>
            <!-- Thống kê toàn rạp -->
            <a href="{{$_ENV['URL_INTERNAL_BASE']}}/thong-ke-toan-rap" class="tooltip flex flex-col items-center bg-white rounded-md shadow hover:shadow-md p-4 transition-all hover:translate-y-[-2px]" data-tooltip="Thống kê toàn rạp">
                <div class="w-12 h-12 flex items-center justify-center bg-violet-100 rounded-full mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                </div>
                <span class="text-xs text-center font-medium text-gray-700">Thống kê toàn rạp</span>
            </a>
            @elseif($_SESSION['UserInternal']['VaiTro'] == 'Quản lý rạp')
            <!-- Quản lý phòng chiếu -->
            <a href="{{$_ENV['URL_INTERNAL_BASE']}}/quan-ly-phong-chieu" class="tooltip flex flex-col items-center bg-white rounded-md shadow hover:shadow-md p-4 transition-all hover:translate-y-[-2px]" data-tooltip="Quản lý phòng chiếu">
                <div class="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-full mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                    </svg>
                </div>
                <span class="text-xs text-center font-medium text-gray-700">Phòng chiếu</span>
            </a>
            <!-- Quản lý suất chiếu -->
            <a href="{{$_ENV['URL_INTERNAL_BASE']}}/quan-ly-suat-chieu" class="tooltip flex flex-col items-center bg-white rounded-md shadow hover:shadow-md p-4 transition-all hover:translate-y-[-2px]" data-tooltip="Quản lý suất chiếu">
                <div class="w-12 h-12 flex items-center justify-center bg-purple-100 rounded-full mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <span class="text-xs text-center font-medium text-gray-700">Suất chiếu</span>
            </a>
            <!-- Quản lý nhân viên -->
            <a href="{{$_ENV['URL_INTERNAL_BASE']}}/quan-ly-nhan-vien" class="tooltip flex flex-col items-center bg-white rounded-md shadow hover:shadow-md p-4 transition-all hover:translate-y-[-2px]" data-tooltip="Quản lý nhân viên">
                <div class="w-12 h-12 flex items-center justify-center bg-yellow-100 rounded-full mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
                <span class="text-xs text-center font-medium text-gray-700">Nhân viên</span>
            </a>
            <!-- Quản lý lịch làm việc -->
            <a href="{{$_ENV['URL_INTERNAL_BASE']}}/quan-ly-lich-lam-viec" class="tooltip flex flex-col items-center bg-white rounded-md shadow hover:shadow-md p-4 transition-all hover:translate-y-[-2px]" data-tooltip="Quản lý lịch làm việc">
                <div class="w-12 h-12 flex items-center justify-center bg-teal-100 rounded-full mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <span class="text-xs text-center font-medium text-gray-700">Lịch làm việc</span>
            </a>
            <!-- Thống kê -->
            <a href="{{$_ENV['URL_INTERNAL_BASE']}}/thong-ke" class="tooltip flex flex-col items-center bg-white rounded-md shadow hover:shadow-md p-4 transition-all hover:translate-y-[-2px]" data-tooltip="Thống kê">
                <div class="w-12 h-12 flex items-center justify-center bg-lime-100 rounded-full mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <span class="text-xs text-center font-medium text-gray-700">Thống kê</span>
            </a>
            @else
            <!-- Xem lịch làm việc -->
            <a href="{{$_ENV['URL_INTERNAL_BASE']}}/xem-lich-lam-viec" class="tooltip flex flex-col items-center bg-white rounded-md shadow hover:shadow-md p-4 transition-all hover:translate-y-[-2px]" data-tooltip="Xem lịch làm việc">
                <div class="w-12 h-12 flex items-center justify-center bg-cyan-100 rounded-full mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                </div>
                <span class="text-xs text-center font-medium text-gray-700">Xem lịch làm việc</span>
            </a>
            <!-- Xem lương -->
            <a href="{{$_ENV['URL_INTERNAL_BASE']}}/xem-luong" class="tooltip flex flex-col items-center bg-white rounded-md shadow hover:shadow-md p-4 transition-all hover:translate-y-[-2px]" data-tooltip="Xem lương">
                <div class="w-12 h-12 flex items-center justify-center bg-emerald-100 rounded-full mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <span class="text-xs text-center font-medium text-gray-700">Xem lương</span>
            </a>
            <!-- Chấm công -->
            <a href="{{$_ENV['URL_INTERNAL_BASE']}}/cham-cong" class="tooltip flex flex-col items-center bg-white rounded-md shadow hover:shadow-md p-4 transition-all hover:translate-y-[-2px]" data-tooltip="Chấm công">
                <div class="w-12 h-12 flex items-center justify-center bg-amber-100 rounded-full mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <span class="text-xs text-center font-medium text-gray-700">Chấm công</span>
            </a>
            <!-- Bán vé -->
            <a href="{{$_ENV['URL_INTERNAL_BASE']}}/ban-ve" class="tooltip flex flex-col items-center bg-white rounded-md shadow hover:shadow-md p-4 transition-all hover:translate-y-[-2px]" data-tooltip="Bán vé">
                <div class="w-12 h-12 flex items-center justify-center bg-rose-100 rounded-full mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                </div>
                <span class="text-xs text-center font-medium text-gray-700">Bán vé</span>
            </a>
            @endif    
            
        </div>
    </main>
</body>
</html>