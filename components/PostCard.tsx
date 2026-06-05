import Link from 'next/link'
import { timeAgo } from '@/lib/utils'
import type { Post } from '@/lib/supabase'

export default function PostCard({ post }: { post: Post }) {
  const cat = post.categories
  return (
    <Link href={`/post/${post.slug}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.15s' }}>
        <div style={{
          height: 120, background: post.cover_image ? `url(${post.cover_image}) center/cover` : '#1f2937',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36
        }}>
          {!post.cover_image && '⚽'}
        </div>
        <div style={{ padding: '10px 14px 14px' }}>
          {cat && (
            <span className="badge" style={{ background: cat.color + '22', color: cat.color, marginBottom: 6 }}>
              {cat.name}
            </span>
          )}
          <h3 style={{ fontSize: 14, fontWeight: 500, color: '#f1f5f9', lineHeight: 1.4, margin: '0 0 6px' }}>
            {post.title}
          </h3>
          {post.summary && (
            <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5, margin: 0,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {post.summary}
            </p>
          )}
        </div>
        <div style={{ padding: '8px 14px', borderTop: '1px solid #1f2937', display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6b7280' }}>
          <span>{timeAgo(post.published_at || post.created_at)}</span>
          {post.auto_published && (
            <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '1px 6px', borderRadius: 4 }}>Auto</span>
          )}
        </div>
      </div>
    </Link>
  )
}
