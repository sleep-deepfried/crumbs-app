"use client";

import { CategoryBreakdown } from "@/lib/analyticsHelpers";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Cell, Pie, PieChart } from "recharts";

interface CategoryBreakdownChartProps {
  data: CategoryBreakdown[];
}

const COLORS = {
  NEEDS: "#C74444",
  WANTS: "#6B5B95",
  SAVINGS: "#4A7C59",
  OTHER: "#E6C288",
} as const;

const chartConfig = {
  NEEDS: {
    label: "NEEDS",
    color: COLORS.NEEDS,
  },
  WANTS: {
    label: "WANTS",
    color: COLORS.WANTS,
  },
  SAVINGS: {
    label: "SAVINGS",
    color: COLORS.SAVINGS,
  },
  OTHER: {
    label: "OTHER",
    color: COLORS.OTHER,
  },
} satisfies ChartConfig;

export default function CategoryBreakdownChart({
  data,
}: CategoryBreakdownChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-[#4A3B32]/60">
        <p>No spending data available</p>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.amount, 0);

  const chartData = data.map((item) => ({
    name: item.category,
    value: item.amount,
    percentage: item.percentage,
  }));

  return (
    <div className="space-y-4">
      <ChartContainer config={chartConfig} className="h-64 w-full">
        <PieChart>
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name, props) => {
                  const percentage = props?.payload?.percentage ?? 0;
                  return [
                    `₱${
                      typeof value === "number" ? value.toLocaleString() : value
                    } (${percentage.toFixed(1)}%)`,
                    name,
                  ];
                }}
              />
            }
          />
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) =>
              `${name}: ${percentage.toFixed(0)}%`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.OTHER}
              />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor:
                  COLORS[item.name as keyof typeof COLORS] || COLORS.OTHER,
              }}
            />
            <span className="text-sm text-[#4A3B32]">
              {item.name}: ₱{item.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="text-center pt-2">
        <p className="text-xs text-[#4A3B32]/60">Total Expenses</p>
        <p className="text-lg font-bold text-[#4A3B32]">
          ₱{total.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
