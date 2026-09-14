import React, { useState } from 'react';
import {
    Calendar,
    CheckCircle2,
    Clock,
    Languages,
    Music,
    Plus,
    Radio,
    Shield,
    UserCheck,
    Users,
    X,
} from 'lucide-react';
import { AttendanceRecord, MassCelebration, MinistryType, Parishioner } from '@/types/parish';

interface MassRosterProps {
    masses: MassCelebration[];
    parishioners: Parishioner[];
    attendances: AttendanceRecord[];
    onUpdateMass: (updated: MassCelebration) => void;
    onAddMass: (newMass: MassCelebration) => void;
}

export const MassRoster: React.FC<MassRosterProps> = ({
    masses,
    parishioners,
    attendances,
    onUpdateMass,
    onAddMass,
}) => {
    const [selectedMassId, setSelectedMassId] = useState<string>(masses[0]?.id || '');
    const [showNewMassModal, setShowNewMassModal] = useState(false);
    const [assigningSlot, setAssigningSlot] = useState<{ massId: string; ministry: MinistryType } | null>(null);

    // New Mass Form
    const [massName, setMassName] = useState('');
    const [massSeason, setMassSeason] = useState('24th Sunday in Ordinary Time (Year B)');
    const [massDate, setMassDate] = useState('2026-09-20');
    const [massTime, setMassTime] = useState('06:00 AM');
    const [massPresider, setMassPresider] = useState("Fr. Hermes 'Larry' Sabud, SM");
    const [massLanguage, setMassLanguage] = useState<MassCelebration['language']>('Cebuano');
    const [massTypeBadge, setMassTypeBadge] = useState<MassCelebration['typeBadge']>('SUNDAY MASS');

    const selectedMass = masses.find((m) => m.id === selectedMassId) || masses[0];

    const getMinistryColor = (ministry: MinistryType) => {
        switch (ministry) {
            case 'Altar Server':
                return { text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500' };
            case 'Choir':
                return { text: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', dot: 'bg-purple-500' };
            case 'Lector & Commentator':
                return { text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500' };
            case 'Extraordinary Minister (Lourdes)':
                return { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500' };
            case 'Sound & Media AV':
                return { text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', dot: 'bg-orange-500' };
            case 'SocCom':
                return { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500' };
            case 'Pianist & Organist':
                return { text: 'text-stone-700', bg: 'bg-stone-50', border: 'border-stone-200', dot: 'bg-stone-500' };
        }
    };

    const handleCreateMass = (e: React.FormEvent) => {
        e.preventDefault();
        const newMass: MassCelebration = {
            id: `mass-${Date.now()}`,
            name: massName || 'Sunday Liturgical Celebration',
            season: massSeason,
            date: massDate,
            time: massTime,
            presider: massPresider,
            language: massLanguage,
            typeBadge: massTypeBadge,
            slots: [
                { ministry: 'Altar Server', requiredCount: 2, assignedMemberIds: [] },
                { ministry: 'Choir', requiredCount: 2, assignedMemberIds: [] },
                { ministry: 'Lector & Commentator', requiredCount: 2, assignedMemberIds: [] },
                { ministry: 'Extraordinary Minister (Lourdes)', requiredCount: 2, assignedMemberIds: [] },
                { ministry: 'Sound & Media AV', requiredCount: 1, assignedMemberIds: [] },
                { ministry: 'SocCom', requiredCount: 1, assignedMemberIds: [] },
                { ministry: 'Pianist & Organist', requiredCount: 1, assignedMemberIds: [] },
            ],
        };
        onAddMass(newMass);
        setSelectedMassId(newMass.id);
        setShowNewMassModal(false);
        setMassName('');
    };

    const handleToggleAssignMember = (parishionerId: string) => {
        if (!assigningSlot) return;
        const mass = masses.find((m) => m.id === assigningSlot.massId);
        if (!mass) return;

        const updatedSlots = mass.slots.map((s) => {
            if (s.ministry === assigningSlot.ministry) {
                const exists = s.assignedMemberIds.includes(parishionerId);
                const assigned = exists
                    ? s.assignedMemberIds.filter((id) => id !== parishionerId)
                    : [...s.assignedMemberIds, parishionerId];
                return { ...s, assignedMemberIds: assigned };
            }
            return s;
        });
        onUpdateMass({ ...mass, slots: updatedSlots });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-extrabold text-slate-900 font-serif tracking-tight">
                        Mass Celebrations &amp; Liturgical Rosters
                    </h2>
                    <p className="text-xs text-slate-500">
                        Assign verified parishioners across 7 sanctuary liturgical ministries &bull; MySQL backed
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setShowNewMassModal(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#15284b] px-4 py-2 text-xs font-bold text-white hover:bg-[#1d396a] shadow-sm transition-colors"
                >
                    <Plus className="size-4" />
                    <span>Schedule New Mass</span>
                </button>
            </div>

            {/* Mass Selection Carousel / Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {masses.map((m) => {
                    const isSelected = m.id === selectedMassId;
                    const totalRequired = m.slots.reduce((acc, s) => acc + s.requiredCount, 0);
                    const totalAssigned = m.slots.reduce((acc, s) => acc + s.assignedMemberIds.length, 0);
                    const percentAssigned = totalRequired > 0 ? Math.round((totalAssigned / totalRequired) * 100) : 0;

                    return (
                        <div
                            key={m.id}
                            onClick={() => setSelectedMassId(m.id)}
                            className={`cursor-pointer rounded-2xl p-4 border transition-all relative overflow-hidden ${
                                isSelected
                                    ? 'border-[#15284b] bg-white ring-2 ring-[#15284b]/20 shadow-md'
                                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                            }`}
                        >
                            <div className="flex items-center justify-between gap-2 mb-2">
                                <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[9px] font-extrabold text-amber-900 uppercase">
                                    {m.typeBadge}
                                </span>
                                <span className="text-[10px] font-mono text-slate-500 font-bold flex items-center gap-1">
                                    <Clock className="size-3 text-slate-400" />
                                    {m.time}
                                </span>
                            </div>

                            <h3 className="font-bold text-sm text-slate-900 line-clamp-1 mb-1 font-serif">
                                {m.name}
                            </h3>

                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                                <Languages className="size-3 text-slate-400" />
                                <span>{m.language}</span>
                            </div>

                            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                                <span className="text-slate-500">Roster Capacity:</span>
                                <span className={`font-bold font-mono ${percentAssigned >= 100 ? 'text-emerald-700' : 'text-amber-700'}`}>
                                    {totalAssigned}/{totalRequired} ({percentAssigned}%)
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Selected Mass Roster Details */}
            {selectedMass && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
                    {/* Mass Banner */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="rounded-md bg-[#15284b] text-white px-2 py-0.5 text-[10px] font-black uppercase">
                                    {selectedMass.typeBadge}
                                </span>
                                <h3 className="text-lg font-black text-slate-900 font-serif">
                                    {selectedMass.name}
                                </h3>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                {selectedMass.season} &bull; Presider: <strong>{selectedMass.presider}</strong>
                            </p>
                        </div>

                        <div className="flex items-center gap-3 text-xs">
                            <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                                <div className="text-[10px] text-slate-400 font-bold uppercase">Date &amp; Time</div>
                                <div className="font-bold text-slate-800 font-mono">{selectedMass.date} &bull; {selectedMass.time}</div>
                            </div>
                            <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                                <div className="text-[10px] text-slate-400 font-bold uppercase">Language</div>
                                <div className="font-bold text-slate-800">{selectedMass.language}</div>
                            </div>
                        </div>
                    </div>

                    {/* Ministry Slots Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedMass.slots.map((slot) => {
                            const colors = getMinistryColor(slot.ministry);
                            const assignedMembers = parishioners.filter((p) => slot.assignedMemberIds.includes(p.id));
                            const checkedInCount = assignedMembers.filter((m) =>
                                attendances.some((a) => a.parishionerId === m.id && a.massId === selectedMass.id)
                            ).length;

                            return (
                                <div
                                    key={slot.ministry}
                                    className={`rounded-2xl border p-4 flex flex-col justify-between transition-all ${colors.bg} ${colors.border}`}
                                >
                                    <div>
                                        {/* Slot Header */}
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`size-2 rounded-full ${colors.dot}`} />
                                                <h4 className={`font-bold text-xs ${colors.text}`}>
                                                    {slot.ministry}
                                                </h4>
                                            </div>
                                            <span className="rounded-md bg-white/90 border border-slate-200 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-700">
                                                Req: {slot.requiredCount}
                                            </span>
                                        </div>

                                        {/* Assigned Names */}
                                        <div className="space-y-1.5 mt-3 min-h-[68px]">
                                            {assignedMembers.length === 0 ? (
                                                <p className="text-[11px] text-slate-400 italic">
                                                    No ministers assigned yet.
                                                </p>
                                            ) : (
                                                assignedMembers.map((m) => {
                                                    const isPresent = attendances.some(
                                                        (a) => a.parishionerId === m.id && a.massId === selectedMass.id
                                                    );
                                                    return (
                                                        <div
                                                            key={m.id}
                                                            className="flex items-center justify-between text-xs bg-white/80 rounded-lg p-1.5 px-2 shadow-2xs"
                                                        >
                                                            <span className="font-semibold text-slate-800 line-clamp-1">
                                                                {m.name}
                                                            </span>
                                                            {isPresent ? (
                                                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md shrink-0">
                                                                    Present
                                                                </span>
                                                            ) : (
                                                                <span className="text-[10px] text-slate-500 font-medium shrink-0 truncate max-w-[120px]" title={`${m.zone} - ${m.gkk}`}>
                                                                    {m.gkk || m.zone}
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center justify-between">
                                        <span className="text-[10px] text-slate-500">
                                            Checked-In: <strong>{checkedInCount}/{slot.assignedMemberIds.length}</strong>
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() => setAssigningSlot({ massId: selectedMass.id, ministry: slot.ministry })}
                                            className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-slate-800 shadow-2xs hover:bg-slate-50 border border-slate-200"
                                        >
                                            Manage Assigned
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Manage Assigned Parishioners Modal */}
            {assigningSlot && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm">
                                    Assign Ministers: {assigningSlot.ministry}
                                </h3>
                                <p className="text-[11px] text-slate-500">
                                    Select parishioners from this ministry roster
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setAssigningSlot(null)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                            >
                                <X className="size-4.5" />
                            </button>
                        </div>

                        <div className="max-h-72 overflow-y-auto space-y-1.5 my-4 pr-1">
                            {parishioners
                                .filter((p) => p.ministry === assigningSlot.ministry)
                                .map((p) => {
                                    const slot = selectedMass.slots.find((s) => s.ministry === assigningSlot.ministry);
                                    const isAssigned = slot?.assignedMemberIds.includes(p.id);

                                    return (
                                        <div
                                            key={p.id}
                                            onClick={() => handleToggleAssignMember(p.id)}
                                            className={`cursor-pointer flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                                                isAssigned
                                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                                                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                                            }`}
                                        >
                                            <div>
                                                <div className="font-bold">{p.name}</div>
                                                <div className="text-[10px] text-slate-500">{p.zone} &bull; {p.gkk || 'No GKK'} &bull; {p.phone}</div>
                                            </div>
                                            <span
                                                className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                                    isAssigned
                                                        ? 'bg-emerald-600 text-white'
                                                        : 'bg-slate-100 text-slate-600'
                                                }`}
                                            >
                                                {isAssigned ? 'Assigned' : 'Click to Assign'}
                                            </span>
                                        </div>
                                    );
                                })}
                        </div>

                        <div className="flex justify-end pt-3 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setAssigningSlot(null)}
                                className="rounded-xl bg-[#15284b] px-4 py-2 text-xs font-bold text-white hover:bg-[#1d396a]"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Schedule New Mass Modal */}
            {showNewMassModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="font-bold text-slate-900 text-sm">Schedule Liturgical Celebration</h3>
                            <button
                                type="button"
                                onClick={() => setShowNewMassModal(false)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                            >
                                <X className="size-4.5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateMass} className="mt-4 space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-800 mb-1">Celebration Name</label>
                                <input
                                    type="text"
                                    required
                                    value={massName}
                                    onChange={(e) => setMassName(e.target.value)}
                                    placeholder="e.g. Sunday Youth Mass"
                                    style={{ color: '#000000', WebkitTextFillColor: '#000000', backgroundColor: '#ffffff', opacity: 1 }}
                                    className="w-full rounded-xl border border-slate-300 !bg-white px-3.5 py-2.5 text-sm !text-black font-medium focus:border-[#340299] focus:outline-hidden"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-800 mb-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={massDate}
                                        onChange={(e) => setMassDate(e.target.value)}
                                        style={{ color: '#000000', WebkitTextFillColor: '#000000', backgroundColor: '#ffffff', opacity: 1 }}
                                        className="w-full rounded-xl border border-slate-300 !bg-white px-3.5 py-2 text-xs !text-black font-medium focus:border-[#340299] focus:outline-hidden"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-800 mb-1">Time</label>
                                    <input
                                        type="text"
                                        required
                                        value={massTime}
                                        onChange={(e) => setMassTime(e.target.value)}
                                        placeholder="06:00 AM"
                                        style={{ color: '#000000', WebkitTextFillColor: '#000000', backgroundColor: '#ffffff', opacity: 1 }}
                                        className="w-full rounded-xl border border-slate-300 !bg-white px-3.5 py-2 text-xs !text-black font-medium focus:border-[#340299] focus:outline-hidden font-mono"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-800 mb-1">Language</label>
                                    <select
                                        value={massLanguage}
                                        onChange={(e) => setMassLanguage(e.target.value as MassCelebration['language'])}
                                        style={{ color: '#000000', WebkitTextFillColor: '#000000', backgroundColor: '#ffffff', opacity: 1 }}
                                        className="w-full rounded-xl border border-slate-300 !bg-white px-3.5 py-2 text-xs !text-black font-medium focus:border-[#340299] focus:outline-hidden"
                                    >
                                        <option value="Cebuano">Cebuano</option>
                                        <option value="English">English</option>
                                        <option value="English/Cebuano">English/Cebuano</option>
                                        <option value="English/Tagalog">English/Tagalog</option>
                                        <option value="Tagalog">Tagalog</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-800 mb-1">Type Badge</label>
                                    <select
                                        value={massTypeBadge}
                                        onChange={(e) => setMassTypeBadge(e.target.value as MassCelebration['typeBadge'])}
                                        style={{ color: '#000000', WebkitTextFillColor: '#000000', backgroundColor: '#ffffff', opacity: 1 }}
                                        className="w-full rounded-xl border border-slate-300 !bg-white px-3.5 py-2 text-xs !text-black font-medium focus:border-[#340299] focus:outline-hidden"
                                    >
                                        <option value="SUNDAY MASS">SUNDAY MASS</option>
                                        <option value="YOUTH MASS">YOUTH MASS</option>
                                        <option value="ANTICIPATED MASS">ANTICIPATED MASS</option>
                                        <option value="FIESTA MASS">FIESTA MASS</option>
                                        <option value="WEEKDAY MASS">WEEKDAY MASS</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-800 mb-1">Presider Priest</label>
                                <input
                                    type="text"
                                    value={massPresider}
                                    onChange={(e) => setMassPresider(e.target.value)}
                                    placeholder="Fr. Hermes 'Larry' Sabud, SM"
                                    style={{ color: '#000000', WebkitTextFillColor: '#000000', backgroundColor: '#ffffff', opacity: 1 }}
                                    className="w-full rounded-xl border border-slate-300 !bg-white px-3.5 py-2.5 text-sm !text-black font-medium focus:border-[#340299] focus:outline-hidden"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowNewMassModal(false)}
                                    className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-xl bg-[#15284b] px-5 py-2 text-xs font-bold text-white hover:bg-[#1d396a]"
                                >
                                    Schedule Mass
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
