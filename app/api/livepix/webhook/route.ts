import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { consultarPagamento } from '@/lib/livepix'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.json()

  // LivePix envia evento de pagamento recebido
  if (body.event === 'new' && body.resource?.type === 'payment') {
    const paymentId = body.resource.id

    // Buscar detalhes do pagamento via API
    const token_ref = body.resource.reference
    if (token_ref && token_ref.startsWith('torneio_')) {
      const partes = token_ref.split('_')
      const participante_id = partes[2]

      // Confirmar pagamento
      await supabase.from('tournament_participants')
        .update({ payment_status: 'confirmed', paid_at: new Date().toISOString() })
        .eq('id', participante_id)
    }
  }

  // Sempre retornar 200 para o LivePix não reenviar
  return NextResponse.json({ ok: true })
}
