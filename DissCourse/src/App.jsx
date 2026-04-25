import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Send, ShieldCheck, BrainCircuit, 
  Home, Compass, UserCircle, Menu, ArrowLeft,
  MessageSquare, TrendingUp
} from 'lucide-react';

// --- THEME & DATA ---
const COLORS = {
  primary: '#3b82f6', // Blue
  accent: '#8b5cf6',  // Violet
  secondary: '#f59e0b', // Amber
  ai: '#10b981',      // Emerald
  bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)', // Modern gradient
  panel: 'rgba(255, 255, 255, 0.95)',
  text: '#1f2937',
  textLight: '#6b7280'
};

const HISTORICAL_AVATARS = [
  { id: 'douglass', name: 'Frederick Douglass', title: 'The Abolitionist', color: 'bg-purple-600', initials: 'FD' },
  { id: 'washington', name: 'George Washington', title: 'The Founding Father', color: 'bg-blue-600', initials: 'GW' },
  { id: 'lincoln', name: 'Abraham Lincoln', title: 'The Emancipator', color: 'bg-slate-800', initials: 'AL' },
  { id: 'speed', name: 'IShowSpeed', title: 'The Streamer', color: 'bg-red-600', initials: 'IS' },
  { id: 'james', name: 'LeBron James', title: 'The Athlete', color: 'bg-orange-600', initials: 'LJ' },
  { id: 'musk', name: 'Elon Musk', title: 'The Innovator', color: 'bg-gray-600', initials: 'EM' },
  { id: 'trump', name: 'Donald Trump', title: 'The Politician', color: 'bg-yellow-600', initials: 'DT' },
  { id: 'biden', name: 'Joe Biden', title: 'The President', color: 'bg-blue-500', initials: 'JB' },
  { id: 'socrates', name: 'Socrates', title: 'The Philosopher', color: 'bg-amber-600', initials: 'SO' }
];

