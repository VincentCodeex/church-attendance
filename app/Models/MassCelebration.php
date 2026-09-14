<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MassCelebration extends Model
{
    use HasFactory;

    protected $table = 'mass_celebrations';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'name',
        'season',
        'date',
        'time',
        'presider',
        'language',
        'type_badge',
        'is_active',
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
        'is_active' => 'boolean',
    ];

    public function slots()
    {
        return $this->hasMany(MassMinistrySlot::class, 'mass_id');
    }

    public function attendances()
    {
        return $this->hasMany(AttendanceRecord::class, 'mass_id');
    }
}
