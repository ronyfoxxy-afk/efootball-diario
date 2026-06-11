import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Post = {
  id: string
  title: string
  slug: string
  summary: string | null
  content: string | null
  cover_image: string | null
  category_id: string | null
  tags: string[]
  status: 'draft' | 'published' | 'archived'
  source_type: 'official' | 'third_party' | 'manual'
  source_url: string | null
  auto_published: boolean
  views: number
  created_at: string
  published_at: string | null
  updated_at: string
  categories?: Category
}

export type Category = {
  id: string
  name: string
  slug: string
  color: string
}
