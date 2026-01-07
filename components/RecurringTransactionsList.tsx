"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteRecurringTransaction } from "@/app/actions/recurring-transactions";
import { useToast } from "@/components/ToastContext";

interface RecurringTransaction {
  id: string;
  amount: number;
  category: string;
  subcategory: string | null;
  frequency: string;
  nextOccurrence: Date | string;
}

interface RecurringTransactionsListProps {
  transactions: RecurringTransaction[];
  userId: string;
}

export default function RecurringTransactionsList({
  transactions,
  userId,
}: RecurringTransactionsListProps) {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    const transaction = transactions.find((t) => t.id === id);
    setDeleting(id);
    const result = await deleteRecurringTransaction(id, userId);
    if (result.success) {
      showSuccess(
        `Deleted recurring transaction: ${transaction?.subcategory || transaction?.category || "transaction"}`
      );
      router.refresh();
    } else {
      setDeleting(null);
      showError("Failed to delete recurring transaction");
    }
  };

  return (
    <>
      {/* Calendar */}
      <div className="mb-6" role="region" aria-label="Recurring transactions calendar">
        <div className="grid grid-cols-7 gap-2 mb-4" role="grid" aria-label="Calendar">
          {(() => {
            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth();
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const days = [];

            // Add empty slots for days before month starts
            for (let i = 0; i < firstDay; i++) {
              days.push(<div key={`empty-${i}`} className="aspect-square" />);
            }

            // Get all recurring transaction dates for this month
            const recurringDates = transactions
              .map((r) => new Date(r.nextOccurrence).getDate())
              .filter((d) => !isNaN(d));

            // Add actual days
            for (let day = 1; day <= daysInMonth; day++) {
              const isToday = day === today.getDate();
              const hasRecurring = recurringDates.includes(day);
              days.push(
                <div
                  key={day}
                  className={`aspect-square flex items-center justify-center rounded-full text-sm font-medium transition-all ${
                    hasRecurring
                      ? "bg-[#F8B4B4] text-white"
                      : isToday
                      ? "bg-[#4A3B32] text-white"
                      : "text-[#4A3B32]/70"
                  }`}
                  role="gridcell"
                  aria-label={isToday ? `Today, ${day}` : hasRecurring ? `Day ${day} with recurring transaction` : `Day ${day}`}
                >
                  {day}
                </div>
              );
            }

            return days;
          })()}
        </div>
      </div>

      {/* Subscription Cards */}
      <div className="space-y-3" role="list" aria-label="Recurring transactions">
        {transactions.map((recurring) => {
          const nextDate = new Date(recurring.nextOccurrence);
          const day = nextDate.getDate();
          const suffix =
            day === 1 ? "st" : day === 2 ? "nd" : day === 3 ? "rd" : "th";
          const isSwiped = swipedId === recurring.id;
          const isDeleting = deleting === recurring.id;

          return (
            <div
              key={recurring.id}
              className="relative overflow-hidden rounded-2xl"
              role="listitem"
            >
              {/* Delete button (revealed on swipe) */}
              <div className="absolute inset-y-0 right-0 flex items-center justify-center bg-[#D9534F] w-20 rounded-r-2xl">
                <button
                  type="button"
                  onClick={() => handleDelete(recurring.id)}
                  disabled={isDeleting}
                  className="p-2"
                  aria-label={`Delete recurring transaction: ${recurring.subcategory || recurring.category}`}
                  title={`Delete ${recurring.subcategory || recurring.category}`}
                >
                  <Trash2 size={20} className="text-white" strokeWidth={2} aria-hidden="true" />
                </button>
              </div>

              {/* Subscription card */}
              <div
                className="bg-[#FDF6EC] rounded-2xl p-4 flex items-center justify-between relative transition-transform duration-300 ease-out group"
                style={{
                  transform: isSwiped ? "translateX(-80px)" : "translateX(0)",
                }}
                role="button"
                tabIndex={0}
                aria-label={`Recurring transaction: ${recurring.subcategory || recurring.category}, ${recurring.amount} ${recurring.frequency.toLowerCase()}, swipe left to delete`}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft' && !isSwiped) {
                    setSwipedId(recurring.id)
                  } else if (e.key === 'ArrowRight' && isSwiped) {
                    setSwipedId(null)
                  } else if (e.key === 'Delete' || e.key === 'Backspace') {
                    if (isSwiped) {
                      handleDelete(recurring.id)
                    }
                  }
                }}
                onTouchStart={(e) => {
                  setTouchStart(e.touches[0].clientX);
                }}
                onTouchMove={(e) => {
                  if (touchStart === null) return;
                  const currentTouch = e.touches[0].clientX;
                  const diff = touchStart - currentTouch;
                  if (diff > 50) {
                    setSwipedId(recurring.id);
                  } else if (diff < -50) {
                    setSwipedId(null);
                  }
                }}
                onTouchEnd={() => {
                  setTouchStart(null);
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  setTouchStart(e.clientX);
                }}
                onMouseMove={(e) => {
                  if (touchStart === null || e.buttons !== 1) return;
                  e.preventDefault();
                  const diff = touchStart - e.clientX;
                  if (diff > 50) {
                    setSwipedId(recurring.id);
                  } else if (diff < -50) {
                    setSwipedId(null);
                  }
                }}
                onMouseUp={() => {
                  setTouchStart(null);
                }}
                onMouseLeave={() => {
                  setTouchStart(null);
                }}
                onWheel={(e) => {
                  if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                    if (e.deltaX > 10) {
                      setSwipedId(recurring.id);
                    } else if (e.deltaX < -10) {
                      setSwipedId(null);
                    }
                  }
                }}
                onClick={() => {
                  if (isSwiped) {
                    setSwipedId(null);
                  }
                }}
              >
                <div className="flex items-center gap-4">
                  {/* Icon/Logo - using first letter as placeholder */}
                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                    <span className="text-2xl font-bold text-[#4A3B32]">
                      {(recurring.subcategory || recurring.category).charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-bold text-[#4A3B32]">
                      {recurring.subcategory || recurring.category}
                    </p>
                    <p className="text-sm text-[#4A3B32]/60">
                      {day}
                      {suffix} of Month •{" "}
                      {recurring.frequency.charAt(0) +
                        recurring.frequency.slice(1).toLowerCase()}
                    </p>
                    {!isSwiped && (
                      <p className="text-xs text-[#4A3B32]/50 mt-1 group-hover:text-[#4A3B32]/70 transition-colors">
                        ← Swipe to delete
                      </p>
                    )}
                  </div>
                </div>
                <div className="bg-[#F8B4B4] px-4 py-2 rounded-xl">
                  <p className="text-lg font-bold text-white">
                    ₱{recurring.amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
