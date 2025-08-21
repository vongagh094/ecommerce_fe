"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function PaymentSupportPage() {
  const router = useRouter()

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Support</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Having trouble with your payment? We can help. Please try the following steps:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Wait a minute and refresh the payment status page.</li>
            <li>Check your internet connection.</li>
            <li>If your account was charged but the booking isn’t visible, we’ll reconcile it shortly.</li>
          </ul>
          <div className="space-y-2">
            <p className="text-gray-700">If you need immediate assistance:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Contact support at <a href="mailto:support@example.com" className="text-blue-600 underline">support@example.com</a></li>
              <li>Reference your transaction ID or auction ID if available.</li>
            </ul>
          </div>
          <div className="pt-2">
            <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
