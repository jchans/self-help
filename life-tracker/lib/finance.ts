import { getDb } from './db'

export interface Transaction {
  id: number
  date: string
  type: 'income' | 'expense'
  category: string
  amount: number
  currency: string
  account_id: number | null
  account_name?: string
  note: string | null
  created_at: string
}

export interface Account {
  id: number
  name: string
  currency: string
  created_at: string
}

export function getAccounts(): Account[] {
  return getDb().prepare('SELECT * FROM finance_accounts ORDER BY id').all() as Account[]
}

export function createAccount(name: string, currency: string): Account {
  const db = getDb()
  const result = db.prepare('INSERT INTO finance_accounts (name, currency) VALUES (?, ?)').run(name, currency)
  return db.prepare('SELECT * FROM finance_accounts WHERE id = ?').get(result.lastInsertRowid) as Account
}

export function deleteAccount(id: number) {
  getDb().prepare('DELETE FROM finance_accounts WHERE id = ?').run(id)
}

export function getTransactions(params: { month?: string; currency?: string; account_id?: number } = {}): Transaction[] {
  let sql = `
    SELECT t.*, a.name as account_name
    FROM finance_transactions t
    LEFT JOIN finance_accounts a ON t.account_id = a.id
    WHERE 1=1
  `
  const args: (string | number)[] = []
  if (params.month) { sql += ' AND strftime(\'%Y-%m\', t.date) = ?'; args.push(params.month) }
  if (params.currency) { sql += ' AND t.currency = ?'; args.push(params.currency) }
  if (params.account_id) { sql += ' AND t.account_id = ?'; args.push(params.account_id) }
  sql += ' ORDER BY t.date DESC, t.created_at DESC'
  return getDb().prepare(sql).all(...args) as Transaction[]
}

export function createTransaction(data: {
  date: string; type: 'income' | 'expense'; category: string
  amount: number; currency: string; account_id?: number; note?: string
}): Transaction {
  const db = getDb()
  const result = db.prepare(`
    INSERT INTO finance_transactions (date, type, category, amount, currency, account_id, note)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(data.date, data.type, data.category, data.amount, data.currency, data.account_id ?? null, data.note ?? null)
  return db.prepare('SELECT * FROM finance_transactions WHERE id = ?').get(result.lastInsertRowid) as Transaction
}

export function deleteTransaction(id: number) {
  getDb().prepare('DELETE FROM finance_transactions WHERE id = ?').run(id)
}

export function getMonthlySummary(month: string) {
  const db = getDb()
  const rows = db.prepare(`
    SELECT type, currency, SUM(amount) as total
    FROM finance_transactions
    WHERE strftime('%Y-%m', date) = ?
    GROUP BY type, currency
  `).all(month) as { type: string; currency: string; total: number }[]
  return rows
}

export function getCategoryBreakdown(month: string) {
  return getDb().prepare(`
    SELECT category, currency, SUM(amount) as total
    FROM finance_transactions
    WHERE type = 'expense' AND strftime('%Y-%m', date) = ?
    GROUP BY category, currency
    ORDER BY total DESC
  `).all(month) as { category: string; currency: string; total: number }[]
}

export function getDailyTrend(month: string) {
  return getDb().prepare(`
    SELECT date, type, currency, SUM(amount) as total
    FROM finance_transactions
    WHERE strftime('%Y-%m', date) = ?
    GROUP BY date, type, currency
    ORDER BY date
  `).all(month) as { date: string; type: string; currency: string; total: number }[]
}
