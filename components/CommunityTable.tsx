import { MoodState } from "@/types";

interface Friend {
  id: string;
  username: string;
  avatarUrl: string | null;
  crumbMood: MoodState;
}

interface CommunityTableProps {
  friends: Friend[];
}

export default function CommunityTable({ friends }: CommunityTableProps) {
  if (friends.length === 0) {
    return (
      <div className="px-4">
        <h3 className="text-sm font-semibold text-[#4A3B32] mb-3">
          Café Regulars
        </h3>
        <div className="card-crumbs text-center py-6">
          <p className="text-sm text-[#4A3B32]/60">No friends yet</p>
          <p className="text-xs text-[#4A3B32]/70 mt-1">
            Add friends to see their budget status
          </p>
        </div>
      </div>
    );
  }

  const getMoodLabel = (mood: MoodState) => {
    switch (mood) {
      case "SOGGY":
        return "Over budget";
      case "CRUMBLY":
        return "Low budget remaining";
      case "HARMONY":
        return "Budget healthy";
      default:
        return "Budget status";
    }
  };

  return (
    <div className="px-4">
      <h3 className="text-sm font-semibold text-[#4A3B32] mb-3">
        Café Regulars
      </h3>

      {/* Horizontal scroll container */}
      <div className="relative">
        <div
          className="overflow-x-auto scroll-horizontal pb-2 -mx-4 px-4"
          role="region"
          aria-label="Friends list"
          tabIndex={0}
        >
          <div className="flex gap-4 min-w-min" role="list">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="flex-shrink-0 w-20 flex flex-col items-center"
                role="listitem"
              >
                {/* Avatar */}
                <div className="relative">
                  <div
                    className="w-16 h-16 rounded-full bg-[#E6C288] border-3 border-[#4A3B32] flex items-center justify-center overflow-hidden"
                    aria-hidden="true"
                  >
                    {friend.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={friend.avatarUrl}
                        alt={`${friend.username}'s avatar`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-2xl" aria-hidden="true">
                        👤
                      </div>
                    )}
                  </div>

                  {/* Mood indicator badge */}
                  <div
                    className={`absolute -top-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs ${
                      friend.crumbMood === "SOGGY"
                        ? "bg-[#D9534F]"
                        : friend.crumbMood === "CRUMBLY"
                        ? "bg-[#E6C288]"
                        : "bg-[#A8D5BA]"
                    }`}
                    aria-label={`${friend.username}: ${getMoodLabel(
                      friend.crumbMood
                    )}`}
                    title={`${friend.username}: ${getMoodLabel(
                      friend.crumbMood
                    )}`}
                  >
                    <span aria-hidden="true">
                      {friend.crumbMood === "SOGGY" && "💦"}
                      {friend.crumbMood === "CRUMBLY" && "⚠️"}
                      {friend.crumbMood === "HARMONY" && "✨"}
                    </span>
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
        {/* Scroll indicator */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-12 bg-gradient-to-l from-[#FDF6EC] to-transparent pointer-events-none flex items-center justify-end pr-2">
          <div className="w-1 h-6 bg-[#E6C288]/40 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
