'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'

const CATS = [
  { slug: 'noticias', name: 'Notícias', color: '#6b7280' },
  { slug: 'eventos', name: 'Eventos', color: '#10b981' },
  { slug: 'atualizacoes', name: 'Atualizações', color: '#4f7ef8' },
  { slug: 'campanhas', name: 'Campanhas', color: '#e8b84b' },
  { slug: 'guias', name: 'Guias', color: '#8b5cf6' },
  { slug: 'vazamentos-rumores', name: 'Vazamentos', color: '#ef4444' },
  { slug: 'analises', name: 'Análises', color: '#ec4899' },
]

export default function EditarPost() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  const [titulo, setTitulo] = useState('')
  const [resumo, setResumo] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [imagem, setImagem] = useState('')
  const [fonte, setFonte] = useState('')
  const [categoria, setCategoria] = useState('noticias')
  const [status, setStatus] = useState<'published' | 'draft'>('published')
  const [catId, setCatId] = useState<string | null>(null)

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2500) }

  useEffect(() => {
    async function carregar() {
      const { data: post } = await supabase
        .from('posts').select('*, categories(slug)').eq('id', id).single()
      if (!post) { router.push('/admin-fskate'); return }
      setTitulo(post.title || '')
      setResumo(post.summary || '')
      setConteudo(post.content || '')
      setImagem(post.cover_image || '')
      setFonte(post.source_url || '')
      setStatus(post.status || 'published')
      if (post.categories) setCategoria(post.categories.slug)
      setLoading(false)
    }
    carregar()
  }, [id])

  async function salvar() {
    if (!titulo.trim()) { showToast('⚠️ Título obrigatório'); return }
    setSaving(true)
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', categoria).single()
    const updates: any = {
      title: titulo,
      summary: resumo || null,
      content: conteudo || null,
      cover_image: imagem || null,
      source_url: fonte || null,
      category_id: cat?.id || null,
      status,
      updated_at: new Date().toISOString(),
    }
    if (status === 'published') updates.published_at = new Date().toISOString()

    const { error } = await supabase.from('posts').update(updates).eq('id', id)
    setSaving(false)
    if (error) { showToast('❌ ' + error.message); return }
    showToast('✅ Salvo!')
    setTimeout(() => router.push('/admin-fskate'), 1200)
  }

  const css = {
    inp: { width: '100%', background: '#14161b', border: '1px solid #1c1f26', borderRadius: 10, padding: '11px 14px', color: '#e8eaf0', fontSize: 14, fontFamily: "'Inter',sans-serif", outline: 'none', boxSizing: 'border-box' as const, marginBottom: 12 },
    lbl: { fontSize: 11, color: '#4b5060', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase' as const, marginBottom: 6, display: 'block' },
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#08090c', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5060', fontFamily: "'Inter',sans-serif" }}>
      Carregando...
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#08090c', color: '#e8eaf0', fontFamily: "'Inter',sans-serif" }}>

      {/* Header */}
      <header style={{ background: '#0e1014', borderBottom: '1px solid #1c1f26', padding: '0 1rem', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => router.push('/admin-fskate')}
            style={{ background: 'none', border: 'none', color: '#4b5060', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>←</button>
          <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, color: '#fff' }}>Editar Post</span>
        </div>
        <button onClick={salvar} disabled={saving}
          style={{ background: '#4f7ef8', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: "'Inter',sans-serif", opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Salvando...' : '💾 Salvar'}
        </button>
      </header>

      {toast && (
        <div style={{ position: 'fixed', top: 66, left: '50%', transform: 'translateX(-50%)', background: '#0e1014', border: '1px solid #3ecf8e', borderRadius: 10, padding: '10px 20px', fontSize: 13, color: '#3ecf8e', zIndex: 300, whiteSpace: 'nowrap', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
          {toast}
        </div>
      )}

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '1.25rem 1rem 3rem' }}>

        {/* Preview imagem */}
        {imagem && (
          <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: '1rem', border: '1px solid #1c1f26', height: 180 }}>
            <img src={imagem} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        )}

        <div style={{ background: '#0e1014', border: '1px solid #1c1f26', borderRadius: 14, padding: '1.25rem' }}>

          <label style={css.lbl}>Título *</label>
          <input style={css.inp} value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título da notícia..." />

          <label style={css.lbl}>Categoria</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {CATS.map(c => (
              <button key={c.slug} onClick={() => setCategoria(c.slug)}
                style={{ padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 600,
                  background: categoria === c.slug ? c.color + '22' : '#14161b',
                  color: categoria === c.slug ? c.color : '#4b5060',
                  outline: categoria === c.slug ? `1px solid ${c.color}44` : '1px solid #1c1f26' }}>
                {c.name}
              </button>
            ))}
          </div>

          <label style={css.lbl}>Resumo</label>
          <textarea style={{ ...css.inp, minHeight: 72, resize: 'vertical' as const }} value={resumo} onChange={e => setResumo(e.target.value)} placeholder="Resumo curto..." />

          <label style={css.lbl}>Conteúdo</label>
          <textarea style={{ ...css.inp, minHeight: 160, resize: 'vertical' as const }} value={conteudo} onChange={e => setConteudo(e.target.value)} placeholder="Texto completo..." />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={css.lbl}>URL da Imagem</label>
              <input style={css.inp} value={imagem} onChange={e => setImagem(e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <label style={css.lbl}>Link da Fonte</label>
              <input style={css.inp} value={fonte} onChange={e => setFonte(e.target.value)} placeholder="https://..." />
            </div>
          </div>

          <label style={css.lbl}>Status</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {(['published', 'draft'] as const).map(s => (
              <button key={s} onClick={() => setStatus(s)}
                style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13,
                  background: status === s ? (s === 'published' ? '#3ecf8e' : '#e8b84b') : '#14161b',
                  color: status === s ? '#000' : '#4b5060' }}>
                {s === 'published' ? '✅ Publicado' : '📋 Rascunho'}
              </button>
            ))}
          </div>

          <button onClick={salvar} disabled={saving}
            style={{ background: '#4f7ef8', color: '#fff', border: 'none', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', width: '100%', fontFamily: "'Inter',sans-serif", opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Salvando...' : '💾 Salvar alterações'}
          </button>
        </div>
      </div>
    </div>
  )
}
