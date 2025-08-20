"use client"

import { Star, Shield, MessageCircle, Calendar } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { HostProfile as HostProfileType } from "@/types"

interface HostProfileProps {
  host: HostProfileType
}

export function HostProfile({ host }: HostProfileProps) {
  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    })
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const handleContactHost = () => {
    // TODO: Implement contact host functionality
    console.log('Contact host:', host.id)
  }

  return (
    <div className="border-t pt-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Meet your host</h3>

      <div className="bg-gray-50 rounded-2xl p-6">
        <div className="flex items-start space-x-6">
          {/* Host Avatar and Basic Info */}
          <div className="text-center">
            <Avatar className="h-20 w-20 mx-auto mb-3">
              <AvatarImage
                src={host.profile_image_url}
                alt={host.full_name}
              />
              <AvatarFallback className="text-sm">
                {getInitials(host.full_name)}
              </AvatarFallback>
            </Avatar>
            <h4 className="font-semibold text-lg text-gray-900 mb-1">
              {host.full_name}
            </h4>
            {host.is_super_host && (
              <div className="flex items-center justify-center space-x-1 text-sm text-gray-600">
                <Shield className="h-4 w-4" />
                <span>Superhost</span>
              </div>
            )}
          </div>

          {/* Host Stats */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
              {/* Reviews */}
              <div>
                <div className="flex items-center space-x-1 mb-1">
                  <Star className="h-4 w-4 fill-current text-gray-900" />
                  <span className="font-semibold text-gray-900">
                    {host.host_rating_average || 'New'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {host.host_review_count || 0} reviews
                </p>
              </div>

              {/* Response Rate */}
              <div>
                <p className="font-semibold text-sm text-gray-900 mb-1">100%</p>
                <p className="text-sm text-gray-600">Response rate</p>
              </div>

              {/* Response Time */}
              <div>
                <p className="font-semibold text-sm text-gray-900 mb-1">Within 1 hour</p>
                <p className="text-sm text-gray-600">Response time</p>
              </div>
            </div>

            {/* Join Date */}
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
              <Calendar className="h-4 w-4" />
              <span>Joined in {formatJoinDate(host.created_at)}</span>
            </div>

            {/* Contact Button */}
            <Button
              onClick={handleContactHost}
              className="bg-gray-900 text-white hover:bg-gray-800"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact host
            </Button>
          </div>
        </div>

        {/* Host Description */}
        {host.host_about && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-gray-700 leading-relaxed">
              {host.host_about}
            </p>
          </div>
        )}

        {/* Superhost Info */}
        {host.is_super_host && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-gray-600 mt-1" />
              <div>
                <h5 className="font-medium text-gray-900 mb-1">
                  {host.full_name} is a Superhost
                </h5>
                <p className="text-sm text-gray-600">
                  Superhosts are experienced, highly rated hosts who are committed to providing great stays for guests.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Host Protection Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            To protect your payment, never transfer money or communicate outside of the platform.
          </p>
        </div>
      </div>
    </div>
  )
}