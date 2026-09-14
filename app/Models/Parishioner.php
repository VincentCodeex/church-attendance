<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Parishioner extends Model
{
    use HasFactory;

    protected $table = 'parishioners';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'member_id',
        'name',
        'pin',
        'zone',
        'gkk',
        'ministry',
        'email',
        'phone',
        'avatar_url',
        'is_active',
        'join_date',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'join_date' => 'date:Y-m-d',
    ];

    public function attendances()
    {
        return $this->hasMany(AttendanceRecord::class, 'parishioner_id');
    }

    public function slotAssignments()
    {
        return $this->hasMany(MassSlotAssignment::class, 'parishioner_id');
    }
}
