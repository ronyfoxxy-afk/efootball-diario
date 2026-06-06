import Image from 'next/image'

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid #1c1f26', padding: '1.25rem 1rem', marginTop: '1rem' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Image src="/logo.png" alt="eFootball News" width={28} height={28} style={{ borderRadius: 6 }} />
          <div>
            <div style={{ fontSize: 13, fontFamily: "'Syne',sans-serif", fontWeight: 800, lineHeight: 1 }}>
              <span style={{ color: '#e8b84b' }}>e</span><span style={{ color: '#fff' }}>FOOTBALL</span>
              <span style={{ color: '#e8b84b', marginLeft: 4 }}>NEWS</span>
            </div>
            <div style={{ fontSize: 11, color: '#4b5060', marginTop: 1 }}>FSKATE GAMES © 2026</div>
          </div>
        </div>
        <span style={{ fontSize: 12, color: '#4b5060' }}>Jesus te ama ✝️</span>
      </div>
    </footer>
  )
}
