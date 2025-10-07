<?php
    session_start();
    
    // CORS Headers để cho phép Socket.IO server gọi API
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Content-Type: application/json');
    
    // Handle preflight OPTIONS request
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
    
    $uri = $_SERVER['REQUEST_URI'];
    if (stripos($uri, '/rapphim/api/') === 0) {
        $_SERVER['REQUEST_URI'] = str_ireplace('/rapphim/api/', '/', $uri);
    }
    
    require __DIR__ . '/../vendor/autoload.php';
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__.'/..');
    $dotenv->load();
    require __DIR__ . '/../config/database.php';
    require __DIR__ . '/../routes/apiv1.php';
?>