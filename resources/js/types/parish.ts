export type MinistryType =
    | 'Altar Server'
    | 'Choir'
    | 'Lector & Commentator'
    | 'Extraordinary Minister (Lourdes)'
    | 'Sound & Media AV'
    | 'SocCom'
    | 'Pianist & Organist';

export type ZoneType =
    | 'Zone 1'
    | 'Zone 2'
    | 'Zone 3'
    | 'Zone 4'
    | 'Zone 5';

export interface GKK {
    id?: number;
    zone: ZoneType;
    name: string;
}

export const PARISH_ZONES_AND_GKKS: Record<ZoneType, string[]> = {
    'Zone 1': [
        'Sto. Rosario, Bandera',
        'Sto. Tomas, Balabag',
        'Sto. Niño, Bandera',
        'Sto. Niño, Mahayahay',
    ],
    'Zone 2': [
        'Sta. Catalina, Lungag',
        'San Miguel, Lungag',
        'San Roque, San Roque',
        'San Agustin, Upper Matti',
    ],
    'Zone 3': [
        'Sto. Niño, Colorado',
        'San Miguel, Colorado',
        'San Vicente Ferrer, Colorado',
        'San Isidro Labrador, Bagsak',
        'San Francisco, Colorado',
    ],
    'Zone 4': [
        'Birhen sa Guadalupe, Matti',
        'Mother of Perpetual Help, Matti',
        'Birhen sa Fatima, Matti',
        'Sto. Niño, Bliss-Matti',
        'San Vicente Ferrer, Upper Matti',
        'San Isidro, Albaracin',
    ],
    'Zone 5': [
        'San Vicente Ferrer, USA',
        'San Agustin, San Agustin',
        'Sta. Catalina, LSA',
        'Sto. Niño, Colonan-Matti',
        'San Isidro Labrador, Riverside',
    ],
};

export interface Parishioner {
    id: string;
    memberId: string; // e.g. "FAT-2026-001"
    name: string;
    pin: string;
    zone: ZoneType;
    gkk: string;
    ministry: MinistryType;
    email: string;
    phone: string;
    avatarUrl?: string;
    isActive: boolean;
    joinDate: string;
}

export interface AdminUser {
    id: string;
    name: string;
    title: string; // e.g. "Parish Priest & Administrator"
    username: string; // e.g. "@fr.larry"
    email: string;
    pin: string;
    initials: string;
    role: 'Parish Priest' | 'PPC Secretary' | 'Liturgy Coordinator' | 'Youth Coordinator' | 'Finance Officer';
    avatarColor?: string;
}

export interface MinistrySlot {
    ministry: MinistryType;
    requiredCount: number;
    assignedMemberIds: string[];
}

export interface MassCelebration {
    id: string;
    name: string; // e.g. "Sunday Dawn Mass (Misa de Gallo)"
    season: string; // e.g. "24th Sunday in Ordinary Time (Year B)"
    date: string; // "2026-09-20"
    time: string; // "06:00 AM"
    presider: string; // "Fr. Hermes 'Larry' Sabud, SM"
    language: 'Cebuano' | 'English' | 'English/Cebuano' | 'English/Tagalog';
    typeBadge: 'SUNDAY MASS' | 'ANTICIPATED MASS' | 'YOUTH MASS' | 'FEAST MASS';
    slots: MinistrySlot[];
}

export interface AttendanceRecord {
    id: string;
    parishionerId: string;
    parishionerName: string;
    memberId: string;
    zone: ZoneType;
    gkk: string;
    ministry: MinistryType;
    massId: string;
    massName: string;
    checkInTime: string; // e.g. "05:42 AM"
    date: string;
    status: 'On-Time' | 'Grace Period' | 'Late';
    method: 'Kiosk PIN' | 'Admin Manual';
}

export type LiturgicalSeason =
    | 'Advent'
    | 'Christmas'
    | 'Ordinary Time'
    | 'Lent'
    | 'Holy Week'
    | 'Easter'
    | 'Pentecost';
