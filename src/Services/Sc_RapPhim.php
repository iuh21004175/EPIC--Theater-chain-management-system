<?php
    namespace App\Services;
    use App\Models\RapPhim;
    class Sc_RapPhim {
        public function them(){
            $rapPhim = null;
            try{

                $rapPhim = RapPhim::create([
                    'ten' => $_POST['ten'],
                    'dia_chi' => $_POST['diachi'],
                    'trang_thai' => 1 // Mặc định là đang hoạt động
                ]);
                return $rapPhim ? true : false;
            } catch (\Exception $e) {
                // Xử lý lỗi
                $rapPhim?->delete();
                throw new \Exception($e->getMessage());
            }
            
        }
        public function doc(){
            return RapPhim::all();
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
                return $rapPhim->save();
            }
        }
    }
?>