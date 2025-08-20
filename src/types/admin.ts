export type AdminDashboardData = {
  revenueChartData: { month: string; revenue: number; platformFee: number }[]
  userGrowthChartData: { month: string; total: number; guests: number; hosts: number }[]
  biddingActivityChartData: { month: string; bids: number }[]
  adminStats: {
    totalRevenue: number
    totalUsers: number
    activeListings: number
    newSignups: number
  }
  activeBiddings: {
    id: string
    property: string
    currentBid: number
    highestBidder: string
    timeRemaining: string
    status: "Active" | "Ended"
  }[]
  anomalyReports: AnomalyReport[]
  topProperties: {
    id: string
    name: string
    location: string
    bookings: number
    earnings: number
    imageUrl: string
  }[]
  userRoleDistribution: {
    role: "Guest" | "Host" | "Both"
    count: number
  }[]
}

export type AnomalyReport = {
  id: string
  type: "Reported Account" | "Fraud Behavior" | "Suspicious Activity"
  status: "Resolved" | "Pending"
  description: string
  userName: string
  userId: string
  createdAt: string
  updatedAt: string
}

export type User = {
  id: string
  fullName: string
  email: string
  phoneNumber: string
  role: "Guest" | "Host" | "Both"
  status: "Active" | "Banned"
  avatarUrl?: string
}

export type Property = {
  id: string
  name: string
  hostName: string
  location: string
  status: "Visible" | "Hidden"
}
