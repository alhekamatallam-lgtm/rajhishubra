import React, { useState, useEffect } from 'react';
import {
  MosqueSettings,
  KacstPrayerResponse,
  Announcement,
  AdhkarItem,
  DisplaySubState,
  PrayerName
} from '../types';
import { THEMES } from '../lib/theme';
import {
  PRAYER_NAMES_AR,
  getNextPrayerInfo,
  getCurrentPrayer,
  formatSecondsToHHMMSS,
  playChimeSound,
  parsePrayerTimeToMinutes,
  getFallbackPrayerTimes
} from '../lib/timeUtils';
import {
  Clock,
  Calendar,
  Volume2,
  VolumeX,
  Smartphone,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Sun,
  ShieldAlert,
  Moon
} from 'lucide-react';

interface DisplayViewProps {
  settings: MosqueSettings;
  prayerData: KacstPrayerResponse | null;
  announcements: Announcement[];
  adhkar: AdhkarItem[];
  subState: DisplaySubState;
  onSetSubState: (state: DisplaySubState) => void;
}

export const DisplayView: React.FC<DisplayViewProps> = ({
  settings,
  prayerData,
  announcements,
  adhkar,
  subState,
  onSetSubState
}) => {
  const theme = THEMES[settings.theme] || THEMES['emerald-gold'];

  // Live time counter
  const [now, setNow] = useState<Date>(new Date());
  const [activeAdhkarIndex, setActiveAdhkarIndex] = useState<number>(0);
  const [activeAnnounceIndex, setActiveAnnounceIndex] = useState<number>(0);

  // Iqamah countdown seconds when in iqamah_countdown substate
  const [iqamahCountdownSec, setIqamahCountdownSec] = useState<number>(15 * 60);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Adhkar carousel auto scroll
  useEffect(() => {
    if (adhkar.length === 0) return;
    const interval = setInterval(() => {
      setActiveAdhkarIndex((prev) => (prev + 1) % adhkar.length);
    }, (settings.adhkarSpeedSec || 8) * 1000);
    return () => clearInterval(interval);
  }, [adhkar.length, settings.adhkarSpeedSec]);

  // Announcements carousel
  const activeAnnouncements = announcements.filter((a) => a.active);
  useEffect(() => {
    if (activeAnnouncements.length === 0) return;
    const interval = setInterval(() => {
      setActiveAnnounceIndex((prev) => (prev + 1) % activeAnnouncements.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [activeAnnouncements.length]);

  // Handle Iqamah countdown timer tick
  useEffect(() => {
    if (subState !== 'iqamah_countdown') return;
    const interval = setInterval(() => {
      setIqamahCountdownSec((prev) => {
        if (prev <= 1) {
          if (settings.autoBlackoutDuringPrayer) {
            onSetSubState('in_prayer');
          } else {
            onSetSubState('normal');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [subState, settings.autoBlackoutDuringPrayer, onSetSubState]);

  const activePrayerData = prayerData || getFallbackPrayerTimes(now.getFullYear(), now.getMonth() + 1, now.getDate(), settings.lat, settings.lon);

  const { prayerTimes, hijriDate, gregorianDate } = activePrayerData;
  const nextInfo = getNextPrayerInfo(prayerTimes, now);
  const currentPrayerName = getCurrentPrayer(prayerTimes, now);

  // Formatted current clock strings
  const timeHours = now.getHours();
  const displayHours = timeHours % 12 === 0 ? 12 : timeHours % 12;
  const timeMinutes = now.getMinutes().toString().padStart(2, '0');
  const timeSeconds = now.getSeconds().toString().padStart(2, '0');
  const periodAr = timeHours >= 12 ? 'م' : 'ص';

  const dayNamesAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const currentDayAr = dayNamesAr[now.getDay()];

  // Scale classes according to settings
  const fontScaleClass =
    settings.fontSizeScale === 'xlarge_90inch'
      ? 'scale-105 sm:scale-110'
      : settings.fontSizeScale === 'large'
      ? 'scale-100'
      : 'scale-95';

  return (
    <div className={`min-h-screen ${theme.bgClass} font-sans dir-rtl ${theme.textPrimary} flex flex-col justify-between p-4 md:p-8 select-none overflow-hidden relative transition-colors duration-700 ${fontScaleClass}`}>
      
      {/* FULLSCREEN OVERLAY: ADHAN STATE */}
      {subState === 'adhan' && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center animate-fade-in">
          <div className="w-24 h-24 rounded-3xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mb-8 shadow-2xl shadow-amber-500/30 animate-bounce">
            <Volume2 className="w-12 h-12 text-amber-400" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-amber-300 mb-6 font-serif">
            اللَّهُ أَكْبَرُ .. اللَّهُ أَكْبَرُ
          </h1>
          <p className="text-2xl md:text-4xl text-amber-100 font-bold mb-4">
            حَانَ الآنَ وَقْتُ أَذَانِ صَلاَةِ {PRAYER_NAMES_AR[nextInfo.nextPrayer]}
          </p>
          <p className="text-lg text-slate-400 mb-8">
            حسب تقويم أم القرى الرسمي لمدينة {settings.cityNameAr}
          </p>
          <button
            onClick={() => {
              // Start Iqamah countdown
              const iqMin = settings.iqamahMinutes[nextInfo.nextPrayer as keyof typeof settings.iqamahMinutes] || 15;
              setIqamahCountdownSec(iqMin * 60);
              onSetSubState('iqamah_countdown');
            }}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-8 py-4 rounded-2xl text-xl shadow-xl shadow-amber-500/30 transition-all"
          >
            بدء عداد الإقامة ({settings.iqamahMinutes[nextInfo.nextPrayer as keyof typeof settings.iqamahMinutes] || 15} دقيقة)
          </button>
        </div>
      )}

      {/* FULLSCREEN OVERLAY: IQAMAH COUNTDOWN STATE */}
      {subState === 'iqamah_countdown' && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center">
          <div className="relative mb-8">
            <div className="w-64 h-64 md:w-80 md:h-80 rounded-full border-8 border-amber-500/30 flex items-center justify-center bg-slate-900/80 shadow-2xl shadow-amber-500/20">
              <span className="text-5xl md:text-7xl font-black text-amber-300 font-mono tracking-wider">
                {formatSecondsToHHMMSS(iqamahCountdownSec)}
              </span>
            </div>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-amber-100 mb-3">
            المُتَبَقِّي لإِقَامَةِ صَلاَةِ {PRAYER_NAMES_AR[nextInfo.nextPrayer]}
          </h2>
          <p className="text-lg md:text-xl text-amber-400/80 font-semibold mb-8">
            يرجى الاستعداد والتراصف والتهيؤ للصلاة
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onSetSubState('in_prayer')}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-3 rounded-xl text-base shadow-lg"
            >
              إقامة الصلاة الآن (وضع الخشوع)
            </button>
            <button
              onClick={() => onSetSubState('normal')}
              className="bg-slate-800 text-slate-300 hover:text-white px-6 py-3 rounded-xl text-base"
            >
              إلغاء وإعادة للشاشة الرئيسية
            </button>
          </div>
        </div>
      )}

      {/* FULLSCREEN OVERLAY: IN PRAYER (SILENCE PHONES) STATE */}
      {subState === 'in_prayer' && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-8 text-center text-slate-100">
          <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-8">
            <Smartphone className="w-10 h-10 text-amber-500 animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-amber-400 mb-6 font-serif">
            اسْتَوُوا وَتَرَاحَمُوا
          </h1>
          <p className="text-2xl md:text-4xl text-slate-300 font-bold mb-8">
            يُرْجَى إِغْلاَقُ الهَوَاتِفِ النَّقَّالَةِ أَوْ وَضْعُهَا عَلَى الصَّامِتِ
          </p>
          <p className="text-base text-slate-500 max-w-xl">
            «إنَّ الصَّلاةَ تَنْهَى عَنِ الفَحْشَاءِ والمُنْكَرِ» - تقبل الله طاعتكم
          </p>

          <button
            onClick={() => onSetSubState('post_prayer_adhkar')}
            className="mt-12 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 font-bold px-6 py-3 rounded-xl text-sm transition-all"
          >
            الانتقال لأذكار ما بعد الصلاة
          </button>
        </div>
      )}

      {/* FULLSCREEN OVERLAY: POST PRAYER ADHKAR CAROUSEL */}
      {subState === 'post_prayer_adhkar' && (
        <div className={`fixed inset-0 z-50 ${theme.bgClass} flex flex-col justify-between p-8 text-center`}>
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
            <h2 className="text-2xl font-bold text-amber-300">أَذْكَارُ مَا بَعْدَ الصَّلاَةِ</h2>
            <button
              onClick={() => onSetSubState('normal')}
              className="bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-sm"
            >
              الرجوع للعرض الرئيسي
            </button>
          </div>

          <div className="max-w-4xl mx-auto my-auto space-y-6">
            <div className={`p-8 rounded-3xl ${theme.cardBgClass} space-y-4`}>
              <span className={`text-xs ${theme.badgeBg} px-3 py-1 rounded-full`}>
                الذِّكْرُ الحالي ({activeAdhkarIndex + 1} من {adhkar.length})
              </span>
              <p className={`text-2xl md:text-4xl font-black ${theme.accentGold} leading-relaxed font-serif`}>
                {adhkar[activeAdhkarIndex]?.text}
              </p>
              <span className={`block text-sm ${theme.textSecondary}`}>
                {adhkar[activeAdhkarIndex]?.source}
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-2">
            {adhkar.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveAdhkarIndex(idx)}
                className={`w-3 h-3 rounded-full transition-all ${
                  activeAdhkarIndex === idx ? 'bg-[#d4af37] w-8' : 'bg-slate-400/50'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* 1. TOP HEADER SECTION: MOSQUE NAME & LOGOS, DATES, CLOCK */}
      <header className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center border-b border-[#d4af37]/30 pb-6">
        
        {/* Right: Mosque Logos side by side (Text removed as requested to maximize logo space) */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 flex-shrink-0">
            {settings.logoTallUrl && (
              <div className="h-24 md:h-28 lg:h-32 max-w-[320px] bg-white rounded-2xl p-3 px-5 border-2 border-[#d4af37]/50 shadow-2xl flex items-center justify-center overflow-hidden">
                <img
                  src={settings.logoTallUrl}
                  alt="شعار المؤسسة"
                  className="max-h-full max-w-full object-contain"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget.parentElement as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            {settings.logoUrl && (
              <div className="h-24 md:h-28 lg:h-32 w-24 md:w-28 lg:w-32 bg-white rounded-2xl p-3 border-2 border-[#d4af37]/50 shadow-2xl flex items-center justify-center overflow-hidden">
                <img
                  src={settings.logoUrl}
                  alt="شعار جامع الشيخ عبدالله الراجحي"
                  className="max-h-full max-w-full object-contain"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget.parentElement as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Center: Main Digital Clock */}
        <div className={`flex flex-col items-center justify-center ${theme.cardBgClass} rounded-2xl p-4 shadow-2xl`}>
          <div className="flex items-baseline gap-2 dir-ltr">
            <span className={`text-5xl md:text-7xl lg:text-8xl font-black ${theme.accentGold} tracking-tight font-mono`}>
              {String(displayHours).padStart(2, '0')}:{timeMinutes}
            </span>
            <span className={`text-xl md:text-3xl font-bold ${theme.textPrimary} font-mono`}>
              :{timeSeconds}
            </span>
            <span className={`text-xl md:text-2xl font-black ${theme.accentGold} ml-1`}>
              {periodAr}
            </span>
          </div>
          <span className={`text-xs md:text-sm font-semibold ${theme.textSecondary} mt-1 font-sans`}>
            التوقيت المحلي لمدينة {settings.cityNameAr}
          </span>
        </div>

        {/* Left: Hijri & Gregorian Dates */}
        <div className="flex flex-col items-start md:items-end space-y-2">
          {/* Hijri Date Box */}
          <div className={`${theme.cardBgClass} px-5 py-2.5 rounded-xl flex items-center gap-3`}>
            <Calendar className={`w-5 h-5 ${theme.accentGold} flex-shrink-0`} />
            <div>
              <span className={`text-xs ${theme.textSecondary} block font-sans`}>التاريخ الهجري (تقويم أم القرى):</span>
              <span className={`text-base md:text-xl font-bold ${theme.accentGold}`}>
                {currentDayAr} {hijriDate.day} {hijriDate.nameAr} {hijriDate.year} هـ
              </span>
            </div>
          </div>

          {/* Gregorian Date */}
          <div className={`text-xs md:text-sm ${theme.textSecondary} font-medium px-2 font-sans`}>
            <span>{gregorianDate.day} {gregorianDate.nameAr} {gregorianDate.year} م</span>
          </div>
        </div>
      </header>

      {/* 2. MAIN CENTER SECTION: PRAYER TIMES CARDS GRID & COUNTDOWN BANNER */}
      <main className="my-6 space-y-6">
        
        {/* Next Prayer Countdown Card */}
        <div className={`${theme.cardBgClass} rounded-3xl p-6 border-2 ${theme.accentBorder} shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/10 rounded-full blur-2xl" />

          <div className="space-y-2 text-center md:text-right">
            <span className={`inline-block text-xs font-bold ${theme.badgeBg} px-3 py-1 rounded-full`}>
              الصَّلاَةُ القَادِمَةُ
            </span>
            <h2 className={`text-3xl md:text-5xl font-black ${theme.accentGold} font-serif`}>
              صَلاَةُ {PRAYER_NAMES_AR[nextInfo.nextPrayer]}
            </h2>
            <p className={`text-sm md:text-base ${theme.textSecondary}`}>
              الوقت المقرر للأذان: <span className={`font-bold ${theme.accentGold}`}>{nextInfo.nextPrayerTimeStr}</span>
            </p>
          </div>

          {/* Countdown Display */}
          <div className={`flex flex-col items-center justify-center ${theme.tickerBg} px-8 py-4 rounded-2xl shadow-inner`}>
            <span className={`text-xs ${theme.textSecondary} font-semibold mb-1`}>الوَقْتُ المُتَبَقِّي لِلأَذَانِ:</span>
            <span className={`text-3xl md:text-5xl lg:text-6xl font-black ${theme.accentGold} font-mono tracking-widest dir-ltr`}>
              {formatSecondsToHHMMSS(nextInfo.diffSeconds)}
            </span>
          </div>
        </div>

        {/* 6 PRAYER CARDS GRID (HUGE CONTRAST FOR 90" TV) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {(['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as PrayerName[]).map((name) => {
            const timeVal = prayerTimes[name];
            const isCurrent = currentPrayerName === name;
            const isNext = nextInfo.nextPrayer === name;
            const iqMin = settings.iqamahMinutes[name as keyof typeof settings.iqamahMinutes] || 15;

            return (
              <div
                key={name}
                className={`p-4 md:p-6 rounded-2xl transition-all duration-500 flex flex-col justify-between h-40 md:h-48 text-center relative ${
                  isNext
                    ? theme.activePrayerBg
                    : isCurrent
                    ? `${theme.cardBgClass} border-2 ${theme.accentBorder} ${theme.glowEffect}`
                    : `${theme.cardBgClass} opacity-95`
                }`}
              >
                {/* Header Tag */}
                <div className="flex items-center justify-between text-xs font-sans">
                  <span className={`font-bold ${isNext ? theme.activePrayerText : theme.accentGold}`}>
                    {name === 'sunrise' ? 'الشروق' : 'أذان'}
                  </span>
                  {name !== 'sunrise' && (
                    <span className={`text-[11px] font-semibold ${isNext ? theme.activePrayerText : theme.textSecondary}`}>
                      الإقامة: +{iqMin}د
                    </span>
                  )}
                </div>

                {/* Prayer Name */}
                <div className="my-auto">
                  <h3 className={`text-xl md:text-2xl lg:text-3xl font-bold font-serif ${isNext ? theme.activePrayerText : theme.accentGold}`}>
                    {PRAYER_NAMES_AR[name]}
                  </h3>

                  {/* Prayer Time */}
                  <span className={`block text-2xl md:text-3xl lg:text-4xl font-bold font-mono mt-2 dir-ltr ${isNext ? theme.activePrayerText : theme.textPrimary}`}>
                    {timeVal}
                  </span>
                </div>

                {/* Status Indicator */}
                <div className="text-[11px] font-bold font-sans">
                  {isNext ? (
                    <span className={`${theme.badgeBg} px-3 py-0.5 rounded-full inline-block uppercase text-[10px] tracking-widest font-extrabold shadow-sm`}>
                      القادمة
                    </span>
                  ) : isCurrent ? (
                    <span className={`${theme.accentGold} font-bold`}>الوقت الحالي</span>
                  ) : (
                    <span className="opacity-0">.</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* 3. ANNOUNCEMENTS CAROUSEL SLIDER */}
      {activeAnnouncements.length > 0 && (
        <section className={`${theme.cardBgClass} rounded-2xl p-4 shadow-lg mb-4 flex items-center justify-between gap-4`}>
          <div className="flex items-center gap-3">
            <span className={`${theme.badgeBg} text-xs font-bold px-3 py-1.5 rounded-xl flex-shrink-0`}>
              {activeAnnouncements[activeAnnounceIndex]?.category === 'khutbah'
                ? 'خطبة الجمعة'
                : activeAnnouncements[activeAnnounceIndex]?.category === 'lesson'
                ? 'درس اليوم'
                : 'إعلان الجامع'}
            </span>
            <div>
              <h4 className={`font-bold text-base md:text-lg ${theme.accentGold}`}>
                {activeAnnouncements[activeAnnounceIndex]?.title}
              </h4>
              <p className={`text-xs md:text-sm ${theme.textSecondary} line-clamp-1`}>
                {activeAnnouncements[activeAnnounceIndex]?.content}
              </p>
            </div>
          </div>

          <div className={`flex items-center gap-1 text-xs ${theme.textSecondary} flex-shrink-0`}>
            <span>{activeAnnounceIndex + 1} / {activeAnnouncements.length}</span>
          </div>
        </section>
      )}

      {/* 4. BOTTOM TICKER FOOTER: CONTINUOUS ADHKAR SCROLL */}
      <footer className={`${theme.tickerBg} rounded-2xl p-4 flex items-center justify-between gap-4 shadow-2xl`}>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Sparkles className={`w-5 h-5 ${theme.accentGold}`} />
          <span className={`font-bold text-sm ${theme.accentGold}`}>أَذْكَارٌ وَآيَاتٌ:</span>
        </div>

        <div className="flex-1 overflow-hidden">
          <p className={`text-base md:text-xl font-bold ${theme.textPrimary} font-serif truncate transition-all duration-500`}>
            {adhkar[activeAdhkarIndex]?.text}
          </p>
        </div>

        <span className={`text-xs ${theme.textSecondary} flex-shrink-0 hidden md:inline`}>
          {adhkar[activeAdhkarIndex]?.source}
        </span>
      </footer>
    </div>
  );
};
