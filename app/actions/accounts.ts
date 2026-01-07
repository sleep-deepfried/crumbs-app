'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { AccountCategory } from '@/types'

export interface CreateAccountInput {
    userId: string
    name: string
    type: 'BANK' | 'E-WALLET' | 'CREDIT_CARD'
    balance?: number
    color?: string
    category?: AccountCategory
    description?: string
    icon?: string
    // Goal fields
    goalEnabled?: boolean
    goalAmount?: number
    goalDeadline?: Date
    // Credit card fields
    creditLimit?: number
    creditUsed?: number
    statementDate?: number
    paymentDueDate?: number
    minimumPayment?: number
    interestRate?: number
    rewardsType?: string
    rewardsBalance?: number
    rewardsRate?: number
}

export interface UpdateAccountInput {
    name?: string
    type?: 'BANK' | 'E-WALLET' | 'CREDIT_CARD'
    balance?: number
    color?: string
    category?: AccountCategory
    description?: string
    icon?: string
    sortOrder?: number
    // Goal fields
    goalEnabled?: boolean
    goalAmount?: number
    goalDeadline?: Date
    // Credit card fields
    creditLimit?: number
    creditUsed?: number
    statementDate?: number
    paymentDueDate?: number
    minimumPayment?: number
    interestRate?: number
    rewardsType?: string
    rewardsBalance?: number
    rewardsRate?: number
}

export async function getUserAccounts(userId: string, category?: AccountCategory) {
    const accounts = await prisma.account.findMany({
        where: { 
            userId,
            ...(category && { category }),
        },
        orderBy: [
            { sortOrder: 'asc' },
            { balance: 'desc' },
        ],
    })

    return accounts
}

export async function createAccount(input: CreateAccountInput) {
    const account = await prisma.account.create({
        data: {
            userId: input.userId,
            name: input.name,
            type: input.type,
            balance: input.balance ?? (input.type === 'CREDIT_CARD' ? 0 : 0),
            color: input.color || '#4A3B32',
            category: input.category || 'GENERAL',
            description: input.description || null,
            icon: input.icon || null,
            // Goal fields
            goalEnabled: input.goalEnabled ?? false,
            goalAmount: input.goalAmount ?? null,
            goalDeadline: input.goalDeadline ?? null,
            goalStartBalance: input.goalEnabled ? (input.balance ?? null) : null,
            goalStartDate: input.goalEnabled ? new Date() : null,
            // Credit card fields
            creditLimit: input.creditLimit ?? null,
            creditUsed: input.creditUsed ?? null,
            statementDate: input.statementDate ?? null,
            paymentDueDate: input.paymentDueDate ?? null,
            minimumPayment: input.minimumPayment ?? null,
            interestRate: input.interestRate ?? null,
            rewardsType: input.rewardsType ?? null,
            rewardsBalance: input.rewardsBalance ?? null,
            rewardsRate: input.rewardsRate ?? null,
        },
    })

    revalidatePath('/wallet')
    revalidatePath('/')

    return account
}

export async function updateAccount(id: string, input: UpdateAccountInput) {
    const existingAccount = await prisma.account.findUnique({ where: { id } })
    
    const updateData: Record<string, unknown> = { ...input }
    
    // Handle goal start balance and date when enabling goal for first time
    if (input.goalEnabled !== undefined) {
        if (input.goalEnabled && !existingAccount?.goalEnabled) {
            updateData.goalStartBalance = existingAccount?.balance
            updateData.goalStartDate = new Date()
        } else if (!input.goalEnabled) {
            // When disabling, optionally clear goal data
            updateData.goalAmount = null
            updateData.goalDeadline = null
        }
    }
    
    const account = await prisma.account.update({
        where: { id },
        data: updateData,
    })

    revalidatePath('/wallet')
    revalidatePath('/')

    return account
}

export async function updateAccountGoal(
    accountId: string,
    goalData: {
        goalEnabled: boolean
        goalAmount: number | null
        goalDeadline: Date | null
    }
) {
    const account = await prisma.account.findUnique({ where: { id: accountId } })
    
    const updateData: Record<string, unknown> = {
        goalEnabled: goalData.goalEnabled,
        goalAmount: goalData.goalAmount,
        goalDeadline: goalData.goalDeadline,
    }
    
    // Set start balance and date when enabling goal for first time
    if (goalData.goalEnabled && !account?.goalEnabled) {
        updateData.goalStartBalance = account?.balance
        updateData.goalStartDate = new Date()
    } else if (!goalData.goalEnabled) {
        updateData.goalAmount = null
        updateData.goalDeadline = null
    }
    
    await prisma.account.update({
        where: { id: accountId },
        data: updateData,
    })
    
    revalidatePath('/wallet')
    revalidatePath('/')
}

export async function deleteAccount(id: string) {
    await prisma.account.delete({
        where: { id },
    })

    revalidatePath('/wallet')
    revalidatePath('/')
}

export async function transferFunds(fromId: string, toId: string, amount: number) {
    await prisma.$transaction([
        prisma.account.update({
            where: { id: fromId },
            data: { balance: { decrement: amount } },
        }),
        prisma.account.update({
            where: { id: toId },
            data: { balance: { increment: amount } },
        }),
    ])

    revalidatePath('/wallet')
    revalidatePath('/')
}

export async function updateAccountCategory(id: string, category: AccountCategory) {
    const account = await prisma.account.update({
        where: { id },
        data: { category },
    })

    revalidatePath('/wallet')
    revalidatePath('/')

    return account
}

export async function updateAccountDescription(id: string, description: string | null) {
    const account = await prisma.account.update({
        where: { id },
        data: { description },
    })

    revalidatePath('/wallet')
    revalidatePath('/')

    return account
}

export async function updateAccountColor(id: string, color: string) {
    const account = await prisma.account.update({
        where: { id },
        data: { color },
    })

    revalidatePath('/wallet')
    revalidatePath('/')

    return account
}

export async function reorderAccounts(accountIds: string[]) {
    // Update sortOrder for each account based on position in array
    await prisma.$transaction(
        accountIds.map((id, index) =>
            prisma.account.update({
                where: { id },
                data: { sortOrder: index },
            })
        )
    )

    revalidatePath('/wallet')
    revalidatePath('/')
}
