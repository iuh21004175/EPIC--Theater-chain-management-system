<?php
    namespace App\Services;
    use App\Models\KhachHang;
    use App\Models\ResetToken;
    class Sc_XacThucCustomer {
        public function scDangKy() {
            $hoTen    = $_POST['registerName'];  
            $email    = $_POST['registerEmail'];
            $gioiTinh = $_POST['sex'];
            $ngaySinh = $_POST['txtNgaySinh'];
            $matKhau  = $_POST['registerPassword'];

            // Kiểm tra email
            if (KhachHang::where('email', $email)->exists()) {
                return false;
            }

            // Tạo mới khách hàng
            $khachHang = new KhachHang();
            $khachHang->ho_ten = $hoTen;
            $khachHang->email = $email;
            $khachHang->gioi_tinh = $gioiTinh;
            $khachHang->ngay_sinh = $ngaySinh;
            $khachHang->mat_khau = password_hash($matKhau, PASSWORD_DEFAULT);
            $khachHang->save();

            return true;
        }

        public function scDangNhap() {
            $email = $_POST['loginEmail'] ?? '';
            $matKhau = $_POST['loginPassword'] ?? '';

            $khachHang = KhachHang::where('email', $email)->first();
            if ($khachHang) {
                if (password_verify($matKhau, $khachHang->mat_khau)) {
                    $_SESSION['user'] = [
                        'id'       => $khachHang->id,
                        'ho_ten'  => $khachHang->ho_ten,
                        'email'    => $khachHang->email,
                        'gioi_tinh'=> $khachHang->gioi_tinh,
                        'ngay_sinh'=> $khachHang->ngay_sinh
                    ];
                    return true;
                }
            }
            // Nếu đăng nhập không thành công
            return false;
        }
        public function scDoiMatKhau($userId, $newPassword) {
            $khachHang = KhachHang::find($userId);
            if ($khachHang) {
                $khachHang->mat_khau = password_hash($newPassword, PASSWORD_DEFAULT);
                $khachHang->save();
                return true;
            }
            return false;
        }
        public function checkMatKhau($userId, $password)
        {
            $khachHang = KhachHang::find($userId);
            if ($khachHang && password_verify($password, $khachHang->mat_khau)) {
                return true;
            }
            return false;
        }

        public function scCheckEmail($email) {
            return KhachHang::where('email', $email)->exists();
        }
        public function getCustomerByEmail($email) {
            return KhachHang::where('email', $email)->first(); 
        }

        public function scResetPass()
        {
            header('Content-Type: application/json; charset=utf-8');

            // Lấy JSON từ fetch
            $data = json_decode(file_get_contents('php://input'), true);
            $token = $data['token'] ?? '';
            $password = $data['password'] ?? '';

            if (!$token || !$password) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Dữ liệu không hợp lệ'
                ]);
                exit;
            }

            // Tìm token hợp lệ
            $reset = ResetToken::where('token', $token)
                ->where('expire_at', '>', date('Y-m-d H:i:s'))
                ->first();

            if (!$reset) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Token không hợp lệ hoặc đã hết hạn'
                ]);
                exit;
            }

            // Cập nhật mật khẩu
            $khachHang = KhachHang::find($reset->khach_hang_id);
            if (!$khachHang) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Không tìm thấy khách hàng.'
                ]);
                exit;
            }

            $khachHang->mat_khau = password_hash($password, PASSWORD_DEFAULT);
            $khachHang->save();

            // Xóa token sau khi dùng
            $reset->delete();

            echo json_encode([
                'success' => true,
                'message' => 'Đặt lại mật khẩu thành công!',
                'redirect' => '/'
            ]);
            exit;
        }

    }
?>