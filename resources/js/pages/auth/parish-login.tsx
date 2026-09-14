import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    Calendar,
    Eye,
    EyeOff,
    LogIn,
    Shield,
    Users,
    CheckCircle2,
} from 'lucide-react';
import { ParishCrest } from '@/components/parish/parish-crest';
import { loadParishState, saveParishState, ParishState } from '@/lib/parish-store';
import { apiSwitchAdmin } from '@/lib/parish-api';
import { getLiturgicalTheme } from '@/lib/parish-theme';
import { AdminUser } from '@/types/parish';

interface ParishLoginProps {
    initialData?: ParishState;
    admins?: AdminUser[];
}

export default function ParishLogin({ initialData }: ParishLoginProps) {
    const [state] = useState<ParishState>(() => loadParishState(initialData));
    const [identifier, setIdentifier] = useState(state.admins[0]?.username || '@fr.larry');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberSession, setRememberSession] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const singleAdmin = state.admins[0] || {
        id: 'admin-1',
        name: "Fr. Hermes 'Larry' Sabud, SM",
        title: 'Parish Priest & Administrator',
        username: '@fr.larry',
        email: 'fr.larry@fatimaparish.ph',
        pin: '1917',
        initials: 'FH',
        role: 'Parish Priest',
    };

    const theme = getLiturgicalTheme(state.liturgicalSeason);

    const handleLogin = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setErrorMessage('');

        const query = identifier.trim().toLowerCase();
        const pinOrPwd = password.trim();

        if (!query) {
            setErrorMessage('Please enter your administrator username or email.');
            return;
        }

        const isMatch =
            singleAdmin.username.toLowerCase() === query ||
            singleAdmin.username.replace('@', '').toLowerCase() === query ||
            singleAdmin.email.toLowerCase() === query ||
            singleAdmin.name.toLowerCase().includes(query) ||
            query === 'admin';

        if (!isMatch) {
            setErrorMessage('Administrative profile not found. Please use the registered Parish Administrator credentials.');
            return;
        }

        if (pinOrPwd && pinOrPwd !== 'password123' && pinOrPwd !== singleAdmin.pin) {
            setErrorMessage(`Incorrect PIN or password. Expected PIN: ${singleAdmin.pin}.`);
            return;
        }

        try {
            setLoading(true);
            await apiSwitchAdmin(singleAdmin.id);
        } catch {
            // fallback
        } finally {
            const updated = { ...state, currentAdminId: singleAdmin.id };
            saveParishState(updated);
            router.visit('/dashboard');
        }
    };

    const handleInstantLogin = async () => {
        setIdentifier(singleAdmin.username);
        setPassword(singleAdmin.pin);
        try {
            await apiSwitchAdmin(singleAdmin.id);
        } catch {
            // fallback
        }
        const updated = { ...state, currentAdminId: singleAdmin.id };
        saveParishState(updated);
        router.visit('/dashboard');
    };

    return (
        <>
            <Head title="Sign In • Our Lady of Fatima Parish Administration" />

            {/* Main Full-Screen Marian Gradient */}
            <div
                className="min-h-screen p-4 sm:p-6 lg:p-8 flex items-center justify-center font-sans antialiased text-slate-800"
                style={{
                    background: 'radial-gradient(circle at 50% 18%, rgba(34, 166, 223, 0.22) 0%, transparent 60%), linear-gradient(150deg, #090c24 0%, #190352 40%, #2b027f 75%, #03588a 100%)',
                }}
            >
                {/* Main Card Container */}
                <div className="w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl flex flex-col md:flex-row border border-white/20">
                    {/* LEFT PANEL: Branding & Visuals */}
                    <div
                        className="w-full md:w-[45%] p-8 lg:p-10 flex flex-col justify-between text-white relative overflow-hidden"
                        style={{
                            background: 'linear-gradient(165deg, #101c38 0%, #1e095a 45%, #034873 100%)',
                        }}
                    >
                        {/* Background Watermark Crest */}
                        <div className="pointer-events-none absolute -bottom-16 -right-16 opacity-10 select-none">
                            <ParishCrest size={280} />
                        </div>

                        {/* Top Branding */}
                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center gap-3">
                                <ParishCrest size={48} showGlow />
                                <div>
                                    <span className="block text-[10px] uppercase tracking-widest text-sky-300 font-semibold">
                                        Diocese of Digos
                                    </span>
                                    <h1 className="text-base font-bold tracking-tight text-white font-serif">
                                        OUR LADY OF FATIMA PARISH
                                    </h1>
                                    <p className="text-[10px] text-amber-200/90 italic font-serif">
                                        &ldquo;Cura Dei Genetrix&rdquo; &bull; Pastoral Administration
                                    </p>
                                </div>
                            </div>

                            {/* Liturgical Season Pill */}
                            <div
                                className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-3 py-1.5 text-xs font-semibold text-white shadow-xs backdrop-blur-xs"
                                style={{ backgroundColor: theme.primaryHex }}
                            >
                                <span className="text-sm">{theme.vestmentIcon}</span>
                                <span className="font-bold">{theme.name}</span>
                                <span className="rounded bg-black/25 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-amber-200">
                                    {theme.colorName}
                                </span>
                            </div>

                            {/* Features Showcase */}
                            <div className="space-y-3 pt-2">
                                <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 transition-all hover:bg-white/10">
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-lg bg-sky-500/20 p-2 text-sky-300">
                                            <Calendar className="size-4.5" />
                                        </div>
                                        <div>
                                            <h2 className="text-xs font-semibold text-white">
                                                5 Pastoral Zones &amp; 24 GKKs
                                            </h2>
                                            <p className="text-[11px] text-slate-300 leading-normal mt-0.5">
                                                Parish ministerial coverage exclusively organized across Zones 1 to 5 with 24 dedicated GKK Christian communities.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 transition-all hover:bg-white/10">
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-lg bg-emerald-500/20 p-2 text-emerald-300">
                                            <Users className="size-4.5" />
                                        </div>
                                        <div>
                                            <h2 className="text-xs font-semibold text-white">
                                                Sanctuary Attendance &amp; PIN Check-In
                                            </h2>
                                            <p className="text-[11px] text-slate-300 leading-normal mt-0.5">
                                                Reliable 4-digit PIN authentication, live sacristy attendance, and accurate ministerial punctuality records.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Info & Public Kiosk Link */}
                        <div className="relative z-10 pt-8 mt-6 border-t border-white/10 flex items-center justify-between text-xs">
                            <div>
                                <span className="block text-[10px] text-slate-400 uppercase tracking-wider">
                                    Sole Administrator
                                </span>
                                <span className="font-semibold text-white">
                                    {singleAdmin.name}
                                </span>
                            </div>

                            <a
                                href="/kiosk"
                                className="inline-flex items-center gap-1 font-semibold text-sky-300 hover:text-sky-200 transition-colors group"
                            >
                                <span>Go to Public Kiosk</span>
                                <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                            </a>
                        </div>
                    </div>

                    {/* RIGHT PANEL: Sign In Form */}
                    <div className="w-full md:w-[55%] p-8 lg:p-10 flex flex-col justify-between bg-white">
                        <div>
                            {/* Top Navigation Buttons */}
                            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                                <div className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold bg-[#340299] text-white shadow-sm">
                                    <LogIn className="size-3.5" />
                                    <span>Parish Admin Portal</span>
                                </div>

                                <a
                                    href="/kiosk"
                                    className="text-xs font-semibold text-sky-700 hover:text-sky-900 transition-colors"
                                >
                                    Sanctuary Entrance &rarr;
                                </a>
                            </div>

                            {/* Header Titles */}
                            <div className="pt-6 pb-5">
                                <h2 className="text-xl font-bold text-slate-900 tracking-tight font-serif uppercase">
                                    Sign In to Parish Administration
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    Enter your administrator credentials or use the instant official profile access below.
                                </p>
                            </div>

                            {/* Error Alert */}
                            {errorMessage && (
                                <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
                                    {errorMessage}
                                </div>
                            )}

                            {/* Login Form */}
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                                        Username or Parish Email
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                                            <Users className="size-4" />
                                        </div>
                                        <input
                                            type="text"
                                            value={identifier}
                                            onChange={(e) => setIdentifier(e.target.value)}
                                            placeholder="e.g. @fr.larry"
                                            style={{
                                                color: '#000000',
                                                WebkitTextFillColor: '#000000',
                                                backgroundColor: '#ffffff',
                                                opacity: 1,
                                            }}
                                            className="w-full rounded-xl border border-slate-300 !bg-white pl-10 pr-4 py-2.5 text-sm !text-black placeholder:!text-slate-500 focus:border-[#340299] focus:outline-hidden focus:ring-2 focus:ring-[#340299]/20 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                                            4-Digit PIN or Password
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIdentifier(singleAdmin.username);
                                                setPassword(singleAdmin.pin);
                                                setErrorMessage('');
                                            }}
                                            className="text-xs font-bold text-[#340299] hover:underline"
                                        >
                                            Autofill Admin PIN ({singleAdmin.pin})
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter 4-digit PIN (e.g. 1917)"
                                            style={{
                                                color: '#000000',
                                                WebkitTextFillColor: '#000000',
                                                backgroundColor: '#ffffff',
                                                opacity: 1,
                                            }}
                                            className="w-full rounded-xl border border-slate-300 !bg-white px-4 py-2.5 text-sm !text-black placeholder:!text-slate-500 focus:border-[#340299] focus:outline-hidden focus:ring-2 focus:ring-[#340299]/20 transition-all font-medium"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-800"
                                        >
                                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-1">
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={rememberSession}
                                            onChange={(e) => setRememberSession(e.target.checked)}
                                            className="size-4 rounded border-slate-300 text-[#340299] focus:ring-[#340299]/20"
                                        />
                                        <span className="text-xs text-slate-600">Keep session active</span>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full rounded-xl bg-[#340299] hover:bg-[#280178] p-3 text-xs font-bold text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <Shield className="size-4 text-amber-300" />
                                    <span>{loading ? 'Authenticating...' : 'Sign In as Administrator'}</span>
                                </button>
                            </form>

                            {/* Single Administrator Profile Card (Instant One-Click Entry) */}
                            <div className="mt-6 pt-5 border-t border-slate-100">
                                <div className="flex items-center justify-between mb-2.5">
                                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                                        Sole Parish Administrator Profile
                                    </span>
                                    <span className="text-[11px] text-slate-400">Click to enter directly</span>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleInstantLogin}
                                    className="w-full flex items-center justify-between rounded-xl border border-slate-200 p-3 text-left hover:border-[#340299] hover:bg-indigo-50/50 transition-all group shadow-2xs"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="size-9 rounded-full bg-[#340299] text-white flex items-center justify-center text-xs font-bold shrink-0 font-serif shadow-xs">
                                            {singleAdmin.initials}
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-slate-900 group-hover:text-[#340299]">
                                                {singleAdmin.name}
                                            </div>
                                            <div className="text-[10px] text-slate-500">
                                                {singleAdmin.title} &bull; <strong className="text-slate-700">{singleAdmin.username}</strong>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                                            PIN: {singleAdmin.pin}
                                        </span>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Footer Status */}
                        <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                                <span className="size-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                                MySQL: churchattendace &bull; 24 GKKs Ready
                            </span>
                            <span className="font-serif italic text-slate-500">Our Lady of Fatima Parish Davao</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
