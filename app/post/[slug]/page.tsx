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
    .from('posts').select('*, categories(*)')
    .eq('slug', slug).eq('status', 'published').single()

  if (!post) notFound()

  return (
    <div style={{ minHeight: '100vh', background: '#09090b' }}>
      <Navbar />

      <main style={{ maxWidth: 780, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>

        {/* Categoria badge */}
        {post.categories && (
          <Link href={`/categoria/${post.categories.slug}`} style={{ textDecoration: 'none' }}>
            <span style={{
              background: post.categories.color + '18', color: post.categories.color,
              border: `1px solid ${post.categories.color}33`,
              fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
              letterSpacing: '1.2px', textTransform: 'uppercase',
            }}>
              {post.categories.name}
            </span>
          </Link>
        )}

        {/* Título */}
        <h1 style={{
          fontFamily: "'Barlow Condensed',sans-serif", fontSize: 30, fontWeight: 900,
          color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px',
          margin: '12px 0 10px', lineHeight: 1.1,
        }}>
          {post.title}
        </h1>

        {/* Meta */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #1d1d20' }}>
          <span style={{ fontSize: 12, color: '#52525b' }}>📅 {formatDate(post.published_at || post.created_at)}</span>
          {post.auto_published && (
            <span style={{ fontSize: 10, color: '#22d3a0', background: 'rgba(34,211,160,0.08)', padding: '2px 8px', borderRadius: 4, fontWeight: 700, letterSpacing: '0.8px' }}>AUTO</span>
          )}
        </div>

        {/* Imagem INTEIRA — sem corte */}
        {post.cover_image && (
          <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: '1.5rem', border: '1px solid #1d1d20', background: '#111115' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.cover_image}
              alt={post.title}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>
        )}

        {/* Resumo destacado */}
        {post.summary && (
          <div style={{
            background: '#111115', borderLeft: '3px solid #4f7ef8',
            borderRadius: '0 10px 10px 0', padding: '1rem 1rem 1rem 1.25rem', marginBottom: '1.5rem',
          }}>
            <p style={{ fontSize: 15, color: '#a1a1aa', lineHeight: 1.75, margin: 0, fontFamily: "'Barlow',sans-serif" }}>
              {post.summary}
            </p>
          </div>
        )}

        {/* Conteúdo formatado */}
        {post.content && (
          <div style={{ marginBottom: '1.5rem' }}>
            {post.content.split('\n').map((line: string, i: number) => {
              // Ignorar linhas de metadados do workflow
              if (line.match(/^(TITULO|TÍTULO|RESUMO|TITL):\s*/i)) return null
              if (!line.trim()) return <div key={i} style={{ height: 16 }} />

              // Título (linha que começa com ##)
              if (line.startsWith('## ')) {
                return (
                  <h2 key={i} style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 20, fontWeight: 900, color: '#e4e4e7', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '1.5rem 0 0.5rem', lineHeight: 1.2 }}>
                    {line.replace('## ', '')}
                  </h2>
                )
              }

              // Subtítulo (linha que começa com #)
              if (line.startsWith('# ')) {
                return (
                  <h3 key={i} style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 17, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '1.25rem 0 0.4rem', lineHeight: 1.2 }}>
                    {line.replace('# ', '')}
                  </h3>
                )
              }

              // URL clicável
              const urlRegex = /(https?:\/\/[^\s]+)/g
              const parts = line.split(urlRegex)

              return (
                <p key={i} style={{ fontSize: 15, color: '#c4c4cc', lineHeight: 1.85, marginBottom: 12, fontFamily: "'Barlow',sans-serif" }}>
                  {parts.map((part, j) =>
                    urlRegex.test(part) ? (
                      <a key={j} href={part} target="_blank" rel="noopener noreferrer"
                        style={{ color: '#4f7ef8', wordBreak: 'break-all', textDecoration: 'underline' }}>
                        {part}
                      </a>
                    ) : part
                  )}
                </p>
              )
            })}
          </div>
        )}

        {/* Fonte original */}
        {post.source_url && (
          <a href={post.source_url} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#111115', border: '1px solid #1d1d20', borderRadius: 12, padding: '14px 18px', textDecoration: 'none', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: 10, color: '#52525b', marginBottom: 2, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>Fonte original</div>
              <div style={{ fontSize: 13, color: '#4f7ef8', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 480 }}>
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
              <span key={tag} style={{ background: '#111115', border: '1px solid #1d1d20', color: '#52525b', padding: '4px 12px', borderRadius: 20, fontSize: 11 }}>#{tag}</span>
            ))}
          </div>
        )}

        <Link href="/" style={{ fontSize: 12, color: '#52525b', textDecoration: 'none', fontWeight: 600, letterSpacing: '0.5px' }}>← Voltar</Link>
      </main>
      <Footer />
    </div>
  )
}
