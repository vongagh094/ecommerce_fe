import { Card, CardContent } from "@/components/ui/card"

interface MetricCardsProps {
  bidConversion: number
  occupancyRatio: number
  occupancyChange: number
}

export function MetricCards({ bidConversion, occupancyRatio, occupancyChange }: MetricCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="border border-gray-200 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Bid conversion</p>
              <p className="text-2xl font-semibold text-gray-900">{bidConversion}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
              <span className="text-cyan-600 text-xl">📊</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Occupany ratio</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-semibold text-gray-900">{occupancyRatio}%</p>
                <p className="text-sm text-red-500">{occupancyChange}%</p>
              </div>
            </div>
            <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
              <span className="text-cyan-600 text-xl">📊</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
