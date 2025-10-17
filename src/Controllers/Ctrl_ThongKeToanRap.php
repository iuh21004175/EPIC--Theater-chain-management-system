<?php
    namespace App\Controllers;
    use App\Services\Sc_ThongKe;
    use function App\Core\view;
    class Ctrl_ThongKeToanRap {
        public function index() {
            // Logic thống kê doanh thu
            return view("internal.thong-ke-toan-rap");
        }

        public function thongKeDoanhThuPhim(){
            $scThongKe = new Sc_ThongKe();
            try {
                $tuNgay = $_GET['tuNgay'] ?? date('Y-m-01');
                $denNgay = $_GET['denNgay'] ?? date('Y-m-t');
                return [
                    'success' => true,
                    'data' => $scThongKe->doanhThuPhim($tuNgay, $denNgay)
                ];
            }
            catch (\Exception $e) {
                return [
                    'success' => false,
                    'message' => $e->getMessage()
                ];
            }
        }
    }
?>
