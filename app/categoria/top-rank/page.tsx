import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PostCard from '@/components/PostCard'
import Link from 'next/link'
import type { Post } from '@/lib/supabase'

export const revalidate = 60

export default async function TopRankPage() {
  // Busca pela categoria top-rank ou tops
  const { data: cats } = await supabase
    .from('categories').select('id,slug,name').in('slug', ['top-rank','tops'])

  const catIds = (cats || []).map((c: any) => c.id)

  let posts: Post[] = []
  if (catIds.length > 0) {
    const { data } = await supabase
      .from('posts').select('*, categories(*)')
      .eq('status', 'published')
      .in('category_id', catIds)
      .order('published_at', { ascending: false })
      .limit(24)
    posts = (data || []) as Post[]
  }

  return (
    <div style={{ minHeight: '100vh', background: '#09090b' }}>
      <Navbar />
      <main style={{ maxWidth: 1160, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #1d1d20' }}>
          <span style={{ background: 'rgba(249,115,22,0.12)', color: '#f97316', border: '1px solid rgba(249,115,22,0.25)', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 4, letterSpacing: '1.2px', textTransform: 'uppercase' }}>
            🏅 Top Rank
          </span>
          <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 36, fontWeight: 900, color: '#f97316', textTransform: 'uppercase', letterSpacing: 1, marginTop: 8, marginBottom: 4 }}>
            🏅 Top Rank
          </h1>
          <p style={{ color: '#52525b', fontSize: 13 }}>
            Rankings, melhores jogadores, melhores times e listas do eFootball
          </p>
        </div>

        {/* Rankings fixos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: '1.5rem' }}>
          {[
            { emoji: '⚽', title: 'Melhores Jogadores', desc: 'Os EPICs mais poderosos do meta atual', color: '#f97316' },
            { emoji: '🛡️', title: 'Melhores Times',     desc: 'Formações e esquemas mais usados', color: '#e8b84b' },
            { emoji: '📊', title: 'Ranking Divisões',   desc: 'Como subir de divisão mais rápido', color: '#22d3a0' },
          ].map(item => (
            <div key={item.title} style={{ background: '#111115', border: `1px solid #1d1d20`, borderTop: `3px solid ${item.color}`, borderRadius: '0 0 12px 12px', padding: '1rem' }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{item.emoji}</div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 16, fontWeight: 900, color: '#e4e4e7', textTransform: 'uppercase', marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: '#52525b' }}>{item.desc}</div>
            </div>
          ))}
        </div>

        {/* Posts da categoria */}
        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#52525b', border: '1px dashed #2d2d35', borderRadius: 14 }}>
            <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 20, fontWeight: 900, textTransform: 'uppercase', marginBottom: 8 }}>
              Em breve os primeiros rankings!
            </p>
            <p style={{ fontSize: 13 }}>Os tops e rankings do eFootball serão publicados aqui.</p>
            <Link href="/" style={{ display: 'inline-block', marginTop: 16, fontSize: 12, color: '#4f7ef8', textDecoration: 'none', fontWeight: 700 }}>← Voltar para notícias</Link>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
              <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 20, fontWeight: 900, color: '#e4e4e7', textTransform: 'uppercase', letterSpacing: 1 }}>Rankings e Tops</h2>
            </div>
            <div className="grid-news">
              {posts.map(post => <PostCard key={post.id} post={post} />)}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