const TOPICS = [
  { id: 1, title: 'Is Universal Basic Income economically sustainable?', category: 'Economics', heat: 'High', color: 'bg-blue-500' },
  { id: 2, title: 'Should Artificial Intelligence be granted legal personhood?', category: 'Technology', heat: 'Very High', color: 'bg-purple-500' },
  { id: 3, title: 'Does social media do more harm than good for democracy?', category: 'Society', heat: 'Medium', color: 'bg-green-500' },
  { id: 4, title: 'Should we prioritize space exploration over solving Earth\'s problems?', category: 'Science', heat: 'High', color: 'bg-indigo-500' },
  { id: 5, title: 'Is remote work the future of employment?', category: 'Business', heat: 'Medium', color: 'bg-cyan-500' },
  { id: 6, title: 'Should cryptocurrencies replace traditional banking?', category: 'Finance', heat: 'Very High', color: 'bg-orange-500' }
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
    <div className="flex h-screen overflow-hidden font-sans text-slate-900" style={{ background: COLORS.bg }}>
      
      {/* Glassmorphism Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 backdrop-blur-sm"></div>
      
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
        animate={{ width: sidebarOpen ? 280 : 0, opacity: sidebarOpen ? 1 : 0 }}
        className="h-full bg-white/20 backdrop-blur-xl border-r border-white/20 z-50 flex flex-col shrink-0 overflow-hidden absolute md:relative shadow-2xl"
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <BrainCircuit className="text-white w-6 h-6" />
          </div>
          <span className="font-black text-2xl tracking-tight text-white">DissCourse</span>
        </div>

        <nav className="flex-1 px-4 space-y-3 mt-6">
          <SidebarItem icon={<Home size={22}/>} label="Home Dashboard" active={view === 'home'} onClick={() => navigateTo('home')} />
          <SidebarItem icon={<Compass size={22}/>} label="Explore Topics" active={false} onClick={() => {}} />
          <SidebarItem icon={<UserCircle size={22}/>} label="My Persona" active={view === 'avatar'} onClick={() => navigateTo('avatar')} />
        </nav>

        <div className="p-6 border-t border-white/20">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${userAvatar.color}`}>
              {userAvatar.initials}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{userAvatar.name}</p>
              <p className="text-xs text-white/80">{userAvatar.title}</p>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        {/* Mobile Header */}
        <header className="h-16 bg-white/20 backdrop-blur-xl border-b border-white/20 flex items-center px-4 md:hidden sticky top-0 z-30 shadow-lg">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-white hover:bg-white/20 rounded-lg backdrop-blur-sm">
            <Menu size={24} />
          </button>
          <span className="font-black text-lg ml-2 text-white">DissCourse</span>
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
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
        active ? 'bg-white/30 text-white shadow-lg backdrop-blur-sm border border-white/20' : 'text-white/80 hover:bg-white/20 hover:text-white hover:backdrop-blur-sm'
      }`}
    >
      {icon}
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}

function HomeView({ navigateTo, userAvatar }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="p-8 max-w-6xl mx-auto relative z-10">
      {/* Hero Section */}
      <header className="mb-16 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
          <h1 className="text-6xl font-black text-white tracking-tight mb-4 drop-shadow-lg">
            DissCourse
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
            Master the art of debate with AI-powered feedback. Choose your persona, engage with complex topics, and sharpen your rhetorical skills.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="flex justify-center gap-6 flex-wrap">
          <button 
            onClick={() => navigateTo('arena', TOPICS[0])}
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-12 py-6 rounded-3xl text-xl font-bold shadow-2xl shadow-blue-500/50 hover:shadow-3xl hover:shadow-blue-500/70 hover:scale-110 transition-all duration-300 glow-slate border-2 border-white/30 backdrop-blur-sm"
          >
            🚀 Start Debating
          </button>
          <button 
            onClick={() => navigateTo('avatar')}
            className="bg-white/20 backdrop-blur-xl border-2 border-white/30 text-white px-12 py-6 rounded-3xl text-xl font-bold hover:bg-white/30 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
          >
            🎭 Choose Persona
          </button>
        </motion.div>
      </header>

      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-3 text-white drop-shadow-lg"><TrendingUp className="text-yellow-400" size={28}/> Trending Debates</h2>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {TOPICS.map(topic => (
          <motion.div 
            key={topic.id} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: topic.id * 0.1 }}
            className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 group hover:scale-105"
          >
            <div>
              <span className={`text-sm font-bold uppercase tracking-wider text-white px-4 py-2 rounded-full ${topic.color} shadow-lg`}>
                {topic.category}
              </span>
              <h3 className="mt-6 text-xl font-bold text-white leading-snug group-hover:text-yellow-300 transition-colors drop-shadow-md">
                {topic.title}
              </h3>
            </div>
            <div className="mt-8 pt-6 border-t border-white/20 flex items-center justify-between">
              <span className="text-sm font-medium text-white/80 flex items-center gap-2 drop-shadow-sm">
                <MessageSquare size={18}/> 12 Active
              </span>
              <button 
                onClick={() => navigateTo('arena', topic)}
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-xl shadow-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/70 hover:scale-110 transition-all duration-300 glow-slate"
              >
                ⚔️ Join Debate
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <footer className="mt-20 pt-8 border-t border-white/20 text-center">
        <p className="text-white/80 text-sm drop-shadow-sm">
          Powered by AI • Built for thoughtful discourse • © 2026 DissCourse
        </p>
      </footer>
    </motion.div>
  );
}

function AvatarView({ setAvatar, navigateTo, currentAvatar }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="p-8 max-w-5xl mx-auto relative z-10">
      <button onClick={() => navigateTo('home')} className="flex items-center gap-2 text-white hover:text-yellow-300 mb-8 font-bold transition-colors drop-shadow-sm">
        <ArrowLeft size={20} /> Back to Dashboard
      </button>

      <h1 className="text-4xl font-black mb-4 text-white text-center drop-shadow-lg">Choose Your Persona</h1>
      <p className="text-white/80 mb-12 text-center text-lg drop-shadow-md max-w-2xl mx-auto">Select a historical or contemporary figure to represent your debate style and perspective.</p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {HISTORICAL_AVATARS.map(avatar => (
          <motion.button 
            key={avatar.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: HISTORICAL_AVATARS.indexOf(avatar) * 0.05 }}
            onClick={() => { setAvatar(avatar); navigateTo('home'); }}
            className={`flex flex-col items-center p-6 rounded-3xl border-2 transition-all duration-300 hover:scale-110 backdrop-blur-xl ${
              currentAvatar.id === avatar.id ? 'border-yellow-400 bg-white/20 shadow-2xl shadow-yellow-400/50' : 'border-white/20 bg-white/10 hover:border-white/40 hover:bg-white/20 shadow-xl'
            }`}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl text-white font-bold shadow-lg mb-4 ${avatar.color}`}>
              {avatar.initials}
            </div>
            <h3 className="font-bold text-lg text-white text-center drop-shadow-md">{avatar.name}</h3>
            <p className="text-sm text-white/80 font-medium text-center drop-shadow-sm">{avatar.title}</p>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

const OPPONENT_RESPONSES = [
  // Removed fake data - opponent responses will be generated by real AI in future
];

