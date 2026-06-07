'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

const CATS = [
  { name: 'Notícias', slug: 'noticias' },
  { name: 'Eventos', slug: 'eventos' },
  { name: 'Atualizações', slug: 'atualizacoes' },
  { name: 'Campanhas', slug: 'campanhas' },
  { name: 'Guias', slug: 'guias' },
  { name: 'Tops', slug: 'tops' },
  { name: 'Vazamentos', slug: 'vazamentos-rumores' },
]

const REDES = [
  { label: 'TikTok', url: 'https://www.tiktok.com/@fskate.efootball', color: '#ff2d55', icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.54V6.78a4.85 4.85 0 01-1.02-.09z"/></svg>` },
  { label: 'YouTube', url: 'https://www.youtube.com/@FSKATEGAMES', color: '#ff4444', icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.19a3.02 3.02 0 00-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 00.5 6.19C0 8.04 0 12 0 12s0 3.96.5 5.81a3.02 3.02 0 002.12 2.14C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.55a3.02 3.02 0 002.12-2.14C24 15.96 24 12 24 12s0-3.96-.5-5.81zM9.75 15.52V8.48L15.5 12l-5.75 3.52z"/></svg>` },
  { label: 'Twitch', url: 'https://www.twitch.tv/fskate_games', color: '#9146ff', icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>` },
  { label: 'Discord', url: 'https://discord.gg/FjW6eJpcXA', color: '#5865f2', icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.1.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"/></svg>` },
  { label: 'WhatsApp', url: 'https://chat.whatsapp.com/LWhqROJ5fyf3WTOFjMPXGp', color: '#25d366', icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>` },
  { label: 'Spotify', url: 'https://spotify.link/CeWiQhEek0b', color: '#1db954', icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>` },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [redesOpen, setRedesOpen] = useState(false)

  return (
    <>
      <style>{`
        .navbar-top { background: #0a0a0a; border-bottom: 1px solid #1a1a1a; }
        .navbar-cats { background: #111; border-bottom: 1px solid #1a1a1a; position: sticky; top: 0; z-index: 100; }
        .cat-link { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #555; text-decoration: none; padding: 0 12px; white-space: nowrap; transition: color 0.15s; }
        .cat-link:hover { color: #e8b84b; }
        .cat-link.tops { color: #f59e0b; }
        .redes-btn { background: none; border: 1px solid #222; border-radius: 6px; color: #555; cursor: pointer; font-family: inherit; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; padding: 5px 10px; display: flex; align-items: center; gap: 6px; transition: all 0.15s; }
        .redes-btn:hover { border-color: #333; color: #888; }
        .rede-item { display: flex; align-items: center; gap: 10px; padding: 9px 14px; text-decoration: none; color: #888; font-size: 13px; transition: background 0.15s; border-radius: 6px; }
        .rede-item:hover { background: rgba(255,255,255,0.04); color: #ccc; }
        .hamburger { background: none; border: 1px solid #222; border-radius: 6px; color: #888; cursor: pointer; padding: 7px 10px; display: flex; flex-direction: column; gap: 4px; }
        .ham-line { width: 18px; height: 1.5px; background: currentColor; border-radius: 2px; transition: all 0.2s; }
        @media (min-width: 768px) { .mobile-only { display: none !important; } }
        @media (max-width: 767px) { .desktop-only { display: none !important; } .cat-link { padding: 0 8px; font-size: 10px; } }
      `}</style>

      {/* BARRA SUPERIOR — Logo + Redes */}
      <div className="navbar-top">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1rem', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Mobile: hamburger esquerda */}
          <div className="mobile-only">
            <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
              <div className="ham-line" />
              <div className="ham-line" />
              <div className="ham-line" />
            </button>
          </div>

          {/* Logo — centralizado no mobile, esquerda no desktop */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }} className="mobile-only">
            <Image src="/logo.png" alt="eFootball News" width={36} height={36} style={{ borderRadius: 7 }} />
            <div>
              <div style={{ fontFamily: "'Barlow Condensed','Syne',sans-serif", fontWeight: 900, fontSize: 16, lineHeight: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <span style={{ color: '#e8b84b' }}>e</span><span style={{ color: '#fff' }}>FOOTBALL</span>
              </div>
              <div style={{ fontSize: 9, color: '#e8b84b', letterSpacing: '3px', fontWeight: 700 }}>— NEWS —</div>
            </div>
          </Link>

          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }} className="desktop-only">
            <Image src="/logo.png" alt="eFootball News" width={40} height={40} style={{ borderRadius: 8 }} />
            <div>
              <div style={{ fontFamily: "'Barlow Condensed','Syne',sans-serif", fontWeight: 900, fontSize: 18, lineHeight: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <span style={{ color: '#e8b84b' }}>e</span><span style={{ color: '#fff' }}>FOOTBALL</span>
              </div>
              <div style={{ fontSize: 9, color: '#e8b84b', letterSpacing: '3px', fontWeight: 700 }}>— NEWS —</div>
            </div>
          </Link>

          {/* Direita: Torneio + Co-op + Redes */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/torneios" className="desktop-only" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#e8b84b', textDecoration: 'none', padding: '5px 10px', border: '1px solid rgba(232,184,75,0.2)', borderRadius: 6 }}>
              🏆 Torneios
            </Link>
            <Link href="/coop" className="desktop-only" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#4f7ef8', textDecoration: 'none', padding: '5px 10px', border: '1px solid rgba(79,126,248,0.2)', borderRadius: 6 }}>
              🎮 Co-op
            </Link>

            {/* Redes Sociais dropdown */}
            <div style={{ position: 'relative' }}>
              <button className="redes-btn" onClick={() => setRedesOpen(!redesOpen)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                <span className="desktop-only">Redes</span>
                <span style={{ fontSize: 9, opacity: 0.5 }}>▼</span>
              </button>
              {redesOpen && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 6, background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 10, padding: 6, minWidth: 180, zIndex: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
                  {REDES.map(r => (
                    <a key={r.label} href={r.url} target="_blank" rel="noopener noreferrer" className="rede-item" onClick={() => setRedesOpen(false)}>
                      <span style={{ width: 16, height: 16, color: r.color, flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: r.icon }} />
                      <span style={{ fontSize: 12 }}>{r.label}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile: apenas hamburger de categorias */}
            <div className="mobile-only" style={{ width: 8 }} />
          </div>
        </div>
      </div>

      {/* BARRA INFERIOR — Categorias (desktop) */}
      <div className="navbar-cats desktop-only">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1rem', height: 38, display: 'flex', alignItems: 'center', gap: 0 }}>
          {CATS.map(c => (
            <Link key={c.slug} href={`/categoria/${c.slug}`} className={`cat-link${c.slug === 'tops' ? ' tops' : ''}`}>
              {c.name.toUpperCase()}
            </Link>
          ))}
        </div>
      </div>

      {/* MENU MOBILE */}
      {menuOpen && (
        <div className="mobile-only" style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={() => setMenuOpen(false)}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '80%', maxWidth: 300, background: '#0a0a0a', borderRight: '1px solid #1a1a1a', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            {/* Header mobile menu */}
            <div style={{ padding: '16px', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 14, color: '#fff', textTransform: 'uppercase' }}>
                <span style={{ color: '#e8b84b' }}>e</span>FOOTBALL NEWS
              </div>
              <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', color: '#555', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            {/* Categorias */}
            <div style={{ padding: '8px' }}>
              <div style={{ fontSize: 9, color: '#333', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', padding: '8px 10px 4px' }}>Categorias</div>
              {CATS.map(c => (
                <Link key={c.slug} href={`/categoria/${c.slug}`} onClick={() => setMenuOpen(false)}
                  style={{ display: 'block', padding: '10px 12px', borderRadius: 8, textDecoration: 'none', color: c.slug === 'tops' ? '#f59e0b' : '#888', fontSize: 13, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  {c.name}
                </Link>
              ))}
            </div>

            {/* Links especiais */}
            <div style={{ padding: '8px', borderTop: '1px solid #1a1a1a' }}>
              <Link href="/torneios" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '10px 12px', borderRadius: 8, textDecoration: 'none', color: '#e8b84b', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                🏆 Torneios
              </Link>
              <Link href="/coop" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '10px 12px', borderRadius: 8, textDecoration: 'none', color: '#4f7ef8', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                🎮 Co-op ao vivo
              </Link>
              <Link href="/criar-torneio" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '10px 12px', borderRadius: 8, textDecoration: 'none', color: '#555', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                ➕ Criar torneio
              </Link>
            </div>

            {/* Redes */}
            <div style={{ padding: '8px', borderTop: '1px solid #1a1a1a' }}>
              <div style={{ fontSize: 9, color: '#333', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', padding: '8px 10px 4px' }}>Redes Sociais</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, padding: '4px' }}>
                {REDES.map(r => (
                  <a key={r.label} href={r.url} target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px', background: '#111', borderRadius: 8, textDecoration: 'none', color: '#777', fontSize: 12, border: '1px solid #1a1a1a' }}>
                    <span style={{ width: 14, height: 14, color: r.color, flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: r.icon }} />
                    {r.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {redesOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setRedesOpen(false)} />}
    </>
  )
}
