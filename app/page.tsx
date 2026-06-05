import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import PostCard from '@/components/PostCard'
import Footer from '@/components/Footer'
import ComunidadeSection from '@/components/ComunidadeSection'
import Link from 'next/link'
import type { Post } from '@/lib/supabase'
import { timeAgo } from '@/lib/utils'

export const revalidate = 60

async function getPosts() {
  const { data } = await supabase
    .from('posts')
    .select('*, categories(*)')
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
    <div style={{ minHeight: '100vh', background: '#0a0f1e' }}>
      <Navbar />

      {/* Hero */}
      <section style={{ background: '#060b18', padding: '1.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
              <p style={{ fontSize: 18 }}>⚽ Nenhuma notícia publicada ainda.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1rem' }}>
              {hero && (
                <Link href={`/post/${hero.slug}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{
                    minHeight: 240, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                    padding: '1.5rem', cursor: 'pointer', position: 'relative', overflow: 'hidden',
                    background: hero.cover_image
                      ? `linear-gradient(to top, #000 0%, transparent 60%), url(${hero.cover_image}) center/cover`
                      : 'linear-gradient(135deg, #1a2744, #0f1a35)'
                  }}>
                    {hero.categories && (
                      <span className="badge" style={{ background: hero.categories.color, color: '#fff', marginBottom: 8, width: 'fit-content' }}>
                        {hero.categories.name}
                      </span>
                    )}
                    <h2 style={{ fontSize: 22, fontWeight: 600, color: '#fff', margin: '0 0 8px', lineHeight: 1.3 }}>
                      {hero.title}
                    </h2>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                      {timeAgo(hero.published_at || hero.created_at)}
                    </span>
                  </div>
                </Link>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sideItems.map(post => (
                  <Link key={post.id} href={`/post/${post.slug}`} style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ padding: 12, display: 'flex', gap: 10, cursor: 'pointer' }}>
                      {post.categories && (
                        <span className="badge" style={{ background: post.categories.color + '22', color: post.categories.color, flexShrink: 0, alignSelf: 'flex-start', marginTop: 2 }}>
                          {post.categories.name}
                        </span>
                      )}
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500, color: '#e2e8f0', margin: '0 0 3px', lineHeight: 1.35 }}>{post.title}</p>
                        <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>{timeAgo(post.published_at || post.created_at)}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Grid de notícias */}
      {grid.length > 0 && (
        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9', margin: 0 }}>Últimas notícias</h2>
            <Link href="/noticias" style={{ fontSize: 13, color: '#2563eb', textDecoration: 'none' }}>Ver todas →</Link>
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
            background: 'linear-gradient(135deg, #1e3a5f, #0f2640)',
            border: '1px solid #2563eb44', borderRadius: 12, padding: '1.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer'
          }}>
            <div>
              <h3 style={{ color: '#fbbf24', fontWeight: 600, fontSize: 18, margin: '0 0 4px' }}>🏆 Liga eFootball Diário</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, margin: 0 }}>Compete na liga oficial, pague R$20 e dispute o prêmio de R$50</p>
            </div>
            <span style={{ background: '#2563eb', color: '#fff', padding: '8px 18px', borderRadius: 8, fontSize: 14, fontWeight: 500 }}>
              Ver torneios →
            </span>
          </div>
        </Link>
      </section>

      {/* Comunidade */}
      <ComunidadeSection />

      <Footer />
    </div>
  )
}
