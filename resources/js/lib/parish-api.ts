import { AdminUser, AttendanceRecord, LiturgicalSeason, MassCelebration, Parishioner } from '@/types/parish';
import { ParishState } from './parish-store';

export async function fetchParishState(): Promise<ParishState> {
    const res = await fetch('/api/parish/state', {
        headers: { credentials: 'same-origin', Accept: 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to fetch parish state');
    return res.json();
}

export async function apiCheckIn(record: Omit<AttendanceRecord, 'id'>): Promise<{ success: boolean; record: AttendanceRecord; state: ParishState }> {
    const res = await fetch('/api/parish/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(record),
    });
    if (!res.ok) throw new Error('Check-in failed');
    return res.json();
}

export async function apiDeleteAttendance(id: string): Promise<{ success: boolean; state: ParishState }> {
    const res = await fetch(`/api/parish/attendance/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error('Delete attendance failed');
    return res.json();
}

export async function apiAddParishioner(data: {
    name: string;
    zone: string;
    gkk: string;
    ministry: string;
    pin?: string;
    email?: string;
    phone?: string;
}): Promise<{ success: boolean; parishioner: Parishioner; state: ParishState }> {
    const res = await fetch('/api/parish/parishioners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Add parishioner failed');
    return res.json();
}

export async function apiUpdateParishioner(id: string, data: Partial<Parishioner>): Promise<{ success: boolean; state: ParishState }> {
    const res = await fetch(`/api/parish/parishioners/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Update parishioner failed');
    return res.json();
}

export async function apiDeleteParishioner(id: string): Promise<{ success: boolean; state: ParishState }> {
    const res = await fetch(`/api/parish/parishioners/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error('Delete parishioner failed');
    return res.json();
}

export async function apiCreateMass(data: Omit<MassCelebration, 'id' | 'slots'>): Promise<{ success: boolean; massId: string; state: ParishState }> {
    const res = await fetch('/api/parish/masses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Create mass failed');
    return res.json();
}

export async function apiUpdateMassAssignments(massId: string, slots: MassCelebration['slots']): Promise<{ success: boolean; state: ParishState }> {
    const res = await fetch(`/api/parish/masses/${encodeURIComponent(massId)}/assignments`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ slots }),
    });
    if (!res.ok) throw new Error('Update assignments failed');
    return res.json();
}

export async function apiSetActiveMass(massId: string): Promise<{ success: boolean; activeMassId: string; state: ParishState }> {
    const res = await fetch(`/api/parish/masses/${encodeURIComponent(massId)}/active`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error('Set active mass failed');
    return res.json();
}

export async function apiCreateAdmin(data: {
    name: string;
    title: string;
    role: string;
    username: string;
    email: string;
    pin: string;
}): Promise<{ success: boolean; adminId: string; state: ParishState }> {
    const res = await fetch('/api/parish/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Create admin failed');
    return res.json();
}

export async function apiSwitchAdmin(adminId: string): Promise<{ success: boolean; currentAdminId: string; state: ParishState }> {
    const res = await fetch(`/api/parish/admins/${encodeURIComponent(adminId)}/switch`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error('Switch admin failed');
    return res.json();
}

export async function apiResetDatabase(): Promise<{ success: boolean; state: ParishState }> {
    const res = await fetch('/api/parish/reset-db', {
        method: 'POST',
        headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error('Reset database failed');
    return res.json();
}

export async function apiSetLiturgicalSeason(
    season: LiturgicalSeason
): Promise<{ success: boolean; liturgicalSeason: LiturgicalSeason; state: ParishState }> {
    const res = await fetch('/api/parish/season', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ season }),
    });
    if (!res.ok) throw new Error('Failed to update liturgical season in database');
    return res.json();
}
