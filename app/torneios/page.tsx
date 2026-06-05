import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import type { Tournament } from '@/lib/supabase'

export const revalidate = 60

const MODEL_LABELS: Record<string, string> = {
  liga: '🏆 Liga',
  copa: '🥊 Copa',
  grupos_mata_mata: '⚡ Grupos + Mata-mata',
  livre: '🎮 Livre',
}

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  open: { label: 'Inscrições abertas', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  ongoing: { label: 'Em andamento', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  finished: { label: 'Encerrado', color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
  cancelled: { label: 'Cancelado', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
}

export default async function TorneiosPage() {
  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('*')
    .neq('status', 'draft')
    .order('created_at', { ascending: false })

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e' }}>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fbbf24', marginBottom: '0.5rem' }}>🏆 Torneios</h1>
        <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: 14 }}>
          Compete, paga a inscrição via Pix e disputa os prêmios!
        </p>

        {!tournaments || tournaments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>
            <p style={{ fontSize: 18 }}>🏆 Nenhum torneio disponível no momento.</p>
            <p style={{ fontSize: 14, marginTop: 8 }}>Fique de olho, em breve novidades!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {(tournaments as Tournament[]).map(t => {
              const s = STATUS_STYLES[t.status] || STATUS_STYLES.finished
              return (
                <Link key={t.id} href={`/torneios/${t.slug}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ padding: '1.25rem', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <span style={{ fontSize: 13, color: '#9ca3af' }}>{MODEL_LABELS[t.model]}</span>
                      <span style={{ background: s.bg, color: s.color, padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500 }}>
                        {s.label}
                      </span>
                    </div>
                    <h2 style={{ fontSize: 18, fontWeight: 600, color: '#f1f5f9', margin: '0 0 8px' }}>{t.name}</h2>
                    {t.description && (
                      <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 12px', lineHeight: 1.5 }}>{t.description}</p>
                    )}
                    <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
                      {t.entry_fee > 0 && (
                        <span style={{ color: '#fbbf24' }}>💰 R$ {t.entry_fee.toFixed(2)}</span>
                      )}
                      {t.prize > 0 && (
                        <span style={{ color: '#10b981' }}>🎁 Prêmio: R$ {t.prize.toFixed(2)}</span>
                      )}
                      {t.start_date && (
                        <span style={{ color: '#6b7280' }}>📅 {formatDate(t.start_date)}</span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
