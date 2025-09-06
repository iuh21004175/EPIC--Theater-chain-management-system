<?php
    namespace App\Services;
    use App\Models\KhachHang;
    class Sc_KhachHang {
        public function findById($id){
            return KhachHang::find($id);
        }

        public function update($id, $data){
            $khachHang = KhachHang::find($id);
            if ($khachHang) {
                $khachHang->ho_ten = $data['ho_ten'] ?? $khachHang->ho_ten;
                $khachHang->email = $data['email'] ?? $khachHang->email;
                $khachHang->ngay_sinh = $data['ngay_sinh'] ?? $khachHang->ngay_sinh;
                $khachHang->gioi_tinh = $data['gioi_tinh'] ?? $khachHang->gioi_tinh;
                $khachHang->save();
            }
            return $khachHang;
        }

    }
?>