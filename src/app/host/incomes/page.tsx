"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IncomeChart } from "@/components/host/income-chart"
import { IncomeSummary } from "@/components/host/income-summary"

const properties = [
  { id: "all", name: "All rooms" },
  { id: "1", name: "Deluxe Ocean View Suite" },
  { id: "2", name: "Garden Villa with Pool" },
  { id: "3", name: "Cozy Mountain Cabin" },
  { id: "4", name: "Downtown Loft Apartment" },
]

const timeOptions = [
  { id: "october", name: "October" },
  { id: "september", name: "September" },
  { id: "august", name: "August" },
  { id: "july", name: "July" },
  { id: "june", name: "June" },
  { id: "may", name: "May" },
]

// Sample sales data for October (31 days)
const salesData = [
  { day: 1, amount: 200000 },
  { day: 2, amount: 250000 },
  { day: 3, amount: 300000 },
  { day: 4, amount: 280000 },
  { day: 5, amount: 320000 },
  { day: 6, amount: 480000 },
  { day: 7, amount: 520000 },
  { day: 8, amount: 450000 },
  { day: 9, amount: 380000 },
  { day: 10, amount: 420000 },
  { day: 11, amount: 900000 }, // Peak day
  { day: 12, amount: 520000 },
  { day: 13, amount: 480000 },
  { day: 14, amount: 450000 },
  { day: 15, amount: 560000 },
  { day: 16, amount: 580000 },
  { day: 17, amount: 620000 },
  { day: 18, amount: 240000 },
  { day: 19, amount: 280000 },
  { day: 20, amount: 320000 },
  { day: 21, amount: 460000 },
  { day: 22, amount: 480000 },
  { day: 23, amount: 720000 },
  { day: 24, amount: 580000 },
  { day: 25, amount: 620000 },
  { day: 26, amount: 600000 },
  { day: 27, amount: 540000 },
  { day: 28, amount: 520000 },
  { day: 29, amount: 580000 },
  { day: 30, amount: 420000 },
  { day: 31, amount: 560000 },
]

export default function HostIncomes() {
  const [selectedProperty, setSelectedProperty] = useState("all")
  const [selectedTime, setSelectedTime] = useState("october")
  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false)
  const [showTimeDropdown, setShowTimeDropdown] = useState(false)

  const totalSales = salesData.reduce((sum, data) => sum + data.amount, 0)

  const selectedPropertyName = properties.find((p) => p.id === selectedProperty)?.name || "All rooms"
  const selectedTimeName = timeOptions.find((t) => t.id === selectedTime)?.name || "October"

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl shadow-sm p-8">
        {/* Header with Filters */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Sales Details</h1>

          <div className="flex items-center space-x-4">
            {/* Property Selector */}
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPropertyDropdown(!showPropertyDropdown)
                  setShowTimeDropdown(false)
                }}
                className="flex items-center space-x-2 min-w-[200px] justify-between"
              >
                <span className="text-gray-600">
                  {selectedProperty === "all" ? "Choose which room or all rooms" : selectedPropertyName}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>

              {showPropertyDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {properties.map((property) => (
                    <button
                      key={property.id}
                      onClick={() => {
                        setSelectedProperty(property.id)
                        setShowPropertyDropdown(false)
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                    >
                      {property.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Time Selector */}
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => {
                  setShowTimeDropdown(!showTimeDropdown)
                  setShowPropertyDropdown(false)
                }}
                className="flex items-center space-x-2 min-w-[120px] justify-between"
              >
                <span>{selectedTimeName}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>

              {showTimeDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {timeOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setSelectedTime(option.id)
                        setShowTimeDropdown(false)
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                    >
                      {option.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="mb-8">
          <IncomeChart data={salesData} />
        </div>

        {/* Summary */}
        <IncomeSummary totalSales={totalSales} period={selectedTimeName} />
      </div>
    </div>
  )
}
