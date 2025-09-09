<?php
    namespace App\Controllers;
    use App\Services\Sc_Phim;
    use function App\Core\view;

    class Ctrl_Phim{
        public function index(){
            return view('internal.phim');
        }
        public function indexKhachHang(){
            return view('customer.phim');
        }
        public function lichChieu(){
            return view('customer.lich-chieu');
        }
        public function datVe(){
            return view('customer.dat-ve');
        }
        public function tinTuc(){
            return view('customer.tin-tuc');
        }
        public function chiTietTinTuc(){
            return view('customer.chi-tiet-tin-tuc');
        }
        public function banVe(){
            return view('internal.ban-ve');
        }


        public function themTheLoaiPhim(){
            $service = new Sc_Phim();
            try {
                $result = $service->themTheLoai();
                if ($result) {
                    return [
                        'success' => true,
                        'message' => 'Thêm thể loại thành công'
                    ];
                } else {
                    return [
                        'success' => false,
                        'message' => 'Thêm thể loại thất bại'
                    ];
                }
            } catch (\Exception $e) {
                return [
                    'success' => false,
                    'message' => 'Lỗi khi thêm thể loại: ' . $e->getMessage()
                ];
            }
        }
        public function docTheLoaiPhim(){
            $service = new Sc_Phim();
            try {
                $result = $service->docTheLoai();
                return [
                    'success' => true,
                    'data' => $result
                ];
            } catch (\Exception $e) {
                return [
                    'success' => false,
                    'message' => 'Lỗi khi tải danh sách thể loại: ' . $e->getMessage()
                ];
            }
        }
        public function suaTenTheLoaiPhim($argc){
            $service = new Sc_Phim();
            try {
                $result = $service->suaTheLoai($argc['id']);
                if ($result) {
                    return [
                        'success' => true,
                        'message' => 'Cập nhật thể loại thành công'
                    ];
                } else {
                    return [
                        'success' => false,
                        'message' => 'Cập nhật thể loại thất bại'
                    ];
                }
            } catch (\Exception $e) {
                return [
                    'success' => false,
                    'message' => 'Lỗi khi cập nhật thể loại: ' . $e->getMessage()
                ];
            }
        }
        public function themPhim(){
            $service = new Sc_Phim();
            try {
                $result = $service->themPhim();
                if ($result) {
                    return [
                        'success' => true,
                        'message' => 'Thêm phim thành công'
                    ];
                } else {
                    return [
                        'success' => false,
                        'message' => 'Thêm phim thất bại'
                    ];
                }
            } catch (\Exception $e) {
                return [
                    'success' => false,
                    'message' => 'Lỗi khi thêm phim: ' . $e->getMessage()
                ];
            }
        }
        public function docPhim(){
            $service = new Sc_Phim();
            try {
                $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
                $result = $service->docPhim($page, $_GET['tuKhoaTimKiem'] ?? null, $_GET['trangThai'] ?? null, $_GET['theLoaiId'] ?? null);
                return [
                    'success' => true,
                    'data' => $result['data'],
                    'pagination' => [
                        'total' => $result['total'],
                        'total_pages' => $result['total_pages'],
                        'current_page' => $result['current_page']
                    ]
                ];
            } catch (\Exception $e) {
                return [
                    'success' => false,
                    'message' => 'Lỗi khi tải danh sách phim: ' . $e->getMessage()
                ];
            }
        }
        public function suaPhim($argc){
            $service = new Sc_Phim();
            try {
                $result = $service->suaPhim($argc['id']);
                if ($result) {
                    return [
                        'success' => true,
                        'message' => 'Cập nhật phim thành công'
                    ];
                } else {
                    return [
                        'success' => false,
                        'message' => 'Cập nhật phim thất bại'
                    ];
                }
            } catch (\Exception $e) {
                return [
                    'success' => false,
                    'message' => 'Lỗi khi cập nhật phim: ' . $e->getMessage()
                ];
            }
        }
    }
?>