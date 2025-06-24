interface IncomeSummaryProps {
  totalSales: number
  period: string
}

export function IncomeSummary({ totalSales, period }: IncomeSummaryProps) {
  const formatCurrency = (amount: number) => {
    return `₫ ${amount.toLocaleString()}`
  }

  return (
    <div className="border-t pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Total sales this month:</h2>
        <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalSales)}</div>
      </div>

      {/* Additional metrics could go here */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-blue-600 font-medium">Average Daily Sales</div>
          <div className="text-lg font-semibold text-blue-900">{formatCurrency(Math.round(totalSales / 31))}</div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm text-green-600 font-medium">Best Day</div>
          <div className="text-lg font-semibold text-green-900">{formatCurrency(900000)}</div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-sm text-purple-600 font-medium">Total Bookings</div>
          <div className="text-lg font-semibold text-purple-900">47 bookings</div>
        </div>
      </div>
    </div>
  )
}
