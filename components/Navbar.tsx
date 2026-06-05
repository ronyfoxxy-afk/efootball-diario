import Link from 'next/link'

const CATEGORIES = [
  { name: 'Notícias', slug: 'noticias' },
  { name: 'Eventos', slug: 'eventos' },
  { name: 'Atualizações', slug: 'atualizacoes' },
  { name: 'Campanhas', slug: 'campanhas' },
  { name: 'Guias', slug: 'guias' },
  { name: 'Vazamentos', slug: 'vazamentos-rumores' },
]

export default function Navbar() {
  return (
    <header style={{ background: '#060b18', borderBottom: '1px solid #1f2937' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 30, height: 30, background: '#2563eb', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⚽</div>
            <span style={{ fontWeight: 600, fontSize: 17, color: '#fff' }}>eFootball Diário</span>
          </Link>
          <nav style={{ display: 'flex', gap: 2 }}>
            {CATEGORIES.map(cat => (
              <Link key={cat.slug} href={`/categoria/${cat.slug}`}
                style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', padding: '5px 10px', borderRadius: 6, textDecoration: 'none' }}>
                {cat.name}
              </Link>
            ))}
            <Link href="/torneios"
              style={{ fontSize: 13, color: '#fbbf24', padding: '5px 10px', borderRadius: 6, textDecoration: 'none', fontWeight: 500 }}>
              🏆 Torneios
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
