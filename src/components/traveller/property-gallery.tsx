"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Grid3X3, X, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { PropertyImage } from "@/types"

// Create a VisuallyHidden component for accessibility
const VisuallyHidden = ({ children }: { children: React.ReactNode }) => {
  return (
    <span 
      style={{
        border: 0,
        clip: 'rect(0 0 0 0)',
        height: '1px',
        margin: '-1px',
        overflow: 'hidden',
        padding: 0,
        position: 'absolute',
        width: '1px',
        whiteSpace: 'nowrap',
        wordWrap: 'normal'
      }}
    >
      {children}
    </span>
  )
}

interface PropertyGalleryProps {
  images: PropertyImage[]
  onFavoriteToggle?: () => void
  isFavorite?: boolean
}

interface ImageLoadState {
  [key: string]: 'loading' | 'loaded' | 'error'
}

export function PropertyGallery({ images, onFavoriteToggle, isFavorite = false }: PropertyGalleryProps) {
  const [showAllPhotos, setShowAllPhotos] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageLoadStates, setImageLoadStates] = useState<ImageLoadState>({})
  const [showControls, setShowControls] = useState(true)
  const galleryRef = useRef<HTMLDivElement>(null)
  const thumbnailScrollRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const modalContentRef = useRef<HTMLDivElement>(null)
  const [isGridView, setIsGridView] = useState(false)
  const [zoomScale, setZoomScale] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const lastTranslateRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  // Memoize sorted images to prevent unnecessary re-renders
  const sortedImages = useMemo(() => {
    return [...images].sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1
      if (!a.is_primary && b.is_primary) return 1
      return (a.display_order || 0) - (b.display_order || 0)
    })
  }, [images])

  const totalImages = sortedImages.length

  // Reset current image index when modal opens
  useEffect(() => {
    if (showAllPhotos) {
      // Keep the current index if it's valid
      if (currentImageIndex >= totalImages) {
        setCurrentImageIndex(0)
      }
    }
  }, [showAllPhotos, totalImages, currentImageIndex])

  // Reset zoom/pan when image or view changes
  useEffect(() => {
    setZoomScale(1)
    setTranslate({ x: 0, y: 0 })
    setIsPanning(false)
    lastTranslateRef.current = { x: 0, y: 0 }
  }, [currentImageIndex, isGridView, showAllPhotos])

  // Image loading state handlers
  const updateImageLoadState = useCallback((imageId: string, state: 'loading' | 'loaded' | 'error') => {
    setImageLoadStates(prev => ({
      ...prev,
      [imageId]: state
    }))
  }, [])

  const getImageLoadState = (imageId: string) => imageLoadStates[imageId] || 'loading'

  // Navigation functions
  const navigateToImage = useCallback((newIndex: number) => {
    if (newIndex < 0) {
      setCurrentImageIndex(totalImages - 1) // Wrap around to the last image
    } else if (newIndex >= totalImages) {
      setCurrentImageIndex(0) // Wrap around to the first image
    } else {
      setCurrentImageIndex(newIndex)
    }
    
    // Show controls when navigating
    setShowControls(true)
    
    // Reset the auto-hide timer
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false)
    }, 3000)
  }, [totalImages])

  const nextImage = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    navigateToImage(currentImageIndex + 1)
  }, [currentImageIndex, navigateToImage])

  const prevImage = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    navigateToImage(currentImageIndex - 1)
  }, [currentImageIndex, navigateToImage])

  // Zoom and pan handlers
  const toggleZoom = useCallback(() => {
    setZoomScale(prev => {
      const next = prev === 1 ? 2.5 : 1
      if (next === 1) {
        setTranslate({ x: 0, y: 0 })
        lastTranslateRef.current = { x: 0, y: 0 }
      }
      return next
    })
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!showAllPhotos) return
    e.preventDefault()
    const delta = -e.deltaY
    const factor = delta > 0 ? 0.1 : -0.1
    setZoomScale(prev => {
      const next = Math.min(3, Math.max(1, prev + factor))
      if (next === 1) {
        setTranslate({ x: 0, y: 0 })
        lastTranslateRef.current = { x: 0, y: 0 }
      }
      return next
    })
  }, [showAllPhotos])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoomScale === 1) return
    setIsPanning(true)
    panStartRef.current = { x: e.clientX, y: e.clientY }
  }, [zoomScale])

  const handleMouseMovePan = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return
    const deltaX = e.clientX - panStartRef.current.x
    const deltaY = e.clientY - panStartRef.current.y
    const next = { x: lastTranslateRef.current.x + deltaX, y: lastTranslateRef.current.y + deltaY }
    setTranslate(next)
  }, [isPanning])

  const endPan = useCallback(() => {
    if (!isPanning) return
    lastTranslateRef.current = translate
    setIsPanning(false)
  }, [isPanning, translate])

  const handleTouchStartPan = useCallback((e: React.TouchEvent) => {
    if (zoomScale === 1) return
    setIsPanning(true)
    panStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }, [zoomScale])

  const handleTouchMovePan = useCallback((e: React.TouchEvent) => {
    if (!isPanning) return
    const deltaX = e.touches[0].clientX - panStartRef.current.x
    const deltaY = e.touches[0].clientY - panStartRef.current.y
    const next = { x: lastTranslateRef.current.x + deltaX, y: lastTranslateRef.current.y + deltaY }
    setTranslate(next)
  }, [isPanning])

  const handleTouchEndPan = useCallback(() => {
    if (!isPanning) return
    lastTranslateRef.current = translate
    setIsPanning(false)
  }, [isPanning, translate])

  // Scroll to current thumbnail
  const scrollToThumbnail = useCallback((index: number) => {
    if (!thumbnailScrollRef.current) return
    
    const thumbnailContainer = thumbnailScrollRef.current
    const thumbnail = thumbnailContainer.children[index] as HTMLElement
    
    if (!thumbnail) return

    // Use a small timeout to ensure the DOM is ready
    setTimeout(() => {
      thumbnail.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      })
    }, 100)
  }, [])

  // Show/hide controls on hover/touch
  const handleMouseMove = useCallback(() => {
    setShowControls(true)
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false)
    }, 3000)
  }, [])

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
        case 'g':
        case 'G':
          event.preventDefault()
          setIsGridView(v => !v)
          break
        case '+':
          event.preventDefault()
          setZoomScale(prev => Math.min(3, prev + 0.1))
          break
        case '-':
          event.preventDefault()
          setZoomScale(prev => {
            const next = Math.max(1, prev - 0.1)
            if (next === 1) {
              setTranslate({ x: 0, y: 0 })
              lastTranslateRef.current = { x: 0, y: 0 }
            }
            return next
          })
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showAllPhotos, nextImage, prevImage])

  // Scroll to current thumbnail when index changes
  useEffect(() => {
    if (showAllPhotos) {
      scrollToThumbnail(currentImageIndex)
    }
  }, [currentImageIndex, showAllPhotos, scrollToThumbnail])

  // Add touch swipe support for mobile
  useEffect(() => {
    if (!showAllPhotos || !modalContentRef.current) return
    
    let touchStartX = 0
    let touchEndX = 0
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX
    }
    
    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX
      handleSwipe()
    }
    
    const handleSwipe = () => {
      // Minimum swipe distance (px)
      const minSwipeDistance = 50
      
      if (touchStartX - touchEndX > minSwipeDistance) {
        // Swiped left, go to next image
        nextImage()
      } else if (touchEndX - touchStartX > minSwipeDistance) {
        // Swiped right, go to previous image
        prevImage()
      }
    }
    
    const element = modalContentRef.current
    
    element.addEventListener('touchstart', handleTouchStart)
    element.addEventListener('touchend', handleTouchEnd)
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [showAllPhotos, nextImage, prevImage, modalContentRef])

  // Show controls initially when modal opens
  useEffect(() => {
    if (showAllPhotos) {
      setShowControls(true)
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
      
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
  }, [showAllPhotos])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [])

  // Handle empty state
  if (!images || images.length === 0) {
    return (
      <div className="w-full rounded-xl overflow-hidden bg-gray-100 aspect-[3/2] flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Grid3X3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No images available</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Main Gallery Grid */}
      <div 
        ref={galleryRef}
        className="relative w-full rounded-xl overflow-hidden cursor-pointer"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* Desktop Gallery Layout */}
        <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-[480px]">
          {/* Main Large Image */}
          <div className="col-span-2 row-span-2 relative group overflow-hidden">
            <Image
              src={sortedImages[0]?.image_url || '/placeholder.svg'}
              alt={sortedImages[0]?.alt_text || "Main property image"}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              onClick={() => {
                setCurrentImageIndex(0)
                setShowAllPhotos(true)
              }}
              onLoadStart={() => updateImageLoadState(`main-${sortedImages[0]?.id}`, 'loading')}
              onLoad={() => updateImageLoadState(`main-${sortedImages[0]?.id}`, 'loaded')}
              onError={() => updateImageLoadState(`main-${sortedImages[0]?.id}`, 'error')}
            />
            {getImageLoadState(`main-${sortedImages[0]?.id}`) === 'loading' && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
          </div>

          {/* Grid of 4 Smaller Images */}
          {sortedImages.slice(1, 5).map((image, index) => (
            <div 
              key={image.id} 
              className="relative group overflow-hidden"
              onClick={() => {
                setCurrentImageIndex(index + 1)
                setShowAllPhotos(true)
              }}
            >
              <Image
                src={image.image_url}
                alt={image.alt_text || `Property image ${index + 2}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
                onLoadStart={() => updateImageLoadState(image.id, 'loading')}
                onLoad={() => updateImageLoadState(image.id, 'loaded')}
                onError={() => updateImageLoadState(image.id, 'error')}
              />
              {getImageLoadState(image.id) === 'loading' && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
              )}

            </div>
          ))}
        </div>

        {/* Mobile Gallery Layout - Single Image with Carousel */}
        <div className="md:hidden relative aspect-[4/3]">
          <Image
            src={sortedImages[currentImageIndex]?.image_url || '/placeholder.svg'}
            alt={sortedImages[currentImageIndex]?.alt_text || "Property image"}
            fill
            className="object-cover"
            sizes="100vw"
            priority
            onClick={() => setShowAllPhotos(true)}
            onLoadStart={() => updateImageLoadState(`mobile-${sortedImages[currentImageIndex]?.id}`, 'loading')}
            onLoad={() => updateImageLoadState(`mobile-${sortedImages[currentImageIndex]?.id}`, 'loaded')}
            onError={() => updateImageLoadState(`mobile-${sortedImages[currentImageIndex]?.id}`, 'error')}
          />
          {getImageLoadState(`mobile-${sortedImages[currentImageIndex]?.id}`) === 'loading' && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}

          {/* Mobile Image Counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-3 py-1.5 rounded-full text-xs font-medium">
            {currentImageIndex + 1} / {totalImages}
          </div>

          {/* Mobile Navigation Arrows */}
          {totalImages > 1 && (
            <>
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  prevImage()
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full shadow-md z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  nextImage()
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full shadow-md z-10"
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {/* Show All Photos Button */}
        <button
          onClick={() => setShowAllPhotos(true)}
          className={`absolute right-4 bottom-4 bg-white text-black px-3 py-1.5 rounded-lg text-sm font-medium shadow-md flex items-center transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0 md:opacity-0 md:group-hover:opacity-100'
          }`}
        >
          <Grid3X3 className="h-4 w-4 mr-2" />
          Show all photos
        </button>

        {/* Favorite Button */}
        {onFavoriteToggle && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onFavoriteToggle()
            }}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white shadow-md transition-transform hover:scale-110"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              className={`h-5 w-5 ${
                isFavorite ? 'fill-rose-500 text-rose-500' : 'text-gray-700'
              }`}
            />
          </button>
        )}
      </div>

      {/* Full Screen Gallery Modal */}
      <Dialog open={showAllPhotos} onOpenChange={(open) => { setShowAllPhotos(open); if (!open) setIsGridView(false) }}>
        <DialogContent 
          aria-label="Property Image Gallery"
          className="max-w-[95vw] w-[95vw] h-[95vh] p-0 overflow-hidden bg-black" 
          onMouseMove={handleMouseMove}
          onClick={handleMouseMove}
        >
          <DialogTitle className="sr-only">Property Image Gallery</DialogTitle>
          <div 
            ref={modalContentRef}
            className="relative h-full flex flex-col"
          >
            {/* Top Gradient Overlay with Controls */}
            <div className={`pointer-events-none absolute top-0 left-0 right-0 z-50 transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}>
              <div className="bg-gradient-to-b from-black/80 to-transparent p-4 flex items-center justify-between">
                <button
                  onClick={() => setShowAllPhotos(false)}
                  className="pointer-events-auto bg-white/10 hover:bg-white/20 text-white p-2 rounded-full"
                  aria-label="Close gallery"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="pointer-events-auto flex items-center gap-2">
                  <span className="bg-black/40 text-white px-3 py-1.5 rounded-full text-sm">
                    {currentImageIndex + 1} / {totalImages}
                  </span>
                  <button
                    onClick={() => setIsGridView(v => !v)}
                    className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-2"
                    aria-label={isGridView ? 'Switch to carousel view' : 'Switch to grid view'}
                  >
                    <Grid3X3 className="h-4 w-4" />
                    {isGridView ? 'Carousel' : 'Grid'}
                  </button>
                </div>
              </div>
            </div>

            {/* Main Image or Grid Display */}
            {isGridView ? (
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {sortedImages.map((image, index) => (
                    <button
                      key={`grid-${image.id}`}
                      onClick={() => { setIsGridView(false); navigateToImage(index) }}
                      className="relative aspect-[4/3] rounded-md overflow-hidden group"
                      aria-label={`Open image ${index + 1}`}
                    >
                      <Image
                        src={image.image_url}
                        alt={image.alt_text || `Grid image ${index + 1}`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, 20vw"
                      />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div 
                className="flex-1 flex items-center justify-center select-none"
                onDoubleClick={(e) => { e.preventDefault(); toggleZoom() }}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMovePan}
                onMouseUp={endPan}
                onMouseLeave={endPan}
                onTouchStart={handleTouchStartPan}
                onTouchMove={handleTouchMovePan}
                onTouchEnd={handleTouchEndPan}
              >
                {sortedImages.map((image, index) => {
                  const isActive = index === currentImageIndex
                  return (
                    <div 
                      key={`modal-${image.id}`}
                      className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                        isActive ? 'opacity-100 z-20' : 'opacity-0 z-10'
                      } ${zoomScale > 1 && isActive ? 'cursor-grab' : 'cursor-default'}`}
                      style={{ pointerEvents: isActive ? 'auto' : 'none' }}
                    >
                      <Image
                        src={image.image_url}
                        alt={image.alt_text || `Image ${index + 1}`}
                        fill
                        className="object-contain"
                        sizes="95vw"
                        priority={isActive}
                        onLoadStart={() => updateImageLoadState(`modal-${image.id}`, 'loading')}
                        onLoad={() => updateImageLoadState(`modal-${image.id}`, 'loaded')}
                        onError={() => updateImageLoadState(`modal-${image.id}`, 'error')}
                        style={isActive ? {
                          transform: `translate3d(${translate.x}px, ${translate.y}px, 0) scale(${zoomScale})`,
                          transition: isPanning ? 'none' : 'transform 0.15s ease-out',
                          willChange: 'transform'
                        } : undefined}
                      />
                      
                      {getImageLoadState(`modal-${image.id}`) === 'loading' && isActive && (
                        <div className="absolute inset-0 flex items-center justify-center z-30">
                          <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Preload adjacent images */}
                {totalImages > 1 && (
                  <VisuallyHidden>
                    <Image src={sortedImages[(currentImageIndex - 1 + totalImages) % totalImages].image_url} alt="" width={1} height={1} priority />
                    <Image src={sortedImages[(currentImageIndex + 1) % totalImages].image_url} alt="" width={1} height={1} priority />
                  </VisuallyHidden>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            {totalImages > 1 && !isGridView && (
              <>
                <button
                  className={`absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full transition-opacity duration-300 z-40 ${
                    showControls ? 'opacity-100' : 'opacity-0'
                  }`}
                  onClick={prevImage}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  className={`absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full transition-opacity duration-300 z-40 ${
                    showControls ? 'opacity-100' : 'opacity-0'
                  }`}
                  onClick={nextImage}
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Thumbnail Strip */}
            {!isGridView && (
              <div className={`absolute bottom-0 left-0 right-0 transition-transform duration-300 z-40 ${
                showControls ? 'translate-y-0' : 'translate-y-full'
              }`}>
                <div className="bg-gradient-to-t from-black/80 to-transparent">
                  <div 
                    ref={thumbnailScrollRef}
                    className="flex space-x-2 p-4 overflow-x-auto"
                  >
                    {sortedImages.map((image, index) => (
                      <button
                        key={`thumb-${image.id}`}
                        onClick={() => navigateToImage(index)}
                        className={`relative flex-shrink-0 h-16 w-24 rounded-md overflow-hidden transition-all duration-200 ${
                          index === currentImageIndex
                            ? 'ring-2 ring-white scale-105'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                        aria-label={`View image ${index + 1}`}
                      >
                        <Image
                          src={image.image_url}
                          alt={image.alt_text || `Thumbnail ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="96px"
                          onError={(e) => {
                            // Fallback for thumbnail errors
                            (e.target as HTMLImageElement).src = '/placeholder.svg'
                          }}
                        />
                      </button>
                    ))}
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