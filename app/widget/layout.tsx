// Layout separado para o widget — sem Navbar, sem Footer, fundo transparente
// Usar como Browser Source no OBS ou TikTok Studio
export default function WidgetLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        <style>{`
          html, body { background: transparent !important; margin: 0; padding: 0; }
        `}</style>
      </head>
      <body style={{ background: 'transparent' }}>
        {children}
      </body>
    </html>
  )
}
