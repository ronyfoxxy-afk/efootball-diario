import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { criarPagamentoLivePix } from '@/lib/livepix'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { tipo, participante_id, torneio_id, valor, nome } = body

  if (!valor) return NextResponse.json({ error: 'Valor obrigatório' }, { status: 400 })

  try {
    const reference = `${tipo || 'inscricao'}_${torneio_id}_${participante_id || Date.now()}_${Date.now()}`
    const { checkoutUrl } = await criarPagamentoLivePix(valor, reference)

    // Salvar referência no participante ou torneio
    if (tipo === 'criacao_torneio' && torneio_id) {
      await supabase.from('tournaments').update({ creation_payment_ref: reference, livepix_checkout_url: checkoutUrl }).eq('id', torneio_id)
    } else if (participante_id) {
      const { data: p } = await supabase.from('tournament_participants').select('notes').eq('id', participante_id).single()
      const notesAtual = p?.notes || ''
      await supabase.from('tournament_participants').update({ notes: notesAtual + `|livepix_ref:${reference}`, livepix_ref: reference }).eq('id', participante_id)
    }

    return NextResponse.json({ checkoutUrl, reference })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
