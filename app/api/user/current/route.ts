import { createClient } from '@/app/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      console.error('Auth error:', error)
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    // Generate user initials
    const generateInitials = (displayName: string): string => {
      if (!displayName) return 'U'
      return displayName
        .split(' ')
        .map(name => name.charAt(0).toUpperCase())
        .join('')
        .substring(0, 2)
    }

    const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'User'

    // Fetch user roles
    let userRoles = []
    try {
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          role_id,
          roles!inner(
            id,
            name
          ),
          created_at
        `)
        .eq('user_id', user.id)

      if (rolesError) {
        console.error('Error fetching user roles:', rolesError)
      } else if (rolesData && rolesData.length > 0) {
        userRoles = rolesData.map(userRole => ({
          role_id: userRole.role_id,
          role_name: userRole.roles.name,
          created_at: userRole.created_at
        }))
        console.log(`Fetched ${userRoles.length} roles for user:`, userRoles.map(r => r.role_name))
      }
    } catch (error) {
      console.error('Failed to fetch user roles:', error)
      // Continue without roles if fetch fails
    }

    const userData = {
      authenticated: true,
      user: {
        userId: user.id,
        email: user.email,
        displayName,
        userInitials: generateInitials(displayName),
        avatarUrl: user.user_metadata?.avatar_url,
        roles: userRoles,
        lastSyncedAt: new Date().toISOString()
      }
    }

    return NextResponse.json(userData)
  } catch (error) {
    console.error('Error fetching current user:', error)
    return NextResponse.json(
      { authenticated: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 