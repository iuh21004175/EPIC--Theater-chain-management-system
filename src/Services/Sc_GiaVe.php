<?php
    namespace App\Services;
    use App\Models\QuyTac_GiaVe;
    class Sc_GiaVe {
        // Properties and methods for the Sc_GiaVe class
        public function them(){
            $data = json_decode(file_get_contents('php://input'), true);
            // Xử lý logic thêm quy tắc giá vé
            return QuyTac_GiaVe::create([
                'ten' => $data['ten'],
                'loai_hanhdong' => $data['loai_hanhdong'], // 'Thiết lập giá' hoặc 'Cộng thêm tiền'
                'gia_tri' => $data['gia_tri'],
                'dieu_kien' => json_encode($data['dieu_kien']),
                'trang_thai' => $data['trang_thai'],
                'do_uu_tien' => $data['do_uu_tien'], // Độ ưu tiên từ 1 đến 5 với 1 là cao nhất
            ]);
        }
        public function doc(){
            return QuyTac_GiaVe::all();
        }
        public function sua($id){
            $data = json_decode(file_get_contents('php://input'), true);
            $quyTac = QuyTac_GiaVe::find($id);
            if($quyTac){
                $quyTac->ten = $data['ten'];
                $quyTac->loai_hanhdong = $data['loai_hanhdong']; // 'Thiết lập giá' hoặc 'Cộng thêm tiền'
                $quyTac->gia_tri = $data['gia_tri'];
                $quyTac->dieu_kien = json_encode($data['dieu_kien']);
                $quyTac->trang_thai = $data['trang_thai'];
                $quyTac->do_uu_tien = $data['do_uu_tien']; // Độ ưu tiên từ 1 đến 5 với 1 là cao nhất
                return $quyTac->save();
            }
            return false;
        }   
    }
?>