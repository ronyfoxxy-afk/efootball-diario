export default function Footer() {
  const links = [
    { label: 'TikTok', icon: '🎵', url: 'https://www.tiktok.com/@fskategames', color: '#ff0050' },
    { label: 'YouTube', icon: '▶️', url: 'https://www.youtube.com/@FSKATEGAMES', color: '#ff0000' },
    { label: 'Twitch', icon: '🟣', url: 'https://www.twitch.tv/fskate_games', color: '#9146ff' },
    { label: 'Discord', icon: '🎮', url: 'https://discord.gg/FjW6eJpcXA', color: '#5865f2' },
    { label: 'WhatsApp', icon: '💬', url: 'https://chat.whatsapp.com/LWhqROJ5fyf3WTOFjMPXGp', color: '#25d366' },
    { label: 'LivePix', icon: '💰', url: 'https://livepix.gg/fskategames', color: '#fbbf24' },
    { label: 'Spotify', icon: '🎧', url: 'https://spotify.link/CeWiQhEek0b', color: '#1db954' },
    { label: 'Downloads', icon: '📥', url: 'https://fskategames.blogspot.com', color: '#6b7280' },
  ]

  return (
    <footer style={{ background: '#060b18', borderTop: '1px solid #1f2937', marginTop: '3rem', padding: '2.5rem 1.5rem 1.5rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Comunidade */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ color: '#6b7280', fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>Comunidade</p>
          <h3 style={{ color: '#f1f5f9', fontSize: 20, fontWeight: 700, margin: '0 0 4px' }}>⚽ FSKATE GAMES</h3>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 1.5rem' }}>
            Lives diárias de eFootball • Gameplay • Comunidade ativa
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
            {links.map(link => (
              <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: '#111827', border: `1px solid ${link.color}33`,
                  color: '#e2e8f0', padding: '8px 14px', borderRadius: 8,
                  textDecoration: 'none', fontSize: 13, fontWeight: 500,
                  transition: 'all 0.15s'
                }}>
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid #1f2937', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ color: '#374151', fontSize: 12 }}>© 2026 eFootball Diário — FSKATE GAMES</span>
          <span style={{ color: '#374151', fontSize: 12 }}>Jesus te ama! ✝️</span>
        </div>
      </div>
    </footer>
  )
}
