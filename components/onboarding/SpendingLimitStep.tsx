import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface SpendingLimitStepProps {
  onNext: (spendingLimit: number) => void;
  onBack: () => void;
  initialValue?: number;
}

export default function SpendingLimitStep({
  onNext,
  onBack,
  initialValue = 39500,
}: SpendingLimitStepProps) {
  const [spendingLimit, setSpendingLimit] = useState<string>(
    initialValue.toString()
  );
  const [error, setError] = useState<string>("");

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
  };

  const isValid = spendingLimit && !error && parseFloat(spendingLimit) > 0;

  return (
    <div className="flex flex-col px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[#4A3B32] mb-2">
          Set Your Monthly Spending Limit
        </h2>
        <p className="text-sm text-[#4A3B32]/70">
          This helps you track your expenses and stay within budget. You can
          change this anytime in your profile.
        </p>
      </div>

      {/* Input Field */}
      <div className="mb-6">
        <label
          htmlFor="spending-limit"
          className="block text-sm font-medium text-[#4A3B32] mb-2"
        >
          Monthly Spending Limit
        </label>
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
            className="w-full pl-10 pr-4 py-3 border-2 border-[#E6C288] rounded-xl bg-white text-[#4A3B32] focus:outline-none focus:border-[#4A3B32] transition-colors"
            placeholder="39500"
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
        <p className="mt-2 text-xs text-[#4A3B32]/60">
          Enter your desired monthly spending limit in Philippine Pesos (₱)
        </p>
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
