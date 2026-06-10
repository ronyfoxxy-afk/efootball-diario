import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const revalidate = 30

const STATUS: Record<string, { label: string; color: string }> = {
  open:        { label: 'Inscrições abertas', color: '#22d3a0' },
  in_progress: { label: 'Em andamento',       color: '#4f7ef8' },
  finished:    { label: 'Encerrada',          color: '#52525b' },
}

export default async function TorneiosPage() {
  // Busca todas as divisões com sua temporada mais recente
  const { data: divisoes } = await supabase
    .from('league_divisions')
    .select('id, division_number, name, max_players, league_seasons(id, season_number, status, entry_fee, prize, created_at)')
    .order('division_number', { ascending: true })

  // Para cada divisão, pega a temporada mais recente e conta confirmados
  const divisoesComDados = await Promise.all(
    (divisoes || []).map(async (d: any) => {
      const seasons = (d.league_seasons || []).sort((a: any, b: any) => b.season_number - a.season_number)
      const seasonAtual = seasons[0] || null

      let confirmados = 0
      if (seasonAtual) {
        const { count } = await supabase
          .from('league_season_players').select('id', { count: 'exact', head: true })
          .eq('season_id', seasonAtual.id).eq('payment_status', 'confirmed')
        confirmados = count || 0
      }

      return { ...d, seasonAtual, confirmados }
    })
  )

  return (
    <div style={{ minHeight: '100vh', background: '#09090b' }}>
      <Navbar />
      <main style={{ maxWidth: 1160, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
        <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #1d1d20' }}>
          <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 36, fontWeight: 900, color: '#fbe900', textTransform: 'uppercase', letterSpacing: 1 }}>
            🏆 Liga eFootball
          </h1>
          <p style={{ color: '#52525b', marginTop: 4, fontSize: 13 }}>
            Sistema de divisões — todos contra todos, ida e volta. Suba de divisão, vire campeão!
          </p>
        </div>

        {!divisoesComDados || divisoesComDados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#52525b' }}>
            <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, fontWeight: 900, textTransform: 'uppercase' }}>Nenhuma divisão criada ainda.</p>
            <p style={{ fontSize: 13, marginTop: 8 }}>Fique de olho, em breve novidades!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {divisoesComDados.map((d: any) => {
              const s = d.seasonAtual
              const st = s ? (STATUS[s.status] || STATUS.finished) : STATUS.finished
              return (
                <Link key={d.id} href={`/torneios/divisao/${d.division_number}`} style={{ textDecoration: 'none' }}>
                  <div className="card-hover" style={{ background: '#111115', border: '1px solid #1d1d20', borderRadius: 14, padding: '1.25rem', cursor: 'pointer', height: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <span style={{ fontSize: 11, color: '#52525b', fontWeight: 700, letterSpacing: '0.5px' }}>
                        Temporada {s?.season_number || 1}
                      </span>
                      <span style={{ background: st.color + '14', color: st.color, border: `1px solid ${st.color}30`, padding: '2px 9px', borderRadius: 4, fontSize: 9, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
                        {st.label}
                      </span>
                    </div>
                    <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 24, fontWeight: 900, color: '#e4e4e7', textTransform: 'uppercase', margin: '0 0 8px', lineHeight: 1.1 }}>
                      {d.name}
                    </h2>
                    <div style={{ display: 'flex', gap: 14, fontSize: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ color: '#a1a1aa' }}>👥 {d.confirmados}/{d.max_players}</span>
                      {s?.entry_fee > 0 && <span style={{ color: '#fbe900', fontWeight: 700 }}>💰 R${Number(s.entry_fee).toFixed(2)}</span>}
                      {s?.prize > 0 && <span style={{ color: '#22d3a0', fontWeight: 700 }}>🎁 R${Number(s.prize).toFixed(2)}</span>}
                    </div>
                    {/* Barra de progresso de vagas */}
                    {s?.status === 'open' && (
                      <div style={{ marginTop: 12, height: 4, background: '#1d1d20', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(100, (d.confirmados / d.max_players) * 100)}%`, background: '#22d3a0', borderRadius: 2 }} />
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        <div style={{ marginTop: '1.5rem' }}>
          <Link href="/criar-torneio" style={{ textDecoration: 'none' }}>
            <div className="card-hover" style={{ background: '#111115', border: '1px dashed #2d2d35', borderRadius: 14, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 16, fontWeight: 900, color: '#e4e4e7', textTransform: 'uppercase', marginBottom: 2 }}>➕ Criar meu próprio torneio</h3>
                <p style={{ fontSize: 12, color: '#52525b' }}>Taxa de criação R$10 · Publicado no site</p>
              </div>
              <span style={{ color: '#52525b', fontSize: 18 }}>→</span>
            </div>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
