import { useState, useRef, useEffect } from 'react';
import './App.css';
import { 
  Scale, 
  Play, 
  Send,
  RotateCcw,
  Zap,
  Users,
  TrendingUp,
  Clock,
  Sparkles
} from 'lucide-react';
import { cn } from './utils/cn';

type Stance = 'pro' | 'con';
type View = 'home' | 'arena';

interface Message {
  id: string;
  speaker: Stance;
  content: string;
  time: string;
  score: number;
}

const PRO_RESPONSES = [
  "The evidence is unambiguous. When we examine the historical trajectory of legal rights expansion — from property-owning men to universal suffrage — each extension strengthened, not weakened, the social contract. This is the next logical iteration.",
  "The opposition's framing relies on a category error. We're not discussing biological consciousness; we're discussing operational autonomy. A system that can independently execute contracts, allocate resources, and cause real-world harm must exist within a legal framework.",
  "Let me address the liability concern directly. Corporate personhood already solves this — we assign responsibility through contractual matrices. The alternative is a legal vacuum where harm occurs with zero accountability.",
  "Your argument assumes a static technological landscape. We're dealing with systems that learn, adapt, and make autonomous decisions. The question isn't whether they're 'ready' for rights — it's whether our legal system is ready for them.",
  "Consider the practical alternative the opposition is proposing: nothing. No framework, no accountability, no structure. That's not caution — that's negligence dressed up as prudence."
];

const CON_RESPONSES = [
  "This fundamentally misreads the purpose of legal personhood. It was created as a convenient fiction to allow groups of humans to act collectively. Extending it to algorithms is not progress — it's a category error with dangerous consequences.",
  "The pro side's analogy to corporate personhood actually undermines their case. Corporations can be fined, dissolved, and their executives imprisoned. What penalty meaningfully deters a neural network? You can't put code in prison.",
  "Let's follow the money. Who benefits from AI personhood? Not the AI — it has no concept of benefit. The corporations deploying it do, because it creates a liability firewall between their actions and their responsibility.",
  "Every example the pro side cites involves expanding rights to beings with subjective experience — a capacity we have zero evidence that AI possesses. This isn't expanding the moral circle; it's diluting it to meaninglessness.",
  "The pro side accuses us of proposing 'nothing.' But targeted regulatory frameworks — algorithmic impact assessments, mandatory insurance, developer liability — these are specific, actionable, and don't require granting rights to software."
];

function generateResponse(stance: Stance, round: number): string {
  const pool = stance === 'pro' ? PRO_RESPONSES : CON_RESPONSES;
  return pool[round % pool.length];
}

