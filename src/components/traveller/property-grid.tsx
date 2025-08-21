"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Star, MapPin } from "lucide-react"
import { PropertyCard, PropertyDisplay } from "@/types"
import { formatPrice } from "@/lib/utils"
import { useAuth0 } from "@auth0/auth0-react"

interface PropertyGridProps {
  properties: PropertyCard[]
  loading: boolean
  onToggleFavorite?: (propertyId: string) => void
  className?: string
}


export function PropertyGrid({
  properties,
  loading,
  onToggleFavorite,
  className = ""
}: PropertyGridProps) {
  const [favoriteProperties, setFavoriteProperties] = useState<Set<string>>(new Set())
  const { user } = useAuth0();
  const userId = user?.sub;

  // const handleToggleFavorite = useCallback(
  //   async (property: PropertyDisplay, action: "add" | "remove") => {
  
  //     const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  //     const propertyId = property.id;
  //     try {
  //       console.log(`Checking wishlist for userId=${userId}`);
  //       const checkResponse = await fetch(`${apiUrl}/wishlist/check?user_id=${userId}`, {
  //         method: "GET",
  //         headers: { "Content-Type": "application/json" },
  //       });
  //       if (!checkResponse.ok) {
  //         const errorData = await checkResponse.json().catch(() => ({}));
  //         console.error("Wishlist check error:", errorData);
  //         throw new Error(errorData.detail?.detail || `Không thể kiểm tra wishlist: HTTP ${checkResponse.status}`);
  //       }
  //       const checkData = await checkResponse.json();
  //       if (!checkData.exists && action === "add") {
  //         console.log("Wishlist does not exist, creating one...");
  //         const createResponse = await fetch(`${apiUrl}/wishlist/create?user_id=${userId}`, {
  //           method: "POST",
  //           headers: { "Content-Type": "application/json" },
  //         });
  //         if (!createResponse.ok) {
  //           const errorData = await createResponse.json().catch(() => ({}));
  //           console.error("Wishlist creation error:", errorData);
  //           throw new Error(errorData.detail?.detail || `Không thể tạo wishlist: HTTP ${createResponse.status}`);
  //         }
  //         console.log("Wishlist created successfully");
  //       }

  //       const endpoint =
  //         action === "add"
  //           ? `${apiUrl}/wishlist/${userId}/add-property?property_id=${propertyId}`
  //           : `${apiUrl}/wishlist/${userId}/remove-property/${propertyId}`;
  //       const method = action === "add" ? "POST" : "DELETE";
  //       console.log(`Toggling favorite: propertyId=${propertyId}, action=${action}`);

  //       // Optimistic update
  //       if (action === "remove") {
  //         setProperties((prev: any) => prev.filter((p: any) => p.id !== propertyId));
  //       } else {
  //         setProperties((prev: any) =>
  //           prev.map((p: any) =>
  //             p.id === propertyId ? { ...p, isFavorite: true } : p
  //           )
  //         );
  //       }
  //       await onFavoriteToggle?.(propertyId, action === "add");
  //     } catch (error: any) {
  //       console.error(`handleToggleFavorite error: ${error.message}`);
  //       // Revert optimistic update
  //       if (action === "remove") {
  //         // Refetch will handle restoration if needed
  //       } else {
  //         setProperties((prev: any) =>
  //           prev.map((p: any) =>
  //             p.id === propertyId ? { ...p, isFavorite: false } : p
  //           )
  //         );
  //       }
  //       await onFavoriteToggle?.(propertyId, action !== "add");
  //       let description = error.message || `Không thể ${action === "add" ? "thêm" : "xóa"} bất động sản`;
  //       if (error.message.includes("Bất động sản đã có trong wishlist") || error.message.includes("đã tồn tại")) {
  //         description = "Bất động sản này đã có trong wishlist của bạn.";
  //       }
  //       setMessageModalContent?.({
  //         title: "Thông báo",
  //         description,
  //         isError: true,
  //       });
  //       setIsMessageModalOpen?.(true);
  //     }
  //   },
  //   [onFavoriteToggle, setMessageModalContent, setIsMessageModalOpen, userId]
  // );

  // Render property card
  const renderPropertyCard = useCallback((property: PropertyCard) => {
    const primaryImage = property.images.find(img => img.is_primary) || property.images[0]
    const isFavorite = favoriteProperties.has(property.id) || property.is_guest_favorite
    
    return (
      <div key={property.id} className="group cursor-pointer block">
        <Link href={`/property/${property.id}`} className="block h-full">
          <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
            <Image
              src={primaryImage?.image_url || '/placeholder.svg'}
              alt={primaryImage?.alt_text || property.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              loading="lazy"
            />
            
            {/* Favorite Button */}
            <button
              onClick={(e) => onToggleFavorite?.(property.id)}
              className="absolute top-3 right-3 p-2 hover:scale-110 transition-transform z-10"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart
                className={`h-5 w-5 ${
                  isFavorite 
                    ? 'fill-rose-500 text-rose-500' 
                    : 'fill-black/50 text-white stroke-white'
                }`}
              />
            </button>

            {/* Guest Favorite Badge */}
            {property.is_guest_favorite && (
              <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-full text-xs font-medium">
                Guest favorite
              </div>
            )}

            {/* Super Host Badge */}
            {property.host.is_super_host && (
              <div className="absolute bottom-3 left-3 bg-white px-2 py-1 rounded-full text-xs font-medium">
                Superhost
              </div>
            )}
          </div>

          <div className="space-y-1">
            {/* Location and Rating */}
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-3 w-3 mr-1" />
                <span className="truncate">
                  {property.location.city}, {property.location.state}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-current text-gray-900" />
                {typeof property.rating?.average === 'string' ? (
                  <span className="text-sm text-gray-900">
                    {property.rating.average.substring(0, 4)}
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">N/A</span>
                )}
              </div>
            </div>

            {/* Property Title */}
            <h3 className="font-medium text-gray-900 truncate" title={property.title}>
              {property.title}
            </h3>

            {/* Property Type and Guests */}
            <p className="text-sm text-gray-600">
              {property.property_type} • {property.max_guests} guests
            </p>

            {/* Price */}
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">
                {formatPrice(property.base_price)}
              </span>
              {' '}per night
            </p>
          </div>
        </Link>
      </div>
    )
  }, [favoriteProperties, onToggleFavorite])

  // Loading skeleton
  if (loading) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-xl mb-3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {properties.map(renderPropertyCard)}
    </div>
  )
}