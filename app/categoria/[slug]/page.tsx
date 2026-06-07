import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import PostCard from '@/components/PostCard'
import { notFound } from 'next/navigation'
import type { Post } from '@/lib/supabase'

export const revalidate = 60

export default async function CategoriaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data: category } = await supabase
    .from('categories').select('*').eq('slug', slug).single()
  if (!category) notFound()

  const { data: posts } = await supabase
    .from('posts').select('*, categories(*)')
    .eq('status', 'published')
    .eq('category_id', category.id)
    .order('published_at', { ascending: false })
    .limit(24)

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e' }}>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <span className="badge" style={{ background: category.color + '22', color: category.color, fontSize: 13, marginBottom: 8 }}>
            {category.name}
          </span>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9', margin: '8px 0 0' }}>
            {category.name}
          </h1>
        </div>
        {!posts || posts.length === 0 ? (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '3rem' }}>Nenhuma notícia nesta categoria ainda.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {(posts as Post[]).map(post => <PostCard key={post.id} post={post} />)}
          </div>
        )}
      </main>
    </div>
  )
}
