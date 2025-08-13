"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import { Clock, DollarSign, Target } from "lucide-react"
import { AuctionCalendar } from "./auction-calendar"

const apiUrl = "http://127.0.0.1:8000" // API URL

interface AuctionCreationModalProps {
  isOpen: boolean
  onClose: () => void
  property: any
}

export function AuctionCreationModal({ isOpen, onClose, property }: AuctionCreationModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectingDateType, setSelectingDateType] = useState<"start" | "end">("start")

  // Form state
  const [formData, setFormData] = useState({
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    minNights: 1,
    maxNights: undefined as number | undefined,
    startingPrice: property?.price || 100,
    bidIncrement: 5,
    minimumBid: property?.price || 100,
    auctionStartTime: "09:00",
    auctionEndTime: "18:00",
    objective: "HIGHEST_TOTAL" as "HIGHEST_TOTAL" | "HIGHEST_PER_NIGHT",
  })

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleDateSelect = (date: Date, type: "start" | "end") => {
    if (type === "start") {
      updateFormData("startDate", date)
      // If end date is before start date, clear it
      if (formData.endDate && formData.endDate <= date) {
        updateFormData("endDate", undefined)
      }
      setSelectingDateType("end")
    } else {
      // Only allow end date if start date is selected and end date is after start date
      if (formData.startDate && date > formData.startDate) {
        updateFormData("endDate", date)
      }
    }
  }

  const validateForm = (): boolean => {
    if (!formData.startDate || !formData.endDate) return false
    if (!formData.auctionStartTime || !formData.auctionEndTime) return false
    if (formData.startingPrice <= 0 || formData.minimumBid <= 0) return false
    if (formData.endDate <= formData.startDate) return false
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm() || !property) return

    setLoading(true)
    setError(null)

    try {
      const auctionData = {
        property_id: property.id,
        start_date: format(formData.startDate!, "yyyy-MM-dd"),
        end_date: format(formData.endDate!, "yyyy-MM-dd"),
        min_nights: formData.minNights,
        max_nights: formData.maxNights,
        starting_price: formData.startingPrice,
        bid_increment: formData.bidIncrement,
        minimum_bid: formData.minimumBid,
        auction_start_time: formData.auctionStartTime, // "09:00"
        auction_end_time: formData.auctionEndTime,
        objective: formData.objective,
      }

      const response = await fetch(`${apiUrl}/auctions/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(auctionData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `Failed to create auction: ${response.statusText}`)
      }

      onClose()
      resetForm()
    } catch (err: any) {
      setError(err.message || "Failed to create auction")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      startDate: undefined,
      endDate: undefined,
      minNights: 1,
      maxNights: undefined,
      startingPrice: property?.price || 100,
      bidIncrement: 5,
      minimumBid: property?.price || 100,
      auctionStartTime: "09:00",
      auctionEndTime: "18:00",
      objective: "HIGHEST_TOTAL",
    })
    setSelectingDateType("start")
  }

  if (!property) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold">Create Auction</DialogTitle>
          <p className="text-sm text-gray-600">
            Create an auction for <span className="font-medium">{property.title}</span>
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-1">
            {/* Left Column - Calendar */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Select Stay Period</h3>
                <div className="flex gap-2 mb-4">
                  <Button
                    variant={selectingDateType === "start" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectingDateType("start")}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Select Check-in
                  </Button>
                  <Button
                    variant={selectingDateType === "end" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectingDateType("end")}
                    disabled={!formData.startDate}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Select Check-out
                  </Button>
                </div>
              </div>

              <AuctionCalendar
                selectedStartDate={formData.startDate}
                selectedEndDate={formData.endDate}
                onDateSelect={handleDateSelect}
                selectingType={selectingDateType}
              />

              {/* Selected dates display */}
              {(formData.startDate || formData.endDate) && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">Selected Dates</h4>
                  <div className="text-sm space-y-1">
                    {formData.startDate && (
                      <p className="text-blue-800">
                        <span className="font-medium">Check-in:</span> {format(formData.startDate, "MMM dd, yyyy")}
                      </p>
                    )}
                    {formData.endDate && (
                      <p className="text-blue-800">
                        <span className="font-medium">Check-out:</span> {format(formData.endDate, "MMM dd, yyyy")}
                      </p>
                    )}
                    {formData.startDate && formData.endDate && (
                      <p className="text-blue-800 font-medium">
                        Duration:{" "}
                        {Math.ceil((formData.endDate.getTime() - formData.startDate.getTime()) / (1000 * 60 * 60 * 24))}{" "}
                        nights
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Form */}
            <div className="space-y-6">
              {/* Stay Constraints */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Stay Constraints</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Minimum Nights</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.minNights}
                      onChange={(e) => updateFormData("minNights", Number.parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Maximum Nights (Optional)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.maxNights || ""}
                      onChange={(e) =>
                        updateFormData("maxNights", e.target.value ? Number.parseInt(e.target.value) : undefined)
                      }
                      placeholder="No limit"
                    />
                  </div>
                </div>
              </div>

              {/* Auction Timing */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-green-600" />
                  Auction Timing
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Auction Start Time</Label>
                    <Input
                      type="time"
                      value={formData.auctionStartTime}
                      onChange={(e) => updateFormData("auctionStartTime", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Auction End Time</Label>
                    <Input
                      type="time"
                      value={formData.auctionEndTime}
                      onChange={(e) => updateFormData("auctionEndTime", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-yellow-600" />
                  Pricing
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Starting Price ($)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.startingPrice}
                      onChange={(e) => updateFormData("startingPrice", Number.parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Minimum Bid ($)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.minimumBid}
                      onChange={(e) => updateFormData("minimumBid", Number.parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Bid Increment ($)</Label>
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formData.bidIncrement}
                    onChange={(e) => updateFormData("bidIncrement", Number.parseFloat(e.target.value) || 1)}
                  />
                </div>
              </div>

              {/* Auction Objective */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center">
                  <Target className="h-5 w-5 mr-2 text-purple-600" />
                  Auction Objective
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="highest-total"
                      name="objective"
                      value="HIGHEST_TOTAL"
                      checked={formData.objective === "HIGHEST_TOTAL"}
                      onChange={(e) => updateFormData("objective", e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <label htmlFor="highest-total" className="text-sm font-medium">
                      Highest Total Amount
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 ml-6">
                    Winner is determined by the highest total bid amount for the entire stay
                  </p>

                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="highest-per-night"
                      name="objective"
                      value="HIGHEST_PER_NIGHT"
                      checked={formData.objective === "HIGHEST_PER_NIGHT"}
                      onChange={(e) => updateFormData("objective", e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <label htmlFor="highest-per-night" className="text-sm font-medium">
                      Highest Per Night Rate
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 ml-6">Winner is determined by the highest per-night rate bid</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg mx-6">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t mx-6 pb-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !validateForm()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Creating..." : "Create Auction"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}