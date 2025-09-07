<?php
namespace App\Controllers;

use function App\Core\view;
use App\Services\Sc_XacThucCustomer;

class Ctrl_XacThucCustomer
{
    public function index()
    {
        return view('customer.home');
    }

    public function dangKy()
    {
        try {
            $scXacThuc = new Sc_XacThucCustomer();
            if ($scXacThuc->scDangKy()) {
                return [
                    'status'   => 'success',
                    'message'  => 'Đăng ký thành công!'
                ];
            } else {
                return [
                    'status'  => 'error',
                    'message' => 'Email đã tồn tại. Vui lòng sử dụng email khác.'
                ];
            }
        } catch (\Exception $e) {
            return [
                'status'  => 'error',
                'message' => 'Đã xảy ra lỗi. Vui lòng thử lại sau.',
                'error'   => $e->getMessage()
            ];
        }
    }

    public function dangNhap()
    {
        try{
            $scXacThuc = new Sc_XacThucCustomer();
            if ($scXacThuc->scDangNhap()) {
                return [
                    'status'   => 'success',
                    'message'  => 'Đăng nhập thành công!'
                ];
            } else {
                return [
                    'status'  => 'error',
                    'message' => 'Email hoặc mật khẩu không đúng. Vui lòng thử lại.'
                ];
            }
        } catch( \Exception $e) {
            return [
                'status'  => 'error',
                'message' => 'Đã xảy ra lỗi. Vui lòng thử lại sau.',
                'error'   => $e->getMessage()
            ];
        }
    }

    public function dangXuat()
    {
        session_destroy();
        header('Location: ' . $_ENV['URL_WEB_BASE'] . '/');
        exit();
    }

    public function doiMatKhau()
    {
        return view('customer.doi-mat-khau');
    }

    public function xuLyDoiMatKhau()
    {
        // Đảm bảo không có output thừa
        ini_set('display_errors', 0);
        header('Content-Type: application/json; charset=utf-8');

        $scXacThuc = new Sc_XacThucCustomer();
        $user = $_SESSION['user'] ?? null;
        $userId = $user['id'] ?? null;

        $data = json_decode(file_get_contents('php://input'), true);

        try {
            if (!$userId) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Người dùng chưa đăng nhập.'
                ]);
                exit;
            }

            if (!$data || !isset($data['currentPassword']) || !isset($data['newPassword'])) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Dữ liệu đổi mật khẩu không hợp lệ.'
                ]);
                exit;
            }

            $currentPassword = $data['currentPassword'];
            $newPassword = $data['newPassword'];

            if (!$scXacThuc->checkMatKhau($userId, $currentPassword)) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Mật khẩu hiện tại không đúng.'
                ]);
                exit;
            }

            $result = $scXacThuc->scDoiMatKhau($userId, $newPassword);

            if ($result) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Đổi mật khẩu thành công!'
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Không tìm thấy khách hàng để đổi mật khẩu.'
                ]);
            }
        } catch (\Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => 'Đã xảy ra lỗi. Vui lòng thử lại sau.'
            ]);
        }
        exit;
    }

    public function quenMatKhau()
    {
        return view('customer.quen-mat-khau');
    }

}

