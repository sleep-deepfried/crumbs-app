import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { addTransaction } from '@/app/actions/transactions'
import { addDays, addWeeks, addMonths, addYears, startOfDay, isAfter } from 'date-fns'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

// Verify the request is from Vercel Cron
function verifyCronSecret(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return false
  }
  return true
}

export async function GET(request: Request) {
  // Verify cron secret
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = startOfDay(new Date())
  let processedCount = 0
  let errorCount = 0
  const errors: string[] = []

  try {
    // Find all active recurring transactions due for processing
    const dueTransactions = await prisma.recurringTransaction.findMany({
      where: {
        isActive: true,
        nextOccurrence: {
          lte: now,
        },
      },
    })

    console.log(`Found ${dueTransactions.length} recurring transactions to process`)

    for (const recurring of dueTransactions) {
      try {
        // Create the actual transaction
        const result = await addTransaction(
          recurring.userId,
          recurring.amount,
          recurring.category as 'EXPENSE' | 'INCOME',
          recurring.description || undefined,
          recurring.isSavings,
          recurring.subcategory || undefined,
          recurring.mainCategory || undefined
        )

        if (!result.success) {
          throw new Error(result.error || 'Failed to create transaction')
        }

        // Calculate next occurrence
        const nextOccurrence = calculateNextOccurrence(
          recurring.nextOccurrence,
          recurring.frequency,
          recurring.interval,
          recurring.dayOfWeek,
          recurring.dayOfMonth
        )

        // Check if we should deactivate (past end date)
        const shouldDeactivate = recurring.endDate && isAfter(nextOccurrence, recurring.endDate)

        // Update recurring transaction
        await prisma.recurringTransaction.update({
          where: { id: recurring.id },
          data: {
            lastProcessed: now,
            nextOccurrence,
            isActive: !shouldDeactivate,
          },
        })

        processedCount++
        console.log(`Processed recurring transaction ${recurring.id}`)
      } catch (error) {
        const errorMsg = `Error processing recurring transaction ${recurring.id}: ${error}`
        console.error(errorMsg)
        errors.push(errorMsg)
        errorCount++
      }
    }

    return NextResponse.json({
      success: true,
      processed: processedCount,
      errors: errorCount,
      errorMessages: errors,
      timestamp: now.toISOString(),
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Failed to process recurring transactions', details: String(error) },
      { status: 500 }
    )
  }
}

function calculateNextOccurrence(
  current: Date,
  frequency: string,
  interval: number,
  dayOfWeek: number | null,
  dayOfMonth: number | null
): Date {
  switch (frequency) {
    case 'DAILY':
      return addDays(current, interval)
    case 'WEEKLY':
      return addWeeks(current, interval)
    case 'MONTHLY':
      return addMonths(current, interval)
    case 'YEARLY':
      return addYears(current, interval)
    default:
      return addMonths(current, 1) // Default to monthly
  }
}
