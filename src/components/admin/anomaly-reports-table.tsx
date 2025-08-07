"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, User, Shield, Eye, CheckCircle, Clock } from 'lucide-react'
import type { AnomalyReport } from "@/types/admin"

interface AnomalyReportsTableProps {
  reports: AnomalyReport[]
}

export function AnomalyReportsTable({ reports }: AnomalyReportsTableProps) {
  const [reportStatuses, setReportStatuses] = useState<Record<string, "pending" | "resolved">>(
    reports.reduce((acc, report) => {
      acc[report.id] = report.status
      return acc
    }, {} as Record<string, "pending" | "resolved">)
  )

  const getTypeIcon = (type: AnomalyReport["type"]) => {
    switch (type) {
      case "reported-account":
        return <User className="h-4 w-4" />
      case "fraud-behavior":
        return <Shield className="h-4 w-4" />
      case "suspicious-activity":
        return <Eye className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: AnomalyReport["type"]) => {
    switch (type) {
      case "reported-account":
        return "bg-red-100 text-red-800 border-red-200"
      case "fraud-behavior":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "suspicious-activity":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeLabel = (type: AnomalyReport["type"]) => {
    switch (type) {
      case "reported-account":
        return "Reported Account"
      case "fraud-behavior":
        return "Fraud Behavior"
      case "suspicious-activity":
        return "Suspicious Activity"
      default:
        return "Unknown"
    }
  }

  const toggleStatus = (reportId: string) => {
    setReportStatuses(prev => ({
      ...prev,
      [reportId]: prev[reportId] === "pending" ? "resolved" : "pending"
    }))
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Anomaly Reports
        </CardTitle>
        <p className="text-sm text-gray-600">
          Monitor and manage reported issues and suspicious activities
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reports.map((report) => {
            const currentStatus = reportStatuses[report.id]
            return (
              <div
                key={report.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className={`${getTypeColor(report.type)} flex items-center gap-1`}
                      >
                        {getTypeIcon(report.type)}
                        {getTypeLabel(report.type)}
                      </Badge>
                      <Badge
                        variant={currentStatus === "resolved" ? "default" : "secondary"}
                        className={`flex items-center gap-1 ${
                          currentStatus === "resolved"
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-orange-100 text-orange-800 border-orange-200"
                        }`}
                      >
                        {currentStatus === "resolved" ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        {currentStatus === "resolved" ? "Resolved" : "Pending"}
                      </Badge>
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-900">{report.userName}</p>
                      <p className="text-sm text-gray-600">User ID: {report.userId}</p>
                    </div>
                    
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {report.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Created: {formatDate(report.createdAt)}</span>
                      <span>Updated: {formatDate(report.updatedAt)}</span>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <Button
                      size="sm"
                      variant={currentStatus === "pending" ? "default" : "outline"}
                      onClick={() => toggleStatus(report.id)}
                      className={
                        currentStatus === "pending"
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "border-orange-300 text-orange-700 hover:bg-orange-50"
                      }
                    >
                      {currentStatus === "pending" ? "Mark Resolved" : "Mark Pending"}
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
          
          {reports.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No anomaly reports found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
