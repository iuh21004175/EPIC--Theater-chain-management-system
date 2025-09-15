<?php
namespace App\Controllers;

use App\Services\Sc_Ve;

class Ctrl_Ve {
    public function themVe() {
        header('Content-Type: application/json'); 
        $service = new Sc_Ve();
        try {
            $ve = $service->them();
            if ($ve) {
                echo json_encode([
                    'success' => true, 
                    'message' => 'Thêm vé thành công',
                    'data' => $ve
                ]);
                exit;
            }
            echo json_encode([
                'success' => false, 
                'message' => 'Thêm vé thất bại'
            ]);
            exit;
        } catch (\Exception $e) {
            echo json_encode([
                'success' => false, 
                'message' => 'Lỗi: ' . $e->getMessage()
            ]);
            exit;
        }
    }
}
