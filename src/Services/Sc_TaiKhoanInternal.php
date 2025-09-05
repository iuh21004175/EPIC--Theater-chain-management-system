<?php
    namespace App\Services;
    use App\Models\TaiKhoanInternal;

    class Sc_TaiKhoanInternal {
        public function them(){
            $taiKhoan = null;
            try{
                $data = file_get_contents('php://input');
                $json = json_decode($data, true);
                $taiKhoan = TaiKhoanInternal::create([
                    'tendangnhap' => $json['tendangnhap'],
                    'matkhau_bam' => password_hash($json['matkhau'], PASSWORD_ARGON2ID),
                    'id_vaitro' => 3
                ]);
                if($taiKhoan){
                    $taiKhoan->nguoiDungInternals()->create([
                        'ten' => $json['ten'],
                        'email' => $json['email'],
                        'dien_thoai' => $json['dien_thoai'],
                        'id_taikhoan' => $taiKhoan->id
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
            return TaiKhoanInternal::with('vaiTro', 'nguoiDungInternals')->get();
        }
    }
?>