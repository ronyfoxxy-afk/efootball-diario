import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { gerarCalendarioTemporada } from '@/lib/liga-sorteio'

/**
 * Inscrição na Liga eFootball oficial.
 * - Encontra ou cria o cadastro permanente do jogador (league_players).
 * - Vincula à temporada "open" da divisão mais baixa disponível.
 * - Se a inscrição completar 20 confirmados, fecha a temporada (in_progress),
 *   dispara o sorteio do calendário e garante que existe a próxima divisão/temporada aberta.
 */
export async function POST(req: NextRequest) {
  const { player_name, contact, available_days, available_times, livepix_ref } = await req.json()

  if (!player_name || !contact) {
    return NextResponse.json({ error: 'Nome no jogo e WhatsApp são obrigatórios.' }, { status: 400 })
  }

  // 1. Acha (ou cria) o cadastro permanente do jogador pelo nome no jogo
  let playerId: string
  const { data: existente } = await supabase
    .from('league_players').select('id').eq('player_name', player_name).maybeSingle()

  if (existente) {
    playerId = existente.id
  } else {
    const { data: novo, error: errNovo } = await supabase
      .from('league_players').insert({ player_name, contact }).select('id').single()
    if (errNovo || !novo) {
      return NextResponse.json({ error: 'Erro ao cadastrar jogador: ' + errNovo?.message }, { status: 500 })
    }
    playerId = novo.id
  }

  // 2. Acha a temporada "open" de menor número de divisão
  const { data: temporadaAberta } = await supabase
    .from('league_seasons')
    .select('id, division_id, season_number, league_divisions(division_number, max_players)')
    .eq('status', 'open')
    .order('division_id', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!temporadaAberta) {
    return NextResponse.json({ error: 'Nenhuma temporada com inscrições abertas no momento.' }, { status: 400 })
  }

  // 3. Verifica se o jogador já está inscrito nessa temporada
  const { data: jaInscrito } = await supabase
    .from('league_season_players').select('id')
    .eq('season_id', temporadaAberta.id).eq('player_id', playerId).maybeSingle()

  if (jaInscrito) {
    return NextResponse.json({ error: 'Você já está inscrito nesta temporada.' }, { status: 400 })
  }

  // 4. Insere a inscrição (pagamento começa como pending; confirmação vem do LivePix)
  const { error: errInscricao } = await supabase.from('league_season_players').insert({
    season_id: temporadaAberta.id,
    player_id: playerId,
    available_days: available_days || [],
    available_times: available_times || [],
    payment_status: livepix_ref ? 'confirmed' : 'pending',
    paid_at: livepix_ref ? new Date().toISOString() : null,
    livepix_ref: livepix_ref || null,
  })

  if (errInscricao) {
    return NextResponse.json({ error: 'Erro ao inscrever: ' + errInscricao.message }, { status: 500 })
  }

  // 5. Conta confirmados na temporada
  const { count } = await supabase
    .from('league_season_players').select('id', { count: 'exact', head: true })
    .eq('season_id', temporadaAberta.id).eq('payment_status', 'confirmed')

  const maxPlayers = (temporadaAberta as any).league_divisions?.max_players || 20
  let temporadaFechada = false

  if ((count || 0) >= maxPlayers) {
    temporadaFechada = true

    // Fecha a temporada e dispara o sorteio
    await supabase.from('league_seasons').update({ status: 'in_progress', started_at: new Date().toISOString() }).eq('id', temporadaAberta.id)

    try {
      await gerarCalendarioTemporada(temporadaAberta.id)
    } catch (e: any) {
      // Se o sorteio falhar, registramos mas não bloqueamos a inscrição —
      // o admin pode rodar o sorteio manualmente depois via /api/liga/sorteio
      console.error('Erro ao gerar calendário automaticamente:', e.message)
    }

    // Garante que existe a próxima divisão com temporada aberta
    const proximoNumero = (temporadaAberta as any).league_divisions.division_number + 1
    const { data: proximaDivisao } = await supabase
      .from('league_divisions').select('id').eq('division_number', proximoNumero).maybeSingle()

    let proximaDivisaoId = proximaDivisao?.id
    if (!proximaDivisaoId) {
      const { data: novaDivisao, error: errDivisao } = await supabase
        .from('league_divisions')
        .insert({ division_number: proximoNumero, name: `Divisão ${proximoNumero}`, max_players: 20 })
        .select('id').single()
      if (errDivisao || !novaDivisao) {
        return NextResponse.json({ error: 'Erro ao criar próxima divisão: ' + errDivisao?.message }, { status: 500 })
      }
      proximaDivisaoId = novaDivisao.id
    }

    const { data: temporadaExistente } = await supabase
      .from('league_seasons').select('id').eq('division_id', proximaDivisaoId).eq('status', 'open').maybeSingle()

    if (!temporadaExistente) {
      const { count: seasonCount } = await supabase
        .from('league_seasons').select('id', { count: 'exact', head: true }).eq('division_id', proximaDivisaoId)
      await supabase.from('league_seasons').insert({
        division_id: proximaDivisaoId,
        season_number: (seasonCount || 0) + 1,
        status: 'open',
        entry_fee: 10,
      })
    }
  }

  return NextResponse.json({
    ok: true,
    division_number: (temporadaAberta as any).league_divisions.division_number,
    season_id: temporadaAberta.id,
    temporada_fechada: temporadaFechada,
  })
}
