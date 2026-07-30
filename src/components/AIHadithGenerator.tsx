import React, { useState } from 'react';
import { Sparkles, Loader2, PlusCircle, Check, BookOpen } from 'lucide-react';
import { Announcement } from '../types';

interface AIHadithGeneratorProps {
  onAddAnnouncement: (ann: Omit<Announcement, 'id'>) => void;
}

export const AIHadithGenerator: React.FC<AIHadithGeneratorProps> = ({ onAddAnnouncement }) => {
  const [topic, setTopic] = useState<string>('بر الوالدين وأهمية الصلاة في وقتها');
  const [loading, setLoading] = useState<boolean>(false);
  const [generatedResult, setGeneratedResult] = useState<{ text: string; source: string; category: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [added, setAdded] = useState<boolean>(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    setAdded(false);

    try {
      const response = await fetch('/api/gemini/hadith-reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim() })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'فشل التوليد عبر الذكاء الاصطناعي');
      }

      const data = await response.json();
      setGeneratedResult(data);
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToAnnouncements = () => {
    if (!generatedResult) return;
    onAddAnnouncement({
      title: `موعظة اليوم: ${topic.substring(0, 30)}...`,
      content: `${generatedResult.text} (${generatedResult.source || 'حديث شريف'})`,
      date: 'اليوم',
      category: 'general',
      active: true,
      author: 'الذكاء الاصطناعي للمسجد'
    });
    setAdded(true);
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-amber-500/30 p-5 text-slate-100 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-amber-300">مساعد الذكاء الاصطناعي لإعلانات المسجد والخطب</h3>
          <p className="text-xs text-slate-400">توليد حديث أو آية أو موعظة موجزة تناسب شاشة الجامع 90 بوصة</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="مثال: فضل صلاة الجماعة، عمارة المساجد، بر الوالدين..."
          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !topic.trim()}
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-md shadow-amber-500/20"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>جاري الصياغة...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>صياغة موعظة جديدة</span>
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded-xl">
          {errorMsg}
        </div>
      )}

      {generatedResult && (
        <div className="bg-slate-950/80 rounded-xl p-4 border border-amber-500/20 space-y-3">
          <div className="flex items-center justify-between text-xs text-amber-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>النص المقترح للعرض:</span>
            </span>
            <span className="bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {generatedResult.category || 'موعظة'}
            </span>
          </div>

          <p className="text-base font-bold text-amber-100 leading-relaxed font-serif">
            « {generatedResult.text} »
          </p>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span>المصدر: {generatedResult.source}</span>
            <button
              onClick={handleAddToAnnouncements}
              disabled={added}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                added
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>تمت الإضافة للإعلانات</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>إضافة لإعلانات المسجد</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
