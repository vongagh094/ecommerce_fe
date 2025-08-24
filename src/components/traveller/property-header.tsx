"use client"

import { Star, Share2, Heart, ArrowLeft } from "lucide-react"
import { useWinner } from "@/contexts/winner-context";
import { useEffect } from "react";

interface PropertyHeaderProps {
	title: string
	rating: string
	reviewCount: number
	location: string
	isSuperhost?: boolean
	isFavorite: boolean
	onFavoriteToggle: () => void
}

export function PropertyHeader({
	title,
	rating,
	reviewCount,
	location,
	isSuperhost = false,
	isFavorite,
	onFavoriteToggle
}: PropertyHeaderProps) {
	const handleShare = () => {
		if (navigator.share) {
			navigator.share({
				title: title,
				url: window.location.href,
			})
		} else {
			// Fallback: copy to clipboard
			navigator.clipboard.writeText(window.location.href)
			// You could show a toast notification here
		}
	}
	const { setPropertyName } = useWinner();
	useEffect(() => {
		setPropertyName(title);
	}, [title, setPropertyName])

	const formattedRating = (() => {
		if (rating == null) return '—'
		const num = typeof rating === 'number' ? rating : parseFloat(String(rating))
		if (Number.isFinite(num)) return num.toFixed(2)
		const str = String(rating)
		return str.length > 4 ? str.slice(0, 4) : str
	})()

	const handleBackClick = () => {
		if (typeof window !== 'undefined') {
			window.history.back()
		}
	}


	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
			<button
				onClick={handleBackClick}
				className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 mb-4"
			>
				<ArrowLeft className="h-5 w-5" />
				<span>Back</span>
			</button>
			<div className="flex flex-col space-y-4">
				{/* Title */}
				<h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
					{title}
				</h1>

				{/* Location */}
				<div className="text-gray-700">{location}</div>

				{/* Superhost */}
				{isSuperhost && (
					<span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 rounded-full">Superhost</span>
				)}
			</div>

			{/* Actions */}
			<div className="flex items-center space-x-4">
				<button onClick={handleShare} className="text-gray-700 hover:text-gray-900 inline-flex items-center space-x-2">
					<Share2 className="h-4 w-4" />
					<span>Share</span>
				</button>
				<button
					onClick={onFavoriteToggle}
					className="text-gray-700 hover:text-gray-900 inline-flex items-center space-x-2"
					aria-label={isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
				>
					<Heart
						className={`h-4 w-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`}
					/>
					<span>{isFavorite ? 'Saved' : 'Save'}</span>
				</button>
			</div>
		</div>
	)
}