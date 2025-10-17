<?php
namespace App\Services;

use App\Models\PhanCong;
use App\Models\DangKyKhuonMat;
use App\Models\NguoiDungInternal;
use Exception;

class Sc_ChamCong
{
    private $pythonApiUrl;

    public function __construct()
    {
        // URL của Python API (Flask)
        $this->pythonApiUrl = $_ENV['PYTHON_API_URL'] ?? 'http://localhost:5000';
    }

    /**
     * Kiểm tra trạng thái đăng ký khuôn mặt
     */
    public function kiemTraDangKy()
    {
        $idNhanVien = $_SESSION['UserInternal']['ID'] ?? null;
        if (!$idNhanVien) {
            throw new Exception('Không xác định được nhân viên');
        }

        $dangKy = DangKyKhuonMat::where('id_nhanvien', $idNhanVien)
            ->where('trang_thai', 'Đang hoạt động')
            ->latest()
            ->first();

        if (!$dangKy) {
            throw new Exception('Chưa đăng ký khuôn mặt');
        }
        return $dangKy;
    }
    public function lichSuChamCong(){
        $idNhanVien = $_SESSION['UserInternal']['ID'] ?? null;
        if (!$idNhanVien) {
            throw new Exception('Không xác định được nhân viên');
        }

        // Tính ngày bắt đầu và kết thúc
        $ngayKetThuc = date('Y-m-d'); // hôm nay
        $ngayBatDau = date('Y-m-d', strtotime('-7 days')); // 7 ngày trước

        // Lấy dữ liệu chấm công trong khoảng 7 ngày
        $lichSu = PhanCong::where('id_nhanvien', $idNhanVien)
            ->whereBetween('ngay', [$ngayBatDau, $ngayKetThuc])
            ->orderBy('ngay', 'desc')
            ->get();

        return $lichSu;
    }
    /**
     * Gọi Python API
     */
    public function dangKyKhuonMat()
    {
        $idNhanVien = $_SESSION['UserInternal']['ID'] ?? null;
        $url = $this->pythonApiUrl . "/api/face/dang-ky";

        if (!$idNhanVien) {
            throw new Exception('Thiếu id nhân viên');
        }

        // Collect uploaded files: support multiple inputs name="images[]" or single name="image"
        $files = [];
        if (isset($_FILES['images'])) {
            $images = $_FILES['images'];
            $count = is_array($images['name']) ? count($images['name']) : 0;
            for ($i = 0; $i < $count; $i++) {
                if (($images['error'][$i] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_OK) {
                    $tmp  = $images['tmp_name'][$i];
                    $type = $images['type'][$i] ?? 'image/jpeg';
                    $name = $images['name'][$i] ?? "image_{$i}.jpg";
                    $files[] = new \CURLFile($tmp, $type, $name);
                }
            }
        } elseif (isset($_FILES['image']) && ($_FILES['image']['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_OK) {
            $f = $_FILES['image'];
            $files[] = new \CURLFile($f['tmp_name'], $f['type'] ?? 'image/jpeg', $f['name'] ?? 'image.jpg');
        }

        if (empty($files)) {
            throw new Exception('Không có file ảnh được tải lên');
        }

        // Build multipart POST fields
        $postFields = [
            'staff_id' => $idNhanVien
        ];

        foreach ($files as $i => $file) {
            $postFields["images[$i]"] = $file;
        }
        // Send to Python API
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
        curl_setopt($ch, CURLOPT_TIMEOUT, 60);
        $response = curl_exec($ch);
        $error = curl_error($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($error) {
            throw new Exception('Lỗi CURL: ' . $error);
        }

        $result = json_decode($response, true);
        if (!$result || empty($result['success'])) {
            // include server body for easier debugging
            throw new Exception('Phản hồi không hợp lệ từ Python API. HTTP ' . $httpCode . ' — ' . substr($response ?? '', 0, 200));
        }

        // Update DB: tăng số ảnh đã đăng ký bằng số file đã upload
        $uploadedCount = count($files);

        $dangKyKhuonMat = DangKyKhuonMat::where('id_nhanvien', $idNhanVien)->first();
        if ($dangKyKhuonMat) {
            $dangKyKhuonMat->update([
                'ngay_dang_ky' => date('Y-m-d H:i:s'),
                'so_anh_dang_ky' => ($dangKyKhuonMat->so_anh_dang_ky ?? 0) + $uploadedCount
            ]);
        } else {
            $created = DangKyKhuonMat::create([
                'id_nhanvien' => $idNhanVien,
                'ngay_dang_ky' => date('Y-m-d H:i:s'),
                'so_anh_dang_ky' => $uploadedCount,
                'trang_thai' => 'Đang hoạt động',
                'ghi_chu' => 'Đăng ký qua hệ thống nhận diện khuôn mặt'
            ]);
            if (!$created) {
                throw new Exception('Lỗi lưu thông tin đăng ký khuôn mặt');
            }
        }
    }
    public function chamCongKhuonMat(){
        $fileHinhAnh = $_FILES['image'] ?? null;
        $idNhanVien = $_SESSION['UserInternal']['ID'] ?? null;
        $url = $this->pythonApiUrl . "/api/face/cham-cong";
        $loai = $_POST['loai']; // 'checkin' hoặc 'checkout'
        if (!$fileHinhAnh || !$idNhanVien) {
            throw new Exception('Thiếu dữ liệu gửi đi');
        }

        // Tạo dữ liệu multipart/form-data
        $postFields = [
            'staff_id' => $idNhanVien,
            'image' => new \CURLFile(
                $fileHinhAnh['tmp_name'],
                $fileHinhAnh['type'],
                $fileHinhAnh['name']
            )
        ];
        // Khởi tạo CURL
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);

        // Gửi yêu cầu
        $response = curl_exec($ch);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            throw new Exception('Lỗi CURL: ' . $error);
        }

        // Giải mã phản hồi JSON từ Python API (nếu có)
        $result = json_decode($response, true);
        if(!$result['success']){
            throw new Exception('Nhận diện khuôn mặt không thành công');
        }
        else{
            // Lưu vào bảng PhanCong
            $ngayHienTai = date('Y-m-d');
            $daChamCong = PhanCong::where('id_nhanvien', $idNhanVien)
                ->where('ngay', $ngayHienTai)
                ->first();
            if($daChamCong){
                if($loai == 'checkin'){
                    $daChamCong->update([
                        'gio_vao' => date('Y-m-d H:i:s')
                    ]);
                }
                else if($loai == 'checkout'){
                    $daChamCong->update([
                        'gio_ra' => date('Y-m-d H:i:s')
                    ]);
                }
            }
            else{
                $dataInsert = [
                    'id_nhanvien' => $idNhanVien,
                    'ngay' => $ngayHienTai
                ];
                if($loai == 'checkin'){
                    $dataInsert['gio_vao'] = date('Y-m-d H:i:s');
                }
                else if($loai == 'checkout'){
                    $dataInsert['gio_ra'] = date('Y-m-d H:i:s');
                }
            }

            $nhanVien = NguoiDungInternal::find($idNhanVien);
            return $nhanVien;
        }
    }
}