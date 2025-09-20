<?php
    namespace App\Controllers;
    use function App\Core\view;
    use App\Services\Sc_PhanCong;
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
    }
?>