'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

// ─── estilos globais inline ─────────────────────────────────────────────────
const G = {
  green: '#00e56e', bg: '#060a0f', surface: '#0d1520', surface2: '#131e2e',
  border: 'rgba(255,255,255,0.07)', borderActive: 'rgba(0,229,110,0.4)',
  text: '#f0f4f8', muted: '#5a7190', blue: '#0ea5e9', gold: '#e8b84b', red: '#f87171'
}

const CATS = [
  { slug: 'noticias', name: 'Notícias', color: G.muted },
  { slug: 'eventos', name: 'Eventos', color: '#10b981' },
  { slug: 'atualizacoes', name: 'Atualizações', color: G.blue },
  { slug: 'campanhas', name: 'Campanhas', color: G.gold },
  { slug: 'guias', name: 'Guias', color: '#8b5cf6' },
  { slug: 'vazamentos-rumores', name: 'Vazamentos', color: G.red },
  { slug: 'analises', name: 'Análises', color: '#ec4899' },
]

type Tab = 'home' | 'post' | 'youtube' | 'rascunhos' | 'posts' | 'torneio' | 'torneios' | 'coop'

function slugify(t: string) {
  return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').substring(0, 80) + '-' + Date.now()
}

const S: any = {
  page: { minHeight: '100vh', background: G.bg, color: G.text, fontFamily: "'Barlow', 'Inter', sans-serif", paddingBottom: 72 },
  header: { background: G.surface, borderBottom: `1px solid ${G.border}`, padding: '0 1.25rem', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky' as const, top: 0, zIndex: 50 },
  main: { maxWidth: 860, margin: '0 auto', padding: '1.25rem 1rem' },
  card: { background: G.surface, border: `1px solid ${G.border}`, borderRadius: 14, overflow: 'hidden', marginBottom: '1rem' },
  cardHead: { padding: '12px 18px', borderBottom: `1px solid ${G.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardBody: { padding: '18px' },
  inp: { width: '100%', background: G.surface2, border: `1px solid ${G.border}`, borderRadius: 10, padding: '11px 14px', color: G.text, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' as const, marginBottom: 10, transition: 'border-color 0.2s' },
  lbl: { fontSize: 11, color: G.muted, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase' as const, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 },
  lblDot: { width: 5, height: 5, background: G.green, borderRadius: '50%', display: 'inline-block', flexShrink: 0 },
  btnGreen: { background: G.green, color: '#030f06', border: 'none', borderRadius: 10, padding: '12px 20px', fontSize: 13, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' as const, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' },
  btnSm: (c = G.muted, bg = G.surface2) => ({ background: bg, color: c, border: `1px solid ${G.border}`, borderRadius: 8, padding: '6px 12px', fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' as const, cursor: 'pointer', fontFamily: 'inherit' }),
  nav: { position: 'fixed' as const, bottom: 0, left: 0, right: 0, background: G.surface, borderTop: `1px solid ${G.border}`, display: 'flex', zIndex: 100 },
  navBtn: (active: boolean) => ({ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', padding: '10px 4px', color: active ? G.green : G.muted, fontFamily: 'inherit', borderTop: `2px solid ${active ? G.green : 'transparent'}`, transition: 'color 0.15s' }),
  toast: { position: 'fixed' as const, top: 70, left: '50%', transform: 'translateX(-50%)', background: G.surface, border: `1px solid ${G.green}`, borderRadius: 10, padding: '10px 22px', fontSize: 13, color: G.green, zIndex: 300, whiteSpace: 'nowrap' as const, boxShadow: '0 8px 32px rgba(0,229,110,0.15)' },
  stat: { background: G.surface, border: `1px solid ${G.border}`, borderRadius: 12, padding: '16px', textAlign: 'center' as const },
  statNum: { fontFamily: "'Barlow Condensed', 'Syne', sans-serif", fontWeight: 900, fontSize: 32, lineHeight: 1 },
  statLbl: { fontSize: 10, color: G.muted, marginTop: 4, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' as const },
  sectionTitle: { fontFamily: "'Barlow Condensed', 'Syne', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase' as const, color: G.muted },
}

export default function Admin() {
  const [tab, setTab] = useState<Tab>('home')
  const [stats, setStats] = useState({ pub: 0, draft: 0, hoje: 0, torneios: 0 })
  const [drafts, setDrafts] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [torneios, setTorneios] = useState<any[]>([])
  const [toast, setToast] = useState('')
  const [loading, setLoading] = useState(false)

  // Post form
  const [titulo, setTitulo] = useState('')
  const [resumo, setResumo] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [imagem, setImagem] = useState('')
  const [fonte, setFonte] = useState('')
  const [categoria, setCategoria] = useState('noticias')
  const [postStatus, setPostStatus] = useState<'published' | 'draft'>('published')

  // YouTube form
  const [ytUrl, setYtUrl] = useState('')
  const [ytCat, setYtCat] = useState('noticias')
  const [ytStatus, setYtStatus] = useState<'published' | 'draft'>('published')
  const [ytLoading, setYtLoading] = useState(false)
  const [ytResult, setYtResult] = useState<any>(null)

  // Torneio edit
  const [editTorneio, setEditTorneio] = useState<any>(null)

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2800) }

  useEffect(() => { loadStats() }, [])

  async function loadStats() {
    const [{ count: pub }, { count: draft }, { count: hoje }, { count: torn }] = await Promise.all([
      supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
      supabase.from('posts').select('*', { count: 'exact', head: true }).gte('published_at', new Date().toISOString().split('T')[0]),
      supabase.from('tournaments').select('*', { count: 'exact', head: true }),
    ])
    setStats({ pub: pub || 0, draft: draft || 0, hoje: hoje || 0, torneios: torn || 0 })
    const { data } = await supabase.from('posts').select('id,title,categories(name,color)').eq('status', 'draft').order('created_at', { ascending: false }).limit(20)
    setDrafts(data || [])
  }

  async function loadPosts() {
    const { data } = await supabase.from('posts').select('id,title,status,auto_published,source_type,published_at,categories(name,color)').order('created_at', { ascending: false }).limit(40)
    setPosts(data || [])
  }

  async function loadTorneios() {
    const { data } = await supabase.from('tournaments').select('id,name,status,model,entry_fee,prize,is_user_created,creation_payment_status').order('created_at', { ascending: false })
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
    loadStats(); setTab('home')
  }

  async function publicarYoutube() {
    if (!ytUrl.trim()) { showToast('⚠️ Cole um link do YouTube'); return }
    setYtLoading(true); setYtResult(null)
    try {
      const res = await fetch('/api/youtube-publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeUrl: ytUrl, categoria: ytCat, status: ytStatus })
      })
      const data = await res.json()
      if (data.error) { showToast('❌ ' + data.error); setYtLoading(false); return }
      setYtResult(data)
      showToast(ytStatus === 'published' ? '✅ Notícia publicada!' : '📋 Rascunho salvo!')
      loadStats()
    } catch (e: any) { showToast('❌ ' + e.message) }
    setYtLoading(false)
  }

  async function publicarRascunho(id: string) {
    await supabase.from('posts').update({ status: 'published', published_at: new Date().toISOString() }).eq('id', id)
    showToast('✅ Publicado!'); loadStats()
    setDrafts(d => d.filter(p => p.id !== id))
    setPosts(p => p.map(x => x.id === id ? { ...x, status: 'published' } : x))
  }

  async function apagarPost(id: string) {
    if (!confirm('Apagar este post?')) return
    await supabase.from('posts').delete().eq('id', id)
    showToast('🗑️ Apagado'); loadStats()
    setPosts(p => p.filter(x => x.id !== id)); setDrafts(d => d.filter(x => x.id !== id))
  }

  async function apagarTorneio(id: string) {
    if (!confirm('Apagar este torneio?')) return
    await supabase.from('tournaments').delete().eq('id', id)
    showToast('🗑️ Torneio apagado'); loadTorneios()
  }

  async function salvarTorneio() {
    if (!editTorneio?.name?.trim()) { showToast('⚠️ Nome obrigatório'); return }
    const { error } = await supabase.from('tournaments').update({
      name: editTorneio.name, status: editTorneio.status, model: editTorneio.model,
      entry_fee: parseFloat(editTorneio.entry_fee) || 0, prize: parseFloat(editTorneio.prize) || 0,
      description: editTorneio.description || null, rules: editTorneio.rules || null,
    }).eq('id', editTorneio.id)
    if (error) { showToast('❌ ' + error.message); return }
    showToast('✅ Torneio salvo!'); setEditTorneio(null); loadTorneios()
  }

  const TABS = [
    { id: 'home', icon: '⊞', label: 'Início' },
    { id: 'post', icon: '✏️', label: 'Post' },
    { id: 'youtube', icon: '▶', label: 'YouTube' },
    { id: 'rascunhos', icon: '◻', label: 'Rascunhos' },
    { id: 'torneios', icon: '◈', label: 'Torneios' },
  ]

  return (
    <div style={S.page}>
      {/* Barlow Condensed */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;900&family=Barlow:wght@400;500&display=swap'); input:focus,textarea:focus{border-color:${G.borderActive}!important;box-shadow:0 0 0 3px rgba(0,229,110,0.1)!important;} button:hover{filter:brightness(1.1)}`}</style>

      {/* Header */}
      <header style={S.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 34, height: 34, background: G.green, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, color: '#030f06', fontWeight: 900 }}>e</div>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 16, color: G.text, letterSpacing: '0.5px', textTransform: 'uppercase', lineHeight: 1 }}>
              <span style={{ color: G.green }}>e</span>FOOTBALL <span style={{ color: G.gold }}>NEWS</span>
            </div>
            <div style={{ fontSize: 9, color: G.muted, letterSpacing: '2px', fontWeight: 700, textTransform: 'uppercase' }}>PAINEL ADMIN</div>
          </div>
        </div>
        <a href="/" style={{ fontSize: 11, color: G.muted, textDecoration: 'none', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>Ver site →</a>
      </header>

      {toast && <div style={S.toast}>{toast}</div>}

      <div style={S.main}>

        {/* ── HOME ── */}
        {tab === 'home' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: '1.25rem' }}>
              {[
                { l: 'Publicados', v: stats.pub, c: G.blue },
                { l: 'Rascunhos', v: stats.draft, c: G.gold },
                { l: 'Hoje', v: stats.hoje, c: G.green },
                { l: 'Torneios', v: stats.torneios, c: '#8b5cf6' },
              ].map(s => (
                <div key={s.l} style={S.stat}>
                  <div style={{ ...S.statNum, color: s.c }}>{s.v}</div>
                  <div style={S.statLbl}>{s.l}</div>
                </div>
              ))}
            </div>

            {/* Ações */}
            <div style={S.card}>
              <div style={S.cardHead}><span style={S.sectionTitle}>Ações rápidas</span></div>
              <div style={{ ...S.cardBody, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { icon: '✏️', label: 'Novo Post', sub: 'Escrever manualmente', tab: 'post', c: G.blue },
                  { icon: '▶', label: 'Via YouTube', sub: 'Radar IA — Ollama local', tab: 'youtube', c: G.red },
                  { icon: '◻', label: `Rascunhos (${stats.draft})`, sub: 'Aprovar do n8n', tab: 'rascunhos', c: '#8b5cf6' },
                  { icon: '◈', label: 'Torneios', sub: 'Gerenciar campeonatos', tab: 'torneios', c: G.gold },
                ].map(a => (
                  <button key={a.tab} onClick={() => { if (a.tab === 'youtube') { window.location.href = '/admin-fskate/youtube'; return } setTab(a.tab as Tab); if (a.tab === 'torneios') loadTorneios(); if (a.tab === 'rascunhos') loadStats() }}
                    style={{ background: G.surface2, border: `1px solid ${a.c}22`, borderRadius: 12, padding: '14px', textAlign: 'left' as const, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: 'border-color 0.2s' }}>
                    <div style={{ width: 36, height: 36, background: a.c + '18', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{a.icon}</div>
                    <div>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14, color: G.text, letterSpacing: '0.3px' }}>{a.label}</div>
                      <div style={{ fontSize: 11, color: G.muted, marginTop: 1 }}>{a.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Links */}
            <div style={S.card}>
              <div style={S.cardHead}><span style={S.sectionTitle}>Links rápidos</span></div>
              <div style={{ padding: '6px' }}>
                {[
                  { href: '/', l: '🌐 Portal público' },
                  { href: '/torneios', l: '🏆 Torneios' },
                  { href: '/coop', l: '🎮 Fila Co-op' },
                  { href: '/admin-fskate/coop', l: '⚙️ Gerenciar Co-op' },
                  { href: '/criar-torneio', l: '➕ Criar torneio (usuário)' },
                ].map(l => (
                  <a key={l.href} href={l.href}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8, textDecoration: 'none', color: G.muted, fontSize: 13 }}>
                    {l.l} <span style={{ color: G.border }}>→</span>
                  </a>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── NOVO POST ── */}
        {tab === 'post' && (
          <div style={S.card}>
            <div style={S.cardHead}>
              <span style={S.sectionTitle}>✏️ Novo Post</span>
              <button onClick={() => setTab('home')} style={{ background: 'none', border: 'none', color: G.muted, cursor: 'pointer', fontSize: 18 }}>←</button>
            </div>
            <div style={S.cardBody}>
              <div style={S.lbl}><span style={S.lblDot} />Título *</div>
              <input style={S.inp} placeholder="Título da notícia..." value={titulo} onChange={e => setTitulo(e.target.value)} />

              <div style={S.lbl}><span style={S.lblDot} />Categoria</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {CATS.map(c => (
                  <button key={c.slug} onClick={() => setCategoria(c.slug)}
                    style={{ padding: '5px 11px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' as const, background: categoria === c.slug ? c.color + '22' : G.surface2, color: categoria === c.slug ? c.color : G.muted, outline: categoria === c.slug ? `1px solid ${c.color}55` : `1px solid ${G.border}` }}>
                    {c.name}
                  </button>
                ))}
              </div>

              <div style={S.lbl}><span style={S.lblDot} />Resumo</div>
              <textarea style={{ ...S.inp, minHeight: 64, resize: 'vertical' as const }} placeholder="Resumo curto..." value={resumo} onChange={e => setResumo(e.target.value)} />

              <div style={S.lbl}><span style={S.lblDot} />Conteúdo</div>
              <textarea style={{ ...S.inp, minHeight: 130, resize: 'vertical' as const }} placeholder="Texto completo da notícia..." value={conteudo} onChange={e => setConteudo(e.target.value)} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><div style={S.lbl}><span style={S.lblDot} />URL da Imagem</div><input style={S.inp} placeholder="https://..." value={imagem} onChange={e => setImagem(e.target.value)} /></div>
                <div><div style={S.lbl}><span style={S.lblDot} />Link da Fonte</div><input style={S.inp} placeholder="https://..." value={fonte} onChange={e => setFonte(e.target.value)} /></div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {(['published', 'draft'] as const).map(s => (
                  <button key={s} onClick={() => setPostStatus(s)}
                    style={{ flex: 1, padding: '10px', borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 12, letterSpacing: '0.8px', textTransform: 'uppercase' as const, background: postStatus === s ? (s === 'published' ? G.green : G.gold) : G.surface2, color: postStatus === s ? '#030f06' : G.muted }}>
                    {s === 'published' ? '✅ Publicar' : '◻ Rascunho'}
                  </button>
                ))}
              </div>

              <button style={{ ...S.btnGreen, width: '100%', opacity: loading ? 0.5 : 1 }} onClick={publicarPost} disabled={loading}>
                {loading ? '...' : postStatus === 'published' ? '▶ Publicar agora' : '◻ Salvar rascunho'}
              </button>
            </div>
          </div>
        )}

        {/* ── YOUTUBE ── */}
        {tab === 'youtube' && (
          <div style={S.card}>
            <div style={S.cardHead}>
              <span style={S.sectionTitle}>▶ Publicar via YouTube</span>
              <button onClick={() => setTab('home')} style={{ background: 'none', border: 'none', color: G.muted, cursor: 'pointer', fontSize: 18 }}>←</button>
            </div>
            <div style={S.cardBody}>
              <div style={{ background: G.surface2, border: `1px solid ${G.border}`, borderRadius: 10, padding: '12px 14px', marginBottom: 14, fontSize: 13, color: G.muted, lineHeight: 1.6 }}>
                Cole o link de um vídeo do YouTube sobre eFootball. A IA vai transcrever o vídeo e criar uma notícia jornalística automaticamente.
              </div>

              <div style={S.lbl}><span style={S.lblDot} />Link do vídeo YouTube</div>
              <input style={S.inp} placeholder="https://www.youtube.com/watch?v=..." value={ytUrl}
                onChange={e => setYtUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && publicarYoutube()} />

              <div style={S.lbl}><span style={S.lblDot} />Categoria</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {CATS.map(c => (
                  <button key={c.slug} onClick={() => setYtCat(c.slug)}
                    style={{ padding: '5px 11px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' as const, background: ytCat === c.slug ? c.color + '22' : G.surface2, color: ytCat === c.slug ? c.color : G.muted, outline: ytCat === c.slug ? `1px solid ${c.color}55` : `1px solid ${G.border}` }}>
                    {c.name}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {(['published', 'draft'] as const).map(s => (
                  <button key={s} onClick={() => setYtStatus(s)}
                    style={{ flex: 1, padding: '10px', borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 12, letterSpacing: '0.8px', textTransform: 'uppercase' as const, background: ytStatus === s ? (s === 'published' ? G.green : G.gold) : G.surface2, color: ytStatus === s ? '#030f06' : G.muted }}>
                    {s === 'published' ? '✅ Publicar' : '◻ Rascunho'}
                  </button>
                ))}
              </div>

              <button style={{ ...S.btnGreen, width: '100%', opacity: ytLoading ? 0.5 : 1 }} onClick={publicarYoutube} disabled={ytLoading}>
                {ytLoading ? (
                  <><span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #030f06', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Transcrevendo...</>
                ) : '▶ Gerar e publicar notícia'}
              </button>

              {ytResult && (
                <div style={{ marginTop: 14, background: G.surface2, border: `1px solid ${G.borderActive}`, borderRadius: 10, padding: '14px' }}>
                  <div style={{ fontSize: 11, color: G.green, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6 }}>✅ Notícia criada</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: G.text, marginBottom: 4 }}>{ytResult.titulo}</div>
                  <div style={{ fontSize: 12, color: G.muted }}>{ytResult.resumo}</div>
                  <button onClick={() => { setYtUrl(''); setYtResult(null) }}
                    style={{ ...S.btnSm(G.muted, G.surface), marginTop: 10 }}>Novo vídeo</button>
                </div>
              )}
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          </div>
        )}

        {/* ── RASCUNHOS ── */}
        {tab === 'rascunhos' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
              <button onClick={() => setTab('home')} style={{ background: 'none', border: 'none', color: G.muted, cursor: 'pointer', fontSize: 18 }}>←</button>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 20, color: G.text, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rascunhos ({drafts.length})</span>
            </div>
            {drafts.length === 0 && (
              <div style={{ ...S.card, padding: '2.5rem', textAlign: 'center' as const, color: G.muted }}>Nenhum rascunho pendente</div>
            )}
            {drafts.map(post => (
              <div key={post.id} style={S.card}>
                <div style={{ padding: '14px 16px' }}>
                  {post.categories && <span style={{ fontSize: 10, fontWeight: 700, background: post.categories.color + '22', color: post.categories.color, padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{post.categories.name}</span>}
                  <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, color: G.text, margin: '8px 0 12px', lineHeight: 1.3 }}>{post.title}</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{ ...S.btnSm(G.green, 'rgba(0,229,110,0.08)'), border: `1px solid rgba(0,229,110,0.2)` }} onClick={() => publicarRascunho(post.id)}>✅ Publicar</button>
                    <a href={`/admin-fskate/editar/${post.id}`} style={{ ...S.btnSm(G.blue, 'rgba(14,165,233,0.08)'), border: `1px solid rgba(14,165,233,0.2)`, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>✏️ Editar</a>
                    <button style={{ ...S.btnSm(G.red, 'rgba(248,113,113,0.08)'), border: `1px solid rgba(248,113,113,0.15)` }} onClick={() => apagarPost(post.id)}>🗑️ Apagar</button>
                  </div>
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
                <button onClick={() => setTab('home')} style={{ background: 'none', border: 'none', color: G.muted, cursor: 'pointer', fontSize: 18 }}>←</button>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 20, color: G.text, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Torneios ({torneios.length})</span>
              </div>
              <button onClick={() => setTab('torneio')} style={{ ...S.btnGreen, padding: '8px 16px', fontSize: 12 }}>+ Novo</button>
            </div>

            {torneios.map(t => (
              <div key={t.id} style={{ ...S.card, marginBottom: 8 }}>
                <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, fontWeight: 700, color: G.text }}>{t.name}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.5px', background: t.status === 'open' ? 'rgba(0,229,110,0.1)' : 'rgba(90,113,144,0.15)', color: t.status === 'open' ? G.green : G.muted }}>
                        {t.status === 'open' ? 'Aberto' : t.status === 'draft' ? 'Pendente pgto' : t.status}
                      </span>
                      {t.is_user_created && <span style={{ fontSize: 10, color: G.gold, fontWeight: 700 }}>USER</span>}
                    </div>
                    <div style={{ fontSize: 12, color: G.muted }}>R${Number(t.entry_fee).toFixed(2)} · Prêmio R${Number(t.prize).toFixed(2)} · {t.model}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <a href={`/admin-fskate/torneios/${t.id}`} style={{ ...S.btnSm(G.green, 'rgba(0,229,110,0.08)'), border: `1px solid rgba(0,229,110,0.2)`, padding: '5px 10px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>⚙️</a>
                    <button style={{ ...S.btnSm(G.blue, 'rgba(14,165,233,0.08)'), border: `1px solid rgba(14,165,233,0.2)`, padding: '5px 10px' }} onClick={() => setEditTorneio(t)}>✏️</button>
                    <button style={{ ...S.btnSm(G.red, 'rgba(248,113,113,0.08)'), border: `1px solid rgba(248,113,113,0.15)`, padding: '5px 10px' }} onClick={() => apagarTorneio(t.id)}>🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ── EDITAR TORNEIO ── */}
        {tab === 'torneios' && editTorneio && (
          <div style={S.card}>
            <div style={S.cardHead}>
              <span style={S.sectionTitle}>✏️ Editar Torneio</span>
              <button onClick={() => setEditTorneio(null)} style={{ background: 'none', border: 'none', color: G.muted, cursor: 'pointer', fontSize: 18 }}>←</button>
            </div>
            <div style={S.cardBody}>
              <div style={S.lbl}><span style={S.lblDot} />Nome</div>
              <input style={S.inp} value={editTorneio.name} onChange={e => setEditTorneio({ ...editTorneio, name: e.target.value })} />

              <div style={S.lbl}><span style={S.lblDot} />Status</div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                {['open', 'in_progress', 'finished', 'draft', 'cancelled'].map(s => (
                  <button key={s} onClick={() => setEditTorneio({ ...editTorneio, status: s })}
                    style={{ padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' as const, background: editTorneio.status === s ? G.green + '22' : G.surface2, color: editTorneio.status === s ? G.green : G.muted, outline: editTorneio.status === s ? `1px solid ${G.borderActive}` : `1px solid ${G.border}` }}>
                    {s}
                  </button>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><div style={S.lbl}><span style={S.lblDot} />Inscrição (R$)</div><input style={S.inp} type="number" value={editTorneio.entry_fee} onChange={e => setEditTorneio({ ...editTorneio, entry_fee: e.target.value })} /></div>
                <div><div style={S.lbl}><span style={S.lblDot} />Prêmio (R$)</div><input style={S.inp} type="number" value={editTorneio.prize} onChange={e => setEditTorneio({ ...editTorneio, prize: e.target.value })} /></div>
              </div>

              <div style={S.lbl}><span style={S.lblDot} />Descrição</div>
              <textarea style={{ ...S.inp, minHeight: 64, resize: 'vertical' as const }} value={editTorneio.description || ''} onChange={e => setEditTorneio({ ...editTorneio, description: e.target.value })} />

              <div style={S.lbl}><span style={S.lblDot} />Regras</div>
              <textarea style={{ ...S.inp, minHeight: 64, resize: 'vertical' as const }} value={editTorneio.rules || ''} onChange={e => setEditTorneio({ ...editTorneio, rules: e.target.value })} />

              <button style={{ ...S.btnGreen, width: '100%' }} onClick={salvarTorneio}>💾 Salvar alterações</button>
            </div>
          </div>
        )}

        {/* ── NOVO TORNEIO ── */}
        {tab === 'torneio' && <TorneioForm showToast={showToast} goBack={() => { setTab('torneios'); loadTorneios() }} />}

      </div>

      {/* Bottom nav */}
      <nav style={S.nav}>
        {TABS.map(t => (
          <button key={t.id} style={S.navBtn(tab === t.id)}
            onClick={() => { setTab(t.id as Tab); if (t.id === 'rascunhos') loadStats(); if (t.id === 'torneios') loadTorneios() }}>
            <span style={{ fontSize: 17 }}>{t.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' as const }}>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

function TorneioForm({ showToast, goBack }: { showToast: (m: string) => void; goBack: () => void }) {
  const [nome, setNome] = useState('')
  const [modelo, setModelo] = useState('copa')
  const [desc, setDesc] = useState('')
  const [taxa, setTaxa] = useState('20')
  const [premio, setPremio] = useState('50')
  const [pix, setPix] = useState('')
  const [inicio, setInicio] = useState('')
  const [fim, setFim] = useState('')
  const [regras, setRegras] = useState('')
  const [loading, setLoading] = useState(false)

  const MODELOS = [
    { v: 'liga', l: 'Liga' }, { v: 'copa', l: 'Copa' },
    { v: 'grupos_mata_mata', l: 'Grupos+Mata' }, { v: 'livre', l: 'Livre' },
  ]

  async function criar() {
    if (!nome.trim()) { showToast('⚠️ Nome obrigatório'); return }
    if (!pix.trim()) { showToast('⚠️ Chave Pix obrigatória'); return }
    setLoading(true)
    const sl = nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-') + '-' + Date.now()
    const { error } = await supabase.from('tournaments').insert({
      name: nome, slug: sl, model: modelo, status: 'open',
      description: desc || null, entry_fee: parseFloat(taxa) || 0,
      prize: parseFloat(premio) || 0, pix_key: pix,
      start_date: inicio || null, end_date: fim || null, rules: regras || null,
    })
    setLoading(false)
    if (error) { showToast('❌ ' + error.message); return }
    showToast('🏆 Torneio criado!'); setTimeout(goBack, 1200)
  }

  return (
    <div style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ ...S.cardHead }}>
        <span style={S.sectionTitle}>🏆 Novo Torneio</span>
        <button onClick={goBack} style={{ background: 'none', border: 'none', color: G.muted, cursor: 'pointer', fontSize: 18 }}>←</button>
      </div>
      <div style={S.cardBody}>
        <div style={S.lbl}><span style={S.lblDot} />Nome *</div>
        <input style={S.inp} placeholder="Ex: Liga eFootball News 2026" value={nome} onChange={e => setNome(e.target.value)} />

        <div style={S.lbl}><span style={S.lblDot} />Formato</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          {MODELOS.map(m => (
            <button key={m.v} onClick={() => setModelo(m.v)}
              style={{ padding: '6px 13px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' as const, background: modelo === m.v ? G.gold + '22' : G.surface2, color: modelo === m.v ? G.gold : G.muted, outline: modelo === m.v ? `1px solid ${G.gold}55` : `1px solid ${G.border}` }}>
              {m.l}
            </button>
          ))}
        </div>

        <div style={S.lbl}><span style={S.lblDot} />Descrição</div>
        <textarea style={{ ...S.inp, minHeight: 60, resize: 'vertical' as const }} value={desc} onChange={e => setDesc(e.target.value)} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div><div style={S.lbl}><span style={S.lblDot} />Inscrição R$</div><input style={S.inp} type="number" value={taxa} onChange={e => setTaxa(e.target.value)} /></div>
          <div><div style={S.lbl}><span style={S.lblDot} />Prêmio R$</div><input style={S.inp} type="number" value={premio} onChange={e => setPremio(e.target.value)} /></div>
        </div>

        <div style={S.lbl}><span style={S.lblDot} />Chave Pix *</div>
        <input style={S.inp} placeholder="CPF, e-mail ou telefone" value={pix} onChange={e => setPix(e.target.value)} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div><div style={S.lbl}><span style={S.lblDot} />Início</div><input style={S.inp} type="date" value={inicio} onChange={e => setInicio(e.target.value)} /></div>
          <div><div style={S.lbl}><span style={S.lblDot} />Fim</div><input style={S.inp} type="date" value={fim} onChange={e => setFim(e.target.value)} /></div>
        </div>

        <div style={S.lbl}><span style={S.lblDot} />Regras</div>
        <textarea style={{ ...S.inp, minHeight: 60, resize: 'vertical' as const }} value={regras} onChange={e => setRegras(e.target.value)} />

        <button style={{ ...S.btnGreen, width: '100%', opacity: loading ? 0.5 : 1 }} onClick={criar} disabled={loading}>
          {loading ? '...' : '🏆 Criar torneio'}
        </button>
      </div>
    </div>
  )
}
