'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Flame } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface ExerciseLog {
  id: number; date: string; type: string
  duration_minutes: number; calories_burned: number | null; note: string | null
}

const EXERCISE_TYPES = ['跑步', '走路', '騎車', '游泳', '重訓', '瑜珈', '籃球', '羽球', '跳繩', '登山', '其他']

export default function ExercisePage() {
  const today = new Date().toISOString().split('T')[0]
  const [logs, setLogs] = useState<ExerciseLog[]>([])
  const [weekly, setWeekly] = useState<{ date: string; total_minutes: number; total_calories: number }[]>([])
  const [streak, setStreak] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ date: today, type: '跑步', duration_minutes: '', calories_burned: '', note: '' })

  const load = useCallback(async () => {
    const [logsRes, weeklyRes, streakRes] = await Promise.all([
      fetch('/api/exercise'),
      fetch('/api/exercise?action=weekly'),
      fetch('/api/exercise?action=streak'),
    ])
    setLogs(await logsRes.json())
    setWeekly(await weeklyRes.json())
    const s = await streakRes.json()
    setStreak(s.streak)
  }, [])

  useEffect(() => { load() }, [load])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/exercise', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        duration_minutes: parseInt(form.duration_minutes),
        calories_burned: form.calories_burned ? parseInt(form.calories_burned) : undefined,
      }),
    })
    setForm({ date: today, type: '跑步', duration_minutes: '', calories_burned: '', note: '' })
    setShowForm(false)
    load()
  }

  const deleteLog = async (id: number) => {
    await fetch(`/api/exercise?id=${id}`, { method: 'DELETE' })
    load()
  }

  const thisWeekMinutes = weekly.reduce((a, b) => a + (b.total_minutes || 0), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">運動紀錄</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
          <Plus size={16} /> 新增運動
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-indigo-50 rounded-2xl p-5">
          <div className="text-xs text-indigo-400 mb-1">本週運動時間</div>
          <div className="text-2xl font-bold text-indigo-700">{thisWeekMinutes} 分鐘</div>
        </div>
        <div className="bg-orange-50 rounded-2xl p-5">
          <div className="text-xs text-orange-400 mb-1 flex items-center gap-1"><Flame size={12} /> 連續打卡</div>
          <div className="text-2xl font-bold text-orange-600">{streak} 天</div>
        </div>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100 mb-6">
          <h3 className="font-semibold mb-4">新增運動記錄</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">日期</label>
              <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                required className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">運動類型</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400">
                {EXERCISE_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">時間（分鐘）</label>
              <input type="number" value={form.duration_minutes} onChange={e => setForm(p => ({ ...p, duration_minutes: e.target.value }))}
                placeholder="30" required
                className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">消耗熱量 (kcal)</label>
              <input type="number" value={form.calories_burned} onChange={e => setForm(p => ({ ...p, calories_burned: e.target.value }))}
                placeholder="可選填"
                className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-zinc-500 mb-1 block">備註</label>
              <input value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                placeholder="可選填"
                className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">儲存</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 rounded-xl text-sm border border-zinc-200 hover:bg-zinc-50 transition-colors">取消</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100">
          <h3 className="font-semibold text-sm text-zinc-500 mb-4">近 7 天運動時間</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weekly}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`${v} 分鐘`, '運動']} />
              <Bar dataKey="total_minutes" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-zinc-100">
          <div className="p-6 border-b border-zinc-50">
            <h3 className="font-semibold text-sm text-zinc-500">最近紀錄</h3>
          </div>
          {logs.length === 0 ? (
            <div className="p-12 text-center text-zinc-400 text-sm">尚無運動記錄</div>
          ) : (
            <div className="divide-y divide-zinc-50 max-h-72 overflow-auto">
              {logs.map(log => (
                <div key={log.id} className="flex items-center justify-between px-6 py-3 hover:bg-zinc-50 group">
                  <div>
                    <div className="text-sm font-medium">{log.type}</div>
                    <div className="text-xs text-zinc-400">{log.date} {log.note ? `· ${log.note}` : ''}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-medium text-indigo-600">{log.duration_minutes} 分鐘</div>
                      {log.calories_burned && <div className="text-xs text-zinc-400">{log.calories_burned} kcal</div>}
                    </div>
                    <button onClick={() => deleteLog(log.id)} className="opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-rose-500 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
