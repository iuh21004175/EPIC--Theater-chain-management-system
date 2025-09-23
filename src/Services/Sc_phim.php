<?php
    namespace App\Services;
    use App\Models\Phim_TheLoai;
    use App\Models\Phim;
    use App\Models\TheLoai;
    use App\Models\PhanPhoiPhim;
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
        private function capNhatSoPhimTheLoai() {
            $theLoai = TheLoai::all();
            foreach ($theLoai as $tl) {
                $soPhim = Phim_TheLoai::where('theloai_id', $tl->id)->count();
                $tl->so_phim = $soPhim;
                $tl->save();
            }
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
                $trailerUrl = $_POST['trailer_url'] ?? '';
                $videoUrl = $_POST['video_url'] ?? '';
                $fileExtension = "";
                $tenTheLoais = [];
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
                    'poster_url' => $bucket.'/'.$keyName,
                    'trailer_url' => $trailerUrl,
                    'video_url' => $videoUrl
                ]);
                if($phim){
                    

                    getS3Client()->putObject([
                        'Bucket' => $bucket,
                        'Key'    => $keyName,
                        'SourceFile' => $_FILES['poster']['tmp_name'],
                    ]);
                    foreach($theLoaiIds as $theLoaiId){
                        $theLoai = $phim->TheLoai()->create([
                            'theloai_id' => $theLoaiId,
                            'phim_id' => $phim->id,
                        ]);
                        $tenTheLoais[] = $theLoai->TheLoai->ten;
                    }
                    $this->capNhatSoPhimTheLoai(); // Cập nhật số phim cho thể loại
                    getRedisConnection()->publish('them-phim', json_encode([
                        'id' => $phim->id,
                        'ten_phim' => $phim->ten_phim,
                        'the_loai' => implode(', ', $tenTheLoais),
                        'dao_dien' => $phim->dao_dien,
                        'dien_vien' => $phim->dien_vien,
                        'thoi_luong' => $phim->thoi_luong,
                        'poster_url' => $phim->poster_url,
                        'trailer_url' => $phim->trailer_url,
                        'ngay_cong_chieu' => $phim->ngay_cong_chieu,
                        'mo_ta' => $phim->mo_ta,
                        'trang_thai' => $phim->trang_thai
                    ]));
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
<<<<<<< Updated upstream
        public function docPhim($page, $tuKhoaTimKiem = null, $trangThai = null, $theLoaiId = null, $idRap = null){
            $query = Phim::with(['TheLoai.TheLoai']);

=======
        public function docPhim($page, $tuKhoaTimKiem = null, $trangThai = null, $theLoaiId = null){
            $query = Phim::with(['TheLoai.TheLoai']); // Đúng tên quan hệ
            
>>>>>>> Stashed changes
            if($tuKhoaTimKiem){
                $query->where(function($q) use ($tuKhoaTimKiem) {
                    $q->where('ten_phim', 'LIKE', "%$tuKhoaTimKiem%")
                      ->orWhere('dao_dien', 'LIKE', "%$tuKhoaTimKiem%")
                      ->orWhere('dien_vien', 'LIKE', "%$tuKhoaTimKiem%");
                });
            }
            if($trangThai !== null && $trangThai !== '') {
                $query->where('trang_thai', $trangThai);
            }
            if($theLoaiId){
                $query->whereHas('TheLoai', function($q) use ($theLoaiId) {
                    $q->where('theloai_id', $theLoaiId);
                });
            }
            if($idRap){
                // Lấy danh sách id_phim đã thuộc rạp này
                $phimIdsDaPhanPhoi = \App\Models\PhanPhoiPhim::where('id_rapphim', $idRap)->pluck('id_phim')->toArray();
                if (!empty($phimIdsDaPhanPhoi)) {
                    $query->whereNotIn('id', $phimIdsDaPhanPhoi);
                }
            }

            $pageSize = 10;
            $total = $query->count();
            $totalPages = ceil($total / $pageSize);
            $phims = $query->orderBy('id', 'desc')
                   ->skip(($page - 1) * $pageSize)
                   ->take($pageSize)
                   ->get();;
            return [
                'data' => $phims,
                'total' => $total,
                'total_pages' => $totalPages,
                'current_page' => $page
            ];
        }
        public function themPhanPhoiPhim(){
            $data = json_decode(file_get_contents('php://input'), true);
            $idRap = $data['id_rap'] ?? null;
            $phimId = $data['phim_id'] ?? [];
            $phim = PhanPhoiPhim::create([
                'id_phim' => $phimId,
                'id_rapphim' => $idRap,
            ]);
            if(!$phim){
                throw new \Exception('Lỗi khi thêm phân phối phim');
            }
        }
        public function xoaPhanPhoiPhim(){
            $data = json_decode(file_get_contents('php://input'), true);
            $idRap = $data['id_rap'] ?? null;
            $phimId = $data['phim_id'] ?? [];
            PhanPhoiPhim::where('id_rapphim', $idRap)
                        ->where('id_phim', $phimId)
                        ->delete();
        }
        public function docPhimKH($tuKhoaTimKiem = null, $theLoaiId = null)
        {
            $query = Phim::with(['TheLoai.TheLoai']); // load quan hệ

            $query->where('trang_thai', 1);
            // tìm kiếm theo từ khóa
            if ($tuKhoaTimKiem) {
                $query->where(function ($q) use ($tuKhoaTimKiem) {
                    $q->where('ten_phim', 'LIKE', "%$tuKhoaTimKiem%")
                    ->orWhere('dao_dien', 'LIKE', "%$tuKhoaTimKiem%")
                    ->orWhere('dien_vien', 'LIKE', "%$tuKhoaTimKiem%");
                });
            }

            // lọc theo thể loại
            if ($theLoaiId) {
                $query->whereHas('TheLoai', function ($q) use ($theLoaiId) {
                    $q->where('theloai_id', $theLoaiId);
                });
            }

            $phims = $query->orderBy('id', 'desc')->get();

            return [
                'data' => $phims
            ];
        }

        public function docPhimKHOnline($tuKhoaTimKiem = null, $theLoaiId = null)
        {
            $query = Phim::with(['TheLoai.TheLoai']); // load quan hệ

            // chỉ lấy phim có url_video
            $query->whereNotNull('video_url')->where('video_url', '!=', '');

            // tìm kiếm theo từ khóa
            if ($tuKhoaTimKiem) {
                $query->where(function ($q) use ($tuKhoaTimKiem) {
                    $q->where('ten_phim', 'LIKE', "%$tuKhoaTimKiem%")
                    ->orWhere('dao_dien', 'LIKE', "%$tuKhoaTimKiem%")
                    ->orWhere('dien_vien', 'LIKE', "%$tuKhoaTimKiem%");
                });
            }

            // lọc theo thể loại
            if ($theLoaiId) {
                $query->whereHas('TheLoai', function ($q) use ($theLoaiId) {
                    $q->where('theloai_id', $theLoaiId);
                });
            }

            $phims = $query->orderBy('id', 'desc')->get();

            return [
                'data' => $phims
            ];
        }

        public function docPhimMoiNhat() {
            $phims = Phim::with(['TheLoai.TheLoai'])
                        ->where('trang_thai', 1)
                        ->orderBy('id', 'desc') 
                        ->take(4) // lấy 4 phim
                        ->get();

            return [
                'data' => $phims
            ];
        }
        public function docChiTietPhim($id)
        {
            $phim = Phim::with(['TheLoai.TheLoai'])->find($id);
            if (!$phim) {
                throw new \Exception('Phim không tồn tại');
            }
            return [
                'data' => $phim
            ];
        }
        public function suaPhim($id){
           
            $bucket = "poster";
            $phimCu = null;
            $phim = null;
            try{
                $phim = Phim::with('TheLoai')->find($id);
                if(!$phim){
                    throw new \Exception('Phim không tồn tại');
                }
                $phimCu = $phim;
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
                $trailerUrl = $_POST['trailer_url'] ?? '';
                $videoUrl = $_POST['video_url'] ?? '';
                $fileExtension = "";
                if ($hinhAnh && isset($hinhAnh['name'])) {
                    $fileExtension = pathinfo($hinhAnh['name'], PATHINFO_EXTENSION);
                }
                $keyName = $ten . '_' . time() . '.' . $fileExtension;
                $phim->update([
                    'ten_phim' => $ten,
                    'mo_ta' => $moTa,
                    'ngay_cong_chieu' => $ngayCongChieu,
                    'trang_thai' => $trangThai,
                    'dao_dien' => $daoDien,
                    'dien_vien' => $dienVien,
                    'thoi_luong' => $thoiLuong,
                    'do_tuoi' => $doTuoi,
                    'quoc_gia' => $quocGia,
                    'poster_url' => empty($fileExtension) ? $phimCu->poster_url : $bucket.'/'.$keyName,
                    'trailer_url' => $trailerUrl,
                    'video_url' => $videoUrl
                ]);
                if($phim){
                    if($hinhAnh && isset($hinhAnh['tmp_name'])){
                        getS3Client()->putObject([
                            'Bucket' => $bucket,
                            'Key'    => $keyName,
                            'SourceFile' => $_FILES['poster']['tmp_name'],
                        ]);

                        getS3Client()->deleteObject([
                            'Bucket' => $bucket,
                            'Key'    => $phimCu->poster_url,
                        ]);
                    }
                    Phim_TheLoai::where('phim_id', $phimCu->id)->delete();
                    foreach($theLoaiIds as $theLoaiId){
                        $phim->TheLoai()->create([
                            'theloai_id' => $theLoaiId,
                            'phim_id' => $phim->id,
                        ]);
                    }
                    $this->capNhatSoPhimTheLoai(); // Cập nhật số phim cho thể loại
                    return true;
                }
                return false;
            }
            catch(\Exception $e){
                if($phimCu){
                    $phim = $phimCu;
                    $phim->save();
                }
                throw new \Exception('Lỗi khi thêm phim: ' . $e->getMessage());
            }
        }
        public function phanPhoi($idRap){
            $phimIds = $_POST['phim_ids'] ?? [];
            // Xóa phân phối cũ
            PhanPhoiPhim::where('id_rapphim', $idRap)->delete();
            // Thêm phân phối mới
            foreach ($phimIds as $phimId) {
                PhanPhoiPhim::create([
                    'id_rapphim' => $idRap,
                    'id_phim' => $phimId
                ]);
            }
        }
        public function docPhimTheoRap($idRap){
            $phimIds = PhanPhoiPhim::where('id_rapphim', $idRap)->pluck('id_phim')->toArray();
            $phims = Phim::with(['TheLoai.TheLoai'])->whereIn('id', $phimIds)->get();
            return $phims;
        }
    }
?>