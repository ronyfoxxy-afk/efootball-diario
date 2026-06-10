'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

const G = {
  bg: '#09090b', surface: '#111115', surface2: '#18181c',
  border: '#1d1d20', text: '#e4e4e7', muted: '#71717a', dim: '#52525b',
  gold: '#fbe900', green: '#22d3a0', red: '#f87171',
}

const MODELOS = [
  { v: 'liga',           l: '🏆 Liga',              desc: 'Pontos corridos — todos jogam contra todos' },
  { v: 'copa',           l: '🥊 Copa',              desc: 'Mata-mata — eliminatória direta'            },
  { v: 'grupos_mata_mata', l: '⚡ Grupos + Mata-mata', desc: 'Fase de grupos e eliminatórias'          },
  { v: 'livre',          l: '🎮 Livre',             desc: 'Formato personalizado'                      },
]

function slugify(t: string) {
  return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-') + '-' + Date.now()
}

const inp: any = { width:'100%', background:G.surface2, border:`1px solid ${G.border}`, borderRadius:8, padding:'11px 14px', color:G.text, fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box', marginBottom:10 }
const lbl: any = { fontSize:10, color:G.dim, fontWeight:700, letterSpacing:'1.2px', textTransform:'uppercase', marginBottom:5, display:'block' }

type Step = 'form' | 'checkout' | 'aguardando' | 'sucesso'

export default function CriarTorneioPage() {
  const [step, setStep] = useState<Step>('form')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')
  const [checkoutUrl, setCheckoutUrl] = useState('')
  const [torneioId, setTorneioId] = useState('')
  const [torneioSlug, setTorneioSlug] = useState('')
  const [verificando, setVerificando] = useState(false)

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

  function showToast(m: string) { setToast(m); setTimeout(() => setToast(''), 4000) }

  async function criarEPagar() {
    if (!nome.trim())   { showToast('⚠️ Nome do torneio é obrigatório'); return }
    if (!pix.trim())    { showToast('⚠️ Chave Pix é obrigatória'); return }
    if (!criador.trim()){ showToast('⚠️ Seu nome é obrigatório'); return }
    setLoading(true)

    const sl = slugify(nome)

    // 1. Criar torneio como draft (aguardando pagamento)
    const { data: t, error } = await supabase.from('tournaments').insert({
      name: nome, slug: sl, model: modelo,
      status: 'draft',
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
      max_participants: parseInt(maxJogadores) || 16,
    }).select().single()

    if (error) { showToast('❌ ' + error.message); setLoading(false); return }

    // 2. Gerar checkout LivePix R$10
    try {
      const res = await fetch('/api/livepix/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: 'criacao', torneio_id: t.id, valor: 10, nome: criador })
      })
      const data = await res.json()
      if (data.checkoutUrl) {
        setCheckoutUrl(data.checkoutUrl)
        setTorneioId(t.id)
        setTorneioSlug(sl)
        setStep('checkout')
      } else {
        showToast('❌ ' + (data.error || 'Erro ao gerar pagamento LivePix'))
      }
    } catch (e: any) {
      showToast('❌ Erro ao conectar LivePix: ' + e.message)
    }
    setLoading(false)
  }

  // Verificar pagamento manualmente
  async function verificarPagamento() {
    if (!torneioId) return
    setVerificando(true)
    try {
      const res = await fetch(`/api/livepix/verificar?reference=${torneioId}`)
      const data = await res.json()
      if (data.status === 'paid' || data.status === 'confirmed') {
        // Ativar torneio
        await supabase.from('tournaments').update({
          status: 'open',
          creation_payment_status: 'confirmed'
        }).eq('id', torneioId)
        setStep('sucesso')
      } else {
        showToast('⏳ Pagamento ainda não confirmado. Aguarde alguns segundos e tente novamente.')
      }
    } catch {
      showToast('❌ Erro ao verificar. Tente novamente.')
    }
    setVerificando(false)
  }

  const card = { background: G.surface, border: `1px solid ${G.border}`, borderRadius: 14, padding: '1.25rem', marginBottom: 12 }
  const secTitle = (emoji: string, label: string, color = G.muted) => (
    <div style={{ fontSize: 10, color, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' as const, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
      <span>{emoji}</span>{label}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: G.bg }}>
      <Navbar />
      <main style={{ maxWidth: 580, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>

        {toast && (
          <div style={{ background: G.surface, border: `1px solid ${G.red}`, borderRadius: 10, padding: '10px 16px', fontSize: 13, color: G.red, marginBottom: '1rem', textAlign: 'center' }}>
            {toast}
          </div>
        )}

        {/* ── FORMULÁRIO ── */}
        {step === 'form' && (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 32, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                🏆 Criar Torneio
              </h1>
              <p style={{ fontSize: 14, color: G.dim, lineHeight: 1.6 }}>
                Crie seu campeonato de eFootball. Após preencher os dados, você será redirecionado para o <strong style={{ color: G.gold }}>LivePix</strong> para pagar a taxa de criação de <strong style={{ color: G.gold }}>R$10,00</strong>. O torneio fica público automaticamente após a confirmação.
              </p>
            </div>

            {/* Seus dados */}
            <div style={card}>
              {secTitle('👤', 'Seus dados', G.gold)}
              <label style={lbl}>Seu nome / nick *</label>
              <input style={inp} placeholder="Como te chamam?" value={criador} onChange={e => setCriador(e.target.value)} />
              <label style={lbl}>WhatsApp / contato</label>
              <input style={inp} placeholder="(21) 99999-9999" value={contato} onChange={e => setContato(e.target.value)} />
            </div>

            {/* Dados do torneio */}
            <div style={card}>
              {secTitle('🏆', 'Dados do torneio', G.text)}
              <label style={lbl}>Nome do torneio *</label>
              <input style={inp} placeholder="Ex: Copa FSKATE, Liga dos Craques..." value={nome} onChange={e => setNome(e.target.value)} />

              <label style={lbl}>Formato</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                {MODELOS.map(m => (
                  <button key={m.v} onClick={() => setModelo(m.v)}
                    style={{ padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', background: modelo === m.v ? 'rgba(232,184,75,0.08)' : G.surface2, outline: modelo === m.v ? `1px solid rgba(232,184,75,0.35)` : `1px solid ${G.border}` }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: modelo === m.v ? G.gold : G.muted, fontFamily: "'Barlow Condensed',sans-serif", textTransform: 'uppercase', letterSpacing: '0.5px' }}>{m.l}</div>
                    <div style={{ fontSize: 11, color: G.dim, marginTop: 2 }}>{m.desc}</div>
                  </button>
                ))}
              </div>

              <label style={lbl}>Descrição</label>
              <textarea style={{ ...inp, minHeight: 60, resize: 'vertical' as const }} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Conte sobre o torneio..." />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <div><label style={lbl}>Inscrição R$</label><input style={inp} type="number" value={taxa} onChange={e => setTaxa(e.target.value)} /></div>
                <div><label style={lbl}>Prêmio R$</label><input style={inp} type="number" value={premio} onChange={e => setPremio(e.target.value)} /></div>
                <div><label style={lbl}>Máx. jogadores</label><input style={inp} type="number" value={maxJogadores} onChange={e => setMaxJogadores(e.target.value)} /></div>
              </div>

              <label style={lbl}>Chave Pix para receber inscrições *</label>
              <input style={inp} placeholder="CPF, e-mail, telefone ou chave aleatória" value={pix} onChange={e => setPix(e.target.value)} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div><label style={lbl}>Data início</label><input style={inp} type="date" value={inicio} onChange={e => setInicio(e.target.value)} /></div>
                <div><label style={lbl}>Data fim</label><input style={inp} type="date" value={fim} onChange={e => setFim(e.target.value)} /></div>
              </div>

              <label style={lbl}>Regras</label>
              <textarea style={{ ...inp, minHeight: 60, resize: 'vertical' as const }} value={regras} onChange={e => setRegras(e.target.value)} placeholder="Regras e informações extras..." />
            </div>

            {/* Aviso taxa */}
            <div style={{ background: 'rgba(232,184,75,0.06)', border: '1px solid rgba(232,184,75,0.2)', borderRadius: 12, padding: '14px 16px', marginBottom: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>💰</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: G.gold, fontFamily: "'Barlow Condensed',sans-serif", textTransform: 'uppercase', letterSpacing: '0.5px' }}>Taxa de criação: R$10,00</div>
                <div style={{ fontSize: 12, color: G.dim, marginTop: 3, lineHeight: 1.6 }}>
                  Pago via LivePix ao confirmar. O torneio fica em rascunho e é publicado automaticamente após o pagamento ser confirmado.
                </div>
              </div>
            </div>

            <button onClick={criarEPagar} disabled={loading}
              style={{ width: '100%', background: G.gold, color: '#0a0800', border: 'none', borderRadius: 12, padding: '15px', fontSize: 15, fontWeight: 900, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Barlow Condensed',sans-serif", textTransform: 'uppercase', letterSpacing: 1, opacity: loading ? 0.6 : 1 }}>
              {loading ? '⏳ Criando...' : '💳 Criar e pagar R$10 via LivePix'}
            </button>
          </>
        )}

        {/* ── CHECKOUT ── */}
        {step === 'checkout' && (
          <div style={{ ...card, textAlign: 'center', padding: '2rem 1.5rem' }}>
            <div style={{ width: 64, height: 64, background: 'rgba(232,184,75,0.1)', border: '1px solid rgba(232,184,75,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 1.25rem' }}>
              💳
            </div>
            <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 26, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              Torneio criado!
            </h2>
            <p style={{ color: G.dim, fontSize: 14, lineHeight: 1.7, marginBottom: '1.5rem' }}>
              Agora pague a taxa de <strong style={{ color: G.gold }}>R$10,00</strong> via LivePix.<br />
              Após o pagamento, seu torneio é publicado automaticamente no site.
            </p>

            {/* Botão ir ao LivePix */}
            <a href={checkoutUrl} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: G.gold, color: '#0a0800', fontWeight: 900, fontSize: 15, padding: '14px 20px', borderRadius: 12, textDecoration: 'none', marginBottom: 10, fontFamily: "'Barlow Condensed',sans-serif", textTransform: 'uppercase', letterSpacing: 1 }}
              onClick={() => setTimeout(() => setStep('aguardando'), 2000)}>
              💰 Pagar R$10 no LivePix →
            </a>

            <button onClick={() => setStep('aguardando')}
              style={{ background: 'none', border: 'none', color: G.dim, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', marginTop: 4 }}>
              Já cliquei no link →
            </button>
          </div>
        )}

        {/* ── AGUARDANDO CONFIRMAÇÃO ── */}
        {step === 'aguardando' && (
          <div style={{ ...card, textAlign: 'center', padding: '2rem 1.5rem' }}>
            <div style={{ width: 64, height: 64, background: 'rgba(34,211,160,0.08)', border: '1px solid rgba(34,211,160,0.25)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 1.25rem' }}>
              ⏳
            </div>
            <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 26, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              Aguardando pagamento
            </h2>
            <p style={{ color: G.dim, fontSize: 14, lineHeight: 1.7, marginBottom: '1.5rem' }}>
              Após pagar no LivePix, clique em <strong style={{ color: G.green }}>Verificar pagamento</strong>.<br />
              Leva poucos segundos para confirmar.
            </p>

            <button onClick={verificarPagamento} disabled={verificando}
              style={{ width: '100%', background: G.green, color: '#041a10', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 900, cursor: verificando ? 'not-allowed' : 'pointer', fontFamily: "'Barlow Condensed',sans-serif", textTransform: 'uppercase', letterSpacing: 1, opacity: verificando ? 0.7 : 1, marginBottom: 10 }}>
              {verificando ? '🔄 Verificando...' : '✅ Verificar pagamento'}
            </button>

            <div style={{ display: 'flex', gap: 8 }}>
              <a href={checkoutUrl} target="_blank" rel="noopener noreferrer"
                style={{ flex: 1, display: 'block', background: G.surface2, border: `1px solid ${G.border}`, color: G.muted, fontWeight: 700, fontSize: 12, padding: '10px', borderRadius: 10, textDecoration: 'none', fontFamily: "'Barlow Condensed',sans-serif", textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: 'center' }}>
                💳 Abrir LivePix novamente
              </a>
            </div>

            <p style={{ fontSize: 11, color: G.dim, marginTop: 12, lineHeight: 1.6 }}>
              Pagamento não chegou? Contate o FSKATE no Discord.
            </p>
          </div>
        )}

        {/* ── SUCESSO ── */}
        {step === 'sucesso' && (
          <div style={{ ...card, textAlign: 'center', padding: '2rem 1.5rem' }}>
            <div style={{ width: 72, height: 72, background: 'rgba(34,211,160,0.1)', border: '1px solid rgba(34,211,160,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, margin: '0 auto 1.25rem' }}>
              🎉
            </div>
            <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 30, fontWeight: 900, color: G.green, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              Torneio publicado!
            </h2>
            <p style={{ color: G.dim, fontSize: 14, lineHeight: 1.7, marginBottom: '1.5rem' }}>
              Pagamento confirmado! Seu torneio já está visível na página de torneios. Boa sorte! 🏆
            </p>
            <Link href="/torneios"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: G.green, color: '#041a10', fontWeight: 900, fontSize: 15, padding: '14px 20px', borderRadius: 12, textDecoration: 'none', marginBottom: 10, fontFamily: "'Barlow Condensed',sans-serif", textTransform: 'uppercase', letterSpacing: 1 }}>
              Ver torneios →
            </Link>
            <Link href="/criar-torneio"
              style={{ display: 'block', fontSize: 12, color: G.dim, textDecoration: 'none', fontWeight: 600 }}>
              Criar outro torneio
            </Link>
          </div>
        )}

      </main>
      <Footer />
    </div>
  )
}
