import { redirect } from 'next/navigation'
import { getDashboardData } from '../actions/user'
import { signout } from '../actions/auth'
import BottomNav from '@/components/BottomNav'

export default async function ProfilePage() {
  const data = await getDashboardData()

  if (!data) {
    redirect('/auth/login')
  }

  const { user } = data

  return (
    <div className="min-h-screen bg-[#FDF6EC] pb-24">
      {/* Header Bar */}
      <div className="bg-[#4A3B32] text-white px-4 py-3">
        <h1 className="text-xl font-bold">👤 Profile</h1>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto p-4">
        {/* Profile Card */}
        <div className="card-crumbs mb-6 text-center">
          <div className="w-24 h-24 bg-[#E6C288] rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-[#4A3B32]">
            <span className="text-5xl">👤</span>
          </div>
          <h2 className="text-2xl font-bold text-[#4A3B32] mb-1">@{user.username}</h2>
          <p className="text-sm text-[#4A3B32]/60 mb-4">{user.email}</p>
          
          <div className="flex items-center justify-center gap-6 mt-6">
            <div>
              <p className="text-2xl font-bold text-[#4A3B32]">{user.currentStreak}</p>
              <p className="text-xs text-[#4A3B32]/60">Day Streak</p>
            </div>
            <div className="w-px h-12 bg-[#E6C288]" />
            <div>
              <p className="text-2xl font-bold text-[#4A3B32]">{user.brewLevel}</p>
              <p className="text-xs text-[#4A3B32]/60">Brew Level</p>
            </div>
            <div className="w-px h-12 bg-[#E6C288]" />
            <div>
              <p className="text-2xl font-bold text-[#4A3B32]">{data.friends.length}</p>
              <p className="text-xs text-[#4A3B32]/60">Friends</p>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="card-crumbs mb-6">
          <h3 className="text-lg font-bold text-[#4A3B32] mb-4">🏆 Achievements</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className={`text-center p-3 rounded-lg ${user.currentStreak >= 7 ? 'bg-[#A8D5BA]/20' : 'bg-[#FDF6EC] opacity-40'}`}>
              <span className="text-3xl block mb-1">🥉</span>
              <span className="text-xs font-semibold text-[#4A3B32]">7 Days</span>
            </div>
            <div className={`text-center p-3 rounded-lg ${user.currentStreak >= 30 ? 'bg-[#A8D5BA]/20' : 'bg-[#FDF6EC] opacity-40'}`}>
              <span className="text-3xl block mb-1">🥈</span>
              <span className="text-xs font-semibold text-[#4A3B32]">30 Days</span>
            </div>
            <div className={`text-center p-3 rounded-lg ${user.currentStreak >= 100 ? 'bg-[#A8D5BA]/20' : 'bg-[#FDF6EC] opacity-40'}`}>
              <span className="text-3xl block mb-1">🥇</span>
              <span className="text-xs font-semibold text-[#4A3B32]">100 Days</span>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="card-crumbs mb-6">
          <h3 className="text-lg font-bold text-[#4A3B32] mb-4">⚙️ Settings</h3>
          <div className="space-y-2">
            <button className="w-full flex items-center justify-between p-3 bg-[#FDF6EC] rounded-lg hover:bg-[#E6C288]/20 transition-colors">
              <span className="text-sm text-[#4A3B32]">Edit Profile</span>
              <span className="text-[#4A3B32]/40">›</span>
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-[#FDF6EC] rounded-lg hover:bg-[#E6C288]/20 transition-colors">
              <span className="text-sm text-[#4A3B32]">Notifications</span>
              <span className="text-[#4A3B32]/40">›</span>
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-[#FDF6EC] rounded-lg hover:bg-[#E6C288]/20 transition-colors">
              <span className="text-sm text-[#4A3B32]">Privacy</span>
              <span className="text-[#4A3B32]/40">›</span>
            </button>
          </div>
        </div>

        {/* Sign Out Button */}
        <form action={signout}>
          <button
            type="submit"
            className="w-full bg-[#D9534F] text-white py-3 rounded-xl font-semibold hover:bg-[#D9534F]/90 active:scale-98 transition-all"
          >
            Sign Out
          </button>
        </form>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}

