import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const reference = searchParams.get('reference') || ''

  if (!reference) return NextResponse.redirect(new URL('/torneios', req.url))

  try {
    const partes = reference.split('_')
    const tipo = partes[0]
    const torneio_id = partes[1]
    const participante_id = partes[2]

    if (tipo === 'criacao') {
      // Confirmar criação de torneio
      await supabase.from('tournaments').update({
        creation_payment_status: 'confirmed', status: 'open'
      }).eq('id', torneio_id)
      const { data: t } = await supabase.from('tournaments').select('slug').eq('id', torneio_id).single()
      return NextResponse.redirect(new URL(`/torneios/${t?.slug || ''}?criado=1`, req.url))
    } else {
      // Confirmar inscrição
      if (participante_id && participante_id.length > 10) {
        await supabase.from('tournament_participants').update({
          payment_status: 'confirmed', paid_at: new Date().toISOString()
        }).eq('id', participante_id)
      } else {
        // Buscar por livepix_ref
        await supabase.from('tournament_participants').update({
          payment_status: 'confirmed', paid_at: new Date().toISOString()
        }).eq('livepix_ref', reference)
      }
      const { data: t } = await supabase.from('tournaments').select('slug').eq('id', torneio_id).single()
      return NextResponse.redirect(new URL(`/torneios/${t?.slug || ''}?pago=1`, req.url))
    }
  } catch {
    return NextResponse.redirect(new URL('/torneios?erro=1', req.url))
  }
}
