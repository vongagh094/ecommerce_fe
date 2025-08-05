export interface DashboardStats {
  totalListing: number
  totalBidActive: number
  totalBooking: number
  sales: number
}

export interface SalesData {
  month: string
  amount: number
}

export interface MetricCard {
  title: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative"
  icon?: string
}

export interface ChartData {
  salesOverview: SalesData[]
  expectedSales: number
  totalSales: number
  salesIncrease: number
  bidConversion: number
  occupancyRatio: number
  occupancyChange: number
}

export interface Review {
  id: string;
  propertyId: string;
  guestId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}


export interface HostDashboardStats {
  totalListing: number
  totalBidActive: number
  totalBooking: number
  sales: number
}

export interface ChartDataPoint {
  month: string
  value: number
}

export interface HostDashboardData {
  stats: HostDashboardStats
  chartData: ChartDataPoint[]
  expectedSales: number
  totalSales: number
  salesIncrease: number
  bidConversion: number
  occupancyRatio: number
  occupancyChange: number
}

export interface HostProperty {
  id: string
  title: string
  location: string
  description: string
  details: string
  amenities: string[]
  rating: number
  reviewCount: number
  images: string[]
  price: number
  bedrooms: number
  bathrooms: number
  guests: number
  hostId: string
  isAvailable: boolean
  createdAt: Date
  updatedAt: Date
}

export interface PropertyEditSection {
  id: string
  title: string
  content: any
  type: "text" | "textarea" | "amenities" | "bedrooms"
}

export interface Booking {
  id: string
  guest: {
    id: string
    name: string
    avatar: string
  }
  property: {
    id: string
    name: string
    location: string
  }
  checkIn: string
  checkOut: string
  totalCharges: number
  status: "confirmed" | "pending" | "cancelled"
  createdAt: string
}

export interface ActiveAuction {
  id: string
  property: {
    id: string
    title: string
    location: string
    images: string[]
  }
  currentBid: number
  remainingTime: {
    days: number
    hours: number
    minutes: number
  }
  status: "active" | "ending_soon"
}

export interface PendingBid {
  id: string
  property: {
    id: string
    name: string
    location: string
  }
  bidder: {
    id: string
    name: string
    isAnonymous: boolean
  }
  bidAmount: number
  bidDate: string
  status: "pending" | "verified" | "rejected"
}

export interface BidAction {
  bidId: string
  action: "verify" | "reject" | "extend"
}
