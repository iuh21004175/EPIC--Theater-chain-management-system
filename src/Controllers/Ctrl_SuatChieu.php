<?php
    namespace App\Controllers;
    use App\Services\Sc_SuatChieu;
    use function App\Core\view;
    class Ctrl_SuatChieu{
        public function index(){
            return view('internal.suat-chieu');
        }
        public function themSuatChieu(){
            $service = new Sc_SuatChieu();
            try {
                $result = $service->them();
                if ($result) {
                    return [
                        'success' => true,
                        'message' => 'Thêm suất chiếu thành công',
                    ];
                } else {
                    return [
                        'success' => false,
                        'message' => 'Thêm suất chiếu thất bại',
                    ];
                }
            }
            catch (\Exception $e) {
                
                return [
                    'success' => false,
                    'message' => 'Lỗi khi thêm suất chiếu: ' . $e->getMessage()
                ];
            }
        }
        public function taoKhungGioGoiY(){
            $service = new Sc_SuatChieu();
            try {
                $result = $service->taoKhungGioGoiY($_GET['ngay'], (int) $_GET['id_phong_chieu'], (int) $_GET['thoi_luong_phim']);
                if ($result) {
                    return [
                        'success' => true,
                        'message' => 'Tạo khung giờ gợi ý thành công',
                        'data' => $result
                    ];
                } else {
                    return [
                        'success' => false,
                        'message' => 'Tạo khung giờ gợi ý thất bại',
                    ];
                }
            }
            catch (\Exception $e) {
                
                return [
                    'success' => false,
                    'message' => 'Lỗi khi tạo khung giờ gợi ý: ' . $e->getMessage()
                ];
            }
        }
        public function kiemTraSuatChieuHopLe(){
            $service = new Sc_SuatChieu();
            try {
                $result = $service->kiemTraSuatChieu($_GET['batdau'], (int) $_GET['id_phong_chieu'], (int) $_GET['thoi_luong_phim']);
                if ($result) {
                    return [
                        'success' => true,
                        'message' => 'Suất chiếu hợp lệ',
                    ];
                } else {
                    return [
                        'success' => false,
                        'message' => 'Suất chiếu không hợp lệ',
                    ];
                }
            }
            catch (\Exception $e) {
                
                return [
                    'success' => false,
                    'message' => 'Lỗi khi kiểm tra suất chiếu: ' . $e->getMessage()
                ];
            }
        }
        public function docSuatChieu(){
            $service = new Sc_SuatChieu();
            $ngay = $_GET['ngay'] ?? date('Y-m-d');
            try{
                $result = $service->doc($ngay);
                return [
                    'success' => true,
                    'message' => 'Đọc suất chiếu thành công',
                    'data' => $result
                ];
            }
            catch(\Exception $e){
                return [
                    'success' => false,
                    'message' => 'Lỗi khi đọc suất chiếu: ' . $e->getMessage()
                ];
            }
        }
    }
?>