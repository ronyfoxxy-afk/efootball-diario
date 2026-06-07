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
  { id: 'supadata', nome: 'Supadata',  desc: 'Melhor opção — direto do YouTube', gratis: '100/mês grátis', cor: G.green, link: 'https://supadata.ai',                                                                     ph: 'sup_...',          how: 'supadata.ai → Sign up → API → Create Key' },
  { id: 'rapidapi', nome: 'RapidAPI',  desc: 'Plano gratuito disponível',         gratis: '100/mês grátis', cor: G.blue,  link: 'https://rapidapi.com/solid-api-solid-api-default/api/youtube-transcript3', ph: 'sua-rapid-api-key', how: 'rapidapi.com → Subscribe Free → Get Key' },
  { id: 'kome',     nome: 'Kome AI',   desc: 'Transcrição + resumo automático',   gratis: 'Plano gratuito', cor: '#8b5cf6', link: 'https://kome.ai',                                                                      ph: 'km_...',           how: 'kome.ai → Sign up → Settings → API Key' },
]
const APIS_IA = [
  { id: 'groq',    nome: 'Groq',          desc: 'Ultra rápido — llama-3.3 grátis', gratis: '14.400/dia grátis', cor: G.green,   link: 'https://console.groq.com',              ph: 'gsk_...',  how: 'console.groq.com → API Keys → Create API Key' },
  { id: 'gemini',  nome: 'Google Gemini', desc: 'Gemini 1.5 Flash — gratuito',     gratis: '15 req/min grátis', cor: G.blue,    link: 'https://aistudio.google.com/apikey',    ph: 'AIza...', how: 'aistudio.google.com → Get API key' },
  { id: 'cohere',  nome: 'Cohere',        desc: 'Command R — ótimo para PT',       gratis: '1000/mês grátis',   cor: G.gold,    link: 'https://dashboard.cohere.com/api-keys', ph: 'co_...',   how: 'dashboard.cohere.com → API Keys → New Trial Key' },
  { id: 'mistral', nome: 'Mistral AI',    desc: 'Mistral 7B — rápido e preciso',   gratis: 'Plano gratuito',    cor: '#ec4899', link: 'https://console.mistral.ai/api-keys',   ph: 'mis_...',  how: 'console.mistral.ai → API Keys → Create new key' },
]
const CATS = [
  { slug: 'noticias',          name: 'Notícias',     color: G.muted   },
  { slug: 'eventos',           name: 'Eventos',      color: '#10b981' },
  { slug: 'atualizacoes',      name: 'Atualizações', color: G.blue    },
  { slug: 'campanhas',         name: 'Campanhas',    color: G.gold    },
  { slug: 'guias',             name: 'Guias',        color: '#8b5cf6' },
  { slug: 'vazamentos-rumores',name: 'Vazamentos',   color: G.red     },
  { slug: 'top-rank',          name: 'Top Rank',     color: '#f97316' },
]

// ── PROMPT RUUD GULLIT JR. — usado em TODAS as IAs ──
const PROMPT_RUUD = (contexto: string, titulo = '') => `Você é Ruud Gullit Jr., jornalista experiente e especialista exclusivamente no jogo eFootball da Konami. Você escreve para o portal "eFOOTBALL NEWS".

## Estilo obrigatório
- Tom profissional, dinâmico e envolvente, típico de portal esportivo digital
- Use manchetes chamativas com emojis como 🔥 🚨 💣 quando pertinente
- Escreva SEMPRE em português do Brasil, claro e direto
- Abra com lead jornalístico forte: O quê? Quem? Quando? Onde? Por quê?
- Mínimo 4 parágrafos bem desenvolvidos, texto corrido sem markdown

## Regras de veracidade — CRÍTICAS
- Use APENAS as informações presentes no contexto fornecido abaixo
- Se algo não estiver confirmado, diga claramente: "segundo rumores", "fontes indicam", "ainda não confirmado"
- NUNCA invente datas, jogadores, eventos ou detalhes que não estejam no contexto
- Se o contexto for insuficiente, diga que as informações são limitadas

## Contexto da notícia
${titulo ? `TÍTULO/TEMA: ${titulo}\n` : ''}${contexto}

## Formato de resposta OBRIGATÓRIO
TITULO: [manchete atrativa até 70 caracteres]
RESUMO: [uma linha de impacto, máximo 150 caracteres]
CONTEUDO: [texto completo, mínimo 4 parágrafos, sem markdown, sem títulos internos]`

