import { ReactNode } from 'react'

export default function Countertop({ children }: { children: ReactNode }) {
  return (
    <div className="relative bg-gradient-to-b from-[#8B7355] to-[#A0826D] p-6 rounded-b-3xl shadow-lg border-b-4 border-[#6B5344]">
      {/* Wood grain texture overlay */}
      <div className="absolute inset-0 opacity-10 rounded-b-3xl" 
        style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.1) 2px,
            rgba(0,0,0,0.1) 4px
          )`
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

