'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { headers } from 'next/headers'

export async function signInWithEmail(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const headersList = await headers()
  const origin = headersList.get('origin') || 'http://localhost:3000'

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  const headersList = await headers()
  const origin = headersList.get('origin') || 'http://localhost:3000'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const username = formData.get('username') as string

  // Check if username is already taken
  const existingUser = await prisma.user.findUnique({
    where: { username },
  })

  if (existingUser) {
    return { error: 'Username already taken' }
  }

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError) {
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: 'Failed to create user' }
  }

  // Create user in database
  try {
    await prisma.user.create({
      data: {
        id: authData.user.id,
        email,
        username,
        spendingLimit: 39500,
        totalSaved: 0,
        currentStreak: 0,
        crumbMood: 'HARMONY',
        brewLevel: 1,
      },
    })
  } catch (error) {
    console.error('Failed to create user in database:', error)
    return { error: 'Failed to create user profile' }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/auth/login')
}

export async function createUserProfile(userId: string, email: string, username?: string) {
  // Create user profile if it doesn't exist (for OAuth users)
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (existingUser) {
    return existingUser
  }

  // Generate username from email if not provided
  const generatedUsername = username || email.split('@')[0] + Math.floor(Math.random() * 1000)

  try {
    const user = await prisma.user.create({
      data: {
        id: userId,
        email,
        username: generatedUsername,
        spendingLimit: 39500,
        totalSaved: 0,
        currentStreak: 0,
        crumbMood: 'HARMONY',
        brewLevel: 1,
      },
    })
    return user
  } catch (error) {
    console.error('Failed to create user profile:', error)
    return null
  }
}