type Mode = 'youtube' | 'manual' | 'pesquisa'

function slugify(t: string) {
  return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-').substring(0,80)+'-'+Date.now()
}

const S: any = {
  inp:    { width:'100%', background:G.surface2, border:`1px solid ${G.border}`, borderRadius:8, padding:'11px 14px', color:G.text, fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const, marginBottom:10 },
  lbl:    { fontSize:10, color:G.dim, fontWeight:700, letterSpacing:'1.2px', textTransform:'uppercase' as const, marginBottom:6, display:'block' },
  card:   { background:G.surface, border:`1px solid ${G.border}`, borderRadius:12, overflow:'hidden', marginBottom:12 },
  head:   { padding:'11px 16px', borderBottom:`1px solid ${G.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' },
  body:   { padding:'16px' },
  btnGrn: { background:G.green, color:'#041a10', border:'none', borderRadius:8, padding:'12px 20px', fontSize:13, fontWeight:900, cursor:'pointer', fontFamily:"'Barlow Condensed',sans-serif", textTransform:'uppercase' as const, letterSpacing:1 },
  btnGld: { background:G.gold,  color:'#0a0800', border:'none', borderRadius:8, padding:'12px 20px', fontSize:13, fontWeight:900, cursor:'pointer', fontFamily:"'Barlow Condensed',sans-serif", textTransform:'uppercase' as const, letterSpacing:1 },
  secTit: { fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:12, letterSpacing:'2px', textTransform:'uppercase' as const, color:G.muted },
  toast:  { position:'fixed' as const, top:66, left:'50%', transform:'translateX(-50%)', background:G.surface, border:`1px solid ${G.green}`, borderRadius:8, padding:'9px 20px', fontSize:13, color:G.green, zIndex:300, whiteSpace:'nowrap' as const },
}

export default function RadarIA() {
  const [mode, setMode] = useState<Mode>('youtube')
  const [configOpen, setConfigOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [savingKeys, setSavingKeys] = useState(false)

  const [apiTrans, setApiTrans] = useState('supadata')
  const [keyTrans, setKeyTrans] = useState('')
  const [apiIA, setApiIA] = useState('groq')
  const [keyIA, setKeyIA] = useState('')

  // YouTube
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
  const [ytMsgType, setYtMsgType] = useState<'ok'|'err'|'info'>('info')

  // Pesquisa
  const [pQuery, setPQuery] = useState('')
  const [pCat, setPCat] = useState('noticias')
  const [pStatus, setPStatus] = useState<'published'|'draft'>('published')
  const [pLoading, setPLoading] = useState(false)
  const [pTitulo, setPTitulo] = useState('')
  const [pResumo, setPResumo] = useState('')
  const [pConteudo, setPConteudo] = useState('')
  const [pPublicado, setPPublicado] = useState(false)
  const [pMsg, setPMsg] = useState('')
  const [pMsgType, setPMsgType] = useState<'ok'|'err'|'info'>('info')

  // Manual
  const [mTitulo, setMTitulo] = useState('')
  const [mResumo, setMResumo] = useState('')
  const [mConteudo, setMConteudo] = useState('')
  const [mImagem, setMImagem] = useState('')
  const [mFonte, setMFonte] = useState('')
  const [mCat, setMCat] = useState('noticias')
  const [mStatus, setMStatus] = useState<'published'|'draft'>('published')
  const [mLoading, setMLoading] = useState(false)
  const [mPublicado, setMPublicado] = useState(false)

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  // ── Carregar chaves salvas ──
  useEffect(() => {
    supabase.from('site_settings').select('key,value')
      .in('key', ['api_trans_id','api_trans_key','api_ia_id','api_ia_key'])
      .then(({ data }) => {
        if (!data) return
        const m: Record<string,string> = {}
        data.forEach((r: any) => { m[r.key] = r.value })
        if (m.api_trans_id) setApiTrans(m.api_trans_id)
        if (m.api_trans_key) setKeyTrans(m.api_trans_key)
        if (m.api_ia_id) setApiIA(m.api_ia_id)
        if (m.api_ia_key) setKeyIA(m.api_ia_key)
      })
  }, [])

  async function salvarChaves() {
    setSavingKeys(true)
    for (const item of [
      { key:'api_trans_id', value:apiTrans },
      { key:'api_trans_key', value:keyTrans },
      { key:'api_ia_id', value:apiIA },
      { key:'api_ia_key', value:keyIA },
    ]) { await supabase.from('site_settings').upsert(item, { onConflict:'key' }) }
    setSavingKeys(false)
    showToast('✅ Chaves salvas!')
    setConfigOpen(false)
  }

  // ── Transcrição YouTube ──
  async function buscarTranscricao(videoId: string): Promise<string> {
    if (apiTrans === 'supadata') {
      const res = await fetch(`https://api.supadata.ai/v1/youtube/transcript?videoId=${videoId}&text=true`, { headers: { 'x-api-key': keyTrans } })
      if (!res.ok) throw new Error(`Supadata erro ${res.status}: ${res.statusText}`)
      const d = await res.json()
      return d.content || d.text || ''
    }
    if (apiTrans === 'rapidapi') {
      const res = await fetch(`https://youtube-transcript3.p.rapidapi.com/api/transcript?videoId=${videoId}`, { headers: { 'x-rapidapi-key': keyTrans, 'x-rapidapi-host': 'youtube-transcript3.p.rapidapi.com' } })
      if (!res.ok) throw new Error(`RapidAPI erro ${res.status}: ${res.statusText}`)
      const d = await res.json()
      return (d.transcript || []).map((t:any) => t.text).join(' ')
    }
    if (apiTrans === 'kome') {
      const res = await fetch('https://kome.ai/api/transcript', { method:'POST', headers: { 'Authorization':`Bearer ${keyTrans}`, 'Content-Type':'application/json' }, body: JSON.stringify({ url:`https://youtube.com/watch?v=${videoId}` }) })
      if (!res.ok) throw new Error(`Kome erro ${res.status}: ${res.statusText}`)
      const d = await res.json()
      return d.transcript || ''
    }
    throw new Error('API de transcrição não reconhecida')
  }

  // ── Pesquisa web via IA (fallback quando transcrição falha) ──
  async function pesquisarInfoVideo(tituloVideo: string, urlVideo: string): Promise<string> {
    // Usa a própria IA para buscar contexto sobre o vídeo baseado no título
    const prompt = `Você é um agente de pesquisa especialista em eFootball. Com base no título do vídeo abaixo, forneça tudo que você sabe sobre esse assunto no eFootball.

TÍTULO DO VÍDEO: "${tituloVideo}"
URL: ${urlVideo}

Forneça:
1. Contexto sobre o assunto (patch, evento, jogador, campanha, etc.)
2. Informações relevantes que provavelmente são abordadas no vídeo
3. Dados oficiais ou amplamente conhecidos sobre esse tema no eFootball

IMPORTANTE: Seja honesto sobre o que é confirmado vs especulação. Não invente dados específicos que não conhece.`

    return await chamarIA(prompt)
  }

  // ── Chamar IA (Ruud Gullit Jr. em TODAS) ──
  async function chamarIA(prompt: string): Promise<string> {
    if (apiIA === 'groq') {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method:'POST', headers: { 'Authorization':`Bearer ${keyIA}`, 'Content-Type':'application/json' },
        body: JSON.stringify({ model:'llama-3.3-70b-versatile', max_tokens:2000, temperature:0.5, messages:[{ role:'user', content:prompt }] })
      })
      if (!res.ok) throw new Error(`Groq erro ${res.status}: ${res.statusText}`)
      return (await res.json()).choices?.[0]?.message?.content || ''
    }
    if (apiIA === 'gemini') {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${keyIA}`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ contents:[{ parts:[{ text:prompt }] }] })
      })
      if (!res.ok) throw new Error(`Gemini erro ${res.status}: ${res.statusText}`)
      return (await res.json()).candidates?.[0]?.content?.parts?.[0]?.text || ''
    }
    if (apiIA === 'cohere') {
      const res = await fetch('https://api.cohere.com/v1/generate', {
        method:'POST', headers:{'Authorization':`Bearer ${keyIA}`,'Content-Type':'application/json'},
        body: JSON.stringify({ model:'command-r', prompt, max_tokens:2000, temperature:0.5 })
      })
      if (!res.ok) throw new Error(`Cohere erro ${res.status}: ${res.statusText}`)
      return (await res.json()).generations?.[0]?.text || ''
    }
    if (apiIA === 'mistral') {
      const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method:'POST', headers:{'Authorization':`Bearer ${keyIA}`,'Content-Type':'application/json'},
        body: JSON.stringify({ model:'mistral-small-latest', max_tokens:2000, messages:[{ role:'user', content:prompt }] })
      })
      if (!res.ok) throw new Error(`Mistral erro ${res.status}: ${res.statusText}`)
      return (await res.json()).choices?.[0]?.message?.content || ''
    }
    throw new Error('API de IA não reconhecida')
  }

  function parsear(text: string) {
    return {
      titulo:   text.match(/TITULO:\s*(.+)/i)?.[1]?.trim() || '',
      resumo:   text.match(/RESUMO:\s*(.+)/i)?.[1]?.trim() || '',
      conteudo: text.match(/CONTEUDO:\s*([\s\S]+)/i)?.[1]?.trim() || text,
    }
  }

  // ── MODO YOUTUBE ──
  async function gerarDoYoutube() {
    if (!ytUrl.trim()) { showToast('⚠️ Cole um link do YouTube'); return }
    if (!keyIA.trim()) { showToast('⚠️ Configure a chave de IA'); setConfigOpen(true); return }
    setYtLoading(true); setYtTitulo(''); setYtResumo(''); setYtConteudo(''); setYtPublicado(false)

    try {
      let videoId = ''
      try { const u = new URL(ytUrl); videoId = u.searchParams.get('v') || u.pathname.slice(1).split('?')[0] } catch {}
      if (!videoId) throw new Error('URL do YouTube inválida — use o link completo com ?v=')

      // Buscar título via oEmbed
      let tituloVideo = 'Vídeo eFootball'
      try {
        const oe = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(ytUrl)}&format=json`)
        if (oe.ok) tituloVideo = (await oe.json()).title || tituloVideo
      } catch {}

      let contexto = ''
      let usouPesquisa = false

      // Tentar transcrição se tiver a chave configurada
      if (keyTrans.trim()) {
        try {
          setYtMsg(`🔄 Transcrevendo via ${APIS_TRANS.find(a=>a.id===apiTrans)?.nome}...`); setYtMsgType('info')
          const transcricao = await buscarTranscricao(videoId)
          if (transcricao && transcricao.length >= 100) {
            contexto = `TRANSCRIÇÃO DO VÍDEO:\n${transcricao.substring(0, 6000)}`
          } else {
            throw new Error('Transcrição muito curta ou vazia')
          }
        } catch (e: any) {
          setYtMsg(`⚠️ Transcrição falhou (${e.message}) — usando pesquisa sobre o tema...`); setYtMsgType('info')
          usouPesquisa = true
        }
      } else {
        setYtMsg('ℹ️ Sem chave de transcrição — buscando contexto via pesquisa...')
        setYtMsgType('info')
        usouPesquisa = true
      }

      // Se transcrição falhou, usar agente de pesquisa
      if (usouPesquisa) {
        setYtMsg('🔍 Agente de pesquisa buscando informações sobre o tema...'); setYtMsgType('info')
        try {
          const pesquisa = await pesquisarInfoVideo(tituloVideo, ytUrl)
          contexto = `PESQUISA SOBRE O TEMA (vídeo sem transcrição disponível):\n${pesquisa}\n\nNOTA: A notícia deve ser baseada APENAS nas informações acima. Mencione que é baseado no tema do vídeo "${tituloVideo}".`
        } catch (e2: any) {
          throw new Error('Transcrição e pesquisa falharam. Tente outra API ou verifique as chaves.')
        }
      }

      setYtMsg(`🤖 Ruud Gullit Jr. escrevendo a notícia com ${APIS_IA.find(a=>a.id===apiIA)?.nome}...`); setYtMsgType('info')
      const raw = await chamarIA(PROMPT_RUUD(contexto, tituloVideo))
      const p = parsear(raw)

      setYtTitulo(p.titulo || tituloVideo)
      setYtResumo(p.resumo)
      setYtConteudo(p.conteudo)

      const aviso = usouPesquisa ? ' (via pesquisa — sem transcrição)' : ' (via transcrição)'
      setYtMsg(`✅ Notícia gerada pelo Ruud Gullit Jr.${aviso}`)
      setYtMsgType('ok')

    } catch(e: any) {
      setYtMsg('❌ ' + e.message)
      setYtMsgType('err')
    }
    setYtLoading(false)
  }

  async function publicarYt() {
    setYtPublicando(true)
    let videoId = ''; try { const u = new URL(ytUrl); videoId = u.searchParams.get('v')||'' } catch {}
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', ytCat).single()
    await supabase.from('posts').insert({
      title: ytTitulo, slug: slugify(ytTitulo), summary: ytResumo||null,
      content: ytConteudo + `\n\n━━━━━━━━━━━━━━━━\n📺 Fonte: YouTube\n🔗 ${ytUrl}\n\n_Reportagem: Ruud Gullit Jr. | eFOOTBALL NEWS_`,
      cover_image: videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null,
      category_id: cat?.id||null, tags:['efootball','youtube'], status: ytStatus,
      source_type:'youtube', source_url:ytUrl, auto_published:false,
      published_at: ytStatus==='published' ? new Date().toISOString() : null
    })
    setYtPublicando(false); setYtPublicado(true)
  }

  // ── MODO PESQUISA ──
  async function pesquisarEGerar() {
    if (!pQuery.trim()) { showToast('⚠️ Digite o tema'); return }
    if (!keyIA.trim()) { showToast('⚠️ Configure a chave de IA'); setConfigOpen(true); return }
    setPLoading(true); setPMsg('🔍 Agente de pesquisa + Ruud Gullit Jr. gerando...'); setPMsgType('info')
    setPTitulo(''); setPResumo(''); setPConteudo(''); setPPublicado(false)
    try {
      // Primeiro: agente pesquisa o tema
      const pesquisaPrompt = `Você é um agente de pesquisa especialista em eFootball da Konami. Pesquise e forneça todas as informações relevantes sobre o seguinte tema:

TEMA: ${pQuery}

Forneça:
- O que é / contexto do tema no eFootball
- Informações atuais e relevantes
- Dados, datas ou detalhes conhecidos
- O que a comunidade está comentando sobre isso

Seja preciso. Separe claramente o que é oficial do que é rumor.`

      setPMsg('🔍 Pesquisando informações sobre o tema...')
      const pesquisa = await chamarIA(pesquisaPrompt)

      // Segundo: Ruud Gullit Jr. escreve a notícia
      setPMsg('🤖 Ruud Gullit Jr. escrevendo a notícia...')
      const raw = await chamarIA(PROMPT_RUUD(
        `RESULTADO DA PESQUISA SOBRE O TEMA:\n${pesquisa}`,
        pQuery
      ))
      const p = parsear(raw)
      setPTitulo(p.titulo || pQuery)
      setPResumo(p.resumo)
      setPConteudo(p.conteudo)
      setPMsg('✅ Notícia gerada pelo Ruud Gullit Jr.!')
      setPMsgType('ok')
    } catch(e: any) { setPMsg('❌ ' + e.message); setPMsgType('err') }
    setPLoading(false)
  }

  async function publicarPesquisa() {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', pCat).single()
    await supabase.from('posts').insert({
      title: pTitulo, slug: slugify(pTitulo), summary: pResumo||null,
      content: pConteudo + `\n\n_Reportagem: Ruud Gullit Jr. | eFOOTBALL NEWS_`,
      category_id: cat?.id||null, tags:['efootball'], status: pStatus,
      source_type:'manual', auto_published:false,
      published_at: pStatus==='published' ? new Date().toISOString() : null
    })
    setPPublicado(true)
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

  const CatBtns = ({ val, set }: { val:string, set:(v:string)=>void }) => (
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

  const StatusBtns = ({ val, set }: { val:'published'|'draft', set:(v:'published'|'draft')=>void }) => (
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

  const Msg = ({ msg, type }: { msg:string, type:'ok'|'err'|'info' }) => msg ? (
    <div style={{ fontSize:12, color: type==='err'?G.red:type==='ok'?G.green:G.blue, marginBottom:10, lineHeight:1.5 }}>{msg}</div>
  ) : null

  const Spinner = () => (
    <span style={{ width:14, height:14, border:'2px solid rgba(0,0,0,.3)', borderTopColor:'rgba(0,0,0,.8)', borderRadius:'50%', display:'inline-block', animation:'spin .7s linear infinite', marginRight:8 }} />
  )

  return (
    <div style={{ minHeight:'100vh', background:G.bg, color:G.text, fontFamily:"'Barlow',sans-serif", paddingBottom:40 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=Barlow:wght@400;500&display=swap'); input:focus,textarea:focus{border-color:${G.gold}!important;outline:none} @keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {toast && <div style={S.toast}>{toast}</div>}

      <header style={{ background:G.surface, borderBottom:`1px solid ${G.border}`, padding:'0 1.25rem', height:54, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <a href="/admin-fskate" style={{ color:G.muted, textDecoration:'none', fontSize:20 }}>←</a>
          <div>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:18, textTransform:'uppercase', letterSpacing:1 }}>
              RADAR <span style={{ color:G.gold }}>IA</span>
            </div>
            <div style={{ fontSize:9, color:G.dim, letterSpacing:'2px', textTransform:'uppercase', fontWeight:700 }}>Ruud Gullit Jr. — Publicações</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => setConfigOpen(!configOpen)}
            style={{ fontSize:10, color:configOpen?G.gold:G.muted, background:configOpen?'rgba(232,184,75,0.08)':G.surface2, border:`1px solid ${configOpen?'rgba(232,184,75,0.25)':G.border}`, borderRadius:6, padding:'5px 10px', cursor:'pointer', fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', fontFamily:'inherit' }}>
            ⚙️ APIs {keyIA ? '✓' : '⚠️'}
          </button>
          <a href="/" target="_blank" style={{ fontSize:10, color:G.dim, textDecoration:'none', fontWeight:700, letterSpacing:'1px', textTransform:'uppercase' }}>Ver site →</a>
        </div>
      </header>

      <div style={{ maxWidth:720, margin:'0 auto', padding:'1.25rem 1rem' }}>

        {/* CONFIG */}
        {configOpen && (
          <div style={S.card}>
            <div style={S.head}>
              <span style={S.secTit}>⚙️ APIs — Chaves salvas automaticamente</span>
              <button onClick={() => setConfigOpen(false)} style={{ background:'none',border:'none',color:G.muted,cursor:'pointer',fontSize:18 }}>✕</button>
            </div>
            <div style={S.body}>
              <div style={{ background:'rgba(232,184,75,0.06)', border:'1px solid rgba(232,184,75,0.2)', borderRadius:8, padding:'10px 12px', marginBottom:14, fontSize:12, color:G.gold }}>
                ℹ️ Todas as IAs se comportam como <strong>Ruud Gullit Jr.</strong> — o mesmo jornalista em qualquer API escolhida.
              </div>

              <label style={S.lbl}>API de Transcrição (opcional — sem ela usa pesquisa)</label>
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
                    {apiTrans===api.id && <div style={{ fontSize:10, color:G.muted, marginTop:5, padding:'4px 8px', background:'rgba(0,0,0,0.2)', borderRadius:5 }}>📋 {api.how}</div>}
                  </button>
                ))}
              </div>
              <input style={{ ...S.inp, fontFamily:'monospace' }} type="password" placeholder={APIS_TRANS.find(a=>a.id===apiTrans)?.ph+' (deixe vazio para usar só pesquisa)'} value={keyTrans} onChange={e=>setKeyTrans(e.target.value)} />

              <div style={{ height:1, background:G.border, margin:'12px 0' }} />

              <label style={S.lbl}>API de IA — Ruud Gullit Jr. vai usar esta ↓</label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:10 }}>
                {APIS_IA.map(api => (
                  <button key={api.id} onClick={() => setApiIA(api.id)}
                    style={{ padding:'9px 12px', borderRadius:8, border:'none', cursor:'pointer', fontFamily:'inherit', textAlign:'left', background:apiIA===api.id?api.cor+'14':G.surface2, outline:apiIA===api.id?`1px solid ${api.cor}44`:`1px solid ${G.border}` }}>
                    <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:13, color:apiIA===api.id?api.cor:G.text }}>{api.nome}</div>
                    <div style={{ fontSize:10, color:G.dim, marginTop:1 }}>{api.desc}</div>
                    <div style={{ display:'flex', justifyContent:'space-between', marginTop:5 }}>
                      <span style={{ fontSize:9, color:G.green, fontWeight:700 }}>{api.gratis}</span>
                      <a href={api.link} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{ fontSize:9, color:G.blue, fontWeight:700, textDecoration:'none' }}>key →</a>
                    </div>
                    {apiIA===api.id && <div style={{ fontSize:10, color:G.muted, marginTop:5, padding:'4px 6px', background:'rgba(0,0,0,0.2)', borderRadius:5 }}>📋 {api.how}</div>}
                  </button>
                ))}
              </div>
              <input style={{ ...S.inp, fontFamily:'monospace' }} type="password" placeholder={APIS_IA.find(a=>a.id===apiIA)?.ph} value={keyIA} onChange={e=>setKeyIA(e.target.value)} />

              <button onClick={salvarChaves} disabled={savingKeys} style={{ ...S.btnGrn, width:'100%', opacity:savingKeys?0.6:1 }}>
                {savingKeys ? '💾 Salvando...' : '💾 Salvar chaves (ficam gravadas)'}
              </button>
            </div>
          </div>
        )}

        {/* SELETOR DE MODO */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:'1rem' }}>
          {([
            { id:'youtube' as Mode,  icon:'▶',  label:'YouTube → Post',   desc:'Transcreve ou pesquisa + Ruud escreve' },
            { id:'pesquisa' as Mode, icon:'🔍', label:'Tema + Pesquisa',  desc:'IA pesquisa o tema + Ruud escreve' },
            { id:'manual' as Mode,   icon:'✏️', label:'Manual',           desc:'Você escreve tudo' },
          ]).map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              style={{ padding:'14px 10px', borderRadius:12, border:'none', cursor:'pointer', fontFamily:'inherit', textAlign:'center', background:mode===m.id?'rgba(232,184,75,0.08)':G.surface, outline:mode===m.id?`1px solid rgba(232,184,75,0.35)`:`1px solid ${G.border}` }}>
              <div style={{ fontSize:20, marginBottom:4 }}>{m.icon}</div>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:12, color:mode===m.id?G.gold:G.text, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:2 }}>{m.label}</div>
              <div style={{ fontSize:10, color:G.dim, lineHeight:1.4 }}>{m.desc}</div>
            </button>
          ))}
        </div>

        {/* YOUTUBE */}
        {mode === 'youtube' && (
          <div style={S.card}>
            <div style={S.head}><span style={S.secTit}>▶ YouTube → Ruud Gullit Jr.</span></div>
            <div style={S.body}>
              <div style={{ background:'rgba(79,126,248,0.06)', border:'1px solid rgba(79,126,248,0.15)', borderRadius:8, padding:'9px 12px', marginBottom:12, fontSize:12, color:G.blue, lineHeight:1.5 }}>
                Se a transcrição falhar ou não tiver chave configurada, o agente de pesquisa busca informações sobre o tema do vídeo e o Ruud escreve com base nisso — sem inventar.
              </div>
              <label style={S.lbl}>Link do YouTube</label>
              <input style={S.inp} placeholder="https://www.youtube.com/watch?v=..." value={ytUrl} onChange={e=>setYtUrl(e.target.value)} onKeyDown={e=>e.key==='Enter'&&gerarDoYoutube()} />
              <label style={S.lbl}>Categoria</label>
              <CatBtns val={ytCat} set={setYtCat} />
              <StatusBtns val={ytStatus} set={setYtStatus} />
              <button onClick={gerarDoYoutube} disabled={ytLoading} style={{ ...S.btnGrn, width:'100%', opacity:ytLoading?0.6:1, marginBottom:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
                {ytLoading ? <><Spinner/>Gerando...</> : '▶ Gerar com Ruud Gullit Jr.'}
              </button>
              <Msg msg={ytMsg} type={ytMsgType} />

              {ytConteudo && !ytPublicado && (
                <>
                  <div style={{ height:1, background:G.border, margin:'4px 0 12px' }} />
                  <label style={S.lbl}>Título</label>
                  <input style={S.inp} value={ytTitulo} onChange={e=>setYtTitulo(e.target.value)} />
                  <label style={S.lbl}>Resumo</label>
                  <input style={S.inp} value={ytResumo} onChange={e=>setYtResumo(e.target.value)} />
                  <label style={S.lbl}>Conteúdo</label>
                  <textarea style={{ ...S.inp, minHeight:200, resize:'vertical', fontFamily:'monospace', fontSize:13, lineHeight:1.6 }} value={ytConteudo} onChange={e=>setYtConteudo(e.target.value)} />
                  <button onClick={publicarYt} disabled={ytPublicando} style={{ ...S.btnGld, width:'100%', opacity:ytPublicando?0.6:1 }}>
                    {ytPublicando ? 'Publicando...' : '✅ Publicar no site'}
                  </button>
                </>
              )}
              {ytPublicado && <div style={{ textAlign:'center', padding:'1rem', color:G.green, fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:16, textTransform:'uppercase' }}>🎉 Publicado!</div>}
            </div>
          </div>
        )}

        {/* PESQUISA */}
        {mode === 'pesquisa' && (
          <div style={S.card}>
            <div style={S.head}><span style={S.secTit}>🔍 Pesquisa + Ruud Gullit Jr.</span></div>
            <div style={S.body}>
              <label style={S.lbl}>Tema / Assunto</label>
              <textarea style={{ ...S.inp, minHeight:80, resize:'vertical' }} placeholder={'Ex: Patch 5.4 do eFootball com novidades\nEx: Melhores épicos do momento no meta\nEx: Copa do Mundo eFootball 2026'} value={pQuery} onChange={e=>setPQuery(e.target.value)} />
              <label style={S.lbl}>Categoria</label>
              <CatBtns val={pCat} set={setPCat} />
              <StatusBtns val={pStatus} set={setPStatus} />
              <button onClick={pesquisarEGerar} disabled={pLoading} style={{ ...S.btnGrn, width:'100%', opacity:pLoading?0.6:1, marginBottom:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
                {pLoading ? <><Spinner/>Pesquisando e gerando...</> : '🔍 Pesquisar + Ruud Gullit Jr. escreve'}
              </button>
              <Msg msg={pMsg} type={pMsgType} />

              {pConteudo && !pPublicado && (
                <>
                  <div style={{ height:1, background:G.border, margin:'4px 0 12px' }} />
                  <label style={S.lbl}>Título</label>
                  <input style={S.inp} value={pTitulo} onChange={e=>setPTitulo(e.target.value)} />
                  <label style={S.lbl}>Resumo</label>
                  <input style={S.inp} value={pResumo} onChange={e=>setPResumo(e.target.value)} />
                  <label style={S.lbl}>Conteúdo</label>
                  <textarea style={{ ...S.inp, minHeight:200, resize:'vertical', fontFamily:'monospace', fontSize:13, lineHeight:1.6 }} value={pConteudo} onChange={e=>setPConteudo(e.target.value)} />
                  <button onClick={publicarPesquisa} style={{ ...S.btnGld, width:'100%' }}>✅ Publicar no site</button>
                </>
              )}
              {pPublicado && <div style={{ textAlign:'center', padding:'1rem', color:G.green, fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:16, textTransform:'uppercase' }}>🎉 Publicado!</div>}
            </div>
          </div>
        )}

        {/* MANUAL */}
        {mode === 'manual' && (
          <div style={S.card}>
            <div style={S.head}><span style={S.secTit}>✏️ Post Manual</span></div>
            <div style={S.body}>
              <label style={S.lbl}>Título *</label>
              <input style={S.inp} placeholder="Título da notícia..." value={mTitulo} onChange={e=>setMTitulo(e.target.value)} />
              <label style={S.lbl}>Categoria</label>
              <CatBtns val={mCat} set={setMCat} />
              <label style={S.lbl}>Resumo</label>
              <textarea style={{ ...S.inp, minHeight:60, resize:'vertical' }} placeholder="Resumo curto..." value={mResumo} onChange={e=>setMResumo(e.target.value)} />
              <label style={S.lbl}>Conteúdo</label>
              <textarea style={{ ...S.inp, minHeight:200, resize:'vertical', fontFamily:'monospace', fontSize:13, lineHeight:1.6 }} placeholder={'Texto completo...\n\nUse ## para título de seção'} value={mConteudo} onChange={e=>setMConteudo(e.target.value)} />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div><label style={S.lbl}>URL da Imagem</label><input style={S.inp} placeholder="https://..." value={mImagem} onChange={e=>setMImagem(e.target.value)} /></div>
                <div><label style={S.lbl}>Fonte</label><input style={S.inp} placeholder="https://..." value={mFonte} onChange={e=>setMFonte(e.target.value)} /></div>
              </div>
              {mImagem && <div style={{ borderRadius:8, overflow:'hidden', border:`1px solid ${G.border}`, marginBottom:12 }}><img src={mImagem} alt="preview" style={{ width:'100%', height:'auto', display:'block', maxHeight:200, objectFit:'contain', background:G.surface2 }} /></div>}
              <StatusBtns val={mStatus} set={setMStatus} />
              {mPublicado
                ? <div style={{ textAlign:'center', padding:'1rem', color:G.green, fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:16, textTransform:'uppercase' }}>🎉 Publicado!</div>
                : <button onClick={publicarManual} disabled={mLoading} style={{ ...S.btnGld, width:'100%', opacity:mLoading?0.6:1 }}>
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
