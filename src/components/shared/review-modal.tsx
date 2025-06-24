"use client"

import type React from "react"

import { useState } from "react"
import { Star, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  propertyName: string
}

export function ReviewModal({ isOpen, onClose, propertyName }: ReviewModalProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [reviewText, setReviewText] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  const handleStarClick = (starIndex: number) => {
    setRating(starIndex)
  }

  const handleStarHover = (starIndex: number) => {
    setHoveredRating(starIndex)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedFiles((prev) => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmitReview = () => {
    console.log("Submitting review:", {
      rating,
      reviewText,
      uploadedFiles,
      propertyName,
    })
    // Handle review submission
    onClose()
  }

  const displayRating = hoveredRating || rating

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold text-gray-900">Write your review</h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="p-0 h-auto">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Property Name */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{propertyName}</h3>
            <p className="text-gray-600">How was your stay? Share your experience with other travelers.</p>
          </div>

          {/* Star Rating */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-4">Rate your experience</label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((starIndex) => (
                <button
                  key={starIndex}
                  onClick={() => handleStarClick(starIndex)}
                  onMouseEnter={() => handleStarHover(starIndex)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none transition-colors"
                >
                  <Star
                    className={`h-8 w-8 ${
                      starIndex <= displayRating ? "text-yellow-400 fill-current" : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && <span className="ml-4 text-sm text-gray-600">{rating} out of 5 stars</span>}
            </div>
          </div>

          {/* Review Text */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">Write your review</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Tell others about your experience at this property. What did you like? What could be improved?"
              className="w-full h-32 p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={1000}
            />
            <div className="text-right text-xs text-gray-500 mt-1">{reviewText.length}/1000 characters</div>
          </div>

          {/* File Upload */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">Add photos (optional)</label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center space-y-2">
                <Upload className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-600">Click to upload photos or drag and drop</span>
                <span className="text-xs text-gray-500">PNG, JPG up to 10MB each</span>
              </label>
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-700">Uploaded files:</p>
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                    <span className="text-sm text-gray-700 truncate">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 p-1 h-auto"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={rating === 0 || reviewText.trim().length === 0}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6"
            >
              Submit Review
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
