'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface DietLog {
  id: number; date: string; meal_time: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  food_name: string; calories: number | null; note: string | null
}

const MEAL_LABELS: Record<string, string> = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snack: '點心' }
const MEAL_ORDER = ['breakfast', 'lunch', 'dinner', 'snack']
const MEAL_COLORS: Record<string, string> = { breakfast: 'bg-amber-50 border-amber-200', lunch: 'bg-green-50 border-green-200', dinner: 'bg-blue-50 border-blue-200', snack: 'bg-purple-50 border-purple-200' }

export default function DietPage() {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [logs, setLogs] = useState<DietLog[]>([])
  const [weekly, setWeekly] = useState<{ date: string; total_calories: number }[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ meal_time: 'breakfast' as const, food_name: '', calories: '', note: '' })

  const load = useCallback(async () => {
    const [logsRes, weeklyRes] = await Promise.all([
      fetch(`/api/diet?date=${date}`),
      fetch('/api/diet?action=weekly'),
    ])
    setLogs(await logsRes.json())
    setWeekly(await weeklyRes.json())
  }, [date])

  useEffect(() => { load() }, [load])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/diet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, date, calories: form.calories ? parseInt(form.calories) : undefined }),
    })
    setForm({ meal_time: 'breakfast', food_name: '', calories: '', note: '' })
    setShowForm(false)
    load()
  }

  const deleteLog = async (id: number) => {
    await fetch(`/api/diet?id=${id}`, { method: 'DELETE' })
    load()
  }

  const totalCalories = logs.reduce((a, b) => a + (b.calories || 0), 0)
  const grouped = MEAL_ORDER.reduce((acc, meal) => {
    acc[meal] = logs.filter(l => l.meal_time === meal)
    return acc
  }, {} as Record<string, DietLog[]>)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">飲食紀錄</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-amber-600 transition-colors">
          <Plus size={16} /> 新增餐點
        </button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400" />
        <div className="text-2xl font-bold text-amber-600">{totalCalories} kcal</div>
        <div className="text-sm text-zinc-400">今日攝取</div>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100 mb-6">
          <h3 className="font-semibold mb-4">新增餐點</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">餐別</label>
              <select value={form.meal_time} onChange={e => setForm(p => ({ ...p, meal_time: e.target.value as typeof form.meal_time }))}
                className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400">
                {MEAL_ORDER.map(m => <option key={m} value={m}>{MEAL_LABELS[m]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">食物名稱</label>
              <input value={form.food_name} onChange={e => setForm(p => ({ ...p, food_name: e.target.value }))}
                placeholder="例：雞排便當" required
                className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400" />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">卡路里 (kcal)</label>
              <input type="number" value={form.calories} onChange={e => setForm(p => ({ ...p, calories: e.target.value }))}
                placeholder="可選填"
                className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400" />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">備註</label>
              <input value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                placeholder="可選填"
                className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" className="bg-amber-500 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-amber-600 transition-colors">儲存</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 rounded-xl text-sm border border-zinc-200 hover:bg-zinc-50 transition-colors">取消</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          {MEAL_ORDER.map(meal => (
            <div key={meal} className={`rounded-2xl border p-4 ${MEAL_COLORS[meal]}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">{MEAL_LABELS[meal]}</h3>
                <span className="text-xs text-zinc-500">
                  {grouped[meal].reduce((a, b) => a + (b.calories || 0), 0)} kcal
                </span>
              </div>
              {grouped[meal].length === 0 ? (
                <div className="text-xs text-zinc-400">尚無記錄</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {grouped[meal].map(log => (
                    <div key={log.id} className="flex items-center justify-between group">
                      <div>
                        <span className="text-sm">{log.food_name}</span>
                        {log.note && <span className="text-xs text-zinc-400 ml-2">{log.note}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        {log.calories && <span className="text-xs font-medium text-zinc-600">{log.calories} kcal</span>}
                        <button onClick={() => deleteLog(log.id)} className="opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-rose-500 transition-all">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100 h-fit">
          <h3 className="font-semibold text-sm text-zinc-500 mb-4">近 7 天卡路里</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weekly}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`${v} kcal`, '卡路里']} labelFormatter={l => l} />
              <Bar dataKey="total_calories" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
