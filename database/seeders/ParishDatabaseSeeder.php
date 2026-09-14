<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Admin;
use App\Models\Gkk;
use App\Models\Parishioner;
use App\Models\MassCelebration;
use App\Models\MassMinistrySlot;
use App\Models\MassSlotAssignment;
use App\Models\AttendanceRecord;
use App\Models\ParishSetting;

class ParishDatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Single Admin Only
        Admin::query()->delete();
        $admin = [
            'id' => 'admin-1',
            'name' => "Fr. Hermes 'Larry' Sabud, SM",
            'title' => 'Parish Priest & Administrator',
            'username' => '@fr.larry',
            'email' => 'fr.larry@fatimaparish.ph',
            'pin' => '1917',
            'initials' => 'FH',
            'role' => 'Parish Priest',
            'avatar_color' => 'bg-amber-600',
        ];
        Admin::create($admin);

        // 2. 24 GKKs Across Zones 1 to 5 (Exclusively)
        Gkk::query()->delete();
        $gkks = [
            // ZONE 1 (4 GKKs)
            ['zone' => 'Zone 1', 'name' => 'Sto. Rosario, Bandera'],
            ['zone' => 'Zone 1', 'name' => 'Sto. Tomas, Balabag'],
            ['zone' => 'Zone 1', 'name' => 'Sto. Niño, Bandera'],
            ['zone' => 'Zone 1', 'name' => 'Sto. Niño, Mahayahay'],

            // ZONE 2 (4 GKKs)
            ['zone' => 'Zone 2', 'name' => 'Sta. Catalina, Lungag'],
            ['zone' => 'Zone 2', 'name' => 'San Miguel, Lungag'],
            ['zone' => 'Zone 2', 'name' => 'San Roque, San Roque'],
            ['zone' => 'Zone 2', 'name' => 'San Agustin, Upper Matti'],

            // ZONE 3 (5 GKKs)
            ['zone' => 'Zone 3', 'name' => 'Sto. Niño, Colorado'],
            ['zone' => 'Zone 3', 'name' => 'San Miguel, Colorado'],
            ['zone' => 'Zone 3', 'name' => 'San Vicente Ferrer, Colorado'],
            ['zone' => 'Zone 3', 'name' => 'San Isidro Labrador, Bagsak'],
            ['zone' => 'Zone 3', 'name' => 'San Francisco, Colorado'],

            // ZONE 4 (6 GKKs)
            ['zone' => 'Zone 4', 'name' => 'Birhen sa Guadalupe, Matti'],
            ['zone' => 'Zone 4', 'name' => 'Mother of Perpetual Help, Matti'],
            ['zone' => 'Zone 4', 'name' => 'Birhen sa Fatima, Matti'],
            ['zone' => 'Zone 4', 'name' => 'Sto. Niño, Bliss-Matti'],
            ['zone' => 'Zone 4', 'name' => 'San Vicente Ferrer, Upper Matti'],
            ['zone' => 'Zone 4', 'name' => 'San Isidro, Albaracin'],

            // ZONE 5 (5 GKKs)
            ['zone' => 'Zone 5', 'name' => 'San Vicente Ferrer, USA'],
            ['zone' => 'Zone 5', 'name' => 'San Agustin, San Agustin'],
            ['zone' => 'Zone 5', 'name' => 'Sta. Catalina, LSA'],
            ['zone' => 'Zone 5', 'name' => 'Sto. Niño, Colonan-Matti'],
            ['zone' => 'Zone 5', 'name' => 'San Isidro Labrador, Riverside'],
        ];

        foreach ($gkks as $g) {
            Gkk::create($g);
        }

        // 3. Clear existing test parishioners and attendance records (Clean slate for exploration)
        AttendanceRecord::query()->delete();
        MassSlotAssignment::query()->delete();
        Parishioner::query()->delete();

        // 4. Standard Masses with Ministry Slots (Ready for user to schedule & assign ministers)
        MassCelebration::query()->delete();
        $massesData = [
            [
                'id' => 'mass-1',
                'name' => 'Sunday Dawn Mass (Misa de Gallo)',
                'season' => '24th Sunday in Ordinary Time (Year B)',
                'date' => '2026-09-20',
                'time' => '06:00 AM',
                'presider' => "Fr. Hermes 'Larry' Sabud, SM",
                'language' => 'Cebuano',
                'type_badge' => 'SUNDAY MASS',
                'is_active' => true,
                'slots' => [
                    ['ministry' => 'Altar Server', 'required_count' => 2],
                    ['ministry' => 'Choir', 'required_count' => 2],
                    ['ministry' => 'Lector & Commentator', 'required_count' => 2],
                    ['ministry' => 'Extraordinary Minister (Lourdes)', 'required_count' => 2],
                    ['ministry' => 'Sound & Media AV', 'required_count' => 1],
                    ['ministry' => 'SocCom', 'required_count' => 1],
                    ['ministry' => 'Pianist & Organist', 'required_count' => 1],
                ],
            ],
            [
                'id' => 'mass-2',
                'name' => 'Sunday Community High Mass',
                'season' => '24th Sunday in Ordinary Time (Year B)',
                'date' => '2026-09-20',
                'time' => '08:30 AM',
                'presider' => "Fr. Hermes 'Larry' Sabud, SM",
                'language' => 'English/Cebuano',
                'type_badge' => 'SUNDAY MASS',
                'is_active' => false,
                'slots' => [
                    ['ministry' => 'Altar Server', 'required_count' => 3],
                    ['ministry' => 'Choir', 'required_count' => 4],
                    ['ministry' => 'Lector & Commentator', 'required_count' => 2],
                    ['ministry' => 'Extraordinary Minister (Lourdes)', 'required_count' => 2],
                    ['ministry' => 'Sound & Media AV', 'required_count' => 1],
                    ['ministry' => 'SocCom', 'required_count' => 1],
                    ['ministry' => 'Pianist & Organist', 'required_count' => 1],
                ],
            ],
            [
                'id' => 'mass-3',
                'name' => 'Sunday Youth & Students Mass',
                'season' => '24th Sunday in Ordinary Time (Year B)',
                'date' => '2026-09-20',
                'time' => '04:30 PM',
                'presider' => "Fr. Hermes 'Larry' Sabud, SM",
                'language' => 'English/Tagalog',
                'type_badge' => 'YOUTH MASS',
                'is_active' => false,
                'slots' => [
                    ['ministry' => 'Altar Server', 'required_count' => 2],
                    ['ministry' => 'Choir', 'required_count' => 3],
                    ['ministry' => 'Lector & Commentator', 'required_count' => 2],
                    ['ministry' => 'Extraordinary Minister (Lourdes)', 'required_count' => 2],
                    ['ministry' => 'Sound & Media AV', 'required_count' => 1],
                    ['ministry' => 'SocCom', 'required_count' => 1],
                    ['ministry' => 'Pianist & Organist', 'required_count' => 1],
                ],
            ],
            [
                'id' => 'mass-4',
                'name' => 'Anticipated Saturday Vigil Mass',
                'season' => '24th Sunday in Ordinary Time (Year B)',
                'date' => '2026-09-19',
                'time' => '05:30 PM',
                'presider' => "Fr. Hermes 'Larry' Sabud, SM",
                'language' => 'Cebuano',
                'type_badge' => 'ANTICIPATED MASS',
                'is_active' => false,
                'slots' => [
                    ['ministry' => 'Altar Server', 'required_count' => 2],
                    ['ministry' => 'Choir', 'required_count' => 2],
                    ['ministry' => 'Lector & Commentator', 'required_count' => 2],
                    ['ministry' => 'Extraordinary Minister (Lourdes)', 'required_count' => 2],
                    ['ministry' => 'Sound & Media AV', 'required_count' => 1],
                    ['ministry' => 'SocCom', 'required_count' => 1],
                    ['ministry' => 'Pianist & Organist', 'required_count' => 1],
                ],
            ],
        ];

        foreach ($massesData as $mData) {
            $slots = $mData['slots'];
            unset($mData['slots']);

            $celebration = MassCelebration::create($mData);

            foreach ($slots as $sData) {
                MassMinistrySlot::create([
                    'mass_id' => $celebration->id,
                    'ministry' => $sData['ministry'],
                    'required_count' => $sData['required_count'],
                ]);
            }
        }

        // 5. Settings
        ParishSetting::set('active_mass_id', 'mass-1');
        ParishSetting::set('current_admin_id', 'admin-1');
        ParishSetting::set('parish_name', 'Our Lady of Fatima Parish');
        ParishSetting::set('diocese', 'Diocese of Digos');
        ParishSetting::set('liturgical_season', 'Ordinary Time');
    }
}
