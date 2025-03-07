import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Cek user session dari cookie kita
  const session = req.cookies.get('user-session')

  // Redirect ke dashboard kalo user udah login tapi coba akses login
  if (session && req.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Redirect ke login kalo user belum login tapi coba akses dashboard
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/login']
}