'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const MODELOS = [
  { v: 'liga', l: '🏆 Liga (Brasileirão)', desc: 'Pontos corridos, todos jogam contra todos' },
  { v: 'copa', l: '🥊 Copa (Eliminatória)', desc: 'Mata-mata, ideal para fins de semana' },
  { v: 'grupos_mata_mata', l: '⚡ Grupos + Mata-mata', desc: 'Fase de grupos e eliminatórias' },
  { v: 'livre', l: '🎮 Livre', desc: 'Formato personalizado' },
]

export default function CriarTorneioPage() {
  const [step, setStep] = useState<'form' | 'pagamento' | 'sucesso'>('form')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')

  // Form
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

  const [checkoutUrl, setCheckoutUrl] = useState('')
  const [torneioId, setTorneioId] = useState('')

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  function slug(t: string) {
    return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').substring(0, 80) + '-' + Date.now()
  }

  async function criarEPagar() {
    if (!nome.trim()) { showToast('⚠️ Nome do torneio obrigatório'); return }
    if (!pix.trim()) { showToast('⚠️ Chave Pix obrigatória'); return }
    if (!criador.trim()) { showToast('⚠️ Seu nome é obrigatório'); return }
    setLoading(true)

    // 1. Criar torneio como draft
    const sl = slug(nome)
    const { data: t, error } = await supabase.from('tournaments').insert({
      name: nome, slug: sl, model: modelo, status: 'draft',
      description: desc || null,
      entry_fee: parseFloat(taxa) || 0,
      prize: parseFloat(premio) || 0,
      pix_key: pix,
      start_date: inicio || null,
      end_date: fim || null,
      rules: regras || null,
      created_by_user: criador,
      creator_contact: contato || null,
      creation_fee: 10,
      creation_payment_status: 'pending',
      is_user_created: true,
    }).select().single()

    if (error) { showToast('❌ ' + error.message); setLoading(false); return }
    setTorneioId(t.id)

    // 2. Gerar checkout LivePix R$10
    try {
      const res = await fetch('/api/livepix/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participante_id: t.id,
          torneio_id: t.id,
          valor: 10,
          nome: criador,
          tipo: 'criacao_torneio'
        }),
      })
      const data = await res.json()
      if (data.checkoutUrl) {
        setCheckoutUrl(data.checkoutUrl)
        setStep('pagamento')
      } else {
        showToast('❌ Erro ao gerar pagamento')
      }
    } catch (e) {
      showToast('❌ Erro ao conectar LivePix')
    }
    setLoading(false)
  }

  const inp: any = { width: '100%', background: '#14161b', border: '1px solid #1c1f26', borderRadius: 10, padding: '11px 14px', color: '#e8eaf0', fontSize: 14, fontFamily: "'Inter',sans-serif", outline: 'none', boxSizing: 'border-box', marginBottom: 10 }
  const lbl: any = { fontSize: 11, color: '#4b5060', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 6, display: 'block' }

  return (
    <div style={{ minHeight: '100vh', background: '#08090c' }}>
      <Navbar />
      <main style={{ maxWidth: 600, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>

        {toast && (
          <div style={{ background: '#0e1014', border: '1px solid #ef4444', borderRadius: 10, padding: '10px 16px', fontSize: 13, color: '#ef4444', marginBottom: '1rem', textAlign: 'center' }}>
            {toast}
          </div>
        )}

        {/* STEP 1: Formulário */}
        {step === 'form' && (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 4 }}>
                🏆 Criar Torneio
              </h1>
              <p style={{ fontSize: 14, color: '#4b5060' }}>
                Crie seu próprio torneio de eFootball e convide os jogadores!
              </p>
            </div>

            {/* Taxa info */}
            <div style={{ background: 'rgba(232,184,75,0.06)', border: '1px solid rgba(232,184,75,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>💰</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#e8b84b' }}>Taxa de criação: R$10,00</div>
                <div style={{ fontSize: 12, color: '#4b5060' }}>Pago via LivePix após preencher o formulário</div>
              </div>
            </div>

            <div style={{ background: '#0e1014', border: '1px solid #1c1f26', borderRadius: 14, padding: '1.25rem' }}>
              <label style={lbl}>Seu nome *</label>
              <input style={inp} placeholder="Quem está criando o torneio?" value={criador} onChange={e => setCriador(e.target.value)} />

              <label style={lbl}>Contato (WhatsApp)</label>
              <input style={inp} placeholder="Para falar sobre o torneio" value={contato} onChange={e => setContato(e.target.value)} />

              <div style={{ height: 1, background: '#1c1f26', margin: '12px 0' }} />

              <label style={lbl}>Nome do torneio *</label>
              <input style={inp} placeholder="Ex: Copa FSKATE, Liga dos Craque..." value={nome} onChange={e => setNome(e.target.value)} />

              <label style={lbl}>Formato</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                {MODELOS.map(m => (
                  <button key={m.v} onClick={() => setModelo(m.v)}
                    style={{ padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: "'Inter',sans-serif", textAlign: 'left',
                      background: modelo === m.v ? 'rgba(79,126,248,0.12)' : '#14161b',
                      outline: modelo === m.v ? '1px solid rgba(79,126,248,0.4)' : '1px solid #1c1f26' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: modelo === m.v ? '#4f7ef8' : '#8b909e' }}>{m.l}</div>
                    <div style={{ fontSize: 12, color: '#4b5060', marginTop: 1 }}>{m.desc}</div>
                  </button>
                ))}
              </div>

              <label style={lbl}>Descrição</label>
              <textarea style={{ ...inp, minHeight: 64, resize: 'vertical' }} placeholder="Descreva o torneio..." value={desc} onChange={e => setDesc(e.target.value)} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={lbl}>Inscrição (R$)</label>
                  <input style={inp} type="number" value={taxa} onChange={e => setTaxa(e.target.value)} />
                </div>
                <div>
                  <label style={lbl}>Prêmio (R$)</label>
                  <input style={inp} type="number" value={premio} onChange={e => setPremio(e.target.value)} />
                </div>
              </div>

              <label style={lbl}>Chave Pix para inscrições *</label>
              <input style={inp} placeholder="CPF, e-mail ou telefone" value={pix} onChange={e => setPix(e.target.value)} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><label style={lbl}>Data início</label><input style={inp} type="date" value={inicio} onChange={e => setInicio(e.target.value)} /></div>
                <div><label style={lbl}>Data fim</label><input style={inp} type="date" value={fim} onChange={e => setFim(e.target.value)} /></div>
              </div>

              <label style={lbl}>Regras</label>
              <textarea style={{ ...inp, minHeight: 64, resize: 'vertical' }} placeholder="Regras e informações extras..." value={regras} onChange={e => setRegras(e.target.value)} />

              <button onClick={criarEPagar} disabled={loading}
                style={{ width: '100%', background: '#e8b84b', color: '#000', border: 'none', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Inter',sans-serif", opacity: loading ? 0.6 : 1, marginTop: 8 }}>
                {loading ? 'Criando...' : '💳 Criar e pagar R$10'}
              </button>
            </div>
          </>
        )}

        {/* STEP 2: Pagamento */}
        {step === 'pagamento' && (
          <div style={{ background: '#0e1014', border: '1px solid #1c1f26', borderRadius: 14, padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💳</div>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
              Quase lá!
            </h2>
            <p style={{ color: '#8b909e', fontSize: 14, lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Seu torneio foi criado! Agora pague a taxa de R$10,00 via LivePix para publicá-lo no site.
            </p>
            <a href={checkoutUrl} target="_blank" rel="noopener noreferrer"
              style={{ display: 'block', background: '#e8b84b', color: '#000', fontWeight: 700, fontSize: 16, padding: '14px 20px', borderRadius: 12, textDecoration: 'none', marginBottom: 12 }}>
              💰 Pagar R$10 no LivePix →
            </a>
            <p style={{ fontSize: 12, color: '#4b5060' }}>
              Após o pagamento, seu torneio será publicado automaticamente
            </p>
            <button onClick={() => setStep('sucesso')}
              style={{ marginTop: '1rem', background: 'none', border: '1px solid #1c1f26', borderRadius: 8, padding: '8px 16px', color: '#4b5060', fontSize: 13, cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>
              Já paguei →
            </button>
          </div>
        )}

        {/* STEP 3: Sucesso */}
        {step === 'sucesso' && (
          <div style={{ background: '#0e1014', border: '1px solid #1c1f26', borderRadius: 14, padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
              Torneio criado!
            </h2>
            <p style={{ color: '#8b909e', fontSize: 14, lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Assim que o pagamento for confirmado, seu torneio aparecerá na página de torneios!
            </p>
            <a href="/torneios" style={{ display: 'block', background: '#4f7ef8', color: '#fff', fontWeight: 700, fontSize: 15, padding: '12px 20px', borderRadius: 10, textDecoration: 'none', marginBottom: 10 }}>
              Ver torneios →
            </a>
            <a href="/criar-torneio" style={{ display: 'block', fontSize: 13, color: '#4b5060', textDecoration: 'none' }}>
              Criar outro torneio
            </a>
          </div>
        )}

      </main>
      <Footer />
    </div>
  )
}
