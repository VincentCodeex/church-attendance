<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Admin;
use App\Models\Parishioner;
use App\Models\MassCelebration;
use App\Models\MassMinistrySlot;
use App\Models\MassSlotAssignment;
use App\Models\AttendanceRecord;
use App\Models\Gkk;
use App\Models\ParishSetting;
use Database\Seeders\ParishDatabaseSeeder;

class ParishController extends Controller
{
    /**
     * Helper to retrieve and format complete parish system state
     */
    public function getParishState()
    {
        $admins = Admin::all()->map(function ($admin) {
            return [
                'id' => $admin->id,
                'name' => $admin->name,
                'title' => $admin->title,
                'role' => $admin->role,
                'username' => $admin->username,
                'email' => $admin->email,
                'pin' => $admin->pin,
                'initials' => $admin->initials,
                'avatarColor' => $admin->avatar_color ?? 'bg-slate-700',
            ];
        });

        $gkks = Gkk::all()->map(function ($g) {
            return [
                'id' => $g->id,
                'zone' => $g->zone,
                'name' => $g->name,
            ];
        });

        $parishioners = Parishioner::all()->map(function ($p) {
            return [
                'id' => $p->id,
                'memberId' => $p->member_id,
                'name' => $p->name,
                'pin' => $p->pin,
                'zone' => $p->zone,
                'gkk' => $p->gkk ?? '',
                'ministry' => $p->ministry,
                'email' => $p->email ?? '',
                'phone' => $p->phone ?? '',
                'avatarUrl' => $p->avatar_url,
                'isActive' => (bool) $p->is_active,
                'joinDate' => $p->join_date ? $p->join_date->format('Y-m-d') : date('Y-m-d'),
            ];
        });

        $masses = MassCelebration::with(['slots.assignments'])->get()->map(function ($mass) {
            $slots = $mass->slots->map(function ($slot) {
                return [
                    'ministry' => $slot->ministry,
                    'requiredCount' => $slot->required_count,
                    'assignedMemberIds' => $slot->assignments->pluck('parishioner_id')->all(),
                ];
            });

            return [
                'id' => $mass->id,
                'name' => $mass->name,
                'season' => $mass->season,
                'date' => $mass->date ? $mass->date->format('Y-m-d') : date('Y-m-d'),
                'time' => $mass->time,
                'presider' => $mass->presider,
                'language' => $mass->language,
                'typeBadge' => $mass->type_badge,
                'slots' => $slots,
            ];
        });

        $attendances = AttendanceRecord::orderBy('created_at', 'desc')->get()->map(function ($att) {
            return [
                'id' => $att->id,
                'parishionerId' => $att->parishioner_id,
                'parishionerName' => $att->parishioner_name,
                'memberId' => $att->member_id,
                'zone' => $att->zone,
                'ministry' => $att->ministry,
                'massId' => $att->mass_id ?? '',
                'massName' => $att->mass_name,
                'checkInTime' => $att->check_in_time,
                'date' => $att->date ? $att->date->format('Y-m-d') : date('Y-m-d'),
                'status' => $att->status,
                'method' => $att->method,
            ];
        });

        $activeMassId = ParishSetting::get('active_mass_id', $masses->first()['id'] ?? 'mass-1');
        $currentAdminId = session('current_admin_id', ParishSetting::get('current_admin_id', $admins->first()['id'] ?? 'admin-1'));
        $liturgicalSeason = ParishSetting::get('liturgical_season', 'Ordinary Time');

        return [
            'admins' => $admins,
            'gkks' => $gkks,
            'parishioners' => $parishioners,
            'masses' => $masses,
            'attendances' => $attendances,
            'activeMassId' => $activeMassId,
            'currentAdminId' => $currentAdminId,
            'liturgicalSeason' => $liturgicalSeason,
        ];
    }

    /**
     * Show Parish Login Portal
     */
    public function showLogin()
    {
        $state = $this->getParishState();
        return Inertia::render('auth/parish-login', [
            'initialData' => $state,
            'admins' => $state['admins'],
        ]);
    }

    /**
     * Show Parish Command Dashboard
     */
    public function showDashboard()
    {
        $state = $this->getParishState();
        return Inertia::render('parish/admin-dashboard', [
            'initialData' => $state,
        ]);
    }

    /**
     * Show Public Sanctuary Kiosk
     */
    public function showKiosk()
    {
        $state = $this->getParishState();
        return Inertia::render('parish/public-kiosk', [
            'initialData' => $state,
        ]);
    }

    /**
     * API: Get Current State
     */
    public function apiState()
    {
        return response()->json($this->getParishState());
    }

