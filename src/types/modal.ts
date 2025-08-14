export interface PropertyCreationModalProps {
  isOpen: boolean
  onClose: () => void
  onPropertyCreated: (propertyId: number) => void
}

export interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  propertyTitle: string
}

export interface AuctionCreationModalProps {
  isOpen: boolean
  onClose: () => void
  propertyId: number
  onAuctionCreated: (auctionId: string) => void
}

export interface AuctionListModalProps {
  isOpen: boolean
  onClose: () => void
  propertyId: number
}
