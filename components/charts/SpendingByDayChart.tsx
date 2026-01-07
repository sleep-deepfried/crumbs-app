"use client";

import { useState, useMemo } from "react";
import { DayOfWeekSpending } from "@/lib/analyticsHelpers";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
import { ChevronDown } from "lucide-react";

interface SpendingByDayChartProps {
  data: DayOfWeekSpending[];
  onWeekChange?: (week: number | undefined) => void;
}

const chartConfig = {
  average: {
    label: "Average Spending",
    color: "#4A3B32",
  },
} satisfies ChartConfig;

export default function SpendingByDayChart({
  data,
  onWeekChange,
}: SpendingByDayChartProps) {
  // Calculate current week of the month
  const currentWeek = useMemo(() => {
    const today = new Date();
    const dayOfMonth = today.getDate();
    return Math.ceil(dayOfMonth / 7);
  }, []);

  const [selectedWeek, setSelectedWeek] = useState<number | undefined>(
    currentWeek
  );
  const [showDropdown, setShowDropdown] = useState(false);

  const handleWeekChange = (week: number | undefined) => {
    setSelectedWeek(week);
    setShowDropdown(false);
    if (onWeekChange) {
      onWeekChange(week);
    }
  };

  const weekLabel =
    selectedWeek === undefined ? "Monthly Average" : `Week ${selectedWeek}`;

  if (data.length === 0 || data.every((d) => d.average === 0)) {
    return (
      <div className="space-y-4">
        {/* Week Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="px-4 py-2 rounded-lg border-2 border-[#E6C288] bg-white text-[#4A3B32] font-medium flex items-center gap-2 hover:border-[#4A3B32] transition-colors"
          >
            <span className="text-sm">{weekLabel}</span>
            <ChevronDown
              size={16}
              className={`transition-transform ${
                showDropdown ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-lg border-2 border-[#E6C288] overflow-hidden z-10 min-w-[160px]">
              <button
                onClick={() => handleWeekChange(undefined)}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-[#E6C288]/20 transition-colors ${
                  selectedWeek === undefined
                    ? "bg-[#4A7C59] text-white hover:bg-[#4A7C59]"
                    : "text-[#4A3B32]"
                }`}
              >
                Monthly Average
              </button>
              {[1, 2, 3, 4, 5].map((week) => (
                <button
                  key={week}
                  onClick={() => handleWeekChange(week)}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-[#E6C288]/20 transition-colors ${
                    selectedWeek === week
                      ? "bg-[#4A7C59] text-white hover:bg-[#4A7C59]"
                      : "text-[#4A3B32]"
                  }`}
                >
                  Week {week}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-center h-64 text-[#4A3B32]/60">
          <p>No spending data available for this period</p>
        </div>
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
      {/* Week Filter Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="px-4 py-2 rounded-lg border-2 border-[#E6C288] bg-white text-[#4A3B32] font-medium flex items-center gap-2 hover:border-[#4A3B32] transition-colors"
        >
          <span className="text-sm">{weekLabel}</span>
          <ChevronDown
            size={16}
            className={`transition-transform ${
              showDropdown ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-lg border-2 border-[#E6C288] overflow-hidden z-10 min-w-[160px]">
            <button
              onClick={() => handleWeekChange(undefined)}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-[#E6C288]/20 transition-colors ${
                selectedWeek === undefined
                  ? "bg-[#4A7C59] text-white hover:bg-[#4A7C59]"
                  : "text-[#4A3B32]"
              }`}
            >
              Monthly Average
            </button>
            {[1, 2, 3, 4, 5].map((week) => (
              <button
                key={week}
                onClick={() => handleWeekChange(week)}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-[#E6C288]/20 transition-colors ${
                  selectedWeek === week
                    ? "bg-[#4A7C59] text-white hover:bg-[#4A7C59]"
                    : "text-[#4A3B32]"
                }`}
              >
                Week {week}
              </button>
            ))}
          </div>
        )}
      </div>

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
