import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield, TrendingUp, Home, Plane, GraduationCap } from "lucide-react";

interface FinancialGoalsStepProps {
  onNext: (goals: FinancialGoal[]) => void;
  onBack: () => void;
  monthlyIncome: number;
  savingsAmount: number;
  initialValue?: FinancialGoal[];
}

export interface FinancialGoal {
  id: string;
  type: "emergency" | "savings" | "investment" | "debt" | "purchase" | "education";
  name: string;
  targetAmount: number;
  timeframe: number; // months
  priority: "high" | "medium" | "low";
}

const goalTemplates = [
  {
    id: "emergency",
    type: "emergency" as const,
    name: "Emergency Fund",
    icon: Shield,
    description: "3-6 months of expenses",
    color: "#D9534F",
    defaultMultiplier: 3,
  },
  {
    id: "vacation",
    type: "purchase" as const,
    name: "Dream Vacation",
    icon: Plane,
    description: "Travel fund",
    color: "#4A90E2",
    defaultAmount: 50000,
  },
  {
    id: "house",
    type: "purchase" as const,
    name: "House Down Payment",
    icon: Home,
    description: "Home ownership goal",
    color: "#8B4513",
    defaultAmount: 500000,
  },
  {
    id: "investment",
    type: "investment" as const,
    name: "Investment Portfolio",
    icon: TrendingUp,
    description: "Build wealth",
    color: "#A8D5BA",
    defaultAmount: 100000,
  },
  {
    id: "education",
    type: "education" as const,
    name: "Education Fund",
    icon: GraduationCap,
    description: "Skills or degree",
    color: "#E6C288",
    defaultAmount: 75000,
  },
];

export default function FinancialGoalsStep({
  onNext,
  onBack,
  monthlyIncome,
  savingsAmount,
  initialValue = [],
}: FinancialGoalsStepProps) {
  const [selectedGoals, setSelectedGoals] = useState<FinancialGoal[]>(initialValue);
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});

  const handleGoalToggle = (template: typeof goalTemplates[0]) => {
    const existingGoal = selectedGoals.find(g => g.id === template.id);
    
    if (existingGoal) {
      // Remove goal
      setSelectedGoals(prev => prev.filter(g => g.id !== template.id));
    } else {
      // Add goal
      const defaultAmount = template.defaultMultiplier 
        ? monthlyIncome * template.defaultMultiplier
        : template.defaultAmount || 50000;
        
      const newGoal: FinancialGoal = {
        id: template.id,
        type: template.type,
        name: template.name,
        targetAmount: defaultAmount,
        timeframe: Math.ceil(defaultAmount / savingsAmount) || 12,
        priority: template.id === "emergency" ? "high" : "medium",
      };
      
      setSelectedGoals(prev => [...prev, newGoal]);
      setCustomAmounts(prev => ({ ...prev, [template.id]: defaultAmount.toString() }));
    }
  };

  const handleAmountChange = (goalId: string, amount: string) => {
    const numAmount = parseFloat(amount.replace(/[^\d.]/g, ""));
    if (!isNaN(numAmount)) {
      setCustomAmounts(prev => ({ ...prev, [goalId]: amount }));
      setSelectedGoals(prev => prev.map(goal => 
        goal.id === goalId 
          ? { ...goal, targetAmount: numAmount, timeframe: Math.ceil(numAmount / savingsAmount) || 12 }
          : goal
      ));
    }
  };

  const handleNext = () => {
    onNext(selectedGoals);
  };

  const totalGoalAmount = selectedGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const estimatedTimeframe = Math.ceil(totalGoalAmount / savingsAmount) || 0;

  return (
    <div className="flex flex-col px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[#4A3B32] mb-2">
          Set Your Financial Goals
        </h2>
        <p className="text-sm text-[#4A3B32]/70">
          With ₱{savingsAmount.toLocaleString()} monthly savings, what would you like to achieve?
        </p>
      </div>

      {/* Goal Templates */}
      <div className="space-y-3 mb-6">
        {goalTemplates.map((template) => {
          const Icon = template.icon;
          const isSelected = selectedGoals.some(g => g.id === template.id);
          const selectedGoal = selectedGoals.find(g => g.id === template.id);
          
          return (
            <div key={template.id} className="space-y-2">
              <button
                onClick={() => handleGoalToggle(template)}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? "border-[#4A3B32] bg-[#4A3B32]/5"
                    : "border-[#E6C288] bg-white hover:border-[#4A3B32]/50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${template.color}20` }}
                  >
                    <Icon
                      size={24}
                      style={{ color: template.color }}
                      strokeWidth={2}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#4A3B32] mb-1">
                      {template.name}
                    </h3>
                    <p className="text-sm text-[#4A3B32]/70">
                      {template.description}
                    </p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isSelected 
                      ? "border-[#4A3B32] bg-[#4A3B32]" 
                      : "border-[#E6C288]"
                  }`}>
                    {isSelected && <div className="w-3 h-3 bg-white rounded-full" />}
                  </div>
                </div>
              </button>
              
              {/* Custom Amount Input */}
              {isSelected && selectedGoal && (
                <div className="ml-16 p-3 bg-[#FDF6EC] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-[#4A3B32] mb-1">
                        Target Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A3B32] text-sm">₱</span>
                        <input
                          type="text"
                          value={customAmounts[template.id] || selectedGoal.targetAmount.toString()}
                          onChange={(e) => handleAmountChange(template.id, e.target.value)}
                          className="w-full pl-8 pr-3 py-2 border border-[#E6C288] rounded-lg text-sm focus:outline-none focus:border-[#4A3B32]"
                        />
                      </div>
                    </div>
                    <div className="text-xs text-[#4A3B32]/60">
                      <div>~{selectedGoal.timeframe} months</div>
                      <div>at current savings rate</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Goals Summary */}
      {selectedGoals.length > 0 && (
        <div className="bg-[#A8D5BA]/10 border border-[#A8D5BA]/30 rounded-xl p-4 mb-6">
          <h4 className="font-semibold text-[#4A3B32] mb-2">
            Your Financial Goals Summary:
          </h4>
          <div className="text-sm text-[#4A3B32]/70 space-y-1">
            <div>Total target: ₱{totalGoalAmount.toLocaleString()}</div>
            <div>Estimated timeframe: {estimatedTimeframe} months</div>
            <div>{selectedGoals.length} goal{selectedGoals.length > 1 ? 's' : ''} selected</div>
          </div>
        </div>
      )}

      {/* Skip Option */}
      <div className="text-center mb-6">
        <button
          onClick={() => onNext([])}
          className="text-sm text-[#4A3B32]/60 hover:text-[#4A3B32] underline"
        >
          Skip - I&apos;ll set goals later
        </button>
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
          className="bg-[#4A3B32] hover:bg-[#4A3B32]/90 text-white px-6"
        >
          Next
        </Button>
      </div>
    </div>
  );
}