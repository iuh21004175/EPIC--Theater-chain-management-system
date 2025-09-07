<?php
    namespace App\Services;
    use App\Models\Phim_TheLoai;
    use App\Models\Phim;
    use App\Models\TheLoai;
    class Sc_phim {
        public function themTheLoai(){
            $ten = $_POST['ten'] ?? '';
            $theLoai = TheLoai::create([
                'ten' => $ten,
            ]);
            if($theLoai){
                return true;
            }
            return false;
        }
        public function docTheLoai(){
            return TheLoai::all();
        }
        public function suaTheLoai($id){
            $data = file_get_contents('php://input');
            $data = json_decode($data, true);
            $ten = $data['ten'] ?? '';
            $theLoai = TheLoai::find($id);
            if($theLoai){
                $theLoai->ten = $ten;
                $theLoai->save();
                return true;
            }
            return false;
        }
        public function suaTheLoaiPhim($idPhim){
            $data = file_get_contents('php://input');
            $data = json_decode($data, true);
            $theLoai = TheLoai::find($idPhim);
            if($theLoai){
                $theLoai->ten = $data['ten'] ?? '';
                $theLoai->save();
                return true;
            }
            return false;
        }
    }
?>