import { signout } from "@/app/actions/auth";
import MascotStage from "@/components/MascotStage";
import StreakBoard from "@/components/StreakBoard";
import { Trophy, Settings, Bell, Shield, ChevronRight } from "lucide-react";

interface ProfileViewProps {
  data: {
    user: unknown;
    [key: string]: unknown;
  };
}

export default function ProfileView({ data }: ProfileViewProps) {
  const { user } = data;

  return (
    <div className="min-h-screen bg-[#FDF6EC] pb-24">
      {/* Header Bar */}
      <div className="bg-[#4A3B32] text-white px-4 py-4">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-xs opacity-80 mt-1">@{user.username}</p>
      </div>

      {/* Main Content */}
      <main id="main-content" className="max-w-md mx-auto px-4 pt-6">
        {/* Profile Card */}
        <div className="card-crumbs mb-6 text-center pt-8 pb-8">
          <div className="w-24 h-24 bg-[#E6C288] rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-[#4A3B32] shadow-sm">
            <div className="text-[#4A3B32]">
              <Trophy size={48} strokeWidth={1.5} className="hidden" />{" "}
              {/* Placeholder hack if needed, strictly utilizing standard icons */}
              <span className="text-5xl">😊</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-[#4A3B32] mb-1">
            @{user.username}
          </h2>
          <p className="text-sm text-[#4A3B32]/60 mb-6 font-medium">
            {user.email}
          </p>

          <div className="flex items-center justify-center gap-2 mt-6 bg-[#FDF6EC] p-4 rounded-xl mx-2">
            <div className="flex-1">
              <p className="text-2xl font-bold text-[#4A3B32]">
                {user.currentStreak}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-[#4A3B32]/60 font-semibold mt-1">
                Day Streak
              </p>
            </div>
            <div className="w-px h-8 bg-[#E6C288]" />
            <div className="flex-1">
              <p className="text-2xl font-bold text-[#4A3B32]">
                {user.brewLevel}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-[#4A3B32]/60 font-semibold mt-1">
                Brew Level
              </p>
            </div>
            <div className="w-px h-8 bg-[#E6C288]" />
            <div className="flex-1">
              <p className="text-2xl font-bold text-[#4A3B32]">
                {data.friends.length}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-[#4A3B32]/60 font-semibold mt-1">
                Friends
              </p>
            </div>
          </div>
        </div>

        {/* Mascot Display */}
        <div className="bg-gradient-to-b from-[#8B7355] to-[#A0826D] rounded-2xl p-6 mb-6 shadow-lg border border-[#4A3B32]/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Trophy size={100} />
          </div>
          <div className="relative z-10">
            <MascotStage mood={user.crumbMood} brewLevel={user.brewLevel} />
            <div className="mt-4">
              <StreakBoard streak={user.currentStreak} />
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="card-crumbs mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-[#E6C288]/20 rounded-lg flex items-center justify-center">
              <Trophy size={18} className="text-[#4A3B32]" strokeWidth={2} />
            </div>
            <h3 className="section-heading">Achievements</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div
              className={`text-center p-3 rounded-xl border transition-all ${
                user.currentStreak >= 7
                  ? "bg-[#A8D5BA]/20 border-[#A8D5BA]"
                  : "bg-[#FDF6EC] border-transparent opacity-60 grayscale"
              }`}
            >
              <span className="text-3xl block mb-2">🥉</span>
              <span className="text-xs font-bold text-[#4A3B32]">7 Days</span>
            </div>
            <div
              className={`text-center p-3 rounded-xl border transition-all ${
                user.currentStreak >= 30
                  ? "bg-[#A8D5BA]/20 border-[#A8D5BA]"
                  : "bg-[#FDF6EC] border-transparent opacity-60 grayscale"
              }`}
            >
              <span className="text-3xl block mb-2">🥈</span>
              <span className="text-xs font-bold text-[#4A3B32]">30 Days</span>
            </div>
            <div
              className={`text-center p-3 rounded-xl border transition-all ${
                user.currentStreak >= 100
                  ? "bg-[#A8D5BA]/20 border-[#A8D5BA]"
                  : "bg-[#FDF6EC] border-transparent opacity-60 grayscale"
              }`}
            >
              <span className="text-3xl block mb-2">🥇</span>
              <span className="text-xs font-bold text-[#4A3B32]">100 Days</span>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="card-crumbs mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-[#E6C288]/20 rounded-lg flex items-center justify-center">
              <Settings size={18} className="text-[#4A3B32]" strokeWidth={2} />
            </div>
            <h3 className="section-heading">Settings</h3>
          </div>
          <div className="space-y-2">
            <button className="w-full flex items-center justify-between p-3 bg-[#FDF6EC] rounded-xl hover:bg-[#E6C288]/20 transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Settings
                    size={16}
                    className="text-[#4A3B32]"
                    strokeWidth={2}
                  />
                </div>
                <span className="text-sm font-semibold text-[#4A3B32]">
                  Edit Profile
                </span>
              </div>
              <ChevronRight
                size={18}
                className="text-[#4A3B32]/40 group-hover:text-[#4A3B32] transition-colors"
                strokeWidth={2}
              />
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-[#FDF6EC] rounded-xl hover:bg-[#E6C288]/20 transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Bell size={16} className="text-[#4A3B32]" strokeWidth={2} />
                </div>
                <span className="text-sm font-semibold text-[#4A3B32]">
                  Notifications
                </span>
              </div>
              <ChevronRight
                size={18}
                className="text-[#4A3B32]/40 group-hover:text-[#4A3B32] transition-colors"
                strokeWidth={2}
              />
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-[#FDF6EC] rounded-xl hover:bg-[#E6C288]/20 transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Shield
                    size={16}
                    className="text-[#4A3B32]"
                    strokeWidth={2}
                  />
                </div>
                <span className="text-sm font-semibold text-[#4A3B32]">
                  Privacy
                </span>
              </div>
              <ChevronRight
                size={18}
                className="text-[#4A3B32]/40 group-hover:text-[#4A3B32] transition-colors"
                strokeWidth={2}
              />
            </button>
          </div>
        </div>

        {/* Sign Out Button */}
        <form action={signout}>
          <button
            type="submit"
            className="w-full bg-[#D9534F] text-white py-3 rounded-xl font-semibold hover:bg-[#D9534F]/90 active:scale-95 transition-all shadow-md"
          >
            Sign Out
          </button>
        </form>

        {/* Bottom spacing */}
        <div className="h-8" />
      </main>
    </div>
  );
}