    /**
     * API: Record Attendance Check-In
     */
    public function apiCheckIn(Request $request)
    {
        $validated = $request->validate([
            'parishionerId' => 'required|string',
            'parishionerName' => 'required|string',
            'memberId' => 'required|string',
            'zone' => 'required|string',
            'gkk' => 'nullable|string',
            'ministry' => 'required|string',
            'massId' => 'nullable|string',
            'massName' => 'required|string',
            'checkInTime' => 'required|string',
            'date' => 'required|string',
            'status' => 'required|string',
            'method' => 'required|string|in:Kiosk PIN,Admin Manual',
        ]);

        $id = 'att-' . time() . '-' . rand(100, 999);

        $record = AttendanceRecord::create([
            'id' => $id,
            'parishioner_id' => $validated['parishionerId'],
            'parishioner_name' => $validated['parishionerName'],
            'member_id' => $validated['memberId'],
            'zone' => $validated['zone'],
            'gkk' => $validated['gkk'] ?? '',
            'ministry' => $validated['ministry'],
            'mass_id' => $validated['massId'],
            'mass_name' => $validated['massName'],
            'check_in_time' => $validated['checkInTime'],
            'date' => $validated['date'],
            'status' => $validated['status'],
            'method' => $validated['method'],
        ]);

        return response()->json([
            'success' => true,
            'record' => [
                'id' => $record->id,
                'parishionerId' => $record->parishioner_id,
                'parishionerName' => $record->parishioner_name,
                'memberId' => $record->member_id,
                'zone' => $record->zone,
                'gkk' => $record->gkk,
                'ministry' => $record->ministry,
                'massId' => $record->mass_id ?? '',
                'massName' => $record->mass_name,
                'checkInTime' => $record->check_in_time,
                'date' => $record->date ? $record->date->format('Y-m-d') : date('Y-m-d'),
                'status' => $record->status,
                'method' => $record->method,
            ],
            'state' => $this->getParishState(),
        ]);
    }

    /**
     * API: Delete Attendance
     */
    public function apiDeleteAttendance($id)
    {
        AttendanceRecord::where('id', $id)->delete();
        return response()->json(['success' => true, 'state' => $this->getParishState()]);
    }

