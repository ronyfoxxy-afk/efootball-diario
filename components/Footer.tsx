export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid #1c1f26', padding: '1.5rem 1.25rem' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, background: '#4f7ef8', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>⚽</div>
          <span style={{ fontSize: 13, color: '#4b5060' }}>eFootball Diário — FSKATE GAMES © 2026</span>
        </div>
        <span style={{ fontSize: 12, color: '#4b5060' }}>Jesus te ama ✝️</span>
      </div>
    </footer>
  )
}
