import { getDb } from './db'

export interface ExerciseLog {
  id: number
  date: string
  type: string
  duration_minutes: number
  calories_burned: number | null
  note: string | null
  created_at: string
}

export function getExerciseLogs(limit = 30): ExerciseLog[] {
  return getDb().prepare(`
    SELECT * FROM exercise_logs ORDER BY date DESC, created_at DESC LIMIT ?
  `).all(limit) as ExerciseLog[]
}

export function createExerciseLog(data: {
  date: string; type: string; duration_minutes: number
  calories_burned?: number; note?: string
}): ExerciseLog {
  const db = getDb()
  const result = db.prepare(`
    INSERT INTO exercise_logs (date, type, duration_minutes, calories_burned, note)
    VALUES (?, ?, ?, ?, ?)
  `).run(data.date, data.type, data.duration_minutes, data.calories_burned ?? null, data.note ?? null)
  return db.prepare('SELECT * FROM exercise_logs WHERE id = ?').get(result.lastInsertRowid) as ExerciseLog
}

export function deleteExerciseLog(id: number) {
  getDb().prepare('DELETE FROM exercise_logs WHERE id = ?').run(id)
}

export function getWeeklyStats() {
  return getDb().prepare(`
    SELECT date, SUM(duration_minutes) as total_minutes, SUM(calories_burned) as total_calories
    FROM exercise_logs
    WHERE date >= date('now', '-6 days')
    GROUP BY date
    ORDER BY date
  `).all() as { date: string; total_minutes: number; total_calories: number }[]
}

export function getStreak(): number {
  const rows = getDb().prepare(`
    SELECT DISTINCT date FROM exercise_logs ORDER BY date DESC
  `).all() as { date: string }[]

  if (rows.length === 0) return 0

  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < rows.length; i++) {
    const rowDate = new Date(rows[i].date)
    rowDate.setHours(0, 0, 0, 0)
    const expected = new Date(today)
    expected.setDate(today.getDate() - i)
    if (rowDate.getTime() === expected.getTime()) {
      streak++
    } else {
      break
    }
  }
  return streak
}
