<?php
    namespace App\Services;
    use App\Models\SuatChieu;
    use App\Models\Phim;
    use Carbon\Carbon;

    class Sc_SuatChieu {
        public function them(){
            $idPhim = $_POST['id_phim'] ?? '';
            $idPhongChieu = $_POST['id_phongchieu'] ?? '';
            $batDau = $_POST['batdau'] ?? '';
            $ketThuc = $_POST['ketthuc'] ?? '';

            $phim = Phim::find($idPhim);
            if(!$phim){
                throw new \Exception("Phim không tồn tại");
            }

            $suatChieu = SuatChieu::create([
                'id_phim' => $idPhim,
                'id_phongchieu' => $idPhongChieu,
                'batdau' => $batDau,
                'ketthuc' => $ketThuc,
            ]);
            if($suatChieu){
                return true;
            }
            return false;
        }
        public function taoKhungGioGoiY($ngay, $id_phong_chieu, $thoi_luong_phim)
        {
            // --- BƯỚC 1: ĐỊNH NGHĨA CÁC QUY TẮC ---
            $gio_mo_cua = Carbon::parse($ngay)->setTime(8, 0, 0);
            $gio_dong_cua_cuoi = Carbon::parse($ngay)->setTime(22, 0, 0); // Suất chiếu cuối cùng không được bắt đầu sau giờ này
            $khoang_cach_giua_suat = 30; // 30 phút buffer trước và sau mỗi suất chiếu
            $buoc_nhay_goi_y = 15; // Mỗi gợi ý cách nhau 15 phút

            // --- BƯỚC 2: TẠO "VÙNG CẤM" DỰA TRÊN LỊCH CHIẾU HIỆN TẠI ---
            $vungCam = [];
            $cacSuatChieuDaCo = SuatChieu::where('id_phongchieu', $id_phong_chieu)
                                        ->whereDate('batdau', $ngay)
                                        ->get();

            foreach ($cacSuatChieuDaCo as $suatChieu) {
                $batDauThucTe = Carbon::parse($suatChieu->batdau);
                $ketThucThucTe = Carbon::parse($suatChieu->ketthuc);

                $vungCam[] = [
                    'batdau' => $batDauThucTe->copy()->subMinutes($khoang_cach_giua_suat),
                    'ketthuc' => $ketThucThucTe->copy()->addMinutes($khoang_cach_giua_suat),
                ];
            }

            // --- BƯỚC 3: TẠO VÀ KIỂM TRA CÁC KHUNG GIỜ TIỀM NĂNG ---
            $khungGioGoiY = [];
            $gioKiemTra = $gio_mo_cua->copy();

            while ($gioKiemTra <= $gio_dong_cua_cuoi) {
                $gioKetThucTiemNang = $gioKiemTra->copy()->addMinutes($thoi_luong_phim);
                $isAvailable = true;

                // Kiểm tra xem khung giờ tiềm năng [bắt đầu, kết thúc] có bị chồng lấn với "vùng cấm" nào không
                foreach ($vungCam as $cam) {
                    if ($gioKiemTra < $cam['ketthuc'] && $gioKetThucTiemNang > $cam['batdau']) {
                        $isAvailable = false;
                        break; // Nếu đã trùng, không cần kiểm tra thêm
                    }
                }
                
                if ($isAvailable) {
                    $khungGioGoiY[] = $gioKiemTra->format('H:i');
                }

                // Tăng giờ kiểm tra lên cho lần lặp tiếp theo
                $gioKiemTra->addMinutes($buoc_nhay_goi_y);
            }

            return $khungGioGoiY;
        }
        public function kiemTraSuatChieu($batDau, $idPhongChieu, $thoiLuongPhim)
        {
            // --- BƯỚC 1: ĐỊNH NGHĨA LẠI CÁC QUY TẮC ---
            $khoang_cach_giua_suat = 30; // 30 phút buffer

            // Chuyển đổi đầu vào thành đối tượng Carbon để xử lý
            $gioBatDauMoi = Carbon::parse($batDau);
            $gioKetThucMoi = $gioBatDauMoi->copy()->addMinutes($thoiLuongPhim);
            $ngayChieu = $gioBatDauMoi->copy()->startOfDay();

            // --- BƯỚC 2: KIỂM TRA GIỜ HOẠT ĐỘNG ---
            $gio_mo_cua = $ngayChieu->copy()->setTime(8, 0, 0);
            $gio_dong_cua_cuoi = $ngayChieu->copy()->setTime(22, 0, 0);

            // Suất chiếu phải bắt đầu trong khung giờ cho phép
            if ($gioBatDauMoi < $gio_mo_cua || $gioBatDauMoi > $gio_dong_cua_cuoi) {
                throw new \Exception("Giờ bắt đầu suất chiếu phải trong khoảng từ 08:00 đến 22:00");
            }

            // --- BƯỚC 3: KIỂM TRA XUNG ĐỘT VỚI CÁC SUẤT CHIẾU KHÁC ---
            $cacSuatChieuDaCo = SuatChieu::where('id_phongchieu', $idPhongChieu)
                                        ->whereDate('batdau', $ngayChieu->toDateString())
                                        ->get();

            foreach ($cacSuatChieuDaCo as $suatChieu) {
                // Tạo "vùng cấm" cho mỗi suất chiếu đã có
                $vungCamBatDau = Carbon::parse($suatChieu->batdau)->subMinutes($khoang_cach_giua_suat);
                $vungCamKetThuc = Carbon::parse($suatChieu->ketthuc)->addMinutes($khoang_cach_giua_suat);

                // Kiểm tra sự chồng lấn
                // Nếu giờ bắt đầu của suất mới NẰM TRƯỚC giờ kết thúc của vùng cấm
                // VÀ giờ kết thúc của suất mới NẰM SAU giờ bắt đầu của vùng cấm
                // -> Xung đột!
                if ($gioBatDauMoi < $vungCamKetThuc && $gioKetThucMoi > $vungCamBatDau) {
                    throw new \Exception("Suất chiếu xung đột với lịch chiếu hiện tại");
                }
            }

            // Nếu vượt qua tất cả các kiểm tra, suất chiếu là hợp lệ
            return true;

        }
        public function doc($ngay){
            $idRapPhim = $_SESSION['UserInternal']['ID_RapPhim'];
            $suatChieu = SuatChieu::with('phim', 'phongChieu')
                ->whereHas('phongChieu', function($query) use ($idRapPhim) {
                    $query->where('id_rapphim', $idRapPhim);
                })
                ->whereDate('batdau', $ngay)
                ->orderBy('batdau', 'desc')->get();
            return $suatChieu;
        }

       public function docSuatChieuKH($ngay = null, $idPhim)
        {
            $query = SuatChieu::with(['phim', 'phongChieu.rapChieuPhim'])
                ->where('id_phim', $idPhim);

            if ($ngay) {
                try {
                    // Chuẩn hóa ngày về dạng Y-m-d để whereDate khớp
                    $ngayFormat = Carbon::parse($ngay)->toDateString();
                    $query->whereDate('batdau', $ngayFormat);
                } catch (\Exception $e) {
                    // Nếu ngày sai format thì mặc định lấy từ hôm nay trở đi
                    $query->whereDate('batdau', '>=', Carbon::today()->toDateString());
                }
            } else {
                // Nếu không có ngày → mặc định lấy từ hôm nay trở đi
                $query->whereDate('batdau', '>=', Carbon::today()->toDateString());
            }

            $suatChieu = $query->orderBy('batdau', 'asc')->get();

            return $suatChieu;
        }
    }
?>