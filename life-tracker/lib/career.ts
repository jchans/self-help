import { getDb } from './db'

export interface CareerGoal {
  id: number
  title: string
  description: string | null
  category: string | null
  target_date: string | null
  status: 'active' | 'completed' | 'paused'
  progress: number
  created_at: string
  milestones?: Milestone[]
}

export interface Milestone {
  id: number
  goal_id: number
  title: string
  completed: number
  completed_at: string | null
  created_at: string
}

export function getGoals(): CareerGoal[] {
  const db = getDb()
  const goals = db.prepare('SELECT * FROM career_goals ORDER BY created_at DESC').all() as CareerGoal[]
  const milestones = db.prepare('SELECT * FROM career_milestones ORDER BY created_at').all() as Milestone[]
  return goals.map(g => ({
    ...g,
    milestones: milestones.filter(m => m.goal_id === g.id)
  }))
}

export function createGoal(data: {
  title: string; description?: string; category?: string
  target_date?: string
}): CareerGoal {
  const db = getDb()
  const result = db.prepare(`
    INSERT INTO career_goals (title, description, category, target_date)
    VALUES (?, ?, ?, ?)
  `).run(data.title, data.description ?? null, data.category ?? null, data.target_date ?? null)
  return db.prepare('SELECT * FROM career_goals WHERE id = ?').get(result.lastInsertRowid) as CareerGoal
}

export function updateGoal(id: number, data: Partial<{
  title: string; description: string; category: string
  target_date: string; status: string; progress: number
}>) {
  const sets = Object.keys(data).map(k => `${k} = ?`).join(', ')
  const values = Object.values(data)
  getDb().prepare(`UPDATE career_goals SET ${sets} WHERE id = ?`).run(...values, id)
}

export function deleteGoal(id: number) {
  getDb().prepare('DELETE FROM career_goals WHERE id = ?').run(id)
}

export function createMilestone(goalId: number, title: string): Milestone {
  const db = getDb()
  const result = db.prepare('INSERT INTO career_milestones (goal_id, title) VALUES (?, ?)').run(goalId, title)
  return db.prepare('SELECT * FROM career_milestones WHERE id = ?').get(result.lastInsertRowid) as Milestone
}

export function toggleMilestone(id: number, completed: boolean) {
  getDb().prepare(`
    UPDATE career_milestones SET completed = ?, completed_at = ? WHERE id = ?
  `).run(completed ? 1 : 0, completed ? new Date().toISOString() : null, id)
}

export function deleteMilestone(id: number) {
  getDb().prepare('DELETE FROM career_milestones WHERE id = ?').run(id)
}
