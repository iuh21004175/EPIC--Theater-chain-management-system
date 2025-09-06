<?php
    namespace App\Controllers;
    use App\Services\Sc_NhanVien;
    use function App\Core\view;
    class Ctrl_NhanVien {
        // Các phương thức và thuộc tính của controller sẽ được định nghĩa ở đây
        public function index() {
            // Mã cho phương thức index
           return view('internal.nhan-vien');
        }
        public function themNhanVien(){
            // Code to handle adding a new employee
            $service = new Sc_NhanVien();
            try {
                $result = $service->them();
                if ($result) {
                    return [
                        'success' => true,
                        'message' => 'Thêm nhân viên thành công'
                    ];
                } else {
                    return [
                        'success' => false,
                        'message' => 'Thêm nhân viên thất bại'
                    ];
                }
            } catch (\Exception $e) {
                return [
                    'success' => false,
                    'message' => 'Lỗi khi thêm nhân viên: ' . $e->getMessage()
                ];
            }
        }
        public function docNhanVien(){
            $service = new Sc_NhanVien();
            try {
                $result = $service->doc();
                return [
                    'success' => true,
                    'data' => $result
                ];
            } catch (\Exception $e) {
                return [
                    'success' => false,
                    'message' => 'Lỗi khi đọc nhân viên: ' . $e->getMessage()
                ];
            }
        }
    }
?>