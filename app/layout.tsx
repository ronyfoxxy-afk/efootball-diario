import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'eFootball Diário — Notícias, Eventos e Torneios',
  description: 'O portal de notícias em português sobre eFootball. Atualizações, eventos, campanhas, guias e torneios.',
  openGraph: {
    title: 'eFootball Diário',
    description: 'Notícias diárias sobre eFootball em português',
    siteName: 'eFootball Diário',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
