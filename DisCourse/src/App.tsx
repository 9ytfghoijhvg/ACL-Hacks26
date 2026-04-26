import { useState, useRef, useEffect } from 'react';
import './App.css';
import { Scale, Play, Send, RotateCcw, Zap, Users, TrendingUp, Clock, Sparkles, User } from 'lucide-react';
import { cn } from './utils/cn';

// uses api for backend and frontend communication
const API = 'http://127.0.0.1:8000';

type View = 'home' | 'arena';

interface Message {
   id: string;
  speaker: string;
 content: string;
  time: string;

  isAudience?: boolean;
  animate?: boolean;
}

interface Debater {
  name: string;
  image: string | null;
}

interface HistoryEntry {
  speaker: string;
  text: string;
}


function Avatar({ debater, size = 'md' }: { debater: Debater | null; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'w-16 h-16 text-2xl' : size === 'md' ? 'w-10 h-10 text-base' : 'w-8 h-8 text-xs';
  if (!debater) {
    return (
      <div className={cn('rounded-full bg-white/10 border border-white/10 flex items-center justify-center shrink-0', sizeClass)}>
        <User className="w-4 h-4 text-slate-500" />
      </div>
    );
  }
  if (debater.image) {
    return <img src={`${API}${debater.image}`} alt={debater.name} className={cn('rounded-full object-cover border border-white/10 shrink-0', sizeClass)} />;
  }
  return (
    <div className={cn('rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-300 shrink-0', sizeClass)}>
      {debater.name[0]}
    </div>
  );
}


//selection for debaters
function DebaterPicker({ label, debaters, value, onChange, exclude }: {

  label: string;

  debaters: Debater[];
  value: string;
  onChange: (name: string) => void;
  exclude: string;
}) {
  const [open, setOpen] = useState(false);
   const selected = debaters.find(d => d.name === value) ?? null;

  return (
       <div className="relative w-full" >
      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2">{label}</p>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] rounded-xl px-4 py-3 transition-colors"
      >
        <Avatar debater={selected} size="sm" />
        <span className="flex-1 text-left text-sm font-medium text-white">
          {selected ? selected.name : 'Select a debater...'}
        </span>
        <span className="text-slate-500 text-xs">▾</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-[#111113] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl max-h-64 overflow-y-auto">
          {debaters.filter(d => d.name !== exclude).map(d => (
            <button
              key={d.name}
              onClick={() => { onChange(d.name); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.06] transition-colors text-left"
            >
              <Avatar debater={d} size="sm" />
              <span className="text-sm text-white">{d.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TypewriterText({ text, animate }: { text: string; animate: boolean }) {
  const [displayed, setDisplayed] = useState(animate ? '' : text);

  useEffect(() => {
    if (!animate) { 
      setDisplayed(text);
       return; 
      }
    setDisplayed('');
    let i = 0;
    const interval = setInterval(
      () => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length){

         clearInterval(interval);
      }
    }, 18);
    return () => clearInterval(interval);
  }, [text, animate]);

  return <span>{displayed}{animate && displayed.length < text.length && <span className="inline-block w-0.5 h-3.5 bg-current ml-0.5 animate-pulse" />}</span>;
}

// the whole app function that does the frontend logic
 export default function App() {

  const [view, setView] = useState<View>('home');
  const [debaters, setDebaters] = useState<Debater[]>([]);
  const [speaker, setSpeaker] = useState('');

  const [opponent, setOpponent] = useState('');
  const [topicInput, setTopicInput] = useState('');
  const [activeTopic, setActiveTopic] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [thinking, setThinking] = useState(false);
  const [userPrompt, setUserPrompt] = useState('');
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);


   
     useEffect(() => {
    fetch(`${API}/debate/options`)
      .then(r => r.json())
      .then(data => setDebaters(data.debaters ?? []))
      .catch(() => setError('Cannot communicate with backend'));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
   
  }, [messages]);

   
   const speakerObj = debaters.find(d => d.name === speaker) ?? null;

  const opponentObj = debaters.find(d => d.name === opponent) ?? null;

  const startDebate = async () => {
    if (!topicInput.trim() || !speaker || !opponent) return;
    setActiveTopic(topicInput.trim());
    setMessages([]);
    setHistory([]);
    setView('arena');
    setThinking(true);
    setError('');

    try {
      const res = await fetch(`${API}/debate/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicInput.trim(), speaker, opponent }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setThinking(false); return; }

      const msg = data.message;
      const newEntry: HistoryEntry = { speaker: msg.speaker, text: msg.content };
      setHistory([newEntry]);
      setMessages([{ id: Date.now().toString(), speaker: msg.speaker, content: msg.content, time: new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), animate: true }]);
    } catch {
      setError('Failed to reach backend.');
    }
    setThinking(false);
  };

  const nextTurn = async (audienceText = '') => {
    if (thinking || !messages.length) return;
    const lastSpeaker = messages[messages.length - 1].speaker;
    const nextSpeaker = lastSpeaker === speaker ? opponent : speaker;
    setThinking(true);
    setError('');

    try {
      const res = await fetch(`${API}/debate/next`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: activeTopic, speaker: nextSpeaker, opponent: lastSpeaker, history, audience: audienceText }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setThinking(false); return; }

      const msg = data.message;
      const newEntry: HistoryEntry = { speaker: msg.speaker, text: msg.content };
      setHistory(prev => [...prev, newEntry]);
      setMessages(prev => [...prev, { id: Date.now().toString(), speaker: msg.speaker, content: msg.content, time: new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), animate: true }]);
    } catch {
      setError('Failed to reach backend.');
    }
    setThinking(false);
  };

  const injectPrompt = () => {
    if (!userPrompt.trim() || thinking) return;
    const text = userPrompt.trim();
    const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { id: Date.now().toString(), speaker: 'Audience', content: text, time: t, isAudience: true }]);
    nextTurn(text);
    setUserPrompt('');
  };

  const goHome = () => {
     setView('home');
    setMessages([]);
    setHistory([]);
    setActiveTopic('');
    setTopicInput('');
    setUserPrompt('');

    setThinking(false);
    setError('');
  };

  // home page, AI was used to improve the HTML tags and CSS to make it look flawless for the arena too
  if (view === 'home') {
    const canStart = topicInput.trim() && speaker && opponent && speaker !== opponent;
     return (
      <div className="min-h-screen bg-[#09090b] text-white font-sans selection:bg-indigo-500/30 antialiased flex flex-col">
         <nav className="shrink-0 border-b border-white/[0.04]">
          <div className="max-w-6xl mx-auto h-14 flex items-center justify-between px-6">
            <div className="flex items-center gap-2.5">
                 <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Scale className="w-4 h-4 text-[#09090b]" />
              </div>
              <span className="text-sm font-bold tracking-tight">DisCourse</span>
              <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded">AI</span>
        </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <div className={cn('w-1.5 h-1.5 rounded-full', debaters.length > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-red-400')} />
            <span className="font-medium">{debaters.length > 0 ? `${debaters.length} debaters loaded` : 'Backend offline'}</span>
            </div>
              </div>
        </nav>

        <main className="flex-1 flex flex-col items-center justify-center px-6 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/[0.04] via-transparent to-transparent pointer-events-none" />
          <div className="relative text-center max-w-2xl mx-auto w-full">
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="h-px w-6 bg-indigo-500/50" />
              <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-[0.2em]">AI Debate Arena</span>
              <div className="h-px w-6 bg-indigo-500/50" />
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.08] mb-6">
              Two minds.
              <br />
              One topic.
              <br />
              <span className="bg-gradient-to-r from-indigo-400 to-indigo-600 text-transparent bg-clip-text">You steer.</span>
            </h1>

            <div className="flex justify-center mb-10">
              <p className="text-sm md:text-base text-slate-400 leading-relaxed max-w-md text-center">
                Dead presidents, internet legends, ancient philosophers — throw them in a room and make them argue.
              </p>
            </div>

            {error && <p className="text-red-400 text-xs mb-4 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">{error}</p>}

            <div className="max-w-lg mx-auto space-y-4 text-left">
              {}
              <div className="grid grid-cols-2 gap-3">
                <DebaterPicker label="Debater 1" debaters={debaters} value={speaker} onChange={setSpeaker} exclude={opponent} />
                <DebaterPicker label="Debater 2" debaters={debaters} value={opponent} onChange={setOpponent} exclude={speaker} />
              </div>

              {}
              <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-1.5 focus-within:border-indigo-500/30 transition-colors">
                <input
                  type="text"
                  value={topicInput}
                  onChange={e => setTopicInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && canStart && startDebate()}
                  placeholder="Type a debate topic..."
                  className="w-full bg-transparent px-4 py-3.5 text-sm text-white placeholder-slate-600 focus:outline-none text-center"
                />
              </div>

              <button
                onClick={startDebate}
                disabled={!canStart}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
              >
                <Play className="w-4 h-4" />
                Start Debate
              </button>
            </div>
          </div>
        </main>

        <footer className="shrink-0 border-t border-white/[0.04]">
          <div className="max-w-6xl mx-auto px-6 py-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[11px] text-slate-600 font-medium">
            <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-indigo-500/60" /><span><strong className="text-slate-400">{debaters.length}</strong> Debaters</span></div>
            <div className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-emerald-500/60" /><span><strong className="text-slate-400">∞</strong> Topics</span></div>
            <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-amber-500/60" /><span><strong className="text-slate-400">Real-time</strong> Responses</span></div>
            <div className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-rose-500/60" /><span><strong className="text-slate-400">Live</strong> AI</span></div>
          </div>
        </footer>
      </div>
    );
  }

  return (

    <div className="h-screen bg-[#09090b] text-white font-sans flex flex-col selection:bg-indigo-500/30 antialiased">
      
          <header className="h-13 bg-[#09090b]/90 backdrop-blur-xl border-b border-white/[0.04] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
      
      <button onClick={goHome} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-white transition-colors">
            <RotateCcw className="w-3.5 h-3.5" />

            <span className="hidden sm:inline">New Debate</span>
          </button>
          <div className="h-4 w-px bg-white/[0.06]" />

          <p className="text-xs text-slate-400 truncate max-w-[180px] md:max-w-md font-medium">{activeTopic}</p>
        </div>

        {}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <Avatar debater={speakerObj} size="sm" />
        
        <span className="text-xs text-slate-400 font-medium">{speaker}</span>
           
           <span className="text-slate-600 text-xs">vs</span>
            <span className="text-xs text-slate-400 font-medium">{opponent}</span>
            <Avatar debater={opponentObj} size="sm" />
          </div>
          <button
            onClick={() => nextTurn()}
            
            
            disabled={thinking}
          
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {thinking ? (
              <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Thinking</>
            ) : (
              <><Zap className="w-3 h-3" />Next Turn</>
            )}
          </button>
        </div>

      </header>

      {}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-1">
          {messages.map(msg => {
    

            if (msg.isAudience) {
              return (
                <div key={msg.id} className="flex justify-center py-2">
                  <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 max-w-[80%]">
                    <span className="text-amber-400 text-[10px] font-bold uppercase tracking-wider shrink-0">Audience</span>
                        <span className="text-amber-200 text-xs">{msg.content}</span>
                  </div>
                </div>

              );
            }

            const isSpeaker = msg.speaker === speaker;
            const debaterObj = isSpeaker ? speakerObj : opponentObj;
            return (
              <div key={msg.id} className={cn('flex gap-3 animate-fadeIn py-3', !isSpeaker && 'flex-row-reverse')}>
                <Avatar debater={debaterObj} size="sm" />
                <div className={cn('max-w-[80%] space-y-1.5', !isSpeaker && 'text-right')}>
                  <p className={cn('text-[11px] font-semibold', isSpeaker ? 'text-indigo-400 text-left' : 'text-rose-400 text-right')}>{msg.speaker}</p>
                  <div className={cn(
                    'rounded-2xl px-4 py-3 text-sm leading-relaxed text-slate-200',
                    isSpeaker
                      ? 'bg-indigo-500/[0.06] border border-indigo-500/[0.12]'
                      : 'bg-rose-500/[0.06] border border-rose-500/[0.12]'
                  )}>
                    <TypewriterText text={msg.content} animate={msg.animate ?? false} />
                  </div>
                  <p className={cn('text-[10px] text-slate-600', !isSpeaker && 'text-right')}>{msg.time}</p>
                </div>
              </div>
            );
          })}

          {thinking && (
            <div className="flex justify-center py-6">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="flex gap-0.5">
                  <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '120ms' }} />
                  <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '240ms' }} />
                </div>
                <span className="font-medium">Creating a response...</span>
              </div>
            </div>
          )}

          {error && <p className="text-center text-red-400 text-xs py-2">{error}</p>}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Audience input */}
      <div className="border-t border-white/[0.04] bg-[#09090b]/90 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-4 py-3 flex gap-2">
          <input
            type="text"
            value={userPrompt}
            onChange={e => setUserPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && injectPrompt()}
            placeholder="Shout something from the audience..."
            className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-white/[0.12] transition-colors"
          />
          <button
            onClick={injectPrompt}
            disabled={!userPrompt.trim() || thinking}
            className="bg-white/[0.06] hover:bg-white/[0.1] disabled:opacity-30 disabled:cursor-not-allowed text-white px-3.5 rounded-xl transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-600 pb-2">
          Press Enter to shout from the audience, or Click "Next Turn" to continue
        </p>
      </div>
    </div>
  );
}
