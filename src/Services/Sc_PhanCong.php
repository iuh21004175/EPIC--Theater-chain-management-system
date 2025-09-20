<?php
    namespace App\Services;
    use App\Models\ViTriCongViec;
    class Sc_PhanCong {
        public function docViTri(){
            $viTri = ViTriCongViec::with('rapPhim')
                ->where('id_rapphim', $_SESSION['UserInternal']['ID_RapPhim'])
                ->get();
            return $viTri;
        }
        public function themViTri(){
            $ten = $_POST['ten'] ?? '';
            $idRapPhim = $_SESSION['UserInternal']['ID_RapPhim'];

            if ($ten && $idRapPhim) {
                ViTriCongViec::create([
                    'ten' => $ten,
                    'id_rapphim' => $idRapPhim,
                ]);
                
            }
            else {
                throw new \Exception("Tên vị trí và ID rạp phim không được để trống.");
            }
        }
        public function suaViTri($id){
            $data = json_decode(file_get_contents('php://input'), true);
            $ten = $data['ten'] ?? '';

            $viTri = ViTriCongViec::find($id);
            if ($viTri) {
                if ($ten) {
                    $viTri->ten = $ten;
                    $viTri->save();
                } else {
                    throw new \Exception("Tên vị trí không được để trống.");
                }
            } else {
                throw new \Exception("Vị trí công việc không tồn tại.");
            }
        }
    }
?>