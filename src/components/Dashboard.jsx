import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Mic, Activity, PlayCircle, Sparkles } from 'lucide-react'

const t = {
  en: {
    title: 'AI Dog Training',
    subtitle: 'Personalized tasks, real‑time feedback, visible progress',
    newTask: 'New Task',
    steps: 'Steps',
    complete: 'Complete',
    analytics: 'Analytics',
    successRate: 'Success rate',
    tasks: 'Tasks',
    live: 'Live Coach',
  },
  he: {
    title: 'אימון כלבים עם AI',
    subtitle: 'משימות מותאמות אישית, משוב בזמן אמת, התקדמות נראית',
    newTask: 'משימה חדשה',
    steps: 'צעדים',
    complete: 'סיום',
    analytics: 'אנליטיקה',
    successRate: 'שיעור הצלחה',
    tasks: 'משימות',
    live: 'מאמן חי',
  }
}

const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function Dashboard() {
  const [lang, setLang] = useState('en')
  const i18n = useMemo(() => t[lang], [lang])

  const [tasks, setTasks] = useState([])
  const [summary, setSummary] = useState({ total_tasks: 0, completed_tasks: 0, success_rate: null })

  useEffect(() => {
    fetch(`${baseUrl}/tasks`)
      .then(r => r.json())
      .then(d => setTasks(d.items || []))
      .catch(() => {})

    fetch(`${baseUrl}/analytics/summary`)
      .then(r => r.json())
      .then(setSummary)
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-sky-950 to-teal-900 text-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-gradient-to-br from-sky-700 to-teal-500 grid place-items-center shadow-lg shadow-sky-900/20">
              <Sparkles className="text-amber-300" size={18} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">{i18n.title}</h1>
              <p className="text-slate-300 text-sm">{i18n.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select value={lang} onChange={e => setLang(e.target.value)} className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm">
              <option value="en">English</option>
              <option value="he">עברית</option>
            </select>
            <button className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 font-semibold rounded-md px-4 py-2 text-sm shadow-lg shadow-amber-600/20">
              + {i18n.newTask}
            </button>
          </div>
        </header>

        <main className="grid md:grid-cols-3 gap-6 mt-10">
          <section className="md:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold tracking-tight">{i18n.tasks}</h2>
              <div className="text-xs text-slate-300">{tasks.length} {i18n.tasks.toLowerCase()}</div>
            </div>
            <div className="space-y-3">
              {tasks.length === 0 && (
                <div className="text-sm text-slate-400">No tasks yet. Use the button above to create your first task.</div>
              )}
              {tasks.map((task, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{task.title}</div>
                    <div className="text-xs text-slate-400">{i18n.steps}: {task.steps?.length || 0}</div>
                  </div>
                  <button className="inline-flex items-center gap-1 text-emerald-300 text-sm">
                    <CheckCircle2 size={16} /> {i18n.complete}
                  </button>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="font-semibold tracking-tight mb-4 flex items-center gap-2"><Activity size={18} /> {i18n.analytics}</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>{i18n.tasks}</span>
                <span className="text-sky-200">{summary.total_tasks}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Completed</span>
                <span className="text-teal-200">{summary.completed_tasks}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{i18n.successRate}</span>
                <span className="text-amber-200">{summary.success_rate === null ? '—' : `${Math.round(summary.success_rate * 100)}%`}</span>
              </div>
            </div>

            <div className="mt-6 border-t border-white/10 pt-4">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2"><Mic size={16} /> {i18n.live}</h3>
              <LiveCoachStub />
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

function LiveCoachStub() {
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState([])
  const [wsRef, setWsRef] = useState(null)

  const connect = () => {
    const ws = new WebSocket(baseUrl.replace('http', 'ws') + '/ws/live')
    ws.onopen = () => setConnected(true)
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data)
        setMessages((m) => [...m, msg])
      } catch (_) {}
    }
    ws.onclose = () => setConnected(false)
    setWsRef(ws)
  }

  const send = () => {
    if (wsRef) wsRef.send('hello coach')
  }

  return (
    <div className="bg-black/20 rounded-lg p-3 text-xs">
      <div className="flex items-center gap-2">
        <button onClick={connect} disabled={connected}
          className="inline-flex items-center gap-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 px-3 py-1.5 rounded-md">
          <PlayCircle size={14} /> {connected ? 'Connected' : 'Connect'}
        </button>
        <button onClick={send} disabled={!connected}
          className="inline-flex items-center gap-1 bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 px-3 py-1.5 rounded-md">
          <Sparkles size={14} /> Send test
        </button>
      </div>
      <div className="mt-3 space-y-1 max-h-32 overflow-auto">
        {messages.map((m, i) => (
          <div key={i} className="text-slate-300">{m.type}: {m.message || m.text}</div>
        ))}
      </div>
    </div>
  )
}
