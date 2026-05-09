import { NextRequest, NextResponse } from 'next/server'
import { getTransactions, createTransaction, deleteTransaction, getAccounts, createAccount, deleteAccount, getMonthlySummary, getCategoryBreakdown, getDailyTrend } from '@/lib/finance'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const action = searchParams.get('action')

  if (action === 'accounts') return NextResponse.json(getAccounts())
  if (action === 'summary') return NextResponse.json(getMonthlySummary(searchParams.get('month') || ''))
  if (action === 'breakdown') return NextResponse.json(getCategoryBreakdown(searchParams.get('month') || ''))
  if (action === 'trend') return NextResponse.json(getDailyTrend(searchParams.get('month') || ''))

  return NextResponse.json(getTransactions({
    month: searchParams.get('month') || undefined,
    currency: searchParams.get('currency') || undefined,
    account_id: searchParams.get('account_id') ? Number(searchParams.get('account_id')) : undefined,
  }))
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (body.action === 'create_account') {
    return NextResponse.json(createAccount(body.name, body.currency))
  }
  return NextResponse.json(createTransaction(body))
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const type = searchParams.get('type')
  const id = Number(searchParams.get('id'))
  if (type === 'account') deleteAccount(id)
  else deleteTransaction(id)
  return NextResponse.json({ ok: true })
}
