import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Send, ShieldCheck, User, BrainCircuit, 
  Home, Compass, UserCircle, Settings, Menu, X, ArrowLeft,
  MessageSquare, TrendingUp
} from 'lucide-react';

// --- THEME & DATA ---
const COLORS = {
  primary: '#0F172A', // Slate 900
  accent: '#38BDF8',  // Light Blue
  ai: '#10B981',      // Emerald Green
  bg: '#F8FAFC',      // Slate 50
  panel: '#FFFFFF'
};

const HISTORICAL_AVATARS = [
  { id: 'socrates', name: 'Socrates', title: 'The Questioner', color: 'bg-amber-600', initials: 'SO' },
  { id: 'lovelace', name: 'Ada Lovelace', title: 'The Analyst', color: 'bg-indigo-600', initials: 'AL' },
  { id: 'lincoln', name: 'Abraham Lincoln', title: 'The Orator', color: 'bg-slate-800', initials: 'AL' },
  { id: 'curie', name: 'Marie Curie', title: 'The Empiricist', color: 'bg-emerald-600', initials: 'MC' },
  { id: 'aurelius', name: 'Marcus Aurelius', title: 'The Stoic', color: 'bg-rose-700', initials: 'MA' },
  { id: 'sun_tzu', name: 'Sun Tzu', title: 'The Strategist', color: 'bg-red-600', initials: 'ST' },
];

const TOPICS = [
  { id: 1, title: 'Is Universal Basic Income economically sustainable?', category: 'Economics', heat: 'High' },
  { id: 2, title: 'Should Artificial Intelligence be granted legal personhood?', category: 'Technology', heat: 'Very High' },
  { id: 3, title: 'Does social media do more harm than good for democracy?', category: 'Society', heat: 'Medium' },
];

// --- MAIN APP COMPONENT ---
export default function DissCourseApp() {
  const [view, setView] = useState('home'); // 'home', 'avatar', 'arena'
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userAvatar, setUserAvatar] = useState(HISTORICAL_AVATARS[0]);
  const [activeTopic, setActiveTopic] = useState(null);

  // Navigation Handlers
  const navigateTo = (newView, data = null) => {
    if (data && newView === 'arena') setActiveTopic(data);
    setView(newView);
    if (window.innerWidth < 768) setSidebarOpen(false); // Auto-close sidebar on mobile
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans text-slate-900" style={{ backgroundColor: COLORS.bg }}>
      
      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 0, opacity: sidebarOpen ? 1 : 0 }}
        className="h-full bg-white border-r border-slate-200 z-50 flex flex-col shrink-0 overflow-hidden absolute md:relative"
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
            <BrainCircuit className="text-white w-5 h-5" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900 whitespace-nowrap">DissCourse</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <SidebarItem icon={<Home size={20}/>} label="Home Dashboard" active={view === 'home'} onClick={() => navigateTo('home')} />
          <SidebarItem icon={<Compass size={20}/>} label="Explore Topics" active={false} onClick={() => {}} />
          <SidebarItem icon={<UserCircle size={20}/>} label="My Persona" active={view === 'avatar'} onClick={() => navigateTo('avatar')} />
        </nav>

        <div className="p-6 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md ${userAvatar.color}`}>
              {userAvatar.initials}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">{userAvatar.name}</p>
              <p className="text-xs text-slate-500">{userAvatar.title}</p>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center px-4 md:hidden sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg">
            <Menu size={24} />
          </button>
          <span className="font-extrabold text-lg ml-2">DissCourse</span>
        </header>

        {/* View Routing */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {view === 'home' && <HomeView key="home" navigateTo={navigateTo} userAvatar={userAvatar} />}
            {view === 'avatar' && <AvatarView key="avatar" setAvatar={setUserAvatar} navigateTo={navigateTo} currentAvatar={userAvatar} />}
            {view === 'arena' && <ArenaView key="arena" topic={activeTopic} userAvatar={userAvatar} navigateTo={navigateTo} />}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
        active ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {icon}
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}

