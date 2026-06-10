import Image from 'next/image'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid #1d1d20', padding: '2rem 1rem 1.5rem', marginTop: '2rem', background: '#09090b' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24, marginBottom: '1.5rem' }}>

          {/* Logo + slogan */}
          <Link href="/" style={{ display: 'flex', flexDirection: 'column', gap: 8, textDecoration: 'none' }}>
            <Image src="/logo.png" alt="eFootball News" width={600} height={149} style={{ objectFit: 'contain', height: 32, width: 'auto' }} />
            <div style={{ fontSize: 10, color: '#52525b', letterSpacing: '0.3px' }}>
              Notícias, vazamentos, eventos e atualizações do eFootball todos os dias.
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
