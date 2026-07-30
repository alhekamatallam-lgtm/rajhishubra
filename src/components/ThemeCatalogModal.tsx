import React, { useState } from 'react';
import { MosqueSettings, ThemePreset } from '../types';
import { THEMES, ThemeConfig } from '../lib/theme';
import {
  Sparkles,
  Check,
  Palette,
  Eye,
  Sliders,
  Sun,
  Moon,
  Compass,
  Zap,
  X,
  Layers,
  Monitor
} from 'lucide-react';

interface ThemeCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: MosqueSettings;
  onUpdateSettings: (newSettings: Partial<MosqueSettings>) => void;
}

export const ThemeCatalogModal: React.FC<ThemeCatalogModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'dark' | 'heritage' | 'light' | 'modern'>('all');
  const [hoveredTheme, setHoveredTheme] = useState<ThemePreset | null>(null);

  if (!isOpen) return null;

  const themeList = Object.values(THEMES);
  const filteredThemes = themeList.filter((t) => {
    if (activeCategory === 'all') return true;
    return t.category === activeCategory;
  });

  const categories = [
    { id: 'all', label: 'جميع التصاميم', icon: Layers, count: themeList.length },
    { id: 'heritage', label: 'التراث والأندلسي', icon: Compass, count: themeList.filter(t => t.category === 'heritage').length },
    { id: 'dark', label: 'الفخامة الداكنة', icon: Moon, count: themeList.filter(t => t.category === 'dark').length },
    { id: 'light', label: 'المظهر الناصع', icon: Sun, count: themeList.filter(t => t.category === 'light').length },
    { id: 'modern', label: 'الحداثة والعصري', icon: Zap, count: themeList.filter(t => t.category === 'modern').length }
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-lg flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200 dir-rtl">
      <div className="bg-slate-950 border border-[#d4af37]/40 w-full max-w-6xl rounded-3xl shadow-[0_0_80px_rgba(212,175,55,0.25)] flex flex-col max-h-[90vh] overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-950 via-[#0a1a12] to-slate-950 px-6 py-5 border-b border-[#d4af37]/30 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shadow-lg">
              <Palette className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#d4af37] flex items-center gap-2">
                <span>كتالوج التصاميم والأنماط البصرية</span>
                <span className="text-xs bg-[#d4af37]/20 text-[#d4af37] px-3 py-1 rounded-full border border-[#d4af37]/30 font-sans">
                  خاص بشاشات 90 بوصة
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                اختر المظهر البصري المناسب لديكور المسجد وإضاءته بضغطة واحدة
              </p>
            </div>
          </div>

          {/* Scale Controller & Close button */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
              <Monitor className="w-4 h-4 text-[#d4af37]" />
              <span>حجم الخطوط:</span>
              <select
                value={settings.fontSizeScale}
                onChange={(e) => onUpdateSettings({ fontSizeScale: e.target.value as any })}
                className="bg-slate-950 text-[#d4af37] font-bold rounded px-2 py-1 border border-slate-700 focus:outline-none"
              >
                <option value="normal">قياسي (Normal)</option>
                <option value="large">كبير (Large)</option>
                <option value="xlarge_90inch">ضخم 90 بوصة (X-Large)</option>
              </select>
            </div>

            <button
              onClick={onClose}
              className="w-10 h-10 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Categories Navigation Bar */}
        <div className="bg-slate-900/90 px-6 py-3 border-b border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#d4af37] text-slate-950 shadow-md shadow-[#d4af37]/20'
                    : 'bg-slate-950/60 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Grid Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredThemes.map((theme) => {
              const isSelected = settings.theme === theme.id;
              const isHovered = hoveredTheme === theme.id;

              return (
                <div
                  key={theme.id}
                  onMouseEnter={() => setHoveredTheme(theme.id)}
                  onMouseLeave={() => setHoveredTheme(null)}
                  className={`relative rounded-3xl p-5 border-2 transition-all duration-300 flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#d4af37] bg-[#d4af37]/10 shadow-[0_0_40px_rgba(212,175,55,0.25)] ring-2 ring-[#d4af37]/50'
                      : 'border-slate-800 bg-slate-900/60 hover:border-[#d4af37]/40 hover:bg-slate-900/90'
                  }`}
                >
                  {/* Selected Badge */}
                  {isSelected && (
                    <div className="absolute top-4 left-4 z-10 bg-[#d4af37] text-slate-950 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1.5 shadow-md">
                      <Check className="w-4 h-4" />
                      <span>التصميم المطبق حالياً</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Theme Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="w-4 h-4 rounded-full border border-white/30 shadow-sm"
                            style={{ backgroundColor: theme.previewBg }}
                          />
                          <h3 className="text-lg font-bold text-slate-100 font-serif">
                            {theme.nameAr}
                          </h3>
                        </div>
                        <p className="text-xs text-[#d4af37] font-semibold">
                          {theme.taglineAr}
                        </p>
                      </div>

                      {/* Swatch Pill */}
                      <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.previewBg }} />
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.previewAccent }} />
                      </div>
                    </div>

                    {/* Interactive Live Mini Display Card */}
                    <div className={`rounded-2xl p-4 border overflow-hidden relative transition-transform duration-300 ${theme.bgClass} ${theme.accentBorder}`}>
                      {/* Mini Mosque Header */}
                      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-white p-0.5 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-slate-900">🕌</span>
                          </div>
                          <span className={`text-xs font-bold ${theme.accentGold}`}>
                            {settings.mosqueName}
                          </span>
                        </div>
                        <span className={`text-[10px] ${theme.textSecondary}`}>
                          1448 هـ • 12:45 PM
                        </span>
                      </div>

                      {/* Mini Prayers Row */}
                      <div className="grid grid-cols-5 gap-1.5 text-center my-2">
                        {[
                          { name: 'الفجر', time: '04:22', active: false },
                          { name: 'الظهر', time: '12:05', active: true },
                          { name: 'العصر', time: '03:32', active: false },
                          { name: 'المغرب', time: '06:40', active: false },
                          { name: 'العشاء', time: '08:10', active: false }
                        ].map((p, idx) => (
                          <div
                            key={idx}
                            className={`p-1.5 rounded-xl text-[10px] border transition-all ${
                              p.active
                                ? theme.activePrayerBg
                                : `${theme.cardBgClass} ${theme.textPrimary}`
                            }`}
                          >
                            <span className="block font-bold">{p.name}</span>
                            <span className="block font-mono font-semibold">{p.time}</span>
                          </div>
                        ))}
                      </div>

                      {/* Mini Bottom Ticker */}
                      <div className={`mt-3 p-1.5 rounded-lg text-[10px] text-center font-semibold truncate ${theme.tickerBg} ${theme.textPrimary}`}>
                        <span>﴿ أَقِمِ الصَّلَاةَ لِدُلُوكِ الشَّمْسِ إِلَىٰ غَسَقِ اللَّيْلِ ﴾</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {theme.descriptionAr}
                    </p>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-400">
                      مستحسن لشاشات UHD / 4K
                    </span>

                    <button
                      onClick={() => {
                        onUpdateSettings({ theme: theme.id });
                      }}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                        isSelected
                          ? 'bg-slate-800 text-[#d4af37] cursor-default border border-[#d4af37]/40'
                          : 'bg-gradient-to-r from-[#d4af37] to-amber-600 text-slate-950 hover:brightness-110 shadow-md shadow-amber-500/20'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-4 h-4 text-[#d4af37]" />
                          <span>التصميم نشط</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>تطبيق هذا التصميم</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-4 h-4 text-[#d4af37]" />
            <span>يتم حفظ اختيارك تلقائياً وبشكل دائم في ذاكرة الشاشة</span>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-[#d4af37] text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors"
          >
            إغلاق الكتالوج العودة للشاشة
          </button>
        </div>

      </div>
    </div>
  );
};
