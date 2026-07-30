import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper for fallback Umm Al-Qura calculation if upstream API is unreachable
function calculateFallbackPrayerTimes(yg: number, mg: number, dg: number, lat: number, lon: number) {
  // Approximate standard Saudi Arabia prayer times offset by location
  // Base times in Riyadh ~ (Fajr: 04:15, Sunrise: 05:35, Dhuhr: 12:05, Asr: 15:25, Maghrib: 18:35, Isha: 20:05)
  // Shift by longitude offset (46.67 is Riyadh lon; 4 min per degree)
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

  // Rough estimation for 2026 Hijri year (1448 AH)
  const dateObj = new Date(yg, mg - 1, dg);
  const startHijri = new Date(2026, 5, 16); // ~ 1 Muharram 1448
  const diffDays = Math.floor((dateObj.getTime() - startHijri.getTime()) / (1000 * 3600 * 24));
  let hijriMonthIdx = Math.floor(diffDays / 29.5) % 12;
  if (hijriMonthIdx < 0) hijriMonthIdx += 12;
  let hijriDay = (diffDays % 30) + 1;
  if (hijriDay <= 0) hijriDay += 30;

  return {
    date: `${yg}-${String(mg).padStart(2, '0')}-${String(dg).padStart(2, '0')}T00:00:00`,
    gregorianDate: {
      year: yg,
      month: mg,
      day: dg,
      nameAr: arabicMonthsGregorian[mg - 1] || 'يوليو'
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

// Proxy endpoint for KACST GetPrayers
app.get('/api/prayers', async (req, res) => {
  const {
    lang = 'ar',
    format = '12',
    yg = '2026',
    mg = '7',
    dg = '30',
    lon = '39.831666',
    lat = '21.426666',
    zone = '3'
  } = req.query;

  const url = `https://umqserv.kacst.gov.sa/api/v1/Prayer/GetPrayers?lang=${lang}&format=${format}&yg=${yg}&mg=${mg}&dg=${dg}&lon=${lon}&lat=${lat}&zone=${zone}`;

  const formattedDg = String(dg).padStart(2, '0');
  const formattedMg = String(mg).padStart(2, '0');

  try {
    // 1. Try Aladhan API (Method 4 = Umm Al Qura University, Makkah) for accurate Saudi prayer times
    const aladhanUrl = `https://api.aladhan.com/v1/timings/${formattedDg}-${formattedMg}-${yg}?latitude=${lat}&longitude=${lon}&method=4`;
    const alRes = await fetch(aladhanUrl, { signal: AbortSignal.timeout(6000) });
    if (alRes.ok) {
      const alData = await alRes.json();
      const timings = alData.data.timings;
      const hijri = alData.data.date.hijri;
      const gregorian = alData.data.date.gregorian;

      const format12 = (time24: string) => {
        const clean = time24.split(' ')[0]; // remove any (AST) suffix if present
        const [hStr, mStr] = clean.split(':');
        let h = parseInt(hStr, 10);
        const period = h >= 12 ? 'PM' : 'AM';
        h = h % 12 === 0 ? 12 : h % 12;
        return `${String(h).padStart(2, '0')}:${mStr} ${period}`;
      };

      return res.json({
        date: `${yg}-${String(mg).padStart(2, '0')}-${String(dg).padStart(2, '0')}T00:00:00`,
        gregorianDate: {
          year: parseInt(yg as string, 10),
          month: parseInt(mg as string, 10),
          day: parseInt(dg as string, 10),
          nameAr: gregorian.month.ar || 'يوليو'
        },
        hijriDate: {
          year: parseInt(hijri.year, 10),
          month: hijri.month.number,
          day: parseInt(hijri.day, 10),
          nameAr: hijri.month.ar || 'صفر'
        },
        solarHijriDate: {
          year: 1404,
          month: 11,
          day: 8,
          nameAr: 'الأسد'
        },
        prayerTimes: {
          fajr: format12(timings.Fajr),
          sunrise: format12(timings.Sunrise),
          dhuhr: format12(timings.Dhuhr),
          asr: format12(timings.Asr),
          maghrib: format12(timings.Maghrib),
          isha: format12(timings.Isha)
        },
        isFallback: false
      });
    }
  } catch (_e) {
    // Ignore external fetch error, fall back to KACST or calculation silently
  }

  // 2. Secondary attempt: KACST API
  const kacstUrl = `https://umqserv.kacst.gov.sa/api/v1/Prayer/GetPrayers?lang=${lang}&format=${format}&yg=${yg}&mg=${mg}&dg=${dg}&lon=${lon}&lat=${lat}&zone=${zone}`;
  try {
    const response = await fetch(kacstUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MosqueDisplayApp/1.0'
      },
      signal: AbortSignal.timeout(3000)
    });

    if (response.ok) {
      const data = await response.json();
      return res.json(data);
    }
  } catch (_e) {
    // Ignore
  }

  // 3. Offline mathematical calculation (Umm Al-Qura approximation)
  const fallback = calculateFallbackPrayerTimes(
    parseInt(yg as string, 10),
    parseInt(mg as string, 10),
    parseInt(dg as string, 10),
    parseFloat(lat as string),
    parseFloat(lon as string)
  );
  return res.json(fallback);
});

// Proxy endpoint for KACST GetTodayPrayersForCities
app.get('/api/today-cities', async (req, res) => {
  const { lang = 'ar', format = '12' } = req.query;
  const url = `https://umqserv.kacst.gov.sa/api/v1/Prayer/GetTodayPrayersForCities?lang=${lang}&format=${format}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 MosqueDisplayApp/1.0'
      },
      signal: AbortSignal.timeout(4000)
    });
    if (response.ok) {
      const data = await response.json();
      return res.json(data);
    }
    return res.status(500).json({ error: 'Upstream returned non-200' });
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
});

// Server-side Gemini route for AI Hadith & Sermon Generators
app.post('/api/gemini/hadith-reflection', async (req, res) => {
  const { topic = 'بر الوالدين وأهمية الصلاة' } = req.body;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        error: 'مفتاح GEMINI_API_KEY غير متوفر في الإعدادات.'
      });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const prompt = `أنت مساعد علمي ودعوي لمسجد وجامع. صغ حديثاً شريفاً صحيحاً أو نصيحة إيمانية قصيرة وموجزة جداً تناسب العرض على شاشة المسجد 90 بوصة.
الموضوع المطلوبة صياغته: "${topic}".
الشروط:
1. نص عربي فصيح موثق مشكول أو واضح القرائية.
2. لا يتجاوز 30 كلمة ليكون واضحاً وقابلاً للقراءة من مسافة بعيدة.
3. مع ذكر المصدر (مثل: رواه البخاري / مسلم / آية قرانية).
4. الإجابة بتنسيق JSON يحتوي على:
{
  "text": "النص العربي للحديث أو الموعظة",
  "source": "المصدر أو الراوي",
  "category": "موعظة / حديث / آية"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const jsonText = response.text || '{}';
    const parsed = JSON.parse(jsonText);
    return res.json(parsed);
  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({
      error: 'تعذر توليد النص عبر الذكاء الاصطناعي حالياً.',
      details: (error as Error).message
    });
  }
});

async function startServer() {
  // Vite dev server middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mosque 90" Display Server running on http://localhost:${PORT}`);
  });
}

startServer();
