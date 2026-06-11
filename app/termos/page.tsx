import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata = { title: 'Termos de Uso — eFootball News' }

export default function Termos() {
  const S = { h2: { fontFamily:"'Barlow Condensed',sans-serif" as const, fontWeight:900 as const, fontSize:20, color:'#e4e4e7', textTransform:'uppercase' as const, margin:'1.5rem 0 0.75rem' }, p: { fontSize:15, color:'#a1a1aa', lineHeight:1.85 as const, marginBottom:'1rem' } }
  return (
    <div style={{ minHeight:'100vh', background:'#09090b' }}>
      <Navbar />
      <main style={{ maxWidth:760, margin:'0 auto', padding:'2rem 1rem 4rem' }}>
        <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:36, color:'#fbe900', textTransform:'uppercase', letterSpacing:1, marginBottom:'0.5rem' }}>Termos de Uso</h1>
        <div style={{ width:60, height:3, background:'#fbe900', borderRadius:2, marginBottom:'0.5rem' }} />
        <p style={{ fontSize:13, color:'#52525b', marginBottom:'2rem' }}>Última atualização: junho de 2026</p>

        <div style={{ fontSize:15, color:'#a1a1aa', lineHeight:1.85 }}>
          <p style={S.p}>Ao acessar o eFootball News (efootball-diario.vercel.app), você concorda com os seguintes termos.</p>

          <h2 style={S.h2}>1. Uso do Site</h2>
          <p style={S.p}>O conteúdo deste site é destinado exclusivamente para fins informativos e de entretenimento relacionados ao jogo eFootball da Konami. É proibido reproduzir, distribuir ou modificar o conteúdo sem autorização prévia.</p>

          <h2 style={S.h2}>2. Co-op ao Vivo</h2>
          <p style={S.p}>A fila de Co-op é um recurso gratuito para interação com o FSKATE durante lives. A participação está sujeita à disponibilidade e o FSKATE reserva o direito de encerrar a fila a qualquer momento.</p>

          <h2 style={S.h2}>3. Conteúdo de Terceiros</h2>
          <p style={S.p}>Algumas notícias podem ser geradas com auxílio de inteligência artificial com base em fontes públicas. Nos esforçamos para garantir a precisão, mas não nos responsabilizamos por erros ou desatualizações. eFootball® é marca registrada da Konami Holdings Corporation.</p>

          <h2 style={S.h2}>4. Conduta do Usuário</h2>
          <p style={S.p}>É proibido usar o site para fins ilegais, spam, ou qualquer atividade que prejudique outros usuários ou o funcionamento do site.</p>

          <h2 style={S.h2}>5. Modificações</h2>
          <p style={S.p}>Reservamo-nos o direito de modificar estes termos a qualquer momento. O uso continuado do site após alterações constitui aceitação dos novos termos.</p>

          <h2 style={S.h2}>6. Contato</h2>
          <p style={S.p}>Dúvidas sobre estes termos? Entre em contato pelo <a href="https://discord.gg/FjW6eJpcXA" target="_blank" rel="noopener noreferrer" style={{ color:'#4f7ef8' }}>Discord</a>.</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
