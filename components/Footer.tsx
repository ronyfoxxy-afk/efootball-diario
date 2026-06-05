export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid #1c1f26', padding: '1.25rem 1rem', marginTop: '1rem' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 22, height: 22, background: '#4f7ef8', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>⚽</div>
          <span style={{ fontSize: 12, color: '#4b5060' }}>eFootball Diário — FSKATE GAMES © 2026</span>
        </div>
        <span style={{ fontSize: 12, color: '#4b5060' }}>Jesus te ama ✝️</span>
      </div>
    </footer>
  )
}
