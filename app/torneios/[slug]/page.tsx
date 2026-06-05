import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { formatDate } from '@/lib/utils'
import { notFound } from 'next/navigation'
import type { Participant, Standing } from '@/lib/supabase'

export const revalidate = 30

export default async function TorneioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data: t } = await supabase.from('tournaments').select('*').eq('slug', slug).single()
  if (!t || t.status === 'draft') notFound()

  const { data: participants } = await supabase
    .from('tournament_participants').select('*')
    .eq('tournament_id', t.id).order('created_at')

  const { data: standings } = await supabase
    .from('tournament_standings').select('*')
    .eq('tournament_id', t.id).order('pontos', { ascending: false })

  const { data: rounds } = await supabase
    .from('tournament_rounds').select('*, tournament_matches(*)')
    .eq('tournament_id', t.id).order('round_number')

  const confirmed = (participants as Participant[] || []).filter(p => p.payment_status === 'confirmed')

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e' }}>
      <Navbar />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Header */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#fbbf24', margin: '0 0 8px' }}>🏆 {t.name}</h1>
          {t.description && <p style={{ color: '#9ca3af', margin: '0 0 1rem', fontSize: 14 }}>{t.description}</p>}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 14 }}>
            {t.entry_fee > 0 && <span style={{ color: '#fbbf24' }}>💰 Inscrição: R$ {t.entry_fee.toFixed(2)}</span>}
            {t.prize > 0 && <span style={{ color: '#10b981' }}>🎁 Prêmio: R$ {t.prize.toFixed(2)}</span>}
            {t.start_date && <span style={{ color: '#6b7280' }}>📅 Início: {formatDate(t.start_date)}</span>}
            {t.end_date && <span style={{ color: '#6b7280' }}>🏁 Fim: {formatDate(t.end_date)}</span>}
            <span style={{ color: '#6b7280' }}>👥 {confirmed.length} participantes confirmados</span>
          </div>

          {/* Inscrição via Pix */}
          {t.status === 'open' && t.pix_key && (
            <div style={{ marginTop: '1rem', background: 'rgba(37,99,235,0.1)', border: '1px solid #2563eb44', borderRadius: 8, padding: '1rem' }}>
              <p style={{ color: '#93c5fd', fontWeight: 500, margin: '0 0 4px' }}>📲 Como se inscrever</p>
              <p style={{ color: '#6b7280', fontSize: 13, margin: 0 }}>
                Envie R$ {t.entry_fee.toFixed(2)} via Pix para <strong style={{ color: '#93c5fd' }}>{t.pix_key}</strong> e entre em contato para confirmar sua vaga.
              </p>
            </div>
          )}
        </div>

        {/* Classificação */}
        {standings && standings.length > 0 && (
          <div className="card" style={{ marginBottom: '1.5rem', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #1f2937' }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9', margin: 0 }}>📊 Classificação</h2>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#111827' }}>
                  {['#', 'Jogador', 'P', 'J', 'V', 'E', 'D', 'GP', 'GC', 'SG'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: h === 'Jogador' ? 'left' : 'center', color: '#6b7280', fontWeight: 500, fontSize: 11 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(standings as Standing[]).map((s, i) => {
                  const saldo = (s.gols_pro || 0) - (s.gols_contra || 0)
                  return (
                    <tr key={s.participant_id} style={{ borderTop: '1px solid #1f2937', background: i === 0 ? 'rgba(16,185,129,0.05)' : 'transparent' }}>
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: i === 0 ? '#fbbf24' : '#6b7280', fontWeight: i === 0 ? 700 : 400 }}>{i + 1}</td>
                      <td style={{ padding: '10px 12px', color: '#f1f5f9', fontWeight: 500 }}>{s.player_name}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: '#fbbf24', fontWeight: 700 }}>{s.pontos || 0}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: '#9ca3af' }}>{s.jogos || 0}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: '#10b981' }}>{s.vitorias || 0}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: '#9ca3af' }}>{s.empates || 0}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: '#ef4444' }}>{s.derrotas || 0}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: '#9ca3af' }}>{s.gols_pro || 0}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: '#9ca3af' }}>{s.gols_contra || 0}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: saldo >= 0 ? '#10b981' : '#ef4444' }}>{saldo > 0 ? '+' : ''}{saldo}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Participantes */}
        {confirmed.length > 0 && (
          <div className="card" style={{ padding: '1.25rem' }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9', margin: '0 0 1rem' }}>👥 Participantes ({confirmed.length})</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {confirmed.map((p: Participant) => (
                <span key={p.id} style={{ background: '#1f2937', color: '#e2e8f0', padding: '4px 12px', borderRadius: 20, fontSize: 13 }}>
                  {p.player_name}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
