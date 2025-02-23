import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'


// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    // Query user dari Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      )
    }

    // Create session with user data
    const session = {
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    }

    const response = NextResponse.json({ 
      success: true,
      user: session.user
    })

    // Set our own session cookie
    response.cookies.set('user-session', JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 1 day
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('user-session')
  return response
}

export async function GET() {
  try {
    const response = new NextResponse()
    const session = response.cookies.get('user-session')
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = JSON.parse(session.value)
    return NextResponse.json({ user })
  } catch (error) {
    console.error('Get session error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}