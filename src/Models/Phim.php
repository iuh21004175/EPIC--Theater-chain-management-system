<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Phim extends Model
{
    protected $table = 'phim';
    protected $primaryKey = 'id';
    public $timestamps = true; 

    protected $fillable = [
        'id',
        'ten_phim',
        'dao_dien',
        'dien_vien',
        'thoi_luong',
        'quoc_gia',
        'ngay_cong_chieu',
        'do_tuoi',
        'mo_ta',
        'poster_url',
        'trailer_url',
        'trang_thai'
    ];
}
