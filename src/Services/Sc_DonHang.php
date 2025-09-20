<?php
namespace App\Services;

use App\Models\DonHang;

class Sc_DonHang {
    public function them() {
        $user = $_SESSION['user'];
        $user_id = $user['id'];
        $input = json_decode(file_get_contents('php://input'), true);
        $tong_tien = $input['tong_tien'] ?? 0;
        $suat_chieu_id = $input['suat_chieu_id'] ?? null;
        $phuong_thuc_thanh_toan = $input['phuong_thuc_thanh_toan'] ?? 1;
        $trang_thai = $input['trang_thai'] ?? 1;
        $ma_ve = $input['ma_ve'] ?? null;
        $qr_code = 'https://quickchart.io/qr?text=' . urlencode($ma_ve) . '&size=300';
        $donhang = DonHang::create([
            'user_id' => $user_id,
            'suat_chieu_id' => $suat_chieu_id,
            'ma_ve' => $ma_ve,
            'qr_code' => $qr_code,
            'tong_tien' => $tong_tien,
            'phuong_thuc_thanh_toan' => $phuong_thuc_thanh_toan,
            'trang_thai' => $trang_thai,
            'ngay_dat' => date('Y-m-d H:i:s')
        ]);

        if ($donhang) {
            return $donhang;
        }
        return false;
    }

    public function doc() {
        $user = $_SESSION['user'];
        $idKhachHang = $user['id'];

        $donhang = DonHang::where('user_id', $idKhachHang)
                    ->whereIn('trang_thai', [0, 2]) 
                    ->with([
                        'suatChieu.phongChieu.rapChieuPhim',
                        'suatChieu.phim'
                    ])
                    ->get();

        return $donhang;
    }
    
}