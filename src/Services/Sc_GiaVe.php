<?php
    namespace App\Services;
    use App\Models\QuyTac_GiaVe;
    use App\Models\Ghe;
    use Carbon\Carbon;
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
        
        public function tinhGiaGhe($loaiGheId, $ngay = null, $dinhDangPhim = null)
        {
            $date = $ngay ? Carbon::parse($ngay) : Carbon::today();
            $dayType = ($date->dayOfWeek == 0 || $date->dayOfWeek == 6) ? 'Cuoi tuan' : 'Ngay thuong';

            // Lấy giá cơ bản theo ngày
            $quyTacNgay = QuyTac_GiaVe::where('trang_thai', 1)->get()
                ->first(function($qt) use ($dayType) {
                    $dieuKien = json_decode($qt->dieu_kien, true);
                    foreach ($dieuKien as $dk) {
                        if (!empty($dk['type']) && $dk['type'] === 'day_type' && $dk['value'] === $dayType) {
                            return true;
                        }
                    }
                    return false;
                });
            $giaCoBan = $quyTacNgay->gia_tri ?? 0;

            // Phụ thu định dạng phim
            $phuThuDinhDang = 0;
            if ($dinhDangPhim) {
                $quyTacDinhDang = QuyTac_GiaVe::where('trang_thai', 1)->get()
                    ->first(function($qt) use ($dinhDangPhim) {
                        $dieuKien = json_decode($qt->dieu_kien, true);
                        foreach ($dieuKien as $dk) {
                            if (!empty($dk['type']) && $dk['type'] === 'movie_format' && $dk['value'] === $dinhDangPhim) {
                                return true;
                            }
                        }
                        return false;
                    });
                $phuThuDinhDang = $quyTacDinhDang->gia_tri ?? 0;
            }

            // Phụ thu loại ghế
            $loaiGhe = Ghe::where('id', $loaiGheId)->first(); 
            $phuThu = $loaiGhe->phu_thu ?? 0;

            return $giaCoBan + $phuThu + $phuThuDinhDang;
        }
    }
?>