"use client"
import { useState, useRef } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Upload, ArrowUpDown, X, Star, Edit } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import type { PropertyImageAPI } from "@/types/api"
import type { PropertyDetails } from "@/types/property"

interface ImageGalleryProps {
  property: PropertyDetails
  editingData: Partial<PropertyDetails>
  editingSections: Set<string>
  newImages: File[]
  newIdImage: File | null
  deletedImageIds: string[]
  imageSelectionOrder: number[]
  isSelectingOrder: boolean
  newImagesPrimary: number | null
  newImagesDisplayOrder: number[]
  onEdit: (section: string) => void
  onCancelEdit: (section: string) => void
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onIdImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveNewImage: (index: number) => void
  onRemoveExistingImage: (index: number) => void
  onSetPrimary: (index: number) => void
  onSetPrimaryNewImage: (index: number) => void
  onImageSelection: (index: number, isNewImage?: boolean) => void
  onApplySelectionOrder: () => void
  onCancelSelectionOrder: () => void
  setIsSelectingOrder: (value: boolean) => void
  setError: (error: string | null) => void
}

export function ImageGallery({
  property,
  editingData,
  editingSections,
  newImages,
  newIdImage,
  deletedImageIds,
  imageSelectionOrder,
  isSelectingOrder,
  newImagesPrimary,
  newImagesDisplayOrder,
  onEdit,
  onCancelEdit,
  onImageUpload,
  onIdImageUpload,
  onRemoveNewImage,
  onRemoveExistingImage,
  onSetPrimary,
  onSetPrimaryNewImage,
  onImageSelection,
  onApplySelectionOrder,
  onCancelSelectionOrder,
  setIsSelectingOrder,
  setError,
}: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const imageUploadRef = useRef<HTMLInputElement>(null)
  const idImageUploadRef = useRef<HTMLInputElement>(null)

  return (
    <>
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Hình ảnh</h2>
            {editingSections.has("images") ? (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => imageUploadRef.current?.click()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm hình ảnh
                </Button>
                <Button variant="outline" size="sm" onClick={() => onCancelEdit("images")}>
                  Hủy
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => onEdit("images")}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>

          {property.status === "DRAFT" && editingSections.has("images") && (
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Ảnh nhận diện (Bắt buộc)</h3>
              <div
                onClick={() => idImageUploadRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
              >
                <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Nhấp để tải lên ảnh nhận diện</p>
                {newIdImage || (editingData.images || property.images)?.find((img) => img.display_order === 0) ? (
                  <Badge className="mt-2 bg-green-100 text-green-800">
                    ✓{" "}
                    {newIdImage?.name ||
                      (editingData.images || property.images)?.find((img) => img.display_order === 0)?.title}
                  </Badge>
                ) : null}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={onIdImageUpload}
                className="hidden"
                id="id-image-upload"
                ref={idImageUploadRef}
              />
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={onImageUpload}
            className="hidden"
            id="image-upload"
            ref={imageUploadRef}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {editingSections.has("images") && (
              <div className="col-span-full flex gap-2 mb-4">
                {!isSelectingOrder ? (
                  <Button
                    variant="outline"
                    onClick={() => setIsSelectingOrder(true)}
                    className="flex items-center gap-2"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                    Sắp xếp lại thứ tự ảnh
                  </Button>
                ) : (
                  <div className="flex gap-2 items-center">
                    <span className="text-sm text-gray-600">
                      Click ảnh theo thứ tự mong muốn ({imageSelectionOrder.length} đã chọn)
                    </span>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={onApplySelectionOrder}
                      disabled={imageSelectionOrder.length === 0}
                    >
                      Áp dụng
                    </Button>
                    <Button variant="outline" size="sm" onClick={onCancelSelectionOrder}>
                      Hủy
                    </Button>
                  </div>
                )}
              </div>
            )}

            {(() => {
              const currentImages = (editingData.images as PropertyImageAPI[] | null) || property?.images || []
              const identityImage = currentImages.find((img) => img.display_order === 0)
              const nonIdentityImages = currentImages.filter((img) => img.display_order !== 0)

              const allItemsToRender: Array<{
                type: "existing" | "new"
                index: number
                item: PropertyImageAPI | File
                displayOrder?: number
              }> = []

              // Thêm existing images với display_order
              nonIdentityImages.forEach((img, idx) => {
                allItemsToRender.push({
                  type: "existing",
                  index: idx,
                  item: img,
                  displayOrder: img.display_order,
                })
              })

              // Thêm new images với display_order từ newImagesDisplayOrder
              newImages.forEach((file, idx) => {
                allItemsToRender.push({
                  type: "new",
                  index: idx,
                  item: file,
                  displayOrder: newImagesDisplayOrder[idx] || nonIdentityImages.length + idx + 1,
                })
              })

              // Sắp xếp theo display_order
              allItemsToRender.sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999))

              return (
                <>
                  {/* Render identity image first */}
                  {identityImage && (
                    <div key={identityImage.id || "identity"} className="relative group">
                      <img
                        src={identityImage.image_url ?? "/placeholder.svg?height=200&width=300"}
                        alt={identityImage.alt_text || "Ảnh nhận diện"}
                        className="w-full h-44 object-cover rounded-lg"
                      />
                      <Badge className="absolute bottom-2 left-2 bg-purple-500 text-white">Nhận diện</Badge>
                    </div>
                  )}

                  {/* Render sorted items */}
                  {allItemsToRender.map((renderItem, renderIndex) => {
                    if (renderItem.type === "existing") {
                      const image = renderItem.item as PropertyImageAPI
                      const originalIndex = renderItem.index
                      const selectionNumber = imageSelectionOrder.indexOf(originalIndex) + 1

                      return (
                        <div key={`existing-${renderItem.index}`} className="relative group">
                          <img
                            src={image.image_url || "/placeholder.svg?height=200&width=300"}
                            alt={image.alt_text || "Property image"}
                            className={`w-full h-44 object-cover rounded-lg cursor-pointer transition-all ${
                              isSelectingOrder ? "hover:ring-4 hover:ring-blue-300" : ""
                            } ${selectionNumber > 0 ? "ring-4 ring-blue-500" : ""}`}
                            onClick={() => {
                              if (isSelectingOrder) {
                                onImageSelection(originalIndex)
                              } else {
                                setSelectedImage(image.image_url || "/placeholder.svg?height=200&width=300")
                              }
                            }}
                          />

                          {editingSections.has("images") && !isSelectingOrder && (
                            <button
                              onClick={() => {
                                const currentImages =
                                  (editingData.images as PropertyImageAPI[] | null) || property?.images || []
                                const actualIndex = currentImages.findIndex((img) => img === image)
                                onRemoveExistingImage(actualIndex)
                              }}
                              className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}

                          {image.is_primary && (
                            <Badge className="absolute bottom-2 left-2 bg-blue-500 text-white">Chính</Badge>
                          )}

                          {isSelectingOrder && selectionNumber > 0 && (
                            <div className="absolute top-2 left-2 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                              {selectionNumber}
                            </div>
                          )}

                          {editingSections.has("images") && !isSelectingOrder && (
                            <button
                              onClick={() => {
                                const currentImages =
                                  (editingData.images as PropertyImageAPI[] | null) || property?.images || []
                                const actualIndex = currentImages.findIndex((img) => img === image)
                                onSetPrimary(actualIndex)
                              }}
                              className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Đặt làm ảnh chính"
                            >
                              <Star className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      )
                    } else {
                      const file = renderItem.item as File
                      const newImageIndex = renderItem.index + 1000
                      const selectionNumber = imageSelectionOrder.indexOf(newImageIndex) + 1

                      return (
                        <div key={`new-${renderItem.index}`} className="relative group">
                          <img
                            src={URL.createObjectURL(file) || "/placeholder.svg"}
                            alt={file.name}
                            className={`w-full h-44 object-cover rounded-lg cursor-pointer transition-all ${
                              isSelectingOrder ? "hover:ring-4 hover:ring-blue-300" : ""
                            } ${selectionNumber > 0 ? "ring-4 ring-blue-500" : ""}`}
                            onClick={() => {
                              if (isSelectingOrder) {
                                onImageSelection(renderItem.index, true)
                              } else {
                                setSelectedImage(URL.createObjectURL(file))
                              }
                            }}
                          />

                          {editingSections.has("images") && !isSelectingOrder && (
                            <button
                              onClick={() => onRemoveNewImage(renderItem.index)}
                              className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}

                          {newImagesPrimary === renderItem.index && (
                            <Badge className="absolute bottom-2 left-2 bg-blue-500 text-white">Chính</Badge>
                          )}

                          {isSelectingOrder && selectionNumber > 0 && (
                            <div className="absolute top-2 left-2 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                              {selectionNumber}
                            </div>
                          )}

                          {editingSections.has("images") && !isSelectingOrder && (
                            <button
                              onClick={() => onSetPrimaryNewImage(renderItem.index)}
                              className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Đặt làm ảnh chính"
                            >
                              <Star className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      )
                    }
                  })}
                </>
              )
            })()}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <VisuallyHidden>
          <DialogTitle>Hình ảnh phóng to</DialogTitle>
        </VisuallyHidden>
        <DialogContent className="max-w-4xl p-0">
          <img
            src={selectedImage || "/placeholder.svg"}
            alt="Hình ảnh phóng to"
            className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
