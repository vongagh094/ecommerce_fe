"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DatePickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (checkIn: Date | null, checkOut: Date | null) => void
  checkIn: Date | null
  checkOut: Date | null
}

export function DatePickerModal({ isOpen, onClose, onSelect, checkIn, checkOut }: DatePickerModalProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedCheckIn, setSelectedCheckIn] = useState<Date | null>(checkIn)
  const [selectedCheckOut, setSelectedCheckOut] = useState<Date | null>(checkOut)
  const [activeTab, setActiveTab] = useState<"dates" | "months" | "flexible">("dates")

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)

  const handleDateClick = (date: Date) => {
    if (!selectedCheckIn || (selectedCheckIn && selectedCheckOut)) {
      setSelectedCheckIn(date)
      setSelectedCheckOut(null)
    } else if (selectedCheckIn && !selectedCheckOut) {
      if (date > selectedCheckIn) {
        setSelectedCheckOut(date)
      } else {
        setSelectedCheckIn(date)
        setSelectedCheckOut(null)
      }
    }
  }

  const handleSave = () => {
    onSelect(selectedCheckIn, selectedCheckOut)
    onClose()
  }

  const isDateInRange = (date: Date) => {
    if (!selectedCheckIn || !selectedCheckOut) return false
    return date >= selectedCheckIn && date <= selectedCheckOut
  }

  const isDateSelected = (date: Date) => {
    return (
      (selectedCheckIn && date.getTime() === selectedCheckIn.getTime()) ||
      (selectedCheckOut && date.getTime() === selectedCheckOut.getTime())
    )
  }

  if (!isOpen) return null

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 p-6 max-w-2xl">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-full p-1">
          <button
            onClick={() => setActiveTab("dates")}
            className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors ${
              activeTab === "dates" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"
            }`}
          >
            Dates
          </button>
          <button
            onClick={() => setActiveTab("months")}
            className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors ${
              activeTab === "months" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"
            }`}
          >
            Months
          </button>
          <button
            onClick={() => setActiveTab("flexible")}
            className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors ${
              activeTab === "flexible" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"
            }`}
          >
            Flexible
          </button>
        </div>

        {activeTab === "dates" && (
          <>
            {/* Month Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex space-x-8">
                <h3 className="text-lg font-semibold">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <h3 className="text-lg font-semibold">
                  {monthNames[nextMonth.getMonth()]} {nextMonth.getFullYear()}
                </h3>
              </div>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-2 gap-8">
              {/* Current Month */}
              <div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth(currentMonth).map((date, index) => (
                    <button
                      key={index}
                      onClick={() => date && handleDateClick(date)}
                      disabled={!date || date < new Date()}
                      className={`aspect-square flex items-center justify-center text-sm rounded-full transition-colors ${
                        !date
                          ? ""
                          : date < new Date()
                            ? "text-gray-300 cursor-not-allowed"
                            : isDateSelected(date)
                              ? "bg-gray-900 text-white"
                              : isDateInRange(date)
                                ? "bg-gray-200"
                                : "hover:bg-gray-100"
                      }`}
                    >
                      {date?.getDate()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Next Month */}
              <div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth(nextMonth).map((date, index) => (
                    <button
                      key={index}
                      onClick={() => date && handleDateClick(date)}
                      disabled={!date || date < new Date()}
                      className={`aspect-square flex items-center justify-center text-sm rounded-full transition-colors ${
                        !date
                          ? ""
                          : date < new Date()
                            ? "text-gray-300 cursor-not-allowed"
                            : isDateSelected(date)
                              ? "bg-gray-900 text-white"
                              : isDateInRange(date)
                                ? "bg-gray-200"
                                : "hover:bg-gray-100"
                      }`}
                    >
                      {date?.getDate()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!selectedCheckIn || !selectedCheckOut}
            className="bg-gray-900 hover:bg-gray-800 text-white"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}
