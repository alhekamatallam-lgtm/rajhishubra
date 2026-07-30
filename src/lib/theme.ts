import { ThemePreset } from '../types';

export interface ThemeConfig {
  id: ThemePreset;
  nameAr: string;
  taglineAr: string;
  category: 'dark' | 'light' | 'heritage' | 'modern';
  descriptionAr: string;
  previewBg: string;
  previewAccent: string;
  bgClass: string;
  cardBgClass: string;
  accentBorder: string;
  textPrimary: string;
  textSecondary: string;
  accentGold: string;
  activePrayerBg: string;
  activePrayerText: string;
  badgeBg: string;
  glowEffect: string;
  tickerBg: string;
}

export const THEMES: Record<ThemePreset, ThemeConfig> = {
  'emerald-gold': {
    id: 'emerald-gold',
    nameAr: 'الزمرد الملكي والذهب الزهدي',
    taglineAr: 'تصميم راقٍ بلمسات إسلامية فاخرة',
    category: 'heritage',
    descriptionAr: 'خلفية زمردية داكنة مع إطارات ذهبية وأضواء هادئة تمنح الشاشة وقاراً وهيبة مثالية للجوامع الكبرى.',
    previewBg: '#0a1a12',
    previewAccent: '#d4af37',
    bgClass: 'bg-[#0a1a12]',
    cardBgClass: 'bg-black/40 backdrop-blur-md border border-[#d4af37]/30 shadow-2xl',
    accentBorder: 'border-[#d4af37]/40',
    textPrimary: 'text-[#f5f2ed]',
    textSecondary: 'text-[#f5f2ed]/70',
    accentGold: 'text-[#d4af37]',
    activePrayerBg: 'bg-[#d4af37]/15 border-2 border-[#d4af37] text-[#f5f2ed] shadow-[0_0_40px_rgba(212,175,55,0.25)] scale-[1.03]',
    activePrayerText: 'text-[#d4af37] font-black',
    badgeBg: 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40',
    glowEffect: 'shadow-[0_0_50px_rgba(212,175,55,0.2)]',
    tickerBg: 'bg-[#162920] border border-[#d4af37]/30'
  },
  'midnight-amber': {
    id: 'midnight-amber',
    nameAr: 'الكحلي الملكي والعنبر الدافئ',
    taglineAr: 'تباين مريح للعين في الصلوات الليلية',
    category: 'dark',
    descriptionAr: 'تدرج كحلي عميق مع إضاءة عنبرية مريحة جداً لعين المصلين، ممتاز للشاشات 90 بوصة ذات السطوع العالي.',
    previewBg: '#060e1a',
    previewAccent: '#f59e0b',
    bgClass: 'bg-gradient-to-br from-[#060e1a] via-[#0b172a] to-[#070f1e]',
    cardBgClass: 'bg-slate-900/85 backdrop-blur-md border border-slate-700/60 shadow-2xl',
    accentBorder: 'border-blue-500/30',
    textPrimary: 'text-[#f5f2ed]',
    textSecondary: 'text-blue-200/70',
    accentGold: 'text-[#d4af37]',
    activePrayerBg: 'bg-[#d4af37]/20 border-2 border-[#d4af37] text-[#f5f2ed] shadow-[0_0_40px_rgba(212,175,55,0.25)] scale-[1.03]',
    activePrayerText: 'text-[#d4af37] font-black',
    badgeBg: 'bg-blue-900/60 text-[#d4af37] border border-blue-400/30',
    glowEffect: 'shadow-[0_0_50px_rgba(59,130,246,0.15)]',
    tickerBg: 'bg-slate-950/95 border border-[#d4af37]/30'
  },
  'slate-golden': {
    id: 'slate-golden',
    nameAr: 'الرخام الأسود والذهب العتيق',
    taglineAr: 'فخامة الرخام الأسود مع زركشة ذهبية',
    category: 'dark',
    descriptionAr: 'تصميم رخامي أسود فاخر مع خطوط ذهبية واضحة جداً وقراءة مريحة للمواقيت والإقامات من مسافات بعيدة.',
    previewBg: '#1c1917',
    previewAccent: '#eab308',
    bgClass: 'bg-stone-950',
    cardBgClass: 'bg-stone-900/90 backdrop-blur-md border border-stone-800 shadow-2xl',
    accentBorder: 'border-[#d4af37]/40',
    textPrimary: 'text-[#f5f2ed]',
    textSecondary: 'text-stone-400',
    accentGold: 'text-[#d4af37]',
    activePrayerBg: 'bg-[#d4af37]/20 border-2 border-[#d4af37] text-stone-100 shadow-[0_0_50px_rgba(212,175,55,0.25)] scale-[1.03]',
    activePrayerText: 'text-[#d4af37] font-black',
    badgeBg: 'bg-stone-800 text-[#d4af37] border border-[#d4af37]/30',
    glowEffect: 'shadow-[0_0_60px_rgba(212,175,55,0.2)]',
    tickerBg: 'bg-stone-900/90 border border-[#d4af37]/30'
  },
  'burgundy-bronze': {
    id: 'burgundy-bronze',
    nameAr: 'العنابي الأندلسي والبرونز',
    taglineAr: 'روح العمارة الإسلامية في قصر الحمراء',
    category: 'heritage',
    descriptionAr: 'تدرجات اللون العنابي الأندلسي الداكن المستوحى من المحاريب التاريخية، مطعم بالبرونز والذهب الزهري.',
    previewBg: '#450a0a',
    previewAccent: '#fbbf24',
    bgClass: 'bg-gradient-to-br from-rose-950 via-stone-950 to-red-950',
    cardBgClass: 'bg-rose-950/75 backdrop-blur-md border border-rose-900/60 shadow-2xl',
    accentBorder: 'border-amber-600/40',
    textPrimary: 'text-rose-50',
    textSecondary: 'text-rose-200/70',
    accentGold: 'text-[#d4af37]',
    activePrayerBg: 'bg-[#d4af37]/20 border-2 border-[#d4af37] text-rose-50 shadow-lg shadow-[#d4af37]/20 scale-[1.03]',
    activePrayerText: 'text-[#d4af37] font-black',
    badgeBg: 'bg-rose-900/70 text-[#d4af37] border border-amber-500/30',
    glowEffect: 'shadow-[0_0_50px_rgba(245,158,11,0.12)]',
    tickerBg: 'bg-rose-950/90 border border-[#d4af37]/30'
  },
  'light-pearl-gold': {
    id: 'light-pearl-gold',
    nameAr: 'اللؤلؤ الناصع والذهب الملكي (فاتح)',
    taglineAr: 'تصميم مشرق ومشرق للمساجد ذات الإضاءة العالية',
    category: 'light',
    descriptionAr: 'خلفية لؤلؤية فاتحة تمنح المكان انشراحاً ونقاءً، مع نصوص كحلية داكنة وإطارات ذهبية واضحة جداً نهاراً.',
    previewBg: '#f8fafc',
    previewAccent: '#b45309',
    bgClass: 'bg-slate-100 text-slate-900',
    cardBgClass: 'bg-white/90 backdrop-blur-md border border-slate-300 shadow-xl',
    accentBorder: 'border-[#b45309]/50',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-600',
    accentGold: 'text-[#b45309]',
    activePrayerBg: 'bg-[#d4af37]/20 border-2 border-[#b45309] text-slate-950 shadow-xl scale-[1.03]',
    activePrayerText: 'text-[#b45309] font-black',
    badgeBg: 'bg-amber-100 text-[#b45309] border border-amber-300',
    glowEffect: 'shadow-[0_0_30px_rgba(180,83,9,0.15)]',
    tickerBg: 'bg-slate-200/90 border border-slate-300'
  },
  'sapphire-silver': {
    id: 'sapphire-silver',
    nameAr: 'اللازورد الملكي والفضة المشرقة',
    taglineAr: 'حداثة وهيبة الأزرق الفاخر',
    category: 'modern',
    descriptionAr: 'درجات الأزرق اللازوردي الساطع مع لمسات فضية وطلاء ذهبي نقي، تصميم عصري وأنيق لشاشات العرض الحديثة.',
    previewBg: '#0f172a',
    previewAccent: '#38bdf8',
    bgClass: 'bg-gradient-to-br from-[#0b132b] via-[#1c2541] to-[#0b132b]',
    cardBgClass: 'bg-[#1c2541]/80 backdrop-blur-md border border-cyan-500/30 shadow-2xl',
    accentBorder: 'border-cyan-400/40',
    textPrimary: 'text-slate-100',
    textSecondary: 'text-cyan-200/70',
    accentGold: 'text-[#38bdf8]',
    activePrayerBg: 'bg-cyan-500/20 border-2 border-[#38bdf8] text-white shadow-[0_0_40px_rgba(56,189,248,0.3)] scale-[1.03]',
    activePrayerText: 'text-[#38bdf8] font-black',
    badgeBg: 'bg-cyan-950 text-[#38bdf8] border border-cyan-500/40',
    glowEffect: 'shadow-[0_0_50px_rgba(56,189,248,0.2)]',
    tickerBg: 'bg-[#0b132b]/95 border border-cyan-500/30'
  },
  'desert-sand-gold': {
    id: 'desert-sand-gold',
    nameAr: 'كثبان الصحراء والذهب النجدية',
    taglineAr: 'دفء الصحراء وأصالة التراث العربي',
    category: 'heritage',
    descriptionAr: 'درجات اللون الرملي الدافئ والتمر الهندي الممزوج بالذهب الأصيل، يعكس الأصالة والراحة البصرية التامة.',
    previewBg: '#291e12',
    previewAccent: '#d97706',
    bgClass: 'bg-gradient-to-br from-[#1c130b] via-[#291e12] to-[#170e07]',
    cardBgClass: 'bg-[#291e12]/85 backdrop-blur-md border border-amber-700/50 shadow-2xl',
    accentBorder: 'border-amber-600/40',
    textPrimary: 'text-amber-50',
    textSecondary: 'text-amber-200/70',
    accentGold: 'text-[#fbbf24]',
    activePrayerBg: 'bg-amber-500/20 border-2 border-[#fbbf24] text-amber-50 shadow-xl scale-[1.03]',
    activePrayerText: 'text-[#fbbf24] font-black',
    badgeBg: 'bg-amber-950 text-[#fbbf24] border border-amber-600/40',
    glowEffect: 'shadow-[0_0_40px_rgba(251,191,36,0.2)]',
    tickerBg: 'bg-[#1c130b]/95 border border-amber-600/30'
  },
  'modern-obsidian': {
    id: 'modern-obsidian',
    nameAr: 'الأوبسيديان المعاصر والتطعيم الذهبي',
    taglineAr: 'بساطة عصرية فائقة الوضوح',
    category: 'modern',
    descriptionAr: 'أسود فحمي خالص ونقي 100% يمنح تبايناً أسطورياً للكلمات والأرقام على الشاشات الكبيرة مع استهلاك طاقة منخفض.',
    previewBg: '#050505',
    previewAccent: '#eab308',
    bgClass: 'bg-black',
    cardBgClass: 'bg-zinc-950/90 border border-zinc-800 shadow-2xl',
    accentBorder: 'border-amber-500/40',
    textPrimary: 'text-zinc-100',
    textSecondary: 'text-zinc-400',
    accentGold: 'text-amber-400',
    activePrayerBg: 'bg-amber-400/10 border-2 border-amber-400 text-amber-300 shadow-[0_0_35px_rgba(251,191,36,0.2)] scale-[1.03]',
    activePrayerText: 'text-amber-400 font-black',
    badgeBg: 'bg-zinc-900 text-amber-400 border border-amber-500/30',
    glowEffect: 'shadow-[0_0_40px_rgba(251,191,36,0.15)]',
    tickerBg: 'bg-zinc-950 border border-zinc-800'
  }
};

