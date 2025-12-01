import { redirect } from 'next/navigation'
import { createClient } from '@/app/utils/supabase/server'

export default async function RootPage() {
  const supabase = await createClient()
  
  // Check if user is authenticated - use getUser() for secure authentication validation
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (user && !error) {
    // User is logged in, redirect to /new
    redirect('/new')
  } else {
    // User is not logged in, redirect to /login
    redirect('/login')
  }
} 