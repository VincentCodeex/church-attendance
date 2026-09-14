<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MassSlotAssignment extends Model
{
    use HasFactory;

    protected $table = 'mass_slot_assignments';

    protected $fillable = [
        'mass_ministry_slot_id',
        'parishioner_id',
    ];

    public function slot()
    {
        return $this->belongsTo(MassMinistrySlot::class, 'mass_ministry_slot_id');
    }

    public function parishioner()
    {
        return $this->belongsTo(Parishioner::class, 'parishioner_id');
    }
}
