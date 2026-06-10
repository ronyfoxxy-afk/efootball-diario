import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'

export default async function InscreverPage({ params }: { params: Promise<{ numero: string }> }) {
  const { numero } = await params
  const divisionNumber = parseInt(numero, 10)
  if (isNaN(divisionNumber)) notFound()

  const { data: divisao } = await supabase
    .from('league_divisions').select('*').eq('division_number', divisionNumber).maybeSingle()
  if (!divisao) notFound()

  const { data: temporadas } = await supabase
    .from('league_seasons').select('*').eq('division_id', divisao.id).order('season_number', { ascending: false }).limit(1)
  const season = temporadas?.[0]

  return (
    <div style={{ minHeight: '100vh', background: '#09090b' }}>
      <Navbar />
      <main style={{ maxWidth: 520, margin: '0 auto', padding: '2rem 1rem 4rem' }}>
        <Link href={`/torneios/divisao/${divisionNumber}`} style={{ fontSize: 12, color: '#52525b', textDecoration: 'none', marginBottom: 8, display: 'inline-block' }}>← Voltar</Link>
        <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 32, fontWeight: 900, color: '#fbe900', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.5rem' }}>
          Inscrição — {divisao.name}
        </h1>

        <div style={{ background: '#111115', border: '1px solid #1d1d20', borderRadius: 12, padding: '1.5rem', marginTop: '1.5rem' }}>
          <p style={{ fontSize: 14, color: '#a1a1aa', lineHeight: 1.7, marginBottom: '1.25rem' }}>
            A inscrição custa <strong style={{ color: '#fbe900' }}>R$ {Number(season?.entry_fee || 10).toFixed(2)}</strong>, paga via LivePix.
            Após a confirmação do pagamento, você poderá preencher seus dados (nome no jogo, WhatsApp e disponibilidade de horários).
          </p>
          <p style={{ fontSize: 12, color: '#52525b', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            ⚠️ Em breve: checkout automático via LivePix. Por enquanto, entre em contato pelo Discord para se inscrever.
          </p>
          <a href="https://discord.gg/FjW6eJpcXA" target="_blank" rel="noopener noreferrer"
            style={{
              display: 'block', textAlign: 'center', textDecoration: 'none',
              background: '#fbe900', color: '#0a0800',
              fontWeight: 900, fontSize: 14, padding: '12px 24px',
              borderRadius: 10, fontFamily: "'Barlow Condensed',sans-serif",
              textTransform: 'uppercase', letterSpacing: 1,
            }}>
            Falar no Discord
          </a>
        </div>
      </main>
      <Footer />
    </div>
  )
}
