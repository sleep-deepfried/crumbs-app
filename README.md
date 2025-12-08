# CRUMBS 🥐☕

**A social, gamified personal finance tracker for high-income professionals**

## About

CRUMBS is a mobile-first finance tracking app with a cozy café aesthetic featuring pixel art mascots **BREW** (coffee mug) and **BUN** (ensaymada pastry). Track your spending, build savings streaks, and watch your mascots react to your financial health!

### The Dunk Mechanic

- **HARMONY** (>50% budget remaining): BUN is fluffy, BREW is steaming - all is well!
- **CRUMBLY** (<20% budget): BUN looks dry, BREW has gone cold - watch out!
- **SOGGY** (over budget): "The Dunk" - BUN has fallen into BREW with a splash!

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TailwindCSS 4
- **Backend**: Next.js Server Actions
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma
- **Auth**: Supabase Auth

## Getting Started

### Prerequisites

1. Node.js 20+ installed
2. A Supabase account and project

### Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file with your Supabase credentials:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

3. Push the database schema:

```bash
npx prisma generate
npx prisma db push
```

4. (Optional) Seed demo data:

```bash
npm run seed
```

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) to see CRUMBS!

## Features

- 📱 Mobile-first design (optimized for 375px viewport)
- 🎮 Gamified finance tracking with mascot states
- 📊 Real-time budget calculations
- 🔥 Streak tracking for consistent saving
- 👥 Social features - see friends' budget status
- 🎨 Cozy café aesthetic with warm pastry colors

## Color Palette

- Background: `#FDF6EC` (Warm Cream/Dough)
- Primary: `#4A3B32` (Dark Roast Coffee)
- Accent: `#E6C288` (Golden Crust)
- Alert: `#D9534F` (Burnt Red)

## Project Structure

```
/app
  /actions      - Server Actions for data mutations
  /auth         - Authentication pages
  /add          - Add transaction page
  page.tsx      - Main dashboard
/components     - React components
/lib            - Utilities and helpers
/prisma         - Database schema and migrations
/types          - TypeScript type definitions
```

## License

Private project
