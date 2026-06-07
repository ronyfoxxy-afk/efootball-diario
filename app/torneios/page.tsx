import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import type { Tournament } from '@/lib/supabase'

export const revalidate = 60

const MODEL_LABELS: Record<string, string> = {
  liga: '🏆 Liga', copa: '🥊 Copa',
  grupos_mata_mata: '⚡ Grupos + Mata-mata', livre: '🎮 Livre',
}

const STATUS: Record<string, { label: string; color: string }> = {
  open:        { label: 'Inscrições abertas', color: '#22d3a0' },
  in_progress: { label: 'Em andamento',       color: '#4f7ef8' },
  finished:    { label: 'Encerrado',           color: '#52525b' },
  cancelled:   { label: 'Cancelado',           color: '#f87171' },
}

export default async function TorneiosPage() {
  const { data: tournaments } = await supabase
    .from('tournaments').select('*').neq('status', 'draft')
    .order('created_at', { ascending: false })

  return (
    <div style={{ minHeight: '100vh', background: '#09090b' }}>
      <Navbar />
      <main style={{ maxWidth: 1160, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
        <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #1d1d20' }}>
          <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 36, fontWeight: 900, color: '#e8b84b', textTransform: 'uppercase', letterSpacing: 1 }}>
            🏆 Torneios
          </h1>
          <p style={{ color: '#52525b', marginTop: 4, fontSize: 13 }}>
            Compete, paga via Pix e disputa os prêmios!
          </p>
        </div>

        {!tournaments || tournaments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#52525b' }}>
            <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, fontWeight: 900, textTransform: 'uppercase' }}>Nenhum torneio no momento.</p>
            <p style={{ fontSize: 13, marginTop: 8 }}>Fique de olho, em breve novidades!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {(tournaments as Tournament[]).map(t => {
              const st = STATUS[t.status] || STATUS.finished
              return (
                <Link key={t.id} href={`/torneios/${t.slug}`} style={{ textDecoration: 'none' }}>
                  <div className="card-hover" style={{ background: '#111115', border: '1px solid #1d1d20', borderRadius: 14, padding: '1.25rem', cursor: 'pointer', height: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <span style={{ fontSize: 11, color: '#52525b', fontWeight: 700, letterSpacing: '0.5px' }}>{MODEL_LABELS[t.model]}</span>
                      <span style={{ background: st.color + '14', color: st.color, border: `1px solid ${st.color}30`, padding: '2px 9px', borderRadius: 4, fontSize: 9, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
                        {st.label}
                      </span>
                    </div>
                    <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 20, fontWeight: 900, color: '#e4e4e7', textTransform: 'uppercase', margin: '0 0 8px', lineHeight: 1.1 }}>{t.name}</h2>
                    {t.description && (
                      <p style={{ fontSize: 13, color: '#71717a', margin: '0 0 12px', lineHeight: 1.5 }}>{t.description}</p>
                    )}
                    <div style={{ display: 'flex', gap: 14, fontSize: 12, flexWrap: 'wrap' }}>
                      {t.entry_fee > 0 && <span style={{ color: '#e8b84b', fontWeight: 700 }}>💰 R${Number(t.entry_fee).toFixed(2)}</span>}
                      {t.prize > 0 && <span style={{ color: '#22d3a0', fontWeight: 700 }}>🎁 R${Number(t.prize).toFixed(2)}</span>}
                      {t.start_date && <span style={{ color: '#52525b' }}>📅 {formatDate(t.start_date)}</span>}
                    </div>
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
