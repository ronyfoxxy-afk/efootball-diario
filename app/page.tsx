import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import LivePixBanner from '@/components/LivePixBanner'
import PostCard from '@/components/PostCard'

export const revalidate = 60

async function getPosts() {
  const { data } = await supabase.from('posts').select('id,title,slug,summary,cover_image,published_at,categories(name,slug,color)').eq('status', 'published').order('published_at', { ascending: false }).limit(12)
  return data || []
}

async function getDestaque() {
  const { data } = await supabase.from('posts').select('id,title,slug,summary,cover_image,published_at,categories(name,slug,color)').eq('status', 'published').order('published_at', { ascending: false }).limit(1).single()
  return data
}

async function getTorneios() {
  const { data } = await supabase.from('tournaments').select('id,name,slug,entry_fee,prize,status,model').eq('status', 'open').limit(3)
  return data || []
}

export default async function Home() {
  const [destaque, posts, torneios] = await Promise.all([getDestaque(), getPosts(), getTorneios()])
  const grid = posts.slice(1, 9)

  function timeAgo(d: string) {
    const diff = Date.now() - new Date(d).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 60) return `${m}min`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h`
    return `${Math.floor(h / 24)}d`
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080808' }}>
      <Navbar />

      <main style={{ maxWidth: 1160, margin: '0 auto', padding: '1.25rem 1rem 3rem' }}>

        {/* LivePix Banner */}
        <div style={{ marginBottom: '1.25rem' }}>
          <LivePixBanner />
        </div>

        {/* DESTAQUE */}
        {destaque && (
          <Link href={`/post/${destaque.slug}`} style={{ textDecoration: 'none', display: 'block', marginBottom: '1.25rem' }}>
            <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', background: '#0e0e0e', border: '1px solid #1a1a1a', minHeight: 280 }}>
              {destaque.cover_image && (
                <div style={{ position: 'absolute', inset: 0 }}>
                  <img src={destaque.cover_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #080808 40%, transparent 100%)' }} />
                </div>
              )}
              <div style={{ position: 'relative', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minHeight: 280 }}>
                {destaque.categories && (
                  <span style={{ display: 'inline-block', fontSize: 9, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 4, background: (destaque.categories as any).color + '22', color: (destaque.categories as any).color, marginBottom: 10, width: 'fit-content' }}>
                    🔥 DESTAQUE · {(destaque.categories as any).name.toUpperCase()}
                  </span>
                )}
                <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {destaque.title}
                </h1>
                {destaque.summary && (
                  <p style={{ fontSize: 14, color: '#aaa', lineHeight: 1.5, maxWidth: 600 }}>{destaque.summary}</p>
                )}
                <div style={{ fontSize: 11, color: '#444', marginTop: 10, fontWeight: 600, letterSpacing: '0.5px' }}>
                  {timeAgo(destaque.published_at)} atrás
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Layout principal: posts + sidebar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem', alignItems: 'start' }}>

          {/* GRID DE POSTS */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#444', display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
              <span style={{ width: 3, height: 14, background: '#e8b84b', borderRadius: 2, display: 'inline-block', flexShrink: 0 }} />
              ÚLTIMAS NOTÍCIAS
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {grid.map(post => (
                <PostCard key={post.id} post={post as any} />
              ))}
            </div>
            {posts.length > 8 && (
              <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                <Link href="/categoria/noticias" style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#555', border: '1px solid #1a1a1a', borderRadius: 8, padding: '10px 24px', textDecoration: 'none' }}>
                  Ver mais notícias →
                </Link>
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Torneios */}
            <div style={{ background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#e8b84b' }}>🏆 TORNEIOS</span>
                <Link href="/torneios" style={{ fontSize: 10, color: '#444', textDecoration: 'none', fontWeight: 700, letterSpacing: '1px' }}>VER TODOS →</Link>
              </div>
              {torneios.length === 0 ? (
                <div style={{ padding: '1.25rem', textAlign: 'center', fontSize: 13, color: '#333' }}>Nenhum torneio aberto</div>
              ) : (
                torneios.map((t, i) => (
                  <Link key={t.id} href={`/torneios/${t.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                    <div style={{ padding: '12px 14px', borderBottom: i < torneios.length - 1 ? '1px solid #141414' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#ddd', marginBottom: 2 }}>{t.name}</div>
                        <div style={{ fontSize: 11, color: '#444' }}>Inscrição R${Number(t.entry_fee).toFixed(0)} · Prêmio R${Number(t.prize).toFixed(0)}</div>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#3ecf8e', background: 'rgba(62,207,142,0.08)', padding: '2px 8px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 }}>ABERTO</span>
                    </div>
                  </Link>
                ))
              )}
              <div style={{ padding: '10px 14px' }}>
                <Link href="/criar-torneio" style={{ display: 'block', textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#e8b84b', textDecoration: 'none', border: '1px solid rgba(232,184,75,0.15)', borderRadius: 8, padding: '9px' }}>
                  ➕ Criar meu torneio — R$10
                </Link>
              </div>
            </div>

            {/* Co-op */}
            <Link href="/coop" style={{ textDecoration: 'none' }}>
              <div style={{ background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 12, padding: '14px', borderLeft: '3px solid #4f7ef8' }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#4f7ef8', marginBottom: 6 }}>🎮 CO-OP 5×5</div>
                <div style={{ fontSize: 13, color: '#888', lineHeight: 1.5 }}>Entre na fila e jogue ao vivo com o FSKATE na próxima live!</div>
                <div style={{ marginTop: 10, fontSize: 11, fontWeight: 700, color: '#4f7ef8', textTransform: 'uppercase', letterSpacing: '1px' }}>Entrar na fila →</div>
              </div>
            </Link>

            {/* Tops */}
            <Link href="/categoria/tops" style={{ textDecoration: 'none' }}>
              <div style={{ background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 12, padding: '14px', borderLeft: '3px solid #f59e0b' }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#f59e0b', marginBottom: 6 }}>🏅 TOPS & RANKINGS</div>
                <div style={{ fontSize: 13, color: '#888', lineHeight: 1.5 }}>Top 10 jogadores, melhores times e rankings da comunidade.</div>
                <div style={{ marginTop: 10, fontSize: 11, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '1px' }}>Ver rankings →</div>
              </div>
            </Link>

          </div>
        </div>
      </main>

      <Footer />

      {/* Responsive */}
      <style>{`
        @media (max-width: 767px) {
          main > div:last-child {
            grid-template-columns: 1fr !important;
          }
          main > div:last-child > div:first-child > div:nth-child(2) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
