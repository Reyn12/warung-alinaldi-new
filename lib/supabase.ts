import { createClientComponentClient, createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

type Database = any  // Ini buat ilangin error TypeScript

// Ini buat di client component (yang pake 'use client')
export const createClient = () => createClientComponentClient()

// Ini buat di route handlers (API routes)
export const createServerClient = async () => {
    const cookieStore: any = await cookies()
    const session = cookieStore.get('user-session')
    console.log('Session:', session)
    if (!session) {
        throw new Error('Unauthorized')
    } 
    return createRouteHandlerClient<Database>({
        cookies: () => cookieStore
    })
}