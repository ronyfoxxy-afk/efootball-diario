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
    if (obj.hostname === 'youtu.be') return obj.pathname.slice(1).split('?')[0]
    const shorts = obj.pathname.match(/\/shorts\/([^/?&]+)/)
    if (shorts) return shorts[1]
    return null
  } catch { return null }
}

async function gerarNoticiaComGroq(prompt: string): Promise<{titulo: string, resumo: string, conteudo: string} | null> {
  const GROQ_KEY = process.env.GROQ_API_KEY
  if (!GROQ_KEY) return null
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama-3.1-8b-instant', max_tokens: 2000, temperature: 0.3, messages: [{ role: 'user', content: prompt }] })
    })
    if (!res.ok) return null
    const data = await res.json()
    const text = data.choices?.[0]?.message?.content || ''
    const tMatch = text.match(/TITULO:\s*(.+)/i)
    const rMatch = text.match(/RESUMO:\s*(.+)/i)
    const cMatch = text.match(/CONTEUDO:\s*([\s\S]+)/i)
    return {
      titulo: tMatch?.[1]?.trim() || '',
      resumo: rMatch?.[1]?.trim() || '',
      conteudo: cMatch?.[1]?.trim() || ''
    }
  } catch { return null }
}

async function gerarNoticiaComClaude(prompt: string): Promise<{titulo: string, resumo: string, conteudo: string} | null> {
  const KEY = process.env.ANTHROPIC_API_KEY
  if (!KEY) return null
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 2000, messages: [{ role: 'user', content: prompt }] })
    })
    if (!res.ok) return null
    const data = await res.json()
    const text = data.content?.[0]?.text || ''
    const tMatch = text.match(/TITULO:\s*(.+)/i)
    const rMatch = text.match(/RESUMO:\s*(.+)/i)
    const cMatch = text.match(/CONTEUDO:\s*([\s\S]+)/i)
    return {
      titulo: tMatch?.[1]?.trim() || '',
      resumo: rMatch?.[1]?.trim() || '',
      conteudo: cMatch?.[1]?.trim() || ''
    }
  } catch { return null }
}

export async function POST(req: NextRequest) {
  const { youtubeUrl, categoria = 'noticias', status = 'published' } = await req.json()
  if (!youtubeUrl) return NextResponse.json({ error: 'URL obrigatória' }, { status: 400 })

  const videoId = extrairVideoId(youtubeUrl)
  if (!videoId) return NextResponse.json({ error: 'URL inválida do YouTube' }, { status: 400 })

  try {
    // 1. Metadados via oEmbed
    const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
    const oembedData = oembedRes.ok ? await oembedRes.json() : {}
    const videoTitle = oembedData.title || 'Vídeo eFootball'
    const authorName = oembedData.author_name || 'YouTube'
    const thumbUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

    // 2. Tentar transcrição
    let transcricao = ''
    for (const lang of ['pt', 'pt-BR', 'en']) {
      try {
        const tRes = await fetch(`https://www.youtube.com/api/timedtext?lang=${lang}&v=${videoId}&fmt=json3`)
        if (tRes.ok) {
          const tData = await tRes.json()
          const texto = (tData.events || [])
            .filter((e: any) => e.segs)
            .map((e: any) => e.segs.map((s: any) => s.utf8 || '').join(''))
            .join(' ').replace(/\s+/g, ' ').trim()
          if (texto.length > 100) { transcricao = texto.substring(0, 8000); break }
        }
      } catch { continue }
    }

    // 3. Prompt para gerar notícia jornalística
    const temTranscricao = transcricao.length > 100
    const prompt = temTranscricao
      ? `Você é jornalista especializado em eFootball. Com base na transcrição do vídeo "${videoTitle}" do canal ${authorName}, escreva uma notícia jornalística completa em português brasileiro.

TRANSCRIÇÃO:
${transcricao}

INSTRUÇÕES:
- Notícia de portal esportivo, linguagem acessível para fãs de eFootball
- Lead jornalístico no primeiro parágrafo (quem, o quê, quando, onde, por quê)
- Mínimo 4 parágrafos, texto corrido SEM markdown
- Destaque datas, jogadores, eventos e novidades mencionados
- Título atrativo e informativo
- NÃO invente informações além da transcrição

Responda EXATAMENTE assim:
TITULO: [título]
RESUMO: [uma linha]
CONTEUDO: [texto completo em parágrafos, separados por linha em branco]`
      : `Você é jornalista especializado em eFootball. Escreva uma notícia introdutória em português brasileiro sobre este vídeo.

TÍTULO DO VÍDEO: "${videoTitle}"
CANAL: ${authorName}
LINK: https://www.youtube.com/watch?v=${videoId}

INSTRUÇÕES:
- 3 parágrafos, texto corrido SEM markdown
- Apresente o vídeo, explique o que provavelmente é abordado pelo título
- Convide o leitor a assistir
- Título atrativo

Responda EXATAMENTE assim:
TITULO: [título]
RESUMO: [uma linha]
CONTEUDO: [texto completo]`

    // 4. Gerar com IA (Claude → Groq → fallback)
    let gerado = await gerarNoticiaComClaude(prompt)
    if (!gerado || !gerado.titulo) gerado = await gerarNoticiaComGroq(prompt)

    const titulo = gerado?.titulo || videoTitle
    const resumo = gerado?.resumo || `Novo vídeo de eFootball do canal ${authorName}.`
    let conteudo = gerado?.conteudo || ''

    if (!conteudo || conteudo.length < 50) {
      conteudo = temTranscricao
        ? transcricao.substring(0, 2000) + '...'
        : `O canal ${authorName} publicou um novo vídeo sobre eFootball intitulado "${videoTitle}". Assista ao vídeo completo no link abaixo para conferir todas as informações e novidades.`
    }

    conteudo += `\n\n━━━━━━━━━━━━━━━━\n📺 Fonte: ${authorName} no YouTube\n🔗 ${youtubeUrl}`

    // 5. Salvar no banco
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', categoria).single()
    const { data: post, error } = await supabase.from('posts').insert({
      title: titulo, slug: gerarSlug(titulo),
      summary: resumo,
      content: conteudo, cover_image: thumbUrl,
      category_id: cat?.id || null,
      tags: ['efootball', 'youtube'], status, source_type: 'youtube',
      source_url: youtubeUrl, auto_published: false,
      published_at: status === 'published' ? new Date().toISOString() : null
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, post, titulo, resumo, transcricaoObtida: temTranscricao })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
