import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const userId = request.cookies.get('userId')?.value

  // Pages publiques
  const isPublicPage = request.nextUrl.pathname === '/login' || 
                       request.nextUrl.pathname === '/signup'

  // Si pas d'utilisateur et page protégée
  if (!userId && !isPublicPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Si utilisateur connecté et sur page de connexion
  if (userId && isPublicPage) {
    return NextResponse.redirect(new URL('/activities', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
