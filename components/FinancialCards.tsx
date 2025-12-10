import { formatCurrency } from '@/lib/utils'
import { calculateSavingsProgress } from '@/lib/gamification'

interface FinancialCardsProps {
  safeToSpend: number
  totalSaved: number
  spendingLimit: number
}

export default function FinancialCards({
  safeToSpend,
  totalSaved,
  spendingLimit,
}: FinancialCardsProps) {
  const savingsGoal = 150000
  const progress = calculateSavingsProgress(totalSaved, savingsGoal)
  const percentRemaining = spendingLimit > 0 ? (safeToSpend / spendingLimit) * 100 : 100

  return (
    <div className="space-y-4 px-4">
      {/* Today's Special - Safe to Spend */}
      <div className="card-crumbs">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-xs font-semibold text-[#4A3B32]/70 uppercase tracking-wide">
              Today's Special
            </p>
            <p className="text-[10px] text-[#4A3B32]/50">Safe to Spend</p>
          </div>
          <div className="text-xl">🍽️</div>
        </div>
        
        <div className="mt-3">
          <p
            className={`text-4xl font-bold ${
              percentRemaining < 20
                ? 'text-[#D9534F]'
                : percentRemaining < 50
                ? 'text-[#E6C288]'
                : 'text-[#4A3B32]'
            }`}
          >
            {formatCurrency(safeToSpend)}
          </p>
          
          {/* Progress bar */}
          <div className="mt-3 bg-[#FDF6EC] rounded-full h-2 overflow-hidden">
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
          
          <p className="text-xs text-[#4A3B32]/60 mt-2">
            {percentRemaining.toFixed(0)}% of monthly budget remaining
          </p>
        </div>
      </div>

      {/* Brew Progress - Total Saved */}
      <div className="card-crumbs">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-xs font-semibold text-[#4A3B32]/70 uppercase tracking-wide">
              Brew Progress
            </p>
            <p className="text-[10px] text-[#4A3B32]/50">Total Saved</p>
          </div>
          <div className="text-xl">☕</div>
        </div>
        
        <div className="mt-3">
          <p className="text-2xl font-bold text-[#4A3B32]">
            {formatCurrency(totalSaved)}
          </p>
          
          {/* Coffee cup filling progress */}
          <div className="mt-3 relative">
            <div className="bg-[#FDF6EC] rounded-lg h-16 overflow-hidden border-2 border-[#E6C288] relative">
              {/* Coffee fill */}
              <div
                className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#4A3B32] to-[#6B5344] transition-all duration-700 ease-out"
                style={{ height: `${progress}%` }}
              />
              
              {/* Steam on top when filling */}
              {progress > 20 && (
                <div className="absolute top-1 left-1/2 transform -translate-x-1/2 animate-steam text-xs opacity-60">
                  💨
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-[#4A3B32]/60">
                {progress.toFixed(1)}% to goal
              </p>
              <p className="text-xs font-semibold text-[#4A3B32]">
                {formatCurrency(savingsGoal)}
              </p>
            </div>
          </div>
          
          {/* Milestones */}
          <div className="mt-3 flex gap-2 text-[10px]">
            <div className={`px-2 py-1 rounded ${totalSaved >= 50000 ? 'bg-[#A8D5BA] text-[#2C2416]' : 'bg-[#FDF6EC] text-[#4A3B32]/70'}`}>
              50k: Mug
            </div>
            <div className={`px-2 py-1 rounded ${totalSaved >= 100000 ? 'bg-[#A8D5BA] text-[#2C2416]' : 'bg-[#FDF6EC] text-[#4A3B32]/70'}`}>
              100k: Press
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

