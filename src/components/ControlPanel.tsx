import React, { useState } from 'react';
import {
  MosqueSettings,
  CityConfig,
  Announcement,
  AdhkarItem,
  KacstPrayerResponse,
  ThemePreset,
  DisplaySubState
} from '../types';
import { CITIES_LIST } from '../data/cities';
import { THEMES } from '../lib/theme';
import { AIHadithGenerator } from './AIHadithGenerator';
import {
  MapPin,
  Clock,
  Megaphone,
  Palette,
  Tv,
  CheckCircle2,
  Sparkles,
  Plus,
  Trash2,
  Volume2,
  BellRing,
  Eye,
  Sun,
  Moon,
  ShieldCheck,
  RefreshCw,
  Maximize2
} from 'lucide-react';
import { PRAYER_NAMES_AR, playChimeSound } from '../lib/timeUtils';

interface ControlPanelProps {
  settings: MosqueSettings;
  onUpdateSettings: (newSettings: Partial<MosqueSettings>) => void;
  announcements: Announcement[];
  onAddAnnouncement: (ann: Omit<Announcement, 'id'>) => void;
  onDeleteAnnouncement: (id: string) => void;
  onToggleAnnouncement: (id: string) => void;
  adhkar: AdhkarItem[];
  onAddAdhkar: (item: Omit<AdhkarItem, 'id'>) => void;
  onDeleteAdhkar: (id: string) => void;
  prayerData: KacstPrayerResponse | null;
  onRefreshPrayers: () => void;
  activeTestState: DisplaySubState;
  onSetTestState: (state: DisplaySubState) => void;
  onSwitchToDisplay: () => void;
  onOpenCatalog?: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  settings,
  onUpdateSettings,
  announcements,
  onAddAnnouncement,
  onDeleteAnnouncement,
  onToggleAnnouncement,
  adhkar,
  onAddAdhkar,
  onDeleteAdhkar,
  prayerData,
  onRefreshPrayers,
  activeTestState,
  onSetTestState,
  onSwitchToDisplay,
  onOpenCatalog
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);

  // New announcement local state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'khutbah' | 'lesson' | 'general' | 'donation'>('general');

  // New Adhkar local state
  const [newAdhkarText, setNewAdhkarText] = useState('');
  const [newAdhkarSource, setNewAdhkarSource] = useState('');

  const handleCitySelect = (cityId: string) => {
    const city = CITIES_LIST.find((c) => c.id === cityId);
    if (city) {
      onUpdateSettings({
        cityId: city.id,
        cityNameAr: city.nameAr,
        lat: city.lat,
        lon: city.lon,
        zone: city.zone
      });
    }
  };

  const handleAddAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    onAddAnnouncement({
      title: newTitle.trim(),
      content: newContent.trim(),
      date: 'اليوم',
      category: newCategory,
      active: true,
      author: 'إدارة المسجد'
    });
    setNewTitle('');
    setNewContent('');
  };

  const handleAddAdhkarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdhkarText.trim()) return;
    onAddAdhkar({
      text: newAdhkarText.trim(),
      source: newAdhkarSource.trim() || 'أذكار وأحاديث',
      category: 'post_prayer'
    });
    setNewAdhkarText('');
    setNewAdhkarSource('');
  };

  const steps = [
    { num: 1, title: 'المدينة وتقويم أم القرى', icon: MapPin },
    { num: 2, title: 'مواقيت الإقامة والتنبيهات', icon: Clock },
    { num: 3, title: 'الإعلانات والخطبة والذكاء الاصطناعي', icon: Megaphone },
    { num: 4, title: 'تخصيص شاشة 90" والألوان', icon: Palette },
    { num: 5, title: 'معاينة شاشة المسجد المباشرة', icon: Tv }
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 text-slate-100 dir-rtl font-sans space-y-6">
      {/* Step Wizard Header Navigation */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-amber-300 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>دليل تهيئة شاشة الجامع 90 بوصة (في 5 خطوات)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              قم بضبط الموقع والمواقيت والإعلانات لمعاينتها فوراً على شاشة العرض الرئيسية
            </p>
          </div>
          <button
            onClick={onSwitchToDisplay}
            className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-sm hover:from-amber-400 hover:to-amber-500 shadow-md shadow-amber-500/20 transition-all"
          >
            <Maximize2 className="w-4 h-4" />
            <span>انتقال لشاشة العرض (90")</span>
          </button>
        </div>

        {/* Steps Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = activeStep === step.num;
            return (
              <button
                key={step.num}
                onClick={() => setActiveStep(step.num)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center ${
                  isActive
                    ? 'bg-gradient-to-b from-amber-500/20 to-amber-600/10 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span className="text-xs font-bold text-amber-400/80 mb-1">الخطوة {step.num}</span>
                <div className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{step.title.split(' ')[0]} {step.title.split(' ')[1]}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content Container */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-2xl">
        {/* STEP 1: CITY & UMM AL-QURA API */}
        {activeStep === 1 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-amber-300">الخطوة 1: اختيار المدينة وتقويم أم القرى</h3>
                  <p className="text-xs text-slate-400">
                    ربط التطبيق برابط KACST API لجلب مواقيت تقويم أم القرى الرسمي (الهجري والميلادي والأوقات)
                  </p>
                </div>
              </div>

              <button
                onClick={onRefreshPrayers}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold text-amber-300 border border-slate-700 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>تحديث المواقيت الآن</span>
              </button>
            </div>

            {/* Current Selected Mosque Profile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">اسم الجامع / المسجد</label>
                <input
                  type="text"
                  value={settings.mosqueName}
                  onChange={(e) => onUpdateSettings({ mosqueName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  placeholder="مثال: جامع الشيخ عبدالله الراجحي - رحمه الله - بشبرا"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">اسم الحي / المنطقة</label>
                <input
                  type="text"
                  value={settings.neighborhood}
                  onChange={(e) => onUpdateSettings({ neighborhood: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  placeholder="مثال: حي شبرا - الرياض"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">رابط شعار الجامع (المربع / الأيقونة)</label>
                <input
                  type="url"
                  value={settings.logoUrl || ''}
                  onChange={(e) => onUpdateSettings({ logoUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500 dir-ltr text-left"
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">رابط الشعار الملون الطولي / للمؤسسة</label>
                <input
                  type="url"
                  value={settings.logoTallUrl || ''}
                  onChange={(e) => onUpdateSettings({ logoTallUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500 dir-ltr text-left"
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Cities Selection Grid */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-amber-300 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>اختر المدينة من قائمة المدن السعودية والخليجية المعتمدة:</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {CITIES_LIST.map((c) => {
                  const isSelected = settings.cityId === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => handleCitySelect(c.id)}
                      className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                          : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className="font-bold text-sm">{c.nameAr}</span>
                      <span className="text-[10px] text-slate-400 mt-1">{c.region}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live API Response Display */}
            {prayerData && (
              <div className="bg-slate-950/90 rounded-xl p-4 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تم استلام بيانات مواقيت أم القرى بنجاح</span>
                  </span>
                  <span>المدينة الحالية: {settings.cityNameAr}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-slate-400 block">التاريخ الهجري:</span>
                    <span className="font-bold text-amber-300 text-sm">
                      {prayerData.hijriDate.day} {prayerData.hijriDate.nameAr} {prayerData.hijriDate.year} هـ
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">التاريخ الميلادي:</span>
                    <span className="font-bold text-slate-200 text-sm">
                      {prayerData.gregorianDate.day} {prayerData.gregorianDate.nameAr} {prayerData.gregorianDate.year} م
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">التقويم الشمسي:</span>
                    <span className="font-bold text-slate-300 text-sm">
                      {prayerData.solarHijriDate.day} {prayerData.solarHijriDate.nameAr} {prayerData.solarHijriDate.year}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">المصدر:</span>
                    <span className="font-bold text-emerald-300 text-sm">
                      {prayerData.isFallback ? 'حسابات احتياطية' : 'مدينة الملك عبدالعزيز (KACST API)'}
                    </span>
                  </div>
                </div>

                {/* Prayer Times Preview Row */}
                <div className="grid grid-cols-6 gap-2 text-center text-xs">
                  {Object.entries(prayerData.prayerTimes).map(([key, timeVal]) => (
                    <div key={key} className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      <span className="block text-slate-400 font-medium">
                        {PRAYER_NAMES_AR[key as keyof typeof PRAYER_NAMES_AR] || key}
                      </span>
                      <span className="block font-bold text-amber-300 text-sm mt-1">{timeVal}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: IQAMAH TIMERS & ALERTS */}
        {activeStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-amber-300">الخطوة 2: مواقيت الإقامة والتنبيهات الصوتية</h3>
                <p className="text-xs text-slate-400">
                  تحديد مدة الانتظار للإقامة بالدقائق لكل صلاة وتنشيط تنبيهات الصوت وإغلاق الهواتف
                </p>
              </div>
            </div>

            {/* Iqamah Minutes Controls Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              {(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const).map((pName) => (
                <div key={pName} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-center">
                  <span className="text-sm font-bold text-amber-300 block">
                    صلاة {PRAYER_NAMES_AR[pName]}
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={settings.iqamahMinutes[pName]}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 10;
                        onUpdateSettings({
                          iqamahMinutes: {
                            ...settings.iqamahMinutes,
                            [pName]: val
                          }
                        });
                      }}
                      className="w-16 bg-slate-900 border border-slate-700 rounded-lg py-1.5 text-center font-bold text-lg text-amber-300 focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-xs text-slate-400">دقيقة</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Audio & Auto-Blackout Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="font-bold text-sm text-amber-200 block flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-amber-400" />
                    <span>التنبيهات الصوتية عند الأذان والإقامة</span>
                  </span>
                  <p className="text-xs text-slate-400">إصدار نغمة خفيفة تنبه المصلين بدخول الوقت</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.soundAlertsEnabled}
                  onChange={(e) => onUpdateSettings({ soundAlertsEnabled: e.target.checked })}
                  className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="font-bold text-sm text-amber-200 block flex items-center gap-2">
                    <Moon className="w-4 h-4 text-amber-400" />
                    <span>إعتام الشاشة أثناء الصلاة (وضع الخشوع)</span>
                  </span>
                  <p className="text-xs text-slate-400">عرض "استووا وتراحموا" وإغلاق الأذكار أثناء أداء الصلاة</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoBlackoutDuringPrayer}
                  onChange={(e) => onUpdateSettings({ autoBlackoutDuringPrayer: e.target.checked })}
                  className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: ANNOUNCEMENTS & AI HADITH GENERATOR */}
        {activeStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-amber-300">الخطوة 3: إدارة إعلانات المسجد وخطبة الجمعة والذكاء الاصطناعي</h3>
                <p className="text-xs text-slate-400">
                  إضافة الأنشطة والدروس العلمية، وصياغة المواعظ بتشغيل الذكاء الاصطناعي
                </p>
              </div>
            </div>

            {/* AI Assistant Component */}
            <AIHadithGenerator onAddAnnouncement={onAddAnnouncement} />

            {/* Manual Announcement Form */}
            <form onSubmit={handleAddAnnouncementSubmit} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-sm text-amber-300 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span>إضافة إعلان جديد يدوياً:</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="عنوان الإعلان (مثال: درس يوم السبت)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="khutbah">خطبة الجمعة</option>
                  <option value="lesson">درس علمي</option>
                  <option value="general">إعلان عام</option>
                  <option value="donation">أنشطة وتبرعات</option>
                </select>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>نشر الإعلان</span>
                </button>
              </div>

              <textarea
                placeholder="تفاصيل الإعلان أو نص الموعظة..."
                rows={2}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </form>

            {/* Current Announcements List */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-300">الإعلانات النشطة حالياً على الشاشة:</h4>
              <div className="space-y-2">
                {announcements.map((ann) => (
                  <div key={ann.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-300 text-sm">{ann.title}</span>
                        <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-amber-400 border border-slate-800">
                          {ann.category === 'khutbah' ? 'خطبة الجمعة' : ann.category === 'lesson' ? 'درس علمي' : 'إعلان عام'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{ann.content}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onToggleAnnouncement(ann.id)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold ${
                          ann.active ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-900 text-slate-400'
                        }`}
                      >
                        {ann.active ? 'ظاهر' : 'مخفي'}
                      </button>
                      <button
                        onClick={() => onDeleteAnnouncement(ann.id)}
                        className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: TV DISPLAY CUSTOMIZATION */}
        {activeStep === 4 && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-amber-300">الخطوة 4: كتالوج التصاميم وتخصيص الألوان لشاشة 90 بوصة</h3>
                  <p className="text-xs text-slate-400">
                    استعراض المظاهر الاحترافية 8 المصممة خصيصاً للجوامع الكبرى والشاشات العريضة
                  </p>
                </div>
              </div>

              {onOpenCatalog && (
                <button
                  onClick={onOpenCatalog}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-amber-500 to-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>افتح كتالوج التصاميم (معاينة تفاعلية)</span>
                </button>
              )}
            </div>

            {/* Theme Presets Selection */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-amber-300 block">اختر ثيم الألوان للشاشة:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(Object.keys(THEMES) as ThemePreset[]).map((tKey) => {
                  const theme = THEMES[tKey];
                  const isSelected = settings.theme === tKey;
                  return (
                    <button
                      key={tKey}
                      onClick={() => onUpdateSettings({ theme: tKey })}
                      className={`p-4 rounded-xl border text-right transition-all space-y-3 relative overflow-hidden ${
                        isSelected
                          ? 'border-amber-500 ring-2 ring-amber-500/30 shadow-lg'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className={`h-16 rounded-lg ${theme.bgClass} flex items-center justify-center border border-slate-700/50`}>
                        <span className={`font-bold text-sm ${theme.accentGold}`}>04:30 PM</span>
                      </div>
                      <div>
                        <span className="font-bold text-sm text-slate-100 block">{theme.nameAr}</span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 left-2 bg-amber-500 text-slate-950 rounded-full p-0.5">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Font Scaling for 90" TV */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <label className="text-sm font-bold text-amber-300 block">
                حجم الخط واستيعاب المسافات (مخصص لشاشات التلفزيون الكبيرة 90 بوصة):
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'normal', label: 'عادي (شاشات صغيرة/حاسوب)' },
                  { id: 'large', label: 'كبير (شاشات 55 - 75 بوصة)' },
                  { id: 'xlarge_90inch', label: 'ضخم جداً (موصى به لشاشة 90 بوصة)' }
                ].map((scale) => (
                  <button
                    key={scale.id}
                    onClick={() => onUpdateSettings({ fontSizeScale: scale.id as any })}
                    className={`p-3 rounded-xl border text-center font-bold text-xs transition-all ${
                      settings.fontSizeScale === scale.id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {scale.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: LIVE DISPLAY PREVIEW & TEST TRIGGERS */}
        {activeStep === 5 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Tv className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-amber-300">الخطوة 5: معاينة الشاشة واختبار الأطوار</h3>
                  <p className="text-xs text-slate-400">
                    اختبار كيفية ظهور شاشة العرض أثناء الأذان، الإقامة، أداء الصلاة، أو الأذكار
                  </p>
                </div>
              </div>

              <button
                onClick={onSwitchToDisplay}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
              >
                <Maximize2 className="w-4 h-4" />
                <span>تشغيل الشاشة كاملة (90")</span>
              </button>
            </div>

            {/* Test State Selector Buttons */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-amber-300 block">
                اختبار سيناريوهات العرض المختلفة على شاشة المسجد:
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { id: 'normal', label: 'العرض الطبيعي (المواقيت)' },
                  { id: 'adhan', label: 'شاشة الأذان (الله أكبر)' },
                  { id: 'iqamah_countdown', label: 'عداد الإقامة (الانتظار)' },
                  { id: 'in_prayer', label: 'أثناء الصلاة (استووا)' },
                  { id: 'post_prayer_adhkar', label: 'أذكار ما بعد الصلاة' }
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => {
                      onSetTestState(st.id as DisplaySubState);
                      if (st.id === 'adhan') playChimeSound('adhan');
                      if (st.id === 'iqamah_countdown') playChimeSound('iqamah');
                    }}
                    className={`p-3 rounded-xl border font-bold text-xs transition-all flex flex-col items-center justify-center gap-1.5 ${
                      activeTestState === st.id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <Eye className="w-4 h-4 text-amber-400" />
                    <span>{st.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-amber-500/20 text-xs text-slate-300 space-y-2">
              <span className="font-bold text-amber-300 block flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>جاهزية العرض لشاشة 90 بوصة:</span>
              </span>
              <p>
                تم ضبط المواقيت تلقائياً حسب تقويم أم القرى ({settings.cityNameAr}). يمكنك الآن ضغط زر "عرض الشاشة (90 بوصة)" أعلاه لتشغيل العرض التلفزيوني بالكامل في الجامع.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
