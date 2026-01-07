import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo user (Note: This user won't be able to login without Supabase auth)
  // You'll need to sign up through the app to create a real user
  const demoUserId = 'demo-user-id-12345'

  // Clean up existing demo data
  await prisma.transaction.deleteMany({
    where: { userId: demoUserId },
  })
  await prisma.friendship.deleteMany({
    where: { OR: [{ userId: demoUserId }, { friendId: demoUserId }] },
  })
  await prisma.user.deleteMany({
    where: { id: demoUserId },
  })

  // Create demo user
  const demoUser = await prisma.user.create({
    data: {
      id: demoUserId,
      username: 'demo_user',
      email: 'demo@crumbs.app',
      spendingLimit: 39500,
      totalSaved: 15000,
      currentStreak: 7,
      crumbMood: 'HARMONY',
      brewLevel: 1,
    },
  })

  console.log('✅ Created demo user:', demoUser.username)

  // Create some sample transactions for the current month
  const transactions = [
    // Income
    {
      userId: demoUserId,
      amount: 69500,
      type: 'INCOME',
      category: 'INCOME',
      description: 'Monthly Salary',
      date: new Date(new Date().setDate(1)), // First day of month
    },
    // Needs
    {
      userId: demoUserId,
      amount: 15000,
      type: 'EXPENSE',
      category: 'NEEDS',
      description: 'Rent',
      date: new Date(new Date().setDate(2)),
    },
    {
      userId: demoUserId,
      amount: 3500,
      type: 'EXPENSE',
      category: 'NEEDS',
      description: 'Groceries',
      date: new Date(new Date().setDate(5)),
    },
    {
      userId: demoUserId,
      amount: 2000,
      type: 'EXPENSE',
      category: 'NEEDS',
      description: 'Utilities',
      date: new Date(new Date().setDate(6)),
    },
    // Wants
    {
      userId: demoUserId,
      amount: 1200,
      type: 'EXPENSE',
      category: 'WANTS',
      description: 'Coffee shop',
      date: new Date(new Date().setDate(7)),
    },
    {
      userId: demoUserId,
      amount: 2500,
      type: 'EXPENSE',
      category: 'WANTS',
      description: 'Dinner with friends',
      date: new Date(new Date().setDate(10)),
    },
    {
      userId: demoUserId,
      amount: 800,
      type: 'EXPENSE',
      category: 'WANTS',
      description: 'Movie tickets',
      date: new Date(new Date().setDate(12)),
    },
    // Savings
    {
      userId: demoUserId,
      amount: 10000,
      type: 'EXPENSE',
      category: 'SAVINGS',
      description: 'Emergency fund',
      date: new Date(new Date().setDate(3)),
    },
    {
      userId: demoUserId,
      amount: 5000,
      type: 'EXPENSE',
      category: 'SAVINGS',
      description: 'Investment',
      date: new Date(new Date().setDate(8)),
    },
  ]

  for (const transaction of transactions) {
    await prisma.transaction.create({
      data: transaction,
    })
  }

  console.log(`✅ Created ${transactions.length} sample transactions`)

  // Create a few demo friends
  const friends = [
    {
      id: 'friend-1',
      username: 'coffee_lover',
      email: 'coffee@crumbs.app',
      monthlyIncome: 75000,
      spendingLimit: 40000,
      totalSaved: 80000,
      currentStreak: 15,
      crumbMood: 'HARMONY',
      brewLevel: 2,
    },
    {
      id: 'friend-2',
      username: 'pastry_fan',
      email: 'pastry@crumbs.app',
      monthlyIncome: 65000,
      spendingLimit: 35000,
      totalSaved: 25000,
      currentStreak: 3,
      crumbMood: 'CRUMBLY',
      brewLevel: 1,
    },
    {
      id: 'friend-3',
      username: 'savings_master',
      email: 'saver@crumbs.app',
      monthlyIncome: 85000,
      spendingLimit: 30000,
      totalSaved: 120000,
      currentStreak: 42,
      crumbMood: 'HARMONY',
      brewLevel: 3,
    },
  ]

  for (const friend of friends) {
    await prisma.user.upsert({
      where: { id: friend.id },
      update: friend,
      create: friend,
    })

    // Create friendship
    await prisma.friendship.create({
      data: {
        userId: demoUserId,
        friendId: friend.id,
      },
    })
  }

  console.log(`✅ Created ${friends.length} demo friends`)

  console.log('✨ Seeding complete!')
  console.log('\nNote: To login, you need to sign up through the app first.')
  console.log('The demo data here is just for reference.')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

