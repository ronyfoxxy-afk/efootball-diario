'use client'
import { useEffect, useState } from 'react'

export default function LivePixBanner() {
  const [pulse, setPulse] = useState(true)
  useEffect(() => {
    const t = setInterval(() => setPulse(p => !p), 1200)
    return () => clearInterval(t)
  }, [])

  return (
    <a href="https://livepix.gg/fskategames" target="_blank" rel="noopener noreferrer"
      style={{ textDecoration: 'none', display: 'block' }}>
      <div className="livepix-shimmer livepix-banner" style={{
        border: '1px solid #1c1f26',
        borderLeft: '3px solid #fbe900',
        borderRadius: 12, cursor: 'pointer',
        padding: '12px 16px',
        display: 'flex', alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'space-between', gap: '0.75rem',
        transition: 'border-color 0.2s, transform 0.2s',
        animation: 'livepix-glow 3.5s ease-in-out infinite, livepix-shimmer 3.5s ease-in-out infinite',
      }}>
        {/* Esquerda */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: '1 1 200px' }}>
          {/* Indicador ao vivo */}
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fbe900', opacity: pulse ? 1 : 0.3, transition: 'opacity 0.4s' }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: '#fbe900', letterSpacing: '1.5px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Ao vivo</span>
          </div>

          <div style={{ width: 1, height: 24, background: '#1c1f26', flexShrink: 0 }} />

          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 14, color: '#fff', whiteSpace: 'normal', lineHeight: 1.3 }}>
              💰 Doe no LivePix — apareça na live!
            </div>
            <div style={{ fontSize: 11, color: '#4b5060', marginTop: 1, whiteSpace: 'normal' }}>
              livepix.gg/fskategames · mensagem em tempo real
            </div>
          </div>
        </div>

        {/* Direita */}
        <div style={{ flexShrink: 0, background: '#fbe900', color: '#000', fontWeight: 700, fontSize: 12, padding: '8px 18px', borderRadius: 7, whiteSpace: 'nowrap', marginLeft: 'auto' }}>
          Doe →
        </div>
      </div>
    </a>
  )
}
