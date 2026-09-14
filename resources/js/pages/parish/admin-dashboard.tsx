import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    ArrowRight,
    BarChart3,
    Calendar,
    CheckCircle2,
    Clock,
    FileSpreadsheet,
    FileText,
    LogOut,
    Menu,
    Plus,
    RefreshCw,
    Shield,
    ShieldCheck,
    UserCheck,
    UserPlus,
    Users,
    X,
} from 'lucide-react';
import { ParishCrest } from '@/components/parish/parish-crest';
import {
    loadParishState,
    saveParishState,
    ParishState,
    playSanctuaryChime,
} from '@/lib/parish-store';
import {
    apiCheckIn,
    apiDeleteAttendance,
    apiAddParishioner,
    apiUpdateParishioner,
    apiCreateMass,
    apiUpdateMassAssignments,
    apiSetActiveMass,
    apiResetDatabase,
    apiSetLiturgicalSeason,
} from '@/lib/parish-api';
import { getLiturgicalTheme, ALL_LITURGICAL_SEASONS, LITURGICAL_THEMES } from '@/lib/parish-theme';
import { AttendanceRecord, LiturgicalSeason, MassCelebration, MinistryType, Parishioner } from '@/types/parish';
import { RealtimeKiosk } from '@/components/parish/realtime-kiosk';
import { MassRoster } from '@/components/parish/mass-roster';
import { MembersDatabase } from '@/components/parish/members-database';
import { PastoralReport } from '@/components/parish/pastoral-report';

export type PortalType = 'dashboard' | 'checkin' | 'schedules' | 'database' | 'reports';

interface ParishAdminDashboardProps {
    initialData?: ParishState;
}

