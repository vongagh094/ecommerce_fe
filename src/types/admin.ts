export interface AdminStats {
  totalUsers: {
    total: number
    guests: number
    hosts: number
    both: number
  }
  activeRooms: number
  bidding: {
    daily: number
    weekly: number
    monthly: number
  }
  revenue: {
    totalRevenue: number
    platformFees: number
    growth: number
  }
  anomalyReports: AnomalyReport[]
  userRoleDistribution: UserRoleData[]
  topProperties: PropertyPerformanceData[]
}

export interface UserRoleData {
  role: string
  count: number
  percentage: number
}

export interface PropertyPerformanceData {
  id: string
  name: string
  bookings: number
  earnings: number
  location: string
}

export interface ActiveBidding {
  id: string
  propertyTitle: string
  currentBid: number
  bidderCount: number
  timeRemaining: string
  status: "active" | "closing-soon"
  endTime: Date
}

export interface AnomalyReport {
  id: string
  type: "reported-account" | "fraud-behavior" | "suspicious-activity"
  status: "pending" | "resolved"
  description: string
  userName: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface RevenueData {
  month: string
  revenue: number
  platformFees: number
}

export interface UserGrowthData {
  month: string
  guests: number
  hosts: number
  total: number
}

export interface BiddingActivityData {
  period: string
  count: number
  type: "daily" | "weekly" | "monthly"
}
