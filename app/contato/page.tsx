import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata = { title: 'Contato — eFootball News', description: 'Entre em contato com o eFootball News.' }

export default function Contato() {
  return (
    <div style={{ minHeight:'100vh', background:'#09090b' }}>
      <Navbar />
      <main style={{ maxWidth:760, margin:'0 auto', padding:'2rem 1rem 4rem' }}>
        <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:36, color:'#e8b84b', textTransform:'uppercase', letterSpacing:1, marginBottom:'0.5rem' }}>
          Contato
        </h1>
        <div style={{ width:60, height:3, background:'#e8b84b', borderRadius:2, marginBottom:'2rem' }} />

        <div style={{ fontSize:15, color:'#a1a1aa', lineHeight:1.85, marginBottom:'2rem' }}>
          <p>Para dúvidas, sugestões, parcerias ou reportar erros em notícias, entre em contato através dos canais abaixo.</p>
        </div>

        <div style={{ display:'grid', gap:12 }}>
          {[
            { icon:'💬', titulo:'Discord', desc:'Canal oficial da comunidade — melhor forma de contato rápido', link:'https://discord.gg/FjW6eJpcXA', label:'Entrar no Discord' },
            { icon:'📱', titulo:'TikTok', desc:'Manda mensagem direta no TikTok', link:'https://www.tiktok.com/@fskate.efootball', label:'TikTok @fskate.efootball' },
            { icon:'▶', titulo:'YouTube', desc:'Deixe um comentário nos vídeos do canal', link:'https://www.youtube.com/@FSKATEGAMES', label:'YouTube FSKATE GAMES' },
          ].map(item => (
            <div key={item.titulo} style={{ background:'#111115', border:'1px solid #1d1d20', borderRadius:12, padding:'1.25rem', display:'flex', gap:16, alignItems:'flex-start' }}>
              <span style={{ fontSize:28, flexShrink:0 }}>{item.icon}</span>
              <div>
                <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:18, color:'#e4e4e7', textTransform:'uppercase', marginBottom:4 }}>{item.titulo}</div>
                <div style={{ fontSize:13, color:'#52525b', marginBottom:10 }}>{item.desc}</div>
                <a href={item.link} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize:12, color:'#4f7ef8', textDecoration:'none', fontWeight:700, letterSpacing:'0.5px' }}>
                  {item.label} →
                </a>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background:'rgba(232,184,75,0.05)', border:'1px solid rgba(232,184,75,0.15)', borderRadius:12, padding:'1.25rem', marginTop:'2rem' }}>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:16, color:'#e8b84b', textTransform:'uppercase', marginBottom:6 }}>Parcerias e Imprensa</div>
          <p style={{ fontSize:13, color:'#71717a', lineHeight:1.6 }}>Para propostas comerciais ou parcerias de conteúdo, entre em contato pelo Discord informando o assunto.</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
