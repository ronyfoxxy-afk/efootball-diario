import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 30

const STATUS: Record<string, { label: string; color: string }> = {
  open:        { label: 'Inscrições abertas', color: '#22d3a0' },
  in_progress: { label: 'Em andamento',       color: '#4f7ef8' },
  finished:    { label: 'Encerrada',          color: '#52525b' },
}

export default async function DivisaoPage({ params }: { params: Promise<{ numero: string }> }) {
  const { numero } = await params
  const divisionNumber = parseInt(numero, 10)
  if (isNaN(divisionNumber)) notFound()

  const { data: divisao } = await supabase
    .from('league_divisions').select('*').eq('division_number', divisionNumber).maybeSingle()
  if (!divisao) notFound()

  // Temporada mais recente desta divisão
  const { data: temporadas } = await supabase
    .from('league_seasons').select('*').eq('division_id', divisao.id).order('season_number', { ascending: false }).limit(1)
  const season = temporadas?.[0]
  if (!season) notFound()

  const st = STATUS[season.status] || STATUS.finished

  // Classificação
  const { data: standings } = await supabase
    .from('league_standings').select('*').eq('season_id', season.id)

  // Inscritos confirmados (caso ainda não tenha calendário)
  const { data: inscritos } = await supabase
    .from('league_season_players')
    .select('player_id, payment_status, league_players(player_name)')
    .eq('season_id', season.id).eq('payment_status', 'confirmed')

  // Rodadas + confrontos
  const { data: rounds } = await supabase
    .from('league_rounds')
    .select('*, league_matches(*, home:home_player_id(player_name), away:away_player_id(player_name))')
    .eq('season_id', season.id)
    .order('round_number', { ascending: true })

  // Como o Supabase não resolve nomes via FK assim diretamente em todos os casos,
  // buscamos os nomes dos jogadores separadamente como fallback
  const { data: jogadoresTemporada } = await supabase
    .from('league_season_players')
    .select('player_id, league_players(id, player_name)')
    .eq('season_id', season.id)

  const nomeDoJogador: Record<string, string> = {}
  for (const j of (jogadoresTemporada || []) as any[]) {
    if (j.league_players) nomeDoJogador[j.player_id] = j.league_players.player_name
  }

  return (
    <div style={{ minHeight: '100vh', background: '#09090b' }}>
      <Navbar />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #1d1d20' }}>
          <Link href="/torneios" style={{ fontSize: 12, color: '#52525b', textDecoration: 'none', marginBottom: 8, display: 'inline-block' }}>← Todas as divisões</Link>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 32, fontWeight: 900, color: '#fbe900', textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>
              🏆 {divisao.name}
            </h1>
            <span style={{ background: st.color + '14', color: st.color, border: `1px solid ${st.color}30`, padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
              {st.label} · Temporada {season.season_number}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 13, marginTop: 10, flexWrap: 'wrap', color: '#a1a1aa' }}>
            {season.entry_fee > 0 && <span>💰 Inscrição: <strong style={{ color: '#fbe900' }}>R$ {Number(season.entry_fee).toFixed(2)}</strong></span>}
            {season.prize > 0 && <span>🎁 Prêmio: <strong style={{ color: '#22d3a0' }}>R$ {Number(season.prize).toFixed(2)}</strong></span>}
            <span>👥 {inscritos?.length || 0}/{divisao.max_players} jogadores</span>
          </div>

          {season.status === 'open' && (
            <div style={{ marginTop: 14 }}>
              <Link href={`/torneios/divisao/${divisionNumber}/inscrever`} style={{
                display: 'inline-block', textDecoration: 'none',
                background: '#fbe900', color: '#0a0800',
                fontWeight: 900, fontSize: 14, padding: '11px 24px',
                borderRadius: 10, fontFamily: "'Barlow Condensed',sans-serif",
                textTransform: 'uppercase', letterSpacing: 1,
              }}>
                Quero me inscrever
              </Link>
            </div>
          )}
        </div>

        {/* Classificação */}
        {standings && standings.length > 0 && (
          <div style={{ background: '#111115', border: '1px solid #1d1d20', borderRadius: 12, overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid #1d1d20' }}>
              <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 16, fontWeight: 900, color: '#e4e4e7', textTransform: 'uppercase', margin: 0, letterSpacing: 1 }}>📊 Classificação</h2>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 480 }}>
                <thead>
                  <tr style={{ background: '#0d0d10' }}>
                    {['#', 'Jogador', 'P', 'J', 'V', 'E', 'D', 'GP', 'GC', 'SG'].map(h => (
                      <th key={h} style={{ padding: '8px 10px', textAlign: h === 'Jogador' ? 'left' : 'center', color: '#52525b', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {standings.map((s: any, i: number) => {
                    const saldo = (s.gols_pro || 0) - (s.gols_contra || 0)
                    const acesso = i < 5 && season.status !== 'open' && divisao.division_number > 1
                    const queda = i >= standings.length - 5 && season.status !== 'open'
                    return (
                      <tr key={s.player_id} style={{
                        borderTop: '1px solid #1d1d20',
                        opacity: s.disqualified ? 0.4 : 1,
                        background: i === 0 ? 'rgba(34,211,160,0.04)' : 'transparent',
                      }}>
                        <td style={{ padding: '9px 10px', textAlign: 'center', position: 'relative' }}>
                          {(acesso || queda) && (
                            <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: acesso ? '#22d3a0' : '#f87171' }} />
                          )}
                          <span style={{ color: i === 0 ? '#fbe900' : '#52525b', fontWeight: i === 0 ? 900 : 400 }}>{i + 1}</span>
                        </td>
                        <td style={{ padding: '9px 10px', color: '#e4e4e7', fontWeight: 600 }}>
                          {s.player_name}{s.disqualified && <span style={{ color: '#f87171', fontSize: 9, marginLeft: 6, fontWeight: 700, textTransform: 'uppercase' }}>Desclassificado</span>}
                        </td>
                        <td style={{ padding: '9px 10px', textAlign: 'center', color: '#fbe900', fontWeight: 900 }}>{s.pontos || 0}</td>
                        <td style={{ padding: '9px 10px', textAlign: 'center', color: '#a1a1aa' }}>{s.jogos || 0}</td>
                        <td style={{ padding: '9px 10px', textAlign: 'center', color: '#22d3a0' }}>{s.vitorias || 0}</td>
                        <td style={{ padding: '9px 10px', textAlign: 'center', color: '#a1a1aa' }}>{s.empates || 0}</td>
                        <td style={{ padding: '9px 10px', textAlign: 'center', color: '#f87171' }}>{s.derrotas || 0}</td>
                        <td style={{ padding: '9px 10px', textAlign: 'center', color: '#a1a1aa' }}>{s.gols_pro || 0}</td>
                        <td style={{ padding: '9px 10px', textAlign: 'center', color: '#a1a1aa' }}>{s.gols_contra || 0}</td>
                        <td style={{ padding: '9px 10px', textAlign: 'center', color: saldo >= 0 ? '#22d3a0' : '#f87171' }}>{saldo > 0 ? '+' : ''}{saldo}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {divisao.division_number > 1 && season.status !== 'open' && (
              <div style={{ padding: '0.6rem 1.25rem', borderTop: '1px solid #1d1d20', display: 'flex', gap: 16, fontSize: 10, color: '#52525b' }}>
                <span><span style={{ display: 'inline-block', width: 8, height: 8, background: '#22d3a0', borderRadius: 2, marginRight: 4 }} />Acesso (sobe)</span>
                <span><span style={{ display: 'inline-block', width: 8, height: 8, background: '#f87171', borderRadius: 2, marginRight: 4 }} />Rebaixamento (desce)</span>
              </div>
            )}
          </div>
        )}

        {/* Inscritos (quando ainda não tem calendário) */}
        {(!rounds || rounds.length === 0) && inscritos && inscritos.length > 0 && (
          <div style={{ background: '#111115', border: '1px solid #1d1d20', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 16, fontWeight: 900, color: '#e4e4e7', textTransform: 'uppercase', margin: '0 0 1rem', letterSpacing: 1 }}>
              👥 Inscritos ({inscritos.length}/{divisao.max_players})
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {(inscritos as any[]).map((p) => (
                <span key={p.player_id} style={{ background: '#18181c', color: '#e4e4e7', padding: '5px 14px', borderRadius: 20, fontSize: 13, border: '1px solid #1d1d20' }}>
                  {p.league_players?.player_name || nomeDoJogador[p.player_id]}
                </span>
              ))}
            </div>
            <p style={{ fontSize: 12, color: '#52525b', marginTop: 12 }}>
              Faltam <strong style={{ color: '#fbe900' }}>{divisao.max_players - inscritos.length}</strong> jogadores para o sorteio do calendário começar automaticamente.
            </p>
          </div>
        )}

        {/* Jogos por rodada */}
        {rounds && rounds.length > 0 && (
          <div>
            <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 16, fontWeight: 900, color: '#e4e4e7', textTransform: 'uppercase', margin: '0 0 1rem', letterSpacing: 1 }}>📅 Jogos</h2>
            <div style={{ display: 'grid', gap: 10 }}>
              {(rounds as any[]).map(round => (
                <details key={round.id} style={{ background: '#111115', border: '1px solid #1d1d20', borderRadius: 12, overflow: 'hidden' }}>
                  <summary style={{ padding: '0.85rem 1.25rem', cursor: 'pointer', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700, color: '#e4e4e7', textTransform: 'uppercase', letterSpacing: 1, listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{round.name || `Rodada ${round.round_number}`}</span>
                    <span style={{ fontSize: 10, color: '#52525b', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                      {(round.league_matches || []).filter((m: any) => m.status === 'confirmed').length}/{(round.league_matches || []).length} confirmados
                    </span>
                  </summary>
                  <div style={{ borderTop: '1px solid #1d1d20' }}>
                    {(round.league_matches || []).map((m: any) => {
                      const homeNome = m.home?.player_name || nomeDoJogador[m.home_player_id] || '—'
                      const awayNome = m.away?.player_name || nomeDoJogador[m.away_player_id] || '—'
                      const confirmado = m.status === 'confirmed'
                      return (
                        <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 1.25rem', borderBottom: '1px solid #18181c', fontSize: 13 }}>
                          <span style={{ color: '#e4e4e7', flex: 1, textAlign: 'right', fontWeight: 600 }}>{homeNome}</span>
                          <span style={{
                            margin: '0 14px', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900,
                            color: confirmado ? '#fbe900' : '#52525b', minWidth: 50, textAlign: 'center', fontSize: 14,
                          }}>
                            {confirmado ? `${m.home_score} - ${m.away_score}` : 'vs'}
                          </span>
                          <span style={{ color: '#e4e4e7', flex: 1, fontWeight: 600 }}>{awayNome}</span>
                        </div>
                      )
                    })}
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
