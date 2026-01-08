"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastContext";
import {
  updateOnboardingStatus,
  saveOnboardingData,
} from "@/app/actions/user";
import WelcomeStep from "@/components/onboarding/WelcomeStep";
import SpendingLimitStep from "@/components/onboarding/SpendingLimitStep";
import AccountSetupStep from "@/components/onboarding/AccountSetupStep";
import FeaturesStep from "@/components/onboarding/FeaturesStep";
import CompletionStep from "@/components/onboarding/CompletionStep";

interface OnboardingWizardProps {
  userId: string;
  isReturningUser: boolean;
  initialStep?: number;
}

interface FormData {
  spendingLimit: number;
  accountName: string;
  accountType: "BANK" | "E-WALLET" | "CREDIT_CARD";
  accountBalance: number;
  accountColor?: string;
}

const TOTAL_STEPS = 5;
const DEFAULT_SPENDING_LIMIT = 39500;

export default function OnboardingWizard({
  userId,
  isReturningUser,
  initialStep = 0,
}: OnboardingWizardProps) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();

  // Step state management
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form data state
  const [formData, setFormData] = useState<FormData>({
    spendingLimit: DEFAULT_SPENDING_LIMIT,
    accountName: "",
    accountType: "BANK",
    accountBalance: 0,
  });

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleSkip = useCallback(async () => {
    setIsProcessing(true);
    try {
      // Set default values and mark as skipped
      await updateOnboardingStatus(userId, false, currentStep, true);
      
      showSuccess("Onboarding skipped. You can restart it anytime from your profile.");
      router.push("/");
    } catch (error) {
      console.error("Error skipping onboarding:", error);
      showError("Failed to skip onboarding. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [userId, currentStep, router, showSuccess, showError]);

  // Step-specific handlers
  const handleSpendingLimitNext = useCallback(
    (spendingLimit: number) => {
      setFormData((prev) => ({ ...prev, spendingLimit }));
      handleNext();
    },
    [handleNext]
  );

  const handleAccountSetupNext = useCallback(
    (accountData: {
      name: string;
      type: "BANK" | "E-WALLET" | "CREDIT_CARD";
      balance: number;
      color?: string;
    }) => {
      setFormData((prev) => ({
        ...prev,
        accountName: accountData.name,
        accountType: accountData.type,
        accountBalance: accountData.balance,
        accountColor: accountData.color,
      }));
      handleNext();
    },
    [handleNext]
  );

  const handleAccountSetupSkip = useCallback(() => {
    // Skip account creation but continue onboarding
    setFormData((prev) => ({
      ...prev,
      accountName: "",
    }));
    handleNext();
  }, [handleNext]);

  const handleComplete = useCallback(async () => {
    setIsProcessing(true);
    try {
      // Save onboarding data
      const saveResult = await saveOnboardingData(userId, {
        spendingLimit: formData.spendingLimit,
        accountName: formData.accountName || undefined,
        accountType: formData.accountName ? formData.accountType : undefined,
        accountBalance: formData.accountName ? formData.accountBalance : undefined,
        accountColor: formData.accountColor,
      });

      if (!saveResult.success) {
        showError(saveResult.error || "Failed to save onboarding data");
        return;
      }

      // Mark onboarding as complete
      await updateOnboardingStatus(userId, true, TOTAL_STEPS - 1, false);

      showSuccess("Welcome to Crumbs! Your account is all set up.");

      // Redirect based on user type
      if (isReturningUser) {
        router.push("/profile");
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
      showError("Failed to complete onboarding. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [
    userId,
    formData,
    isReturningUser,
    router,
    showSuccess,
    showError,
  ]);

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep onNext={handleNext} />;
      case 1:
        return (
          <SpendingLimitStep
            onNext={handleSpendingLimitNext}
            onBack={handleBack}
            initialValue={formData.spendingLimit}
          />
        );
      case 2:
        return (
          <AccountSetupStep
            onNext={handleAccountSetupNext}
            onBack={handleBack}
            onSkip={isReturningUser ? handleAccountSetupSkip : undefined}
            isReturningUser={isReturningUser}
            initialData={
              formData.accountName
                ? {
                    name: formData.accountName,
                    type: formData.accountType,
                    balance: formData.accountBalance,
                    color: formData.accountColor,
                  }
                : undefined
            }
          />
        );
      case 3:
        return <FeaturesStep onNext={handleNext} onBack={handleBack} />;
      case 4:
        return (
          <CompletionStep
            onComplete={handleComplete}
            summary={{
              spendingLimit: formData.spendingLimit,
              accountName: formData.accountName || undefined,
              accountType: formData.accountName ? formData.accountType : undefined,
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF6EC] flex flex-col">
      {/* Progress Indicator */}
      <div className="w-full px-6 py-6">
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? "w-8 bg-[#4A3B32]"
                  : index < currentStep
                  ? "w-2 bg-[#4A3B32]"
                  : "w-2 bg-[#E6C288]"
              }`}
              aria-label={`Step ${index + 1}${
                index === currentStep
                  ? " (current)"
                  : index < currentStep
                  ? " (completed)"
                  : ""
              }`}
            />
          ))}
        </div>
      </div>

      {/* Skip Button */}
      {currentStep < TOTAL_STEPS - 1 && (
        <div className="w-full px-6 flex justify-end">
          <button
            onClick={handleSkip}
            disabled={isProcessing}
            className="text-sm text-[#4A3B32]/60 hover:text-[#4A3B32] underline disabled:opacity-50"
          >
            Skip for now
          </button>
        </div>
      )}

      {/* Step Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md card-crumbs animate-fade-in">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
