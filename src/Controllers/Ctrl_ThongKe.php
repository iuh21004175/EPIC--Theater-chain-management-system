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

        /**
         * API xu hướng doanh thu toàn rạp
         * Hiển thị biểu đồ xu hướng doanh thu theo thời gian
         * Tham số: tuNgay, denNgay, idRap, loaiXuHuong (daily/weekly/monthly)
         */
        public function xuHuongDoanhThuToanRap(){
            $scThongKe = new Sc_ThongKe();
            try{
                $tuNgay = $_GET['tuNgay'] ?? date('Y-m-01');
                $denNgay = $_GET['denNgay'] ?? date('Y-m-t');
                $idRap = $_GET['idRap'] ?? 'all';
                $loaiXuHuong = $_GET['loaiXuHuong'] ?? 'daily'; // daily, weekly, monthly
                
                return [
                    'success' => true,
                    'data' => $scThongKe->xuHuongDoanhThuToanRap($tuNgay, $denNgay, $idRap, $loaiXuHuong)
                ];
            } catch (\Exception $e) {
                return [
                    'success' => false,
                    'message' => $e->getMessage()
                ];
            }
        }

        /**
         * API xu hướng vé bán toàn rạp
         * Hiển thị biểu đồ xu hướng số vé bán theo thời gian
         * Tham số: tuNgay, denNgay, idRap, loaiXuHuong (daily/weekly/monthly)
         */
        public function xuHuongVeBanToanRap(){
            $scThongKe = new Sc_ThongKe();
            try{
                $tuNgay = $_GET['tuNgay'] ?? date('Y-m-01');
                $denNgay = $_GET['denNgay'] ?? date('Y-m-t');
                $idRap = $_GET['idRap'] ?? 'all';
                $loaiXuHuong = $_GET['loaiXuHuong'] ?? 'daily'; // daily, weekly, monthly
                
                return [
                    'success' => true,
                    'data' => $scThongKe->xuHuongVeBanToanRap($tuNgay, $denNgay, $idRap, $loaiXuHuong)
                ];
            } catch (\Exception $e) {
                return [
                    'success' => false,
                    'message' => $e->getMessage()
                ];
            }
        }

        /**
         * API Top 10 phim toàn rạp
         * Hiển thị danh sách 10 phim có doanh thu cao nhất
         * Tham số: tuNgay, denNgay, idRap
         */
        public function top10PhimToanRap(){
            $scThongKe = new Sc_ThongKe();
            try{
                $tuNgay = $_GET['tuNgay'] ?? date('Y-m-01');
                $denNgay = $_GET['denNgay'] ?? date('Y-m-t');
                $idRap = $_GET['idRap'] ?? 'all';
                
                return [
                    'success' => true,
                    'data' => $scThongKe->top10PhimToanRap($tuNgay, $denNgay, $idRap)
                ];
            } catch (\Exception $e) {
                return [
                    'success' => false,
                    'message' => $e->getMessage()
                ];
            }
        }

        /**
         * API Top 10 sản phẩm toàn rạp
         * Hiển thị danh sách 10 sản phẩm có doanh thu cao nhất
         * Tham số: tuNgay, denNgay, idRap
         */
        public function top10SanPhamToanRap(){
            $scThongKe = new Sc_ThongKe();
            try{
                $tuNgay = $_GET['tuNgay'] ?? date('Y-m-01');
                $denNgay = $_GET['denNgay'] ?? date('Y-m-t');
                $idRap = $_GET['idRap'] ?? 'all';
                
                return [
                    'success' => true,
                    'data' => $scThongKe->top10SanPhamToanRap($tuNgay, $denNgay, $idRap)
                ];
            } catch (\Exception $e) {
                return [
                    'success' => false,
                    'message' => $e->getMessage()
                ];
            }
        }

        /**
         * API Hiệu suất theo rạp
         * Hiển thị biểu đồ so sánh doanh thu giữa các rạp
         * Tham số: tuNgay, denNgay, idRap (optional)
         */
        public function hieuSuatTheoRapToanRap(){
            $scThongKe = new Sc_ThongKe();
            try{
                $tuNgay = $_GET['tuNgay'] ?? date('Y-m-01');
                $denNgay = $_GET['denNgay'] ?? date('Y-m-t');
                $idRap = $_GET['idRap'] ?? 'all';
                
                return [
                    'success' => true,
                    'data' => $scThongKe->hieuSuatTheoRap($tuNgay, $denNgay, $idRap)
                ];
            } catch (\Exception $e) {
                return [
                    'success' => false,
                    'message' => $e->getMessage()
                ];
            }
        }

        /**
         * API Cơ cấu doanh thu
         * Hiển thị biểu đồ donut chart về phân bổ doanh thu
         * Tham số: tuNgay, denNgay, idRap (optional)
         */
        public function coCauDoanhThuToanRap(){
            $scThongKe = new Sc_ThongKe();
            try{
                $tuNgay = $_GET['tuNgay'] ?? date('Y-m-01');
                $denNgay = $_GET['denNgay'] ?? date('Y-m-t');
                $idRap = $_GET['idRap'] ?? 'all';
                
                return [
                    'success' => true,
                    'data' => $scThongKe->coCauDoanhThuToanRap($tuNgay, $denNgay, $idRap)
                ];
            } catch (\Exception $e) {
                return [
                    'success' => false,
                    'message' => $e->getMessage()
                ];
            }
        }

        /**
         * API Hiệu suất theo ngày trong tuần
         * Hiển thị biểu đồ line chart về vé bán và tỷ lệ lấp đầy theo ngày trong tuần
         * Tham số: tuNgay, denNgay, idRap (optional)
         */
        public function hieuSuatTheoNgayTrongTuan(){
            $scThongKe = new Sc_ThongKe();
            try{
                $tuNgay = $_GET['tuNgay'] ?? date('Y-m-01');
                $denNgay = $_GET['denNgay'] ?? date('Y-m-t');
                $idRap = $_GET['idRap'] ?? 'all';
                
                return [
                    'success' => true,
                    'data' => $scThongKe->hieuSuatTheoNgayTrongTuan($tuNgay, $denNgay, $idRap)
                ];
            } catch (\Exception $e) {
                return [
                    'success' => false,
                    'message' => $e->getMessage()
                ];
            }
        }

        /**
         * API Hiệu suất theo giờ trong ngày
         * Hiển thị biểu đồ area chart về tỷ lệ lấp đầy theo khung giờ
         * Tham số: tuNgay, denNgay, idRap (optional)
         */
        public function hieuSuatTheoGioTrongNgay(){
            $scThongKe = new Sc_ThongKe();
            try{
                $tuNgay = $_GET['tuNgay'] ?? date('Y-m-01');
                $denNgay = $_GET['denNgay'] ?? date('Y-m-t');
                $idRap = $_GET['idRap'] ?? 'all';
                
                return [
                    'success' => true,
                    'data' => $scThongKe->hieuSuatTheoGioTrongNgay($tuNgay, $denNgay, $idRap)
                ];
            } catch (\Exception $e) {
                return [
                    'success' => false,
                    'message' => $e->getMessage()
                ];
            }
        }

        /**
         * API Top 10 sản phẩm F&B bán chay nhất
         * Hiển thị bảng top 10 sản phẩm có số lượng bán cao nhất
         * Tham số: tuNgay, denNgay, idRap (optional)
         */
        public function top10SanPhamBanChayNhat(){
            $scThongKe = new Sc_ThongKe();
            try{
                $tuNgay = $_GET['tuNgay'] ?? date('Y-m-01');
                $denNgay = $_GET['denNgay'] ?? date('Y-m-t');
                $idRap = $_GET['idRap'] ?? 'all';
                
                return [
                    'success' => true,
                    'data' => $scThongKe->top10SanPhamBanChayNhat($tuNgay, $denNgay, $idRap)
                ];
            } catch (\Exception $e) {
                return [
                    'success' => false,
                    'message' => $e->getMessage()
                ];
            }
        }

        /**
         * API Tỉ lệ doanh thu F&B trên mỗi đơn hàng
         * Hiển thị biểu đồ cột về doanh thu F&B trung bình trên mỗi đơn hàng
         * Tham số: tuNgay, denNgay, idRap (optional)
         */
        public function tiLeDoanhThuFnBTrenDonHang(){
            $scThongKe = new Sc_ThongKe();
            try{
                $tuNgay = $_GET['tuNgay'] ?? date('Y-m-01');
                $denNgay = $_GET['denNgay'] ?? date('Y-m-t');
                $idRap = $_GET['idRap'] ?? 'all';
                
                return [
                    'success' => true,
                    'data' => $scThongKe->tiLeDoanhThuFnBTrenDonHang($tuNgay, $denNgay, $idRap)
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