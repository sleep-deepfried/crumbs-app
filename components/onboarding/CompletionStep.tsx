import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface CompletionStepProps {
  onComplete: () => void;
  summary: {
    spendingLimit?: number;
    accountName?: string;
    accountType?: string;
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
        Your Crumbs account is ready. Let&apos;s start tracking your financial journey!
      </p>

      {/* Summary Card */}
      {(summary.spendingLimit || summary.accountName) && (
        <div className="card-crumbs p-5 mb-8 w-full max-w-sm text-left">
          <h3 className="font-semibold text-[#4A3B32] mb-3 text-center">
            Your Settings
          </h3>
          <div className="space-y-2">
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
            {summary.accountName && (
              <div className="flex justify-between items-center py-2">
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
          </div>
        </div>
      )}

      {/* Start Tracking Button */}
      <Button
        onClick={onComplete}
        className="bg-[#4A3B32] hover:bg-[#4A3B32]/90 text-white px-8 py-6 text-base rounded-xl"
        size="lg"
      >
        Start Tracking
      </Button>

      <p className="text-xs text-[#4A3B32]/50 mt-4">
        You can change these settings anytime in your profile
      </p>
    </div>
  );
}
