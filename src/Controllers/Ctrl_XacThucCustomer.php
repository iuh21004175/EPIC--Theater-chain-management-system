<?php
    namespace App\Controllers;
    use function App\Core\view;

    class Ctrl_XacThucCustomer
    {
        public function index()
        {
            return view('customer.home');
        }
    }
?>