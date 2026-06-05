import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import PostCard from '@/components/PostCard'
import Footer from '@/components/Footer'
import LivePixBanner from '@/components/LivePixBanner'
import Link from 'next/link'
import type { Post } from '@/lib/supabase'
import { timeAgo } from '@/lib/utils'

export const revalidate = 60

async function getPosts() {
  const { data } = await supabase
    .from('posts').select('*, categories(*)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(13)
  return data as Post[] || []
}

export default async function Home() {
  const posts = await getPosts()
  const hero = posts[0]
  const sideItems = posts.slice(1, 4)
  const grid = posts.slice(4)

  return (
    <div style={{ minHeight: '100vh', background: '#08090c' }}>
      <Navbar />
      <main style={{ maxWidth: 1160, margin: '0 auto', padding: '1.25rem 1rem' }}>

        {/* LivePix */}
        <div style={{ marginBottom: '1rem' }}>
          <LivePixBanner />
        </div>

        {/* Hero */}
        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#4b5060', borderRadius: 12, border: '1px solid #1c1f26', background: '#0e1014', marginBottom: '1rem' }}>
            <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>⚽</div>
            <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: '#8b909e' }}>Nenhuma notícia ainda</p>
            <p style={{ fontSize: 13, marginTop: 6 }}>As primeiras notícias chegam em breve!</p>
          </div>
        ) : (
          <div className="hero-grid" style={{ marginBottom: '1rem' }}>
            {hero && (
              <Link href={`/post/${hero.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  position: 'relative', borderRadius: 14, overflow: 'hidden',
                  border: '1px solid #1c1f26', cursor: 'pointer',
                  background: hero.cover_image
                    ? `linear-gradient(to top, #08090c 0%, rgba(8,9,12,0.4) 55%, transparent 100%), url(${hero.cover_image}) center/cover`
                    : '#0e1014',
                  minHeight: 280, display: 'flex', flexDirection: 'column',
                  justifyContent: 'flex-end', padding: '1.25rem',
                }}>
                  {!hero.cover_image && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72, opacity: 0.04 }}>⚽</div>}
                  {hero.categories && (
                    <span style={{ display: 'inline-block', marginBottom: 8, width: 'fit-content', background: hero.categories.color + '18', color: hero.categories.color, border: `1px solid ${hero.categories.color}33`, fontSize: 10, fontWeight: 600, padding: '2px 9px', borderRadius: 5, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                      {hero.categories.name}
                    </span>
                  )}
                  <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: 8 }}>
                    {hero.title}
                  </h2>
                  {hero.summary && (
                    <p style={{ fontSize: 13, color: '#8b909e', lineHeight: 1.5, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {hero.summary}
                    </p>
                  )}
                  <span style={{ fontSize: 12, color: '#4b5060' }}>{timeAgo(hero.published_at || hero.created_at)}</span>
                </div>
              </Link>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sideItems.map(post => (
                <Link key={post.id} href={`/post/${post.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#0e1014', border: '1px solid #1c1f26', borderRadius: 12, padding: '12px', display: 'flex', gap: 10, cursor: 'pointer' }}>
                    {post.cover_image && <div style={{ width: 56, height: 56, borderRadius: 8, background: `url(${post.cover_image}) center/cover`, flexShrink: 0 }} />}
                    <div style={{ minWidth: 0 }}>
                      {post.categories && (
                        <span style={{ background: post.categories.color + '18', color: post.categories.color, fontSize: 9, fontWeight: 600, padding: '1px 6px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {post.categories.name}
                        </span>
                      )}
                      <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, color: '#e2e8f0', margin: '4px 0 3px', lineHeight: 1.25, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.title}</p>
                      <p style={{ fontSize: 11, color: '#4b5060' }}>{timeAgo(post.published_at || post.created_at)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Grid notícias */}
        {grid.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: '#e8eaf0' }}>Últimas notícias</h2>
              <Link href="/categoria/noticias" style={{ fontSize: 12, color: '#4f7ef8', textDecoration: 'none', fontWeight: 500 }}>Ver todas →</Link>
            </div>
            <div className="grid-news">
              {grid.map(post => <PostCard key={post.id} post={post} />)}
            </div>
          </div>
        )}

        {/* Torneios */}
        <Link href="/torneios" style={{ textDecoration: 'none', display: 'block', marginBottom: '1.5rem' }}>
          <div style={{ background: '#0e1014', border: '1px solid #1c1f26', borderLeft: '3px solid #e8b84b', borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', cursor: 'pointer' }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 10, color: '#e8b84b', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 3 }}>Evento Principal</p>
              <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 2 }}>🏆 Liga eFootball Diário</h3>
              <p style={{ fontSize: 12, color: '#4b5060' }}>Inscrição R$20 · Prêmio R$50 · Estilo Brasileirão</p>
            </div>
            <span style={{ fontSize: 13, color: '#8b909e', flexShrink: 0 }}>Ver →</span>
          </div>
        </Link>

      </main>
      <Footer />
    </div>
  )
}
