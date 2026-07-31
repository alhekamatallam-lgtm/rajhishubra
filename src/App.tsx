import React, { useState, useEffect, useCallback } from 'react';
import {
  MosqueSettings,
  KacstPrayerResponse,
  Announcement,
  AdhkarItem,
  ScreenViewMode,
  DisplaySubState
} from './types';
import { DEFAULT_ADHKAR, INITIAL_ANNOUNCEMENTS } from './data/adhkar';
import { getFallbackPrayerTimes } from './lib/timeUtils';
import { HeaderBar } from './components/HeaderBar';
import { DisplayView } from './components/DisplayView';
import { ControlPanel } from './components/ControlPanel';
import { ThemeCatalogModal } from './components/ThemeCatalogModal';

const STORAGE_SETTINGS_KEY = 'mosque_90inch_settings';
const STORAGE_ANNOUNCEMENTS_KEY = 'mosque_90inch_announcements';
const STORAGE_ADHKAR_KEY = 'mosque_90inch_adhkar';

const DEFAULT_SETTINGS: MosqueSettings = {
  mosqueName: 'جامع الشيخ عبدالله الراجحي - رحمه الله - بشبرا',
  neighborhood: 'حي شبرا',
  cityId: 'riyadh',
  cityNameAr: 'الرياض',
  lat: 24.7136,
  lon: 46.6753,
  zone: 3,
  logoUrl: 'https://next.rajhifoundation.org/files/%D8%B4%D8%B9%D8%A7%D8%B1%20%D8%A7%D9%84%D8%AC%D8%A7%D9%85%D8%B9.png',
  logoTallUrl: 'https://next.rajhifoundation.org/files/%D8%A7%D9%84%D8%B4%D8%B9%D8%A7%D8%B1%20%D8%B7%D9%88%D9%84%20%D9%85%D9%84%D9%88%D9%86.png',
  iqamahMinutes: {
    fajr: 25,
    dhuhr: 15,
    asr: 15,
    maghrib: 10,
    isha: 15
  },
  soundAlertsEnabled: true,
  adhanBeepEnabled: true,
  theme: 'emerald-gold',
  fontSizeScale: 'xlarge_90inch',
  autoBlackoutDuringPrayer: true,
  blackoutDurationMinutes: 15,
  adhkarSpeedSec: 8,
  showWeather: true,
  tempCelsius: 38,
  weatherCondition: 'مشمس'
};

export default function App() {
  const [settings, setSettings] = useState<MosqueSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SETTINGS_KEY);
      if (!saved) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(saved);
      // Merge with default logos and fallback mosque name/neighborhood if missing or old defaults
      const mosqueName = parsed.mosqueName && parsed.mosqueName !== 'جَامِعُ التَّقْوَى' ? parsed.mosqueName : DEFAULT_SETTINGS.mosqueName;
      const neighborhood = (parsed.neighborhood && parsed.neighborhood !== 'حي الصحافة') ? parsed.neighborhood : DEFAULT_SETTINGS.neighborhood;
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        mosqueName,
        neighborhood,
        logoUrl: parsed.logoUrl || DEFAULT_SETTINGS.logoUrl,
        logoTallUrl: parsed.logoTallUrl || DEFAULT_SETTINGS.logoTallUrl,
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ANNOUNCEMENTS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
    } catch {
      return INITIAL_ANNOUNCEMENTS;
    }
  });

  const [adhkar, setAdhkar] = useState<AdhkarItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ADHKAR_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_ADHKAR;
    } catch {
      return DEFAULT_ADHKAR;
    }
  });

  const [viewMode, setViewMode] = useState<ScreenViewMode>('display');
  const [subState, setSubState] = useState<DisplaySubState>('normal');
  const [prayerData, setPrayerData] = useState<KacstPrayerResponse>(() => 
    getFallbackPrayerTimes(undefined, undefined, undefined, settings.lat, settings.lon)
  );
  const [loadingPrayers, setLoadingPrayers] = useState<boolean>(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState<boolean>(false);

  // Save changes to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_ANNOUNCEMENTS_KEY, JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_ADHKAR_KEY, JSON.stringify(adhkar));
  }, [adhkar]);

  // Fetch Prayer Times from server API (Proxying KACST / Aladhan API)
  const fetchPrayers = useCallback(async () => {
    setLoadingPrayers(true);
    const today = new Date();
    const yg = today.getFullYear();
    const mg = today.getMonth() + 1;
    const dg = today.getDate();

    const query = new URLSearchParams({
      lang: 'ar',
      format: '12',
      yg: yg.toString(),
      mg: mg.toString(),
      dg: dg.toString(),
      lat: settings.lat.toString(),
      lon: settings.lon.toString(),
      zone: settings.zone.toString()
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    try {
      const res = await fetch(`/api/prayers?${query.toString()}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data: KacstPrayerResponse = await res.json();
      if (data && data.prayerTimes) {
        setPrayerData(data);
      }
    } catch (err) {
      console.warn('Failed to fetch from /api/prayers, using calculated fallback state:', err);
      setPrayerData(getFallbackPrayerTimes(yg, mg, dg, settings.lat, settings.lon));
    } finally {
      clearTimeout(timeoutId);
      setLoadingPrayers(false);
    }
  }, [settings.lat, settings.lon, settings.zone]);

  useEffect(() => {
    fetchPrayers();
  }, [fetchPrayers]);

  // Settings Handlers
  const handleUpdateSettings = (newPartial: Partial<MosqueSettings>) => {
    setSettings((prev) => ({ ...prev, ...newPartial }));
  };

  // Announcement Handlers
  const handleAddAnnouncement = (ann: Omit<Announcement, 'id'>) => {
    const newAnn: Announcement = { ...ann, id: Date.now().toString() };
    setAnnouncements((prev) => [newAnn, ...prev]);
  };

  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  const handleToggleAnnouncement = (id: string) => {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
    );
  };

  // Adhkar Handlers
  const handleAddAdhkar = (item: Omit<AdhkarItem, 'id'>) => {
    const newItem: AdhkarItem = { ...item, id: Date.now().toString() };
    setAdhkar((prev) => [...prev, newItem]);
  };

  const handleDeleteAdhkar = (id: string) => {
    setAdhkar((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="h-screen max-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col overflow-hidden selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header Controls Bar */}
      <HeaderBar
        viewMode={viewMode}
        setViewMode={setViewMode}
        settings={settings}
        isApiFallback={prayerData?.isFallback}
        onOpenCatalog={() => setIsCatalogOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {viewMode === 'display' ? (
          <DisplayView
            settings={settings}
            prayerData={prayerData}
            announcements={announcements}
            adhkar={adhkar}
            subState={subState}
            onSetSubState={setSubState}
          />
        ) : (
          <ControlPanel
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            announcements={announcements}
            onAddAnnouncement={handleAddAnnouncement}
            onDeleteAnnouncement={handleDeleteAnnouncement}
            onToggleAnnouncement={handleToggleAnnouncement}
            adhkar={adhkar}
            onAddAdhkar={handleAddAdhkar}
            onDeleteAdhkar={handleDeleteAdhkar}
            prayerData={prayerData}
            onRefreshPrayers={fetchPrayers}
            activeTestState={subState}
            onSetTestState={setSubState}
            onSwitchToDisplay={() => setViewMode('display')}
            onOpenCatalog={() => setIsCatalogOpen(true)}
          />
        )}
      </main>

      {/* Professional Theme Catalog Modal */}
      <ThemeCatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />
    </div>
  );
}
