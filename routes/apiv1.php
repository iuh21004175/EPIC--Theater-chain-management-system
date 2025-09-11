<?php
use App\Controllers\Ctrl_XacThucInternal;
use App\Controllers\Ctrl_TaiKhoanInternal;
use App\Controllers\Ctrl_RapPhim;
use App\Controllers\Ctrl_NhanVien;
use App\Controllers\Ctrl_XacThucCustomer;
use App\Controllers\Ctrl_KhachHang;
use App\Controllers\Ctrl_Phim;
use App\Controllers\Ctrl_Ghe;
use App\Controllers\Ctrl_PhongChieu;
$dispatcher = FastRoute\simpleDispatcher(function(FastRoute\RouteCollector $r) {
    $r->addRoute('POST', '/dang-nhap', [Ctrl_XacThucInternal::class, 'dangNhap']);
    $r->addRoute('POST', '/tai-khoan', [Ctrl_TaiKhoanInternal::class, 'themTaiKhoan', ['Admin']]);
    $r->addRoute('GET', '/tai-khoan', [Ctrl_TaiKhoanInternal::class, 'docTaiKhoan', ['Admin']]);
    $r->addRoute('GET', '/tai-khoan/{id:\d+}', [Ctrl_TaiKhoanInternal::class, 'docTaiKhoan', ['Admin']]);
    $r->addRoute('PUT', '/tai-khoan/{id:\d+}/phan-cong', [Ctrl_TaiKhoanInternal::class, 'phanCongTaiKhoan', ['Admin']]);
    $r->addRoute('PUT', '/tai-khoan/{id:\d+}', [Ctrl_TaiKhoanInternal::class, 'suaTaiKhoan', ['Admin']]);
    $r->addRoute('POST', '/rap-phim', [Ctrl_RapPhim::class, 'themRapPhim', ['Admin']]);
    $r->addRoute('GET', '/rap-phim', [Ctrl_RapPhim::class, 'docRapPhim', ['Admin']]);
    $r->addRoute('GET', '/rap-phim/{id:\d+}/trang-thai', [Ctrl_RapPhim::class, 'thayDoiTrangThai', ['Admin']]);
    $r->addRoute('POST', '/rap-phim/{id:\d+}', [Ctrl_RapPhim::class, 'suaRapPhim', ['Admin']]);
    $r->addRoute('POST', '/nhan-vien', [Ctrl_NhanVien::class, 'themNhanVien', ['Quản lý rạp']]);
    $r->addRoute('GET', '/nhan-vien', [Ctrl_NhanVien::class, 'docNhanVien', ['Quản lý rạp']]);
    $r->addRoute('PUT', '/nhan-vien/{id:\d+}', [Ctrl_NhanVien::class, 'suaNhanVien', ['Quản lý rạp']]);
    $r->addRoute('PUT', '/nhan-vien/{id:\d+}/trang-thai', [Ctrl_NhanVien::class, 'thayDoiTrangThai', ['Quản lý rạp']]);
    $r->addRoute('POST', '/the-loai-phim', [Ctrl_Phim::class, 'themTheLoaiPhim', ['Quản lý chuỗi rạp']]);
    $r->addRoute('GET', '/the-loai-phim', [Ctrl_Phim::class, 'docTheLoaiPhim', ['Quản lý chuỗi rạp']]);
    $r->addRoute('PUT', '/the-loai-phim/{id:\d+}', [Ctrl_Phim::class, 'suaTenTheLoaiPhim', ['Quản lý chuỗi rạp']]);
    $r->addRoute('POST', '/phim', [Ctrl_Phim::class, 'themPhim', ['Quản lý chuỗi rạp']]);
    $r->addRoute('GET', '/phim/', [Ctrl_Phim::class, 'docPhim', ['Quản lý chuỗi rạp']]);
    $r->addRoute('POST', '/phim/{id:\d+}', [Ctrl_Phim::class, 'suaPhim', ['Quản lý chuỗi rạp']]);
    $r->addRoute('POST', '/ghe', [Ctrl_Ghe::class, 'themGhe', ['Quản lý chuỗi rạp']]);
    $r->addRoute('GET', '/ghe', [Ctrl_Ghe::class, 'docGhe', ['Quản lý chuỗi rạp', 'Quản lý rạp']]);
    $r->addRoute('PUT', '/ghe/{id:\d+}', [Ctrl_Ghe::class, 'suaGhe', ['Quản lý chuỗi rạp']]);
    $r->addRoute('POST', '/phong-chieu', [Ctrl_PhongChieu::class, 'themPhongChieu', ['Quản lý rạp']]);
    $r->addRoute('PUT', '/phong-chieu/{id:\d+}', [Ctrl_PhongChieu::class, 'capNhatPhongChieu', ['Quản lý rạp']]);
    $r->addRoute('GET', '/phong-chieu', [Ctrl_PhongChieu::class, 'docPhongChieu', ['Quản lý rạp']]);
    //Khách hàng
    $r->addRoute('POST', '/dang-ky', [Ctrl_XacThucCustomer::class, 'dangKy']);
    $r->addRoute('POST', '/dang-nhap-khach-hang', [Ctrl_XacThucCustomer::class, 'dangNhap']);
    $r->addRoute('GET', '/thong-tin-ca-nhan', [Ctrl_KhachHang::class, 'thongTinKhachHang']);
    $r->addRoute('PUT', '/thong-tin-ca-nhan', [Ctrl_KhachHang::class, 'updateThongTinKhachHang']);
    $r->addRoute('PUT', '/doi-mat-khau', [Ctrl_XacThucCustomer::class, 'xuLyDoiMatKhau']);
    $r->addRoute('GET', '/rap-phim-khach', [Ctrl_RapPhim::class, 'docRapPhim']);
    $r->addRoute('GET', '/rap/{id}', [Ctrl_RapPhim::class, 'docRapPhimTheoID']);
    $r->addRoute('POST', '/check-email', [Ctrl_XacThucCustomer::class, 'checkEmail']);
    $r->addRoute('POST', '/reset-password', [Ctrl_XacThucCustomer::class, 'sendResetPassword']);
    $r->addRoute('POST', '/reset-pass', [Ctrl_XacThucCustomer::class, 'ResetPass']);
    $r->addRoute('GET', '/loai-phim', [Ctrl_Phim::class, 'docTheLoaiPhim']);
    $r->addRoute('GET', '/phim', [Ctrl_Phim::class, 'docPhimKH']);
    $r->addRoute('GET', '/dat-ve/{id}', [Ctrl_Phim::class, 'docChiTietPhim']);
    $r->addRoute('GET', '/phim-moi', [Ctrl_Phim::class, 'docPhimMoiNhat']);
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
            if(count($handler) == 3){
                $headers = getallheaders();

                // Kiểm tra xác thực người dùng nội bộ
                if (!isset($_SESSION['UserInternal']) && !isset($headers['Token-Dev'])) {
                    header('Content-Type: application/json', true, 403);
                    echo json_encode([
                        'success' => false,
                        'message' => '403 Bạn chưa đăng nhập để truy cập api này'
                    ]);
                    exit();
                }
                if (isset($headers['Token-Dev']) && !hash_equals($headers['Token-Dev'], $_ENV['TOKEN_DEV_KEY'])) {
                    header('Content-Type: application/json', true, 401);
                    echo json_encode([
                        'success' => false,
                        'message' => '401 Token-Dev không hợp lệ'
                    ]);
                    exit();
                }
                $requiredRoles = $handler[2]; // Lấy vai trò yêu cầu từ định tuyến
                if(isset($_SESSION['UserInternal']) && !in_array($_SESSION['UserInternal']['VaiTro'], $requiredRoles)) {
                    header('Content-Type: application/json', true, 403);
                    echo json_encode([
                        'success' => false,
                        'message' => '403 Bạn không có quyền truy cập api này'
                    ]);
                    exit();

                }
                // Kiểm tra xác thực khách hàng
                // bổ sung logic sau
            }
            // Sửa lại: lấy class và method từ array $handler
            $class = $handler[0];  // Ctrl_XacThuc::class
            $method = $handler[1]; // 'indexDangNhap' hoặc 'index'
            $controller = new $class();
            echo json_encode(call_user_func([$controller, $method], $vars));
        } else {
            echo json_encode(call_user_func($handler, $vars));
        }
        break;
}

?>
