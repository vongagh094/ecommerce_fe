"use client"

import { Star, Share2, Heart } from "lucide-react"

interface PropertyHeaderProps {
	title: string
	rating: string
	reviewCount: number
	location: string
	isSuperhost?: boolean
}

export function PropertyHeader({ 
	title, 
	rating, 
	reviewCount, 
	location, 
	isSuperhost = false 
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

	const handleSave = () => {
		// TODO: Implement save to wishlist functionality
		console.log('Save property to wishlist')
	}

	const formattedRating = (() => {
		if (rating == null) return '—'
		const num = typeof rating === 'number' ? rating : parseFloat(String(rating))
		if (Number.isFinite(num)) return num.toFixed(2)
		const str = String(rating)
		return str.length > 4 ? str.slice(0, 4) : str
	})()

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
			<div className="flex flex-col space-y-4">
				{/* Title */}
				<h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
					{title}
				</h1>

				{/* Rating, Location, and Actions */}
				<div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
					<div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-6">
						{/* Rating */}
						<div className="flex items-center space-x-1">
							<Star className="h-4 w-4 fill-current text-gray-900" />
							<span className="font-medium text-gray-900">
								{formattedRating}
							</span>
							<span className="text-gray-600">({reviewCount})</span>
						</div>

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
						<button onClick={handleSave} className="text-gray-700 hover:text-gray-900 inline-flex items-center space-x-2">
							<Heart className="h-4 w-4" />
							<span>Save</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}