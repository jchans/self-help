import { getMonthlySummary } from '@/lib/finance'
import { getDietLogs } from '@/lib/diet'
import { getExerciseLogs, getStreak } from '@/lib/exercise'
import { getJournalEntry } from '@/lib/journal'
import { getGoals } from '@/lib/career'
import Link from 'next/link'
import { Wallet, Salad, Dumbbell, BookOpen, Target, TrendingUp, TrendingDown, Flame } from 'lucide-react'

const MOOD_EMOJI: Record<number, string> = { 1: '😞', 2: '😕', 3: '😐', 4: '😊', 5: '😄' }

export default function DashboardPage() {
  const today = new Date().toISOString().split('T')[0]
  const month = today.slice(0, 7)

  const summary = getMonthlySummary(month)
  const todayDiet = getDietLogs(today)
  const recentExercise = getExerciseLogs(7)
  const todayExercise = recentExercise.filter(e => e.date === today)
  const streak = getStreak()
  const todayJournal = getJournalEntry(today)
  const goals = getGoals().filter(g => g.status === 'active').slice(0, 3)

  const twdIncome = summary.filter(r => r.type === 'income' && r.currency === 'TWD').reduce((a, b) => a + b.total, 0)
  const twdExpense = summary.filter(r => r.type === 'expense' && r.currency === 'TWD').reduce((a, b) => a + b.total, 0)
  const todayCalories = todayDiet.reduce((a, b) => a + (b.calories || 0), 0)
  const todayExerciseMin = todayExercise.reduce((a, b) => a + b.duration_minutes, 0)

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold">今日概覽</h2>
        <p className="text-zinc-500 text-sm mt-1">{today}（{['日','一','二','三','四','五','六'][new Date().getDay()]}）</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link href="/finance" className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-zinc-400 text-xs mb-3">
            <Wallet size={14} />
            本月收支（台幣）
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 text-emerald-600 font-semibold text-lg">
              <TrendingUp size={16} />
              {twdIncome.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-rose-500 font-semibold text-lg">
              <TrendingDown size={16} />
              {twdExpense.toLocaleString()}
            </div>
          </div>
        </Link>

        <Link href="/diet" className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-zinc-400 text-xs mb-3">
            <Salad size={14} />
            今日卡路里
          </div>
          <div className="text-2xl font-bold text-amber-600">{todayCalories}</div>
          <div className="text-xs text-zinc-400 mt-1">{todayDiet.length} 筆餐點</div>
        </Link>

        <Link href="/exercise" className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-zinc-400 text-xs mb-3">
            <Dumbbell size={14} />
            今日運動
          </div>
          <div className="text-2xl font-bold text-indigo-600">{todayExerciseMin} 分鐘</div>
          <div className="flex items-center gap-1 text-xs text-orange-500 mt-1">
            <Flame size={12} />
            連續 {streak} 天
          </div>
        </Link>

        <Link href="/journal" className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-zinc-400 text-xs mb-3">
            <BookOpen size={14} />
            今日心情
          </div>
          {todayJournal?.mood ? (
            <div className="text-3xl">{MOOD_EMOJI[todayJournal.mood]}</div>
          ) : (
            <div className="text-zinc-400 text-sm">尚未記錄</div>
          )}
          {todayJournal?.content && (
            <div className="text-xs text-zinc-500 mt-1 line-clamp-1">{todayJournal.content}</div>
          )}
        </Link>
      </div>

      {goals.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100">
          <div className="flex items-center gap-2 mb-4">
            <Target size={16} className="text-indigo-600" />
            <h3 className="font-semibold">進行中的目標</h3>
          </div>
          <div className="flex flex-col gap-3">
            {goals.map(goal => (
              <Link key={goal.id} href="/career" className="flex items-center gap-4 group">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium group-hover:text-indigo-600 transition-colors">{goal.title}</span>
                    <span className="text-xs text-zinc-400">{goal.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
