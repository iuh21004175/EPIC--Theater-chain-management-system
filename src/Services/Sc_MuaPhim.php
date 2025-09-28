<?php
namespace App\Services;
use App\Models\MuaPhim;
class Sc_MuaPhim {
    public function daMua($khachHangId, $phimId)
    {
        $mua = MuaPhim::where('khach_hang_id', $khachHangId)
                    ->where('phim_id', $phimId)
                    ->first();

        return $mua ? $mua->trang_thai : 0; // lấy trạng thái của phim đó theo KH (nếu là 2 thì xem dc)
    }
    public function them() {
        $user = $_SESSION['user'];
        $data = json_decode(file_get_contents('php://input'), true);

        $don_hang_id = $data['don_hang_id'] ?? null;
        $phim_id = $data['phim_id'] ?? null;
        $khach_hang_id = $user['id'];
        $trang_thai = $data['trang_thai'] ?? 1;
        $so_tien = $data['so_tien'] ?? 0;
        $phuong_thuc = $data['phuong_thuc'] ?? 1;

        $muaPhim = MuaPhim::create([
            'khach_hang_id' => $khach_hang_id,
            'phim_id' => $phim_id,
            'so_tien' => $so_tien,
            'trang_thai' => $trang_thai,
            'phim_id' => $phim_id,
            'phuong_thuc' => $phuong_thuc,
            'don_hang_id' => $don_hang_id
        ]);

        if ($muaPhim) {
            return $muaPhim;
        }
        return false;
    }
}
       