import { useState, useEffect } from 'react'
import type { HostProperty, HostDashboardData, PropertySummary, OccupancyDataPoint } from '@/types/host'

// Helper to generate random data for demonstration
const generateRandomSalesData = () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return months.map(month => ({
    month,
    expected: Math.floor(Math.random() * (10000000 - 5000000 + 1) + 5000000), // 5M to 10M VND
    actual: Math.floor(Math.random() * (12000000 - 6000000 + 1) + 6000000), // 6M to 12M VND
  }))
}

const generateRandomOccupancyData = (period: "daily" | "weekly" | "monthly", numPoints: number): OccupancyDataPoint[] => {
  const data: OccupancyDataPoint[] = []
  let startDate = new Date()

  if (period === "daily") {
    startDate.setDate(startDate.getDate() - numPoints + 1)
  } else if (period === "weekly") {
    startDate.setDate(startDate.getDate() - (numPoints * 7) + 1)
  } else if (period === "monthly") {
    startDate.setMonth(startDate.getMonth() - numPoints + 1)
    startDate.setDate(1) // Start of the month
  }

  for (let i = 0; i < numPoints; i++) {
    const currentDate = new Date(startDate)
    if (period === "daily") {
      currentDate.setDate(startDate.getDate() + i)
    } else if (period === "weekly") {
      currentDate.setDate(startDate.getDate() + (i * 7))
    } else if (period === "monthly") {
      currentDate.setMonth(startDate.getMonth() + i)
    }

    const occupancyRate = Math.floor(Math.random() * (85 - 40 + 1)) + 40 // 40-85%
    data.push({
      date: currentDate.toISOString().split('T')[0],
      occupancyRate,
      period,
    })
  }
  return data
}

const generateRandomRatingsDistribution = () => {
  const distribution = []
  let totalReviews = Math.floor(Math.random() * 100) + 50 // 50-150 total reviews
  
  // Distribute reviews, favoring higher ratings
  const fiveStars = Math.floor(totalReviews * (0.4 + Math.random() * 0.2)) // 40-60%
  const fourStars = Math.floor(totalReviews * (0.2 + Math.random() * 0.15)) // 20-35%
  const threeStars = Math.floor(totalReviews * (0.1 + Math.random() * 0.1)) // 10-20%
  const twoStars = Math.floor(totalReviews * (0.05 + Math.random() * 0.05)) // 5-10%
  const oneStar = totalReviews - (fiveStars + fourStars + threeStars + twoStars)
  
  distribution.push({ stars: 5, count: fiveStars })
  distribution.push({ stars: 4, count: fourStars })
  distribution.push({ stars: 3, count: threeStars })
  distribution.push({ stars: 2, count: twoStars > 0 ? twoStars : 0 }) // Ensure non-negative
  distribution.push({ stars: 1, count: oneStar > 0 ? oneStar : 0 }) // Ensure non-negative

  // Ensure total reviews match, adjust if necessary (e.g., due to flooring)
  const currentTotal = distribution.reduce((sum, d) => sum + d.count, 0);
  if (currentTotal !== totalReviews) {
    const diff = totalReviews - currentTotal;
    // Add/subtract difference from 5-star reviews
    const fiveStarIndex = distribution.findIndex(d => d.stars === 5);
    if (fiveStarIndex !== -1) {
      distribution[fiveStarIndex].count += diff;
      if (distribution[fiveStarIndex].count < 0) distribution[fiveStarIndex].count = 0; // Prevent negative
    }
  }

  return distribution;
}


const mockProperties: HostProperty[] = [
  {
    id: 'prop1',
    name: 'Luxury Villa Da Nang',
    location: 'Da Nang, Vietnam',
    expectedSales: 5000000,
    totalSales: 10000000,
    salesIncrease: 5000000,
    chartData: generateRandomSalesData(),
    guestRating: 4.8,
    ratingsDistribution: generateRandomRatingsDistribution(),
    occupancyData: [
      ...generateRandomOccupancyData("daily", 30),
      ...generateRandomOccupancyData("weekly", 12),
      ...generateRandomOccupancyData("monthly", 12),
    ],
  },
  {
    id: 'prop2',
    name: 'Cozy Apartment Hanoi',
    location: 'Hanoi, Vietnam',
    expectedSales: 3000000,
    totalSales: 7500000,
    salesIncrease: 4500000,
    chartData: generateRandomSalesData(),
    guestRating: 4.2,
    ratingsDistribution: generateRandomRatingsDistribution(),
    occupancyData: [
      ...generateRandomOccupancyData("daily", 30),
      ...generateRandomOccupancyData("weekly", 12),
      ...generateRandomOccupancyData("monthly", 12),
    ],
  },
  {
    id: 'prop3',
    name: 'Beachfront Bungalow Phu Quoc',
    location: 'Phu Quoc, Vietnam',
    expectedSales: 7000000,
    totalSales: 15000000,
    salesIncrease: 8000000,
    chartData: generateRandomSalesData(),
    guestRating: 4.9,
    ratingsDistribution: generateRandomRatingsDistribution(),
    occupancyData: [
      ...generateRandomOccupancyData("daily", 30),
      ...generateRandomOccupancyData("weekly", 12),
      ...generateRandomOccupancyData("monthly", 12),
    ],
  },
]

export function usePropertyDashboardData() {
  const [properties, setProperties] = useState<HostProperty[]>([])
  const [selectedProperty, setSelectedProperty] = useState<HostProperty | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500))
        
        setProperties(mockProperties)
        if (mockProperties.length > 0) {
          setSelectedProperty(mockProperties[0]) // Select first property by default
        }
      } catch (err) {
        setError("Failed to fetch dashboard data.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { properties, selectedProperty, setSelectedProperty, loading, error }
}
