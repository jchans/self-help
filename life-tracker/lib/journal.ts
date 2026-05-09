import { getDb } from './db'

export interface JournalEntry {
  id: number
  date: string
  content: string | null
  mood: number | null
  created_at: string
  updated_at: string
}

export function getJournalEntries(limit = 30): JournalEntry[] {
  return getDb().prepare('SELECT * FROM journal_entries ORDER BY date DESC LIMIT ?').all(limit) as JournalEntry[]
}

export function getJournalEntry(date: string): JournalEntry | null {
  return getDb().prepare('SELECT * FROM journal_entries WHERE date = ?').get(date) as JournalEntry | null
}

export function upsertJournalEntry(date: string, content: string, mood: number | null): JournalEntry {
  const db = getDb()
  db.prepare(`
    INSERT INTO journal_entries (date, content, mood, updated_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(date) DO UPDATE SET
      content = excluded.content,
      mood = excluded.mood,
      updated_at = CURRENT_TIMESTAMP
  `).run(date, content, mood)
  return db.prepare('SELECT * FROM journal_entries WHERE date = ?').get(date) as JournalEntry
}

export function deleteJournalEntry(date: string) {
  getDb().prepare('DELETE FROM journal_entries WHERE date = ?').run(date)
}

export function getMonthEntries(yearMonth: string): JournalEntry[] {
  return getDb().prepare(`
    SELECT * FROM journal_entries
    WHERE strftime('%Y-%m', date) = ?
    ORDER BY date
  `).all(yearMonth) as JournalEntry[]
}
