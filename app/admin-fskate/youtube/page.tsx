'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const G = {
  bg: '#09090b', surface: '#111115', surface2: '#18181c',
  border: '#1d1d20', border2: '#2d2d35',
  text: '#e4e4e7', muted: '#71717a', dim: '#52525b',
  gold: '#e8b84b', green: '#22d3a0', red: '#f87171', blue: '#4f7ef8',
}

const APIS_TRANS = [
  { id: 'supadata', nome: 'Supadata', desc: 'Melhor opção — direto do YouTube', gratis: '100/mês grátis', cor: G.green, link: 'https://supadata.ai', ph: 'sup_...', how: 'supadata.ai → Sign up → API → Create Key' },
  { id: 'rapidapi', nome: 'RapidAPI',  desc: 'Plano gratuito disponível',        gratis: '100/mês grátis', cor: G.blue,  link: 'https://rapidapi.com/solid-api-solid-api-default/api/youtube-transcript3', ph: 'sua-rapid-api-key', how: 'rapidapi.com → Subscribe (Free) → Get Key' },
  { id: 'kome',     nome: 'Kome AI',   desc: 'Transcrição + resumo automático',  gratis: 'Plano gratuito', cor: '#8b5cf6', link: 'https://kome.ai', ph: 'km_...', how: 'kome.ai → Sign up → Settings → API Key' },
]
const APIS_IA = [
  { id: 'groq',    nome: 'Groq',          desc: 'Ultra rápido — llama-3.1',       gratis: '14.400/dia grátis',  cor: G.green,  link: 'https://console.groq.com',               ph: 'gsk_...',  how: 'console.groq.com → API Keys → Create API Key' },
  { id: 'gemini',  nome: 'Google Gemini', desc: 'Gemini 1.5 Flash — gratuito',    gratis: '15 req/min grátis',  cor: G.blue,   link: 'https://aistudio.google.com/apikey',     ph: 'AIza...',  how: 'aistudio.google.com → Get API key' },
  { id: 'cohere',  nome: 'Cohere',        desc: 'Command R — ótimo para PT',      gratis: '1000/mês grátis',    cor: G.gold,   link: 'https://dashboard.cohere.com/api-keys',  ph: 'co_...',   how: 'dashboard.cohere.com → API Keys → New Trial Key' },
  { id: 'mistral', nome: 'Mistral AI',    desc: 'Mistral 7B — rápido e preciso',  gratis: 'Plano gratuito',     cor: '#ec4899', link: 'https://console.mistral.ai/api-keys',    ph: 'mis_...',  how: 'console.mistral.ai → API Keys → Create new key' },
]
const CATS = [
  { slug: 'noticias', name: 'Notícias', color: G.muted },
  { slug: 'eventos',  name: 'Eventos',  color: '#10b981' },
  { slug: 'atualizacoes', name: 'Atualizações', color: G.blue },
  { slug: 'campanhas',name: 'Campanhas',color: G.gold },
  { slug: 'guias',    name: 'Guias',    color: '#8b5cf6' },
  { slug: 'vazamentos-rumores', name: 'Vazamentos', color: G.red },
  { slug: 'top-rank', name: 'Top Rank', color: '#f97316' },
]

type Mode = 'youtube' | 'manual' | 'pesquisa'

function slugify(t: string) {
  return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-').substring(0,80)+'-'+Date.now()
}