function HomeView({ navigateTo, userAvatar }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="p-8 max-w-5xl mx-auto">
      <header className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Welcome back, {userAvatar.name.split(' ')[0]}.</h1>
        <p className="text-slate-500 mt-2 text-lg">Ready to sharpen your rhetoric today?</p>
      </header>

      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2"><TrendingUp className="text-emerald-500"/> Trending Discourses</h2>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TOPICS.map(topic => (
          <div key={topic.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">{topic.category}</span>
              <h3 className="mt-4 text-lg font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                {topic.title}
              </h3>
            </div>
            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500 flex items-center gap-1">
                <MessageSquare size={16}/> 12 Active
              </span>
              <button 
                onClick={() => navigateTo('arena', topic)}
                className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 hover:-translate-y-0.5 transition-all"
              >
                Join Debate
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function AvatarView({ setAvatar, navigateTo, currentAvatar }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="p-8 max-w-4xl mx-auto">
      <button onClick={() => navigateTo('home')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 font-bold transition-colors">
        <ArrowLeft size={20} /> Back to Dashboard
      </button>

      <h1 className="text-3xl font-black mb-2">Choose Your Persona</h1>
      <p className="text-slate-500 mb-10">Select a historical figure to represent your debate style.</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {HISTORICAL_AVATARS.map(avatar => (
          <button 
            key={avatar.id}
            onClick={() => { setAvatar(avatar); navigateTo('home'); }}
            className={`flex flex-col items-center p-6 rounded-3xl border-2 transition-all hover:scale-105 ${
              currentAvatar.id === avatar.id ? 'border-slate-900 bg-slate-50 shadow-lg' : 'border-slate-100 bg-white hover:border-slate-300'
            }`}
          >
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl text-white font-bold shadow-md mb-4 ${avatar.color}`}>
              {avatar.initials}
            </div>
            <h3 className="font-bold text-lg text-slate-900">{avatar.name}</h3>
            <p className="text-sm text-slate-500 font-medium">{avatar.title}</p>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function ArenaView({ topic, userAvatar, navigateTo }) {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'opponent', text: "I believe this concept is fundamentally flawed. We don't have the economic infrastructure to support it without causing massive inflation.", stance: 'con' },
  ]);
  const [draft, setDraft] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null);

  const analyzeLogic = () => {
    setIsAnalyzing(true); setAiFeedback(null);
    setTimeout(() => {
      setAiFeedback({ score: 88, suggestion: "Strong point. To make it airtight, try specifying *which* economic metric you are referencing to avoid generalizations." });
      setIsAnalyzing(false);
    }, 1500);
  };

  const sendMessage = () => {
    if (!draft) return;
    setMessages([...messages, { id: Date.now(), sender: 'user', text: draft, stance: 'pro' }]);
    setDraft(''); setAiFeedback(null);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full">
      {/* Arena Nav */}
      <nav className="p-4 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 flex items-center justify-between">
        <button onClick={() => navigateTo('home')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors">
          <ArrowLeft size={20} /> Exit
        </button>
        <div className="text-xs font-bold px-4 py-1.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-widest shadow-inner">
          Round 2 / 5
        </div>
      </nav>

      {/* Arena Content */}
      <main className="flex-1 overflow-y-auto p-6 pb-48">
        <div className="max-w-2xl mx-auto text-center mt-2 mb-12">
          <h1 className="text-2xl font-black leading-tight tracking-tight text-slate-900">
            {topic?.title || "Debate Room"}
          </h1>
        </div>

        {/* Avatars VS Display */}
        <div className="flex justify-between items-center max-w-xl mx-auto mb-16 relative px-8">
          <div className="flex flex-col items-center gap-3 z-10">
            <div className={`w-20 h-20 rounded-full border-4 border-sky-400 p-1 bg-white shadow-xl`}>
               <div className={`w-full h-full rounded-full flex items-center justify-center text-xl text-white font-bold ${userAvatar.color}`}>
                 {userAvatar.initials}
               </div>
            </div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-sky-500">Pro (You)</span>
          </div>
          
          <div className="absolute left-1/2 -translate-x-1/2 font-black text-slate-200 text-4xl italic">VS</div>

          <div className="flex flex-col items-center gap-3 z-10">
            <div className="w-20 h-20 rounded-full border-4 border-slate-800 p-1 bg-white shadow-xl">
                <div className="w-full h-full rounded-full flex items-center justify-center text-xl text-white font-bold bg-slate-400">
                  OP
                </div>
            </div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-800">Con (Opponent)</span>
          </div>
        </div>

        {/* Chat Stream */}
        <div className="max-w-2xl mx-auto space-y-6">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-6 py-4 shadow-sm text-[15px] font-medium leading-relaxed ${
                  msg.sender === 'user' 
                  ? 'bg-slate-900 text-white rounded-3xl rounded-tr-sm' 
                  : 'bg-white border border-slate-200 text-slate-800 rounded-3xl rounded-tl-sm'
                }`}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pt-0 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC] to-transparent pb-8">
        <div className="max-w-3xl mx-auto relative">
          <AnimatePresence>
            {aiFeedback && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute bottom-full mb-4 w-full p-5 rounded-3xl bg-white border border-emerald-100 shadow-2xl flex gap-4 items-start z-20">
                <div className="p-2.5 rounded-xl text-white bg-emerald-500"><ShieldCheck size={24}/></div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-1">Logic Score: {aiFeedback.score}/100</p>
                  <p className="text-sm text-slate-600 font-medium">{aiFeedback.suggestion}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative bg-white rounded-[2rem] border-2 border-slate-200 shadow-xl p-2 flex items-end gap-2 focus-within:border-slate-400 transition-colors z-10">
            <textarea
              value={draft} onChange={(e) => setDraft(e.target.value)}
              placeholder="Construct your argument... (Type and hit the Sparkle icon)"
              className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] px-5 py-4 resize-none h-16 max-h-32 font-medium outline-none"
            />
            <div className="flex gap-2 pr-2 pb-1">
              <button onClick={analyzeLogic} disabled={!draft || isAnalyzing} className="p-3.5 rounded-2xl transition-all text-emerald-600 hover:bg-emerald-50 disabled:opacity-40">
                {isAnalyzing ? <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent animate-spin rounded-full"/> : <Sparkles size={24} />}
              </button>
              <button onClick={sendMessage} disabled={!draft} className="p-3.5 rounded-2xl transition-all text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 shadow-md">
                <Send size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}