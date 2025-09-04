<?php
    namespace App\Controllers;
    use function App\Core\view;
    class Ctrl_SuatChieu{
        public function index(){
            return view('internal.suat-chieu');
        }
    }
?>