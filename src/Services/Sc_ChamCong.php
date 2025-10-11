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
       $fileHinhAnh = $_FILES['image'] ?? null;
        $idNhanVien = $_SESSION['UserInternal']['ID'] ?? null;
        $url = $this->pythonApiUrl . "/api/face/dang-ky";

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

        if (!$result['success']) {
            throw new Exception('Phản hồi không hợp lệ');
        }
        else{
            $dangKyKhuonMat = DangKyKhuonMat::where('id_nhanvien', $idNhanVien)->first();
            if($dangKyKhuonMat){
                $dangKyKhuonMat->update([
                    'ngay_dang_ky' => date('Y-m-d H:i:s'),
                    'so_anh_dang_ky' => $dangKyKhuonMat->so_anh_dang_ky + 1
                ]);
            }
            else{
                $result = DangKyKhuonMat::create([
                    'id_nhanvien' => $idNhanVien,
                    'ngay_dang_ky' => date('Y-m-d H:i:s'),
                    'so_anh_dang_ky' => 1,
                    'trang_thai' => 'Đang hoạt động',
                    'ghi_chu' => 'Đăng ký qua hệ thống nhận diện khuôn mặt'
                ]);
                if(!$result){
                    throw new Exception('Lỗi lưu thông tin đăng ký khuôn mặt');
                }
            }
        }
    }
    public function chamCongKhuonMat(){
        $data = json_decode(file_get_contents('php://input'), true);
        $imageBase64 = $data['image'] ?? null;
        $idNhanVien = $_SESSION['UserInternal']['ID'] ?? null;
        $loai = $data['loai'] ?? null;
        $url = $this->pythonApiUrl . "/api/face/cham-cong";
        if (!$imageBase64 || !$idNhanVien || !$loai) {
            throw new Exception('Thiếu dữ liệu gửi đi');
        }
        if (!$imageBase64) {
            throw new Exception('Không có dữ liệu ảnh');
        }

        // Nếu ảnh có tiền tố "data:image/jpeg;base64,..."
        if (strpos($imageBase64, ',') !== false) {
            $imageBase64 = explode(',', $imageBase64)[1];
        }

        // Giải mã base64
        $imageData = base64_decode($imageBase64);
        if ($imageData === false) {
            throw new Exception('Ảnh base64 không hợp lệ');
        }

        // Tạo file tạm
        $tempFile = tempnam(sys_get_temp_dir(), 'face_') . '.jpg';
        file_put_contents($tempFile, $imageData);

        // Kiểm tra lại
        if (!file_exists($tempFile)) {
            throw new Exception('Không thể tạo file tạm');
        }

        $postFields = [
            'staff_id' => $idNhanVien,
            'image' => new \CURLFile(
                $tempFile,
                'image/jpeg',
                basename($tempFile)
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
                        'gio_vao' => date('H:i:s')
                    ]);
                }
                else if($loai == 'checkout'){
                    $daChamCong->update([
                        'gio_ra' => date('H:i:s')
                    ]);
                }
            }
            else{
                $dataInsert = [
                    'id_nhanvien' => $idNhanVien,
                    'ngay' => $ngayHienTai
                ];
                if($loai == 'checkin'){
                    $dataInsert['gio_vao'] = date('H:i:s');
                }
                else if($loai == 'checkout'){
                    $dataInsert['gio_ra'] = date('H:i:s');
                }
            }
            $nhanVien = NguoiDungInternal::find($idNhanVien);
            return $nhanVien;
        }
    }
}