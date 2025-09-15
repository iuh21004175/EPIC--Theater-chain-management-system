<?php
    namespace App\Services;
    use App\Models\DanhMuc;
    use App\Models\SanPham;
    use function App\Core\getS3Client;
use Exception;

    class Sc_SanPham {
        // Properties and methods for the Sc_SanPham class
        public function themDanhMuc(){
            $ten = $_POST['ten'];
            return DanhMuc::create(['ten' => $ten]);
        }
        public function docDanhMuc(){
            return DanhMuc::all();
        }
        public function suaDanhMuc($id){
            $data = json_decode(file_get_contents('php://input'), true);
            $ten = $data['ten'];
            $danhMuc = DanhMuc::find($id);
            if($danhMuc){
                $danhMuc->ten = $ten;
                return $danhMuc->save();
            }
            return false;
        }
        public function themSanPham(){
            $ten = $_POST['ten'];
            $mo_ta = $_POST['mo_ta'];
            $gia = $_POST['gia'];
            $hinh_anh = $_FILES['hinh_anh']['name'];
            $danh_muc_id = $_POST['danh_muc_id'];
            $sanPham = null;
            $bucket = 'san-pham';
            try {
                $sanPham = SanPham::create([
                    'ten' => $ten,
                    'mo_ta' => $mo_ta,
                    'gia' => $gia,
                    'danh_muc_id' => $danh_muc_id
                ]);
                if ($hinh_anh) {
                    $fileName = $sanPham->ten . '_' . time() . '.' . pathinfo($hinh_anh, PATHINFO_EXTENSION);
                    getS3Client()->putObject([
                        'Bucket' => $bucket,
                        'Key'    => $fileName,
                        'SourceFile' => $_FILES['hinh_anh']['tmp_name']
                    ]);
                    $sanPham->hinh_anh = $fileName;
                    $sanPham->save();
                }
                return $sanPham;
            }
            catch (\Exception $e) {
                if ($sanPham) {
                    $sanPham->delete();
                }
                throw new Exception($e);
            }
        }

        public function docSanPhamTheoRap($idRap) {
            $sanPham = SanPham::where('id_rapphim', $idRap)
                            ->where('trang_thai', 1) 
                            ->get();
            return $sanPham;
        }
    }
?>