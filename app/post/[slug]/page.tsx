import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
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
    <div style={{ minHeight: '100vh', background: '#0a0f1e' }}>
      <Navbar />
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem' }}>
        {post.categories && (
          <Link href={`/categoria/${post.categories.slug}`} style={{ textDecoration: 'none' }}>
            <span className="badge" style={{ background: post.categories.color + '22', color: post.categories.color, marginBottom: 12, display: 'inline-flex' }}>
              {post.categories.name}
            </span>
          </Link>
        )}
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.3, margin: '8px 0 12px' }}>
          {post.title}
        </h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: '1.5rem', color: '#6b7280', fontSize: 13 }}>
          <span>📅 {formatDate(post.published_at || post.created_at)}</span>
          {post.source_url && (
            <a href={post.source_url} target="_blank" rel="noopener noreferrer"
              style={{ color: '#2563eb', textDecoration: 'none' }}>🔗 Fonte original</a>
          )}
          {post.auto_published && (
            <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '2px 8px', borderRadius: 4 }}>
              Auto-publicado
            </span>
          )}
        </div>
        {post.cover_image && (
          <img src={post.cover_image} alt={post.title}
            style={{ width: '100%', borderRadius: 12, marginBottom: '1.5rem', maxHeight: 400, objectFit: 'cover' }} />
        )}
        {post.summary && (
          <p style={{ fontSize: 16, color: '#94a3b8', lineHeight: 1.7, marginBottom: '1.5rem',
            borderLeft: '3px solid #2563eb', paddingLeft: '1rem' }}>
            {post.summary}
          </p>
        )}
        {post.content && (
          <div style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
            {post.content}
          </div>
        )}
        {post.tags && post.tags.length > 0 && (
          <div style={{ marginTop: '2rem', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {post.tags.map((tag: string) => (
              <span key={tag} style={{ background: '#1f2937', color: '#9ca3af', padding: '3px 10px', borderRadius: 20, fontSize: 12 }}>
                #{tag}
              </span>
            ))}
          </div>
        )}
        <div style={{ marginTop: '2rem' }}>
          <Link href="/" style={{ color: '#2563eb', textDecoration: 'none', fontSize: 14 }}>← Voltar para o início</Link>
        </div>
      </main>
    </div>
  )
}
