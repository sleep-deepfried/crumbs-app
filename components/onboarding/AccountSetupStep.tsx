import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import ColorPicker from "@/components/ColorPicker";

interface AccountSetupStepProps {
  onNext: (accountData: {
    name: string;
    type: "BANK" | "E-WALLET" | "CREDIT_CARD";
    balance: number;
    color?: string;
  }) => void;
  onBack: () => void;
  onSkip?: () => void;
  isReturningUser?: boolean;
  initialData?: {
    name: string;
    type: "BANK" | "E-WALLET" | "CREDIT_CARD";
    balance: number;
    color?: string;
  };
}

export default function AccountSetupStep({
  onNext,
  onBack,
  onSkip,
  isReturningUser = false,
  initialData,
}: AccountSetupStepProps) {
  const [accountName, setAccountName] = useState(initialData?.name || "");
  const [accountType, setAccountType] = useState<
    "BANK" | "E-WALLET" | "CREDIT_CARD"
  >(initialData?.type || "BANK");
  const [balance, setBalance] = useState<string>(
    initialData?.balance?.toString() || "0"
  );
  const [color, setColor] = useState<string>(initialData?.color || "#E6C288");
  const [errors, setErrors] = useState<{
    name?: string;
    balance?: string;
  }>({});

  // Validate on change
  const validationErrors = (() => {
    const newErrors: { name?: string; balance?: string } = {};

    if (accountName && accountName.trim().length === 0) {
      newErrors.name = "Account name cannot be empty";
    }

    const numBalance = parseFloat(balance);
    if (balance && isNaN(numBalance)) {
      newErrors.balance = "Please enter a valid number";
    }

    return newErrors;
  })();

  useEffect(() => {
    setErrors(validationErrors);
  }, [validationErrors]);

  const handleNext = () => {
    const newErrors: { name?: string; balance?: string } = {};

    if (!accountName || accountName.trim().length === 0) {
      newErrors.name = "Account name is required";
    }

    const numBalance = parseFloat(balance);
    if (isNaN(numBalance)) {
      newErrors.balance = "Please enter a valid balance";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onNext({
      name: accountName.trim(),
      type: accountType,
      balance: numBalance,
      color,
    });
  };

  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d.-]/g, "");
    setBalance(value);
  };

  const isValid =
    accountName.trim().length > 0 &&
    !errors.name &&
    !errors.balance &&
    !isNaN(parseFloat(balance));

  return (
    <div className="flex flex-col px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#4A3B32] mb-2">
          Create Your First Account
        </h2>
        <p className="text-sm text-[#4A3B32]/70">
          Add a bank account, e-wallet, or credit card to start tracking your
          transactions.
        </p>
        {isReturningUser && onSkip && (
          <button
            onClick={onSkip}
            className="mt-3 text-sm text-[#4A3B32]/60 hover:text-[#4A3B32] underline"
          >
            Skip - I already have accounts
          </button>
        )}
      </div>

      {/* Form Fields */}
      <div className="space-y-5 mb-6">
        {/* Account Name */}
        <div>
          <label
            htmlFor="account-name"
            className="block text-sm font-medium text-[#4A3B32] mb-2"
          >
            Account Name *
          </label>
          <input
            id="account-name"
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            className="w-full px-4 py-3 border-2 border-[#E6C288] rounded-xl bg-white text-[#4A3B32] focus:outline-none focus:border-[#4A3B32] transition-colors"
            placeholder="e.g., Main Checking, GCash"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "account-name-error" : undefined}
          />
          {errors.name && (
            <p
              id="account-name-error"
              className="mt-2 text-sm text-red-600"
              role="alert"
            >
              {errors.name}
            </p>
          )}
        </div>

        {/* Account Type */}
        <div>
          <label
            htmlFor="account-type"
            className="block text-sm font-medium text-[#4A3B32] mb-2"
          >
            Account Type
          </label>
          <select
            id="account-type"
            value={accountType}
            onChange={(e) =>
              setAccountType(
                e.target.value as "BANK" | "E-WALLET" | "CREDIT_CARD"
              )
            }
            className="w-full px-4 py-3 border-2 border-[#E6C288] rounded-xl bg-white text-[#4A3B32] focus:outline-none focus:border-[#4A3B32] transition-colors"
          >
            <option value="BANK">Bank Account</option>
            <option value="E-WALLET">E-Wallet</option>
            <option value="CREDIT_CARD">Credit Card</option>
          </select>
        </div>

        {/* Initial Balance */}
        <div>
          <label
            htmlFor="balance"
            className="block text-sm font-medium text-[#4A3B32] mb-2"
          >
            Initial Balance
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A3B32] font-medium">
              ₱
            </span>
            <input
              id="balance"
              type="text"
              inputMode="decimal"
              value={balance}
              onChange={handleBalanceChange}
              className="w-full pl-10 pr-4 py-3 border-2 border-[#E6C288] rounded-xl bg-white text-[#4A3B32] focus:outline-none focus:border-[#4A3B32] transition-colors"
              placeholder="0"
              aria-invalid={!!errors.balance}
              aria-describedby={errors.balance ? "balance-error" : undefined}
            />
          </div>
          {errors.balance && (
            <p
              id="balance-error"
              className="mt-2 text-sm text-red-600"
              role="alert"
            >
              {errors.balance}
            </p>
          )}
        </div>

        {/* Color Picker */}
        <div>
          <label className="block text-sm font-medium text-[#4A3B32] mb-2">
            Account Color (Optional)
          </label>
          <ColorPicker selectedColor={color} onSelectColor={setColor} />
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
