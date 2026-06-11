import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import PostCard from '@/components/PostCard'
import Footer from '@/components/Footer'
import LivePixBanner from '@/components/LivePixBanner'
import Link from 'next/link'
import type { Post } from '@/lib/supabase'
import { timeAgo } from '@/lib/utils'

export const revalidate = 60

async function getSiteSettings() {
  try {
    const { data } = await supabase.from('site_settings').select('key,value')
    if (!data) return {}
    return Object.fromEntries(data.map((r: any) => [r.key, r.value !== 'false']))
  } catch { return {} }
}

// Extrai um "ID" base da imagem para detectar duplicatas (ex: variações
// de tamanho do mesmo vídeo do YouTube: hq720, sddefault, maxresdefault, etc.)
function imageKey(url?: string | null): string | null {
  if (!url) return null
  // YouTube thumbnails: /vi/<ID>/<variant>.jpg
  const yt = url.match(/\/vi\/([\w-]+)\//)
  if (yt) return `yt:${yt[1]}`
  // Demais URLs: usa a própria URL como chave (ignorando querystring)
  return url.split('?')[0]
}

// Remove cover_image de posts cuja imagem (mesma origem/ID) já apareceu
// num post anterior na lista, evitando repetição visual na home.
function dedupeCoverImages(posts: Post[]): Post[] {
  const seen = new Set<string>()
  return posts.map((p: any) => {
    const key = imageKey(p.cover_image)
    if (key) {
      if (seen.has(key)) {
        return { ...p, cover_image: null }
      }
      seen.add(key)
    }
    return p
  })
}

async function getPosts() {
  const { data } = await supabase
    .from('posts').select('*, categories(*)')
    .eq('status', 'published')
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(20)
  if (!data) return []
  // Prioriza post marcado como destaque (featured)
  const featured = data.find((p: any) => p.featured)
  let ordered: Post[]
  if (featured) {
    const resto = data.filter((p: any) => !p.featured)
    ordered = [featured, ...resto].slice(0, 13) as Post[]
  } else {
    ordered = data.slice(0, 13) as Post[]
  }
  return dedupeCoverImages(ordered)
}

const badge = (color: string, name: string) => (
  <span style={{
    background: color + '18', color, border: `1px solid ${color}33`,
    fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
    letterSpacing: '1.2px', textTransform: 'uppercase' as const,
    display: 'inline-block', marginBottom: 6,
  }}>{name}</span>
)

export default async function Home() {
  const [posts, settings] = await Promise.all([getPosts(), getSiteSettings()])
  const hero = posts[0]
  const sideItems = posts.slice(1, 4)
  const grid = posts.slice(4)
  const showCoop = settings['show_coop'] !== false
  const showLivepix = settings['show_livepix_banner'] !== false

  return (
    <div style={{ minHeight: '100vh', background: '#09090b' }}>
      <Navbar />
      <main style={{ maxWidth: 1160, margin: '0 auto', padding: '1.25rem 1rem' }}>

        {showLivepix && <div style={{ marginBottom: '1rem' }}><LivePixBanner /></div>}

        {/* ── HERO ── */}
        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#52525b', borderRadius: 14, border: '1px solid #1d1d20', background: '#111115', marginBottom: '1rem' }}>
            <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.2 }}>⚽</div>
            <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 20, fontWeight: 900, color: '#71717a', textTransform: 'uppercase' }}>Nenhuma notícia ainda</p>
            <p style={{ fontSize: 13, marginTop: 6 }}>As primeiras notícias chegam em breve!</p>
          </div>
        ) : (
          <div className="hero-grid" style={{ marginBottom: '1rem' }}>
            {hero && (
              <Link href={`/post/${hero.slug}`} style={{ textDecoration: 'none' }}>
                <div className="card-hover" style={{
                  position: 'relative', borderRadius: 14, overflow: 'hidden',
                  border: '1px solid #1d1d20', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column',
                }}>
                  {/* Imagem hero — proporcional com altura máxima */}
                  {hero.cover_image ? (
                    <div style={{ position: 'relative', width: '100%' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={hero.cover_image}
                        alt={hero.title}
                        style={{ width: '100%', height: 'auto', display: 'block', maxHeight: 340, objectFit: 'cover' }}
                      />
                      {/* Overlay gradiente sobre a imagem */}
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(9,9,11,0.97) 0%, rgba(9,9,11,0.45) 50%, rgba(9,9,11,0.1) 100%)' }} />
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(to top,rgba(79,126,248,0.08),transparent)', pointerEvents: 'none' }} />
                      {/* Conteúdo sobre a imagem */}
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.25rem', zIndex: 2 }}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 0 }}>
                          {(hero as any).featured && (
                            <span style={{ background: 'rgba(232,184,75,0.2)', color: '#fbe900', border: '1px solid rgba(232,184,75,0.4)', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 4, letterSpacing: '1.2px', textTransform: 'uppercase' as const }}>⭐ DESTAQUE</span>
                          )}
                          {hero.categories && badge(hero.categories.color, hero.categories.name)}
                        </div>
                        <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 26, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8, lineHeight: 1.1, marginTop: 6 }}>
                          {hero.title}
                        </h2>
                        {hero.summary && (
                          <p style={{ fontSize: 13, color: '#a1a1aa', lineHeight: 1.55, marginBottom: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {hero.summary}
                          </p>
                        )}
                        <span style={{ fontSize: 11, color: '#52525b' }}>{timeAgo(hero.published_at || hero.created_at)}</span>
                      </div>
                    </div>
                  ) : (
                    /* Sem imagem: card com fundo sólido */
                    <div style={{ background: 'linear-gradient(135deg,#0d0820 0%,#091428 50%,#0a1a0d 100%)', minHeight: 280, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '1.25rem' }}>
                      {hero.categories && badge(hero.categories.color, hero.categories.name)}
                      <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 26, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8, lineHeight: 1.1 }}>
                        {hero.title}
                      </h2>
                      {hero.summary && (
                        <p style={{ fontSize: 13, color: '#a1a1aa', lineHeight: 1.55, marginBottom: 6 }}>{hero.summary}</p>
                      )}
                      <span style={{ fontSize: 11, color: '#52525b' }}>{timeAgo(hero.published_at || hero.created_at)}</span>
                    </div>
                  )}
                </div>
              </Link>
            )}

            {/* Side items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sideItems.map(post => (
                <Link key={post.id} href={`/post/${post.slug}`} style={{ textDecoration: 'none', flex: 1 }}>
                  <div className="card-hover" style={{ background: '#111115', border: '1px solid #1d1d20', borderRadius: 12, padding: 10, display: 'flex', gap: 10, cursor: 'pointer', height: '100%' }}>
                    {post.cover_image && (
                      <div style={{ width: 72, height: 72, borderRadius: 8, background: `url(${post.cover_image}) center/cover`, flexShrink: 0, border: '1px solid #1d1d20' }} />
                    )}
                    <div style={{ minWidth: 0 }}>
                      {post.categories && badge(post.categories.color, post.categories.name)}
                      <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 14, fontWeight: 700, color: '#e4e4e7', margin: '2px 0 3px', lineHeight: 1.2, textTransform: 'uppercase', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.title}</p>
                      <p style={{ fontSize: 10, color: '#52525b' }}>{timeAgo(post.published_at || post.created_at)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── GRID NOTÍCIAS ── */}
        {grid.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
              <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 20, fontWeight: 900, color: '#e4e4e7', textTransform: 'uppercase', letterSpacing: 1 }}>Últimas Notícias</h2>
              <Link href="/categoria/noticias" style={{ fontSize: 12, color: '#4f7ef8', textDecoration: 'none', fontWeight: 600 }}>Ver todas →</Link>
            </div>
            <div className="grid-news">
              {grid.map(post => <PostCard key={post.id} post={post} />)}
            </div>
          </div>
        )}

        {/* ── CO-OP ── */}
        {showCoop && (
        <div style={{ marginBottom: 10 }}>
          <Link href="/coop" style={{ textDecoration: 'none' }}>
            <div className="card-hover" style={{ background: '#111115', border: '1px solid #1d1d20', borderLeft: '3px solid #4f7ef8', borderRadius: '0 12px 12px 0', padding: '1rem' }}>
              <p style={{ fontSize: 9, color: '#4f7ef8', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 3 }}>Ao Vivo</p>
              <h3 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 18, fontWeight: 900, color: '#fff', textTransform: 'uppercase', marginBottom: 2 }}>🎮 Co-op 3x3</h3>
              <p style={{ fontSize: 12, color: '#52525b' }}>Jogue com o FSKATE</p>
            </div>
          </Link>
        </div>
        )}

      </main>
      <Footer />
    </div>
  )
}
