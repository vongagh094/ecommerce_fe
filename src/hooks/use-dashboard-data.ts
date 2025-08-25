import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from "@/contexts/auth-context"
import type { HostProperty, OccupancyDataPoint } from '@/types/host'

const apiUrl = process.env.NEXT_PUBLIC_API_URL

export function usePropertyDashboardData() {
  const { user } = useAuth()
  const [hostId] = useState(Number(user?.id || 1))
  const [properties, setProperties] = useState<HostProperty[]>([])
  const [selectedProperty, setSelectedProperty] = useState<HostProperty | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!hostId) {
        setError("Không tìm thấy ID người dùng")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Lấy danh sách properties
        const propertiesResponse = await axios.get(`${apiUrl}/bookings/host/${hostId}/properties`)
        const propertiesData = propertiesResponse.data

        if (propertiesData.length === 0) {
          setProperties([])
          setSelectedProperty(null)
          setLoading(false)
          return
        }

        // Lấy dữ liệu chi tiết cho từng property
        const fullProperties: HostProperty[] = await Promise.all(
          propertiesData.map(async (prop: { id: string; name: string; location: string }) => {
            try {
              // Lấy stats
              const statsResponse = await axios.get(`${apiUrl}/bookings/property/${prop.id}/stats`)
              const stats = statsResponse.data

              // Lấy monthly sales
              const salesResponse = await axios.get(`${apiUrl}/bookings/property/${prop.id}/monthly-sales?year=${new Date().getFullYear()}`)
              const chartData = salesResponse.data

              // Lấy occupancy data
              const occupancyResponse = await axios.get(`${apiUrl}/bookings/property/${prop.id}/occupancy?period=daily&num_points=30&units_available=1`)
              const occupancyData = [
                ...occupancyResponse.data,
                ...(await axios.get(`${apiUrl}/bookings/property/${prop.id}/occupancy?period=weekly&num_points=12&units_available=1`)).data,
                ...(await axios.get(`${apiUrl}/bookings/property/${prop.id}/occupancy?period=monthly&num_points=12&units_available=1`)).data,
              ]

              return {
                id: prop.id,
                name: prop.name,
                location: prop.location,
                expectedSales: stats.expectedSales,
                totalSales: stats.totalSales,
                salesIncrease: stats.salesIncrease,
                chartData,
                occupancyData,
              }
            } catch (err) {
              console.error(`Lỗi khi lấy dữ liệu cho property ${prop.id}:`, err)
              return null
            }
          })
        )

        const validProperties = fullProperties.filter((prop): prop is HostProperty => prop !== null)
        setProperties(validProperties)
        if (validProperties.length > 0) {
          setSelectedProperty(validProperties[0])
        }
      } catch (err: any) {
        setError(err.response?.data?.detail || "Lỗi khi lấy dữ liệu dashboard")
        console.error("Lỗi khi lấy dữ liệu:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [hostId])

  return { properties, selectedProperty, setSelectedProperty, loading, error }
}