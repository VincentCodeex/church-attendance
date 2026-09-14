import React, { useState } from 'react';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    Filter,
    MapPin,
    Search,
    ShieldCheck,
    Trash2,
    UserCheck,
    Users,
    Volume2,
} from 'lucide-react';
import { playSanctuaryChime } from '@/lib/parish-store';
import { AttendanceRecord, MassCelebration, Parishioner } from '@/types/parish';

interface RealtimeKioskProps {
    masses: MassCelebration[];
    activeMassId: string;
    setActiveMassId: (id: string) => void;
    parishioners: Parishioner[];
    attendances: AttendanceRecord[];
    onCheckIn: (record: Omit<AttendanceRecord, 'id'>) => void;
    onDeleteAttendance: (id: string) => void;
}

export const RealtimeKiosk: React.FC<RealtimeKioskProps> = ({
    masses,
    activeMassId,
    setActiveMassId,
    parishioners,
    attendances,
    onCheckIn,
    onDeleteAttendance,
}) => {
    const [pinInput, setPinInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [lastCheckIn, setLastCheckIn] = useState<AttendanceRecord | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState<'All' | 'On-Time' | 'Grace Period' | 'Late'>('All');

    const currentMass = masses.find((m) => m.id === activeMassId) || masses[0] || {
        id: 'mass-1',
        name: 'Sunday Mass',
        date: new Date().toISOString().split('T')[0],
        time: '06:00 AM',
        presider: "Fr. Hermes 'Larry' Sabud, SM",
        language: 'Cebuano',
        slots: [],
    };

    const handleCheckInMember = (member: Parishioner, method: AttendanceRecord['method'] = 'Kiosk PIN') => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHour = hours % 12 || 12;
        const formattedTime = `${String(formattedHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;

        let status: AttendanceRecord['status'] = 'On-Time';
        if (minutes >= 40 && minutes < 55) {
            status = 'Grace Period';
        } else if (minutes >= 55) {
            status = 'Late';
        }

        const newRecord: Omit<AttendanceRecord, 'id'> = {
            parishionerId: member.id,
            parishionerName: member.name,
            memberId: member.memberId,
            zone: member.zone,
            gkk: member.gkk || 'GKK Unassigned',
            ministry: member.ministry,
            massId: currentMass.id,
            massName: currentMass.name,
            checkInTime: formattedTime,
            date: new Date().toISOString().split('T')[0],
            status: status,
            method: method,
        };

        playSanctuaryChime();
        onCheckIn(newRecord);

        const fullRecord: AttendanceRecord = {
            ...newRecord,
            id: `att-${Date.now()}`,
        };
        setLastCheckIn(fullRecord);
        setShowSuccessModal(true);
        setPinInput('');
    };

    const handlePinSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const query = pinInput.trim();
        if (!query) return;

        const found = parishioners.find(
            (p) =>
                p.pin === query ||
                p.memberId.toLowerCase() === query.toLowerCase() ||
                p.name.toLowerCase().includes(query.toLowerCase())
        );

        if (found) {
            handleCheckInMember(found, 'Kiosk PIN');
        } else {
            alert(`No parishioner found matching PIN or ID "${query}". Please check the ID or register the member.`);
        }
    };

    const handleKeypadPress = (digit: string) => {
        setPinInput((prev) => prev + digit);
    };

    const handleKeypadBackspace = () => {
        setPinInput((prev) => prev.slice(0, -1));
    };

    // Filtered Attendances
    const filteredAttendances = attendances
        .filter((a) => (filterStatus === 'All' ? true : a.status === filterStatus))
        .filter((a) =>
            searchQuery
                ? a.parishionerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  a.memberId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (a.gkk && a.gkk.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  a.ministry.toLowerCase().includes(searchQuery.toLowerCase())
                : true
        );

    return (
        <div className="space-y-6">
            {/* Top Toolbar: Active Mass Celebration Selector */}
            <div className="rounded-2xl bg-[#15284b] p-5 text-white shadow-md border border-[#1c355e] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <span className="inline-block rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 uppercase tracking-wider mb-1">
                        Active Liturgical Check-In Terminal
                    </span>
                    <h2 className="text-xl font-bold font-serif">{currentMass.name}</h2>
                    <p className="text-xs text-slate-300">
                        {currentMass.date} at {currentMass.time} &bull; Presided by {currentMass.presider} &bull; {currentMass.language}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <label className="text-xs font-semibold text-slate-300 whitespace-nowrap">
                        Select Mass:
                    </label>
                    <select
                        value={activeMassId}
                        onChange={(e) => setActiveMassId(e.target.value)}
                        className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-medium text-white focus:bg-[#15284b] focus:outline-hidden"
                    >
                        {masses.map((m) => (
                            <option key={m.id} value={m.id} className="text-slate-900 bg-white">
                                {m.name} ({m.time})
                            </option>
                        ))}
                    </select>

                    <button
                        type="button"
                        onClick={() => playSanctuaryChime()}
                        title="Test Sanctuary Bell Chime"
                        className="rounded-xl bg-white/10 hover:bg-white/20 p-2 text-amber-300 transition-colors"
                    >
                        <Volume2 className="size-4.5" />
                    </button>
                </div>
            </div>

            {/* Main Interactive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Station (5 Cols): PIN Keypad & Quick Check-In */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Check-In Input Box */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <UserCheck className="size-5 text-[#15284b]" />
                                <h3 className="font-bold text-slate-900 text-sm">
                                    Sanctuary PIN Check-In
                                </h3>
                            </div>
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Terminal Active
                            </span>
                        </div>

                        {/* PIN / Member ID Input & Keypad */}
                        <div className="space-y-4">
                            <form onSubmit={handlePinSubmit} className="flex gap-2">
                                <input
                                    type="text"
                                    value={pinInput}
                                    onChange={(e) => setPinInput(e.target.value)}
                                    placeholder="Enter 4-digit PIN or Member ID..."
                                    style={{ color: '#000000', WebkitTextFillColor: '#000000', backgroundColor: '#ffffff', opacity: 1 }}
                                    className="flex-1 rounded-xl border border-slate-300 !bg-white px-3.5 py-2.5 text-sm font-mono !text-black placeholder:!text-slate-500 focus:border-[#340299] focus:ring-2 focus:ring-[#340299]/20 transition-all font-medium"
                                />
                                <button
                                    type="submit"
                                    className="rounded-xl bg-[#15284b] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#1d396a] transition-colors shadow-sm"
                                >
                                    Check In
                                </button>
                            </form>

                            {/* Touch Keypad */}
                            <div className="grid grid-cols-3 gap-2 pt-1">
                                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'FAT-', '0', '⌫'].map((k) => (
                                    <button
                                        key={k}
                                        type="button"
                                        onClick={() => {
                                            if (k === '⌫') handleKeypadBackspace();
                                            else handleKeypadPress(k);
                                        }}
                                        className="h-11 rounded-xl border border-slate-200 bg-slate-50/80 text-sm font-bold text-slate-800 hover:bg-slate-100 active:bg-slate-200 transition-colors flex items-center justify-center font-mono shadow-2xs"
                                    >
                                        {k}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quick Registered Roster Picker */}
                        <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                Quick Minister Roster ({parishioners.length} Registered):
                            </span>

                            {parishioners.length === 0 ? (
                                <p className="text-xs text-slate-400 italic py-2">
                                    No parishioners registered yet. Go to Parishioner Directory to register members with their GKK!
                                </p>
                            ) : (
                                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                    {parishioners.map((member) => {
                                        const isCheckedIn = attendances.some(
                                            (a) => a.parishionerId === member.id && a.massId === currentMass.id
                                        );

                                        return (
                                            <div
                                                key={member.id}
                                                className="flex items-center justify-between p-2 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100 transition-colors"
                                            >
                                                <div className="min-w-0 flex-1 pr-2">
                                                    <div className="font-bold text-xs text-slate-900 truncate">
                                                        {member.name}
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 truncate">
                                                        {member.ministry} &bull; {member.zone} ({member.gkk})
                                                    </div>
                                                </div>

                                                {isCheckedIn ? (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                                                        <CheckCircle2 className="size-3" /> Checked-In
                                                    </span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCheckInMember(member, 'Admin Manual')}
                                                        className="rounded-lg bg-[#15284b] px-2.5 py-1 text-[10px] font-bold text-white hover:bg-[#1d396a] transition-colors shrink-0 shadow-2xs"
                                                    >
                                                        Manual In
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Station: Real-time Attendance Feed & Audit Log (7 Cols) */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="font-bold text-slate-900 text-base">
                                    Sanctuary Attendance Ledger
                                </h3>
                                <p className="text-xs text-slate-500">
                                    {attendances.length} total check-ins recorded &bull; Live MySQL database
                                </p>
                            </div>

                            {/* Punctuality Filter Chips */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {(['All', 'On-Time', 'Grace Period', 'Late'] as const).map((status) => (
                                    <button
                                        key={status}
                                        type="button"
                                        onClick={() => setFilterStatus(status)}
                                        className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
                                            filterStatus === status
                                                ? 'bg-[#15284b] text-white'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Search in log */}
                        <div className="relative my-4">
                            <Search className="absolute left-3 top-2.5 size-3.5 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by minister name, member ID, GKK, or ministry..."
                                style={{ color: '#000000', WebkitTextFillColor: '#000000', backgroundColor: '#ffffff', opacity: 1 }}
                                className="w-full rounded-xl border border-slate-300 !bg-white pl-9 pr-4 py-2.5 text-sm !text-black placeholder:!text-slate-500 focus:border-[#340299] focus:outline-hidden focus:ring-2 focus:ring-[#340299]/20 transition-all font-medium"
                            />
                        </div>

                        {/* Attendance Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                        <th className="py-2.5 px-3">Parishioner / Minister</th>
                                        <th className="py-2.5 px-3">Ministry &amp; Zone</th>
                                        <th className="py-2.5 px-3">GKK Community</th>
                                        <th className="py-2.5 px-3">Check-In Time</th>
                                        <th className="py-2.5 px-3">Status</th>
                                        <th className="py-2.5 px-3">Method</th>
                                        <th className="py-2.5 px-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredAttendances.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-8 text-center text-slate-400">
                                                No check-in records found. Enter a PIN or click &quot;Manual In&quot; above to test attendance!
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredAttendances.map((rec) => (
                                            <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="py-3 px-3">
                                                    <div className="font-bold text-slate-900">
                                                        {rec.parishionerName}
                                                    </div>
                                                    <div className="text-[10px] font-mono text-slate-400">
                                                        {rec.memberId}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <div className="font-semibold text-slate-700">
                                                        {rec.ministry}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400">
                                                        {rec.zone}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <div className="flex items-center gap-1 font-medium text-slate-700">
                                                        <MapPin className="size-3 text-amber-600 shrink-0" />
                                                        <span>{rec.gkk || 'GKK Unassigned'}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <div className="inline-flex items-center gap-1 font-mono font-medium text-slate-800">
                                                        <Clock className="size-3 text-slate-400" />
                                                        {rec.checkInTime}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                                            rec.status === 'On-Time'
                                                                ? 'bg-emerald-100 text-emerald-800'
                                                                : rec.status === 'Grace Period'
                                                                ? 'bg-amber-100 text-amber-800'
                                                                : 'bg-rose-100 text-rose-800'
                                                        }`}
                                                    >
                                                        {rec.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                                                        {rec.method}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => onDeleteAttendance(rec.id)}
                                                        className="rounded-lg p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                        title="Delete entry"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Check-In Success Modal Feedback */}
            {showSuccessModal && lastCheckIn && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
                    <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl animate-in zoom-in-95">
                        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4 ring-8 ring-emerald-50">
                            <CheckCircle2 className="size-8" />
                        </div>

                        <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-1">
                            Attendance Confirmed
                        </span>

                        <h3 className="text-lg font-bold text-slate-900 font-serif">
                            {lastCheckIn.parishionerName}
                        </h3>
                        <p className="text-xs font-semibold text-amber-700 mt-0.5">
                            {lastCheckIn.ministry}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {lastCheckIn.zone} &bull; <strong className="text-slate-700">{lastCheckIn.gkk}</strong>
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            ID: {lastCheckIn.memberId}
                        </p>

                        <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-700 flex items-center justify-around border border-slate-100">
                            <div>
                                <span className="block text-[10px] text-slate-400 uppercase">Check-In</span>
                                <span className="font-mono font-bold text-slate-900">{lastCheckIn.checkInTime}</span>
                            </div>
                            <div className="h-6 w-px bg-slate-200" />
                            <div>
                                <span className="block text-[10px] text-slate-400 uppercase">Status</span>
                                <span className="font-bold text-emerald-600">{lastCheckIn.status}</span>
                            </div>
                            <div className="h-6 w-px bg-slate-200" />
                            <div>
                                <span className="block text-[10px] text-slate-400 uppercase">Method</span>
                                <span className="font-bold text-slate-700">{lastCheckIn.method}</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowSuccessModal(false)}
                            className="mt-5 w-full rounded-xl bg-[#15284b] py-2.5 text-xs font-bold text-white hover:bg-[#1d396a] transition-colors"
                        >
                            Confirm &amp; Return
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
