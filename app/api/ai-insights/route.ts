import { GoogleGenAI } from "@google/genai"
import { NextRequest, NextResponse } from "next/server"
import { Transaction } from "@/types"
import {
  calculateSpendingVelocity,
  detectCategoryAlerts,
  calculateSavingsOpportunities,
  calculateBudgetProgress,
} from "@/lib/analyticsHelpers"

export async function POST(request: NextRequest) {
  try {
    const { transactions, user } = await request.json()

    // If no transactions, return empty insights
    if (!transactions || transactions.length === 0) {
      return NextResponse.json({
        insights: [
          {
            type: "info",
            message: "Start tracking your expenses to get personalized insights",
            emoji: "📊"
          }
        ]
      })
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY not configured")
      return NextResponse.json({
        insights: [
          {
            type: "info",
            message: "AI insights are temporarily unavailable",
            emoji: "💡"
          }
        ]
      })
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    })

    // Format transaction data for AI
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const thisMonthExpenses = transactions
      .filter(
        (t: Transaction) =>
          t.type === "EXPENSE" &&
          new Date(t.date) >= thisMonthStart &&
          new Date(t.date) <= now
      )
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0)

    const thisMonthIncome = transactions
      .filter(
        (t: Transaction) =>
          t.type === "INCOME" &&
          new Date(t.date) >= thisMonthStart &&
          new Date(t.date) <= now
      )
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0)

    // Category breakdown
    const categoryBreakdown: Record<string, number> = {}
    transactions
      .filter(
        (t: Transaction) =>
          t.type === "EXPENSE" &&
          new Date(t.date) >= thisMonthStart &&
          new Date(t.date) <= now
      )
      .forEach((t: Transaction) => {
        const category = t.mainCategory || "OTHER"
        categoryBreakdown[category] = (categoryBreakdown[category] || 0) + t.amount
      })

    // Top spending categories
    const topCategories = Object.entries(categoryBreakdown)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, amount]) => `${name}: ₱${amount.toLocaleString()}`)
      .join(", ")

    // Calculate additional metrics
    const spendingVelocity = calculateSpendingVelocity(
      transactions,
      user.spendingLimit
    )
    const categoryAlerts = detectCategoryAlerts(transactions)
    const savingsOpportunities = calculateSavingsOpportunities(transactions)
    const budgetProgress = user.spendingLimit
      ? calculateBudgetProgress(transactions, user.spendingLimit)
      : null

    // Build prompt
    const prompt = `You are a personal finance advisor analyzing spending data. Provide 3-5 concise, actionable insights in bullet points.

User Context:
- Monthly expenses: ₱${thisMonthExpenses.toLocaleString()}
- Monthly income: ₱${thisMonthIncome.toLocaleString()}
- Net: ₱${(thisMonthIncome - thisMonthExpenses).toLocaleString()}
- Spending limit: ₱${user.spendingLimit?.toLocaleString() || "Not set"}
- Total saved: ₱${user.totalSaved?.toLocaleString() || 0}

Top Spending Categories:
${topCategories || "No category data"}

Spending Velocity:
${spendingVelocity
  ? `Current daily average: ₱${spendingVelocity.currentDailyAverage.toLocaleString()}, Previous: ₱${spendingVelocity.previousDailyAverage.toLocaleString()}, Change: ${spendingVelocity.changePercentage.toFixed(1)}%, Projected monthly: ₱${spendingVelocity.projectedMonthlyTotal.toLocaleString()}${spendingVelocity.willExceedBudget ? " (WILL EXCEED BUDGET)" : ""}`
  : "No velocity data"}

Budget Progress:
${budgetProgress
  ? `Current: ₱${budgetProgress.currentSpending.toLocaleString()} / ₱${budgetProgress.spendingLimit.toLocaleString()} (${budgetProgress.percentage.toFixed(1)}%), Remaining: ₱${budgetProgress.remaining.toLocaleString()}, Projected: ₱${budgetProgress.projectedSpending.toLocaleString()}${budgetProgress.willExceed ? " (WILL EXCEED)" : ""}`
  : "No budget set"}

Category Alerts:
${categoryAlerts.length > 0
  ? categoryAlerts.map((a) => `${a.category}: ${a.message}`).join(", ")
  : "No unusual spending detected"}

Savings Opportunities:
${savingsOpportunities.length > 0
  ? savingsOpportunities.map((o) => o.message).join(", ")
  : "No significant opportunities identified"}

Provide insights that are:
1. Specific and actionable
2. Positive and encouraging when appropriate
3. Warning about concerning patterns
4. Include emoji for visual appeal
5. Keep each insight to one sentence

Format as JSON array:
{
  "insights": [
    {
      "type": "positive" | "warning" | "info",
      "message": "Your insight here with emoji",
      "emoji": "🎉"
    }
  ]
}`

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    })

    // Extract text from response
    const responseText = (response.candidates?.[0]?.content?.parts?.[0] as { text?: string })?.text || 
                        (typeof response === 'object' && 'text' in response ? (response as { text: string }).text : '') || 
                        ""
    
    // Try to parse JSON from response
    let insights: { insights: Array<{ type: string; message: string; emoji?: string }> }
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                       responseText.match(/\{[\s\S]*\}/)
      const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText
      insights = JSON.parse(jsonText)
    } catch {
      // Fallback: parse as plain text and create insights
      const lines = responseText
        .split("\n")
        .filter((line: string) => line.trim().startsWith("-") || line.trim().startsWith("•"))
        .slice(0, 5)

      insights = {
        insights: lines.map((line: string) => ({
          type: "info" as const,
          message: line.replace(/^[-•]\s*/, "").trim(),
          emoji: "💡",
        })),
      }
    }

    return NextResponse.json(insights)
  } catch (error) {
    console.error("AI Insights error:", error)
    // Return graceful fallback instead of 500 error
    return NextResponse.json({
      insights: [
        {
          type: "info",
          message: "Unable to generate insights at this time",
          emoji: "ℹ️"
        }
      ]
    })
  }
}

