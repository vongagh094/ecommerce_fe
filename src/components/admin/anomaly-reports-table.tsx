"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, User, Eye } from "lucide-react"
import type { AnomalyReport } from "@/types/admin"

interface AnomalyReportsTableProps {
  reports: AnomalyReport[]
}

export function AnomalyReportsTable({ reports }: AnomalyReportsTableProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "destructive"
      case "investigating":
        return "default"
      case "resolved":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "reported-account":
        return "Reported Account"
      case "fraud-behavior":
        return "Fraudulent Behavior"
      case "suspicious-activity":
        return "Suspicious Activity"
      default:
        return type
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending"
      case "investigating":
        return "Investigating"
      case "resolved":
        return "Resolved"
      default:
        return status
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Anomaly Reports
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={getSeverityColor(report.severity)}>{report.severity.toUpperCase()}</Badge>
                  <span className="text-sm font-medium text-gray-700">{getTypeLabel(report.type)}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {report.userName}
                  </span>
                  <span>{report.createdAt.toLocaleDateString("en-US")}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={getStatusColor(report.status)}>{getStatusLabel(report.status)}</Badge>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
