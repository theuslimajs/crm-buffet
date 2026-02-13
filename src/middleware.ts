import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const cookie = request.cookies.get('session_user_id')
  const { pathname } = request.nextUrl

  // Se NÃO tem cookie e NÃO está na página de login, manda para o login
  if (!cookie && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Se JÁ tem cookie e tenta ir para o login, manda para a home
  if (cookie && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

// Configura quais páginas o middleware deve vigiar
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}