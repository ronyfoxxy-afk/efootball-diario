import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { timeAgo } from '@/lib/utils'

export const revalidate = 0

export default async function AdminPostsPage() {
  const { data: posts } = await supabase
    .from('posts').select('*, categories(*)')
    .order('created_at', { ascending: false }).limit(50)

  return (
    <div style={{ minHeight: '100vh', background: '#060b18', color: '#f1f5f9' }}>
      <header style={{ background: '#0a0f1e', borderBottom: '1px solid #1f2937', padding: '0 1.5rem', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 600, fontSize: 15 }}>📰 Todos os Posts</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/admin/posts/new" style={{ background: '#2563eb', color: '#fff', padding: '6px 14px', borderRadius: 6, textDecoration: 'none', fontSize: 13 }}>+ Novo post</Link>
          <Link href="/admin" style={{ color: '#6b7280', padding: '6px 14px', borderRadius: 6, textDecoration: 'none', fontSize: 13, border: '1px solid #1f2937' }}>← Admin</Link>
        </div>
      </header>
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem' }}>
        <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#0a0f1e' }}>
                {['Título', 'Categoria', 'Status', 'Data', 'Ações'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#6b7280', fontWeight: 500, fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(posts || []).map((post: any) => (
                <tr key={post.id} style={{ borderTop: '1px solid #1f2937' }}>
                  <td style={{ padding: '10px 14px', maxWidth: 300 }}>
                    <span style={{ color: '#e2e8f0', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    {post.categories && (
                      <span style={{ background: post.categories.color + '22', color: post.categories.color, padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>
                        {post.categories.name}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{
                      background: post.status === 'published' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                      color: post.status === 'published' ? '#10b981' : '#d97706',
                      padding: '2px 8px', borderRadius: 4, fontSize: 11
                    }}>
                      {post.status === 'published' ? 'Publicado' : 'Rascunho'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#6b7280' }}>{timeAgo(post.created_at)}</td>
                  <td style={{ padding: '10px 14px', display: 'flex', gap: 8 }}>
                    <Link href={`/admin/posts/${post.id}`} style={{ color: '#2563eb', textDecoration: 'none', fontSize: 12 }}>Editar</Link>
                    {post.status === 'published' && (
                      <Link href={`/post/${post.slug}`} target="_blank" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 12 }}>Ver →</Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
