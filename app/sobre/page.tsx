import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { REDES } from '@/lib/social'

export const metadata = { title: 'Sobre — eFootball News', description: 'Conheça o eFootball News, o portal de notícias sobre eFootball em português.' }

export default function Sobre() {
  return (
    <div style={{ minHeight:'100vh', background:'#09090b' }}>
      <Navbar />
      <main style={{ maxWidth:760, margin:'0 auto', padding:'2rem 1rem 4rem' }}>
        <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:36, color:'#fbe900', textTransform:'uppercase', letterSpacing:1, marginBottom:'0.5rem' }}>
          Sobre o eFootball News
        </h1>
        <div style={{ width:60, height:3, background:'#fbe900', borderRadius:2, marginBottom:'2rem' }} />

        <div style={{ fontSize:16, color:'#a1a1aa', lineHeight:1.85 }}>
          <p style={{ marginBottom:'1.25rem' }}>
            O <strong style={{ color:'#e4e4e7' }}>eFootball News</strong> é o portal brasileiro de notícias, vazamentos, eventos e atualizações sobre o eFootball, o jogo de futebol digital da Konami. Nosso objetivo é manter a comunidade brasileira informada com conteúdo diário, rápido e confiável.
          </p>
          <p style={{ marginBottom:'1.25rem' }}>
            O canal é operado pelo criador de conteúdo <strong style={{ color:'#e4e4e7' }}>FSKATE</strong>, presente no TikTok, YouTube, Twitch, Discord e Spotify com o canal <strong style={{ color:'#e4e4e7' }}>FSKATE GAMES</strong>. Com anos de experiência na comunidade de eFootball, o FSKATE traz análises, rankings, guias e as últimas novidades do jogo diretamente para você.
          </p>
          <p style={{ marginBottom:'1.25rem' }}>
            Além das notícias, o eFootball News oferece uma <strong style={{ color:'#e4e4e7' }}>fila de Co-op ao vivo</strong> para os fãs jogarem junto ao FSKATE durante as lives.
          </p>
          <p style={{ marginBottom:'2.5rem' }}>
            Nosso conteúdo é gerado de forma automatizada e manual, sempre com curadoria humana, garantindo relevância e qualidade para o leitor.
          </p>

          {/* Nossas redes — minimalista */}
          <div>
            <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:14, color:'#52525b', textTransform:'uppercase', letterSpacing:'2px', marginBottom:'1rem' }}>
              Nossas redes
            </h2>
            <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
              {REDES.filter(r => r.label !== 'Downloads').map(r => (
                <a key={r.label} href={r.url} target="_blank" rel="noopener noreferrer"
                  style={{
                    display:'flex', alignItems:'center', gap:8,
                    background:'#111115', border:'1px solid #1d1d20', borderRadius:24,
                    padding:'8px 16px 8px 12px', textDecoration:'none', color:'#a1a1aa',
                    fontSize:13, fontWeight:600, transition:'border-color .15s, color .15s',
                  }}>
                  <span style={{ width:18, height:18, color:r.color, flexShrink:0, display:'flex' }} dangerouslySetInnerHTML={{ __html: r.svg }} />
                  {r.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
