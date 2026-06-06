'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

type QueueEntry = {
  id: string
  player_name: string
  sala_id: string
  sala_senha: string
  status: string
  position: number
  created_at: string
}

function gerarSenha() {
  return String(Math.floor(1000 + Math.random() * 9000))
}

function gerarSalaId() {
  return Math.random().toString(36).substring(2, 6).toUpperCase()
}

export default function CoopQueuePage() {
  const [nome, setNome] = useState('')
  const [contato, setContato] = useState('')
  const [entrando, setEntrando] = useState(false)
  const [entrou, setEntrou] = useState<QueueEntry | null>(null)
  const [fila, setFila] = useState<QueueEntry[]>([])
  const [toast, setToast] = useState('')

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  async function carregarFila() {
    const { data } = await supabase
      .from('coop_queue')
      .select('*')
      .eq('status', 'waiting')
      .order('created_at', { ascending: true })
    setFila((data || []) as QueueEntry[])
  }

  useEffect(() => {
    carregarFila()
    // Realtime
    const channel = supabase.channel('coop_queue')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'coop_queue' }, () => carregarFila())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function entrarNaFila() {
    if (!nome.trim()) { showToast('⚠️ Coloca seu nome!'); return }
    setEntrando(true)

    // Calcular próxima posição
    const { count } = await supabase.from('coop_queue').select('*', { count: 'exact', head: true }).eq('status', 'waiting')
    const position = (count || 0) + 1

    // Calcular sala (grupos de 3)
    const salaNum = Math.ceil(position / 5)
    const salaId = String(salaNum).padStart(2, '0')

    // Gerar senha única por sala — todos do mesmo grupo têm a mesma senha
    // Verificar se já existe senha para essa sala
    const { data: existing } = await supabase
      .from('coop_queue')
      .select('sala_senha')
      .eq('sala_id', salaId)
      .eq('status', 'waiting')
      .limit(1)

    const salaSenha = existing && existing.length > 0 ? existing[0].sala_senha : gerarSenha()

    const { data, error } = await supabase
      .from('coop_queue')
      .insert({ player_name: nome.trim(), contact: contato || null, sala_id: salaId, sala_senha: salaSenha, position, status: 'waiting' })
      .select().single()

    setEntrando(false)
    if (error) { showToast('❌ Erro: ' + error.message); return }
    setEntrou(data as QueueEntry)
    carregarFila()
  }

  // Agrupar fila em salas
  const salas: Record<string, QueueEntry[]> = {}
  fila.forEach(p => {
    if (!salas[p.sala_id]) salas[p.sala_id] = []
    salas[p.sala_id].push(p)
  })

  const s: any = {
    page: { minHeight: '100vh', background: '#08090c' },
    main: { maxWidth: 600, margin: '0 auto', padding: '1.5rem 1rem 3rem' },
    card: { background: '#0e1014', border: '1px solid #1c1f26', borderRadius: 14, padding: '1.25rem', marginBottom: '1rem' },
    inp: { width: '100%', background: '#14161b', border: '1px solid #1c1f26', borderRadius: 10, padding: '11px 14px', color: '#e8eaf0', fontSize: 15, fontFamily: "'Inter',sans-serif", outline: 'none', boxSizing: 'border-box', marginBottom: 10 },
    lbl: { fontSize: 11, color: '#4b5060', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 6, display: 'block' },
    btn: { width: '100%', background: '#4f7ef8', color: '#fff', border: 'none', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'Inter',sans-serif" },
  }

  return (
    <div style={s.page}>
      <Navbar />
      <main style={s.main}>

        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 4 }}>
            🎮 Fila Co-op 5x5
          </h1>
          <p style={{ fontSize: 14, color: '#4b5060' }}>
            Entre na fila e jogue ao vivo com o FSKATE! Grupos de 5 jogadores por partida.
          </p>
        </div>

        {toast && (
          <div style={{ background: '#0e1014', border: '1px solid #3ecf8e', borderRadius: 10, padding: '10px 16px', fontSize: 13, color: '#3ecf8e', marginBottom: '1rem', textAlign: 'center' }}>
            {toast}
          </div>
        )}

        {/* Confirmação de entrada */}
        {entrou ? (
          <div style={{ ...s.card, border: '1px solid rgba(79,126,248,0.3)', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎮</div>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
              Você está na fila!
            </h2>
            <p style={{ color: '#8b909e', fontSize: 14, marginBottom: '1.5rem' }}>
              Fique de olho na live — quando sua sala for chamada, entre na partida!
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: '1rem' }}>
              <div style={{ background: '#14161b', borderRadius: 10, padding: '14px' }}>
                <div style={{ fontSize: 11, color: '#4b5060', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 4 }}>Sua Sala</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 32, fontWeight: 800, color: '#4f7ef8' }}>#{entrou.sala_id}</div>
              </div>
              <div style={{ background: '#14161b', borderRadius: 10, padding: '14px' }}>
                <div style={{ fontSize: 11, color: '#4b5060', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 4 }}>Senha</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 32, fontWeight: 800, color: '#e8b84b' }}>{entrou.sala_senha}</div>
              </div>
            </div>

            <div style={{ background: 'rgba(232,184,75,0.08)', border: '1px solid rgba(232,184,75,0.2)', borderRadius: 10, padding: '12px', fontSize: 13, color: '#e8b84b', lineHeight: 1.6 }}>
              📺 Quando o FSKATE chamar a sala <strong>#{entrou.sala_id}</strong>, use a senha <strong>{entrou.sala_senha}</strong> para entrar na partida
            </div>

            <button onClick={() => { setEntrou(null); setNome(''); setContato('') }}
              style={{ marginTop: '1rem', background: 'none', border: '1px solid #1c1f26', borderRadius: 8, padding: '8px 16px', color: '#4b5060', fontSize: 13, cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>
              Sair da fila
            </button>
          </div>
        ) : (
          /* Formulário de entrada */
          <div style={s.card}>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
              Entrar na fila
            </h2>
            <label style={s.lbl}>Seu nome / nick *</label>
            <input style={s.inp} placeholder="Como te chamam no eFootball?" value={nome} onChange={e => setNome(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && entrarNaFila()} />
            <label style={s.lbl}>Contato (opcional)</label>
            <input style={s.inp} placeholder="WhatsApp ou usuário do eFootball" value={contato} onChange={e => setContato(e.target.value)} />
            <button style={{ ...s.btn, opacity: entrando ? 0.6 : 1 }} onClick={entrarNaFila} disabled={entrando}>
              {entrando ? 'Entrando...' : '🎮 Entrar na fila'}
            </button>
          </div>
        )}

        {/* Fila atual */}
        <div style={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: '#fff' }}>
              Fila atual
            </h2>
            <span style={{ fontSize: 13, color: '#4b5060' }}>{fila.length} na fila</span>
          </div>

          {fila.length === 0 ? (
            <p style={{ color: '#4b5060', textAlign: 'center', padding: '1.5rem', fontSize: 14 }}>
              Fila vazia — seja o primeiro! 🎮
            </p>
          ) : (
            Object.entries(salas).map(([salaId, jogadores]) => (
              <div key={salaId} style={{ background: '#14161b', borderRadius: 10, padding: '12px', marginBottom: 8, border: jogadores.length >= 3 ? '1px solid rgba(62,207,142,0.3)' : '1px solid #1c1f26' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, color: '#fff' }}>
                      Sala #{salaId}
                    </span>
                    {jogadores.length >= 3 && (
                      <span style={{ background: 'rgba(62,207,142,0.1)', color: '#3ecf8e', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, letterSpacing: '0.5px' }}>
                        COMPLETA
                      </span>
                    )}
                  </div>
                  <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 18, color: '#e8b84b' }}>
                    🔑 {jogadores[0]?.sala_senha}
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {jogadores.map((j, idx) => (
                    <span key={j.id} style={{ background: '#08090c', border: '1px solid #1c1f26', borderRadius: 20, padding: '4px 12px', fontSize: 13, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ width: 20, height: 20, background: '#4f7ef8', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{idx + 1}</span>
                      {j.player_name}
                    </span>
                  ))}
                  {Array.from({ length: Math.max(0, 5 - jogadores.length) }).map((_, i) => (
                    <span key={i} style={{ background: '#08090c', border: '1px dashed #252830', borderRadius: 20, padding: '4px 14px', fontSize: 13, color: '#374151' }}>
                      vaga livre
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Como funciona */}
        <div style={{ ...s.card, border: '1px solid #1c1f26' }}>
          <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: '0.875rem' }}>Como funciona</h3>
          {[
            ['1', 'Entre na fila com seu nome', '#4f7ef8'],
            ['2', 'Você entra em uma sala com mais 2 jogadores', '#8b5cf6'],
            ['3', 'Cada sala tem uma senha de 4 dígitos', '#e8b84b'],
            ['4', 'Quando o FSKATE chamar sua sala na live, use a senha para entrar', '#3ecf8e'],
          ].map(([num, txt, cor]) => (
            <div key={num} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ width: 24, height: 24, background: (cor as string) + '22', border: `1px solid ${cor}44`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: cor as string, flexShrink: 0 }}>{num}</div>
              <span style={{ fontSize: 13, color: '#8b909e', lineHeight: 1.5 }}>{txt}</span>
            </div>
          ))}
        </div>

      </main>
      <Footer />
    </div>
  )
}
