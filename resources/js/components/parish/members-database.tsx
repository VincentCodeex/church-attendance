import React, { useState } from 'react';
import {
    BadgeCheck,
    Download,
    IdCard,
    Mail,
    MapPin,
    Phone,
    Plus,
    Printer,
    Search,
    Shield,
    ShieldCheck,
    UserCheck,
    UserPlus,
    Users,
    X,
} from 'lucide-react';
import { ParishCrest } from '@/components/parish/parish-crest';
import { MinistryType, PARISH_ZONES_AND_GKKS, Parishioner, ZoneType } from '@/types/parish';

interface MembersDatabaseProps {
    parishioners: Parishioner[];
    onAddParishioner: (newMember: Parishioner) => void;
    onUpdateParishioner: (updated: Parishioner) => void;
}

export const MembersDatabase: React.FC<MembersDatabaseProps> = ({
    parishioners,
    onAddParishioner,
    onUpdateParishioner,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedZone, setSelectedZone] = useState<string>('All');
    const [selectedGkk, setSelectedGkk] = useState<string>('All');
    const [selectedMinistry, setSelectedMinistry] = useState<string>('All');
    const [viewingIdCard, setViewingIdCard] = useState<Parishioner | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);

    // Zones (Covered exclusively Zone 1 to 5)
    const zones: ZoneType[] = ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5'];

    // New Member Form State
    const [newName, setNewName] = useState('');
    const [newZone, setNewZone] = useState<ZoneType>('Zone 1');
    const [newGkk, setNewGkk] = useState<string>(PARISH_ZONES_AND_GKKS['Zone 1'][0]);
    const [newMinistry, setNewMinistry] = useState<MinistryType>('Altar Server');
    const [newEmail, setNewEmail] = useState('');
    const [newPhone, setNewPhone] = useState('0917-');
    const [newPin, setNewPin] = useState('');

    const ministries: MinistryType[] = [
        'Altar Server',
        'Choir',
        'Lector & Commentator',
        'Extraordinary Minister (Lourdes)',
        'Sound & Media AV',
        'SocCom',
        'Pianist & Organist',
    ];

    const handleZoneChange = (zone: ZoneType) => {
        setNewZone(zone);
        const gkksForZone = PARISH_ZONES_AND_GKKS[zone] || [];
        if (gkksForZone.length > 0) {
            setNewGkk(gkksForZone[0]);
        }
    };

    const filtered = parishioners
        .filter((p) => (selectedZone === 'All' ? true : p.zone === selectedZone))
        .filter((p) => (selectedGkk === 'All' ? true : p.gkk === selectedGkk))
        .filter((p) => (selectedMinistry === 'All' ? true : p.ministry === selectedMinistry))
        .filter((p) =>
            searchQuery
                ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.memberId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (p.gkk && p.gkk.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  p.phone.includes(searchQuery)
                : true
        );

    const handleCreateMember = (e: React.FormEvent) => {
        e.preventDefault();
        const nextNum = parishioners.length + 1;
        const newMember: Parishioner = {
            id: `par-${Date.now()}`,
            memberId: `FAT-2026-${String(nextNum).padStart(3, '0')}`,
            name: newName,
            pin: newPin || `${1000 + nextNum}`,
            zone: newZone,
            gkk: newGkk || PARISH_ZONES_AND_GKKS[newZone][0],
            ministry: newMinistry,
            email: newEmail || `${newName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
            phone: newPhone,
            isActive: true,
            joinDate: new Date().toISOString().split('T')[0],
        };

        onAddParishioner(newMember);
        setShowAddModal(false);
        setNewName('');
        setNewPin('');
        setNewEmail('');
        setNewPhone('0917-');
    };

    const handlePrintId = () => {
        window.print();
    };

    return (
        <div className="space-y-6">
            {/* Header with Add Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-extrabold text-slate-900 font-serif tracking-tight">
                        Parishioner Directory &amp; Pastoral Roster
                    </h2>
                    <p className="text-xs text-slate-500">
                        Official parish registry across 5 pastoral zones &amp; 24 GKK communities &bull; MySQL backed
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#15284b] hover:bg-[#1d396a] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all"
                >
                    <UserPlus className="size-4" />
                    <span>Register New Parishioner</span>
                </button>
            </div>

            {/* Filter Bar */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 size-4 text-slate-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, member ID, GKK, phone, or PIN..."
                        style={{ color: '#000000', WebkitTextFillColor: '#000000', backgroundColor: '#ffffff', opacity: 1 }}
                        className="w-full rounded-xl border border-slate-300 !bg-white pl-9 pr-4 py-2.5 text-sm !text-black placeholder:!text-slate-500 font-medium focus:border-[#340299] focus:outline-hidden focus:ring-2 focus:ring-[#340299]/20 transition-all"
                    />
                </div>

                {/* Zone Filter */}
                <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
                        Zone:
                    </label>
                    <select
                        value={selectedZone}
                        onChange={(e) => {
                            setSelectedZone(e.target.value);
                            setSelectedGkk('All');
                        }}
                        style={{ color: '#000000', WebkitTextFillColor: '#000000', backgroundColor: '#ffffff', opacity: 1 }}
                        className="rounded-xl border border-slate-300 !bg-white px-3 py-2 text-xs font-medium !text-black focus:border-[#340299] focus:outline-hidden"
                    >
                        <option value="All">All Zones (1-5)</option>
                        {zones.map((z) => (
                            <option key={z} value={z}>
                                {z}
                            </option>
                        ))}
                    </select>
                </div>

                {/* GKK Filter */}
                <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
                        GKK:
                    </label>
                    <select
                        value={selectedGkk}
                        onChange={(e) => setSelectedGkk(e.target.value)}
                        style={{ color: '#000000', WebkitTextFillColor: '#000000', backgroundColor: '#ffffff', opacity: 1 }}
                        className="rounded-xl border border-slate-300 !bg-white px-3 py-2 text-xs font-medium !text-black focus:border-[#340299] focus:outline-hidden max-w-[200px] truncate"
                    >
                        <option value="All">All 24 GKKs</option>
                        {selectedZone !== 'All'
                            ? (PARISH_ZONES_AND_GKKS[selectedZone as ZoneType] || []).map((g) => (
                                  <option key={g} value={g}>
                                      {g}
                                  </option>
                              ))
                            : Object.entries(PARISH_ZONES_AND_GKKS).flatMap(([z, list]) =>
                                  list.map((g) => (
                                      <option key={g} value={g}>
                                          {z}: {g}
                                      </option>
                                  ))
                              )}
                    </select>
                </div>

                {/* Ministry Filter */}
                <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
                        Ministry:
                    </label>
                    <select
                        value={selectedMinistry}
                        onChange={(e) => setSelectedMinistry(e.target.value)}
                        style={{ color: '#000000', WebkitTextFillColor: '#000000', backgroundColor: '#ffffff', opacity: 1 }}
                        className="rounded-xl border border-slate-300 !bg-white px-3 py-2 text-xs font-medium !text-black focus:border-[#340299] focus:outline-hidden"
                    >
                        <option value="All">All Ministries</option>
                        {ministries.map((m) => (
                            <option key={m} value={m}>
                                {m}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Parishioners Table */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                <th className="py-3 px-4">Member Name</th>
                                <th className="py-3 px-4">Member ID &amp; PIN</th>
                                <th className="py-3 px-4">Zone</th>
                                <th className="py-3 px-4">GKK Community</th>
                                <th className="py-3 px-4">Primary Ministry</th>
                                <th className="py-3 px-4">Contact Info</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 text-right">Official Pass</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-slate-400">
                                        <Users className="size-8 mx-auto text-slate-300 mb-2" />
                                        <p className="font-semibold text-slate-600">No parishioners found in the database.</p>
                                        <p className="text-[11px] text-slate-400 mt-1">
                                            Click &quot;Register New Parishioner&quot; above to add members with their respective Zone and GKK community!
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-full bg-[#15284b] text-white flex items-center justify-center font-bold text-xs">
                                                    {p.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900">{p.name}</div>
                                                    <div className="text-[10px] text-slate-400">Registered {p.joinDate}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <div className="font-mono font-bold text-slate-800">{p.memberId}</div>
                                            <div className="text-[10px] font-mono text-slate-400">PIN: {p.pin}</div>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span className="font-semibold text-slate-800">{p.zone}</span>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center gap-1.5 font-medium text-slate-700">
                                                <MapPin className="size-3 text-amber-600 shrink-0" />
                                                <span>{p.gkk || 'GKK Unassigned'}</span>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-800">
                                                {p.ministry}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-600">
                                            <div>{p.phone}</div>
                                            <div className="text-[10px] text-slate-400">{p.email}</div>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                                <span className="size-1.5 rounded-full bg-emerald-500" />
                                                Active
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => setViewingIdCard(p)}
                                                className="inline-flex items-center gap-1 rounded-xl bg-[#15284b] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#1d396a] transition-colors shadow-2xs"
                                            >
                                                <IdCard className="size-3.5" />
                                                <span>View Pass</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
                    <span>
                        Total Registered: <strong>{parishioners.length}</strong> parishioners across 5 Zones &amp; 24 GKKs
                    </span>
                    <span>Diocese of Digos &bull; Our Lady of Fatima Parish</span>
                </div>
            </div>

            {/* Official ID Pass Modal (Printable, Dignified, No QR) */}
            {viewingIdCard && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
                    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="font-bold text-slate-900 text-sm">Official Parish Identification Pass</h3>
                            <button
                                type="button"
                                onClick={() => setViewingIdCard(null)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                            >
                                <X className="size-4.5" />
                            </button>
                        </div>

                        {/* ID CARD PREVIEW (Printable) */}
                        <div
                            id="parish-id-card"
                            className="relative overflow-hidden rounded-2xl bg-[#162c4e] text-white p-6 shadow-xl border-2 border-amber-400/70"
                        >
                            {/* Watermark Crest */}
                            <div className="pointer-events-none absolute -bottom-10 -right-10 opacity-15 select-none">
                                <ParishCrest size={220} />
                            </div>

                            {/* Card Header */}
                            <div className="flex items-center justify-between gap-3 border-b border-amber-400/30 pb-3">
                                <div className="flex items-center gap-2.5">
                                    <ParishCrest size={40} />
                                    <div>
                                        <span className="block text-[9px] uppercase tracking-widest text-slate-300 font-semibold">
                                            Diocese of Digos
                                        </span>
                                        <h4 className="text-xs font-bold text-white font-serif">
                                            OUR LADY OF FATIMA PARISH
                                        </h4>
                                        <span className="text-[9px] italic text-amber-300 font-serif">
                                            &ldquo;Cura Dei Genetrix&rdquo;
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="inline-block rounded-sm bg-amber-400 text-slate-950 px-1.5 py-0.5 text-[8px] font-black uppercase">
                                        OFFICIAL PASS
                                    </span>
                                </div>
                            </div>

                            {/* Card Body: Photo, Info */}
                            <div className="my-4 grid grid-cols-12 gap-3 items-center">
                                {/* Photo / Avatar */}
                                <div className="col-span-4 flex flex-col items-center">
                                    <div className="size-20 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-md">
                                        <div className="size-full rounded-[10px] bg-[#162c4e] flex items-center justify-center text-amber-300 font-bold text-2xl font-serif">
                                            {viewingIdCard.name
                                                .split(' ')
                                                .map((n) => n[0])
                                                .join('')
                                                .slice(0, 2)}
                                        </div>
                                    </div>
                                    <span className="mt-1.5 font-mono text-[9px] text-amber-300 font-bold">
                                        PIN: {viewingIdCard.pin}
                                    </span>
                                </div>

                                {/* Details */}
                                <div className="col-span-8 space-y-1">
                                    <h5 className="font-bold text-white text-sm font-serif leading-tight">
                                        {viewingIdCard.name}
                                    </h5>
                                    <div className="inline-block rounded-md bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-400/40">
                                        {viewingIdCard.ministry}
                                    </div>
                                    <p className="text-[10px] text-slate-300 pt-0.5">
                                        {viewingIdCard.zone} &bull; <strong className="text-white">{viewingIdCard.gkk || 'GKK Unassigned'}</strong>
                                    </p>
                                    <p className="text-[9px] font-mono text-slate-400">
                                        Member ID: <strong className="text-white">{viewingIdCard.memberId}</strong>
                                    </p>
                                </div>
                            </div>

                            {/* Card Footer: Official Parish Authentication & Signature (No QR) */}
                            <div className="pt-3 border-t border-white/15 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-white/15 rounded-lg border border-white/20">
                                        <ShieldCheck className="size-6 text-amber-300" />
                                    </div>
                                    <div>
                                        <div className="text-[9px] font-bold text-white">4-Digit PIN Access</div>
                                        <span className="text-[8px] text-slate-300">Sanctuary Kiosk Ready</span>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-[8px] italic text-amber-300 font-serif">
                                        Fr. Hermes &apos;Larry&apos; Sabud, SM
                                    </div>
                                    <span className="text-[7px] text-slate-400 uppercase tracking-wider">
                                        Parish Priest &amp; Administrator
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ID Card Actions */}
                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={handlePrintId}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                <Printer className="size-3.5" />
                                <span>Print Pass</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewingIdCard(null)}
                                className="rounded-xl bg-[#15284b] px-5 py-2 text-xs font-bold text-white hover:bg-[#1d396a] transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Parishioner Modal with Dynamic GKK Choices */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm">Register New Parishioner</h3>
                                <p className="text-[11px] text-slate-500">
                                    Assign member to their respective Zone (1 to 5) and GKK Christian Community
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowAddModal(false)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                            >
                                <X className="size-4.5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateMember} className="mt-4 space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-800 mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="e.g. Maria Clara Santos"
                                    style={{ color: '#000000', WebkitTextFillColor: '#000000', backgroundColor: '#ffffff', opacity: 1 }}
                                    className="w-full rounded-xl border border-slate-300 !bg-white px-3.5 py-2.5 text-sm !text-black placeholder:!text-slate-500 font-medium focus:border-[#340299] focus:ring-2 focus:ring-[#340299]/20 focus:outline-hidden transition-all"
                                />
                            </div>

                            {/* Zone & GKK Selection Row (Step 1 Pick Zone -> Step 2 Pick GKK) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                                        <span>1. Pastoral Zone</span>
                                        <span className="text-[10px] text-amber-700 font-semibold uppercase">Step 1: Pick Zone</span>
                                    </label>
                                    <select
                                        value={newZone}
                                        onChange={(e) => handleZoneChange(e.target.value as ZoneType)}
                                        style={{ color: '#000000', WebkitTextFillColor: '#000000', backgroundColor: '#ffffff', opacity: 1 }}
                                        className="w-full rounded-xl border-2 border-[#15284b]/20 !bg-white px-3.5 py-2.5 text-sm !text-black font-bold focus:border-[#340299] focus:ring-2 focus:ring-[#340299]/20 focus:outline-hidden transition-all"
                                    >
                                        {zones.map((z) => (
                                            <option key={z} value={z}>
                                                {z}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                                        <span>2. GKK Chapel Community</span>
                                        <span className="text-[10px] text-emerald-700 font-semibold">{newZone} GKKs</span>
                                    </label>
                                    <select
                                        value={newGkk}
                                        onChange={(e) => setNewGkk(e.target.value)}
                                        style={{ color: '#000000', WebkitTextFillColor: '#000000', backgroundColor: '#ffffff', opacity: 1 }}
                                        className="w-full rounded-xl border-2 border-emerald-600/30 !bg-white px-3.5 py-2.5 text-sm !text-black font-bold focus:border-[#340299] focus:ring-2 focus:ring-[#340299]/20 focus:outline-hidden transition-all"
                                    >
                                        {(PARISH_ZONES_AND_GKKS[newZone] || []).map((g) => (
                                            <option key={g} value={g}>
                                                {g}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Real-time Zone & GKK Chapel Confirmation Badge */}
                            <div className="rounded-xl bg-amber-50/90 border border-amber-200 px-3 py-2 text-xs flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-amber-950 font-medium">
                                    <MapPin className="size-3.5 text-amber-600 shrink-0" />
                                    <span>Selected Chapel: <strong>{newGkk}</strong></span>
                                </div>
                                <span className="rounded-md bg-[#15284b] px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                                    {newZone}
                                </span>
                            </div>

                            {/* Ministry & PIN */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-800 mb-1">
                                        Primary Ministry
                                    </label>
                                    <select
                                        value={newMinistry}
                                        onChange={(e) => setNewMinistry(e.target.value as MinistryType)}
                                        style={{ color: '#000000', WebkitTextFillColor: '#000000', backgroundColor: '#ffffff', opacity: 1 }}
                                        className="w-full rounded-xl border border-slate-300 !bg-white px-3.5 py-2.5 text-sm !text-black font-medium focus:border-[#340299] focus:ring-2 focus:ring-[#340299]/20 focus:outline-hidden transition-all"
                                    >
                                        {ministries.map((m) => (
                                            <option key={m} value={m}>
                                                {m}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-800 mb-1">
                                        4-Digit PIN (for Kiosk)
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={4}
                                        value={newPin}
                                        onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                                        placeholder="Auto-generated if blank"
                                        style={{ color: '#000000', WebkitTextFillColor: '#000000', backgroundColor: '#ffffff', opacity: 1 }}
                                        className="w-full rounded-xl border border-slate-300 !bg-white px-3.5 py-2.5 text-sm !text-black placeholder:!text-slate-500 font-medium focus:border-[#340299] focus:ring-2 focus:ring-[#340299]/20 focus:outline-hidden transition-all font-mono"
                                    />
                                </div>
                            </div>

                            {/* Contact Details */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-800 mb-1">
                                        Contact Phone
                                    </label>
                                    <input
                                        type="text"
                                        value={newPhone}
                                        onChange={(e) => setNewPhone(e.target.value)}
                                        placeholder="0917-000-0000"
                                        style={{ color: '#000000', WebkitTextFillColor: '#000000', backgroundColor: '#ffffff', opacity: 1 }}
                                        className="w-full rounded-xl border border-slate-300 !bg-white px-3.5 py-2.5 text-sm !text-black placeholder:!text-slate-500 font-medium focus:border-[#340299] focus:ring-2 focus:ring-[#340299]/20 focus:outline-hidden transition-all font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-800 mb-1">
                                        Email Address (Optional)
                                    </label>
                                    <input
                                        type="email"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        placeholder="parishioner@gmail.com"
                                        style={{ color: '#000000', WebkitTextFillColor: '#000000', backgroundColor: '#ffffff', opacity: 1 }}
                                        className="w-full rounded-xl border border-slate-300 !bg-white px-3.5 py-2.5 text-sm !text-black placeholder:!text-slate-500 font-medium focus:border-[#340299] focus:ring-2 focus:ring-[#340299]/20 focus:outline-hidden transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-xl bg-[#15284b] px-5 py-2 text-xs font-bold text-white hover:bg-[#1d396a] shadow-sm transition-all"
                                >
                                    Register Parishioner
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
