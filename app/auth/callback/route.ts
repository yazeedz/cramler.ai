import { createClient } from '@/app/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token = searchParams.get('token')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/new'

  console.log('Auth callback received:', { code: !!code, token: !!token, type, next })

  const supabase = await createClient()

  try {
    // Handle OAuth code exchange (Google OAuth)
    if (code) {
      console.log('Processing OAuth code exchange...')
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('OAuth code exchange error:', error)
        throw error
      }
      
      if (data.user) {
        console.log('OAuth authentication successful for user:', data.user.id)
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
    
    // Handle magic link token verification
    if (token && type) {
      console.log('Processing magic link token verification...')
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: type as 'signup' | 'magiclink' | 'recovery' | 'invite'
      })
      
      if (error) {
        console.error('Magic link verification error:', error)
        throw error
      }
      
      if (data.user) {
        console.log('Magic link authentication successful for user:', data.user.id)
        return NextResponse.redirect(`${origin}${next}`)
      }
    }

    // If we get here, no valid authentication method was provided
    console.error('No valid authentication method provided')
    throw new Error('No valid authentication parameters found')

  } catch (error: any) {
    console.error('Authentication error in callback:', error)
    
    // Provide more specific error messages
    let errorMessage = 'Unable to authenticate user'
    if (error.message) {
      errorMessage = error.message
    }
    
    return NextResponse.redirect(
      `${origin}/login?error=auth_error&error_description=${encodeURIComponent(errorMessage)}`
    )
  }
} 