const S: any = {
  inp: { width:'100%', background:G.surface2, border:`1px solid ${G.border}`, borderRadius:8, padding:'11px 14px', color:G.text, fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const, marginBottom:10 },
  lbl: { fontSize:10, color:G.dim, fontWeight:700, letterSpacing:'1.2px', textTransform:'uppercase' as const, marginBottom:6, display:'block' },
  card: { background:G.surface, border:`1px solid ${G.border}`, borderRadius:12, overflow:'hidden', marginBottom:12 },
  head: { padding:'11px 16px', borderBottom:`1px solid ${G.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' },
  body: { padding:'16px' },
  btnGrn: { background:G.green, color:'#041a10', border:'none', borderRadius:8, padding:'12px 20px', fontSize:13, fontWeight:900, cursor:'pointer', fontFamily:"'Barlow Condensed',sans-serif", textTransform:'uppercase' as const, letterSpacing:1 },
  btnGold: { background:G.gold, color:'#0a0800', border:'none', borderRadius:8, padding:'12px 20px', fontSize:13, fontWeight:900, cursor:'pointer', fontFamily:"'Barlow Condensed',sans-serif", textTransform:'uppercase' as const, letterSpacing:1 },
  secTitle: { fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:12, letterSpacing:'2px', textTransform:'uppercase' as const, color:G.muted },
  toast: { position:'fixed' as const, top:66, left:'50%', transform:'translateX(-50%)', background:G.surface, border:`1px solid ${G.green}`, borderRadius:8, padding:'9px 20px', fontSize:13, color:G.green, zIndex:300, whiteSpace:'nowrap' as const },
}

export default function RadarIA() {
  const [mode, setMode] = useState<Mode>('youtube')
  const [configOpen, setConfigOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [savingKeys, setSavingKeys] = useState(false)

  // APIs
  const [apiTrans, setApiTrans] = useState('supadata')
  const [keyTrans, setKeyTrans] = useState('')
  const [apiIA, setApiIA] = useState('groq')
  const [keyIA, setKeyIA] = useState('')

  // YouTube mode
  const [ytUrl, setYtUrl] = useState('')
  const [ytCat, setYtCat] = useState('noticias')
  const [ytStatus, setYtStatus] = useState<'published'|'draft'>('published')
  const [ytLoading, setYtLoading] = useState(false)
  const [ytTitulo, setYtTitulo] = useState('')
  const [ytResumo, setYtResumo] = useState('')
  const [ytConteudo, setYtConteudo] = useState('')
  const [ytPublicado, setYtPublicado] = useState(false)
  const [ytPublicando, setYtPublicando] = useState(false)
  const [ytMsg, setYtMsg] = useState('')

  // Manual mode
  const [mTitulo, setMTitulo] = useState('')
  const [mResumo, setMResumo] = useState('')
  const [mConteudo, setMConteudo] = useState('')
  const [mImagem, setMImagem] = useState('')
  const [mFonte, setMFonte] = useState('')
  const [mCat, setMCat] = useState('noticias')
  const [mStatus, setMStatus] = useState<'published'|'draft'>('published')
  const [mLoading, setMLoading] = useState(false)
  const [mPublicado, setMPublicado] = useState(false)

  // Pesquisa mode
  const [pQuery, setPQuery] = useState('')
  const [pCat, setPCat] = useState('noticias')
  const [pStatus, setPStatus] = useState<'published'|'draft'>('published')
  const [pLoading, setPLoading] = useState(false)
  const [pTitulo, setPTitulo] = useState('')
  const [pResumo, setPResumo] = useState('')
  const [pConteudo, setPConteudo] = useState('')
  const [pPublicado, setPPublicado] = useState(false)
  const [pMsg, setPMsg] = useState('')

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  // ── Carregar chaves salvas do Supabase ao abrir ──
  useEffect(() => {
    supabase.from('site_settings').select('key,value')
      .in('key', ['api_trans_id','api_trans_key','api_ia_id','api_ia_key'])
      .then(({ data }) => {
        if (!data) return
        const map: Record<string,string> = {}
        data.forEach((r: any) => { map[r.key] = r.value })
        if (map.api_trans_id) setApiTrans(map.api_trans_id)
        if (map.api_trans_key) setKeyTrans(map.api_trans_key)
        if (map.api_ia_id) setApiIA(map.api_ia_id)
        if (map.api_ia_key) setKeyIA(map.api_ia_key)
      })
  }, [])

  // ── Salvar chaves no Supabase ──
  async function salvarChaves() {
    setSavingKeys(true)
    const items = [
      { key: 'api_trans_id', value: apiTrans },
      { key: 'api_trans_key', value: keyTrans },
      { key: 'api_ia_id', value: apiIA },
      { key: 'api_ia_key', value: keyIA },
    ]
    for (const item of items) {
      await supabase.from('site_settings').upsert(item, { onConflict: 'key' })
    }
    setSavingKeys(false)
    showToast('✅ Chaves salvas!')
    setConfigOpen(false)
  }

  // ── Transcrição YouTube ──
  async function buscarTranscricao(videoId: string): Promise<string> {
    if (apiTrans === 'supadata') {
      const res = await fetch(`https://api.supadata.ai/v1/youtube/transcript?videoId=${videoId}&text=true`, { headers: { 'x-api-key': keyTrans } })
      if (!res.ok) throw new Error('Supadata: ' + res.statusText)
      const d = await res.json(); return d.content || d.text || ''
    }
    if (apiTrans === 'rapidapi') {
      const res = await fetch(`https://youtube-transcript3.p.rapidapi.com/api/transcript?videoId=${videoId}`, { headers: { 'x-rapidapi-key': keyTrans, 'x-rapidapi-host': 'youtube-transcript3.p.rapidapi.com' } })
      if (!res.ok) throw new Error('RapidAPI: ' + res.statusText)
      const d = await res.json(); return (d.transcript||[]).map((t:any)=>t.text).join(' ')
    }
    if (apiTrans === 'kome') {
      const res = await fetch('https://kome.ai/api/transcript', { method:'POST', headers: { 'Authorization':`Bearer ${keyTrans}`, 'Content-Type':'application/json' }, body: JSON.stringify({ url:`https://youtube.com/watch?v=${videoId}` }) })
      if (!res.ok) throw new Error('Kome: ' + res.statusText)
      const d = await res.json(); return d.transcript || ''
    }
    throw new Error('API não reconhecida')
  }

  // ── Gerar com IA ──
  async function gerarComIA(prompt: string): Promise<string> {
    if (apiIA === 'groq') {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', { method:'POST', headers: { 'Authorization':`Bearer ${keyIA}`, 'Content-Type':'application/json' }, body: JSON.stringify({ model:'llama-3.1-8b-instant', max_tokens:2000, temperature:0.3, messages:[{role:'user',content:prompt}] }) })
      if (!res.ok) throw new Error('Groq: ' + res.statusText)
      return (await res.json()).choices?.[0]?.message?.content || ''
    }
    if (apiIA === 'gemini') {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${keyIA}`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ contents:[{parts:[{text:prompt}]}] }) })
      if (!res.ok) throw new Error('Gemini: ' + res.statusText)
      return (await res.json()).candidates?.[0]?.content?.parts?.[0]?.text || ''
    }
    if (apiIA === 'cohere') {
      const res = await fetch('https://api.cohere.com/v1/generate', { method:'POST', headers:{'Authorization':`Bearer ${keyIA}`,'Content-Type':'application/json'}, body: JSON.stringify({ model:'command-r', prompt, max_tokens:2000, temperature:0.3 }) })
      if (!res.ok) throw new Error('Cohere: ' + res.statusText)
      return (await res.json()).generations?.[0]?.text || ''
    }
    if (apiIA === 'mistral') {
      const res = await fetch('https://api.mistral.ai/v1/chat/completions', { method:'POST', headers:{'Authorization':`Bearer ${keyIA}`,'Content-Type':'application/json'}, body: JSON.stringify({ model:'mistral-small-latest', max_tokens:2000, messages:[{role:'user',content:prompt}] }) })
      if (!res.ok) throw new Error('Mistral: ' + res.statusText)
      return (await res.json()).choices?.[0]?.message?.content || ''
    }
    throw new Error('API de IA não reconhecida')
  }

  function parsear(text: string) {
    return {
      titulo: text.match(/TITULO:\s*(.+)/i)?.[1]?.trim() || '',
      resumo: text.match(/RESUMO:\s*(.+)/i)?.[1]?.trim() || '',
      conteudo: text.match(/CONTEUDO:\s*([\s\S]+)/i)?.[1]?.trim() || text,
    }
  }

  const PROMPT_JORNALISTA = (contexto: string, tituloHint = '') => `Você é Ruud Gullit Jr., jornalista do portal eFOOTBALL NEWS. Escreva uma notícia jornalística profissional em português brasileiro sobre eFootball.

${tituloHint ? `CONTEXTO: ${tituloHint}\n` : ''}CONTEÚDO FONTE:
${contexto.substring(0, 5000)}

Responda EXATAMENTE assim (sem markdown extra):
TITULO: [manchete atrativa até 70 chars]
RESUMO: [uma linha de impacto]
CONTEUDO: [texto corrido, mínimo 4 parágrafos, lead jornalístico, sem markdown]`

  // ── MODO YOUTUBE ──
  async function gerarDoYoutube() {
    if (!ytUrl.trim()) { showToast('⚠️ Cole um link do YouTube'); return }
    if (!keyTrans.trim()) { showToast('⚠️ Configure a chave de transcrição nas APIs'); setConfigOpen(true); return }
    if (!keyIA.trim()) { showToast('⚠️ Configure a chave de IA nas APIs'); setConfigOpen(true); return }
    setYtLoading(true); setYtMsg('🔄 Buscando transcrição...')
    setYtTitulo(''); setYtResumo(''); setYtConteudo(''); setYtPublicado(false)
    try {
      let videoId = ''
      try { const u = new URL(ytUrl); videoId = u.searchParams.get('v') || u.pathname.slice(1).split('?')[0] } catch {}
      if (!videoId) throw new Error('URL inválida')
      let tituloVideo = 'Vídeo eFootball'
      try { const oe = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(ytUrl)}&format=json`); if(oe.ok) tituloVideo=(await oe.json()).title||tituloVideo } catch {}
      setYtMsg(`🔄 Transcrevendo com ${APIS_TRANS.find(a=>a.id===apiTrans)?.nome}...`)
      const transcricao = await buscarTranscricao(videoId)
      if (!transcricao || transcricao.length < 50) throw new Error('Transcrição não encontrada. O vídeo tem legendas?')
      setYtMsg(`🤖 Gerando notícia com ${APIS_IA.find(a=>a.id===apiIA)?.nome}...`)
      const raw = await gerarComIA(PROMPT_JORNALISTA(transcricao, tituloVideo))
      const p = parsear(raw)
      setYtTitulo(p.titulo || tituloVideo)
      setYtResumo(p.resumo)
      setYtConteudo(p.conteudo)
      setYtMsg('✅ Notícia gerada!')
    } catch(e: any) { setYtMsg('❌ ' + e.message) }
    setYtLoading(false)
  }

  async function publicarYt() {
    setYtPublicando(true)
    let videoId = ''; try { const u = new URL(ytUrl); videoId = u.searchParams.get('v')||'' } catch {}
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', ytCat).single()
    await supabase.from('posts').insert({
      title: ytTitulo, slug: slugify(ytTitulo), summary: ytResumo||null,
      content: ytConteudo + `\n\n━━━━━━━━━━━━━━━━\n📺 Fonte: YouTube\n🔗 ${ytUrl}`,
      cover_image: videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null,
      category_id: cat?.id||null, tags:['efootball','youtube'], status: ytStatus,
      source_type:'youtube', source_url:ytUrl, auto_published:false,
      published_at: ytStatus==='published' ? new Date().toISOString() : null
    })
    setYtPublicando(false); setYtPublicado(true)
  }

  // ── MODO MANUAL ──
  async function publicarManual() {
    if (!mTitulo.trim()) { showToast('⚠️ Título obrigatório'); return }
    setMLoading(true)
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', mCat).single()
    const { error } = await supabase.from('posts').insert({
      title: mTitulo, slug: slugify(mTitulo), summary: mResumo||null, content: mConteudo||null,
      cover_image: mImagem||null, source_url: mFonte||null, category_id: cat?.id||null,
      tags:['efootball'], status: mStatus, source_type:'manual', auto_published:false,
      published_at: mStatus==='published' ? new Date().toISOString() : null
    })
    setMLoading(false)
    if (error) { showToast('❌ '+error.message); return }
    setMPublicado(true)
    setTimeout(() => { setMTitulo(''); setMResumo(''); setMConteudo(''); setMImagem(''); setMFonte(''); setMPublicado(false) }, 3000)
  }

  // ── MODO PESQUISA ──
  async function pesquisarEGerar() {
    if (!pQuery.trim()) { showToast('⚠️ Digite o tema para pesquisar'); return }
    if (!keyIA.trim()) { showToast('⚠️ Configure a chave de IA nas APIs'); setConfigOpen(true); return }
    setPLoading(true); setPMsg('🤖 Gerando notícia sobre o tema...')
    setPTitulo(''); setPResumo(''); setPConteudo(''); setPPublicado(false)
    try {
      const prompt = `Você é Ruud Gullit Jr., jornalista do portal eFOOTBALL NEWS. Escreva uma notícia jornalística completa em português brasileiro sobre eFootball com base no tema abaixo.

TEMA / PESQUISA: ${pQuery}

Instruções:
- Escreva como um portal de notícias esportivas profissional
- Use seu conhecimento sobre eFootball para contextualizar
- Se for especulação, deixe claro que é boato/rumor
- Mínimo 4 parágrafos bem desenvolvidos

Responda EXATAMENTE assim:
TITULO: [manchete atrativa]
RESUMO: [uma linha]
CONTEUDO: [texto completo sem markdown]`
      const raw = await gerarComIA(prompt)
      const p = parsear(raw)
      setPTitulo(p.titulo || pQuery)
      setPResumo(p.resumo)
      setPConteudo(p.conteudo)
      setPMsg('✅ Notícia gerada!')
    } catch(e: any) { setPMsg('❌ ' + e.message) }
    setPLoading(false)
  }

  async function publicarPesquisa() {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', pCat).single()
    await supabase.from('posts').insert({
      title: pTitulo, slug: slugify(pTitulo), summary: pResumo||null, content: pConteudo||null,
      category_id: cat?.id||null, tags:['efootball'], status: pStatus, source_type:'manual',
      auto_published:false, published_at: pStatus==='published' ? new Date().toISOString() : null
    })
    setPPublicado(true)
  }

  const CatButtons = ({ val, set }: { val: string, set: (v:string) => void }) => (
    <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:12 }}>
      {CATS.map(c => (
        <button key={c.slug} onClick={() => set(c.slug)}
          style={{ padding:'5px 10px', borderRadius:6, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:10, fontWeight:700, letterSpacing:'0.8px', textTransform:'uppercase',
            background: val===c.slug ? c.color+'22' : G.surface2,
            color: val===c.slug ? c.color : G.muted,
            outline: val===c.slug ? `1px solid ${c.color}55` : `1px solid ${G.border}` }}>
          {c.name}
        </button>
      ))}
    </div>
  )

  const StatusButtons = ({ val, set }: { val: 'published'|'draft', set: (v:'published'|'draft') => void }) => (
    <div style={{ display:'flex', gap:8, marginBottom:12 }}>
      {(['published','draft'] as const).map(s => (
        <button key={s} onClick={() => set(s)}
          style={{ flex:1, padding:'10px', borderRadius:8, border:'none', cursor:'pointer', fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:12, letterSpacing:'1px', textTransform:'uppercase',
            background: val===s ? (s==='published'?G.green:G.gold) : G.surface2,
            color: val===s ? (s==='published'?'#041a10':'#0a0800') : G.muted }}>
          {s==='published' ? '✅ Publicar' : '◻ Rascunho'}
        </button>
      ))}
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:G.bg, color:G.text, fontFamily:"'Barlow',sans-serif", paddingBottom:40 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=Barlow:wght@400;500&display=swap'); input:focus,textarea:focus{border-color:${G.gold}!important;outline:none} @keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {toast && <div style={S.toast}>{toast}</div>}

      {/* Header */}
      <header style={{ background:G.surface, borderBottom:`1px solid ${G.border}`, padding:'0 1.25rem', height:54, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <a href="/admin-fskate" style={{ color:G.muted, textDecoration:'none', fontSize:20 }}>←</a>
          <div>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:18, textTransform:'uppercase', letterSpacing:1, color:G.text }}>
              RADAR <span style={{ color:G.gold }}>IA</span>
            </div>
            <div style={{ fontSize:9, color:G.dim, letterSpacing:'2px', textTransform:'uppercase', fontWeight:700 }}>Publicações</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <button onClick={() => setConfigOpen(!configOpen)}
            style={{ fontSize:10, color:configOpen?G.gold:G.muted, background:configOpen?'rgba(232,184,75,0.08)':G.surface2, border:`1px solid ${configOpen?'rgba(232,184,75,0.25)':G.border}`, borderRadius:6, padding:'5px 10px', cursor:'pointer', fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', fontFamily:'inherit' }}>
            ⚙️ APIs
          </button>
          <a href="/" target="_blank" style={{ fontSize:10, color:G.dim, textDecoration:'none', fontWeight:700, letterSpacing:'1px', textTransform:'uppercase' }}>Ver site →</a>
        </div>
      </header>

      <div style={{ maxWidth:720, margin:'0 auto', padding:'1.25rem 1rem' }}>

        {/* ── CONFIG APIS (colapsável) ── */}
        {configOpen && (
          <div style={S.card}>
            <div style={S.head}>
              <span style={S.secTitle}>⚙️ Configuração de APIs</span>
              <button onClick={() => setConfigOpen(false)} style={{ background:'none',border:'none',color:G.muted,cursor:'pointer',fontSize:18 }}>✕</button>
            </div>
            <div style={S.body}>
              {/* Transcrição */}
              <div style={{ marginBottom:16 }}>
                <label style={S.lbl}>API de Transcrição do YouTube</label>
                <div style={{ display:'flex', flexDirection:'column', gap:5, marginBottom:10 }}>
                  {APIS_TRANS.map(api => (
                    <button key={api.id} onClick={() => setApiTrans(api.id)}
                      style={{ padding:'9px 12px', borderRadius:8, border:'none', cursor:'pointer', fontFamily:'inherit', textAlign:'left', background:apiTrans===api.id?api.cor+'14':G.surface2, outline:apiTrans===api.id?`1px solid ${api.cor}44`:`1px solid ${G.border}` }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:13, color:apiTrans===api.id?api.cor:G.text }}>{api.nome}</span>
                        <div style={{ display:'flex', gap:6 }}>
                          <span style={{ fontSize:9, color:G.green, fontWeight:700, background:'rgba(34,211,160,0.1)', padding:'2px 7px', borderRadius:10 }}>{api.gratis}</span>
                          <a href={api.link} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{ fontSize:9, color:G.blue, fontWeight:700, background:'rgba(79,126,248,0.1)', padding:'2px 7px', borderRadius:10, textDecoration:'none' }}>Pegar key →</a>
                        </div>
                      </div>
                      <div style={{ fontSize:11, color:G.dim, marginTop:2 }}>{api.desc}</div>
                      {apiTrans===api.id && <div style={{ fontSize:10, color:G.muted, marginTop:5, padding:'5px 8px', background:'rgba(0,0,0,0.2)', borderRadius:5 }}>📋 {api.how}</div>}
                    </button>
                  ))}
                </div>
                <label style={S.lbl}>Chave — {APIS_TRANS.find(a=>a.id===apiTrans)?.nome}</label>
                <input style={{ ...S.inp, fontFamily:'monospace' }} type="password" placeholder={APIS_TRANS.find(a=>a.id===apiTrans)?.ph} value={keyTrans} onChange={e=>setKeyTrans(e.target.value)} />
              </div>

              <div style={{ height:1, background:G.border, marginBottom:16 }} />

              {/* IA */}
              <div style={{ marginBottom:16 }}>
                <label style={S.lbl}>API de IA para gerar a notícia</label>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:10 }}>
                  {APIS_IA.map(api => (
                    <button key={api.id} onClick={() => setApiIA(api.id)}
                      style={{ padding:'9px 12px', borderRadius:8, border:'none', cursor:'pointer', fontFamily:'inherit', textAlign:'left', background:apiIA===api.id?api.cor+'14':G.surface2, outline:apiIA===api.id?`1px solid ${api.cor}44`:`1px solid ${G.border}` }}>
                      <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:13, color:apiIA===api.id?api.cor:G.text }}>{api.nome}</div>
                      <div style={{ fontSize:10, color:G.dim, marginTop:1 }}>{api.desc}</div>
                      <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
                        <span style={{ fontSize:9, color:G.green, fontWeight:700 }}>{api.gratis}</span>
                        <a href={api.link} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{ fontSize:9, color:G.blue, fontWeight:700, textDecoration:'none' }}>key →</a>
                      </div>
                      {apiIA===api.id && <div style={{ fontSize:10, color:G.muted, marginTop:5, padding:'4px 6px', background:'rgba(0,0,0,0.2)', borderRadius:5 }}>📋 {api.how}</div>}
                    </button>
                  ))}
                </div>
                <label style={S.lbl}>Chave — {APIS_IA.find(a=>a.id===apiIA)?.nome}</label>
                <input style={{ ...S.inp, fontFamily:'monospace' }} type="password" placeholder={APIS_IA.find(a=>a.id===apiIA)?.ph} value={keyIA} onChange={e=>setKeyIA(e.target.value)} />
              </div>

              <button onClick={salvarChaves} disabled={savingKeys}
                style={{ ...S.btnGrn, width:'100%', opacity:savingKeys?0.6:1 }}>
                {savingKeys ? '💾 Salvando...' : '💾 Salvar chaves (ficam gravadas)'}
              </button>
              <p style={{ fontSize:11, color:G.dim, marginTop:8, textAlign:'center' }}>As chaves ficam salvas no banco — não precisará digitar de novo.</p>
            </div>
          </div>
        )}

        {/* ── SELETOR DE MODO ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:'1rem' }}>
          {([
            { id:'youtube',  icon:'▶',  label:'YouTube → Post',       desc:'Transcreve vídeo e gera notícia' },
            { id:'pesquisa', icon:'🔍', label:'Pesquisa + IA',        desc:'Tema → IA gera a notícia' },
            { id:'manual',   icon:'✏️', label:'Post Manual',          desc:'Você escreve tudo' },
          ] as {id:Mode,icon:string,label:string,desc:string}[]).map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              style={{ padding:'14px 10px', borderRadius:12, border:'none', cursor:'pointer', fontFamily:'inherit', textAlign:'center', background:mode===m.id?'rgba(232,184,75,0.08)':G.surface, outline:mode===m.id?`1px solid rgba(232,184,75,0.35)`:`1px solid ${G.border}`, transition:'all .15s' }}>
              <div style={{ fontSize:20, marginBottom:4 }}>{m.icon}</div>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:12, color:mode===m.id?G.gold:G.text, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:2 }}>{m.label}</div>
              <div style={{ fontSize:10, color:G.dim, lineHeight:1.4 }}>{m.desc}</div>
            </button>
          ))}
        </div>

        {/* ── MODO YOUTUBE ── */}
        {mode === 'youtube' && (
          <div style={S.card}>
            <div style={S.head}><span style={S.secTitle}>▶ YouTube → Notícia</span></div>
            <div style={S.body}>
              <label style={S.lbl}>Link do YouTube</label>
              <input style={S.inp} placeholder="https://www.youtube.com/watch?v=..." value={ytUrl} onChange={e=>setYtUrl(e.target.value)} onKeyDown={e=>e.key==='Enter'&&gerarDoYoutube()} />
              <label style={S.lbl}>Categoria</label>
              <CatButtons val={ytCat} set={setYtCat} />
              <StatusButtons val={ytStatus} set={setYtStatus} />
              <button onClick={gerarDoYoutube} disabled={ytLoading}
                style={{ ...S.btnGrn, width:'100%', opacity:ytLoading?0.6:1, marginBottom:ytMsg?10:0 }}>
                {ytLoading ? <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}><span style={{ width:14,height:14,border:'2px solid rgba(0,0,0,.3)',borderTopColor:'rgba(0,0,0,.8)',borderRadius:'50%',display:'inline-block',animation:'spin .7s linear infinite' }}/>Gerando...</span> : '▶ Gerar notícia'}
              </button>
              {ytMsg && <div style={{ fontSize:12, color:ytMsg.startsWith('❌')?G.red:ytMsg.startsWith('✅')?G.green:G.blue, marginBottom:10 }}>{ytMsg}</div>}

              {ytConteudo && !ytPublicado && (
                <>
                  <div style={{ height:1, background:G.border, margin:'12px 0' }} />
                  <label style={S.lbl}>Título</label>
                  <input style={S.inp} value={ytTitulo} onChange={e=>setYtTitulo(e.target.value)} />
                  <label style={S.lbl}>Resumo</label>
                  <input style={S.inp} value={ytResumo} onChange={e=>setYtResumo(e.target.value)} />
                  <label style={S.lbl}>Conteúdo</label>
                  <textarea style={{ ...S.inp, minHeight:160, resize:'vertical', fontFamily:'monospace', fontSize:13, lineHeight:1.6 }} value={ytConteudo} onChange={e=>setYtConteudo(e.target.value)} />
                  <button onClick={publicarYt} disabled={ytPublicando}
                    style={{ ...S.btnGold, width:'100%', opacity:ytPublicando?0.6:1 }}>
                    {ytPublicando ? 'Publicando...' : '✅ Publicar no site'}
                  </button>
                </>
              )}
              {ytPublicado && <div style={{ textAlign:'center', padding:'1rem', color:G.green, fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:16, textTransform:'uppercase' }}>🎉 Publicado!</div>}
            </div>
          </div>
        )}

        {/* ── MODO PESQUISA ── */}
        {mode === 'pesquisa' && (
          <div style={S.card}>
            <div style={S.head}><span style={S.secTitle}>🔍 Pesquisa + IA → Notícia</span></div>
            <div style={S.body}>
              <label style={S.lbl}>Tema / Pesquisa</label>
              <textarea style={{ ...S.inp, minHeight:80, resize:'vertical' }} placeholder={'Ex: Novo patch 5.3 do eFootball\nEx: Melhor time épico do momento\nEx: Copa do Mundo no eFootball 2026'} value={pQuery} onChange={e=>setPQuery(e.target.value)} />
              <label style={S.lbl}>Categoria</label>
              <CatButtons val={pCat} set={setPCat} />
              <StatusButtons val={pStatus} set={setPStatus} />
              <button onClick={pesquisarEGerar} disabled={pLoading}
                style={{ ...S.btnGrn, width:'100%', opacity:pLoading?0.6:1, marginBottom:pMsg?10:0 }}>
                {pLoading ? <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}><span style={{ width:14,height:14,border:'2px solid rgba(0,0,0,.3)',borderTopColor:'rgba(0,0,0,.8)',borderRadius:'50%',display:'inline-block',animation:'spin .7s linear infinite' }}/>Gerando...</span> : '🤖 Gerar com IA'}
              </button>
              {pMsg && <div style={{ fontSize:12, color:pMsg.startsWith('❌')?G.red:pMsg.startsWith('✅')?G.green:G.blue, marginBottom:10 }}>{pMsg}</div>}

              {pConteudo && !pPublicado && (
                <>
                  <div style={{ height:1, background:G.border, margin:'12px 0' }} />
                  <label style={S.lbl}>Título</label>
                  <input style={S.inp} value={pTitulo} onChange={e=>setPTitulo(e.target.value)} />
                  <label style={S.lbl}>Resumo</label>
                  <input style={S.inp} value={pResumo} onChange={e=>setPResumo(e.target.value)} />
                  <label style={S.lbl}>Conteúdo</label>
                  <textarea style={{ ...S.inp, minHeight:160, resize:'vertical', fontFamily:'monospace', fontSize:13, lineHeight:1.6 }} value={pConteudo} onChange={e=>setPConteudo(e.target.value)} />
                  <button onClick={publicarPesquisa}
                    style={{ ...S.btnGold, width:'100%' }}>
                    ✅ Publicar no site
                  </button>
                </>
              )}
              {pPublicado && <div style={{ textAlign:'center', padding:'1rem', color:G.green, fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:16, textTransform:'uppercase' }}>🎉 Publicado!</div>}
            </div>
          </div>
        )}

        {/* ── MODO MANUAL ── */}
        {mode === 'manual' && (
          <div style={S.card}>
            <div style={S.head}><span style={S.secTitle}>✏️ Post Manual</span></div>
            <div style={S.body}>
              <label style={S.lbl}>Título *</label>
              <input style={S.inp} placeholder="Título da notícia..." value={mTitulo} onChange={e=>setMTitulo(e.target.value)} />
              <label style={S.lbl}>Categoria</label>
              <CatButtons val={mCat} set={setMCat} />
              <label style={S.lbl}>Resumo</label>
              <textarea style={{ ...S.inp, minHeight:60, resize:'vertical' }} placeholder="Resumo curto para os cards..." value={mResumo} onChange={e=>setMResumo(e.target.value)} />
              <label style={S.lbl}>Conteúdo</label>
              <textarea style={{ ...S.inp, minHeight:200, resize:'vertical', fontFamily:'monospace', fontSize:13, lineHeight:1.6 }} placeholder={'Texto completo...\n\nUse ## para título de seção\nUse # para subtítulo'} value={mConteudo} onChange={e=>setMConteudo(e.target.value)} />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div><label style={S.lbl}>URL da Imagem</label><input style={S.inp} placeholder="https://..." value={mImagem} onChange={e=>setMImagem(e.target.value)} /></div>
                <div><label style={S.lbl}>Fonte / Link</label><input style={S.inp} placeholder="https://..." value={mFonte} onChange={e=>setMFonte(e.target.value)} /></div>
              </div>
              {mImagem && <div style={{ borderRadius:8,overflow:'hidden',border:`1px solid ${G.border}`,marginBottom:12 }}><img src={mImagem} alt="preview" style={{ width:'100%',height:'auto',display:'block',maxHeight:200,objectFit:'contain',background:G.surface2 }} /></div>}
              <StatusButtons val={mStatus} set={setMStatus} />
              {mPublicado
                ? <div style={{ textAlign:'center', padding:'1rem', color:G.green, fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:16, textTransform:'uppercase' }}>🎉 Publicado!</div>
                : <button onClick={publicarManual} disabled={mLoading} style={{ ...S.btnGold, width:'100%', opacity:mLoading?0.6:1 }}>
                    {mLoading ? 'Publicando...' : '✅ Publicar no site'}
                  </button>
              }
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
