"use client"

export function SearchResultsMap() {
  return (
    <div className="h-full bg-blue-100 relative overflow-hidden rounded-lg">
      {/* Map Placeholder */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <p className="text-gray-600">Interactive Map View</p>
          <p className="text-sm text-gray-500">Map integration would go here</p>
        </div>
      </div>

      {/* Price Markers */}
      <div className="absolute top-20 left-20 bg-white px-2 py-1 rounded-full shadow-md text-sm font-semibold">
        $110
      </div>
      <div className="absolute top-32 right-32 bg-white px-2 py-1 rounded-full shadow-md text-sm font-semibold">
        $150
      </div>
      <div className="absolute bottom-40 left-32 bg-white px-2 py-1 rounded-full shadow-md text-sm font-semibold">
        $325
      </div>
      <div className="absolute bottom-32 right-20 bg-white px-2 py-1 rounded-full shadow-md text-sm font-semibold">
        $200
      </div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900 text-white px-2 py-1 rounded-full shadow-md text-sm font-semibold">
        $275
      </div>
    </div>
  )
}
