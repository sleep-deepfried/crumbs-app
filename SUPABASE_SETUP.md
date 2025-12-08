# Supabase Setup Instructions for CRUMBS

Follow these steps to set up your Supabase project for CRUMBS.

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up or log in
2. Click "New Project"
3. Fill in the details:
   - **Project Name**: CRUMBS
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest to your users
   - **Pricing Plan**: Free tier is fine for development

4. Wait for the project to be provisioned (2-3 minutes)

## 2. Get Your Connection Strings

1. In your Supabase dashboard, go to **Project Settings** (gear icon)
2. Click **Database** in the left sidebar
3. Scroll down to **Connection String**
4. You'll need two URLs:

### DATABASE_URL (Pooler/Transaction Mode)
- Select "URI" mode
- Toggle to show "Session mode" or use port 6543
- Copy the connection string
- It should look like: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true`

### DIRECT_URL (Direct Connection)
- Same section, but use port 5432
- Should look like: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres`

## 3. Get Your API Keys

1. Still in **Project Settings**, click **API** in the left sidebar
2. Copy the following:
   - **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 4. Create Your .env.local File

Create a file named `.env.local` in the root of your project (use `.env.local.example` as a template):

```env
DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
```

**Important**: Replace the placeholders with your actual values!

## 5. Enable Row Level Security (RLS)

After running `npx prisma db push`, you need to set up RLS policies:

1. In Supabase dashboard, go to **Authentication** -> **Policies**
2. For the **User** table:
   - Enable RLS
   - Add policy: "Users can view own data"
     - Policy command: SELECT
     - Target roles: authenticated
     - USING expression: `(auth.uid())::text = id`
   - Add policy: "Users can update own data"
     - Policy command: UPDATE
     - Target roles: authenticated
     - USING expression: `(auth.uid())::text = id`

3. For the **Transaction** table:
   - Enable RLS
   - Add policy: "Users can view own transactions"
     - Policy command: SELECT
     - Target roles: authenticated
     - USING expression: `(auth.uid())::text = "userId"`
   - Add policy: "Users can insert own transactions"
     - Policy command: INSERT
     - Target roles: authenticated
     - WITH CHECK expression: `(auth.uid())::text = "userId"`

4. For the **Friendship** table:
   - Enable RLS
   - Add policy: "Users can view friendships they're part of"
     - Policy command: SELECT
     - Target roles: authenticated
     - USING expression: `(auth.uid())::text = "userId" OR (auth.uid())::text = "friendId"`

## 6. Configure Auth Settings (Optional)

1. Go to **Authentication** -> **Settings**
2. Set up email templates for your brand (optional)
3. Configure redirect URLs if deploying (add your production URL)

## 7. Test the Connection

Run these commands in your project:

```bash
npx prisma generate
npx prisma db push
```

If successful, you should see your tables created in the Supabase Table Editor!

## Troubleshooting

- **Connection refused**: Make sure you're using the correct ports (6543 for pooled, 5432 for direct)
- **Password issues**: Ensure you're URL-encoding special characters in your password
- **RLS errors**: Make sure you've enabled RLS and added the correct policies

## Next Steps

After setup is complete:
1. Run `npm run seed` to add demo data
2. Start the dev server with `npm run dev`
3. Visit http://localhost:3000 and sign up for a new account!

