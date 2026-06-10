import { NextRequest, NextResponse } from 'next/server'
import { gerarCalendarioTemporada } from '@/lib/liga-sorteio'

/**
 * Gera o calendário (rodadas + confrontos) de uma temporada da Liga eFootball.
 * Disparado automaticamente quando a 20ª inscrição confirmada acontece
 * (via /api/liga/inscrever), mas também pode ser chamado manualmente pelo admin.
 */
export async function POST(req: NextRequest) {
  const cookie = req.cookies.get('admin_auth')?.value
  const adminPass = process.env.ADMIN_PASSWORD || '@Miudinho123'
  if (cookie !== adminPass) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { season_id } = await req.json()
  if (!season_id) {
    return NextResponse.json({ error: 'season_id é obrigatório' }, { status: 400 })
  }

  try {
    const resultado = await gerarCalendarioTemporada(season_id)
    return NextResponse.json({ ok: true, ...resultado })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
