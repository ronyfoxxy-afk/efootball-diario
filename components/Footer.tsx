import Image from 'next/image'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid #1d1d20', padding: '2rem 1rem 1.5rem', marginTop: '2rem', background: '#09090b' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24, marginBottom: '1.5rem' }}>

          {/* Logo + slogan */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <Image src="/logo.png" alt="eFootball News" width={32} height={32} style={{ borderRadius: 6 }} />
            <div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 16, lineHeight: 1, letterSpacing: 1, textTransform: 'uppercase' }}>
                <span style={{ color: '#e8b84b' }}>e</span><span style={{ color: '#fff' }}>FOOTBALL</span>
                <span style={{ color: '#e8b84b', marginLeft: 6 }}>NEWS</span>
              </div>
              <div style={{ fontSize: 10, color: '#52525b', marginTop: 3, letterSpacing: '0.3px' }}>
                Notícias, vazamentos, eventos e atualizações do eFootball todos os dias.
              </div>
            </div>
          </Link>

          {/* Links institucionais */}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            {[
              { href: '/sobre',       label: 'Sobre' },
              { href: '/contato',     label: 'Contato' },
              { href: '/privacidade', label: 'Privacidade' },
              { href: '/termos',      label: 'Termos de Uso' },
            ].map(l => (
              <Link key={l.href} href={l.href}
                style={{ fontSize: 12, color: '#52525b', textDecoration: 'none', fontWeight: 600, letterSpacing: '0.3px' }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div style={{ borderTop: '1px solid #1d1d20', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#3f3f46' }}>FSKATE GAMES © 2026 — Todos os direitos reservados</span>
          <span style={{ fontSize: 11, color: '#3f3f46' }}>Jesus te ama ✝️</span>
        </div>
      </div>
    </footer>
  )
}
