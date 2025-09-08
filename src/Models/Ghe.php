<?php
    namespace App\Models;
    use Illuminate\Database\Eloquent\Model;
    class Ghe extends Model{
        protected $table = 'loaighe';
        protected $fillable = 
        [
            'id',
            'ten',
            'mo_ta',
            'ma_mau',
            'phu_thu',
            'created_at',
            'updated_at'
        ];
    }
?>