<?php
    namespace App\Controllers;
    use App\Services\Sc_GiaVe;
    use function App\Core\view;
    class Ctrl_GiaVe{
        public function index(){
            return view('internal.gia-ve');
        }
        public function themQuyTac(){
            $service = new Sc_GiaVe();
            try {
                if($service->them()){
                    return [
                        'success' => true,
                        'message' => 'Thêm quy tắc giá vé thành công',
                    ];
                }
                else{
                    return [
                        'success' => false,
                        'message' => 'Thêm quy tắc giá vé thất bại',
                    ];
                }
            } catch (\Exception $e) {
                return [
                    'success' => false,
                    'message' => 'Lỗi khi thêm quy tắc giá vé: ' . $e->getMessage(),
                ];
            }
        }
        public function docQuyTac(){
            $service = new Sc_GiaVe();
            try {
                $data = $service->doc();
                return [
                    'success' => true,
                    'data' => $data,
                ];
            } catch (\Exception $e) {
                return [
                    'success' => false,
                    'message' => 'Lỗi khi đọc quy tắc giá vé: ' . $e->getMessage(),
                ];
            }
        }
        public function suaQuyTac($argc){
            $service = new Sc_GiaVe();
            $id = $argc['id'];
            try {
                if($service->sua($id)){
                    return [
                        'success' => true,
                        'message' => 'Sửa quy tắc giá vé thành công',
                    ];
                }
                else{
                    return [
                        'success' => false,
                        'message' => 'Sửa quy tắc giá vé thất bại',
                    ];
                }
            } catch (\Exception $e) {
                return [
                    'success' => false,
                    'message' => 'Lỗi khi sửa quy tắc giá vé: ' . $e->getMessage(),
                ];
            }
        }

        public function docGiaVe($loaiGheId, $ngay = null, $dinhDangPhim = null)
        {
            $service = new Sc_GiaVe();

            try {
                if (!$loaiGheId) {
                    throw new \Exception("Thiếu tham số loai_ghe_id");
                }

                $data = $service->tinhGiaGhe($loaiGheId, $ngay, $dinhDangPhim);

                return [
                    'success' => true,
                    'data' => $data,
                ];
            } catch (\Exception $e) {
                return [
                    'success' => false,
                    'message' => 'Lỗi khi đọc quy tắc giá vé: ' . $e->getMessage(),
                ];
            }
        }


    }
?>