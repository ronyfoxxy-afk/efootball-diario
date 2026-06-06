'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const MODELOS = [
  { v: 'liga', l: '🏆 Liga', desc: 'Pontos corridos — todos jogam contra todos' },
  { v: 'copa', l: '🥊 Copa', desc: 'Mata-mata — eliminatória direta' },
  { v: 'grupos_mata_mata', l: '⚡ Grupos + Mata-mata', desc: 'Fase de grupos e eliminatórias' },
  { v: 'livre', l: '🎮 Livre', desc: 'Formato personalizado' },
]

function slugify(t: string) {
  return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-') + '-' + Date.now()
}

export default function CriarTorneioPage() {
  const [step, setStep] = useState<'form'|'checkout'|'sucesso'>('form')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')
  const [checkoutUrl, setCheckoutUrl] = useState('')
  const [torneioSlug, setTorneioSlug] = useState('')

  const [nome, setNome] = useState('')
  const [modelo, setModelo] = useState('copa')
  const [desc, setDesc] = useState('')
  const [taxa, setTaxa] = useState('20')
  const [premio, setPremio] = useState('50')
  const [pix, setPix] = useState('')
  const [inicio, setInicio] = useState('')
  const [fim, setFim] = useState('')
  const [regras, setRegras] = useState('')
  const [criador, setCriador] = useState('')
  const [contato, setContato] = useState('')
  const [maxJogadores, setMaxJogadores] = useState('16')

  function showToast(m: string) { setToast(m); setTimeout(() => setToast(''), 3000) }

  async function criarEPagar() {
    if (!nome.trim()) { showToast('⚠️ Nome do torneio obrigatório'); return }
    if (!pix.trim()) { showToast('⚠️ Chave Pix obrigatória'); return }
    if (!criador.trim()) { showToast('⚠️ Seu nome é obrigatório'); return }
    setLoading(true)

    const sl = slugify(nome)
    const { data: t, error } = await supabase.from('tournaments').insert({
      name: nome, slug: sl, model: modelo,
      status: 'draft', // só abre após pagamento
      description: desc || null,
      entry_fee: parseFloat(taxa) || 0,
      prize: parseFloat(premio) || 0,
      pix_key: pix,
      start_date: inicio || null, end_date: fim || null,
      rules: regras || null,
      created_by_user: criador,
      creator_contact: contato || null,
      creation_fee: 10,
      creation_payment_status: 'pending',
      is_user_created: true,
      max_participants: parseInt(maxJogadores) || 16,
    }).select().single()

    if (error) { showToast('❌ ' + error.message); setLoading(false); return }

    // Gerar checkout LivePix R$10
    try {
      const res = await fetch('/api/livepix/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: 'criacao', torneio_id: t.id, valor: 10, nome: criador })
      })
      const data = await res.json()
      if (data.checkoutUrl) {
        setCheckoutUrl(data.checkoutUrl)
        setTorneioSlug(sl)
        setStep('checkout')
      } else {
        showToast('❌ Erro ao gerar pagamento')
      }
    } catch { showToast('❌ Erro ao conectar LivePix') }
    setLoading(false)
  }

  const inp: any = { width:'100%', background:'#0e1014', border:'1px solid #1c1f26', borderRadius:10, padding:'11px 14px', color:'#e8eaf0', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box', marginBottom:10 }
  const lbl: any = { fontSize:11, color:'#4b5060', fontWeight:600, letterSpacing:'0.8px', textTransform:'uppercase', marginBottom:6, display:'block' }

  return (
    <div style={{ minHeight:'100vh', background:'#08090c' }}>
      <Navbar />
      <main style={{ maxWidth:580, margin:'0 auto', padding:'1.5rem 1rem 3rem' }}>

        {toast && <div style={{ background:'#0e1014', border:'1px solid #ef4444', borderRadius:10, padding:'10px 16px', fontSize:13, color:'#ef4444', marginBottom:'1rem', textAlign:'center' as const }}>{toast}</div>}

        {step === 'form' && (
          <>
            <div style={{ marginBottom:'1.5rem' }}>
              <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:26, fontWeight:800, color:'#fff', marginBottom:4 }}>🏆 Criar Torneio</h1>
              <p style={{ fontSize:14, color:'#4b5060' }}>Crie seu campeonato de eFootball. Taxa de criação: <strong style={{ color:'#e8b84b' }}>R$10,00 via LivePix</strong></p>
            </div>

            {/* Seus dados */}
            <div style={{ background:'#0e1014', border:'1px solid #1c1f26', borderRadius:14, padding:'1.25rem', marginBottom:12 }}>
              <div style={{ fontSize:11, color:'#e8b84b', fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase' as const, marginBottom:14 }}>👤 Seus dados</div>
              <label style={lbl}>Seu nome *</label>
              <input style={inp} placeholder="Como te chamam?" value={criador} onChange={e => setCriador(e.target.value)} />
              <label style={lbl}>WhatsApp para contato</label>
              <input style={inp} placeholder="(21) 99999-9999" value={contato} onChange={e => setContato(e.target.value)} />
            </div>

            {/* Dados do torneio */}
            <div style={{ background:'#0e1014', border:'1px solid #1c1f26', borderRadius:14, padding:'1.25rem', marginBottom:12 }}>
              <div style={{ fontSize:11, color:'#4f7ef8', fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase' as const, marginBottom:14 }}>🏆 Dados do torneio</div>

              <label style={lbl}>Nome do torneio *</label>
              <input style={inp} placeholder="Ex: Copa FSKATE, Liga dos Craques..." value={nome} onChange={e => setNome(e.target.value)} />

              <label style={lbl}>Formato</label>
              <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:10 }}>
                {MODELOS.map(m => (
                  <button key={m.v} onClick={() => setModelo(m.v)}
                    style={{ padding:'10px 14px', borderRadius:10, border:'none', cursor:'pointer', fontFamily:'inherit', textAlign:'left' as const, background:modelo===m.v?'rgba(79,126,248,0.12)':'#14161b', outline:modelo===m.v?'1px solid rgba(79,126,248,0.4)':'1px solid #1c1f26' }}>
                    <div style={{ fontSize:13, fontWeight:600, color:modelo===m.v?'#4f7ef8':'#8b909e' }}>{m.l}</div>
                    <div style={{ fontSize:11, color:'#4b5060', marginTop:1 }}>{m.desc}</div>
                  </button>
                ))}
              </div>

              <label style={lbl}>Descrição</label>
              <textarea style={{ ...inp, minHeight:60, resize:'vertical' as const }} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Conte sobre o torneio..." />

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                <div><label style={lbl}>Inscrição R$</label><input style={inp} type="number" value={taxa} onChange={e => setTaxa(e.target.value)} /></div>
                <div><label style={lbl}>Prêmio R$</label><input style={inp} type="number" value={premio} onChange={e => setPremio(e.target.value)} /></div>
                <div><label style={lbl}>Máx. jogadores</label><input style={inp} type="number" value={maxJogadores} onChange={e => setMaxJogadores(e.target.value)} /></div>
              </div>

              <label style={lbl}>Chave Pix para receber inscrições *</label>
              <input style={inp} placeholder="CPF, e-mail ou telefone" value={pix} onChange={e => setPix(e.target.value)} />

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                <div><label style={lbl}>Data início</label><input style={inp} type="date" value={inicio} onChange={e => setInicio(e.target.value)} /></div>
                <div><label style={lbl}>Data fim</label><input style={inp} type="date" value={fim} onChange={e => setFim(e.target.value)} /></div>
              </div>

              <label style={lbl}>Regras</label>
              <textarea style={{ ...inp, minHeight:60, resize:'vertical' as const }} value={regras} onChange={e => setRegras(e.target.value)} placeholder="Regras e informações extras..." />
            </div>

            {/* Resumo taxa */}
            <div style={{ background:'rgba(232,184,75,0.06)', border:'1px solid rgba(232,184,75,0.2)', borderRadius:12, padding:'12px 16px', marginBottom:16, display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:20 }}>💰</span>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:'#e8b84b' }}>Taxa de criação: R$10,00</div>
                <div style={{ fontSize:12, color:'#4b5060' }}>Pago via LivePix após confirmar. Torneio fica público somente após pagamento.</div>
              </div>
            </div>

            <button onClick={criarEPagar} disabled={loading}
              style={{ width:'100%', background:'#e8b84b', color:'#000', border:'none', borderRadius:12, padding:'14px', fontSize:15, fontWeight:700, cursor:loading?'not-allowed':'pointer', fontFamily:'inherit', opacity:loading?0.6:1 }}>
              {loading ? 'Criando...' : '💳 Criar e pagar R$10'}
            </button>
          </>
        )}

        {step === 'checkout' && (
          <div style={{ background:'#0e1014', border:'1px solid #1c1f26', borderRadius:14, padding:'2rem', textAlign:'center' as const }}>
            <div style={{ fontSize:48, marginBottom:16 }}>💳</div>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, color:'#fff', marginBottom:8 }}>Quase lá!</h2>
            <p style={{ color:'#8b909e', fontSize:14, lineHeight:1.6, marginBottom:'1.5rem' }}>
              Torneio criado! Pague a taxa de <strong style={{ color:'#e8b84b' }}>R$10,00</strong> para publicá-lo. Após o pagamento, o torneio aparece automaticamente no site.
            </p>
            <a href={checkoutUrl} target="_blank" rel="noopener noreferrer"
              style={{ display:'block', background:'#e8b84b', color:'#000', fontWeight:700, fontSize:16, padding:'14px 20px', borderRadius:12, textDecoration:'none', marginBottom:12 }}>
              💰 Pagar R$10 no LivePix →
            </a>
            <p style={{ fontSize:12, color:'#4b5060', marginBottom:16 }}>Após confirmar o pagamento no LivePix, volte aqui.</p>
            <button onClick={() => setStep('sucesso')}
              style={{ background:'none', border:'1px solid #1c1f26', borderRadius:8, padding:'8px 18px', color:'#4b5060', fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>
              Já paguei →
            </button>
          </div>
        )}

        {step === 'sucesso' && (
          <div style={{ background:'#0e1014', border:'1px solid #1c1f26', borderRadius:14, padding:'2rem', textAlign:'center' as const }}>
            <div style={{ fontSize:56, marginBottom:16 }}>🎉</div>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:24, fontWeight:800, color:'#fff', marginBottom:8 }}>Torneio criado!</h2>
            <p style={{ color:'#8b909e', fontSize:14, lineHeight:1.6, marginBottom:'1.5rem' }}>
              Assim que o pagamento for confirmado, seu torneio aparecerá na página de torneios!
            </p>
            <a href="/torneios" style={{ display:'block', background:'#4f7ef8', color:'#fff', fontWeight:700, fontSize:15, padding:'12px 20px', borderRadius:10, textDecoration:'none', marginBottom:10 }}>Ver torneios →</a>
            <a href="/criar-torneio" style={{ display:'block', fontSize:13, color:'#4b5060', textDecoration:'none' }}>Criar outro torneio</a>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
