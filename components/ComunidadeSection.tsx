export default function ComunidadeSection() {
  const destaques = [
    { label: 'Lives diárias', icon: '🎥', desc: 'TikTok e Twitch todo dia', url: 'https://www.tiktok.com/@fskategames', color: '#ff0050' },
    { label: 'Grupo WhatsApp', icon: '💬', desc: 'Comunidade ativa de eFootball', url: 'https://chat.whatsapp.com/LWhqROJ5fyf3WTOFjMPXGp', color: '#25d366' },
    { label: 'Servidor Discord', icon: '🎮', desc: 'Chat, torneios e muito mais', url: 'https://discord.gg/FjW6eJpcXA', color: '#5865f2' },
    { label: 'Canal YouTube', icon: '▶️', desc: 'Gameplay, guias e highlights', url: 'https://www.youtube.com/@FSKATEGAMES', color: '#ff0000' },
  ]

  return (
    <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem 2rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9', margin: 0 }}>🤝 Comunidade FSKATE</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {destaques.map(d => (
          <a key={d.label} href={d.url} target="_blank" rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}>
            <div style={{
              background: '#111827', border: `1px solid ${d.color}33`,
              borderRadius: 10, padding: '1rem', cursor: 'pointer'
            }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{d.icon}</div>
              <div style={{ fontWeight: 600, color: d.color, fontSize: 13, marginBottom: 3 }}>{d.label}</div>
              <div style={{ color: '#6b7280', fontSize: 12 }}>{d.desc}</div>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
