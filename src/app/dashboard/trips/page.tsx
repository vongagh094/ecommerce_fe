"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { ReviewModal } from "@/components/shared/review-modal"

const trips = [
  {
    id: 1,
    title: "2 nights in Adaaran Club Rannalhi, Maldives, Water Bungalows, Maldives",
    totalPrice: "1,000,000",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 2,
    title: "2 nights in Bordeaux Getaway",
    totalPrice: "2,000,000",
    image: "/placeholder.svg?height=200&width=300",
  },
]

export default function TripsPage() {
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState<string>("")

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Your trips</h1>
      </div>

      <div className="space-y-8">
        {trips.map((trip) => (
          <div key={trip.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                <Image
                  src={trip.image || "/placeholder.svg"}
                  alt={trip.title}
                  width={200}
                  height={150}
                  className="rounded-xl object-cover"
                />
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{trip.title}</h3>
                <p className="text-gray-600 mb-6">Total price: {trip.totalPrice}</p>

                <Button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
                  onClick={() => {
                    setSelectedTrip(trip.title)
                    setReviewModalOpen(true)
                  }}
                >
                  Write your review now!
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <ReviewModal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} propertyName={selectedTrip} />
    </div>
  )
}
