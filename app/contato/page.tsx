import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { REDES } from '@/lib/social'

export const metadata = { title: 'Contato — eFootball News', description: 'Entre em contato com o eFootball News.' }

export default function Contato() {
  const discord = REDES.find(r => r.label === 'Discord')!

  return (
    <div style={{ minHeight:'100vh', background:'#09090b' }}>
      <Navbar />
      <main style={{ maxWidth:600, margin:'0 auto', padding:'2rem 1rem 4rem' }}>
        <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:36, color:'#fbe900', textTransform:'uppercase', letterSpacing:1, marginBottom:'0.5rem' }}>
          Contato
        </h1>
        <div style={{ width:60, height:3, background:'#fbe900', borderRadius:2, marginBottom:'2rem' }} />

        <p style={{ fontSize:15, color:'#a1a1aa', lineHeight:1.85, marginBottom:'2.5rem' }}>
          Para dúvidas, sugestões, parcerias, propostas comerciais ou para reportar erros em notícias, o canal mais rápido é o nosso Discord.
        </p>

        {/* Discord — destaque único, minimalista */}
        <a href={discord.url} target="_blank" rel="noopener noreferrer"
          style={{
            display:'flex', alignItems:'center', gap:18,
            background:'#111115', border:'1px solid #1d1d20', borderRadius:16,
            padding:'1.5rem', textDecoration:'none', transition:'border-color .15s',
          }}>
          <span style={{ width:48, height:48, borderRadius:12, background:'rgba(88,101,242,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <span style={{ width:26, height:26, color:discord.color, display:'flex' }} dangerouslySetInnerHTML={{ __html: discord.svg }} />
          </span>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:20, color:'#e4e4e7', textTransform:'uppercase', letterSpacing:1, marginBottom:2 }}>
              Discord
            </div>
            <div style={{ fontSize:13, color:'#71717a' }}>
              Comunidade oficial — entre em contato direto com a equipe
            </div>
          </div>
          <span style={{ fontSize:20, color:'#52525b', flexShrink:0 }}>→</span>
        </a>
      </main>
      <Footer />
    </div>
  )
}
