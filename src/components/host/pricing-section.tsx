"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DollarSign, Edit } from "lucide-react"
import type { PropertyDetails } from "@/types/property"

interface PricingSectionProps {
  property: PropertyDetails
  editingData: Partial<PropertyDetails>
  editingSections: Set<string>
  onEdit: (section: string) => void
  onCancelEdit: (section: string) => void
  onUpdateEditingData: (field: string, value: any) => void
  getCurrentValue: (field: string) => any
}

export function PricingSection({
  property,
  editingData,
  editingSections,
  onEdit,
  onCancelEdit,
  onUpdateEditingData,
  getCurrentValue,
}: PricingSectionProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-semibold">Thông tin giá cả</h2>
          <Button variant="ghost" size="sm" onClick={() => onEdit("pricing")}>
            <Edit className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-2">
                <DollarSign className="h-5 w-5 text-gray-600 mr-2" />
                <span className="font-medium">Giá cơ bản</span>
              </div>
              {editingSections.has("pricing") ? (
                <Input
                  type="number"
                  value={getCurrentValue("basePrice") as number}
                  onChange={(e) => onUpdateEditingData("basePrice", Number.parseFloat(e.target.value) || 0)}
                  className="text-xl font-bold border-blue-300"
                  min="0"
                  step="0.01"
                />
              ) : (
                <div className="text-2xl font-bold text-gray-900">
                  ${getCurrentValue("basePrice") as number}
                  <span className="text-sm font-normal text-gray-600"> / đêm</span>
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-2">
                <span className="font-medium">Phí dọn dẹp</span>
              </div>
              {editingSections.has("pricing") ? (
                <Input
                  type="number"
                  value={getCurrentValue("cleaningFee") as number}
                  onChange={(e) => onUpdateEditingData("cleaningFee", Number.parseFloat(e.target.value) || 0)}
                  className="text-lg font-semibold border-blue-300"
                  min="0"
                  step="0.01"
                />
              ) : (
                <div className="text-xl font-semibold text-gray-900">${getCurrentValue("cleaningFee") as number}</div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium mb-3">Ví dụ đặt phòng (3 đêm)</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>${getCurrentValue("basePrice") as number} × 3 đêm</span>
                  <span>${(getCurrentValue("basePrice") as number) * 3}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí dọn dẹp</span>
                  <span>${getCurrentValue("cleaningFee") as number}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Tổng cộng</span>
                  <span>
                    ${(getCurrentValue("basePrice") as number) * 3 + (getCurrentValue("cleaningFee") as number)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {editingSections.has("pricing") && (
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" size="sm" onClick={() => onCancelEdit("pricing")}>
              Hủy
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
