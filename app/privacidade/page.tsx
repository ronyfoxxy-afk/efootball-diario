import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata = { title: 'Política de Privacidade — eFootball News' }

export default function Privacidade() {
  const S = { h2: { fontFamily:"'Barlow Condensed',sans-serif" as const, fontWeight:900 as const, fontSize:20, color:'#e4e4e7', textTransform:'uppercase' as const, margin:'1.5rem 0 0.75rem' }, p: { fontSize:15, color:'#a1a1aa', lineHeight:1.85 as const, marginBottom:'1rem' } }
  return (
    <div style={{ minHeight:'100vh', background:'#09090b' }}>
      <Navbar />
      <main style={{ maxWidth:760, margin:'0 auto', padding:'2rem 1rem 4rem' }}>
        <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:36, color:'#fbe900', textTransform:'uppercase', letterSpacing:1, marginBottom:'0.5rem' }}>Política de Privacidade</h1>
        <div style={{ width:60, height:3, background:'#fbe900', borderRadius:2, marginBottom:'0.5rem' }} />
        <p style={{ fontSize:13, color:'#52525b', marginBottom:'2rem' }}>Última atualização: junho de 2026</p>

        <div style={{ fontSize:15, color:'#a1a1aa', lineHeight:1.85 }}>
          <p style={S.p}>O eFootball News (efootball-news.vercel.app), operado por FSKATE GAMES, respeita a privacidade dos seus visitantes. Esta política descreve como coletamos, usamos e protegemos suas informações.</p>

          <h2 style={S.h2}>1. Dados Coletados</h2>
          <p style={S.p}>Não coletamos dados pessoais identificáveis sem o seu consentimento. Ao participar da fila de Co-op, coletamos apenas o nome/nick informado por você voluntariamente.</p>

          <h2 style={S.h2}>2. Cookies e Rastreamento</h2>
          <p style={S.p}>Utilizamos o Google AdSense para exibição de anúncios. O Google pode usar cookies para personalizar anúncios com base nas suas visitas. Você pode desativar essa personalização nas configurações do Google. Também utilizamos cookies de sessão para manter você autenticado em áreas restritas do site.</p>

          <h2 style={S.h2}>3. Google AdSense</h2>
          <p style={S.p}>Este site utiliza o Google AdSense, um serviço de publicidade do Google LLC. O Google pode usar cookies DART para exibir anúncios com base em visitas anteriores a este e outros sites. Você pode desativar o cookie DART em <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" style={{ color:'#4f7ef8' }}>políticas de privacidade de anúncios do Google</a>.</p>

          <h2 style={S.h2}>4. Dados de Pagamento</h2>
          <p style={S.p}>Doações via LivePix são processadas diretamente pela plataforma LivePix. Não armazenamos dados de cartão de crédito ou informações bancárias completas.</p>

          <h2 style={S.h2}>5. Compartilhamento de Dados</h2>
          <p style={S.p}>Não vendemos, trocamos ou transferimos suas informações pessoais para terceiros, exceto quando necessário para operar o site (provedores de hospedagem, processadores de pagamento) ou quando exigido por lei.</p>

          <h2 style={S.h2}>6. Seus Direitos (LGPD)</h2>
          <p style={S.p}>De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito de acessar, corrigir ou solicitar a exclusão de seus dados pessoais. Para exercer esses direitos, entre em contato pelo Discord.</p>

          <h2 style={S.h2}>7. Contato</h2>
          <p style={S.p}>Dúvidas sobre esta política? Entre em contato pelo <a href="https://discord.gg/FjW6eJpcXA" target="_blank" rel="noopener noreferrer" style={{ color:'#4f7ef8' }}>Discord</a>.</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
