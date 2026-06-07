export default function LivePixBanner() {
  return (
    <a href="https://livepix.gg/fskategames" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{ background: 'linear-gradient(135deg, #0e0e0e 0%, #141414 100%)', border: '1px solid #1a1a1a', borderRadius: 12, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, position: 'relative', overflow: 'hidden' }}>
        {/* Glow */}
        <div style={{ position: 'absolute', left: -30, top: -30, width: 120, height: 120, background: 'rgba(232,184,75,0.04)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, background: 'rgba(232,184,75,0.1)', border: '1px solid rgba(232,184,75,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
            💛
          </div>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 14, color: '#e8b84b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 2 }}>
              Apoie o FSKATE GAMES
            </div>
            <div style={{ fontSize: 12, color: '#444' }}>
              livepix.gg/fskategames · Sua contribuição mantém o site no ar!
            </div>
          </div>
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#e8b84b', textTransform: 'uppercase', letterSpacing: '1px', flexShrink: 0, border: '1px solid rgba(232,184,75,0.2)', borderRadius: 8, padding: '7px 14px' }}>
          Apoiar →
        </div>
      </div>
    </a>
  )
}
