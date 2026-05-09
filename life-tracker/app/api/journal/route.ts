import { NextRequest, NextResponse } from 'next/server'
import { getJournalEntries, getJournalEntry, upsertJournalEntry, deleteJournalEntry, getMonthEntries } from '@/lib/journal'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const date = searchParams.get('date')
  const month = searchParams.get('month')
  if (date) return NextResponse.json(getJournalEntry(date) ?? null)
  if (month) return NextResponse.json(getMonthEntries(month))
  return NextResponse.json(getJournalEntries())
}

export async function POST(req: NextRequest) {
  const { date, content, mood } = await req.json()
  return NextResponse.json(upsertJournalEntry(date, content, mood))
}

export async function DELETE(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date') || ''
  deleteJournalEntry(date)
  return NextResponse.json({ ok: true })
}
