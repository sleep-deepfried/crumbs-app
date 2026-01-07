"use client";

import {
  Plus,
  Wallet,
  Building2,
  PiggyBank,
  X,
  ChevronRight,
  Trash2,
  ArrowRightLeft,
  Edit,
} from "lucide-react";
import { useState, useRef, TouchEvent } from "react";
import { Button } from "@/components/ui/button";
import { AccountCategory, Account } from "@/types";
import ColorPicker from "./ColorPicker";
import CategorySelector from "./CategorySelector";
import AccountDetailsModal from "./AccountDetailsModal";

interface AccountsListProps {
  accounts: Account[];
  onDelete: (id: string) => Promise<void>;
  onAdd: (
    name: string,
    type: "BANK" | "E-WALLET",
    balance: number,
    color?: string,
    category?: AccountCategory,
    description?: string
  ) => Promise<void>;
  onTransfer: (fromId: string, toId: string, amount: number) => Promise<void>;
  onUpdate: (id: string, updates: Record<string, unknown>) => Promise<void>;
}

export default function AccountsList({
  accounts,
  onDelete,
  onAdd,
  onTransfer,
  onUpdate,
}: AccountsListProps) {
  const [showAllModal, setShowAllModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  // Form State
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountType, setNewAccountType] = useState<"BANK" | "E-WALLET">(
    "BANK"
  );
  const [newAccountBalance, setNewAccountBalance] = useState("");
  const [newAccountCategory, setNewAccountCategory] =
    useState<AccountCategory>("GENERAL");
  const [newAccountDescription, setNewAccountDescription] = useState("");
  const [newAccountColor, setNewAccountColor] = useState("#4A3B32");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Transfer State
  const [transferFromId, setTransferFromId] = useState("");
  const [transferToId, setTransferToId] = useState("");
  const [transferAmount, setTransferAmount] = useState("");

  // Swipe State
  const [swipedAccountId, setSwipedAccountId] = useState<string | null>(null);
  const touchStartX = useRef<number | null>(null);

  const totalStashed = accounts.reduce(
    (sum, account) => sum + account.balance,
    0
  );

  // Sort accounts by balance (descending)
  const sortedAccounts = [...accounts].sort((a, b) => b.balance - a.balance);
  const topAccounts = sortedAccounts.slice(0, 3);

  // Helper to get icon for account type
  const getIconForAccount = (type: string) => {
    return type === "BANK" ? Building2 : Wallet;
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newAccountName || !newAccountBalance || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAdd(
        newAccountName,
        newAccountType,
        parseFloat(newAccountBalance),
        newAccountColor,
        newAccountCategory,
        newAccountDescription || undefined
      );

      // Reset and close
      setNewAccountName("");
      setNewAccountBalance("");
      setNewAccountType("BANK");
      setNewAccountCategory("GENERAL");
      setNewAccountDescription("");
      setNewAccountColor("#4A3B32");
      setShowAddModal(false);
    } catch (error) {
      console.error("Failed to create account:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    try {
      await onDelete(id);
      setSwipedAccountId(null);
    } catch (error) {
      console.error("Failed to delete account:", error);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!transferFromId || !transferToId || !transferAmount || isSubmitting)
      return;
    if (transferFromId === transferToId) {
      alert("Cannot transfer to the same account");
      return;
    }

    const amount = parseFloat(transferAmount);
    const fromAccount = accounts.find((a) => a.id === transferFromId);

    if (fromAccount && amount > fromAccount.balance) {
      alert("Insufficient balance");
      return;
    }

    setIsSubmitting(true);
    try {
      await onTransfer(transferFromId, transferToId, amount);

      // Reset and close
      setTransferFromId("");
      setTransferToId("");
      setTransferAmount("");
      setShowTransferModal(false);
    } catch (error) {
      console.error("Failed to transfer:", error);
      alert("Transfer failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Swipe Handlers
  const onTouchStart = (e: TouchEvent, id: string) => {
    touchStartX.current = e.targetTouches[0].clientX;
    if (swipedAccountId && swipedAccountId !== id) {
      setSwipedAccountId(null); // Close others
    }
  };

  const onTouchMove = (e: TouchEvent, id: string) => {
    if (touchStartX.current === null) return;
    const currentX = e.targetTouches[0].clientX;
    const diff = currentX - touchStartX.current;

    // Only allow swiping left (negative diff)
    if (diff < 0) {
      // Cap the swipe at -148px visually during drag
      const translateX = Math.max(diff, -148);
      const element =
        document.getElementById(`account-card-${id}`) ||
        document.getElementById(`account-modal-card-${id}`);
      if (element) {
        element.style.transform = `translateX(${translateX}px)`;
      }
    } else if (swipedAccountId === id && diff > 0) {
      // Swiping right to close
      const translateX = Math.min(-138 + diff, 0);
      const element =
        document.getElementById(`account-card-${id}`) ||
        document.getElementById(`account-modal-card-${id}`);
      if (element) {
        element.style.transform = `translateX(${translateX}px)`;
      }
    }
  };

  const onTouchEnd = (e: TouchEvent, id: string) => {
    if (touchStartX.current === null) return;
    const currentX = e.changedTouches[0].clientX;
    const diff = currentX - touchStartX.current;

    const element =
      document.getElementById(`account-card-${id}`) ||
      document.getElementById(`account-modal-card-${id}`);

    if (diff < -40) {
      // Threshold to open
      setSwipedAccountId(id);
      if (element) element.style.transform = `translateX(-138px)`; // Snap open
    } else {
      setSwipedAccountId(null); // Snap close
      if (element) element.style.transform = `translateX(0px)`;
    }

    // Reset refs can be done, but state controls the final position mostly if we used pure state.
    // Here we relied on manual DOM manipulation for perf, but we need to sync state.
    // The useEffect below ensures state wins if component re-renders.
    touchStartX.current = null;
  };

  return (
    <>
      {/* Total Assets / Savings Goal */}
      <div className="card-crumbs mb-6 bg-gradient-to-br from-[#4A3B32] to-[#6b5648] text-white border-none">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <PiggyBank size={20} className="text-[#E6C288]" strokeWidth={2} />
            <h2 className="text-lg font-bold text-white">Total Stashed</h2>
          </div>
          <span className="text-xs bg-white/10 px-2 py-1 rounded-full text-[#E6C288] border border-[#E6C288]/30">
            Lifetime
          </span>
        </div>
        <div className="mt-2">
          <p className="text-3xl font-bold text-[#E6C288]">
            ₱
            {totalStashed.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-white/60 mt-2">
            Accumulated savings across all accounts
          </p>
        </div>
      </div>

      <div className="card-crumbs mb-6">
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

        <div className="space-y-3 overflow-hidden">
          {topAccounts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-[#4A3B32]/60 mb-2">No accounts yet</p>
              <p className="text-xs text-[#4A3B32]/40">
                Tap &quot;Add&quot; to create your first account
              </p>
            </div>
          ) : (
            topAccounts.map((account) => {
              const Icon = getIconForAccount(account.type);
              const isSwiped = swipedAccountId === account.id;

              return (
                <div key={account.id} className="relative overflow-hidden">
                  {/* Action Buttons Layer */}
                  <div className="absolute inset-y-0 right-0 w-[138px] flex items-center justify-end gap-2 pr-2 pl-2">
                    <button
                      onClick={() => setEditingAccount(account)}
                      className="w-[60px] h-[calc(100%-8px)] bg-[#4A6FA5] rounded-xl flex items-center justify-center text-white shadow-sm active:scale-95 transition-all"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteAccount(account.id)}
                      className="w-[60px] h-[calc(100%-8px)] bg-red-500 rounded-xl flex items-center justify-center text-white shadow-sm active:scale-95 transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  {/* Main Card */}
                  <div
                    id={`account-card-${account.id}`}
                    className="relative z-10 flex items-center justify-between p-3 bg-[#FDF6EC] rounded-xl border border-[#E6C288]/30 hover:border-[#E6C288] transition-transform duration-200 ease-out"
                    style={{
                      transform: isSwiped
                        ? "translateX(-138px)"
                        : "translateX(0px)",
                    }}
                    onTouchStart={(e) => onTouchStart(e, account.id)}
                    onTouchMove={(e) => onTouchMove(e, account.id)}
                    onTouchEnd={(e) => onTouchEnd(e, account.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm ${account.color}`}
                      >
                        <Icon size={20} strokeWidth={2} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#4A3B32]">
                          {account.name}
                        </p>
                        <p className="text-[10px] text-[#4A3B32]/60 font-medium">
                          {account.type}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-[#4A3B32]">
                      ₱
                      {account.balance.toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {accounts.length > 3 && (
          <button
            onClick={() => setShowAllModal(true)}
            className="w-full text-xs text-[#4A3B32]/60 hover:text-[#4A3B32] mt-4 flex items-center justify-center gap-1 py-2"
          >
            View All ({accounts.length}) <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* All Accounts Modal */}
      {showAllModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-[2px] p-0 sm:p-4">
          <div className="bg-[#FDF6EC] w-full max-w-md h-[80vh] sm:h-auto sm:max-h-[80vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col animate-slide-in-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#4A3B32]/10">
              <h3 className="text-xl font-bold text-[#4A3B32]">All Accounts</h3>
              <button
                onClick={() => setShowAllModal(false)}
                className="p-2 hover:bg-[#4A3B32]/10 rounded-full transition-colors"
              >
                <X size={20} className="text-[#4A3B32]" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {sortedAccounts.map((account) => {
                const Icon = getIconForAccount(account.type);
                const isSwiped = swipedAccountId === account.id;

                return (
                  <div key={account.id} className="relative overflow-hidden">
                    {/* Action Buttons Layer */}
                    <div className="absolute inset-y-0 right-0 w-[138px] flex items-center justify-end gap-2 pr-2 pl-2">
                      <button
                        onClick={() => setEditingAccount(account)}
                        className="w-[60px] h-[calc(100%-8px)] bg-[#4A6FA5] rounded-xl flex items-center justify-center text-white shadow-sm active:scale-95 transition-all"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => handleDeleteAccount(account.id)}
                        className="w-[60px] h-[calc(100%-8px)] bg-red-500 rounded-xl flex items-center justify-center text-white shadow-sm active:scale-95 transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    {/* Main Card */}
                    <div
                      id={`account-modal-card-${account.id}`}
                      className="relative z-10 flex items-center justify-between p-4 bg-white rounded-xl border border-[#E6C288]/30 shadow-sm transition-transform duration-200 ease-out"
                      style={{
                        transform: isSwiped
                          ? "translateX(-138px)"
                          : "translateX(0px)",
                      }}
                      onTouchStart={(e) => onTouchStart(e, account.id)}
                      onTouchMove={(e) => onTouchMove(e, account.id)}
                      onTouchEnd={(e) => onTouchEnd(e, account.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm ${account.color}`}
                        >
                          <Icon size={24} strokeWidth={2} />
                        </div>
                        <div>
                          <p className="font-bold text-[#4A3B32]">
                            {account.name}
                          </p>
                          <p className="text-xs text-[#4A3B32]/60 font-medium">
                            {account.type}
                          </p>
                        </div>
                      </div>
                      <p className="text-base font-bold text-[#4A3B32]">
                        ₱
                        {account.balance.toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-[#FDF6EC] w-full max-w-md h-[85vh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col animate-slide-in-up">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#4A3B32]/10 flex-shrink-0">
              <h3 className="text-xl font-bold text-[#4A3B32]">
                Add New Account
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-[#4A3B32]/10 rounded-full transition-colors"
              >
                <X size={20} className="text-[#4A3B32]" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleAddAccount} className="space-y-6">
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
                  <div className="grid grid-cols-2 gap-2">
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
                  </div>
                </div>

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

                {/* Category Selector */}
                <CategorySelector
                  selectedCategory={newAccountCategory}
                  onSelectCategory={setNewAccountCategory}
                />

                {/* Color Picker */}
                <ColorPicker
                  selectedColor={newAccountColor}
                  onSelectColor={setNewAccountColor}
                />

                {/* Description */}
                <div>
                  <label className="text-xs font-bold text-[#4A3B32]/70 ml-1 mb-1 block">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newAccountDescription}
                    onChange={(e) => setNewAccountDescription(e.target.value)}
                    placeholder="Add notes about this account..."
                    maxLength={200}
                    rows={3}
                    className="w-full bg-white rounded-xl px-4 py-3 text-[#4A3B32] border border-[#E6C288]/30 focus:border-[#E6C288] focus:ring-1 focus:ring-[#E6C288] outline-none transition-all placeholder:text-[#4A3B32]/30 resize-none"
                  />
                  <p className="text-xs text-[#4A3B32]/40 mt-1 text-right">
                    {newAccountDescription.length}/200
                  </p>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-[#4A3B32]/10 flex gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 rounded-full text-[#4A3B32] font-semibold hover:bg-[#4A3B32]/5 transition-colors"
              >
                Cancel
              </button>
              <Button
                type="button"
                onClick={handleAddAccount}
                disabled={!newAccountName || !newAccountBalance}
                className="flex-1 bg-[#4A3B32] hover:bg-[#4A3B32]/90 text-white rounded-full py-6 font-bold text-base shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Account
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[#FDF6EC] w-full max-w-sm rounded-3xl shadow-2xl p-6 animate-scale-in">
            <h3 className="text-xl font-bold text-[#4A3B32] mb-6">
              Transfer Funds
            </h3>

            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#4A3B32]/70 ml-1 mb-1 block">
                  From Account
                </label>
                <select
                  value={transferFromId}
                  onChange={(e) => setTransferFromId(e.target.value)}
                  className="w-full bg-white rounded-xl px-4 py-3 text-[#4A3B32] border border-[#E6C288]/30 focus:border-[#E6C288] focus:ring-1 focus:ring-[#E6C288] outline-none transition-all appearance-none"
                >
                  <option value="">Select account</option>
                  {accounts
                    .filter((acc) => acc.id !== transferToId)
                    .map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} (₱{acc.balance.toLocaleString()})
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
                  className="w-full bg-white rounded-xl px-4 py-3 text-[#4A3B32] border border-[#E6C288]/30 focus:border-[#E6C288] focus:ring-1 focus:ring-[#E6C288] outline-none transition-all appearance-none"
                >
                  <option value="">Select account</option>
                  {accounts
                    .filter((acc) => acc.id !== transferFromId)
                    .map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} (₱{acc.balance.toLocaleString()})
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

              <div className="pt-4 flex gap-3">
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
          onUpdate={async (updates) => {
            await onUpdate(editingAccount.id, updates);
            setEditingAccount(null);
          }}
          onDelete={async () => {
            await handleDeleteAccount(editingAccount.id);
            setEditingAccount(null);
          }}
        />
      )}
    </>
  );
}
