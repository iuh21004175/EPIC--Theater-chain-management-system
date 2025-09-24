<?php
namespace App\Services;

use App\Models\DanhGia;
use Carbon\Carbon;
class Sc_DanhGia {
    public function docTheoPhim($phimId)
    {
        return DanhGia::with('khachHang')
            ->where('phim_id', $phimId)
            ->get();
    }

    public function them(){
        $user = $_SESSION['user'];
        $user_id = $user['id'];

        $data = json_decode(file_get_contents('php://input'), true);
        $phim_id = $data['phim_id'] ?? null;
        $so_sao = $data['so_sao'] ?? null;
        $cmt= $data['cmt'] ?? null;

        $danhGia = DanhGia::create([
            'khachhang_id' => $user_id,
            'phim_id' => $phim_id,
            'so_sao' => $so_sao,
            'cmt' => $cmt
        ]);

        if ($danhGia) {
            return $danhGia;
        }
        return false;
    }
}
?>