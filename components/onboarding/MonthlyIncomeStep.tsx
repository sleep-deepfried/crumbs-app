import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface MonthlyIncomeStepProps {
  onNext: (monthlyIncome: number) => void;
  onBack: () => void;
  initialValue?: number;
}

export default function MonthlyIncomeStep({
  onNext,
  onBack,
  initialValue = 0,
}: MonthlyIncomeStepProps) {
  const [monthlyIncome, setMonthlyIncome] = useState<string>(
    initialValue > 0 ? initialValue.toString() : ""
  );
  const [error, setError] = useState<string>("");

  // Validate on change
  const numValue = parseFloat(monthlyIncome);
  const validationError = monthlyIncome && (isNaN(numValue) || numValue <= 0) 
    ? "Please enter a positive number" 
    : "";
  
  useEffect(() => {
    setError(validationError);
  }, [validationError]);

  const handleNext = () => {
    const numValue = parseFloat(monthlyIncome);
    if (!monthlyIncome || isNaN(numValue) || numValue <= 0) {
      setError("Please enter your monthly income");
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
    setMonthlyIncome(formatted);
  };

  const isValid = monthlyIncome && !error && parseFloat(monthlyIncome) > 0;

  // Quick amount buttons
  const quickAmounts = [20000, 30000, 50000, 75000, 100000];

  const handleQuickAmount = (amount: number) => {
    setMonthlyIncome(amount.toString());
  };

  return (
    <div className="flex flex-col px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[#4A3B32] mb-2">
          What&apos;s Your Monthly Income?
        </h2>
        <p className="text-sm text-[#4A3B32]/70">
          This helps us create a personalized budget plan that works for your financial situation.
        </p>
      </div>

      {/* Input Field */}
      <div className="mb-6">
        <label
          htmlFor="monthly-income"
          className="block text-sm font-medium text-[#4A3B32] mb-2"
        >
          Monthly Income
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A3B32] font-medium">
            ₱
          </span>
          <input
            id="monthly-income"
            type="text"
            inputMode="decimal"
            value={monthlyIncome}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 border-2 border-[#E6C288] rounded-xl bg-white text-[#4A3B32] focus:outline-none focus:border-[#4A3B32] transition-colors"
            placeholder="50000"
            aria-invalid={!!error}
            aria-describedby={error ? "monthly-income-error" : undefined}
          />
        </div>
        {error && (
          <p
            id="monthly-income-error"
            className="mt-2 text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}
        <p className="mt-2 text-xs text-[#4A3B32]/60">
          Include all sources: salary, freelance, business income, etc.
        </p>
      </div>

      {/* Quick Amount Buttons */}
      <div className="mb-6">
        <p className="text-sm font-medium text-[#4A3B32] mb-3">Quick Select:</p>
        <div className="grid grid-cols-3 gap-2">
          {quickAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => handleQuickAmount(amount)}
              className={`px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                monthlyIncome === amount.toString()
                  ? "border-[#4A3B32] bg-[#4A3B32] text-white"
                  : "border-[#E6C288] bg-white text-[#4A3B32] hover:border-[#4A3B32]"
              }`}
            >
              ₱{amount.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

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