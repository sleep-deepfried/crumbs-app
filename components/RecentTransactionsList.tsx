import { Home, ShoppingCart, TrendingUp, PhilippinePeso } from "lucide-react";
import { TransactionCategory, TransactionType } from "@/types";
import { Card, CardContent } from "@/components/ui/card";

interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  subcategory?: string | null;
  description?: string | null;
  date: Date | string;
  mainCategory?: string | null;
}

interface RecentTransactionsListProps {
  transactions: Transaction[];
}

export default function RecentTransactionsList({
  transactions,
}: RecentTransactionsListProps) {
  if (transactions.length === 0) {
    return (
      <Card className="bg-[#FDF6EC] border-none shadow-none">
        <CardContent className="flex flex-col items-center justify-center py-6 text-center bg-white rounded-2xl border-2 border-[#E6C288] shadow-md">
          <p className="text-sm text-[#4A3B32]/60">No recent transactions</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2" role="list" aria-label="Recent transactions">
      {transactions.map((transaction) => {
        const getCategoryIcon = () => {
          const categoryToCheck =
            transaction.type === "EXPENSE"
              ? transaction.mainCategory || transaction.category
              : transaction.category;

          switch (categoryToCheck) {
            case "NEEDS":
              return (
                <Home size={18} className="text-[#4A3B32]" strokeWidth={2} />
              );
            case "WANTS":
              return (
                <ShoppingCart
                  size={18}
                  className="text-[#4A3B32]"
                  strokeWidth={2}
                />
              );
            case "SAVINGS":
              return (
                <TrendingUp
                  size={18}
                  className="text-[#A8D5BA]"
                  strokeWidth={2}
                />
              );
            case "INCOME":
              return (
                <PhilippinePeso
                  size={18}
                  className="text-[#A8D5BA]"
                  strokeWidth={2}
                />
              );
            default:
              if (transaction.type === "INCOME")
                return (
                  <PhilippinePeso
                    size={18}
                    className="text-[#A8D5BA]"
                    strokeWidth={2}
                  />
                );
              return (
                <ShoppingCart
                  size={18}
                  className="text-[#4A3B32]"
                  strokeWidth={2}
                />
              );
          }
        };

        return (
          <Card
            key={transaction.id}
            className="border-[#E6C288]/30 hover:border-[#E6C288] transition-colors shadow-sm"
          >
            <CardContent className="px-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                    transaction.type === "INCOME"
                      ? "bg-[#A8D5BA]/20"
                      : "bg-[#E6C288]/20"
                  }`}
                  aria-hidden="true"
                >
                  {getCategoryIcon()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#4A3B32] truncate">
                    {transaction.type === "EXPENSE" && transaction.subcategory
                      ? transaction.subcategory
                      : transaction.category.charAt(0) +
                        transaction.category.slice(1).toLowerCase()}
                  </p>
                  {transaction.description && (
                    <p className="text-xs text-[#4A3B32]/60 truncate">
                      {transaction.description}
                    </p>
                  )}
                  <p className="text-[10px] text-[#4A3B32]/50">
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p
                className={`text-base font-bold flex-shrink-0 ${
                  transaction.type === "INCOME"
                    ? "text-[#A8D5BA]"
                    : "text-[#4A3B32]"
                }`}
              >
                {transaction.type === "INCOME" ? "+" : "-"}₱
                {transaction.amount.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
