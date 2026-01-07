"use client";

import { useEffect } from "react";
import { Trophy, PartyPopper } from "lucide-react";

interface GoalCelebrationProps {
  isOpen: boolean;
  accountName: string;
  goalAmount: number;
  onClose: () => void;
}

export default function GoalCelebration({
  isOpen,
  accountName,
  goalAmount,
  onClose,
}: GoalCelebrationProps) {
  useEffect(() => {
    if (isOpen) {
      // Simple confetti effect using CSS animations
      const confetti = document.createElement("div");
      confetti.className = "fixed inset-0 pointer-events-none z-[101]";
      confetti.innerHTML = Array.from({ length: 50 })
        .map(() => {
          const delay = Math.random() * 2;
          const duration = 2 + Math.random() * 2;
          const left = Math.random() * 100;
          const rotation = Math.random() * 360;
          return `
          <div style="
            position: absolute;
            left: ${left}%;
            top: -10px;
            width: 10px;
            height: 10px;
            background: ${
              ["#4A7C59", "#E6C288", "#4A6FA5", "#6B5B95", "#C74444"][
                Math.floor(Math.random() * 5)
              ]
            };
            animation: confetti-fall ${duration}s ${delay}s linear forwards;
            transform: rotate(${rotation}deg);
            border-radius: 50%;
          "></div>
        `;
        })
        .join("");
      document.body.appendChild(confetti);

      setTimeout(() => {
        confetti.remove();
      }, 5000);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-[#4A7C59] to-[#2D5F3F] text-white w-full max-w-sm rounded-3xl shadow-2xl p-8 text-center animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4">
          <Trophy size={64} className="mx-auto text-[#E6C288]" />
        </div>

        <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          Goal Achieved! <PartyPopper size={24} />
        </h2>

        <p className="text-white/90 mb-6">
          You&apos;ve reached your savings goal for{" "}
          <strong>{accountName}</strong>!
        </p>

        <div className="bg-white/20 rounded-xl p-4 mb-6">
          <p className="text-sm text-white/80 mb-1">Goal Amount</p>
          <p className="text-3xl font-bold">
            ₱{goalAmount.toLocaleString("en-PH")}
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-white text-[#4A7C59] py-3 rounded-full font-bold hover:bg-white/90 transition-colors"
        >
          Awesome!
        </button>
      </div>
    </div>
  );
}
