import React, { useState } from 'react';
import {
    BarChart3,
    CheckCircle2,
    Clock,
    Download,
    FileSpreadsheet,
    PieChart,
    Printer,
    Shield,
    TrendingUp,
    Users,
} from 'lucide-react';
import { AttendanceRecord, MassCelebration, Parishioner } from '@/types/parish';

interface PastoralReportProps {
    masses: MassCelebration[];
    parishioners: Parishioner[];
    attendances: AttendanceRecord[];
}

export const PastoralReport: React.FC<PastoralReportProps> = ({
    masses,
    parishioners,
    attendances,
}) => {
    const [selectedPeriod, setSelectedPeriod] = useState('Current Week (24th Sunday)');

    // Punctuality calculations
    const totalAttendances = attendances.length;
    const onTimeCount = attendances.filter((a) => a.status === 'On-Time').length;
    const graceCount = attendances.filter((a) => a.status === 'Grace Period').length;
    const lateCount = attendances.filter((a) => a.status === 'Late').length;

    const punctualityScore = totalAttendances > 0 ? Math.round((onTimeCount / totalAttendances) * 100) : 73;
    const graceScore = totalAttendances > 0 ? Math.round((graceCount / totalAttendances) * 100) : 18;
    const lateScore = totalAttendances > 0 ? Math.round((lateCount / totalAttendances) * 100) : 9;

    // Attendance by Zone (Zone 1 through Zone 5)
    const zones: ZoneType[] = [
        'Zone 1',
        'Zone 2',
        'Zone 3',
        'Zone 4',
        'Zone 5',
    ];

    const zoneCounts = zones.map((z) => ({
        zone: z,
        fullName: z,
        count: attendances.filter((a) => a.zone === z).length,
    }));

    // CSV Exporter
    const handleExportCSV = () => {
        const headers = ['ID', 'Parishioner Name', 'Member ID', 'Zone', 'GKK', 'Ministry', 'Mass Celebration', 'Check-In Time', 'Date', 'Status', 'Method'];
        const rows = attendances.map((a) => [
            a.id,
            `"${a.parishionerName}"`,
            a.memberId,
            `"${a.zone}"`,
            `"${a.gkk || ''}"`,
            `"${a.ministry}"`,
            `"${a.massName}"`,
            a.checkInTime,
            a.date,
            a.status,
            a.method,
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `fatima_parish_attendance_audit_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrintBulletin = () => {
        window.print();
    };

    return (
        <div className="space-y-6">
            {/* Header & Export Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-extrabold text-slate-900 font-serif tracking-tight">
                        Weekly Pastoral Bulletin & Attendance Analytics
                    </h2>
                    <p className="text-xs text-slate-500">
                        Sanctuary compliance, punctuality index, and zone attendance metrics &bull; Diocese of Digos
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleExportCSV}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
                    >
                        <FileSpreadsheet className="size-4 text-emerald-600" />
                        <span>Export CSV Log</span>
                    </button>

                    <button
                        type="button"
                        onClick={handlePrintBulletin}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#15284b] px-4 py-2 text-xs font-bold text-white hover:bg-[#1d396a] shadow-sm transition-colors"
                    >
                        <Printer className="size-4 text-amber-400" />
                        <span>Print Weekly Bulletin</span>
                    </button>
                </div>
            </div>

            {/* Punctuality KPI Hero Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                    <div>
                        <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                            Sanctuary Duty Compliance
                        </span>
                        <h3 className="text-2xl font-black text-slate-900 font-serif mt-1">
                            Overall Punctuality Score: {punctualityScore}%
                        </h3>
                        <p className="text-xs text-slate-500">
                            Based on {totalAttendances} verified member arrivals relative to sanctuary call times
                        </p>
                    </div>

                    {/* Score Bar Breakdown */}
                    <div className="flex items-center gap-4 text-xs">
                        <div className="text-center">
                            <span className="block text-2xl font-black text-emerald-600 font-mono">
                                {punctualityScore}%
                            </span>
                            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                                On-Time ({onTimeCount})
                            </span>
                        </div>

                        <div className="h-10 w-px bg-slate-200" />

                        <div className="text-center">
                            <span className="block text-2xl font-black text-amber-600 font-mono">
                                {graceScore}%
                            </span>
                            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                                Grace Period ({graceCount})
                            </span>
                        </div>

                        <div className="h-10 w-px bg-slate-200" />

                        <div className="text-center">
                            <span className="block text-2xl font-black text-rose-600 font-mono">
                                {lateScore}%
                            </span>
                            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                                Late Arrivals ({lateCount})
                            </span>
                        </div>
                    </div>
                </div>

                {/* Visual Progress Bar */}
                <div className="mt-6">
                    <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                            style={{ width: `${punctualityScore}%` }}
                            className="bg-emerald-500 transition-all"
                            title={`On-Time: ${punctualityScore}%`}
                        />
                        <div
                            style={{ width: `${graceScore}%` }}
                            className="bg-amber-400 transition-all"
                            title={`Grace Period: ${graceScore}%`}
                        />
                        <div
                            style={{ width: `${lateScore}%` }}
                            className="bg-rose-500 transition-all"
                            title={`Late: ${lateScore}%`}
                        />
                    </div>
                </div>
            </div>

            {/* Attendance Analytics Split: By Mass vs By Zone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* By Mass Celebration */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                            Attendance by Celebration
                        </h4>
                        <span className="text-xs text-slate-400">4 Celebrations</span>
                    </div>

                    <div className="space-y-3">
                        {masses.map((m) => {
                            const count = attendances.filter((a) => a.massId === m.id).length;
                            const percentage = totalAttendances > 0 ? Math.round((count / totalAttendances) * 100) : 0;

                            return (
                                <div key={m.id} className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-semibold text-slate-800 line-clamp-1">
                                            {m.name}
                                        </span>
                                        <span className="font-mono text-slate-600">
                                            {count} attendees ({percentage}%)
                                        </span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                                        <div
                                            style={{ width: `${Math.max(percentage, 5)}%` }}
                                            className="h-full rounded-full bg-[#15284b]"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* By Parish Zone */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                            Attendance by Parish Zone
                        </h4>
                        <span className="text-xs text-slate-400">Zones 1–5 &bull; 24 GKKs</span>
                    </div>

                    <div className="space-y-3">
                        {zoneCounts.map((zc) => {
                            const percentage = totalAttendances > 0 ? Math.round((zc.count / totalAttendances) * 100) : 0;
                            return (
                                <div key={zc.zone} className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-semibold text-slate-800">
                                            {zc.fullName}
                                        </span>
                                        <span className="font-mono text-slate-600">
                                            {zc.count} check-ins
                                        </span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                                        <div
                                            style={{ width: `${Math.max(percentage, 4)}%` }}
                                            className="h-full rounded-full bg-amber-500"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Official Parish Bulletin Printable Summary Section */}
            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 p-6 text-xs text-slate-700 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div>
                        <h5 className="font-bold text-slate-900 text-sm font-serif">
                            Diocese of Digos &bull; Our Lady of Fatima Parish Weekly Bulletin Extract
                        </h5>
                        <p className="text-[11px] text-slate-500">
                            Authorized Liturgical Review &bull; Parish Priest: Fr. Hermes &apos;Larry&apos; Sabud, SM
                        </p>
                    </div>
                    <span className="rounded-md bg-white border border-slate-200 px-2 py-1 text-[10px] font-mono font-bold text-slate-600">
                        DOC-2026-W37
                    </span>
                </div>

                <p className="leading-relaxed">
                    This pastoral compliance log confirms that for the <strong>24th Sunday in Ordinary Time</strong>,
                    active liturgical ministries achieved a <strong>{punctualityScore}% on-time sanctuary readiness rate</strong>.
                    All 7 liturgical ministries were fully coordinated across the four scheduled masses.
                </p>
            </div>
        </div>
    );
};
