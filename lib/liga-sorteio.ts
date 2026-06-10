import { supabase } from '@/lib/supabase'
import { gerarConfrontos, shuffle } from '@/lib/round-robin'

/**
 * Gera o calendário (rodadas + confrontos round-robin ida/volta) de uma
 * temporada da Liga eFootball. Lança erro com mensagem amigável em caso de falha.
 */
export async function gerarCalendarioTemporada(seasonId: string) {
  const { data: existentes } = await supabase
    .from('league_matches').select('id').eq('season_id', seasonId).limit(1)
  if (existentes && existentes.length > 0) {
    throw new Error('Esta temporada já tem confrontos gerados.')
  }

  const { data: jogadores } = await supabase
    .from('league_season_players')
    .select('player_id')
    .eq('season_id', seasonId)
    .eq('payment_status', 'confirmed')
    .eq('disqualified', false)

  if (!jogadores || jogadores.length < 2) {
    throw new Error('É preciso ao menos 2 jogadores confirmados.')
  }

  const idsEmbaralhados = shuffle(jogadores.map(j => j.player_id))
  const confrontos = gerarConfrontos(idsEmbaralhados)
  const totalRodadas = Math.max(...confrontos.map(c => c.rodada))

  const rodadasParaInserir = Array.from({ length: totalRodadas }, (_, i) => ({
    season_id: seasonId,
    round_number: i + 1,
    name: i + 1 <= totalRodadas / 2 ? `Turno — Rodada ${i + 1}` : `Returno — Rodada ${i + 1 - totalRodadas / 2}`,
    status: 'pending',
  }))

  const { data: rodadasCriadas, error: errRodadas } = await supabase
    .from('league_rounds').insert(rodadasParaInserir).select('id, round_number')

  if (errRodadas || !rodadasCriadas) {
    throw new Error('Erro ao criar rodadas: ' + errRodadas?.message)
  }

  const roundIdByNumber: Record<number, string> = {}
  for (const r of rodadasCriadas) roundIdByNumber[r.round_number] = r.id

  const matchesParaInserir = confrontos.map(c => ({
    season_id: seasonId,
    round_id: roundIdByNumber[c.rodada],
    home_player_id: c.home,
    away_player_id: c.away,
    status: 'pending',
  }))

  const { error: errMatches } = await supabase.from('league_matches').insert(matchesParaInserir)

  if (errMatches) {
    throw new Error('Erro ao criar confrontos: ' + errMatches.message)
  }

  return {
    jogadores: jogadores.length,
    rodadas: totalRodadas,
    confrontos: matchesParaInserir.length,
  }
}
