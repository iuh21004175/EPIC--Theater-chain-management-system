<?php
    namespace App\Models;
    use Illuminate\Database\Eloquent\Model;
    class RapPhim extends Model {
        protected $table = 'rapphim';
        protected $primaryKey = 'id';
        protected $fillable = [
            'id',
            'ten',
            'dia_chi',
            'trang_thai', // 1: Đang hoạt động, 0: Ngừng hoạt động
            'created_at',
            'updated_at'
        ];
    }
?>