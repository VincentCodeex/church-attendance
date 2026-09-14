import { AdminUser, AttendanceRecord, GKK, LiturgicalSeason, MassCelebration, PARISH_ZONES_AND_GKKS, Parishioner } from '@/types/parish';

export const DEFAULT_ADMINS: AdminUser[] = [
    {
        id: 'admin-1',
        name: "Fr. Hermes 'Larry' Sabud, SM",
        title: 'Parish Priest & Administrator',
        username: '@fr.larry',
        email: 'fr.larry@fatimaparish.ph',
        pin: '1917',
        initials: 'FH',
        role: 'Parish Priest',
        avatarColor: 'bg-amber-600',
    },
];

export const DEFAULT_GKKS: GKK[] = Object.entries(PARISH_ZONES_AND_GKKS).flatMap(([zone, names]) =>
    names.map((name) => ({
        zone: zone as GKK['zone'],
        name,
    }))
);

export const DEFAULT_PARISHIONERS: Parishioner[] = [];

export const DEFAULT_MASSES: MassCelebration[] = [
    {
        id: 'mass-1',
        name: 'Sunday Dawn Mass (Misa de Gallo)',
        season: '24th Sunday in Ordinary Time (Year B)',
        date: '2026-09-20',
        time: '06:00 AM',
        presider: "Fr. Hermes 'Larry' Sabud, SM",
        language: 'Cebuano',
        typeBadge: 'SUNDAY MASS',
        slots: [
            { ministry: 'Altar Server', requiredCount: 2, assignedMemberIds: [] },
            { ministry: 'Choir', requiredCount: 2, assignedMemberIds: [] },
            { ministry: 'Lector & Commentator', requiredCount: 2, assignedMemberIds: [] },
            { ministry: 'Extraordinary Minister (Lourdes)', requiredCount: 2, assignedMemberIds: [] },
            { ministry: 'Sound & Media AV', requiredCount: 1, assignedMemberIds: [] },
            { ministry: 'SocCom', requiredCount: 1, assignedMemberIds: [] },
            { ministry: 'Pianist & Organist', requiredCount: 1, assignedMemberIds: [] },
        ],
    },
    {
        id: 'mass-2',
        name: 'Sunday Community High Mass',
        season: '24th Sunday in Ordinary Time (Year B)',
        date: '2026-09-20',
        time: '08:30 AM',
        presider: "Fr. Hermes 'Larry' Sabud, SM",
        language: 'English/Cebuano',
        typeBadge: 'SUNDAY MASS',
        slots: [
            { ministry: 'Altar Server', requiredCount: 3, assignedMemberIds: [] },
            { ministry: 'Choir', requiredCount: 4, assignedMemberIds: [] },
            { ministry: 'Lector & Commentator', requiredCount: 2, assignedMemberIds: [] },
            { ministry: 'Extraordinary Minister (Lourdes)', requiredCount: 2, assignedMemberIds: [] },
            { ministry: 'Sound & Media AV', requiredCount: 1, assignedMemberIds: [] },
            { ministry: 'SocCom', requiredCount: 1, assignedMemberIds: [] },
            { ministry: 'Pianist & Organist', requiredCount: 1, assignedMemberIds: [] },
        ],
    },
    {
        id: 'mass-3',
        name: 'Sunday Youth & Students Mass',
        season: '24th Sunday in Ordinary Time (Year B)',
        date: '2026-09-20',
        time: '04:30 PM',
        presider: "Fr. Hermes 'Larry' Sabud, SM",
        language: 'English/Tagalog',
        typeBadge: 'YOUTH MASS',
        slots: [
            { ministry: 'Altar Server', requiredCount: 2, assignedMemberIds: [] },
            { ministry: 'Choir', requiredCount: 3, assignedMemberIds: [] },
            { ministry: 'Lector & Commentator', requiredCount: 2, assignedMemberIds: [] },
            { ministry: 'Extraordinary Minister (Lourdes)', requiredCount: 2, assignedMemberIds: [] },
            { ministry: 'Sound & Media AV', requiredCount: 1, assignedMemberIds: [] },
            { ministry: 'SocCom', requiredCount: 1, assignedMemberIds: [] },
            { ministry: 'Pianist & Organist', requiredCount: 1, assignedMemberIds: [] },
        ],
    },
    {
        id: 'mass-4',
        name: 'Anticipated Saturday Vigil Mass',
        season: '24th Sunday in Ordinary Time (Year B)',
        date: '2026-09-19',
        time: '05:30 PM',
        presider: "Fr. Hermes 'Larry' Sabud, SM",
        language: 'Cebuano',
        typeBadge: 'ANTICIPATED MASS',
        slots: [
            { ministry: 'Altar Server', requiredCount: 2, assignedMemberIds: [] },
            { ministry: 'Choir', requiredCount: 2, assignedMemberIds: [] },
            { ministry: 'Lector & Commentator', requiredCount: 2, assignedMemberIds: [] },
            { ministry: 'Extraordinary Minister (Lourdes)', requiredCount: 2, assignedMemberIds: [] },
            { ministry: 'Sound & Media AV', requiredCount: 1, assignedMemberIds: [] },
            { ministry: 'SocCom', requiredCount: 1, assignedMemberIds: [] },
            { ministry: 'Pianist & Organist', requiredCount: 1, assignedMemberIds: [] },
        ],
    },
];

