<?php
    namespace App\Controllers;
    use function App\Core\view;
    use App\Services\Sc_PhanCong;
    use App\Services\Sc_GoogleCloud;
    class Ctrl_PhanCong {
        // Properties and methods for the Ctrl_PhanCong class
        public function index() {
            // Code for the index method
           return view('internal.phan-cong');
        }
        public function docViTri(){
            $sc_PhanCong = new Sc_PhanCong();
            try {
                $viTri = $sc_PhanCong->docViTri();
                return ['success' => true, 'data' => $viTri];
            } catch (\Exception $e) {
                return [
                    'success' => false,
                    'error' => $e->getMessage()
                ];
            }
        }
        public function themViTri(){
            $sc_PhanCong = new Sc_PhanCong();
            try {
                $sc_PhanCong->themViTri();
                return ['success' => true];
            } catch (\Exception $e) {
                return [
                    'success' => false,
                    'error' => $e->getMessage()
                ];
            }
        }
        public function suaViTri($argc){
            $sc_PhanCong = new Sc_PhanCong();
            try {
                $sc_PhanCong->suaViTri($argc['id']);
                return ['success' => true];
            } catch (\Exception $e) {
                return [
                    'success' => false,
                    'error' => $e->getMessage()
                ];
            }
        }
        public function phanCong1NhanVien(){
            $sc_PhanCong = new Sc_PhanCong();
            try {
                $phanCong = $sc_PhanCong->phanCong1NhanVien();
                return ['success' => true, 'data' => $phanCong];
            } catch (\Exception $e) {
                return [
                    'success' => false,
                    'error' => $e->getMessage()
                ];
            }
        }
        public function xoa1PhanCong($argc){
            $sc_PhanCong = new Sc_PhanCong();
            try {
                $sc_PhanCong->xoa1PhanCong($argc['id']);
                return ['success' => true];
            } catch (\Exception $e) {
                return [
                    'success' => false,
                    'error' => $e->getMessage()
                ];
            }
        }
        public function docPhanCong(){
            $batDau = $_GET['bat_dau'];
            $ketThuc = $_GET['ket_thuc'];
            try {
                $sc_PhanCong = new Sc_PhanCong();
                $phanCong = $sc_PhanCong->docPhanCong($batDau, $ketThuc);
                return ['success' => true, 'data' => $phanCong];
            } catch (\Exception $e) {
                return [
                    'success' => false,
                    'error' => $e->getMessage()
                ];
            }
        }
    }
?>