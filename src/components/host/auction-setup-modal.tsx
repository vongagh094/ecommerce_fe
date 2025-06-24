"use client"

import { useState } from "react"
import { X, Calendar, Clock, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface Property {
  id: number
  title: string
  location: string
}

interface AuctionSetupModalProps {
  isOpen: boolean
  onClose: () => void
  property: Property | null
}

const timeOptions = [
  "12:00 AM",
  "12:30 AM",
  "1:00 AM",
  "1:30 AM",
  "2:00 AM",
  "2:30 AM",
  "3:00 AM",
  "3:30 AM",
  "4:00 AM",
  "4:30 AM",
  "5:00 AM",
  "5:30 AM",
  "6:00 AM",
  "6:30 AM",
  "7:00 AM",
  "7:30 AM",
  "8:00 AM",
  "8:30 AM",
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
  "5:30 PM",
  "6:00 PM",
  "6:30 PM",
  "7:00 PM",
  "7:30 PM",
  "8:00 PM",
  "8:30 PM",
  "9:00 PM",
  "9:30 PM",
  "10:00 PM",
  "10:30 PM",
  "11:00 PM",
  "11:30 PM",
]

const durationOptions = [
  { value: "1", label: "1 hour" },
  { value: "2", label: "2 hours" },
  { value: "3", label: "3 hours" },
  { value: "6", label: "6 hours" },
  { value: "12", label: "12 hours" },
  { value: "24", label: "24 hours" },
  { value: "48", label: "48 hours" },
  { value: "72", label: "72 hours" },
]

export function AuctionSetupModal({ isOpen, onClose, property }: AuctionSetupModalProps) {
  const [auctionData, setAuctionData] = useState({
    auctionDate: "",
    auctionStartTime: "6:00 PM",
    auctionDuration: "24",
    checkInDate: "",
    checkOutDate: "",
    startingBid: "",
    reservePrice: "",
  })

  const [showTimeDropdown, setShowTimeDropdown] = useState(false)
  const [showDurationDropdown, setShowDurationDropdown] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setAuctionData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    console.log("Setting up auction:", auctionData)
    // Handle auction setup logic here
    onClose()
  }

  const formatCurrency = (value: string) => {
    const number = value.replace(/[^\d]/g, "")
    return number ? `₫ ${Number.parseInt(number).toLocaleString()}` : ""
  }

  const handleCurrencyChange = (field: string, value: string) => {
    const number = value.replace(/[^\d]/g, "")
    setAuctionData((prev) => ({ ...prev, [field]: number }))
  }

  if (!property) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Setup Auction</h2>
              <p className="text-gray-600 mt-1">
                {property.title} - {property.location}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="p-0 h-auto">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-8">
            {/* Auction Timing Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Auction Timing</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Auction Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Auction Date</label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={auctionData.auctionDate}
                      onChange={(e) => handleInputChange("auctionDate", e.target.value)}
                      className="h-12 pr-10"
                      min={new Date().toISOString().split("T")[0]}
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* Auction Start Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  <div className="relative">
                    <Button
                      variant="outline"
                      onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                      className="w-full h-12 justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{auctionData.auctionStartTime}</span>
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </Button>

                    {showTimeDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                        {timeOptions.map((time) => (
                          <button
                            key={time}
                            onClick={() => {
                              handleInputChange("auctionStartTime", time)
                              setShowTimeDropdown(false)
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Auction Duration */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Auction Duration</label>
                  <div className="relative">
                    <Button
                      variant="outline"
                      onClick={() => setShowDurationDropdown(!showDurationDropdown)}
                      className="w-full h-12 justify-between"
                    >
                      <span>{durationOptions.find((d) => d.value === auctionData.auctionDuration)?.label}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>

                    {showDurationDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                        {durationOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              handleInputChange("auctionDuration", option.value)
                              setShowDurationDropdown(false)
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Rental Period Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rental Period</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Check-in Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date</label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={auctionData.checkInDate}
                      onChange={(e) => handleInputChange("checkInDate", e.target.value)}
                      className="h-12 pr-10"
                      min={new Date().toISOString().split("T")[0]}
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* Check-out Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Date</label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={auctionData.checkOutDate}
                      onChange={(e) => handleInputChange("checkOutDate", e.target.value)}
                      className="h-12 pr-10"
                      min={auctionData.checkInDate || new Date().toISOString().split("T")[0]}
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Starting Bid */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Starting Bid (per night)</label>
                  <Input
                    type="text"
                    value={formatCurrency(auctionData.startingBid)}
                    onChange={(e) => handleCurrencyChange("startingBid", e.target.value)}
                    placeholder="₫ 0"
                    className="h-12"
                  />
                </div>

                {/* Reserve Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reserve Price (per night)</label>
                  <Input
                    type="text"
                    value={formatCurrency(auctionData.reservePrice)}
                    onChange={(e) => handleCurrencyChange("reservePrice", e.target.value)}
                    placeholder="₫ 0"
                    className="h-12"
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum price you'll accept</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button variant="outline" onClick={onClose} className="px-6">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-cyan-400 hover:bg-cyan-500 text-white px-8"
                disabled={
                  !auctionData.auctionDate ||
                  !auctionData.checkInDate ||
                  !auctionData.checkOutDate ||
                  !auctionData.startingBid
                }
              >
                Create Auction
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
