<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DonHang extends Model
{
    protected $table = 'donhang';
    protected $primaryKey = 'id';
    public $timestamps = false; // Nếu muốn dùng created_at, updated_at thì để true

    protected $fillable = [
        'id',
        'user_id',
        'suat_chieu_id',
        'thequatang_id',
        'the_qua_tang_su_dung',
        'ma_ve',
        'qr_code',
        'tong_tien',
        'phuong_thuc_thanh_toan',
        'trang_thai', //2: Đã thanh toán, 1: Chờ thanh toán 0: Đã hủy
        'ngay_dat',
    ];

    public function user()
    {
        return $this->belongsTo(KhachHang::class, 'user_id', 'id');
    }

    public function suatChieu()
    {
        return $this->belongsTo(SuatChieu::class, 'suat_chieu_id', 'id');
    }

    public function chiTietDonHang()
    {
        return $this->hasMany(ChiTietDonHang::class, 'donhang_id', 'id');
    }

    public function ve()
    {
        return $this->hasMany(Ve::class, 'donhang_id', 'id');
    }

    public function theQuaTang()
    {
        return $this->belongsTo(TheQuaTang::class, 'thequatang_id', 'id');
    }
}
