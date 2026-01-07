"use client"

import { AccountCategory } from "@/types"
import { getCategoryInfo, CATEGORIES } from "@/lib/accountHelpers"
import { Check } from "lucide-react"

interface CategorySelectorProps {
  selectedCategory: AccountCategory
  onSelectCategory: (category: AccountCategory) => void
}

export default function CategorySelector({ selectedCategory, onSelectCategory }: CategorySelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map(({ value, label }) => {
          const categoryInfo = getCategoryInfo(value)
          const Icon = categoryInfo.icon
          const isSelected = selectedCategory === value

          return (
            <button
              key={value}
              type="button"
              onClick={() => onSelectCategory(value)}
              className={`relative p-4 rounded-xl border-2 transition-all hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#E6C288] focus:ring-offset-2 ${
                isSelected
                  ? 'border-[#E6C288] bg-[#FDF6EC] shadow-md'
                  : 'border-[#E6C288]/20 bg-white hover:border-[#E6C288]/40'
              }`}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-[#4A3B32] rounded-full flex items-center justify-center">
                  <Check size={12} className="text-white" strokeWidth={3} />
                </div>
              )}

              {/* Icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-2 mx-auto"
                style={{ backgroundColor: categoryInfo.bgColor }}
              >
                <Icon size={20} style={{ color: categoryInfo.color }} strokeWidth={2} />
              </div>

              {/* Label */}
              <p className={`text-sm font-bold text-center ${
                isSelected ? 'text-[#4A3B32]' : 'text-[#4A3B32]/70'
              }`}>
                {label}
              </p>

              {/* Description (on hover) */}
              <p className="text-[10px] text-[#4A3B32]/50 text-center mt-1 line-clamp-2">
                {categoryInfo.description}
              </p>
            </button>
          )
        })}
      </div>
  )
}

