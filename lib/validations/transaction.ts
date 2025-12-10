import { z } from 'zod'
import { TransactionCategory, RecurringFrequency } from '@/types'

export const transactionSchema = z.object({
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Amount must be a positive number',
    }),
  category: z.enum(['EXPENSE', 'INCOME'] as const),
  selectedCategory: z.string().optional(),
  mainCategory: z.string().optional(),
  description: z.string().max(100, 'Description must be 100 characters or less').optional(),
  isRecurring: z.boolean().default(false),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] as const).optional(),
  startDate: z.string().optional(),
}).refine(
  (data) => {
    // If expense, must have selected category
    if (data.category === 'EXPENSE' && !data.selectedCategory) {
      return false
    }
    return true
  },
  {
    message: 'Please select a category for expenses',
    path: ['selectedCategory'],
  }
).refine(
  (data) => {
    // If recurring, must have frequency and start date
    if (data.isRecurring && (!data.frequency || !data.startDate)) {
      return false
    }
    return true
  },
  {
    message: 'Recurring transactions require frequency and start date',
    path: ['isRecurring'],
  }
)

export type TransactionFormData = z.infer<typeof transactionSchema>
