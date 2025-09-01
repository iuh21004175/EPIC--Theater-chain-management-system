<?php
use App\Controllers\Ctrl_XacThucInternal;
$dispatcher = FastRoute\simpleDispatcher(function(FastRoute\RouteCollector $r) {
    $r->addRoute('POST', '/dang-nhap', [Ctrl_XacThucInternal::class, 'dangNhap']);

});

$httpMethod = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];

if (false !== $pos = strpos($uri, '?')) {
    $uri = substr($uri, 0, $pos);
}
$uri = rawurldecode($uri);

$routeInfo = $dispatcher->dispatch($httpMethod, $uri);
switch ($routeInfo[0]) {
    case FastRoute\Dispatcher::NOT_FOUND:
        header('Content-Type: application/json', true, 404);
        echo json_encode([
            'success' => false,
            'message' => '404 Not Found',
            'uri' => $uri
        ]);
        break;
    case FastRoute\Dispatcher::METHOD_NOT_ALLOWED:
        $allowedMethods = $routeInfo[1];
        header('Content-Type: application/json', true, 405);
        echo json_encode([
            'success' => false,
            'message' => '405 Method Not Allowed'
        ]);
        break;
    case FastRoute\Dispatcher::FOUND:
        $handler = $routeInfo[1];
        $vars = $routeInfo[2];
        header("Content-Type: application/json");
        if (is_array($handler)) {
            [$class, $method] = $handler;
            $controller = new $class();
            echo json_encode(call_user_func([$controller, $method], $vars));
        } else {
            echo json_encode(call_user_func($handler, $vars));
        }
        break;
}

?>
