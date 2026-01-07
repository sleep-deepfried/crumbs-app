# Passwordless Authentication Setup Guide

This guide will help you set up Google OAuth and Magic Link (passwordless email) authentication for CRUMBS.

## 1. Enable Email (Magic Link) Authentication in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Email** in the list
4. Make sure **Enable Email provider** is turned ON
5. Enable **Confirm email** (optional but recommended)
6. **Enable email OTP** should be ON for magic links
7. Click **Save**

## 2. Configure Email Templates (Optional but Recommended)

1. In **Authentication** → **Email Templates**
2. Customize the **Magic Link** template:
   - Subject: `Sign in to CRUMBS`
   - Body: Customize with your branding
   - Make sure `{{ .ConfirmationURL }}` is included in the template

## 3. Set Up Google OAuth

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. If prompted, configure the OAuth consent screen:
   - User Type: **External**
   - App name: **CRUMBS**
   - User support email: Your email
   - Developer contact: Your email
   - Add scopes: `email`, `profile`
   - Add test users if in testing mode

### Step 2: Configure OAuth Client

1. Application type: **Web application**
2. Name: **CRUMBS Web App**
3. Authorized JavaScript origins:
   ```
   http://localhost:3000
   https://your-production-domain.com
   ```
4. Authorized redirect URIs:

   ```
   https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback
   ```

   Replace `[YOUR-PROJECT-REF]` with your actual Supabase project reference (found in your Supabase project URL)

5. Click **Create**
6. Copy the **Client ID** and **Client Secret**

### Step 3: Configure Google Provider in Supabase

1. Go back to your Supabase dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** and click to expand
4. Toggle **Enable Sign in with Google** to ON
5. Paste your **Client ID** and **Client Secret**
6. Click **Save**

## 4. Update Environment Variables

Make sure your `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
```

## 5. Testing the Authentication

### Test Magic Link (Email):

1. Start your development server: `npm run dev`
2. Go to http://localhost:3000/auth/login
3. Enter your email and click "Continue with email"
4. Check your email inbox for the magic link
5. Click the link to sign in

### Test Google OAuth:

1. On the login page, click "Continue with Google"
2. Select your Google account
3. Authorize the app
4. You should be redirected back to the app and logged in

## 6. Production Deployment

When deploying to production (e.g., Vercel):

1. Add your production domain to Google OAuth:

   - Authorized JavaScript origins: `https://your-domain.com`
   - Authorized redirect URIs: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`

2. Update Supabase Site URL:

   - Go to **Authentication** → **URL Configuration**
   - Set **Site URL** to your production domain
   - Add your production domain to **Redirect URLs**

3. Configure email sender (optional):
   - Go to **Project Settings** → **Auth**
   - Configure custom SMTP settings for production emails

## Troubleshooting

### Magic Link Not Working

- Check that email provider is enabled in Supabase
- Verify email templates are configured
- Check spam folder
- Ensure `emailRedirectTo` in code matches your allowed redirect URLs

### Google OAuth Errors

- Verify Client ID and Secret are correct
- Check redirect URIs match exactly (including http vs https)
- Ensure OAuth consent screen is published (not in testing mode for production)
- Check that Google+ API is enabled in Google Cloud Console

### User Profile Not Created

- Check browser console for errors
- Verify Prisma schema matches user creation in `createUserProfile`
- Check database logs in Supabase

## Security Notes

1. **Never commit** your Client Secret to version control
2. Use environment variables for all sensitive data
3. Enable email confirmation for production
4. Consider adding rate limiting for authentication endpoints
5. Monitor authentication logs in Supabase dashboard
