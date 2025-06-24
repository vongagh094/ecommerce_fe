import { User, Award, MessageCircle } from "lucide-react"

interface PropertyDetailsProps {
  host: {
    name: string
    experience: string
    responseRate: string
    responseTime: string
  }
  details: {
    guests: number
    bedrooms: number
    beds: number
    bathrooms: number
  }
  description: string
}

export function PropertyDetails({ host, details, description }: PropertyDetailsProps) {
  return (
    <div className="space-y-8">
      {/* Host and Property Info */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Dome hosted by {host.name}</h2>
          <p className="text-gray-600 mt-1">
            {details.guests} guests · {details.bedrooms} bedroom · {details.beds} bed · {details.bathrooms} bathroom
          </p>
        </div>
        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
          <User className="h-6 w-6 text-gray-600" />
        </div>
      </div>

      {/* Host Features */}
      <div className="space-y-6">
        <div className="flex items-start space-x-4">
          <div className="w-6 h-6 flex items-center justify-center">
            <Award className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">One night to</h3>
            <p className="text-gray-600 text-sm">This is one of the few places in the area with a pool.</p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <div className="w-6 h-6 flex items-center justify-center">
            <MessageCircle className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Experienced host</h3>
            <p className="text-gray-600 text-sm">Dorothy has 270 reviews for other places.</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="border-t pt-8">
        <p className="text-gray-700 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
