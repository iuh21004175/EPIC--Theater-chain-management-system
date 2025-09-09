<?php
    namespace App\Models;
    use Illuminate\Database\Eloquent\Model;

    class DanhMuc extends Model{
        protected $table = 'danh_muc';
        protected $primaryKey = 'id';
        protected $fillable = [
            'id',
            'ten', 
            'soluong',
            'created_at',
            'updated_at'
        ];
        public $timestamps = false;
    }
?>