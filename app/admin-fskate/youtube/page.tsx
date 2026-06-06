'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const G = {
  green: '#00e56e', greenGlow: 'rgba(0,229,110,0.15)',
  bg: '#060a0f', surface: '#0d1520', surface2: '#131e2e',
  border: 'rgba(255,255,255,0.07)', borderActive: 'rgba(0,229,110,0.4)',
  text: '#f0f4f8', muted: '#5a7190', gold: '#e8b84b', red: '#f87171', blue: '#0ea5e9'
}

const APIS_TRANSCRICAO = [
  {
    id: 'supadata',
    nome: 'Supadata',
    desc: 'Melhor opção — transcrição direta do YouTube',
    gratis: '100 req/mês grátis',
    cor: '#00e56e',
    link: 'https://supadata.ai',
    placeholder: 'sup_...',
    instrucao: 'Acesse supadata.ai → Sign up → API → Create Key'
  },
  {
    id: 'rapidapi',
    nome: 'RapidAPI YouTube Transcript',
    desc: 'Funciona bem, plano gratuito disponível',
    gratis: '100 req/mês grátis',
    cor: '#0ea5e9',
    link: 'https://rapidapi.com/solid-api-solid-api-default/api/youtube-transcript3',
    placeholder: 'sua-rapid-api-key',
    instrucao: 'Acesse o link → Subscribe (Free plan) → App → Add New App → Get Key'
  },
  {
    id: 'kome',
    nome: 'Kome AI',
    desc: 'Transcrição + resumo automático',
    gratis: 'Plano gratuito',
    cor: '#8b5cf6',
    link: 'https://kome.ai',
    placeholder: 'km_...',
    instrucao: 'Acesse kome.ai → Sign up → Settings → API Key'
  },
]

const APIS_IA = [
  {
    id: 'groq',
    nome: 'Groq',
    desc: 'Ultra rápido — llama-3.1 grátis',
    gratis: '14.400 req/dia grátis',
    cor: '#00e56e',
    link: 'https://console.groq.com',
    placeholder: 'gsk_...',
    instrucao: 'Acesse console.groq.com → API Keys → Create API Key'
  },
  {
    id: 'gemini',
    nome: 'Google Gemini',
    desc: 'Gemini 1.5 Flash — muito bom e gratuito',
    gratis: '15 req/min grátis',
    cor: '#4f7ef8',
    link: 'https://aistudio.google.com/apikey',
    placeholder: 'AIza...',
    instrucao: 'Acesse aistudio.google.com → Get API key → Create API key'
  },
  {
    id: 'cohere',
    nome: 'Cohere',
    desc: 'Command R — ótimo para português',
    gratis: '1000 req/mês grátis',
    cor: '#e8b84b',
    link: 'https://dashboard.cohere.com/api-keys',
    placeholder: 'co_...',
    instrucao: 'Acesse dashboard.cohere.com → API Keys → New Trial Key'
  },
  {
    id: 'mistral',
    nome: 'Mistral AI',
    desc: 'Mistral 7B — rápido e preciso',
    gratis: 'Plano gratuito disponível',
    cor: '#ec4899',
    link: 'https://console.mistral.ai/api-keys',
    placeholder: 'mis_...',
    instrucao: 'Acesse console.mistral.ai → API Keys → Create new key'
  },
]

const CATS = [
  { slug: 'noticias', name: 'Notícias' },
  { slug: 'eventos', name: 'Eventos' },
  { slug: 'atualizacoes', name: 'Atualizações' },
  { slug: 'campanhas', name: 'Campanhas' },
  { slug: 'guias', name: 'Guias' },
  { slug: 'vazamentos-rumores', name: 'Vazamentos' },
  { slug: 'analises', name: 'Análises' },
]

function slugify(t: string) {
  return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').substring(0, 80) + '-' + Date.now()
}

