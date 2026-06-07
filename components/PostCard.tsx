'use client'
import Link from 'next/link'
import { timeAgo } from '@/lib/utils'
import type { Post } from '@/lib/supabase'

export default function PostCard({ post }: { post: Post }) {
  const cat = post.categories
  return (
    <Link href={`/post/${post.slug}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <div className="card-hover" style={{
        background: '#111115', border: '1px solid #1d1d20',
        borderRadius: 12, overflow: 'hidden',
        height: '100%', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ height: 130, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
          <div className="thumb-inner" style={{
            width: '100%', height: '100%',
            background: post.cover_image
              ? `url(${post.cover_image}) center/cover`
              : 'linear-gradient(135deg,#1a1020,#0d1a2e)',
            transition: 'transform 0.3s',
          }} />
          {/* gradient overlay at bottom */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(9,9,11,.7) 0%, transparent 60%)' }} />
          {cat && (
            <span style={{
              position: 'absolute', bottom: 8, left: 10,
              background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
              color: cat.color, border: `1px solid ${cat.color}44`,
              fontSize: 9, fontWeight: 700, padding: '2px 7px',
              borderRadius: 4, letterSpacing: '1px', textTransform: 'uppercase',
            }}>
              {cat.name}
            </span>
          )}
        </div>
        <div style={{ padding: '10px 12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, fontWeight: 700,
            color: '#e4e4e7', lineHeight: 1.2, marginBottom: 6, flex: 1,
            textTransform: 'uppercase', letterSpacing: '0.3px',
            display: '-webkit-box', WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {post.title}
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
            <span style={{ fontSize: 10, color: '#52525b' }}>{timeAgo(post.published_at || post.created_at)}</span>
            {post.auto_published && (
              <span style={{ fontSize: 9, color: '#22d3a0', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' }}>AUTO</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
