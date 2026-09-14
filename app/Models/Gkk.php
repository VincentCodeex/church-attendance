<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Gkk extends Model
{
    use HasFactory;

    protected $table = 'gkks';

    protected $fillable = [
        'zone',
        'name',
    ];
}