export default function ParishAdminDashboard({ initialData }: ParishAdminDashboardProps) {
    const [state, setState] = useState<ParishState>(() => loadParishState(initialData));
    const [activePortal, setActivePortal] = useState<PortalType>('dashboard');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showSeasonModal, setShowSeasonModal] = useState(false);
    const [selectedRadarMinistry, setSelectedRadarMinistry] = useState<MinistryType | null>(null);

    const currentSeason: LiturgicalSeason = state.liturgicalSeason || 'Ordinary Time';
    const liturgicalTheme = getLiturgicalTheme(currentSeason);

    // Sync with initialData if it changes
    useEffect(() => {
        if (initialData) {
            setState(initialData);
        }
    }, [initialData]);

    // Active Admin (Sole Administrator: Fr. Hermes)
    const currentAdmin =
        state.admins.find((a) => a.id === state.currentAdminId) || state.admins[0] || {
            id: 'admin-1',
            name: "Fr. Hermes 'Larry' Sabud, SM",
            title: 'Parish Priest & Administrator',
            role: 'Parish Priest',
            username: '@fr.larry',
            email: 'fr.larry@fatimaparish.ph',
            pin: '1917',
            initials: 'FH',
            avatarColor: 'bg-amber-600',
        };

    // Active Mass for Radar
    const activeMass =
        state.masses.find((m) => m.id === state.activeMassId) || state.masses[0] || {
            id: 'mass-1',
            name: 'Sunday Dawn Mass (Misa de Gallo)',
            season: '24th Sunday in Ordinary Time (Year B)',
            date: '2026-09-20',
            time: '06:00 AM',
            presider: "Fr. Hermes 'Larry' Sabud, SM",
            language: 'Cebuano',
            typeBadge: 'SUNDAY MASS',
            slots: [],
        };

    // Compute duty readiness for active mass
    const totalRequiredMinisters = activeMass.slots.reduce(
        (acc, s) => acc + s.requiredCount,
        0
    );

    // How many distinct ministers assigned to this mass have checked in?
    const assignedIdsForActiveMass = activeMass.slots.flatMap((s) => s.assignedMemberIds);
    const checkedInMinistersCount = assignedIdsForActiveMass.filter((id) =>
        state.attendances.some(
            (a) => a.parishionerId === id && a.massId === activeMass.id
        )
    ).length;

    const dutyReadinessPercent =
        totalRequiredMinisters > 0
            ? Math.round((checkedInMinistersCount / totalRequiredMinisters) * 100)
            : 0;

    // Overall Punctuality KPI
    const totalAtt = state.attendances.length;
    const onTimeAtt = state.attendances.filter((a) => a.status === 'On-Time').length;
    const punctualityScore = totalAtt > 0 ? Math.round((onTimeAtt / totalAtt) * 100) : 73;

    // Handlers with direct MySQL integration
    const handleCheckIn = async (record: Omit<AttendanceRecord, 'id'>) => {
        const tempId = `att-${Date.now()}`;
        const newRecord: AttendanceRecord = {
            ...record,
            id: tempId,
        };
        const updated = {
            ...state,
            attendances: [newRecord, ...state.attendances],
        };
        setState(updated);
        saveParishState(updated);

        try {
            const res = await apiCheckIn(record);
            if (res.state) {
                setState(res.state);
                saveParishState(res.state);
            }
        } catch (err) {
            console.error('Check-in error', err);
        }
    };

    const handleDeleteAttendance = async (id: string) => {
        const updated = {
            ...state,
            attendances: state.attendances.filter((a) => a.id !== id),
        };
        setState(updated);
        saveParishState(updated);

        try {
            const res = await apiDeleteAttendance(id);
            if (res.state) {
                setState(res.state);
                saveParishState(res.state);
            }
        } catch (err) {
            console.error('Delete attendance error', err);
        }
    };

    const handleUpdateMass = async (updatedMass: MassCelebration) => {
        const updated = {
            ...state,
            masses: state.masses.map((m) => (m.id === updatedMass.id ? updatedMass : m)),
        };
        setState(updated);
        saveParishState(updated);

        try {
            await apiUpdateMassAssignments(updatedMass.id, updatedMass.slots);
        } catch (err) {
            console.error('Update mass error', err);
        }
    };

    const handleAddMass = async (newMass: MassCelebration) => {
        const updated = {
            ...state,
            masses: [...state.masses, newMass],
            activeMassId: newMass.id,
        };
        setState(updated);
        saveParishState(updated);

        try {
            const res = await apiCreateMass(newMass);
            if (res.state) {
                setState(res.state);
                saveParishState(res.state);
            }
        } catch (err) {
            console.error('Add mass error', err);
        }
    };

    const handleSetActiveMass = async (id: string) => {
        const updated = { ...state, activeMassId: id };
        setState(updated);
        saveParishState(updated);
        try {
            await apiSetActiveMass(id);
        } catch (err) {
            console.error('Set active mass error', err);
        }
    };

    const handleAddParishioner = async (newMember: Parishioner) => {
        const updated = {
            ...state,
            parishioners: [newMember, ...state.parishioners],
        };
        setState(updated);
        saveParishState(updated);

        try {
            const res = await apiAddParishioner({
                name: newMember.name,
                zone: newMember.zone,
                gkk: newMember.gkk,
                ministry: newMember.ministry,
                pin: newMember.pin,
                email: newMember.email,
                phone: newMember.phone,
            });
            if (res.state) {
                setState(res.state);
                saveParishState(res.state);
            }
        } catch (err) {
            console.error('Add parishioner error', err);
        }
    };

    const handleUpdateParishioner = async (updatedMember: Parishioner) => {
        const updated = {
            ...state,
            parishioners: state.parishioners.map((p) => (p.id === updatedMember.id ? updatedMember : p)),
        };
        setState(updated);
        saveParishState(updated);

        try {
            await apiUpdateParishioner(updatedMember.id, updatedMember);
        } catch (err) {
            console.error('Update parishioner error', err);
        }
    };

    const handleResetDefaults = async () => {
        if (confirm('Reset parish system and refresh the official diocesan roster in MySQL database churchattendace?')) {
            try {
                const res = await apiResetDatabase();
                if (res.state) {
                    setState(res.state);
                    saveParishState(res.state);
                }
            } catch (err) {
                alert('Database reset error: ' + (err as Error).message);
            }
        }
    };

    const handleChangeLiturgicalSeason = async (newSeason: LiturgicalSeason) => {
        const updated = { ...state, liturgicalSeason: newSeason };
        setState(updated);
        saveParishState(updated);
        setShowSeasonModal(false);

        try {
            const res = await apiSetLiturgicalSeason(newSeason);
            if (res.state) {
                setState(res.state);
                saveParishState(res.state);
            }
        } catch (err) {
            console.error('Set season error', err);
        }
    };

    const handleLogout = () => {
        router.visit('/');
    };

    return (
        <>
            <Head title="Parish Leadership Command Center • Our Lady of Fatima Parish" />

            <div className="flex h-screen w-full flex-col bg-slate-100 antialiased font-sans text-slate-800 overflow-hidden">
                {/* =========================================================================
                    TOP HEADER: Marian Navy (#15284b) with Liturgical Accents
                   ========================================================================= */}
                <header className="h-16 bg-[#15284b] text-white flex items-center justify-between px-4 sm:px-6 shadow-md z-40 border-b border-white/10 shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                            aria-label="Toggle sidebar"
                        >
                            <Menu className="size-5" />
                        </button>

                        <div className="flex items-center gap-2.5">
                            <ParishCrest className="size-9 drop-shadow-sm shrink-0" />
                            <div>
                                <h1 className="font-extrabold text-sm sm:text-base tracking-tight font-serif uppercase text-white leading-tight">
                                    Our Lady of Fatima Parish
                                </h1>
                                <p className="text-[10px] text-amber-300 tracking-wider uppercase font-semibold">
                                    Diocese of Digos &bull; Liturgical Ministry Command
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Liturgical Season Badge & Selector */}
                        <button
                            type="button"
                            onClick={() => setShowSeasonModal(true)}
                            className="hidden md:flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 border border-white/15 transition-all shadow-2xs"
                        >
                            <span
                                className="size-2.5 rounded-full"
                                style={{ backgroundColor: liturgicalTheme.primaryHex }}
                            />
                            <span>{currentSeason}</span>
                            <span className="text-[10px] text-amber-300 uppercase font-mono">
                                ({liturgicalTheme.colorName})
                            </span>
                        </button>

                        {/* Public Entrance Kiosk Link */}
                        <a
                            href="/kiosk"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-400/20 transition-colors"
                        >
                            <UserCheck className="size-3.5 text-amber-300" />
                            <span className="hidden sm:inline">Entrance Kiosk</span>
                        </a>

                        {/* User Profile Pill (Single Admin) */}
                        <div className="flex items-center gap-2 rounded-xl bg-white/10 py-1 px-2.5 border border-white/10">
                            <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500 font-bold text-xs text-slate-950">
                                {currentAdmin.initials}
                            </div>
                            <div className="hidden lg:block text-left text-xs leading-tight">
                                <div className="font-bold text-white line-clamp-1">
                                    {currentAdmin.name}
                                </div>
                                <div className="text-[10px] text-amber-300">
                                    {currentAdmin.title}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* =========================================================================
                    PAGE BODY: SIDEBAR + MAIN CONTENT
                   ========================================================================= */}
                <div className="flex-1 flex overflow-hidden">
                    {/* LEFT SIDEBAR: Deep Marian Navy (#112038) */}
                    <aside
                        className={`${
                            sidebarCollapsed ? 'w-20' : 'w-72'
                        } shrink-0 bg-[#112038] border-r border-[#1a3153] text-slate-300 flex flex-col justify-between transition-all duration-300 z-30`}
                    >
                        {/* Sidebar Top: Current User Card & Navigation */}
                        <div className="p-4 space-y-5 overflow-y-auto">
                            {/* Current Admin Card */}
                            {!sidebarCollapsed && (
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-extrabold text-sm shadow-sm">
                                            {currentAdmin.initials}
                                        </div>
                                        <div className="overflow-hidden">
                                            <div className="font-bold text-xs text-white truncate">
                                                {currentAdmin.name}
                                            </div>
                                            <div className="text-[11px] text-amber-300 font-medium truncate">
                                                {currentAdmin.title}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px]">
                                        <span className="text-slate-400 font-medium">
                                            Sole Admin
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            className="inline-flex items-center gap-1 text-rose-300 hover:text-rose-200 transition-colors"
                                        >
                                            <LogOut className="size-3" />
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* LITURGICAL PORTALS Nav Menu */}
                            <div>
                                {!sidebarCollapsed && (
                                    <span className="block text-[10px] font-extrabold tracking-widest text-slate-400 uppercase mb-2 px-2">
                                        Pastoral Portals
                                    </span>
                                )}

                                <nav className="space-y-1">
                                    {/* 1. Admin Dashboard */}
                                    <button
                                        type="button"
                                        onClick={() => setActivePortal('dashboard')}
                                        className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                                            activePortal === 'dashboard'
                                                ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                                                : 'text-slate-300 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 truncate">
                                            <Activity className="size-4 shrink-0" />
                                            {!sidebarCollapsed && (
                                                <div className="text-left">
                                                    <div className="truncate">Command Center</div>
                                                    <div className={`text-[10px] font-normal ${activePortal === 'dashboard' ? 'text-slate-800' : 'text-slate-400'}`}>
                                                        Liturgy readiness &amp; KPIs
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </button>

                                    {/* 2. Realtime Check-In Kiosk */}
                                    <button
                                        type="button"
                                        onClick={() => setActivePortal('checkin')}
                                        className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                                            activePortal === 'checkin'
                                                ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                                                : 'text-slate-300 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 truncate">
                                            <UserCheck className="size-4 shrink-0" />
                                            {!sidebarCollapsed && (
                                                <div className="text-left">
                                                    <div className="truncate">Sanctuary Check-In</div>
                                                    <div className={`text-[10px] font-normal ${activePortal === 'checkin' ? 'text-slate-800' : 'text-slate-400'}`}>
                                                        PIN keypad &amp; live arrivals
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </button>

                                    {/* 3. Mass Schedules & Ministry Rosters */}
                                    <button
                                        type="button"
                                        onClick={() => setActivePortal('schedules')}
                                        className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                                            activePortal === 'schedules'
                                                ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                                                : 'text-slate-300 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 truncate">
                                            <Calendar className="size-4 shrink-0" />
                                            {!sidebarCollapsed && (
                                                <div className="text-left">
                                                    <div className="truncate">Mass Celebrations</div>
                                                    <div className={`text-[10px] font-normal ${activePortal === 'schedules' ? 'text-slate-800' : 'text-slate-400'}`}>
                                                        Liturgical slots &amp; duties
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </button>

                                    {/* 4. Parishioner Database & Printable Pass */}
                                    <button
                                        type="button"
                                        onClick={() => setActivePortal('database')}
                                        className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                                            activePortal === 'database'
                                                ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                                                : 'text-slate-300 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 truncate">
                                            <Users className="size-4 shrink-0" />
                                            {!sidebarCollapsed && (
                                                <div className="text-left">
                                                    <div className="truncate">Parishioners &amp; Roster</div>
                                                    <div className={`text-[10px] font-normal ${activePortal === 'database' ? 'text-slate-800' : 'text-slate-400'}`}>
                                                        Zones 1–5, 24 GKKs, Passes
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </button>

                                    {/* 5. Pastoral Bulletin & Reports */}
                                    <button
                                        type="button"
                                        onClick={() => setActivePortal('reports')}
                                        className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                                            activePortal === 'reports'
                                                ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                                                : 'text-slate-300 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 truncate">
                                            <BarChart3 className="size-4 shrink-0" />
                                            {!sidebarCollapsed && (
                                                <div className="text-left">
                                                    <div className="truncate">Pastoral Bulletin</div>
                                                    <div className={`text-[10px] font-normal ${activePortal === 'reports' ? 'text-slate-800' : 'text-slate-400'}`}>
                                                        Compliance &amp; CSV export
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                </nav>
                            </div>
                        </div>

                        {/* Sidebar Bottom: Reset Database */}
                        <div className="p-4 border-t border-[#1a3153] space-y-2">
                            {!sidebarCollapsed && (
                                <button
                                    type="button"
                                    onClick={handleResetDefaults}
                                    className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2 text-[11px] font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                                >
                                    <RefreshCw className="size-3 text-amber-400" />
                                    <span>Reset System Database</span>
                                </button>
                            )}
                        </div>
                    </aside>

                    {/* MAIN CONTENT AREA */}
                    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
                        {/* PORTAL 2: SANCTUARY REALTIME CHECKIN */}
                        {activePortal === 'checkin' && (
                            <RealtimeKiosk
                                masses={state.masses}
                                activeMassId={state.activeMassId}
                                setActiveMassId={handleSetActiveMass}
                                parishioners={state.parishioners}
                                attendances={state.attendances}
                                onCheckIn={handleCheckIn}
                                onDeleteAttendance={handleDeleteAttendance}
                            />
                        )}

                        {/* PORTAL 3: MASS SCHEDULES & ROSTERS */}
                        {activePortal === 'schedules' && (
                            <MassRoster
                                masses={state.masses}
                                parishioners={state.parishioners}
                                attendances={state.attendances}
                                onUpdateMass={handleUpdateMass}
                                onAddMass={handleAddMass}
                            />
                        )}

                        {/* PORTAL 4: PARISHIONERS DIRECTORY & ID PASS */}
                        {activePortal === 'database' && (
                            <MembersDatabase
                                parishioners={state.parishioners}
                                onAddParishioner={handleAddParishioner}
                                onUpdateParishioner={handleUpdateParishioner}
                            />
                        )}

                        {/* PORTAL 5: PASTORAL REPORT & BULLETIN */}
                        {activePortal === 'reports' && (
                            <PastoralReport
                                masses={state.masses}
                                parishioners={state.parishioners}
                                attendances={state.attendances}
                            />
                        )}

                        {/* PORTAL 1: MAIN COMMAND DASHBOARD */}
                        {activePortal === 'dashboard' && (
                            <div className="space-y-6">
                                {/* Top Hero Banner */}
                                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs relative overflow-hidden">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="rounded-md bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
                                                    Sanctuary Command Center
                                                </span>
                                                <span className="text-xs text-slate-400">&bull; Diocese of Digos</span>
                                            </div>
                                            <h2 className="text-2xl font-black text-slate-900 font-serif tracking-tight mt-1">
                                                Welcome, {currentAdmin.name}
                                            </h2>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Active Liturgical Season: <strong>{currentSeason}</strong> &bull; Coverage: <strong>Zones 1 to 5 (24 GKK Chapels)</strong>
                                            </p>
                                        </div>

                                        {/* Quick Action Buttons */}
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <a
                                                href="/kiosk"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 rounded-xl bg-[#15284b] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#1d396a] shadow-sm transition-all"
                                            >
                                                <UserCheck className="size-3.5 text-amber-300" />
                                                <span>Entrance Kiosk</span>
                                            </a>
                                            <button
                                                type="button"
                                                onClick={() => setActivePortal('database')}
                                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-all"
                                            >
                                                <UserPlus className="size-3.5 text-blue-600" />
                                                <span>Register Parishioner</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setActivePortal('reports')}
                                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-all"
                                            >
                                                <FileText className="size-3.5 text-emerald-600" />
                                                <span>Weekly Bulletin</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* 4 Hero KPI Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {/* KPI 1: Active Mass Duty Readiness */}
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                                        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                                            <span className="font-semibold uppercase tracking-wider text-[10px]">
                                                Duty Readiness
                                            </span>
                                            <span className="rounded-md bg-blue-50 text-blue-700 font-mono text-[10px] px-1.5 py-0.5 font-bold">
                                                Active Mass
                                            </span>
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-black text-slate-900 font-mono">
                                                {dutyReadinessPercent}%
                                            </span>
                                            <span className="text-xs text-slate-500 font-medium">
                                                ({checkedInMinistersCount}/{totalRequiredMinisters} checked-in)
                                            </span>
                                        </div>
                                        <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                            <div
                                                style={{ width: `${Math.min(dutyReadinessPercent, 100)}%` }}
                                                className="h-full rounded-full bg-[#15284b] transition-all duration-500"
                                            />
                                        </div>
                                    </div>

                                    {/* KPI 2: Sanctuary Punctuality Score */}
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                                        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                                            <span className="font-semibold uppercase tracking-wider text-[10px]">
                                                Punctuality Index
                                            </span>
                                            <Clock className="size-4 text-emerald-600" />
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-black text-emerald-600 font-mono">
                                                {punctualityScore}%
                                            </span>
                                            <span className="text-xs text-slate-500 font-medium">
                                                On-Time Sanctuary Call
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-2">
                                            {onTimeAtt} of {totalAtt} verified arrivals
                                        </p>
                                    </div>

                                    {/* KPI 3: Registered Parishioners */}
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                                        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                                            <span className="font-semibold uppercase tracking-wider text-[10px]">
                                                Parishioners Roster
                                            </span>
                                            <Users className="size-4 text-amber-600" />
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-black text-slate-900 font-mono">
                                                {state.parishioners.length}
                                            </span>
                                            <span className="text-xs text-slate-500 font-medium">
                                                Verified Members
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-2">
                                            Across 7 Liturgical Ministries
                                        </p>
                                    </div>

                                    {/* KPI 4: Zones & GKK Communities */}
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                                        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                                            <span className="font-semibold uppercase tracking-wider text-[10px]">
                                                Parish Coverage
                                            </span>
                                            <Shield className="size-4 text-[#15284b]" />
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-black text-slate-900 font-mono">
                                                5 Zones
                                            </span>
                                            <span className="text-xs text-slate-500 font-medium">
                                                &bull; 24 GKKs
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-2">
                                            Official Parish Jurisdiction
                                        </p>
                                    </div>
                                </div>

                                {/* Main Grid: Radar + Administrator Authority Card */}
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                    {/* Left 7 Cols: Active Mass Readiness Radar */}
                                    <div className="lg:col-span-7 space-y-4">
                                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <Activity className="size-4 text-[#15284b]" />
                                                        <h3 className="font-bold text-slate-900 text-sm tracking-tight font-serif uppercase">
                                                            Active Mass Readiness Radar
                                                        </h3>
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                                        {activeMass.name} &bull; {activeMass.time} &bull; Presider: {activeMass.presider}
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => setActivePortal('schedules')}
                                                    className="inline-flex items-center gap-1 text-xs font-bold text-[#15284b] hover:text-[#1d396a]"
                                                >
                                                    <span>View Rosters</span>
                                                    <ArrowRight className="size-3.5" />
                                                </button>
                                            </div>

                                            {/* Slots Status List */}
                                            <div className="space-y-3">
                                                {activeMass.slots.map((slot) => {
                                                    const assignedMembers = state.parishioners.filter((p) =>
                                                        slot.assignedMemberIds.includes(p.id)
                                                    );
                                                    const checkedInCount = assignedMembers.filter((m) =>
                                                        state.attendances.some(
                                                            (a) => a.parishionerId === m.id && a.massId === activeMass.id
                                                        )
                                                    ).length;
                                                    const isFull = checkedInCount >= slot.requiredCount;

                                                    return (
                                                        <div
                                                            key={slot.ministry}
                                                            onClick={() => setSelectedRadarMinistry(slot.ministry)}
                                                            className="cursor-pointer flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 transition-all text-xs"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <span
                                                                    className={`size-2.5 rounded-full ${
                                                                        isFull ? 'bg-emerald-500' : 'bg-amber-400'
                                                                    }`}
                                                                />
                                                                <div>
                                                                    <div className="font-bold text-slate-900">
                                                                        {slot.ministry}
                                                                    </div>
                                                                    <div className="text-[11px] text-slate-400">
                                                                        {slot.assignedMemberIds.length} assigned of {slot.requiredCount} required
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <span
                                                                className={`rounded-md px-2 py-0.5 text-[10px] font-bold font-mono ${
                                                                    isFull
                                                                        ? 'bg-emerald-100 text-emerald-800'
                                                                        : 'bg-amber-100 text-amber-800'
                                                                }`}
                                                            >
                                                                {checkedInCount}/{slot.requiredCount} Checked-In
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right 5 Cols: Single Parish Admin Profile */}
                                    <div className="lg:col-span-5 space-y-4">
                                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                                            {/* Section Header */}
                                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <Shield className="size-4 text-[#15284b]" />
                                                        <h3 className="font-bold text-slate-900 text-sm tracking-tight font-serif uppercase">
                                                            Parish Administrator
                                                        </h3>
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                                        Authorized Sole System Administrator &bull; MySQL backed
                                                    </p>
                                                </div>
                                                <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold">
                                                    Active Authority
                                                </span>
                                            </div>

                                            {/* Admin Profile Details */}
                                            <div className="p-4 rounded-2xl border border-[#15284b]/30 bg-blue-50/50 ring-1 ring-[#15284b]/10 space-y-3">
                                                <div className="flex items-center gap-3.5">
                                                    <div className="size-12 rounded-2xl bg-[#15284b] text-white flex items-center justify-center font-black text-sm shadow-md">
                                                        {currentAdmin.initials}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-sm text-slate-900 truncate">
                                                                {currentAdmin.name}
                                                            </span>
                                                            <span className="rounded-md bg-[#15284b] text-white px-1.5 py-0.5 text-[9px] font-black uppercase shrink-0">
                                                                ADMIN
                                                            </span>
                                                        </div>
                                                        <div className="text-xs font-semibold text-amber-700">
                                                            {currentAdmin.title}
                                                        </div>
                                                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                                                            {currentAdmin.username} &bull; PIN: {currentAdmin.pin}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="border-t border-blue-100 pt-3 grid grid-cols-2 gap-2 text-[11px]">
                                                    <div className="bg-white/80 rounded-xl p-2 border border-blue-100">
                                                        <div className="text-slate-400 text-[10px] uppercase font-bold">Authority</div>
                                                        <div className="font-bold text-slate-800">Parish Priest</div>
                                                    </div>
                                                    <div className="bg-white/80 rounded-xl p-2 border border-blue-100">
                                                        <div className="text-slate-400 text-[10px] uppercase font-bold">Security Access</div>
                                                        <div className="font-bold text-emerald-700">Level 1 (Full)</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Liturgical Season Selector Modal */}
            {showSeasonModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
                    <div className="w-full max-w-2xl rounded-2xl bg-white p-6 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <div className="flex items-center gap-2">
                                    <div className="rounded-lg bg-amber-100 p-1.5 text-amber-800">
                                        <Calendar className="size-4" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 text-base font-serif">
                                        Select Liturgical Season &amp; Color Theme
                                    </h3>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    Changes system vestment colors and liturgical banner across all admin dashboards, kiosks, and login portals. Persisted in MySQL.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowSeasonModal(false)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 transition-colors"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        {/* 7 Liturgical Seasons Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            {ALL_LITURGICAL_SEASONS.map((seasonKey) => {
                                const s = LITURGICAL_THEMES[seasonKey];
                                const isCurrent = currentSeason === seasonKey;
                                return (
                                    <button
                                        key={seasonKey}
                                        type="button"
                                        onClick={() => handleChangeLiturgicalSeason(seasonKey)}
                                        className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between group cursor-pointer ${
                                            isCurrent
                                                ? 'ring-2 ring-amber-400 border-amber-400 shadow-md bg-amber-50/20'
                                                : 'border-slate-200 hover:border-slate-400 hover:bg-slate-50/70'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-2.5">
                                                <div
                                                    className="size-10 rounded-xl flex items-center justify-center text-xl shadow-xs shrink-0"
                                                    style={{ backgroundColor: s.primaryHex, color: '#ffffff' }}
                                                >
                                                    {s.vestmentIcon}
                                                </div>
                                                <div>
                                                    <h4 className="font-serif font-bold text-sm text-slate-900 leading-snug">
                                                        {s.name}
                                                    </h4>
                                                    <div className="inline-flex items-center gap-1.5 mt-0.5">
                                                        <span className="size-2 rounded-full" style={{ backgroundColor: s.primaryHex }}></span>
                                                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                                                            Color: {s.colorName}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {isCurrent && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full shrink-0">
                                                    <CheckCircle2 className="size-3 text-emerald-600" /> Active Now
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-[11px] text-slate-500 mt-2.5 line-clamp-2 leading-relaxed">
                                            {s.meaning}
                                        </p>

                                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                                            <span className="font-serif italic truncate max-w-[200px]">{s.scriptureMotto}</span>
                                            <span className="text-amber-700 font-bold group-hover:translate-x-0.5 transition-transform">Apply &rarr;</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs text-slate-500">
                            <span className="text-[11px] italic text-slate-400">
                                Official Catholic Liturgical Seasons per Roman Missal &amp; CBCP
                            </span>
                            <button
                                type="button"
                                onClick={() => setShowSeasonModal(false)}
                                className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Ministry Assigned Members Inspect Modal */}
            {selectedRadarMinistry && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm">
                                    {selectedRadarMinistry} Roster Status
                                </h3>
                                <p className="text-[11px] text-slate-500">
                                    {activeMass.name} &bull; {activeMass.time}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedRadarMinistry(null)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                            >
                                <X className="size-4.5" />
                            </button>
                        </div>

                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {(() => {
                                const slot = activeMass.slots.find((s) => s.ministry === selectedRadarMinistry);
                                if (!slot || slot.assignedMemberIds.length === 0) {
                                    return (
                                        <p className="text-xs text-slate-400 italic text-center py-4">
                                            No ministers currently assigned. Go to Mass Schedules to assign.
                                        </p>
                                    );
                                }

                                return slot.assignedMemberIds.map((id) => {
                                    const member = state.parishioners.find((p) => p.id === id);
                                    if (!member) return null;
                                    const isPresent = state.attendances.some(
                                        (a) => a.parishionerId === member.id && a.massId === activeMass.id
                                    );

                                    return (
                                        <div
                                            key={member.id}
                                            className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/70"
                                        >
                                            <div>
                                                <div className="font-bold text-xs text-slate-900">{member.name}</div>
                                                <div className="text-[10px] text-slate-500">{member.zone} &bull; {member.gkk} &bull; {member.phone}</div>
                                            </div>

                                            {isPresent ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                                    <CheckCircle2 className="size-3" /> Present
                                                </span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        handleCheckIn({
                                                            parishionerId: member.id,
                                                            parishionerName: member.name,
                                                            memberId: member.memberId,
                                                            zone: member.zone,
                                                            gkk: member.gkk,
                                                            ministry: member.ministry,
                                                            massId: activeMass.id,
                                                            massName: activeMass.name,
                                                            checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                                            date: new Date().toISOString().split('T')[0],
                                                            status: 'On-Time',
                                                            method: 'Admin Manual',
                                                        });
                                                        playSanctuaryChime();
                                                    }}
                                                    className="rounded-lg bg-[#15284b] px-2.5 py-1 text-[10px] font-bold text-white hover:bg-[#1d396a]"
                                                >
                                                    Check In Now
                                                </button>
                                            )}
                                        </div>
                                    );
                                });
                            })()}
                        </div>

                        <div className="flex justify-end pt-2 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setSelectedRadarMinistry(null)}
                                className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
