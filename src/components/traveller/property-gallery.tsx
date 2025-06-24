"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface PropertyGalleryProps {
  images: string[]
}

export function PropertyGallery({ images }: PropertyGalleryProps) {
  const [showAllPhotos, setShowAllPhotos] = useState(false)
  const mainImage = images[0]
  const sideImages = images.slice(1, 5)

  return (
    <div className="relative">
      <div className="grid grid-cols-4 gap-2 h-96">
        {/* Main Image */}
        <div className="col-span-2 relative rounded-l-xl overflow-hidden">
          <Image
            src={mainImage || "/placeholder.svg"}
            alt="Property main view"
            fill
            className="object-cover hover:brightness-90 transition-all cursor-pointer"
            priority
          />
        </div>

        {/* Side Images */}
        <div className="col-span-2 grid grid-cols-2 gap-2">
          {sideImages.map((image, index) => (
            <div
              key={index}
              className={`relative overflow-hidden ${
                index === 1 ? "rounded-tr-xl" : ""
              } ${index === 3 ? "rounded-br-xl" : ""}`}
            >
              <Image
                src={image || "/placeholder.svg"}
                alt={`Property view ${index + 2}`}
                fill
                className="object-cover hover:brightness-90 transition-all cursor-pointer"
              />
              {index === 3 && (
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <Button
                    variant="secondary"
                    onClick={() => setShowAllPhotos(true)}
                    className="bg-white text-black hover:bg-gray-100"
                  >
                    Show all photos
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
