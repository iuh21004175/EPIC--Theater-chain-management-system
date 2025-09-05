<?php
    namespace App\Controllers;
    use App\Services\Sc_TaiKhoanInternal;
    use function App\Core\view;
    class Ctrl_TaiKhoanInternal {
        // Properties and methods for the Ctrl_TaiKhoanInternal class
        public function index() {
            // Code for the index method
           return view('internal.tai-khoan');
        }
        public function themTaiKhoan(){
            $service = new Sc_TaiKhoanInternal();
            try {
                $result = $service->them();
                if($result){
                    return [
                        'success' => true,
                        'message' => 'Tạo tài khoản quản lý rạp thành công'
                    ];
                } else {
                    return [
                        'success' => false,
                        'message' => 'Tạo tài khoản quản lý rạp thất bại'
                    ];
                }
            } catch (\Exception $e) {
                return [
                    'success' => false,
                    'message' => 'Lỗi: ' . $e->getMessage()
                ];
            }
        }
        public function docTaiKhoan(){
            $service = new Sc_TaiKhoanInternal();
            $taiKhoans = $service->doc();
            return [
                'success' => true,
                'data' => $taiKhoans
            ];
        }
    }
?>