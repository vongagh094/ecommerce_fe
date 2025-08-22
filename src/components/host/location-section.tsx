"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Edit } from "lucide-react"
import type { PropertyDetails } from "@/types/property"
import type { AddressData } from "@/types/address"
import AddressMap from "@/components/shared/map"

interface LocationSectionProps {
  property: PropertyDetails
  editingData: Partial<PropertyDetails>
  editingSections: Set<string>
  onEdit: (section: string) => void
  onCancelEdit: (section: string) => void
  onLocationSave: (data: AddressData) => void
  getCurrentValue: (field: string) => any
}

export function LocationSection({
  property,
  editingData,
  editingSections,
  onEdit,
  onCancelEdit,
  onLocationSave,
  getCurrentValue,
}: LocationSectionProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-semibold">Vị trí</h2>
          <Button variant="ghost" size="sm" onClick={() => onEdit("location")}>
            <Edit className="h-4 w-4" />
          </Button>
        </div>
        {editingSections.has("location") ? (
          <div className="space-y-4">
            <AddressMap
              addressData={{
                address: (getCurrentValue("address_line1") as string) || "",
                city: (getCurrentValue("city") as string) || "",
                state: (getCurrentValue("state") as string | null) || null,
                country: (getCurrentValue("country") as string) || "",
                postcode: (getCurrentValue("postal_code") as string | null) || null,
                latitude: (getCurrentValue("latitude") as number) || null,
                longitude: (getCurrentValue("longitude") as number) || null,
              }}
              onSave={onLocationSave}
            />
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" size="sm" onClick={() => onCancelEdit("location")}>
                Hủy
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Địa chỉ:</span>
              <span className="font-medium">{property.address_line1 || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Thành phố:</span>
              <span className="font-medium">{property.city}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tỉnh/Thành:</span>
              <span className="font-medium">{property.state || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Quốc gia:</span>
              <span className="font-medium">{property.country}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Mã bưu điện:</span>
              <span className="font-medium">{property.postal_code || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Vĩ độ:</span>
              <span className="font-medium">{property.latitude?.toFixed(6) || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Kinh độ:</span>
              <span className="font-medium">{property.longitude?.toFixed(6) || "N/A"}</span>
            </div>
            <div className="h-64 w-full mt-4">
              <AddressMap
                only_map
                addressData={{
                  address: property.address_line1 || "",
                  city: property.city || "",
                  state: property.state || null,
                  country: property.country,
                  postcode: property.postal_code || null,
                  latitude: property.latitude || null,
                  longitude: property.longitude || null,
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}