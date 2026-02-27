import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const userId = request.cookies.get('userId')?.value

  // Pages d'authentification (redirect si connecté)
  const isAuthPage = request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/signup'

  // Pages publiques accessibles par tous (connecté ou non)
  const isPublicPage = isAuthPage ||
    request.nextUrl.pathname === '/leaderboard'

  // Si pas d'utilisateur et page protégée
  if (!userId && !isPublicPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Si utilisateur connecté et sur page d'auth → rediriger
  if (userId && isAuthPage) {
    return NextResponse.redirect(new URL('/activities', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
