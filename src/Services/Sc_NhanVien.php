<?php
    namespace App\Services;
    use App\Models\TaiKhoanInternal;
    use App\Models\NguoiDungInternal;
    class Sc_NhanVien{
        public function them(){
            $ten = $_POST['ten'] ?? '';
            $email = $_POST['email'] ?? '';
            $dienThoai = $_POST['dien_thoai'] ?? '';
            $tenDangNhap = $_POST['ten_dang_nhap'] ?? '';
            $matKhau = $_POST['mat_khau'] ?? '';
            $taiKhoan = null;
            try{
                $taiKhoan = TaiKhoanInternal::create([
                    'tendangnhap' => $tenDangNhap,
                    'matkhau_bam' => password_hash($matKhau, PASSWORD_ARGON2ID),
                    'id_vaitro' => 4 // Vai trò nhân viên
                ]);
                if($taiKhoan){
                    $taiKhoan->nguoiDungInternals()->create([
                        'ten' => $ten,
                        'email' => $email,
                        'dien_thoai' => $dienThoai,
                        'id_taikhoan' => $taiKhoan->id,
                    ]);
                    return true;
                }
                return false;
            } catch (\Exception $e) {
                // Xử lý lỗi
                $taiKhoan?->delete();
                throw new \Exception($e->getMessage());
            }
        }
        public function doc(){
            // Get the currently logged-in theater manager's id_rapphim
            $idRapPhim = null;
            if (isset($_SESSION['UserInternal']) && isset($_SESSION['UserInternal']['ID_RapPhim'])) {
                $idRapPhim = $_SESSION['UserInternal']['ID_RapPhim'];
            }
            
            // Query staff members who belong to the manager's theater
            return NguoiDungInternal::with('taiKhoan')
                ->whereHas('taiKhoan', function($query) {
                    $query->where('id_vaitro', 4); // Role id for staff
                })
                ->when($idRapPhim, function($query, $idRapPhim) {
                    $query->where('id_rapphim', $idRapPhim);
                })
                ->get();

        }
    }
?>