import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PostCard from '@/components/PostCard'
import type { Post } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default async function BuscaPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const termo = (q || '').trim()

  let posts: Post[] = []
  if (termo.length >= 2) {
    const { data } = await supabase
      .from('posts').select('*, categories(*)')
      .eq('status', 'published')
      .or(`title.ilike.%${termo}%,summary.ilike.%${termo}%,content.ilike.%${termo}%`)
      .order('published_at', { ascending: false })
      .limit(30)
    posts = (data as Post[]) || []
  }

  return (
    <div style={{ minHeight: '100vh', background: '#09090b' }}>
      <Navbar />
      <main style={{ maxWidth: 1160, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
        <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #1d1d20' }}>
          <p style={{ fontSize: 9, color: '#52525b', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 6 }}>Resultados da busca</p>
          <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 28, fontWeight: 900, color: '#e4e4e7', textTransform: 'uppercase', letterSpacing: 1 }}>
            {termo ? `"${termo}"` : 'Buscar'}
          </h1>
        </div>

        {termo.length < 2 ? (
          <p style={{ color: '#52525b', textAlign: 'center', padding: '3rem' }}>Digite ao menos 2 caracteres para buscar.</p>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#52525b' }}>
            <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.2 }}>🔍</div>
            <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 18, fontWeight: 900, color: '#71717a', textTransform: 'uppercase' }}>Nenhum resultado encontrado</p>
            <p style={{ fontSize: 13, marginTop: 6 }}>Tente outros termos de busca.</p>
          </div>
        ) : (
          <div className="grid-news">
            {posts.map(post => <PostCard key={post.id} post={post} />)}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
