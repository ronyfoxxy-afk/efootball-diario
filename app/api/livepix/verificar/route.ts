import { NextRequest, NextResponse } from 'next/server'
import { consultarPagamento } from '@/lib/livepix'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get('reference') || ''
  if (!reference) return NextResponse.json({ error: 'reference obrigatório' }, { status: 400 })

  try {
    // 1. Tentar buscar direto no Supabase primeiro
    const { data: t } = await supabase
      .from('tournaments')
      .select('creation_payment_status, status')
      .eq('id', reference)
      .single()

    if (t?.creation_payment_status === 'confirmed') {
      return NextResponse.json({ status: 'paid' })
    }

    // 2. Consultar LivePix
    const pagamento = await consultarPagamento(reference)
    const livePixStatus = pagamento?.status

    if (livePixStatus === 'paid' || livePixStatus === 'confirmed') {
      // 3. Ativar torneio automaticamente
      await supabase.from('tournaments').update({
        creation_payment_status: 'confirmed',
        status: 'open'
      }).eq('id', reference).eq('status', 'draft')

      return NextResponse.json({ status: 'paid' })
    }

    return NextResponse.json({ status: livePixStatus || 'pending' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message, status: 'error' }, { status: 500 })
  }
}
