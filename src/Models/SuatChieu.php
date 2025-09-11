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
            'created_at',
            'updated_at'
        ];
        public function phim() {
            return $this->belongsTo(Phim::class, 'id_phim');
        }
        public function phongChieu() {
            return $this->belongsTo(PhongChieu::class, 'id_phongchieu');
        }
    }
?>