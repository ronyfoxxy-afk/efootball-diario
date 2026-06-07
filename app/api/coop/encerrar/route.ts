import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const sala = req.nextUrl.searchParams.get('sala')
  const token = req.nextUrl.searchParams.get('token')

  if (token !== process.env.COOP_SECRET) {
    return new NextResponse(
      `<html><body style="background:#07090e;color:#ef4444;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-size:18px;">
        ❌ Token inválido
      </body></html>`,
      { status: 401, headers: { 'Content-Type': 'text/html' } }
    )
  }

  let salaEncerrada = sala

  if (sala) {
    await supabase.from('coop_queue').update({ status: 'done' }).eq('sala_id', sala)
  } else {
    // Encerra automaticamente a primeira sala da fila
    const { data } = await supabase
      .from('coop_queue').select('sala_id').eq('status', 'waiting')
      .order('created_at', { ascending: true }).limit(1)
    if (!data || data.length === 0) {
      return new NextResponse(
        `<html><body style="background:#07090e;color:#f59e0b;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-size:18px;text-align:center;flex-direction:column;gap:10px;">
          ⚠️<br>Fila vazia
        </body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      )
    }
    salaEncerrada = data[0].sala_id
    await supabase.from('coop_queue').update({ status: 'done' }).eq('sala_id', salaEncerrada)
  }

  return new NextResponse(
    `<html><body style="background:#07090e;color:#00d084;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-size:20px;font-weight:700;text-align:center;flex-direction:column;gap:12px;">
      ✅<br>Sala #${salaEncerrada} encerrada!<br>
      <span style="font-size:13px;color:#4e5d72;margin-top:8px;">Pode fechar essa aba</span>
    </body></html>`,
    { headers: { 'Content-Type': 'text/html' } }
  )
}
