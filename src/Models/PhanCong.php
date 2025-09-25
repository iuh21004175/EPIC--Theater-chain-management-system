<?php
    namespace App\Models;
    use Illuminate\Database\Eloquent\Model;
    class PhanCong extends Model{
        protected $table = 'phan_cong';
        protected $primaryKey = 'id';
        protected $fillable = [
            'id',
            'id_nhanvien',
            'id_congviec',
            'ngay',
            'ca',
            'gio_vao',
            'gio_ra',
            'created_at',
            'updated_at'
        ];
        public function nhanVien(){
            return $this->belongsTo(NguoiDungInternal::class, 'id_nhanvien', 'id');
        }
        public function congViec(){
            return $this->belongsTo(ViTriCongViec::class, 'id_congviec', 'id');
        }
    }
?>