import { Card, CardContent } from "@/components/ui/card"
import { Wallet } from 'lucide-react'

interface SummaryCardsProps {
  expectedSales: number
  totalSales: number
  salesIncrease: number
}

export function SummaryCards({ expectedSales, totalSales, salesIncrease }: SummaryCardsProps) {
  return (
    <div className="space-y-4">
      <Card className="border border-gray-200 rounded-2xl">
        <CardContent className="p-6 flex flex-col items-center justify-center text-center">
          <div className="bg-teal-100 p-3 rounded-full mb-4">
            <Wallet className="w-6 h-6 text-teal-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Expected sales</h3>
          <p className="text-2xl font-bold text-gray-900">{expectedSales.toLocaleString('vi-VN')} đ</p>
        </CardContent>
      </Card>
      <Card className="border border-gray-200 rounded-2xl">
        <CardContent className="p-6 flex flex-col items-center justify-center text-center">
          <div className="bg-teal-100 p-3 rounded-full mb-4">
            <Wallet className="w-6 h-6 text-teal-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Sales</h3>
          <p className="text-2xl font-bold text-gray-900">{totalSales.toLocaleString('vi-VN')} đ</p>
          <p className="text-sm text-green-600 mt-1">
            ({salesIncrease >= 0 ? '+' : ''}{salesIncrease.toLocaleString('vi-VN')} đ)
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
