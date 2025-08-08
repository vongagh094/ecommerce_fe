import { PropertyHeader } from "@/components/traveller/property-header"
import { PropertyGallery } from "@/components/traveller/property-gallery"
import { PropertyDetails } from "@/components/traveller/property-details"
import { BookingPanel } from "@/components/traveller/booking-panel"
import { PropertyAmenities } from "@/components/traveller/property-amenities"
import { PropertyReviews } from "@/components/traveller/property-reviews"
import { PropertyLocation } from "@/components/traveller/property-location"
import { HostProfile } from "@/components/traveller/host-profile"
import {CalenderBidingFeature} from "@/components/traveller/calender-biding-feature";

interface PropertyPageProps {
  params: {
    id: string
  }
}

export default function PropertyPage({ params }: PropertyPageProps) {
  // In a real app, you'd fetch property data based on params.id
  const property = {
    id: params.id,
    title: "Ponta Delgada",
    location: "Portugal",
    images: [
      "/placeholder.svg?height=600&width=800",
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
    ],
    host: {
        id: 3631,
      name: "Dorothy",
      experience: "3 years hosting",
      responseRate: "100%",
      responseTime: "within an hour",
    },
    details: {
      guests: 4,
      bedrooms: 2,
      beds: 1,
      bathrooms: 1,
    },
    description:
      "Adaaran Club Rannalhi is featured among the best Hotels in Maldives and sits exclusively at the tip of the South Male atoll within the exotic collection of islands known as the Maldives. Its unique location offers access to pristine beaches, excellent scuba diving opportunities and a relaxed environment with easy access to the capital city of Male.",
    amenities: ["WiFi", "TV", "Hot dryer", "Long-term stays allowed", "Pool", "Air conditioning", "Breakfast"],
    reviews: {
      rating: 5.0,
      count: 7,
      breakdown: {
        cleanliness: 5.0,
        accuracy: 5.0,
        location: 4.9,
        checkin: 5.0,
        communication: 5.0,
        value: 4.9,
      },
    },
    currentBid: 400000,
    lowestOffer: 2500000,
    timeLeft: "2 hours 30 mins 35 secs",
  }
    const booking = "10000002-1000-1000-1000-100000000002"
  return (
    <div className="min-h-screen bg-white">
      <PropertyHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{property.title}</h1>
              <p className="text-gray-600">{property.location}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <span className="text-sm font-medium">Report</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <span className="text-sm font-medium">Share</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <span className="text-sm font-medium">Save</span>
              </button>
            </div>
          </div>
        </div>

        <PropertyGallery images={property.images} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
          <div className="lg:col-span-2 space-y-12">
              <CalenderBidingFeature/>
              <PropertyDetails host={property.host} details={property.details} description={property.description} />
              <PropertyAmenities amenities={property.amenities} />
              <PropertyReviews reviews = {property.reviews}
                               propertyId={property.id}
                               reviewerId={1}
                               revieweeId={property.host.id}
                               bookingId = {booking}
              />
              <PropertyLocation />
            {/*<HostProfile />*/}
          </div>

          <div className="lg:col-span-1">
            <BookingPanel/>
          </div>
        </div>
      </div>
    </div>
  )
}
