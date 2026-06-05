'use client'
import Link from 'next/link'
import { timeAgo } from '@/lib/utils'
import type { Post } from '@/lib/supabase'

export default function PostCard({ post }: { post: Post }) {
  const cat = post.categories
  return (
    <Link href={`/post/${post.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{
        background: '#0d1117', border: '1px solid #1f2937',
        borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
        transition: 'border-color 0.2s, transform 0.2s',
        height: '100%',
      }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.borderColor = '#374151'
          ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.borderColor = '#1f2937'
          ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
        }}>

        {/* Thumb */}
        <div style={{
          height: 130,
          background: post.cover_image
            ? `linear-gradient(to bottom, transparent 40%, #0d1117 100%), url(${post.cover_image}) center/cover`
            : 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
          display: 'flex', alignItems: 'flex-end', padding: '10px 12px',
          position: 'relative',
        }}>
          {!post.cover_image && (
            <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-60%)', fontSize: 32, opacity: 0.2 }}>⚽</span>
          )}
          {cat && (
            <span style={{
              background: cat.color, color: '#fff',
              fontSize: 10, fontWeight: 700, padding: '2px 8px',
              borderRadius: 6, letterSpacing: '0.5px', textTransform: 'uppercase',
              fontFamily: "'Inter', sans-serif",
            }}>
              {cat.name}
            </span>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '12px 14px 14px' }}>
          <h3 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 17, fontWeight: 700, color: '#f1f5f9',
            lineHeight: 1.3, marginBottom: 6,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {post.title}
          </h3>
          {post.summary && (
            <p style={{
              fontSize: 12, color: '#64748b', lineHeight: 1.6,
              display: '-webkit-box', WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {post.summary}
            </p>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '8px 14px', borderTop: '1px solid #1f2937',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', fontSize: 11, color: '#475569',
        }}>
          <span>{timeAgo(post.published_at || post.created_at)}</span>
          {post.auto_published && (
            <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '1px 7px', borderRadius: 4, fontWeight: 600 }}>AUTO</span>
          )}
        </div>
      </div>
    </Link>
  )
}
