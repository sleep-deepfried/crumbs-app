import { MoodState } from '@/types'

interface Friend {
  id: string
  username: string
  avatarUrl: string | null
  crumbMood: MoodState
}

interface CommunityTableProps {
  friends: Friend[]
}

export default function CommunityTable({ friends }: CommunityTableProps) {
  if (friends.length === 0) {
    return (
      <div className="px-4">
        <h3 className="text-sm font-semibold text-[#4A3B32] mb-3">Café Regulars</h3>
        <div className="card-crumbs text-center py-6">
          <p className="text-sm text-[#4A3B32]/60">No friends yet</p>
          <p className="text-xs text-[#4A3B32]/40 mt-1">
            Add friends to see their budget status
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4">
      <h3 className="text-sm font-semibold text-[#4A3B32] mb-3">Café Regulars</h3>
      
      {/* Horizontal scroll container */}
      <div className="overflow-x-auto scroll-horizontal pb-2 -mx-4 px-4">
        <div className="flex gap-4 min-w-min">
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="flex-shrink-0 w-20 flex flex-col items-center"
            >
              {/* Avatar */}
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-[#E6C288] border-3 border-[#4A3B32] flex items-center justify-center overflow-hidden">
                  {friend.avatarUrl ? (
                    <img
                      src={friend.avatarUrl}
                      alt={friend.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-2xl">👤</div>
                  )}
                </div>
                
                {/* Mood indicator badge */}
                <div
                  className={`absolute -top-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs ${
                    friend.crumbMood === 'SOGGY'
                      ? 'bg-[#D9534F]'
                      : friend.crumbMood === 'CRUMBLY'
                      ? 'bg-[#E6C288]'
                      : 'bg-[#A8D5BA]'
                  }`}
                >
                  {friend.crumbMood === 'SOGGY' && '💦'}
                  {friend.crumbMood === 'CRUMBLY' && '⚠️'}
                  {friend.crumbMood === 'HARMONY' && '✨'}
                </div>
              </div>
              
              {/* Username */}
              <p className="text-xs font-medium text-[#4A3B32] mt-2 text-center truncate w-full">
                {friend.username}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

