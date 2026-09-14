<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AttendanceRecord extends Model
{
    use HasFactory;

    protected $table = 'attendance_records';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'parishioner_id',
        'parishioner_name',
        'member_id',
        'zone',
        'gkk',
        'ministry',
        'mass_id',
        'mass_name',
        'check_in_time',
        'date',
        'status',
        'method',
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
    ];

    public function parishioner()
    {
        return $this->belongsTo(Parishioner::class, 'parishioner_id');
    }

    public function celebration()
    {
        return $this->belongsTo(MassCelebration::class, 'mass_id');
    }
}
