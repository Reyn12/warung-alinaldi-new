import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware untuk handle authentication di Next.js dengan Supabase
 * - Mengecek session user
 * - Redirect ke halaman yang sesuai berdasarkan status auth
 */
export async function middleware(req: NextRequest) {
  // Inisialisasi response dan Supabase client
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  // Ambil session user yang aktif
  const { data: { session } } = await supabase.auth.getSession()

  // Redirect ke home kalo user udah login tapi coba akses halaman login/register
  if (session && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register')) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Redirect ke login kalo user belum login tapi coba akses halaman dashboard
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

/**
 * Konfigurasi route mana aja yang bakal di protect sama middleware
 * - /dashboard/* : Semua halaman di dalam dashboard
 * - /login : Halaman login
 * - /register : Halaman register
 */
export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register']
}