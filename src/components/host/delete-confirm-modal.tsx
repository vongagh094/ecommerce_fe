"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  propertyTitle: string
}

export function DeleteConfirmModal({ isOpen, onClose, onConfirm, propertyTitle }: DeleteConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">Delete Property</DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <p className="text-gray-600">
            Are you sure you want to delete <span className="font-semibold">"{propertyTitle}"</span>? This action cannot
            be undone and will permanently remove the property and all associated data.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
            Delete Property
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
