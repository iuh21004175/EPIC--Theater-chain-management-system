<?php
namespace App\Services;

use App\Models\Ve;

class Sc_Ve {
    public function them() {
        $user = $_SESSION['user'];
        $data = json_decode(file_get_contents('php://input'), true);

        $donhang_id = $data['donhang_id'] ?? null;
        $suat_chieu_id = $data['suat_chieu_id'] ?? null;
        $khach_hang_id = $user['id'];
        $trang_thai = $data['trang_thai'] ?? 'giu_cho';
        $het_han_giu = $data['het_han_giu'] ?? null;

        $veCreated = [];

        // Nếu gửi mảng ghế
        if (!empty($data['seats']) && is_array($data['seats'])) {
            foreach ($data['seats'] as $seat) {
                $ghe_id = $seat['ghe_id'] ?? null;
                $ma_ve = $seat['ma_ve'] ?? null;

                $ve = Ve::create([
                    'donhang_id' => $donhang_id,
                    'suat_chieu_id' => $suat_chieu_id,
                    'ghe_id' => $ghe_id,
                    'khach_hang_id' => $khach_hang_id,
                    'trang_thai' => $trang_thai,
                    'het_han_giu' => $het_han_giu,
                    'ngay_tao' => date('Y-m-d H:i:s')
                ]);

                if ($ve) {
                    $veCreated[] = $ve;
                }
            }
        }

        return !empty($veCreated) ? $veCreated : false;
    }
}
