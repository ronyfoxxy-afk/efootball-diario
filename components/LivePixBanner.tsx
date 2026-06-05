'use client'
import { useState, useEffect } from 'react'

export default function LivePixBanner() {
  const [pulse, setPulse] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => setPulse(p => !p), 1200)
    return () => clearInterval(interval)
  }, [])

  return (
    <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem 2rem' }}>
      <a href="https://livepix.gg/fskategames" target="_blank" rel="noopener noreferrer"
        style={{ textDecoration: 'none', display: 'block' }}>
        <div style={{
          position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg, #18082a 0%, #2d0a4e 50%, #18082a 100%)',
          border: '1px solid rgba(251,191,36,0.3)',
          borderRadius: 16, padding: '1.5rem 2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '1.5rem', cursor: 'pointer',
          boxShadow: '0 0 40px rgba(251,191,36,0.08)',
        }}>

          {/* Glow bg */}
          <div style={{
            position: 'absolute', top: '-50%', left: '30%',
            width: 300, height: 300,
            background: 'radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Left: Live indicator + text */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', zIndex: 1 }}>
            {/* Live dot */}
            <div style={{ flexShrink: 0, textAlign: 'center' }}>
              <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: 'rgba(251,191,36,0.15)',
                  border: `2px solid ${pulse ? 'rgba(251,191,36,0.8)' : 'rgba(251,191,36,0.3)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'border-color 0.4s',
                  boxShadow: pulse ? '0 0 20px rgba(251,191,36,0.3)' : 'none',
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="#fbbf24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                  </svg>
                </div>
              </div>
              <div style={{
                marginTop: 4, fontSize: 9, fontWeight: 800,
                letterSpacing: '1.5px', textTransform: 'uppercase',
                color: pulse ? '#fbbf24' : '#92400e',
                transition: 'color 0.4s',
              }}>● AO VIVO</div>
            </div>

            <div>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 900, fontSize: 26, color: '#fff',
                lineHeight: 1, marginBottom: 4, letterSpacing: '-0.5px',
              }}>
                💰 Doe no <span style={{ color: '#fbbf24' }}>LivePix</span> e apareça na live!
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
                Sua mensagem aparece na tela durante a live do FSKATE em tempo real
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                {['💬 Mensagem na tela', '⚡ Aparece em tempo real', '🎮 Durante a live de eFootball'].map(t => (
                  <span key={t} style={{ fontSize: 11, color: '#a78bfa', background: 'rgba(167,139,250,0.1)', padding: '2px 8px', borderRadius: 6, fontWeight: 500 }}>{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: CTA button */}
          <div style={{ flexShrink: 0, zIndex: 1 }}>
            <div style={{
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              color: '#000', fontWeight: 800,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 16, padding: '12px 24px',
              borderRadius: 10, letterSpacing: '0.5px',
              textTransform: 'uppercase',
              boxShadow: '0 4px 20px rgba(251,191,36,0.4)',
              whiteSpace: 'nowrap',
            }}>
              Doe agora →
            </div>
            <div style={{ fontSize: 11, color: '#6b7280', textAlign: 'center', marginTop: 5 }}>
              livepix.gg/fskategames
            </div>
          </div>
        </div>
      </a>
    </section>
  )
}
