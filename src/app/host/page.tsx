"use client"

import { usePropertyDashboardData } from "@/hooks/use-dashboard-data"
import { PropertySelector } from "@/components/host/property-selector"
import { NewSalesOverviewChart } from "@/components/host/dashboard/new-sales-overview-chart"
import { SummaryCards } from "@/components/host/dashboard/summary-cards"
import { RatingBarChart } from "@/components/host/dashboard/rating-bar-chart" // Updated import
import { OccupancyChart } from "@/components/host/dashboard/occupancy-chart"

export default function HostDashboard() {
  const { properties, selectedProperty, setSelectedProperty, loading } = usePropertyDashboardData()

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-8 w-48 ml-auto"></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 h-96 bg-gray-200 rounded-2xl"></div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded-2xl"></div>
              <div className="h-32 bg-gray-200 rounded-2xl"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <div className="h-64 bg-gray-200 rounded-2xl"></div>
            <div className="h-64 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!selectedProperty) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-600">No property selected</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Property Selector */}
      <div className="flex justify-end mb-8">
        <PropertySelector
          properties={properties.map(p => ({ id: p.id, name: p.name, location: p.location }))}
          selectedProperty={selectedProperty ? { id: selectedProperty.id, name: selectedProperty.name, location: selectedProperty.location } : null}
          onPropertyChange={(property) => {
            const fullProperty = properties.find(p => p.id === property.id)
            if (fullProperty) {
              setSelectedProperty(fullProperty)
            }
          }}
        />
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* Sales Overview Chart */}
        <div className="lg:col-span-3">
          <NewSalesOverviewChart data={selectedProperty.chartData} />
        </div>

        {/* Summary Cards */}
        <div>
          <SummaryCards
            expectedSales={selectedProperty.expectedSales}
            totalSales={selectedProperty.totalSales}
            salesIncrease={selectedProperty.salesIncrease}
          />
        </div>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Bar Chart */}
        <RatingBarChart data={selectedProperty.ratingsDistribution} />

        {/* Occupancy Over Time Chart */}
        <OccupancyChart data={selectedProperty.occupancyData} />
      </div>
    </div>
  )
}
