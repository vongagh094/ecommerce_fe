"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Grid3X3, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { PropertyImage } from "@/types"

interface PropertyGalleryProps {
  images: PropertyImage[]
}

interface ImageLoadState {
  [key: string]: 'loading' | 'loaded' | 'error'
}

export function PropertyGallery({ images }: PropertyGalleryProps) {
  const [showAllPhotos, setShowAllPhotos] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageLoadStates, setImageLoadStates] = useState<ImageLoadState>({})
  const thumbnailScrollRef = useRef<HTMLDivElement>(null)

  // Sort images by display order and primary status
  const sortedImages = [...images].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1
    if (!a.is_primary && b.is_primary) return 1
    return (a.display_order || 0) - (b.display_order || 0)
  })

  const mainImage = sortedImages[0]
  const sideImages = sortedImages.slice(1, 5)
  const totalImages = sortedImages.length

  // Image loading state handlers
  const updateImageLoadState = useCallback((imageId: string, state: 'loading' | 'loaded' | 'error') => {
    setImageLoadStates(prev => ({
      ...prev,
      [imageId]: state
    }))
  }, [])

  const getImageLoadState = (imageId: string) => imageLoadStates[imageId] || 'loading'

  // Navigation functions
  const nextImage = useCallback(() => {
    if (totalImages <= 1) return
    const newIndex = (currentImageIndex + 1) % totalImages
    setCurrentImageIndex(newIndex)
  }, [currentImageIndex, totalImages])

  const prevImage = useCallback(() => {
    if (totalImages <= 1) return
    const newIndex = (currentImageIndex - 1 + totalImages) % totalImages
    setCurrentImageIndex(newIndex)
  }, [currentImageIndex, totalImages])

  const goToImage = useCallback((index: number) => {
    if (index >= 0 && index < totalImages) {
      setCurrentImageIndex(index)
    }
  }, [totalImages])

  // Scroll thumbnail into view with error handling
  const scrollToThumbnail = useCallback((index: number) => {
    if (!thumbnailScrollRef.current || index < 0 || index >= totalImages) return
    
    try {
      const thumbnail = thumbnailScrollRef.current.children[index] as HTMLElement
      if (thumbnail) {
        thumbnail.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        })
      }
    } catch (error) {
      console.warn('Error scrolling to thumbnail:', error)
    }
  }, [totalImages])

  // Scroll to current thumbnail when index changes
  useEffect(() => {
    if (showAllPhotos) {
      scrollToThumbnail(currentImageIndex)
    }
  }, [currentImageIndex, showAllPhotos, scrollToThumbnail])

  // Keyboard navigation
  useEffect(() => {
    if (!showAllPhotos) return

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          prevImage()
          break
        case 'ArrowRight':
          event.preventDefault()
          nextImage()
          break
        case 'Escape':
          event.preventDefault()
          setShowAllPhotos(false)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showAllPhotos, nextImage, prevImage])

  // Reset when modal opens
  useEffect(() => {
    if (showAllPhotos) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        scrollToThumbnail(currentImageIndex)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [showAllPhotos, currentImageIndex, scrollToThumbnail])

  // Handle empty state
  if (!images || images.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="aspect-[2/1] bg-gray-100 rounded-2xl flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Grid3X3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No images available</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Property Grid Preview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-4 gap-2 h-[400px] rounded-2xl overflow-hidden">
          {/* Main Image */}
          <div className="col-span-2 relative group">
            <Image
              src={mainImage.image_url}
              alt={mainImage.alt_text || "Property image"}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
              onClick={() => {
                setCurrentImageIndex(0)
                setShowAllPhotos(true)
              }}
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              onLoadStart={() => updateImageLoadState(mainImage.id, 'loading')}
              onLoad={() => updateImageLoadState(mainImage.id, 'loaded')}
              onError={() => updateImageLoadState(mainImage.id, 'error')}
            />
            {getImageLoadState(mainImage.id) === 'loading' && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              </div>
            )}
            {getImageLoadState(mainImage.id) === 'error' && (
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Grid3X3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Image unavailable</p>
                </div>
              </div>
            )}
          </div>

          {/* Side Images */}
          <div className="col-span-2 grid grid-cols-2 gap-2">
            {Array.from({ length: 4 }, (_, i) => {
              const image = sideImages[i]
              const imageIndex = i + 1
              const isLastSlot = i === 3
              const hasMoreImages = totalImages > 5

              if (!image) {
                return (
                  <div key={`empty-${i}`} className="relative bg-gray-100 rounded-lg" />
                )
              }

              return (
                <div key={image.id} className="relative group overflow-hidden rounded-lg">
                  <Image
                    src={image.image_url}
                    alt={image.alt_text || `Property image ${imageIndex + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                    onClick={() => {
                      setCurrentImageIndex(imageIndex)
                      setShowAllPhotos(true)
                    }}
                    sizes="(max-width: 768px) 50vw, 25vw"
                    onLoadStart={() => updateImageLoadState(image.id, 'loading')}
                    onLoad={() => updateImageLoadState(image.id, 'loaded')}
                    onError={() => updateImageLoadState(image.id, 'error')}
                  />
                  
                  {/* Loading state */}
                  {getImageLoadState(image.id) === 'loading' && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                    </div>
                  )}

                  {/* Error state */}
                  {getImageLoadState(image.id) === 'error' && (
                    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                      <Grid3X3 className="h-4 w-4 text-gray-400" />
                    </div>
                  )}

                  {/* Show all photos overlay on last image */}
                  {isLastSlot && hasMoreImages && getImageLoadState(image.id) !== 'error' && (
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowAllPhotos(true)
                        }}
                        className="bg-white text-gray-900 hover:bg-gray-100 font-medium"
                      >
                        <Grid3X3 className="h-4 w-4 mr-2" />
                        +{totalImages - 5} more
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Mobile show all button */}
        <div className="mt-4 lg:hidden">
          <Button
            variant="outline"
            onClick={() => setShowAllPhotos(true)}
            className="w-full"
          >
            <Grid3X3 className="h-4 w-4 mr-2" />
            Show all {totalImages} photos
          </Button>
        </div>
      </div>

      {/* Photo Gallery Modal */}
      <Dialog open={showAllPhotos} onOpenChange={setShowAllPhotos}>
        <DialogContent className="max-w-[95vw] w-[95vw] h-[95vh] p-0 overflow-hidden bg-white">
          <div className="relative h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
              <DialogTitle className="text-lg font-medium text-gray-900">
                {currentImageIndex + 1} / {totalImages}
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllPhotos(false)}
                className="rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Main Image Display */}
            <div className="flex-1 relative bg-gray-50 min-h-0 flex items-center justify-center p-4">
              {sortedImages[currentImageIndex] && (
                <>
                  {getImageLoadState(sortedImages[currentImageIndex].id) === 'loading' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                    </div>
                  )}

                  {getImageLoadState(sortedImages[currentImageIndex].id) === 'error' ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <Grid3X3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg mb-2">Image not available</p>
                        <p className="text-sm opacity-75 mb-4">
                          Failed to load image {currentImageIndex + 1}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            updateImageLoadState(sortedImages[currentImageIndex].id, 'loading')
                            // Force re-render
                            const img = new window.Image()
                            img.onload = () => updateImageLoadState(sortedImages[currentImageIndex].id, 'loaded')
                            img.onerror = () => updateImageLoadState(sortedImages[currentImageIndex].id, 'error')
                            img.src = sortedImages[currentImageIndex].image_url
                          }}
                        >
                          Try Again
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative max-w-full max-h-full w-full h-full">
                      <Image
                        key={`modal-${sortedImages[currentImageIndex].id}-${currentImageIndex}`}
                        src={sortedImages[currentImageIndex].image_url}
                        alt={sortedImages[currentImageIndex].alt_text || `Image ${currentImageIndex + 1}`}
                        fill
                        className="object-contain"
                        sizes="95vw"
                        priority={currentImageIndex < 3}
                        onLoadStart={() => updateImageLoadState(sortedImages[currentImageIndex].id, 'loading')}
                        onLoad={() => updateImageLoadState(sortedImages[currentImageIndex].id, 'loaded')}
                        onError={() => updateImageLoadState(sortedImages[currentImageIndex].id, 'error')}
                      />
                    </div>
                  )}
                </>
              )}

              {/* Navigation Buttons */}
              {totalImages > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="lg"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full bg-white/90 hover:bg-white shadow-lg border-0"
                    onClick={prevImage}
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full bg-white/90 hover:bg-white shadow-lg border-0"
                    onClick={nextImage}
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {totalImages > 1 && (
              <div className="flex-shrink-0 bg-white border-t border-gray-200">
                <div className="p-4">
                  <div
                    ref={thumbnailScrollRef}
                    className="flex space-x-2 overflow-x-auto pb-2"
                    style={{ 
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#cbd5e0 transparent'
                    }}
                  >
                    {sortedImages.map((image, index) => (
                      <button
                        key={`thumb-${image.id}`}
                        onClick={() => goToImage(index)}
                        className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-200 ${
                          index === currentImageIndex
                            ? 'ring-2 ring-gray-900 scale-110'
                            : 'hover:ring-1 hover:ring-gray-300 opacity-70 hover:opacity-100'
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                      >
                        <Image
                          src={image.image_url}
                          alt={image.alt_text || `Thumbnail ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="64px"
                          onError={() => updateImageLoadState(`thumb-${image.id}`, 'error')}
                        />
                        {getImageLoadState(`thumb-${image.id}`) === 'error' && (
                          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                            <Grid3X3 className="h-3 w-3 text-gray-400" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-center mt-3 text-xs text-gray-500 space-x-3">
                    <span>Use ← → to navigate</span>
                    <span>•</span>
                    <span>{totalImages} photos</span>
                    <span>•</span>
                    <span>Press ESC to close</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}