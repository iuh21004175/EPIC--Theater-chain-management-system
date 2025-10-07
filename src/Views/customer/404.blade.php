<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 - Không tìm thấy trang | EPIC Cinemas</title>
    <link rel="stylesheet" href="{{$_ENV['URL_WEB_BASE']}}/css/tailwind.css">
</head>
<body class="bg-gray-100">
    <div class="min-h-screen flex items-center justify-center px-4">
        <div class="max-w-md w-full text-center">
            <div class="mb-8">
                <h1 class="text-9xl font-bold text-red-600">404</h1>
                <div class="text-6xl mb-4">🎬</div>
                <h2 class="text-3xl font-bold text-gray-800 mb-4">Trang không tồn tại</h2>
                <p class="text-gray-600 mb-8">
                    Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
                </p>
            </div>
            
            <div class="space-y-4">
                <a href="{{$_ENV['URL_WEB_BASE']}}" 
                   class="inline-block w-full px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">
                    Về trang chủ
                </a>
                <button onclick="history.back()" 
                        class="inline-block w-full px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors">
                    Quay lại trang trước
                </button>
            </div>
            
            <div class="mt-8 pt-8 border-t border-gray-300">
                <p class="text-sm text-gray-500">
                    Bạn có thể:
                </p>
                <ul class="mt-4 space-y-2 text-sm text-gray-600">
                    <li>
                        <a href="{{$_ENV['URL_WEB_BASE']}}/phim" class="text-red-600 hover:underline">
                            Xem phim đang chiếu
                        </a>
                    </li>
                    <li>
                        <a href="{{$_ENV['URL_WEB_BASE']}}/lich-chieu" class="text-red-600 hover:underline">
                            Xem lịch chiếu
                        </a>
                    </li>
                    <li>
                        <a href="{{$_ENV['URL_WEB_BASE']}}/tu-van/chat-truc-tuyen" class="text-red-600 hover:underline">
                            Liên hệ hỗ trợ
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</body>
</html>
