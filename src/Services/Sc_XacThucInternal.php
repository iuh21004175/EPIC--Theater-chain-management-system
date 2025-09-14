<?php
    namespace App\Services;
    use App\Models\TaiKhoanInternal;
    class Sc_XacThucInternal {
        public function scDangNhap(){
            $tenDangNhap = $_POST['TenDangNhap'] ?? '';
            $matKhau = $_POST['MatKhau'] ?? '';

            $taiKhoan = TaiKhoanInternal::where('tendangnhap', $tenDangNhap)->first();
            if ($taiKhoan) {
                if (password_verify($matKhau, $taiKhoan->matkhau_bam)) {
                    $_SESSION['UserInternal'] = [
                        'ID' => $taiKhoan->nguoiDungInternals->id ?? null,
                        'Ten' => $taiKhoan->nguoiDungInternals->ten ?? '',
                        'Email' => $taiKhoan->nguoiDungInternals->email ?? '',
                        'DienThoai' => $taiKhoan->nguoiDungInternals->dien_thoai ?? '',
                        'TenDangNhap' => $taiKhoan->tendangnhap,
                        'VaiTro' => $taiKhoan->vaiTro->ten,
                        'ID_RapPhim' => $taiKhoan->nguoiDungInternals->id_rapphim ?? null,
                    ];
                    return true;
                }
            }
            // Nếu đăng nhập không thành công
            return false;
        }
    }
?>