import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PieChart, Target, Calculator, Settings } from "lucide-react";

interface BudgetPlanStepProps {
  onNext: (budgetPlan: BudgetPlan) => void;
  onBack: () => void;
  monthlyIncome: number;
  initialValue?: BudgetPlan;
}

export interface BudgetPlan {
  type: "50-30-20" | "60-40" | "zero-based" | "custom";
  name: string;
  description: string;
  needsPercentage: number;
  wantsPercentage: number;
  savingsPercentage: number;
}

const budgetPlans: BudgetPlan[] = [
  {
    type: "50-30-20",
    name: "50/30/20 Rule",
    description: "50% needs, 30% wants, 20% savings - Perfect for beginners",
    needsPercentage: 50,
    wantsPercentage: 30,
    savingsPercentage: 20,
  },
  {
    type: "60-40",
    name: "60/40 Rule",
    description: "60% needs, 25% wants, 15% savings - More flexible approach",
    needsPercentage: 60,
    wantsPercentage: 25,
    savingsPercentage: 15,
  },
  {
    type: "zero-based",
    name: "Zero-Based Budget",
    description: "Every peso has a purpose - Maximum control over spending",
    needsPercentage: 55,
    wantsPercentage: 25,
    savingsPercentage: 20,
  },
];

export default function BudgetPlanStep({
  onNext,
  onBack,
  monthlyIncome,
  initialValue,
}: BudgetPlanStepProps) {
  const [selectedPlan, setSelectedPlan] = useState<BudgetPlan | null>(
    initialValue || null
  );

  const handleNext = () => {
    if (selectedPlan) {
      onNext(selectedPlan);
    }
  };

  const calculateAmount = (percentage: number) => {
    return (monthlyIncome * percentage) / 100;
  };

  const getPlanIcon = (type: string) => {
    switch (type) {
      case "50-30-20":
        return PieChart;
      case "60-40":
        return Target;
      case "zero-based":
        return Calculator;
      default:
        return Settings;
    }
  };

  return (
    <div className="flex flex-col px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[#4A3B32] mb-2">
          Choose Your Budget Plan
        </h2>
        <p className="text-sm text-[#4A3B32]/70">
          Based on your ₱{monthlyIncome.toLocaleString()} monthly income, here are some proven budgeting methods:
        </p>
      </div>

      {/* Budget Plan Options */}
      <div className="space-y-4 mb-6">
        {budgetPlans.map((plan) => {
          const Icon = getPlanIcon(plan.type);
          const isSelected = selectedPlan?.type === plan.type;
          
          return (
            <button
              key={plan.type}
              onClick={() => setSelectedPlan(plan)}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? "border-[#4A3B32] bg-[#4A3B32]/5"
                  : "border-[#E6C288] bg-white hover:border-[#4A3B32]/50"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                    isSelected ? "bg-[#4A3B32]" : "bg-[#E6C288]/20"
                  }`}
                >
                  <Icon
                    size={24}
                    className={isSelected ? "text-white" : "text-[#4A3B32]"}
                    strokeWidth={2}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#4A3B32] mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-[#4A3B32]/70 mb-3">
                    {plan.description}
                  </p>
                  
                  {/* Budget Breakdown */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-[#FDF6EC] p-2 rounded-lg">
                      <div className="font-medium text-[#4A3B32]">Needs</div>
                      <div className="text-[#4A3B32]/60">{plan.needsPercentage}%</div>
                      <div className="font-semibold text-[#4A3B32]">
                        ₱{calculateAmount(plan.needsPercentage).toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-[#FDF6EC] p-2 rounded-lg">
                      <div className="font-medium text-[#4A3B32]">Wants</div>
                      <div className="text-[#4A3B32]/60">{plan.wantsPercentage}%</div>
                      <div className="font-semibold text-[#4A3B32]">
                        ₱{calculateAmount(plan.wantsPercentage).toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-[#FDF6EC] p-2 rounded-lg">
                      <div className="font-medium text-[#4A3B32]">Savings</div>
                      <div className="text-[#4A3B32]/60">{plan.savingsPercentage}%</div>
                      <div className="font-semibold text-[#4A3B32]">
                        ₱{calculateAmount(plan.savingsPercentage).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Plan Summary */}
      {selectedPlan && (
        <div className="bg-[#A8D5BA]/10 border border-[#A8D5BA]/30 rounded-xl p-4 mb-6">
          <h4 className="font-semibold text-[#4A3B32] mb-2">
            Your {selectedPlan.name} Budget:
          </h4>
          <p className="text-sm text-[#4A3B32]/70">
            You&apos;ll have ₱{calculateAmount(selectedPlan.needsPercentage + selectedPlan.wantsPercentage).toLocaleString()} 
            {" "}for monthly expenses and ₱{calculateAmount(selectedPlan.savingsPercentage).toLocaleString()} for savings.
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
          disabled={!selectedPlan}
          className="bg-[#4A3B32] hover:bg-[#4A3B32]/90 text-white px-6 disabled:opacity-50"
        >
          Next
        </Button>
      </div>
    </div>
  );
}