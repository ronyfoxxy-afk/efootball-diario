import Image from 'next/image'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid #1d1d20', padding: '1.5rem 1rem', marginTop: '2rem', background: '#09090b' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Image src="/logo.png" alt="eFootball News" width={30} height={30} style={{ borderRadius: 6 }} />
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 15, lineHeight: 1, letterSpacing: 1, textTransform: 'uppercase' }}>
              <span style={{ color: '#e8b84b' }}>e</span><span style={{ color: '#fff' }}>FOOTBALL</span>
              <span style={{ color: '#e8b84b', marginLeft: 6 }}>NEWS</span>
            </div>
            <div style={{ fontSize: 10, color: '#52525b', marginTop: 2, letterSpacing: '0.5px' }}>FSKATE GAMES © 2026</div>
          </div>
        </Link>
        <span style={{ fontSize: 12, color: '#3f3f46' }}>Jesus te ama ✝️</span>
      </div>
    </footer>
  )
}
