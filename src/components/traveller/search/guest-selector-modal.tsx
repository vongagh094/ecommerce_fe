"use client"

import { useState } from "react"
import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface GuestSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (guests: GuestCounts) => void
  guests: GuestCounts
}

export interface GuestCounts {
  adults: number
  children: number
  infants: number
  pets: number
}

export function GuestSelectorModal({ isOpen, onClose, onSelect, guests }: GuestSelectorModalProps) {
  const [guestCounts, setGuestCounts] = useState<GuestCounts>(guests)

  const updateCount = (type: keyof GuestCounts, increment: boolean) => {
    setGuestCounts((prev) => {
      const newCount = increment ? prev[type] + 1 : Math.max(0, prev[type] - 1)

      // Ensure at least 1 adult
      if (type === "adults" && newCount < 1) {
        return prev
      }

      return { ...prev, [type]: newCount }
    })
  }

  const handleSave = () => {
    onSelect(guestCounts)
    onClose()
  }

  const getTotalGuests = () => {
    return guestCounts.adults + guestCounts.children
  }

  if (!isOpen) return null

  return (
    <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 p-6 w-80">
      <div className="space-y-6">
        {/* Adults */}
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-gray-900">Adults</div>
            <div className="text-sm text-gray-500">Ages 13 or above</div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => updateCount("adults", false)}
              disabled={guestCounts.adults <= 1}
              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                guestCounts.adults <= 1
                  ? "border-gray-200 text-gray-300 cursor-not-allowed"
                  : "border-gray-300 text-gray-600 hover:border-gray-900"
              }`}
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-8 text-center font-medium">{guestCounts.adults}</span>
            <button
              onClick={() => updateCount("adults", true)}
              className="w-8 h-8 rounded-full border border-gray-300 text-gray-600 hover:border-gray-900 flex items-center justify-center transition-colors"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Children */}
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-gray-900">Children</div>
            <div className="text-sm text-gray-500">Ages 2-12</div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => updateCount("children", false)}
              disabled={guestCounts.children <= 0}
              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                guestCounts.children <= 0
                  ? "border-gray-200 text-gray-300 cursor-not-allowed"
                  : "border-gray-300 text-gray-600 hover:border-gray-900"
              }`}
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-8 text-center font-medium">{guestCounts.children}</span>
            <button
              onClick={() => updateCount("children", true)}
              className="w-8 h-8 rounded-full border border-gray-300 text-gray-600 hover:border-gray-900 flex items-center justify-center transition-colors"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Infants */}
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-gray-900">Infants</div>
            <div className="text-sm text-gray-500">Under 2</div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => updateCount("infants", false)}
              disabled={guestCounts.infants <= 0}
              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                guestCounts.infants <= 0
                  ? "border-gray-200 text-gray-300 cursor-not-allowed"
                  : "border-gray-300 text-gray-600 hover:border-gray-900"
              }`}
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-8 text-center font-medium">{guestCounts.infants}</span>
            <button
              onClick={() => updateCount("infants", true)}
              className="w-8 h-8 rounded-full border border-gray-300 text-gray-600 hover:border-gray-900 flex items-center justify-center transition-colors"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Pets */}
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-gray-900">Pets</div>
            <div className="text-sm text-gray-500">Bringing a service animal?</div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => updateCount("pets", false)}
              disabled={guestCounts.pets <= 0}
              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                guestCounts.pets <= 0
                  ? "border-gray-200 text-gray-300 cursor-not-allowed"
                  : "border-gray-300 text-gray-600 hover:border-gray-900"
              }`}
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-8 text-center font-medium">{guestCounts.pets}</span>
            <button
              onClick={() => updateCount("pets", true)}
              className="w-8 h-8 rounded-full border border-gray-300 text-gray-600 hover:border-gray-900 flex items-center justify-center transition-colors"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-gray-900 hover:bg-gray-800 text-white">
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}
