<?php
    namespace App\Services;
    use App\Models\KeHoachSuatChieu;
    use App\Models\KeHoachChiTiet;
    use App\Models\Phim;
    use App\Models\SuatChieu;
    use Carbon\Carbon;

    class Sc_KeHoachSuatChieu {
        
        /**
         * Tạo khung giờ gợi ý cho kế hoạch suất chiếu
         * Lọc ra các suất chiếu đã thêm trong modal (tạm thời), các suất chiếu đã có trong DB (kế hoạch)
         * VÀ các suất chiếu đã được duyệt (trong bảng SuatChieu)
         */
        public function taoKhungGioGoiYChoKeHoach($ngay, $id_phong_chieu, $thoi_luong_phim, $cacSuatChieuTrongModal = [])
        {
            // --- BƯỚC 1: ĐỊNH NGHĨA CÁC QUY TẮC ---
            $gio_mo_cua = Carbon::parse($ngay)->setTime(8, 0, 0);
            $gio_dong_cua_cuoi = Carbon::parse($ngay)->setTime(22, 0, 0);
            $khoang_cach_giua_suat = 30; // 30 phút buffer
            $buoc_nhay_goi_y = 15; // Mỗi gợi ý cách nhau 15 phút

            // --- BƯỚC 2: TẠO "VÙNG CẤM" DỰA TRÊN CÁC SUẤT CHIẾU ĐÃ CÓ TRONG DB ---
            $vungCam = [];
            
            // 2.1. Lấy các suất chiếu đã có trong KẾ HOẠCH từ DB (bảng KeHoachChiTiet)
            $cacSuatChieuTrongKeHoach = KeHoachChiTiet::where('id_phongchieu', $id_phong_chieu)
                                                ->whereDate('batdau', $ngay)
                                                ->get();

            // Thêm vùng cấm từ kế hoạch
            foreach ($cacSuatChieuTrongKeHoach as $suatChieu) {
                $batDau = Carbon::parse($suatChieu->batdau);
                $ketThuc = Carbon::parse($suatChieu->ketthuc);
                
                $vungCam[] = [
                    'bat_dau' => $batDau->copy()->subMinutes($khoang_cach_giua_suat),
                    'ket_thuc' => $ketThuc->copy()->addMinutes($khoang_cach_giua_suat)
                ];
            }

            // 2.2. Lấy các suất chiếu ĐÃ DUYỆT từ DB (bảng SuatChieu)
            $cacSuatChieuDaDuyet = SuatChieu::where('id_phongchieu', $id_phong_chieu)
                                            ->whereDate('batdau', $ngay)
                                            ->whereIn('tinh_trang', [0, 1, 3]) // Chỉ lấy suất đã duyệt
                                            ->get();

            // Thêm vùng cấm từ suất chiếu đã duyệt
            foreach ($cacSuatChieuDaDuyet as $suatChieu) {
                $batDau = Carbon::parse($suatChieu->batdau);
                $ketThuc = Carbon::parse($suatChieu->ketthuc);
                
                $vungCam[] = [
                    'bat_dau' => $batDau->copy()->subMinutes($khoang_cach_giua_suat),
                    'ket_thuc' => $ketThuc->copy()->addMinutes($khoang_cach_giua_suat)
                ];
            }

            // --- BƯỚC 3: THÊM "VÙNG CẤM" TỪ CÁC SUẤT CHIẾU TROG MODAL (TẠM THỜI) ---
            foreach ($cacSuatChieuTrongModal as $suatChieu) {
                // Chỉ lọc nếu cùng phòng chiếu
                if ($suatChieu['id_phongchieu'] != $id_phong_chieu) {
                    continue;
                }

                $batDau = Carbon::parse($suatChieu['batdau']);
                $ketThuc = Carbon::parse($suatChieu['ketthuc']);
                
                $vungCam[] = [
                    'bat_dau' => $batDau->copy()->subMinutes($khoang_cach_giua_suat),
                    'ket_thuc' => $ketThuc->copy()->addMinutes($khoang_cach_giua_suat)
                ];
            }

            // --- BƯỚC 4: TẠO VÀ KIỂM TRA CÁC KHUNG GIỜ TIỀM NĂNG ---
            $khungGioGoiY = [];
            $gioKiemTra = $gio_mo_cua->copy();

            while ($gioKiemTra <= $gio_dong_cua_cuoi) {
                $gioKetThuc = $gioKiemTra->copy()->addMinutes($thoi_luong_phim);
                $hopLe = true;

                // Kiểm tra xem khung giờ này có trùng với vùng cấm nào không
                foreach ($vungCam as $vung) {
                    if ($gioKiemTra < $vung['ket_thuc'] && $gioKetThuc > $vung['bat_dau']) {
                        $hopLe = false;
                        break;
                    }
                }

                if ($hopLe) {
                    $khungGioGoiY[] = $gioKiemTra->format('H:i');
                }

                $gioKiemTra->addMinutes($buoc_nhay_goi_y);
            }

            return $khungGioGoiY;
        }

        /**
         * Kiểm tra suất chiếu trong kế hoạch có hợp lệ không
         * Kiểm tra với suất chiếu trong DB (kế hoạch), suất chiếu đã duyệt (SuatChieu) và các suất chiếu tạm trong modal
         */
        public function kiemTraSuatChieuKeHoach($batDau, $idPhongChieu, $thoiLuongPhim, $cacSuatChieuTrongModal = [])
        {
            // --- BƯỚC 1: ĐỊNH NGHĨA CÁC QUY TẮC ---
            $khoang_cach_giua_suat = 30; // 30 phút buffer

            $gioBatDauMoi = Carbon::parse($batDau);
            $gioKetThucMoi = $gioBatDauMoi->copy()->addMinutes($thoiLuongPhim);
            $ngayChieu = $gioBatDauMoi->copy()->startOfDay();

            // --- BƯỚC 2: KIỂM TRA GIỜ HOẠT ĐỘNG ---
            $gio_mo_cua = $ngayChieu->copy()->setTime(8, 0, 0);
            $gio_dong_cua_cuoi = $ngayChieu->copy()->setTime(22, 0, 0);

            if ($gioBatDauMoi < $gio_mo_cua || $gioBatDauMoi > $gio_dong_cua_cuoi) {
                return false;
            }

            // --- BƯỚC 3: KIỂM TRA XUNG ĐỘT VỚI CÁC SUẤT CHIẾU TRONG KẾ HOẠCH (KeHoachChiTiet) ---
            $cacSuatChieuTrongKeHoach = KeHoachChiTiet::where('id_phongchieu', $idPhongChieu)
                                                ->whereDate('batdau', $ngayChieu)
                                                ->get();

            foreach ($cacSuatChieuTrongKeHoach as $suatChieu) {
                $batDauHienTai = Carbon::parse($suatChieu->batdau);
                $ketThucHienTai = Carbon::parse($suatChieu->ketthuc);

                $vungCamBatDau = $batDauHienTai->copy()->subMinutes($khoang_cach_giua_suat);
                $vungCamKetThuc = $ketThucHienTai->copy()->addMinutes($khoang_cach_giua_suat);

                if ($gioBatDauMoi < $vungCamKetThuc && $gioKetThucMoi > $vungCamBatDau) {
                    return false;
                }
            }

            // --- BƯỚC 3.1: KIỂM TRA XUNG ĐỘT VỚI CÁC SUẤT CHIẾU ĐÃ DUYỆT (SuatChieu) ---
            $cacSuatChieuDaDuyet = SuatChieu::where('id_phongchieu', $idPhongChieu)
                                            ->whereDate('batdau', $ngayChieu)
                                            ->whereIn('tinh_trang', [0, 1, 3]) // Chỉ lấy suất đã duyệt
                                            ->get();

            foreach ($cacSuatChieuDaDuyet as $suatChieu) {
                $batDauHienTai = Carbon::parse($suatChieu->batdau);
                $ketThucHienTai = Carbon::parse($suatChieu->ketthuc);

                $vungCamBatDau = $batDauHienTai->copy()->subMinutes($khoang_cach_giua_suat);
                $vungCamKetThuc = $ketThucHienTai->copy()->addMinutes($khoang_cach_giua_suat);

                if ($gioBatDauMoi < $vungCamKetThuc && $gioKetThucMoi > $vungCamBatDau) {
                    return false;
                }
            }

            // --- BƯỚC 4: KIỂM TRA XUNG ĐỘT VỚI CÁC SUẤT CHIẾU TRONG MODAL (TẠM THỜI) ---
            foreach ($cacSuatChieuTrongModal as $suatChieu) {
                // Chỉ kiểm tra nếu cùng phòng chiếu
                if ($suatChieu['id_phongchieu'] != $idPhongChieu) {
                    continue;
                }

                $batDauHienTai = Carbon::parse($suatChieu['batdau']);
                $ketThucHienTai = Carbon::parse($suatChieu['ketthuc']);

                $vungCamBatDau = $batDauHienTai->copy()->subMinutes($khoang_cach_giua_suat);
                $vungCamKetThuc = $ketThucHienTai->copy()->addMinutes($khoang_cach_giua_suat);

                if ($gioBatDauMoi < $vungCamKetThuc && $gioKetThucMoi > $vungCamBatDau) {
                    return false;
                }
            }

            return true;
        }

        /**
         * Đọc chi tiết suất chiếu trong kế hoạch theo khoảng thời gian
         * Mỗi tuần chỉ có 1 kế hoạch, trả về danh sách chi tiết suất chiếu của tuần đó
         */
        public function docKeHoach($batDau, $ketThuc)
        {
            $idRapPhim = null;
            if(isset($_SESSION['UserInternal']['ID_RapPhim'])){
                $idRapPhim = $_SESSION['UserInternal']['ID_RapPhim'];
            }
            if(isset($_GET['id_rap'])){
                $idRapPhim = (int)($_GET['id_rap'] ?? 0);
            }
            
            // Tìm kế hoạch của tuần này (mỗi tuần chỉ có 1 kế hoạch)
            $keHoach = KeHoachSuatChieu::where('batdau', $batDau)
                ->where('ketthuc', $ketThuc)
                ->first();
            
            // Nếu không có kế hoạch, trả về array rỗng
            if (!$keHoach) {
                return [];
            }
            
            // Lấy chi tiết suất chiếu của kế hoạch này, chỉ lấy các suất của rạp hiện tại
            $chiTietSuatChieu = KeHoachChiTiet::with(['phim', 'phongChieu'])
                ->where('id_kehoach', $keHoach->id)
                ->whereHas('phongChieu', function($query) use ($idRapPhim) {
                    $query->where('id_rapphim', $idRapPhim);
                })
                ->orderBy('batdau', 'asc')
                ->get();
            
            return $chiTietSuatChieu;
        }

        /**
         * Lưu suất chiếu vào kế hoạch
         * Mỗi tuần chỉ có 1 kế hoạch, tìm hoặc tạo kế hoạch cho tuần này
         * QUAN TRỌNG: Xóa các suất chiếu cũ của NGÀY được chọn trước khi lưu (tránh trùng lặp)
         */
        public function luuSuatChieuVaoKeHoach($batDau, $ketThuc)
        {
            $data = json_decode(file_get_contents('php://input'), true);
            $suatChieuList = $data['suat_chieu'] ?? [];
            $ngayChieu = $data['ngay_chieu'] ?? null; // Ngày đã chọn trong modal
            
            if (empty($suatChieuList)) {
                throw new \Exception('Không có suất chiếu nào để lưu');
            }

            if (!$ngayChieu) {
                throw new \Exception('Thiếu thông tin ngày chiếu');
            }

            // Tìm hoặc tạo kế hoạch cho tuần này (mỗi tuần 1 kế hoạch duy nhất)
            $keHoach = KeHoachSuatChieu::where('batdau', $batDau)
                ->where('ketthuc', $ketThuc)
                ->first();
            
            if (!$keHoach) {
                $keHoach = KeHoachSuatChieu::create([
                    'batdau' => $batDau,
                    'ketthuc' => $ketThuc
                ]);
            }

            // ✅ XÓA TOÀN BỘ KẾ HOẠCH CHI TIẾT CỦA TUẦN (không chỉ ngày đã chọn)
            // Lý do: Frontend gửi lên TẤT CẢ suất chiếu của tuần (bao gồm cả cũ đã chỉnh sửa)
            $idRapPhim = $_SESSION['UserInternal']['ID_RapPhim'];
            
            KeHoachChiTiet::where('id_kehoach', $keHoach->id)
                ->whereHas('phongChieu', function($query) use ($idRapPhim) {
                    $query->where('id_rapphim', $idRapPhim);
                })
                ->where('tinh_trang', '!=', 1) // ⚠️ KHÔNG xóa suất đã duyệt
                ->delete();

            // Lưu TẤT CẢ suất chiếu (bao gồm cả cũ đã chỉnh sửa và mới)
            foreach ($suatChieuList as $suatChieu) {
                // Nếu suất chiếu có ID và đã duyệt, giữ nguyên trạng thái
                $tinhTrang = 0; // Mặc định: Chờ duyệt
                if (isset($suatChieu['id']) && $suatChieu['id']) {
                    $existingPlan = KeHoachChiTiet::find($suatChieu['id']);
                    if ($existingPlan && $existingPlan->tinh_trang == 1) {
                        $tinhTrang = 1; // Giữ trạng thái đã duyệt
                    }
                }
                
                KeHoachChiTiet::create([
                    'id_kehoach' => $keHoach->id,
                    'id_phim' => $suatChieu['id_phim'],
                    'id_phongchieu' => $suatChieu['id_phongchieu'],
                    'batdau' => $suatChieu['batdau'],
                    'ketthuc' => $suatChieu['ketthuc'],
                    'tinh_trang' => $tinhTrang
                ]);
            }

            return $keHoach;
        }

        /**
         * Xóa suất chiếu khỏi kế hoạch
         * KHÔNG cho phép xóa suất chiếu đã duyệt (tinh_trang = 1)
         */
        public function xoaSuatChieuKhoiKeHoach($idKeHoachChiTiet)
        {
            $keHoachChiTiet = KeHoachChiTiet::find($idKeHoachChiTiet);
            
            if (!$keHoachChiTiet) {
                throw new \Exception('Không tìm thấy suất chiếu trong kế hoạch');
            }

            // Không cho xóa suất chiếu đã duyệt
            if ($keHoachChiTiet->tinh_trang == 1) {
                throw new \Exception('Không thể xóa suất chiếu đã được duyệt');
            }

            $keHoachChiTiet->delete();
        }

        /**
         * Duyệt suất chiếu trong kế hoạch
         * - Cập nhật tinh_trang = 1 trong KeHoachChiTiet
         * - Tạo suất chiếu thực tế trong bảng SuatChieu
         * - Ghi log với hanh_dong = 5 (Duyệt từ kế hoạch)
         */
        public function duyetKeHoach($idKeHoachChiTiet)
        {
            $keHoachChiTiet = KeHoachChiTiet::with(['phim', 'phongChieu'])->find($idKeHoachChiTiet);
            
            if (!$keHoachChiTiet) {
                throw new \Exception('Không tìm thấy suất chiếu trong kế hoạch');
            }

            // Kiểm tra trạng thái
            if ($keHoachChiTiet->tinh_trang == 1) {
                throw new \Exception('Suất chiếu này đã được duyệt trước đó');
            }

            // Bắt đầu transaction
            \Illuminate\Support\Facades\DB::beginTransaction();
            
            try {
                // 1. Cập nhật trạng thái kế hoạch chi tiết
                $keHoachChiTiet->update([
                    'tinh_trang' => 1
                ]);

                // 2. Tạo suất chiếu thực tế
                $suatChieu = \App\Models\SuatChieu::create([
                    'id_phim' => $keHoachChiTiet->id_phim,
                    'id_phongchieu' => $keHoachChiTiet->id_phongchieu,
                    'batdau' => $keHoachChiTiet->batdau,
                    'ketthuc' => $keHoachChiTiet->ketthuc,
                    'tinh_trang' => 1 // Đã duyệt
                ]);

                // 3. Ghi log với hanh_dong = 5 (Duyệt từ kế hoạch)
                \App\Models\LogSuatChieu::create([
                    'id_suatchieu' => $suatChieu->id,
                    'hanh_dong' => 5, // Duyệt từ kế hoạch
                    'batdau' => $keHoachChiTiet->batdau,
                    'id_phim' => $keHoachChiTiet->id_phim,
                    'ten_phim' => $keHoachChiTiet->phim->ten ?? '',
                    'da_xem' => 0,
                    'rap_da_xem' => 0
                ]);

                \Illuminate\Support\Facades\DB::commit();
                
                return [
                    'ke_hoach_chi_tiet' => $keHoachChiTiet,
                    'suat_chieu' => $suatChieu
                ];
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\DB::rollBack();
                throw $e;
            }
        }

        /**
         * Từ chối suất chiếu trong kế hoạch
         * - Cập nhật tinh_trang = 2 trong KeHoachChiTiet
         */
        public function tuChoiKeHoach($idKeHoachChiTiet)
        {
            $keHoachChiTiet = KeHoachChiTiet::find($idKeHoachChiTiet);
            
            if (!$keHoachChiTiet) {
                throw new \Exception('Không tìm thấy suất chiếu trong kế hoạch');
            }

            // Kiểm tra trạng thái
            if ($keHoachChiTiet->tinh_trang == 1) {
                throw new \Exception('Không thể từ chối suất chiếu đã được duyệt');
            }

            // Cập nhật trạng thái
            $keHoachChiTiet->update([
                'tinh_trang' => 2
            ]);

            return $keHoachChiTiet;
        }

        /**
         * Duyệt toàn bộ tuần
         * - Duyệt tất cả suất chiếu chờ duyệt (tinh_trang = 0) trong khoảng thời gian
         */
        public function duyetTuan($batDau, $ketThuc, $idRap = null)
        {
            // Lấy tất cả suất chiếu chờ duyệt trong tuần
            $query = KeHoachChiTiet::with(['phim', 'phongChieu'])
                ->whereBetween('batdau', [$batDau, $ketThuc])
                ->where('tinh_trang', 0);

            // Lọc theo rạp nếu có
            if ($idRap) {
                $query->whereHas('phongChieu', function($q) use ($idRap) {
                    $q->where('id_rapphim', $idRap);
                });
            }

            $cacSuatChieuChoDuyet = $query->get();

            if ($cacSuatChieuChoDuyet->isEmpty()) {
                return [
                    'message' => 'Không có suất chiếu nào chờ duyệt trong tuần này',
                    'count' => 0
                ];
            }

            \Illuminate\Support\Facades\DB::beginTransaction();
            
            try {
                $danhSachSuatChieuMoi = [];
                
                foreach ($cacSuatChieuChoDuyet as $keHoachChiTiet) {
                    // Cập nhật trạng thái kế hoạch
                    $keHoachChiTiet->update([
                        'tinh_trang' => 1
                    ]);

                    // Tạo suất chiếu thực tế
                    $suatChieu = \App\Models\SuatChieu::create([
                        'id_phim' => $keHoachChiTiet->id_phim,
                        'id_phongchieu' => $keHoachChiTiet->id_phongchieu,
                        'batdau' => $keHoachChiTiet->batdau,
                        'ketthuc' => $keHoachChiTiet->ketthuc,
                        'tinh_trang' => 1
                    ]);

                    // Ghi log
                    \App\Models\LogSuatChieu::create([
                        'id_suatchieu' => $suatChieu->id,
                        'hanh_dong' => 5,
                        'batdau' => $keHoachChiTiet->batdau,
                        'id_phim' => $keHoachChiTiet->id_phim,
                        'ten_phim' => $keHoachChiTiet->phim->ten ?? '',
                        'da_xem' => 0,
                        'rap_da_xem' => 0
                    ]);

                    $danhSachSuatChieuMoi[] = $suatChieu;
                }

                \Illuminate\Support\Facades\DB::commit();
                
                return [
                    'message' => 'Duyệt toàn bộ tuần thành công',
                    'count' => count($danhSachSuatChieuMoi),
                    'suat_chieu' => $danhSachSuatChieuMoi
                ];
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\DB::rollBack();
                throw $e;
            }
        }
    }
?>
