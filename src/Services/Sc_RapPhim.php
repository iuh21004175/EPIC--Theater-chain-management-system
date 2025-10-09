<?php
    namespace App\Services;
    use App\Models\RapPhim;
    use App\Models\SuatChieu;
use Carbon\Carbon;

    class Sc_RapPhim {
        public function them(){
            $rapPhim = null;
            try{

                $rapPhim = RapPhim::create([
                    'ten' => $_POST['ten'],
                    'dia_chi' => $_POST['diachi'],
                    'ban_do' => $_POST['ban_do'] ?? null,
                    'trang_thai' => 1 // Mặc định là đang hoạt động
                ]);
                return $rapPhim ? true : false;
            } catch (\Exception $e) {
                // Xử lý lỗi
                $rapPhim?->delete();
                throw new \Exception($e->getMessage());
            }
            
        }
        public function doc()
        {
            $rapPhim = RapPhim::all();

            foreach ($rapPhim as $item) {
                $item->so_suat_chua_duyet = SuatChieu::whereHas('phongChieu', function($query) use ($item) {
                    $query->where('id_rapphim', $item->id);
                })->whereIn('tinh_trang', [0, 3]) // 0 Là chưa duyệt, 3 là chờ duyệt lại
                ->where('batdau', '>=', Carbon::now())
                ->count();
            }

            return $rapPhim;
        }
        public function docTheoID($id) {
            $rapPhim = RapPhim::find($id);
            return $rapPhim;
        }
        public function trangThai($id){
            $rapPhim = RapPhim::find($id);
            if(!$rapPhim){
               return false;
            }
            else{
                $rapPhim->trang_thai = $rapPhim->trang_thai == 1 ? 0 : 1;
                return $rapPhim->save();
            }
        }
        public function sua($id){
            $rapPhim = RapPhim::find($id);
            if(!$rapPhim){
               return false;
            }
            else{
                $rapPhim->ten = $_POST['ten'];
                $rapPhim->dia_chi = $_POST['diachi'];
                $rapPhim->ban_do = $_POST['ban_do'] ?? null;
                return $rapPhim->save();
            }
        }
    }
?>