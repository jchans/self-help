'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

interface Transaction {
  id: number; date: string; type: 'income' | 'expense'
  category: string; amount: number; currency: string
  account_id: number | null; account_name?: string; note: string | null
}
interface Account { id: number; name: string; currency: string }

const EXPENSE_CATEGORIES = ['餐飲', '交通', '購物', '娛樂', '醫療', '房租', '水電', '通訊', '旅遊', '教育', '其他']
const INCOME_CATEGORIES = ['薪資', '獎金', '投資收益', '美股收益', '兼職', '其他收入']
const CURRENCIES = ['TWD', 'USD', 'JPY', 'EUR']
const PIE_COLORS = ['#6366f1','#f59e0b','#10b981','#ef4444','#8b5cf6','#ec4899','#14b8a6','#f97316','#64748b']

export default function FinancePage() {
  const today = new Date().toISOString().split('T')[0]
  const [month, setMonth] = useState(today.slice(0, 7))
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [summary, setSummary] = useState<{ type: string; currency: string; total: number }[]>([])
  const [breakdown, setBreakdown] = useState<{ category: string; currency: string; total: number }[]>([])
  const [showForm, setShowForm] = useState(false)
  const [showAccountForm, setShowAccountForm] = useState(false)
  const [form, setForm] = useState({
    date: today, type: 'expense' as 'income' | 'expense',
    category: '餐飲', amount: '', currency: 'TWD', account_id: '', note: ''
  })
  const [newAccount, setNewAccount] = useState({ name: '', currency: 'TWD' })

  const load = useCallback(async () => {
    const [txRes, acRes, sumRes, bkRes] = await Promise.all([
      fetch(`/api/finance?month=${month}`),
      fetch('/api/finance?action=accounts'),
      fetch(`/api/finance?action=summary&month=${month}`),
      fetch(`/api/finance?action=breakdown&month=${month}`),
    ])
    setTransactions(await txRes.json())
    setAccounts(await acRes.json())
    setSummary(await sumRes.json())
    setBreakdown(await bkRes.json())
  }, [month])

  useEffect(() => { load() }, [load])

  const prevMonth = () => {
    const d = new Date(month + '-01'); d.setMonth(d.getMonth() - 1)
    setMonth(d.toISOString().slice(0, 7))
  }
  const nextMonth = () => {
    const d = new Date(month + '-01'); d.setMonth(d.getMonth() + 1)
    setMonth(d.toISOString().slice(0, 7))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/finance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount), account_id: form.account_id ? parseInt(form.account_id) : undefined }),
    })
    setForm({ date: today, type: 'expense', category: '餐飲', amount: '', currency: 'TWD', account_id: '', note: '' })
    setShowForm(false)
    load()
  }

  const addAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/finance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_account', ...newAccount }),
    })
    setNewAccount({ name: '', currency: 'TWD' })
    setShowAccountForm(false)
    load()
  }

  const deleteItem = async (id: number) => {
    await fetch(`/api/finance?id=${id}`, { method: 'DELETE' })
    load()
  }

  const twdIncome = summary.filter(r => r.type === 'income' && r.currency === 'TWD').reduce((a, b) => a + b.total, 0)
  const twdExpense = summary.filter(r => r.type === 'expense' && r.currency === 'TWD').reduce((a, b) => a + b.total, 0)
  const usdIncome = summary.filter(r => r.type === 'income' && r.currency === 'USD').reduce((a, b) => a + b.total, 0)
  const usdExpense = summary.filter(r => r.type === 'expense' && r.currency === 'USD').reduce((a, b) => a + b.total, 0)

  const pieData = breakdown.filter(b => b.currency === 'TWD').map(b => ({ name: b.category, value: b.total }))

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">財務收支</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
          <Plus size={16} /> 新增記錄
        </button>
      </div>

      {/* Month selector */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-zinc-200 transition-colors"><ChevronLeft size={18} /></button>
        <span className="font-semibold text-lg">{month}</span>
        <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-zinc-200 transition-colors"><ChevronRight size={18} /></button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={submit} className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100 mb-6">
          <h3 className="font-semibold mb-4">新增收支記錄</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">日期</label>
              <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" required />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">類型</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as 'income' | 'expense', category: e.target.value === 'income' ? '薪資' : '餐飲' }))}
                className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400">
                <option value="expense">支出</option>
                <option value="income">收入</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">類別</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400">
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">金額</label>
              <input type="number" step="0.01" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                placeholder="0" required
                className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">幣別</label>
              <select value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}
                className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400">
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">帳戶</label>
              <select value={form.account_id} onChange={e => setForm(p => ({ ...p, account_id: e.target.value }))}
                className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400">
                <option value="">不指定</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>)}
              </select>
            </div>
            <div className="col-span-2 md:col-span-3">
              <label className="text-xs text-zinc-500 mb-1 block">備註</label>
              <input value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                placeholder="可留空"
                className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">儲存</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 rounded-xl text-sm border border-zinc-200 hover:bg-zinc-50 transition-colors">取消</button>
          </div>
        </form>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-emerald-50 rounded-2xl p-4">
          <div className="text-xs text-emerald-600 mb-1 flex items-center gap-1"><TrendingUp size={12} /> 台幣收入</div>
          <div className="font-bold text-xl text-emerald-700">NT$ {twdIncome.toLocaleString()}</div>
        </div>
        <div className="bg-rose-50 rounded-2xl p-4">
          <div className="text-xs text-rose-500 mb-1 flex items-center gap-1"><TrendingDown size={12} /> 台幣支出</div>
          <div className="font-bold text-xl text-rose-600">NT$ {twdExpense.toLocaleString()}</div>
        </div>
        <div className="bg-blue-50 rounded-2xl p-4">
          <div className="text-xs text-blue-500 mb-1 flex items-center gap-1"><TrendingUp size={12} /> 美金收入</div>
          <div className="font-bold text-xl text-blue-600">$ {usdIncome.toLocaleString()}</div>
        </div>
        <div className="bg-orange-50 rounded-2xl p-4">
          <div className="text-xs text-orange-500 mb-1 flex items-center gap-1"><TrendingDown size={12} /> 美金支出</div>
          <div className="font-bold text-xl text-orange-600">$ {usdExpense.toLocaleString()}</div>
        </div>
      </div>

      {/* Charts */}
      {pieData.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100 mb-6">
          <h3 className="font-semibold mb-4 text-sm text-zinc-500">台幣支出分布</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => [`NT$ ${Number(v).toLocaleString()}`, '']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Accounts */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm text-zinc-500">帳戶</h3>
          <button onClick={() => setShowAccountForm(!showAccountForm)} className="text-xs text-indigo-600 hover:underline">+ 新增帳戶</button>
        </div>
        {showAccountForm && (
          <form onSubmit={addAccount} className="flex gap-3 mb-4">
            <input value={newAccount.name} onChange={e => setNewAccount(p => ({ ...p, name: e.target.value }))}
              placeholder="帳戶名稱" required
              className="border border-zinc-200 rounded-xl px-3 py-2 text-sm flex-1 focus:outline-none focus:border-indigo-400" />
            <select value={newAccount.currency} onChange={e => setNewAccount(p => ({ ...p, currency: e.target.value }))}
              className="border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400">
              {CURRENCIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm">新增</button>
          </form>
        )}
        <div className="flex flex-wrap gap-2">
          {accounts.map(a => (
            <div key={a.id} className="flex items-center gap-2 bg-zinc-50 rounded-xl px-3 py-2 text-sm">
              <span>{a.name}</span>
              <span className="text-zinc-400 text-xs">{a.currency}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions list */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100">
        <div className="p-6 border-b border-zinc-50">
          <h3 className="font-semibold text-sm text-zinc-500">交易記錄</h3>
        </div>
        {transactions.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 text-sm">本月尚無記錄</div>
        ) : (
          <div className="divide-y divide-zinc-50">
            {transactions.map(t => (
              <div key={t.id} className="flex items-center justify-between px-6 py-4 hover:bg-zinc-50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${t.type === 'income' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                  <div>
                    <div className="text-sm font-medium">{t.category}</div>
                    <div className="text-xs text-zinc-400">{t.date} {t.account_name ? `· ${t.account_name}` : ''} {t.note ? `· ${t.note}` : ''}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-semibold ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {t.type === 'income' ? '+' : '-'}{t.currency === 'TWD' ? 'NT$' : '$'} {t.amount.toLocaleString()}
                    {t.currency !== 'TWD' && <span className="text-xs ml-1 text-zinc-400">{t.currency}</span>}
                  </span>
                  <button onClick={() => deleteItem(t.id)} className="opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-rose-500 transition-all">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
