import { Bell, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardHeaderProps {
  username: string
}

export default function DashboardHeader({ username }: DashboardHeaderProps) {
  return (
    <header className="bg-[#4A3B32] text-white px-4 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hi {username}!</h1>
          <p className="text-xs opacity-80 mt-1">Dashboard</p>
        </div>
        <div
          className="flex items-center gap-3"
          role="toolbar"
          aria-label="Header actions"
        >
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-white/10 hover:bg-white/20 hover:text-white transition-all w-12 h-12"
            aria-label="Help and support"
            title="Help and support"
          >
            <HelpCircle
              size={24}
              strokeWidth={2}
              aria-hidden="true"
            />
          </Button>
          <Button
            variant="ghost"
             size="icon"
            className="rounded-full bg-[#A8D5BA] hover:bg-[#A8D5BA]/90 text-white hover:text-white transition-all w-12 h-12"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell
              size={24}
              strokeWidth={2}
              aria-hidden="true"
            />
          </Button>
        </div>
      </div>
    </header>
  )
}
