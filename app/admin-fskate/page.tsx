'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

const G = {
  bg: '#09090b', surface: '#111115', surface2: '#18181c',
  border: '#1d1d20', border2: '#2d2d35',
  text: '#e4e4e7', muted: '#71717a', dim: '#52525b',
  blue: '#4f7ef8', gold: '#e8b84b', green: '#22d3a0', red: '#f87171',
}

const CATS = [
  { slug: 'noticias',          name: 'Notícias',     color: G.muted },
  { slug: 'eventos',           name: 'Eventos',      color: '#10b981' },
  { slug: 'atualizacoes',      name: 'Atualizações', color: G.blue },
  { slug: 'campanhas',         name: 'Campanhas',    color: G.gold },
  { slug: 'guias',             name: 'Guias',        color: '#8b5cf6' },
  { slug: 'vazamentos-rumores',name: 'Vazamentos',   color: G.red },
  { slug: 'analises',          name: 'Análises',     color: '#ec4899' },
]

type Tab = 'home' | 'post' | 'youtube' | 'posts' | 'torneios' | 'coop'

function slugify(t: string) {
  return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').substring(0, 80) + '-' + Date.now()
}

const S: any = {
  page:    { minHeight: '100vh', background: G.bg, color: G.text, fontFamily: "'Barlow',sans-serif", paddingBottom: 72 },
  header:  { background: G.surface, borderBottom: `1px solid ${G.border}`, padding: '0 1.25rem', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky' as const, top: 0, zIndex: 50 },
  main:    { maxWidth: 860, margin: '0 auto', padding: '1.25rem 1rem' },
  card:    { background: G.surface, border: `1px solid ${G.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: '1rem' },
  cHead:   { padding: '12px 16px', borderBottom: `1px solid ${G.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cBody:   { padding: '16px' },
  inp:     { width: '100%', background: G.surface2, border: `1px solid ${G.border}`, borderRadius: 8, padding: '10px 12px', color: G.text, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' as const, marginBottom: 10 },
  lbl:     { fontSize: 10, color: G.dim, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase' as const, marginBottom: 5, display: 'block' },
  btnPri:  { background: G.blue, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 12, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' as const, cursor: 'pointer', fontFamily: "'Barlow Condensed',sans-serif" },
  btnGrn:  { background: G.green, color: '#041a10', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 12, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' as const, cursor: 'pointer', fontFamily: "'Barlow Condensed',sans-serif" },
  btnSm:   (c: string, bg: string) => ({ background: bg, color: c, border: `1px solid ${c}28`, borderRadius: 6, padding: '4px 10px', fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' as const, cursor: 'pointer', fontFamily: 'inherit' }),
  nav:     { position: 'fixed' as const, bottom: 0, left: 0, right: 0, background: G.surface, borderTop: `1px solid ${G.border}`, display: 'flex', zIndex: 100 },
  navBtn:  (a: boolean) => ({ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 2, background: 'none', border: 'none', cursor: 'pointer', padding: '8px 4px', color: a ? G.blue : G.dim, fontFamily: 'inherit', borderTop: `2px solid ${a ? G.blue : 'transparent'}`, transition: 'color 0.15s' }),
  toast:   { position: 'fixed' as const, top: 68, left: '50%', transform: 'translateX(-50%)', background: G.surface, border: `1px solid ${G.green}`, borderRadius: 8, padding: '9px 20px', fontSize: 13, color: G.green, zIndex: 300, whiteSpace: 'nowrap' as const, boxShadow: '0 8px 24px rgba(34,211,160,0.12)' },
  title:   { fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 12, letterSpacing: '2px', textTransform: 'uppercase' as const, color: G.muted },
}

export default function Admin() {
  const [tab, setTab] = useState<Tab>('home')
  const [stats, setStats] = useState({ pub: 0, draft: 0, hoje: 0, torneios: 0 })
  const [posts, setPosts] = useState<any[]>([])
  const [torneios, setTorneios] = useState<any[]>([])
  const [featuredId, setFeaturedId] = useState<string | null>(null)
  const [toast, setToast] = useState('')
  const [loading, setLoading] = useState(false)
  const [editPost, setEditPost] = useState<any>(null)
  const [editTorneio, setEditTorneio] = useState<any>(null)

  // Post form
  const [titulo, setTitulo] = useState('')
  const [resumo, setResumo] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [imagem, setImagem] = useState('')
  const [fonte, setFonte] = useState('')
  const [categoria, setCategoria] = useState('noticias')
  const [postStatus, setPostStatus] = useState<'published' | 'draft'>('published')

  // YT form
  const [ytUrl, setYtUrl] = useState('')
  const [ytCat, setYtCat] = useState('noticias')
  const [ytStatus, setYtStatus] = useState<'published' | 'draft'>('published')
  const [ytLoading, setYtLoading] = useState(false)
  const [ytResult, setYtResult] = useState<any>(null)

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2800) }

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    const [{ count: pub }, { count: draft }, { count: hoje }, { count: torn }] = await Promise.all([
      supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
      supabase.from('posts').select('*', { count: 'exact', head: true }).gte('published_at', new Date().toISOString().split('T')[0]),
      supabase.from('tournaments').select('*', { count: 'exact', head: true }),
    ])
    setStats({ pub: pub || 0, draft: draft || 0, hoje: hoje || 0, torneios: torn || 0 })
    const { data: postsData } = await supabase.from('posts').select('id,title,status,auto_published,cover_image,published_at,categories(name,color),featured').order('published_at', { ascending: false }).limit(40)
    setPosts(postsData || [])
    const featured = (postsData || []).find((p: any) => p.featured)
    setFeaturedId(featured?.id || null)
  }

  async function loadTorneios() {
    const { data } = await supabase.from('tournaments').select('id,name,status,model,entry_fee,prize,is_user_created,creation_payment_status,pix_key').order('created_at', { ascending: false })
    setTorneios(data || [])
  }

  async function publicarPost() {
    if (!titulo.trim()) { showToast('⚠️ Título obrigatório'); return }
    setLoading(true)
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', categoria).single()
    const { error } = await supabase.from('posts').insert({
      title: titulo, slug: slugify(titulo), summary: resumo || null, content: conteudo || null,
      cover_image: imagem || null, source_url: fonte || null, category_id: cat?.id || null,
      tags: ['efootball'], status: postStatus, source_type: 'manual', auto_published: false,
      published_at: postStatus === 'published' ? new Date().toISOString() : null
    })
    setLoading(false)
    if (error) { showToast('❌ ' + error.message); return }
    showToast(postStatus === 'published' ? '✅ Publicado!' : '📋 Rascunho salvo!')
    setTitulo(''); setResumo(''); setConteudo(''); setImagem(''); setFonte('')
    loadAll(); setTab('home')
  }

  async function publicarYoutube() {
    if (!ytUrl.trim()) { showToast('⚠️ Cole um link do YouTube'); return }
    setYtLoading(true); setYtResult(null)
    try {
      const res = await fetch('/api/youtube-publish', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeUrl: ytUrl, categoria: ytCat, status: ytStatus })
      })
      const data = await res.json()
      if (data.error) { showToast('❌ ' + data.error); setYtLoading(false); return }
      setYtResult(data)
      showToast(ytStatus === 'published' ? '✅ Publicado!' : '📋 Rascunho salvo!')
      loadAll()
    } catch (e: any) { showToast('❌ ' + e.message) }
    setYtLoading(false)
  }

  async function toggleFeatured(id: string) {
    // Remove featured de todos, depois seta no novo
    await supabase.from('posts').update({ featured: false }).neq('id', '00000000-0000-0000-0000-000000000000')
    if (featuredId !== id) {
      await supabase.from('posts').update({ featured: true }).eq('id', id)
      setFeaturedId(id)
      showToast('⭐ Destaque definido!')
    } else {
      setFeaturedId(null)
      showToast('✓ Destaque removido')
    }
    loadAll()
  }

  async function toggleHide(post: any) {
    const newStatus = post.status === 'hidden' ? 'published' : 'hidden'
    await supabase.from('posts').update({ status: newStatus }).eq('id', post.id)
    showToast(newStatus === 'hidden' ? '🙈 Post ocultado' : '👁 Post visível')
    loadAll()
  }

  async function publicarDraft(id: string) {
    await supabase.from('posts').update({ status: 'published', published_at: new Date().toISOString() }).eq('id', id)
    showToast('✅ Publicado!'); loadAll()
  }

  async function apagarPost(id: string) {
    if (!confirm('Apagar este post permanentemente?')) return
    await supabase.from('posts').delete().eq('id', id)
    showToast('🗑️ Apagado'); loadAll()
  }

  async function salvarEdicaoPost() {
    if (!editPost?.title?.trim()) { showToast('⚠️ Título obrigatório'); return }
    const { error } = await supabase.from('posts').update({
      title: editPost.title, summary: editPost.summary || null,
      content: editPost.content || null, cover_image: editPost.cover_image || null,
      source_url: editPost.source_url || null,
    }).eq('id', editPost.id)
    if (error) { showToast('❌ ' + error.message); return }
    showToast('✅ Post salvo!'); setEditPost(null); loadAll()
  }

  async function apagarTorneio(id: string) {
    if (!confirm('Apagar este torneio?')) return
    await supabase.from('tournaments').delete().eq('id', id)
    showToast('🗑️ Apagado'); loadTorneios()
  }

  async function salvarTorneio() {
    if (!editTorneio?.name?.trim()) { showToast('⚠️ Nome obrigatório'); return }
    const { error } = await supabase.from('tournaments').update({
      name: editTorneio.name, status: editTorneio.status,
      entry_fee: parseFloat(editTorneio.entry_fee) || 0,
      prize: parseFloat(editTorneio.prize) || 0,
      description: editTorneio.description || null,
      rules: editTorneio.rules || null,
    }).eq('id', editTorneio.id)
    if (error) { showToast('❌ ' + error.message); return }
    showToast('✅ Torneio salvo!'); setEditTorneio(null); loadTorneios()
  }

  async function verificarPagamentoTorneio(t: any) {
    showToast('🔄 Verificando LivePix...')
    try {
      const res = await fetch(`/api/livepix/verificar?reference=${t.id}`)
      const data = await res.json()
      if (data.status === 'paid') {
        await supabase.from('tournaments').update({ status: 'open', creation_payment_status: 'paid' }).eq('id', t.id)
        showToast('✅ Pago! Torneio ativado.'); loadTorneios()
      } else {
        showToast(`⏳ Status: ${data.status || 'pendente'}`)
      }
    } catch { showToast('❌ Erro ao verificar') }
  }

  const TABS: { id: Tab; icon: string; label: string }[] = [
    { id: 'home',     icon: '⊞', label: 'Início'   },
    { id: 'post',     icon: '✏️', label: 'Post'     },
    { id: 'youtube',  icon: '▶',  label: 'YouTube'  },
    { id: 'posts',    icon: '≡',  label: 'Posts'    },
    { id: 'torneios', icon: '🏆', label: 'Torneios' },
  ]

  // ── Tela de edição de post ──
  if (editPost) return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=Barlow:wght@400;500&display=swap');`}</style>
      <header style={S.header}>
        <button onClick={() => setEditPost(null)} style={{ background: 'none', border: 'none', color: G.muted, cursor: 'pointer', fontSize: 20, padding: '0 4px' }}>←</button>
        <span style={{ ...S.title, color: G.text }}>Editar Post</span>
        <button onClick={salvarEdicaoPost} style={{ ...S.btnGrn, padding: '7px 14px' }}>Salvar</button>
      </header>
      {toast && <div style={S.toast}>{toast}</div>}
      <div style={S.main}>
        <div style={S.card}>
          <div style={S.cBody}>
            <label style={S.lbl}>Título</label>
            <input style={S.inp} value={editPost.title} onChange={e => setEditPost({ ...editPost, title: e.target.value })} />
            <label style={S.lbl}>Resumo</label>
            <textarea style={{ ...S.inp, minHeight: 70, resize: 'vertical' as const }} value={editPost.summary || ''} onChange={e => setEditPost({ ...editPost, summary: e.target.value })} />
            <label style={S.lbl}>Conteúdo</label>
            <textarea style={{ ...S.inp, minHeight: 180, resize: 'vertical' as const, fontFamily: 'monospace', fontSize: 13 }} value={editPost.content || ''} onChange={e => setEditPost({ ...editPost, content: e.target.value })} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={S.lbl}>URL da Imagem</label>
                <input style={S.inp} placeholder="https://..." value={editPost.cover_image || ''} onChange={e => setEditPost({ ...editPost, cover_image: e.target.value })} />
              </div>
              <div>
                <label style={S.lbl}>Fonte</label>
                <input style={S.inp} placeholder="https://..." value={editPost.source_url || ''} onChange={e => setEditPost({ ...editPost, source_url: e.target.value })} />
              </div>
            </div>
            {editPost.cover_image && (
              <div style={{ marginTop: 4, borderRadius: 8, overflow: 'hidden', border: `1px solid ${G.border}` }}>
                <img src={editPost.cover_image} alt="preview" style={{ width: '100%', height: 'auto', display: 'block', maxHeight: 200, objectFit: 'contain', background: G.surface2 }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=Barlow:wght@400;500&display=swap'); input:focus,textarea:focus{border-color:${G.blue}!important;outline:none}`}</style>

      {/* Header */}
      <header style={S.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Image src="/logo.png" alt="logo" width={32} height={32} style={{ borderRadius: 7 }} />
          <div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 15, color: G.text, letterSpacing: 1, textTransform: 'uppercase', lineHeight: 1 }}>
              <span style={{ color: G.gold }}>e</span>FOOTBALL <span style={{ color: G.blue }}>ADMIN</span>
            </div>
            <div style={{ fontSize: 9, color: G.dim, letterSpacing: '2px', fontWeight: 700, textTransform: 'uppercase' }}>PAINEL FSKATE</div>
          </div>
        </div>
        <a href="/" target="_blank" style={{ fontSize: 11, color: G.dim, textDecoration: 'none', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>Ver site →</a>
      </header>

      {toast && <div style={S.toast}>{toast}</div>}

      <div style={S.main}>

        {/* ── HOME ── */}
        {tab === 'home' && (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: '1rem' }}>
              {[
                { n: stats.pub,      l: 'Publicados', c: G.green },
                { n: stats.draft,    l: 'Rascunhos',  c: G.gold  },
                { n: stats.hoje,     l: 'Hoje',        c: G.blue  },
                { n: stats.torneios, l: 'Torneios',    c: G.text  },
              ].map(s => (
                <div key={s.l} style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 10, padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 30, lineHeight: 1, color: s.c }}>{s.n}</div>
                  <div style={{ fontSize: 9, color: G.dim, marginTop: 3, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>{s.l}</div>
                </div>
              ))}
            </div>

            {/* Destaque */}
            <div style={S.card}>
              <div style={S.cHead}>
                <span style={S.title}>⭐ Post em Destaque (Hero)</span>
                <span style={{ fontSize: 10, color: G.dim }}>aparece primeiro no site</span>
              </div>
              <div style={{ ...S.cBody, padding: '12px' }}>
                {posts.filter(p => p.status === 'published').slice(0, 8).map(p => (
                  <div key={p.id} onClick={() => toggleFeatured(p.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, cursor: 'pointer', marginBottom: 4, background: featuredId === p.id ? 'rgba(232,184,75,0.08)' : 'transparent', border: `1px solid ${featuredId === p.id ? 'rgba(232,184,75,0.3)' : G.border}`, transition: 'all .15s' }}>
                    {p.cover_image && <div style={{ width: 38, height: 38, borderRadius: 6, background: `url(${p.cover_image}) center/cover`, flexShrink: 0 }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700, color: G.text, textTransform: 'uppercase', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                    </div>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{featuredId === p.id ? '⭐' : '☆'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ações rápidas */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button onClick={() => setTab('post')} style={{ ...S.btnPri, padding: '14px', fontSize: 13, borderRadius: 10 }}>✏️ Novo Post</button>
              <button onClick={() => { setTab('posts'); }} style={{ ...S.btnPri, padding: '14px', fontSize: 13, borderRadius: 10, background: G.surface, border: `1px solid ${G.border}`, color: G.text }}>≡ Ver Posts</button>
              <button onClick={() => setTab('youtube')} style={{ ...S.btnPri, padding: '14px', fontSize: 13, borderRadius: 10, background: G.surface, border: `1px solid ${G.border}`, color: G.text }}>▶ YouTube → Post</button>
              <button onClick={() => { setTab('torneios'); loadTorneios() }} style={{ ...S.btnPri, padding: '14px', fontSize: 13, borderRadius: 10, background: G.surface, border: `1px solid ${G.border}`, color: G.text }}>🏆 Torneios</button>
            </div>
          </>
        )}

        {/* ── NOVO POST ── */}
        {tab === 'post' && (
          <div style={S.card}>
            <div style={S.cHead}>
              <span style={S.title}>✏️ Novo Post</span>
              <button onClick={() => setTab('home')} style={{ background: 'none', border: 'none', color: G.muted, cursor: 'pointer', fontSize: 20 }}>←</button>
            </div>
            <div style={S.cBody}>
              <label style={S.lbl}>Título *</label>
              <input style={S.inp} placeholder="Título da notícia..." value={titulo} onChange={e => setTitulo(e.target.value)} />

              <label style={S.lbl}>Categoria</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
                {CATS.map(c => (
                  <button key={c.slug} onClick={() => setCategoria(c.slug)}
                    style={{ padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', background: categoria === c.slug ? c.color + '22' : G.surface2, color: categoria === c.slug ? c.color : G.muted, outline: categoria === c.slug ? `1px solid ${c.color}55` : `1px solid ${G.border}` }}>
                    {c.name}
                  </button>
                ))}
              </div>

              <label style={S.lbl}>Resumo</label>
              <textarea style={{ ...S.inp, minHeight: 64, resize: 'vertical' as const }} placeholder="Resumo curto que aparece nos cards..." value={resumo} onChange={e => setResumo(e.target.value)} />

              <label style={S.lbl}>Conteúdo</label>
              <textarea style={{ ...S.inp, minHeight: 160, resize: 'vertical' as const, fontFamily: 'monospace', fontSize: 13, lineHeight: 1.6 }} placeholder={'Texto completo da notícia...\n\nUse ## para título de seção\nUse # para subtítulo\n\nLinks são detectados automaticamente.'} value={conteudo} onChange={e => setConteudo(e.target.value)} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={S.lbl}>URL da Imagem</label>
                  <input style={S.inp} placeholder="https://..." value={imagem} onChange={e => setImagem(e.target.value)} />
                </div>
                <div>
                  <label style={S.lbl}>Link da Fonte</label>
                  <input style={S.inp} placeholder="https://..." value={fonte} onChange={e => setFonte(e.target.value)} />
                </div>
              </div>

              {imagem && (
                <div style={{ borderRadius: 8, overflow: 'hidden', border: `1px solid ${G.border}`, marginBottom: 12 }}>
                  <img src={imagem} alt="preview" style={{ width: '100%', height: 'auto', display: 'block', background: G.surface2 }} />
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                {(['published', 'draft'] as const).map(s => (
                  <button key={s} onClick={() => setPostStatus(s)}
                    style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: '1px', textTransform: 'uppercase', background: postStatus === s ? (s === 'published' ? G.green : G.gold) : G.surface2, color: postStatus === s ? (s === 'published' ? '#041a10' : '#1a1000') : G.muted }}>
                    {s === 'published' ? '✅ Publicar' : '◻ Rascunho'}
                  </button>
                ))}
              </div>

              <button style={{ ...S.btnGrn, width: '100%', padding: '12px', fontSize: 13, opacity: loading ? 0.6 : 1 }} onClick={publicarPost} disabled={loading}>
                {loading ? 'Publicando...' : postStatus === 'published' ? '▶ Publicar agora' : '◻ Salvar rascunho'}
              </button>
            </div>
          </div>
        )}

        {/* ── YOUTUBE ── */}
        {tab === 'youtube' && (
          <div style={S.card}>
            <div style={S.cHead}>
              <span style={S.title}>▶ YouTube → Post</span>
              <button onClick={() => setTab('home')} style={{ background: 'none', border: 'none', color: G.muted, cursor: 'pointer', fontSize: 20 }}>←</button>
            </div>
            <div style={S.cBody}>
              <div style={{ background: G.surface2, border: `1px solid ${G.border}`, borderRadius: 8, padding: '10px 12px', marginBottom: 14, fontSize: 13, color: G.muted, lineHeight: 1.6 }}>
                Cole o link do YouTube. A IA transcreve e cria uma notícia jornalística.
              </div>
              <label style={S.lbl}>Link do YouTube</label>
              <input style={S.inp} placeholder="https://www.youtube.com/watch?v=..." value={ytUrl} onChange={e => setYtUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && publicarYoutube()} />

              <label style={S.lbl}>Categoria</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
                {CATS.map(c => (
                  <button key={c.slug} onClick={() => setYtCat(c.slug)}
                    style={{ padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', background: ytCat === c.slug ? c.color + '22' : G.surface2, color: ytCat === c.slug ? c.color : G.muted, outline: ytCat === c.slug ? `1px solid ${c.color}55` : `1px solid ${G.border}` }}>
                    {c.name}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                {(['published', 'draft'] as const).map(s => (
                  <button key={s} onClick={() => setYtStatus(s)}
                    style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: '1px', textTransform: 'uppercase', background: ytStatus === s ? (s === 'published' ? G.green : G.gold) : G.surface2, color: ytStatus === s ? (s === 'published' ? '#041a10' : '#1a1000') : G.muted }}>
                    {s === 'published' ? '✅ Publicar' : '◻ Rascunho'}
                  </button>
                ))}
              </div>

              <button style={{ ...S.btnGrn, width: '100%', padding: '12px', fontSize: 13, opacity: ytLoading ? 0.6 : 1 }} onClick={publicarYoutube} disabled={ytLoading}>
                {ytLoading ? '⏳ Gerando notícia...' : '▶ Gerar e publicar'}
              </button>

              {ytResult && (
                <div style={{ marginTop: 14, background: G.surface2, border: `1px solid rgba(34,211,160,0.3)`, borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 10, color: G.green, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6 }}>✅ Notícia criada</div>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 15, fontWeight: 700, color: G.text, marginBottom: 4, textTransform: 'uppercase' }}>{ytResult.titulo}</div>
                  <div style={{ fontSize: 12, color: G.muted }}>{ytResult.resumo}</div>
                  <button onClick={() => { setYtUrl(''); setYtResult(null) }} style={{ ...S.btnSm(G.muted, G.surface), marginTop: 10 }}>Novo vídeo</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── POSTS ── */}
        {tab === 'posts' && !editPost && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
              <button onClick={() => setTab('home')} style={{ background: 'none', border: 'none', color: G.muted, cursor: 'pointer', fontSize: 20 }}>←</button>
              <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 20, color: G.text, textTransform: 'uppercase', letterSpacing: 1 }}>Posts ({posts.length})</span>
            </div>
            {posts.map(p => (
              <div key={p.id} style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 10, padding: '10px 12px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Status dot */}
                <div style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: p.status === 'published' ? G.green : p.status === 'hidden' ? G.gold : G.dim }} title={p.status} />
                {/* Thumb */}
                {p.cover_image && <div style={{ width: 36, height: 36, borderRadius: 6, background: `url(${p.cover_image}) center/cover`, flexShrink: 0 }} />}
                {/* Title */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700, color: G.text, textTransform: 'uppercase', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                  <div style={{ fontSize: 10, color: G.dim, marginTop: 1 }}>
                    {p.status === 'published' ? '● publicado' : p.status === 'draft' ? '○ rascunho' : '◌ oculto'}
                    {p.auto_published && <span style={{ color: G.green, marginLeft: 6 }}>AUTO</span>}
                    {featuredId === p.id && <span style={{ color: G.gold, marginLeft: 6 }}>⭐ DESTAQUE</span>}
                  </div>
                </div>
                {/* Actions */}
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button onClick={() => toggleFeatured(p.id)} title="Destacar" style={{ ...S.btnSm(G.gold, 'rgba(232,184,75,0.08)'), padding: '4px 8px', fontSize: 13 }}>{featuredId === p.id ? '⭐' : '☆'}</button>
                  <button onClick={() => setEditPost(p)} style={S.btnSm(G.blue, 'rgba(79,126,248,0.08)')}>Editar</button>
                  {p.status === 'draft' && <button onClick={() => publicarDraft(p.id)} style={S.btnSm(G.green, 'rgba(34,211,160,0.08)')}>Pub.</button>}
                  <button onClick={() => toggleHide(p)} style={S.btnSm(p.status === 'hidden' ? G.green : G.gold, 'rgba(255,255,255,0.04)')}>
                    {p.status === 'hidden' ? 'Mostrar' : 'Ocultar'}
                  </button>
                  <button onClick={() => apagarPost(p.id)} style={S.btnSm(G.red, 'rgba(248,113,113,0.08)')}>✕</button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ── TORNEIOS ── */}
        {tab === 'torneios' && !editTorneio && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => setTab('home')} style={{ background: 'none', border: 'none', color: G.muted, cursor: 'pointer', fontSize: 20 }}>←</button>
                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 20, color: G.text, textTransform: 'uppercase', letterSpacing: 1 }}>Torneios</span>
              </div>
            </div>

            {torneios.map(t => {
              const isPendente = t.status === 'draft' || t.creation_payment_status === 'pending'
              return (
                <div key={t.id} style={{ background: G.surface, border: `1px solid ${isPendente ? 'rgba(248,113,113,0.3)' : G.border}`, borderRadius: 10, padding: '12px 14px', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 15, fontWeight: 900, color: G.text, textTransform: 'uppercase', marginBottom: 4 }}>{t.name}</div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, letterSpacing: '0.8px', textTransform: 'uppercase', background: t.status === 'open' ? 'rgba(34,211,160,0.1)' : 'rgba(82,82,91,0.2)', color: t.status === 'open' ? G.green : G.muted }}>
                          {t.status === 'open' ? 'Aberto' : t.status === 'draft' ? 'Aguard. pgto' : t.status}
                        </span>
                        <span style={{ fontSize: 11, color: G.gold, fontWeight: 700 }}>R${Number(t.entry_fee).toFixed(2)}</span>
                        <span style={{ fontSize: 11, color: G.green, fontWeight: 700 }}>🎁 R${Number(t.prize).toFixed(2)}</span>
                        {t.is_user_created && <span style={{ fontSize: 9, color: G.blue, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>CRIADO POR USER</span>}
                      </div>
                      {t.pix_key && <div style={{ fontSize: 11, color: G.dim, marginTop: 4 }}>Pix: {t.pix_key}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 5, flexShrink: 0, flexDirection: 'column', alignItems: 'flex-end' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => setEditTorneio(t)} style={S.btnSm(G.blue, 'rgba(79,126,248,0.08)')}>Editar</button>
                        <button onClick={() => apagarTorneio(t.id)} style={S.btnSm(G.red, 'rgba(248,113,113,0.08)')}>✕</button>
                      </div>
                      {isPendente && (
                        <button onClick={() => verificarPagamentoTorneio(t)}
                          style={{ ...S.btnSm(G.green, 'rgba(34,211,160,0.08)'), fontSize: 10 }}>
                          🔄 Verificar LivePix
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {torneios.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: G.dim }}>
                <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 16, textTransform: 'uppercase' }}>Nenhum torneio ainda</p>
              </div>
            )}
          </>
        )}

        {/* ── EDITAR TORNEIO ── */}
        {tab === 'torneios' && editTorneio && (
          <div style={S.card}>
            <div style={S.cHead}>
              <span style={S.title}>✏️ Editar Torneio</span>
              <button onClick={() => setEditTorneio(null)} style={{ background: 'none', border: 'none', color: G.muted, cursor: 'pointer', fontSize: 20 }}>←</button>
            </div>
            <div style={S.cBody}>
              <label style={S.lbl}>Nome</label>
              <input style={S.inp} value={editTorneio.name} onChange={e => setEditTorneio({ ...editTorneio, name: e.target.value })} />

              <label style={S.lbl}>Status</label>
              <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                {['open', 'in_progress', 'finished', 'draft', 'cancelled'].map(s => (
                  <button key={s} onClick={() => setEditTorneio({ ...editTorneio, status: s })}
                    style={{ padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', background: editTorneio.status === s ? G.green + '22' : G.surface2, color: editTorneio.status === s ? G.green : G.muted, outline: editTorneio.status === s ? `1px solid ${G.green}55` : `1px solid ${G.border}` }}>
                    {s}
                  </button>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><label style={S.lbl}>Inscrição R$</label><input style={S.inp} type="number" value={editTorneio.entry_fee} onChange={e => setEditTorneio({ ...editTorneio, entry_fee: e.target.value })} /></div>
                <div><label style={S.lbl}>Prêmio R$</label><input style={S.inp} type="number" value={editTorneio.prize} onChange={e => setEditTorneio({ ...editTorneio, prize: e.target.value })} /></div>
              </div>

              <label style={S.lbl}>Descrição</label>
              <textarea style={{ ...S.inp, minHeight: 64, resize: 'vertical' as const }} value={editTorneio.description || ''} onChange={e => setEditTorneio({ ...editTorneio, description: e.target.value })} />

              <label style={S.lbl}>Regras</label>
              <textarea style={{ ...S.inp, minHeight: 64, resize: 'vertical' as const }} value={editTorneio.rules || ''} onChange={e => setEditTorneio({ ...editTorneio, rules: e.target.value })} />

              <button style={{ ...S.btnGrn, width: '100%', padding: '12px', fontSize: 13 }} onClick={salvarTorneio}>💾 Salvar alterações</button>
            </div>
          </div>
        )}

      </div>

      {/* Bottom nav */}
      <nav style={S.nav}>
        {TABS.map(t => (
          <button key={t.id} style={S.navBtn(tab === t.id)}
            onClick={() => { setTab(t.id); if (t.id === 'torneios') loadTorneios() }}>
            <span style={{ fontSize: 16 }}>{t.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' as const }}>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
