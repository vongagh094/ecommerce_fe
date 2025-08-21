"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { FullWinConfirmation } from "@/components/traveller/full-win-confirmation"
import { ZaloPayPayment } from "@/components/payment/zalopay-payment"
import { auctionWinnerApi } from "@/lib/api/auction-winners"
import { AuctionDetails, BidDetails } from "@/types/auction-winners"
import { BookingDetails } from "@/types/payment"

export default function FullWinConfirmationPage({ params }: { params: { auctionId: string } }) {
  const router = useRouter()
  const { auctionId } = params
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  
  const [auctionDetails, setAuctionDetails] = useState<AuctionDetails | null>(null)
  const [bidDetails, setBidDetails] = useState<BidDetails | null>(null)
  const [property, setProperty] = useState<any>(null)
  const [paymentDeadline, setPaymentDeadline] = useState<string>("")

  useEffect(() => {
    fetchAuctionDetails()
  }, [auctionId])

  const fetchAuctionDetails = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Fetch the winning bid details for this auction
      const winningBid = await auctionWinnerApi.getWinningBidById(auctionId)
      
      if (!winningBid) {
        setError("Winning bid not found")
        setIsLoading(false)
        return
      }
      
      if (winningBid.isPartialWin) {
        // Redirect to partial win page if this is a partial win
        router.push(`/dashboard/winners/partial/${auctionId}`)
        return
      }
      
      // Set the auction details
      setAuctionDetails({
        id: winningBid.auctionId,
        propertyId: winningBid.property.id,
        startDate: winningBid.checkIn,
        endDate: winningBid.checkOut,
        status: "COMPLETED"
      })
      
      // Set the bid details
      setBidDetails({
        id: winningBid.bidId,
        auctionId: winningBid.auctionId,
        userId: winningBid.userId,
        checkIn: winningBid.checkIn,
        checkOut: winningBid.checkOut,
        pricePerNight: winningBid.bidAmount / winningBid.awardedNights.length,
        totalAmount: winningBid.bidAmount
      })
      
      // Set the property details
      setProperty(winningBid.property)
      
      // Set payment deadline
      setPaymentDeadline(winningBid.paymentDeadline)
      
    } catch (error) {
      console.error("Failed to fetch auction details:", error)
      setError("Failed to load auction details. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleProceedToPayment = async () => {
    setShowPayment(true)
  }

  const handleDecline = async () => {
    try {
      await auctionWinnerApi.declineWinningBid(auctionId)
      router.push("/dashboard/winners?declined=true")
    } catch (error) {
      console.error("Failed to decline winning bid:", error)
      setError("Failed to decline the offer. Please try again.")
    }
  }

  const handlePaymentSuccess = (transactionId: string) => {
    router.push(`/dashboard/payment/confirmation?transactionId=${transactionId}&auctionId=${auctionId}`)
  }

  const handlePaymentError = (error: any) => {
    console.error("Payment error:", error)
    setError("Payment processing failed. Please try again.")
    setShowPayment(false)
  }

  const handlePaymentCancel = () => {
    setShowPayment(false)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push("/dashboard/winners")}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
          >
            Back to Winners Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!auctionDetails || !bidDetails || !property) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">No Data Available</h2>
          <p className="text-yellow-600 mb-4">
            We couldn't find the auction details. Please return to the winners dashboard.
          </p>
          <button
            onClick={() => router.push("/dashboard/winners")}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
          >
            Back to Winners Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (showPayment) {
    const bookingDetails: BookingDetails = {
      auctionId: auctionId,
      propertyId: property.id,
      propertyName: property.title,
      checkIn: bidDetails.checkIn,
      checkOut: bidDetails.checkOut,
      selectedNights: Array.from({ length: bidDetails.totalAmount / bidDetails.pricePerNight }, (_, i) => 
        new Date(new Date(bidDetails.checkIn).getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      ),
      guestCount: property.max_guests
    }

    return (
      <div className="max-w-4xl mx-auto p-6">
        <ZaloPayPayment
          bookingDetails={bookingDetails}
          amount={bidDetails.totalAmount}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
          onPaymentCancel={handlePaymentCancel}
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <FullWinConfirmation
        auction={auctionDetails}
        property={property}
        bidDetails={bidDetails}
        paymentDeadline={paymentDeadline}
        onProceedToPayment={handleProceedToPayment}
        onDecline={handleDecline}
        isLoading={isLoading}
      />
    </div>
  )
} 