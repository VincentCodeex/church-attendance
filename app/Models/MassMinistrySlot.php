<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MassMinistrySlot extends Model
{
    use HasFactory;

    protected $table = 'mass_ministry_slots';

    protected $fillable = [
        'mass_id',
        'ministry',
        'required_count',
    ];

    public function celebration()
    {
        return $this->belongsTo(MassCelebration::class, 'mass_id');
    }

    public function assignments()
    {
        return $this->hasMany(MassSlotAssignment::class, 'mass_ministry_slot_id');
    }

    public function assignedParishioners()
    {
        return $this->belongsToMany(Parishioner::class, 'mass_slot_assignments', 'mass_ministry_slot_id', 'parishioner_id');
    }
}
