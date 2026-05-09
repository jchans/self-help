import { NextRequest, NextResponse } from 'next/server'
import { getGoals, createGoal, updateGoal, deleteGoal, createMilestone, toggleMilestone, deleteMilestone } from '@/lib/career'

export async function GET() {
  return NextResponse.json(getGoals())
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (body.action === 'create_milestone') {
    return NextResponse.json(createMilestone(body.goal_id, body.title))
  }
  if (body.action === 'toggle_milestone') {
    toggleMilestone(body.id, body.completed)
    return NextResponse.json({ ok: true })
  }
  if (body.action === 'update_goal') {
    updateGoal(body.id, body.data)
    return NextResponse.json({ ok: true })
  }
  return NextResponse.json(createGoal(body))
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const type = searchParams.get('type')
  const id = Number(searchParams.get('id'))
  if (type === 'milestone') deleteMilestone(id)
  else deleteGoal(id)
  return NextResponse.json({ ok: true })
}
