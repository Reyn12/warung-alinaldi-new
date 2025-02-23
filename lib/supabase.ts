import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Ini buat di client component (yang pake 'use client')
export const createClient = () => createClientComponentClient()