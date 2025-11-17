import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Mic, Activity, PlayCircle, Sparkles, Plus, X, Loader2, Calendar, ListChecks, Languages, Dog as DogIcon, BookOpen } from 'lucide-react'

const t = {
  en: {
    title: 'AI Dog Training',
    subtitle: 'Personalized plans, real‑time feedback, visible progress',
    newTask: 'New Task',
    createPlan: 'Create Plan',
    steps: 'Steps',
    complete: 'Complete',
    completed: 'Completed',
    analytics: 'Analytics',
    successRate: 'Success rate',
    tasks: 'Tasks',
    live: 'Live Coach',
    dogs: 'Dogs',
    exercises: 'Exercises',
    cancel: 'Cancel',
    save: 'Save',
    titleLabel: 'Title',
    stepsLabel: 'Steps (one per line)',
    dogLabel: 'Dog (optional)',
    exerciseLabel: 'Exercise (optional)',
    scheduleLabel: 'Schedule (optional)',
    languageLabel: 'Language',
    emptyTasks: 'No tasks yet. Create your first focused session.',
    toastSaved: 'Task saved successfully',
    toastCompleted: 'Nice! Task marked completed',
    loading: 'Loading…',
    error: 'Something went wrong. Please try again.'
  },
  he: {
    title: 'אימון כלבים עם AI',
    subtitle: 'תכנית מותאמת אישית, משוב בזמן אמת, התקדמות נראית',
    newTask: 'משימה חדשה',
    createPlan: 'צור תכנית',
    steps: 'צעדים',
    complete: 'סיום',
    completed: 'הושלם',
    analytics: 'אנליטיקה',
    successRate: 'שיעור הצלחה',
    tasks: 'משימות',
    live: 'מאמן חי',
    dogs: 'כלבים',
    exercises: 'תרגילים',
    cancel: 'ביטול',
    save: 'שמירה',
    titleLabel: 'כותרת',
    stepsLabel: 'צעדים (שורה לכל צעד)',
    dogLabel: 'כלב (רשות)',
    exerciseLabel: 'תרגיל (רשות)',
    scheduleLabel: 'תזמון (רשות)',
    languageLabel: 'שפה',
    emptyTasks: 'אין משימות עדיין. צור את הסשן הממוקד הראשון שלך.',
    toastSaved: 'המשימה נשמרה בהצלחה',
    toastCompleted: 'יפה! המשימה סומנה כהושלמה',
    loading: 'טוען…',
    error: 'אירעה שגיאה. נסה שוב.'
  }
}

