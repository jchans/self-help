import { NextRequest, NextResponse } from 'next/server'
import { getDietLogs, createDietLog, deleteDietLog, getDailyCalories } from '@/lib/diet'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  if (searchParams.get('action') === 'weekly') {
    return NextResponse.json(getDailyCalories(7))
  }
  return NextResponse.json(getDietLogs(searchParams.get('date') || undefined))
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  return NextResponse.json(createDietLog(body))
}

export async function DELETE(req: NextRequest) {
  const id = Number(req.nextUrl.searchParams.get('id'))
  deleteDietLog(id)
  return NextResponse.json({ ok: true })
}