function renderMd(md: string) {
  return md
    .replace(/^# (.+)$/gm, '<h1 style="font-family:Barlow Condensed,sans-serif;font-weight:900;font-size:18px;color:#00e56e;margin:18px 0 8px;text-transform:uppercase">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 style="font-family:Barlow Condensed,sans-serif;font-weight:700;font-size:15px;color:#f0f4f8;margin:14px 0 6px;text-transform:uppercase">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 style="font-size:12px;font-weight:700;color:#5a7190;margin:10px 0 3px;text-transform:uppercase;letter-spacing:.5px">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#00e56e">$1</strong>')
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid rgba(255,255,255,.07);margin:14px 0">')
    .replace(/^[-•] (.+)$/gm, '<li style="margin:3px 0;padding-left:4px">$1</li>')
    .split('\n\n').map((p: string) => p.match(/^<(h[123]|ul|hr|li)/) ? p : `<p style="margin:5px 0;line-height:1.65">${p}</p>`).join('')
}

export default function RadarIA() {
  const [url, setUrl] = useState('')
  const [categoria, setCategoria] = useState('noticias')
  const [postStatus, setPostStatus] = useState<'published'|'draft'>('published')

  // APIs selecionadas e keys
  const [apiTranscricao, setApiTranscricao] = useState('supadata')
  const [keyTranscricao, setKeyTranscricao] = useState('')
  const [apiIA, setApiIA] = useState('groq')
  const [keyIA, setKeyIA] = useState('')

  // Estado
  const [loading, setLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')
  const [statusType, setStatusType] = useState<'loading'|'success'|'error'|''>('')
  const [roteiro, setRoteiro] = useState('')
  const [titulo, setTitulo] = useState('')
  const [resumo, setResumo] = useState('')
  const [publicando, setPublicando] = useState(false)
  const [publicado, setPublicado] = useState(false)

  // Configurações abertas
  const [configAberta, setConfigAberta] = useState(true)

  function showStatus(msg: string, type: 'loading'|'success'|'error') {
    setStatusMsg(msg); setStatusType(type)
  }

  async function buscarTranscricao(videoId: string): Promise<string> {
    const apiInfo = APIS_TRANSCRICAO.find(a => a.id === apiTranscricao)!
    
    if (apiTranscricao === 'supadata') {
      const res = await fetch(`https://api.supadata.ai/v1/youtube/transcript?videoId=${videoId}&text=true`, {
        headers: { 'x-api-key': keyTranscricao }
      })
      if (!res.ok) throw new Error('Supadata: ' + res.statusText)
      const data = await res.json()
      return data.content || data.text || ''
    }
    
    if (apiTranscricao === 'rapidapi') {
      const res = await fetch(`https://youtube-transcript3.p.rapidapi.com/api/transcript?videoId=${videoId}`, {
        headers: { 'x-rapidapi-key': keyTranscricao, 'x-rapidapi-host': 'youtube-transcript3.p.rapidapi.com' }
      })
      if (!res.ok) throw new Error('RapidAPI: ' + res.statusText)
      const data = await res.json()
      return (data.transcript || []).map((t: any) => t.text).join(' ')
    }

    if (apiTranscricao === 'kome') {
      const res = await fetch('https://kome.ai/api/transcript', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${keyTranscricao}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: `https://youtube.com/watch?v=${videoId}` })
      })
      if (!res.ok) throw new Error('Kome: ' + res.statusText)
      const data = await res.json()
      return data.transcript || ''
    }

    throw new Error('API não reconhecida')
  }

  async function gerarComIA(transcricao: string, tituloVideo: string): Promise<{titulo: string, resumo: string, conteudo: string}> {
    const prompt = `Você é um jornalista especializado em eFootball. Analise a transcrição abaixo e crie uma notícia jornalística completa em português brasileiro.

TÍTULO DO VÍDEO: ${tituloVideo}

TRANSCRIÇÃO:
${transcricao.substring(0, 6000)}

INSTRUÇÕES:
- Escreva como notícia de portal esportivo digital
- Lead jornalístico no 1º parágrafo (quem, o quê, quando, onde, por quê)
- Mínimo 4 parágrafos, texto corrido sem markdown
- Destaque datas, jogadores, eventos e promoções
- Não invente informações

Responda EXATAMENTE assim:
TITULO: [título atrativo]
RESUMO: [uma linha]
CONTEUDO: [texto completo]`

    if (apiIA === 'groq') {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${keyIA}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'llama-3.1-8b-instant', max_tokens: 2000, temperature: 0.3, messages: [{ role: 'user', content: prompt }] })
      })
      if (!res.ok) throw new Error('Groq: ' + res.statusText)
      const data = await res.json()
      return parsear(data.choices?.[0]?.message?.content || '')
    }

    if (apiIA === 'gemini') {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${keyIA}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      })
      if (!res.ok) throw new Error('Gemini: ' + res.statusText)
      const data = await res.json()
      return parsear(data.candidates?.[0]?.content?.parts?.[0]?.text || '')
    }

    if (apiIA === 'cohere') {
      const res = await fetch('https://api.cohere.com/v1/generate', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${keyIA}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'command-r', prompt, max_tokens: 2000, temperature: 0.3 })
      })
      if (!res.ok) throw new Error('Cohere: ' + res.statusText)
      const data = await res.json()
      return parsear(data.generations?.[0]?.text || '')
    }

    if (apiIA === 'mistral') {
      const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${keyIA}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'mistral-small-latest', max_tokens: 2000, messages: [{ role: 'user', content: prompt }] })
      })
      if (!res.ok) throw new Error('Mistral: ' + res.statusText)
      const data = await res.json()
      return parsear(data.choices?.[0]?.message?.content || '')
    }

    throw new Error('API de IA não reconhecida')
  }

  function parsear(text: string) {
    const t = text.match(/TITULO:\s*(.+)/i)?.[1]?.trim() || ''
    const r = text.match(/RESUMO:\s*(.+)/i)?.[1]?.trim() || ''
    const c = text.match(/CONTEUDO:\s*([\s\S]+)/i)?.[1]?.trim() || text
    return { titulo: t, resumo: r, conteudo: c }
  }

  async function gerar() {
    if (!url.trim()) { showStatus('Cole um link do YouTube!', 'error'); return }
    if (!keyTranscricao.trim()) { showStatus('Configure a chave da API de transcrição!', 'error'); return }
    if (!keyIA.trim()) { showStatus('Configure a chave da API de IA!', 'error'); return }

    setLoading(true); setRoteiro(''); setPublicado(false)
    showStatus('Buscando transcrição do YouTube...', 'loading')

    try {
      // Extrair video ID
      let videoId = ''
      try { const obj = new URL(url); videoId = obj.searchParams.get('v') || obj.pathname.slice(1).split('?')[0] } catch {}
      if (!videoId) throw new Error('URL do YouTube inválida')

      // Buscar título via oEmbed
      let tituloVideo = 'Vídeo eFootball'
      try {
        const oe = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`)
        if (oe.ok) { const d = await oe.json(); tituloVideo = d.title || tituloVideo }
      } catch {}

      // 1. Transcrição
      showStatus(`Buscando transcrição via ${APIS_TRANSCRICAO.find(a => a.id === apiTranscricao)?.nome}...`, 'loading')
      const transcricao = await buscarTranscricao(videoId)
      if (!transcricao || transcricao.length < 50) throw new Error('Transcrição não encontrada. O vídeo tem legendas ativadas?')

      // 2. Gerar notícia
      showStatus(`Gerando notícia com ${APIS_IA.find(a => a.id === apiIA)?.nome}...`, 'loading')
      const gerado = await gerarComIA(transcricao, tituloVideo)

      setRoteiro(gerado.conteudo || transcricao.substring(0, 2000))
      setTitulo(gerado.titulo || tituloVideo)
      setResumo(gerado.resumo || '')
      setConfigAberta(false)
      showStatus('✅ Notícia gerada com sucesso!', 'success')
    } catch (err: any) {
      showStatus('❌ ' + err.message, 'error')
    }
    setLoading(false)
  }

  async function publicar() {
    if (!roteiro || !titulo) { alert('Gere o roteiro primeiro!'); return }
    setPublicando(true)
    let videoId = ''
    try { const obj = new URL(url); videoId = obj.searchParams.get('v') || obj.pathname.slice(1).split('?')[0] } catch {}
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', categoria).single()
    const conteudo = roteiro + `\n\n━━━━━━━━━━━━━━━━\n📺 Fonte: YouTube\n🔗 ${url}`
    const { error } = await supabase.from('posts').insert({
      title: titulo, slug: slugify(titulo), summary: resumo || null, content: conteudo,
      cover_image: videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null,
      category_id: cat?.id || null, tags: ['efootball', 'youtube'],
      status: postStatus, source_type: 'youtube', source_url: url,
      auto_published: false, published_at: postStatus === 'published' ? new Date().toISOString() : null
    })
    setPublicando(false)
    if (error) { alert('Erro: ' + error.message); return }
    setPublicado(true)
  }

  function limpar() { setUrl(''); setRoteiro(''); setTitulo(''); setResumo(''); setStatusMsg(''); setStatusType(''); setPublicado(false); setConfigAberta(true) }

  // Styles
  const inp: any = { width: '100%', background: G.surface2, border: `1px solid ${G.border}`, borderRadius: 10, padding: '11px 14px', color: G.text, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' as const, transition: 'border-color .2s' }
  const lbl: any = { fontSize: 10, color: G.muted, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' as const, marginBottom: 7, display: 'flex', alignItems: 'center', gap: 6 }
  const dot: any = { width: 5, height: 5, background: G.green, borderRadius: '50%', display: 'inline-block', flexShrink: 0 }
  const block: any = { background: G.surface, border: `1px solid ${G.border}`, borderRadius: 14, marginBottom: 12, overflow: 'hidden' }
  const blockHead: any = { padding: '12px 16px', borderBottom: `1px solid ${G.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
  const blockBody: any = { padding: '16px' }
  const statusColor = statusType === 'success' ? G.green : statusType === 'error' ? G.red : G.blue

  const apiTransInfo = APIS_TRANSCRICAO.find(a => a.id === apiTranscricao)!
  const apiIAInfo = APIS_IA.find(a => a.id === apiIA)!

  return (
    <div style={{ minHeight: '100vh', background: G.bg, color: G.text, fontFamily: "'Barlow', 'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;900&family=Barlow:wght@400;500&display=swap');
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(.55)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        input:focus,textarea:focus{border-color:${G.borderActive}!important;box-shadow:0 0 0 3px rgba(0,229,110,.08)!important}
      `}</style>

      {/* Header */}
      <header style={{ background: G.surface, borderBottom: `1px solid ${G.border}`, padding: '0 1.25rem', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky' as const, top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <a href="/admin-fskate" style={{ color: G.muted, textDecoration: 'none', fontSize: 18 }}>←</a>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 18, textTransform: 'uppercase', letterSpacing: '.5px' }}>
              Radar <span style={{ color: G.green }}>IA</span>
            </div>
            <div style={{ fontSize: 9, color: G.muted, letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700 }}>YouTube → Notícia</div>
          </div>
        </div>
        <a href="/" style={{ fontSize: 11, color: G.muted, textDecoration: 'none', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' as const }}>Ver site →</a>
      </header>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '1.5rem 1rem 4rem' }}>

        {/* ─── CONFIGURAÇÃO DE APIs ─── */}
        <div style={block}>
          <div style={blockHead}>
            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: '1.5px', textTransform: 'uppercase' as const, color: G.muted }}>
              ⚙️ Configuração de APIs
            </span>
            <button onClick={() => setConfigAberta(!configAberta)}
              style={{ background: 'none', border: 'none', color: G.muted, cursor: 'pointer', fontSize: 18 }}>
              {configAberta ? '▲' : '▼'}
            </button>
          </div>

          {configAberta && (
            <div style={blockBody}>

              {/* API de Transcrição */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ ...lbl, marginBottom: 10 }}><span style={dot}/>API de Transcrição do YouTube</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                  {APIS_TRANSCRICAO.map(api => (
                    <button key={api.id} onClick={() => setApiTranscricao(api.id)}
                      style={{ padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' as const, background: apiTranscricao === api.id ? api.cor + '18' : G.surface2, outline: apiTranscricao === api.id ? `1px solid ${api.cor}44` : `1px solid ${G.border}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 14, color: apiTranscricao === api.id ? api.cor : G.text }}>{api.nome}</span>
                          <span style={{ fontSize: 12, color: G.muted, marginLeft: 8 }}>{api.desc}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 10, color: G.green, fontWeight: 700, background: 'rgba(0,229,110,.1)', padding: '2px 8px', borderRadius: 20 }}>{api.gratis}</span>
                          <a href={api.link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                            style={{ fontSize: 10, color: G.blue, fontWeight: 700, textDecoration: 'none', background: 'rgba(14,165,233,.1)', padding: '2px 8px', borderRadius: 20 }}>
                            Pegar key →
                          </a>
                        </div>
                      </div>
                      {apiTranscricao === api.id && (
                        <div style={{ fontSize: 11, color: G.muted, marginTop: 6, padding: '6px 8px', background: 'rgba(0,0,0,.2)', borderRadius: 6 }}>
                          📋 {api.instrucao}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <div style={lbl}><span style={dot}/>Chave da API — {apiTransInfo.nome}</div>
                <input style={inp} type="password" placeholder={apiTransInfo.placeholder} value={keyTranscricao} onChange={e => setKeyTranscricao(e.target.value)} />
              </div>

              {/* Divisor */}
              <div style={{ height: 1, background: G.border, margin: '4px 0 20px' }} />

              {/* API de IA */}
              <div>
                <div style={{ ...lbl, marginBottom: 10 }}><span style={dot}/>API de IA para gerar a notícia</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 12 }}>
                  {APIS_IA.map(api => (
                    <button key={api.id} onClick={() => setApiIA(api.id)}
                      style={{ padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' as const, background: apiIA === api.id ? api.cor + '18' : G.surface2, outline: apiIA === api.id ? `1px solid ${api.cor}44` : `1px solid ${G.border}` }}>
                      <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 14, color: apiIA === api.id ? api.cor : G.text }}>{api.nome}</div>
                      <div style={{ fontSize: 11, color: G.muted, marginTop: 2 }}>{api.desc}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                        <span style={{ fontSize: 10, color: G.green, fontWeight: 700 }}>{api.gratis}</span>
                        <a href={api.link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                          style={{ fontSize: 10, color: G.blue, fontWeight: 700, textDecoration: 'none' }}>
                          key →
                        </a>
                      </div>
                      {apiIA === api.id && (
                        <div style={{ fontSize: 10, color: G.muted, marginTop: 6, padding: '5px 7px', background: 'rgba(0,0,0,.2)', borderRadius: 6 }}>
                          📋 {api.instrucao}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <div style={lbl}><span style={dot}/>Chave da API — {apiIAInfo.nome}</div>
                <input style={inp} type="password" placeholder={apiIAInfo.placeholder} value={keyIA} onChange={e => setKeyIA(e.target.value)} />
              </div>
            </div>
          )}
        </div>

        {/* ─── LINK DO VÍDEO ─── */}
        <div style={block}>
          <div style={{ ...blockBody }}>
            <div style={lbl}><span style={dot}/>Link do vídeo YouTube</div>
            <input style={{ ...inp, fontSize: 15 }} placeholder="https://www.youtube.com/watch?v=..."
              value={url} onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && gerar()} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, marginTop: 4 }}>
              <div>
                <div style={{ ...lbl, marginBottom: 6 }}><span style={dot}/>Categoria</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {CATS.map(c => (
                    <button key={c.slug} onClick={() => setCategoria(c.slug)}
                      style={{ padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: '0.8px', textTransform: 'uppercase' as const, background: categoria === c.slug ? 'rgba(0,229,110,.15)' : G.surface2, color: categoria === c.slug ? G.green : G.muted, outline: categoria === c.slug ? `1px solid ${G.borderActive}` : `1px solid ${G.border}` }}>
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── BOTÃO GERAR ─── */}
        <button onClick={gerar} disabled={loading}
          style={{ width: '100%', padding: '15px', background: G.green, border: 'none', borderRadius: 12, color: '#030f06', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: '1.5px', textTransform: 'uppercase' as const, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
          {loading
            ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,.3)', borderTopColor: 'rgba(0,0,0,.8)', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />Gerando notícia...</>
            : <>▶ Gerar notícia automaticamente</>}
        </button>

        {/* Status */}
        {statusMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontSize: 13, color: statusColor, fontWeight: 500 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor, flexShrink: 0, animation: statusType === 'loading' ? 'pulse 1.2s infinite' : 'none' }} />
            {statusMsg}
          </div>
        )}

        {/* ─── RESULTADO ─── */}
        <div style={{ background: G.surface, border: `1px solid ${roteiro ? G.borderActive : G.border}`, borderRadius: 14, overflow: 'hidden', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: `1px solid ${G.border}` }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase' as const, color: roteiro ? G.green : G.muted, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: roteiro ? G.green : G.muted, display: 'inline-block' }} />
              {roteiro ? 'Notícia pronta' : 'Aguardando'}
            </div>
            {roteiro && (
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => navigator.clipboard.writeText(roteiro).then(() => alert('Copiado!'))}
                  style={{ padding: '5px 11px', background: G.surface2, border: `1px solid ${G.border}`, borderRadius: 7, color: G.muted, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: '.8px', textTransform: 'uppercase' as const, cursor: 'pointer' }}>
                  Copiar
                </button>
                <button onClick={limpar}
                  style={{ padding: '5px 11px', background: G.surface2, border: `1px solid ${G.border}`, borderRadius: 7, color: G.muted, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: '.8px', textTransform: 'uppercase' as const, cursor: 'pointer' }}>
                  Limpar
                </button>
              </div>
            )}
          </div>
          <div style={{ padding: 18, minHeight: 140, fontSize: 14, lineHeight: 1.75, color: G.text }}>
            {roteiro
              ? <div dangerouslySetInnerHTML={{ __html: renderMd(roteiro) }} />
              : <div style={{ color: G.muted, fontStyle: 'italic', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' as const, minHeight: 100, fontSize: 13 }}>Configure as APIs acima e cole um link do YouTube para gerar.</div>}
          </div>
        </div>

        {/* ─── PUBLICAR ─── */}
        {roteiro && !publicado && (
          <div style={{ background: G.surface, border: `1px solid ${G.borderActive}`, borderRadius: 14, padding: '1.25rem', marginBottom: 12 }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 12, color: G.green, letterSpacing: '1px', textTransform: 'uppercase' as const, marginBottom: 14 }}>✅ Publicar no eFootball News</div>

            <div style={{ ...lbl, marginBottom: 6 }}><span style={dot}/>Título</div>
            <input style={{ ...inp, marginBottom: 10 }} value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título da notícia..." />

            <div style={{ ...lbl, marginBottom: 6 }}><span style={dot}/>Resumo</div>
            <input style={{ ...inp, marginBottom: 14 }} value={resumo} onChange={e => setResumo(e.target.value)} placeholder="Resumo curto..." />

            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              {(['published', 'draft'] as const).map(s => (
                <button key={s} onClick={() => setPostStatus(s)}
                  style={{ flex: 1, padding: '10px', borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 12, letterSpacing: '.8px', textTransform: 'uppercase' as const, background: postStatus === s ? (s === 'published' ? G.green : G.gold) : G.surface2, color: postStatus === s ? '#030f06' : G.muted }}>
                  {s === 'published' ? '✅ Publicar' : '◻ Rascunho'}
                </button>
              ))}
            </div>

            <button onClick={publicar} disabled={publicando || !titulo}
              style={{ width: '100%', padding: '13px', background: titulo ? G.green : G.surface2, border: 'none', borderRadius: 10, color: titulo ? '#030f06' : G.muted, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: '1px', textTransform: 'uppercase' as const, cursor: titulo ? 'pointer' : 'not-allowed', opacity: publicando ? .5 : 1 }}>
              {publicando ? 'Publicando...' : '▶ Publicar no eFootball News'}
            </button>
          </div>
        )}

        {publicado && (
          <div style={{ background: 'rgba(0,229,110,.07)', border: `1px solid ${G.borderActive}`, borderRadius: 12, padding: '1.5rem', textAlign: 'center' as const }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 20, color: G.green, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>Notícia publicada!</div>
            <div style={{ fontSize: 13, color: G.muted, marginBottom: 16 }}>Publicado no eFootball News com sucesso.</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <a href="/" target="_blank" style={{ padding: '8px 18px', background: G.green, color: '#030f06', borderRadius: 8, textDecoration: 'none', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: '1px', textTransform: 'uppercase' as const }}>Ver site</a>
              <button onClick={limpar} style={{ padding: '8px 18px', background: G.surface2, border: `1px solid ${G.border}`, color: G.muted, borderRadius: 8, cursor: 'pointer', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: '1px', textTransform: 'uppercase' as const }}>Novo vídeo</button>
            </div>
          </div>
        )}

        {/* Info steps */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginTop: 24 }}>
          {[['1','Config APIs',G.muted],['2','Link YouTube',G.muted],['3','IA Gera',G.muted],['4','Publicar',G.green]].map(([n,l,c]) => (
            <div key={n} style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 10, padding: '10px 12px', textAlign: 'center' as const }}>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 20, color: c as string, lineHeight: 1 }}>{n}</div>
              <div style={{ fontSize: 10, color: G.muted, marginTop: 4, fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase' as const }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
