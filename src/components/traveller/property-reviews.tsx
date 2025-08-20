"use client"
import { Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button"
import { useLazyLoad } from "@/hooks/use-lazyloading"

interface ReviewItem {
    id: string
    user: {
        name: string
        avatar: string
        date: string
    }
    comment: string
    rating: number
}

interface Review {
    rating: number
    count: number
    breakdown: {
        cleanliness: number
        accuracy: number
        location: number
        checkin: number
        communication: number
        value: number
    }
}

interface PropertyReviewsProps {
    reviews: Review
    propertyId?: string
    reviewerId: number // ID người đánh giá
    revieweeId: number // ID người được đánh giá (host)
    bookingId?: string // ID booking (nếu có)
}

interface CreateReviewRequest {
    reviewer_id: number
    reviewee_id: number
    property_id: number
    booking_id?: string
    review_text: string
    rating: number
    review_type: string // Trường bắt buộc theo database schema
    created_at?: string // Thêm trường created_at nếu API yêu cầu
}

export function PropertyReviews({
                                    reviews,
                                    propertyId,
                                    reviewerId,
                                    revieweeId,
                                    bookingId
                                }: PropertyReviewsProps) {
    // State cho form đánh giá mới
    const [newRating, setNewRating] = useState<number>(0)
    const [newReviewText, setNewReviewText] = useState<string>("")
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [submitError, setSubmitError] = useState<string>("")
    const [submitSuccess, setSubmitSuccess] = useState<boolean>(false)

    // Create fetch function for reviews
    const fetchReviews = useCallback(async (limit: number, offset: number) => {
        const response = await fetch(`http://localhost:8000/reviews/get_reviews?limit=${limit}&offset=${offset}&property_id=${propertyId}`, {
            headers: {
                'accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch reviews');
        }

        return await response.json();
    }, [propertyId]);

    // Use the lazy load hook
    const {
        data: reviewData,
        loading,
        loadingMore,
        error,
        hasMore,
        total,
        loadMore,
        retry
    } = useLazyLoad<ReviewItem>(fetchReviews, {
        limit: 10,
        enabled: !!propertyId // Only fetch if propertyId is provided
    });

    // Function để submit review mới
    const submitReview = async () => {
        console.log("Submit review called with:", {
            newRating,
            newReviewText: newReviewText.trim(),
            propertyId,
            reviewerId,
            revieweeId,
            bookingId
        })

        if (!newRating || !newReviewText.trim()) {
            setSubmitError("Vui lòng nhập đầy đủ đánh giá và rating")
            return
        }

        if (!propertyId) {
            setSubmitError("Property ID không tồn tại")
            return
        }

        setIsSubmitting(true)
        setSubmitError("")
        setSubmitSuccess(false)

        try {
            const reviewData: CreateReviewRequest = {
                reviewer_id: reviewerId,
                reviewee_id: revieweeId,
                property_id: parseInt(propertyId),
                review_text: newReviewText.trim(),
                rating: newRating,
                review_type: "guest_to_host", // Loại đánh giá: guest đánh giá host
                created_at: new Date().toISOString().replace('T', ' ').replace('Z', '') // Format: YYYY-MM-DD HH:MM:SS
            }

            // Thêm booking_id nếu có
            if (bookingId) {
                reviewData.booking_id = bookingId
            }

            const response = await fetch("http://localhost:8000/reviews/create_review", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(reviewData)
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => null)
                console.error("API Error Response:", errorData)
                console.error("API Status:", response.status, response.statusText)

                // Xử lý error message từ API
                let apiErrorMessage = `HTTP error! status: ${response.status}`

                if (errorData) {
                    if (typeof errorData === 'string') {
                        apiErrorMessage = errorData
                    } else if (errorData.detail) {
                        if (Array.isArray(errorData.detail)) {
                            // FastAPI validation errors thường là array
                            apiErrorMessage = errorData.detail.map(err =>
                                `${err.loc?.join('.')}: ${err.msg}`
                            ).join(', ')
                        } else {
                            apiErrorMessage = errorData.detail
                        }
                    } else if (errorData.message) {
                        apiErrorMessage = errorData.message
                    } else {
                        apiErrorMessage = JSON.stringify(errorData)
                    }
                }

                throw new Error(apiErrorMessage)
            }

            const result = await response.json()

            // Reset form sau khi submit thành công
            setNewRating(0)
            setNewReviewText("")
            setSubmitSuccess(true)

            // Refresh danh sách reviews
            retry()

        } catch (error) {
            console.error("Error submitting review:", error)

            // Xử lý error message chi tiết hơn
            let errorMessage = "Có lỗi xảy ra khi gửi đánh giá"

            if (error instanceof Error) {
                errorMessage = error.message
            } else if (typeof error === 'string') {
                errorMessage = error
            } else if (error && typeof error === 'object') {
                // Nếu error là object, thử extract message
                errorMessage = error.message || error.detail || JSON.stringify(error)
            }

            setSubmitError(errorMessage)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="border-t pt-8">
            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Viết đánh giá của bạn</h3>

                {/* Rating Selection */}
                <div className="flex items-center mb-4">
                    <span className="mr-3 text-gray-700">Đánh giá của bạn:</span>
                    <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                className="focus:outline-none hover:scale-110 transition-transform"
                                onClick={() => setNewRating(star)}
                                type="button"
                            >
                                <Star
                                    className={`h-6 w-6 ${
                                        star <= newRating
                                            ? 'text-yellow-500 fill-current'
                                            : 'text-gray-300 hover:text-yellow-200'
                                    }`}
                                />
                            </button>
                        ))}
                    </div>
                    {newRating > 0 && (
                        <span className="ml-2 text-sm text-gray-600">({newRating}/5)</span>
                    )}
                </div>

                {/* Review Textarea */}
                <textarea
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="Chia sẻ trải nghiệm của bạn..."
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    disabled={isSubmitting}
                />

                {/* Error Message */}
                {submitError && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-800 text-sm">{submitError}</p>
                    </div>
                )}

                {/* Success Message */}
                {submitSuccess && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-green-800 text-sm">Đánh giá của bạn đã được gửi thành công!</p>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    className="mt-4 px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    onClick={submitReview}
                    disabled={isSubmitting || !newRating || !newReviewText.trim()}
                >
                    {isSubmitting ? (
                        <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Đang gửi...
                        </div>
                    ) : (
                        "Gửi đánh giá"
                    )}
                </button>
            </div>

            {/* Only show rating summary if reviews prop is provided */}
            {reviews && (
                <>
                    <div className="flex items-center space-x-2 mb-8">
                        <Star className="h-5 w-5 fill-current text-gray-900" />
                        <span className="text-xl font-semibold">
                            {reviews.rating} · {total > 0 ? total : reviews.count} đánh giá
                        </span>
                    </div>

                    {/* Review Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Độ sạch sẽ</span>
                                <div className="flex items-center space-x-2">
                                    <div className="w-24 h-1 bg-gray-200 rounded">
                                        <div
                                            className="h-full bg-gray-900 rounded"
                                            style={{ width: `${(reviews.breakdown.cleanliness / 5) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium">{reviews.breakdown.cleanliness}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Giao tiếp</span>
                                <div className="flex items-center space-x-2">
                                    <div className="w-24 h-1 bg-gray-200 rounded">
                                        <div
                                            className="h-full bg-gray-900 rounded"
                                            style={{ width: `${(reviews.breakdown.communication / 5) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium">{reviews.breakdown.communication}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Check-in</span>
                                <div className="flex items-center space-x-2">
                                    <div className="w-24 h-1 bg-gray-200 rounded">
                                        <div
                                            className="h-full bg-gray-900 rounded"
                                            style={{ width: `${(reviews.breakdown.checkin / 5) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium">{reviews.breakdown.checkin}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Độ chính xác</span>
                                <div className="flex items-center space-x-2">
                                    <div className="w-24 h-1 bg-gray-200 rounded">
                                        <div
                                            className="h-full bg-gray-900 rounded"
                                            style={{ width: `${(reviews.breakdown.accuracy / 5) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium">{reviews.breakdown.accuracy}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Vị trí</span>
                                <div className="flex items-center space-x-2">
                                    <div className="w-24 h-1 bg-gray-200 rounded">
                                        <div
                                            className="h-full bg-gray-900 rounded"
                                            style={{ width: `${(reviews.breakdown.location / 5) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium">{reviews.breakdown.location}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Giá trị</span>
                                <div className="flex items-center space-x-2">
                                    <div className="w-24 h-1 bg-gray-200 rounded">
                                        <div
                                            className="h-full bg-gray-900 rounded"
                                            style={{ width: `${(reviews.breakdown.value / 5) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium">{reviews.breakdown.value}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Show total from API if no reviews breakdown provided */}
            {!reviews && total > 0 && (
                <div className="flex items-center space-x-2 mb-8">
                    <Star className="h-5 w-5 fill-current text-gray-900" />
                    <span className="text-xl font-semibold">
                        {total} đánh giá
                    </span>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between">
                        <p className="text-red-800">Lỗi khi tải đánh giá: {error}</p>
                        <Button
                            onClick={retry}
                            variant="outline"
                            size="sm"
                            className="text-red-800 border-red-300 hover:bg-red-100"
                        >
                            Thử lại
                        </Button>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Đang tải đánh giá...</span>
                </div>
            )}

            {/* Individual Reviews */}
            {!loading && reviewData.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {reviewData.map((review) => (
                        <div key={review.id} className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={review.user.avatar || "/placeholder.svg"} alt={review.user.name} />
                                    <AvatarFallback>{review.user.name[0]?.toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">{review.user.name}</h4>
                                    <p className="text-sm text-gray-600">{review.user.date}</p>
                                </div>
                                <div className="flex items-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`h-4 w-4 ${
                                                star <= review.rating
                                                    ? 'text-yellow-500 fill-current'
                                                    : 'text-gray-300'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed font-sans" style={{
                                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", "Noto Sans CJK", "Arial Unicode MS", sans-serif'
                            }}>
                                {review.comment}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && reviewData.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-gray-600">Chưa có đánh giá nào.</p>
                </div>
            )}

            {/* Load More Button */}
            {!loading && !error && hasMore && reviewData.length > 0 && (
                <div className="mt-8 text-center">
                    <Button
                        onClick={loadMore}
                        variant="outline"
                        disabled={loadingMore}
                        className="min-w-[200px]"
                    >
                        {loadingMore ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                                Đang tải...
                            </>
                        ) : (
                            `Xem thêm đánh giá (${total - reviewData.length} còn lại)`
                        )}
                    </Button>
                </div>
            )}

            {/* Show total count when all loaded */}
            {!loading && !hasMore && reviewData.length > 0 && (
                <div className="mt-8 text-center">
                    <p className="text-gray-600">
                        Hiển thị tất cả {reviewData.length} trong số {total} đánh giá
                    </p>
                </div>
            )}
        </div>
    )
}