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
      <div style={{
        background: '#0e1014',
        border: '1px solid #1c1f26',
        borderLeft: '3px solid #e8b84b',
        borderRadius: 12, cursor: 'pointer',
        padding: '12px 16px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: '1rem',
        transition: 'border-color 0.2s',
      }}>
        {/* Esquerda */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          {/* Indicador ao vivo */}
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#e8b84b', opacity: pulse ? 1 : 0.3, transition: 'opacity 0.4s' }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: '#e8b84b', letterSpacing: '1.5px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Ao vivo</span>
          </div>

          <div style={{ width: 1, height: 24, background: '#1c1f26', flexShrink: 0 }} />

          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 14, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              💰 Doe no LivePix — apareça na live!
            </div>
            <div style={{ fontSize: 11, color: '#4b5060', marginTop: 1 }}>
              livepix.gg/fskategames · mensagem em tempo real
            </div>
          </div>
        </div>

        {/* Direita */}
        <div style={{ flexShrink: 0, background: '#e8b84b', color: '#000', fontWeight: 700, fontSize: 12, padding: '6px 14px', borderRadius: 7, whiteSpace: 'nowrap' }}>
          Doe →
        </div>
      </div>
    </a>
  )
}
