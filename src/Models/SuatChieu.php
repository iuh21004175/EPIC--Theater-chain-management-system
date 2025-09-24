<?php
    namespace App\Models;
    use Illuminate\Database\Eloquent\Model;
    class SuatChieu extends Model {
        protected $table = 'suatchieu';
        protected $primaryKey = 'id';
        protected $fillable = [
            'id',
            'id_phim',
            'id_phongchieu',
            'batdau',
            'ketthuc',
            'ly_do',
            'tinh_trang', // 0 - Chờ duyệt, 1 - Đã duyệt, 2 - Từ chối, 3 - Chờ duyệt lại
            'created_at',
            'updated_at'
        ];
        public function phim() {
            return $this->belongsTo(Phim::class, 'id_phim');
        }
        public function phongChieu() {
            return $this->belongsTo(PhongChieu::class, 'id_phongchieu');
        }
        public function logSuatChieu() {
            return $this->hasMany(LogSuatChieu::class, 'id_suatchieu');
        }
        public function ve()
        {
            return $this->hasMany(Ve::class, 'suat_chieu_id', 'id');
        }
    }
?>