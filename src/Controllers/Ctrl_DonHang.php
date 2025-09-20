<?php
namespace App\Controllers;
use function App\Core\view;
use App\Services\Sc_DonHang;
require __DIR__ . '/../../api/PHPMailer/src/Exception.php';
require __DIR__ . '/../../api/PHPMailer/src/PHPMailer.php';
require __DIR__ . '/../../api/PHPMailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class Ctrl_DonHang {
    public function index() {
        return view('customer.ve-cua-toi');
    }
    public function themDonHang() {
        header('Content-Type: application/json'); 
        $service = new Sc_DonHang();
        try {
            $donhang = $service->them();
            if ($donhang) {
                echo json_encode([
                    'success' => true, 
                    'message' => 'Thêm đơn hàng thành công',
                    'data' => $donhang
                ]);
                exit;
            }
            echo json_encode([
                'success' => false, 
                'message' => 'Thêm đơn hàng thất bại'
            ]);
            exit;
        } catch (\Exception $e) {
            echo json_encode([
                'success' => false, 
                'message' => 'Lỗi: ' . $e->getMessage()
            ]);
            exit;
        }
    }
    public function docDonHang() {
        $service = new Sc_DonHang();
        try {
            $donhang = $service->doc();
            if ($donhang) {
                echo json_encode([
                    'success' => true, 
                    'message' => 'Lấy đơn hàng thành công',
                    'data' => $donhang
                ]);
                exit;
            }
            echo json_encode([
                'success' => false, 
                'message' => 'Không tìm thấy đơn hàng'
            ]);
            exit;
        } catch (\Exception $e) {
            echo json_encode([
                'success' => false, 
                'message' => 'Lỗi: ' . $e->getMessage()
            ]);
            exit;
        }
    }


    public function guiDonHang() {
        header('Content-Type: application/json; charset=utf-8');
        ini_set('display_errors', 0);

        $data = json_decode(file_get_contents('php://input'), true);  
        if (!$data) {
            echo json_encode(['success'=>false,'message'=>'Dữ liệu không hợp lệ']);
            exit;
        }

        // Lấy thông tin người dùng từ session
        $user = $_SESSION['user'] ?? null;
        if (!$user) {
            echo json_encode(['success'=>false,'message'=>'Người dùng chưa đăng nhập']);
            exit;
        }

        $email = $user['email'];
        $ten = $user['ho_ten'] ?? 'Khách hàng';

        $don_hang = $data['don_hang'] ?? [];
        $phim = $data['phim'] ?? [];
        $ve = $data['ve'] ?? []; 
        $thuc_an = $data['thuc_an'] ?? [];

        // Danh sách ghế
        $so_ghe_text = '';
        $tong_tien = 0;
        foreach($ve as $v) {
            $so_ghe_text .= ($v['so_ghe'] ?? '') . ', ';
            $tong_tien += $v['gia'] ?? 0;
        }
        $so_ghe_text = rtrim($so_ghe_text, ', ');

        // Danh sách thức ăn kèm
        $thuc_an_text = '';
        foreach($thuc_an as $ta) {
            $thuc_an_text .= ($ta['ten'] ?? '') . ', ';
        }
        $thuc_an_text = $thuc_an ? implode(', ', array_column($thuc_an, 'ten')) : 'Không';

        // Tạo QR code URL từ QuickChart.io
        $ma_ve = $don_hang['ma_ve'];
        $qr_code = 'https://quickchart.io/qr?text=' . urlencode($ma_ve) . '&size=300';

        try {
            $PHPMAILER_KEY = $_ENV['PHPMAILER_KEY'];
            $mail = new PHPMailer(true);
            $mail->SMTPDebug = 0;
            $mail->CharSet = "utf-8";
            $mail->isSMTP();
            $mail->Host       = 'smtp.gmail.com';
            $mail->SMTPAuth   = true;
            $mail->Username   = 'tuandungnguyen800@gmail.com';
            $mail->Password   = $PHPMAILER_KEY;
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = 587;

            $mail->setFrom('tuandungnguyen800@gmail.com', 'EPIC CINEMAS');
            $mail->addAddress($email);
            $mail->isHTML(true);
            $mail->Subject = "Xác nhận đặt vé xem phim thành công - EPIC CINEMAS";

            // Body email
            $mail->Body = '
            <div style="font-family: Arial, sans-serif; background:#f9f9f9; padding:20px;">
                <div style="max-width:600px; margin:0 auto; background:#f5f5f5; border-radius:10px; box-shadow:0 4px 10px rgba(0,0,0,0.1); overflow:hidden;">
                    <div style="text-align:center; margin:10px 20px;">
                        <img src="https://res.cloudinary.com/dtkm5uyx1/image/upload/v1757905773/unnamed_kvd85z.png" 
                        alt="EPIC Cinema Banner" style="width:100%; max-width:100%; border-radius:12px; display:block; margin:0 auto;" />
                    </div>
                    <div style="padding:20px;">
                        <p>Xin chào <b>'.$ten.'</b>,</p>
                        <p>Cảm ơn bạn đã sử dụng dịch vụ của <b>EPIC CINEMAS</b>.</p>
                        <p>Chúng tôi xác nhận bạn đã đặt vé xem phim tại <b>'.($phim['rap'] ?? '').'</b> thành công.</p>

                        <div style="text-align:center; margin:20px auto; padding:20px; border:2px dashed #d32f2f; border-radius:12px; background:#fff7f7; max-width:350px;">
                            <p style="margin:5px 0; font-size:14px; color:#555;">Vui lòng xuất trình mã QR này tại quầy để nhận vé</p>
                            <div style="margin:15px 0;">
                                <img src="'.$qr_code.'" alt="QR Code" width="200" style="border:1px solid #ddd; padding:10px; border-radius:8px; background:#fff;" />
                            </div>
                            <p style="margin:0; font-size:16px; font-weight:bold; letter-spacing:2px; color:#333;">
                                Mã đặt vé: <span style="color:#d32f2f;">'.$ma_ve.'</span>
                            </p>
                        </div>
                        <!-- Thông tin vé -->
                        <h3 style="margin-top:20px; color:#d32f2f; border-bottom:2px solid #d32f2f; padding-bottom:5px;">Thông tin vé</h3>
                        <table cellpadding="0" cellspacing="0" style="width:100%; border-collapse:collapse; font-size:14px; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,0.05);">
                            <tr style="background:#f9f9f9;">
                                <th align="left" style="padding:10px; width:35%; border-bottom:1px solid #eee;">Rạp</th>
                                <td style="padding:10px; border-bottom:1px solid #eee;">
                                    <div style="font-weight:bold; color:#333;">'.($phim['rap'] ?? '').'</div>
                                    <div style="font-size:13px; color:#777;">'.($phim['dia_chi'] ?? '').'</div>
                                </td>
                            </tr>
                            <tr>
                                <th align="left" style="padding:10px; border-bottom:1px solid #eee;">Phim</th>
                                <td style="padding:10px; border-bottom:1px solid #eee;">'.($phim['ten_phim'] ?? '').'</td>
                            </tr>
                            <tr style="background:#f9f9f9;">
                                <th align="left" style="padding:10px; border-bottom:1px solid #eee;">Phòng chiếu</th>
                                <td style="padding:10px; border-bottom:1px solid #eee;">'.($phim['phong'] ?? '').'</td>
                            </tr>
                            <tr>
                                <th align="left" style="padding:10px; border-bottom:1px solid #eee;">Suất chiếu</th>
                                <td style="padding:10px; border-bottom:1px solid #eee;">'.($phim['suat_chieu'] ?? '').'</td>
                            </tr>
                            <tr style="background:#f9f9f9;">
                                <th align="left" style="padding:10px; border-bottom:1px solid #eee;">Số ghế</th>
                                <td style="padding:10px; border-bottom:1px solid #eee;">'.$so_ghe_text.'</td>
                            </tr>
                            <tr>
                                <th align="left" style="padding:10px; border-bottom:1px solid #eee;">Thức ăn kèm</th>
                                <td style="padding:10px; border-bottom:1px solid #eee;">'.$thuc_an_text.'</td>
                            </tr>
                            <tr style="background:#f9f9f9;">
                                <th align="left" style="padding:10px; font-weight:bold; color:#333;">Tổng tiền</th>
                                <td style="padding:10px; font-weight:bold; color:#333;">'.number_format($tong_tien).' VNĐ</td>
                            </tr>
                        </table>

                        <!-- Thông tin người nhận -->
                        <h3 style="margin-top:20px; color:#d32f2f; border-bottom:2px solid #d32f2f; padding-bottom:5px;">Thông tin người nhận</h3>
                        <table cellpadding="0" cellspacing="0" style="width:100%; border-collapse:collapse; font-size:14px; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,0.05);">
                            <tr style="background:#f9f9f9;">
                                <th align="left" style="padding:10px; width:35%; border-bottom:1px solid #eee;">Họ tên</th>
                                <td style="padding:10px; border-bottom:1px solid #eee;">'.$ten.'</td>
                            </tr>
                            <tr>
                                <th align="left" style="padding:10px; border-bottom:1px solid #eee;">Email</th>
                                <td style="padding:10px; border-bottom:1px solid #eee;">'.$email.'</td>
                            </tr>
                        </table>
                    </div>

                    <div style="background:#f2f2f2; text-align:center; padding:10px; font-size:12px; color:#666;">
                        EPIC CINEMAS © 2025 - Đây là email tự động, vui lòng không trả lời.
                    </div>
                </div>
            </div>';

            $mail->send();

            echo json_encode(['success' => true, 'message' => "Đã gửi email về $email"]);

        } catch (\Exception $e) {
            echo json_encode(['success' => false, 'message' => "Không thể gửi mail. Lỗi: {$mail->ErrorInfo}"]);
        }

        exit;
    }
}
