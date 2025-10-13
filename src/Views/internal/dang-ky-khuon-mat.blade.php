<!DOCTYPE html>
<html lang="vi">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Đăng ký khuôn mặt</title>
	<link rel="stylesheet" href="{{$_ENV['URL_INTERNAL_BASE']}}/css/tailwind.css">
	<script src="https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js"></script>
	<script src="{{$_ENV['URL_INTERNAL_BASE']}}/js/dang-ky-khuon-mat.js"></script>
</head>
<body class="bg-gray-50 min-h-screen" data-url="{{$_ENV['URL_WEB_BASE']}}">
	<main class="max-w-4xl mx-auto py-10">
		<h1 class="text-3xl font-bold text-center text-blue-700 mb-8">Đăng ký khuôn mặt nhân viên</h1>
		<div class="bg-white rounded-lg shadow p-6 flex flex-col items-center">
			<h2 class="text-lg font-semibold mb-4">Camera</h2>
			<div class="relative flex justify-center">
				<video id="video" autoplay muted playsinline class="rounded-lg border border-gray-300 object-cover" style="width: 800px; height: 600px;"></video>
				<canvas id="overlay" class="absolute top-0 left-0 w-full h-full pointer-events-none"></canvas>
			</div>
			<div id="faceNotify" class="mt-4 w-full text-center text-base font-semibold"></div>
			<div class="mt-4 w-full">
				<button id="btnStartCapture" class="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">▶️ Bắt đầu</button>
				<a href="{{$_ENV['URL_INTERNAL_BASE']}}/cham-cong" class="mt-2 w-full inline-block bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300 text-center font-semibold">⬅️ Quay lại</a>
			</div>
		</div>
	</main>
</body>
</html>
