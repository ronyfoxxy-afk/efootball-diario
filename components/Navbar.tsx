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
    <header style={{
      background: 'rgba(5,8,15,0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid #1f2937',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              borderRadius: 10, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 18,
              boxShadow: '0 0 20px rgba(37,99,235,0.4)'
            }}>⚽</div>
            <div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 20, color: '#fff', lineHeight: 1, letterSpacing: '-0.5px' }}>eFOOTBALL</div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: 13, color: '#3b82f6', lineHeight: 1, letterSpacing: '3px', textTransform: 'uppercase' }}>Diário</div>
            </div>
          </Link>

          {/* Nav */}
          <nav style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {CATEGORIES.map(cat => (
              <Link key={cat.slug} href={`/categoria/${cat.slug}`}
                style={{ fontSize: 13, color: '#64748b', padding: '6px 11px', borderRadius: 8, textDecoration: 'none', fontWeight: 500, transition: 'color 0.15s' }}>
                {cat.name}
              </Link>
            ))}
            <Link href="/torneios" style={{
              marginLeft: 6, fontSize: 13, fontWeight: 700,
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              color: '#000', padding: '6px 14px',
              borderRadius: 8, textDecoration: 'none',
              fontFamily: "'Barlow Condensed', sans-serif",
              letterSpacing: '0.5px', textTransform: 'uppercase',
            }}>
              🏆 Torneios
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
