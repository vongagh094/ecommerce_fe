"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Users, Bed, Bath, Calendar, Edit } from "lucide-react"
import type { PropertyDetails } from "@/types/property"

interface PropertyDetailsSectionProps {
  property: PropertyDetails
  editingData: Partial<PropertyDetails>
  editingSections: Set<string>
  onEdit: (section: string) => void
  onCancelEdit: (section: string) => void
  onUpdateEditingData: (field: string, value: any) => void
  getCurrentValue: (field: string) => any
}

export function PropertyDetailsSection({
  property,
  editingData,
  editingSections,
  onEdit,
  onCancelEdit,
  onUpdateEditingData,
  getCurrentValue,
}: PropertyDetailsSectionProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold">Chi tiết bất động sản</h2>
            <Button variant="ghost" size="sm" onClick={() => onEdit("details")}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Users className="h-6 w-6 mx-auto mb-2 text-gray-600" />
              {editingSections.has("details") ? (
                <Input
                  type="number"
                  value={getCurrentValue("maxGuests") as number}
                  onChange={(e) => onUpdateEditingData("maxGuests", Number.parseInt(e.target.value) || 1)}
                  className="text-center h-8 mb-1 border-blue-300"
                  min="1"
                />
              ) : (
                <div className="font-semibold">{getCurrentValue("maxGuests") as number}</div>
              )}
              <div className="text-sm text-gray-600">Khách</div>
            </div>

            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Bed className="h-6 w-6 mx-auto mb-2 text-gray-600" />
              {editingSections.has("details") ? (
                <Input
                  type="number"
                  value={getCurrentValue("bedrooms") as number}
                  onChange={(e) => onUpdateEditingData("bedrooms", Number.parseInt(e.target.value) || 0)}
                  className="text-center h-8 mb-1 border-blue-300"
                  min="0"
                />
              ) : (
                <div className="font-semibold">{getCurrentValue("bedrooms") as number}</div>
              )}
              <div className="text-sm text-gray-600">Phòng ngủ</div>
            </div>

            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Bath className="h-6 w-6 mx-auto mb-2 text-gray-600" />
              {editingSections.has("details") ? (
                <Input
                  type="number"
                  value={getCurrentValue("bathrooms") as number}
                  onChange={(e) => onUpdateEditingData("bathrooms", Number.parseInt(e.target.value) || 0)}
                  className="text-center h-8 mb-1 border-blue-300"
                  min="0"
                />
              ) : (
                <div className="font-semibold">{getCurrentValue("bathrooms") as number}</div>
              )}
              <div className="text-sm text-gray-600">Phòng tắm</div>
            </div>

            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-gray-600" />
              {editingSections.has("details") ? (
                <Input
                  type="number"
                  value={getCurrentValue("minimumStay") as number}
                  onChange={(e) => onUpdateEditingData("minimumStay", Number.parseInt(e.target.value) || 1)}
                  className="text-center h-8 mb-1 border-blue-300"
                  min="1"
                />
              ) : (
                <div className="font-semibold">{getCurrentValue("minimumStay") as number}</div>
              )}
              <div className="text-sm text-gray-600">Số đêm tối thiểu</div>
            </div>
          </div>

          {editingSections.has("details") && (
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" size="sm" onClick={() => onCancelEdit("details")}>
                Hủy
              </Button>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Loại bất động sản:</span>
              <span className="font-medium">{property.propertyType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Danh mục:</span>
              <span className="font-medium">{property.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Chính sách hủy:</span>
              <span className="font-medium">{property.cancellationPolicy}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Đặt phòng nhanh:</span>
              <Badge variant={property.instantBook ? "default" : "secondary"}>
                {property.instantBook ? "Bật" : "Tắt"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold">Mô tả</h2>
            <Button variant="ghost" size="sm" onClick={() => onEdit("description")}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>

          {editingSections.has("description") ? (
            <div className="space-y-4">
              <Textarea
                value={getCurrentValue("description") as string}
                onChange={(e) => onUpdateEditingData("description", e.target.value)}
                rows={6}
                className="border-blue-300"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => onCancelEdit("description")}>
                  Hủy
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 leading-relaxed">
              {(getCurrentValue("description") as string) || "Chưa có mô tả."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
