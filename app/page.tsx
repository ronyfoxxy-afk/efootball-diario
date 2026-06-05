import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import PostCard from '@/components/PostCard'
import Footer from '@/components/Footer'
import ComunidadeSection from '@/components/ComunidadeSection'
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

      <main style={{ maxWidth: 1160, margin: '0 auto', padding: '1.5rem 1.25rem' }}>

        {/* LivePix — sempre no topo */}
        <div style={{ marginBottom: '1.25rem' }}>
          <LivePixBanner />
        </div>

        {/* Hero + side */}
        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#4b5060', borderRadius: 12, border: '1px solid #1c1f26', background: '#0e1014', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.4 }}>⚽</div>
            <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: '#8b909e' }}>Nenhuma notícia ainda</p>
            <p style={{ fontSize: 13, marginTop: 6 }}>As primeiras notícias chegarão em breve via automação</p>
          </div>
        ) : (
          <>
            {/* Desktop: grid hero + side | Mobile: stack */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.875rem', marginBottom: '1.25rem' }}>

              {/* Hero card — span 2 em desktop */}
              {hero && (
                <Link href={`/post/${hero.slug}`} style={{ textDecoration: 'none', gridColumn: 'span 2' }}>
                  <div style={{
                    position: 'relative', borderRadius: 14, overflow: 'hidden',
                    border: '1px solid #1c1f26', cursor: 'pointer',
                    background: hero.cover_image
                      ? `linear-gradient(to top, #08090c 0%, rgba(8,9,12,0.5) 55%, transparent 100%), url(${hero.cover_image}) center/cover`
                      : '#0e1014',
                    minHeight: 260, display: 'flex', flexDirection: 'column',
                    justifyContent: 'flex-end', padding: '1.25rem',
                  }}>
                    {!hero.cover_image && (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72, opacity: 0.04 }}>⚽</div>
                    )}
                    {hero.categories && (
                      <span style={{
                        display: 'inline-block', marginBottom: 8, width: 'fit-content',
                        background: hero.categories.color + '18', color: hero.categories.color,
                        border: `1px solid ${hero.categories.color}33`,
                        fontSize: 10, fontWeight: 600, padding: '2px 9px',
                        borderRadius: 5, letterSpacing: '0.8px', textTransform: 'uppercase',
                      }}>{hero.categories.name}</span>
                    )}
                    <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: 8 }}>
                      {hero.title}
                    </h2>
                    {hero.summary && (
                      <p style={{ fontSize: 13, color: '#8b909e', lineHeight: 1.55, marginBottom: 10,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {hero.summary}
                      </p>
                    )}
                    <span style={{ fontSize: 12, color: '#4b5060' }}>{timeAgo(hero.published_at || hero.created_at)}</span>
                  </div>
                </Link>
              )}

              {/* Side cards */}
              {sideItems.map(post => (
                <Link key={post.id} href={`/post/${post.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: '#0e1014', border: '1px solid #1c1f26',
                    borderRadius: 12, padding: '14px', cursor: 'pointer',
                    height: '100%', display: 'flex', flexDirection: 'column', gap: 8,
                  }}>
                    {post.categories && (
                      <span style={{
                        width: 'fit-content',
                        background: post.categories.color + '18', color: post.categories.color,
                        border: `1px solid ${post.categories.color}33`,
                        fontSize: 10, fontWeight: 600, padding: '2px 8px',
                        borderRadius: 5, letterSpacing: '0.8px', textTransform: 'uppercase',
                      }}>{post.categories.name}</span>
                    )}
                    <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 700, color: '#e8eaf0', lineHeight: 1.3, flex: 1 }}>
                      {post.title}
                    </h3>
                    <span style={{ fontSize: 11, color: '#4b5060' }}>{timeAgo(post.published_at || post.created_at)}</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Grid de notícias */}
            {grid.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
                  <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: '#e8eaf0' }}>Últimas notícias</h2>
                  <Link href="/categoria/noticias" style={{ fontSize: 12, color: '#4f7ef8', textDecoration: 'none', fontWeight: 500 }}>Ver todas →</Link>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.875rem' }}>
                  {grid.map(post => <PostCard key={post.id} post={post} />)}
                </div>
              </div>
            )}
          </>
        )}

        {/* Torneios banner */}
        <Link href="/torneios" style={{ textDecoration: 'none', display: 'block', marginBottom: '2rem' }}>
          <div style={{
            background: '#0e1014', border: '1px solid #1c1f26',
            borderLeft: '3px solid #e8b84b',
            borderRadius: 12, padding: '1rem 1.25rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
            cursor: 'pointer',
          }}>
            <div>
              <p style={{ fontSize: 11, color: '#e8b84b', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 3 }}>Evento Principal</p>
              <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 2 }}>🏆 Liga eFootball Diário</h3>
              <p style={{ fontSize: 12, color: '#4b5060' }}>Inscrição R$20 · Prêmio R$50 · Estilo Brasileirão</p>
            </div>
            <span style={{ fontSize: 13, color: '#8b909e', whiteSpace: 'nowrap' }}>Ver torneios →</span>
          </div>
        </Link>

        {/* Comunidade */}
        <ComunidadeSection />

      </main>

      <Footer />
    </div>
  )
}
