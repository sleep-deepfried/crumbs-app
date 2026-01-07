"use client";

import { useState, useEffect } from "react";
import {
  PiggyBank,
  Plus,
  ArrowRightLeft,
  Building2,
  Wallet,
  CreditCard,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  createAccount,
  deleteAccount,
  transferFunds,
  updateAccount,
} from "@/app/actions/accounts";
import { useRouter } from "next/navigation";
import { Account, AccountType } from "@/types";
import { calculateGoalProgress } from "@/lib/goalHelpers";
import EnhancedAccountCard from "@/components/EnhancedAccountCard";
import AccountDetailsModal from "@/components/AccountDetailsModal";
import GoalCelebration from "@/components/GoalCelebration";
import ColorPicker from "@/components/ColorPicker";

interface WalletViewProps {
  data: {
    user: unknown;
    accounts: Account[];
    monthlyExpenses: number;
    monthlyIncome: number;
    [key: string]: unknown;
  };
}

export default function WalletView({ data }: WalletViewProps) {
  const { accounts } = data;
  const router = useRouter();

  const [selectedType, setSelectedType] = useState<AccountType | "ALL">("ALL");
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [celebratingGoal, setCelebratingGoal] = useState<{
    accountName: string;
    goalAmount: number;
  } | null>(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // Form states - Add Account
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountType, setNewAccountType] = useState<AccountType>("BANK");
  const [newAccountBalance, setNewAccountBalance] = useState("");
  const [newAccountDescription, setNewAccountDescription] = useState("");
  const [newAccountColor, setNewAccountColor] = useState("#4A3B32");
  // Credit card fields
  const [newCreditLimit, setNewCreditLimit] = useState("");
  const [newCreditUsed, setNewCreditUsed] = useState("");
  const [newStatementDate, setNewStatementDate] = useState("");
  const [newPaymentDueDate, setNewPaymentDueDate] = useState("");
  const [newMinimumPayment, setNewMinimumPayment] = useState("");
  const [newInterestRate, setNewInterestRate] = useState("");
  const [newRewardsType, setNewRewardsType] = useState<string>("");
  const [newRewardsBalance, setNewRewardsBalance] = useState("");
  const [newRewardsRate, setNewRewardsRate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check for goal completions
  useEffect(() => {
    if (accounts && accounts.length > 0) {
      accounts.forEach((account: Account) => {
        const progress = calculateGoalProgress(account);
        if (progress && progress.isComplete && account.goalAmount) {
          // Only show celebration if goal was just completed (you might want to track this better)
          setCelebratingGoal({
            accountName: account.name,
            goalAmount: account.goalAmount,
          });
        }
      });
    }
  }, [accounts]);

  // Form states - Transfer
  const [transferFromId, setTransferFromId] = useState("");
  const [transferToId, setTransferToId] = useState("");
  const [transferAmount, setTransferAmount] = useState("");

  // Swipe to close states
  const [swipeStartY, setSwipeStartY] = useState<number | null>(null);
  const [swipeCurrentY, setSwipeCurrentY] = useState<number | null>(null);

  const handleDeleteAccount = async (id: string) => {
    await deleteAccount(id);
    router.refresh();
  };

  const handleAddAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountName || isSubmitting) return;
    if (newAccountType !== "CREDIT_CARD" && !newAccountBalance) return;

    setIsSubmitting(true);
    try {
      await createAccount({
        userId: user.id,
        name: newAccountName,
        type: newAccountType,
        balance:
          newAccountType === "CREDIT_CARD"
            ? 0
            : parseFloat(newAccountBalance || "0"),
        color: newAccountColor,
        category: "GENERAL", // Default category
        description: newAccountDescription,
        creditLimit:
          newAccountType === "CREDIT_CARD" && newCreditLimit
            ? parseFloat(newCreditLimit)
            : undefined,
        creditUsed:
          newAccountType === "CREDIT_CARD" && newCreditUsed
            ? parseFloat(newCreditUsed)
            : undefined,
        statementDate:
          newAccountType === "CREDIT_CARD" && newStatementDate
            ? parseInt(newStatementDate)
            : undefined,
        paymentDueDate:
          newAccountType === "CREDIT_CARD" && newPaymentDueDate
            ? parseInt(newPaymentDueDate)
            : undefined,
        minimumPayment:
          newAccountType === "CREDIT_CARD" && newMinimumPayment
            ? parseFloat(newMinimumPayment)
            : undefined,
        interestRate:
          newAccountType === "CREDIT_CARD" && newInterestRate
            ? parseFloat(newInterestRate)
            : undefined,
        rewardsType:
          newAccountType === "CREDIT_CARD" && newRewardsType
            ? newRewardsType
            : undefined,
        rewardsBalance:
          newAccountType === "CREDIT_CARD" && newRewardsBalance
            ? parseFloat(newRewardsBalance)
            : undefined,
        rewardsRate:
          newAccountType === "CREDIT_CARD" && newRewardsRate
            ? parseFloat(newRewardsRate)
            : undefined,
      });

      // Reset form
      setNewAccountName("");
      setNewAccountBalance("");
      setNewAccountType("BANK");
      setNewAccountDescription("");
      setNewAccountColor("#4A3B32");
      setNewCreditLimit("");
      setNewCreditUsed("");
      setNewStatementDate("");
      setNewPaymentDueDate("");
      setNewMinimumPayment("");
      setNewInterestRate("");
      setNewRewardsType("");
      setNewRewardsBalance("");
      setNewRewardsRate("");
      setShowAddModal(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to create account:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAccount = async (updates: Record<string, unknown>) => {
    if (!editingAccount) return;
    await updateAccount(editingAccount.id, updates);
    router.refresh();
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferFromId || !transferToId || !transferAmount) return;

    try {
      await transferFunds(
        transferFromId,
        transferToId,
        parseFloat(transferAmount)
      );
      setTransferFromId("");
      setTransferToId("");
      setTransferAmount("");
      setShowTransferModal(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to transfer funds:", error);
    }
  };

  // Swipe handlers for modal
  const handleModalTouchStart = (e: React.TouchEvent) => {
    setSwipeStartY(e.touches[0].clientY);
    setSwipeCurrentY(e.touches[0].clientY);
  };

  const handleModalTouchMove = (e: React.TouchEvent) => {
    if (swipeStartY === null) return;
    setSwipeCurrentY(e.touches[0].clientY);
  };

  const handleModalTouchEnd = () => {
    if (swipeStartY === null || swipeCurrentY === null) return;

    const swipeDistance = swipeCurrentY - swipeStartY;

    // If swiped down more than 100px, close modal
    if (swipeDistance > 100) {
      setShowAddModal(false);
      setShowTransferModal(false);
    }

    setSwipeStartY(null);
    setSwipeCurrentY(null);
  };

  // Filter accounts by type
  const filteredAccounts =
    selectedType === "ALL"
      ? accounts || []
      : (accounts || []).filter((acc: Account) => acc.type === selectedType);

  return (
    <div className="min-h-screen bg-[#FDF6EC] pb-24">
      {/* Header Bar */}
      <div className="bg-[#4A3B32] text-white px-4 py-4">
        <h1 className="text-2xl font-bold">Wallet</h1>
        <p className="text-xs opacity-80 mt-1">@{user.username}</p>
      </div>

      {/* Main Content */}
      <main id="main-content" className="max-w-md mx-auto px-4 pt-6 space-y-6">
        {/* Total Stashed Card */}
        <div className="card-crumbs bg-gradient-to-br from-[#4A3B32] to-[#6b5648] text-white border-none">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <PiggyBank size={24} strokeWidth={2} />
              <h2 className="text-lg font-bold">Total Stashed</h2>
            </div>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label={showBalance ? "Hide balance" : "Show balance"}
            >
              {showBalance ? (
                <Eye size={20} strokeWidth={2} />
              ) : (
                <EyeOff size={20} strokeWidth={2} />
              )}
            </button>
          </div>
          <p className="text-3xl font-bold mb-1">
            {showBalance
              ? `₱${(accounts || [])
                  .filter((a: Account) => a.type !== "CREDIT_CARD")
                  .reduce((sum: number, acc: Account) => sum + acc.balance, 0)
                  .toLocaleString("en-PH", { minimumFractionDigits: 2 })}`
              : "₱••••••"}
          </p>
          <p className="text-xs opacity-80">
            Accumulated savings across all accounts
          </p>
        </div>

        {/* Unified Accounts Card */}
        <div className="card-crumbs">
          {/* Header with Actions */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-heading">Accounts</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowTransferModal(true)}
                disabled={accounts.length <= 1}
                className="text-xs bg-[#4A3B32]/10 text-[#4A3B32] px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-[#4A3B32]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#4A3B32]/10"
                aria-label="Transfer funds"
              >
                <ArrowRightLeft size={14} />
                Transfer
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="text-xs bg-[#4A3B32] text-white px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-[#4A3B32]/90 transition-colors"
                aria-label="Add new account"
              >
                <Plus size={14} />
                Add
              </button>
            </div>
          </div>

          {/* Filter Button */}
          <div className="mb-6 relative">
            <button
              onClick={() => setShowFilterPopup(!showFilterPopup)}
              className="w-full px-4 py-3 rounded-xl border-2 border-[#E6C288] bg-white text-[#4A3B32] font-semibold flex items-center justify-between hover:border-[#4A3B32] transition-colors"
            >
              <span className="flex items-center gap-2">
                {selectedType === "ALL" && <span>All Accounts</span>}
                {selectedType === "BANK" && (
                  <>
                    <Building2 size={18} strokeWidth={2} />
                    <span>Bank</span>
                  </>
                )}
                {selectedType === "E-WALLET" && (
                  <>
                    <Wallet size={18} strokeWidth={2} />
                    <span>E-Wallet</span>
                  </>
                )}
                {selectedType === "CREDIT_CARD" && (
                  <>
                    <CreditCard size={18} strokeWidth={2} />
                    <span>Credit Card</span>
                  </>
                )}
              </span>
              <svg
                className={`w-5 h-5 transition-transform ${
                  showFilterPopup ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Filter Popup */}
            {showFilterPopup && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-fade-in"
                  onClick={() => setShowFilterPopup(false)}
                />

                {/* Popup Card */}
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border-2 border-[#E6C288] overflow-hidden z-50 animate-scale-in">
                  <button
                    onClick={() => {
                      setSelectedType("ALL");
                      setShowFilterPopup(false);
                    }}
                    className={`w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-[#FDF6EC] transition-colors ${
                      selectedType === "ALL"
                        ? "bg-[#E6C288]/20 font-semibold"
                        : ""
                    }`}
                  >
                    <span className="text-sm text-[#4A3B32]">All Accounts</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedType("BANK");
                      setShowFilterPopup(false);
                    }}
                    className={`w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-[#FDF6EC] transition-colors ${
                      selectedType === "BANK"
                        ? "bg-[#E6C288]/20 font-semibold"
                        : ""
                    }`}
                  >
                    <Building2
                      size={18}
                      strokeWidth={2}
                      className="text-[#4A3B32]"
                    />
                    <span className="text-sm text-[#4A3B32]">Bank</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedType("E-WALLET");
                      setShowFilterPopup(false);
                    }}
                    className={`w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-[#FDF6EC] transition-colors ${
                      selectedType === "E-WALLET"
                        ? "bg-[#E6C288]/20 font-semibold"
                        : ""
                    }`}
                  >
                    <Wallet
                      size={18}
                      strokeWidth={2}
                      className="text-[#4A3B32]"
                    />
                    <span className="text-sm text-[#4A3B32]">E-Wallet</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedType("CREDIT_CARD");
                      setShowFilterPopup(false);
                    }}
                    className={`w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-[#FDF6EC] transition-colors ${
                      selectedType === "CREDIT_CARD"
                        ? "bg-[#E6C288]/20 font-semibold"
                        : ""
                    }`}
                  >
                    <CreditCard
                      size={18}
                      strokeWidth={2}
                      className="text-[#4A3B32]"
                    />
                    <span className="text-sm text-[#4A3B32]">Credit Card</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Accounts Display */}
          {filteredAccounts.length > 0 ? (
            <div className="space-y-3">
              {filteredAccounts.map((account: Account) => (
                <EnhancedAccountCard
                  key={account.id}
                  account={account}
                  onEdit={setEditingAccount}
                  onDelete={handleDeleteAccount}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-[#4A3B32]/60 mb-2">
                {selectedType === "ALL"
                  ? "No accounts yet"
                  : `No ${selectedType
                      .toLowerCase()
                      .replace("_", " ")} accounts yet`}
              </p>
              <p className="text-xs text-[#4A3B32]/40">
                {selectedType === "ALL"
                  ? "Tap 'Add' above to create your first account"
                  : "Create an account with this type"}
              </p>
            </div>
          )}
        </div>

        {/* Bottom spacing */}
        <div className="h-8" />
      </main>

      {/* Add Account Modal */}
      {showAddModal && (
        <div
          style={{ zIndex: 100 }}
          className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-[#FDF6EC] w-full max-w-sm rounded-3xl shadow-2xl animate-scale-in max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleModalTouchStart}
            onTouchMove={handleModalTouchMove}
            onTouchEnd={handleModalTouchEnd}
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4 shrink-0">
              <h3 className="text-xl font-bold text-[#4A3B32]">
                Add New Account
              </h3>
            </div>

            <form
              onSubmit={handleAddAccountSubmit}
              className="flex flex-col flex-1 min-h-0"
            >
              <div className="flex-1 overflow-y-auto scrollbar-hide px-6 space-y-3">
                <div>
                  <label className="text-xs font-bold text-[#4A3B32]/70 ml-1 mb-1 block">
                    Account Name
                  </label>
                  <input
                    type="text"
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                    placeholder="e.g. BPI Savings"
                    className="w-full bg-white rounded-xl px-4 py-3 text-[#4A3B32] border border-[#E6C288]/30 focus:border-[#E6C288] focus:ring-1 focus:ring-[#E6C288] outline-none transition-all placeholder:text-[#4A3B32]/30"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#4A3B32]/70 ml-1 mb-1 block">
                    Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewAccountType("BANK")}
                      className={`px-4 py-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                        newAccountType === "BANK"
                          ? "bg-[#4A3B32] text-white border-[#4A3B32]"
                          : "bg-white text-[#4A3B32] border-[#E6C288]/30 hover:border-[#E6C288]"
                      }`}
                    >
                      <Building2 size={18} />
                      <span className="font-semibold text-sm">Bank</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewAccountType("E-WALLET")}
                      className={`px-4 py-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                        newAccountType === "E-WALLET"
                          ? "bg-[#4A3B32] text-white border-[#4A3B32]"
                          : "bg-white text-[#4A3B32] border-[#E6C288]/30 hover:border-[#E6C288]"
                      }`}
                    >
                      <Wallet size={18} />
                      <span className="font-semibold text-sm">E-Wallet</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewAccountType("CREDIT_CARD")}
                      className={`px-4 py-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                        newAccountType === "CREDIT_CARD"
                          ? "bg-[#4A3B32] text-white border-[#4A3B32]"
                          : "bg-white text-[#4A3B32] border-[#E6C288]/30 hover:border-[#E6C288]"
                      }`}
                    >
                      <CreditCard size={18} />
                      <span className="font-semibold text-sm">Credit</span>
                    </button>
                  </div>
                </div>

                {newAccountType === "CREDIT_CARD" ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-bold text-[#4A3B32]/70 ml-1 mb-1 block">
                          Credit Limit
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A3B32]/50 font-bold text-sm">
                            ₱
                          </span>
                          <input
                            type="number"
                            value={newCreditLimit}
                            onChange={(e) => setNewCreditLimit(e.target.value)}
                            placeholder="50000"
                            className="w-full bg-white rounded-xl pl-8 pr-3 py-2.5 text-sm text-[#4A3B32] border border-[#E6C288]/30 focus:border-[#E6C288] focus:ring-1 focus:ring-[#E6C288] outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-[#4A3B32]/70 ml-1 mb-1 block">
                          Current Balance
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A3B32]/50 font-bold text-sm">
                            ₱
                          </span>
                          <input
                            type="number"
                            value={newCreditUsed}
                            onChange={(e) => setNewCreditUsed(e.target.value)}
                            placeholder="0"
                            className="w-full bg-white rounded-xl pl-8 pr-3 py-2.5 text-sm text-[#4A3B32] border border-[#E6C288]/30 focus:border-[#E6C288] focus:ring-1 focus:ring-[#E6C288] outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-bold text-[#4A3B32]/70 ml-1 mb-1 block">
                          Payment Due (Day)
                        </label>
                        <input
                          type="number"
                          value={newPaymentDueDate}
                          onChange={(e) => setNewPaymentDueDate(e.target.value)}
                          placeholder="1-31"
                          min="1"
                          max="31"
                          className="w-full bg-white rounded-xl px-3 py-2.5 text-sm text-[#4A3B32] border border-[#E6C288]/30 focus:border-[#E6C288] focus:ring-1 focus:ring-[#E6C288] outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-[#4A3B32]/70 ml-1 mb-1 block">
                          Minimum Payment
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A3B32]/50 font-bold text-sm">
                            ₱
                          </span>
                          <input
                            type="number"
                            value={newMinimumPayment}
                            onChange={(e) =>
                              setNewMinimumPayment(e.target.value)
                            }
                            placeholder="0"
                            className="w-full bg-white rounded-xl pl-8 pr-3 py-2.5 text-sm text-[#4A3B32] border border-[#E6C288]/30 focus:border-[#E6C288] focus:ring-1 focus:ring-[#E6C288] outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-bold text-[#4A3B32]/70 ml-1 mb-1 block">
                      Current Balance
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A3B32]/50 font-bold">
                        ₱
                      </span>
                      <input
                        type="number"
                        value={newAccountBalance}
                        onChange={(e) => setNewAccountBalance(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-white rounded-xl pl-8 pr-4 py-3 text-[#4A3B32] border border-[#E6C288]/30 focus:border-[#E6C288] focus:ring-1 focus:ring-[#E6C288] outline-none transition-all placeholder:text-[#4A3B32]/30"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-[#4A3B32]/70 ml-1 mb-1 block">
                    Choose Color
                  </label>
                  <ColorPicker
                    selectedColor={newAccountColor}
                    onSelectColor={setNewAccountColor}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#4A3B32]/70 ml-1 mb-1 block">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newAccountDescription}
                    onChange={(e) => setNewAccountDescription(e.target.value)}
                    placeholder="Add notes about this account..."
                    rows={3}
                    maxLength={200}
                    className="w-full bg-white rounded-xl px-4 py-3 text-[#4A3B32] border border-[#E6C288]/30 focus:border-[#E6C288] focus:ring-1 focus:ring-[#E6C288] outline-none transition-all placeholder:text-[#4A3B32]/30 resize-y"
                  />
                  <p className="text-right text-xs text-[#4A3B32]/50 mt-1">
                    {newAccountDescription.length}/200
                  </p>
                </div>
              </div>

              {/* Sticky Button Footer */}
              <div className="px-6 pt-4 pb-6 border-t border-[#E6C288]/30 bg-[#FDF6EC] shrink-0 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-full text-[#4A3B32] font-semibold hover:bg-[#4A3B32]/5 transition-colors"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  disabled={
                    !newAccountName ||
                    (newAccountType !== "CREDIT_CARD" && !newAccountBalance) ||
                    (newAccountType === "CREDIT_CARD" && !newCreditLimit) ||
                    isSubmitting
                  }
                  className="flex-1 bg-[#4A3B32] hover:bg-[#4A3B32]/90 text-white rounded-full py-6 font-bold text-base shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div
          style={{ zIndex: 100 }}
          className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowTransferModal(false)}
        >
          <div
            className="bg-[#FDF6EC] w-full max-w-sm rounded-3xl shadow-2xl animate-scale-in max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleModalTouchStart}
            onTouchMove={handleModalTouchMove}
            onTouchEnd={handleModalTouchEnd}
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4 shrink-0">
              <h3 className="text-xl font-bold text-[#4A3B32]">
                Transfer Funds
              </h3>
            </div>

            <form
              onSubmit={handleTransferSubmit}
              className="flex flex-col flex-1 min-h-0"
            >
              <div className="flex-1 overflow-y-auto scrollbar-hide px-6 space-y-3">
                <div>
                  <label className="text-xs font-bold text-[#4A3B32]/70 ml-1 mb-1 block">
                    From Account
                  </label>
                  <select
                    value={transferFromId}
                    onChange={(e) => setTransferFromId(e.target.value)}
                    className="w-full bg-white rounded-xl px-4 py-3 text-[#4A3B32] border border-[#E6C288]/30 focus:border-[#E6C288] focus:ring-1 focus:ring-[#E6C288] outline-none transition-all"
                  >
                    <option value="">Select source account</option>
                    {accounts.map((account: Account) => (
                      <option key={account.id} value={account.id}>
                        {account.name} (₱{account.balance.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#4A3B32]/70 ml-1 mb-1 block">
                    To Account
                  </label>
                  <select
                    value={transferToId}
                    onChange={(e) => setTransferToId(e.target.value)}
                    className="w-full bg-white rounded-xl px-4 py-3 text-[#4A3B32] border border-[#E6C288]/30 focus:border-[#E6C288] focus:ring-1 focus:ring-[#E6C288] outline-none transition-all"
                  >
                    <option value="">Select destination account</option>
                    {accounts
                      .filter(
                        (account: Account) => account.id !== transferFromId
                      )
                      .map((account: Account) => (
                        <option key={account.id} value={account.id}>
                          {account.name} (₱{account.balance.toLocaleString()})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#4A3B32]/70 ml-1 mb-1 block">
                    Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A3B32]/50 font-bold">
                      ₱
                    </span>
                    <input
                      type="number"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white rounded-xl pl-8 pr-4 py-3 text-[#4A3B32] border border-[#E6C288]/30 focus:border-[#E6C288] focus:ring-1 focus:ring-[#E6C288] outline-none transition-all placeholder:text-[#4A3B32]/30"
                    />
                  </div>
                </div>
              </div>

              {/* Sticky Button Footer */}
              <div className="px-6 pt-4 pb-6 border-t border-[#E6C288]/30 bg-[#FDF6EC] shrink-0 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="flex-1 py-3 rounded-full text-[#4A3B32] font-semibold hover:bg-[#4A3B32]/5 transition-colors"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  disabled={!transferFromId || !transferToId || !transferAmount}
                  className="flex-1 bg-[#4A3B32] hover:bg-[#4A3B32]/90 text-white rounded-full py-6 font-bold text-base shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Transfer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Account Details Modal */}
      {editingAccount && (
        <AccountDetailsModal
          account={editingAccount}
          onClose={() => setEditingAccount(null)}
          onUpdate={handleUpdateAccount}
          onDelete={async () => {
            await handleDeleteAccount(editingAccount.id);
            setEditingAccount(null);
          }}
        />
      )}

      {/* Goal Celebration Modal */}
      {celebratingGoal && (
        <GoalCelebration
          isOpen={!!celebratingGoal}
          accountName={celebratingGoal.accountName}
          goalAmount={celebratingGoal.goalAmount}
          onClose={() => setCelebratingGoal(null)}
        />
      )}
    </div>
  );
}
