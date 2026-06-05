'use client'
import Link from 'next/link'
import { useState } from 'react'

const CATS = [
  { name: 'Notícias', slug: 'noticias' },
  { name: 'Eventos', slug: 'eventos' },
  { name: 'Atualizações', slug: 'atualizacoes' },
  { name: 'Guias', slug: 'guias' },
  { name: 'Vazamentos', slug: 'vazamentos-rumores' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <header style={{
        background: 'rgba(8,9,12,0.96)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #1c1f26',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 58 }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, background: '#4f7ef8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>⚽</div>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: '#fff', lineHeight: 1 }}>eFootball Diário</div>
              <div style={{ fontSize: 10, color: '#4b5060', lineHeight: 1, marginTop: 2, letterSpacing: '1px' }}>FSKATE GAMES</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hide-mobile" style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {CATS.map(c => (
              <Link key={c.slug} href={`/categoria/${c.slug}`}
                style={{ fontSize: 13, color: '#8b909e', padding: '5px 10px', borderRadius: 7, textDecoration: 'none', fontWeight: 500 }}>
                {c.name}
              </Link>
            ))}
            <Link href="/torneios" style={{
              marginLeft: 8, fontSize: 13, fontWeight: 600,
              background: 'rgba(232,184,75,0.1)', color: '#e8b84b',
              border: '1px solid rgba(232,184,75,0.2)',
              padding: '5px 14px', borderRadius: 7, textDecoration: 'none',
            }}>🏆 Torneios</Link>
          </nav>

          {/* Mobile hamburger */}
          <button className="hide-desktop" onClick={() => setOpen(!open)}
            style={{ background: 'none', border: 'none', color: '#8b909e', cursor: 'pointer', padding: 6, fontSize: 20 }}>
            {open ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="hide-desktop" style={{ borderTop: '1px solid #1c1f26', background: '#0e1014', padding: '0.75rem 1.25rem', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {CATS.map(c => (
              <Link key={c.slug} href={`/categoria/${c.slug}`} onClick={() => setOpen(false)}
                style={{ fontSize: 14, color: '#8b909e', padding: '9px 10px', borderRadius: 7, textDecoration: 'none', fontWeight: 500, display: 'block' }}>
                {c.name}
              </Link>
            ))}
            <Link href="/torneios" onClick={() => setOpen(false)}
              style={{ fontSize: 14, fontWeight: 600, color: '#e8b84b', padding: '9px 10px', borderRadius: 7, textDecoration: 'none', display: 'block', marginTop: 4 }}>
              🏆 Torneios
            </Link>
          </div>
        )}
      </header>
    </>
  )
}
