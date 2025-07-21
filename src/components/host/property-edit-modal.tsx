"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { PropertyEditSection } from "@/types/host"

interface PropertyEditModalProps {
  isOpen: boolean
  onClose: () => void
  section: PropertyEditSection | null
  onSave: (sectionId: string, newContent: any) => void
}

export function PropertyEditModal({ isOpen, onClose, section, onSave }: PropertyEditModalProps) {
  const [content, setContent] = useState(section?.content || "")

  const handleSave = () => {
    if (section) {
      onSave(section.id, content)
      onClose()
    }
  }

  const handleCancel = () => {
    setContent(section?.content || "")
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
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`Enter ${section.title.toLowerCase()}`}
            className="w-full min-h-[120px]"
          />
        )
      case "amenities":
        return (
          <Textarea
            value={Array.isArray(content) ? content.join("\n") : content}
            onChange={(e) => setContent(e.target.value.split("\n").filter((item) => item.trim()))}
            placeholder="Enter amenities (one per line)"
            className="w-full min-h-[120px]"
          />
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
