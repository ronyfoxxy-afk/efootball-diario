'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

type QueueEntry = {
  id: string; player_name: string; sala_id: string
  sala_senha: string; status: string; position: number
}

// Widget para OBS / TikTok Studio — mostra APENAS a sala atual (primeira da fila)
export default function CoopWidget() {
  const [fila, setFila] = useState<QueueEntry[]>([])
  const [prevCount, setPrevCount] = useState(0)

  async function carregarFila() {
    const { data } = await supabase
      .from('coop_queue').select('*').eq('status', 'waiting')
      .order('created_at', { ascending: true })
    const entries = (data || []) as QueueEntry[]
    setFila(prev => {
      // Detecta novo jogador pra tocar som
      if (entries.length > prev.length) {
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
          const o = ctx.createOscillator()
          const g = ctx.createGain()
          o.connect(g); g.connect(ctx.destination)
          o.frequency.setValueAtTime(880, ctx.currentTime)
          o.frequency.setValueAtTime(1100, ctx.currentTime + 0.08)
          g.gain.setValueAtTime(0.3, ctx.currentTime)
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
          o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.4)
        } catch {}
      }
      return entries
    })
  }

  useEffect(() => {
    carregarFila()
    const channel = supabase.channel('widget_coop_v2')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'coop_queue' }, () => carregarFila())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  // Pegar APENAS a primeira sala
  const salasMap: Record<string, QueueEntry[]> = {}
  fila.forEach(p => {
    if (!salasMap[p.sala_id]) salasMap[p.sala_id] = []
    salasMap[p.sala_id].push(p)
  })
  const primeiraEntrada = Object.entries(salasMap)[0]
  const salaId = primeiraEntrada?.[0]
  const jogadores = primeiraEntrada?.[1] || []
  const totalSalas = Object.keys(salasMap).length
  const completa = jogadores.length >= 5

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=Barlow:wght@400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: transparent !important; font-family: 'Barlow', sans-serif; }
        html { background: transparent !important; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes slideIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
      <div style={{ padding: '10px', maxWidth: 380, fontFamily: "'Barlow',sans-serif" }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
          background: 'rgba(9,9,11,0.88)', backdropFilter: 'blur(12px)',
          borderRadius: 10, padding: '8px 12px',
          border: '1px solid rgba(79,126,248,0.35)',
        }}>
          <span style={{ fontSize: 16 }}>🎮</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 14, color: '#fff', textTransform: 'uppercase', letterSpacing: 1, lineHeight: 1 }}>Co-op 3×3 — Fila ao vivo</div>
            <div style={{ fontSize: 10, color: '#4f7ef8', fontWeight: 700, letterSpacing: '0.8px', marginTop: 2 }}>
              {fila.length} aguardando · {totalSalas} sala{totalSalas !== 1 ? 's' : ''}
            </div>
          </div>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22d3a0', boxShadow: '0 0 8px #22d3a0', animation: 'pulse 2s infinite' }} />
        </div>

        {/* Sala atual */}
        {!salaId ? (
          <div style={{ background: 'rgba(9,9,11,0.78)', backdropFilter: 'blur(10px)', borderRadius: 10, padding: '16px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: 12, color: '#52525b', fontWeight: 600 }}>Fila vazia — entre em efootball-news.vercel.app/coop</span>
          </div>
        ) : (
          <div style={{
            background: 'rgba(9,9,11,0.88)', backdropFilter: 'blur(12px)',
            borderRadius: 10, padding: '12px',
            border: `1px solid ${completa ? 'rgba(34,211,160,0.5)' : 'rgba(79,126,248,0.25)'}`,
            animation: 'slideIn 0.3s ease',
          }}>
            {/* Sala header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div>
                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 18, color: '#fff', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Sala #{salaId}
                </span>
                {completa && (
                  <span style={{ marginLeft: 8, background: 'rgba(34,211,160,0.15)', color: '#22d3a0', fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4, letterSpacing: '1px', textTransform: 'uppercase', verticalAlign: 'middle' }}>COMPLETA</span>
                )}
                {totalSalas > 1 && (
                  <div style={{ fontSize: 10, color: '#52525b', marginTop: 2 }}>{totalSalas - 1} sala{totalSalas - 1 !== 1 ? 's' : ''} aguardando</div>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 9, color: '#52525b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Senha</div>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 22, color: '#e8b84b', lineHeight: 1 }}>🔑 {jogadores[0]?.sala_senha}</div>
              </div>
            </div>

            {/* Jogadores */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {/* FSKATE sempre primeiro */}
              <span style={{ background: 'rgba(232,184,75,0.15)', border: '1px solid rgba(232,184,75,0.35)', borderRadius: 14, padding: '4px 11px', fontSize: 11, color: '#e8b84b', fontWeight: 700 }}>
                👑 FSKATE
              </span>
              {jogadores.map((j, idx) => (
                <span key={j.id} style={{ background: 'rgba(79,126,248,0.15)', border: '1px solid rgba(79,126,248,0.3)', borderRadius: 14, padding: '4px 11px', fontSize: 11, color: '#93b4fc', fontWeight: 600, animation: 'slideIn 0.3s ease' }}>
                  {idx + 1}. {j.player_name}
                </span>
              ))}
              {Array.from({ length: Math.max(0, 5 - jogadores.length) }).map((_, i) => (
                <span key={i} style={{ border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 14, padding: '4px 11px', fontSize: 11, color: '#27272a' }}>vaga</span>
              ))}
            </div>
          </div>
        )}

        <div style={{ textAlign: 'right', marginTop: 5 }}>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.12)', fontWeight: 600, letterSpacing: '0.5px' }}>efootball-news.vercel.app/coop</span>
        </div>
      </div>
    </>
  )
}
