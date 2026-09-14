import React from 'react';
import { usePage } from '@inertiajs/react';
import { ParishCrest } from '@/components/parish/parish-crest';

export default function AppLogo() {
    const { name } = usePage().props;

    return (
        <div className="flex items-center gap-2.5">
            <ParishCrest size={32} />
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-serif font-bold text-slate-900 dark:text-white">
                    Our Lady of Fatima Parish
                </span>
                <span className="text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-semibold">
                    Diocese of Digos
                </span>
            </div>
        </div>
    );
}
