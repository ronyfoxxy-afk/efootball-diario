import Link from 'next/link'

export default function LivePixBanner() {
  return (
    <a href="https://livepix.gg/fskategames" target="_blank" rel="noopener noreferrer"
      style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{
        background: '#0e1014',
        border: '1px solid #1c1f26',
        borderLeft: '3px solid #e8b84b',
        borderRadius: 12,
        padding: '1rem 1.25rem',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: '1rem',
        cursor: 'pointer',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          {/* Live dot */}
          <div style={{ flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#e8b84b', animation: 'pulse 1.5s infinite' }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: '#e8b84b', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Ao vivo</span>
            </div>
          </div>

          <div style={{ width: 1, height: 28, background: '#1c1f26', flexShrink: 0 }} />

          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15, color: '#fff', marginBottom: 2 }}>
              Doe no LivePix — sua mensagem aparece na live
            </div>
            <div style={{ fontSize: 12, color: '#4b5060' }}>
              livepix.gg/fskategames · mensagem em tempo real durante a live de eFootball
            </div>
          </div>
        </div>

        <div style={{
          flexShrink: 0,
          background: '#e8b84b', color: '#000',
          fontWeight: 700, fontSize: 13,
          padding: '7px 16px', borderRadius: 7,
          whiteSpace: 'nowrap',
        }}>
          Doe agora →
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </a>
  )
}
