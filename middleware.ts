import { NextRequest, NextResponse } from 'next/server'

// Rotas protegidas do admin
const PROTECTED = ['/admin-fskate']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Verificar se é rota do admin
  if (PROTECTED.some(p => pathname.startsWith(p))) {
    const cookie = req.cookies.get('admin_auth')?.value
    const adminPass = process.env.ADMIN_PASSWORD || '@Miudinho123'

    // Se já está autenticado, deixa passar
    if (cookie === adminPass) return NextResponse.next()

    // Se não está autenticado, redireciona pro login
    const loginUrl = new URL('/admin-login', req.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin-fskate/:path*'],
}
