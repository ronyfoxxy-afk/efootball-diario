import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata = { title: 'Sobre — eFootball News', description: 'Conheça o eFootball News, o portal de notícias sobre eFootball em português.' }

export default function Sobre() {
  return (
    <div style={{ minHeight:'100vh', background:'#09090b' }}>
      <Navbar />
      <main style={{ maxWidth:760, margin:'0 auto', padding:'2rem 1rem 4rem' }}>
        <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:36, color:'#e8b84b', textTransform:'uppercase', letterSpacing:1, marginBottom:'0.5rem' }}>
          Sobre o eFootball News
        </h1>
        <div style={{ width:60, height:3, background:'#e8b84b', borderRadius:2, marginBottom:'2rem' }} />

        <div style={{ fontSize:16, color:'#a1a1aa', lineHeight:1.85 }}>
          <p style={{ marginBottom:'1.25rem' }}>
            O <strong style={{ color:'#e4e4e7' }}>eFootball News</strong> é o portal brasileiro de notícias, vazamentos, eventos e atualizações sobre o eFootball, o jogo de futebol digital da Konami. Nosso objetivo é manter a comunidade brasileira informada com conteúdo diário, rápido e confiável.
          </p>
          <p style={{ marginBottom:'1.25rem' }}>
            O canal é operado pelo criador de conteúdo <strong style={{ color:'#e4e4e7' }}>FSKATE</strong>, presente no TikTok, YouTube, Twitch, Discord e Spotify com o canal <strong style={{ color:'#e4e4e7' }}>FSKATE GAMES</strong>. Com anos de experiência na comunidade de eFootball, o FSKATE traz análises, rankings, guias e as últimas novidades do jogo diretamente para você.
          </p>
          <p style={{ marginBottom:'1.25rem' }}>
            Além das notícias, o eFootball News oferece uma <strong style={{ color:'#e4e4e7' }}>fila de Co-op ao vivo</strong> para os fãs jogarem junto ao FSKATE durante as lives, e um sistema de <strong style={{ color:'#e4e4e7' }}>torneios online</strong> com premiação em dinheiro via Pix.
          </p>
          <p style={{ marginBottom:'1.25rem' }}>
            Nosso conteúdo é gerado de forma automatizada e manual, sempre com curadoria humana, garantindo relevância e qualidade para o leitor.
          </p>

          <div style={{ background:'#111115', border:'1px solid #1d1d20', borderRadius:12, padding:'1.5rem', marginTop:'2rem' }}>
            <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:20, color:'#e4e4e7', textTransform:'uppercase', marginBottom:'1rem' }}>Nossas Redes</h2>
            {[
              ['TikTok', 'https://www.tiktok.com/@fskate.efootball'],
              ['YouTube', 'https://www.youtube.com/@FSKATEGAMES'],
              ['Twitch', 'https://www.twitch.tv/fskate_games'],
              ['Discord', 'https://discord.gg/FjW6eJpcXA'],
              ['Spotify', 'https://spotify.link/CeWiQhEek0b'],
            ].map(([nome, url]) => (
              <div key={nome} style={{ marginBottom:8 }}>
                <a href={url} target="_blank" rel="noopener noreferrer" style={{ color:'#4f7ef8', fontSize:14 }}>{nome} →</a>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
