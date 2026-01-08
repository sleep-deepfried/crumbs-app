import { Button } from "@/components/ui/button";
import { Flame, Coffee, TrendingUp } from "lucide-react";

interface FeaturesStepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function FeaturesStep({ onNext, onBack }: FeaturesStepProps) {
  const features = [
    {
      icon: Flame,
      title: "Streak System",
      description:
        "Build your daily tracking streak by logging transactions consistently. The longer your streak, the more motivated you&apos;ll be!",
      color: "#FF6B6B",
    },
    {
      icon: Coffee,
      title: "Brew Level",
      description:
        "Watch your savings grow and unlock vessel upgrades from Glass to Mug to French Press. Each level represents your financial progress!",
      color: "#8B4513",
    },
    {
      icon: TrendingUp,
      title: "Transaction Tracking",
      description:
        "Quickly log expenses and income with just a few taps. Track where your money goes and make smarter financial decisions.",
      color: "#4A90E2",
    },
  ];

  return (
    <div className="flex flex-col px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#4A3B32] mb-2">
          Key Features
        </h2>
        <p className="text-sm text-[#4A3B32]/70">
          Here&apos;s what makes Crumbs special and how it helps you manage your finances.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="space-y-4 mb-8">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="card-crumbs p-5 flex gap-4 items-start"
            >
              <div
                className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${feature.color}20` }}
              >
                <Icon
                  size={24}
                  style={{ color: feature.color }}
                  strokeWidth={2}
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[#4A3B32] mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#4A3B32]/70 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          );
        })}
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
          onClick={onNext}
          className="bg-[#4A3B32] hover:bg-[#4A3B32]/90 text-white px-6"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
