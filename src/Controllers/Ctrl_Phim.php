<?php
    namespace App\Controllers;
    use function App\Core\view;

    class Ctrl_Phim{
        public function index(){
            echo view('internal.phim');
        }
    }
?>