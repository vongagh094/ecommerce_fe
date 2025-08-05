"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { PropertyEditSection } from "@/types/host"

const apiUrl = "http://127.0.0.1:8000"

interface PropertyEditModalProps {
  isOpen: boolean
  onClose: () => void
  section: PropertyEditSection | null
  onSave: (sectionId: string, newContent: any) => void
  propertyId: string // Added to support update API call
}

export function PropertyEditModal({ isOpen, onClose, section, onSave, propertyId }: PropertyEditModalProps) {
  const [content, setContent] = useState<any>(section?.content || "")
  const [availableAmenities, setAvailableAmenities] = useState<{ id: string; name: string }[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (section?.type === "amenities") {
      const fetchAmenities = async () => {
        try {
          const response = await fetch(`${apiUrl}/amenities/available`)
          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Failed to fetch amenities: ${errorText}`)
          }
          const data = await response.json()
          setAvailableAmenities(data.map((amenity: any) => ({ id: amenity.id, name: amenity.name })))
        } catch (error: any) {
          console.error("Error fetching amenities:", error)
          setError("Unable to load amenities. Please try again.")
        }
      }
      fetchAmenities()
    }
    setContent(section?.content || "")
  }, [section])

  const handleSave = async () => {
    if (!section) return

    try {
      // Prepare update payload based on section type
      const updatePayload: any = {}
      if (section.id === "title") updatePayload.title = content
      if (section.id === "description") updatePayload.description = content
      if (section.id === "bedrooms") {
        updatePayload.bedrooms = parseInt(content.split(" ")[0]) || 1 // Extract number from "X double bed"
      }
      if (section.id === "amenities") {
        updatePayload.amenities = content.map((name: string) => ({
          amenity_id: availableAmenities.find((a) => a.name === name)?.id || "",
        }))
      }

      // Send update to backend
      const response = await fetch(`${apiUrl}/properties/update/${propertyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to update property: ${errorText}`)
      }

      onSave(section.id, content)
      onClose()
    } catch (error: any) {
      console.error("Error updating property:", error)
      setError("Failed to save changes. Please try again.")
    }
  }

  const handleCancel = () => {
    setContent(section?.content || "")
    setError(null)
    onClose()
  }

  if (!section) return null

  const renderInput = () => {
    switch (section.type) {
      case "text":
        return (
          <Input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`Enter ${section.title.toLowerCase()}`}
            className="w-full"
          />
        )
      case "textarea":
        return (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`Enter ${section.title.toLowerCase()}`}
            className="w-full min-h-[120px] border border-gray-300 rounded-md p-2"
          />
        )
      case "amenities":
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Select Amenities</label>
            {error && <p className="text-red-500">{error}</p>}
            <div className="grid grid-cols-2 gap-4">
              {availableAmenities.map((amenity) => (
                <div key={amenity.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={content.includes(amenity.name)}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const checked = e.target.checked
                      if (checked) {
                        setContent([...content, amenity.name])
                      } else {
                        setContent(content.filter((a: string) => a !== amenity.name))
                      }
                    }}
                  />
                  <span>{amenity.name}</span>
                </div>
              ))}
            </div>
          </div>
        )
      case "bedrooms":
        return (
          <div className="space-y-4">
            <Input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="e.g., 1 double bed"
              className="w-full"
            />
          </div>
        )
      default:
        return <Input value={content} onChange={(e) => setContent(e.target.value)} className="w-full" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit {section.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">{renderInput()}</div>
        {error && <p className="text-red-500">{error}</p>}
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-700">
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}