export const DEFAULT_ATTENDANCES: AttendanceRecord[] = [];

const STORAGE_KEY = 'fatima_parish_data_v4';

export interface ParishState {
    admins: AdminUser[];
    currentAdminId: string;
    gkks?: GKK[];
    parishioners: Parishioner[];
    masses: MassCelebration[];
    attendances: AttendanceRecord[];
    activeMassId: string;
    liturgicalSeason?: LiturgicalSeason;
}

export function loadParishState(initialData?: ParishState): ParishState {
    if (initialData && initialData.admins && initialData.parishioners && initialData.masses) {
        saveParishState(initialData);
        return initialData;
    }

    if (typeof window === 'undefined') {
        return {
            admins: DEFAULT_ADMINS,
            currentAdminId: DEFAULT_ADMINS[0].id,
            gkks: DEFAULT_GKKS,
            parishioners: DEFAULT_PARISHIONERS,
            masses: DEFAULT_MASSES,
            attendances: DEFAULT_ATTENDANCES,
            activeMassId: DEFAULT_MASSES[0].id,
            liturgicalSeason: 'Ordinary Time',
        };
    }

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.admins && parsed.parishioners && parsed.masses) {
                if (!parsed.liturgicalSeason) parsed.liturgicalSeason = 'Ordinary Time';
                if (!parsed.gkks) parsed.gkks = DEFAULT_GKKS;
                return parsed;
            }
        }
    } catch {
        // Fall back to default
    }

    const initialState: ParishState = {
        admins: DEFAULT_ADMINS,
        currentAdminId: DEFAULT_ADMINS[0].id,
        gkks: DEFAULT_GKKS,
        parishioners: DEFAULT_PARISHIONERS,
        masses: DEFAULT_MASSES,
        attendances: DEFAULT_ATTENDANCES,
        activeMassId: DEFAULT_MASSES[0].id,
        liturgicalSeason: 'Ordinary Time',
    };
    saveParishState(initialState);
    return initialState;
}

export function saveParishState(state: ParishState): void {
    if (typeof window !== 'undefined') {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch {
            // Storage quota or disabled
        }
    }
}

export function resetParishState(): ParishState {
    const initialState: ParishState = {
        admins: DEFAULT_ADMINS,
        currentAdminId: DEFAULT_ADMINS[0].id,
        gkks: DEFAULT_GKKS,
        parishioners: DEFAULT_PARISHIONERS,
        masses: DEFAULT_MASSES,
        attendances: DEFAULT_ATTENDANCES,
        activeMassId: DEFAULT_MASSES[0].id,
        liturgicalSeason: 'Ordinary Time',
    };
    saveParishState(initialState);
    return initialState;
}

/**
 * Play authentic Liturgical Sanctuary Bell sound using Web Audio API
 */
export function playSanctuaryChime(): void {
    if (typeof window === 'undefined') return;
    try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();

        const tones = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 heavenly chord
        tones.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);

            const startTime = ctx.currentTime + idx * 0.08;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.18, startTime + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.6);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + 1.7);
        });
    } catch {
        // Audio playback error or user gesture required
    }
}
