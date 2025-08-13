"use client"

import { useState, useEffect } from "react"
import type { Property } from "@/types/admin"

export function usePropertyManagementData() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

      const mockProperties: Property[] = [
        {
          id: "prop_001",
          name: "Ponta Delgada, Portugal",
          hostName: "BalajiNant",
          location: "Portugal",
          status: "Visible",
        },
        {
          id: "prop_002",
          name: "Apartment in Vietnam",
          hostName: "qqqqq",
          location: "Vietnam",
          status: "Hidden",
        },
        {
          id: "prop_003",
          name: "Apartment in Vietnam",
          hostName: "qqq A",
          location: "Vietnam",
          status: "Visible",
        },
        {
          id: "prop_004",
          name: "Karthik Subramanian",
          hostName: "Aqous A",
          location: "Subramanian",
          status: "Hidden",
        },
        {
          id: "prop_005",
          name: "Luxury Villa in Da Nang",
          hostName: "Host A",
          location: "Da Nang, Vietnam",
          status: "Visible",
        },
        {
          id: "prop_006",
          name: "Beachfront Condo, Nha Trang",
          hostName: "Host B",
          location: "Nha Trang, Vietnam",
          status: "Hidden",
        },
        {
          id: "prop_007",
          name: "Mountain Retreat, Sapa",
          hostName: "Host C",
          location: "Sapa, Vietnam",
          status: "Visible",
        },
      ]
      setProperties(mockProperties)
      setLoading(false)
    }
    fetchProperties()
  }, [])

  const togglePropertyStatus = (id: string) => {
    setProperties((prevProperties) =>
      prevProperties.map((property) =>
        property.id === id ? { ...property, status: property.status === "Visible" ? "Hidden" : "Visible" } : property,
      ),
    )
  }

  return { properties, loading, togglePropertyStatus }
}
