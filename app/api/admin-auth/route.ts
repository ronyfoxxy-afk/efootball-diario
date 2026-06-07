import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { senha } = await req.json()
  const adminPass = process.env.ADMIN_PASSWORD || 'fskate2026'

  if (senha !== adminPass) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })

  // Setar cookie de autenticação (httpOnly, secure, 7 dias)
  res.cookies.set('admin_auth', adminPass, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    path: '/',
  })

  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set('admin_auth', '', { maxAge: 0, path: '/' })
  return res
}
