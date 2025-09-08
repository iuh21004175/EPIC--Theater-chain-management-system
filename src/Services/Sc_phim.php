<?php
    namespace App\Services;
    use App\Models\Phim_TheLoai;
    use App\Models\Phim;
    use App\Models\TheLoai;
    use function App\Core\getS3Client;
    class Sc_Phim {
        public function themTheLoai(){
            $ten = $_POST['ten'] ?? '';
            $theLoai = TheLoai::create([
                'ten' => $ten,
            ]);
            if($theLoai){
                return true;
            }
            return false;
        }
        public function docTheLoai(){
            return TheLoai::all();
        }
        public function suaTheLoai($id){
            $data = file_get_contents('php://input');
            $data = json_decode($data, true);
            $ten = $data['ten'] ?? '';
            $theLoai = TheLoai::find($id);
            if($theLoai){
                $theLoai->ten = $ten;
                $theLoai->save();
                return true;
            }
            return false;
        }
        public function suaTheLoaiPhim($idPhim){
            $data = file_get_contents('php://input');
            $data = json_decode($data, true);
            $theLoai = TheLoai::find($idPhim);
            if($theLoai){
                $theLoai->ten = $data['ten'] ?? '';
                $theLoai->save();
                return true;
            }
            return false;
        }
        public function themPhim(){
            $phim = null;
            $bucket = "poster";

            try{
                $ten = $_POST['ten'] ?? '';
                $daoDien = $_POST['dao_dien'] ?? '';
                $dienVien = $_POST['dien_vien'] ?? '';
                $thoiLuong = $_POST['thoi_luong'] ?? '';
                $doTuoi = $_POST['do_tuoi'] ?? '';
                $quocGia = $_POST['quoc_gia'] ?? '';

                $moTa = $_POST['mo_ta'] ?? '';
                $ngayCongChieu = $_POST['ngay_cong_chieu'] ?? '';
                $trangThai = $_POST['trang_thai'] ?? '';
                $theLoaiIds = $_POST['the_loai_ids'] ?? [];
                $hinhAnh = $_FILES['poster'] ?? null;
                $fileExtension = "";
                if ($hinhAnh && isset($hinhAnh['name'])) {
                    $fileExtension = pathinfo($hinhAnh['name'], PATHINFO_EXTENSION);
                }
                $keyName = $ten . '_' . time() . '.' . $fileExtension;
                $phim = Phim::create([
                    'ten_phim' => $ten,
                    'mo_ta' => $moTa,
                    'ngay_cong_chieu' => $ngayCongChieu,
                    'trang_thai' => $trangThai,
                    'dao_dien' => $daoDien,
                    'dien_vien' => $dienVien,
                    'thoi_luong' => $thoiLuong,
                    'do_tuoi' => $doTuoi,
                    'quoc_gia' => $quocGia,
                    'poster_url' => $keyName,
                    'trang_thai' => $trangThai,
                ]);
                if($phim){
                    getS3Client()->putObject([
                        'Bucket' => $bucket,
                        'Key'    => $keyName,
                        'SourceFile' => $_FILES['poster']['tmp_name'],
                    ]);
                    foreach($theLoaiIds as $theLoaiId){
                        $phim->TheLoai()->create([
                            'theloai_id' => $theLoaiId,
                            'phim_id' => $phim->id,
                        ]);
                    }
                    return true;
                }
                return false;
            }
            catch(\Exception $e){
                if($phim){
                    $phim->delete();
                }
                throw new \Exception('Lỗi khi thêm phim: ' . $e->getMessage());
            }
        }
    }
?>