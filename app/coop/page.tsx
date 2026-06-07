'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

type QueueEntry = {
  id: string; player_name: string; sala_id: string
  sala_senha: string; status: string; position: number; created_at: string
}

const G = {
  bg: '#09090b', surface: '#111115', surface2: '#18181c',
  border: '#1d1d20', border2: '#2d2d35',
  text: '#e4e4e7', muted: '#71717a', dim: '#52525b',
  blue: '#4f7ef8', gold: '#e8b84b', green: '#22d3a0',
}

// 3x3 = 6 jogadores por sala. 5 vagas abertas + 1 do FSKATE
const VAGAS_POR_SALA = 5

const TIKTOK_LIVE_URL = process.env.NEXT_PUBLIC_TIKTOK_URL || 'https://www.tiktok.com/@fskate.efootball/live'

export default function CoopQueuePage() {
  const [nome, setNome] = useState('')
  const [entrando, setEntrando] = useState(false)
  const [entrou, setEntrou] = useState<QueueEntry | null>(null)
  const [fila, setFila] = useState<QueueEntry[]>([])
  const [toast, setToast] = useState('')
  const [redirecionando, setRedirecionando] = useState(false)
  const prevFilaLen = useRef(0)

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  function tocarSom() {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.connect(g); g.connect(ctx.destination)
      o.frequency.setValueAtTime(880, ctx.currentTime)
      o.frequency.setValueAtTime(1100, ctx.currentTime + 0.08)
      g.gain.setValueAtTime(0.3, ctx.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
      o.start(); o.stop(ctx.currentTime + 0.4)
    } catch {}
  }

  async function carregarFila() {
    const { data } = await supabase
      .from('coop_queue').select('*').eq('status', 'waiting')
      .order('created_at', { ascending: true })
    const nova = (data || []) as QueueEntry[]
    if (nova.length > prevFilaLen.current) tocarSom()
    prevFilaLen.current = nova.length
    setFila(nova)
  }

  useEffect(() => {
    carregarFila()

    // Polling a cada 4s como fallback
    const interval = setInterval(carregarFila, 4000)

    const ch = supabase.channel('coop_fila')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'coop_queue' }, carregarFila)
      .subscribe()

    return () => {
      clearInterval(interval)
      supabase.removeChannel(ch)
    }
  }, [])

  async function entrarNaFila() {
    if (!nome.trim()) { showToast('⚠️ Coloca seu nome!'); return }
    // Redireciona pro TikTok e volta
    setRedirecionando(true)
    const retorno = encodeURIComponent(window.location.href + '?nome=' + encodeURIComponent(nome.trim()))
    window.open(TIKTOK_LIVE_URL, '_blank')
    setRedirecionando(false)
    // Continua o processo normalmente
    setEntrando(true)
    const { count } = await supabase.from('coop_queue')
      .select('*', { count: 'exact', head: true }).eq('status', 'waiting')
    const position = (count || 0) + 1
    const salaNum = Math.ceil(position / VAGAS_POR_SALA)
    const salaId = String(salaNum).padStart(2, '0')
    const { data: existing } = await supabase.from('coop_queue')
      .select('sala_senha').eq('sala_id', salaId).eq('status', 'waiting').limit(1)
    const salaSenha = existing?.length ? existing[0].sala_senha : String(Math.floor(1000 + Math.random() * 9000))
    const { data, error } = await supabase.from('coop_queue')
      .insert({ player_name: nome.trim(), sala_id: salaId, sala_senha: salaSenha, position, status: 'waiting' })
      .select().single()
    setEntrando(false)
    if (error) { showToast('❌ ' + error.message); return }
    setEntrou(data as QueueEntry)
    carregarFila()
  }

  async function sairDaFila() {
    if (!entrou) return
    await supabase.from('coop_queue').update({ status: 'done' }).eq('id', entrou.id)
    setEntrou(null); setNome(''); carregarFila()
  }

  const salas: Record<string, QueueEntry[]> = {}
  fila.forEach(p => {
    if (!salas[p.sala_id]) salas[p.sala_id] = []
    salas[p.sala_id].push(p)
  })

  return (
    <div style={{ minHeight: '100vh', background: G.bg }}>
      <Navbar />
      <main style={{ maxWidth: 620, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>

        {toast && (
          <div style={{ background: G.surface, border: `1px solid ${G.green}`, borderRadius: 10, padding: '10px 16px', fontSize: 13, color: G.green, marginBottom: '1rem', textAlign: 'center' }}>
            {toast}
          </div>
        )}

        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 32, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
            🎮 Fila Co-op 3x3
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: G.dim }}>
              6 jogadores por sala · 5 vagas abertas · 1 reservada pro FSKATE
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: G.green, fontWeight: 700 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: G.green, display: 'inline-block', boxShadow: `0 0 6px ${G.green}` }} />
              {fila.length} aguardando
            </span>
          </div>
        </div>

        {/* Formulário de entrada */}
        {!entrou ? (
          <div style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 14, padding: '1.25rem', marginBottom: '1rem' }}>
            <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 18, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '1rem' }}>
              Entrar na fila
            </h2>
            <label style={{ fontSize: 10, color: G.dim, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>
              Seu nome / nick *
            </label>
            <input
              style={{ width: '100%', background: G.surface2, border: `1px solid ${G.border}`, borderRadius: 8, padding: '12px 14px', color: G.text, fontSize: 15, fontFamily: "'Barlow',sans-serif", outline: 'none', boxSizing: 'border-box', marginBottom: 12 }}
              placeholder="Como te chamam no eFootball?"
              value={nome}
              onChange={e => setNome(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && entrarNaFila()}
            />
            <button
              onClick={entrarNaFila} disabled={entrando}
              style={{ width: '100%', background: G.blue, color: '#fff', border: 'none', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 900, cursor: entrando ? 'not-allowed' : 'pointer', fontFamily: "'Barlow Condensed',sans-serif", textTransform: 'uppercase', letterSpacing: 1, opacity: entrando ? 0.6 : 1 }}>
              {entrando ? 'Entrando...' : '🎮 Entrar na fila'}
            </button>
          </div>
        ) : (
          /* Card de confirmação */
          <div style={{ background: G.surface, border: `1px solid rgba(79,126,248,0.3)`, borderRadius: 14, padding: '1.5rem', marginBottom: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🎮</div>
            <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 26, fontWeight: 900, color: '#fff', textTransform: 'uppercase', marginBottom: 6 }}>
              Você está na fila!
            </h2>
            <p style={{ color: G.dim, fontSize: 13, marginBottom: '1.5rem' }}>
              Acompanhe a live — quando sua sala for chamada, use a senha para entrar!
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: '1rem' }}>
              <div style={{ background: G.surface2, borderRadius: 10, padding: '14px' }}>
                <div style={{ fontSize: 10, color: G.dim, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 4 }}>Sua Sala</div>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 36, fontWeight: 900, color: G.blue }}>#{entrou.sala_id}</div>
              </div>
              <div style={{ background: G.surface2, borderRadius: 10, padding: '14px' }}>
                <div style={{ fontSize: 10, color: G.dim, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 4 }}>Senha</div>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 36, fontWeight: 900, color: G.gold }}>{entrou.sala_senha}</div>
              </div>
            </div>
            <div style={{ background: 'rgba(232,184,75,0.06)', border: '1px solid rgba(232,184,75,0.18)', borderRadius: 10, padding: '12px', fontSize: 13, color: G.gold, lineHeight: 1.6, marginBottom: '1rem' }}>
              📺 Quando o FSKATE chamar a Sala <strong>#{entrou.sala_id}</strong>, use a senha <strong>{entrou.sala_senha}</strong>
            </div>
            <button onClick={sairDaFila}
              style={{ background: 'none', border: `1px solid ${G.border}`, borderRadius: 8, padding: '8px 16px', color: G.dim, fontSize: 12, cursor: 'pointer', fontFamily: "'Barlow',sans-serif", fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
              Sair da fila
            </button>
          </div>
        )}

        {/* Fila atual */}
        <div style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 14, padding: '1.25rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 18, fontWeight: 900, color: '#fff', textTransform: 'uppercase' }}>
              Salas
            </h2>
            <span style={{ fontSize: 11, color: G.dim, fontWeight: 700 }}>{Object.keys(salas).length} sala{Object.keys(salas).length !== 1 ? 's' : ''}</span>
          </div>

          {fila.length === 0 ? (
            <p style={{ color: G.dim, textAlign: 'center', padding: '1.5rem', fontSize: 14 }}>
              Fila vazia — seja o primeiro! 🎮
            </p>
          ) : (
            Object.entries(salas).map(([salaId, jogadores]) => {
              const completa = jogadores.length >= VAGAS_POR_SALA
              return (
                <div key={salaId} style={{ background: G.surface2, borderRadius: 12, padding: '12px', marginBottom: 8, border: `1px solid ${completa ? 'rgba(34,211,160,0.3)' : G.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 15, color: '#fff', textTransform: 'uppercase' }}>
                        Sala #{salaId}
                      </span>
                      <span style={{ fontSize: 10, color: G.dim }}>{jogadores.length}/{VAGAS_POR_SALA} vagas</span>
                      {completa && (
                        <span style={{ background: 'rgba(34,211,160,0.1)', color: G.green, fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 4, letterSpacing: '1px', textTransform: 'uppercase' }}>COMPLETA</span>
                      )}
                    </div>
                    <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 18, color: G.gold }}>🔑 {jogadores[0]?.sala_senha}</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {/* Slot FSKATE sempre primeiro */}
                    <span style={{ background: 'rgba(232,184,75,0.08)', border: '1px solid rgba(232,184,75,0.25)', borderRadius: 20, padding: '5px 12px', fontSize: 12, color: G.gold, display: 'flex', alignItems: 'center', gap: 5, fontWeight: 700 }}>
                      👑 FSKATE
                    </span>
                    {jogadores.map((j, idx) => (
                      <span key={j.id} style={{ background: entrou?.id === j.id ? 'rgba(79,126,248,0.15)' : G.bg, border: `1px solid ${entrou?.id === j.id ? 'rgba(79,126,248,0.4)' : G.border}`, borderRadius: 20, padding: '5px 12px', fontSize: 12, color: entrou?.id === j.id ? G.blue : G.text, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ width: 16, height: 16, background: G.blue, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: '#fff', flexShrink: 0 }}>{idx + 1}</span>
                        {j.player_name}
                        {entrou?.id === j.id && <span style={{ fontSize: 9, color: G.blue }}> (você)</span>}
                      </span>
                    ))}
                    {/* Vagas restantes */}
                    {Array.from({ length: Math.max(0, VAGAS_POR_SALA - jogadores.length) }).map((_, i) => (
                      <span key={i} style={{ border: `1px dashed ${G.border2}`, borderRadius: 20, padding: '5px 14px', fontSize: 12, color: G.dim }}>vaga livre</span>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Como funciona */}
        <div style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 14, padding: '1.25rem' }}>
          <h3 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 18, fontWeight: 900, color: '#fff', textTransform: 'uppercase', marginBottom: '0.875rem' }}>Como funciona</h3>
          {[
            ['1', 'Entre na fila com seu nome', G.blue],
            ['2', 'Cada sala tem 6 jogadores: 5 vagas + o FSKATE (3x3)', '#8b5cf6'],
            ['3', 'Cada sala tem uma senha de 4 dígitos', G.gold],
            ['4', 'Quando o FSKATE chamar sua sala na live, use a senha para entrar', G.green],
          ].map(([num, txt, cor]) => (
            <div key={num} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ width: 22, height: 22, background: (cor as string) + '18', border: `1px solid ${cor}40`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: cor as string, flexShrink: 0, fontFamily: "'Barlow Condensed',sans-serif" }}>{num}</div>
              <span style={{ fontSize: 13, color: G.dim, lineHeight: 1.5 }}>{txt}</span>
            </div>
          ))}
        </div>

      </main>
      <Footer />
    </div>
  )
}
