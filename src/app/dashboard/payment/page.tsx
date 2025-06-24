"use client"

import { useState } from "react"
import { ChevronDown, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function PaymentPage() {
  const [paymentData, setPaymentData] = useState({
    paymentMethod: "visa",
    nameOnCard: "Meet Patel",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    securityCode: "",
  })

  const [guests, setGuests] = useState(1)

  const handleInputChange = (field: string, value: string) => {
    setPaymentData((prev) => ({ ...prev, [field]: value }))
  }

  const handleContinue = () => {
    console.log("Processing payment:", paymentData)
    // Handle payment processing
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(" ")
    } else {
      return v
    }
  }

  const months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]

  const years = Array.from({ length: 20 }, (_, i) => (new Date().getFullYear() + i).toString())

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Confirm and pay</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Side - Payment Form */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Credit Card Details</h2>

          {/* Payment Method */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Choose Payment Method</label>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="visa"
                  name="paymentMethod"
                  value="visa"
                  checked={paymentData.paymentMethod === "visa"}
                  onChange={(e) => handleInputChange("paymentMethod", e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <label htmlFor="visa" className="flex items-center">
                  <div className="w-8 h-5 bg-blue-600 text-white text-xs font-bold flex items-center justify-center rounded">
                    VISA
                  </div>
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="mastercard"
                  name="paymentMethod"
                  value="mastercard"
                  checked={paymentData.paymentMethod === "mastercard"}
                  onChange={(e) => handleInputChange("paymentMethod", e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <label htmlFor="mastercard" className="flex items-center">
                  <div className="w-8 h-5 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded">
                    MC
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Name on Card */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Name on card</label>
            <Input
              value={paymentData.nameOnCard}
              onChange={(e) => handleInputChange("nameOnCard", e.target.value)}
              className="h-12 bg-gray-50 border-gray-200"
              placeholder="Meet Patel"
            />
          </div>

          {/* Card Number */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Card number</label>
            <Input
              value={formatCardNumber(paymentData.cardNumber)}
              onChange={(e) => handleInputChange("cardNumber", e.target.value)}
              className="h-12 bg-gray-50 border-gray-200"
              placeholder="0000 0000 0000 0000"
              maxLength={19}
            />
          </div>

          {/* Card Expiration */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Card expiration</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <select
                  value={paymentData.expiryMonth}
                  onChange={(e) => handleInputChange("expiryMonth", e.target.value)}
                  className="w-full h-12 px-3 bg-gray-50 border border-gray-200 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Month</option>
                  {months.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={paymentData.expiryYear}
                  onChange={(e) => handleInputChange("expiryYear", e.target.value)}
                  className="w-full h-12 px-3 bg-gray-50 border border-gray-200 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Year</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Security Code */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">Card Security Code</label>
            <div className="relative">
              <Input
                value={paymentData.securityCode}
                onChange={(e) => handleInputChange("securityCode", e.target.value)}
                className="h-12 bg-gray-50 border-gray-200 pr-10"
                placeholder="Code"
                maxLength={4}
              />
              <HelpCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Continue Button */}
          <Button
            onClick={handleContinue}
            className="w-full h-12 bg-black hover:bg-gray-800 text-white font-medium rounded-lg"
          >
            Continue
          </Button>
        </div>

        {/* Right Side - Booking Summary */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">2 nights at Adaaran Club Rannalhi</h2>

          {/* Check-in/Check-out */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">CHECK-IN</label>
              <div className="text-sm font-medium text-gray-900">23/06/2025</div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">CHECK-OUT</label>
              <div className="text-sm font-medium text-gray-900">25/6/2025</div>
            </div>
          </div>

          {/* Guests */}
          <div className="mb-8">
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">GUESTS</label>
            <div className="relative">
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full h-10 px-3 bg-white border border-gray-200 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
              >
                <option value={1}>1 GUEST</option>
                <option value={2}>2 GUESTS</option>
                <option value={3}>3 GUESTS</option>
                <option value={4}>4 GUESTS</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">₫ 600,000 × 2 nights</span>
              <span className="font-medium">₫ 1,200,000</span>
            </div>
          </div>

          {/* Total */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-lg font-semibold text-gray-900">₫ 1,200,000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