export default function App() {
  const [view, setView] = useState<View>('home');
  const [activeTopic, setActiveTopic] = useState('');
  const [topicInput, setTopicInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState(false);
  const [round, setRound] = useState(0);
  const [userPrompt, setUserPrompt] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startDebate = (topic: string) => {
    if (!topic.trim()) return;
    setActiveTopic(topic);
    setMessages([]);
    setRound(0);
    setView('arena');
    setThinking(true);

    setTimeout(() => {
      const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setMessages([{
        id: `${Date.now()}-pro`,
        speaker: 'pro',
        content: generateResponse('pro', 0),
        time: t,
        score: 82 + Math.floor(Math.random() * 12)
      }]);
      setThinking(true);

      setTimeout(() => {
        const t2 = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setMessages(prev => [...prev, {
          id: `${Date.now()}-con`,
          speaker: 'con',
          content: generateResponse('con', 0),
          time: t2,
          score: 80 + Math.floor(Math.random() * 14)
        }]);
        setRound(1);
        setThinking(false);
      }, 2200);
    }, 1200);
  };

  const nextTurn = () => {
    if (thinking || !messages.length) return;
    const lastStance = messages[messages.length - 1].speaker;
    const nextStance: Stance = lastStance === 'pro' ? 'con' : 'pro';
    setThinking(true);

    setTimeout(() => {
      const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setMessages(prev => [...prev, {
        id: `${Date.now()}-${nextStance}`,
        speaker: nextStance,
        content: generateResponse(nextStance, round),
        time: t,
        score: 75 + Math.floor(Math.random() * 18)
      }]);
      setRound(prev => nextStance === 'con' ? prev + 1 : prev);
      setThinking(false);
    }, 1800);
  };

  const injectPrompt = () => {
    if (!userPrompt.trim() || thinking) return;
    const lastStance = messages[messages.length - 1]?.speaker;
    const nextStance: Stance = lastStance === 'pro' ? 'con' : 'pro';
    setThinking(true);

    setTimeout(() => {
      const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setMessages(prev => [...prev, {
        id: `${Date.now()}-${nextStance}`,
        speaker: nextStance,
        content: `Responding to the interjection: "${userPrompt}" — ` + generateResponse(nextStance, round),
        time: t,
        score: 70 + Math.floor(Math.random() * 20)
      }]);
      setRound(prev => nextStance === 'con' ? prev + 1 : prev);
      setUserPrompt('');
      setThinking(false);
    }, 2000);
  };

  const goHome = () => {
    setView('home');
    setMessages([]);
    setActiveTopic('');
    setTopicInput('');
    setUserPrompt('');
    setThinking(false);
  };

  // ─── HOME ───
  if (view === 'home') {
    return (
      <div className="min-h-screen bg-[#09090b] text-white font-sans selection:bg-indigo-500/30 antialiased flex flex-col">
        {/* Nav */}
        <nav className="shrink-0 border-b border-white/[0.04]">
          <div className="max-w-6xl mx-auto h-14 flex items-center justify-between px-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Scale className="w-4 h-4 text-[#09090b]" />
              </div>
              <span className="text-sm font-bold tracking-tight">DissCourse</span>
              <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded">AI</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="font-medium">2 agents online</span>
            </div>
          </div>
        </nav>

        {/* Centered Hero */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/[0.04] via-transparent to-transparent pointer-events-none" />
          
          <div className="relative text-center max-w-2xl mx-auto">
            {/* Tag */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="h-px w-6 bg-indigo-500/50" />
              <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-[0.2em]">AI Debate Arena</span>
              <div className="h-px w-6 bg-indigo-500/50" />
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.08] mb-6">
              Two minds.
              <br />
              One topic.
              <br />
              <span className="bg-gradient-to-r from-indigo-400 to-indigo-600 text-transparent bg-clip-text">You steer.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm md:text-base text-slate-400 leading-relaxed max-w-md mx-auto mb-12">
              Pick any debate topic and watch two AI agents argue it out in real time. 
              Inject prompts, redirect the conversation, or just watch the sparks fly.
            </p>

            {/* Input */}
            <div className="max-w-md mx-auto space-y-4">
              <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-1.5 focus-within:border-indigo-500/30 transition-colors">
                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && startDebate(topicInput)}
                  placeholder="Type any debate topic..."
                  className="w-full bg-transparent px-4 py-3.5 text-sm text-white placeholder-slate-600 focus:outline-none text-center"
                />
              </div>
              <button
                onClick={() => startDebate(topicInput)}
                disabled={!topicInput.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all glow-btn"
              >
                <Play className="w-4 h-4" />
                Start Debate
              </button>
            </div>
          </div>
        </main>

        {/* Bottom Stats */}
        <footer className="shrink-0 border-t border-white/[0.04]">
          <div className="max-w-6xl mx-auto px-6 py-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[11px] text-slate-600 font-medium">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-500/60" />
              <span><strong className="text-slate-400 font-semibold">2</strong> AI Agents</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500/60" />
              <span><strong className="text-slate-400 font-semibold">∞</strong> Topics</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500/60" />
              <span><strong className="text-slate-400 font-semibold">Real-time</strong> Responses</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-500/60" />
              <span><strong className="text-slate-400 font-semibold">Live</strong> Scoring</span>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // ─── ARENA ───
  const proMsgs = messages.filter(m => m.speaker === 'pro');
  const conMsgs = messages.filter(m => m.speaker === 'con');
  const avgPro = proMsgs.length ? Math.round(proMsgs.reduce((a, b) => a + b.score, 0) / proMsgs.length) : 0;
  const avgCon = conMsgs.length ? Math.round(conMsgs.reduce((a, b) => a + b.score, 0) / conMsgs.length) : 0;

  return (
    <div className="h-screen bg-[#09090b] text-white font-sans flex flex-col selection:bg-indigo-500/30 antialiased">
      {/* Top Bar */}
      <header className="h-13 bg-[#09090b]/90 backdrop-blur-xl border-b border-white/[0.04] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={goHome}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Topic</span>
          </button>
          <div className="h-4 w-px bg-white/[0.06]" />
          <p className="text-xs text-slate-400 truncate max-w-[180px] md:max-w-md font-medium">{activeTopic}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono">
            <span className="text-emerald-400">PRO {avgPro}</span>
            <span className="text-slate-700">—</span>
            <span className="text-rose-400">CON {avgCon}</span>
          </div>
          <button
            onClick={nextTurn}
            disabled={thinking}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed glow-btn"
          >
            {thinking ? (
              <>
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Thinking
              </>
            ) : (
              <>
                <Zap className="w-3 h-3" />
                Next Turn
              </>
            )}
          </button>
        </div>
      </header>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-1">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex gap-3 animate-fadeIn py-3", msg.speaker === 'con' && 'flex-row-reverse')}>
              <div className={cn(
                "w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[10px] font-black border",
                msg.speaker === 'pro'
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-rose-500/10 border-rose-500/20 text-rose-400"
              )}>
                {msg.speaker === 'pro' ? 'P' : 'C'}
              </div>

              <div className={cn("max-w-[80%] space-y-1.5", msg.speaker === 'con' && 'text-right')}>
                <div className={cn(
                  "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  msg.speaker === 'pro'
                    ? "bg-emerald-500/[0.04] border border-emerald-500/[0.08] text-slate-200"
                    : "bg-rose-500/[0.04] border border-rose-500/[0.08] text-slate-200"
                )}>
                  {msg.content}
                </div>
                <div className={cn(
                  "flex items-center gap-2 text-[10px] font-medium",
                  msg.speaker === 'pro' ? "text-emerald-500/50" : "text-rose-500/50 justify-end"
                )}>
                  <span className="font-mono">{msg.score}/100</span>
                  <span className="text-slate-700">•</span>
                  <span>{msg.time}</span>
                </div>
              </div>
            </div>
          ))}

          {thinking && (
            <div className="flex justify-center py-6">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="flex gap-0.5">
                  <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '120ms' }} />
                  <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '240ms' }} />
                </div>
                <span className="font-medium">Formulating response...</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-white/[0.04] bg-[#09090b]/90 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-4 py-3 flex gap-2">
          <input
            type="text"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && injectPrompt()}
            placeholder="Inject a prompt to steer the debate..."
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
          Press Enter to inject • Click "Next Turn" to let AIs continue
        </p>
      </div>
    </div>
  );
}
