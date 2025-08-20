import { TypeIcon as type, type LucideIcon } from 'lucide-react'

export interface HostProperty {
  id: string
  name: string
  location: string
  expectedSales: number
  totalSales: number
  salesIncrease: number
  chartData: { month: string; expected: number; actual: number }[]
  guestRating: number // Keep for overall average if needed elsewhere, but chart will use distribution
  ratingsDistribution: { stars: number; count: number }[] // New: for bar chart
  occupancyData: OccupancyDataPoint[]
}

export interface OccupancyDataPoint {
  date: string // YYYY-MM-DD
  occupancyRate: number // 0-100
  period: "daily" | "weekly" | "monthly"
}

export interface HostDashboardData {
  properties: HostProperty[]
}

export interface PropertySummary {
  id: string
  name: string
  location: string
}

export interface StatCardProps {
  title: string
  value: string
  change?: string
  icon: LucideIcon
  color: string
}

export interface SalesOverviewChartProps {
  data: { month: string; expected: number; actual: number }[]
}

export interface MetricCardProps {
  title: string
  value: string
  change: number
  unit: string
}

export interface PropertyCreationStep {
  id: string
  name: string
  component: React.ComponentType<any>
  icon: LucideIcon
}

export interface PropertyDetails {
  id: string
  name: string
  description: string
  type: string
  address: string
  latitude: number
  longitude: number
  images: string[]
  amenities: string[]
  bedrooms: {
    total: number
    configurations: {
      bedroomNumber: number
      bedType: string
      count: number
    }[]
  }
  reviews: {
    id: string
    user: string
    rating: number
    comment: string
    date: string
  }[]
  host: {
    id: string
    name: string
    avatar: string
    joinedDate: string
    propertiesCount: number
    reviewsCount: number
  }
}

export interface PropertyEditModalProps {
  isOpen: boolean
  onClose: () => void
  property: PropertyDetails
  onSave: (updatedProperty: PropertyDetails) => void
}

export interface EditSectionProps {
  title: string
  onEdit: () => void
  children: React.ReactNode
}

export interface EditTextFieldModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  label: string
  initialValue: string
  onSave: (value: string) => void
  isTextArea?: boolean
}

export interface EditAmenitiesModalProps {
  isOpen: boolean
  onClose: () => void
  initialAmenities: string[]
  onSave: (amenities: string[]) => void
}

export interface EditBedroomsModalProps {
  isOpen: boolean
  onClose: () => void
  initialBedrooms: {
    total: number
    configurations: {
      bedroomNumber: number
      bedType: string
      count: number
    }[]
  }
  onSave: (bedrooms: {
    total: number
    configurations: {
      bedroomNumber: number
      bedType: string
      count: number
    }[]
  }) => void
}
