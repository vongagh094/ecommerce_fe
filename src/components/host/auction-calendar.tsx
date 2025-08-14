"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  isBefore,
  startOfDay,
  isWeekend,
} from "date-fns"
import { cn } from "@/lib/utils"

interface AuctionCalendarProps {
  selectedStartDate?: Date
  selectedEndDate?: Date
  onDateSelect: (date: Date, type: "start" | "end") => void
  selectingType: "start" | "end"
}

export function AuctionCalendar({
  selectedStartDate,
  selectedEndDate,
  onDateSelect,
  selectingType,
}: AuctionCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const today = startOfDay(new Date())

  const isDateDisabled = (date: Date) => {
    return isBefore(date, today)
  }

  const isDateInRange = (date: Date) => {
    if (!selectedStartDate || !selectedEndDate) return false
    return date >= selectedStartDate && date <= selectedEndDate
  }

  const isStartDate = (date: Date) => {
    return selectedStartDate && format(date, "yyyy-MM-dd") === format(selectedStartDate, "yyyy-MM-dd")
  }

  const isEndDate = (date: Date) => {
    return selectedEndDate && format(date, "yyyy-MM-dd") === format(selectedEndDate, "yyyy-MM-dd")
  }

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return
    onDateSelect(date, selectingType)
  }

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  // Generate calendar grid with empty cells for proper alignment
  const firstDayOfMonth = monthStart.getDay()
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">{format(currentMonth, "MMMM yyyy")}</h3>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={prevMonth} className="h-8 w-8 p-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={nextMonth} className="h-8 w-8 p-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 mb-3">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before month start */}
          {emptyDays.map((_, index) => (
            <div key={`empty-${index}`} className="h-12" />
          ))}

          {/* Days of the month */}
          {days.map((date) => {
            const disabled = isDateDisabled(date)
            const inRange = isDateInRange(date)
            const isStart = isStartDate(date)
            const isEnd = isEndDate(date)
            const todayDate = isToday(date)
            const weekend = isWeekend(date)

            return (
              <button
                key={format(date, "yyyy-MM-dd")}
                onClick={() => handleDateClick(date)}
                disabled={disabled}
                className={cn(
                  "h-12 rounded-lg text-sm font-medium transition-all relative",
                  "hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent",
                  {
                    // Base styles
                    "bg-white text-gray-900": !disabled && !inRange && !isStart && !isEnd,
                    "bg-gray-50 text-gray-400": disabled,

                    // Range styles
                    "bg-blue-50 text-blue-700": inRange && !isStart && !isEnd,
                    "bg-blue-500 text-white": isStart || isEnd,

                    // Today indicator
                    "ring-2 ring-blue-200": todayDate && !disabled && !isStart && !isEnd,

                    // Weekend styling
                    "text-red-600": weekend && !disabled && !inRange && !isStart && !isEnd,
                  },
                )}
              >
                <span className="relative z-10">{format(date, "d")}</span>

                {/* Today dot */}
                {todayDate && !isStart && !isEnd && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
                )}
              </button>
            )
          })}
        </div>

        {/* Selection info */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-500"></div>
                <span className="text-gray-600">Selected dates</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-50 border border-blue-200"></div>
                <span className="text-gray-600">Date range</span>
              </div>
            </div>

            {selectedStartDate && selectedEndDate && (
              <div className="text-blue-600 font-medium">
                {Math.ceil((selectedEndDate.getTime() - selectedStartDate.getTime()) / (1000 * 60 * 60 * 24))} nights
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
