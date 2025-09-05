<?php
    namespace App\Models;
    use Illuminate\Database\Eloquent\Model;
    class NguoiDungInternal extends Model {
        protected $table = 'nguoidung_noibo';
        protected $primaryKey = 'id';
        protected $fillable = [
            'id',
            'ten',
            'email',
            'dien_thoai',
            'id_taikhoan',
            'created_at',
            'updated_at'
        ];
        
        
        public function taiKhoan() {
            return $this->belongsTo(TaiKhoanInternal::class, 'id_taikhoan', 'id');
        }
        
    }
?>