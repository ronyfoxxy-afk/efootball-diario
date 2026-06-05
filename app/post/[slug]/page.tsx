import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 60

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data: post } = await supabase
    .from('posts')
    .select('*, categories(*)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!post) notFound()

  return (
    <div style={{ minHeight: '100vh', background: '#08090c' }}>
      <Navbar />
      <main style={{ maxWidth: 780, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>

        {/* Categoria */}
        {post.categories && (
          <Link href={`/categoria/${post.categories.slug}`} style={{ textDecoration: 'none' }}>
            <span style={{ background: post.categories.color + '18', color: post.categories.color, border: `1px solid ${post.categories.color}33`, fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 6, letterSpacing: '1px', textTransform: 'uppercase' }}>
              {post.categories.name}
            </span>
          </Link>
        )}

        {/* Título */}
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: '#fff', lineHeight: 1.2, margin: '12px 0 10px' }}>
          {post.title}
        </h1>

        {/* Meta */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          <span style={{ fontSize: 13, color: '#4b5060' }}>📅 {formatDate(post.published_at || post.created_at)}</span>
          {post.auto_published && (
            <span style={{ fontSize: 11, color: '#3ecf8e', background: 'rgba(62,207,142,0.1)', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>AUTO</span>
          )}
        </div>

        {/* Imagem */}
        {post.cover_image && (
          <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: '1.5rem', border: '1px solid #1c1f26' }}>
            <img src={post.cover_image} alt={post.title}
              style={{ width: '100%', maxHeight: 420, objectFit: 'cover', display: 'block' }} />
          </div>
        )}

        {/* Resumo em destaque */}
        {post.summary && (
          <p style={{ fontSize: 16, color: '#8b909e', lineHeight: 1.7, marginBottom: '1.5rem', borderLeft: '3px solid #4f7ef8', paddingLeft: '1rem', background: '#0e1014', padding: '1rem 1rem 1rem 1.25rem', borderRadius: '0 10px 10px 0' }}>
            {post.summary}
          </p>
        )}

        {/* Conteúdo */}
        {post.content && (
          <div style={{ fontSize: 15, color: '#c8cdd8', lineHeight: 1.85, marginBottom: '1.5rem' }}>
            {post.content.split('\n').map((line: string, i: number) => {
              if (!line.trim()) return <div key={i} style={{ height: 12 }} />
              // Detecta URLs no conteúdo e torna clicáveis
              const urlRegex = /(https?:\/\/[^\s]+)/g
              const parts = line.split(urlRegex)
              return (
                <p key={i} style={{ marginBottom: 8 }}>
                  {parts.map((part, j) =>
                    urlRegex.test(part) ? (
                      <a key={j} href={part} target="_blank" rel="noopener noreferrer"
                        style={{ color: '#4f7ef8', wordBreak: 'break-all' }}>
                        {part}
                      </a>
                    ) : part
                  )}
                </p>
              )
            })}
          </div>
        )}

        {/* Botão fonte — grande e clicável */}
        {post.source_url && (
          <a href={post.source_url} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0e1014', border: '1px solid #1c1f26', borderRadius: 12, padding: '14px 18px', textDecoration: 'none', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: 12, color: '#4b5060', marginBottom: 2 }}>Fonte original</div>
              <div style={{ fontSize: 14, color: '#4f7ef8', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 480 }}>
                🔗 {post.source_url}
              </div>
            </div>
            <span style={{ color: '#4f7ef8', fontSize: 18, flexShrink: 0 }}>→</span>
          </a>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {post.tags.filter((t: string) => t).map((tag: string) => (
              <span key={tag} style={{ background: '#0e1014', border: '1px solid #1c1f26', color: '#4b5060', padding: '4px 12px', borderRadius: 20, fontSize: 12 }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        <Link href="/" style={{ fontSize: 13, color: '#4b5060', textDecoration: 'none' }}>← Voltar</Link>
      </main>
      <Footer />
    </div>
  )
}
