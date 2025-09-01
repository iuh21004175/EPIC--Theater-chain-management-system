<?php
    namespace App\Services;
    class Sc_XacThucInternal {
        public function scDangNhap(){
            $userInternal = [
                ['TenDangNhap'=>'admin', 'MatKhau'=>password_hash('admin', PASSWORD_ARGON2ID), 'VaiTro'=>'Admin'],
                ['TenDangNhap'=>'quanlychuoirap', 'MatKhau'=>password_hash('quanlychuoirap', PASSWORD_ARGON2ID), 'VaiTro'=>'Quản lý chuỗi rạp'],
                ['TenDangNhap'=>'quanlyrap', 'MatKhau'=>password_hash('quanlyrap', PASSWORD_ARGON2ID), 'VaiTro'=>'Quản lý rạp'],
                ['TenDangNhap'=>'nhanvien', 'MatKhau'=>password_hash('nhanvien', PASSWORD_ARGON2ID), 'VaiTro'=>'Nhân viên'],

            ];
            $tenDangNhap = $_POST['TenDangNhap'] ?? '';
            $matKhau = $_POST['MatKhau'] ?? '';

            foreach ($userInternal as $user) {
                if ($user['TenDangNhap'] === $tenDangNhap && password_verify($matKhau, $user['MatKhau'])) {
                    $_SESSION['UserInternal'] = $user;
                    return true;
                }
            }
            // Nếu đăng nhập không thành công
            return false;
        }
    }
?>