"use client"
import { Button } from "@/components/ui/button"
import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Edit, X } from "lucide-react"
import type { PropertyDetails, Amenity } from "@/types/property"
import type { AmenityAPI } from "@/types/api"

interface AmenitiesSectionProps {
  property: PropertyDetails
  editingData: Partial<PropertyDetails>
  editingSections: Set<string>
  displayedAmenities: AmenityAPI[]
  amenitySearch: string
  hasMoreAmenities: boolean
  loadingAmenities: boolean
  onEdit: (section: string) => void
  onCancelEdit: (section: string) => void
  onUpdateEditingData: (field: string, value: any) => void
  getCurrentValue: (field: string) => any
  onAmenitySearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onToggleAmenity: (amenityId: string) => void
  onLoadMoreAmenities: () => void
  onClearAllAmenities: () => void
  onClearSearch: () => void
}

export function AmenitiesSection({
  property,
  editingData,
  editingSections,
  displayedAmenities,
  amenitySearch,
  hasMoreAmenities,
  loadingAmenities,
  onEdit,
  onCancelEdit,
  onUpdateEditingData,
  getCurrentValue,
  onAmenitySearchChange,
  onToggleAmenity,
  onLoadMoreAmenities,
  onClearAllAmenities,
  onClearSearch,
}: AmenitiesSectionProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-semibold">Tiện nghi</h2>
          <Button variant="ghost" size="sm" onClick={() => onEdit("amenities")}>
            <Edit className="h-4 w-4" />
          </Button>
        </div>

        {editingSections.has("amenities") ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Tìm kiếm tiện nghi..."
                value={amenitySearch}
                onChange={onAmenitySearchChange}
                className="border-blue-300 max-w-md"
              />
              {amenitySearch && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearSearch}
                  className="text-gray-600 border-gray-300 hover:bg-gray-50 bg-transparent"
                >
                  <X className="h-4 w-4 mr-2" />
                  Xóa tìm kiếm
                </Button>
              )}
              {((getCurrentValue("amenities") as Amenity[] | null) ?? []).length > 0 && (
                <Button
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50 bg-transparent"
                  onClick={onClearAllAmenities}
                >
                  Xóa tất cả
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
              {displayedAmenities.map((amenity) => (
                <button
                  key={amenity.id}
                  onClick={() => onToggleAmenity(amenity.id)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    (getCurrentValue("amenities") as Amenity[] | null)?.some((a) => a.id === amenity.id)
                      ? "border-blue-600 bg-blue-100"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-sm font-medium">{amenity.name}</div>
                  <div className="text-xs text-gray-500">{amenity.category}</div>
                </button>
              ))}
              {loadingAmenities && <div className="col-span-full text-center text-gray-500">Đang tải tiện nghi...</div>}
              {!loadingAmenities && displayedAmenities.length === 0 && (
                <div className="col-span-full text-center text-gray-500">Không tìm thấy tiện nghi</div>
              )}
            </div>

            {hasMoreAmenities && !amenitySearch && (
              <Button onClick={onLoadMoreAmenities} className="w-full mt-4 bg-blue-100 text-blue-800 hover:bg-blue-200">
                Tải thêm
              </Button>
            )}

            {((getCurrentValue("amenities") as Amenity[] | null) ?? []).length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800 mb-2">
                  Tiện nghi đã chọn ({(getCurrentValue("amenities") as Amenity[] | null)?.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {(getCurrentValue("amenities") as Amenity[]).map((amenity: Amenity) => (
                    <Badge
                      key={amenity.id}
                      className="bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200"
                      onClick={() => onToggleAmenity(amenity.id)}
                    >
                      {amenity.name} ×
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" size="sm" onClick={() => onCancelEdit("amenities")}>
                Hủy
              </Button>
            </div>
          </div>
        ) : property.amenities && property.amenities.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {property.amenities.map((amenity) => (
              <div key={amenity.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-sm">{amenity.name}</div>
                  <div className="text-xs text-gray-500">{amenity.category}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Chưa có tiện nghi nào được thêm</p>
            <Button variant="outline" onClick={() => onEdit("amenities")}>
              Thêm tiện nghi
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
