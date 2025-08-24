import React from 'react';
import Link from 'next/link';
import { FormattedProperty } from '@/types/wren-ai';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, DollarSign } from 'lucide-react';

interface PropertyCardProps {
  property: FormattedProperty;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold line-clamp-2">
            {property.name}
          </CardTitle>
          {property.rating && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{property.rating}</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{property.location}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-green-600" />
          <span className="text-lg font-bold text-green-600">
            ${property.price}
          </span>
          <span className="text-sm text-gray-500">/ night</span>
        </div>
        
        {property.amenities && property.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {property.amenities.slice(0, 3).map((amenity, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {amenity}
              </Badge>
            ))}
            {property.amenities.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{property.amenities.length - 3} more
              </Badge>
            )}
          </div>
        )}
        
        <Link 
          href={property.link}
          className="inline-block w-full mt-4 px-4 py-2 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          View Details
        </Link>
      </CardContent>
    </Card>
  );
};