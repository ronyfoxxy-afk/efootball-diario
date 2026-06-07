import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PostCard from '@/components/PostCard'
import { notFound } from 'next/navigation'
import type { Post } from '@/lib/supabase'

export const revalidate = 60

export default async function CategoriaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data: category } = await supabase.from('categories').select('*').eq('slug', slug).single()
  if (!category) notFound()

  const { data: posts } = await supabase
    .from('posts').select('*, categories(*)')
    .eq('status', 'published')
    .eq('category_id', category.id)
    .order('published_at', { ascending: false })
    .limit(24)

  return (
    <div style={{ minHeight: '100vh', background: '#09090b' }}>
      <Navbar />
      <main style={{ maxWidth: 1160, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
        <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #1d1d20' }}>
          <span style={{ background: category.color + '18', color: category.color, border: `1px solid ${category.color}33`, fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 4, letterSpacing: '1.2px', textTransform: 'uppercase' }}>
            {category.name}
          </span>
          <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 32, fontWeight: 900, color: '#e4e4e7', textTransform: 'uppercase', letterSpacing: 1, marginTop: 8 }}>
            {category.name}
          </h1>
        </div>

        {!posts || posts.length === 0 ? (
          <p style={{ color: '#52525b', textAlign: 'center', padding: '3rem' }}>Nenhuma notícia nesta categoria ainda.</p>
        ) : (
          <div className="grid-news">
            {(posts as Post[]).map(post => <PostCard key={post.id} post={post} />)}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
