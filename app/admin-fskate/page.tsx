'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

// ── Paleta idêntica ao site ──
const G = {
  bg: '#09090b', surface: '#111115', surface2: '#18181c',
  border: '#1d1d20', border2: '#2d2d35',
  text: '#e4e4e7', muted: '#71717a', dim: '#52525b',
  gold: '#e8b84b', green: '#22d3a0', red: '#f87171', blue: '#4f7ef8',
}

const CATS = [
  { slug: 'noticias',           name: 'Notícias',     color: G.muted   },
  { slug: 'eventos',            name: 'Eventos',      color: '#10b981' },
  { slug: 'atualizacoes',       name: 'Atualizações', color: G.blue    },
  { slug: 'campanhas',          name: 'Campanhas',    color: G.gold    },
  { slug: 'guias',              name: 'Guias',        color: '#8b5cf6' },
  { slug: 'vazamentos-rumores', name: 'Vazamentos',   color: G.red     },
  { slug: 'top-rank',           name: 'Top Rank',     color: '#f97316' },
]

type Tab = 'home' | 'post' | 'posts' | 'torneios' | 'site' | 'coop'

function slugify(t: string) {
  return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-').substring(0,80)+'-'+Date.now()
}

const S: any = {
  page:   { minHeight: '100vh', background: G.bg, color: G.text, fontFamily: "'Barlow',sans-serif", paddingBottom: 72 },
  header: { background: G.surface, borderBottom: `1px solid ${G.border}`, padding: '0 1.25rem', height: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky' as const, top: 0, zIndex: 50 },
  main:   { maxWidth: 860, margin: '0 auto', padding: '1.25rem 1rem' },
  card:   { background: G.surface, border: `1px solid ${G.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: '1rem' },
  cHead:  { padding: '11px 16px', borderBottom: `1px solid ${G.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cBody:  { padding: '16px' },
  inp:    { width: '100%', background: G.surface2, border: `1px solid ${G.border}`, borderRadius: 8, padding: '10px 12px', color: G.text, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' as const, marginBottom: 10 },
  lbl:    { fontSize: 10, color: G.dim, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase' as const, marginBottom: 5, display: 'block' },
  btnGrn: { background: G.green, color: '#041a10', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 12, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' as const, cursor: 'pointer', fontFamily: "'Barlow Condensed',sans-serif" },
  btnOut: { background: G.surface2, color: G.text, border: `1px solid ${G.border}`, borderRadius: 8, padding: '10px 18px', fontSize: 12, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' as const, cursor: 'pointer', fontFamily: "'Barlow Condensed',sans-serif" },
  btnSm:  (c: string, bg: string) => ({ background: bg, color: c, border: `1px solid ${c}28`, borderRadius: 6, padding: '4px 9px', fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' as const, cursor: 'pointer', fontFamily: 'inherit' }),
  nav:    { position: 'fixed' as const, bottom: 0, left: 0, right: 0, background: G.surface, borderTop: `1px solid ${G.border}`, display: 'flex', zIndex: 100 },
  navBtn: (a: boolean) => ({ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 2, background: 'none', border: 'none', cursor: 'pointer', padding: '8px 4px', color: a ? G.gold : G.dim, fontFamily: 'inherit', borderTop: `2px solid ${a ? G.gold : 'transparent'}`, transition: 'color 0.15s' }),
  toast:  { position: 'fixed' as const, top: 66, left: '50%', transform: 'translateX(-50%)', background: G.surface, border: `1px solid ${G.green}`, borderRadius: 8, padding: '9px 20px', fontSize: 13, color: G.green, zIndex: 300, whiteSpace: 'nowrap' as const },
  title:  { fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 12, letterSpacing: '2px', textTransform: 'uppercase' as const, color: G.muted },
}

// Seções visíveis no site
type SiteSection = { key: string; label: string; desc: string }
const SITE_SECTIONS: SiteSection[] = [
  { key: 'show_torneios',       label: '🏆 Card Torneios',     desc: 'Banner "Liga eFootball" na home' },
  { key: 'show_coop',           label: '🎮 Card Co-op',         desc: 'Banner "Co-op 3x3" na home' },
  { key: 'show_criar_torneio',  label: '➕ Criar Torneio',      desc: 'Link criar torneio na home' },
  { key: 'show_livepix_banner', label: '💰 Banner LivePix',     desc: 'Faixa "Doe no LivePix" no topo' },
]

export default function Admin() {
  const [tab, setTab] = useState<Tab>('home')
  const [stats, setStats] = useState({ pub: 0, draft: 0, hoje: 0, torneios: 0 })
  const [posts, setPosts] = useState<any[]>([])
  const [torneios, setTorneios] = useState<any[]>([])
  const [featuredId, setFeaturedId] = useState<string | null>(null)
  const [siteVisibility, setSiteVisibility] = useState<Record<string, boolean>>({
    show_torneios: true, show_coop: true, show_criar_torneio: true, show_livepix_banner: true,
  })
  const [toast, setToast] = useState('')
  const [loading, setLoading] = useState(false)
  const [editPost, setEditPost] = useState<any>(null)
  const [editTorneio, setEditTorneio] = useState<any>(null)
  const [coopFila, setCoopFila] = useState<any[]>([])

  // Post form
  const [titulo, setTitulo] = useState('')
  const [resumo, setResumo] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [imagem, setImagem] = useState('')
  const [fonte, setFonte] = useState('')
  const [categoria, setCategoria] = useState('noticias')
  const [postStatus, setPostStatus] = useState<'published'|'draft'>('published')

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2800) }

  useEffect(() => { loadAll(); loadVisibility() }, [])

  async function loadAll() {
    const [{ count: pub }, { count: draft }, { count: hoje }, { count: torn }] = await Promise.all([
      supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
      supabase.from('posts').select('*', { count: 'exact', head: true }).gte('published_at', new Date().toISOString().split('T')[0]),
      supabase.from('tournaments').select('*', { count: 'exact', head: true }),
    ])
    setStats({ pub: pub||0, draft: draft||0, hoje: hoje||0, torneios: torn||0 })
    const { data } = await supabase.from('posts').select('id,title,status,auto_published,cover_image,published_at,categories(name,color),featured').order('published_at', { ascending: false }).limit(40)
    setPosts(data||[])
    setFeaturedId((data||[]).find((p:any) => p.featured)?.id || null)
  }

  async function loadVisibility() {
    try {
      const { data } = await supabase.from('site_settings').select('key,value')
      if (data && data.length > 0) {
        const map: Record<string,boolean> = {}
        data.forEach((r:any) => { map[r.key] = r.value !== 'false' && r.value !== false })
        setSiteVisibility(prev => ({ ...prev, ...map }))
      }
    } catch { /* tabela pode não existir ainda */ }
  }

  async function toggleVisibility(key: string) {
    const novoVal = !siteVisibility[key]
    setSiteVisibility(prev => ({ ...prev, [key]: novoVal }))
    try {
      await supabase.from('site_settings').upsert({ key, value: String(novoVal) }, { onConflict: 'key' })
      showToast(novoVal ? '👁 Seção visível' : '🙈 Seção ocultada')
    } catch { showToast('⚠️ Salvo localmente — crie a tabela site_settings') }
  }

  async function loadCoop() {
    const { data } = await supabase.from('coop_queue').select('*').eq('status','waiting').order('created_at',{ascending:true})
    setCoopFila(data||[])
  }

  async function loadTorneios() {
    const { data } = await supabase.from('tournaments').select('id,name,status,model,entry_fee,prize,is_user_created,creation_payment_status,pix_key').order('created_at', { ascending: false })
    setTorneios(data||[])
  }

  async function publicarPost() {
    if (!titulo.trim()) { showToast('⚠️ Título obrigatório'); return }
    setLoading(true)
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', categoria).single()
    const { error } = await supabase.from('posts').insert({
      title: titulo, slug: slugify(titulo), summary: resumo||null, content: conteudo||null,
      cover_image: imagem||null, source_url: fonte||null, category_id: cat?.id||null,
      tags: ['efootball'], status: postStatus, source_type: 'manual', auto_published: false,
      published_at: postStatus === 'published' ? new Date().toISOString() : null
    })
    setLoading(false)
    if (error) { showToast('❌ '+error.message); return }
    showToast(postStatus === 'published' ? '✅ Publicado!' : '📋 Rascunho salvo!')
    setTitulo(''); setResumo(''); setConteudo(''); setImagem(''); setFonte('')
    loadAll(); setTab('home')
  }

  async function toggleFeatured(id: string) {
    await supabase.from('posts').update({ featured: false }).neq('id','00000000-0000-0000-0000-000000000000')
    if (featuredId !== id) {
      await supabase.from('posts').update({ featured: true }).eq('id', id)
      setFeaturedId(id); showToast('⭐ Destaque definido!')
    } else { setFeaturedId(null); showToast('✓ Destaque removido') }
    loadAll()
  }

  async function toggleHide(post: any) {
    const s = post.status === 'hidden' ? 'published' : 'hidden'
    await supabase.from('posts').update({ status: s }).eq('id', post.id)
    showToast(s === 'hidden' ? '🙈 Ocultado' : '👁 Visível'); loadAll()
  }

  async function publicarDraft(id: string) {
    await supabase.from('posts').update({ status: 'published', published_at: new Date().toISOString() }).eq('id', id)
    showToast('✅ Publicado!'); loadAll()
  }

  async function apagarPost(id: string) {
    if (!confirm('Apagar este post?')) return
    await supabase.from('posts').delete().eq('id', id)
    showToast('🗑️ Apagado'); loadAll()
  }

  async function salvarEdicaoPost() {
    if (!editPost?.title?.trim()) { showToast('⚠️ Título obrigatório'); return }
    const { error } = await supabase.from('posts').update({
      title: editPost.title, summary: editPost.summary||null,
      content: editPost.content||null, cover_image: editPost.cover_image||null, source_url: editPost.source_url||null,
    }).eq('id', editPost.id)
    if (error) { showToast('❌ '+error.message); return }
    showToast('✅ Salvo!'); setEditPost(null); loadAll()
  }

  async function apagarTorneio(id: string) {
    if (!confirm('Apagar torneio?')) return
    await supabase.from('tournaments').delete().eq('id', id)
    showToast('🗑️ Apagado'); loadTorneios()
  }

  async function salvarTorneio() {
    const { error } = await supabase.from('tournaments').update({
      name: editTorneio.name, status: editTorneio.status,
      entry_fee: parseFloat(editTorneio.entry_fee)||0, prize: parseFloat(editTorneio.prize)||0,
      description: editTorneio.description||null, rules: editTorneio.rules||null,
    }).eq('id', editTorneio.id)
    if (error) { showToast('❌ '+error.message); return }
    showToast('✅ Salvo!'); setEditTorneio(null); loadTorneios()
  }

  async function verificarLivePix(t: any) {
    showToast('🔄 Verificando...')
    try {
      const res = await fetch(`/api/livepix/verificar?reference=${t.id}`)
      const data = await res.json()
      if (data.status === 'paid') {
        await supabase.from('tournaments').update({ status: 'open', creation_payment_status: 'paid' }).eq('id', t.id)
        showToast('✅ Pago! Torneio ativado.'); loadTorneios()
      } else { showToast(`⏳ Status: ${data.status||'pendente'}`) }
    } catch { showToast('❌ Erro ao verificar') }
  }

  const TABS = [
    { id: 'home' as Tab,     icon: '⊞', label: 'Início'   },
    { id: 'post' as Tab,     icon: '✏️', label: 'Post'     },
    { id: 'posts' as Tab,    icon: '≡',  label: 'Posts'    },
    { id: 'torneios' as Tab, icon: '🏆', label: 'Torneios' },
    { id: 'site' as Tab,     icon: '👁', label: 'Site'     },
    { id: 'coop' as Tab,     icon: '🎮', label: 'Co-op'    },
  ]

  // ── Tela edição post ──
  if (editPost) return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=Barlow:wght@400;500&display=swap');`}</style>
      <header style={S.header}>
        <button onClick={() => setEditPost(null)} style={{ background:'none',border:'none',color:G.muted,cursor:'pointer',fontSize:20,padding:'0 4px' }}>←</button>
        <span style={{ ...S.title, color: G.text }}>Editar Post</span>
        <button onClick={salvarEdicaoPost} style={S.btnGrn}>Salvar</button>
      </header>
      {toast && <div style={S.toast}>{toast}</div>}
      <div style={S.main}>
        <div style={S.card}>
          <div style={S.cBody}>
            <label style={S.lbl}>Título</label>
            <input style={S.inp} value={editPost.title} onChange={e => setEditPost({...editPost,title:e.target.value})} />
            <label style={S.lbl}>Resumo</label>
            <textarea style={{...S.inp,minHeight:70,resize:'vertical' as const}} value={editPost.summary||''} onChange={e => setEditPost({...editPost,summary:e.target.value})} />
            <label style={S.lbl}>Conteúdo</label>
            <textarea style={{...S.inp,minHeight:200,resize:'vertical' as const,fontFamily:'monospace',fontSize:13,lineHeight:1.6}} value={editPost.content||''} onChange={e => setEditPost({...editPost,content:e.target.value})} />
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <div>
                <label style={S.lbl}>URL da Imagem</label>
                <input style={S.inp} placeholder="https://..." value={editPost.cover_image||''} onChange={e => setEditPost({...editPost,cover_image:e.target.value})} />
              </div>
              <div>
                <label style={S.lbl}>Fonte</label>
                <input style={S.inp} placeholder="https://..." value={editPost.source_url||''} onChange={e => setEditPost({...editPost,source_url:e.target.value})} />
              </div>
            </div>
            {editPost.cover_image && (
              <div style={{borderRadius:8,overflow:'hidden',border:`1px solid ${G.border}`,marginTop:4}}>
                <img src={editPost.cover_image} alt="preview" style={{width:'100%',height:'auto',display:'block',maxHeight:220,objectFit:'contain',background:G.surface2}} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=Barlow:wght@400;500&display=swap'); input:focus,textarea:focus{border-color:${G.gold}!important;outline:none}`}</style>

      {/* Header */}
      <header style={S.header}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <Image src="/logo.png" alt="logo" width={30} height={30} style={{borderRadius:7}} />
          <div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:16,color:G.text,letterSpacing:1,textTransform:'uppercase',lineHeight:1}}>
              <span style={{color:G.gold}}>e</span>FOOTBALL <span style={{color:G.muted,fontSize:12}}>ADMIN</span>
            </div>
            <div style={{fontSize:9,color:G.dim,letterSpacing:'2px',fontWeight:700,textTransform:'uppercase'}}>FSKATE · PAINEL</div>
          </div>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <a href="/admin-fskate/youtube" style={{fontSize:10,color:G.muted,textDecoration:'none',fontWeight:700,letterSpacing:'1px',textTransform:'uppercase',background:G.surface2,border:`1px solid ${G.border}`,padding:'5px 10px',borderRadius:6}}>▶ YouTube</a>
          <a href="/" target="_blank" style={{fontSize:10,color:G.dim,textDecoration:'none',fontWeight:700,letterSpacing:'1px',textTransform:'uppercase'}}>Ver site →</a>
        </div>
      </header>

      {toast && <div style={S.toast}>{toast}</div>}

      <div style={S.main}>

        {/* ── HOME ── */}
        {tab === 'home' && (
          <>
            {/* Stats */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:'1rem'}}>
              {[
                {n:stats.pub,   l:'Publicados',c:G.green},
                {n:stats.draft, l:'Rascunhos', c:G.gold },
                {n:stats.hoje,  l:'Hoje',       c:G.text },
                {n:stats.torneios,l:'Torneios', c:G.muted},
              ].map(s => (
                <div key={s.l} style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:10,padding:'12px',textAlign:'center'}}>
                  <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:28,lineHeight:1,color:s.c}}>{s.n}</div>
                  <div style={{fontSize:9,color:G.dim,marginTop:3,fontWeight:700,letterSpacing:'1px',textTransform:'uppercase'}}>{s.l}</div>
                </div>
              ))}
            </div>

            {/* Destaque */}
            <div style={S.card}>
              <div style={S.cHead}>
                <span style={S.title}>⭐ Post em Destaque</span>
                <span style={{fontSize:10,color:G.dim}}>hero da home</span>
              </div>
              <div style={{padding:'10px'}}>
                {posts.filter(p=>p.status==='published').slice(0,8).map(p => (
                  <div key={p.id} onClick={() => toggleFeatured(p.id)}
                    style={{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',borderRadius:8,cursor:'pointer',marginBottom:4,
                      background:featuredId===p.id?'rgba(232,184,75,0.06)':'transparent',
                      border:`1px solid ${featuredId===p.id?'rgba(232,184,75,0.25)':G.border}`,transition:'all .15s'}}>
                    {p.cover_image && <div style={{width:36,height:36,borderRadius:6,background:`url(${p.cover_image}) center/cover`,flexShrink:0}} />}
                    <div style={{flex:1,minWidth:0,fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:700,color:G.text,textTransform:'uppercase',lineHeight:1.2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.title}</div>
                    <span style={{fontSize:15,flexShrink:0}}>{featuredId===p.id?'⭐':'☆'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ações rápidas */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              <button onClick={() => setTab('post')} style={{...S.btnGrn,padding:'13px',fontSize:13,borderRadius:10,width:'100%'}}>✏️ Novo Post</button>
              <button onClick={() => setTab('posts')} style={{...S.btnOut,padding:'13px',fontSize:13,borderRadius:10,width:'100%'}}>≡ Ver Posts</button>
              <a href="/admin-fskate/youtube" style={{...S.btnOut,padding:'13px',fontSize:13,borderRadius:10,textDecoration:'none',display:'flex',alignItems:'center',justifyContent:'center'}}>▶ YouTube → Post</a>
              <button onClick={() => {setTab('torneios');loadTorneios()}} style={{...S.btnOut,padding:'13px',fontSize:13,borderRadius:10}}>🏆 Torneios</button>
            </div>
          </>
        )}

        {/* ── NOVO POST ── */}
        {tab === 'post' && (
          <div style={S.card}>
            <div style={S.cHead}>
              <span style={S.title}>✏️ Novo Post</span>
              <button onClick={() => setTab('home')} style={{background:'none',border:'none',color:G.muted,cursor:'pointer',fontSize:20}}>←</button>
            </div>
            <div style={S.cBody}>
              <label style={S.lbl}>Título *</label>
              <input style={S.inp} placeholder="Título da notícia..." value={titulo} onChange={e => setTitulo(e.target.value)} />

              <label style={S.lbl}>Categoria</label>
              <div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:12}}>
                {CATS.map(c => (
                  <button key={c.slug} onClick={() => setCategoria(c.slug)}
                    style={{padding:'5px 10px',borderRadius:6,border:'none',cursor:'pointer',fontFamily:'inherit',fontSize:10,fontWeight:700,letterSpacing:'0.8px',textTransform:'uppercase',
                      background:categoria===c.slug?c.color+'22':G.surface2,color:categoria===c.slug?c.color:G.muted,
                      outline:categoria===c.slug?`1px solid ${c.color}55`:`1px solid ${G.border}`}}>
                    {c.name}
                  </button>
                ))}
              </div>

              <label style={S.lbl}>Resumo</label>
              <textarea style={{...S.inp,minHeight:60,resize:'vertical' as const}} placeholder="Resumo curto para os cards..." value={resumo} onChange={e => setResumo(e.target.value)} />

              <label style={S.lbl}>Conteúdo</label>
              <textarea style={{...S.inp,minHeight:160,resize:'vertical' as const,fontFamily:'monospace',fontSize:13,lineHeight:1.6}}
                placeholder={'Texto completo...\n\nUse ## para título de seção\nUse # para subtítulo'} value={conteudo} onChange={e => setConteudo(e.target.value)} />

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                <div><label style={S.lbl}>URL da Imagem</label><input style={S.inp} placeholder="https://..." value={imagem} onChange={e => setImagem(e.target.value)} /></div>
                <div><label style={S.lbl}>Fonte</label><input style={S.inp} placeholder="https://..." value={fonte} onChange={e => setFonte(e.target.value)} /></div>
              </div>

              {imagem && <div style={{borderRadius:8,overflow:'hidden',border:`1px solid ${G.border}`,marginBottom:12}}><img src={imagem} alt="preview" style={{width:'100%',height:'auto',display:'block',background:G.surface2}} /></div>}

              <div style={{display:'flex',gap:8,marginBottom:14}}>
                {(['published','draft'] as const).map(s => (
                  <button key={s} onClick={() => setPostStatus(s)}
                    style={{flex:1,padding:'10px',borderRadius:8,border:'none',cursor:'pointer',fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:12,letterSpacing:'1px',textTransform:'uppercase',
                      background:postStatus===s?(s==='published'?G.green:G.gold):G.surface2,
                      color:postStatus===s?(s==='published'?'#041a10':'#1a1000'):G.muted}}>
                    {s==='published'?'✅ Publicar':'◻ Rascunho'}
                  </button>
                ))}
              </div>
              <button style={{...S.btnGrn,width:'100%',padding:'12px',fontSize:13,opacity:loading?0.6:1}} onClick={publicarPost} disabled={loading}>
                {loading?'Publicando...':(postStatus==='published'?'▶ Publicar agora':'◻ Salvar rascunho')}
              </button>
            </div>
          </div>
        )}

        {/* ── POSTS ── */}
        {tab === 'posts' && !editPost && (
          <>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:'1rem'}}>
              <button onClick={() => setTab('home')} style={{background:'none',border:'none',color:G.muted,cursor:'pointer',fontSize:20}}>←</button>
              <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:20,color:G.text,textTransform:'uppercase',letterSpacing:1}}>Posts ({posts.length})</span>
            </div>
            {posts.map(p => (
              <div key={p.id} style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:10,padding:'9px 12px',marginBottom:6,display:'flex',alignItems:'center',gap:8}}>
                <div style={{width:7,height:7,borderRadius:'50%',flexShrink:0,background:p.status==='published'?G.green:p.status==='hidden'?G.gold:G.dim}} />
                {p.cover_image && <div style={{width:34,height:34,borderRadius:6,background:`url(${p.cover_image}) center/cover`,flexShrink:0}} />}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:700,color:G.text,textTransform:'uppercase',lineHeight:1.2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.title}</div>
                  <div style={{fontSize:10,color:G.dim,marginTop:1}}>
                    {p.status==='published'?'publicado':p.status==='draft'?'rascunho':'oculto'}
                    {p.auto_published&&<span style={{color:G.green,marginLeft:6}}>AUTO</span>}
                    {featuredId===p.id&&<span style={{color:G.gold,marginLeft:6}}>⭐</span>}
                  </div>
                </div>
                <div style={{display:'flex',gap:4,flexShrink:0}}>
                  <button onClick={() => toggleFeatured(p.id)} title="Destacar" style={{...S.btnSm(G.gold,'rgba(232,184,75,0.08)'),padding:'4px 8px',fontSize:13}}>{featuredId===p.id?'⭐':'☆'}</button>
                  <button onClick={() => setEditPost(p)} style={S.btnSm(G.text,'rgba(255,255,255,0.05)')}>Editar</button>
                  {p.status==='draft'&&<button onClick={() => publicarDraft(p.id)} style={S.btnSm(G.green,'rgba(34,211,160,0.08)')}>Pub.</button>}
                  <button onClick={() => toggleHide(p)} style={S.btnSm(p.status==='hidden'?G.green:G.gold,'rgba(255,255,255,0.04)')}>{p.status==='hidden'?'Mostrar':'Ocultar'}</button>
                  <button onClick={() => apagarPost(p.id)} style={S.btnSm(G.red,'rgba(248,113,113,0.06)')}>✕</button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ── TORNEIOS ── */}
        {tab === 'torneios' && !editTorneio && (
          <>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:'1rem'}}>
              <button onClick={() => setTab('home')} style={{background:'none',border:'none',color:G.muted,cursor:'pointer',fontSize:20}}>←</button>
              <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:20,color:G.text,textTransform:'uppercase',letterSpacing:1}}>Torneios</span>
            </div>
            {torneios.map(t => {
              const pend = t.status==='draft'||t.creation_payment_status==='pending'
              return (
                <div key={t.id} style={{background:G.surface,border:`1px solid ${pend?'rgba(248,113,113,0.25)':G.border}`,borderRadius:10,padding:'12px 14px',marginBottom:8}}>
                  <div style={{display:'flex',alignItems:'flex-start',gap:10}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,fontWeight:900,color:G.text,textTransform:'uppercase',marginBottom:4}}>{t.name}</div>
                      <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
                        <span style={{fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:4,letterSpacing:'0.8px',textTransform:'uppercase',
                          background:t.status==='open'?'rgba(34,211,160,0.1)':'rgba(82,82,91,0.15)',
                          color:t.status==='open'?G.green:G.muted}}>
                          {t.status==='open'?'Aberto':t.status==='draft'?'Aguard. pgto':t.status}
                        </span>
                        <span style={{fontSize:11,color:G.gold,fontWeight:700}}>R${Number(t.entry_fee).toFixed(2)}</span>
                        <span style={{fontSize:11,color:G.green,fontWeight:700}}>🎁 R${Number(t.prize).toFixed(2)}</span>
                        {t.is_user_created&&<span style={{fontSize:9,color:G.muted,fontWeight:700,letterSpacing:'1px',textTransform:'uppercase'}}>USER</span>}
                      </div>
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:5,alignItems:'flex-end',flexShrink:0}}>
                      <div style={{display:'flex',gap:4}}>
                        <button onClick={() => setEditTorneio(t)} style={S.btnSm(G.text,'rgba(255,255,255,0.05)')}>Editar</button>
                        <button onClick={() => apagarTorneio(t.id)} style={S.btnSm(G.red,'rgba(248,113,113,0.06)')}>✕</button>
                      </div>
                      {pend&&<button onClick={() => verificarLivePix(t)} style={{...S.btnSm(G.green,'rgba(34,211,160,0.08)'),fontSize:10}}>🔄 Verificar LivePix</button>}
                    </div>
                  </div>
                </div>
              )
            })}
            {torneios.length===0&&<div style={{textAlign:'center',padding:'2rem',color:G.dim}}><p style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,textTransform:'uppercase'}}>Nenhum torneio ainda</p></div>}
          </>
        )}

        {/* ── EDITAR TORNEIO ── */}
        {tab === 'torneios' && editTorneio && (
          <div style={S.card}>
            <div style={S.cHead}>
              <span style={S.title}>✏️ Editar Torneio</span>
              <button onClick={() => setEditTorneio(null)} style={{background:'none',border:'none',color:G.muted,cursor:'pointer',fontSize:20}}>←</button>
            </div>
            <div style={S.cBody}>
              <label style={S.lbl}>Nome</label>
              <input style={S.inp} value={editTorneio.name} onChange={e => setEditTorneio({...editTorneio,name:e.target.value})} />
              <label style={S.lbl}>Status</label>
              <div style={{display:'flex',gap:6,marginBottom:12,flexWrap:'wrap'}}>
                {['open','in_progress','finished','draft','cancelled'].map(s => (
                  <button key={s} onClick={() => setEditTorneio({...editTorneio,status:s})}
                    style={{padding:'6px 12px',borderRadius:6,border:'none',cursor:'pointer',fontFamily:'inherit',fontSize:10,fontWeight:700,letterSpacing:'0.8px',textTransform:'uppercase',
                      background:editTorneio.status===s?G.green+'22':G.surface2,color:editTorneio.status===s?G.green:G.muted,
                      outline:editTorneio.status===s?`1px solid ${G.green}55`:`1px solid ${G.border}`}}>
                    {s}
                  </button>
                ))}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                <div><label style={S.lbl}>Inscrição R$</label><input style={S.inp} type="number" value={editTorneio.entry_fee} onChange={e => setEditTorneio({...editTorneio,entry_fee:e.target.value})} /></div>
                <div><label style={S.lbl}>Prêmio R$</label><input style={S.inp} type="number" value={editTorneio.prize} onChange={e => setEditTorneio({...editTorneio,prize:e.target.value})} /></div>
              </div>
              <label style={S.lbl}>Descrição</label>
              <textarea style={{...S.inp,minHeight:60,resize:'vertical' as const}} value={editTorneio.description||''} onChange={e => setEditTorneio({...editTorneio,description:e.target.value})} />
              <label style={S.lbl}>Regras</label>
              <textarea style={{...S.inp,minHeight:60,resize:'vertical' as const}} value={editTorneio.rules||''} onChange={e => setEditTorneio({...editTorneio,rules:e.target.value})} />
              <button style={{...S.btnGrn,width:'100%',padding:'12px',fontSize:13}} onClick={salvarTorneio}>💾 Salvar</button>
            </div>
          </div>
        )}

        {/* ── VISIBILIDADE DO SITE ── */}
        {tab === 'site' && (
          <>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:'1rem'}}>
              <button onClick={() => setTab('home')} style={{background:'none',border:'none',color:G.muted,cursor:'pointer',fontSize:20}}>←</button>
              <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:20,color:G.text,textTransform:'uppercase',letterSpacing:1}}>Visibilidade do Site</span>
            </div>
            <div style={S.card}>
              <div style={S.cHead}><span style={S.title}>👁 Ocultar / Mostrar Seções</span></div>
              <div style={S.cBody}>
                <p style={{fontSize:12,color:G.dim,marginBottom:14,lineHeight:1.6}}>
                  Controle o que aparece na página inicial do site.
                </p>
                {SITE_SECTIONS.map(sec => {
                  const vis = siteVisibility[sec.key] !== false
                  return (
                    <div key={sec.key} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 14px',background:G.surface2,borderRadius:10,marginBottom:8,border:`1px solid ${G.border}`}}>
                      <div>
                        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:700,color:G.text,textTransform:'uppercase'}}>{sec.label}</div>
                        <div style={{fontSize:11,color:G.dim,marginTop:2}}>{sec.desc}</div>
                      </div>
                      <button onClick={() => toggleVisibility(sec.key)}
                        style={{background:vis?'rgba(34,211,160,0.1)':'rgba(248,113,113,0.08)',color:vis?G.green:G.red,border:`1px solid ${vis?'rgba(34,211,160,0.3)':'rgba(248,113,113,0.2)'}`,borderRadius:8,padding:'7px 14px',fontSize:11,fontWeight:700,letterSpacing:'1px',textTransform:'uppercase',cursor:'pointer',fontFamily:"'Barlow Condensed',sans-serif",minWidth:80}}>
                        {vis?'👁 Visível':'🙈 Oculto'}
                      </button>
                    </div>
                  )
                })}
                <div style={{marginTop:12,padding:'10px 14px',background:'rgba(232,184,75,0.06)',border:'1px solid rgba(232,184,75,0.2)',borderRadius:8,fontSize:12,color:G.gold,lineHeight:1.6}}>
                  ⚠️ Para funcionar, crie a tabela <strong>site_settings</strong> no Supabase com colunas <code>key</code> (text, primary key) e <code>value</code> (text).
                </div>
              </div>
            </div>
          </>
        )}


        {/* ── CO-OP ── */}
        {tab === 'coop' && (
          <>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1rem',flexWrap:'wrap',gap:8}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <button onClick={() => setTab('home')} style={{background:'none',border:'none',color:G.muted,cursor:'pointer',fontSize:20}}>←</button>
                <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:20,color:G.text,textTransform:'uppercase',letterSpacing:1}}>Co-op 3x3</span>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={loadCoop} style={{...S.btnSm(G.green,'rgba(34,211,160,0.08)'),padding:'7px 12px',fontSize:11}}>🔄 Atualizar</button>
                <a href="/widget/coop" target="_blank"
                  style={{...S.btnSm(G.gold,'rgba(232,184,75,0.08)'),padding:'7px 12px',fontSize:11,textDecoration:'none',display:'inline-flex',alignItems:'center',gap:5}}>
                  📺 Widget OBS/TikTok →
                </a>
              </div>
            </div>

            {/* Info widget */}
            <div style={{background:'rgba(232,184,75,0.05)',border:'1px solid rgba(232,184,75,0.2)',borderRadius:12,padding:'12px 16px',marginBottom:'1rem'}}>
              <div style={{fontSize:11,color:G.gold,fontWeight:700,letterSpacing:'1px',textTransform:'uppercase',marginBottom:4}}>📺 URL do Widget (OBS / TikTok Studio)</div>
              <div style={{display:'flex',alignItems:'center',gap:8,background:G.surface2,borderRadius:8,padding:'8px 12px'}}>
                <code style={{fontSize:12,color:G.text,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                  https://efootball-diario.vercel.app/widget/coop
                </code>
                <button onClick={() => {navigator.clipboard.writeText('https://efootball-diario.vercel.app/widget/coop');showToast('✅ URL copiada!')}}
                  style={{...S.btnSm(G.muted,'rgba(255,255,255,0.05)'),flexShrink:0}}>Copiar</button>
              </div>
              <div style={{fontSize:11,color:G.dim,marginTop:6}}>Adicione como Browser Source no OBS ou TikTok Studio · Fundo transparente · Atualização em tempo real</div>
            </div>

            {/* Fila */}
            <div style={S.card}>
              <div style={S.cHead}>
                <span style={S.title}>🎮 Fila atual — {coopFila.length} aguardando</span>
              </div>
              <div style={S.cBody}>
                {coopFila.length === 0 ? (
                  <p style={{color:G.dim,textAlign:'center',padding:'1rem',fontSize:13}}>Fila vazia no momento.</p>
                ) : (
                  (() => {
                    const salas: Record<string,any[]> = {}
                    coopFila.forEach(p => { if(!salas[p.sala_id]) salas[p.sala_id]=[]; salas[p.sala_id].push(p) })
                    return Object.entries(salas).map(([salaId, jogadores]) => (
                      <div key={salaId} style={{background:G.surface2,borderRadius:10,padding:'10px 12px',marginBottom:8,border:`1px solid ${G.border}`}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                          <div style={{display:'flex',alignItems:'center',gap:8}}>
                            <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:14,color:G.text,textTransform:'uppercase'}}>Sala #{salaId}</span>
                            <span style={{fontSize:10,color:G.dim}}>{jogadores.length}/5 jogadores</span>
                          </div>
                          <div style={{display:'flex',alignItems:'center',gap:8}}>
                            <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:16,color:G.gold}}>🔑 {jogadores[0]?.sala_senha}</span>
                            <button onClick={async () => {
                              if(!confirm('Chamar sala #'+salaId+' como concluída?')) return
                              await supabase.from('coop_queue').update({status:'called'}).eq('sala_id',salaId).eq('status','waiting')
                              showToast('✅ Sala #'+salaId+' chamada!'); loadCoop()
                            }} style={{...S.btnSm(G.green,'rgba(34,211,160,0.08)'),fontSize:10}}>Chamar →</button>
                          </div>
                        </div>
                        <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                          <span style={{background:'rgba(232,184,75,0.1)',border:'1px solid rgba(232,184,75,0.25)',borderRadius:14,padding:'3px 10px',fontSize:11,color:G.gold,fontWeight:700}}>👑 FSKATE</span>
                          {jogadores.map((j,i) => (
                            <span key={j.id} style={{background:G.bg,border:`1px solid ${G.border}`,borderRadius:14,padding:'3px 10px',fontSize:11,color:G.muted,display:'flex',alignItems:'center',gap:5}}>
                              {i+1}. {j.player_name}
                              <button onClick={async () => { await supabase.from('coop_queue').update({status:'done'}).eq('id',j.id); loadCoop() }}
                                style={{background:'none',border:'none',color:G.dim,cursor:'pointer',fontSize:11,padding:0,lineHeight:1}}>✕</button>
                            </span>
                          ))}
                          {Array.from({length:Math.max(0,5-jogadores.length)}).map((_,i) => (
                            <span key={i} style={{border:`1px dashed ${G.border2}`,borderRadius:14,padding:'3px 12px',fontSize:11,color:G.dim}}>vaga</span>
                          ))}
                        </div>
                      </div>
                    ))
                  })()
                )}
              </div>
            </div>

            {/* Limpar fila */}
            <button onClick={async () => {
              if(!confirm('Limpar TODA a fila?')) return
              await supabase.from('coop_queue').update({status:'done'}).eq('status','waiting')
              showToast('🗑️ Fila limpa!'); loadCoop()
            }} style={{...S.btnSm(G.red,'rgba(248,113,113,0.06)'),padding:'8px 16px',fontSize:11,width:'100%'}}>
              🗑️ Limpar toda a fila
            </button>
          </>
        )}

      </div>

      {/* Bottom nav */}
      <nav style={S.nav}>
        {TABS.map(t => (
          <button key={t.id} style={S.navBtn(tab===t.id)} onClick={() => { setTab(t.id); if(t.id==='torneios') loadTorneios() }}>
            <span style={{fontSize:15}}>{t.icon}</span>
            <span style={{fontSize:9,fontWeight:700,letterSpacing:'0.8px',textTransform:'uppercase' as const}}>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
