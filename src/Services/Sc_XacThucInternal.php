<?php
    namespace App\Services;
    use App\Models\TaiKhoanInternal;
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

            $taiKhoan = TaiKhoanInternal::where('tendangnhap', $tenDangNhap)->first();
            if ($taiKhoan) {
                if (password_verify($matKhau, $taiKhoan->matkhau_bam)) {
                    $_SESSION['UserInternal'] = [
                        'Ten' => $taiKhoan->nguoiDungInternals->ten ?? '',
                        'Email' => $taiKhoan->nguoiDungInternals->email ?? '',
                        'DienThoai' => $taiKhoan->nguoiDungInternals->dien_thoai ?? '',
                        'TenDangNhap' => $taiKhoan->tendangnhap,
                        'VaiTro' => $taiKhoan->vaiTro->ten
                    ];
                    return true;
                }
            }
            // Nếu đăng nhập không thành công
            return false;
        }
    }
?>