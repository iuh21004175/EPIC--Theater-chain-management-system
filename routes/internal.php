<?php
use App\Controllers\Ctrl_XacThucInternal;
use App\Controllers\Ctrl_Phim;
use App\Controllers\Ctrl_RapPhim;
use App\Controllers\Ctrl_GiaVe;
use App\Controllers\Ctrl_SanPhamAnUong;
use App\Controllers\Ctrl_ThongKeToanRap;
use function App\Core\view;

// Vai trò: Quản trị viên, Nhân viên, Khách hàng
$dispatcher = FastRoute\simpleDispatcher(function(FastRoute\RouteCollector $r) {
    $r->addRoute('GET', '/dang-nhap', [Ctrl_XacThucInternal::class, 'index']);
    $r->addRoute('GET', '/', [Ctrl_XacThucInternal::class, 'index']);
    $r->addRoute('GET', '/dang-xuat', [Ctrl_XacThucInternal::class, 'dangXuat']);
    $r->addRoute('GET', '/bang-dieu-khien', [Ctrl_XacThucInternal::class, 'pageBangDieuKhien']);
    $r->addRoute('GET', '/phim', [Ctrl_Phim::class, 'index', ['Quản lý chuỗi rạp']]);
    $r->addRoute('GET', '/rap-phim', [Ctrl_RapPhim::class, 'index', ['Admin']]);
    $r->addRoute('GET', '/gia-ve', [Ctrl_GiaVe::class, 'index', ['Quản lý chuỗi rạp']]);
    $r->addRoute('GET', '/san-pham-an-uong', [Ctrl_SanPhamAnUong::class, 'index', ['Quản lý chuỗi rạp']]);
    $r->addRoute('GET', '/thong-ke-toan-rap', [Ctrl_ThongKeToanRap::class, 'index', ['Quản lý chuỗi rạp']]);
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
        echo view("internal.404");
        break;
    case FastRoute\Dispatcher::METHOD_NOT_ALLOWED:
        $allowedMethods = $routeInfo[1];
        echo view("internal.405");
        break;
    case FastRoute\Dispatcher::FOUND:
        $handler = $routeInfo[1];
        $vars = $routeInfo[2];
        if (is_array($handler)) {
            if(count($handler) == 3){
                // Kiểm tra xem người dùng đã đăng nhập chưa
                if (!isset($_SESSION['UserInternal'])) {
                    echo view("internal.unauthenticated");
                    exit();
                }
                // Kiểm tra phân quyền
                $requiredRoles = $handler[2]; // Lấy vai trò yêu cầu từ định tuyến
                if (!in_array($_SESSION['UserInternal']['VaiTro'], $requiredRoles)) {
                    // Người dùng không có quyền truy cập
                    echo view("internal.403");
                    exit();
                }
            }
            // Sửa lại: lấy class và method từ array $handler
            $class = $handler[0];  // Ctrl_XacThuc::class
            $method = $handler[1]; // 'indexDangNhap' hoặc 'index'
                
            $controller = new $class();
            echo call_user_func([$controller, $method], $vars);
            } else {
                echo call_user_func($handler, $vars);
            }        
        break;
}
?>
