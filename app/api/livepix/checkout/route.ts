import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { criarPagamentoLivePix } from '@/lib/livepix'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  const { participante_id, torneio_id, valor, nome } = await req.json()

  if (!participante_id || !torneio_id || !valor) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  try {
    // Referência única para rastrear o pagamento
    const reference = `torneio_${torneio_id}_${participante_id}_${Date.now()}`

    const { checkoutUrl } = await criarPagamentoLivePix(valor, reference)

    // Salvar referência no participante para confirmar depois
    await supabase.from('tournament_participants')
      .update({ notes: (await supabase.from('tournament_participants').select('notes').eq('id', participante_id).single()).data?.notes + `|livepix_ref:${reference}` })
      .eq('id', participante_id)

    return NextResponse.json({ checkoutUrl })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
