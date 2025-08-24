import { User, Award, MessageCircle, Home, Users, Bed, Bath, MapPin, Key, Mountain, ArrowLeft } from "lucide-react"
import { PropertyHighlight } from "@/types"
import { getPropertyHighlight, type PropertyHighlightMapping } from "../../../property-highlights-mapping"

interface PropertyDetailsProps {
  propertyType: string
  maxGuests: number
  bedrooms: number
  bathrooms: number
  description: string
  highlights: PropertyHighlight[]
}

function getCategoryIcon(category: PropertyHighlightMapping['category']) {
  switch (category) {
    case 'amenity':
      return Bath
    case 'view':
      return Mountain
    case 'accommodation':
      return Home
    case 'location':
      return MapPin
    case 'host':
      return User
    case 'policy':
      return Key
    default:
      return Award
  }
}

export function PropertyDetails({
  propertyType,
  maxGuests,
  bedrooms,
  bathrooms,
  description,
  highlights
}: PropertyDetailsProps) {


  return (
    <div className="space-y-8">

      {/* Property Type and Capacity */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {propertyType} in a great location
          </h2>
          <div className="flex items-center space-x-4 text-gray-600 mt-2">
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{maxGuests} guests</span>
            </div>
            <div className="flex items-center space-x-1">
              <Bed className="h-4 w-4" />
              <span>{bedrooms} bedroom{bedrooms !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Bath className="h-4 w-4" />
              <span>{bathrooms} bathroom{bathrooms !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
          <Home className="h-6 w-6 text-gray-600" />
        </div>
      </div>


      {/* Default highlights if none provided */}
      {(!highlights || highlights.length === 0) && (
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="w-6 h-6 flex items-center justify-center">
              <Award className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Great location</h3>
              <p className="text-gray-600 text-sm">This property is in a prime location with easy access to local attractions.</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-6 h-6 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Great for groups</h3>
              <p className="text-gray-600 text-sm">Perfect space for families and friends to stay together.</p>
            </div>
          </div>
        </div>
      )}

      {/* Description */}
      <div className="border-t pt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">About this place</h3>
        <div className="prose prose-gray max-w-none">
          {description ? (
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {description}
            </p>
          ) : (
            <p className="text-gray-500 italic">
              No description available for this property.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
