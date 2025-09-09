<?php
    session_start();
    $uri = $_SERVER['REQUEST_URI'];
    if (stripos($uri, '/rapphim/internal/') === 0) {
        $_SERVER['REQUEST_URI'] = str_ireplace('/rapphim/internal/', '/', $uri);
    }
    
    require __DIR__ . '/../vendor/autoload.php';
    require __DIR__ . '/../config/database.php';
    require __DIR__ . '/../routes/internal.php';
?>