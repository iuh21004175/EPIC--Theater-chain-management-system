<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Blog Điện Ảnh</title>
  <link rel="stylesheet" href="{{$_ENV['URL_WEB_BASE']}}/css/tailwind.css">
</head>
<body class="bg-gray-50 text-gray-800 font-sans">
@include('customer.layout.header')
  <div class="max-w-5xl mx-auto p-6">
    <!-- Header -->
    <h1 class="text-2xl font-bold border-l-4 border-blue-600 pl-2 mb-4">
      BLOG ĐIỆN ẢNH
    </h1>

    <!-- Bài viết 1 -->
    <a href="{{$_ENV['URL_WEB_BASE']}}/tin-tuc/final-destination-bloodlines-he-lo-bi-mat-ve-vong-lap-tu-than" class="bg-white rounded-lg shadow-md flex mb-6 block no-underline">
        <img src="" alt="Final Destination" class="w-48 h-32 object-cover rounded-l-lg">
        <div class="p-4 flex flex-col justify-between">
            <div>
            <h2 class="text-lg font-semibold text-gray-800">
                Final Destination Bloodlines: Hé Lộ Bí Mật Về Vòng Lặp Tử Thần
            </h2>
            <p class="text-gray-600 text-sm mt-2 italic">
                Final Destination: Bloodlines hé lộ bí ẩn đã bị che giấu suốt nhiều năm qua về vòng lặp chết chóc của Tử Thần.
            </p>
            </div>
            <div class="flex items-center space-x-3 mt-3">
            <button class="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700">👍 Thích</button>
            <span class="text-gray-500 text-sm">👁 161</span>
            </div>
        </div>
    </a>

    <!-- Bài viết 2 -->
    <a href="{{$_ENV['URL_WEB_BASE']}}/tin-tuc/top-phim-hay-dip-cuoi-nam-2025" class="bg-white rounded-lg shadow-md flex mb-6 block no-underline">
      <img src="" alt="Final Destination" class="w-48 h-32 object-cover rounded-l-lg">
      <div class="p-4 flex flex-col justify-between">
        <div>
          <h2 class="text-lg font-semibold text-gray-800">
            Final Destination Bloodlines: Hé Lộ Bí Mật Về Vòng Lặp Tử Thần
          </h2>
          <p class="text-gray-600 text-sm mt-2 italic">
            Final Destination: Bloodlines hé lộ bí ẩn đã bị che giấu suốt nhiều năm qua về vòng lặp chết chóc của Tử Thần.
          </p>
        </div>
        <div class="flex items-center space-x-3 mt-3">
          <button class="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700">👍 Thích</button>
          <span class="text-gray-500 text-sm">👁 161</span>
        </div>
      </div>
    </a>
  </div>
  @include('customer.layout.footer')
</body>
</html>
