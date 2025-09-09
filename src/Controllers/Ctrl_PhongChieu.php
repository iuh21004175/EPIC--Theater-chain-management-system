<?php
    namespace App\Controllers;
    use App\Services\Sc_PhongChieu;
    use function App\Core\view;
    class Ctrl_PhongChieu {
        // Các phương thức và thuộc tính của controller sẽ được định nghĩa ở đây
        public function index() {
            // Mã cho phương thức index
           return view('internal.phong-chieu');
        }
        public function themPhongChieu() {
            $service = new Sc_PhongChieu();
            try {
                if ($service->them()) {
                    // Chuyển hướng hoặc trả về phản hồi thành công
                    return [
                        'success' => true,
                        'message' => 'Thêm phòng chiếu thành công'
                    ];
                } else {
                    // Xử lý lỗi nếu cần
                    return [
                        'success' => false,
                        'message' => 'Thêm phòng chiếu thất bại'
                    ];
                }
            } catch (\Exception $e) {
                // Xử lý ngoại lệ nếu cần
                return [
                    'success' => false,
                    'message' => 'Đã xảy ra lỗi: ' . $e->getMessage()
                ];
            }
        }
    }
?>