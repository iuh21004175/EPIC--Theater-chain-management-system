<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TheLoai extends Model
{
    protected $table = 'theloai';
    protected $primaryKey = 'id';
    public $timestamps = true; 

    protected $fillable = [
        'id',
        'ten'
    ];

    public function Phim() {
         return $this->hasMany(Phim::class, 'theloai_id', 'id');
    }
}
