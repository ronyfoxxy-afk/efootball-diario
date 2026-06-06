'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const G = {
  green: '#00e56e', greenGlow: 'rgba(0,229,110,0.15)',
  bg: '#060a0f', surface: '#0d1520', surface2: '#131e2e',
  border: 'rgba(255,255,255,0.07)', borderActive: 'rgba(0,229,110,0.4)',
  text: '#f0f4f8', muted: '#5a7190', blue: '#0ea5e9', gold: '#e8b84b', red: '#f87171'
}

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

function renderMarkdown(md: string) {
  return md
    .replace(/^### (.+)$/gm, '<h3 style="font-size:13px;font-weight:500;color:#5a7190;margin:12px 0 4px;text-transform:uppercase;letter-spacing:0.5px">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-family:Barlow Condensed,sans-serif;font-weight:700;font-size:16px;color:#f0f4f8;margin:18px 0 6px;text-transform:uppercase">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-family:Barlow Condensed,sans-serif;font-weight:900;font-size:20px;color:#00e56e;margin:22px 0 10px;padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,0.07);text-transform:uppercase">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#00e56e;font-weight:600">$1</strong>')
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid rgba(255,255,255,0.07);margin:18px 0">')
    .replace(/^[-•] (.+)$/gm, '<li style="margin:3px 0">$1</li>')
    .split('\n\n').map((p: string) => {
      if (p.match(/^<(h[123]|ul|hr)/)) return p
      return `<p style="margin:6px 0;line-height:1.7">${p}</p>`
    }).join('')
}

export default function YoutubeAdmin() {
  const [url, setUrl] = useState('')
  const [categoria, setCategoria] = useState('noticias')
  const [postStatus, setPostStatus] = useState<'published' | 'draft'>('published')
  const [serverUrl, setServerUrl] = useState('http://localhost:3000')
  const [loading, setLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')
  const [statusType, setStatusType] = useState<'loading'|'success'|'error'|''>('')
  const [roteiro, setRoteiro] = useState('')
  const [publicando, setPublicando] = useState(false)
  const [publicado, setPublicado] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [resumo, setResumo] = useState('')
  const [modo, setModo] = useState<'ollama'|'groq'>('ollama')

  async function gerarRoteiro() {
    if (!url.trim()) return
    setLoading(true); setRoteiro(''); setPublicado(false)
    setStatusMsg('Buscando transcrição e gerando roteiro...'); setStatusType('loading')
    try {
      if (modo === 'ollama') {
        const res = await fetch(`${serverUrl}/resumir`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.erro || 'Erro. Verifique se o server.js está rodando.')
        setRoteiro(data.resumo || '')
        setTitulo('Roteiro eFootball — ' + new Date().toLocaleDateString('pt-BR'))
        setResumo('Roteiro gerado por IA a partir do vídeo do YouTube.')
        setStatusMsg(`Roteiro gerado com sucesso${data.duracao ? ` em ${data.duracao}s` : ''}.`); setStatusType('success')
      } else {
        const res = await fetch('/api/youtube-publish', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ youtubeUrl: url, categoria, status: 'draft' })
        })
        const data = await res.json()
        if (!res.ok || data.error) throw new Error(data.error || 'Erro')
        setRoteiro(data.post?.content || '')
        setTitulo(data.titulo || '')
        setResumo(data.resumo || '')
        setStatusMsg(data.transcricaoObtida ? 'Notícia gerada com transcrição real!' : 'Notícia gerada pelo título do vídeo.'); setStatusType('success')
      }
    } catch (err: any) {
      setStatusMsg(err.message); setStatusType('error')
    }
    setLoading(false)
  }

  async function publicarNoSite() {
    if (!roteiro || !titulo) { alert('Preencha o título!'); return }
    setPublicando(true)
    let videoId = ''
    try { const obj = new URL(url); videoId = obj.searchParams.get('v') || obj.pathname.slice(1).split('?')[0] } catch {}
    const thumbUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', categoria).single()
    const conteudo = roteiro.includes('━━━') ? roteiro : roteiro + `\n\n━━━━━━━━━━━━━━━━\n📺 Fonte: YouTube\n🔗 ${url}`
    const { error } = await supabase.from('posts').insert({
      title: titulo, slug: slugify(titulo), summary: resumo || null, content: conteudo,
      cover_image: thumbUrl, category_id: cat?.id || null, tags: ['efootball', 'youtube'],
      status: postStatus, source_type: 'youtube', source_url: url, auto_published: false,
      published_at: postStatus === 'published' ? new Date().toISOString() : null
    })
    setPublicando(false)
    if (error) { alert('Erro: ' + error.message); return }
    setPublicado(true)
  }

  function limpar() {
    setUrl(''); setRoteiro(''); setTitulo(''); setResumo('')
    setStatusMsg(''); setStatusType(''); setPublicado(false)
  }

  const inp: any = { width: '100%', background: G.surface2, border: `1px solid ${G.border}`, borderRadius: 10, padding: '13px 16px', color: G.text, fontSize: 15, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }
  const block: any = { background: G.surface, border: `1px solid ${G.border}`, borderRadius: 14, padding: 20, marginBottom: 14 }
  const lbl: any = { fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', color: G.muted, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }
  const dot: any = { width: 6, height: 6, background: G.green, borderRadius: '50%', display: 'inline-block', flexShrink: 0 }
  const statusColor = statusType === 'success' ? G.green : statusType === 'error' ? G.red : G.blue

  return (
    <div style={{ minHeight: '100vh', background: G.bg, color: G.text, fontFamily: 'Barlow, Inter, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;900&family=Barlow:wght@400;500&display=swap');
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        input:focus,textarea:focus{border-color:${G.borderActive}!important;box-shadow:0 0 0 3px ${G.greenGlow}!important}
      `}</style>

      {/* Header */}
      <div style={{ background: G.surface, borderBottom: `1px solid ${G.border}`, padding: '0 1.25rem', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky' as const, top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <a href="/admin-fskate" style={{ color: G.muted, textDecoration: 'none', fontSize: 18 }}>←</a>
          <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: 20, color: G.text, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Radar <span style={{ color: G.green }}>IA</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <a href="/" style={{ fontSize: 11, color: G.muted, textDecoration: 'none', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' as const }}>Site →</a>
          <a href="/admin-fskate" style={{ fontSize: 11, color: G.muted, textDecoration: 'none', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' as const }}>Admin →</a>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 20px 60px' }}>

        {/* Modo */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {[
            { v: 'ollama', l: 'IA Local · Ollama', sub: 'server.js rodando localmente' },
            { v: 'groq', l: 'IA Nuvem · Groq', sub: 'Automático, sem configuração extra' },
          ].map(m => (
            <button key={m.v} onClick={() => setModo(m.v as any)}
              style={{ flex: 1, padding: '10px 14px', background: modo === m.v ? G.greenGlow : G.surface, border: `1px solid ${modo === m.v ? G.borderActive : G.border}`, borderRadius: 10, cursor: 'pointer', textAlign: 'left' as const, fontFamily: 'inherit' }}>
              <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 13, color: modo === m.v ? G.green : G.text, letterSpacing: '0.5px', textTransform: 'uppercase' as const }}>{m.l}</div>
              <div style={{ fontSize: 11, color: G.muted, marginTop: 2 }}>{m.sub}</div>
            </button>
          ))}
        </div>

        {modo === 'ollama' && (
          <div style={block}>
            <div style={lbl}><span style={dot}/>URL do servidor Ollama local</div>
            <input style={inp} value={serverUrl} onChange={e => setServerUrl(e.target.value)} placeholder="http://localhost:3000" />
            <div style={{ fontSize: 12, color: G.muted, marginTop: 6 }}>
              Rode <code style={{ background: G.surface2, padding: '1px 6px', borderRadius: 4, color: G.green, fontSize: 11 }}>npm start</code> na pasta do seu server.js antes de usar.
            </div>
          </div>
        )}

        {/* URL do vídeo */}
        <div style={block}>
          <div style={lbl}><span style={dot}/>Link do vídeo YouTube</div>
          <input style={inp} placeholder="https://www.youtube.com/watch?v=..." value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && gerarRoteiro()} />
        </div>

        {/* Categoria */}
        <div style={block}>
          <div style={lbl}><span style={dot}/>Categoria da notícia</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {CATS.map(c => (
              <button key={c.slug} onClick={() => setCategoria(c.slug)}
                style={{ padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase' as const, background: categoria === c.slug ? G.greenGlow : G.surface2, color: categoria === c.slug ? G.green : G.muted, outline: categoria === c.slug ? `1px solid ${G.borderActive}` : `1px solid ${G.border}` }}>
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Botão gerar */}
        <button onClick={gerarRoteiro} disabled={loading}
          style={{ width: '100%', padding: 16, background: G.green, border: 'none', borderRadius: 12, color: '#030f06', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 16, letterSpacing: '1.5px', textTransform: 'uppercase' as const, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 14 }}>
          {loading
            ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: 'rgba(0,0,0,0.8)', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />Gerando roteiro...</>
            : <>▶ Gerar roteiro de notícia</>}
        </button>

        {/* Status */}
        {statusMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, fontSize: 13, color: statusColor, fontWeight: 500, minHeight: 22 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor, flexShrink: 0, animation: statusType === 'loading' ? 'pulse 1.2s infinite' : 'none' }} />
            {statusMsg}
          </div>
        )}

        {/* Resultado */}
        <div style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 14, overflow: 'hidden', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderBottom: `1px solid ${G.border}` }}>
            <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase' as const, color: roteiro ? G.green : G.muted, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: roteiro ? G.green : G.muted, display: 'inline-block' }} />
              {roteiro ? 'Roteiro pronto' : 'Aguardando'}
            </div>
            {roteiro && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => navigator.clipboard.writeText(roteiro).then(() => alert('Copiado!'))}
                  style={{ padding: '5px 12px', background: G.surface2, border: `1px solid ${G.border}`, borderRadius: 7, color: G.muted, fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, fontSize: 11, letterSpacing: '0.8px', textTransform: 'uppercase' as const, cursor: 'pointer' }}>
                  Copiar
                </button>
                <button onClick={limpar}
                  style={{ padding: '5px 12px', background: G.surface2, border: `1px solid ${G.border}`, borderRadius: 7, color: G.muted, fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, fontSize: 11, letterSpacing: '0.8px', textTransform: 'uppercase' as const, cursor: 'pointer' }}>
                  Limpar
                </button>
              </div>
            )}
          </div>
          <div style={{ padding: 20, minHeight: 160, fontSize: 14, lineHeight: 1.75, color: G.text }}>
            {roteiro
              ? <div dangerouslySetInnerHTML={{ __html: renderMarkdown(roteiro) }} />
              : <div style={{ color: G.muted, fontStyle: 'italic', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' as const, minHeight: 120, fontSize: 13 }}>Cole um link acima e clique em gerar.</div>}
          </div>
        </div>

        {/* Publicar */}
        {roteiro && !publicado && (
          <div style={{ background: G.surface, border: `1px solid ${G.borderActive}`, borderRadius: 14, padding: 18, marginBottom: 14 }}>
            <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 12, color: G.green, letterSpacing: '1px', textTransform: 'uppercase' as const, marginBottom: 14 }}>✅ Publicar como notícia no site</div>
            <div style={lbl}><span style={dot}/>Título da notícia *</div>
            <input style={{ ...inp, marginBottom: 10 }} value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título para o site..." />
            <div style={lbl}><span style={dot}/>Resumo (opcional)</div>
            <input style={{ ...inp, marginBottom: 14 }} value={resumo} onChange={e => setResumo(e.target.value)} placeholder="Resumo curto..." />
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              {(['published', 'draft'] as const).map(s => (
                <button key={s} onClick={() => setPostStatus(s)}
                  style={{ flex: 1, padding: '10px', borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 12, letterSpacing: '0.8px', textTransform: 'uppercase' as const, background: postStatus === s ? (s === 'published' ? G.green : G.gold) : G.surface2, color: postStatus === s ? '#030f06' : G.muted }}>
                  {s === 'published' ? '✅ Publicar agora' : '◻ Rascunho'}
                </button>
              ))}
            </div>
            <button onClick={publicarNoSite} disabled={publicando || !titulo}
              style={{ width: '100%', padding: '14px', background: titulo ? G.green : G.surface2, border: 'none', borderRadius: 10, color: titulo ? '#030f06' : G.muted, fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 15, letterSpacing: '1px', textTransform: 'uppercase' as const, cursor: titulo ? 'pointer' : 'not-allowed', opacity: publicando ? 0.5 : 1 }}>
              {publicando ? 'Publicando...' : '▶ Publicar no eFootball News'}
            </button>
          </div>
        )}

        {publicado && (
          <div style={{ background: 'rgba(0,229,110,0.08)', border: `1px solid ${G.borderActive}`, borderRadius: 12, padding: '1.25rem', textAlign: 'center' as const, marginBottom: 14 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
            <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: 20, color: G.green, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Notícia publicada!</div>
            <div style={{ fontSize: 13, color: G.muted, marginBottom: 14 }}>O roteiro foi publicado no eFootball News.</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <a href="/" target="_blank" style={{ padding: '8px 16px', background: G.green, color: '#030f06', borderRadius: 8, textDecoration: 'none', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 12, letterSpacing: '1px', textTransform: 'uppercase' as const }}>Ver site</a>
              <button onClick={limpar} style={{ padding: '8px 16px', background: G.surface2, border: `1px solid ${G.border}`, color: G.muted, borderRadius: 8, cursor: 'pointer', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 12, letterSpacing: '1px', textTransform: 'uppercase' as const }}>Novo vídeo</button>
            </div>
          </div>
        )}

        {/* Steps */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 24 }}>
          {[['Passo 1', 'Transcrição', G.text], ['Passo 2', 'IA Gera', G.text], ['Passo 3', 'Publicar', G.green]].map(([l, v, c]) => (
            <div key={l} style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 12, padding: 14 }}>
              <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, fontSize: 10, letterSpacing: '1.2px', textTransform: 'uppercase' as const, color: G.muted, marginBottom: 5 }}>{l}</div>
              <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 18, color: c as string, lineHeight: 1.1 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
