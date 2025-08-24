"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { PartialWinSelection } from "@/components/traveller/partial-win-selection"
import { ZaloPayPayment } from "@/components/payment/zalopay-payment"
import { auctionWinnerApi } from "@/lib/api/auction-winners"
import { AuctionDetails, BidDetails, AwardedNight } from "@/types/auction-winners"
import { BookingDetails } from "@/types/payment"
import { useAuth } from "@/contexts/auth-context"

export default async function PartialWinPage({ params }: { params: Promise<{ auctionId: string }> }) {
  const router = useRouter()
  const { auctionId } = await params
  const { user } = useAuth()
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  
  const [auctionDetails, setAuctionDetails] = useState<AuctionDetails | null>(null)
  const [bidDetails, setBidDetails] = useState<BidDetails | null>(null)
  const [property, setProperty] = useState<any>(null)
  const [awardedNights, setAwardedNights] = useState<AwardedNight[]>([])
  const [selectedNights, setSelectedNights] = useState<AwardedNight[]>([])

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
      
      if (!winningBid.isPartialWin) {
        // Redirect to full win page if this is a full win
        router.push(`/dashboard/winners/${auctionId}`)
        return
      }
      
      // Set the auction details
      setAuctionDetails({
        id: winningBid.auctionId,
        propertyId: winningBid.property.id,
        startDate: winningBid.checkIn,
        endDate: winningBid.checkOut,
        startingPrice: 0, // Default value since we don't have this info
        currentHighestBid: winningBid.bidAmount,
        status: "COMPLETED",
        objective: "HIGHEST_TOTAL" // Default value
      })
      
      // Set the bid details
      setBidDetails({
        id: winningBid.id,
        auctionId: winningBid.auctionId,
        userId: user?.id || 'unknown',
        checkIn: winningBid.checkIn,
        checkOut: winningBid.checkOut,
        pricePerNight: winningBid.bidAmount / winningBid.awardedNights.length,
        totalAmount: winningBid.bidAmount,
        allowPartial: false, // Default value
        status: 'ACTIVE' // Default value
      })
      
      // Set the property details
      setProperty(winningBid.property)
      
      // Set awarded nights
      setAwardedNights(winningBid.awardedNights)
      setSelectedNights(winningBid.awardedNights)
      
    } catch (error) {
      console.error("Failed to fetch auction details:", error)
      setError("Failed to load auction details. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectionChange = (nights: AwardedNight[]) => {
    setSelectedNights(nights)
  }

  const handleProceedToPayment = async (selectedNights: AwardedNight[]) => {
    try {
      // Accept the partial offer with selected nights
      await auctionWinnerApi.acceptPartialOffer(
        auctionId, 
        selectedNights.map(night => night.date)
      )
      
      setShowPayment(true)
    } catch (error) {
      console.error("Failed to accept partial offer:", error)
      setError("Failed to process your selection. Please try again.")
    }
  }

  const handleDeclineAll = async () => {
    try {
      await auctionWinnerApi.declinePartialOffer(auctionId)
      router.push("/dashboard/winners?declined=true")
    } catch (error) {
      console.error("Failed to decline partial offer:", error)
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
        <LoadingSpinner />
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

  if (!auctionDetails || !bidDetails || !property || awardedNights.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">No Data Available</h2>
          <p className="text-yellow-600 mb-4">
            We couldn't find the auction details or awarded nights. Please return to the winners dashboard.
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
    // Calculate total amount based on selected nights
    const totalAmount = selectedNights.reduce((sum, night) => sum + night.pricePerNight, 0)
    
    const bookingDetails: BookingDetails = {
      auctionId: auctionId,
      propertyId: property.id,
      propertyName: property.title,
      checkIn: selectedNights.length > 0 ? selectedNights[0].date : bidDetails.checkIn,
      checkOut: selectedNights.length > 0 ? 
        new Date(new Date(selectedNights[selectedNights.length - 1].date).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] : 
        bidDetails.checkOut,
      selectedNights: selectedNights.map(night => night.date),
      guestCount: property.max_guests,
      redirectParams: 'default' // Default redirect parameters
    }

    return (
      <div className="max-w-4xl mx-auto p-6">
        <ZaloPayPayment
          bookingDetails={bookingDetails}
          amount={totalAmount}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
          onPaymentCancel={handlePaymentCancel}
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <PartialWinSelection
        auction={auctionDetails}
        property={property}
        originalBid={bidDetails}
        awardedNights={awardedNights}
        onSelectionChange={handleSelectionChange}
        onProceedToPayment={handleProceedToPayment}
        onDeclineAll={handleDeclineAll}
        isLoading={isLoading}
      />
    </div>
  )
} 