    /**
     * API: Add Parishioner
     */
    public function apiStoreParishioner(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'zone' => 'required|string',
            'gkk' => 'nullable|string',
            'ministry' => 'required|string',
            'pin' => 'nullable|string',
            'email' => 'nullable|string',
            'phone' => 'nullable|string',
        ]);

        $count = Parishioner::count() + 1;
        $memberId = 'FAT-2026-' . str_pad($count, 3, '0', STR_PAD_LEFT);
        $pin = !empty($validated['pin']) ? $validated['pin'] : (string) (1000 + $count);
        $id = 'par-' . time() . '-' . rand(100, 999);

        $parishioner = Parishioner::create([
            'id' => $id,
            'member_id' => $memberId,
            'name' => $validated['name'],
            'pin' => $pin,
            'zone' => $validated['zone'],
            'gkk' => $validated['gkk'] ?? '',
            'ministry' => $validated['ministry'],
            'email' => $validated['email'] ?? '',
            'phone' => $validated['phone'] ?? '',
            'is_active' => true,
            'join_date' => date('Y-m-d'),
        ]);

        return response()->json([
            'success' => true,
            'parishioner' => [
                'id' => $parishioner->id,
                'memberId' => $parishioner->member_id,
                'name' => $parishioner->name,
                'pin' => $parishioner->pin,
                'zone' => $parishioner->zone,
                'gkk' => $parishioner->gkk ?? '',
                'ministry' => $parishioner->ministry,
                'email' => $parishioner->email ?? '',
                'phone' => $parishioner->phone ?? '',
                'isActive' => true,
                'joinDate' => date('Y-m-d'),
            ],
            'state' => $this->getParishState(),
        ]);
    }

    /**
     * API: Update Parishioner
     */
    public function apiUpdateParishioner(Request $request, $id)
    {
        $parishioner = Parishioner::findOrFail($id);
        
        $parishioner->update([
            'name' => $request->input('name', $parishioner->name),
            'zone' => $request->input('zone', $parishioner->zone),
            'ministry' => $request->input('ministry', $parishioner->ministry),
            'pin' => $request->input('pin', $parishioner->pin),
            'email' => $request->input('email', $parishioner->email),
            'phone' => $request->input('phone', $parishioner->phone),
            'is_active' => $request->has('isActive') ? (bool) $request->input('isActive') : $parishioner->is_active,
        ]);

        return response()->json(['success' => true, 'state' => $this->getParishState()]);
    }

    /**
     * API: Delete Parishioner
     */
    public function apiDeleteParishioner($id)
    {
        Parishioner::where('id', $id)->delete();
        return response()->json(['success' => true, 'state' => $this->getParishState()]);
    }

    /**
     * API: Store Mass Celebration
     */
    public function apiStoreMass(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'season' => 'required|string',
            'date' => 'required|string',
            'time' => 'required|string',
            'presider' => 'required|string',
            'language' => 'required|string',
            'typeBadge' => 'required|string',
        ]);

        $id = 'mass-' . time();
        $mass = MassCelebration::create([
            'id' => $id,
            'name' => $validated['name'],
            'season' => $validated['season'],
            'date' => $validated['date'],
            'time' => $validated['time'],
            'presider' => $validated['presider'],
            'language' => $validated['language'],
            'type_badge' => $validated['typeBadge'],
            'is_active' => false,
        ]);

        $standardMinistries = [
            ['ministry' => 'Altar Server', 'count' => 2],
            ['ministry' => 'Choir', 'count' => 2],
            ['ministry' => 'Lector & Commentator', 'count' => 2],
            ['ministry' => 'Extraordinary Minister (Lourdes)', 'count' => 2],
            ['ministry' => 'Sound & Media AV', 'count' => 1],
            ['ministry' => 'SocCom', 'count' => 1],
            ['ministry' => 'Pianist & Organist', 'count' => 1],
        ];

        foreach ($standardMinistries as $m) {
            MassMinistrySlot::create([
                'mass_id' => $mass->id,
                'ministry' => $m['ministry'],
                'required_count' => $m['count'],
            ]);
        }

        return response()->json(['success' => true, 'massId' => $mass->id, 'state' => $this->getParishState()]);
    }

    /**
     * API: Update Mass Slot Assignments
     */
    public function apiUpdateMassAssignments(Request $request, $id)
    {
        $mass = MassCelebration::with('slots.assignments')->findOrFail($id);
        $slotsData = $request->input('slots', []);

        foreach ($slotsData as $slotData) {
            $slot = MassMinistrySlot::where('mass_id', $mass->id)
                ->where('ministry', $slotData['ministry'])
                ->first();

            if ($slot) {
                // Replace assignments
                MassSlotAssignment::where('mass_ministry_slot_id', $slot->id)->delete();
                foreach ($slotData['assignedMemberIds'] ?? [] as $parishionerId) {
                    MassSlotAssignment::create([
                        'mass_ministry_slot_id' => $slot->id,
                        'parishioner_id' => $parishionerId,
                    ]);
                }
            }
        }

        return response()->json(['success' => true, 'state' => $this->getParishState()]);
    }

    /**
     * API: Set Active Mass
     */
    public function apiSetActiveMass(Request $request, $id)
    {
        ParishSetting::set('active_mass_id', $id);
        MassCelebration::where('id', '!=', $id)->update(['is_active' => false]);
        MassCelebration::where('id', $id)->update(['is_active' => true]);

        return response()->json(['success' => true, 'activeMassId' => $id, 'state' => $this->getParishState()]);
    }

    /**
     * API: Store New Admin
     */
    public function apiStoreAdmin(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'title' => 'required|string',
            'role' => 'required|string',
            'username' => 'required|string',
            'email' => 'required|string',
            'pin' => 'required|string',
        ]);

        $username = str_starts_with($validated['username'], '@') ? $validated['username'] : '@' . $validated['username'];
        $initials = collect(explode(' ', $validated['name']))->map(fn($n) => $n[0] ?? '')->take(2)->join('');
        $id = 'admin-' . time();

        $admin = Admin::create([
            'id' => $id,
            'name' => $validated['name'],
            'title' => $validated['title'],
            'role' => $validated['role'],
            'username' => $username,
            'email' => $validated['email'],
            'pin' => $validated['pin'],
            'initials' => strtoupper($initials ?: 'AD'),
            'avatar_color' => 'bg-indigo-600',
        ]);

        session(['current_admin_id' => $admin->id]);
        ParishSetting::set('current_admin_id', $admin->id);

        return response()->json(['success' => true, 'adminId' => $admin->id, 'state' => $this->getParishState()]);
    }

    /**
     * API: Switch Active Admin
     */
    public function apiSwitchAdmin(Request $request, $id)
    {
        session(['current_admin_id' => $id]);
        ParishSetting::set('current_admin_id', $id);
        return response()->json(['success' => true, 'currentAdminId' => $id, 'state' => $this->getParishState()]);
    }

    /**
     * API: Reset Database with Parish Seeds
     */
    public function apiResetDatabase()
    {
        $seeder = new ParishDatabaseSeeder();
        $seeder->run();
        return response()->json(['success' => true, 'state' => $this->getParishState()]);
    }

    /**
     * API: Set Liturgical Season (Advent, Christmas, Ordinary Time, Lent, Holy Week, Easter, Pentecost)
     */
    public function apiSetLiturgicalSeason(Request $request)
    {
        $validated = $request->validate([
            'season' => 'required|string|in:Advent,Christmas,Ordinary Time,Lent,Holy Week,Easter,Pentecost',
        ]);

        ParishSetting::set('liturgical_season', $validated['season']);

        return response()->json([
            'success' => true,
            'liturgicalSeason' => $validated['season'],
            'state' => $this->getParishState(),
        ]);
    }
}
