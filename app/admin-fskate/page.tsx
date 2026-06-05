'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const CATS = [
  { slug: 'noticias', name: 'Notícias' },
  { slug: 'eventos', name: 'Eventos' },
  { slug: 'atualizacoes', name: 'Atualizações' },
  { slug: 'campanhas', name: 'Campanhas' },
  { slug: 'guias', name: 'Guias' },
  { slug: 'vazamentos-rumores', name: 'Vazamentos' },
  { slug: 'analises', name: 'Análises' },
]

function gerarSlug(titulo: string) {
  return titulo.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim()
    .replace(/\s+/g, '-').substring(0, 80) + '-' + Date.now()
}

export default function AdminFskate() {
  const [tab, setTab] = useState<'home' | 'novo-post' | 'rascunhos' | 'posts' | 'torneio'>('home')
  const [posts, setPosts] = useState<any[]>([])
  const [drafts, setDrafts] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, drafts: 0, hoje: 0 })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  // Form novo post
  const [titulo, setTitulo] = useState('')
  const [resumo, setResumo] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [imagem, setImagem] = useState('')
  const [categoria, setCategoria] = useState('noticias')
  const [fonte, setFonte] = useState('')
  const [status, setStatus] = useState<'published' | 'draft'>('published')

  useEffect(() => { carregarDados() }, [])

  async function carregarDados() {
    const { count: total } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'published')
    const { count: draftsCount } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'draft')
    const hoje = new Date().toISOString().split('T')[0]
    const { count: hojeCount } = await supabase.from('posts').select('*', { count: 'exact', head: true }).gte('published_at', hoje)
    setStats({ total: total || 0, drafts: draftsCount || 0, hoje: hojeCount || 0 })

    const { data: d } = await supabase.from('posts').select('id, title, status, published_at, categories(name, color)').eq('status', 'draft').order('created_at', { ascending: false }).limit(20)
    setDrafts(d || [])
  }

  async function carregarPosts() {
    const { data } = await supabase.from('posts').select('id, title, status, published_at, auto_published, categories(name, color)').order('created_at', { ascending: false }).limit(30)
    setPosts(data || [])
  }

  async function publicarPost() {
    if (!titulo.trim()) { setMsg('⚠️ Título obrigatório'); return }
    setLoading(true)
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', categoria).single()
    const { error } = await supabase.from('posts').insert({
      title: titulo, slug: gerarSlug(titulo),
      summary: resumo || null, content: conteudo || null,
      cover_image: imagem || null, category_id: cat?.id || null,
      source_url: fonte || null, tags: ['efootball'],
      status, source_type: 'manual', auto_published: false,
      published_at: status === 'published' ? new Date().toISOString() : null
    })
    setLoading(false)
    if (error) { setMsg('❌ Erro: ' + error.message); return }
    setMsg(status === 'published' ? '✅ Publicado!' : '✅ Salvo como rascunho!')
    setTitulo(''); setResumo(''); setConteudo(''); setImagem(''); setFonte('')
    setTimeout(() => { setMsg(''); setTab('home'); carregarDados() }, 1500)
  }

  async function publicarRascunho(id: string) {
    await supabase.from('posts').update({ status: 'published', published_at: new Date().toISOString() }).eq('id', id)
    setMsg('✅ Publicado!')
    setTimeout(() => { setMsg(''); carregarDados() }, 1200)
  }

  async function apagarPost(id: string) {
    if (!confirm('Apagar este post?')) return
    await supabase.from('posts').delete().eq('id', id)
    setMsg('🗑️ Apagado')
    setTimeout(() => { setMsg(''); carregarDados(); carregarPosts() }, 1000)
  }

  const s: Record<string, any> = {
    page: { minHeight: '100vh', background: '#08090c', color: '#e8eaf0', fontFamily: "'Inter', sans-serif", paddingBottom: 80 },
    header: { background: '#0e1014', borderBottom: '1px solid #1c1f26', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky' as const, top: 0, zIndex: 50 },
    logo: { display: 'flex', alignItems: 'center', gap: 8 },
    logoIcon: { width: 30, height: 30, background: '#4f7ef8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 },
    logoText: { fontWeight: 700, fontSize: 15, color: '#fff' },
    logoSub: { fontSize: 10, color: '#4b5060', letterSpacing: '1px' },
    content: { padding: '16px' },
    stat: { background: '#0e1014', border: '1px solid #1c1f26', borderRadius: 12, padding: '14px', textAlign: 'center' as const },
    statNum: { fontSize: 28, fontWeight: 700 },
    statLbl: { fontSize: 11, color: '#4b5060', marginTop: 2 },
    btn: { background: '#4f7ef8', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', width: '100%', marginBottom: 10, fontFamily: "'Inter', sans-serif" },
    btnGold: { background: '#e8b84b', color: '#000', border: 'none', borderRadius: 10, padding: '12px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', width: '100%', marginBottom: 10, fontFamily: "'Inter', sans-serif" },
    btnGray: { background: '#14161b', color: '#8b909e', border: '1px solid #1c1f26', borderRadius: 10, padding: '12px 20px', fontSize: 14, fontWeight: 500, cursor: 'pointer', width: '100%', marginBottom: 10, fontFamily: "'Inter', sans-serif" },
    btnSmall: { background: '#14161b', border: '1px solid #1c1f26', color: '#8b909e', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontFamily: "'Inter', sans-serif" },
    btnPub: { background: 'rgba(62,207,142,0.1)', border: '1px solid rgba(62,207,142,0.3)', color: '#3ecf8e', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontFamily: "'Inter', sans-serif" },
    btnDel: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontFamily: "'Inter', sans-serif" },
    input: { width: '100%', background: '#0e1014', border: '1px solid #1c1f26', borderRadius: 10, padding: '12px', color: '#e8eaf0', fontSize: 14, fontFamily: "'Inter', sans-serif", marginBottom: 10, outline: 'none', boxSizing: 'border-box' as const },
    textarea: { width: '100%', background: '#0e1014', border: '1px solid #1c1f26', borderRadius: 10, padding: '12px', color: '#e8eaf0', fontSize: 14, fontFamily: "'Inter', sans-serif", marginBottom: 10, outline: 'none', resize: 'vertical' as const, minHeight: 90, boxSizing: 'border-box' as const },
    select: { width: '100%', background: '#0e1014', border: '1px solid #1c1f26', borderRadius: 10, padding: '12px', color: '#e8eaf0', fontSize: 14, fontFamily: "'Inter', sans-serif", marginBottom: 10, outline: 'none', boxSizing: 'border-box' as const },
    label: { fontSize: 12, color: '#4b5060', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' as const, marginBottom: 5, display: 'block' },
    card: { background: '#0e1014', border: '1px solid #1c1f26', borderRadius: 12, padding: '14px', marginBottom: 10 },
    sec: { fontSize: 13, fontWeight: 600, color: '#8b909e', marginBottom: 12, textTransform: 'uppercase' as const, letterSpacing: '1px' },
    nav: { position: 'fixed' as const, bottom: 0, left: 0, right: 0, background: '#0e1014', borderTop: '1px solid #1c1f26', display: 'flex', justifyContent: 'space-around', padding: '8px 0', zIndex: 100 },
    navBtn: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 10px', borderRadius: 8, fontFamily: "'Inter', sans-serif" },
    navIcon: { fontSize: 20 },
    navLbl: { fontSize: 10, fontWeight: 500 },
    msgBox: { position: 'fixed' as const, top: 70, left: 16, right: 16, background: '#0e1014', border: '1px solid #3ecf8e', borderRadius: 10, padding: '12px 16px', fontSize: 14, color: '#3ecf8e', zIndex: 200, textAlign: 'center' as const },
  }

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.logo}>
          <div style={s.logoIcon}>⚽</div>
          <div>
            <div style={s.logoText}>eFootball Diário</div>
            <div style={s.logoSub}>PAINEL ADMIN</div>
          </div>
        </div>
        <a href="/" style={{ fontSize: 12, color: '#4b5060', textDecoration: 'none' }}>Ver site →</a>
      </div>

      {/* Toast */}
      {msg && <div style={s.msgBox}>{msg}</div>}

      <div style={s.content}>

        {/* HOME */}
        {tab === 'home' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
              <div style={s.stat}><div style={{ ...s.statNum, color: '#4f7ef8' }}>{stats.total}</div><div style={s.statLbl}>Publicados</div></div>
              <div style={s.stat}><div style={{ ...s.statNum, color: '#e8b84b' }}>{stats.drafts}</div><div style={s.statLbl}>Rascunhos</div></div>
              <div style={s.stat}><div style={{ ...s.statNum, color: '#3ecf8e' }}>{stats.hoje}</div><div style={s.statLbl}>Hoje</div></div>
            </div>

            <button style={s.btn} onClick={() => setTab('novo-post')}>✏️ Novo Post</button>
            {stats.drafts > 0 && (
              <button style={{ ...s.btnGold }} onClick={() => setTab('rascunhos')}>
                📋 Aprovar Rascunhos ({stats.drafts})
              </button>
            )}
            <button style={s.btnGray} onClick={() => { setTab('posts'); carregarPosts() }}>📰 Ver todos os posts</button>
            <button style={s.btnGray} onClick={() => setTab('torneio')}>🏆 Criar Torneio</button>

            <div style={{ marginTop: 20 }}>
              <div style={s.sec}>Acesso rápido</div>
              <a href="/torneios" style={{ textDecoration: 'none' }}>
                <div style={{ ...s.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, color: '#e8eaf0' }}>🏆 Página de Torneios</span>
                  <span style={{ color: '#4b5060', fontSize: 13 }}>→</span>
                </div>
              </a>
            </div>
          </>
        )}

        {/* NOVO POST */}
        {tab === 'novo-post' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <button onClick={() => setTab('home')} style={{ background: 'none', border: 'none', color: '#4b5060', fontSize: 18, cursor: 'pointer', padding: 0 }}>←</button>
              <span style={{ fontWeight: 700, fontSize: 17, color: '#fff' }}>Novo Post</span>
            </div>

            <label style={s.label}>Título *</label>
            <input style={s.input} placeholder="Título da notícia..." value={titulo} onChange={e => setTitulo(e.target.value)} />

            <label style={s.label}>Categoria</label>
            <select style={s.select} value={categoria} onChange={e => setCategoria(e.target.value)}>
              {CATS.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>

            <label style={s.label}>Resumo</label>
            <textarea style={s.textarea} placeholder="Resumo curto..." value={resumo} onChange={e => setResumo(e.target.value)} rows={3} />

            <label style={s.label}>Conteúdo</label>
            <textarea style={s.textarea} placeholder="Texto completo..." value={conteudo} onChange={e => setConteudo(e.target.value)} rows={5} />

            <label style={s.label}>URL da Imagem</label>
            <input style={s.input} placeholder="https://..." value={imagem} onChange={e => setImagem(e.target.value)} />

            <label style={s.label}>Fonte (link)</label>
            <input style={s.input} placeholder="https://..." value={fonte} onChange={e => setFonte(e.target.value)} />

            <label style={s.label}>Status</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button onClick={() => setStatus('published')} style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13, background: status === 'published' ? '#3ecf8e' : '#14161b', color: status === 'published' ? '#000' : '#8b909e' }}>
                ✅ Publicar agora
              </button>
              <button onClick={() => setStatus('draft')} style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13, background: status === 'draft' ? '#e8b84b' : '#14161b', color: status === 'draft' ? '#000' : '#8b909e' }}>
                📋 Rascunho
              </button>
            </div>

            <button style={{ ...s.btn, opacity: loading ? 0.6 : 1 }} onClick={publicarPost} disabled={loading}>
              {loading ? 'Salvando...' : status === 'published' ? '🚀 Publicar' : '💾 Salvar rascunho'}
            </button>
          </>
        )}

        {/* RASCUNHOS */}
        {tab === 'rascunhos' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <button onClick={() => setTab('home')} style={{ background: 'none', border: 'none', color: '#4b5060', fontSize: 18, cursor: 'pointer', padding: 0 }}>←</button>
              <span style={{ fontWeight: 700, fontSize: 17, color: '#fff' }}>Rascunhos ({drafts.length})</span>
            </div>
            {drafts.length === 0 && <p style={{ color: '#4b5060', textAlign: 'center', padding: '2rem' }}>Nenhum rascunho pendente</p>}
            {drafts.map(post => (
              <div key={post.id} style={s.card}>
                {post.categories && (
                  <span style={{ fontSize: 10, fontWeight: 700, background: post.categories.color + '22', color: post.categories.color, padding: '2px 8px', borderRadius: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {post.categories.name}
                  </span>
                )}
                <p style={{ fontSize: 14, fontWeight: 500, color: '#e8eaf0', margin: '8px 0 12px', lineHeight: 1.4 }}>{post.title}</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={s.btnPub} onClick={() => publicarRascunho(post.id)}>✅ Publicar</button>
                  <button style={s.btnDel} onClick={() => apagarPost(post.id)}>🗑️ Apagar</button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* TODOS OS POSTS */}
        {tab === 'posts' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <button onClick={() => setTab('home')} style={{ background: 'none', border: 'none', color: '#4b5060', fontSize: 18, cursor: 'pointer', padding: 0 }}>←</button>
              <span style={{ fontWeight: 700, fontSize: 17, color: '#fff' }}>Todos os posts</span>
            </div>
            {posts.map(post => (
              <div key={post.id} style={s.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    {post.categories && (
                      <span style={{ fontSize: 10, fontWeight: 700, background: post.categories.color + '22', color: post.categories.color, padding: '2px 7px', borderRadius: 4, textTransform: 'uppercase' }}>
                        {post.categories.name}
                      </span>
                    )}
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#e8eaf0', margin: '6px 0 0', lineHeight: 1.35 }}>{post.title}</p>
                  </div>
                  {post.auto_published && <span style={{ fontSize: 10, color: '#3ecf8e', fontWeight: 700, marginLeft: 8 }}>AUTO</span>}
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#4b5060', flex: 1 }}>
                    {post.status === 'published' ? '✅ Publicado' : '📋 Rascunho'}
                  </span>
                  {post.status === 'draft' && <button style={s.btnPub} onClick={() => publicarRascunho(post.id)}>Publicar</button>}
                  <button style={s.btnDel} onClick={() => apagarPost(post.id)}>🗑️</button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* CRIAR TORNEIO */}
        {tab === 'torneio' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <button onClick={() => setTab('home')} style={{ background: 'none', border: 'none', color: '#4b5060', fontSize: 18, cursor: 'pointer', padding: 0 }}>←</button>
              <span style={{ fontWeight: 700, fontSize: 17, color: '#fff' }}>Criar Torneio</span>
            </div>
            <TorneioForm setMsg={setMsg} voltarHome={() => { setTab('home'); carregarDados() }} />
          </>
        )}
      </div>

      {/* Bottom nav */}
      <nav style={s.nav}>
        {[
          { id: 'home', icon: '🏠', label: 'Início' },
          { id: 'novo-post', icon: '✏️', label: 'Novo Post' },
          { id: 'rascunhos', icon: '📋', label: 'Rascunhos' },
          { id: 'torneio', icon: '🏆', label: 'Torneio' },
        ].map(n => (
          <button key={n.id} style={{ ...s.navBtn, color: tab === n.id ? '#4f7ef8' : '#4b5060' }}
            onClick={() => { setTab(n.id as any); if (n.id === 'rascunhos') carregarDados(); if (n.id === 'posts') { setTab('posts'); carregarPosts() } }}>
            <span style={s.navIcon}>{n.icon}</span>
            <span style={s.navLbl}>{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

function TorneioForm({ setMsg, voltarHome }: { setMsg: (m: string) => void, voltarHome: () => void }) {
  const [nome, setNome] = useState('')
  const [modelo, setModelo] = useState('liga')
  const [descricao, setDescricao] = useState('')
  const [taxa, setTaxa] = useState('20')
  const [premio, setPremio] = useState('50')
  const [pix, setPix] = useState('')
  const [inicio, setInicio] = useState('')
  const [fim, setFim] = useState('')
  const [regras, setRegras] = useState('')
  const [whatsapp, setWhatsapp] = useState('https://chat.whatsapp.com/LWhqROJ5fyf3WTOFjMPXGp')
  const [loading, setLoading] = useState(false)

  const s: Record<string, any> = {
    input: { width: '100%', background: '#0e1014', border: '1px solid #1c1f26', borderRadius: 10, padding: '12px', color: '#e8eaf0', fontSize: 14, fontFamily: "'Inter', sans-serif", marginBottom: 10, outline: 'none', boxSizing: 'border-box' as const },
    textarea: { width: '100%', background: '#0e1014', border: '1px solid #1c1f26', borderRadius: 10, padding: '12px', color: '#e8eaf0', fontSize: 14, fontFamily: "'Inter', sans-serif", marginBottom: 10, outline: 'none', resize: 'vertical' as const, minHeight: 80, boxSizing: 'border-box' as const },
    select: { width: '100%', background: '#0e1014', border: '1px solid #1c1f26', borderRadius: 10, padding: '12px', color: '#e8eaf0', fontSize: 14, fontFamily: "'Inter', sans-serif", marginBottom: 10, outline: 'none', boxSizing: 'border-box' as const },
    label: { fontSize: 12, color: '#4b5060', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' as const, marginBottom: 5, display: 'block' },
    btn: { background: '#e8b84b', color: '#000', border: 'none', borderRadius: 10, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer', width: '100%', fontFamily: "'Inter', sans-serif" },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  }

  async function criarTorneio() {
    if (!nome.trim()) { setMsg('⚠️ Nome obrigatório'); return }
    if (!pix.trim()) { setMsg('⚠️ Chave Pix obrigatória'); return }
    setLoading(true)

    const slug = nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-') + '-' + Date.now()

    const { data: torneio, error } = await supabase.from('tournaments').insert({
      name: nome, slug, model: modelo, status: 'open',
      description: descricao || null,
      entry_fee: parseFloat(taxa) || 0,
      prize: parseFloat(premio) || 0,
      pix_key: pix,
      start_date: inicio || null,
      end_date: fim || null,
      rules: regras || null,
    }).select().single()

    if (error) { setMsg('❌ Erro: ' + error.message); setLoading(false); return }

    // Criar post de evento automaticamente
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', 'eventos').single()
    const linkWhatsApp = whatsapp ? `\n\n📲 Entre no grupo: ${whatsapp}` : ''
    await supabase.from('posts').insert({
      title: `🏆 ${nome} — Inscrições abertas!`,
      slug: 'torneio-' + slug,
      summary: `${descricao || `Novo torneio ${nome} com inscrição de R$${taxa} e prêmio de R$${premio}!`}`,
      content: `Inscreva-se no torneio ${nome}!\n\nInscrição: R$${taxa}\nPrêmio: R$${premio}\nChave Pix: ${pix}${inicio ? `\nInício: ${inicio}` : ''}${linkWhatsApp}\n\nAcesse a página do torneio para se inscrever!`,
      category_id: cat?.id || null,
      tags: ['efootball', 'torneio'],
      status: 'published',
      source_type: 'manual',
      auto_published: false,
      published_at: new Date().toISOString(),
    })

    setLoading(false)
    setMsg('🏆 Torneio criado e publicado!')
    setTimeout(() => { setMsg(''); voltarHome() }, 2000)
  }

  return (
    <>
      <label style={s.label}>Nome do Torneio *</label>
      <input style={s.input} placeholder="Ex: Liga eFootball Diário 2026" value={nome} onChange={e => setNome(e.target.value)} />

      <label style={s.label}>Formato</label>
      <select style={s.select} value={modelo} onChange={e => setModelo(e.target.value)}>
        <option value="liga">🏆 Liga (Brasileirão)</option>
        <option value="copa">🥊 Copa (Eliminatória)</option>
        <option value="grupos_mata_mata">⚡ Grupos + Mata-mata</option>
        <option value="livre">🎮 Livre</option>
      </select>

      <label style={s.label}>Descrição</label>
      <textarea style={s.textarea} placeholder="Descreva o torneio..." value={descricao} onChange={e => setDescricao(e.target.value)} />

      <div style={s.row}>
        <div>
          <label style={s.label}>Inscrição (R$)</label>
          <input style={s.input} type="number" value={taxa} onChange={e => setTaxa(e.target.value)} />
        </div>
        <div>
          <label style={s.label}>Prêmio (R$)</label>
          <input style={s.input} type="number" value={premio} onChange={e => setPremio(e.target.value)} />
        </div>
      </div>

      <label style={s.label}>Chave Pix *</label>
      <input style={s.input} placeholder="CPF, e-mail ou telefone" value={pix} onChange={e => setPix(e.target.value)} />

      <div style={s.row}>
        <div>
          <label style={s.label}>Data início</label>
          <input style={s.input} type="date" value={inicio} onChange={e => setInicio(e.target.value)} />
        </div>
        <div>
          <label style={s.label}>Data fim</label>
          <input style={s.input} type="date" value={fim} onChange={e => setFim(e.target.value)} />
        </div>
      </div>

      <label style={s.label}>Regras</label>
      <textarea style={s.textarea} placeholder="Regras do torneio..." value={regras} onChange={e => setRegras(e.target.value)} />

      <label style={s.label}>Link do grupo WhatsApp</label>
      <input style={s.input} value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />

      <button style={{ ...s.btn, opacity: loading ? 0.6 : 1 }} onClick={criarTorneio} disabled={loading}>
        {loading ? 'Criando...' : '🏆 Criar e publicar torneio'}
      </button>
    </>
  )
}
