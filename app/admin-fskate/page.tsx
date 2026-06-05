'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const CATS = [
  { slug: 'noticias', name: 'Notícias', color: '#6b7280' },
  { slug: 'eventos', name: 'Eventos', color: '#10b981' },
  { slug: 'atualizacoes', name: 'Atualizações', color: '#4f7ef8' },
  { slug: 'campanhas', name: 'Campanhas', color: '#e8b84b' },
  { slug: 'guias', name: 'Guias', color: '#8b5cf6' },
  { slug: 'vazamentos-rumores', name: 'Vazamentos', color: '#ef4444' },
  { slug: 'analises', name: 'Análises', color: '#ec4899' },
]

function slug(t: string) {
  return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').substring(0, 80) + '-' + Date.now()
}

const css = {
  page: { minHeight: '100vh', background: '#08090c', color: '#e8eaf0', fontFamily: "'Inter', sans-serif" },
  header: { background: '#0e1014', borderBottom: '1px solid #1c1f26', padding: '0 1.25rem', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky' as const, top: 0, zIndex: 50 },
  main: { maxWidth: 900, margin: '0 auto', padding: '1.25rem 1rem 5rem' },
  card: { background: '#0e1014', border: '1px solid #1c1f26', borderRadius: 14, overflow: 'hidden', marginBottom: '1rem' },
  cardHead: { padding: '14px 18px', borderBottom: '1px solid #1c1f26', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardBody: { padding: '18px' },
  stat: { background: '#0e1014', border: '1px solid #1c1f26', borderRadius: 12, padding: '16px', textAlign: 'center' as const },
  inp: { width: '100%', background: '#14161b', border: '1px solid #1c1f26', borderRadius: 10, padding: '11px 14px', color: '#e8eaf0', fontSize: 14, fontFamily: "'Inter',sans-serif", outline: 'none', boxSizing: 'border-box' as const, marginBottom: 12 },
  lbl: { fontSize: 11, color: '#4b5060', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase' as const, marginBottom: 6, display: 'block' },
  btn: (color = '#4f7ef8') => ({ background: color, color: color === '#e8b84b' ? '#000' : '#fff', border: 'none', borderRadius: 10, padding: '11px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter',sans-serif" }),
  btnSm: (color = '#14161b', textColor = '#8b909e') => ({ background: color, color: textColor, border: '1px solid #1c1f26', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: "'Inter',sans-serif" }),
  nav: { position: 'fixed' as const, bottom: 0, left: 0, right: 0, background: '#0e1014', borderTop: '1px solid #1c1f26', display: 'flex', zIndex: 100 },
  navBtn: (active: boolean) => ({ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', padding: '10px 4px', color: active ? '#4f7ef8' : '#4b5060', fontFamily: "'Inter',sans-serif", borderTop: active ? '2px solid #4f7ef8' : '2px solid transparent' }),
  toast: { position: 'fixed' as const, top: 66, left: '50%', transform: 'translateX(-50%)', background: '#0e1014', border: '1px solid #3ecf8e', borderRadius: 10, padding: '10px 20px', fontSize: 13, color: '#3ecf8e', zIndex: 300, whiteSpace: 'nowrap' as const, boxShadow: '0 8px 24px rgba(0,0,0,0.5)' },
}

type Tab = 'home' | 'post' | 'rascunhos' | 'posts' | 'torneio'

export default function Admin() {
  const [tab, setTab] = useState<Tab>('home')
  const [stats, setStats] = useState({ pub: 0, draft: 0, hoje: 0, torneios: 0 })
  const [drafts, setDrafts] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [toast, setToast] = useState('')
  const [loading, setLoading] = useState(false)

  // Form post
  const [titulo, setTitulo] = useState('')
  const [resumo, setResumo] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [imagem, setImagem] = useState('')
  const [fonte, setFonte] = useState('')
  const [categoria, setCategoria] = useState('noticias')
  const [postStatus, setPostStatus] = useState<'published' | 'draft'>('published')

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2500) }

  useEffect(() => { loadStats() }, [])

  async function loadStats() {
    const [{ count: pub }, { count: draft }, { count: hoje }, { count: torneios }] = await Promise.all([
      supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
      supabase.from('posts').select('*', { count: 'exact', head: true }).gte('published_at', new Date().toISOString().split('T')[0]),
      supabase.from('tournaments').select('*', { count: 'exact', head: true }),
    ])
    setStats({ pub: pub || 0, draft: draft || 0, hoje: hoje || 0, torneios: torneios || 0 })
    const { data } = await supabase.from('posts').select('id,title,categories(name,color)').eq('status', 'draft').order('created_at', { ascending: false }).limit(20)
    setDrafts(data || [])
  }

  async function loadPosts() {
    const { data } = await supabase.from('posts').select('id,title,status,auto_published,published_at,categories(name,color)').order('created_at', { ascending: false }).limit(40)
    setPosts(data || [])
  }

  async function publicarPost() {
    if (!titulo.trim()) { showToast('⚠️ Título obrigatório'); return }
    setLoading(true)
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', categoria).single()
    const { error } = await supabase.from('posts').insert({
      title: titulo, slug: slug(titulo),
      summary: resumo || null, content: conteudo || null,
      cover_image: imagem || null, category_id: cat?.id || null,
      source_url: fonte || null, tags: ['efootball'],
      status: postStatus, source_type: 'manual', auto_published: false,
      published_at: postStatus === 'published' ? new Date().toISOString() : null
    })
    setLoading(false)
    if (error) { showToast('❌ ' + error.message); return }
    showToast(postStatus === 'published' ? '✅ Publicado!' : '📋 Rascunho salvo!')
    setTitulo(''); setResumo(''); setConteudo(''); setImagem(''); setFonte('')
    loadStats(); setTab('home')
  }

  async function publicarRascunho(id: string) {
    await supabase.from('posts').update({ status: 'published', published_at: new Date().toISOString() }).eq('id', id)
    showToast('✅ Publicado!'); loadStats()
    setDrafts(d => d.filter(p => p.id !== id))
  }

  async function apagarPost(id: string) {
    if (!confirm('Apagar?')) return
    await supabase.from('posts').delete().eq('id', id)
    showToast('🗑️ Apagado'); loadStats()
    setPosts(p => p.filter(x => x.id !== id))
    setDrafts(d => d.filter(x => x.id !== id))
  }

  const TABS = [
    { id: 'home', icon: '⊞', label: 'Início' },
    { id: 'post', icon: '✏️', label: 'Novo Post' },
    { id: 'rascunhos', icon: '📋', label: 'Rascunhos' },
    { id: 'posts', icon: '📰', label: 'Posts' },
    { id: 'torneio', icon: '🏆', label: 'Torneio' },
  ]

  return (
    <div style={css.page}>

      {/* Header */}
      <header style={css.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: '#4f7ef8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⚽</div>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15, color: '#fff', lineHeight: 1 }}>eFootball Diário</div>
            <div style={{ fontSize: 10, color: '#4b5060', letterSpacing: '1px', lineHeight: 1, marginTop: 1 }}>PAINEL ADMIN</div>
          </div>
        </div>
        <a href="/" style={{ fontSize: 12, color: '#4b5060', textDecoration: 'none' }}>Ver site →</a>
      </header>

      {toast && <div style={css.toast}>{toast}</div>}

      <div style={css.main}>

        {/* ── HOME ── */}
        {tab === 'home' && (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: '1.25rem' }}>
              {[
                { label: 'Publicados', value: stats.pub, color: '#4f7ef8' },
                { label: 'Rascunhos', value: stats.draft, color: '#e8b84b' },
                { label: 'Hoje', value: stats.hoje, color: '#3ecf8e' },
                { label: 'Torneios', value: stats.torneios, color: '#8b5cf6' },
              ].map(s => (
                <div key={s.label} style={css.stat}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: s.color, fontFamily: "'Syne',sans-serif" }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: '#4b5060', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Ações rápidas */}
            <div style={css.card}>
              <div style={css.cardHead}>
                <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15 }}>Ações rápidas</span>
              </div>
              <div style={{ ...css.cardBody, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { icon: '✏️', label: 'Novo Post', sub: 'Criar manualmente', tab: 'post', color: '#4f7ef8' },
                  { icon: '🏆', label: 'Novo Torneio', sub: 'Criar competição', tab: 'torneio', color: '#e8b84b' },
                  { icon: '📋', label: `Rascunhos (${stats.draft})`, sub: 'Aprovar do n8n', tab: 'rascunhos', color: '#8b5cf6' },
                  { icon: '📰', label: 'Todos os Posts', sub: 'Gerenciar conteúdo', tab: 'posts', color: '#3ecf8e' },
                ].map(a => (
                  <button key={a.tab} onClick={() => { setTab(a.tab as Tab); if (a.tab === 'posts') loadPosts() }}
                    style={{ background: '#14161b', border: `1px solid ${a.color}22`, borderRadius: 12, padding: '14px', textAlign: 'left' as const, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 38, height: 38, background: a.color + '18', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{a.icon}</div>
                    <div>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: '#e8eaf0' }}>{a.label}</div>
                      <div style={{ fontSize: 12, color: '#4b5060', marginTop: 1 }}>{a.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Links rápidos */}
            <div style={css.card}>
              <div style={css.cardHead}>
                <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15 }}>Links</span>
              </div>
              <div style={{ padding: '8px' }}>
                {[
                  { href: '/', label: '🌐 Portal público' },
                  { href: '/torneios', label: '🏆 Página de torneios' },
                  { href: '/admin-fskate/coop', label: '🎮 Gerenciar fila Co-op 3x3' },
                  { href: '/coop', label: '👁️ Ver fila pública' },
                  { href: '/admin', label: '⚙️ Admin completo' },
                ].map(l => (
                  <a key={l.href} href={l.href}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8, textDecoration: 'none', color: '#8b909e', fontSize: 14 }}>
                    {l.label}
                    <span style={{ color: '#4b5060' }}>→</span>
                  </a>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── NOVO POST ── */}
        {tab === 'post' && (
          <div style={css.card}>
            <div style={css.cardHead}>
              <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15 }}>✏️ Novo Post</span>
              <button onClick={() => setTab('home')} style={{ background: 'none', border: 'none', color: '#4b5060', cursor: 'pointer', fontSize: 20 }}>←</button>
            </div>
            <div style={css.cardBody}>
              <label style={css.lbl}>Título *</label>
              <input style={css.inp} placeholder="Título da notícia..." value={titulo} onChange={e => setTitulo(e.target.value)} />

              <label style={css.lbl}>Categoria</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {CATS.map(c => (
                  <button key={c.slug} onClick={() => setCategoria(c.slug)}
                    style={{ padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 600, background: categoria === c.slug ? c.color + '22' : '#14161b', color: categoria === c.slug ? c.color : '#4b5060', outline: categoria === c.slug ? `1px solid ${c.color}44` : '1px solid #1c1f26' }}>
                    {c.name}
                  </button>
                ))}
              </div>

              <label style={css.lbl}>Resumo</label>
              <textarea style={{ ...css.inp, minHeight: 72, resize: 'vertical' as const }} placeholder="Resumo curto..." value={resumo} onChange={e => setResumo(e.target.value)} />

              <label style={css.lbl}>Conteúdo</label>
              <textarea style={{ ...css.inp, minHeight: 110, resize: 'vertical' as const }} placeholder="Texto completo..." value={conteudo} onChange={e => setConteudo(e.target.value)} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={css.lbl}>URL da Imagem</label>
                  <input style={css.inp} placeholder="https://..." value={imagem} onChange={e => setImagem(e.target.value)} />
                </div>
                <div>
                  <label style={css.lbl}>Link da Fonte</label>
                  <input style={css.inp} placeholder="https://..." value={fonte} onChange={e => setFonte(e.target.value)} />
                </div>
              </div>

              <label style={css.lbl}>Status</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {(['published', 'draft'] as const).map(s => (
                  <button key={s} onClick={() => setPostStatus(s)}
                    style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13,
                      background: postStatus === s ? (s === 'published' ? '#3ecf8e' : '#e8b84b') : '#14161b',
                      color: postStatus === s ? '#000' : '#4b5060' }}>
                    {s === 'published' ? '✅ Publicar' : '📋 Rascunho'}
                  </button>
                ))}
              </div>

              <button style={{ ...css.btn(), width: '100%', opacity: loading ? 0.6 : 1 }} onClick={publicarPost} disabled={loading}>
                {loading ? 'Salvando...' : postStatus === 'published' ? '🚀 Publicar agora' : '💾 Salvar rascunho'}
              </button>
            </div>
          </div>
        )}

        {/* ── RASCUNHOS ── */}
        {tab === 'rascunhos' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
              <button onClick={() => setTab('home')} style={{ background: 'none', border: 'none', color: '#4b5060', cursor: 'pointer', fontSize: 20 }}>←</button>
              <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 17 }}>Rascunhos ({drafts.length})</span>
            </div>
            {drafts.length === 0 && (
              <div style={{ ...css.card, padding: '2.5rem', textAlign: 'center' as const }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                <p style={{ color: '#4b5060' }}>Nenhum rascunho pendente</p>
              </div>
            )}
            {drafts.map(post => (
              <div key={post.id} style={css.card}>
                <div style={{ padding: '14px 16px' }}>
                  {post.categories && (
                    <span style={{ fontSize: 10, fontWeight: 700, background: post.categories.color + '22', color: post.categories.color, padding: '2px 8px', borderRadius: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {post.categories.name}
                    </span>
                  )}
                  <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 700, color: '#e8eaf0', margin: '8px 0 12px', lineHeight: 1.35 }}>{post.title}</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{ ...css.btnSm('rgba(62,207,142,0.1)', '#3ecf8e'), border: '1px solid rgba(62,207,142,0.2)' }} onClick={() => publicarRascunho(post.id)}>✅ Publicar</button>
                    <a href={`/admin-fskate/editar/${post.id}`}
                      style={{ ...css.btnSm('#14161b', '#4f7ef8'), border: '1px solid #1c1f26', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>✏️ Editar</a>
                    <button style={{ ...css.btnSm('rgba(239,68,68,0.08)', '#ef4444'), border: '1px solid rgba(239,68,68,0.15)' }} onClick={() => apagarPost(post.id)}>🗑️ Apagar</button>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ── TODOS OS POSTS ── */}
        {tab === 'posts' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
              <button onClick={() => setTab('home')} style={{ background: 'none', border: 'none', color: '#4b5060', cursor: 'pointer', fontSize: 20 }}>←</button>
              <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 17 }}>Todos os posts</span>
            </div>
            {posts.map(post => (
              <div key={post.id} style={{ ...css.card, marginBottom: 8 }}>
                <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {post.categories && (
                      <span style={{ fontSize: 10, fontWeight: 700, background: post.categories.color + '22', color: post.categories.color, padding: '1px 7px', borderRadius: 4, textTransform: 'uppercase' }}>
                        {post.categories.name}
                      </span>
                    )}
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#e8eaf0', margin: '5px 0 2px', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</p>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: post.status === 'published' ? '#3ecf8e' : '#e8b84b' }}>
                        {post.status === 'published' ? '✅ Publicado' : '📋 Rascunho'}
                      </span>
                      {post.auto_published && <span style={{ fontSize: 10, color: '#4b5060' }}>· AUTO</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    {post.status === 'draft' && (
                      <button style={{ ...css.btnSm('rgba(62,207,142,0.1)', '#3ecf8e'), border: '1px solid rgba(62,207,142,0.2)', padding: '5px 10px' }} onClick={() => publicarRascunho(post.id)}>Pub</button>
                    )}
                    <a href={`/admin-fskate/editar/${post.id}`}
                      style={{ ...css.btnSm('#14161b', '#4f7ef8'), border: '1px solid #1c1f26', padding: '5px 10px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>✏️</a>
                    <button style={{ ...css.btnSm('rgba(239,68,68,0.08)', '#ef4444'), border: '1px solid rgba(239,68,68,0.15)', padding: '5px 10px' }} onClick={() => apagarPost(post.id)}>🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ── TORNEIO ── */}
        {tab === 'torneio' && <TorneioForm showToast={showToast} goHome={() => { setTab('home'); loadStats() }} />}
      </div>

      {/* Bottom nav */}
      <nav style={css.nav}>
        {TABS.map(t => (
          <button key={t.id} style={css.navBtn(tab === t.id)}
            onClick={() => { setTab(t.id as Tab); if (t.id === 'posts') loadPosts(); if (t.id === 'rascunhos') loadStats() }}>
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 500 }}>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

function TorneioForm({ showToast, goHome }: { showToast: (m: string) => void, goHome: () => void }) {
  const [nome, setNome] = useState('')
  const [modelo, setModelo] = useState('liga')
  const [desc, setDesc] = useState('')
  const [taxa, setTaxa] = useState('20')
  const [premio, setPremio] = useState('50')
  const [pix, setPix] = useState('')
  const [inicio, setInicio] = useState('')
  const [fim, setFim] = useState('')
  const [regras, setRegras] = useState('')
  const [loading, setLoading] = useState(false)

  const inp: any = { width: '100%', background: '#14161b', border: '1px solid #1c1f26', borderRadius: 10, padding: '11px 14px', color: '#e8eaf0', fontSize: 14, fontFamily: "'Inter',sans-serif", outline: 'none', boxSizing: 'border-box', marginBottom: 12 }
  const lbl: any = { fontSize: 11, color: '#4b5060', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 6, display: 'block' }

  async function criar() {
    if (!nome.trim()) { showToast('⚠️ Nome obrigatório'); return }
    if (!pix.trim()) { showToast('⚠️ Chave Pix obrigatória'); return }
    setLoading(true)
    const sl = nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-') + '-' + Date.now()
    const { data: t, error } = await supabase.from('tournaments').insert({
      name: nome, slug: sl, model: modelo, status: 'open',
      description: desc || null, entry_fee: parseFloat(taxa) || 0,
      prize: parseFloat(premio) || 0, pix_key: pix,
      start_date: inicio || null, end_date: fim || null, rules: regras || null,
    }).select().single()
    if (error) { showToast('❌ ' + error.message); setLoading(false); return }
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', 'eventos').single()
    await supabase.from('posts').insert({
      title: `🏆 ${nome} — Inscrições abertas!`,
      slug: 'torneio-' + sl,
      summary: `Novo torneio ${nome}! Inscrição R$${taxa}, prêmio R$${premio}.`,
      content: `Inscreva-se em ${nome}!\n\nInscrição: R$${taxa}\nPrêmio: R$${premio}\nChave Pix: ${pix}${inicio ? `\nInício: ${inicio}` : ''}\n\nGrupo WhatsApp: https://chat.whatsapp.com/LWhqROJ5fyf3WTOFjMPXGp`,
      category_id: cat?.id || null, tags: ['efootball', 'torneio'],
      status: 'published', source_type: 'manual', auto_published: false,
      published_at: new Date().toISOString(),
    })
    setLoading(false)
    showToast('🏆 Torneio criado!')
    setTimeout(goHome, 1500)
  }

  const MODELOS = [
    { v: 'liga', l: '🏆 Liga (Brasileirão)' },
    { v: 'copa', l: '🥊 Copa (Eliminatória)' },
    { v: 'grupos_mata_mata', l: '⚡ Grupos + Mata-mata' },
    { v: 'livre', l: '🎮 Livre' },
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
        <button onClick={goHome} style={{ background: 'none', border: 'none', color: '#4b5060', cursor: 'pointer', fontSize: 20 }}>←</button>
        <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 17 }}>🏆 Criar Torneio</span>
      </div>
      <div style={{ background: '#0e1014', border: '1px solid #1c1f26', borderRadius: 14, padding: 18 }}>
        <label style={lbl}>Nome *</label>
        <input style={inp} placeholder="Ex: Liga eFootball Diário 2026" value={nome} onChange={e => setNome(e.target.value)} />

        <label style={lbl}>Formato</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {MODELOS.map(m => (
            <button key={m.v} onClick={() => setModelo(m.v)}
              style={{ padding: '7px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 500, background: modelo === m.v ? 'rgba(232,184,75,0.15)' : '#14161b', color: modelo === m.v ? '#e8b84b' : '#4b5060', outline: modelo === m.v ? '1px solid rgba(232,184,75,0.3)' : '1px solid #1c1f26' }}>
              {m.l}
            </button>
          ))}
        </div>

        <label style={lbl}>Descrição</label>
        <textarea style={{ ...inp, minHeight: 72, resize: 'vertical' }} placeholder="Descreva o torneio..." value={desc} onChange={e => setDesc(e.target.value)} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div><label style={lbl}>Inscrição (R$)</label><input style={inp} type="number" value={taxa} onChange={e => setTaxa(e.target.value)} /></div>
          <div><label style={lbl}>Prêmio (R$)</label><input style={inp} type="number" value={premio} onChange={e => setPremio(e.target.value)} /></div>
        </div>

        <label style={lbl}>Chave Pix *</label>
        <input style={inp} placeholder="CPF, e-mail ou telefone" value={pix} onChange={e => setPix(e.target.value)} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div><label style={lbl}>Data início</label><input style={inp} type="date" value={inicio} onChange={e => setInicio(e.target.value)} /></div>
          <div><label style={lbl}>Data fim</label><input style={inp} type="date" value={fim} onChange={e => setFim(e.target.value)} /></div>
        </div>

        <label style={lbl}>Regras</label>
        <textarea style={{ ...inp, minHeight: 72, resize: 'vertical' }} placeholder="Regras do torneio..." value={regras} onChange={e => setRegras(e.target.value)} />

        <button style={{ background: '#e8b84b', color: '#000', border: 'none', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', width: '100%', fontFamily: "'Inter',sans-serif", opacity: loading ? 0.6 : 1 }} onClick={criar} disabled={loading}>
          {loading ? 'Criando...' : '🏆 Criar e publicar torneio'}
        </button>
      </div>
    </div>
  )
}
