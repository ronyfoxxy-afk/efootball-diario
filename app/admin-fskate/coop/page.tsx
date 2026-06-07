'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

const G = {
  green: '#00e56e', bg: '#060a0f', surface: '#0d1520', surface2: '#131e2e',
  border: 'rgba(255,255,255,0.07)', borderActive: 'rgba(0,229,110,0.4)',
  text: '#f0f4f8', muted: '#5a7190', gold: '#e8b84b', red: '#f87171', blue: '#0ea5e9'
}

type Entry = { id: string; player_name: string; sala_id: string; sala_senha: string; status: string; position: number; created_at: string }

const COOP_SECRET = process.env.NEXT_PUBLIC_COOP_SECRET || 'fskate2024'

function tocarSom() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.connect(g); g.connect(ctx.destination)
    o.type = 'sine'
    o.frequency.setValueAtTime(660, ctx.currentTime)
    o.frequency.setValueAtTime(880, ctx.currentTime + 0.1)
    o.frequency.setValueAtTime(1100, ctx.currentTime + 0.2)
    g.gain.setValueAtTime(0.4, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
    o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.5)
  } catch {}
}

export default function AdminCoop() {
  const [fila, setFila] = useState<Entry[]>([])
  const [chamadas, setChamadas] = useState<Entry[]>([])
  const [toast, setToast] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [widgetOpen, setWidgetOpen] = useState(false)
  const [linkCopiado, setLinkCopiado] = useState(false)
  const filaRef = useRef<Entry[]>([])

  const encerrarLink = `${typeof window !== 'undefined' ? window.location.origin : 'https://efootball-diario.vercel.app'}/api/coop/encerrar?token=${COOP_SECRET}`

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2500) }

  async function carregar() {
    const { data: w } = await supabase.from('coop_queue').select('*').eq('status', 'waiting').order('created_at', { ascending: true })
    const { data: c } = await supabase.from('coop_queue').select('*').eq('status', 'called').order('created_at', { ascending: false }).limit(10)
    const novaFila = (w || []) as Entry[]
    // Toca som se entrou alguém novo
    if (novaFila.length > filaRef.current.length) {
      tocarSom()
    }
    filaRef.current = novaFila
    setFila(novaFila)
    setChamadas((c || []) as Entry[])
  }

  useEffect(() => {
    carregar()
    const ch = supabase.channel('coop_admin_v2').on('postgres_changes', { event: '*', schema: 'public', table: 'coop_queue' }, carregar).subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  async function chamarSala(salaId: string) {
    await supabase.from('coop_queue').update({ status: 'called' }).eq('sala_id', salaId).eq('status', 'waiting')
    showToast('📢 Sala #' + salaId + ' chamada!'); carregar()
  }

  async function encerrarSala(salaId: string) {
    await supabase.from('coop_queue').update({ status: 'done' }).eq('sala_id', salaId)
    showToast('✅ Sala #' + salaId + ' encerrada'); carregar()
  }

  async function limparTudo() {
    if (!confirm('Limpar toda a fila?')) return
    await supabase.from('coop_queue').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    showToast('🗑️ Fila limpa!'); carregar()
  }

  // Agrupar em salas de 5
  const salas: Record<string, Entry[]> = {}
  fila.forEach(p => { if (!salas[p.sala_id]) salas[p.sala_id] = []; salas[p.sala_id].push(p) })

  // Gerar PNG da fila
  function gerarPNG() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = 800, ROW = 52, PAD = 20
    const salasList = Object.entries(salas)
    const H = PAD * 2 + 80 + salasList.reduce((acc, [, jogs]) => acc + ROW + (Math.ceil(jogs.length / 1) * 40) + 16, 0)
    canvas.width = W
    canvas.height = Math.max(H, 200)

    // Fundo
    ctx.fillStyle = '#060a0f'
    ctx.fillRect(0, 0, W, canvas.height)

    // Borda verde
    ctx.strokeStyle = '#00e56e33'
    ctx.lineWidth = 1
    ctx.strokeRect(1, 1, W - 2, canvas.height - 2)

    // Header
    ctx.fillStyle = '#00e56e'
    ctx.font = 'bold 11px Arial'
    ctx.letterSpacing = '2px'
    ctx.fillText('FILA CO-OP 5×5  —  eFootball News', PAD, PAD + 14)
    ctx.fillStyle = '#5a7190'
    ctx.font = '10px Arial'
    ctx.fillText(fila.length + ' jogadores na fila  ·  ' + salasList.length + ' salas', PAD, PAD + 30)

    // Linha separadora
    ctx.fillStyle = '#1c2638'
    ctx.fillRect(PAD, PAD + 40, W - PAD * 2, 1)

    let y = PAD + 58

    salasList.forEach(([salaId, jogadores]) => {
      const completa = jogadores.length >= 5

      // Fundo da sala
      ctx.fillStyle = completa ? 'rgba(0,229,110,0.06)' : 'rgba(13,21,32,0.8)'
      ctx.beginPath()
      ctx.roundRect(PAD, y - 8, W - PAD * 2, ROW + jogadores.length * 38 + 8, 8)
      ctx.fill()

      // Borda
      ctx.strokeStyle = completa ? '#00e56e44' : '#1c2638'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(PAD, y - 8, W - PAD * 2, ROW + jogadores.length * 38 + 8, 8)
      ctx.stroke()

      // Sala ID
      ctx.fillStyle = '#f0f4f8'
      ctx.font = 'bold 15px Arial'
      ctx.fillText('SALA #' + salaId, PAD + 12, y + 10)

      // Senha
      ctx.fillStyle = '#e8b84b'
      ctx.font = 'bold 18px Arial'
      const senhaWidth = ctx.measureText('🔑 ' + jogadores[0]?.sala_senha).width
      ctx.fillText('🔑 ' + jogadores[0]?.sala_senha, W - PAD - 12 - senhaWidth, y + 11)

      if (completa) {
        ctx.fillStyle = '#00e56e'
        ctx.font = 'bold 9px Arial'
        ctx.fillText('COMPLETA', PAD + 12 + ctx.measureText('SALA #' + salaId).width + 10, y + 9)
      }

      y += ROW

      // Jogadores
      jogadores.forEach((j, i) => {
        ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent'
        ctx.fillRect(PAD + 8, y - 6, W - PAD * 2 - 16, 34)

        // Número
        ctx.fillStyle = '#00e56e'
        ctx.font = 'bold 11px Arial'
        ctx.fillText(String(i + 1), PAD + 16, y + 10)

        // Nome
        ctx.fillStyle = '#f0f4f8'
        ctx.font = '13px Arial'
        ctx.fillText(j.player_name, PAD + 32, y + 11)

        y += 38
      })

      // Vagas livres
      for (let i = jogadores.length; i < 5; i++) {
        ctx.strokeStyle = '#1c2638'
        ctx.setLineDash([4, 4])
        ctx.strokeRect(PAD + 8, y - 6, W - PAD * 2 - 16, 30)
        ctx.setLineDash([])
        ctx.fillStyle = '#2a3a4e'
        ctx.font = '11px Arial'
        ctx.fillText('vaga livre', PAD + 36, y + 10)
        y += 38
      }

      y += 16
    })

    if (salasList.length === 0) {
      ctx.fillStyle = '#5a7190'
      ctx.font = '14px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('Fila vazia', W / 2, canvas.height / 2)
    }

    // Download
    const link = document.createElement('a')
    link.download = 'fila-coop-efootball.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
    showToast('🖼️ PNG gerado!')
  }

  const salasList = Object.entries(salas)
  const salasChamadas = Object.entries(
    chamadas.reduce((acc: Record<string, Entry[]>, p) => { if (!acc[p.sala_id]) acc[p.sala_id] = []; acc[p.sala_id].push(p); return acc }, {})
  )

  const S: any = {
    lbl: { fontSize: 10, color: G.muted, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' as const },
    card: { background: G.surface, border: `1px solid ${G.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 8 },
  }

  // URL do widget para OBS
  const widgetUrl = 'https://efootball-diario.vercel.app/widget/coop'

  return (
    <div style={{ minHeight: '100vh', background: G.bg, color: G.text, fontFamily: "'Barlow', 'Inter', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=Barlow:wght@400;500&display=swap')`}</style>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <header style={{ background: G.surface, borderBottom: `1px solid ${G.border}`, padding: '0 1rem', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky' as const, top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <a href="/admin-fskate" style={{ color: G.muted, fontSize: 20, textDecoration: 'none' }}>←</a>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 16, color: G.text, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              🎮 Co-op 5×5
            </div>
            <div style={{ fontSize: 9, color: G.muted, letterSpacing: '2px', fontWeight: 700, textTransform: 'uppercase' }}>GERENCIAR FILA</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={gerarPNG} style={{ background: 'rgba(0,229,110,0.1)', color: G.green, border: `1px solid ${G.borderActive}`, borderRadius: 8, padding: '7px 14px', fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' as const, cursor: 'pointer', fontFamily: 'inherit' }}>
            🖼️ PNG
          </button>
          <button onClick={() => setWidgetOpen(!widgetOpen)} style={{ background: 'rgba(14,165,233,0.1)', color: G.blue, border: `1px solid rgba(14,165,233,0.3)`, borderRadius: 8, padding: '7px 14px', fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' as const, cursor: 'pointer', fontFamily: 'inherit' }}>
            {'</>'}
          </button>
          <button
            onClick={async () => {
              const primeiraSlot = salasList[0]?.[0]
              if (!primeiraSlot) { showToast('⚠️ Fila vazia'); return }
              await encerrarSala(primeiraSlot)
            }}
            style={{ background: 'rgba(34,211,160,0.12)', color: '#22d3a0', border: `1px solid rgba(34,211,160,0.3)`, borderRadius: 8, padding: '7px 14px', fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' as const, cursor: 'pointer', fontFamily: 'inherit' }}>
            ✅ Encerrar sala
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(encerrarLink)
              setLinkCopiado(true)
              showToast('🔗 Link copiado! Cole no celular.')
              setTimeout(() => setLinkCopiado(false), 3000)
            }}
            style={{ background: linkCopiado ? 'rgba(34,211,160,0.15)' : 'rgba(255,255,255,0.04)', color: linkCopiado ? '#22d3a0' : G.muted, border: `1px solid ${linkCopiado ? 'rgba(34,211,160,0.3)' : G.border}`, borderRadius: 8, padding: '7px 14px', fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' as const, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
            {linkCopiado ? '✅ Copiado!' : '🔗 Link celular'}
          </button>
          <button onClick={limparTudo} style={{ background: 'rgba(248,113,113,0.1)', color: G.red, border: `1px solid rgba(248,113,113,0.2)`, borderRadius: 8, padding: '7px 14px', fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' as const, cursor: 'pointer', fontFamily: 'inherit' }}>
            Limpar
          </button>
        </div>
      </header>

      {toast && (
        <div style={{ position: 'fixed' as const, top: 66, left: '50%', transform: 'translateX(-50%)', background: G.surface, border: `1px solid ${G.green}`, borderRadius: 10, padding: '10px 22px', fontSize: 13, color: G.green, zIndex: 300, whiteSpace: 'nowrap' as const, boxShadow: '0 8px 32px rgba(0,229,110,0.15)' }}>
          {toast}
        </div>
      )}

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '1.25rem 1rem' }}>

        {/* Widget URL para OBS */}
        {widgetOpen && (
          <div style={{ background: G.surface, border: `1px solid rgba(14,165,233,0.3)`, borderRadius: 12, padding: '14px', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 11, color: G.blue, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' as const }}>{'</>'} Widget para o OBS</span>
              <button onClick={() => { navigator.clipboard.writeText(widgetUrl); showToast('✅ URL copiada!') }}
                style={{ background: 'rgba(14,165,233,0.15)', color: G.blue, border: `1px solid rgba(14,165,233,0.3)`, borderRadius: 6, padding: '5px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Copiar URL
              </button>
            </div>
            <div style={{ fontSize: 12, color: G.muted, marginBottom: 10, lineHeight: 1.6 }}>
              No OBS → <strong style={{ color: G.text }}>Fontes → + → Navegador</strong> e cole a URL abaixo:
            </div>
            <div style={{ background: G.surface2, borderRadius: 8, padding: '10px 14px', fontSize: 13, color: G.green, fontFamily: 'monospace', wordBreak: 'break-all' as const, marginBottom: 10 }}>
              {widgetUrl}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, fontSize: 11, color: G.muted }}>
              {[['Largura', '460px'], ['Altura', '500px'], ['CSS', 'fundo transparente']].map(([l, v]) => (
                <div key={l} style={{ background: G.surface2, borderRadius: 6, padding: '7px 10px' }}>
                  <div style={{ fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' as const, fontSize: 10, marginBottom: 2 }}>{l}</div>
                  <div style={{ color: G.text, fontSize: 12 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: '1.25rem' }}>
          {[
            { l: 'Na fila', v: fila.length, c: G.green },
            { l: 'Salas', v: salasList.length, c: G.gold },
            { l: 'Chamadas', v: chamadas.length, c: G.blue },
          ].map(st => (
            <div key={st.l} style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 10, padding: '14px', textAlign: 'center' as const }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 28, color: st.c }}>{st.v}</div>
              <div style={{ fontSize: 10, color: G.muted, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' as const, marginTop: 2 }}>{st.l}</div>
            </div>
          ))}
        </div>

        {/* Salas aguardando */}
        <div style={{ fontSize: 11, color: G.muted, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' as const, marginBottom: 10 }}>Salas aguardando</div>

        {salasList.length === 0 && (
          <div style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 12, padding: '2.5rem', textAlign: 'center' as const, color: G.muted }}>
            Fila vazia — aguardando jogadores
          </div>
        )}

        {salasList.map(([salaId, jogadores]) => (
          <div key={salaId} style={{ ...S.card, border: `1px solid ${jogadores.length >= 5 ? G.borderActive : G.border}` }}>
            <div style={{ padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 18, color: G.text, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    SALA #{salaId}
                  </span>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 900, color: G.gold }}>
                    🔑 {jogadores[0]?.sala_senha}
                  </span>
                  {jogadores.length >= 5 && (
                    <span style={{ background: 'rgba(0,229,110,0.1)', color: G.green, fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 20, letterSpacing: '1px', textTransform: 'uppercase' as const }}>COMPLETA</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button style={{ background: 'rgba(0,229,110,0.1)', color: G.green, border: `1px solid rgba(0,229,110,0.25)`, borderRadius: 7, padding: '6px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.8px', textTransform: 'uppercase' as const }} onClick={() => chamarSala(salaId)}>📢 Chamar</button>
                  <button style={{ background: 'rgba(14,165,233,0.08)', color: G.blue, border: `1px solid rgba(14,165,233,0.2)`, borderRadius: 7, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => encerrarSala(salaId)}>✅</button>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {jogadores.map((j, i) => (
                  <span key={j.id} style={{ background: G.surface2, border: `1px solid ${G.border}`, borderRadius: 20, padding: '4px 12px', fontSize: 13, color: G.text, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: G.green, fontWeight: 700, fontSize: 11 }}>{i + 1}</span>
                    {j.player_name}
                  </span>
                ))}
                {Array.from({ length: Math.max(0, 5 - jogadores.length) }).map((_, i) => (
                  <span key={i} style={{ border: `1px dashed ${G.border}`, borderRadius: 20, padding: '4px 14px', fontSize: 12, color: '#2a3a4e' }}>vaga livre</span>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Chamadas */}
        {salasChamadas.length > 0 && (
          <>
            <div style={{ fontSize: 11, color: G.muted, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' as const, marginBottom: 10, marginTop: '1.25rem' }}>Chamadas recentemente</div>
            {salasChamadas.map(([salaId, jogs]) => (
              <div key={salaId} style={{ ...S.card, opacity: 0.5 }}>
                <div style={{ padding: '10px 14px', fontSize: 13, color: G.muted }}>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: G.text }}>SALA #{salaId}</span>
                  {' — '}{jogs.map(j => j.player_name).join(', ')}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
