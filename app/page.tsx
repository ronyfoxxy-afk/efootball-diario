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
    .limit(12)
  return data as Post[] || []
}

export default async function Home() {
  const posts = await getPosts()
  const hero = posts[0]
  const sideItems = posts.slice(1, 5)
  const grid = posts.slice(5)

  return (
    <div style={{ minHeight: '100vh', background: '#05080f' }}>
      <Navbar />

      {/* Hero */}
      <section style={{ background: 'linear-gradient(180deg, #080d1a 0%, #05080f 100%)', padding: '1.75rem 1.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#374151' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>⚽</div>
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 700, color: '#6b7280' }}>Nenhuma notícia publicada ainda</p>
              <p style={{ fontSize: 14, color: '#374151', marginTop: 4 }}>O n8n vai publicar as primeiras notícias em breve!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1rem' }}>
              {/* Hero principal */}
              {hero && (
                <Link href={`/post/${hero.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    minHeight: 280, borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
                    position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                    background: hero.cover_image
                      ? `linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 60%, transparent 100%), url(${hero.cover_image}) center/cover`
                      : 'linear-gradient(135deg, #0f1f3d 0%, #1e1b4b 100%)',
                    border: '1px solid #1f2937',
                    padding: '1.5rem',
                    transition: 'transform 0.2s',
                  }}>
                    {!hero.cover_image && (
                      <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 80, opacity: 0.06 }}>⚽</div>
                    )}
                    {hero.categories && (
                      <span style={{
                        background: hero.categories.color, color: '#fff',
                        fontSize: 10, fontWeight: 700, padding: '3px 10px',
                        borderRadius: 6, letterSpacing: '1px', textTransform: 'uppercase',
                        marginBottom: 10, display: 'inline-block', width: 'fit-content',
                      }}>{hero.categories.name}</span>
                    )}
                    <h2 style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: 30, fontWeight: 800, color: '#fff',
                      lineHeight: 1.15, marginBottom: 10, letterSpacing: '-0.5px',
                    }}>{hero.title}</h2>
                    {hero.summary && (
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, marginBottom: 10,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {hero.summary}
                      </p>
                    )}
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                      {timeAgo(hero.published_at || hero.created_at)}
                      {hero.auto_published && <span style={{ marginLeft: 8, background: 'rgba(16,185,129,0.2)', color: '#10b981', padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>AUTO</span>}
                    </span>
                  </div>
                </Link>
              )}

              {/* Side cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sideItems.map(post => (
                  <Link key={post.id} href={`/post/${post.slug}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      background: '#0d1117', border: '1px solid #1f2937',
                      borderRadius: 12, padding: '10px 12px',
                      display: 'flex', gap: 10, cursor: 'pointer',
                      transition: 'border-color 0.15s',
                    }}>
                      {post.categories && (
                        <span style={{
                          background: post.categories.color + '18', color: post.categories.color,
                          fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 5,
                          letterSpacing: '0.5px', textTransform: 'uppercase', flexShrink: 0,
                          alignSelf: 'flex-start', marginTop: 2, whiteSpace: 'nowrap',
                        }}>{post.categories.name}</span>
                      )}
                      <div>
                        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, fontWeight: 700, color: '#e2e8f0', margin: '0 0 3px', lineHeight: 1.2 }}>{post.title}</p>
                        <p style={{ fontSize: 11, color: '#475569', margin: 0 }}>{timeAgo(post.published_at || post.created_at)}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* LivePix Banner — destaque total */}
      <div style={{ maxWidth: 1200, margin: '1.5rem auto 0', padding: '0 1.5rem' }}>
        <LivePixBanner />
      </div>

      {/* Grid de notícias */}
      {grid.length > 0 && (
        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 800, color: '#f1f5f9', margin: 0, letterSpacing: '-0.3px' }}>Últimas Notícias</h2>
            <Link href="/categoria/noticias" style={{ fontSize: 13, color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>Ver todas →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {grid.map(post => <PostCard key={post.id} post={post} />)}
          </div>
        </section>
      )}

      {/* Banner Torneios */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem 1.5rem' }}>
        <Link href="/torneios" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0f1f3d 0%, #1a1040 100%)',
            border: '1px solid rgba(59,130,246,0.25)', borderRadius: 16,
            padding: '1.5rem 2rem', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', cursor: 'pointer', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', right: -20, top: -20, fontSize: 120, opacity: 0.04 }}>🏆</div>
            <div>
              <p style={{ color: '#60a5fa', fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 4 }}>Evento principal</p>
              <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", color: '#fbbf24', fontWeight: 900, fontSize: 24, margin: '0 0 4px', letterSpacing: '-0.3px' }}>🏆 Liga eFootball Diário</h3>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, margin: 0 }}>Inscrição R$20 • Prêmio R$50 • Estilo Brasileirão</p>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: '#fff', fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 15, padding: '10px 22px', borderRadius: 10,
              letterSpacing: '0.5px', textTransform: 'uppercase', whiteSpace: 'nowrap',
              boxShadow: '0 4px 20px rgba(59,130,246,0.3)',
            }}>
              Ver torneios →
            </div>
          </div>
        </Link>
      </section>

      {/* Comunidade */}
      <ComunidadeSection />
      <Footer />
    </div>
  )
}
