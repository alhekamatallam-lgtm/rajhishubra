import { PrayerName, PrayerTimes } from '../types';

export const PRAYER_NAMES_AR: Record<PrayerName, string> = {
  fajr: 'الفَجْر',
  sunrise: 'الشُّرُوق',
  dhuhr: 'الظُّهْر',
  asr: 'العَصْر',
  maghrib: 'المَغْرِب',
  isha: 'العِشَاء'
};

export function parsePrayerTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  // Format examples: "04:31 AM", "07:01 PM", "14:30"
  const cleanStr = timeStr.trim().toUpperCase();
  const isPM = cleanStr.includes('PM');
  const isAM = cleanStr.includes('AM');
  
  const rawParts = cleanStr.replace('AM', '').replace('PM', '').trim().split(':');
  let hours = parseInt(rawParts[0], 10) || 0;
  const minutes = parseInt(rawParts[1], 10) || 0;

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

export function getCurrentTimeInMinutes(date: Date = new Date()): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function getNextPrayerInfo(prayerTimes: PrayerTimes, now: Date = new Date()): {
  nextPrayer: PrayerName;
  nextPrayerTimeStr: string;
  diffMinutes: number;
  diffSeconds: number;
  isAfterIsha: boolean;
} {
  const currentMinutes = getCurrentTimeInMinutes(now);
  const currentSeconds = now.getSeconds();
  const nowTotalSeconds = currentMinutes * 60 + currentSeconds;

  const sequence: PrayerName[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
  
  for (const name of sequence) {
    const pTimeMin = parsePrayerTimeToMinutes(prayerTimes[name]);
    const pTimeSec = pTimeMin * 60;
    if (pTimeSec > nowTotalSeconds) {
      const diffSec = pTimeSec - nowTotalSeconds;
      return {
        nextPrayer: name,
        nextPrayerTimeStr: prayerTimes[name],
        diffMinutes: Math.floor(diffSec / 60),
        diffSeconds: diffSec,
        isAfterIsha: false
      };
    }
  }

  // After Isha -> next is tomorrow's Fajr
  const fajrMin = parsePrayerTimeToMinutes(prayerTimes.fajr);
  const secondsInDay = 24 * 3600;
  const fajrSecTomorrow = secondsInDay + (fajrMin * 60);
  const diffSec = fajrSecTomorrow - nowTotalSeconds;

  return {
    nextPrayer: 'fajr',
    nextPrayerTimeStr: prayerTimes.fajr,
    diffMinutes: Math.floor(diffSec / 60),
    diffSeconds: diffSec,
    isAfterIsha: true
  };
}

export function getCurrentPrayer(prayerTimes: PrayerTimes, now: Date = new Date()): PrayerName {
  const currentMinutes = getCurrentTimeInMinutes(now);
  const sequence: PrayerName[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
  
  let current: PrayerName = 'isha';
  for (const name of sequence) {
    const pTimeMin = parsePrayerTimeToMinutes(prayerTimes[name]);
    if (currentMinutes >= pTimeMin) {
      current = name;
    } else {
      break;
    }
  }
  return current;
}

export function formatSecondsToHHMMSS(seconds: number): string {
  if (seconds < 0) return '00:00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  if (h > 0) {
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }
  return `${pad(m)}:${pad(s)}`;
}

// Web Audio API chime / beep generator for Adhan or Iqamah alerts
export function getFallbackPrayerTimes(yg?: number, mg?: number, dg?: number, lat: number = 24.7136, lon: number = 46.6753) {
  const today = new Date();
  const year = yg || today.getFullYear();
  const month = mg || (today.getMonth() + 1);
  const day = dg || today.getDate();

  const lonDiffMin = (46.6753 - lon) * 4;
  
  const adjustTime = (baseHour: number, baseMin: number) => {
    let totalMinutes = baseHour * 60 + baseMin + Math.round(lonDiffMin);
    if (totalMinutes < 0) totalMinutes += 1440;
    totalMinutes = totalMinutes % 1440;
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(displayH)}:${pad(m)} ${period}`;
  };

  const arabicMonthsGregorian = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const arabicMonthsHijri = [
    'محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة',
    'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
  ];

  const dateObj = new Date(year, month - 1, day);
  const startHijri = new Date(2026, 5, 16);
  const diffDays = Math.floor((dateObj.getTime() - startHijri.getTime()) / (1000 * 3600 * 24));
  let hijriMonthIdx = Math.floor(diffDays / 29.5) % 12;
  if (hijriMonthIdx < 0) hijriMonthIdx += 12;
  let hijriDay = (diffDays % 30) + 1;
  if (hijriDay <= 0) hijriDay += 30;

  return {
    date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00`,
    gregorianDate: {
      year,
      month,
      day,
      nameAr: arabicMonthsGregorian[month - 1] || 'يوليو'
    },
    hijriDate: {
      year: 1448,
      month: hijriMonthIdx + 1,
      day: hijriDay,
      nameAr: arabicMonthsHijri[hijriMonthIdx] || 'صفر'
    },
    solarHijriDate: {
      year: 1404,
      month: 11,
      day: 8,
      nameAr: 'الأسد'
    },
    prayerTimes: {
      fajr: adjustTime(4, 20),
      sunrise: adjustTime(5, 42),
      dhuhr: adjustTime(12, 8),
      asr: adjustTime(15, 30),
      maghrib: adjustTime(18, 35),
      isha: adjustTime(20, 5)
    },
    isFallback: true
  };
}

export function playChimeSound(type: 'adhan' | 'iqamah' | 'beep' = 'adhan') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.2, ctx.currentTime);
    masterGain.connect(ctx.destination);

    if (type === 'adhan') {
      // Soft melodic double tone chime
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      
      osc1.type = 'sine';
      osc2.type = 'triangle';
      
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc1.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.6); // E5

      osc2.frequency.setValueAtTime(392.00, ctx.currentTime); // G4
      osc2.frequency.exponentialRampToValueAtTime(523.25, ctx.currentTime + 0.6); // C5

      osc1.connect(masterGain);
      osc2.connect(masterGain);

      masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);

      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 1.8);
      osc2.stop(ctx.currentTime + 1.8);

    } else if (type === 'iqamah') {
      // Urgent soft alert chime
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.2); // C6

      osc.connect(masterGain);
      masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.8);
    } else {
      // Standard gentle beep
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.connect(masterGain);
      masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch (e) {
    console.warn('Audio playback error:', e);
  }
}
