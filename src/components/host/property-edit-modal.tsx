"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface PropertyEditSection {
  id: string
  title: string
  type: "text" | "textarea" | "amenities" | "bedrooms"
  content: any
}

interface PropertyEditModalProps {
  isOpen: boolean
  onClose: () => void
  section: PropertyEditSection | null
  onSave: (sectionId: string, newContent: any) => void
}

export function PropertyEditModal({ isOpen, onClose, section, onSave }: PropertyEditModalProps) {
  const [editedContent, setEditedContent] = useState(section?.content || "")

  const handleSave = () => {
    if (section) {
      onSave(section.id, editedContent)
      onClose()
    }
  }

  const handleCancel = () => {
    setEditedContent(section?.content || "")
    onClose()
  }

  if (!section) return null

  const renderEditField = () => {
    switch (section.type) {
      case "text":
        return <Input value={editedContent} onChange={(e) => setEditedContent(e.target.value)} className="w-full" />
      case "textarea":
        return (
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full min-h-32"
            rows={6}
          />
        )
      case "amenities":
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Edit amenities (one per line):</p>
            <Textarea
              value={Array.isArray(editedContent) ? editedContent.join("\n") : editedContent}
              onChange={(e) => setEditedContent(e.target.value.split("\n").filter((item) => item.trim()))}
              className="w-full min-h-32"
              rows={6}
              placeholder="Wifi&#10;Kitchen&#10;Free Parking&#10;Pool"
            />
          </div>
        )
      case "bedrooms":
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Edit bedroom information:</p>
            <Input
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full"
              placeholder="1 double bed"
            />
          </div>
        )
      default:
        return <Input value={editedContent} onChange={(e) => setEditedContent(e.target.value)} className="w-full" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit {section.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>{renderEditField()}</div>

          <div className="flex items-center justify-end space-x-4">
            <Button variant="outline" onClick={handleCancel} className="px-6 bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-cyan-400 hover:bg-cyan-500 text-white px-6">
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
