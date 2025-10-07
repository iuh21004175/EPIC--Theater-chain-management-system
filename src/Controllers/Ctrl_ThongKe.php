<?php
    namespace App\Controllers;
    use function App\Core\view;
    use App\Services\Sc_ThongKe;
    class Ctrl_ThongKe {
        // Controller code here
        function index() {
            return view('internal.thong-ke');
        }
        // Lấy thống kê tổng quát theo rạp
        public function thongKeTongQuatTheoRap() {
            $scThongKe = new Sc_ThongKe();
            try{
                $idRap = $_SESSION['UserInternal']['ID_RapPhim'];
                $tuNgay = $_GET['tuNgay']; // Mặc định từ ngày đầu tháng
                $denNgay = $_GET['denNgay']; // Mặc định đến ngày cuối tháng
                return [
                    'success' => true,
                    'data' => $scThongKe->doanhThuTongQuatTheoRap($idRap, $tuNgay, $denNgay)
                ];
            } catch (\Exception $e) {
                // Xử lý lỗi
                return [
                    'success' => false,
                    'message' => $e->getMessage()
                ];
            }
        }
        public function thongKePhanTichTheoRap(){
            $scThongKe = new Sc_ThongKe();
            try{
                $idRap = $_SESSION['UserInternal']['ID_RapPhim'];
                $tuNgay = $_GET['tuNgay']; // Mặc định từ ngày đầu tháng
                $denNgay = $_GET['denNgay']; // Mặc định đến ngày cuối tháng
                return [
                    'success' => true,
                    'data' => $scThongKe->phanTichDoanhThuTheoRap($idRap, $tuNgay, $denNgay)
                ];
            } catch (\Exception $e) {
                // Xử lý lỗi
                return [
                    'success' => false,
                    'message' => $e->getMessage()
                ];
            }
        }
        public function thongKeTop10PhimTheoRap(){
            $scThongKe = new Sc_ThongKe();
            try{
                $idRap = $_SESSION['UserInternal']['ID_RapPhim'];
                $tuNgay = $_GET['tuNgay']; // Mặc định từ ngày đầu tháng
                $denNgay = $_GET['denNgay']; // Mặc định đến ngày cuối tháng
                return [
                    'success' => true,
                    'data' => $scThongKe->top10PhimCoDoanhThuCaoNhatTheoRap($idRap, $tuNgay, $denNgay)
                ];
            } catch (\Exception $e) {
                // Xử lý lỗi
                return [
                    'success' => false,
                    'message' => $e->getMessage()
                ];
            }
        }
        public function thongKeTop10SanPhamTheoRap(){
            $scThongKe = new Sc_ThongKe();
            try{
                $idRap = $_SESSION['UserInternal']['ID_RapPhim'];
                $tuNgay = $_GET['tuNgay']; // Mặc định từ ngày đầu tháng
                $denNgay = $_GET['denNgay']; // Mặc định đến ngày cuối tháng
                return [
                    'success' => true,
                    'data' => $scThongKe->top10SanPhamCoDoanhThuCaoNhatTheoRap($idRap, $tuNgay, $denNgay)
                ];
            } catch (\Exception $e) {
                // Xử lý lỗi
                return [
                    'success' => false,
                    'message' => $e->getMessage()
                ];
            }
        }
        public function thongKeHieuQuaKhungGioSuatChieu(){
            $scThongKe = new Sc_ThongKe();
            try{
                $idRap = $_SESSION['UserInternal']['ID_RapPhim'];
                $tuNgay = $_GET['tuNgay']; // Mặc định từ ngày đầu tháng
                $denNgay = $_GET['denNgay']; // Mặc định đến ngày cuối tháng
                return [
                    'success' => true,
                    'data' => $scThongKe->hieuQuaTheoKhungGioTheoRap($idRap, $tuNgay, $denNgay)
                ];
            } catch (\Exception $e) {
                // Xử lý lỗi
                return [
                    'success' => false,
                    'message' => $e->getMessage()
                ];
            }
        }
        public function thongKeXuHuongKhachHangTheoThoiGian(){
            $scThongKe = new Sc_ThongKe();
            try{
                $idRap = $_SESSION['UserInternal']['ID_RapPhim'];
                $tuNgay = $_GET['tuNgay']; // Mặc định từ ngày đầu tháng
                $denNgay = $_GET['denNgay']; // Mặc định đến ngày cuối tháng
                return [
                    'success' => true,
                    'data' => $scThongKe->xuHuongKhachHangTheoThoiGianTheoRap($idRap, $tuNgay, $denNgay)
                ];
            } catch (\Exception $e) {
                // Xử lý lỗi
                return [
                    'success' => false,
                    'message' => $e->getMessage()
                ];
            }
        }
        public function thongKeChiTietTheoRap(){
            $scThongKe = new Sc_ThongKe();
            try{
                $idRap = $_SESSION['UserInternal']['ID_RapPhim'];
                $tuNgay = $_GET['tuNgay']; // Mặc định từ ngày đầu tháng
                $denNgay = $_GET['denNgay']; // Mặc định đến ngày cuối tháng
                return [
                    'success' => true,
                    'data' => $scThongKe->phanTichChiTiet($idRap, $tuNgay, $denNgay)
                ];
            } catch (\Exception $e) {
                // Xử lý lỗi
                return [
                    'success' => false,
                    'message' => $e->getMessage()
                ];
            }
        }

        /**
         * API thống kê toàn rạp (cho Admin/Quản lý chuỗi rạp)
         * Hiển thị: Tổng doanh thu, Tổng vé bán, Tỉ lệ lấp đầy, Doanh thu F&B
         * Tham số: tuNgay, denNgay, idRap (optional - nếu muốn filter theo rạp cụ thể)
         * So sánh: soSanhVoiKyTruoc (true/false)
         */
        public function thongKeToanRap(){
            $scThongKe = new Sc_ThongKe();
            try{
                // Lấy tham số từ GET request
                $tuNgay = $_GET['tuNgay'] ?? date('Y-m-01'); // Mặc định từ ngày đầu tháng
                $denNgay = $_GET['denNgay'] ?? date('Y-m-t'); // Mặc định đến ngày cuối tháng
                $idRap = $_GET['idRap'] ?? 'all'; // 'all' = tất cả rạp, hoặc ID rạp cụ thể
                $soSanhVoiKyTruoc = isset($_GET['soSanh']) && $_GET['soSanh'] === 'true';
                
                return [
                    'success' => true,
                    'data' => $scThongKe->thongKeTongQuanToanRap($tuNgay, $denNgay, $idRap, $soSanhVoiKyTruoc)
                ];
            } catch (\Exception $e) {
                return [
                    'success' => false,
                    'message' => $e->getMessage()
                ];
            }
        }
    }
?>