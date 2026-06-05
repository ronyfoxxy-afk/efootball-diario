import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function generateSlug(title: string) {
  return title.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-')
    .substring(0, 80) + '-' + Date.now()
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('x-automation-secret')
  if (authHeader !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { title, summary, content, source_url, cover_image, source_type, category_slug, tags, auto_publish } = body

  if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 })

  let category_id = null
  if (category_slug) {
    const { data: cat } = await supabaseAdmin.from('categories').select('id').eq('slug', category_slug).single()
    if (cat) category_id = cat.id
  }

  const status = auto_publish ? 'published' : 'draft'
  const slug = generateSlug(title)

  const { data, error } = await supabaseAdmin.from('posts').insert({
    title, slug, summary, content, category_id,
    tags: tags || [], status,
    source_url, cover_image,
    source_type: source_type || 'third_party',
    published_at: status === 'published' ? new Date().toISOString() : null,
    auto_published: !!auto_publish
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true, post: data, status })
}
