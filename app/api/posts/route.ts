import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { title, slug, summary, content, category_id, tags, status, source_url, cover_image, source_type } = body

  const published_at = status === 'published' ? new Date().toISOString() : null

  const { data, error } = await supabaseAdmin.from('posts').insert({
    title, slug, summary, content, category_id,
    tags: tags || [], status: status || 'draft',
    source_url, cover_image, source_type: source_type || 'manual',
    published_at, auto_published: false
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ post: data })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, ...updates } = body

  if (updates.status === 'published' && !updates.published_at) {
    updates.published_at = new Date().toISOString()
  }
  updates.updated_at = new Date().toISOString()

  const { data, error } = await supabaseAdmin.from('posts').update(updates).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ post: data })
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const { error } = await supabaseAdmin.from('posts').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
