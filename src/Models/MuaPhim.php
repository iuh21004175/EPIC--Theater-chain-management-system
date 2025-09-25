<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MuaPhim extends Model
{
    protected $table = 'mua_phim';
    protected $primaryKey = 'id';
    public $timestamps = false;

    protected $fillable = [
        'khach_hang_id',
        'phim_id',
        'so_tien',
        'phuong_thuc',
        'trang_thai', // 2: Đã mua 1:// Chờ thanh toán
        'don_hang_id'
    ];

    public function khachHang() {
        return $this->belongsTo(KhachHang::class, 'khach_hang_id', 'id');
    }

    public function phim() {
        return $this->belongsTo(Phim::class, 'phim_id', 'id');
    }
    public function donHang() {
        return $this->belongsTo(DonHang::class, 'don_hang_id', 'id');
    }
}
