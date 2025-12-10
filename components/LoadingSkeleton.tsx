export function TransactionSkeleton() {
  return (
    <div className="bg-white rounded-xl p-3 border border-[#E6C288]/30 flex items-center justify-between animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#E6C288]/20" />
        <div className="space-y-2">
          <div className="h-4 w-24 bg-[#E6C288]/20 rounded" />
          <div className="h-3 w-32 bg-[#E6C288]/20 rounded" />
        </div>
      </div>
      <div className="h-6 w-20 bg-[#E6C288]/20 rounded" />
    </div>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="metric-card animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="h-4 w-24 bg-[#E6C288]/20 rounded" />
        <div className="w-5 h-5 bg-[#E6C288]/20 rounded" />
      </div>
      <div className="h-8 w-32 bg-[#E6C288]/20 rounded mb-2" />
      <div className="h-3 w-40 bg-[#E6C288]/20 rounded" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#FDF6EC] pb-24">
      <div className="bg-[#FDF6EC] px-4 py-6">
        <div className="h-10 w-48 bg-[#E6C288]/20 rounded animate-pulse" />
      </div>
      <div className="max-w-md mx-auto">
        <div className="px-4 mb-6">
          <div className="h-6 w-32 bg-[#E6C288]/20 rounded mb-4 animate-pulse" />
          <div className="grid grid-cols-2 gap-4">
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </div>
        </div>
        <div className="mt-6 px-4">
          <div className="h-6 w-40 bg-[#E6C288]/20 rounded mb-4 animate-pulse" />
          <div className="space-y-2">
            <TransactionSkeleton />
            <TransactionSkeleton />
            <TransactionSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
