"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Grid3X3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { PropertyImage } from "@/types"

interface PropertyGalleryProps {
  images: PropertyImage[]
}

export function PropertyGallery({ images }: PropertyGalleryProps) {
  const [showAllPhotos, setShowAllPhotos] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Sort images by display order and primary status
  const sortedImages = [...images].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1
    if (!a.is_primary && b.is_primary) return 1
    return a.display_order - b.display_order
  })

  const mainImage = sortedImages[0]
  const sideImages = sortedImages.slice(1, 5)

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % sortedImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + sortedImages.length) % sortedImages.length)
  }

  if (!images || images.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="aspect-[2/1] bg-gray-200 rounded-xl flex items-center justify-center">
          <p className="text-gray-500">No images available</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-4 gap-2 h-[400px] rounded-xl overflow-hidden">
          {/* Main Image */}
          <div className="col-span-2 relative">
            <Image
              src={mainImage.image_url}
              alt={mainImage.alt_text || "Property image"}
              fill
              className="object-cover hover:brightness-90 transition-all cursor-pointer"
              onClick={() => setShowAllPhotos(true)}
              sizes="50vw"
            />
          </div>

          {/* Side Images */}
          <div className="col-span-2 grid grid-cols-2 gap-2">
            {sideImages.map((image, index) => (
              <div key={image.id} className="relative">
                <Image
                  src={image.image_url}
                  alt={image.alt_text || `Property image ${index + 2}`}
                  fill
                  className="object-cover hover:brightness-90 transition-all cursor-pointer"
                  onClick={() => {
                    setCurrentImageIndex(index + 1)
                    setShowAllPhotos(true)
                  }}
                  sizes="25vw"
                />
                {/* Show all photos button on last image */}
                {index === sideImages.length - 1 && sortedImages.length > 5 && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowAllPhotos(true)
                      }}
                      className="bg-white text-gray-900 hover:bg-gray-100"
                    >
                      <Grid3X3 className="h-4 w-4 mr-2" />
                      Show all photos
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Show all photos button for mobile */}
        <div className="mt-4 md:hidden">
          <Button
            variant="outline"
            onClick={() => setShowAllPhotos(true)}
            className="w-full"
          >
            <Grid3X3 className="h-4 w-4 mr-2" />
            Show all {sortedImages.length} photos
          </Button>
        </div>
      </div>

      {/* Photo Gallery Modal */}
      <Dialog open={showAllPhotos} onOpenChange={setShowAllPhotos}>
        <DialogContent className="max-w-6xl h-[90vh] p-0">
          <div className="relative h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">
                {currentImageIndex + 1} / {sortedImages.length}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllPhotos(false)}
              >
                Close
              </Button>
            </div>

            {/* Image Display */}
            <div className="flex-1 relative">
              <Image
                src={sortedImages[currentImageIndex].image_url}
                alt={sortedImages[currentImageIndex].alt_text || `Property image ${currentImageIndex + 1}`}
                fill
                className="object-contain"
                sizes="90vw"
              />

              {/* Navigation Buttons */}
              {sortedImages.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full"
                    onClick={prevImage}
                    disabled={currentImageIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full"
                    onClick={nextImage}
                    disabled={currentImageIndex === sortedImages.length - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            <div className="p-4 border-t">
              <div className="flex space-x-2 overflow-x-auto">
                {sortedImages.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 ${
                      index === currentImageIndex ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <Image
                      src={image.image_url}
                      alt={image.alt_text || `Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}