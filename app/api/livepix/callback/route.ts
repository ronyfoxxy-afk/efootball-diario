import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { consultarPagamento } from '@/lib/livepix'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const reference = searchParams.get('reference')

  if (!reference) return NextResponse.redirect(new URL('/torneios', req.url))

  try {
    // Confirmar pagamento na LivePix
    const pagamento = await consultarPagamento(reference)

    if (pagamento) {
      // Extrair torneio_id e participante_id da referência
      const partes = reference.split('_')
      const torneio_id = partes[1]
      const participante_id = partes[2]

      // Confirmar inscrição no Supabase
      await supabase.from('tournament_participants')
        .update({ payment_status: 'confirmed', paid_at: new Date().toISOString() })
        .eq('id', participante_id)

      // Redirecionar para página de sucesso do torneio
      const { data: torneio } = await supabase.from('tournaments').select('slug').eq('id', torneio_id).single()
      const slug = torneio?.slug || ''

      return NextResponse.redirect(new URL(`/torneios/${slug}/inscrito?pago=1`, req.url))
    }

    return NextResponse.redirect(new URL('/torneios?erro=pagamento', req.url))
  } catch (e) {
    return NextResponse.redirect(new URL('/torneios?erro=1', req.url))
  }
}
