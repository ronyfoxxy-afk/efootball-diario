import Link from 'next/link'

export type PostCardType = {
  id: string
  title: string
  slug: string
  summary?: string
  cover_image?: string
  published_at: string
  categories?: { name: string; slug: string; color: string }
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}min`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

export default function PostCard({ post }: { post: PostCardType }) {
  const cat = post.categories as any
  return (
    <Link href={`/post/${post.slug}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <div style={{ background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 12, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', transition: 'border-color 0.2s' }}>
        {post.cover_image && (
          <div style={{ height: 140, overflow: 'hidden', flexShrink: 0 }}>
            <img src={post.cover_image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        )}
        <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {cat && (
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: cat.color, background: cat.color + '18', padding: '2px 7px', borderRadius: 4, width: 'fit-content' }}>
              {cat.name}
            </span>
          )}
          <h3 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 15, fontWeight: 700, color: '#ddd', lineHeight: 1.2, textTransform: 'uppercase', letterSpacing: '0.3px', flex: 1 }}>
            {post.title}
          </h3>
          {post.summary && (
            <p style={{ fontSize: 12, color: '#555', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>
              {post.summary}
            </p>
          )}
          <div style={{ fontSize: 10, color: '#333', fontWeight: 600, letterSpacing: '0.5px', marginTop: 2 }}>
            {timeAgo(post.published_at)} atrás
          </div>
        </div>
      </div>
    </Link>
  )
}
