import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createUserProfile } from '@/app/actions/auth'
import { getOnboardingStatus } from '@/app/actions/user'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Check if user profile exists, create if not (for OAuth users)
      await createUserProfile(
        data.user.id,
        data.user.email!,
        data.user.user_metadata?.full_name || data.user.user_metadata?.name
      )
      
      // Check onboarding status
      const onboardingStatus = await getOnboardingStatus(data.user.id)
      
      // Redirect to onboarding if not completed and not skipped
      let redirectPath = next
      if (!onboardingStatus.completed && !onboardingStatus.skipped) {
        redirectPath = '/onboarding'
      }
      
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${redirectPath}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`)
      } else {
        return NextResponse.redirect(`${origin}${redirectPath}`)
      }
    }
  }

  // Return the user to an error page with some instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}

