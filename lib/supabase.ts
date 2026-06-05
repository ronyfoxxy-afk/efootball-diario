import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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

export type Tournament = {
  id: string
  name: string
  slug: string
  description: string | null
  model: 'liga' | 'copa' | 'grupos_mata_mata' | 'livre'
  status: 'draft' | 'open' | 'ongoing' | 'finished' | 'cancelled'
  entry_fee: number
  prize: number
  pix_key: string | null
  max_participants: number | null
  rules: string | null
  cover_image: string | null
  start_date: string | null
  end_date: string | null
  registration_deadline: string | null
  created_at: string
}

export type Participant = {
  id: string
  tournament_id: string
  player_name: string
  contact: string | null
  payment_status: 'pending' | 'confirmed' | 'refunded'
  paid_at: string | null
  notes: string | null
  created_at: string
}

export type Match = {
  id: string
  round_id: string
  tournament_id: string
  home_participant_id: string | null
  away_participant_id: string | null
  home_score: number | null
  away_score: number | null
  status: 'pending' | 'awaiting_proof' | 'confirmed' | 'disputed'
  proof_url: string | null
  confirmed_at: string | null
  notes: string | null
  created_at: string
}

export type Standing = {
  tournament_id: string
  participant_id: string
  player_name: string
  jogos: number
  vitorias: number
  empates: number
  derrotas: number
  gols_pro: number
  gols_contra: number
  pontos: number
}
