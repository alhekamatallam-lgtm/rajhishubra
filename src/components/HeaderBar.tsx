import React from 'react';
import { ScreenViewMode, MosqueSettings } from '../types';
import { Tv, Sliders, Maximize, Volume2, Sparkles, CheckCircle, AlertTriangle } from 'lucide-react';
import { playChimeSound } from '../lib/timeUtils';

interface HeaderBarProps {
  viewMode: ScreenViewMode;
  setViewMode: (mode: ScreenViewMode) => void;
  settings: MosqueSettings;
  isApiFallback?: boolean;
  onOpenCatalog: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  viewMode,
  setViewMode,
  settings,
  isApiFallback,
  onOpenCatalog
}) => {
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Fullscreen request failed:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <header className="bg-slate-950/90 backdrop-blur-md border-b border-amber-500/20 px-4 py-3 text-slate-100 flex flex-wrap items-center justify-between gap-3 shadow-lg select-none z-50 sticky top-0">
      {/* Mosque Branding & Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 flex-shrink-0">
          {settings.logoTallUrl && (
            <div className="h-10 px-3 rounded-xl bg-white border border-[#d4af37]/40 p-1 flex items-center justify-center shadow-md overflow-hidden">
              <img
                src={settings.logoTallUrl}
                alt="الشعار"
                className="max-w-full max-h-full object-contain"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget.parentElement as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          )}
          {settings.logoUrl && (
            <div className="w-10 h-10 rounded-xl bg-white border border-[#d4af37]/40 p-1 flex items-center justify-center shadow-md overflow-hidden">
              <img
                src={settings.logoUrl}
                alt="شعار الجامع"
                className="max-w-full max-h-full object-contain"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget.parentElement as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          )}
          {!settings.logoUrl && !settings.logoTallUrl && (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
              <Tv className="w-5 h-5" />
            </div>
          )}
        </div>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-[#d4af37] flex flex-wrap items-center gap-2">
            <span>{settings.mosqueName}</span>
          </h1>
          <p className="text-xs text-slate-400">
            {settings.cityNameAr} • {settings.neighborhood} • تقويم أم القرى
          </p>
        </div>
      </div>

      {/* KACST API Status Badge */}
      <div className="hidden md:flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
        {isApiFallback ? (
          <>
            <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-amber-300 font-medium">حساب احتياطي فلكي</span>
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-300 font-medium">تقويم أم القرى المعتمد (KACST API)</span>
          </>
        )}
      </div>

      {/* View Switcher Controls */}
      <div className="flex items-center gap-2">
        <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
          <button
            onClick={() => setViewMode(viewMode === 'control' ? 'display' : 'control')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>{viewMode === 'control' ? 'العودة إلى الشاشة' : 'لوحة التحكم (5 خطوات)'}</span>
          </button>
        </div>

        {/* Audio Test */}
        <button
          onClick={() => playChimeSound('adhan')}
          title="اختبار الصوت والتنبيهات"
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-300 transition-colors"
        >
          <Volume2 className="w-4 h-4" />
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullScreen}
          title="عرض ملء الشاشة لشاشات التلفزيون"
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-300 transition-colors"
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
