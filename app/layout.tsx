import type { Metadata } from 'next'
import './globals.css'
import WhatsAppButton from '@/components/WhatsAppButton'

export const metadata: Metadata = {
  title: 'eFootball News — Notícias, Torneios e Co-op ao vivo',
  description: 'O portal de notícias em português sobre eFootball. Atualizações, eventos, campanhas, guias, torneios e fila Co-op ao vivo. FSKATE GAMES.',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'eFootball News — FSKATE GAMES',
    description: 'Notícias diárias sobre eFootball em português',
    siteName: 'eFootball News',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7764697674367118"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        {children}
        <WhatsAppButton />
      </body>
    </html>
  )
}
