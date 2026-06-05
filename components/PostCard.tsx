'use client'
import Link from 'next/link'
import { timeAgo } from '@/lib/utils'
import type { Post } from '@/lib/supabase'

export default function PostCard({ post }: { post: Post }) {
  const cat = post.categories
  return (
    <Link href={`/post/${post.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{
        background: '#0e1014', border: '1px solid #1c1f26',
        borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
        transition: 'border-color 0.15s',
        height: '100%', display: 'flex', flexDirection: 'column',
      }}>
        {/* Thumb */}
        <div style={{
          height: 140,
          background: post.cover_image
            ? `url(${post.cover_image}) center/cover`
            : '#14161b',
          display: 'flex', alignItems: 'flex-end', padding: '10px 12px',
          flexShrink: 0,
        }}>
          {!post.cover_image && (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute', fontSize: 28, opacity: 0.08 }}>⚽</div>
          )}
          {cat && (
            <span style={{
              background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
              color: cat.color, border: `1px solid ${cat.color}44`,
              fontSize: 10, fontWeight: 600, padding: '2px 8px',
              borderRadius: 5, letterSpacing: '0.5px', textTransform: 'uppercase',
              position: 'relative',
            }}>
              {cat.name}
            </span>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{
            fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700,
            color: '#e8eaf0', lineHeight: 1.35, marginBottom: 6, flex: 1,
            display: '-webkit-box', WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {post.title}
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <span style={{ fontSize: 11, color: '#4b5060' }}>{timeAgo(post.published_at || post.created_at)}</span>
            {post.auto_published && (
              <span style={{ fontSize: 10, color: '#3ecf8e', fontWeight: 600, letterSpacing: '0.5px' }}>AUTO</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
