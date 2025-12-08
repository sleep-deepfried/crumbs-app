import { formatCurrency } from '@/lib/utils'

interface QuickFinancialBannerProps {
  safeToSpend: number
  totalSaved: number
  spendingLimit: number
}

export default function QuickFinancialBanner({
  safeToSpend,
  totalSaved,
  spendingLimit,
}: QuickFinancialBannerProps) {
  const percentRemaining = spendingLimit > 0 ? (safeToSpend / spendingLimit) * 100 : 100

  return (
    <div className="px-4 py-4 bg-gradient-to-r from-[#A8D5BA]/20 to-[#E6C288]/20 border-b-2 border-[#E6C288]">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {/* Safe to Spend */}
        <div className="flex-1">
          <p className="text-[10px] text-[#4A3B32]/60 uppercase tracking-wide font-semibold mb-1">
            Safe to Spend
          </p>
          <p
            className={`text-2xl font-bold ${
              percentRemaining < 20
                ? 'text-[#D9534F]'
                : percentRemaining < 50
                ? 'text-[#E6C288]'
                : 'text-[#4A3B32]'
            }`}
          >
            {formatCurrency(safeToSpend)}
          </p>
          <div className="mt-1 bg-[#FDF6EC] rounded-full h-1.5 w-32 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentRemaining < 20
                  ? 'bg-[#D9534F]'
                  : percentRemaining < 50
                  ? 'bg-[#E6C288]'
                  : 'bg-[#A8D5BA]'
              }`}
              style={{ width: `${Math.max(0, Math.min(100, percentRemaining))}%` }}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-12 bg-[#4A3B32]/20 mx-4" />

        {/* Total Saved */}
        <div className="flex-1 text-right">
          <p className="text-[10px] text-[#4A3B32]/60 uppercase tracking-wide font-semibold mb-1">
            Total Saved
          </p>
          <p className="text-2xl font-bold text-[#A8D5BA]">
            {formatCurrency(totalSaved)}
          </p>
          <p className="text-[10px] text-[#4A3B32]/50 mt-1">
            {totalSaved < 50000 && '🥉 Glass'}
            {totalSaved >= 50000 && totalSaved < 100000 && '🥈 Mug'}
            {totalSaved >= 100000 && '🥇 Press'}
          </p>
        </div>
      </div>
    </div>
  )
}

