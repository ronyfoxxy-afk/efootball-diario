'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import {
  DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const G = {
  bg: '#09090b', surface: '#111115', surface2: '#18181c',
  border: '#1d1d20', border2: '#2d2d35',
  text: '#e4e4e7', muted: '#71717a', dim: '#52525b',
  gold: '#fbe900', green: '#22d3a0', red: '#f87171', blue: '#4f7ef8',
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

type Tab = 'home' | 'posts' | 'coop' | 'site'

function slugify(t: string) {
  return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-').substring(0,80)+'-'+Date.now()
}

const S: any = {
  page:  { minHeight:'100vh', background:G.bg, color:G.text, fontFamily:"'Barlow',sans-serif" },
  main:  { maxWidth:760, margin:'0 auto', padding:'1.5rem 1rem' },
  card:  { background:G.surface, border:`1px solid ${G.border}`, borderRadius:12, overflow:'hidden', marginBottom:'1rem' },
  cHead: { padding:'11px 16px', borderBottom:`1px solid ${G.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' },
  cBody: { padding:'16px' },
  inp:   { width:'100%', background:G.surface2, border:`1px solid ${G.border}`, borderRadius:8, padding:'10px 12px', color:G.text, fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const, marginBottom:10 },
  lbl:   { fontSize:10, color:G.dim, fontWeight:700, letterSpacing:'1.2px', textTransform:'uppercase' as const, marginBottom:5, display:'block' },
  btnGrn:{ background:G.green, color:'#041a10', border:'none', borderRadius:8, padding:'11px 18px', fontSize:12, fontWeight:700, letterSpacing:'1px', textTransform:'uppercase' as const, cursor:'pointer', fontFamily:"'Barlow Condensed',sans-serif" },
  btnOut:{ background:G.surface2, color:G.text, border:`1px solid ${G.border}`, borderRadius:8, padding:'11px 18px', fontSize:12, fontWeight:700, letterSpacing:'1px', textTransform:'uppercase' as const, cursor:'pointer', fontFamily:"'Barlow Condensed',sans-serif" },
  btnSm: (c:string,bg:string) => ({ background:bg, color:c, border:`1px solid ${c}28`, borderRadius:6, padding:'4px 9px', fontSize:10, fontWeight:700, letterSpacing:'0.8px', textTransform:'uppercase' as const, cursor:'pointer', fontFamily:'inherit' }),
  toast: { position:'fixed' as const, top:66, left:'50%', transform:'translateX(-50%)', background:G.surface, border:`1px solid ${G.green}`, borderRadius:8, padding:'9px 20px', fontSize:13, color:G.green, zIndex:300, whiteSpace:'nowrap' as const },
  secTit:{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:12, letterSpacing:'2px', textTransform:'uppercase' as const, color:G.muted },
}

const SITE_SECTIONS = [
  { key:'show_coop',           label:'🎮 Co-op',          desc:'Banner co-op na home' },
  { key:'show_livepix_banner', label:'💰 Banner LivePix', desc:'Faixa doe no topo' },
]

const MENU_ITEMS = [
  { id:'home' as Tab,     icon:'⊞', label:'Início'    },
  { id:'posts' as Tab,    icon:'≡',  label:'Posts'     },
  { id:'coop' as Tab,     icon:'🎮', label:'Co-op'     },
  { id:'site' as Tab,     icon:'👁', label:'Site'      },
]

/* ── Card de post arrastável ── */
function SortablePostCard({ p, featuredId, onToggleFeatured, onEdit, onPublish, onToggleHide, onDelete }: {
  p: any, featuredId: string|null,
  onToggleFeatured: (id:string)=>void, onEdit: (p:any)=>void,
  onPublish: (id:string)=>void, onToggleHide: (p:any)=>void, onDelete: (id:string)=>void,
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: p.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
  }
  return (
    <div ref={setNodeRef} style={{
      ...style,
      background:G.surface, border:`1px solid ${G.border}`, borderRadius:12, padding:'10px 12px', marginBottom:8,
      display:'flex', alignItems:'center', gap:8,
      boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.5)' : 'none',
      transition: `${transition}, box-shadow .15s, border-color .15s`,
    }}
    className="card-hover">
      {/* Alça de arrastar */}
      <div {...attributes} {...listeners} className="drag-handle-anim"
        style={{ cursor:'grab', color:G.dim, fontSize:16, padding:'4px 2px', flexShrink:0, touchAction:'none', display:'flex', alignItems:'center' }}>
        ⠿
      </div>
      {p.cover_image && <div style={{ width:40, height:40, borderRadius:8, background:`url(${p.cover_image}) center/cover`, flexShrink:0, border:`1px solid ${G.border}` }} />}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:13, fontWeight:700, color:G.text, textTransform:'uppercase', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.title}</div>
        <div style={{ fontSize:10, color:G.dim, marginTop:2, display:'flex', gap:8 }}>
          {p.auto_published && <span style={{ color:G.green }}>AUTO</span>}
          {featuredId===p.id && <span style={{ color:G.gold }}>⭐ DESTAQUE</span>}
        </div>
      </div>
      <div style={{ display:'flex', gap:4, flexShrink:0 }}>
        <button onClick={()=>onToggleFeatured(p.id)} className="btn-anim" style={{ ...S.btnSm(G.gold,'rgba(232,184,75,0.08)'), padding:'4px 8px', fontSize:13 }}>{featuredId===p.id?'⭐':'☆'}</button>
        <button onClick={()=>onEdit(p)} className="btn-anim" style={S.btnSm(G.text,'rgba(255,255,255,0.05)')}>Editar</button>
        {p.status==='draft' && <button onClick={()=>onPublish(p.id)} className="btn-anim" style={S.btnSm(G.green,'rgba(34,211,160,0.08)')}>Pub.</button>}
        <button onClick={()=>onToggleHide(p)} className="btn-anim" style={S.btnSm(p.status==='hidden'?G.green:G.gold,'rgba(255,255,255,0.04)')}>{p.status==='hidden'?'Mostrar':'Ocultar'}</button>
        <button onClick={()=>onDelete(p.id)} className="btn-anim" style={S.btnSm(G.red,'rgba(248,113,113,0.06)')}>✕</button>
      </div>
    </div>
  )
}

/* ── Card de preview da home — mesmo visual do site, arrastável ── */
function HomePreviewCard({ p, variant, featuredId, onToggleFeatured, onEdit }: {
  p: any, variant: 'hero' | 'side' | 'grid', featuredId: string|null,
  onToggleFeatured: (id:string)=>void, onEdit: (p:any)=>void,
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: p.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
  }

  const dragHandle = (
    <div {...attributes} {...listeners} className="drag-handle-anim"
      style={{ position:'absolute', top:8, left:8, zIndex:3, cursor:'grab', color:'#fff', fontSize:16, background:'rgba(0,0,0,0.5)', borderRadius:6, padding:'4px 7px', touchAction:'none', display:'flex', alignItems:'center', backdropFilter:'blur(4px)' }}>
      ⠿
    </div>
  )

  const actions = (
    <div style={{ position:'absolute', top:8, right:8, zIndex:3, display:'flex', gap:4 }}>
      <button onClick={(e)=>{e.preventDefault();onToggleFeatured(p.id)}} className="btn-anim"
        style={{ ...S.btnSm(G.gold,'rgba(0,0,0,0.5)'), padding:'4px 7px', fontSize:13, backdropFilter:'blur(4px)' }}>
        {featuredId===p.id?'⭐':'☆'}
      </button>
      <button onClick={(e)=>{e.preventDefault();onEdit(p)}} className="btn-anim"
        style={{ ...S.btnSm(G.text,'rgba(0,0,0,0.5)'), backdropFilter:'blur(4px)' }}>
        Editar
      </button>
    </div>
  )

  if (variant === 'hero') {
    return (
      <div ref={setNodeRef} style={{ ...style, position:'relative', borderRadius:14, overflow:'hidden', border:`1px solid ${G.border}`, transition:`${transition}, box-shadow .15s` }} className="card-hover">
        {dragHandle}
        {actions}
        {p.cover_image ? (
          <div style={{ position:'relative', width:'100%' }}>
            <div style={{ width:'100%', height:200, background:`url(${p.cover_image}) center/cover` }} />
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(9,9,11,0.97) 0%, rgba(9,9,11,0.45) 50%, rgba(9,9,11,0.1) 100%)' }} />
            <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'1rem', zIndex:2 }}>
              {p.categories && <span style={{ background:`${p.categories.color}22`, color:p.categories.color, border:`1px solid ${p.categories.color}55`, fontSize:9, fontWeight:700, padding:'2px 8px', borderRadius:4, letterSpacing:'1px', textTransform:'uppercase' }}>{p.categories.name}</span>}
              <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:20, fontWeight:900, color:'#fff', textTransform:'uppercase', marginTop:6, lineHeight:1.1 }}>{p.title}</h2>
            </div>
          </div>
        ) : (
          <div style={{ background:'linear-gradient(135deg,#0d0820 0%,#091428 50%,#0a1a0d 100%)', minHeight:200, display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:'1rem' }}>
            {p.categories && <span style={{ background:`${p.categories.color}22`, color:p.categories.color, border:`1px solid ${p.categories.color}55`, fontSize:9, fontWeight:700, padding:'2px 8px', borderRadius:4, letterSpacing:'1px', textTransform:'uppercase' }}>{p.categories.name}</span>}
            <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:20, fontWeight:900, color:'#fff', textTransform:'uppercase', marginTop:6, lineHeight:1.1 }}>{p.title}</h2>
          </div>
        )}
      </div>
    )
  }

  if (variant === 'side') {
    return (
      <div ref={setNodeRef} style={{ ...style, position:'relative', background:G.surface, border:`1px solid ${G.border}`, borderRadius:12, padding:10, display:'flex', gap:10, transition:`${transition}, box-shadow .15s` }} className="card-hover">
        {dragHandle}
        {actions}
        {p.cover_image && <div style={{ width:54, height:54, borderRadius:8, background:`url(${p.cover_image}) center/cover`, flexShrink:0, border:`1px solid ${G.border}` }} />}
        <div style={{ minWidth:0, paddingTop:2, paddingLeft: p.cover_image ? 0 : 24 }}>
          {p.categories && <span style={{ fontSize:9, color:p.categories.color, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px' }}>{p.categories.name}</span>}
          <p style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:13, fontWeight:700, color:G.text, margin:'2px 0 0', lineHeight:1.2, textTransform:'uppercase', overflow:'hidden', textOverflow:'ellipsis', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' as const }}>{p.title}</p>
        </div>
      </div>
    )
  }

  // grid (compacto)
  return (
    <div ref={setNodeRef} style={{ ...style, position:'relative', background:G.surface, border:`1px solid ${G.border}`, borderRadius:10, padding:8, display:'flex', alignItems:'center', gap:8, transition:`${transition}, box-shadow .15s` }} className="card-hover">
      <div {...attributes} {...listeners} className="drag-handle-anim" style={{ cursor:'grab', color:G.dim, fontSize:14, flexShrink:0, touchAction:'none', display:'flex', alignItems:'center' }}>⠿</div>
      {p.cover_image && <div style={{ width:36, height:36, borderRadius:6, background:`url(${p.cover_image}) center/cover`, flexShrink:0, border:`1px solid ${G.border}` }} />}
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:12, fontWeight:700, color:G.text, margin:0, lineHeight:1.2, textTransform:'uppercase', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.title}</p>
      </div>
      <button onClick={()=>onEdit(p)} className="btn-anim" style={{ ...S.btnSm(G.text,'rgba(255,255,255,0.05)'), flexShrink:0 }}>Editar</button>
    </div>
  )
}

export default function Admin() {
  const [tab, setTab] = useState<Tab>('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const [stats, setStats] = useState({ pub:0, draft:0, hoje:0 })
  const [posts, setPosts] = useState<any[]>([])
  const [coopFila, setCoopFila] = useState<any[]>([])
  const [featuredId, setFeaturedId] = useState<string|null>(null)
  const [siteVis, setSiteVis] = useState<Record<string,boolean>>({ show_coop:true, show_livepix_banner:true })
  const [toast, setToast] = useState('')
  const [editPost, setEditPost] = useState<any>(null)

  function showToast(m:string) { setToast(m); setTimeout(()=>setToast(''),2800) }
  function goTab(t:Tab) { setTab(t); setMenuOpen(false); if(t==='coop') loadCoop() }

  useEffect(() => { loadAll(); loadVis() }, [])

  async function loadAll() {
    const [{ count:pub },{ count:draft },{ count:hoje }] = await Promise.all([
      supabase.from('posts').select('*',{count:'exact',head:true}).eq('status','published'),
      supabase.from('posts').select('*',{count:'exact',head:true}).eq('status','draft'),
      supabase.from('posts').select('*',{count:'exact',head:true}).gte('published_at',new Date().toISOString().split('T')[0]),
    ])
    setStats({ pub:pub||0, draft:draft||0, hoje:hoje||0 })
    const { data } = await supabase.from('posts').select('id,title,summary,content,status,auto_published,cover_image,source_url,published_at,order_index,categories(name,color),featured').order('order_index',{ascending:true,nullsFirst:false}).limit(50)
    setPosts(data||[])
    setFeaturedId((data||[]).find((p:any)=>p.featured)?.id||null)
  }

  async function loadVis() {
    try {
      const { data } = await supabase.from('site_settings').select('key,value')
      if (data) { const m:Record<string,boolean>={}; data.forEach((r:any)=>{ m[r.key]=r.value!=='false' }); setSiteVis(prev=>({...prev,...m})) }
    } catch {}
  }

  async function loadCoop() {
    const { data } = await supabase.from('coop_queue').select('*').eq('status','waiting').order('created_at',{ascending:true})
    setCoopFila(data||[])
  }

  async function toggleVis(key:string) {
    const v = !siteVis[key]
    setSiteVis(prev=>({...prev,[key]:v}))
    try { await supabase.from('site_settings').upsert({key,value:String(v)},{onConflict:'key'}); showToast(v?'👁 Visível':'🙈 Oculto') } catch { showToast('⚠️ Erro') }
  }

  async function toggleFeatured(id:string) {
    await supabase.from('posts').update({featured:false}).neq('id','00000000-0000-0000-0000-000000000000')
    if (featuredId!==id) { await supabase.from('posts').update({featured:true}).eq('id',id); setFeaturedId(id); showToast('⭐ Destaque definido!') }
    else { setFeaturedId(null); showToast('✓ Removido') }
    loadAll()
  }

  async function toggleHide(post:any) {
    const s = post.status==='hidden'?'published':'hidden'
    await supabase.from('posts').update({status:s}).eq('id',post.id)
    showToast(s==='hidden'?'🙈 Ocultado':'👁 Visível'); loadAll()
  }

  async function publicarDraft(id:string) {
    await supabase.from('posts').update({status:'published',published_at:new Date().toISOString()}).eq('id',id)
    showToast('✅ Publicado!'); loadAll()
  }

  async function apagarPost(id:string) {
    if (!confirm('Apagar este post?')) return
    await supabase.from('posts').delete().eq('id',id)
    showToast('🗑️ Apagado'); loadAll()
  }

  const dndSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  )

  async function handlePostDragEnd(event: DragEndEvent, status: string) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const filtered = posts.filter(p=>p.status===status)
    const oldIndex = filtered.findIndex(p=>p.id===active.id)
    const newIndex = filtered.findIndex(p=>p.id===over.id)
    if (oldIndex===-1 || newIndex===-1) return

    const reordered = arrayMove(filtered, oldIndex, newIndex)

    // Atualiza estado local imediatamente (otimista)
    const otherPosts = posts.filter(p=>p.status!==status)
    setPosts([...otherPosts, ...reordered].sort((a,b)=>(a.order_index??0)-(b.order_index??0)))

    // Reatribui order_index sequencial dentro do grupo e persiste
    const updates = reordered.map((p, i) => ({ id: p.id, order_index: i }))
    for (const u of updates) {
      await supabase.from('posts').update({ order_index: u.order_index }).eq('id', u.id)
    }
    loadAll()
  }

  async function salvarEdicaoPost() {
    const { error } = await supabase.from('posts').update({
      title:editPost.title, summary:editPost.summary||null,
      content:editPost.content||null, cover_image:editPost.cover_image||null, source_url:editPost.source_url||null,
    }).eq('id',editPost.id)
    if (error) { showToast('❌ '+error.message); return }
    showToast('✅ Salvo!'); setEditPost(null); loadAll()
  }

  async function sair() {
    await fetch('/api/admin-auth', { method:'DELETE' })
    window.location.href = '/admin-login'
  }

  // ── EDITAR POST ──
  if (editPost) return (
    <div className="admin-zone" style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=Barlow:wght@400;500&display=swap');`}</style>
      <header style={{ background:G.surface, borderBottom:`1px solid ${G.border}`, padding:'0 1.25rem', height:56, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky' as const, top:0, zIndex:50 }}>
        <button onClick={()=>setEditPost(null)} style={{ background:'none',border:'none',color:G.muted,cursor:'pointer',fontSize:20 }}>←</button>
        <span style={S.secTit}>Editar Post</span>
        <button onClick={salvarEdicaoPost} style={S.btnGrn}>Salvar</button>
      </header>
      {toast && <div className="toast-anim" style={S.toast}>{toast}</div>}
      <div style={S.main}>
        <div style={S.card}><div style={S.cBody}>
          <label style={S.lbl}>Título</label>
          <input className="input-anim" style={S.inp} value={editPost.title} onChange={e=>setEditPost({...editPost,title:e.target.value})} />
          <label style={S.lbl}>Resumo</label>
          <textarea className="input-anim" style={{...S.inp,minHeight:64,resize:'vertical' as const}} value={editPost.summary||''} onChange={e=>setEditPost({...editPost,summary:e.target.value})} />
          <label style={S.lbl}>Conteúdo</label>
          <textarea className="input-anim" style={{...S.inp,minHeight:220,resize:'vertical' as const,fontFamily:'monospace',fontSize:13,lineHeight:1.6}} value={editPost.content||''} onChange={e=>setEditPost({...editPost,content:e.target.value})} />
          <label style={S.lbl}>Imagem de capa</label>
          <div style={{display:'flex',gap:6,marginBottom:8}}>
            <input className="input-anim" style={{...S.inp,marginBottom:0,flex:1}} placeholder="https://..." value={editPost.cover_image||''} onChange={e=>setEditPost({...editPost,cover_image:e.target.value})} />
          </div>
          <div style={{border:`2px dashed ${G.border2}`,borderRadius:8,padding:'12px',textAlign:'center',background:G.surface2,position:'relative' as const,marginBottom:10,cursor:'pointer'}}>
            <input type="file" accept="image/*" style={{position:'absolute',inset:0,opacity:0,cursor:'pointer',width:'100%',height:'100%'}}
              onChange={async e => {
                const file = e.target.files?.[0]; if(!file) return
                const reader = new FileReader()
                reader.onload = ev => { if(ev.target?.result) setEditPost({...editPost,cover_image:ev.target.result as string}) }
                reader.readAsDataURL(file)
              }} />
            <div style={{fontSize:18,marginBottom:2}}>🖼️</div>
            <div style={{fontSize:11,color:G.muted,fontWeight:600}}>Upload — clique ou arraste</div>
          </div>
          {editPost.cover_image && <div style={{borderRadius:8,overflow:'hidden',border:`1px solid ${G.border}`,marginBottom:10}}><img src={editPost.cover_image} alt="preview" style={{width:'100%',height:'auto',display:'block',maxHeight:200,objectFit:'cover',background:G.surface2}} /></div>}
          <div><label style={S.lbl}>Fonte URL</label><input className="input-anim" style={S.inp} placeholder="https://..." value={editPost.source_url||''} onChange={e=>setEditPost({...editPost,source_url:e.target.value})} /></div>
        </div></div>
      </div>
    </div>
  )

  return (
    <div className="admin-zone" style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=Barlow:wght@400;500&display=swap'); input:focus,textarea:focus{border-color:${G.gold}!important;outline:none}`}</style>

      {/* ── HEADER ── */}
      <header style={{ background:G.surface, borderBottom:`1px solid ${G.border}`, padding:'0 1.25rem', height:56, display:'flex', alignItems:'center', position:'sticky' as const, top:0, zIndex:100 }}>

        {/* Esquerda: hamburguer + logo + início */}
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={()=>setMenuOpen(!menuOpen)}
            style={{ background:'none', border:`1px solid ${menuOpen?G.border:'transparent'}`, borderRadius:8, color:G.muted, cursor:'pointer', fontSize:18, width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center' }}>
            {menuOpen ? '✕' : '☰'}
          </button>
          <button onClick={()=>goTab('home')} className="btn-anim"
            style={{ background:'none', border:'none', padding:0, cursor:'pointer', display:'flex', alignItems:'center' }}>
            <Image src="/logo.png" alt="logo" width={600} height={136} style={{ objectFit:'contain', height: 28, width: 'auto' }} />
          </button>
          {tab !== 'home' && (
            <button onClick={()=>goTab('home')}
              style={{ background:'none', border:'none', color:G.dim, cursor:'pointer', fontSize:11, fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', fontFamily:'inherit', display:'flex', alignItems:'center', gap:4 }}>
              ← Início
            </button>
          )}
        </div>

        {/* Centro: título do painel */}
        <div style={{ position:'absolute', left:'50%', transform:'translateX(-50%)', textAlign:'center' }}>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:12, color:G.dim, letterSpacing:2, textTransform:'uppercase', lineHeight:1 }}>ADMIN</div>
          <div style={{ fontSize:8, color:G.dim, letterSpacing:'2px', fontWeight:700, textTransform:'uppercase' }}>FSKATE · PAINEL</div>
        </div>



        {/* Direita: sair */}
        <div style={{ marginLeft:'auto' }}>
          <button onClick={sair}
            style={{ background:'none', border:`1px solid ${G.border}`, borderRadius:8, color:G.dim, cursor:'pointer', fontSize:11, fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', fontFamily:'inherit', padding:'6px 12px' }}>
            Sair
          </button>
        </div>
      </header>

      {/* ── MENU LATERAL ── */}
      {menuOpen && (
        <>
          <div style={{ position:'fixed', inset:0, zIndex:150 }} onClick={()=>setMenuOpen(false)} />
          <div style={{ position:'fixed', top:56, left:0, bottom:0, width:240, background:G.surface, borderRight:`1px solid ${G.border}`, zIndex:200, padding:'1rem 0' }}>
            <div style={{ padding:'0 1rem', marginBottom:'1rem', fontSize:9, color:G.dim, fontWeight:700, letterSpacing:'2px', textTransform:'uppercase' }}>Menu</div>
            {MENU_ITEMS.map(item => (
              <button key={item.id} onClick={()=>goTab(item.id)} className="tab-anim"
                style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'12px 1rem', background:tab===item.id?'rgba(232,184,75,0.08)':'none', border:'none', borderLeft:tab===item.id?`3px solid ${G.gold}`:'3px solid transparent', cursor:'pointer', textAlign:'left', color:tab===item.id?G.gold:G.muted, fontFamily:'inherit', transition:'all .15s' }}>
                <span style={{ fontSize:18 }}>{item.icon}</span>
                <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:15, textTransform:'uppercase', letterSpacing:'0.5px' }}>{item.label}</span>
              </button>
            ))}
            <div style={{ height:1, background:G.border, margin:'1rem 0' }} />
            <a href="/admin-fskate/youtube" className="tab-anim"
              style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'12px 1rem', background:'rgba(232,184,75,0.05)', border:'none', borderLeft:`3px solid ${G.gold}`, cursor:'pointer', textAlign:'left', color:G.gold, fontFamily:'inherit', textDecoration:'none' }}>
              <span style={{ fontSize:18 }}>✍️</span>
              <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:15, textTransform:'uppercase', letterSpacing:'0.5px' }}>Radar IA</span>
            </a>
            <a href="/" target="_blank"
              style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'12px 1rem', background:'none', border:'none', borderLeft:'3px solid transparent', cursor:'pointer', textAlign:'left', color:G.dim, fontFamily:'inherit', textDecoration:'none' }}>
              <span style={{ fontSize:18 }}>🌐</span>
              <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:15, textTransform:'uppercase', letterSpacing:'0.5px' }}>Ver Site</span>
            </a>
          </div>
        </>
      )}

      {toast && <div className="toast-anim" style={S.toast}>{toast}</div>}

      <div style={S.main}>

        {/* ── HOME ── */}
        {tab==='home' && (
          <>
            {/* Stats */}
            <div style={{ display:'flex', gap:8, marginBottom:'2rem' }}>
              {[
                { n:stats.pub,   l:'publicados', c:G.green },
                { n:stats.draft, l:'rascunhos',  c:G.gold  },
                { n:stats.hoje,  l:'hoje',        c:G.text  },
              ].map(s => (
                <div key={s.l} style={{ background:G.surface, border:`1px solid ${G.border}`, borderRadius:8, padding:'8px 16px', display:'flex', alignItems:'baseline', gap:6 }}>
                  <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:24, color:s.c }}>{s.n}</span>
                  <span style={{ fontSize:11, color:G.dim }}>{s.l}</span>
                </div>
              ))}
            </div>

            {/* Botão publicar grande */}
            <a href="/admin-fskate/youtube"
              style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:12, background:G.gold, color:'#0a0800', borderRadius:14, padding:'1.25rem', textDecoration:'none', marginBottom:'2rem', cursor:'pointer' }}>
              <span style={{ fontSize:28 }}>✍️</span>
              <div>
                <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:22, textTransform:'uppercase', letterSpacing:1, lineHeight:1 }}>Nova Publicação</div>
                <div style={{ fontSize:12, marginTop:3, opacity:0.7 }}>YouTube · Pesquisa IA · Manual</div>
              </div>
            </a>

            {/* Preview editável da Home */}
            <div style={{ fontSize:10, color:G.dim, fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
              👁 Pré-visualização da Home — arraste ⠿ para reordenar, ⭐ para destacar
            </div>
            {(() => {
              const published = posts.filter(p=>p.status==='published')
              const hero = published[0]
              const sideItems = published.slice(1,4)
              const gridItems = published.slice(4,10)
              if (!published.length) return <p style={{ color:G.dim, fontSize:14 }}>Nenhum post publicado ainda.</p>
              return (
                <DndContext sensors={dndSensors} collisionDetection={closestCenter}
                  onDragEnd={(e)=>handlePostDragEnd(e,'published')}>
                  <SortableContext items={published.map(p=>p.id)} strategy={verticalListSortingStrategy}>
                    {/* Hero + side items, lado a lado no desktop */}
                    <div style={{ display:'grid', gridTemplateColumns: sideItems.length ? '1.6fr 1fr' : '1fr', gap:10, marginBottom:10 }}>
                      {hero && <HomePreviewCard p={hero} variant="hero" featuredId={featuredId} onToggleFeatured={toggleFeatured} onEdit={setEditPost} />}
                      {sideItems.length > 0 && (
                        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                          {sideItems.map(p => (
                            <HomePreviewCard key={p.id} p={p} variant="side" featuredId={featuredId} onToggleFeatured={toggleFeatured} onEdit={setEditPost} />
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Grid das próximas notícias */}
                    {gridItems.length > 0 && (
                      <>
                        <div style={{ fontSize:9, color:G.dim, fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', margin:'4px 0 8px' }}>
                          Próximas notícias
                        </div>
                        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                          {gridItems.map(p => (
                            <HomePreviewCard key={p.id} p={p} variant="grid" featuredId={featuredId} onToggleFeatured={toggleFeatured} onEdit={setEditPost} />
                          ))}
                        </div>
                      </>
                    )}
                  </SortableContext>
                </DndContext>
              )
            })()}

          </>
        )}

        {/* ── POSTS ── */}
        {tab==='posts' && !editPost && (
          <>
            <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:22, color:G.text, textTransform:'uppercase', letterSpacing:1, marginBottom:'1.25rem' }}>
              Posts <span style={{ color:G.dim, fontSize:16 }}>({posts.length})</span>
            </h2>
            {['published','draft','hidden'].map(status => {
              const filtered = posts.filter(p=>p.status===status)
              if (!filtered.length) return null
              const colors: Record<string,string> = { published:G.green, draft:G.gold, hidden:G.dim }
              const labels: Record<string,string> = { published:'Publicados', draft:'Rascunhos', hidden:'Ocultos' }
              return (
                <div key={status} style={{ marginBottom:'1.25rem' }}>
                  <div style={{ fontSize:10, color:colors[status], fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:6, display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ width:6, height:6, borderRadius:'50%', background:colors[status], display:'inline-block' }}/>
                    {labels[status]} · {filtered.length}
                    {status==='published' && <span style={{ marginLeft:'auto', color:G.dim, fontWeight:400, letterSpacing:0, textTransform:'none', fontSize:10 }}>arraste ⠿ para reordenar</span>}
                  </div>
                  <DndContext sensors={dndSensors} collisionDetection={closestCenter}
                    onDragEnd={(e)=>handlePostDragEnd(e, status)}>
                    <SortableContext items={filtered.map(p=>p.id)} strategy={verticalListSortingStrategy}>
                      {filtered.map(p => (
                        <SortablePostCard key={p.id} p={p} featuredId={featuredId}
                          onToggleFeatured={toggleFeatured} onEdit={setEditPost}
                          onPublish={publicarDraft} onToggleHide={toggleHide} onDelete={apagarPost} />
                      ))}
                    </SortableContext>
                  </DndContext>
                </div>
              )
            })}

          </>
        )}

        {/* ── CO-OP ── */}
        {tab==='coop' && (
          <>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem', flexWrap:'wrap', gap:8 }}>
              <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:22, color:G.text, textTransform:'uppercase', letterSpacing:1 }}>
                Co-op <span style={{ color:G.dim, fontSize:14 }}>{coopFila.length} aguardando</span>
              </h2>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={loadCoop} className="btn-anim" style={{ ...S.btnSm(G.green,'rgba(34,211,160,0.08)'), padding:'7px 12px', fontSize:11 }}>🔄 Atualizar</button>
                <a href="/widget/coop" target="_blank" className="btn-anim" style={{ ...S.btnSm(G.gold,'rgba(232,184,75,0.08)'), padding:'7px 12px', fontSize:11, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:4 }}>
                  📺 Widget OBS →
                </a>
              </div>
            </div>
            <div style={{ background:'rgba(232,184,75,0.05)', border:'1px solid rgba(232,184,75,0.2)', borderRadius:10, padding:'10px 14px', marginBottom:'1rem' }}>
              <div style={{ fontSize:10, color:G.gold, fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', marginBottom:6 }}>URL — OBS / TikTok Studio</div>
              <div style={{ display:'flex', alignItems:'center', gap:8, background:G.surface2, borderRadius:7, padding:'8px 12px' }}>
                <code style={{ fontSize:12, color:G.text, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>https://efootball-diario.vercel.app/widget/coop</code>
                <button onClick={()=>{navigator.clipboard.writeText('https://efootball-diario.vercel.app/widget/coop');showToast('✅ Copiado!')}}
                  className="btn-anim" style={{ ...S.btnSm(G.muted,'rgba(255,255,255,0.05)'), flexShrink:0 }}>Copiar</button>
              </div>
            </div>
            {coopFila.length===0
              ? <p style={{ color:G.dim, fontSize:14, textAlign:'center', padding:'2rem' }}>Fila vazia.</p>
              : (() => {
                  const salas: Record<string,any[]>={}
                  coopFila.forEach(p => { if(!salas[p.sala_id]) salas[p.sala_id]=[]; salas[p.sala_id].push(p) })
                  return Object.entries(salas).map(([salaId,jogadores]) => (
                    <div key={salaId} style={{ background:G.surface, border:`1px solid ${G.border}`, borderRadius:10, padding:'10px 12px', marginBottom:8 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:14, color:G.text, textTransform:'uppercase' }}>Sala #{salaId}</span>
                          <span style={{ fontSize:10, color:G.dim }}>{jogadores.length}/5</span>
                        </div>
                        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                          <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:16, color:G.gold }}>🔑 {jogadores[0]?.sala_senha}</span>
                          <button onClick={async()=>{if(!confirm('Chamar sala #'+salaId+'?'))return;await supabase.from('coop_queue').update({status:'called'}).eq('sala_id',salaId).eq('status','waiting');showToast('✅ Sala chamada!');loadCoop()}}
                            className="btn-anim" style={{ ...S.btnSm(G.green,'rgba(34,211,160,0.08)'), fontSize:10 }}>Chamar →</button>
                        </div>
                      </div>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                        <span style={{ background:'rgba(232,184,75,0.1)', border:'1px solid rgba(232,184,75,0.25)', borderRadius:14, padding:'3px 10px', fontSize:11, color:G.gold, fontWeight:700 }}>👑 FSKATE</span>
                        {jogadores.map((j,i) => (
                          <span key={j.id} style={{ background:G.surface2, border:`1px solid ${G.border}`, borderRadius:14, padding:'3px 10px', fontSize:11, color:G.muted, display:'flex', alignItems:'center', gap:5 }}>
                            {i+1}. {j.player_name}
                            <button onClick={async()=>{await supabase.from('coop_queue').update({status:'done'}).eq('id',j.id);loadCoop()}}
                              style={{ background:'none', border:'none', color:G.dim, cursor:'pointer', fontSize:11, padding:0, lineHeight:1 }}>✕</button>
                          </span>
                        ))}
                        {Array.from({length:Math.max(0,5-jogadores.length)}).map((_,i) => (
                          <span key={i} style={{ border:`1px dashed ${G.border2}`, borderRadius:14, padding:'3px 12px', fontSize:11, color:G.dim }}>vaga</span>
                        ))}
                      </div>
                    </div>
                  ))
                })()
            }
            {coopFila.length>0 && (
              <button onClick={async()=>{if(!confirm('Limpar toda a fila?'))return;await supabase.from('coop_queue').update({status:'done'}).eq('status','waiting');showToast('🗑️ Fila limpa!');loadCoop()}}
                className="btn-anim" style={{ ...S.btnSm(G.red,'rgba(248,113,113,0.06)'), padding:'8px 16px', fontSize:11, width:'100%', marginTop:4 }}>
                🗑️ Limpar toda a fila
              </button>
            )}
          </>
        )}

        {/* ── SITE ── */}
        {tab==='site' && (
          <>
            <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:22, color:G.text, textTransform:'uppercase', letterSpacing:1, marginBottom:'1.25rem' }}>Visibilidade do Site</h2>
            <div style={S.card}><div style={S.cBody}>
              <p style={{ fontSize:13, color:G.dim, marginBottom:14, lineHeight:1.6 }}>Ocultar ou mostrar seções da home.</p>
              {SITE_SECTIONS.map(sec => {
                const vis = siteVis[sec.key]!==false
                return (
                  <div key={sec.key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', background:G.surface2, borderRadius:10, marginBottom:8, border:`1px solid ${G.border}` }}>
                    <div>
                      <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:14, fontWeight:700, color:G.text, textTransform:'uppercase' }}>{sec.label}</div>
                      <div style={{ fontSize:11, color:G.dim, marginTop:2 }}>{sec.desc}</div>
                    </div>
                    <button onClick={()=>toggleVis(sec.key)}
                      style={{ background:vis?'rgba(34,211,160,0.1)':'rgba(248,113,113,0.08)', color:vis?G.green:G.red, border:`1px solid ${vis?'rgba(34,211,160,0.3)':'rgba(248,113,113,0.2)'}`, borderRadius:8, padding:'7px 14px', fontSize:11, fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', cursor:'pointer', fontFamily:"'Barlow Condensed',sans-serif", minWidth:90 }}>
                      {vis?'👁 Visível':'🙈 Oculto'}
                    </button>
                  </div>
                )
              })}
            </div></div>
          </>
        )}

      </div>
    </div>
  )
}