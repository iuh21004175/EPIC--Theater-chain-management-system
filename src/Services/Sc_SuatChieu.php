<?php
    namespace App\Services;
    use App\Models\SuatChieu;
    use App\Models\LogSuatChieu;
    use App\Models\Phim;
    use Carbon\Carbon;

    class Sc_SuatChieu {
        public function them(){
            $idPhim = $_POST['id_phim'] ?? '';
            $listPhongChieu = $_POST['list_phongChieu'] ?? '';
            if (!is_array($listPhongChieu)) {
                $listPhongChieu = explode(',', $listPhongChieu);
            }
            $batDau = $_POST['batdau'] ?? '';
            $ketThuc = $_POST['ketthuc'] ?? '';

            $phim = Phim::find($idPhim);
            if(!$phim){
                throw new \Exception("Phim không tồn tại");
            }

            foreach ($listPhongChieu as $idPhongChieu) {
                $suatChieu = SuatChieu::create([
                    'id_phim' => $idPhim,
                    'id_phongchieu' => $idPhongChieu,
                    'batdau' => $batDau,
                    'ketthuc' => $ketThuc,
                    'tinh_trang' => 0 // Mặc định là "Chờ duyệt"
                ]);
                $suatChieu->logSuatChieu()->create([
                    'hanh_dong' => '0',
                    'id_phim' => $suatChieu->phim->id ?? null,
                    'ten_phim' => $suatChieu->phim->ten_phim ?? null,
                    'batdau' => $suatChieu->batdau,
                    'da_xem' => 0, // Đánh dấu quản lý chuỗi rạp chưa xem
                    'rap_da_xem' => 1 // Đánh dấu rạp đã xem

                ]);
            }
        }
        public function sua($id){
            $idRapPhim = $_SESSION['UserInternal']['ID_RapPhim'];
            $suatChieu = SuatChieu::with('phim', 'phongChieu')
                ->whereHas('phongChieu', function($query) use ($idRapPhim) {
                    $query->where('id_rapphim', $idRapPhim);
                })
                ->where('id', $id)
                ->first();
            if (!$suatChieu) {
                throw new \Exception("Suất chiếu không tồn tại");
                exit();
            }
            $data = file_get_contents('php://input');
            $json = json_decode($data, true);
            if (isset($json['id_phim'])) {
                $phim = Phim::find($json['id_phim']);
                if (!$phim) {
                    throw new \Exception("Phim không tồn tại");
                    exit();
                }
                $suatChieu->id_phim = $json['id_phim'];
                $suatChieu->id_phongchieu = $json['id_phongChieu'] ;
                $suatChieu->batdau = $json['batdau'];
                $suatChieu->ketthuc = $json['ketthuc'];
                if($suatChieu->tinh_trang == 0){ //  thì nguyên trạng thí chờ duyệt
                    $suatChieu->tinh_trang = 0; // Đặt lại trạng thái về chờ duyệt nếu đã duyệt hoặc từ chối trước đó
                }
                if($suatChieu->tinh_trang == 2){// Nếu từ chối
                    $suatChieu->tinh_trang = 3; // Chờ duyệt lại
                    $suatChieu->ly_do = null; // Xóa lý do từ chối
                    $suatChieu->da_xem = 0; // Đánh dấu quản lý chuỗi rạp chưa xem lại
                }
                $suatChieu->logSuatChieu()->create([
                    'hanh_dong' => '1', // Sửa suất chiếu
                    'id_phim' => $suatChieu->phim->id ?? null,
                    'ten_phim' => $suatChieu->phim->ten_phim ?? null,
                    'batdau' => $suatChieu->batdau,
                    'da_xem' => 0, // Đánh dấu quản lý chuỗi rạp chưa xem
                    'rap_da_xem' => 1, // Đánh dấu rạp đã xem
                ]);
                $suatChieu->save();
            }
        }
        public function xoa($id){
            $suatChieu = SuatChieu::with('phim')->find($id);

            if (!$suatChieu) {
                throw new \Exception("Suất chiếu không tồn tại");
                exit();
            }

            // Lưu log trước khi xóa
            $suatChieu->logSuatChieu()->create([
                'hanh_dong' => 2, // 2 - Xóa
                'id_phim' => $suatChieu->phim->id ?? null,
                'ten_phim' => $suatChieu->phim->ten_phim ?? null,
                'batdau' => $suatChieu->batdau,
                'da_xem' => 0, // Đánh dấu quản lý chuỗi rạp chưa xem
                'rap_da_xem' => 1 // Đánh dấu rạp đã xem
                // Thêm các trường khác nếu cần
            ]);

            $suatChieu->delete();
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
        public function duyetSuatChieu($id){
            $suatChieu = SuatChieu::find($id);
            if (!$suatChieu) {
                throw new \Exception("Suất chiếu không tồn tại");
                exit();
            }
            $suatChieu->tinh_trang = 1; // Đã duyệt
            $suatChieu->logSuatChieu()->create([
                'hanh_dong' => '3', // Duyệt suất chiếu
                'id_phim' => $suatChieu->phim->id ?? null,
                'ten_phim' => $suatChieu->phim->ten_phim ?? null,
                'batdau' => $suatChieu->batdau,
                'da_xem' => 1, // Đánh dấu quản lý chuỗi rạp đã xem
                'rap_da_xem' => 0 // Đánh dấu rạp chưa xem
            ]);
            $suatChieu->save();
        }
        public function tuChoiSuatChieu($id){
            $suatChieu = SuatChieu::find($id);
            $data = json_decode(file_get_contents('php://input'), true);
            $lyDoTuChoi = $data['ly_do'] ?? 'Không có lý do cụ thể';
            if (!$suatChieu) {
                throw new \Exception("Suất chiếu không tồn tại");
                exit();
            }
            $suatChieu->tinh_trang = 2; // Từ chối
            $suatChieu->ly_do = $lyDoTuChoi;
            $suatChieu->logSuatChieu()->create([
                'hanh_dong' => '4', // Từ chối suất chiếu
                'da_xem' => 1, // Đánh dấu quản lý chuỗi rạp đã xem
                'rap_da_xem' => 0 // Đánh dấu rạp chưa xem
            ]);
            $suatChieu->save();
        }
        public function doc($ngay){
            // Kiểm tra và chuyển đổi ngày nếu có dạng d/m/y sang y-m-d
            if (preg_match('/^\d{1,2}\/\d{1,2}\/\d{4}$/', $ngay)) {
                $parts = explode('/', $ngay);
                // Đảm bảo đúng thứ tự: ngày/tháng/năm -> năm-tháng-ngày
                $ngay = $parts[2] . '-' . str_pad($parts[1], 2, '0', STR_PAD_LEFT) . '-' . str_pad($parts[0], 2, '0', STR_PAD_LEFT);
            }
            if(isset($_SESSION['UserInternal']['ID_RapPhim'])){
                $idRapPhim = $_SESSION['UserInternal']['ID_RapPhim'];
                $suatChieu = SuatChieu::with('phim', 'phongChieu')
                ->whereHas('phongChieu', function($query) use ($idRapPhim) {
                    $query->where('id_rapphim', $idRapPhim);
                })
                ->whereDate('batdau', $ngay)
                ->orderBy('batdau', 'desc')->get();
                return $suatChieu;
            }
            else{
                $idRapPhim = $_GET['id_rap'] ?? 0;
                if($idRapPhim == 0){
                    throw new \Exception("Thiếu ID rạp phim");
                }
                $suatChieu = SuatChieu::with('phim', 'phongChieu')
                ->whereHas('phongChieu', function($query) use ($idRapPhim) {
                    $query->where('id_rapphim', $idRapPhim);
                })
                ->whereDate('batdau', $ngay)
                ->orderBy('batdau', 'desc')->get();
                return $suatChieu;
            }
        }
        public function docSuatChieuChuaXem($idRapPhim){
            $suatChieu = SuatChieu::with('phim', 'phongChieu')
                ->whereHas('phongChieu', function($query) use ($idRapPhim) {
                    $query->where('id_rapphim', $idRapPhim);
                })
                ->where('da_xem', 0)
                ->where('batdau', '>=', Carbon::now())
                ->orderBy('batdau', 'asc')->get();
            return $suatChieu;

        }
        public function tinhTrangSuatChieu($ngay, $idRapPhim){
            $ngayThuHai = Carbon::parse($ngay)->startOfWeek(Carbon::MONDAY)->toDateString();
            $ngayChuNhat = Carbon::parse($ngay)->endOfWeek(Carbon::SUNDAY)->toDateString();
            $suatChieu = SuatChieu::with('phim', 'phongChieu')
                ->whereHas('phongChieu', function($query) use ($idRapPhim) {
                    $query->where('id_rapphim', $idRapPhim);
                })
                ->whereBetween('batdau', [$ngayThuHai, $ngayChuNhat])
                ->orderBy('batdau', 'asc')->get();
            $tinhTrang = [
                'cho_duyet' => 0,
                'da_duyet' => 0,
                'tu_choi' => 0,
                'cho_duyet_lai' => 0
            ];
            foreach($suatChieu as $sc){
                if($sc->trang_thai == 0){
                    $tinhTrang['cho_duyet'] += 1;
                }
                elseif($sc->trang_thai == 1){
                    $tinhTrang['da_duyet'] += 1;
                }
                elseif($sc->trang_thai == 2){
                    $tinhTrang['tu_choi'] += 1;
                }
                elseif($sc->trang_thai == 3){
                    $tinhTrang['cho_duyet_lai'] += 1;
                }
            }
            return $tinhTrang;
        }      
        public function docSuatChieuKH($ngay = null, $idPhim, $idRap = null)
        {
            $query = SuatChieu::with(['phim', 'phongChieu.rapChieuPhim'])
                ->where('id_phim', $idPhim);

            if ($idRap) {
                $query->whereHas('phongChieu.rapChieuPhim', function($q) use ($idRap) {
                    $q->where('id', $idRap);
                });
            }

            if ($ngay) {
                try {
                    $ngayFormat = Carbon::parse($ngay)->toDateString();
                    $today = Carbon::today()->toDateString();

                    if ($ngayFormat === $today) {
                        $query->where('batdau', '>=', Carbon::now());
                    } elseif ($ngayFormat > $today) {
                        $query->whereDate('batdau', $ngayFormat);
                    } else {
                        return collect([]);
                    }
                } catch (\Exception $e) {
                    $query->where('batdau', '>=', Carbon::now());
                }
            } else {
                $query->where('batdau', '>=', Carbon::now());
            }

            return $query->orderBy('batdau', 'asc')->get();
        }

        public function docPhimTheoRap($ngay = null, $idRap = null) {
            $query = SuatChieu::with(['phim', 'phongChieu.rapChieuPhim'])
                ->whereHas('phongChieu', function ($q) use ($idRap) {
                    $q->where('id_rapphim', $idRap);
                });

            // Xử lý ngày
            $today = Carbon::today()->toDateString();
            if ($ngay) {
                try {
                    $ngayFormat = Carbon::parse($ngay)->toDateString();
                    if ($ngayFormat === $today) {
                        // Nếu là hôm nay, chỉ lấy suất chiếu còn trong tương lai
                        $query->where('batdau', '>=', Carbon::now());
                    } else {
                        // Ngày khác, lấy tất cả suất chiếu trong ngày
                        $query->whereDate('batdau', $ngayFormat);
                    }
                } catch (\Exception $e) {
                    // Nếu parse ngày lỗi, mặc định lấy từ hiện tại trở đi
                    $query->where('batdau', '>=', Carbon::now());
                }
            } else {
                // Không truyền ngày, lấy từ hiện tại trở đi
                $query->where('batdau', '>=', Carbon::now());
                $ngayFormat = $today;
            }

            // Lấy tất cả suất chiếu, sắp xếp theo thời gian bắt đầu
            $suatChieuList = $query->orderBy('batdau', 'asc')->get();

            // Lọc phim dựa trên **suất chiếu trong ngày** trước khi unique
            $phimList = $suatChieuList
            ->filter(fn($suat) => Carbon::parse($suat->batdau)->toDateString() === $ngayFormat)
            ->sortBy('batdau')      // <--- thêm dòng này
            ->pluck('phim')
            ->filter()
            ->unique('id')
            ->values();
            return $phimList;
        }
        public function docNhatKy($idRapPhim = null){
            // Lấy ngày cách đây 7 ngày
            $bayNgayTruoc = Carbon::now()->subDays(7)->toDateString();

            $query = LogSuatChieu::whereDate('created_at', '>=', $bayNgayTruoc);

            // Nếu truyền id rạp phim, chỉ lấy nhật ký của các suất chiếu thuộc rạp đó
            if ($idRapPhim) {
                $query->whereHas('suatChieu.phongChieu', function($q) use ($idRapPhim) {
                    $q->where('id_rapphim', $idRapPhim);
                });
            }
            else if(isset($_SESSION['UserInternal']['ID_RapPhim'])){
                $idRapPhim = $_SESSION['UserInternal']['ID_RapPhim'];
                $query->whereHas('suatChieu.phongChieu', function($q) use ($idRapPhim) {
                    $q->where('id_rapphim', $idRapPhim);
                });
            }

            $nhatKy = $query->orderBy('created_at', 'desc')->get();

            return $nhatKy;
        }
        public function danhDauDaXem($idRapPhim){ // Đánh dấu quản lý chuỗi rạp đã xem
            $nhatKy = LogSuatChieu::whereHas('suatChieu.phongChieu', function($q) use ($idRapPhim) {
                $q->where('id_rapphim', $idRapPhim);
            })
            ->where('da_xem', 0)
            ->update(['da_xem' => 1]);
            return $nhatKy;
        }
        public function danhDauRapDaXem(){// Đánh đau quản lý rạp đã xem
            $idRapPhim = $_SESSION['UserInternal']['ID_RapPhim'];
            $nhatKy = LogSuatChieu::whereHas('suatChieu.phongChieu', function($q) use ($idRapPhim) {
                $q->where('id_rapphim', $idRapPhim);
            })
            ->where('rap_da_xem', 0)
            ->update(['rap_da_xem' => 1]);
            return $nhatKy;
        }
    }
?>