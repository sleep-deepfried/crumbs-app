"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryBreakdown } from "@/lib/analyticsHelpers";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";

interface CategoryDetailModalProps {
  category: CategoryBreakdown | null;
  onClose: () => void;
}

const CATEGORY_COLORS = {
  NEEDS: "#C74444",
  WANTS: "#6B5B95",
  SAVINGS: "#4A7C59",
  OTHER: "#E6C288",
} as const;

export default function CategoryDetailModal({
  category,
  onClose,
}: CategoryDetailModalProps) {
  if (!category) return null;

  const chartConfig = {
    amount: {
      label: "Amount",
      color:
        CATEGORY_COLORS[category.category as keyof typeof CATEGORY_COLORS] ||
        CATEGORY_COLORS.OTHER,
    },
  } satisfies ChartConfig;

  const chartData =
    category.subcategories?.map((sub) => ({
      name: sub.name,
      amount: sub.amount,
    })) || [];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-hidden flex flex-col mt-4">
        {/* Header */}
        <div
          className="p-4 text-white flex items-center justify-between"
          style={{
            backgroundColor:
              CATEGORY_COLORS[
                category.category as keyof typeof CATEGORY_COLORS
              ] || CATEGORY_COLORS.OTHER,
          }}
        >
          <div>
            <h2 className="text-xl font-bold">{category.category}</h2>
            <p className="text-sm opacity-90">
              ₱{category.amount.toLocaleString()} (
              {category.percentage.toFixed(1)}%)
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {chartData.length > 0 ? (
            <>
              <h3 className="text-sm font-semibold text-[#4A3B32] mb-3">
                Subcategories Breakdown
              </h3>

              {/* Bar Chart */}
              <ChartContainer config={chartConfig} className="h-64 w-full mb-4">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `₱${value}`}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => [
                          `₱${
                            typeof value === "number"
                              ? value.toLocaleString()
                              : value
                          }`,
                          "Amount",
                        ]}
                      />
                    }
                  />
                  <Bar
                    dataKey="amount"
                    fill={chartConfig.amount.color}
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>

              {/* List */}
              <div className="space-y-2">
                {chartData.map((sub, index) => {
                  const percentage = (sub.amount / category.amount) * 100;
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-[#FDF6EC] rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-[#4A3B32]">{sub.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-white h-2 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: chartConfig.amount.color,
                              }}
                            />
                          </div>
                          <span className="text-xs text-[#4A3B32]/60 min-w-[40px]">
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="font-bold text-[#4A3B32]">
                          ₱{sub.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-[#4A3B32]/60">
              <p>No subcategory data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
