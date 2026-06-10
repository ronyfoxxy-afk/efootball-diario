import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * Gera o calendário de uma liga "todos contra todos" com ida e volta.
 * Usa o algoritmo round-robin clássico (círculo): com N participantes
 * (par), gera N-1 rodadas no turno e mais N-1 no returno.
 * Se N for ímpar, adiciona um "bye" (folga) — o total de rodadas por turno
 * passa a ser N (cada jogador folga em uma rodada por turno).
 */
function gerarConfrontos(participantIds: string[]): { rodada: number; home: string | null; away: string | null }[] {
  const ids = [...participantIds]
  if (ids.length % 2 !== 0) ids.push('BYE') // marcador de folga — n vira par

  const n = ids.length
  const totalRodadasTurno = n - 1
  const metade = n / 2

  const confrontos: { rodada: number; home: string | null; away: string | null }[] = []
  let arr = [...ids]

  for (let rodada = 0; rodada < totalRodadasTurno; rodada++) {
    for (let i = 0; i < metade; i++) {
      const home = arr[i]
      const away = arr[n - 1 - i]
      if (home !== 'BYE' && away !== 'BYE') {
        // Turno (ida)
        confrontos.push({ rodada: rodada + 1, home, away })
        // Returno (volta) — mando invertido, na rodada espelhada
        confrontos.push({ rodada: totalRodadasTurno + rodada + 1, home: away, away: home })
      }
    }
    // Rotaciona o array (fixa o primeiro elemento, gira o resto)
    const fixo = arr[0]
    const resto = arr.slice(1)
    resto.unshift(resto.pop()!)
    arr = [fixo, ...resto]
  }

  return confrontos
}

/** Embaralha um array (Fisher-Yates) */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export async function POST(req: NextRequest) {
  // Auth: apenas admin pode disparar o sorteio
  const cookie = req.cookies.get('admin_auth')?.value
  const adminPass = process.env.ADMIN_PASSWORD || '@Miudinho123'
  if (cookie !== adminPass) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { tournament_id } = await req.json()
  if (!tournament_id) {
    return NextResponse.json({ error: 'tournament_id é obrigatório' }, { status: 400 })
  }

  // Verifica se já existem confrontos gerados para este torneio
  const { data: existentes } = await supabase
    .from('tournament_matches').select('id').eq('tournament_id', tournament_id).limit(1)
  if (existentes && existentes.length > 0) {
    return NextResponse.json({ error: 'Este torneio já tem confrontos gerados.' }, { status: 400 })
  }

  // Busca participantes confirmados (não desclassificados)
  const { data: participantes } = await supabase
    .from('tournament_participants')
    .select('id')
    .eq('tournament_id', tournament_id)
    .eq('payment_status', 'confirmed')
    .eq('disqualified', false)

  if (!participantes || participantes.length < 2) {
    return NextResponse.json({ error: 'É preciso ao menos 2 participantes confirmados.' }, { status: 400 })
  }

  // Sorteia a ordem dos participantes antes de gerar os confrontos
  const idsEmbaralhados = shuffle(participantes.map(p => p.id))
  const confrontos = gerarConfrontos(idsEmbaralhados)

  const totalRodadas = Math.max(...confrontos.map(c => c.rodada))

  // Cria as rodadas
  const rodadasParaInserir = Array.from({ length: totalRodadas }, (_, i) => ({
    tournament_id,
    round_number: i + 1,
    name: i + 1 <= totalRodadas / 2 ? `Turno — Rodada ${i + 1}` : `Returno — Rodada ${i + 1 - totalRodadas / 2}`,
    status: 'pending',
  }))

  const { data: rodadasCriadas, error: errRodadas } = await supabase
    .from('tournament_rounds').insert(rodadasParaInserir).select('id, round_number')

  if (errRodadas || !rodadasCriadas) {
    return NextResponse.json({ error: 'Erro ao criar rodadas: ' + errRodadas?.message }, { status: 500 })
  }

  const roundIdByNumber: Record<number, string> = {}
  for (const r of rodadasCriadas) roundIdByNumber[r.round_number] = r.id

  // Cria os confrontos (matches)
  const matchesParaInserir = confrontos.map(c => ({
    tournament_id,
    round_id: roundIdByNumber[c.rodada],
    home_participant_id: c.home,
    away_participant_id: c.away,
    status: 'pending',
  }))

  const { error: errMatches } = await supabase.from('tournament_matches').insert(matchesParaInserir)

  if (errMatches) {
    return NextResponse.json({ error: 'Erro ao criar confrontos: ' + errMatches.message }, { status: 500 })
  }

  // Atualiza status do torneio para "em andamento"
  await supabase.from('tournaments').update({ status: 'in_progress' }).eq('id', tournament_id)

  return NextResponse.json({
    ok: true,
    participantes: participantes.length,
    rodadas: totalRodadas,
    confrontos: matchesParaInserir.length,
  })
}
