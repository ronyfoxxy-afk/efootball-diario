import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { formatDate, cleanPostContent, readingTime, extractSources } from '@/lib/utils'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export const revalidate = 60

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data: post } = await supabase
    .from('posts').select('*, categories(*)')
    .eq('slug', slug).eq('status', 'published').single()

  if (!post) notFound()

  const { body, signature } = cleanPostContent(post.content || '')
  const minutes = readingTime(body)
  const sources = extractSources(body)

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
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #1d1d20' }}>
          <span style={{ fontSize: 12, color: '#52525b', display: 'flex', alignItems: 'center', gap: 5 }}>
            📅 {formatDate(post.published_at || post.created_at)}
          </span>
          <span style={{ fontSize: 12, color: '#52525b', display: 'flex', alignItems: 'center', gap: 5 }}>
            ⏱️ {minutes} min de leitura
          </span>
          {post.auto_published && (
            <span style={{ fontSize: 10, color: '#22d3a0', background: 'rgba(34,211,160,0.08)', padding: '2px 8px', borderRadius: 4, fontWeight: 700, letterSpacing: '0.8px' }}>AUTO</span>
          )}
        </div>

        {/* Imagem de capa */}
        {post.cover_image && (
          <figure style={{ margin: '0 0 1.5rem' }}>
            <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #1d1d20', background: '#111115' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.cover_image}
                alt={post.title}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
          </figure>
        )}

        {/* Resumo / lead destacado */}
        {post.summary && (
          <div style={{ marginBottom: '1.75rem' }}>
            <p style={{ fontSize: 10, color: '#52525b', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', margin: '0 0 6px' }}>
              Resumo
            </p>
            <div style={{
              background: '#111115', borderRadius: 10,
              padding: '1rem 1.25rem',
            }}>
              <p style={{
                fontSize: 16, color: '#e4e4e7', lineHeight: 1.7, margin: 0,
                fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic',
              }}>
                {post.summary.replace(/^\*+\s*/, '').replace(/\*+$/, '')}
              </p>
            </div>
          </div>
        )}

        {/* Corpo do artigo — markdown renderizado */}
        {body && (
          <div className="article-body" style={{ marginBottom: '1.5rem' }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {body}
            </ReactMarkdown>
          </div>
        )}

        {/* Fontes e referências */}
        {sources.length > 0 && (
          <div style={{ borderTop: '1px solid #1d1d20', paddingTop: '1rem', marginBottom: '1rem' }}>
            <p style={{ fontSize: 10, color: '#52525b', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', margin: '0 0 10px' }}>
              Fontes e referências
            </p>
            <ul style={{ margin: 0, padding: '0 0 0 18px', listStyle: 'none' }}>
              {sources.map((url, i) => {
                let label = url
                try { label = new URL(url).hostname.replace('www.', '') } catch {}
                return (
                  <li key={i} style={{ marginBottom: 6, fontSize: 13, lineHeight: 1.6 }}>
                    <a href={url} target="_blank" rel="noopener noreferrer"
                      style={{ color: '#4f7ef8', textDecoration: 'none' }}>
                      🔗 {label}
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {/* Fonte original + assinatura */}
        {(post.source_url || signature) && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, background: '#111115', border: '1px solid #1d1d20', borderRadius: 12, padding: '14px 18px', marginBottom: '1.5rem' }}>
            {post.source_url ? (
              <a href={post.source_url} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: '#4f7ef8', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 480 }}>
                🔗 Fonte original
              </a>
            ) : <span />}
            {signature && (
              <span style={{ fontSize: 11, color: '#52525b', whiteSpace: 'nowrap' }}>
                {signature.replace(/^_+|_+$/g, '')}
              </span>
            )}
          </div>
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
