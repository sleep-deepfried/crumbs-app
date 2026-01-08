import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface CompletionStepProps {
  onComplete: () => void;
  summary: {
    spendingLimit?: number;
    accountName?: string;
    accountType?: string;
    monthlyIncome?: number;
    budgetPlan?: string;
    savingsGoal?: number;
    financialGoalsCount?: number;
  };
}

export default function CompletionStep({
  onComplete,
  summary,
}: CompletionStepProps) {
  const formatAccountType = (type?: string) => {
    if (!type) return "";
    switch (type) {
      case "BANK":
        return "Bank Account";
      case "E-WALLET":
        return "E-Wallet";
      case "CREDIT_CARD":
        return "Credit Card";
      default:
        return type;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-8">
      {/* Success Icon and Mascot */}
      <div className="mb-6 relative">
        <Image
          src="/bun-mascot.svg"
          alt="Crumb mascot celebrating"
          width={100}
          height={100}
          priority
        />
        <div className="absolute -top-2 -right-2">
          <CheckCircle2
            size={32}
            className="text-green-500 bg-white rounded-full"
            strokeWidth={2.5}
          />
        </div>
      </div>

      {/* Success Message */}
      <h2 className="text-2xl font-bold text-[#4A3B32] mb-3">
        You&apos;re All Set!
      </h2>

      <p className="text-base text-[#4A3B32]/80 mb-6 max-w-sm">
        Your personalized financial plan is ready. Let&apos;s start your journey to better money management!
      </p>

      {/* Enhanced Summary Card */}
      {(summary.spendingLimit || summary.accountName || summary.monthlyIncome) && (
        <div className="card-crumbs p-5 mb-8 w-full max-w-sm text-left">
          <h3 className="font-semibold text-[#4A3B32] mb-3 text-center">
            Your Financial Plan
          </h3>
          <div className="space-y-3">
            {summary.monthlyIncome && (
              <div className="flex justify-between items-center py-2 border-b border-[#E6C288]/30">
                <span className="text-sm text-[#4A3B32]/70">
                  Monthly Income
                </span>
                <span className="font-medium text-[#4A3B32]">
                  ₱{summary.monthlyIncome.toLocaleString()}
                </span>
              </div>
            )}
            {summary.budgetPlan && (
              <div className="flex justify-between items-center py-2 border-b border-[#E6C288]/30">
                <span className="text-sm text-[#4A3B32]/70">
                  Budget Plan
                </span>
                <span className="font-medium text-[#4A3B32]">
                  {summary.budgetPlan}
                </span>
              </div>
            )}
            {summary.spendingLimit && (
              <div className="flex justify-between items-center py-2 border-b border-[#E6C288]/30">
                <span className="text-sm text-[#4A3B32]/70">
                  Monthly Spending Limit
                </span>
                <span className="font-medium text-[#4A3B32]">
                  ₱{summary.spendingLimit.toLocaleString()}
                </span>
              </div>
            )}
            {summary.savingsGoal && (
              <div className="flex justify-between items-center py-2 border-b border-[#E6C288]/30">
                <span className="text-sm text-[#4A3B32]/70">
                  Monthly Savings Goal
                </span>
                <span className="font-medium text-[#A8D5BA]">
                  ₱{summary.savingsGoal.toLocaleString()}
                </span>
              </div>
            )}
            {summary.accountName && (
              <div className="flex justify-between items-center py-2 border-b border-[#E6C288]/30">
                <span className="text-sm text-[#4A3B32]/70">
                  First Account
                </span>
                <div className="text-right">
                  <div className="font-medium text-[#4A3B32]">
                    {summary.accountName}
                  </div>
                  <div className="text-xs text-[#4A3B32]/60">
                    {formatAccountType(summary.accountType)}
                  </div>
                </div>
              </div>
            )}
            {summary.financialGoalsCount && summary.financialGoalsCount > 0 && (
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-[#4A3B32]/70">
                  Financial Goals
                </span>
                <span className="font-medium text-[#4A3B32]">
                  {summary.financialGoalsCount} goal{summary.financialGoalsCount > 1 ? 's' : ''} set
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Motivational Message */}
      <div className="bg-[#A8D5BA]/10 border border-[#A8D5BA]/30 rounded-xl p-4 mb-6 w-full max-w-sm">
        <p className="text-sm text-[#4A3B32]/80">
          🎉 You&apos;re now ready to take control of your finances with a personalized plan that fits your lifestyle!
        </p>
      </div>

      {/* Start Tracking Button */}
      <Button
        onClick={onComplete}
        className="bg-[#4A3B32] hover:bg-[#4A3B32]/90 text-white px-8 py-6 text-base rounded-xl"
        size="lg"
      >
        Start Your Financial Journey
      </Button>

      <p className="text-xs text-[#4A3B32]/50 mt-4">
        You can adjust these settings anytime in your profile
      </p>
    </div>
  );
}
