'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Save, Trash2 } from 'lucide-react'

interface JournalEntry {
  id: number; date: string; content: string | null; mood: number | null
}

const MOODS = [
  { value: 1, emoji: '😞', label: '很差' },
  { value: 2, emoji: '😕', label: '不好' },
  { value: 3, emoji: '😐', label: '普通' },
  { value: 4, emoji: '😊', label: '不錯' },
  { value: 5, emoji: '😄', label: '很棒' },
]

export default function JournalPage() {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [entry, setEntry] = useState<JournalEntry | null>(null)
  const [content, setContent] = useState('')
  const [mood, setMood] = useState<number | null>(null)
  const [recentEntries, setRecentEntries] = useState<JournalEntry[]>([])
  const [saved, setSaved] = useState(false)

  const loadEntry = useCallback(async () => {
    const [entryRes, recentRes] = await Promise.all([
      fetch(`/api/journal?date=${date}`),
      fetch('/api/journal'),
    ])
    const e = await entryRes.json()
    const r = await recentRes.json()
    setEntry(e)
    setContent(e?.content || '')
    setMood(e?.mood || null)
    setRecentEntries(r)
    setSaved(false)
  }, [date])

  useEffect(() => { loadEntry() }, [loadEntry])

  const save = async () => {
    await fetch('/api/journal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, content, mood }),
    })
    setSaved(true)
    loadEntry()
    setTimeout(() => setSaved(false), 2000)
  }

  const deleteEntry = async () => {
    await fetch(`/api/journal?date=${date}`, { method: 'DELETE' })
    loadEntry()
  }

  const prevDay = () => {
    const d = new Date(date); d.setDate(d.getDate() - 1)
    setDate(d.toISOString().split('T')[0])
  }
  const nextDay = () => {
    const d = new Date(date); d.setDate(d.getDate() + 1)
    if (d.toISOString().split('T')[0] <= today) setDate(d.toISOString().split('T')[0])
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">生活日記</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-50">
              <div className="flex items-center gap-3">
                <button onClick={prevDay} className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"><ChevronLeft size={16} /></button>
                <input type="date" value={date} max={today} onChange={e => setDate(e.target.value)}
                  className="text-sm font-medium border-none outline-none bg-transparent cursor-pointer" />
                <button onClick={nextDay} disabled={date >= today}
                  className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-30"><ChevronRight size={16} /></button>
              </div>
              <div className="flex items-center gap-2">
                {entry && (
                  <button onClick={deleteEntry} className="p-1.5 text-zinc-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors">
                    <Trash2 size={16} />
                  </button>
                )}
                <button onClick={save}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    saved ? 'bg-emerald-500 text-white' : 'bg-zinc-900 text-white hover:bg-zinc-700'
                  }`}>
                  <Save size={14} />
                  {saved ? '已儲存' : '儲存'}
                </button>
              </div>
            </div>

            <div className="px-6 py-4 border-b border-zinc-50">
              <div className="text-xs text-zinc-400 mb-2">今天感覺如何？</div>
              <div className="flex gap-3">
                {MOODS.map(m => (
                  <button key={m.value} onClick={() => setMood(mood === m.value ? null : m.value)}
                    title={m.label}
                    className={`text-2xl rounded-xl p-2 transition-all ${mood === m.value ? 'bg-indigo-50 ring-2 ring-indigo-300 scale-110' : 'hover:bg-zinc-50'}`}>
                    {m.emoji}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={`${date === today ? '今天發生了什麼事？有什麼想法或感受想記錄下來？' : '這天的回憶...'}`}
              className="w-full px-6 py-5 text-sm leading-relaxed resize-none outline-none min-h-64 placeholder:text-zinc-300"
            />
          </div>
        </div>

        {/* Recent entries */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-100">
          <div className="px-5 py-4 border-b border-zinc-50">
            <h3 className="font-semibold text-sm text-zinc-500">最近日記</h3>
          </div>
          {recentEntries.length === 0 ? (
            <div className="p-8 text-center text-zinc-400 text-sm">尚無日記</div>
          ) : (
            <div className="divide-y divide-zinc-50 max-h-[600px] overflow-auto">
              {recentEntries.map(e => (
                <button key={e.date} onClick={() => setDate(e.date)}
                  className={`w-full text-left px-5 py-4 hover:bg-zinc-50 transition-colors ${date === e.date ? 'bg-indigo-50' : ''}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-zinc-700">{e.date}</span>
                    {e.mood && <span className="text-lg">{MOODS.find(m => m.value === e.mood)?.emoji}</span>}
                  </div>
                  {e.content && (
                    <p className="text-xs text-zinc-400 line-clamp-2">{e.content}</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
