<?php
    namespace App\Controllers;
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
    }
?>