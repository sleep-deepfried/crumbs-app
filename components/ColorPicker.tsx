"use client"

import { useState } from "react"
import { Check, Palette } from "lucide-react"
import { COLOR_PALETTE } from "@/lib/accountHelpers"

interface ColorPickerProps {
  selectedColor: string
  onSelectColor: (color: string) => void
}

export default function ColorPicker({ selectedColor, onSelectColor }: ColorPickerProps) {
  const [showCustomPicker, setShowCustomPicker] = useState(false)
  const [customColor, setCustomColor] = useState(selectedColor)

  const handlePresetSelect = (color: string) => {
    onSelectColor(color)
    setShowCustomPicker(false)
  }

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value
    setCustomColor(color)
    onSelectColor(color)
  }

  return (
    <div className="space-y-4">
      {/* Preset Colors */}
      <div className="grid grid-cols-6 gap-2">
          {COLOR_PALETTE.map((color) => (
            <button
              key={color.hex}
              type="button"
              onClick={() => handlePresetSelect(color.hex)}
              className="group relative aspect-square rounded-xl transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#E6C288] focus:ring-offset-2"
              style={{ backgroundColor: color.hex }}
              title={color.name}
            >
              {selectedColor.toUpperCase() === color.hex.toUpperCase() && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Check size={16} className="text-white drop-shadow-md" strokeWidth={3} />
                </div>
              )}
              <span className="sr-only">{color.name}</span>
            </button>
          ))}
      </div>

      {/* Custom Color Picker Toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowCustomPicker(!showCustomPicker)}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 text-sm text-[#4A3B32] bg-[#FDF6EC] border border-[#E6C288]/30 rounded-xl hover:border-[#E6C288] transition-colors"
        >
          <Palette size={16} />
          <span>{showCustomPicker ? 'Hide' : 'Show'} Custom Color Picker</span>
        </button>
      </div>

      {/* Custom Color Picker */}
      {showCustomPicker && (
        <div className="space-y-3 p-4 bg-white rounded-xl border border-[#E6C288]/30">
          <div className="flex items-center gap-3">
            {/* Native Color Input */}
            <div className="relative">
              <input
                type="color"
                value={customColor}
                onChange={handleCustomColorChange}
                className="w-16 h-16 rounded-xl cursor-pointer border-2 border-[#E6C288]/30"
              />
            </div>

            {/* Color Preview and Hex Input */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg border-2 border-[#E6C288]/30"
                  style={{ backgroundColor: customColor }}
                />
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => {
                    const value = e.target.value
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                      setCustomColor(value)
                      if (value.length === 7) {
                        onSelectColor(value)
                      }
                    }
                  }}
                  placeholder="#000000"
                  className="flex-1 px-3 py-2 text-sm font-mono bg-[#FDF6EC] border border-[#E6C288]/30 rounded-lg focus:border-[#E6C288] focus:ring-1 focus:ring-[#E6C288] outline-none"
                  maxLength={7}
                />
              </div>
              <p className="text-xs text-[#4A3B32]/50">
                Enter hex code or use the color picker
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

