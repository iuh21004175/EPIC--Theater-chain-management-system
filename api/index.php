<?php
    session_start();
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