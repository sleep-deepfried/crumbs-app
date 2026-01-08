import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BudgetPlan } from "./BudgetPlanStep";

interface SpendingLimitStepProps {
  onNext: (spendingLimit: number) => void;
  onBack: () => void;
  monthlyIncome: number;
  budgetPlan: BudgetPlan;
  initialValue?: number;
}

export default function SpendingLimitStep({
  onNext,
  onBack,
  monthlyIncome,
  budgetPlan,
  initialValue,
}: SpendingLimitStepProps) {
  // Calculate suggested spending limit based on budget plan
  const suggestedLimit = Math.round((monthlyIncome * (budgetPlan.needsPercentage + budgetPlan.wantsPercentage)) / 100);
  
  const [spendingLimit, setSpendingLimit] = useState<string>(
    initialValue?.toString() || suggestedLimit.toString()
  );
  const [error, setError] = useState<string>("");
  const [isCustom, setIsCustom] = useState<boolean>(
    initialValue !== undefined && initialValue !== suggestedLimit
  );

  // Validate on change
  const numValue = parseFloat(spendingLimit);
  const validationError = spendingLimit && (isNaN(numValue) || numValue <= 0) 
    ? "Please enter a positive number" 
    : "";
  
  useEffect(() => {
    setError(validationError);
  }, [validationError]);

  const handleNext = () => {
    const numValue = parseFloat(spendingLimit);
    if (!spendingLimit || isNaN(numValue) || numValue <= 0) {
      setError("Please enter a valid spending limit");
      return;
    }
    onNext(numValue);
  };

  const formatCurrency = (value: string) => {
    // Remove non-numeric characters except decimal point
    const cleaned = value.replace(/[^\d.]/g, "");
    return cleaned;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    setSpendingLimit(formatted);
    setIsCustom(formatted !== suggestedLimit.toString());
  };

  const handleUseSuggested = () => {
    setSpendingLimit(suggestedLimit.toString());
    setIsCustom(false);
  };

  const isValid = spendingLimit && !error && parseFloat(spendingLimit) > 0;

  // Calculate breakdown
  const needsAmount = Math.round((monthlyIncome * budgetPlan.needsPercentage) / 100);
  const wantsAmount = Math.round((monthlyIncome * budgetPlan.wantsPercentage) / 100);
  const savingsAmount = Math.round((monthlyIncome * budgetPlan.savingsPercentage) / 100);

  return (
    <div className="flex flex-col px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[#4A3B32] mb-2">
          Confirm Your Spending Limit
        </h2>
        <p className="text-sm text-[#4A3B32]/70">
          Based on your {budgetPlan.name} and ₱{monthlyIncome.toLocaleString()} income, here&apos;s our recommendation:
        </p>
      </div>

      {/* Smart Suggestion Card */}
      <div className="bg-[#A8D5BA]/10 border border-[#A8D5BA]/30 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[#4A3B32]">
            Recommended Spending Limit
          </h3>
          <span className="text-2xl font-bold text-[#4A3B32]">
            ₱{suggestedLimit.toLocaleString()}
          </span>
        </div>
        
        {/* Budget Breakdown */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 bg-white rounded-lg">
            <div className="text-xs text-[#4A3B32]/60 mb-1">Needs</div>
            <div className="font-semibold text-[#4A3B32]">₱{needsAmount.toLocaleString()}</div>
            <div className="text-xs text-[#4A3B32]/60">{budgetPlan.needsPercentage}%</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg">
            <div className="text-xs text-[#4A3B32]/60 mb-1">Wants</div>
            <div className="font-semibold text-[#4A3B32]">₱{wantsAmount.toLocaleString()}</div>
            <div className="text-xs text-[#4A3B32]/60">{budgetPlan.wantsPercentage}%</div>
          </div>
          <div className="text-center p-3 bg-[#A8D5BA]/20 rounded-lg">
            <div className="text-xs text-[#4A3B32]/60 mb-1">Savings</div>
            <div className="font-semibold text-[#4A3B32]">₱{savingsAmount.toLocaleString()}</div>
            <div className="text-xs text-[#4A3B32]/60">{budgetPlan.savingsPercentage}%</div>
          </div>
        </div>

        {!isCustom && (
          <div className="text-sm text-[#4A3B32]/70">
            ✓ This follows your chosen {budgetPlan.name} perfectly
          </div>
        )}
      </div>

      {/* Input Field */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="spending-limit"
            className="block text-sm font-medium text-[#4A3B32]"
          >
            Monthly Spending Limit
          </label>
          {isCustom && (
            <button
              onClick={handleUseSuggested}
              className="text-xs text-[#4A3B32]/60 hover:text-[#4A3B32] underline"
            >
              Use suggested
            </button>
          )}
        </div>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A3B32] font-medium">
            ₱
          </span>
          <input
            id="spending-limit"
            type="text"
            inputMode="decimal"
            value={spendingLimit}
            onChange={handleChange}
            className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl bg-white text-[#4A3B32] focus:outline-none transition-colors ${
              isCustom 
                ? "border-[#E6C288] focus:border-[#4A3B32]" 
                : "border-[#A8D5BA] focus:border-[#4A3B32] bg-[#A8D5BA]/5"
            }`}
            aria-invalid={!!error}
            aria-describedby={error ? "spending-limit-error" : undefined}
          />
        </div>
        {error && (
          <p
            id="spending-limit-error"
            className="mt-2 text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}
        {isCustom && (
          <p className="mt-2 text-xs text-[#4A3B32]/60">
            You&apos;ve customized your spending limit. This may affect your savings goal.
          </p>
        )}
        {!isCustom && (
          <p className="mt-2 text-xs text-[#4A3B32]/60">
            This amount aligns with your {budgetPlan.name} for optimal financial health.
          </p>
        )}
      </div>

      {/* Custom Amount Warning */}
      {isCustom && parseFloat(spendingLimit) > suggestedLimit && (
        <div className="bg-[#D9534F]/10 border border-[#D9534F]/30 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[#D9534F]">⚠️</span>
            <h4 className="font-semibold text-[#D9534F]">Higher than recommended</h4>
          </div>
          <p className="text-sm text-[#D9534F]/80">
            This exceeds your {budgetPlan.name} allocation and may impact your savings goals.
          </p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-auto pt-6">
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-[#4A3B32]/70 hover:text-[#4A3B32] hover:bg-[#E6C288]/20"
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!isValid}
          className="bg-[#4A3B32] hover:bg-[#4A3B32]/90 text-white px-6 disabled:opacity-50"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
