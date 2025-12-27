
import React, { useState, useRef, useEffect } from 'react';
import { SUBJECTS, LEVELS, GRADES_BY_LEVEL, LessonPlan, MonthlyPlan, AnnualPlan, EducatorProfile, EDUCATOR_PROFILES, UserTier, SavedPlan } from './types.ts';
import { 
  generateBNCCPlan, 
  askPedagogicalAssistant, 
  generateMonthlyPlan,
  generateAnnualPlan,
  suggestThemes
} from './services/geminiService.ts';
import PlanPreview from './components/PlanPreview.tsx';
import MonthlyPlanPreview from './components/MonthlyPlanPreview.tsx';
import AnnualPlanPreview from './components/AnnualPlanPreview.tsx';
import SavedLibrary from './components/SavedLibrary.tsx';
import Logo from './components/Logo.tsx';
import PricingModal from './components/PricingModal.tsx';
import AdminPanel from './components/AdminPanel.tsx';

const App: React.FC = () => {
  const [tier, setTier] = useState<UserTier>('free');
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [showPricing, setShowPricing] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [mode, setMode] = useState<'lesson' | 'monthly' | 'annual'>('lesson');
  const [profile, setProfile] = useState<EducatorProfile>('inovador');
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [level, setLevel] = useState(LEVELS[0]);
  const [grade, setGrade] = useState(GRADES_BY_LEVEL[level as keyof typeof GRADES_BY_LEVEL][0]);
  const [reality, setReality] = useState('');
  const [numWeeks, setNumWeeks] = useState(4); 
  const [theme, setTheme] = useState('');
  const [suggestedThemesList, setSuggestedThemesList] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [duration, setDuration] = useState('50 minutos');
  const [loading, setLoading] = useState(false);
  
  const [plan, setPlan] = useState<LessonPlan | null>(null);
  const [monthlyPlan, setMonthlyPlan] = useState<MonthlyPlan | null>(null);
  const [annualPlan, setAnnualPlan] = useState<AnnualPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', text: string, image?: string}[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const savedTier = localStorage.getItem('eduplan_tier');
    const expiryDate = localStorage.getItem('eduplan_expiry');

    if (savedTier === 'premium' && expiryDate) {
      const remaining = parseInt(expiryDate) - Date.now();
      if (remaining <= 0) {
        setTier('free');
        setDaysLeft(null);
        localStorage.setItem('eduplan_tier', 'free');
      } else {
        setTier('premium');
        setDaysLeft(Math.ceil(remaining / (1000 * 60 * 60 * 24)));
      }
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiTyping]);

  useEffect(() => {
    setGrade(GRADES_BY_LEVEL[level as keyof typeof GRADES_BY_LEVEL][0]);
    setSuggestedThemesList([]);
  }, [level]);

  const handleUpgrade = (days: number) => {
    const expiry = Date.now() + (days * 24 * 60 * 60 * 1000);
    setTier('premium');
    setDaysLeft(days);
    localStorage.setItem('eduplan_tier', 'premium');
    localStorage.setItem('eduplan_expiry', expiry.toString());
    setShowPricing(false);
  };

  const handleAiCall = async (fn: () => Promise<any>) => {
    setError(null);
    try {
      return await fn();
    } catch (err: any) {
      console.error("AI Error:", err);
      if (err.message === "API_KEY_MISSING") {
        setError("CHAVE DE API NÃO ENCONTRADA. Configure a variável de ambiente API_KEY.");
      } else {
        setError("FALHA NA CONEXÃO COM A IA. Verifique sua chave ou cota de uso.");
      }
      throw err;
    }
  };

  const handleGetSuggestions = async () => {
    if (isSuggesting) return;
    setIsSuggesting(true);
    try {
      const suggestions = await handleAiCall(() => suggestThemes(subject, grade, profile));
      setSuggestedThemesList(suggestions);
    } catch (err) {} finally {
      setIsSuggesting(false);
    }
  };

  const handleGenerateLesson = async () => {
    if (!theme.trim()) { alert("Insira um tema!"); return; }
    setLoading(true);
    setPlan(null);
    try {
      const result = await handleAiCall(() => generateBNCCPlan(subject, grade, theme, duration, profile));
      setPlan(result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {} finally {
      setLoading(false);
    }
  };

  const handleGenerateMonthly = async () => {
    if (tier === 'free') { setShowPricing(true); return; }
    setLoading(true);
    setMonthlyPlan(null);
    try {
      const result = await handleAiCall(() => generateMonthlyPlan(subject, grade, reality, profile, numWeeks));
      setMonthlyPlan(result);
    } catch (err) {} finally {
      setLoading(false);
    }
  };

  const handleGenerateAnnual = async () => {
    if (tier === 'free') { setShowPricing(true); return; }
    setLoading(true);
    setAnnualPlan(null);
    try {
      const result = await handleAiCall(() => generateAnnualPlan(subject, grade, reality, profile));
      setAnnualPlan(result);
    } catch (err) {} finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() && !capturedImage) return;
    const msg = chatInput || "Analisar imagem pedagógica.";
    const img = capturedImage;
    setChatMessages(prev => [...prev, { role: 'user', text: msg, image: img || undefined }]);
    setChatInput('');
    setCapturedImage(null);
    setIsAiTyping(true);
    try {
      const response = await handleAiCall(() => askPedagogicalAssistant(msg, JSON.stringify({ plan, mode }), img || undefined));
      setChatMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch (err) {} finally {
      setIsAiTyping(false);
    }
  };

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Câmera indisponível.");
      setIsCameraActive(false);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      setCapturedImage(canvas.toDataURL('image/jpeg'));
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(t => t.stop());
      setIsCameraActive(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 relative bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900">
      <header className="sticky top-0 z-40 w-full glass border-b border-slate-200 h-20 flex items-center px-6">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            {tier === 'premium' && (
              <span className="hidden sm:block text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-100">PRO - {daysLeft} DIAS</span>
            )}
            <button onClick={() => setIsLibraryOpen(true)} className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:bg-slate-50 transition-all">
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {error && (
          <div className="mb-8 p-5 bg-rose-50 border border-rose-200 rounded-3xl flex items-center gap-4 animate-in slide-in-from-top-4">
            <div className="w-10 h-10 bg-rose-600 text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-rose-200">!</div>
            <div>
              <p className="text-rose-950 font-black text-xs uppercase tracking-widest">Erro de Configuração</p>
              <p className="text-rose-700 font-bold text-[10px] mt-0.5">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="ml-auto text-rose-300 hover:text-rose-600 p-2">✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Configuração Pedagógica</h3>
               <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 mb-6">
                  {(['lesson', 'monthly', 'annual'] as const).map(m => (
                    <button key={m} onClick={() => setMode(m)} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${mode === m ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-400'}`}>
                      {m === 'lesson' ? 'Aula' : m === 'monthly' ? 'Mensal' : 'Anual'}
                    </button>
                  ))}
               </div>

               <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <select value={level} onChange={e => setLevel(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold outline-none">
                      {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <select value={grade} onChange={e => setGrade(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold outline-none">
                      {GRADES_BY_LEVEL[level as keyof typeof GRADES_BY_LEVEL].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold outline-none">
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
               </div>
            </div>

            <div className="bg-slate-950 rounded-[2.5rem] p-8 text-white shadow-xl">
               <h3 className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-6">Tema do Material</h3>
               {mode === 'lesson' ? (
                 <div className="space-y-4">
                   <input type="text" value={theme} onChange={e => setTheme(e.target.value)} placeholder="Ex: Fotossíntese" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold outline-none" />
                   <button onClick={handleGetSuggestions} className="text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300">Sugerir temas com IA</button>
                   {suggestedThemesList.length > 0 && (
                     <div className="flex flex-wrap gap-2 pt-2">
                       {suggestedThemesList.map(t => <button key={t} onClick={() => setTheme(t)} className="text-[8px] font-black px-2 py-1 bg-white/10 rounded-lg">{t}</button>)}
                     </div>
                   )}
                   <button onClick={handleGenerateLesson} disabled={loading} className="w-full bg-white text-slate-950 py-5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest shadow-2xl hover:scale-[1.02] transition-all">
                     {loading ? 'ANALISANDO BNCC...' : 'GERAR PLANO BNCC'}
                   </button>
                 </div>
               ) : (
                 <div className="space-y-4">
                   <textarea value={reality} onChange={e => setReality(e.target.value)} placeholder="Descreva a realidade da turma..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold outline-none resize-none h-32" />
                   <button onClick={mode === 'monthly' ? handleGenerateMonthly : handleGenerateAnnual} disabled={loading} className="w-full bg-amber-500 text-slate-950 py-5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest shadow-2xl">
                     {loading ? 'CONSTRUINDO...' : `CRIAR PLANO ${mode.toUpperCase()}`}
                   </button>
                 </div>
               )}
            </div>
          </aside>

          <section className="lg:col-span-8">
            {loading ? (
              <div className="bg-white rounded-[3rem] h-[600px] flex flex-col items-center justify-center p-10 border border-slate-100 shadow-sm">
                <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                <h4 className="text-slate-900 font-black text-sm uppercase tracking-widest">A IA está pensando...</h4>
                <p className="text-slate-400 text-xs mt-2 text-center max-w-xs">Aguarde enquanto o Gemini 3 Pro analisa profundamente as competências e metodologias da BNCC 2025.</p>
              </div>
            ) : plan && mode === 'lesson' ? (
              <PlanPreview plan={plan} tier={tier} onOpenPricing={() => setShowPricing(true)} />
            ) : monthlyPlan && mode === 'monthly' ? (
              <MonthlyPlanPreview plan={monthlyPlan} onSelectTopic={t => { setTheme(t); setMode('lesson'); }} />
            ) : annualPlan && mode === 'annual' ? (
              <AnnualPlanPreview plan={annualPlan} onSelectTopic={t => { setTheme(t); setMode('lesson'); }} />
            ) : (
              <div className="bg-white/40 border-2 border-dashed border-slate-200 rounded-[3rem] h-[600px] flex flex-col items-center justify-center p-10 text-center">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-200 shadow-xl mb-6">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" /></svg>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Pronto para começar?</h3>
                <p className="text-slate-400 font-medium max-w-sm">Selecione o modo e preencha os dados ao lado para gerar seu material pedagógico de elite.</p>
              </div>
            )}
          </section>
        </div>
      </main>

      <button onClick={() => setIsAssistantOpen(true)} className="fixed bottom-8 right-8 w-16 h-16 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-50 group">
         <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
      </button>

      {isAssistantOpen && (
        <div className="fixed inset-0 lg:inset-auto lg:bottom-10 lg:right-10 lg:w-[450px] z-[60] p-4 lg:p-0">
          <div className="bg-white w-full h-full lg:h-[700px] rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.2)] border border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10">
            <header className="bg-slate-950 p-8 flex items-center justify-between text-white shrink-0">
              <span className="font-black text-[10px] uppercase tracking-widest">EduPlan Assistente</span>
              <button onClick={() => setIsAssistantOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </header>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50 custom-scrollbar">
              {isCameraActive && (
                <div className="relative rounded-3xl overflow-hidden bg-black aspect-video mb-4 border-2 border-slate-900">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="absolute bottom-4 left-0 w-full flex justify-center gap-4">
                    <button onClick={takePhoto} className="w-12 h-12 bg-white rounded-full border-4 border-slate-200 active:scale-90 transition-all"></button>
                    <button onClick={() => setIsCameraActive(false)} className="w-12 h-12 bg-rose-500 text-white rounded-full flex items-center justify-center">✕</button>
                  </div>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />

              {chatMessages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {m.image && <img src={m.image} className="max-w-[80%] rounded-2xl mb-2 border border-slate-200 shadow-sm" alt="Análise" />}
                  <div className={`max-w-[90%] p-5 rounded-[2rem] text-sm leading-relaxed ${m.role === 'user' ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isAiTyping && <div className="text-[10px] font-black text-indigo-500 animate-pulse uppercase tracking-widest">IA digitando...</div>}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-slate-100 flex gap-3">
              <button type="button" onClick={startCamera} className="p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>
              <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Pergunte sobre a BNCC..." className="flex-1 bg-slate-100 rounded-2xl px-5 text-sm font-bold outline-none border border-transparent focus:border-indigo-100 transition-all" />
              <button type="submit" className="p-4 bg-slate-950 text-white rounded-2xl shadow-xl active:scale-95 transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg></button>
            </form>
          </div>
        </div>
      )}

      {showPricing && <PricingModal onClose={() => setShowPricing(false)} onUpgrade={handleUpgrade} />}
      {isLibraryOpen && <SavedLibrary onView={p => { if(p.type === 'lesson') setPlan(p.data as LessonPlan); if(p.type === 'monthly') setMonthlyPlan(p.data as MonthlyPlan); if(p.type === 'annual') setAnnualPlan(p.data as AnnualPlan); setMode(p.type); setIsLibraryOpen(false); }} onClose={() => setIsLibraryOpen(false)} />}
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
      
      <footer className="fixed bottom-4 left-4 z-40">
        <button onClick={() => setShowAdmin(true)} className="w-10 h-10 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        </button>
      </footer>
    </div>
  );
};

export default App;
