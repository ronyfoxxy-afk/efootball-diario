'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const CATS = [
  { name: 'Notícias',     slug: 'noticias' },
  { name: 'Eventos',      slug: 'eventos' },
  { name: 'Atualizações', slug: 'atualizacoes' },
  { name: 'Campanhas',    slug: 'campanhas' },
  { name: 'Guias',        slug: 'guias' },
  { name: 'Vazamentos',   slug: 'vazamentos-rumores' },
  { name: '🏅 Top Rank',  slug: 'top-rank' },
]

const REDES = [
  { label: 'TikTok',    url: 'https://www.tiktok.com/@fskate.efootball',  color: '#ff2d55', svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.54V6.78a4.85 4.85 0 01-1.02-.09z"/></svg>` },
  { label: 'YouTube',   url: 'https://www.youtube.com/@FSKATEGAMES',      color: '#ff4444', svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.19a3.02 3.02 0 00-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 00.5 6.19C0 8.04 0 12 0 12s0 3.96.5 5.81a3.02 3.02 0 002.12 2.14C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.55a3.02 3.02 0 002.12-2.14C24 15.96 24 12 24 12s0-3.96-.5-5.81zM9.75 15.52V8.48L15.5 12l-5.75 3.52z"/></svg>` },
  { label: 'Twitch',    url: 'https://www.twitch.tv/fskate_games',        color: '#9146ff', svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>` },
  { label: 'Discord',   url: 'https://discord.gg/FjW6eJpcXA',            color: '#5865f2', svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128c.126-.094.252-.192.372-.292a.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.1.246.198.373.292a.077.077 0 01-.006.127c-.598.35-1.22.645-1.873.892a.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"/></svg>` },
  { label: 'Spotify',   url: 'https://spotify.link/CeWiQhEek0b',         color: '#1db954', svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>` },
  { label: 'Downloads', url: 'https://fskategames.blogspot.com',          color: '#6b7280', svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 16l-5-5h3V4h4v7h3l-5 5zm-7 4h14v-2H5v2z"/></svg>` },
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

          {/* Hambúrguer + logo — juntos à esquerda */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, zIndex: 1 }}>
            <button onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: menuOpen ? '#18181c' : 'none', border: menuOpen ? '1px solid #1d1d20' : '1px solid transparent', color: '#a1a1aa', cursor: 'pointer', padding: '6px 10px', borderRadius: 8, fontSize: 18 }}>
              {menuOpen ? '✕' : '☰'}
            </button>
            <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
              <Image src="/logo-icon.png" alt="eFootball News" width={34} height={30} style={{ objectFit: 'contain' }} />
            </Link>
          </div>

          {/* Nome centralizado */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 20, lineHeight: 1, letterSpacing: 2, textTransform: 'uppercase' }}>
                <span style={{ color: '#e8b84b' }}>e</span><span style={{ color: '#fff' }}>FOOTBALL</span>
              </div>
              <div style={{ fontSize: 9, color: '#e8b84b', letterSpacing: '3px', fontWeight: 700, lineHeight: 1, marginTop: 2, textAlign: 'center' }}>— NEWS —</div>
            </div>
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem', height: 52, borderBottom: '1px solid #1d1d20', flexShrink: 0 }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 16, letterSpacing: 2, textTransform: 'uppercase' }}>
            <span style={{ color: '#e8b84b' }}>e</span><span style={{ color: '#fff' }}>FOOTBALL</span>
          </div>
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
            {showTorneios && <Link href="/torneios" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, fontSize: 14, color: '#e8b84b', padding: '11px 1rem', textDecoration: 'none', borderBottom: '1px solid #18181c' }}>🏆 Torneios</Link>}
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
