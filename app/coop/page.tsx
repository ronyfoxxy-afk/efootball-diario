'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

type QueueEntry = {
  id: string; player_name: string; sala_id: string
  sala_senha: string; status: string; position: number; created_at: string
}

// Vaga reservada do FSKATE
const FSKATE_SLOT = { id: 'fskate', player_name: 'FSKATE (HOST)', sala_id: '01', sala_senha: '----', isHost: true }

const S: any = {
  page: { minHeight: '100vh', background: '#09090b' },
  main: { maxWidth: 640, margin: '0 auto', padding: '1.5rem 1rem 3rem' },
  card: { background: '#111115', border: '1px solid #1d1d20', borderRadius: 14, padding: '1.25rem', marginBottom: '1rem' },
  inp: { width: '100%', background: '#18181c', border: '1px solid #1d1d20', borderRadius: 10, padding: '12px 14px', color: '#e4e4e7', fontSize: 15, fontFamily: "'Barlow',sans-serif", outline: 'none', boxSizing: 'border-box' as const, marginBottom: 10 },
  lbl: { fontSize: 10, color: '#52525b', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase' as const, marginBottom: 6, display: 'block' },
  btn: { width: '100%', background: '#4f7ef8', color: '#fff', border: 'none', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'Barlow Condensed',sans-serif", textTransform: 'uppercase' as const, letterSpacing: 1 },
}

export default function CoopQueuePage() {
  const [nome, setNome] = useState('')
  const [entrando, setEntrando] = useState(false)
  const [entrou, setEntrou] = useState<QueueEntry | null>(null)
  const [fila, setFila] = useState<QueueEntry[]>([])
  const [toast, setToast] = useState('')

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  async function carregarFila() {
    const { data } = await supabase
      .from('coop_queue').select('*').eq('status', 'waiting')
      .order('created_at', { ascending: true })
    setFila((data || []) as QueueEntry[])
  }

  useEffect(() => {
    carregarFila()
    const channel = supabase.channel('coop_queue')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'coop_queue' }, () => carregarFila())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function entrarNaFila() {
    if (!nome.trim()) { showToast('⚠️ Coloca seu nome!'); return }
    setEntrando(true)
    const { count } = await supabase.from('coop_queue').select('*', { count: 'exact', head: true }).eq('status', 'waiting')
    const position = (count || 0) + 1
    // Cada sala tem 4 vagas (+ 1 do FSKATE = 3x3 com 5 jogadores total)
    const salaNum = Math.ceil(position / 4)
    const salaId = String(salaNum).padStart(2, '0')
    const { data: existing } = await supabase.from('coop_queue').select('sala_senha').eq('sala_id', salaId).eq('status', 'waiting').limit(1)
    const salaSenha = existing && existing.length > 0 ? existing[0].sala_senha : String(Math.floor(1000 + Math.random() * 9000))
    const { data, error } = await supabase.from('coop_queue')
      .insert({ player_name: nome.trim(), sala_id: salaId, sala_senha: salaSenha, position, status: 'waiting' })
      .select().single()
    setEntrando(false)
    if (error) { showToast('❌ ' + error.message); return }
    setEntrou(data as QueueEntry)
    carregarFila()
  }

  // Agrupar em salas de 4 (+ host = 5 total no 3x3)
  const salas: Record<string, QueueEntry[]> = {}
  fila.forEach(p => {
    if (!salas[p.sala_id]) salas[p.sala_id] = []
    salas[p.sala_id].push(p)
  })

  return (
    <div style={S.page}>
      <Navbar />
      <main style={S.main}>

        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 32, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
            🎮 Fila Co-op 3x3
          </h1>
          <p style={{ fontSize: 14, color: '#52525b', marginBottom: 8 }}>
            5 jogadores por partida · 4 vagas disponíveis · 1 reservada pro FSKATE
          </p>
          <Link href="/widget/coop" target="_blank"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#4f7ef8', border: '1px solid rgba(79,126,248,0.25)', background: 'rgba(79,126,248,0.08)', borderRadius: 6, padding: '4px 10px', textDecoration: 'none', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
            📺 Widget OBS/TikTok →
          </Link>
        </div>

        {toast && (
          <div style={{ background: '#111115', border: '1px solid #22d3a0', borderRadius: 10, padding: '10px 16px', fontSize: 13, color: '#22d3a0', marginBottom: '1rem', textAlign: 'center' }}>
            {toast}
          </div>
        )}

        {entrou ? (
          <div style={{ ...S.card, border: '1px solid rgba(79,126,248,0.3)', textAlign: 'center' }}>
            <div style={{ fontSize: 42, marginBottom: 10 }}>🎮</div>
            <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 26, fontWeight: 900, color: '#fff', textTransform: 'uppercase', marginBottom: 6 }}>
              Você está na fila!
            </h2>
            <p style={{ color: '#71717a', fontSize: 14, marginBottom: '1.5rem' }}>
              Acompanhe a live — quando sua sala for chamada, use a senha para entrar!
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: '1rem' }}>
              <div style={{ background: '#18181c', borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 10, color: '#52525b', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 4 }}>Sua Sala</div>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 36, fontWeight: 900, color: '#4f7ef8' }}>#{entrou.sala_id}</div>
              </div>
              <div style={{ background: '#18181c', borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 10, color: '#52525b', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 4 }}>Senha</div>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 36, fontWeight: 900, color: '#e8b84b' }}>{entrou.sala_senha}</div>
              </div>
            </div>
            <div style={{ background: 'rgba(232,184,75,0.06)', border: '1px solid rgba(232,184,75,0.18)', borderRadius: 10, padding: '12px', fontSize: 13, color: '#e8b84b', lineHeight: 1.6 }}>
              📺 Quando o FSKATE chamar a Sala <strong>#{entrou.sala_id}</strong>, use a senha <strong>{entrou.sala_senha}</strong>
            </div>
            <button onClick={() => { setEntrou(null); setNome('') }}
              style={{ marginTop: '1rem', background: 'none', border: '1px solid #1d1d20', borderRadius: 8, padding: '8px 16px', color: '#52525b', fontSize: 12, cursor: 'pointer', fontFamily: "'Barlow',sans-serif", fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
              Sair da fila
            </button>
          </div>
        ) : (
          <div style={S.card}>
            <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 20, fontWeight: 900, color: '#fff', textTransform: 'uppercase', marginBottom: '1rem' }}>
              Entrar na fila
            </h2>
            <label style={S.lbl}>Seu nome / nick *</label>
            <input style={S.inp} placeholder="Como te chamam no eFootball?" value={nome}
              onChange={e => setNome(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && entrarNaFila()} />
            <button style={{ ...S.btn, opacity: entrando ? 0.6 : 1 }} onClick={entrarNaFila} disabled={entrando}>
              {entrando ? 'Entrando...' : '🎮 Entrar na fila'}
            </button>
          </div>
        )}

        {/* Fila atual */}
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 20, fontWeight: 900, color: '#fff', textTransform: 'uppercase' }}>
              Fila atual
            </h2>
            <span style={{ fontSize: 12, color: '#52525b', fontWeight: 700 }}>{fila.length} aguardando</span>
          </div>

          {fila.length === 0 ? (
            <p style={{ color: '#52525b', textAlign: 'center', padding: '1.5rem', fontSize: 14 }}>
              Fila vazia — seja o primeiro! 🎮
            </p>
          ) : (
            Object.entries(salas).map(([salaId, jogadores]) => {
              const completa = jogadores.length >= 4
              return (
                <div key={salaId} style={{ background: '#18181c', borderRadius: 12, padding: 12, marginBottom: 8, border: completa ? '1px solid rgba(34,211,160,0.3)' : '1px solid #1d1d20' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 16, color: '#fff', textTransform: 'uppercase' }}>
                        Sala #{salaId}
                      </span>
                      {completa && (
                        <span style={{ background: 'rgba(34,211,160,0.1)', color: '#22d3a0', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 4, letterSpacing: '1px', textTransform: 'uppercase' }}>COMPLETA</span>
                      )}
                    </div>
                    <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 20, color: '#e8b84b' }}>🔑 {jogadores[0]?.sala_senha}</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {/* Slot FSKATE sempre primeiro */}
                    <span style={{ background: 'rgba(232,184,75,0.08)', border: '1px solid rgba(232,184,75,0.25)', borderRadius: 20, padding: '5px 12px', fontSize: 12, color: '#e8b84b', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ width: 18, height: 18, background: '#e8b84b', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: '#09090b', flexShrink: 0 }}>F</span>
                      FSKATE (host)
                    </span>
                    {jogadores.map((j, idx) => (
                      <span key={j.id} style={{ background: '#09090b', border: '1px solid #1d1d20', borderRadius: 20, padding: '5px 12px', fontSize: 12, color: '#e4e4e7', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ width: 18, height: 18, background: '#4f7ef8', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: '#fff', flexShrink: 0 }}>{idx + 1}</span>
                        {j.player_name}
                      </span>
                    ))}
                    {/* Vagas restantes (4 jogadores + FSKATE = 5 total) */}
                    {Array.from({ length: Math.max(0, 4 - jogadores.length) }).map((_, i) => (
                      <span key={i} style={{ background: '#09090b', border: '1px dashed #2d2d35', borderRadius: 20, padding: '5px 14px', fontSize: 12, color: '#3f3f46' }}>vaga livre</span>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Como funciona */}
        <div style={{ ...S.card, border: '1px solid #1d1d20' }}>
          <h3 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 18, fontWeight: 900, color: '#fff', textTransform: 'uppercase', marginBottom: '0.875rem' }}>Como funciona</h3>
          {[
            ['1', 'Entre na fila com seu nome', '#4f7ef8'],
            ['2', 'Cada sala tem 4 vagas de jogadores + o FSKATE (5 no total — 3x3)', '#8b5cf6'],
            ['3', 'Cada sala tem uma senha de 4 dígitos', '#e8b84b'],
            ['4', 'Quando o FSKATE chamar sua sala na live, use a senha para entrar', '#22d3a0'],
          ].map(([num, txt, cor]) => (
            <div key={num} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ width: 24, height: 24, background: (cor as string) + '18', border: `1px solid ${cor}40`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: cor as string, flexShrink: 0, fontFamily: "'Barlow Condensed',sans-serif" }}>{num}</div>
              <span style={{ fontSize: 13, color: '#71717a', lineHeight: 1.5 }}>{txt}</span>
            </div>
          ))}
        </div>

      </main>
      <Footer />
    </div>
  )
}
