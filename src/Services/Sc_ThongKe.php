<?php
    namespace App\Services;
    use App\Models\DonHang;
    use App\Models\Phim;
    use App\Models\SuatChieu;
    use App\Models\RapPhim;
    use App\Models\PhongChieu;
    use App\Models\Ve;
    use App\Models\SanPham;
    use App\Models\ChiTietDonHang;
    use App\Models\PhanPhoiPhim;
    use App\Models\Ngay; // Thêm model Ngay vào danh sách import

    class Sc_ThongKe{
        // Thống kê cho quản lý rạp

        public function doanhThuTongQuatTheoRap($idRap, $tuNgay, $denNgay){
            // Tính khoảng thời gian của kỳ hiện tại
            $tuNgayDate = new \DateTime($tuNgay . ' 00:00:00');
            $denNgayDate = new \DateTime($denNgay . ' 23:59:59');
            $soNgayTrongKyHienTai = $tuNgayDate->diff($denNgayDate)->days + 1;
            
            // Tính khoảng thời gian của kỳ trước đó
            $tuNgayKyTruoc = (clone $tuNgayDate)->sub(new \DateInterval("P{$soNgayTrongKyHienTai}D"))->format('Y-m-d') . ' 00:00:00';
            $denNgayKyTruoc = (clone $tuNgayDate)->sub(new \DateInterval('P1D'))->format('Y-m-d') . ' 23:59:59';
            
            // Định dạng lại để sử dụng trong các câu truy vấn
            $tuNgayQuery = $tuNgayDate->format('Y-m-d H:i:s');
            $denNgayQuery = $denNgayDate->format('Y-m-d H:i:s');

            // -------------- TÍNH DỮ LIỆU KỲ HIỆN TẠI --------------
            
            // Tổng doanThu = tong_tien của DonHang có trang_thai = 2
            // Sửa: Thay vì sử dụng id_rapphim, truy vấn qua mối quan hệ
            $tongDoanhThuDangChon = DonHang::whereHas('suatChieu', function($query) use ($idRap) {
                    $query->whereHas('phongChieu', function($subQuery) use ($idRap) {
                        $subQuery->where('id_rapphim', $idRap);
                    });
                })
                ->where('trang_thai', 2)
                ->whereBetween('ngay_dat', [$tuNgayQuery, $denNgayQuery])
                ->sum('tong_tien');
                
            // Số lượng khách hàng = Tổng số khách hàng thành viên tạo đơn hàng + Tổng số đơn hàng không có thông tin khách hàng (trang_thai = 2)
            // Sửa: Thêm điều kiện lọc theo rạp phim
            $soLuongKhachHangCoTaiKhoan = DonHang::whereHas('suatChieu', function($query) use ($idRap) {
                    $query->whereHas('phongChieu', function($subQuery) use ($idRap) {
                        $subQuery->where('id_rapphim', $idRap);
                    });
                })
                ->where('trang_thai', 2)
                ->whereBetween('ngay_dat', [$tuNgayQuery, $denNgayQuery])
                ->whereNotNull('user_id')
                ->distinct('user_id')
                ->count('user_id');
                
            $soLuongKhachHangKhongTaiKhoan = DonHang::whereHas('suatChieu', function($query) use ($idRap) {
                    $query->whereHas('phongChieu', function($subQuery) use ($idRap) {
                        $subQuery->where('id_rapphim', $idRap);
                    });
                })
                ->where('trang_thai', 2)
                ->whereBetween('ngay_dat', [$tuNgayQuery, $denNgayQuery])
                ->whereNull('user_id')
                ->count();
                
            $soLuongKhachHangDangChon = $soLuongKhachHangCoTaiKhoan + $soLuongKhachHangKhongTaiKhoan;
            
            // Tỉ lệ lấp đầy ghế trong phòng chiếu = (Tổng số ghế đã bán được / Tổng số ghế của tất cả các suất chiếu) * 100%
            // Giữ nguyên code hiện tại nhưng cập nhật thời gian truy vấn
            $tongSoGheDaBanDuoc = Ve::whereHas('suatchieu', function($query) use ($idRap, $tuNgayQuery, $denNgayQuery) {
                $query->whereHas('phongChieu', function($subQuery) use ($idRap) {
                    $subQuery->where('id_rapphim', $idRap);
                })
                ->whereBetween('batdau', [$tuNgayQuery, $denNgayQuery]);
            })
            ->where('trang_thai', 2) // Trạng thái 2: Đã đặt
            ->count();

            // Tính tổng số ghế của tất cả các suất chiếu trong khoảng thời gian
            // Giữ nguyên code nhưng cập nhật thời gian truy vấn
            $tongSoGheCuaTatCaCacSuatChieu = 0;
            $suatChieuTrongThoiGian = SuatChieu::whereHas('phongChieu', function($query) use ($idRap) {
                $query->where('id_rapphim', $idRap);
            })
            ->whereBetween('batdau', [$tuNgayQuery, $denNgayQuery])
            ->where('tinh_trang', 1) // Chỉ tính suất chiếu đã duyệt
            ->get();

            foreach ($suatChieuTrongThoiGian as $suatChieu) {
                // Lấy số lượng ghế của phòng chiếu
                $soLuongGhePhong = $suatChieu->phongChieu->so_luong_ghe;
                $tongSoGheCuaTatCaCacSuatChieu += $soLuongGhePhong;
            }

            // Tính tỷ lệ lấp đầy
            $tiLeLapDayGheDangChon = $tongSoGheCuaTatCaCacSuatChieu > 0 ? 
                                ($tongSoGheDaBanDuoc / $tongSoGheCuaTatCaCacSuatChieu) * 100 : 0;
            $tiLeLapDayGheDangChon = round($tiLeLapDayGheDangChon, 2);
            
            // Doanh thu đồ ăn uống bình quân 1 khách hàng
            // Sửa: Truy vấn theo đúng mối quan hệ
            $tongDoanhThuDoAnUong = ChiTietDonHang::whereHas('donHang', function($query) use ($idRap, $tuNgayQuery, $denNgayQuery) {
                $query->whereHas('suatChieu', function($subQuery) use ($idRap) {
                    $subQuery->whereHas('phongChieu', function($thirdQuery) use ($idRap) {
                        $thirdQuery->where('id_rapphim', $idRap);
                    });
                })
                ->where('trang_thai', 2) // Đã thanh toán
                ->whereBetween('ngay_dat', [$tuNgayQuery, $denNgayQuery]);
            })
            ->whereHas('sanPham')
            ->sum('thanh_tien');

            // Sử dụng số lượng khách hàng đã tính trước đó
            if ($soLuongKhachHangDangChon > 0) {
                $doanhThuDoAnUongBinhQuanDangChon = $tongDoanhThuDoAnUong / $soLuongKhachHangDangChon;
                // Làm tròn đến 2 chữ số thập phân
                $doanhThuDoAnUongBinhQuanDangChon = round($doanhThuDoAnUongBinhQuanDangChon, 2);
            } else {
                $doanhThuDoAnUongBinhQuanDangChon = 0;
            }

            // -------------- TÍNH DỮ LIỆU KỲ TRƯỚC ĐÓ --------------
            
            // Tổng doanh thu kỳ trước
            // Sửa: Truy vấn theo đúng mối quan hệ
            $tongDoanhThuKyTruoc = DonHang::whereHas('suatChieu', function($query) use ($idRap) {
                    $query->whereHas('phongChieu', function($subQuery) use ($idRap) {
                        $subQuery->where('id_rapphim', $idRap);
                    });
                })
                ->where('trang_thai', 2)
                ->whereBetween('ngay_dat', [$tuNgayKyTruoc, $denNgayKyTruoc])
                ->sum('tong_tien');
        
            // Số lượng khách hàng kỳ trước
            // Sửa: Truy vấn theo đúng mối quan hệ
            $soLuongKhachHangCoTaiKhoanKyTruoc = DonHang::whereHas('suatChieu', function($query) use ($idRap) {
                    $query->whereHas('phongChieu', function($subQuery) use ($idRap) {
                        $subQuery->where('id_rapphim', $idRap);
                    });
                })
                ->where('trang_thai', 2)
                ->whereBetween('ngay_dat', [$tuNgayKyTruoc, $denNgayKyTruoc])
                ->whereNotNull('user_id')
                ->distinct('user_id')
                ->count('user_id');
                
            $soLuongKhachHangKhongTaiKhoanKyTruoc = DonHang::whereHas('suatChieu', function($query) use ($idRap) {
                    $query->whereHas('phongChieu', function($subQuery) use ($idRap) {
                        $subQuery->where('id_rapphim', $idRap);
                    });
                })
                ->where('trang_thai', 2)
                ->whereBetween('ngay_dat', [$tuNgayKyTruoc, $denNgayKyTruoc])
                ->whereNull('user_id')
                ->count();
                
            $soLuongKhachHangKyTruoc = $soLuongKhachHangCoTaiKhoanKyTruoc + $soLuongKhachHangKhongTaiKhoanKyTruoc;
            
            // Tỉ lệ lấp đầy ghế kỳ trước
            $tongSoGheDaBanDuocKyTruoc = Ve::whereHas('suatchieu', function($query) use ($idRap, $tuNgayKyTruoc, $denNgayKyTruoc) {
                $query->whereHas('phongChieu', function($subQuery) use ($idRap) {
                    $subQuery->where('id_rapphim', $idRap);
                })
                ->whereBetween('batdau', [$tuNgayKyTruoc, $denNgayKyTruoc]);
            })
            ->where('trang_thai', 2)
            ->count();

            $tongSoGheCuaTatCaCacSuatChieuKyTruoc = 0;
            $suatChieuTrongThoiGianKyTruoc = SuatChieu::whereHas('phongChieu', function($query) use ($idRap) {
                $query->where('id_rapphim', $idRap);
            })
            ->whereBetween('batdau', [$tuNgayKyTruoc, $denNgayKyTruoc])
            ->where('tinh_trang', 1)
            ->get();

            foreach ($suatChieuTrongThoiGianKyTruoc as $suatChieu) {
                $soLuongGhePhong = $suatChieu->phongChieu->so_luong_ghe;
                $tongSoGheCuaTatCaCacSuatChieuKyTruoc += $soLuongGhePhong;
            }

            $tiLeLapDayGheKyTruoc = $tongSoGheCuaTatCaCacSuatChieuKyTruoc > 0 ? 
                                ($tongSoGheDaBanDuocKyTruoc / $tongSoGheCuaTatCaCacSuatChieuKyTruoc) * 100 : 0;
            $tiLeLapDayGheKyTruoc = round($tiLeLapDayGheKyTruoc, 2);
            
            // Doanh thu đồ ăn uống bình quân 1 khách hàng kỳ trước
            $tongDoanhThuDoAnUongKyTruoc = ChiTietDonHang::whereHas('donHang', function($query) use ($idRap, $tuNgayKyTruoc, $denNgayKyTruoc) {
                $query->whereHas('suatChieu', function($subQuery) use ($idRap) {
                    $subQuery->whereHas('phongChieu', function($thirdQuery) use ($idRap) {
                        $thirdQuery->where('id_rapphim', $idRap);
                    });
                })
                ->where('trang_thai', 2)
                ->whereBetween('ngay_dat', [$tuNgayKyTruoc, $denNgayKyTruoc]);
            })
            ->whereHas('sanPham')
            ->sum('thanh_tien');

            $doanhThuDoAnUongBinhQuanKyTruoc = 0;
            if ($soLuongKhachHangKyTruoc > 0) {
                $doanhThuDoAnUongBinhQuanKyTruoc = $tongDoanhThuDoAnUongKyTruoc / $soLuongKhachHangKyTruoc;
                $doanhThuDoAnUongBinhQuanKyTruoc = round($doanhThuDoAnUongBinhQuanKyTruoc, 2);
            }

            // -------------- TÍNH PHẦN TRĂM TĂNG GIẢM --------------
            
            // Phần trăm tăng/giảm doanh thu
            $phanTramThayDoiDoanhThu = 0;
            if ($tongDoanhThuKyTruoc > 0) {
                $phanTramThayDoiDoanhThu = (($tongDoanhThuDangChon - $tongDoanhThuKyTruoc) / $tongDoanhThuKyTruoc) * 100;
                $phanTramThayDoiDoanhThu = round($phanTramThayDoiDoanhThu, 2);
            }
            
            // Phần trăm tăng/giảm số lượng khách hàng
            $phanTramThayDoiKhachHang = 0;
            if ($soLuongKhachHangKyTruoc > 0) {
                $phanTramThayDoiKhachHang = (($soLuongKhachHangDangChon - $soLuongKhachHangKyTruoc) / $soLuongKhachHangKyTruoc) * 100;
                $phanTramThayDoiKhachHang = round($phanTramThayDoiKhachHang, 2);
            }
            
            // Phần trăm tăng/giảm tỷ lệ lấp đầy ghế
            $phanTramThayDoiTyLeLapDay = 0;
            if ($tiLeLapDayGheKyTruoc > 0) {
                $phanTramThayDoiTyLeLapDay = (($tiLeLapDayGheDangChon - $tiLeLapDayGheKyTruoc) / $tiLeLapDayGheKyTruoc) * 100;
                $phanTramThayDoiTyLeLapDay = round($phanTramThayDoiTyLeLapDay, 2);
            }
            
            // Phần trăm tăng/giảm doanh thu đồ ăn uống bình quân
            $phanTramThayDoiDoanhThuDoAnUong = 0;
            if ($doanhThuDoAnUongBinhQuanKyTruoc > 0) {
                $phanTramThayDoiDoanhThuDoAnUong = (($doanhThuDoAnUongBinhQuanDangChon - $doanhThuDoAnUongBinhQuanKyTruoc) / $doanhThuDoAnUongBinhQuanKyTruoc) * 100;
                $phanTramThayDoiDoanhThuDoAnUong = round($phanTramThayDoiDoanhThuDoAnUong, 2);
            }
            
            // Trả về kết quả thống kê dưới dạng mảng
            return [
                'kyHienTai' => [
                    'tuNgay' => $tuNgay,
                    'denNgay' => $denNgay,
                    'tongDoanhThu' => $tongDoanhThuDangChon,
                    'soLuongKhachHang' => $soLuongKhachHangDangChon,
                    'tiLeLapDayGhe' => $tiLeLapDayGheDangChon,
                    'doanhThuDoAnUongBinhQuan' => $doanhThuDoAnUongBinhQuanDangChon
                ],
                'kyTruoc' => [
                    'tuNgay' => (new \DateTime($tuNgayKyTruoc))->format('Y-m-d'),
                    'denNgay' => (new \DateTime($denNgayKyTruoc))->format('Y-m-d'),
                    'tongDoanhThu' => $tongDoanhThuKyTruoc,
                    'soLuongKhachHang' => $soLuongKhachHangKyTruoc,
                    'tiLeLapDayGhe' => $tiLeLapDayGheKyTruoc,
                    'doanhThuDoAnUongBinhQuan' => $doanhThuDoAnUongBinhQuanKyTruoc
                ],
                'phanTramThayDoi' => [
                    'doanhThu' => $phanTramThayDoiDoanhThu,
                    'khachHang' => $phanTramThayDoiKhachHang,
                    'tiLeLapDayGhe' => $phanTramThayDoiTyLeLapDay,
                    'doanhThuDoAnUongBinhQuan' => $phanTramThayDoiDoanhThuDoAnUong
                ]
            ];
        }
        // Dùng hiển thị biểu đồ Phân tích doanh thu, Phân bổ doanh thu
        public function phanTichDoanhThuTheoRap($idRap, $tuNgay, $denNgay){
            // Tính Doanh thu vé theo từng ngày của rạp
            // Tính Doanh thu sản phẩm theo từng ngày của rạp
            
            // Tính khoảng thời gian
            $tuNgayDate = new \DateTime($tuNgay . ' 00:00:00');
            $denNgayDate = new \DateTime($denNgay . ' 23:59:59');
            
            // Tạo mảng các ngày trong khoảng thời gian
            $danhSachNgay = [];
            $ngayHienTai = clone $tuNgayDate;
            while ($ngayHienTai <= $denNgayDate) {
                $danhSachNgay[] = $ngayHienTai->format('Y-m-d');
                $ngayHienTai->add(new \DateInterval('P1D'));
            }
            
            // Khởi tạo kết quả
            $ketQua = [];
            
            foreach ($danhSachNgay as $ngay) {
                $batDauNgay = $ngay . ' 00:00:00';
                $ketThucNgay = $ngay . ' 23:59:59';
                
                // -------------- TÍNH DOANH THU VÉ THEO NGÀY --------------
                
                // Doanh thu vé = Tổng giá vé của các vé đã bán (trang_thai = 2) trong ngày
                $doanhThuVe = Ve::whereHas('suatchieu', function($query) use ($idRap) {
                        $query->whereHas('phongChieu', function($subQuery) use ($idRap) {
                            $subQuery->where('id_rapphim', $idRap);
                        });
                    })
                    ->where('trang_thai', 2) // Vé đã đặt
                    ->whereHas('donhang', function($query) use ($batDauNgay, $ketThucNgay) {
                        $query->where('trang_thai', 2) // Đơn hàng đã thanh toán
                              ->whereBetween('ngay_dat', [$batDauNgay, $ketThucNgay]);
                    })
                    ->sum('gia_ve');
               
                    
                // -------------- TÍNH DOANH THU SẢN PHẨM THEO NGÀY --------------
                
                // Doanh thu sản phẩm = Tổng thành tiền của chi tiết đơn hàng (sản phẩm đồ ăn/nước uống)
                $doanhThuSanPham = ChiTietDonHang::whereHas('donHang', function($query) use ($idRap, $batDauNgay, $ketThucNgay) {
                        $query->whereHas('suatChieu', function($subQuery) use ($idRap) {
                            $subQuery->whereHas('phongChieu', function($thirdQuery) use ($idRap) {
                                $thirdQuery->where('id_rapphim', $idRap);
                            });
                        })
                        ->where('trang_thai', 2) // Đơn hàng đã thanh toán
                        ->whereBetween('ngay_dat', [$batDauNgay, $ketThucNgay]);
                    })
                    ->whereHas('sanPham', function($query) use ($idRap) {
                        $query->where('id_rapphim', $idRap); // Chỉ lấy sản phẩm của rạp này
                    })
                    ->sum('thanh_tien');
                    
              
                    
                // Tổng doanh thu trong ngày
                $tongDoanhThu = $doanhThuVe + $doanhThuSanPham;
                
                // Thêm kết quả vào mảng
                $ketQua[] = [
                    'ngay' => $ngay,
                    'ngay_formatted' => (new \DateTime($ngay))->format('d/m/Y'),
                    'thu_trong_tuan' => (new \DateTime($ngay))->format('l'), // Thứ trong tuần
                    'doanh_thu_ve' => $doanhThuVe,
                    'doanh_thu_san_pham' => $doanhThuSanPham,
                    'tong_doanh_thu' => $tongDoanhThu,
                ];
            }
            
            // Tính tổng kết cho cả khoảng thời gian
            $tongDoanhThuVe = array_sum(array_column($ketQua, 'doanh_thu_ve'));
            $tongDoanhThuSanPham = array_sum(array_column($ketQua, 'doanh_thu_san_pham'));

            return [
                'tu_ngay' => $tuNgay,
                'den_ngay' => $denNgay,
                'chi_tiet_theo_ngay' => $ketQua,
                'tong_ket' => [
                    'tong_doanh_thu_ve' => $tongDoanhThuVe,
                    'tong_doanh_thu_san_pham' => $tongDoanhThuSanPham
                ]
            ];
        }
        // Lấy ra 10 phim có doanh thu cao nhất trong khoảng thời gian
        public function top10PhimCoDoanhThuCaoNhatTheoRap($idRap, $tuNgay, $denNgay) {
            // Định dạng thời gian
            $tuNgayDate = new \DateTime($tuNgay . ' 00:00:00');
            $denNgayDate = new \DateTime($denNgay . ' 23:59:59');
            $tuNgayQuery = $tuNgayDate->format('Y-m-d H:i:s');
            $denNgayQuery = $denNgayDate->format('Y-m-d H:i:s');
            
            // Lấy doanh thu từ vé cho từng phim
            $doanhThuVeCollection = Ve::selectRaw('
                    suatchieu.id_phim,
                    SUM(ve.gia_ve) as doanh_thu_ve
                ')
                ->join('suatchieu', 've.suat_chieu_id', '=', 'suatchieu.id')
                ->join('phongchieu', 'suatchieu.id_phongchieu', '=', 'phongchieu.id')
                ->join('donhang', 've.donhang_id', '=', 'donhang.id')
                ->where('phongchieu.id_rapphim', $idRap)
                ->where('ve.trang_thai', 2) // Vé đã đặt
                ->where('donhang.trang_thai', 2) // Đơn hàng đã thanh toán
                ->whereBetween('donhang.ngay_dat', [$tuNgayQuery, $denNgayQuery])
                ->groupBy('suatchieu.id_phim')
                ->get();
            
            // Chuyển đổi thành mảng
            $doanhThuVeTheoPhim = [];
            foreach ($doanhThuVeCollection as $item) {
                $doanhThuVeTheoPhim[$item->id_phim] = $item->doanh_thu_ve;
            }
            
            // Sắp xếp phim có doanh thu theo thứ tự giảm dần
            $danhSachPhimCoDoanhThu = [];
            foreach ($doanhThuVeTheoPhim as $phimId => $doanhThuVe) {
                $danhSachPhimCoDoanhThu[$phimId] = [
                    'id_phim' => $phimId,
                    'doanh_thu_ve' => $doanhThuVe
                ];
            }
            
            uasort($danhSachPhimCoDoanhThu, function($a, $b) {
                return $b['doanh_thu_ve'] <=> $a['doanh_thu_ve'];
            });
            
            // Lấy danh sách tất cả phim được phân phối cho rạp
            $danhSachPhimDuocPhanPhoi = PhanPhoiPhim::where('id_rapphim', $idRap)
                ->pluck('id_phim')
                ->toArray();
            
            // Lấy phim có doanh thu
            $phimCoDoanhThuIds = array_keys($danhSachPhimCoDoanhThu);
            
            // Lấy phim không có doanh thu (phim được phân phối nhưng không có doanh thu)
            $phimKhongCoDoanhThuIds = array_diff($danhSachPhimDuocPhanPhoi, $phimCoDoanhThuIds);
            
            // Thêm phim không có doanh thu vào danh sách
            $danhSachPhimKhongCoDoanhThu = [];
            foreach ($phimKhongCoDoanhThuIds as $phimId) {
                $danhSachPhimKhongCoDoanhThu[$phimId] = [
                    'id_phim' => $phimId,
                    'doanh_thu_ve' => 0
                ];
            }
            
            // Kết hợp 2 danh sách: phim có doanh thu + phim không có doanh thu
            $danhSachPhim = $danhSachPhimCoDoanhThu + $danhSachPhimKhongCoDoanhThu;
            
            // Giới hạn lấy 10 phim
            $top10Phim = array_slice($danhSachPhim, 0, 10, true);
            
            // Lấy thông tin chi tiết của phim
            if (!empty($phimIds = array_keys($top10Phim))) {
                $thongTinPhimCollection = Phim::whereIn('id', $phimIds)
                    ->with(['TheLoai.TheLoai'])
                    ->get();
                
                // Chuyển đổi thành mảng với key là id
                $thongTinPhim = [];
                foreach ($thongTinPhimCollection as $phim) {
                    $thongTinPhim[$phim->id] = $phim;
                }
                
                // Kết hợp thông tin phim với doanh thu
                $ketQua = [];
                foreach ($top10Phim as $phimId => $doanhThu) {
                    $phim = isset($thongTinPhim[$phimId]) ? $thongTinPhim[$phimId] : null;
                    if ($phim) {
                        // Lấy danh sách thể loại
                        $theLoaiArray = [];
                        if ($phim->TheLoai) {
                            foreach ($phim->TheLoai as $item) {
                                if ($item->TheLoai && $item->TheLoai->ten) {
                                    $theLoaiArray[] = $item->TheLoai->ten;
                                }
                            }
                        }
                        $theLoai = implode(', ', $theLoaiArray);
                        
                        $ketQua[] = [
                            'id' => $phim->id,
                            'ten_phim' => $phim->ten_phim,
                            'dao_dien' => $phim->dao_dien,
                            'dien_vien' => $phim->dien_vien,
                            'thoi_luong' => $phim->thoi_luong,
                            'ngay_cong_chieu' => $phim->ngay_cong_chieu,
                            'do_tuoi' => $phim->do_tuoi,
                            'poster_url' => $phim->poster_url,
                            'the_loai' => $theLoai,
                            'doanh_thu_ve' => $doanhThu['doanh_thu_ve']
                        ];
                    }
                }
            } else {
                $ketQua = [];
            }
            
            // Nếu vẫn chưa đủ 10 phim, lấy thêm phim mới/phim sắp chiếu
            if (count($ketQua) < 10) {
                $soPhimCanThem = 10 - count($ketQua);
                $phimIds = array_column($ketQua, 'id');
                
                $phimBoSung = Phim::whereNotIn('id', $phimIds)
                    ->orderBy('ngay_cong_chieu', 'desc')
                    ->limit($soPhimCanThem)
                    ->with(['TheLoai.TheLoai'])
                    ->get();
                    
                foreach ($phimBoSung as $phim) {
                    // Lấy danh sách thể loại
                    $theLoaiArray = [];
                    if ($phim->TheLoai) {
                        foreach ($phim->TheLoai as $item) {
                            if ($item->TheLoai && $item->TheLoai->ten) {
                                $theLoaiArray[] = $item->TheLoai->ten;
                            }
                        }
                    }
                    $theLoai = implode(', ', $theLoaiArray);
                    
                    $ketQua[] = [
                        'id' => $phim->id,
                        'ten_phim' => $phim->ten_phim,
                        'dao_dien' => $phim->dao_dien,
                        'dien_vien' => $phim->dien_vien,
                        'thoi_luong' => $phim->thoi_luong,
                        'ngay_cong_chieu' => $phim->ngay_cong_chieu,
                        'do_tuoi' => $phim->do_tuoi,
                        'poster_url' => $phim->poster_url,
                        'the_loai' => $theLoai,
                        'doanh_thu_ve' => 0 // Phim bổ sung không có doanh thu
                    ];
                }
            }
            
            return [
                'tu_ngay' => $tuNgay,
                'den_ngay' => $denNgay,
                'top_10_phim' => $ketQua
            ];
        }
        
        // Lấy ra 10 sản phẩm có doanh thu cao nhất trong khoảng thời gian
        public function top10SanPhamCoDoanhThuCaoNhatTheoRap($idRap, $tuNgay, $denNgay) {
            // Định dạng thời gian
            $tuNgayDate = new \DateTime($tuNgay . ' 00:00:00');
            $denNgayDate = new \DateTime($denNgay . ' 23:59:59');
            $tuNgayQuery = $tuNgayDate->format('Y-m-d H:i:s');
            $denNgayQuery = $denNgayDate->format('Y-m-d H:i:s');
            
            // Lấy doanh thu từng sản phẩm
            $doanhThuSanPhamCollection = ChiTietDonHang::selectRaw('
                    chitiet_donhang.sanpham_id,
                    SUM(chitiet_donhang.thanh_tien) as doanh_thu,
                    SUM(chitiet_donhang.so_luong) as so_luong_ban
                ')
                ->join('donhang', 'chitiet_donhang.donhang_id', '=', 'donhang.id')
                ->join('suatchieu', 'donhang.suat_chieu_id', '=', 'suatchieu.id')
                ->join('phongchieu', 'suatchieu.id_phongchieu', '=', 'phongchieu.id')
                ->join('san_pham', 'chitiet_donhang.sanpham_id', '=', 'san_pham.id')
                ->where('phongchieu.id_rapphim', $idRap)
                ->where('san_pham.id_rapphim', $idRap) // Chỉ lấy sản phẩm của rạp này
                ->where('donhang.trang_thai', 2) // Đơn hàng đã thanh toán
                ->whereBetween('donhang.ngay_dat', [$tuNgayQuery, $denNgayQuery])
                ->groupBy('chitiet_donhang.sanpham_id')
                ->get();
            
            // Chuyển đổi thành mảng
            $danhSachSanPhamCoDoanhThu = [];
            foreach ($doanhThuSanPhamCollection as $item) {
                $danhSachSanPhamCoDoanhThu[$item->sanpham_id] = [
                    'id_san_pham' => $item->sanpham_id,
                    'doanh_thu' => $item->doanh_thu,
                    'so_luong_ban' => $item->so_luong_ban
                ];
            }
            
            // Sắp xếp theo doanh thu giảm dần
            uasort($danhSachSanPhamCoDoanhThu, function($a, $b) {
                return $b['doanh_thu'] <=> $a['doanh_thu'];
            });
            
            // Lấy tất cả sản phẩm của rạp
            $tatCaSanPhamCuaRapCollection = SanPham::where('id_rapphim', $idRap)
                ->where('trang_thai', 1) // Chỉ lấy sản phẩm đang bán
                ->select('id')
                ->get();

            $tatCaSanPhamCuaRap = [];
            foreach ($tatCaSanPhamCuaRapCollection as $sanPham) {
                $tatCaSanPhamCuaRap[] = $sanPham->id;
            }
            
            // Lấy sản phẩm có doanh thu
            $sanPhamCoDoanhThuIds = array_keys($danhSachSanPhamCoDoanhThu);
            
            // Lấy sản phẩm không có doanh thu (sản phẩm của rạp nhưng chưa bán được)
            $sanPhamKhongCoDoanhThuIds = array_diff($tatCaSanPhamCuaRap, $sanPhamCoDoanhThuIds);
            
            // Thêm sản phẩm không có doanh thu vào danh sách
            $danhSachSanPhamKhongCoDoanhThu = [];
            foreach ($sanPhamKhongCoDoanhThuIds as $sanPhamId) {
                $danhSachSanPhamKhongCoDoanhThu[$sanPhamId] = [
                    'id_san_pham' => $sanPhamId,
                    'doanh_thu' => 0,
                    'so_luong_ban' => 0
                ];
            }
            
            // Kết hợp 2 danh sách: sản phẩm có doanh thu + sản phẩm không có doanh thu
            $danhSachSanPham = $danhSachSanPhamCoDoanhThu + $danhSachSanPhamKhongCoDoanhThu;
            
            // Giới hạn lấy 10 sản phẩm
            $top10SanPham = array_slice($danhSachSanPham, 0, 10, true);
            
            // Lấy thông tin chi tiết của sản phẩm
            if (!empty($sanPhamIds = array_keys($top10SanPham))) {
                $thongTinSanPhamCollection = SanPham::whereIn('id', $sanPhamIds)
                    ->with(['danhMuc'])
                    ->get();
        
                // Chuyển đổi thành mảng với key là id
                $thongTinSanPham = [];
                foreach ($thongTinSanPhamCollection as $sanPham) {
                    $thongTinSanPham[$sanPham->id] = $sanPham;
                }
        
                // Kết hợp thông tin sản phẩm với doanh thu
                $ketQua = [];
                foreach ($top10SanPham as $sanPhamId => $doanhThu) {
                    $sanPham = isset($thongTinSanPham[$sanPhamId]) ? $thongTinSanPham[$sanPhamId] : null;
                    if ($sanPham) {
                        $ketQua[] = [
                            'id' => $sanPham->id,
                            'ten' => $sanPham->ten,
                            'mo_ta' => $sanPham->mo_ta,
                            'gia' => $sanPham->gia,
                            'hinh_anh' => $sanPham->hinh_anh,
                            'danh_muc' => $sanPham->danhMuc ? $sanPham->danhMuc->ten : 'Không xác định',
                            'danh_muc_id' => $sanPham->danh_muc_id,
                            'trang_thai' => $sanPham->trang_thai,
                            'doanh_thu' => $doanhThu['doanh_thu']
                        ];
                    }
                }
            } else {
                $ketQua = [];
            }
            
            // Nếu vẫn chưa đủ 10 sản phẩm, lấy thêm sản phẩm mới nhất
            if (count($ketQua) < 10) {
                $soSanPhamCanThem = 10 - count($ketQua);
                $sanPhamIds = array_column($ketQua, 'id');
        
                $sanPhamBoSung = SanPham::where('id_rapphim', $idRap)
                    ->whereNotIn('id', $sanPhamIds)
                    ->orderBy('created_at', 'desc')
                    ->limit($soSanPhamCanThem)
                    ->with(['danhMuc'])
                    ->get();
                    
                foreach ($sanPhamBoSung as $sanPham) {
                    $ketQua[] = [
                        'id' => $sanPham->id,
                        'ten' => $sanPham->ten,
                        'mo_ta' => $sanPham->mo_ta,
                        'gia' => $sanPham->gia,
                        'hinh_anh' => $sanPham->hinh_anh,
                        'danh_muc' => $sanPham->danhMuc ? $sanPham->danhMuc->ten : 'Không xác định',
                        'danh_muc_id' => $sanPham->danh_muc_id,
                        'trang_thai' => $sanPham->trang_thai,
                        'doanh_thu' => 0,
                    ];
                }
            }
            
            // Tính tổng doanh thu và số lượng sản phẩm đã bán
            $tongDoanhThu = array_sum(array_column($ketQua, 'doanh_thu'));
            
            return [
                'tu_ngay' => $tuNgay,
                'den_ngay' => $denNgay,
                'top_10_san_pham' => $ketQua,
                'tong_ket' => [
                    'tong_doanh_thu' => $tongDoanhThu
                ]
            ];
        }
        public function hieuQuaTheoKhungGioTheoRap($idRap, $tuNgay, $denNgay) {
            // Định dạng thời gian
            $tuNgayDate = new \DateTime($tuNgay . ' 00:00:00');
            $denNgayDate = new \DateTime($denNgay . ' 23:59:59');
            $tuNgayQuery = $tuNgayDate->format('Y-m-d H:i:s');
            $denNgayQuery = $denNgayDate->format('Y-m-d H:i:s');
            
            // Định nghĩa các khung giờ từ 8:00 đến 24:00
            $khungGio = [
                ['batDau' => '08:00:00', 'ketThuc' => '10:00:00', 'label' => '8:00 - 10:00'],
                ['batDau' => '10:00:00', 'ketThuc' => '12:00:00', 'label' => '10:00 - 12:00'],
                ['batDau' => '12:00:00', 'ketThuc' => '14:00:00', 'label' => '12:00 - 14:00'],
                ['batDau' => '14:00:00', 'ketThuc' => '16:00:00', 'label' => '14:00 - 16:00'],
                ['batDau' => '16:00:00', 'ketThuc' => '18:00:00', 'label' => '16:00 - 18:00'],
                ['batDau' => '18:00:00', 'ketThuc' => '20:00:00', 'label' => '18:00 - 20:00'],
                ['batDau' => '20:00:00', 'ketThuc' => '22:00:00', 'label' => '20:00 - 22:00'],
                ['batDau' => '22:00:00', 'ketThuc' => '24:00:00', 'label' => '22:00 - 24:00']
            ];
            
            $ketQua = [];
            
            // Lấy ra dữ liệu cho từng khung giờ
            foreach ($khungGio as $kg) {
                $batDauGio = $kg['batDau'];
                $ketThucGio = $kg['ketThuc'];
                
                // Lấy danh sách suất chiếu trong khung giờ và khoảng thời gian
                $suatChieuCollection = SuatChieu::whereHas('phongChieu', function($query) use ($idRap) {
                        $query->where('id_rapphim', $idRap);
                    })
                    ->where('tinh_trang', 1) // Đã duyệt
                    ->whereBetween('batdau', [$tuNgayQuery, $denNgayQuery])
                    ->whereRaw("TIME(batdau) >= ?", [$batDauGio])
                    ->whereRaw("TIME(batdau) < ?", [$ketThucGio])
                    ->get();
                
                // Khởi tạo các biến thống kê
                $soLuongSuatChieu = $suatChieuCollection->count();
                $tongSoGhe = 0;
                $tongSoVeDaBan = 0;
                $tongDoanhThuVe = 0;
                $tongDoanhThuSanPham = 0;
                
                // Nếu không có suất chiếu nào trong khung giờ này
                if ($soLuongSuatChieu == 0) {
                    $ketQua[] = [
                        'khung_gio' => $kg['label'],
                        'so_luong_suat_chieu' => 0,
                        'ty_le_lap_day' => 0,
                        'doanh_thu_ve' => 0,
                        'doanh_thu_san_pham' => 0,
                        'tong_doanh_thu' => 0
                    ];
                    continue;
                }
                
                // Duyệt qua từng suất chiếu để tính số ghế và doanh thu
                foreach ($suatChieuCollection as $suatChieu) {
                    $idSuatChieu = $suatChieu->id;
                    $soGhePhong = $suatChieu->phongChieu->so_luong_ghe;
                    $tongSoGhe += $soGhePhong;
                    
                    // Đếm số vé đã bán cho suất chiếu này
                    $soVeDaBan = Ve::where('suat_chieu_id', $idSuatChieu)
                        ->where('trang_thai', 2) // Vé đã đặt
                        ->count();
                    $tongSoVeDaBan += $soVeDaBan;
                    
                    // Tính doanh thu vé của suất chiếu này
                    $doanhThuVeSuatChieu = Ve::where('suat_chieu_id', $idSuatChieu)
                        ->where('trang_thai', 2) // Vé đã đặt
                        ->sum('gia_ve');
                    $tongDoanhThuVe += $doanhThuVeSuatChieu;
                    
                    // Tính doanh thu sản phẩm từ các đơn hàng của suất chiếu này
                    $doanhThuSanPhamSuatChieu = ChiTietDonHang::whereHas('donHang', function($query) use ($idSuatChieu) {
                            $query->where('suat_chieu_id', $idSuatChieu)
                                  ->where('trang_thai', 2); // Đơn hàng đã thanh toán
                        })
                        ->sum('thanh_tien');
                    $tongDoanhThuSanPham += $doanhThuSanPhamSuatChieu;
                }
                
                // Tính tỷ lệ lấp đầy ghế
                $tyLeLapDay = $tongSoGhe > 0 ? ($tongSoVeDaBan / $tongSoGhe) * 100 : 0;
                $tyLeLapDay = round($tyLeLapDay, 2);
                
                // Tính tổng doanh thu
                $tongDoanhThu = $tongDoanhThuVe + $tongDoanhThuSanPham;
                
                // Thêm kết quả vào mảng
                $ketQua[] = [
                    'khung_gio' => $kg['label'],
                    'so_luong_suat_chieu' => $soLuongSuatChieu,
                    'so_luong_ghe' => $tongSoGhe,
                    'so_ve_ban' => $tongSoVeDaBan,
                    'ty_le_lap_day' => $tyLeLapDay,
                    'doanh_thu_ve' => $tongDoanhThuVe,
                    'doanh_thu_san_pham' => $tongDoanhThuSanPham,
                    'tong_doanh_thu' => $tongDoanhThu
                ];
            }
            
            // Tính khung giờ có hiệu quả nhất (tỷ lệ lấp đầy cao nhất và doanh thu cao nhất)
            $khungGioTyLeLapDayMax = array_reduce($ketQua, function($carry, $item) {
                return ($carry === null || $item['ty_le_lap_day'] > $carry['ty_le_lap_day']) ? $item : $carry;
            });
            
            $khungGioDoanhThuMax = array_reduce($ketQua, function($carry, $item) {
                return ($carry === null || $item['tong_doanh_thu'] > $carry['tong_doanh_thu']) ? $item : $carry;
            });
            
            // Tính trung bình tỷ lệ lấp đầy và doanh thu
            $totalEntries = count(array_filter($ketQua, function($item) { 
                return $item['so_luong_suat_chieu'] > 0; 
            }));
            
            $avgTyLeLapDay = $totalEntries > 0 ? 
                array_sum(array_column($ketQua, 'ty_le_lap_day')) / $totalEntries : 0;
            
            $avgDoanhThu = $totalEntries > 0 ? 
                array_sum(array_column($ketQua, 'tong_doanh_thu')) / $totalEntries : 0;
            
            // Định dạng tiền tệ cho doanh thu
            foreach ($ketQua as &$kg) {
                $kg['doanh_thu_ve_formatted'] = number_format($kg['doanh_thu_ve'], 0, ',', '.') . ' đ';
                $kg['doanh_thu_san_pham_formatted'] = number_format($kg['doanh_thu_san_pham'], 0, ',', '.') . ' đ';
                $kg['tong_doanh_thu_formatted'] = number_format($kg['tong_doanh_thu'], 0, ',', '.') . ' đ';
            }
            
            return [
                'tu_ngay' => $tuNgay,
                'den_ngay' => $denNgay,
                'chi_tiet_theo_khung_gio' => $ketQua,
                'khung_gio_hieu_qua_nhat' => [
                    'ty_le_lap_day' => $khungGioTyLeLapDayMax['khung_gio'] ?? 'Không có dữ liệu',
                    'doanh_thu' => $khungGioDoanhThuMax['khung_gio'] ?? 'Không có dữ liệu'
                ],
                'trung_binh' => [
                    'ty_le_lap_day' => round($avgTyLeLapDay, 2),
                    'doanh_thu' => round($avgDoanhThu, 2),
                    'doanh_thu_formatted' => number_format(round($avgDoanhThu, 2), 0, ',', '.') . ' đ'
                ]
            ];
        }
        // Thống kê xu hướng khách hàng theo thời gian
        public function xuHuongKhachHangTheoThoiGianTheoRap($idRap, $tuNgay, $denNgay) {
            // Định dạng thời gian
            $tuNgayDate = new \DateTime($tuNgay . ' 00:00:00');
            $denNgayDate = new \DateTime($denNgay . ' 23:59:59');
            
            // Tạo mảng các ngày trong khoảng thời gian
            $danhSachNgay = [];
            $ngayHienTai = clone $tuNgayDate;
            while ($ngayHienTai <= $denNgayDate) {
                $danhSachNgay[] = $ngayHienTai->format('Y-m-d');
                $ngayHienTai->add(new \DateInterval('P1D'));
            }
            
            // Lấy thông tin về các ngày đặc biệt (lễ, tết) trong khoảng thời gian
            $ngayDacBietCollection = Ngay::whereBetween('ngay', [$tuNgay, $denNgay])
                ->get();
            
            $ngayDacBiet = [];
            $ngayLe = [];
            $ngayTet = [];
            foreach ($ngayDacBietCollection as $ngay) {
                $ngayDacBiet[$ngay->ngay] = [
                    'loai_ngay' => $ngay->loai_ngay,
                    'dac_biet' => $ngay->dac_biet
                ];
                
                // Phân loại ngày lễ và ngày tết
                if (stripos($ngay->loai_ngay, 'tết') !== false || stripos($ngay->dac_biet, 'tết') !== false) {
                    $ngayTet[$ngay->ngay] = true;
                } else {
                    $ngayLe[$ngay->ngay] = true;
                }
            }
            
            // Khởi tạo mảng kết quả
            $ketQua = [];
            $tongKhach = [];
            $khachCuoiTuan = [];
            $khachNgayThuong = [];
            $khachNgayLe = [];
            $khachNgayTet = []; // Thêm mảng riêng cho ngày Tết
            
            // Phân tích dữ liệu theo từng ngày
            foreach ($danhSachNgay as $ngay) {
                $batDauNgay = $ngay . ' 00:00:00';
                $ketThucNgay = $ngay . ' 23:59:59';
                
                // Kiểm tra ngày trong tuần
                $ngayDateTime = new \DateTime($ngay);
                $thuTrongTuan = (int)$ngayDateTime->format('N'); // 1 (Thứ 2) đến 7 (Chủ Nhật)
                $laCuoiTuan = ($thuTrongTuan >= 6); // Thứ 7 và Chủ Nhật
                
                // Kiểm tra ngày lễ/tết
                $laNgayLe = isset($ngayLe[$ngay]);
                $laNgayTet = isset($ngayTet[$ngay]);
                $laNgayDacBiet = isset($ngayDacBiet[$ngay]);
                
                // Tính số lượng khách hàng trong ngày
                // Số lượng khách hàng có tài khoản
                $soLuongKhachHangCoTaiKhoan = DonHang::whereHas('suatChieu', function($query) use ($idRap) {
                        $query->whereHas('phongChieu', function($subQuery) use ($idRap) {
                            $subQuery->where('id_rapphim', $idRap);
                        });
                    })
                    ->where('trang_thai', 2) // Đã thanh toán
                    ->whereBetween('ngay_dat', [$batDauNgay, $ketThucNgay])
                    ->whereNotNull('user_id')
                    ->distinct('user_id')
                    ->count('user_id');
                    
                // Số lượng khách hàng không tài khoản
                $soLuongKhachHangKhongTaiKhoan = DonHang::whereHas('suatChieu', function($query) use ($idRap) {
                        $query->whereHas('phongChieu', function($subQuery) use ($idRap) {
                            $subQuery->where('id_rapphim', $idRap);
                        });
                    })
                    ->where('trang_thai', 2) // Đã thanh toán
                    ->whereBetween('ngay_dat', [$batDauNgay, $ketThucNgay])
                    ->whereNull('user_id')
                    ->count();
                
                // Tổng số khách hàng trong ngày
                $soLuongKhachHang = $soLuongKhachHangCoTaiKhoan + $soLuongKhachHangKhongTaiKhoan;
                
                // Phân loại khách hàng theo loại ngày - ưu tiên thứ tự: Tết > Lễ > Cuối tuần > Ngày thường
                if ($laNgayTet) {
                    $khachNgayTet[$ngay] = $soLuongKhachHang;
                } elseif ($laNgayLe) {
                    $khachNgayLe[$ngay] = $soLuongKhachHang;
                } elseif ($laCuoiTuan) {
                    $khachCuoiTuan[$ngay] = $soLuongKhachHang;
                } else {
                    $khachNgayThuong[$ngay] = $soLuongKhachHang;
                }
                
                // Lưu tổng số khách hàng
                $tongKhach[$ngay] = $soLuongKhachHang;
                
                // Lấy tên ngày đặc biệt nếu có
                $tenNgayDacBiet = null;
                if ($laNgayDacBiet) {
                    $tenNgayDacBiet = $ngayDacBiet[$ngay]['loai_ngay'];
                }
                
                // Thêm thông tin vào kết quả
                $ketQua[] = [
                    'ngay' => $ngay,
                    'ngay_formatted' => $ngayDateTime->format('d/m'),
                    'thu_trong_tuan' => $this->getTenThuTrongTuan($thuTrongTuan),
                    'la_cuoi_tuan' => $laCuoiTuan,
                    'la_ngay_le' => $laNgayLe,
                    'la_ngay_tet' => $laNgayTet,  // Thêm trường này
                    'ten_ngay_dac_biet' => $tenNgayDacBiet,
                    'so_luong_khach' => $soLuongKhachHang,
                    'so_luong_khach_co_tai_khoan' => $soLuongKhachHangCoTaiKhoan,
                    'so_luong_khach_khong_tai_khoan' => $soLuongKhachHangKhongTaiKhoan
                ];
            }
            
            // Tính trung bình khách hàng theo loại ngày
            $trungBinhKhachNgayThuong = !empty($khachNgayThuong) ? round(array_sum($khachNgayThuong) / count($khachNgayThuong)) : 0;
            $trungBinhKhachCuoiTuan = !empty($khachCuoiTuan) ? round(array_sum($khachCuoiTuan) / count($khachCuoiTuan)) : 0;
            $trungBinhKhachNgayLe = !empty($khachNgayLe) ? round(array_sum($khachNgayLe) / count($khachNgayLe)) : 0;
            $trungBinhKhachNgayTet = !empty($khachNgayTet) ? round(array_sum($khachNgayTet) / count($khachNgayTet)) : 0;
            
            // Tạo dữ liệu tổng hợp theo loại ngày cho biểu đồ
            $duLieuBieuDo = [
                [
                    'ten' => 'Tổng khách',
                    'color' => '#8b5cf6', // Màu tím
                    'data' => $tongKhach
                ],
                [
                    'ten' => 'Cuối tuần',
                    'color' => '#f59e0b', // Màu cam
                    'data' => $khachCuoiTuan
                ],
                [
                    'ten' => 'Ngày thường',
                    'color' => '#10b981', // Màu xanh lá
                    'data' => $khachNgayThuong
                ]
            ];
            
            // Nếu có ngày lễ, thêm dữ liệu ngày lễ vào biểu đồ
            if (!empty($khachNgayLe)) {
                $duLieuBieuDo[] = [
                    'ten' => 'Ngày lễ',
                    'color' => '#ef4444', // Màu đỏ
                    'data' => $khachNgayLe
                ];
            }
            
            // Nếu có ngày Tết, thêm dữ liệu ngày Tết vào biểu đồ
            if (!empty($khachNgayTet)) {
                $duLieuBieuDo[] = [
                    'ten' => 'Ngày Tết',
                    'color' => '#f97316', // Màu cam đậm
                    'data' => $khachNgayTet
                ];
            }
            
            // Tính tổng số khách trong toàn bộ khoảng thời gian
            $tongSoKhach = array_sum($tongKhach);
            
            // Tìm ngày có nhiều khách nhất và ít khách nhất
            $ngayCoNhieuKhachNhat = array_search(max($tongKhach), $tongKhach);
            $ngayCoItKhachNhat = array_search(min($tongKhach), $tongKhach);
            
            // Định dạng lại ngày để hiển thị đẹp hơn
            $formatNgayCoNhieuKhachNhat = (new \DateTime($ngayCoNhieuKhachNhat))->format('d/m/Y');
            $formatNgayCoItKhachNhat = (new \DateTime($ngayCoItKhachNhat))->format('d/m/Y');
            
            // Kiểm tra xem ngày có nhiều/ít khách nhất có phải ngày đặc biệt không
            $loaiNgayCoNhieuKhachNhat = $this->getLoaiNgay($ngayCoNhieuKhachNhat, $ngayDacBiet, $ngayLe, $ngayTet);
            $loaiNgayCoItKhachNhat = $this->getLoaiNgay($ngayCoItKhachNhat, $ngayDacBiet, $ngayLe, $ngayTet);
            
            // Tính tỷ lệ tăng trưởng khách hàng
            $tyLeTangTruong = 0;
            $soNgay = count($danhSachNgay);
            
            if ($soNgay > 1) {
                // Chia thời gian thành 2 nửa để so sánh
                $giuaKhoangThoiGian = floor($soNgay / 2);
                
                $nua1 = array_slice($tongKhach, 0, $giuaKhoangThoiGian);
                $nua2 = array_slice($tongKhach, $giuaKhoangThoiGian);
                
                $tbNua1 = array_sum($nua1) / count($nua1);
                $tbNua2 = array_sum($nua2) / count($nua2);
                
                if ($tbNua1 > 0) {
                    $tyLeTangTruong = (($tbNua2 - $tbNua1) / $tbNua1) * 100;
                }
            }
            
            return [
                'tu_ngay' => $tuNgay,
                'den_ngay' => $denNgay,
                'chi_tiet_theo_ngay' => $ketQua,
                'du_lieu_bieu_do' => $duLieuBieuDo,
                'tong_ket' => [
                    'tong_so_khach' => $tongSoKhach,
                    'ngay_co_nhieu_khach_nhat' => [
                        'ngay' => $ngayCoNhieuKhachNhat,
                        'ngay_formatted' => $formatNgayCoNhieuKhachNhat,
                        'so_luong_khach' => $tongKhach[$ngayCoNhieuKhachNhat] ?? 0,
                        'loai_ngay' => $loaiNgayCoNhieuKhachNhat
                    ],
                    'ngay_co_it_khach_nhat' => [
                        'ngay' => $ngayCoItKhachNhat,
                        'ngay_formatted' => $formatNgayCoItKhachNhat,
                        'so_luong_khach' => $tongKhach[$ngayCoItKhachNhat] ?? 0,
                        'loai_ngay' => $loaiNgayCoItKhachNhat
                    ],
                    'trung_binh_khach_hang' => [
                        'ngay_thuong' => $trungBinhKhachNgayThuong,
                        'cuoi_tuan' => $trungBinhKhachCuoiTuan,
                        'ngay_le' => $trungBinhKhachNgayLe,
                        'ngay_tet' => $trungBinhKhachNgayTet
                    ],
                    'ty_le_tang_truong' => round($tyLeTangTruong, 2),
                    'ty_le_theo_loai_ngay' => [
                        'ngay_thuong' => !empty($khachNgayThuong) ? 
                            round((array_sum($khachNgayThuong) / $tongSoKhach) * 100, 2) : 0,
                        'cuoi_tuan' => !empty($khachCuoiTuan) ?
                            round((array_sum($khachCuoiTuan) / $tongSoKhach) * 100, 2) : 0,
                        'ngay_le' => !empty($khachNgayLe) ?
                            round((array_sum($khachNgayLe) / $tongSoKhach) * 100, 2) : 0,
                        'ngay_tet' => !empty($khachNgayTet) ?
                            round((array_sum($khachNgayTet) / $tongSoKhach) * 100, 2) : 0
                    ]
                ]
            ];
        }

        /**
         * Lấy tên thứ trong tuần từ số thứ tự
         * @param int $thuTrongTuan Số thứ tự trong tuần (1-7)
         * @return string Tên thứ trong tuần
         */
        private function getTenThuTrongTuan($thuTrongTuan) {
            $tenThu = [
                1 => 'Thứ hai',
                2 => 'Thứ ba',
                3 => 'Thứ tư',
                4 => 'Thứ năm',
                5 => 'Thứ sáu',
                6 => 'Thứ bảy',
                7 => 'Chủ nhật'
            ];
            
            return $tenThu[$thuTrongTuan] ?? '';
        }
        /**
         * Xác định loại ngày (ngày thường, cuối tuần, lễ hoặc tết)
         * @param string $ngay Ngày cần kiểm tra
         * @param array $ngayDacBiet Mảng ngày đặc biệt
         * @param array $ngayLe Mảng ngày lễ
         * @param array $ngayTet Mảng ngày tết
         * @return string Loại ngày
         */
        private function getLoaiNgay($ngay, $ngayDacBiet, $ngayLe, $ngayTet) {
            if (isset($ngayTet[$ngay])) {
                return 'Ngày Tết' . (isset($ngayDacBiet[$ngay]) ? ': ' . $ngayDacBiet[$ngay]['loai_ngay'] : '');
            } elseif (isset($ngayLe[$ngay])) {
                return 'Ngày Lễ' . (isset($ngayDacBiet[$ngay]) ? ': ' . $ngayDacBiet[$ngay]['loai_ngay'] : '');
            } else {
                $ngayDateTime = new \DateTime($ngay);
                $thuTrongTuan = (int)$ngayDateTime->format('N');
                if ($thuTrongTuan >= 6) {
                    return 'Cuối tuần: ' . $this->getTenThuTrongTuan($thuTrongTuan);
                } else {
                    return 'Ngày thường: ' . $this->getTenThuTrongTuan($thuTrongTuan);
                }
            }
        }
    /**
     * Phân tích chi tiết về phim, đồ ăn và suất chiếu của rạp trong khoảng thời gian
     * 
     * @param int $idRap ID của rạp cần phân tích
     * @param string $tuNgay Ngày bắt đầu (format: Y-m-d)
     * @param string $denNgay Ngày kết thúc (format: Y-m-d)
     * @return array Dữ liệu phân tích chi tiết
     */
    public function phanTichChiTiet($idRap, $tuNgay, $denNgay) {
        // Định dạng thời gian
        $tuNgayDate = new \DateTime($tuNgay . ' 00:00:00');
        $denNgayDate = new \DateTime($denNgay . ' 23:59:59');
        $tuNgayQuery = $tuNgayDate->format('Y-m-d H:i:s');
        $denNgayQuery = $denNgayDate->format('Y-m-d H:i:s');
        
        // Lấy khoảng thời gian cho kỳ trước để so sánh
        $soNgayTrongKhoang = (int)$tuNgayDate->diff($denNgayDate)->format('%a') + 1;
        $tuNgayKyTruocDate = clone $tuNgayDate;
        $denNgayKyTruocDate = clone $tuNgayDate;
        $tuNgayKyTruocDate->modify('-' . $soNgayTrongKhoang . ' days');
        $denNgayKyTruocDate->modify('-1 day');
        $tuNgayKyTruocQuery = $tuNgayKyTruocDate->format('Y-m-d H:i:s');
        $denNgayKyTruocQuery = $denNgayKyTruocDate->format('Y-m-d H:i:s');
        
        // -------------------- PHÂN TÍCH PHIM --------------------
        $danhSachPhim = $this->phanTichPhim($idRap, $tuNgayQuery, $denNgayQuery, $tuNgayKyTruocQuery, $denNgayKyTruocQuery);
        
        // -------------------- PHÂN TÍCH ĐỒ ĂN --------------------
        $danhSachDoAn = $this->phanTichDoAn($idRap, $tuNgayQuery, $denNgayQuery, $tuNgayKyTruocQuery, $denNgayKyTruocQuery);
        
        // -------------------- PHÂN TÍCH SUẤT CHIẾU --------------------
        $danhSachSuatChieu = $this->phanTichSuatChieu($idRap, $tuNgayQuery, $denNgayQuery, $tuNgayKyTruocQuery, $denNgayKyTruocQuery);
        
        return [
            'tu_ngay' => $tuNgay,
            'den_ngay' => $denNgay,
            'ky_truoc' => [
                'tu_ngay' => $tuNgayKyTruocDate->format('Y-m-d'),
                'den_ngay' => $denNgayKyTruocDate->format('Y-m-d'),
            ],
            'phan_tich_phim' => $danhSachPhim,
            'phan_tich_do_an' => $danhSachDoAn,
            'phan_tich_suat_chieu' => $danhSachSuatChieu
        ];
    }

    /**
     * Phân tích chi tiết các phim của rạp
     */
    private function phanTichPhim($idRap, $tuNgayQuery, $denNgayQuery, $tuNgayKyTruocQuery, $denNgayKyTruocQuery) {
        // Lấy danh sách phim được phân phối cho rạp
        $danhSachPhimIdsCollection = PhanPhoiPhim::where('id_rapphim', $idRap)
            ->select('id_phim')
            ->get();

        // Chuyển từ collection thành array
        $danhSachPhimIds = [];
        foreach ($danhSachPhimIdsCollection as $item) {
            $danhSachPhimIds[] = $item->id_phim;
        }
        
        // Lấy doanh thu từ vé cho từng phim trong kỳ hiện tại
        $doanhThuVeCollection = Ve::selectRaw('
                suatchieu.id_phim,
                SUM(ve.gia_ve) as doanh_thu,
                COUNT(ve.id) as so_luot
            ')
            ->join('suatchieu', 've.suat_chieu_id', '=', 'suatchieu.id')
            ->join('phongchieu', 'suatchieu.id_phongchieu', '=', 'phongchieu.id')
            ->join('donhang', 've.donhang_id', '=', 'donhang.id')
            ->where('phongchieu.id_rapphim', $idRap)
            ->where('ve.trang_thai', 2) // Vé đã đặt
            ->where('donhang.trang_thai', 2) // Đơn hàng đã thanh toán
            ->whereBetween('donhang.ngay_dat', [$tuNgayQuery, $denNgayQuery])
            ->whereIn('suatchieu.id_phim', $danhSachPhimIds)
            ->groupBy('suatchieu.id_phim')
            ->get();
        
        // Chuyển đổi thành mảng
        $doanhThuPhim = [];
        $soLuotPhim = [];
        foreach ($doanhThuVeCollection as $item) {
            $doanhThuPhim[$item->id_phim] = $item->doanh_thu;
            $soLuotPhim[$item->id_phim] = $item->so_luot;
        }
        
        // Lấy doanh thu từ vé cho từng phim trong kỳ trước
        $doanhThuVeKyTruocCollection = Ve::selectRaw('
                suatchieu.id_phim,
                SUM(ve.gia_ve) as doanh_thu
            ')
            ->join('suatchieu', 've.suat_chieu_id', '=', 'suatchieu.id')
            ->join('phongchieu', 'suatchieu.id_phongchieu', '=', 'phongchieu.id')
            ->join('donhang', 've.donhang_id', '=', 'donhang.id')
            ->where('phongchieu.id_rapphim', $idRap)
            ->where('ve.trang_thai', 2) // Vé đã đặt
            ->where('donhang.trang_thai', 2) // Đơn hàng đã thanh toán
            ->whereBetween('donhang.ngay_dat', [$tuNgayKyTruocQuery, $denNgayKyTruocQuery])
            ->whereIn('suatchieu.id_phim', $danhSachPhimIds)
            ->groupBy('suatchieu.id_phim')
            ->get();
        
        // Chuyển đổi thành mảng
        $doanhThuPhimKyTruoc = [];
        foreach ($doanhThuVeKyTruocCollection as $item) {
            $doanhThuPhimKyTruoc[$item->id_phim] = $item->doanh_thu;
        }
        
        // Lấy tổng doanh thu phim để tính tỷ lệ đóng góp
        $tongDoanhThuPhim = array_sum($doanhThuPhim);
        
        // Lấy thông tin chi tiết của tất cả phim
        $thongTinPhimCollection = Phim::whereIn('id', $danhSachPhimIds)
            ->get();
        
        // Tạo kết quả phân tích phim
        $ketQua = [];
        foreach ($thongTinPhimCollection as $phim) {
            $phimId = $phim->id;
            $doanhThu = isset($doanhThuPhim[$phimId]) ? $doanhThuPhim[$phimId] : 0;
            $soLuot = isset($soLuotPhim[$phimId]) ? $soLuotPhim[$phimId] : 0;
            $doanhThuKyTruoc = isset($doanhThuPhimKyTruoc[$phimId]) ? $doanhThuPhimKyTruoc[$phimId] : 0;
            
            // Tính tỷ lệ đóng góp
            $tyLeDongGop = $tongDoanhThuPhim > 0 ? round(($doanhThu / $tongDoanhThuPhim) * 100, 1) : 0;
            
            // Tính tỷ lệ thay đổi so với kỳ trước
            $tyLeThayDoi = 0;
            $isIncreased = true;
            if ($doanhThuKyTruoc > 0) {
                $tyLeThayDoi = round((($doanhThu - $doanhThuKyTruoc) / $doanhThuKyTruoc) * 100, 1);
                $isIncreased = $tyLeThayDoi >= 0;
            }
            
            $ketQua[] = [
                'id' => $phimId,
                'ten_phim' => $phim->ten_phim,
                'doanh_thu' => $doanhThu,
                'doanh_thu_formatted' => number_format($doanhThu, 0, ',', '.') . ' đ',
                'so_luot' => $soLuot,
                'ty_le_dong_gop' => $tyLeDongGop,
                'ty_le_dong_gop_formatted' => $tyLeDongGop . '%',
                'so_voi_ky_truoc' => [
                    'ty_le' => abs($tyLeThayDoi),
                    'ty_le_formatted' => abs($tyLeThayDoi) . '%',
                    'tang' => $isIncreased
                ]
            ];
        }
        
        // Sắp xếp theo doanh thu giảm dần
        usort($ketQua, function($a, $b) {
            return $b['doanh_thu'] <=> $a['doanh_thu'];
        });
        
        return $ketQua;
    }

    /**
     * Phân tích chi tiết các đồ ăn của rạp
     */
    private function phanTichDoAn($idRap, $tuNgayQuery, $denNgayQuery, $tuNgayKyTruocQuery, $denNgayKyTruocQuery) {
        // Lấy danh sách sản phẩm của rạp
        $danhSachSanPhamIds = SanPham::where('id_rapphim', $idRap)
            ->where('trang_thai', 1) // Chỉ lấy sản phẩm đang bán
            ->pluck('id')
            ->toArray();
        
        // Lấy doanh thu từng sản phẩm trong kỳ hiện tại
        $doanhThuSanPhamCollection = ChiTietDonHang::selectRaw('
                chitiet_donhang.sanpham_id,
                SUM(chitiet_donhang.thanh_tien) as doanh_thu,
                SUM(chitiet_donhang.so_luong) as so_luot
            ')
            ->join('donhang', 'chitiet_donhang.donhang_id', '=', 'donhang.id')
            ->join('suatchieu', 'donhang.suat_chieu_id', '=', 'suatchieu.id')
            ->join('phongchieu', 'suatchieu.id_phongchieu', '=', 'phongchieu.id')
            ->where('phongchieu.id_rapphim', $idRap)
            ->where('donhang.trang_thai', 2) // Đơn hàng đã thanh toán
            ->whereBetween('donhang.ngay_dat', [$tuNgayQuery, $denNgayQuery])
            ->whereIn('chitiet_donhang.sanpham_id', $danhSachSanPhamIds)
            ->groupBy('chitiet_donhang.sanpham_id')
            ->get();
        
        // Chuyển đổi thành mảng
        $doanhThuSanPham = [];
        $soLuotSanPham = [];
        foreach ($doanhThuSanPhamCollection as $item) {
            $doanhThuSanPham[$item->sanpham_id] = $item->doanh_thu;
            $soLuotSanPham[$item->sanpham_id] = $item->so_luot;
        }
        
        // Lấy doanh thu từng sản phẩm trong kỳ trước
        $doanhThuSanPhamKyTruocCollection = ChiTietDonHang::selectRaw('
                chitiet_donhang.sanpham_id,
                SUM(chitiet_donhang.thanh_tien) as doanh_thu
            ')
            ->join('donhang', 'chitiet_donhang.donhang_id', '=', 'donhang.id')
            ->join('suatchieu', 'donhang.suat_chieu_id', '=', 'suatchieu.id')
            ->join('phongchieu', 'suatchieu.id_phongchieu', '=', 'phongchieu.id')
            ->where('phongchieu.id_rapphim', $idRap)
            ->where('donhang.trang_thai', 2) // Đơn hàng đã thanh toán
            ->whereBetween('donhang.ngay_dat', [$tuNgayKyTruocQuery, $denNgayKyTruocQuery])
            ->whereIn('chitiet_donhang.sanpham_id', $danhSachSanPhamIds)
            ->groupBy('chitiet_donhang.sanpham_id')
            ->get();
        
        // Chuyển đổi thành mảng
        $doanhThuSanPhamKyTruoc = [];
        foreach ($doanhThuSanPhamKyTruocCollection as $item) {
            $doanhThuSanPhamKyTruoc[$item->sanpham_id] = $item->doanh_thu;
        }
        
        // Lấy tổng doanh thu sản phẩm để tính tỷ lệ đóng góp
        $tongDoanhThuSanPham = array_sum($doanhThuSanPham);
        
        // Lấy thông tin chi tiết của tất cả sản phẩm
        $thongTinSanPhamCollection = SanPham::whereIn('id', $danhSachSanPhamIds)
            ->with(['danhMuc'])
            ->get();
        
        // Tạo kết quả phân tích sản phẩm
        $ketQua = [];
        foreach ($thongTinSanPhamCollection as $sanPham) {
            $sanPhamId = $sanPham->id;
            $doanhThu = isset($doanhThuSanPham[$sanPhamId]) ? $doanhThuSanPham[$sanPhamId] : 0;
            $soLuot = isset($soLuotSanPham[$sanPhamId]) ? $soLuotSanPham[$sanPhamId] : 0;
            $doanhThuKyTruoc = isset($doanhThuSanPhamKyTruoc[$sanPhamId]) ? $doanhThuSanPhamKyTruoc[$sanPhamId] : 0;
            
            // Tính tỷ lệ đóng góp
            $tyLeDongGop = $tongDoanhThuSanPham > 0 ? round(($doanhThu / $tongDoanhThuSanPham) * 100, 1) : 0;
            
            // Tính tỷ lệ thay đổi so với kỳ trước
            $tyLeThayDoi = 0;
            $isIncreased = true;
            if ($doanhThuKyTruoc > 0) {
                $tyLeThayDoi = round((($doanhThu - $doanhThuKyTruoc) / $doanhThuKyTruoc) * 100, 1);
                $isIncreased = $tyLeThayDoi >= 0;
            }
            
            // Tên hiển thị với kích thước
            $tenHienThi = $sanPham->ten;
            if ($sanPham->danhMuc && ($sanPham->danhMuc->ten == 'Đồ uống' || $sanPham->danhMuc->ten == 'Nước')) {
                $tenHienThi .= ' (lớn)';
            }
            
            $ketQua[] = [
                'id' => $sanPhamId,
                'ten_san_pham' => $tenHienThi,
                'doanh_thu' => $doanhThu,
                'doanh_thu_formatted' => number_format($doanhThu, 0, ',', '.') . ' đ',
                'so_luot' => $soLuot,
                'ty_le_dong_gop' => $tyLeDongGop,
                'ty_le_dong_gop_formatted' => $tyLeDongGop . '%',
                'so_voi_ky_truoc' => [
                    'ty_le' => abs($tyLeThayDoi),
                    'ty_le_formatted' => abs($tyLeThayDoi) . '%',
                    'tang' => $isIncreased
                ]
            ];
        }
        
        // Sắp xếp theo doanh thu giảm dần
        usort($ketQua, function($a, $b) {
            return $b['doanh_thu'] <=> $a['doanh_thu'];
        });
        
        return $ketQua;
    }

    /**
     * Phân tích chi tiết các suất chiếu theo khung giờ
     */
    private function phanTichSuatChieu($idRap, $tuNgayQuery, $denNgayQuery, $tuNgayKyTruocQuery, $denNgayKyTruocQuery) {
        // Định nghĩa các khung giờ từ 8:00 đến 24:00
        $khungGio = [
            ['batDau' => '08:00:00', 'ketThuc' => '10:00:00', 'label' => '8:00 - 10:00'],
            ['batDau' => '10:00:00', 'ketThuc' => '12:00:00', 'label' => '10:00 - 12:00'],
            ['batDau' => '12:00:00', 'ketThuc' => '14:00:00', 'label' => '12:00 - 14:00'],
            ['batDau' => '14:00:00', 'ketThuc' => '16:00:00', 'label' => '14:00 - 16:00'],
            ['batDau' => '16:00:00', 'ketThuc' => '18:00:00', 'label' => '16:00 - 18:00'],
            ['batDau' => '18:00:00', 'ketThuc' => '20:00:00', 'label' => '18:00 - 20:00'],
            ['batDau' => '20:00:00', 'ketThuc' => '22:00:00', 'label' => '20:00 - 22:00'],
            ['batDau' => '22:00:00', 'ketThuc' => '24:00:00', 'label' => '22:00 - 24:00']
        ];
        
        $ketQua = [];
        
        // Lấy ra dữ liệu cho từng khung giờ trong kỳ hiện tại
        foreach ($khungGio as $kg) {
            $batDauGio = $kg['batDau'];
            $ketThucGio = $kg['ketThuc'];
            
            // Dữ liệu suất chiếu trong kỳ hiện tại
            $thongKeHienTai = $this->thongKeSuatChieuTheoKhungGio(
                $idRap, $tuNgayQuery, $denNgayQuery, $batDauGio, $ketThucGio
            );
            
            // Dữ liệu suất chiếu trong kỳ trước
            $thongKeKyTruoc = $this->thongKeSuatChieuTheoKhungGio(
                $idRap, $tuNgayKyTruocQuery, $denNgayKyTruocQuery, $batDauGio, $ketThucGio
            );
            
            // Tính tỷ lệ thay đổi
            $tyLeThayDoi = 0;
            $isIncreased = true;
            if ($thongKeKyTruoc['doanh_thu'] > 0) {
                $tyLeThayDoi = round((($thongKeHienTai['doanh_thu'] - $thongKeKyTruoc['doanh_thu']) / $thongKeKyTruoc['doanh_thu']) * 100, 1);
                $isIncreased = $tyLeThayDoi >= 0;
            }
            
            $ketQua[] = [
                'khung_gio' => $kg['label'],
                'doanh_thu' => $thongKeHienTai['doanh_thu'],
                'doanh_thu_formatted' => number_format($thongKeHienTai['doanh_thu'], 0, ',', '.') . ' đ',
                'ty_le_lap_day' => $thongKeHienTai['ty_le_lap_day'],
                'ty_le_lap_day_formatted' => $thongKeHienTai['ty_le_lap_day'] . '%',
                'ty_le_dong_gop' => $thongKeHienTai['ty_le_dong_gop'],
                'ty_le_dong_gop_formatted' => $thongKeHienTai['ty_le_dong_gop'] . '%',
                'so_voi_ky_truoc' => [
                    'ty_le' => abs($tyLeThayDoi),
                    'ty_le_formatted' => abs($tyLeThayDoi) . '%',
                    'tang' => $isIncreased
                ]
            ];
        }
        
        return $ketQua;
    }

    /**
     * Thống kê suất chiếu theo khung giờ
     */
    private function thongKeSuatChieuTheoKhungGio($idRap, $tuNgay, $denNgay, $batDauGio, $ketThucGio) {
        // Lấy danh sách suất chiếu trong khung giờ và khoảng thời gian
        $suatChieuCollection = SuatChieu::whereHas('phongChieu', function($query) use ($idRap) {
                $query->where('id_rapphim', $idRap);
            })
            ->where('tinh_trang', 1) // Đã duyệt
            ->whereBetween('batdau', [$tuNgay, $denNgay])
            ->whereRaw("TIME(batdau) >= ?", [$batDauGio])
            ->whereRaw("TIME(batdau) < ?", [$ketThucGio])
            ->get();
        
        // Khởi tạo các biến thống kê
        $soLuongSuatChieu = $suatChieuCollection->count();
        $tongSoGhe = 0;
        $tongSoVeDaBan = 0;
        $tongDoanhThuVe = 0;
        $tongDoanhThuSanPham = 0;
        
        // Nếu không có suất chiếu nào trong khung giờ này
        if ($soLuongSuatChieu == 0) {
            return [
                'doanh_thu' => 0,
                'ty_le_lap_day' => 0,
                'ty_le_dong_gop' => 0
            ];
        }
        
        // Duyệt qua từng suất chiếu để tính số ghế và doanh thu
        foreach ($suatChieuCollection as $suatChieu) {
            $idSuatChieu = $suatChieu->id;
            $soGhePhong = $suatChieu->phongChieu->so_luong_ghe;
            $tongSoGhe += $soGhePhong;
            
            // Đếm số vé đã bán cho suất chiếu này
            $soVeDaBan = Ve::where('suat_chieu_id', $idSuatChieu)
                ->where('trang_thai', 2) // Vé đã đặt
                ->count();
            $tongSoVeDaBan += $soVeDaBan;
            
            // Tính doanh thu vé của suất chiếu này
            $doanhThuVeSuatChieu = Ve::where('suat_chieu_id', $idSuatChieu)
                ->where('trang_thai', 2) // Vé đã đặt
                ->sum('gia_ve');
            $tongDoanhThuVe += $doanhThuVeSuatChieu;
            
            // Tính doanh thu sản phẩm từ các đơn hàng của suất chiếu này
            $doanhThuSanPhamSuatChieu = ChiTietDonHang::whereHas('donHang', function($query) use ($idSuatChieu) {
                    $query->where('suat_chieu_id', $idSuatChieu)
                        ->where('trang_thai', 2); // Đơn hàng đã thanh toán
                })
                ->sum('thanh_tien');
            $tongDoanhThuSanPham += $doanhThuSanPhamSuatChieu;
        }
        
        // Tính tỷ lệ lấp đầy ghế
        $tyLeLapDay = $tongSoGhe > 0 ? round(($tongSoVeDaBan / $tongSoGhe) * 100) : 0;
        
        // Tính tổng doanh thu
        $tongDoanhThu = $tongDoanhThuVe + $tongDoanhThuSanPham;
        
        // Tính tỷ lệ đóng góp (sẽ được cập nhật sau khi có tổng doanh thu)
        $tyLeDongGop = 0; // Cần tính tổng doanh thu của tất cả khung giờ
        
        return [
            'doanh_thu' => $tongDoanhThu,
            'ty_le_lap_day' => $tyLeLapDay,
            'ty_le_dong_gop' => $tyLeDongGop, // Sẽ cập nhật sau
            'so_luong_suat_chieu' => $soLuongSuatChieu,
            'so_ve_ban' => $tongSoVeDaBan,
            'tong_so_ghe' => $tongSoGhe
        ];
    }
    }
    
?>