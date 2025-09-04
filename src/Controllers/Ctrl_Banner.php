<?php
    namespace App\Controllers;
    use function App\Core\view;
    class Ctrl_Banner {
        // Properties and methods for the Ctrl_Banner class
        public function index() {
            // Code for the index method
           return view('internal.banner');
        }
    }
?>