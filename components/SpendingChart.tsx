"use client"

import { Pie, PieChart } from "recharts"
import { TransactionCategory } from "@/types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface SpendingChartProps {
  transactions: Array<{
    category: TransactionCategory
    amount: number
    type: string
  }>
}

export default function SpendingChart({ transactions }: SpendingChartProps) {
  // Aggregate expenses by category
  const expenses = transactions.filter((t) => t.type === "EXPENSE")

  const categoryTotals = expenses.reduce((acc, curr) => {
    const category = curr.category
    acc[category] = (acc[category] || 0) + curr.amount
    return acc
  }, {} as Record<string, number>)

  const data = Object.entries(categoryTotals)
    .map(([name, value]) => {
      // Map categories to chart colors (chart-1, chart-2, etc.)
      let fill = "var(--color-other)"
      switch (name) {
        case "NEEDS":
          fill = "var(--color-needs)"
          break
        case "WANTS":
          fill = "var(--color-wants)"
          break
        case "SAVINGS":
          fill = "var(--color-savings)" // Usually expenses aren't savings, but data model allows it
          break
        default:
          fill = "var(--color-other)"
      }
      return { 
        category: name, 
        value, 
        fill 
      }
    })
    .sort((a, b) => b.value - a.value)

  const chartConfig = {
    needs: {
      label: "Needs",
      color: "var(--chart-1)", // Dark Roast
    },
    wants: {
      label: "Wants",
      color: "var(--chart-2)", // Golden Crust
    },
    savings: {
      label: "Savings",
      color: "var(--chart-3)", // Brew Steam
    },
    other: {
      label: "Other",
      color: "var(--chart-4)", // Burnt Red
    },
  } satisfies ChartConfig

  if (transactions.filter(t => t.type === 'EXPENSE').length === 0) {
     return null
  }

  return (
    <Card className="flex flex-col border-none shadow-none bg-transparent">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-[#4A3B32]">Spending Breakdown</CardTitle>
        <CardDescription className="text-[#4A3B32]/70">Current Month</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="category"
              innerRadius={60}
              strokeWidth={5}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
