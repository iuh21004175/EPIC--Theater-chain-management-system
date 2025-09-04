<?php
    namespace App\Controllers;
    use function App\Core\view;
    class Ctrl_ThongKe {
        // Controller code here
        function index() {
            return view('internal.thong-ke');
        }
    }
?>