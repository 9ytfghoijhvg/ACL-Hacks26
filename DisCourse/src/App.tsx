import { useState, useRef, useEffect } from 'react'
import './App.css'

import {
Scale,
Play,
Send,
RotateCcw,
Zap,
Users,
TrendingUp,
Clock,
Sparkles,
User
} from 'lucide-react'

import { cn } from './utils/cn'

// local api for now
// probably swap this when deploying
const API = 'http://127.0.0.1:8000'

type ViewMode = 'home' | 'arena'

interface Message {
id: string
speaker: string
content: string
time: string
isAudience?: boolean
animate?: boolean
}

interface Debater {
name: string
image: string | null
}

interface HistoryEntry {
speaker: string
text: string
}

/* avatar bubble */
function Avatar({
debater,
size = 'md'
}: {
debater: Debater | null
size?: 'sm' | 'md' | 'lg'
}) {
let sizeClass = 'w-10 h-10 text-base'

if (size === 'lg') {
sizeClass = 'w-16 h-16 text-2xl'
} else if (size === 'sm') {
sizeClass = 'w-8 h-8 text-xs'
}

// no user selected yet
if (!debater) {
return (
<div
className={cn(
'rounded-full bg-white/10 border border-white/10 flex items-center justify-center shrink-0',
sizeClass
)}
>
<User className="w-4 h-4 text-slate-500" />
</div>
)
}

// image exists
if (debater.image) {
return (
<img
src={API + debater.image}
alt={debater.name}
className={cn(
'rounded-full object-cover border border-white/10 shrink-0',
sizeClass
)}
/>
)
}

// fallback to first letter
return (
<div
className={cn(
'rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-300 shrink-0',
sizeClass
)}
>
{debater.name[0]}
</div>
)
}

/* dropdown picker for debaters */
function DebaterPicker({
label,
debaters,
value,
onChange,
exclude
}: {
label: string
debaters: Debater[]
value: string
onChange: (name: string) => void
exclude: string
}) {
const [open, setOpen] = useState(false)

const selected =
debaters.find((dude) => dude.name === value) || null

return (
<div className="relative w-full">
<p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2">
{label}
</p>

  <button
    onClick={() => setOpen(!open)}
    className="w-full flex items-center gap-3 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] rounded-xl px-4 py-3 transition-colors"
  >
    <Avatar debater={selected} size="sm" />

    <span className="flex-1 text-left text-sm font-medium text-white">
      {selected ? selected.name : 'Select debater...'}
    </span>

    <span className="text-slate-500 text-xs">▾</span>
  </button>

  {open && (
    <div className="absolute z-50 mt-1 w-full bg-[#111113] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl max-h-64 overflow-y-auto">
      {debaters
        .filter((item) => item.name !== exclude)
        .map((item) => {
          return (
            <button
              key={item.name}
              onClick={() => {
                onChange(item.name)
                setOpen(false)
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.06] transition-colors text-left"
            >
              <Avatar debater={item} size="sm" />
              <span className="text-sm text-white">
                {item.name}
              </span>
            </button>
          )
        })}
    </div>
  )}
</div>
)
}

/* typing effect */
function TypewriterText({
text,
animate
}: {
text: string
animate: boolean
}) {
const [shown, setShown] = useState(
animate ? '' : text
)

useEffect(() => {
if (!animate) {
setShown(text)
return
}

setShown('')
let i = 0

const timer = setInterval(() => {
  i++

  setShown(text.slice(0, i))

  if (i >= text.length) {
    clearInterval(timer)
  }
}, 18)

return () => clearInterval(timer)
}, [text, animate])

return (
<span>
{shown}

  {animate && shown.length < text.length && (
    <span className="inline-block w-0.5 h-3.5 bg-current ml-0.5 animate-pulse" />
  )}
</span>
)
}

/* whole app */
export default function App() {
const [view, setView] = useState<ViewMode>('home')

const [debaters, setDebaters] = useState<Debater[]>([])
const [speaker, setSpeaker] = useState('')
const [opponent, setOpponent] = useState('')

const [topicInput, setTopicInput] = useState('')
const [activeTopic, setActiveTopic] = useState('')

const [messages, setMessages] = useState<Message[]>([])
const [history, setHistory] = useState<HistoryEntry[]>([])

const [thinking, setThinking] = useState(false)
const [userPrompt, setUserPrompt] = useState('')
const [error, setError] = useState('')

const bottomRef = useRef<HTMLDivElement>(null)

// get list of debaters on page load
useEffect(() => {
fetch(${API}/debate/options)
.then((r) => r.json())
.then((data) => {
setDebaters(data.debaters || [])
})
.catch(() => {
setError('Cannot connect to backend')
})
}, [])

// keep chat pinned to bottom
useEffect(() => {
bottomRef.current?.scrollIntoView({
behavior: 'smooth'
})
}, [messages])

const speakerObj =
debaters.find((d) => d.name === speaker) || null

const opponentObj =
debaters.find((d) => d.name === opponent) || null

async function startDebate() {
if (!topicInput.trim()) return
if (!speaker || !opponent) return

setMessages([])
setHistory([])
setView('arena')
setActiveTopic(topicInput.trim())

setThinking(true)
setError('')

try {
  const res = await fetch(`${API}/debate/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      topic: topicInput.trim(),
      speaker,
      opponent
    })
  })

  const data = await res.json()

  if (data.error) {
    setError(data.error)
    setThinking(false)
    return
  }

  const msg = data.message

  const firstEntry = {
    speaker: msg.speaker,
    text: msg.content
  }

  setHistory([firstEntry])

  setMessages([
    {
      id: String(Date.now()),
      speaker: msg.speaker,
      content: msg.content,
      time: new Date(msg.time).toLocaleTimeString(
        [],
        {
          hour: '2-digit',
          minute: '2-digit'
        }
      ),
      animate: true
    }
  ])
} catch (err) {
  setError('Failed to reach backend.')
}

setThinking(false)
}

async function nextTurn(audienceText = '') {
if (thinking) return
if (!messages.length) return

const lastSpeaker =
  messages[messages.length - 1].speaker

const nextSpeaker =
  lastSpeaker === speaker ? opponent : speaker

setThinking(true)
setError('')

try {
  const res = await fetch(`${API}/debate/next`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      topic: activeTopic,
      speaker: nextSpeaker,
      opponent: lastSpeaker,
      history,
      audience: audienceText
    })
  })

  const data = await res.json()

  if (data.error) {
    setError(data.error)
    setThinking(false)
    return
  }

  const msg = data.message

  setHistory((old) => [
    ...old,
    {
      speaker: msg.speaker,
      text: msg.content
    }
  ])

  setMessages((old) => [
    ...old,
    {
      id: String(Date.now()),
      speaker: msg.speaker,
      content: msg.content,
      time: new Date(msg.time).toLocaleTimeString(
        [],
        {
          hour: '2-digit',
          minute: '2-digit'
        }
      ),
      animate: true
    }
  ])
} catch (err) {
  setError('Failed to reach backend.')
}

setThinking(false)
}

function injectPrompt() {
if (!userPrompt.trim()) return
if (thinking) return

const text = userPrompt.trim()

setMessages((old) => [
  ...old,
  {
    id: String(Date.now()),
    speaker: 'Audience',
    content: text,
    time: new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    }),
    isAudience: true
  }
])

setUserPrompt('')
nextTurn(text)
}

function goHome() {
setView('home')
setMessages([])
setHistory([])
setActiveTopic('')
setTopicInput('')
setUserPrompt('')
setThinking(false)
setError('')
}

// keeping JSX mostly same because styling already solid
return null
}