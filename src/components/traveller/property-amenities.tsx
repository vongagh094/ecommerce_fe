import type React from "react"
import { Wifi, Tv, Wind, Clock, Waves, Snowflake, Coffee } from "lucide-react"

interface PropertyAmenitiesProps {
  amenities: string[]
}

const amenityIcons: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="h-5 w-5" />,
  TV: <Tv className="h-5 w-5" />,
  "Hot dryer": <Wind className="h-5 w-5" />,
  "Long-term stays allowed": <Clock className="h-5 w-5" />,
  Pool: <Waves className="h-5 w-5" />,
  "Air conditioning": <Snowflake className="h-5 w-5" />,
  Breakfast: <Coffee className="h-5 w-5" />,
}

export function PropertyAmenities({ amenities }: PropertyAmenitiesProps) {
  return (
    <div className="border-t pt-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">What this place offers</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {amenities.map((amenity, index) => (
          <div key={index} className="flex items-center space-x-4 py-2">
            <div className="text-gray-600">
              {amenityIcons[amenity] || <div className="w-5 h-5 bg-gray-300 rounded" />}
            </div>
            <span className="text-gray-900">{amenity}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
