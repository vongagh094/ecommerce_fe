"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"

const categories = [
  { id: "amazing-views", label: "Amazing views", icon: "🏔️" },
  { id: "farms", label: "Farms", icon: "🚜" },
  { id: "design", label: "Design", icon: "🎨" },
  { id: "bed-breakfast", label: "Bed & breakfasts", icon: "🛏️" },
  { id: "iconic-cities", label: "Iconic cities", icon: "🏙️" },
  { id: "treehouses", label: "Treehouses", icon: "🌳" },
  { id: "countryside", label: "Countryside", icon: "🌾" },
  { id: "amazing-pool", label: "Amazing pool", icon: "🏊" },
  { id: "beach", label: "Beach", icon: "🏖️" },
  { id: "camper-vans", label: "Camper vans", icon: "🚐" },
  { id: "islands", label: "Islands", icon: "🏝️" },
  { id: "national-parks", label: "National parks", icon: "🏞️" },
  { id: "omg", label: "OMG!", icon: "😱" },
  { id: "camping", label: "Camping", icon: "⛺" },
  { id: "arctic", label: "Arctic", icon: "🧊" },
  { id: "cabin", label: "Cabin", icon: "🏘️" },
]

export function CategoryFilters() {
  const [selectedCategory, setSelectedCategory] = useState("amazing-views")

  return (
    <div className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-8 overflow-x-auto scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex flex-col items-center space-y-2 min-w-0 flex-shrink-0 pb-2 border-b-2 transition-colors ${
                  selectedCategory === category.id
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <span className="text-2xl">{category.icon}</span>
                <span className="text-xs font-medium whitespace-nowrap">{category.label}</span>
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="ml-4 flex-shrink-0">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>
    </div>
  )
}
