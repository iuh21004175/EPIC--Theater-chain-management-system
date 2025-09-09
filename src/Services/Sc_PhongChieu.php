<?php
    namespace App\Services;
    use App\Models\PhongChieu;
    class Sc_PhongChieu {
        // Các phương thức liên quan đến phòng chiếu sẽ được thêm vào đây
        public function them(){
            $phongChieu = null;
            try{
                $ten = $_POST['ten'] ?? '';
                $maPhong = $_POST['ma_phong'] ?? '';
                $moTa = $_POST['mo_ta'] ?? '';
                $loaiPhongChieu = $_POST['loai_phongchieu'] ?? '';
                $trangThai = $_POST['trang_thai'] ?? '';
                $soHangGhe = $_POST['sohang_ghe'] ?? 0;
                $soCotGhe = $_POST['socot_ghe'] ?? 0;
                $phongChieu = PhongChieu::create([
                    'ten' => $ten,
                    'ma_phong' => $maPhong,
                    'mo_ta' => $moTa,
                    'loai_phongchieu' => $loaiPhongChieu,
                    'trang_thai' => $trangThai,
                    'sohang_ghe' => $soHangGhe,
                    'socot_ghe' => $soCotGhe,
                    'id_rapphim' => $_SESSION['UserInternal']['ID_RapPhim'],
                ]);
                if($phongChieu){
                    $danhSachGhe = $_POST['danh_sach_ghe'] ?? [];
                    if(count($danhSachGhe) == 0){
                        throw new \Exception("Số lượng ghế không hợp lệ. ". count($danhSachGhe));
                    }
                    foreach($danhSachGhe as $ghe){
                        $phongChieu->soDoGhe()->create([
                            'so_ghe' => $ghe['so_ghe'] ?? '',
                            'loaighe_id' => $ghe['loaighe_id'] ?? null,
                            'phongchieu_id' => $phongChieu->id,
                        ]);
                    }
                    $phongChieu->capNhatSoLuongGhe();
                    return true;
                }
                return false;
            } catch (\Exception $e) {
                $phongChieu?->delete();
                throw new \Exception($e->getMessage());
            }
        }
    }

?>