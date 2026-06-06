import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function gerarSlug(titulo: string) {
  return titulo.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim()
    .replace(/\s+/g, '-').substring(0, 80) + '-' + Date.now()
}

function extrairVideoId(url: string): string | null {
  try {
    const obj = new URL(url)
    if (obj.searchParams.has('v')) return obj.searchParams.get('v')
    if (obj.hostname === 'youtu.be') return obj.pathname.slice(1)
    const shorts = obj.pathname.match(/\/shorts\/([^/?&]+)/)
    if (shorts) return shorts[1]
    return null
  } catch { return null }
}

export async function POST(req: NextRequest) {
  const { youtubeUrl, categoria = 'noticias', status = 'published' } = await req.json()
  if (!youtubeUrl) return NextResponse.json({ error: 'URL obrigatória' }, { status: 400 })

  const videoId = extrairVideoId(youtubeUrl)
  if (!videoId) return NextResponse.json({ error: 'URL inválida' }, { status: 400 })

  try {
    // 1. Buscar transcrição via API pública do YouTube
    const transcriptUrl = `https://www.youtube.com/watch?v=${videoId}`
    
    // Buscar página do YouTube para pegar dados básicos
    const ytRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(transcriptUrl)}&format=json`)
    const ytData = ytRes.ok ? await ytRes.json() : {}
    const videoTitle = ytData.title || 'Vídeo eFootball'
    const thumbUrl = ytData.thumbnail_url || null

    // 2. Buscar transcrição via youtube-transcript-api (servidor)
    let transcricao = ''
    try {
      // Usar API pública para transcrição
      const timedTextUrl = `https://www.youtube.com/api/timedtext?lang=pt&v=${videoId}&fmt=json3`
      const tRes = await fetch(timedTextUrl)
      if (tRes.ok) {
        const tData = await tRes.json()
        const events = tData.events || []
        transcricao = events
          .filter((e: any) => e.segs)
          .map((e: any) => e.segs.map((s: any) => s.utf8).join(''))
          .join(' ')
          .trim()
      }
      // Fallback: inglês
      if (!transcricao) {
        const tRes2 = await fetch(`https://www.youtube.com/api/timedtext?lang=en&v=${videoId}&fmt=json3`)
        if (tRes2.ok) {
          const tData2 = await tRes2.json()
          const events = tData2.events || []
          transcricao = events
            .filter((e: any) => e.segs)
            .map((e: any) => e.segs.map((s: any) => s.utf8).join(''))
            .join(' ')
            .trim()
        }
      }
    } catch (e) {
      console.log('Erro transcrição:', e)
    }

    // 3. Gerar notícia jornalística via Claude API
    const prompt = transcricao
      ? `Você é um jornalista especializado em eFootball. Com base na transcrição abaixo, escreva uma notícia jornalística completa em português brasileiro.

TÍTULO DO VÍDEO: ${videoTitle}

TRANSCRIÇÃO:
${transcricao.substring(0, 6000)}

INSTRUÇÕES:
- Escreva como uma notícia de jornal esportivo digital
- Primeiro parágrafo: lead (quem, o quê, quando, onde, por quê)
- Parágrafos seguintes: desenvolvimento com detalhes
- Use linguagem acessível para jogadores de eFootball
- Destaque datas, promoções, jogadores e novidades mencionados
- Não invente informações
- Mínimo 3 parágrafos, máximo 6
- NÃO use markdown, escreva texto corrido

Responda APENAS com:
TITULO: [título da notícia]
RESUMO: [resumo de 1 linha]
CONTEUDO: [texto completo da notícia]`
      : `Escreva uma breve notícia sobre o vídeo de eFootball com título: "${videoTitle}". 
Responda com:
TITULO: [título]
RESUMO: [resumo]
CONTEUDO: [texto breve]`

    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    let titulo = videoTitle
    let resumo = ''
    let conteudo = ''

    if (claudeRes.ok) {
      const claudeData = await claudeRes.json()
      const text = claudeData.content?.[0]?.text || ''
      const tMatch = text.match(/TITULO:\s*(.+)/i)
      const rMatch = text.match(/RESUMO:\s*(.+)/i)
      const cMatch = text.match(/CONTEUDO:\s*([\s\S]+)/i)
      if (tMatch) titulo = tMatch[1].trim()
      if (rMatch) resumo = rMatch[1].trim()
      if (cMatch) conteudo = cMatch[1].trim()
    }

    if (!conteudo) conteudo = transcricao.substring(0, 1000) || 'Veja o vídeo completo no link abaixo.'
    conteudo += `\n\n━━━━━━━━━━━━━━━━\n📺 Fonte: YouTube\n🔗 ${youtubeUrl}`

    // 4. Buscar categoria
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', categoria).single()

    // 5. Salvar no banco
    const { data: post, error } = await supabase.from('posts').insert({
      title: titulo,
      slug: gerarSlug(titulo),
      summary: resumo || null,
      content: conteudo,
      cover_image: thumbUrl,
      category_id: cat?.id || null,
      tags: ['efootball', 'youtube'],
      status,
      source_type: 'youtube',
      source_url: youtubeUrl,
      auto_published: false,
      published_at: status === 'published' ? new Date().toISOString() : null
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, post, titulo, resumo })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
