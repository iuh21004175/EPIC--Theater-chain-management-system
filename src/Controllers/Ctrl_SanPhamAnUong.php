<?php
    namespace App\Controllers;
    use function App\Core\view;

    class Ctrl_SanPhamAnUong{
        public function index(){
            return view('internal.san-pham-an-uong');
        }
    }
?>