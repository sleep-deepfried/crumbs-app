"use client"

import { SpendingTrend } from "@/lib/analyticsHelpers"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

interface SpendingTrendsChartProps {
  data: SpendingTrend[]
}

const chartConfig = {
  expenses: {
    label: "Expenses",
    color: "#4A3B32",
  },
  income: {
    label: "Income",
    color: "#4A7C59",
  },
  net: {
    label: "Net",
    color: "#6B5B95",
  },
} satisfies ChartConfig

export default function SpendingTrendsChart({ data }: SpendingTrendsChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-[#4A3B32]/60">
        <p>No data available for this period</p>
      </div>
    )
  }

  // Format dates for display (show month/day)
  const formattedData = data.map((item) => ({
    ...item,
    dateLabel: new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }))

  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <LineChart
        data={formattedData}
        margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E6C288" opacity={0.3} />
        <XAxis
          dataKey="dateLabel"
          tick={{ fill: "#4A3B32", fontSize: 12 }}
          stroke="#E6C288"
        />
        <YAxis
          tick={{ fill: "#4A3B32", fontSize: 12 }}
          stroke="#E6C288"
          tickFormatter={(value) => `₱${value.toLocaleString()}`}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value: number) => `₱${value.toLocaleString()}`}
              labelFormatter={(label) => `Date: ${label}`}
            />
          }
        />
        <Line
          type="monotone"
          dataKey="expenses"
          stroke={chartConfig.expenses.color}
          strokeWidth={2}
          dot={{ fill: chartConfig.expenses.color, r: 3 }}
          name="Expenses"
        />
        <Line
          type="monotone"
          dataKey="income"
          stroke={chartConfig.income.color}
          strokeWidth={2}
          dot={{ fill: chartConfig.income.color, r: 3 }}
          name="Income"
        />
      </LineChart>
    </ChartContainer>
  )
}

