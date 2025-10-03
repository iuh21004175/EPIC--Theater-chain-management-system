<?php
namespace App\Services;

use App\Models\DonHang;

class Sc_DonHang {
    public function them() {
        $user = $_SESSION['user'] ?? null;
        $user_id = $user['id'] ?? null;
        $input = json_decode(file_get_contents('php://input'), true);
        $tong_tien = $input['tong_tien'] ?? 0;
        $suat_chieu_id = $input['suat_chieu_id'] ?? null;
        $thequatang_id = $input['thequatang_id'] ?? null;
        $phim_id = $input['phim_id'] ?? null;
        $rap_id = $input['rap_id'] ?? null;
        $the_qua_tang_su_dung = $input['the_qua_tang_su_dung'] ?? null;
        $phuong_thuc_thanh_toan = $input['phuong_thuc_thanh_toan'] ?? 1;
        $trang_thai = $input['trang_thai'] ?? 1;
        $ma_ve = $input['ma_ve'] ?? null;
        $phuong_thuc_mua = $input['phuong_thuc_mua'] ?? 0;
        $qr_code = 'https://quickchart.io/qr?text=' . urlencode($ma_ve) . '&size=300';
        $donhang = DonHang::create([
            'user_id' => $user_id,
            'suat_chieu_id' => $suat_chieu_id,
            'thequatang_id' => $thequatang_id,
            'the_qua_tang_su_dung' => $the_qua_tang_su_dung,
            'ma_ve' => $ma_ve,
            'qr_code' => $qr_code,
            'tong_tien' => $tong_tien,
            'phim_id' => $phim_id,
            'rap_id' => $rap_id,
            'phuong_thuc_thanh_toan' => $phuong_thuc_thanh_toan,
            'trang_thai' => $trang_thai,
            'phuong_thuc_mua' => $phuong_thuc_mua,
            'ngay_dat' => date('Y-m-d H:i:s')
        ]);

        if ($donhang) {
            return $donhang;
        }
        return false;
    }

    public function themDonHang() {
        $idNhanVien = $_SESSION['UserInternal']['ID'] ?? null;
        $input = json_decode(file_get_contents('php://input'), true);
        $tong_tien = $input['tong_tien'] ?? 0;
        $suat_chieu_id = $input['suat_chieu_id'] ?? null;
        $thequatang_id = $input['thequatang_id'] ?? null;
        $phim_id = $input['phim_id'] ?? null;
        $the_qua_tang_su_dung = $input['the_qua_tang_su_dung'] ?? null;
        $phuong_thuc_thanh_toan = $input['phuong_thuc_thanh_toan'] ?? 1;
        $trang_thai = $input['trang_thai'] ?? 1;
        $ma_ve = $input['ma_ve'] ?? null;
        $rap_id = $input['rap_id'] ?? null;
        $phuong_thuc_mua = $input['phuong_thuc_mua'] ?? 0;
        $qr_code = 'https://quickchart.io/qr?text=' . urlencode($ma_ve) . '&size=300';
        $donhang = DonHang::create([
            'suat_chieu_id' => $suat_chieu_id,
            'id_nhanvien' => $idNhanVien,
            'thequatang_id' => $thequatang_id,
            'the_qua_tang_su_dung' => $the_qua_tang_su_dung,
            'ma_ve' => $ma_ve,
            'qr_code' => $qr_code,
            'tong_tien' => $tong_tien,
            'phim_id' => $phim_id,
            'rap_id' => $rap_id,
            'phuong_thuc_thanh_toan' => $phuong_thuc_thanh_toan,
            'trang_thai' => $trang_thai,
            'phuong_thuc_mua' => $phuong_thuc_mua,
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
                    ->where('phuong_thuc_mua', 0)
                    ->with([
                        'suatChieu.phongChieu.rapChieuPhim',
                        'suatChieu.phim',
                        'theQuaTang'
                    ])
                    ->orderBy('id', 'desc') 
                    ->get();

        return $donhang;
    }
    public function docDonHangTheoRap($idRap)
    {
        $donhang = DonHang::with([
                'user',
                'suatChieu.phongChieu.rapChieuPhim',
                'suatChieu.phim',
                'theQuaTang',
                'chiTietDonHang',
                've'
            ])
            ->whereHas('suatChieu.phongChieu.rapChieuPhim', function ($query) use ($idRap) {
                $query->where('id', $idRap);
            })
            ->orderBy('id', 'desc')
            ->get();

        return $donhang;
    }

    public function docDonHang($idKhachHang) {
        $donhang = DonHang::where('user_id', $idKhachHang)
                    ->with([
                        'suatChieu.phongChieu.rapChieuPhim',
                        'suatChieu.phim',
                        'theQuaTang'
                    ])
                    ->orderBy('id', 'desc')
                    ->get();

        return $donhang;
    }

    public function docOnline() {
        $user = $_SESSION['user'];
        $idKhachHang = $user['id'];

        $donhang = DonHang::where('user_id', $idKhachHang)
                    ->whereIn('trang_thai', [0, 2])
                    ->where('phuong_thuc_mua', 1)
                    ->with('phim')
                    ->orderBy('id', 'desc') 
                    ->get();

        return $donhang;
    }

    public function capNhat($id){
        $donHang = DonHang::find($id);
        if($donHang){
            $donHang->trang_thai = 0;
            return $donHang->save();
        }
        return false;
    }
}