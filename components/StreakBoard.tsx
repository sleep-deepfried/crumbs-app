interface StreakBoardProps {
  streak: number
}

export default function StreakBoard({ streak }: StreakBoardProps) {
  // Calculate milestone progress
  const milestones = [
    { days: 7, label: 'Week', emoji: '🥉', achieved: streak >= 7 },
    { days: 30, label: 'Month', emoji: '🥈', achieved: streak >= 30 },
    { days: 100, label: 'Century', emoji: '🥇', achieved: streak >= 100 },
  ]

  const nextMilestone = milestones.find(m => !m.achieved)
  const daysToNext = nextMilestone ? nextMilestone.days - streak : 0

  return (
    <div className="bg-[#2C2416] rounded-lg p-4 border-4 border-[#4A3B32] shadow-lg">
      <div className="text-center">
        <p className="text-[#E6C288] text-xs font-semibold mb-2" style={{ fontFamily: 'monospace' }}>
          DAILY STREAK
        </p>
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="text-4xl font-bold text-[#FDF6EC]">{streak}</span>
          <div className="flex flex-col text-left">
            <span className="text-xs text-[#E6C288]">Days</span>
            <span className="text-xs text-[#E6C288]">Fresh</span>
          </div>
        </div>
        
        {/* Milestone Badges */}
        <div className="flex items-center justify-center gap-2 mb-2">
          {milestones.map((milestone) => (
            <div
              key={milestone.days}
              className={`text-lg transition-all ${
                milestone.achieved 
                  ? 'opacity-100 scale-110' 
                  : 'opacity-30 grayscale'
              }`}
              title={`${milestone.days} days - ${milestone.label}`}
            >
              {milestone.emoji}
            </div>
          ))}
        </div>

        {/* Progress Message */}
        {streak === 0 && (
          <div className="text-[#E6C288] text-xs">
            Start your journey! 🌟
          </div>
        )}
        
        {streak > 0 && !nextMilestone && (
          <div className="text-[#A8D5BA] text-xs font-semibold">
            🎉 Legendary Streak!
          </div>
        )}
        
        {streak > 0 && nextMilestone && (
          <div className="text-[#A8D5BA] text-xs">
            🔥 {daysToNext} days to {nextMilestone.emoji}
          </div>
        )}
      </div>
    </div>
  )
}

