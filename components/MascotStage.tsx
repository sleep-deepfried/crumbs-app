import { MoodState, BrewLevel } from '@/types'

interface MascotStageProps {
  mood: MoodState
  brewLevel: BrewLevel
}

export default function MascotStage({ mood, brewLevel }: MascotStageProps) {
  const getBrewVessel = () => {
    switch (brewLevel) {
      case 1:
        return 'Glass'
      case 2:
        return 'Mug'
      case 3:
        return 'French Press'
      default:
        return 'Glass'
    }
  }

  return (
    <div className="flex flex-col items-center justify-center py-8">
      {/* Mascot Container - Ready for pixel art assets */}
      <div className="relative w-full max-w-[280px] h-[200px] flex items-center justify-center">
        {mood === 'HARMONY' && (
          <div className="flex items-end justify-center gap-4">
            {/* BREW - Coffee Mug (left) */}
            <div className="relative">
              <div className="w-20 h-24 bg-[#4A3B32] rounded-b-lg border-4 border-[#4A3B32] flex items-center justify-center">
                <div className="text-4xl">☕</div>
              </div>
              {/* Steam effect */}
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 animate-steam-rise">
                <div className="text-2xl opacity-60">💨</div>
              </div>
              <p className="text-center text-xs font-bold text-[#4A3B32] mt-2">BREW</p>
              <p className="text-center text-[10px] text-[#4A3B32]/70">{getBrewVessel()}</p>
            </div>

            {/* Saucer */}
            <div className="w-32 h-3 bg-[#E6C288] rounded-full absolute bottom-12 left-1/2 transform -translate-x-1/2 shadow-md" />

            {/* BUN - Ensaymada (right) */}
            <div className="relative z-10 animate-gentle-float">
              <div className="w-20 h-20 bg-[#E6C288] rounded-full flex items-center justify-center border-4 border-[#F4D9A6]">
                <div className="text-4xl">🥐</div>
              </div>
              <p className="text-center text-xs font-bold text-[#4A3B32] mt-2">BUN</p>
              <p className="text-center text-[10px] text-[#4A3B32]/70">Fluffy!</p>
            </div>
          </div>
        )}

        {mood === 'CRUMBLY' && (
          <div className="flex items-end justify-center gap-4">
            {/* BREW - Cold coffee (no steam) */}
            <div className="relative">
              <div className="w-20 h-24 bg-[#4A3B32] rounded-b-lg border-4 border-[#4A3B32] flex items-center justify-center opacity-70">
                <div className="text-4xl grayscale">☕</div>
              </div>
              <p className="text-center text-xs font-bold text-[#4A3B32]/70 mt-2">BREW</p>
              <p className="text-center text-[10px] text-[#4A3B32]/50">Cold</p>
            </div>

            {/* BUN - Dry and crumbly */}
            <div className="relative z-10 animate-crumbly">
              <div className="w-20 h-20 bg-[#D4A574] rounded-full flex items-center justify-center border-4 border-[#C4956A]">
                <div className="text-4xl opacity-80">🥐</div>
              </div>
              {/* Crumbs falling */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs">
                💧💧
              </div>
              <p className="text-center text-xs font-bold text-[#D9534F] mt-2">BUN</p>
              <p className="text-center text-[10px] text-[#D9534F]">Dry!</p>
            </div>
          </div>
        )}

        {mood === 'SOGGY' && (
          <div className="flex flex-col items-center justify-center">
            {/* The Dunk - BUN has fallen into BREW */}
            <div className="relative">
              <div className="w-24 h-28 bg-[#4A3B32] rounded-b-xl border-4 border-[#4A3B32] flex items-center justify-center overflow-hidden">
                {/* Coffee liquid */}
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#3A2B22] to-[#4A3B32]" />
                
                {/* Soggy BUN in the coffee */}
                <div className="relative z-10 animate-splash">
                  <div className="text-3xl opacity-70">🥐</div>
                </div>
                
                {/* Splash effect */}
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-2xl opacity-40">
                  💦
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-xs font-bold text-[#D9534F]">THE DUNK!</p>
                <p className="text-[10px] text-[#D9534F]">Over Budget</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mood Status */}
      <div className="mt-4 text-center">
        <p className="text-sm font-semibold text-white/90">
          {mood === 'HARMONY' && '✨ All is Well!'}
          {mood === 'CRUMBLY' && '⚠️ Watch Your Spending'}
          {mood === 'SOGGY' && '🚨 Budget Alert!'}
        </p>
      </div>
    </div>
  )
}

