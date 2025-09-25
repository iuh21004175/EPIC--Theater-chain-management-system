<?php
    namespace App\Services;
    use App\Models\ViTriCongViec;
    use App\Models\PhanCong;
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
        public function phanCong1NhanVien(){
            $idNhanVien = $_POST['id_nhanvien'];
            $idCongViec = $_POST['id_congviec'];
            $ngay = $_POST['ngay'];
            $ca = $_POST['ca'];

            $phanCong = PhanCong::create([
                'id_nhanvien' => $idNhanVien,
                'id_congviec' => $idCongViec,
                'ngay' => $ngay,
                'ca' => $ca,
            ]);
            return $phanCong;
        }
        public function xoa1PhanCong($id){
            $phanCong = PhanCong::find($id);
            if ($phanCong) {
                $phanCong->delete();
            } else {
                throw new \Exception("Phân công không tồn tại.");
            }
        }
        public function docPhanCong($batdau, $ketthuc){
            $phanCong = PhanCong::with(['nhanVien', 'congViec'])
                ->whereHas('nhanVien', function($query) {
                    $query->where('id_rapphim', $_SESSION['UserInternal']['ID_RapPhim']);
                })
                ->whereBetween('ngay', [$batdau, $ketthuc])
                ->orderBy('ngay', 'asc')
                ->orderBy('ca', 'asc')
                ->get();
            return $phanCong;
        }
    }
?>