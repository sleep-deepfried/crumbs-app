"use client";

import { MonthlyComparison } from "@/lib/analyticsHelpers";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface MonthlyComparisonChartProps {
  data: MonthlyComparison;
}

const chartConfig = {
  income: {
    label: "Income",
    color: "#4A7C59",
  },
  expenses: {
    label: "Expenses",
    color: "#4A3B32",
  },
} satisfies ChartConfig;

export default function MonthlyComparisonChart({
  data,
}: MonthlyComparisonChartProps) {
  const chartData = [
    {
      period: "Last Month",
      income: data.previousMonth.income,
      expenses: data.previousMonth.expenses,
    },
    {
      period: "This Month",
      income: data.currentMonth.income,
      expenses: data.currentMonth.expenses,
    },
  ];

  return (
    <div className="space-y-4">
      <ChartContainer config={chartConfig} className="h-64 w-full">
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E6C288" opacity={0.3} />
          <XAxis
            dataKey="period"
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
                formatter={(value) =>
                  `₱${
                    typeof value === "number" ? value.toLocaleString() : value
                  }`
                }
              />
            }
          />
          <Bar
            dataKey="income"
            fill={chartConfig.income.color}
            radius={[4, 4, 0, 0]}
            name="Income"
          />
          <Bar
            dataKey="expenses"
            fill={chartConfig.expenses.color}
            radius={[4, 4, 0, 0]}
            name="Expenses"
          />
        </BarChart>
      </ChartContainer>

      {/* Change Indicators */}
      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#E6C288]/30">
        <div>
          <p className="text-xs text-[#4A3B32]/60 mb-1">Income Change</p>
          <p
            className={`text-sm font-bold ${
              data.incomeChange >= 0 ? "text-[#4A7C59]" : "text-[#C74444]"
            }`}
          >
            {data.incomeChange >= 0 ? "+" : ""}
            {data.incomeChange.toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-xs text-[#4A3B32]/60 mb-1">Expenses Change</p>
          <p
            className={`text-sm font-bold ${
              data.expensesChange <= 0 ? "text-[#4A7C59]" : "text-[#C74444]"
            }`}
          >
            {data.expensesChange >= 0 ? "+" : ""}
            {data.expensesChange.toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
}
