import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Pega o cookie de sessão que criamos no login
  const session = request.cookies.get('session_user_id')?.value

  // Lista de rotas que são públicas (não precisam de login)
  const publicRoutes = ['/login', '/cadastro']
  
  // Verifica se a rota atual é pública
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname)

  // 1. Se NÃO tiver sessão e tentar acessar qualquer rota privada (dashboard, leads, etc.)
  // Redireciona para o Login
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. Se JÁ tiver sessão e tentar acessar o Login
  // Redireciona direto para o Dashboard (não precisa logar de novo)
  if (session && isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

// Configuração: Em quais rotas o middleware deve rodar?
export const config = {
  matcher: [
    /*
     * Aplica a segurança em todas as rotas, EXCETO:
     * - api (rotas de API)
     * - _next/static (arquivos estáticos)
     * - _next/image (imagens otimizadas)
     * - favicon.ico (ícone do site)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}