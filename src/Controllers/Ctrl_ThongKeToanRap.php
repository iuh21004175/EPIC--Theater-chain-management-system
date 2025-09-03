<?php
    namespace App\Controllers;
    use function App\Core\view;
    class Ctrl_ThongKeToanRap {
        public function index() {
            // Logic thống kê doanh thu
            return view("internal.thong-ke-toan-rap");
        }
    }
?>