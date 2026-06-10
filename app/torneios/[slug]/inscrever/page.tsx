'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

const HORARIOS = [
  '08h - 10h', '10h - 12h', '12h - 14h', '14h - 16h',
  '16h - 18h', '18h - 20h', '20h - 22h', '22h - 00h'
]

const DIAS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

export default function InscreverPage() {
  const params = useParams()
  const slug = params.slug as string

  const [torneio, setTorneio] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  // Form
  const [nome, setNome] = useState('')
  const [contato, setContato] = useState('')
  const [time, setTime] = useState('')
  const [dias, setDias] = useState<string[]>([])
  const [horarios, setHorarios] = useState<string[]>([])

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from('tournaments')
        .select('*')
        .eq('slug', slug)
        .single()
      setTorneio(data)
      setLoading(false)
    }
    carregar()
  }, [slug])

  function toggleDia(dia: string) {
    setDias(prev => prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia])
  }

  function toggleHorario(h: string) {
    setHorarios(prev => prev.includes(h) ? prev.filter(x => x !== h) : [...prev, h])
  }

  async function inscrever() {
    if (!nome.trim()) { alert('Coloca seu nome!'); return }
    if (!time.trim()) { alert('Coloca o nome do seu time!'); return }
    if (dias.length === 0) { alert('Seleciona pelo menos um dia disponível!'); return }
    if (horarios.length === 0) { alert('Seleciona pelo menos um horário!'); return }

    setEnviando(true)

    const disponibilidade = `Dias: ${dias.join(', ')} | Horários: ${horarios.join(', ')} | Time: ${time}`

    // 1. Salvar inscrição no Supabase
    const { data: participante, error } = await supabase.from('tournament_participants').insert({
      tournament_id: torneio.id,
      player_name: nome,
      contact: contato || null,
      payment_status: 'pending',
      notes: disponibilidade,
    }).select().single()

    if (error) { setEnviando(false); alert('Erro ao inscrever: ' + error.message); return }

    // 2. Se tem taxa de inscrição, redirecionar para LivePix
    if (torneio.entry_fee > 0) {
      const res = await fetch('/api/livepix/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participante_id: participante.id,
          torneio_id: torneio.id,
          valor: torneio.entry_fee,
          nome,
        }),
      })
      const data = await res.json()
      setEnviando(false)

      if (data.checkoutUrl) {
        // Redirecionar para checkout LivePix
        window.location.href = data.checkoutUrl
        return
      }
    }

    setEnviando(false)
    setSucesso(true)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#08090c', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5060' }}>
      Carregando...
    </div>
  )

  if (!torneio) return (
    <div style={{ minHeight: '100vh', background: '#08090c' }}>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '4rem', color: '#4b5060' }}>
        <p>Torneio não encontrado.</p>
        <Link href="/torneios" style={{ color: '#4f7ef8' }}>← Ver torneios</Link>
      </div>
    </div>
  )

  if (torneio.status !== 'open') return (
    <div style={{ minHeight: '100vh', background: '#08090c' }}>
      <Navbar />
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '2rem 1.25rem', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, color: '#fff', marginBottom: 8 }}>Inscrições encerradas</h2>
        <p style={{ color: '#4b5060', marginBottom: 20 }}>Este torneio não está aceitando inscrições no momento.</p>
        <Link href={`/torneios/${slug}`} style={{ color: '#4f7ef8', textDecoration: 'none' }}>← Voltar ao torneio</Link>
      </div>
    </div>
  )

  if (sucesso) return (
    <div style={{ minHeight: '100vh', background: '#08090c' }}>
      <Navbar />
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '2rem 1.25rem', textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, color: '#fff', marginBottom: 8 }}>
          Inscrição realizada!
        </h2>
        <p style={{ color: '#8b909e', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
          Agora pague a inscrição via Pix para confirmar sua vaga.
        </p>

        {/* Box Pix */}
        {torneio.pix_key && (
          <div style={{ background: '#0e1014', border: '1px solid #fbe90044', borderRadius: 12, padding: '1.25rem', marginBottom: 20, textAlign: 'left' }}>
            <p style={{ fontSize: 11, color: '#fbe900', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8 }}>
              💰 Pagamento via Pix
            </p>
            <p style={{ fontSize: 13, color: '#8b909e', marginBottom: 6 }}>Valor: <strong style={{ color: '#fff' }}>R$ {Number(torneio.entry_fee).toFixed(2)}</strong></p>
            <p style={{ fontSize: 13, color: '#8b909e', marginBottom: 4 }}>Chave Pix:</p>
            <div style={{ background: '#14161b', borderRadius: 8, padding: '10px 12px', fontSize: 15, color: '#fbe900', fontWeight: 600, wordBreak: 'break-all' }}>
              {torneio.pix_key}
            </div>
            <p style={{ fontSize: 12, color: '#4b5060', marginTop: 8 }}>
              Após o pagamento, aguarde a confirmação no grupo do WhatsApp.
            </p>
          </div>
        )}

        {/* Link WhatsApp */}
        <a
          href="https://chat.whatsapp.com/LWhqROJ5fyf3WTOFjMPXGp"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            background: '#25d366', color: '#fff', textDecoration: 'none',
            padding: '14px 20px', borderRadius: 12, fontSize: 15, fontWeight: 700,
            marginBottom: 12,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Entrar no grupo do WhatsApp
        </a>

        <Link href={`/torneios/${slug}`} style={{ fontSize: 13, color: '#4b5060', textDecoration: 'none' }}>
          ← Voltar ao torneio
        </Link>
      </div>
    </div>
  )

  const inp: any = { width: '100%', background: '#0e1014', border: '1px solid #1c1f26', borderRadius: 10, padding: '12px', color: '#e8eaf0', fontSize: 14, fontFamily: "'Inter', sans-serif", marginBottom: 10, outline: 'none', boxSizing: 'border-box' }
  const lbl: any = { fontSize: 12, color: '#4b5060', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 6, display: 'block' }
  const chip = (active: boolean, color = '#4f7ef8'): any => ({
    padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none',
    fontFamily: "'Inter', sans-serif",
    background: active ? color + '22' : '#0e1014',
    color: active ? color : '#4b5060',
    outline: active ? `1px solid ${color}44` : '1px solid #1c1f26',
  })

  return (
    <div style={{ minHeight: '100vh', background: '#08090c' }}>
      <Navbar />
      <main style={{ maxWidth: 500, margin: '0 auto', padding: '1.5rem 1.25rem 3rem' }}>

        {/* Header */}
        <div style={{ background: '#0e1014', border: '1px solid #1c1f26', borderLeft: '3px solid #fbe900', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: 11, color: '#fbe900', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 4 }}>Inscrição</p>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
            {torneio.name}
          </h1>
          <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#4b5060' }}>
            {torneio.entry_fee > 0 && <span>💰 R$ {Number(torneio.entry_fee).toFixed(2)}</span>}
            {torneio.prize > 0 && <span>🎁 Prêmio R$ {Number(torneio.prize).toFixed(2)}</span>}
          </div>
        </div>

        {/* Form */}
        <label style={lbl}>Seu nome / apelido *</label>
        <input style={inp} placeholder="Como te chamam no eFootball?" value={nome} onChange={e => setNome(e.target.value)} />

        <label style={lbl}>Seu time no eFootball *</label>
        <input style={inp} placeholder="Ex: Barcelona, Real Madrid..." value={time} onChange={e => setTime(e.target.value)} />

        <label style={lbl}>WhatsApp ou contato</label>
        <input style={inp} placeholder="(21) 99999-9999" value={contato} onChange={e => setContato(e.target.value)} />

        <label style={{ ...lbl, marginTop: 6 }}>Dias disponíveis para jogar *</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {DIAS.map(dia => (
            <button key={dia} style={chip(dias.includes(dia))} onClick={() => toggleDia(dia)}>{dia}</button>
          ))}
        </div>

        <label style={lbl}>Horários disponíveis *</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {HORARIOS.map(h => (
            <button key={h} style={chip(horarios.includes(h), '#3ecf8e')} onClick={() => toggleHorario(h)}>{h}</button>
          ))}
        </div>

        {/* Info pagamento */}
        {torneio.pix_key && (
          <div style={{ background: '#0e1014', border: '1px solid #1c1f26', borderRadius: 10, padding: '12px', marginBottom: 20, fontSize: 13, color: '#8b909e', lineHeight: 1.6 }}>
            ℹ️ Após se inscrever, você receberá a chave Pix para pagar a inscrição de <strong style={{ color: '#fbe900' }}>R$ {Number(torneio.entry_fee).toFixed(2)}</strong> e o link do grupo do WhatsApp.
          </div>
        )}

        <button
          onClick={inscrever}
          disabled={enviando}
          style={{
            width: '100%', padding: '14px', borderRadius: 12, border: 'none',
            background: enviando ? '#1c1f26' : '#4f7ef8', color: '#fff',
            fontSize: 15, fontWeight: 700, cursor: enviando ? 'not-allowed' : 'pointer',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {enviando ? 'Enviando...' : '✅ Confirmar inscrição'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link href={`/torneios/${slug}`} style={{ fontSize: 13, color: '#4b5060', textDecoration: 'none' }}>
            ← Voltar ao torneio
          </Link>
        </div>
      </main>
    </div>
  )
}
