"use client";

import { DayOfWeekSpending } from "@/lib/analyticsHelpers";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";

interface SpendingByDayChartProps {
  data: DayOfWeekSpending[];
}

const chartConfig = {
  average: {
    label: "Average Spending",
    color: "#4A3B32",
  },
} satisfies ChartConfig;

export default function SpendingByDayChart({ data }: SpendingByDayChartProps) {
  if (data.length === 0 || data.every((d) => d.average === 0)) {
    return (
      <div className="flex items-center justify-center h-64 text-[#4A3B32]/60">
        <p>No spending data available for this period</p>
      </div>
    );
  }

  // Find best (lowest) and worst (highest) days
  const bestDay = data.reduce((min, day) =>
    day.average < min.average ? day : min
  );
  const worstDay = data.reduce((max, day) =>
    day.average > max.average ? day : max
  );

  const chartData = data.map((day) => ({
    day: day.day.slice(0, 3), // Short form: Sun, Mon, etc.
    average: day.average,
    isBest: day.dayIndex === bestDay.dayIndex,
    isWorst: day.dayIndex === worstDay.dayIndex,
  }));

  return (
    <div className="space-y-4">
      <ChartContainer config={chartConfig} className="h-64 w-full">
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E6C288" opacity={0.3} />
          <XAxis
            dataKey="day"
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
                labelFormatter={(label) => `Day: ${label}`}
              />
            }
          />
          <Bar dataKey="average" radius={[4, 4, 0, 0]} name="Average Spending">
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.isBest
                    ? "#4A7C59"
                    : entry.isWorst
                    ? "#C74444"
                    : chartConfig.average.color
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>

      {/* Best/Worst Day Indicators */}
      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#E6C288]/30">
        <div>
          <p className="text-xs text-[#4A3B32]/60 mb-1">Best Day</p>
          <p className="text-sm font-bold text-[#4A7C59]">
            {bestDay.day} (₱{bestDay.average.toLocaleString()})
          </p>
        </div>
        <div>
          <p className="text-xs text-[#4A3B32]/60 mb-1">Worst Day</p>
          <p className="text-sm font-bold text-[#C74444]">
            {worstDay.day} (₱{worstDay.average.toLocaleString()})
          </p>
        </div>
      </div>
    </div>
  );
}
