<?php
    namespace App\Controllers;
    use App\Services\Sc_SanPham;
    use function App\Core\view;

    class Ctrl_SanPhamAnUong{
        public function index(){
            return view('internal.san-pham-an-uong');
        }
        public function themDanhMuc(){
            $service = new Sc_SanPham();
            try {
                $result = $service->themDanhMuc();
                if($result){
                    return ['success' => true, 'message' => 'Thêm danh mục thành công'];
                } else {
                    return ['success' => false, 'message' => 'Thêm danh mục thất bại'];
                }
            } catch (\Exception $e) {
                return ['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()];
            }
        }
        public function docDanhMuc(){
            $service = new Sc_SanPham();
            try {
                $result = $service->docDanhMuc();
                return ['success' => true, 'data' => $result];
            } catch (\Exception $e) {
                return ['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()];
            }
        }
        public function suaDanhMuc($argc){
            $service = new Sc_SanPham();
            $id = $argc['id'];
            try {
                $result = $service->suaDanhMuc($id);
                if($result){
                    return ['success' => true, 'message' => 'Sửa danh mục thành công'];
                } else {
                    return ['success' => false, 'message' => 'Sửa danh mục thất bại'];
                }
            } catch (\Exception $e) {
                return ['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()];
            }
        }
        public function themSanPham(){
            $service = new Sc_SanPham();
            try {
                $result = $service->themSanPham();
                if($result){
                    return ['success' => true, 'message' => 'Thêm sản phẩm thành công', 'data' => $result];
                } else {
                    return ['success' => false, 'message' => 'Thêm sản phẩm thất bại'];
                }
            } catch (\Exception $e) {
                return ['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()];
            }
        }

        public function docSanPhamTheoRap($argc){
            $service = new Sc_SanPham();
            try {
                $result = $service->docSanPhamTheoRap($argc['id']);
                return ['success' => true, 'data' => $result];
            } catch (\Exception $e) {
                return ['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()];
            }
        }
    }
?>