export type PrayerName = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export interface HijriDateInfo {
  year: number;
  month: number;
  day: number;
  nameAr: string;
}

export interface GregorianDateInfo {
  year: number;
  month: number;
  day: number;
  nameAr: string;
}

export interface SolarHijriDateInfo {
  year: number;
  month: number;
  day: number;
  nameAr: string;
}

export interface KacstPrayerResponse {
  date: string;
  gregorianDate: GregorianDateInfo;
  hijriDate: HijriDateInfo;
  solarHijriDate: SolarHijriDateInfo;
  prayerTimes: PrayerTimes;
  isFallback?: boolean;
}

export interface CityConfig {
  id: string;
  nameAr: string;
  nameEn: string;
  lat: number;
  lon: number;
  zone: number;
  region: string;
}

export interface IqamahMinutes {
  fajr: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
}

export type ThemePreset =
  | 'emerald-gold'
  | 'midnight-amber'
  | 'slate-golden'
  | 'burgundy-bronze'
  | 'light-pearl-gold'
  | 'sapphire-silver'
  | 'desert-sand-gold'
  | 'modern-obsidian';

export interface MosqueSettings {
  mosqueName: string;
  neighborhood: string;
  cityId: string;
  cityNameAr: string;
  lat: number;
  lon: number;
  zone: number;
  logoUrl?: string;
  logoTallUrl?: string;
  iqamahMinutes: IqamahMinutes;
  soundAlertsEnabled: boolean;
  adhanBeepEnabled: boolean;
  theme: ThemePreset;
  fontSizeScale: 'normal' | 'large' | 'xlarge_90inch';
  autoBlackoutDuringPrayer: boolean;
  blackoutDurationMinutes: number;
  adhkarSpeedSec: number;
  showWeather: boolean;
  tempCelsius: number;
  weatherCondition: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  category: 'khutbah' | 'lesson' | 'general' | 'donation';
  active: boolean;
  author?: string;
}

export interface AdhkarItem {
  id: string;
  text: string;
  source?: string;
  category: 'sabah' | 'masaa' | 'post_prayer' | 'quran' | 'hadith';
}

export type ScreenViewMode = 'display' | 'control';

export type DisplaySubState = 'normal' | 'adhan' | 'iqamah_countdown' | 'in_prayer' | 'post_prayer_adhkar';
