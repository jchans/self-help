import { NextRequest, NextResponse } from 'next/server'
import { getExerciseLogs, createExerciseLog, deleteExerciseLog, getWeeklyStats, getStreak } from '@/lib/exercise'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const action = searchParams.get('action')
  if (action === 'weekly') return NextResponse.json(getWeeklyStats())
  if (action === 'streak') return NextResponse.json({ streak: getStreak() })
  return NextResponse.json(getExerciseLogs())
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  return NextResponse.json(createExerciseLog(body))
}

export async function DELETE(req: NextRequest) {
  const id = Number(req.nextUrl.searchParams.get('id'))
  deleteExerciseLog(id)
  return NextResponse.json({ ok: true })
}
