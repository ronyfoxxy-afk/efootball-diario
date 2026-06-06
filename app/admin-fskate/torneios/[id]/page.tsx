'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'

const G = {
  green: '#00e56e', bg: '#060a0f', surface: '#0d1520', surface2: '#131e2e',
  border: 'rgba(255,255,255,0.07)', borderActive: 'rgba(0,229,110,0.4)',
  text: '#f0f4f8', muted: '#5a7190', gold: '#e8b84b', red: '#f87171', blue: '#0ea5e9'
}

export default function TorneioAdmin() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [torneio, setTorneio] = useState<any>(null)
  const [participantes, setParticipantes] = useState<any[]>([])
  const [partidas, setPartidas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'info'|'inscritos'|'partidas'>('info')
  const [toast, setToast] = useState('')
  const [saving, setSaving] = useState(false)

  // Edit form
  const [nome, setNome] = useState('')
  const [status, setStatus] = useState('')
  const [taxa, setTaxa] = useState('')
  const [premio, setPremio] = useState('')
  const [desc, setDesc] = useState('')
  const [regras, setRegras] = useState('')
  const [pix, setPix] = useState('')
  const [inicio, setInicio] = useState('')
  const [fim, setFim] = useState('')

  // Nova partida
  const [novaPartida, setNovaPartida] = useState({ p1: '', p2: '', data: '', hora: '' })
  // Resultado
  const [resultado, setResultado] = useState<{[k:string]: {g1: string, g2: string}}>({})

  function showToast(m: string) { setToast(m); setTimeout(() => setToast(''), 2500) }

  useEffect(() => { carregar() }, [id])

  async function carregar() {
    const { data: t } = await supabase.from('tournaments').select('*').eq('id', id).single()
    if (!t) { router.push('/admin-fskate'); return }
    setTorneio(t)
    setNome(t.name || ''); setStatus(t.status || 'open')
    setTaxa(String(t.entry_fee || 0)); setPremio(String(t.prize || 0))
    setDesc(t.description || ''); setRegras(t.rules || '')
    setPix(t.pix_key || ''); setInicio(t.start_date || ''); setFim(t.end_date || '')

    const { data: p } = await supabase.from('tournament_participants')
      .select('*').eq('tournament_id', id).order('created_at', { ascending: true })
    setParticipantes(p || [])

    const { data: m } = await supabase.from('tournament_matches')
      .select('*, home:home_participant_id(player_name), away:away_participant_id(player_name)')
      .eq('tournament_id', id).order('created_at', { ascending: true })
    setPartidas(m || [])
    setLoading(false)
  }

  async function salvar() {
    setSaving(true)
    const { error } = await supabase.from('tournaments').update({
      name: nome, status, entry_fee: parseFloat(taxa)||0,
      prize: parseFloat(premio)||0, description: desc||null,
      rules: regras||null, pix_key: pix||null,
      start_date: inicio||null, end_date: fim||null,
    }).eq('id', id)
    setSaving(false)
    if (error) { showToast('❌ ' + error.message); return }
    showToast('✅ Salvo!'); carregar()
  }

  async function confirmarPagamento(pid: string) {
    await supabase.from('tournament_participants').update({ payment_status: 'confirmed', paid_at: new Date().toISOString() }).eq('id', pid)
    showToast('✅ Pagamento confirmado!'); carregar()
  }

  async function removerParticipante(pid: string) {
    if (!confirm('Remover este participante?')) return
    await supabase.from('tournament_participants').delete().eq('id', pid)
    showToast('🗑️ Removido!'); carregar()
  }

  async function criarPartida() {
    if (!novaPartida.p1 || !novaPartida.p2) { showToast('⚠️ Selecione os dois jogadores'); return }
    if (novaPartida.p1 === novaPartida.p2) { showToast('⚠️ Jogadores iguais!'); return }

    // Buscar ou criar round
    let { data: round } = await supabase.from('tournament_rounds')
      .select('id').eq('tournament_id', id).eq('status', 'pending').limit(1).single()
    if (!round) {
      const { data: nr } = await supabase.from('tournament_rounds').insert({
        tournament_id: id, round_number: 1, name: 'Rodada 1', status: 'pending'
      }).select().single()
      round = nr
    }

    const { error } = await supabase.from('tournament_matches').insert({
      tournament_id: id, round_id: round?.id,
      home_participant_id: novaPartida.p1,
      away_participant_id: novaPartida.p2,
      status: 'pending',
    })
    if (error) { showToast('❌ ' + error.message); return }
    showToast('⚽ Partida criada!'); setNovaPartida({ p1: '', p2: '', data: '', hora: '' }); carregar()
  }

  async function salvarResultado(matchId: string) {
    const r = resultado[matchId]
    if (!r) return
    const h = parseInt(r.g1) || 0
    const a = parseInt(r.g2) || 0
    const { error } = await supabase.from('tournament_matches').update({
      home_score: h, away_score: a, status: 'confirmed', confirmed_at: new Date().toISOString()
    }).eq('id', matchId)
    if (error) { showToast('❌ ' + error.message); return }
    showToast('⚽ Resultado salvo!'); carregar()
  }

  const inp: any = { width:'100%', background:G.surface2, border:`1px solid ${G.border}`, borderRadius:10, padding:'10px 13px', color:G.text, fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box', marginBottom:10 }
  const lbl: any = { fontSize:11, color:G.muted, fontWeight:700, letterSpacing:'1.2px', textTransform:'uppercase', marginBottom:5, display:'flex', alignItems:'center', gap:6 }
  const dot: any = { width:5, height:5, background:G.green, borderRadius:'50%', display:'inline-block' }

  if (loading) return <div style={{ minHeight:'100vh', background:G.bg, display:'flex', alignItems:'center', justifyContent:'center', color:G.muted, fontFamily:'inherit' }}>Carregando...</div>

  const pagos = participantes.filter(p => p.payment_status === 'confirmed').length
  const pendentes = participantes.filter(p => p.payment_status === 'pending').length

  return (
    <div style={{ minHeight:'100vh', background:G.bg, color:G.text, fontFamily:"'Barlow', 'Inter', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=Barlow:wght@400;500&display=swap')`}</style>

      {/* Header */}
      <header style={{ background:G.surface, borderBottom:`1px solid ${G.border}`, padding:'0 1rem', height:56, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky' as const, top:0, zIndex:50 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <a href="/admin-fskate" style={{ color:G.muted, textDecoration:'none', fontSize:20 }}>←</a>
          <div>
            <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, fontSize:16, color:G.text, textTransform:'uppercase', letterSpacing:'0.5px' }}>{torneio.name}</div>
            <div style={{ fontSize:10, color:G.muted, letterSpacing:'1.5px', textTransform:'uppercase', fontWeight:700 }}>Gerenciar Torneio</div>
          </div>
        </div>
        <button onClick={salvar} disabled={saving}
          style={{ background:G.green, color:'#030f06', border:'none', borderRadius:8, padding:'8px 18px', fontSize:12, fontWeight:700, letterSpacing:'1px', textTransform:'uppercase' as const, cursor:'pointer', opacity:saving?0.5:1, fontFamily:'inherit' }}>
          {saving ? '...' : '💾 Salvar'}
        </button>
      </header>

      {toast && <div style={{ position:'fixed' as const, top:66, left:'50%', transform:'translateX(-50%)', background:G.surface, border:`1px solid ${G.green}`, borderRadius:10, padding:'10px 22px', fontSize:13, color:G.green, zIndex:300, whiteSpace:'nowrap' as const }}>{toast}</div>}

      {/* Stats rápidos */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, padding:'1rem', maxWidth:860, margin:'0 auto' }}>
        {[
          { l:'Inscritos', v:participantes.length, c:G.blue },
          { l:'Pagos', v:pagos, c:G.green },
          { l:'Pendentes', v:pendentes, c:G.gold },
          { l:'Partidas', v:partidas.length, c:'#8b5cf6' },
        ].map(s => (
          <div key={s.l} style={{ background:G.surface, border:`1px solid ${G.border}`, borderRadius:10, padding:'12px', textAlign:'center' as const }}>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:26, color:s.c }}>{s.v}</div>
            <div style={{ fontSize:10, color:G.muted, fontWeight:700, letterSpacing:'1px', textTransform:'uppercase' as const, marginTop:2 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', borderBottom:`1px solid ${G.border}`, maxWidth:860, margin:'0 auto', padding:'0 1rem' }}>
        {[['info','⚙️ Informações'],['inscritos','👥 Inscritos'],['partidas','⚽ Partidas']].map(([t,l]) => (
          <button key={t} onClick={() => setTab(t as any)}
            style={{ padding:'12px 18px', background:'none', border:'none', borderBottom:`2px solid ${tab===t?G.green:'transparent'}`, color:tab===t?G.green:G.muted, fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:13, letterSpacing:'0.8px', textTransform:'uppercase' as const, cursor:'pointer' }}>
            {l}
          </button>
        ))}
      </div>

      <div style={{ maxWidth:860, margin:'0 auto', padding:'1.25rem 1rem 3rem' }}>

        {/* INFO */}
        {tab === 'info' && (
          <div style={{ background:G.surface, border:`1px solid ${G.border}`, borderRadius:14, padding:'1.25rem' }}>
            <div style={lbl}><span style={dot}/>Nome</div>
            <input style={inp} value={nome} onChange={e => setNome(e.target.value)} />

            <div style={lbl}><span style={dot}/>Status</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:10 }}>
              {['open','in_progress','finished','cancelled','draft'].map(s => (
                <button key={s} onClick={() => setStatus(s)}
                  style={{ padding:'6px 12px', borderRadius:6, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:11, fontWeight:700, letterSpacing:'0.8px', textTransform:'uppercase' as const, background:status===s?G.green+'22':G.surface2, color:status===s?G.green:G.muted, outline:status===s?`1px solid ${G.borderActive}`:`1px solid ${G.border}` }}>
                  {s==='open'?'Aberto':s==='in_progress'?'Em andamento':s==='finished'?'Finalizado':s==='cancelled'?'Cancelado':'Rascunho'}
                </button>
              ))}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div><div style={lbl}><span style={dot}/>Inscrição R$</div><input style={inp} type="number" value={taxa} onChange={e => setTaxa(e.target.value)} /></div>
              <div><div style={lbl}><span style={dot}/>Prêmio R$</div><input style={inp} type="number" value={premio} onChange={e => setPremio(e.target.value)} /></div>
            </div>

            <div style={lbl}><span style={dot}/>Chave Pix</div>
            <input style={inp} value={pix} onChange={e => setPix(e.target.value)} />

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div><div style={lbl}><span style={dot}/>Início</div><input style={{ ...inp }} type="date" value={inicio} onChange={e => setInicio(e.target.value)} /></div>
              <div><div style={lbl}><span style={dot}/>Fim</div><input style={{ ...inp }} type="date" value={fim} onChange={e => setFim(e.target.value)} /></div>
            </div>

            <div style={lbl}><span style={dot}/>Descrição</div>
            <textarea style={{ ...inp, minHeight:64, resize:'vertical' as const }} value={desc} onChange={e => setDesc(e.target.value)} />

            <div style={lbl}><span style={dot}/>Regras</div>
            <textarea style={{ ...inp, minHeight:80, resize:'vertical' as const }} value={regras} onChange={e => setRegras(e.target.value)} />

            <button onClick={salvar} disabled={saving}
              style={{ background:G.green, color:'#030f06', border:'none', borderRadius:10, padding:'12px', fontSize:14, fontWeight:700, cursor:'pointer', width:'100%', fontFamily:'inherit', opacity:saving?0.5:1 }}>
              {saving?'Salvando...':'💾 Salvar alterações'}
            </button>
          </div>
        )}

        {/* INSCRITOS */}
        {tab === 'inscritos' && (
          <>
            {participantes.length === 0 && (
              <div style={{ background:G.surface, border:`1px solid ${G.border}`, borderRadius:12, padding:'2rem', textAlign:'center' as const, color:G.muted }}>Nenhum inscrito ainda</div>
            )}
            {participantes.map((p, i) => (
              <div key={p.id} style={{ background:G.surface, border:`1px solid ${p.payment_status==='confirmed'?G.borderActive:G.border}`, borderRadius:12, padding:'12px 14px', marginBottom:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                      <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:15, color:G.text }}>{i+1}. {p.player_name}</span>
                      <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:20, textTransform:'uppercase' as const, letterSpacing:'0.5px', background:p.payment_status==='confirmed'?'rgba(0,229,110,0.1)':'rgba(232,184,75,0.1)', color:p.payment_status==='confirmed'?G.green:G.gold }}>
                        {p.payment_status==='confirmed'?'✅ Pago':'⏳ Pendente'}
                      </span>
                    </div>
                    {p.contact && <div style={{ fontSize:12, color:G.muted }}>📱 {p.contact}</div>}
                    {p.notes && <div style={{ fontSize:11, color:G.muted, marginTop:2 }}>{p.notes}</div>}
                  </div>
                  <div style={{ display:'flex', gap:6, flexShrink:0, marginLeft:10 }}>
                    {p.payment_status !== 'confirmed' && (
                      <button onClick={() => confirmarPagamento(p.id)}
                        style={{ background:'rgba(0,229,110,0.1)', color:G.green, border:`1px solid rgba(0,229,110,0.25)`, borderRadius:7, padding:'5px 10px', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                        ✅ Confirmar
                      </button>
                    )}
                    <button onClick={() => removerParticipante(p.id)}
                      style={{ background:'rgba(248,113,113,0.08)', color:G.red, border:`1px solid rgba(248,113,113,0.2)`, borderRadius:7, padding:'5px 10px', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* PARTIDAS */}
        {tab === 'partidas' && (
          <>
            {/* Criar partida */}
            <div style={{ background:G.surface, border:`1px solid ${G.border}`, borderRadius:14, padding:'1.25rem', marginBottom:'1rem' }}>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:13, color:G.muted, letterSpacing:'1.5px', textTransform:'uppercase' as const, marginBottom:14 }}>⚽ Nova Partida</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                <div>
                  <div style={lbl}><span style={dot}/>Jogador 1 (Casa)</div>
                  <select style={{ ...inp, marginBottom:0 }} value={novaPartida.p1} onChange={e => setNovaPartida({...novaPartida, p1:e.target.value})}>
                    <option value="">Selecionar...</option>
                    {participantes.map(p => <option key={p.id} value={p.id}>{p.player_name}</option>)}
                  </select>
                </div>
                <div>
                  <div style={lbl}><span style={dot}/>Jogador 2 (Fora)</div>
                  <select style={{ ...inp, marginBottom:0 }} value={novaPartida.p2} onChange={e => setNovaPartida({...novaPartida, p2:e.target.value})}>
                    <option value="">Selecionar...</option>
                    {participantes.map(p => <option key={p.id} value={p.id}>{p.player_name}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={criarPartida}
                style={{ background:G.green, color:'#030f06', border:'none', borderRadius:10, padding:'11px', fontSize:13, fontWeight:700, cursor:'pointer', width:'100%', fontFamily:'inherit', letterSpacing:'0.8px', textTransform:'uppercase' as const }}>
                ⚽ Criar Partida
              </button>
            </div>

            {/* Lista de partidas */}
            {partidas.length === 0 && (
              <div style={{ background:G.surface, border:`1px solid ${G.border}`, borderRadius:12, padding:'2rem', textAlign:'center' as const, color:G.muted }}>Nenhuma partida criada ainda</div>
            )}
            {partidas.map(m => (
              <div key={m.id} style={{ background:G.surface, border:`1px solid ${m.status==='confirmed'?G.borderActive:G.border}`, borderRadius:12, padding:'12px 14px', marginBottom:8 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:15, color:G.text }}>
                      {m.home?.player_name || '?'} <span style={{ color:G.muted }}>vs</span> {m.away?.player_name || '?'}
                    </span>
                  </div>
                  <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, textTransform:'uppercase' as const, background:m.status==='confirmed'?'rgba(0,229,110,0.1)':'rgba(90,113,144,0.15)', color:m.status==='confirmed'?G.green:G.muted }}>
                    {m.status==='confirmed'?`${m.home_score} × ${m.away_score}`:m.status}
                  </span>
                </div>

                {m.status !== 'confirmed' && (
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <input placeholder="Gols casa" type="number" min="0" max="99"
                      value={resultado[m.id]?.g1||''} onChange={e => setResultado({...resultado, [m.id]:{...resultado[m.id], g1:e.target.value}})}
                      style={{ ...inp, marginBottom:0, width:90, textAlign:'center' as const }} />
                    <span style={{ color:G.muted, fontWeight:700 }}>×</span>
                    <input placeholder="Gols fora" type="number" min="0" max="99"
                      value={resultado[m.id]?.g2||''} onChange={e => setResultado({...resultado, [m.id]:{...resultado[m.id], g2:e.target.value}})}
                      style={{ ...inp, marginBottom:0, width:90, textAlign:'center' as const }} />
                    <button onClick={() => salvarResultado(m.id)}
                      style={{ background:G.green, color:'#030f06', border:'none', borderRadius:8, padding:'8px 14px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' as const }}>
                      ✅ Confirmar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
