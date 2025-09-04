<?php
    namespace App\Controllers;
    use function App\Core\view;
    class Ctrl_PhongChieu {
        // Các phương thức và thuộc tính của controller sẽ được định nghĩa ở đây
        public function index() {
            // Mã cho phương thức index
           return view('internal.phong-chieu');
        }
    }
?>