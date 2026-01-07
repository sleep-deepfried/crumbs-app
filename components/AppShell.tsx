"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import BottomNav from "./BottomNav";
import DashboardView from "./views/DashboardView";
import WalletView from "./views/WalletView";
import AnalyticsView from "./views/AnalyticsView";
import ProfileView from "./views/ProfileView";

interface AppShellProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

export default function AppShell({ data }: AppShellProps) {
  const searchParams = useSearchParams();

  // Initialize tab from search param or default to 'home'
  const initialTab = searchParams?.get("tab") || "home";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Tab order for slide direction
  const tabOrder: Record<string, number> = {
    home: 0,
    wallet: 1,
    analytics: 2,
    profile: 3,
  };

  const [direction, setDirection] = useState<"right" | "left">("right");

  // Sync state with URL param on change (shallow, to allow bookmarking/back button eventually)
  const handleTabChange = (tab: string) => {
    if (tab === activeTab) return;

    // Determine direction
    const currentOrder = tabOrder[tab] ?? 0;
    const prevOrder = tabOrder[activeTab] ?? 0;
    setDirection(currentOrder > prevOrder ? "right" : "left");

    setActiveTab(tab);

    // For now, let's keep it purely client-side state for maximum smoothness
    // unless user explicitly wants deep links.
    // Actually, updating URL is good for PWA state restoration on reload.
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.pushState({}, "", url);

    // Reset scroll position for smooth feel
    window.scrollTo(0, 0);
  };

  // Effect to handle back button if needed, etc.

  const renderView = () => {
    switch (activeTab) {
      case "home":
        return <DashboardView data={data} onTabChange={handleTabChange} />;
      case "wallet":
        return <WalletView data={data} />;
      case "analytics":
        return <AnalyticsView data={data} />;
      case "profile":
        return <ProfileView data={data} />;
      default:
        return <DashboardView data={data} onTabChange={handleTabChange} />;
    }
  };

  return (
    <>
      <div className="w-full overflow-x-hidden">
        <div
          key={activeTab}
          className={`w-full min-h-screen bg-[#FDF6EC] ${
            direction === "right"
              ? "animate-slide-in-right"
              : "animate-slide-in-left"
          }`}
        >
          {renderView()}
        </div>
      </div>
      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        accounts={data.accounts}
      />
    </>
  );
}
