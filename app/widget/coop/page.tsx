'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

type QueueEntry = {
  id: string; player_name: string; sala_id: string
  sala_senha: string; status: string; position: number
}

// Widget para OBS / TikTok Studio — fundo transparente, atualização em tempo real
export default function CoopWidget() {
  const [fila, setFila] = useState<QueueEntry[]>([])

  async function carregarFila() {
    const { data } = await supabase
      .from('coop_queue').select('*').eq('status', 'waiting')
      .order('created_at', { ascending: true })
    setFila((data || []) as QueueEntry[])
  }

  useEffect(() => {
    carregarFila()
    const channel = supabase.channel('widget_coop')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'coop_queue' }, () => carregarFila())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  // Agrupar em salas de 5 (+FSKATE = 6 total)
  const salas: Record<string, QueueEntry[]> = {}
  fila.forEach(p => {
    if (!salas[p.sala_id]) salas[p.sala_id] = []
    salas[p.sala_id].push(p)
  })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=Barlow:wght@400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: transparent !important; font-family: 'Barlow', sans-serif; }
        html { background: transparent !important; }
      `}</style>
      <div style={{ padding: '10px', maxWidth: 380, fontFamily: "'Barlow',sans-serif" }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, background: 'rgba(9,9,11,0.85)', backdropFilter: 'blur(10px)', borderRadius: 10, padding: '8px 12px', border: '1px solid rgba(79,126,248,0.3)' }}>
          <span style={{ fontSize: 16 }}>🎮</span>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 14, color: '#fff', textTransform: 'uppercase', letterSpacing: 1, lineHeight: 1 }}>Co-op 3x3 — Fila</div>
            <div style={{ fontSize: 10, color: '#4f7ef8', fontWeight: 700, letterSpacing: '0.8px' }}>{fila.length} aguardando</div>
          </div>
          <div style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: '#22d3a0', boxShadow: '0 0 6px #22d3a0' }} />
        </div>

        {/* Salas */}
        {fila.length === 0 ? (
          <div style={{ background: 'rgba(9,9,11,0.75)', backdropFilter: 'blur(10px)', borderRadius: 10, padding: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.07)' }}>
            <span style={{ fontSize: 12, color: '#52525b', fontWeight: 600 }}>Fila vazia — entre no site!</span>
          </div>
        ) : (
          Object.entries(salas).map(([salaId, jogadores]) => (
            <div key={salaId} style={{ background: 'rgba(9,9,11,0.82)', backdropFilter: 'blur(10px)', borderRadius: 10, padding: '10px 12px', marginBottom: 8, border: `1px solid ${jogadores.length >= 4 ? 'rgba(34,211,160,0.35)' : 'rgba(255,255,255,0.07)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 13, color: '#fff', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Sala #{salaId}
                </span>
                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 15, color: '#e8b84b' }}>🔑 {jogadores[0]?.sala_senha}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {/* FSKATE */}
                <span style={{ background: 'rgba(232,184,75,0.12)', border: '1px solid rgba(232,184,75,0.3)', borderRadius: 14, padding: '3px 10px', fontSize: 11, color: '#e8b84b', fontWeight: 700 }}>
                  👑 FSKATE
                </span>
                {jogadores.map((j, idx) => (
                  <span key={j.id} style={{ background: 'rgba(79,126,248,0.12)', border: '1px solid rgba(79,126,248,0.2)', borderRadius: 14, padding: '3px 10px', fontSize: 11, color: '#93b4fc', fontWeight: 600 }}>
                    {idx + 1}. {j.player_name}
                  </span>
                ))}
                {Array.from({ length: Math.max(0, 5 - jogadores.length) }).map((_, i) => (
                  <span key={i} style={{ border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 14, padding: '3px 10px', fontSize: 11, color: '#3f3f46' }}>vaga</span>
                ))}
              </div>
            </div>
          ))
        )}

        {/* Footer */}
        <div style={{ textAlign: 'right', marginTop: 4 }}>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.15)', fontWeight: 600, letterSpacing: '0.5px' }}>efootball-diario.vercel.app/coop</span>
        </div>
      </div>
    </>
  )
}
