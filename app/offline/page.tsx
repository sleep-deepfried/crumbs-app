export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#FDF6EC] flex items-center justify-center p-4">
      <div className="card-crumbs max-w-md text-center">
        <div className="text-6xl mb-4">📡</div>
        <h1 className="text-2xl font-bold text-[#4A3B32] mb-2">
          You&apos;re Offline
        </h1>
        <p className="text-sm text-[#4A3B32]/60 mb-6">
          It looks like you&apos;ve lost your internet connection. Don&apos;t
          worry, your data is safe!
        </p>
        <p className="text-xs text-[#4A3B32]/70">
          Reconnect to continue tracking your spending with CRUMBS.
        </p>
      </div>
    </div>
  );
}