function ArenaView({ topic, userAvatar, navigateTo }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null);

  const analyzeLogic = () => {
    setIsAnalyzing(true); setAiFeedback(null);
    setTimeout(() => {
      const scores = [75, 82, 88, 91, 79, 85, 93, 77, 89, 84];
      const suggestions = [
        "Strong foundation. Consider adding a specific example to strengthen your case.",
        "Good reasoning. Try addressing potential counterarguments proactively.",
        "Excellent point. Your evidence is compelling - maybe quantify the impact?",
        "Well-structured argument. Consider the broader implications for stakeholders.",
        "Solid logic. You might want to acknowledge the complexity of implementation.",
        "Persuasive argument. Consider how this relates to real-world precedents.",
        "Clear and concise. Try exploring the ethical dimensions of this issue.",
        "Interesting perspective. Consider the long-term sustainability aspects.",
        "Well-researched point. Maybe compare with similar historical cases.",
        "Logical flow is strong. Consider the human element in your argument."
      ];
      const randomIndex = Math.floor(Math.random() * scores.length);
      setAiFeedback({ score: scores[randomIndex], suggestion: suggestions[randomIndex] });
      setIsAnalyzing(false);
    }, 1500);
  };

  const sendMessage = () => {
    if (!draft) return;
    const userMessage = { id: Date.now(), sender: 'user', text: draft, stance: 'pro' };
    setMessages(prev => [...prev, userMessage]);
    setDraft(''); setAiFeedback(null);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full relative z-10">
      {/* Arena Nav */}
      <nav className="p-6 bg-white/20 backdrop-blur-xl border-b border-white/20 sticky top-0 z-10 flex items-center justify-between shadow-lg">
        <button onClick={() => navigateTo('home')} className="flex items-center gap-2 text-white hover:text-yellow-300 font-bold transition-colors drop-shadow-sm">
          <ArrowLeft size={20} /> Exit
        </button>
        <div className="text-sm font-bold px-6 py-2 rounded-full bg-white/20 text-white uppercase tracking-widest shadow-inner backdrop-blur-sm border border-white/20">
          Debate Session
        </div>
      </nav>

      {/* Arena Content */}
      <main className="flex-1 overflow-y-auto p-8 pb-48">
        <div className="max-w-3xl mx-auto text-center mt-4 mb-16">
          <h1 className="text-3xl font-black leading-tight tracking-tight text-white drop-shadow-lg mb-4">
            {topic?.title || "Debate Arena"}
          </h1>
          <p className="text-white/80 text-lg drop-shadow-md">Craft your arguments and get AI feedback</p>
        </div>

        {/* Chat Stream */}
        <div className="max-w-3xl mx-auto space-y-8">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
                <div className="max-w-[85%] px-8 py-6 shadow-2xl text-[16px] font-medium leading-relaxed bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-3xl rounded-tr-sm border-2 border-white/20">
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-8 pt-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pb-12">
        <div className="max-w-4xl mx-auto relative">
          <AnimatePresence>
            {aiFeedback && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute bottom-full mb-6 w-full p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl flex gap-4 items-start z-20">
                <div className="p-3 rounded-xl text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg"><ShieldCheck size={28}/></div>
                <div>
                  <p className="text-sm font-black uppercase tracking-widest text-emerald-300 mb-2 drop-shadow-sm">Logic Score: {aiFeedback.score}/100</p>
                  <p className="text-white/90 font-medium drop-shadow-sm">{aiFeedback.suggestion}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative bg-white/10 backdrop-blur-xl rounded-[2rem] border-2 border-white/20 shadow-2xl p-3 flex items-end gap-3 focus-within:border-white/40 transition-colors z-10">
            <textarea
              value={draft} onChange={(e) => setDraft(e.target.value)}
              placeholder="Construct your argument... (Type and hit the Sparkle icon)"
              className="flex-1 bg-transparent border-none focus:ring-0 text-[16px] px-6 py-5 resize-none h-20 max-h-32 font-medium outline-none text-white placeholder-white/60"
            />
            <div className="flex gap-3 pr-3 pb-2">
              <button onClick={analyzeLogic} disabled={!draft || isAnalyzing} className="p-4 rounded-2xl transition-all text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-40 shadow-xl shadow-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/70 hover:scale-110">
                {isAnalyzing ? <div className="w-6 h-6 border-2 border-white border-t-transparent animate-spin rounded-full"/> : <Sparkles size={26} />}
              </button>
              <button onClick={sendMessage} disabled={!draft} className="p-4 rounded-2xl transition-all text-white bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 disabled:opacity-40 shadow-xl shadow-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/70 hover:scale-110">
                <Send size={26} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}