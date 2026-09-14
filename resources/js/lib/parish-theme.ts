import { LiturgicalSeason } from '@/types/parish';

export interface LiturgicalThemeConfig {
    id: LiturgicalSeason;
    name: string;
    colorName: string; // e.g. "Purple", "White", "Green", "Red / White", "Red"
    meaning: string;
    scriptureMotto: string;
    vestmentIcon: string;
    // Color styling tokens
    primaryHex: string;
    accentHex: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    headerBannerBg: string;
    headerBannerBorder: string;
    headerAccentRing: string;
    cardBorderHighlight: string;
    navHighlight: string;
    buttonBg: string;
    buttonHover: string;
    statusBadge: string;
    dotColor: string;
}

export const LITURGICAL_THEMES: Record<LiturgicalSeason, LiturgicalThemeConfig> = {
    'Advent': {
        id: 'Advent',
        name: 'Advent',
        colorName: 'Purple',
        meaning: 'Hope, expectation, and preparation for the Nativity of our Lord Jesus Christ.',
        scriptureMotto: 'Veni, Veni, Emmanuel • Prepare the Way of the Lord',
        vestmentIcon: '🕯️',
        primaryHex: '#581c87',
        accentHex: '#d97706',
        badgeBg: 'bg-purple-900/15',
        badgeText: 'text-purple-900',
        badgeBorder: 'border-purple-600/40',
        headerBannerBg: 'bg-gradient-to-r from-[#2e1065] via-[#3b0764] to-[#1e1b4b]',
        headerBannerBorder: 'border-purple-500/30',
        headerAccentRing: 'ring-purple-400/40',
        cardBorderHighlight: 'border-l-purple-600',
        navHighlight: 'bg-purple-800 text-white',
        buttonBg: 'bg-purple-800 hover:bg-purple-900 text-white',
        buttonHover: 'hover:bg-purple-900',
        statusBadge: 'bg-purple-100 text-purple-800 border border-purple-200',
        dotColor: 'bg-purple-500',
    },
    'Christmas': {
        id: 'Christmas',
        name: 'Christmas',
        colorName: 'White',
        meaning: 'Nativity of the Lord, incarnation, joy, light, and solemn peace.',
        scriptureMotto: 'Gloria in Excelsis Deo • The Word became Flesh',
        vestmentIcon: '⭐',
        primaryHex: '#d97706',
        accentHex: '#f59e0b',
        badgeBg: 'bg-amber-50',
        badgeText: 'text-amber-900',
        badgeBorder: 'border-amber-400/60',
        headerBannerBg: 'bg-gradient-to-r from-[#172554] via-[#1e3a8a] to-[#0f172a]',
        headerBannerBorder: 'border-amber-400/40',
        headerAccentRing: 'ring-amber-300/60',
        cardBorderHighlight: 'border-l-amber-500',
        navHighlight: 'bg-amber-600 text-white',
        buttonBg: 'bg-amber-700 hover:bg-amber-800 text-white',
        buttonHover: 'hover:bg-amber-800',
        statusBadge: 'bg-amber-50 text-amber-900 border border-amber-300',
        dotColor: 'bg-amber-400',
    },
    'Ordinary Time': {
        id: 'Ordinary Time',
        name: 'Ordinary Time',
        colorName: 'Green',
        meaning: 'Spiritual growth, hope, vitality, and following Jesus in everyday discipleship.',
        scriptureMotto: 'Tempus per Annum • Walk in the Light of Christ',
        vestmentIcon: '🌿',
        primaryHex: '#15803d',
        accentHex: '#ca8a04',
        badgeBg: 'bg-emerald-50',
        badgeText: 'text-emerald-900',
        badgeBorder: 'border-emerald-600/40',
        headerBannerBg: 'bg-gradient-to-r from-[#064e3b] via-[#065f46] to-[#042f2e]',
        headerBannerBorder: 'border-emerald-500/40',
        headerAccentRing: 'ring-emerald-400/50',
        cardBorderHighlight: 'border-l-emerald-600',
        navHighlight: 'bg-emerald-700 text-white',
        buttonBg: 'bg-emerald-700 hover:bg-emerald-800 text-white',
        buttonHover: 'hover:bg-emerald-800',
        statusBadge: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
        dotColor: 'bg-emerald-500',
    },
    'Lent': {
        id: 'Lent',
        name: 'Lent',
        colorName: 'Purple',
        meaning: 'Penance, fasting, prayer, conversion of heart, and spiritual renewal.',
        scriptureMotto: 'Memento, homo, quia pulvis es • 40 Days of Desert Renewal',
        vestmentIcon: '✝️',
        primaryHex: '#4a044e',
        accentHex: '#9333ea',
        badgeBg: 'bg-fuchsia-950/15',
        badgeText: 'text-fuchsia-950',
        badgeBorder: 'border-fuchsia-800/40',
        headerBannerBg: 'bg-gradient-to-r from-[#3b0764] via-[#4a044e] to-[#2e1065]',
        headerBannerBorder: 'border-fuchsia-500/30',
        headerAccentRing: 'ring-fuchsia-400/40',
        cardBorderHighlight: 'border-l-fuchsia-800',
        navHighlight: 'bg-fuchsia-900 text-white',
        buttonBg: 'bg-fuchsia-900 hover:bg-fuchsia-950 text-white',
        buttonHover: 'hover:bg-fuchsia-950',
        statusBadge: 'bg-fuchsia-100 text-fuchsia-950 border border-fuchsia-300',
        dotColor: 'bg-fuchsia-700',
    },
    'Holy Week': {
        id: 'Holy Week',
        name: 'Holy Week',
        colorName: 'Red / White',
        meaning: 'The Sacred Paschal Triduum, the Passion, Crucifixion, and triumphant victory of the Cross.',
        scriptureMotto: 'Passio Domini Nostri • Hosanna in Excelsis & Paschal Triduum',
        vestmentIcon: '🕊️',
        primaryHex: '#991b1b',
        accentHex: '#f8fafc',
        badgeBg: 'bg-red-50',
        badgeText: 'text-red-900',
        badgeBorder: 'border-red-600/50',
        headerBannerBg: 'bg-gradient-to-r from-[#7f1d1d] via-[#991b1b] to-[#450a0a]',
        headerBannerBorder: 'border-red-400/40',
        headerAccentRing: 'ring-red-400/50',
        cardBorderHighlight: 'border-l-red-600',
        navHighlight: 'bg-red-700 text-white',
        buttonBg: 'bg-red-700 hover:bg-red-800 text-white',
        buttonHover: 'hover:bg-red-800',
        statusBadge: 'bg-red-100 text-red-900 border border-red-300',
        dotColor: 'bg-red-600',
    },
    'Easter': {
        id: 'Easter',
        name: 'Easter',
        colorName: 'White',
        meaning: 'Resurrection of the Lord, supreme joy, eternal life, and victory over death.',
        scriptureMotto: 'Surrexit Christus, Alleluia! • Paschal Candle & Light of the World',
        vestmentIcon: '🌅',
        primaryHex: '#ca8a04',
        accentHex: '#facc15',
        badgeBg: 'bg-yellow-50',
        badgeText: 'text-amber-950',
        badgeBorder: 'border-amber-400/70',
        headerBannerBg: 'bg-gradient-to-r from-[#1e293b] via-[#334155] to-[#0f172a]',
        headerBannerBorder: 'border-amber-300/60',
        headerAccentRing: 'ring-amber-400/70',
        cardBorderHighlight: 'border-l-amber-400',
        navHighlight: 'bg-amber-600 text-white',
        buttonBg: 'bg-amber-600 hover:bg-amber-700 text-white',
        buttonHover: 'hover:bg-amber-700',
        statusBadge: 'bg-amber-100 text-amber-950 border border-amber-300',
        dotColor: 'bg-amber-500',
    },
    'Pentecost': {
        id: 'Pentecost',
        name: 'Pentecost',
        colorName: 'Red',
        meaning: 'Descent of the Holy Spirit, tongues of fire, birth of the Church, and 7 sacred gifts.',
        scriptureMotto: 'Veni Sancte Spiritus • Fire of Divine Charity',
        vestmentIcon: '🔥',
        primaryHex: '#dc2626',
        accentHex: '#ea580c',
        badgeBg: 'bg-red-50',
        badgeText: 'text-red-900',
        badgeBorder: 'border-red-500/50',
        headerBannerBg: 'bg-gradient-to-r from-[#991b1b] via-[#b91c1c] to-[#7f1d1d]',
        headerBannerBorder: 'border-red-400/40',
        headerAccentRing: 'ring-red-500/50',
        cardBorderHighlight: 'border-l-red-600',
        navHighlight: 'bg-red-600 text-white',
        buttonBg: 'bg-red-600 hover:bg-red-700 text-white',
        buttonHover: 'hover:bg-red-700',
        statusBadge: 'bg-red-100 text-red-900 border border-red-300',
        dotColor: 'bg-red-500',
    },
};

export const ALL_LITURGICAL_SEASONS: LiturgicalSeason[] = [
    'Advent',
    'Christmas',
    'Ordinary Time',
    'Lent',
    'Holy Week',
    'Easter',
    'Pentecost',
];

export function getLiturgicalTheme(season?: string | null): LiturgicalThemeConfig {
    if (!season || !LITURGICAL_THEMES[season as LiturgicalSeason]) {
        return LITURGICAL_THEMES['Ordinary Time'];
    }
    return LITURGICAL_THEMES[season as LiturgicalSeason];
}
