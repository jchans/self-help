import { getDb } from './db'

export interface DietLog {
  id: number
  date: string
  meal_time: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  food_name: string
  calories: number | null
  note: string | null
  created_at: string
}

export function getDietLogs(date?: string): DietLog[] {
  if (date) {
    return getDb().prepare('SELECT * FROM diet_logs WHERE date = ? ORDER BY meal_time, created_at').all(date) as DietLog[]
  }
  return getDb().prepare('SELECT * FROM diet_logs ORDER BY date DESC, created_at DESC').all() as DietLog[]
}

export function createDietLog(data: {
  date: string; meal_time: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  food_name: string; calories?: number; note?: string
}): DietLog {
  const db = getDb()
  const result = db.prepare(`
    INSERT INTO diet_logs (date, meal_time, food_name, calories, note)
    VALUES (?, ?, ?, ?, ?)
  `).run(data.date, data.meal_time, data.food_name, data.calories ?? null, data.note ?? null)
  return db.prepare('SELECT * FROM diet_logs WHERE id = ?').get(result.lastInsertRowid) as DietLog
}

export function deleteDietLog(id: number) {
  getDb().prepare('DELETE FROM diet_logs WHERE id = ?').run(id)
}

export function getDailyCalories(days = 7) {
  return getDb().prepare(`
    SELECT date, SUM(calories) as total_calories
    FROM diet_logs
    WHERE date >= date('now', ?)
    GROUP BY date
    ORDER BY date
  `).all(`-${days - 1} days`) as { date: string; total_calories: number }[]
}
