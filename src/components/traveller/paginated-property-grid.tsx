"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Star, MapPin } from "lucide-react"
import { PropertyCard } from "@/types"
import { formatPrice } from "@/lib/utils"
import { Pagination } from "@/components/shared/pagination"
import { useWishlist } from "@/hooks/use-wishlist"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"

interface PaginatedPropertyGridProps {
    properties: PropertyCard[]
    loading: boolean
    error: string | null
    currentPage: number
    totalPages: number
    total: number
    hasNext: boolean
    hasPrev: boolean
    onPageChange: (page: number) => void
    onNext: () => void
    onPrev: () => void
    onToggleFavorite?: (propertyId: string) => void
    className?: string
}

export function PaginatedPropertyGrid({
    properties,
    loading,
    error,
    currentPage,
    totalPages,
    total,
    hasNext,
    hasPrev,
    onPageChange,
    onNext,
    onPrev,
    onToggleFavorite,
    className = ""
}: PaginatedPropertyGridProps) {
    const { user } = useAuth()
    const userId = user?.id || 1 // Fallback to 1 if auth not available
    const { getWishlistProperties, addToWishlist, removeFromWishlist, isLoading: wishlistLoading, error: wishlistError } = useWishlist(Number(userId), false)
    const [favoriteProperties, setFavoriteProperties] = useState<Set<string>>(new Set())
    const [wishlistInitialized, setWishlistInitialized] = useState(false)

    useEffect(() => {
        console.log('Properties IDs:', properties.map(p => ({ id: p.id, type: typeof p.id })));
        const fetchWishlist = async () => {
            try {
                console.log('Fetching wishlist for user:', userId)
                const propertyIds = await getWishlistProperties(Number(userId))
                console.log('Setting favoriteProperties:', propertyIds)
                setFavoriteProperties(new Set(propertyIds))
                console.log('favoriteProperties after set:', Array.from(new Set(propertyIds)))
                setWishlistInitialized(true)
            } catch (err) {
                console.error("Không thể lấy danh sách wishlist:", err)
                toast({
                    title: "Lỗi",
                    description: "Không thể tải danh sách yêu thích. Vui lòng thử lại.",
                    variant: "destructive",
                    duration: 3000,
                })
                setWishlistInitialized(true)
            }
        }
        fetchWishlist()
    }, [getWishlistProperties, userId, properties])

    const handleToggleFavorite = useCallback(
        async (propertyId: string, e: React.MouseEvent) => {
            e.preventDefault()
            e.stopPropagation()
            if (!propertyId) {
                console.error("ID bất động sản không hợp lệ:", propertyId)
                toast({
                    title: "Lỗi",
                    description: "ID bất động sản không hợp lệ",
                    variant: "destructive",
                    duration: 3000,
                })
                return
            }
            console.log(`Toggle favorite for propertyId: ${propertyId}, userId: ${userId}`)
            try {
                const propertyExists = properties.some(p => p.id === propertyId)
                if (!propertyExists) {
                    console.error(`Property ${propertyId} không tồn tại trong danh sách properties`)
                    toast({
                        title: "Lỗi",
                        description: `Bất động sản với ID ${propertyId} không tồn tại`,
                        variant: "destructive",
                        duration: 3000,
                    })
                    return
                }

                if (favoriteProperties.has(propertyId)) {
                    await removeFromWishlist(Number(userId), propertyId)
                    setFavoriteProperties(prev => {
                        const newSet = new Set(prev)
                        newSet.delete(propertyId)
                        return newSet
                    })
                    toast({
                        title: "Đã xóa",
                        description: "Bất động sản đã được xóa khỏi danh sách yêu thích",
                        duration: 2000,
                    })
                } else {
                    await addToWishlist(Number(userId), propertyId)
                    setFavoriteProperties(prev => {
                        const newSet = new Set(prev)
                        newSet.add(propertyId)
                        return newSet
                    })
                    toast({
                        title: "Đã thêm",
                        description: "Bất động sản đã được thêm vào danh sách yêu thích",
                        duration: 2000,
                    })
                }
                onToggleFavorite?.(propertyId)
            } catch (err: any) {
                console.error('Lỗi khi toggle wishlist:', err)
                toast({
                    title: "Lỗi",
                    description: wishlistError || "Không thể cập nhật wishlist",
                    variant: "destructive",
                    duration: 3000,
                })
                onToggleFavorite?.(propertyId)
            }
        },
        [favoriteProperties, addToWishlist, removeFromWishlist, onToggleFavorite, userId, properties, wishlistError]
    )

    const renderPropertyCard = useMemo(() => {
        return (property: PropertyCard) => {
            const primaryImage = property.images.find(img => img.is_primary) || property.images[0]
            const propertyId = String(property.id)
            console.log('Rendering property card with propertyId:', propertyId, 'is in favoriteProperties:', favoriteProperties.has(propertyId))
            const isFavorite = favoriteProperties.has(propertyId) || property.is_guest_favorite

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

                            <button
                                onClick={(e) => handleToggleFavorite(propertyId, e)}
                                className="absolute top-3 right-3 p-2 hover:scale-110 transition-transform z-10"
                                aria-label={isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
                            >
                                <Heart
                                    className={`h-5 w-5 ${isFavorite
                                            ? 'fill-rose-500 text-rose-500'
                                            : 'fill-black/50 text-white stroke-white'
                                        }`}
                                />
                            </button>

                            {property.is_guest_favorite && (
                                <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-full text-xs font-medium">
                                    Yêu thích của khách
                                </div>
                            )}

                            {property.host.is_super_host && (
                                <div className="absolute bottom-3 left-3 bg-white px-2 py-1 rounded-full text-xs font-medium">
                                    Superhost
                                </div>
                            )}
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center text-sm text-gray-600">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    <span className="truncate">
                                        {property.location.city}, {property.location.country}
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

                            <h3 className="font-medium text-gray-900 truncate" title={property.title}>
                                {property.title}
                            </h3>

                            <p className="text-sm text-gray-600">
                                {property.property_type} • {property.max_guests} khách
                            </p>

                            <p className="text-sm text-gray-600">
                                <span className="font-semibold text-gray-900">
                                    {formatPrice(property.base_price)}
                                </span>
                                {' '}mỗi đêm
                            </p>
                        </div>
                    </Link>
                </div>
            )
        }
    }, [favoriteProperties, handleToggleFavorite])

    const renderLoadingSkeleton = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 20 }).map((_, index) => (
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

    if (error || wishlistError) {
        return (
            <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center ${className}`}>
                <div className="max-w-md mx-auto">
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                        Không thể tải danh sách bất động sản
                    </h3>
                    <p className="text-gray-600 mb-4">{error || wishlistError}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors"
                    >
                        Tải lại
                    </button>
                </div>
            </div>
        )
    }

    if (!wishlistInitialized || loading || wishlistLoading) {
        return (
            <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
                {renderLoadingSkeleton()}
            </div>
        )
    }

    if (properties.length === 0) {
        return (
            <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center ${className}`}>
                <div className="max-w-md mx-auto">
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                        Không tìm thấy bất động sản
                    </h3>
                    <p className="text-gray-600">
                        Hãy thử điều chỉnh tiêu chí tìm kiếm hoặc duyệt qua các danh mục khác.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
            <div className="mb-6">
                <p className="text-gray-600">
                    Hiển thị {((currentPage - 1) * 20) + 1} - {Math.min(currentPage * 20, total)} của {total} bất động sản
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {properties.map(property => renderPropertyCard(property))}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                hasNext={hasNext}
                hasPrev={hasPrev}
                loading={loading || wishlistLoading}
                onPageChange={onPageChange}
                onNext={onNext}
                onPrev={onPrev}
            />
        </div>
    )
}