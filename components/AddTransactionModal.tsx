"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addTransaction } from "@/app/actions/transactions";
import { getCurrentUser } from "@/app/actions/user";
import { createRecurringTransaction } from "@/app/actions/recurring-transactions";
import { TransactionCategory, RecurringFrequency } from "@/types";
import { CATEGORY_LABELS } from "@/lib/constants";
import { TrendingDown, TrendingUp, Trash2, RefreshCw } from "lucide-react";
import {
  transactionSchema,
  type TransactionFormData,
} from "@/lib/validations/transaction";
import { useToast } from "@/components/ToastContext";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddTransactionModal({
  isOpen,
  onClose,
}: AddTransactionModalProps) {
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit: handleFormSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: "",
      category: "EXPENSE",
      selectedCategory: "",
      description: "",
      isRecurring: false,
      frequency: "MONTHLY",
      startDate: new Date().toISOString().split("T")[0],
    },
  });

  // Watch form values
  const category = watch("category");
  const selectedCategory = watch("selectedCategory");
  const isRecurring = watch("isRecurring");
  const frequency = watch("frequency");

  // UI state
  const [showCategoryPopup, setShowCategoryPopup] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("NEEDS");
  const [loading, setLoading] = useState(false);
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [customSubcategories, setCustomSubcategories] = useState<{
    NEEDS: string[];
    WANTS: string[];
    SAVINGS: string[];
  }>({ NEEDS: [], WANTS: [], SAVINGS: [] });
  const [swipedCategory, setSwipedCategory] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const baseSubcategories = {
    NEEDS: [
      "Rent",
      "Groceries",
      "Utilities",
      "Transportation",
      "Insurance",
      "Healthcare",
      "Other",
    ],
    WANTS: [
      "Dining Out",
      "Entertainment",
      "Shopping",
      "Hobbies",
      "Travel",
      "Subscriptions",
      "Other",
    ],
    SAVINGS: [
      "Emergency Fund",
      "Investment",
      "Retirement",
      "Vacation Fund",
      "House Fund",
      "Education",
      "Other",
    ],
  };

  // Combine base and custom subcategories (custom ones before "Other")
  const subcategories = {
    NEEDS: [
      ...baseSubcategories.NEEDS.filter((cat) => cat !== "Other"),
      ...customSubcategories.NEEDS,
      "Other",
    ],
    WANTS: [
      ...baseSubcategories.WANTS.filter((cat) => cat !== "Other"),
      ...customSubcategories.WANTS,
      "Other",
    ],
    SAVINGS: [
      ...baseSubcategories.SAVINGS.filter((cat) => cat !== "Other"),
      ...customSubcategories.SAVINGS,
      "Other",
    ],
  };

  // Load custom categories from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("customSubcategories");
    if (stored) {
      try {
        setCustomSubcategories(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load custom categories:", e);
      }
    }
  }, []);

  // Save custom categories to localStorage whenever they change
  useEffect(() => {
    if (
      customSubcategories.NEEDS.length > 0 ||
      customSubcategories.WANTS.length > 0 ||
      customSubcategories.SAVINGS.length > 0
    ) {
      localStorage.setItem(
        "customSubcategories",
        JSON.stringify(customSubcategories)
      );
    }
  }, [customSubcategories]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
      setShowCategoryPopup(false);
      setActiveTab("NEEDS");
      setLoading(false);
      setShowCustomCategoryInput(false);
      setCustomCategory("");
    }
  }, [isOpen, reset]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  async function onSubmit(data: TransactionFormData) {
    setLoading(true);

    try {
      // Get current user
      const user = await getCurrentUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      // All expenses deduct from their respective budgets
      const isSavings = false;

      if (data.isRecurring && data.frequency && data.startDate) {
        // Create recurring transaction
        const result = await createRecurringTransaction(
          user.id,
          parseFloat(data.amount),
          data.category,
          data.frequency,
          new Date(data.startDate),
          data.description || undefined,
          data.category === "EXPENSE" ? activeTab : undefined,
          data.category === "EXPENSE"
            ? data.selectedCategory || undefined
            : undefined,
          isSavings,
          1 // interval
        );
        if (result.success) {
          showSuccess(
            `Recurring ${data.category.toLowerCase()} created successfully`
          );
          onClose();
          router.refresh();
        } else {
          setLoading(false);
          showError(result.error || "Failed to create recurring transaction");
        }
      } else {
        // Create one-time transaction
        const result = await addTransaction(
          user.id,
          parseFloat(data.amount),
          data.category,
          data.description || undefined,
          isSavings,
          data.category === "EXPENSE"
            ? data.selectedCategory || undefined
            : undefined,
          data.category === "EXPENSE" ? activeTab : undefined
        );
        if (result.success) {
          showSuccess(
            `${
              data.category === "INCOME" ? "Income" : "Expense"
            } added successfully`
          );
          onClose();
          router.refresh();
        } else {
          setLoading(false);
          showError(result.error || "Failed to add transaction");
        }
      }
    } catch {
      setLoading(false);
      showError("An unexpected error occurred");
    }
  }

  const getCategoryIcon = (cat: TransactionCategory) => {
    const isActive = category === cat;
    const colorClass = isActive ? "text-white" : "text-white/30";

    switch (cat) {
      case "EXPENSE":
        return (
          <TrendingDown size={20} className={colorClass} strokeWidth={2} />
        );
      case "INCOME":
        return <TrendingUp size={20} className={colorClass} strokeWidth={2} />;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="transaction-modal-title"
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header with Tabs */}
        <div className="bg-[#4A3B32] text-white rounded-t-3xl">
          {/* Category Tabs in Header */}
          <div className="relative px-4 pt-6">
            <h2 id="transaction-modal-title" className="sr-only">
              Add Transaction
            </h2>
            <div className="flex" role="tablist" aria-label="Transaction type">
              {(["EXPENSE", "INCOME"] as TransactionCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setValue("category", cat);
                    setValue("selectedCategory", "");
                    setShowCategoryPopup(false);
                    setActiveTab("NEEDS");
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-5 font-semibold transition-colors min-h-[52px] ${
                    category === cat
                      ? "text-white"
                      : "text-white/30 hover:text-white/60"
                  }`}
                  role="tab"
                  aria-selected={category === cat}
                  aria-controls={`${cat.toLowerCase()}-panel`}
                >
                  {getCategoryIcon(cat)}
                  <span className="text-base">{CATEGORY_LABELS[cat]}</span>
                </button>
              ))}
            </div>
            {/* Sliding indicator */}
            <div
              className="absolute bottom-0 left-4 right-4 h-1 bg-white transition-transform duration-300 ease-in-out"
              style={{
                width: "calc(50% - 1rem)",
                transform:
                  category === "INCOME"
                    ? "translateX(calc(100% + 2rem))"
                    : "translateX(0)",
              }}
              aria-hidden="true"
            />
          </div>
        </div>
        {/* Form */}
        <div
          className="bg-[#FDF6EC] px-4 py-6 max-h-[80vh] overflow-y-auto"
          role="tabpanel"
          id={`${category.toLowerCase()}-panel`}
        >
          <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-6">
            {/* Amount Input */}
            <div className="card-crumbs">
              <label
                htmlFor="amount-input"
                className="block text-sm font-semibold text-[#4A3B32] mb-3"
              >
                Amount (₱)
              </label>
              <div className="relative">
                <span
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-3xl font-bold text-[#4A3B32]/40"
                  aria-hidden="true"
                >
                  ₱
                </span>
                <input
                  id="amount-input"
                  type="number"
                  {...register("amount")}
                  placeholder="0"
                  step="0.01"
                  min="0"
                  className={`w-full pl-12 pr-4 py-4 text-3xl font-bold text-[#4A3B32] bg-[#FDF6EC] rounded-lg border-2 ${
                    errors.amount ? "border-[#D9534F]" : "border-[#E6C288]"
                  } focus:border-[#4A3B32] focus:outline-none`}
                  autoFocus
                  aria-invalid={!!errors.amount}
                  aria-describedby={errors.amount ? "amount-error" : undefined}
                />
              </div>
              {errors.amount && (
                <p
                  id="amount-error"
                  className="text-xs text-[#D9534F] mt-1"
                  role="alert"
                >
                  {errors.amount.message}
                </p>
              )}
            </div>

            {/* Category Selection (only for expenses) */}
            {category === "EXPENSE" && (
              <div className="card-crumbs relative">
                <label
                  htmlFor="category-selector"
                  className="block text-sm font-semibold text-[#4A3B32] mb-3"
                >
                  Category
                </label>
                <button
                  id="category-selector"
                  type="button"
                  onClick={() => setShowCategoryPopup(!showCategoryPopup)}
                  className="w-full px-4 py-3 text-[#4A3B32] bg-[#FDF6EC] rounded-lg border-2 border-[#E6C288] focus:border-[#4A3B32] focus:outline-none flex items-center justify-between hover:border-[#4A3B32] transition-colors"
                  aria-expanded={showCategoryPopup}
                  aria-haspopup="true"
                  aria-controls="category-popup"
                  aria-describedby={
                    errors.selectedCategory ? "category-error" : undefined
                  }
                >
                  <span className="font-semibold">
                    {selectedCategory || "Select category"}
                  </span>
                  <svg
                    className={`w-5 h-5 transition-transform ${
                      showCategoryPopup ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Popup Card with Tabs */}
                {showCategoryPopup && (
                  <>
                    {/* Backdrop blur */}
                    <div
                      className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-fade-in"
                      onClick={() => {
                        setShowCategoryPopup(false);
                        setShowCustomCategoryInput(false);
                        setCustomCategory("");
                        setSwipedCategory(null);
                      }}
                      aria-hidden="true"
                    />

                    {/* Centered popup card */}
                    <div
                      className="fixed inset-0 flex items-center justify-center z-50 px-4 pointer-events-none animate-scale-in"
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby="category-popup-title"
                    >
                      <div
                        id="category-popup"
                        className="w-full max-w-md bg-white rounded-xl shadow-2xl border-2 border-[#E6C288] overflow-hidden max-h-[70vh] flex flex-col pointer-events-auto"
                      >
                        {/* Tab Headers */}
                        <div className="relative border-b-2 border-[#E6C288] shrink-0">
                          <h3 id="category-popup-title" className="sr-only">
                            Select Category
                          </h3>
                          <div
                            className="flex"
                            role="tablist"
                            aria-label="Category type"
                          >
                            {["NEEDS", "WANTS", "SAVINGS"].map((tab) => (
                              <button
                                key={tab}
                                type="button"
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                                  activeTab === tab
                                    ? "text-[#4A3B32]"
                                    : "text-[#4A3B32]/70 hover:text-[#4A3B32]"
                                }`}
                                role="tab"
                                aria-selected={activeTab === tab}
                                aria-controls={`${tab.toLowerCase()}-categories`}
                              >
                                {tab}
                              </button>
                            ))}
                          </div>
                          {/* Sliding indicator */}
                          <div
                            className="absolute bottom-0 h-0.5 bg-[#4A3B32] transition-transform duration-300 ease-in-out"
                            style={{
                              width: "33.333%",
                              transform:
                                activeTab === "WANTS"
                                  ? "translateX(100%)"
                                  : activeTab === "SAVINGS"
                                  ? "translateX(200%)"
                                  : "translateX(0)",
                            }}
                            aria-hidden="true"
                          />
                        </div>

                        {/* Tab Content - Subcategories */}
                        <div
                          className="overflow-y-auto flex-1"
                          role="tabpanel"
                          id={`${activeTab.toLowerCase()}-categories`}
                        >
                          {subcategories[
                            activeTab as keyof typeof subcategories
                          ].map((subcat) => {
                            const isCustom =
                              customSubcategories[
                                activeTab as keyof typeof customSubcategories
                              ].includes(subcat);
                            const isSwiped = swipedCategory === subcat;

                            return (
                              <div
                                key={subcat}
                                className="relative overflow-hidden"
                                onWheel={(e) => {
                                  if (
                                    isCustom &&
                                    Math.abs(e.deltaX) > Math.abs(e.deltaY)
                                  ) {
                                    // Horizontal scroll (trackpad swipe)
                                    if (e.deltaX > 10) {
                                      // Swiped left
                                      setSwipedCategory(subcat);
                                    } else if (e.deltaX < -10) {
                                      // Swiped right
                                      setSwipedCategory(null);
                                    }
                                  }
                                }}
                              >
                                {/* Delete button (revealed on swipe) */}
                                {isCustom && (
                                  <div className="absolute inset-y-0 right-0 flex items-center justify-center bg-[#D9534F] w-20">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const currentTab =
                                          activeTab as keyof typeof customSubcategories;
                                        setCustomSubcategories((prev) => ({
                                          ...prev,
                                          [currentTab]: prev[currentTab].filter(
                                            (cat) => cat !== subcat
                                          ),
                                        }));
                                        setSwipedCategory(null);
                                        if (selectedCategory === subcat) {
                                          setValue("selectedCategory", "");
                                        }
                                      }}
                                      className="p-2"
                                    >
                                      <Trash2
                                        size={20}
                                        className="text-white"
                                        strokeWidth={2}
                                      />
                                    </button>
                                  </div>
                                )}

                                {/* Category button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isSwiped) {
                                      setSwipedCategory(null);
                                    } else {
                                      setValue("selectedCategory", subcat);
                                      setShowCategoryPopup(false);
                                      setShowCustomCategoryInput(false);
                                      setCustomCategory("");
                                      setSwipedCategory(null);
                                    }
                                  }}
                                  onMouseDown={(e) => {
                                    if (isCustom) {
                                      e.preventDefault();
                                      setTouchStart(e.clientX);
                                    }
                                  }}
                                  onMouseMove={(e) => {
                                    if (
                                      isCustom &&
                                      touchStart !== null &&
                                      e.buttons === 1
                                    ) {
                                      e.preventDefault();
                                      setTouchEnd(e.clientX);
                                    }
                                  }}
                                  onMouseUp={(e) => {
                                    if (
                                      isCustom &&
                                      touchStart !== null &&
                                      touchEnd !== null
                                    ) {
                                      e.preventDefault();
                                      const swipeDistance =
                                        touchStart - touchEnd;
                                      if (swipeDistance > 50) {
                                        // Swiped left
                                        setSwipedCategory(subcat);
                                      } else if (swipeDistance < -50) {
                                        // Swiped right
                                        setSwipedCategory(null);
                                      }
                                      setTouchStart(null);
                                      setTouchEnd(null);
                                    }
                                  }}
                                  onMouseLeave={() => {
                                    if (isCustom) {
                                      setTouchStart(null);
                                      setTouchEnd(null);
                                    }
                                  }}
                                  onTouchStart={(e) => {
                                    if (isCustom) {
                                      setTouchStart(e.touches[0].clientX);
                                    }
                                  }}
                                  onTouchMove={(e) => {
                                    if (isCustom) {
                                      setTouchEnd(e.touches[0].clientX);
                                    }
                                  }}
                                  onTouchEnd={() => {
                                    if (
                                      isCustom &&
                                      touchStart !== null &&
                                      touchEnd !== null
                                    ) {
                                      const swipeDistance =
                                        touchStart - touchEnd;
                                      if (swipeDistance > 50) {
                                        // Swiped left
                                        setSwipedCategory(subcat);
                                      } else if (swipeDistance < -50) {
                                        // Swiped right
                                        setSwipedCategory(null);
                                      }
                                      setTouchStart(null);
                                      setTouchEnd(null);
                                    }
                                  }}
                                  title={
                                    isCustom
                                      ? "Swipe left to delete this custom category"
                                      : undefined
                                  }
                                  style={{
                                    transform: isSwiped
                                      ? "translateX(-80px)"
                                      : "translateX(0)",
                                    transition:
                                      "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                  }}
                                  className={`group relative w-full px-4 py-3 text-left hover:bg-[#FDF6EC] ${
                                    selectedCategory === subcat
                                      ? "bg-[#E6C288]/20 font-semibold"
                                      : "bg-white"
                                  }`}
                                >
                                  <span className="text-sm text-[#4A3B32]">
                                    {subcat}
                                  </span>
                                </button>
                              </div>
                            );
                          })}

                          {/* Add Category Button */}
                          {!showCustomCategoryInput ? (
                            <button
                              type="button"
                              onClick={() => setShowCustomCategoryInput(true)}
                              className="w-full px-4 py-3 text-left hover:bg-[#FDF6EC] transition-colors border-t border-[#E6C288]/50"
                            >
                              <span className="text-sm text-[#4A3B32]/60 font-medium">
                                + Add Category
                              </span>
                            </button>
                          ) : (
                            <div className="px-4 py-3 border-t border-[#E6C288]/50">
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={customCategory}
                                  onChange={(e) =>
                                    setCustomCategory(e.target.value)
                                  }
                                  placeholder="Enter category name"
                                  className="flex-1 px-3 py-2 text-sm text-[#4A3B32] bg-white rounded-lg border border-[#E6C288] focus:border-[#4A3B32] focus:outline-none"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (
                                      e.key === "Enter" &&
                                      customCategory.trim()
                                    ) {
                                      const newCategory = customCategory.trim();
                                      const currentTab =
                                        activeTab as keyof typeof customSubcategories;

                                      // Add to custom subcategories if not already exists
                                      if (
                                        !subcategories[currentTab].includes(
                                          newCategory
                                        )
                                      ) {
                                        setCustomSubcategories((prev) => ({
                                          ...prev,
                                          [currentTab]: [
                                            ...prev[currentTab],
                                            newCategory,
                                          ],
                                        }));
                                      }

                                      setValue("selectedCategory", newCategory);
                                      setShowCategoryPopup(false);
                                      setShowCustomCategoryInput(false);
                                      setCustomCategory("");
                                    }
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (customCategory.trim()) {
                                      const newCategory = customCategory.trim();
                                      const currentTab =
                                        activeTab as keyof typeof customSubcategories;

                                      // Add to custom subcategories if not already exists
                                      if (
                                        !subcategories[currentTab].includes(
                                          newCategory
                                        )
                                      ) {
                                        setCustomSubcategories((prev) => ({
                                          ...prev,
                                          [currentTab]: [
                                            ...prev[currentTab],
                                            newCategory,
                                          ],
                                        }));
                                      }

                                      setValue("selectedCategory", newCategory);
                                      setShowCategoryPopup(false);
                                      setShowCustomCategoryInput(false);
                                      setCustomCategory("");
                                    }
                                  }}
                                  disabled={!customCategory.trim()}
                                  className="px-3 py-2 bg-[#4A3B32] text-white text-sm font-medium rounded-lg hover:bg-[#4A3B32]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  Add
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Description (Optional) */}
            <div className="card-crumbs">
              <label
                htmlFor="description-input"
                className="block text-sm font-semibold text-[#4A3B32] mb-3"
              >
                Description (Optional)
              </label>
              <input
                id="description-input"
                type="text"
                {...register("description")}
                placeholder="e.g., Lunch at cafe"
                maxLength={100}
                className={`w-full px-4 py-3 text-[#4A3B32] bg-[#FDF6EC] rounded-lg border-2 ${
                  errors.description ? "border-[#D9534F]" : "border-[#E6C288]"
                } focus:border-[#4A3B32] focus:outline-none`}
                aria-invalid={!!errors.description}
                aria-describedby={
                  errors.description ? "description-error" : undefined
                }
              />
              {errors.description && (
                <p
                  id="description-error"
                  className="text-xs text-[#D9534F] mt-1"
                  role="alert"
                >
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Recurring Transaction Toggle */}
            <div className="card-crumbs">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <RefreshCw
                    size={20}
                    className="text-[#4A3B32]"
                    strokeWidth={2}
                  />
                  <div>
                    <p className="text-sm font-semibold text-[#4A3B32]">
                      Make this recurring
                    </p>
                    <p className="text-xs text-[#4A3B32]/60">
                      Automatically create this transaction regularly
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  {...register("isRecurring")}
                  className="w-5 h-5 text-[#4A3B32] bg-[#FDF6EC] border-2 border-[#E6C288] rounded focus:ring-[#4A3B32] focus:ring-2"
                />
              </label>

              {/* Recurring Options */}
              {isRecurring && (
                <div className="mt-4 space-y-4 pt-4 border-t border-[#E6C288]/50 animate-fade-in">
                  {/* Frequency Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-[#4A3B32] mb-2">
                      Frequency
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(
                        [
                          "DAILY",
                          "WEEKLY",
                          "MONTHLY",
                          "YEARLY",
                        ] as RecurringFrequency[]
                      ).map((freq) => (
                        <button
                          key={freq}
                          type="button"
                          onClick={() => setValue("frequency", freq)}
                          className={`py-2 px-2 text-xs font-medium rounded-lg transition-all ${
                            frequency === freq
                              ? "bg-[#4A3B32] text-white"
                              : "bg-[#FDF6EC] text-[#4A3B32] border border-[#E6C288] hover:border-[#4A3B32]"
                          }`}
                        >
                          {freq.charAt(0) + freq.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-xs font-semibold text-[#4A3B32] mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      {...register("startDate")}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-3 py-2 text-sm text-[#4A3B32] bg-[#FDF6EC] rounded-lg border-2 border-[#E6C288] focus:border-[#4A3B32] focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Error Messages */}
            {(errors.selectedCategory || errors.isRecurring) && (
              <div
                className="bg-[#D9534F]/10 border border-[#D9534F] text-[#D9534F] px-4 py-3 rounded-lg text-sm space-y-1"
                role="alert"
                aria-live="polite"
              >
                {errors.selectedCategory && (
                  <p id="category-error">{errors.selectedCategory.message}</p>
                )}
                {errors.isRecurring && <p>{errors.isRecurring.message}</p>}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full bg-[#4A3B32] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#4A3B32]/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed btn-touch shadow-lg"
              aria-busy={isSubmitting || loading}
            >
              {isSubmitting || loading
                ? "Adding..."
                : isRecurring
                ? "Create Recurring Transaction"
                : "Add Transaction"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
