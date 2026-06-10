'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { REDES } from '@/lib/social'

const CATS = [
  { name: 'Notícias',     slug: 'noticias' },
  { name: 'Eventos',      slug: 'eventos' },
  { name: 'Atualizações', slug: 'atualizacoes' },
  { name: 'Campanhas',    slug: 'campanhas' },
  { name: 'Guias',        slug: 'guias' },
  { name: 'Vazamentos',   slug: 'vazamentos-rumores' },
  { name: '🏅 Top Rank',  slug: 'top-rank' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showTorneios, setShowTorneios] = useState(true)
  const [showCoop, setShowCoop] = useState(true)

  useEffect(() => {
    supabase.from('site_settings').select('key,value')
      .in('key', ['show_torneios', 'show_coop'])
      .then(({ data }) => {
        if (!data) return
        data.forEach((r: any) => {
          if (r.key === 'show_torneios') setShowTorneios(r.value !== 'false')
          if (r.key === 'show_coop') setShowCoop(r.value !== 'false')
        })
      })
  }, [])

  return (
    <>
      <header style={{ background: 'rgba(9,9,11,0.98)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #1d1d20', position: 'sticky', top: 0, zIndex: 100 }}>

        {/* ── Barra única: hambúrguer + nome centralizado + logo à direita ── */}
        <div style={{ padding: '0 1.25rem', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', maxWidth: 1160, margin: '0 auto' }}>

          {/* Hambúrguer + logo (desktop) — juntos à esquerda */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, zIndex: 1 }}>
            <button onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: menuOpen ? '#18181c' : 'none', border: menuOpen ? '1px solid #1d1d20' : '1px solid transparent', color: '#a1a1aa', cursor: 'pointer', padding: '6px 10px', borderRadius: 8, fontSize: 18 }}>
              {menuOpen ? '✕' : '☰'}
            </button>
            <Link href="/" className="hide-mobile" style={{ alignItems: 'center' }}>
              <Image src="/logo.png" alt="eFootball News" width={600} height={149} style={{ objectFit: 'contain', height: 36, width: 'auto' }} />
            </Link>
          </div>

          {/* Logo centralizada (mobile) */}
          <Link href="/" className="hide-desktop" style={{ alignItems: 'center', textDecoration: 'none', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            <Image src="/logo.png" alt="eFootball News" width={600} height={149} style={{ objectFit: 'contain', height: 38, width: 'auto' }} />
          </Link>


          {/* Espaço reservado à direita para balancear hambúrguer + logo */}
          <div style={{ width: 78, flexShrink: 0 }} />
        </div>

      </header>

      {/* Overlays e drawer FORA do header para não ficar preso no stacking context */}
      {menuOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 299, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }} onClick={() => setMenuOpen(false)} />}

      {/* Mobile drawer — desliza da esquerda */}
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 300,
        width: 272, background: '#0d0d10', borderRight: '1px solid #1d1d20',
        transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', flexDirection: 'column', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem', height: 56, borderBottom: '1px solid #1d1d20', flexShrink: 0 }}>
          <Image src="/logo.png" alt="eFootball News" width={600} height={149} style={{ objectFit: 'contain', height: 30, width: 'auto' }} />
          <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', color: '#71717a', fontSize: 20, cursor: 'pointer', padding: '4px 8px' }}>✕</button>
        </div>
        <div style={{ padding: '8px 0' }}>
          <p style={{ fontSize: 9, color: '#3f3f46', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', padding: '8px 1rem 4px' }}>Categorias</p>
          {CATS.map(c => (
            <Link key={c.slug} href={`/categoria/${c.slug}`} onClick={() => setMenuOpen(false)}
              style={{ display: 'flex', alignItems: 'center', fontSize: 14, color: '#a1a1aa', padding: '11px 1rem', textDecoration: 'none', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid #18181c' }}>
              {c.name}
            </Link>
          ))}
        </div>
        {(showTorneios || showCoop) && (
          <div style={{ padding: '8px 0' }}>
            <p style={{ fontSize: 9, color: '#3f3f46', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', padding: '8px 1rem 4px' }}>Comunidade</p>
            {showTorneios && <Link href="/torneios" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, fontSize: 14, color: '#fbe900', padding: '11px 1rem', textDecoration: 'none', borderBottom: '1px solid #18181c' }}>🏆 Torneios</Link>}
            {showCoop && <Link href="/coop" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, fontSize: 14, color: '#4f7ef8', padding: '11px 1rem', textDecoration: 'none', borderBottom: '1px solid #18181c' }}>🎮 Co-op 3x3</Link>}
          </div>
        )}
        <div style={{ padding: '8px 1rem 1.5rem', marginTop: 'auto' }}>
          <p style={{ fontSize: 9, color: '#3f3f46', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8, paddingTop: 8 }}>Redes sociais</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {REDES.map(r => (
              <a key={r.label} href={r.url} target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px', background: '#111115', borderRadius: 8, textDecoration: 'none', color: '#a1a1aa', fontSize: 13, border: '1px solid #1d1d20' }}>
                <span style={{ width: 15, height: 15, color: r.color, flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: r.svg }} />
                {r.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
