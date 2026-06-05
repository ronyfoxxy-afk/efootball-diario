import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export const revalidate = 0

export default async function AdminPage() {
  const { count: totalPosts } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'published')
  const { count: drafts } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'draft')
  const { count: autoToday } = await supabase.from('posts').select('*', { count: 'exact', head: true })
    .eq('auto_published', true).gte('published_at', new Date().toISOString().split('T')[0])
  const { count: totalTournaments } = await supabase.from('tournaments').select('*', { count: 'exact', head: true })

  const { data: recentPosts } = await supabase.from('posts').select('*, categories(*)')
    .order('created_at', { ascending: false }).limit(10)

  return (
    <div style={{ minHeight: '100vh', background: '#060b18', color: '#f1f5f9' }}>
      <header style={{ background: '#0a0f1e', borderBottom: '1px solid #1f2937', padding: '0 1.5rem', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, background: '#2563eb', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚽</div>
          <span style={{ fontWeight: 600, fontSize: 15 }}>Admin — eFootball Diário</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/admin/posts/new" style={{ background: '#2563eb', color: '#fff', padding: '6px 14px', borderRadius: 6, textDecoration: 'none', fontSize: 13 }}>+ Novo post</Link>
          <Link href="/admin/torneios/new" style={{ background: '#d97706', color: '#fff', padding: '6px 14px', borderRadius: 6, textDecoration: 'none', fontSize: 13 }}>🏆 Novo torneio</Link>
          <Link href="/" style={{ color: '#6b7280', padding: '6px 14px', borderRadius: 6, textDecoration: 'none', fontSize: 13, border: '1px solid #1f2937' }}>← Portal</Link>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: '1.5rem' }}>
          {[
            { label: 'Posts publicados', value: totalPosts || 0, color: '#f1f5f9' },
            { label: 'Rascunhos', value: drafts || 0, color: '#d97706' },
            { label: 'Auto-pub hoje', value: autoToday || 0, color: '#10b981' },
            { label: 'Torneios', value: totalTournaments || 0, color: '#fbbf24' },
          ].map(s => (
            <div key={s.label} style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 10, padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: '1.5rem' }}>
          <Link href="/admin/posts" style={{ textDecoration: 'none', background: '#111827', border: '1px solid #1f2937', borderRadius: 10, padding: '1rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>📰</span>
            <div>
              <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: 14 }}>Gerenciar Posts</div>
              <div style={{ color: '#6b7280', fontSize: 12 }}>Editar, publicar e excluir</div>
            </div>
          </Link>
          <Link href="/admin/torneios" style={{ textDecoration: 'none', background: '#111827', border: '1px solid #1f2937', borderRadius: 10, padding: '1rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>🏆</span>
            <div>
              <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: 14 }}>Gerenciar Torneios</div>
              <div style={{ color: '#6b7280', fontSize: 12 }}>Criar e gerir competições</div>
            </div>
          </Link>
          <Link href="/admin/posts/new" style={{ textDecoration: 'none', background: 'rgba(37,99,235,0.1)', border: '1px solid #2563eb44', borderRadius: 10, padding: '1rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>✍️</span>
            <div>
              <div style={{ fontWeight: 600, color: '#93c5fd', fontSize: 14 }}>Novo Post</div>
              <div style={{ color: '#6b7280', fontSize: 12 }}>Criar conteúdo manualmente</div>
            </div>
          </Link>
        </div>

        {/* Posts recentes */}
        <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #1f2937', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Posts recentes</h2>
            <Link href="/admin/posts" style={{ fontSize: 12, color: '#2563eb', textDecoration: 'none' }}>Ver todos →</Link>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#0a0f1e' }}>
                {['Título', 'Categoria', 'Status', 'Origem', 'Ações'].map(h => (
                  <th key={h} style={{ padding: '8px 14px', textAlign: 'left', color: '#6b7280', fontWeight: 500, fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(recentPosts || []).map((post: any) => (
                <tr key={post.id} style={{ borderTop: '1px solid #1f2937' }}>
                  <td style={{ padding: '10px 14px', maxWidth: 280 }}>
                    <span style={{ color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{post.title}</span>
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
                  <td style={{ padding: '10px 14px', color: '#6b7280' }}>
                    {post.auto_published ? '🤖 Auto' : post.source_type === 'official' ? '🌐 Oficial' : '✍️ Manual'}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <Link href={`/admin/posts/${post.id}`} style={{ color: '#2563eb', textDecoration: 'none', marginRight: 10, fontSize: 12 }}>Editar</Link>
                    {post.status === 'published' && (
                      <Link href={`/post/${post.slug}`} style={{ color: '#6b7280', textDecoration: 'none', fontSize: 12 }}>Ver →</Link>
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
