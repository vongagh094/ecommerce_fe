"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Edit, Trash2, Eye, EyeOff, Save, X, MapPin } from "lucide-react"
import Link from "next/link"
import type { PropertyDetails } from "@/types/property"

interface PropertyHeaderProps {
  property: PropertyDetails
  editingData: Partial<PropertyDetails>
  editingSections: Set<string>
  hasChanges: boolean
  saving: boolean
  onEdit: (section: string) => void
  onCancelEdit: (section: string) => void
  onUpdateEditingData: (field: string, value: any) => void
  onSaveAll: () => void
  onStatusToggle: () => void
  onDelete: () => void
  getCurrentValue: (field: string) => any
}

export function PropertyHeader({
  property,
  editingData,
  editingSections,
  hasChanges,
  saving,
  onEdit,
  onCancelEdit,
  onUpdateEditingData,
  onSaveAll,
  onStatusToggle,
  onDelete,
  getCurrentValue,
}: PropertyHeaderProps) {
  const getStatusBadge = (status: string) => {
    const variants = {
      ACTIVE: "bg-green-100 text-green-800",
      DRAFT: "bg-gray-100 text-gray-800",
      INACTIVE: "bg-red-100 text-red-800",
    }
    return variants[status as keyof typeof variants] || variants.DRAFT
  }

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <Link href="/host/properties">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            {editingSections.has("title") ? (
              <div className="flex items-center gap-2">
                <Input
                  value={getCurrentValue("title") as string}
                  onChange={(e) => onUpdateEditingData("title", e.target.value)}
                  className="text-2xl font-semibold h-auto py-1 px-2 border-blue-300"
                />
                <Button size="sm" variant="ghost" onClick={() => onCancelEdit("title")}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-semibold text-gray-900">{getCurrentValue("title") as string}</h1>
                <Button variant="ghost" size="sm" onClick={() => onEdit("title")}>
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            )}
            <Badge className={getStatusBadge(property.status)}>{property.status}</Badge>
          </div>
          <p className="text-gray-600 flex items-center mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            {property.location}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        {hasChanges && (
          <Button onClick={onSaveAll} disabled={saving} className="bg-green-600 hover:bg-green-700">
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Đang lưu..." : "Lưu tất cả thay đổi"}
          </Button>
        )}
        <Button
          variant="outline"
          onClick={onStatusToggle}
          className={
            property.status === "ACTIVE" ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"
          }
        >
          {property.status === "ACTIVE" ? (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              Hủy kích hoạt
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Kích hoạt
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={onDelete}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Xóa
        </Button>
      </div>
    </div>
  )
}