const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function Dashboard() {
  const [lang, setLang] = useState('en')
  const i18n = useMemo(() => t[lang], [lang])

  const [tasks, setTasks] = useState([])
  const [dogs, setDogs] = useState([])
  const [exercises, setExercises] = useState([])
  const [summary, setSummary] = useState({ total_tasks: 0, completed_tasks: 0, success_rate: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', steps: '', dog_id: '', exercise_id: '', scheduled_for: '', language: 'en' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const [tasksRes, summaryRes, dogsRes, exRes] = await Promise.all([
          fetch(`${baseUrl}/tasks`).then(r => r.json()),
          fetch(`${baseUrl}/analytics/summary`).then(r => r.json()),
          fetch(`${baseUrl}/dogs`).then(r => r.json()).catch(() => ({ items: [] })),
          fetch(`${baseUrl}/exercises`).then(r => r.json()).catch(() => ({ items: [] })),
        ])
        setTasks(tasksRes.items || [])
        setSummary(summaryRes || {})
        setDogs(dogsRes.items || [])
        setExercises(exRes.items || [])
      } catch (e) {
        setError(i18n.error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!toast) return
    const tmr = setTimeout(() => setToast(''), 2200)
    return () => clearTimeout(tmr)
  }, [toast])

  const openModal = () => {
    setForm({ title: '', steps: '', dog_id: '', exercise_id: '', scheduled_for: '', language: lang })
    setShowModal(true)
  }

  const saveTask = async () => {
    try {
      setSaving(true)
      const body = {
        title: form.title.trim(),
        steps: form.steps.split('\n').map(s => s.trim()).filter(Boolean),
        dog_id: form.dog_id || undefined,
        exercise_id: form.exercise_id || undefined,
        scheduled_for: form.scheduled_for ? new Date(form.scheduled_for).toISOString() : undefined,
        language: form.language || 'en',
      }
      const res = await fetch(`${baseUrl}/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) throw new Error('save failed')
      const { id } = await res.json()
      setShowModal(false)
      setToast(i18n.toastSaved)
      // refresh tasks & summary quickly
      const [tasksRes, summaryRes] = await Promise.all([
        fetch(`${baseUrl}/tasks`).then(r => r.json()),
        fetch(`${baseUrl}/analytics/summary`).then(r => r.json()),
      ])
      setTasks(tasksRes.items || [])
      setSummary(summaryRes || {})
    } catch (e) {
      setError(i18n.error)
    } finally {
      setSaving(false)
    }
  }

  const completeTask = async (taskId) => {
    try {
      const res = await fetch(`${baseUrl}/tasks/${taskId}/complete`, { method: 'POST' })
      if (!res.ok) throw new Error('complete failed')
      setTasks(prev => prev.map(t => (t._id === taskId ? { ...t, status: 'completed' } : t)))
      setToast(i18n.toastCompleted)
      const summaryRes = await fetch(`${baseUrl}/analytics/summary`).then(r => r.json())
      setSummary(summaryRes || {})
    } catch (e) {
      setError(i18n.error)
    }
  }

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
            <button onClick={openModal} className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 font-semibold rounded-md px-4 py-2 text-sm shadow-lg shadow-amber-600/20">
              <Plus size={16} /> {i18n.newTask}
            </button>
          </div>
        </header>

        {error && (
          <div className="mt-6 bg-red-500/10 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <main className="grid lg:grid-cols-3 gap-6 mt-10">
          <section className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold tracking-tight flex items-center gap-2"><ListChecks size={18} /> {i18n.tasks}</h2>
              <div className="text-xs text-slate-300">{tasks.length} {i18n.tasks.toLowerCase()}</div>
            </div>
            <div className="space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
                  ))}
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-sm text-slate-400">{i18n.emptyTasks}</div>
              ) : (
                tasks.map((task, idx) => (
                  <motion.div key={task._id || idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {task.status === 'completed' ? <CheckCircle2 className="text-emerald-300" size={18} /> : null}
                        <span>{task.title}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{i18n.steps}: {task.steps?.length || 0}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => completeTask(task._id)} disabled={task.status === 'completed'}
                        className="inline-flex items-center gap-1 text-emerald-300 text-sm disabled:opacity-50">
                        <CheckCircle2 size={16} /> {task.status === 'completed' ? i18n.completed : i18n.complete}
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="font-semibold tracking-tight mb-4 flex items-center gap-2"><Activity size={18} /> {i18n.analytics}</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>{i18n.tasks}</span>
                <span className="text-sky-200">{summary.total_tasks ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{i18n.completed}</span>
                <span className="text-teal-200">{summary.completed_tasks ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{i18n.successRate}</span>
                <span className="text-amber-200">{summary.success_rate === null || summary.success_rate === undefined ? '—' : `${Math.round(summary.success_rate * 100)}%`}</span>
              </div>
            </div>

            <div className="mt-6 border-t border-white/10 pt-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Mic size={16} /> {i18n.live}</h3>
              <LiveCoachStub />
            </div>

            <div className="mt-6 border-t border-white/10 pt-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><DogIcon size={16} /> {i18n.dogs}</h3>
              <div className="flex flex-wrap gap-2 text-xs">
                {dogs.length === 0 ? (
                  <span className="text-slate-400">—</span>
                ) : (
                  dogs.map((d) => (
                    <span key={d._id} className="px-2 py-1 rounded bg-white/10 border border-white/10">{d.name}</span>
                  ))
                )}
              </div>
            </div>

            <div className="mt-6 border-t border-white/10 pt-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><BookOpen size={16} /> {i18n.exercises}</h3>
              <div className="flex flex-wrap gap-2 text-xs">
                {exercises.length === 0 ? (
                  <span className="text-slate-400">—</span>
                ) : (
                  exercises.map((e) => (
                    <span key={e._id} className="px-2 py-1 rounded bg-white/10 border border-white/10">{e.title}</span>
                  ))
                )}
              </div>
            </div>
          </section>
        </main>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm grid place-items-center p-4 z-50">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2"><Plus size={16} /> {i18n.newTask}</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-200"><X size={18} /></button>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <label className="block mb-1 text-slate-300">{i18n.titleLabel}</label>
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2" placeholder="Loose leash walk on sidewalk" />
                </div>

                <div>
                  <label className="block mb-1 text-slate-300">{i18n.stepsLabel}</label>
                  <textarea value={form.steps} onChange={e => setForm({ ...form, steps: e.target.value })} rows={4} className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2" placeholder={`Mark check-in\nReward heel\nRelease cue`} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-slate-300">{i18n.dogLabel}</label>
                    <select value={form.dog_id} onChange={e => setForm({ ...form, dog_id: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2">
                      <option value="">—</option>
                      {dogs.map(d => (<option value={d._id} key={d._id}>{d.name}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-slate-300">{i18n.exerciseLabel}</label>
                    <select value={form.exercise_id} onChange={e => setForm({ ...form, exercise_id: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2">
                      <option value="">—</option>
                      {exercises.map(ex => (<option value={ex._id} key={ex._id}>{ex.title}</option>))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-slate-300 flex items-center gap-2"><Calendar size={14} /> {i18n.scheduleLabel}</label>
                    <input type="datetime-local" value={form.scheduled_for} onChange={e => setForm({ ...form, scheduled_for: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2" />
                  </div>
                  <div>
                    <label className="block mb-1 text-slate-300 flex items-center gap-2"><Languages size={14} /> {i18n.languageLabel}</label>
                    <select value={form.language} onChange={e => setForm({ ...form, language: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2">
                      <option value="en">English</option>
                      <option value="he">עברית</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm bg-white/5 border border-white/10 rounded-md">{i18n.cancel}</button>
                <button onClick={saveTask} disabled={saving || !form.title.trim()} className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-gradient-to-r from-sky-500 to-teal-500 text-slate-900 font-semibold disabled:opacity-50">
                  {saving ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                  {i18n.save}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 text-slate-100 px-4 py-2 rounded-lg shadow-lg">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
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
    if (wsRef) wsRef.send('mark: engagement +1, reward, release')
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
