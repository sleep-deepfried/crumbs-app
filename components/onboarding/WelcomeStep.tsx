import Image from "next/image";
import { Button } from "@/components/ui/button";

interface WelcomeStepProps {
  onNext: () => void;
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-8">
      {/* Crumb Mascot */}
      <div className="mb-6">
        <Image
          src="/bun-mascot.svg"
          alt="Crumb mascot"
          width={120}
          height={120}
          priority
        />
      </div>

      {/* Welcome Message */}
      <h1 className="text-2xl font-bold text-[#4A3B32] mb-3">
        Welcome to Crumbs!
      </h1>
      
      <p className="text-base text-[#4A3B32]/80 mb-2 max-w-sm">
        Your friendly companion for tracking expenses and building better financial habits.
      </p>

      <p className="text-sm text-[#4A3B32]/60 mb-8 max-w-sm">
        Let&apos;s get you set up in just a few quick steps. We&apos;ll help you configure your spending limits, create your first account, and show you around.
      </p>

      {/* Get Started Button */}
      <Button
        onClick={onNext}
        className="bg-[#4A3B32] hover:bg-[#4A3B32]/90 text-white px-8 py-6 text-base rounded-xl"
        size="lg"
      >
        Get Started
      </Button>
    </div>
  );
}
