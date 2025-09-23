<?php
namespace App\Controllers;
use function App\Core\view;
use App\Services\Sc_DanhGia;

class Ctrl_DanhGia {
    public function docDanhGia($args)
    {
        $idPhim = is_array($args) ? ($args['id'] ?? null) : $args;

        $service = new Sc_DanhGia();
        try {
            $result = $service->docTheoPhim((int)$idPhim); 
            return ['success' => true, 'data' => $result];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()];
        }
    }

    public function themDanhGia() {
        header('Content-Type: application/json'); 
        $service = new Sc_DanhGia();
        try {
            $danhGia = $service->them();
            if ($danhGia) {
                echo json_encode([
                    'success' => true, 
                    'message' => 'Thêm đánh giá thành công',
                    'data' => $danhGia
                ]);
                exit;
            }
            echo json_encode([
                'success' => false, 
                'message' => 'Thêm đánh giá thất bại'
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
?>