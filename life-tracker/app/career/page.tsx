'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Check, ChevronDown, ChevronUp } from 'lucide-react'

interface Milestone { id: number; goal_id: number; title: string; completed: number; completed_at: string | null }
interface Goal {
  id: number; title: string; description: string | null; category: string | null
  target_date: string | null; status: 'active' | 'completed' | 'paused'
  progress: number; milestones: Milestone[]
}

const STATUS_TABS: { key: Goal['status']; label: string; color: string }[] = [
  { key: 'active', label: '進行中', color: 'text-indigo-600 border-indigo-600' },
  { key: 'completed', label: '已完成', color: 'text-emerald-600 border-emerald-600' },
  { key: 'paused', label: '暫停', color: 'text-zinc-500 border-zinc-400' },
]

const CATEGORIES = ['職涯', '學習', '健康', '財務', '人際', '興趣', '其他']

export default function CareerPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [activeTab, setActiveTab] = useState<Goal['status']>('active')
  const [expandedGoal, setExpandedGoal] = useState<number | null>(null)
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [newMilestones, setNewMilestones] = useState<Record<number, string>>({})
  const [goalForm, setGoalForm] = useState({ title: '', description: '', category: '職涯', target_date: '' })

  const load = useCallback(async () => {
    const res = await fetch('/api/career')
    setGoals(await res.json())
  }, [])

  useEffect(() => { load() }, [load])

  const createGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/career', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goalForm),
    })
    setGoalForm({ title: '', description: '', category: '職涯', target_date: '' })
    setShowGoalForm(false)
    load()
  }

  const updateProgress = async (id: number, progress: number) => {
    await fetch('/api/career', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_goal', id, data: { progress } }),
    })
    load()
  }

  const updateStatus = async (id: number, status: Goal['status']) => {
    await fetch('/api/career', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_goal', id, data: { status } }),
    })
    load()
  }

  const deleteGoal = async (id: number) => {
    await fetch(`/api/career?id=${id}`, { method: 'DELETE' })
    load()
  }

  const addMilestone = async (goalId: number) => {
    const title = newMilestones[goalId]?.trim()
    if (!title) return
    await fetch('/api/career', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_milestone', goal_id: goalId, title }),
    })
    setNewMilestones(p => ({ ...p, [goalId]: '' }))
    load()
  }

  const toggleMilestone = async (id: number, completed: boolean) => {
    await fetch('/api/career', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle_milestone', id, completed: !completed }),
    })
    load()
  }

  const deleteMilestone = async (id: number) => {
    await fetch(`/api/career?type=milestone&id=${id}`, { method: 'DELETE' })
    load()
  }

  const filtered = goals.filter(g => g.status === activeTab)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">生涯規劃</h2>
        <button onClick={() => setShowGoalForm(!showGoalForm)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
          <Plus size={16} /> 新增目標
        </button>
      </div>

      {showGoalForm && (
        <form onSubmit={createGoal} className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100 mb-6">
          <h3 className="font-semibold mb-4">新增目標</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs text-zinc-500 mb-1 block">目標名稱</label>
              <input value={goalForm.title} onChange={e => setGoalForm(p => ({ ...p, title: e.target.value }))}
                placeholder="例：取得 AWS 認證" required
                className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">類別</label>
              <select value={goalForm.category} onChange={e => setGoalForm(p => ({ ...p, category: e.target.value }))}
                className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">目標日期</label>
              <input type="date" value={goalForm.target_date} onChange={e => setGoalForm(p => ({ ...p, target_date: e.target.value }))}
                className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-zinc-500 mb-1 block">描述（可選）</label>
              <textarea value={goalForm.description} onChange={e => setGoalForm(p => ({ ...p, description: e.target.value }))}
                placeholder="為什麼這個目標對你重要？"
                rows={2}
                className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 resize-none" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">新增</button>
            <button type="button" onClick={() => setShowGoalForm(false)} className="px-6 py-2 rounded-xl text-sm border border-zinc-200 hover:bg-zinc-50 transition-colors">取消</button>
          </div>
        </form>
      )}

      {/* Status tabs */}
      <div className="flex gap-6 border-b border-zinc-200 mb-6">
        {STATUS_TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key ? tab.color : 'text-zinc-400 border-transparent hover:text-zinc-600'
            }`}>
            {tab.label}
            <span className="ml-2 text-xs bg-zinc-100 rounded-full px-2 py-0.5">
              {goals.filter(g => g.status === tab.key).length}
            </span>
          </button>
        ))}
      </div>

      {/* Goal cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-zinc-400 text-sm">
          {activeTab === 'active' ? '目前沒有進行中的目標，點右上角新增一個吧！' : '沒有此狀態的目標'}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map(goal => {
            const expanded = expandedGoal === goal.id
            const doneCount = goal.milestones.filter(m => m.completed).length
            return (
              <div key={goal.id} className="bg-white rounded-2xl shadow-sm border border-zinc-100">
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {goal.category && (
                          <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{goal.category}</span>
                        )}
                        {goal.target_date && (
                          <span className="text-xs text-zinc-400">截止：{goal.target_date}</span>
                        )}
                      </div>
                      <h3 className="font-semibold text-lg">{goal.title}</h3>
                      {goal.description && (
                        <p className="text-sm text-zinc-500 mt-1">{goal.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <select value={goal.status} onChange={e => updateStatus(goal.id, e.target.value as Goal['status'])}
                        className="text-xs border border-zinc-200 rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-400 bg-transparent">
                        <option value="active">進行中</option>
                        <option value="completed">已完成</option>
                        <option value="paused">暫停</option>
                      </select>
                      <button onClick={() => deleteGoal(goal.id)} className="text-zinc-300 hover:text-rose-500 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-zinc-400">進度</span>
                      <span className="text-xs font-medium text-indigo-600">{goal.progress}%</span>
                    </div>
                    <input type="range" min={0} max={100} value={goal.progress}
                      onChange={e => updateProgress(goal.id, parseInt(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer" />
                  </div>

                  {/* Milestones toggle */}
                  {goal.milestones.length > 0 && (
                    <button onClick={() => setExpandedGoal(expanded ? null : goal.id)}
                      className="flex items-center gap-2 mt-3 text-xs text-zinc-400 hover:text-zinc-600 transition-colors">
                      {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      里程碑 {doneCount}/{goal.milestones.length}
                    </button>
                  )}
                </div>

                {/* Milestones */}
                {expanded && (
                  <div className="border-t border-zinc-50 px-6 py-4">
                    <div className="flex flex-col gap-2 mb-3">
                      {goal.milestones.map(m => (
                        <div key={m.id} className="flex items-center justify-between group">
                          <button onClick={() => toggleMilestone(m.id, !!m.completed)}
                            className="flex items-center gap-3 text-left">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                              m.completed ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-300 hover:border-indigo-400'
                            }`}>
                              {!!m.completed && <Check size={12} className="text-white" />}
                            </div>
                            <span className={`text-sm ${m.completed ? 'line-through text-zinc-400' : ''}`}>{m.title}</span>
                          </button>
                          <button onClick={() => deleteMilestone(m.id)} className="opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-rose-500 transition-all">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input value={newMilestones[goal.id] || ''}
                        onChange={e => setNewMilestones(p => ({ ...p, [goal.id]: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && addMilestone(goal.id)}
                        placeholder="新增里程碑..."
                        className="flex-1 border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" />
                      <button onClick={() => addMilestone(goal.id)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-indigo-700 transition-colors">
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {!expanded && goal.milestones.length === 0 && (
                  <div className="border-t border-zinc-50 px-6 py-3">
                    <div className="flex gap-2">
                      <input value={newMilestones[goal.id] || ''}
                        onChange={e => setNewMilestones(p => ({ ...p, [goal.id]: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && addMilestone(goal.id)}
                        placeholder="新增里程碑..."
                        className="flex-1 border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" />
                      <button onClick={() => addMilestone(goal.id)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-indigo-700 transition-colors">
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
