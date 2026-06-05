'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

type Entry = { id: string; player_name: string; sala_id: string; sala_senha: string; status: string; position: number; created_at: string }

export default function AdminCoop() {
  const [fila, setFila] = useState<Entry[]>([])
  const [chamadas, setChamadas] = useState<Entry[]>([])
  const [toast, setToast] = useState('')

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2500) }

  async function carregar() {
    const { data: w } = await supabase.from('coop_queue').select('*').eq('status', 'waiting').order('created_at', { ascending: true })
    const { data: c } = await supabase.from('coop_queue').select('*').eq('status', 'called').order('created_at', { ascending: false }).limit(10)
    setFila((w || []) as Entry[])
    setChamadas((c || []) as Entry[])
  }

  useEffect(() => {
    carregar()
    const ch = supabase.channel('coop_admin').on('postgres_changes', { event: '*', schema: 'public', table: 'coop_queue' }, carregar).subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  async function chamarSala(salaId: string) {
    await supabase.from('coop_queue').update({ status: 'called' }).eq('sala_id', salaId).eq('status', 'waiting')
    showToast('📢 Sala #' + salaId + ' chamada!')
    carregar()
  }

  async function encerrarSala(salaId: string) {
    await supabase.from('coop_queue').update({ status: 'done' }).eq('sala_id', salaId)
    showToast('✅ Sala #' + salaId + ' encerrada')
    carregar()
  }

  async function limparTudo() {
    if (!confirm('Limpar toda a fila?')) return
    await supabase.from('coop_queue').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    showToast('🗑️ Fila limpa!')
    carregar()
  }

  // Agrupar em salas
  const salas: Record<string, Entry[]> = {}
  fila.forEach(p => { if (!salas[p.sala_id]) salas[p.sala_id] = []; salas[p.sala_id].push(p) })

  const s: any = {
    page: { minHeight: '100vh', background: '#08090c', color: '#e8eaf0', fontFamily: "'Inter',sans-serif" },
    header: { background: '#0e1014', borderBottom: '1px solid #1c1f26', padding: '0 1rem', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 },
    card: { background: '#0e1014', border: '1px solid #1c1f26', borderRadius: 12, padding: '12px', marginBottom: 8 },
    btnCall: { background: '#4f7ef8', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter',sans-serif" },
    btnDone: { background: '#14161b', color: '#3ecf8e', border: '1px solid rgba(62,207,142,0.2)', borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer', fontFamily: "'Inter',sans-serif" },
  }

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <a href="/admin-fskate" style={{ color: '#4b5060', fontSize: 20, textDecoration: 'none' }}>←</a>
          <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, color: '#fff' }}>🎮 Gerenciar Fila Co-op</span>
        </div>
        <button onClick={limparTudo} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>
          Limpar fila
        </button>
      </header>

      {toast && (
        <div style={{ position: 'fixed', top: 66, left: '50%', transform: 'translateX(-50%)', background: '#0e1014', border: '1px solid #3ecf8e', borderRadius: 10, padding: '10px 20px', fontSize: 13, color: '#3ecf8e', zIndex: 300, whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '1.25rem 1rem' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: '1.25rem' }}>
          {[
            { label: 'Na fila', value: fila.length, color: '#4f7ef8' },
            { label: 'Salas', value: Object.keys(salas).length, color: '#e8b84b' },
            { label: 'Chamadas', value: chamadas.length, color: '#3ecf8e' },
          ].map(st => (
            <div key={st.label} style={{ background: '#0e1014', border: '1px solid #1c1f26', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: st.color }}>{st.value}</div>
              <div style={{ fontSize: 11, color: '#4b5060' }}>{st.label}</div>
            </div>
          ))}
        </div>

        {/* Salas em espera */}
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>
          Salas aguardando
        </h2>

        {Object.keys(salas).length === 0 && (
          <div style={{ ...s.card, textAlign: 'center', padding: '2rem', color: '#4b5060' }}>Fila vazia</div>
        )}

        {Object.entries(salas).map(([salaId, jogadores]) => (
          <div key={salaId} style={{ ...s.card, border: jogadores.length >= 3 ? '1px solid rgba(62,207,142,0.3)' : '1px solid #1c1f26' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 18, color: '#fff' }}>Sala #{salaId}</span>
                <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: '#e8b84b' }}>🔑 {jogadores[0]?.sala_senha}</span>
                {jogadores.length >= 3 && <span style={{ background: 'rgba(62,207,142,0.1)', color: '#3ecf8e', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>COMPLETA</span>}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button style={s.btnCall} onClick={() => chamarSala(salaId)}>📢 Chamar</button>
                <button style={s.btnDone} onClick={() => encerrarSala(salaId)}>✅</button>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {jogadores.map((j, i) => (
                <span key={j.id} style={{ background: '#14161b', border: '1px solid #1c1f26', borderRadius: 20, padding: '4px 12px', fontSize: 13, color: '#e2e8f0' }}>
                  {i + 1}. {j.player_name}
                </span>
              ))}
              {Array.from({ length: Math.max(0, 3 - jogadores.length) }).map((_, i) => (
                <span key={i} style={{ border: '1px dashed #252830', borderRadius: 20, padding: '4px 14px', fontSize: 13, color: '#374151' }}>vaga livre</span>
              ))}
            </div>
          </div>
        ))}

        {/* Salas chamadas */}
        {chamadas.length > 0 && (
          <>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700, color: '#8b909e', marginBottom: '0.75rem', marginTop: '1.25rem' }}>
              Chamadas recentemente
            </h2>
            {Object.entries(
              chamadas.reduce((acc: Record<string, Entry[]>, p) => { if (!acc[p.sala_id]) acc[p.sala_id] = []; acc[p.sala_id].push(p); return acc }, {})
            ).map(([salaId, jogs]) => (
              <div key={salaId} style={{ ...s.card, opacity: 0.6 }}>
                <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, color: '#8b909e' }}>Sala #{salaId} — {jogs.map(j => j.player_name).join(', ')}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
