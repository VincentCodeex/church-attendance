import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock,
    Lock,
    MapPin,
    Search,
    ShieldCheck,
    UserCheck,
    Users,
    Volume2,
} from 'lucide-react';
import { ParishCrest } from '@/components/parish/parish-crest';
import { loadParishState, saveParishState, playSanctuaryChime, ParishState } from '@/lib/parish-store';
import { apiCheckIn } from '@/lib/parish-api';
import { getLiturgicalTheme } from '@/lib/parish-theme';
import { AttendanceRecord, Parishioner } from '@/types/parish';

interface PublicKioskProps {
    initialData?: ParishState;
}

export default function PublicKiosk({ initialData }: PublicKioskProps) {
    const [state, setState] = useState(() => loadParishState(initialData));
    const [pinInput, setPinInput] = useState('');
    const [memberSearch, setMemberSearch] = useState('');
    const [selectedMassId, setSelectedMassId] = useState(state.activeMassId || state.masses[0]?.id);
    const [lastRecord, setLastRecord] = useState<AttendanceRecord | null>(null);
    const [showCelebration, setShowCelebration] = useState(false);

    const activeMass = state.masses.find((m) => m.id === selectedMassId) || state.masses[0] || {
        id: 'mass-1',
        name: 'Sunday Liturgical Celebration',
        time: '06:00 AM',
        date: '2026-09-20',
        presider: "Fr. Hermes 'Larry' Sabud, SM",
        language: 'Cebuano',
    };
    const theme = getLiturgicalTheme(state.liturgicalSeason);

    const handleCheckInMember = async (member: Parishioner, method: AttendanceRecord['method'] = 'Kiosk PIN') => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHour = hours % 12 || 12;
        const formattedTime = `${String(formattedHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;

        let status: AttendanceRecord['status'] = 'On-Time';
        if (minutes >= 45 && minutes < 55) {
            status = 'Grace Period';
        } else if (minutes >= 55) {
            status = 'Late';
        }

        const newRec: Omit<AttendanceRecord, 'id'> = {
            parishionerId: member.id,
            parishionerName: member.name,
            memberId: member.memberId,
            zone: member.zone,
            gkk: member.gkk || 'GKK Community',
            ministry: member.ministry,
            massId: activeMass.id,
            massName: activeMass.name,
            checkInTime: formattedTime,
            date: new Date().toISOString().split('T')[0],
            status: status,
            method: method,
        };

        playSanctuaryChime();

        const localRec: AttendanceRecord = {
            ...newRec,
            id: `att-${Date.now()}`,
        };

        const updated = {
            ...state,
            attendances: [localRec, ...state.attendances],
        };
        setState(updated);
        saveParishState(updated);

        setLastRecord(localRec);
        setShowCelebration(true);
        setPinInput('');

        try {
            const res = await apiCheckIn(newRec);
            if (res.state) {
                setState(res.state);
                saveParishState(res.state);
            }
        } catch (err) {
            console.error('Kiosk check-in error', err);
        }
    };

    const handleKeypadSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const query = pinInput.trim();
        if (!query) return;

        const found = state.parishioners.find(
            (p) =>
                p.pin === query ||
                p.memberId.toLowerCase() === query.toLowerCase() ||
                p.name.toLowerCase().includes(query.toLowerCase())
        );

        if (found) {
            handleCheckInMember(found, 'Kiosk PIN');
        } else {
            alert(`No parishioner found matching "${query}". Please check your 4-digit PIN or verify with the sacristan.`);
        }
    };

    // Filter quick roster search
    const filteredRoster = state.parishioners.filter((p) =>
        memberSearch
            ? p.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
              p.memberId.toLowerCase().includes(memberSearch.toLowerCase()) ||
              (p.gkk && p.gkk.toLowerCase().includes(memberSearch.toLowerCase())) ||
              p.ministry.toLowerCase().includes(memberSearch.toLowerCase())
            : true
    );

    return (
        <>
            <Head title="Entrance Sanctuary Kiosk • Our Lady of Fatima Parish" />

            <div
                className="min-h-screen text-white p-4 sm:p-6 lg:p-8 flex flex-col justify-between font-sans antialiased select-none"
                style={{
                    background: 'radial-gradient(circle at 50% 18%, rgba(34, 166, 223, 0.22) 0%, transparent 65%), linear-gradient(150deg, #090c24 0%, #180350 40%, #290278 75%, #03588a 100%)',
                }}
            >
                {/* Top Header */}
                <header className="flex items-center justify-between max-w-5xl mx-auto w-full pb-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <ParishCrest size={52} showGlow />
                        <div>
                            <span className="block text-[10px] uppercase tracking-widest text-amber-300 font-semibold">
                                Diocese of Digos
                            </span>
                            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white font-serif">
                                OUR LADY OF FATIMA PARISH
                            </h1>
                            <p className="text-[10px] text-amber-200/80 italic font-serif">
                                &ldquo;Cura Dei Genetrix&rdquo; &bull; Public Sanctuary Kiosk
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Liturgical Season Badge */}
                        <div
                            className="flex items-center gap-1.5 rounded-xl border border-white/20 px-3 py-1.5 text-xs font-semibold text-white shadow-xs"
                            style={{ backgroundColor: theme.primaryHex }}
                        >
                            <span className="text-sm">{theme.vestmentIcon}</span>
                            <span className="font-bold">{theme.name}</span>
                            <span className="rounded bg-black/25 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-amber-200">
                                {theme.colorName}
                            </span>
                        </div>

                        <a
                            href="/dashboard"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/20 transition-colors"
                        >
                            <Lock className="size-3.5 text-amber-300" />
                            <span>Admin Portal</span>
                        </a>
                    </div>
                </header>

                {/* Main Content Area: Kiosk Body */}
                <main className="max-w-4xl mx-auto w-full my-auto py-6">
                    {/* Mass Celebration Picker Card */}
                    <div className="mb-6 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <span className="text-[10px] uppercase tracking-wider text-amber-300 font-bold">
                                Current Active Celebration:
                            </span>
                            <h2 className="text-lg font-bold font-serif text-white">
                                {activeMass.name} ({activeMass.time})
                            </h2>
                            <p className="text-xs text-slate-300">
                                {activeMass.date} &bull; {activeMass.language} &bull; Presided by {activeMass.presider}
                            </p>
                        </div>

                        <select
                            value={selectedMassId}
                            onChange={(e) => setSelectedMassId(e.target.value)}
                            className="rounded-xl border border-white/20 bg-[#15284b] px-3.5 py-2 text-xs font-bold text-white focus:outline-hidden"
                        >
                            {state.masses.map((m) => (
                                <option key={m.id} value={m.id} className="bg-[#15284b] text-white">
                                    {m.name} ({m.time})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Check-In Grid: Left Keypad Terminal, Right Directory Lookup */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* PIN / Member ID Keypad Terminal */}
                        <div className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-md flex flex-col justify-between shadow-2xl">
                            <div>
                                <span className="inline-block rounded-full bg-amber-400/20 px-3 py-1 text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-2 border border-amber-400/30">
                                    Station 1: Touch Keypad
                                </span>
                                <h3 className="text-base font-bold text-white font-serif">
                                    Enter 4-Digit PIN or Member ID
                                </h3>
                                <p className="text-xs text-slate-300 mt-1">
                                    Type your assigned PIN or tap your digits below to check in
                                </p>

                                <form onSubmit={handleKeypadSubmit} className="mt-4">
                                    <input
                                        type="text"
                                        value={pinInput}
                                        onChange={(e) => setPinInput(e.target.value)}
                                        placeholder="Enter 4-Digit PIN..."
                                        style={{
                                            color: '#fbbf24',
                                            WebkitTextFillColor: '#fbbf24',
                                            backgroundColor: 'rgba(0,0,0,0.6)',
                                        }}
                                        className="w-full rounded-xl border border-white/20 px-4 py-3 text-center text-xl font-mono font-bold tracking-widest text-amber-400 placeholder:text-slate-400 placeholder:text-xs placeholder:tracking-normal focus:border-amber-400 focus:outline-hidden"
                                    />
                                </form>
                            </div>

                            {/* Touch Numpad */}
                            <div className="my-4 grid grid-cols-3 gap-2">
                                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'FAT-', '0', '⌫'].map((num) => (
                                    <button
                                        key={num}
                                        type="button"
                                        onClick={() => {
                                            if (num === '⌫') setPinInput((prev) => prev.slice(0, -1));
                                            else setPinInput((prev) => prev + num);
                                        }}
                                        className="h-12 rounded-xl border border-white/15 bg-white/10 text-base font-bold text-white hover:bg-white/25 active:scale-95 transition-all flex items-center justify-center font-mono"
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={() => handleKeypadSubmit()}
                                className="w-full rounded-xl bg-amber-400 hover:bg-amber-300 py-3 text-xs font-bold text-slate-950 uppercase tracking-wider shadow-md transition-all"
                            >
                                Confirm Attendance
                            </button>
                        </div>

                        {/* Quick Directory Lookup (One-Click Check-In) */}
                        <div className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-md flex flex-col justify-between shadow-2xl">
                            <div>
                                <span className="inline-block rounded-full bg-sky-400/20 px-3 py-1 text-[11px] font-bold text-sky-300 uppercase tracking-wider mb-2 border border-sky-400/30">
                                    Station 2: Quick Directory
                                </span>
                                <h3 className="text-base font-bold text-white font-serif">
                                    Find Name &amp; GKK Community
                                </h3>
                                <p className="text-xs text-slate-300 mt-1">
                                    Select your name from the registered roster for 1-click check-in
                                </p>

                                {/* Search Bar */}
                                <div className="relative mt-4">
                                    <Search className="absolute left-3 top-3 size-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={memberSearch}
                                        onChange={(e) => setMemberSearch(e.target.value)}
                                        placeholder="Search name, ministry, or GKK..."
                                        style={{
                                            color: '#ffffff',
                                            WebkitTextFillColor: '#ffffff',
                                            backgroundColor: 'rgba(0,0,0,0.5)',
                                        }}
                                        className="w-full rounded-xl border border-white/20 pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-slate-400 focus:border-amber-400 focus:outline-hidden"
                                    />
                                </div>
                            </div>

                            {/* Parishioner List */}
                            <div className="my-4 max-h-56 overflow-y-auto space-y-2 pr-1">
                                {state.parishioners.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400 text-xs">
                                        <Users className="size-8 mx-auto text-slate-400 mb-2 opacity-60" />
                                        <p>No parishioners registered in database yet.</p>
                                        <p className="text-[10px] text-slate-500 mt-1">
                                            Log in to the Admin Portal to register members across Zones 1 to 5 and 24 GKKs!
                                        </p>
                                    </div>
                                ) : filteredRoster.length === 0 ? (
                                    <div className="text-center py-6 text-slate-400 text-xs">
                                        No members match &quot;{memberSearch}&quot;.
                                    </div>
                                ) : (
                                    filteredRoster.map((member) => {
                                        const isCheckedIn = state.attendances.some(
                                            (a) => a.parishionerId === member.id && a.massId === activeMass.id
                                        );

                                        return (
                                            <div
                                                key={member.id}
                                                className="flex items-center justify-between p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                                            >
                                                <div className="min-w-0 flex-1 pr-2">
                                                    <div className="font-bold text-xs text-white truncate">
                                                        {member.name}
                                                    </div>
                                                    <div className="text-[10px] text-amber-200 truncate">
                                                        {member.ministry} &bull; {member.zone}
                                                    </div>
                                                    <div className="text-[9px] text-slate-300 truncate flex items-center gap-1">
                                                        <MapPin className="size-2.5 text-amber-400" />
                                                        <span>{member.gkk}</span>
                                                    </div>
                                                </div>

                                                {isCheckedIn ? (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30 shrink-0">
                                                        <CheckCircle2 className="size-3" /> Checked-In
                                                    </span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCheckInMember(member, 'Kiosk PIN')}
                                                        className="rounded-lg bg-amber-400 hover:bg-amber-300 px-3 py-1 text-[10px] font-bold text-slate-950 transition-colors shrink-0 shadow-xs"
                                                    >
                                                        Tap to In
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <div className="text-[10px] text-slate-400 text-center border-t border-white/10 pt-2 font-mono">
                                5 Pastoral Zones &bull; 24 GKK Christian Communities
                            </div>
                        </div>
                    </div>
                </main>

                {/* Kiosk Footer */}
                <footer className="max-w-5xl mx-auto w-full pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
                    <div>
                        <span>Sanctuary Entrance &bull; Automated PIN Attendance Terminal</span>
                    </div>
                    <div className="flex items-center gap-1 font-mono">
                        <Clock className="size-3 text-amber-300" />
                        <span>Real-Time Attendance Ledger</span>
                    </div>
                </footer>
            </div>

            {/* Check-In Celebration Modal */}
            {showCelebration && lastRecord && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
                    <div className="w-full max-w-sm rounded-3xl bg-[#15284b] border border-amber-400/40 p-6 text-center text-white shadow-2xl animate-in zoom-in-95">
                        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-amber-400 text-slate-950 mb-3 shadow-lg">
                            <CheckCircle2 className="size-9" />
                        </div>

                        <span className="inline-block rounded-full bg-emerald-500/20 px-3 py-0.5 text-[10px] font-bold text-emerald-300 uppercase tracking-wider border border-emerald-400/30 mb-2">
                            Attendance Confirmed &bull; {lastRecord.status}
                        </span>

                        <h3 className="text-xl font-bold font-serif">{lastRecord.parishionerName}</h3>
                        <p className="text-xs text-amber-300 font-semibold mt-0.5">
                            {lastRecord.ministry}
                        </p>
                        <p className="text-[11px] text-slate-300 mt-0.5 font-mono">
                            {lastRecord.zone} &bull; {lastRecord.gkk}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                            ID: {lastRecord.memberId}
                        </p>

                        <div className="mt-4 rounded-xl bg-white/10 p-3 text-xs flex items-center justify-around border border-white/10">
                            <div>
                                <span className="block text-[10px] text-slate-300 uppercase">Mass Celebration</span>
                                <span className="font-bold text-white text-[11px] truncate max-w-[140px] block">{lastRecord.massName}</span>
                            </div>
                            <div className="h-6 w-px bg-white/20" />
                            <div>
                                <span className="block text-[10px] text-slate-300 uppercase">Check-In Time</span>
                                <span className="font-mono font-bold text-amber-300">{lastRecord.checkInTime}</span>
                            </div>
                        </div>

                        <p className="text-xs text-slate-200 mt-4 italic font-serif">
                            &ldquo;Serve the Lord with gladness; enter His presence with singing.&rdquo; &bull; Psalm 100:2
                        </p>

                        <button
                            type="button"
                            onClick={() => setShowCelebration(false)}
                            className="mt-5 w-full rounded-xl bg-amber-400 hover:bg-amber-300 py-3 text-xs font-bold text-slate-950 uppercase tracking-wider transition-colors"
                        >
                            Complete
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
