"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { usePropertyManagementData } from "@/hooks/use-property-management-data"
import type { Property } from "@/types/admin"

export default function PropertyManagementTable() {
  const { properties, loading, togglePropertyStatus } = usePropertyManagementData()
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  const handleViewDetails = (propertyId: string) => {
    router.push(`/property/${propertyId}`)
  }

  const handleToggleVisibilityClick = (property: Property) => {
    setSelectedProperty(property)
    setIsDialogOpen(true)
  }

  const handleConfirmToggle = () => {
    if (selectedProperty) {
      togglePropertyStatus(selectedProperty.id)
      setIsDialogOpen(false)
      setSelectedProperty(null)
    }
  }

  const getStatusColor = (status: Property["status"]) => {
    return status === "Visible" ? "text-green-600" : "text-red-600"
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Property Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Manager</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead>Host name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.map((property) => (
              <TableRow key={property.id}>
                <TableCell className="font-medium">{property.name}</TableCell>
                <TableCell>{property.hostName}</TableCell>
                <TableCell>{property.location}</TableCell>
                <TableCell className={getStatusColor(property.status)}>{property.status}</TableCell>
                <TableCell>
                  <Button
                    variant="link"
                    onClick={() => handleViewDetails(property.id)}
                    className="p-0 h-auto text-blue-600 hover:underline"
                  >
                    [View detail]
                  </Button>
                  <span className="mx-1">|</span>
                  <Button
                    variant="link"
                    onClick={() => handleToggleVisibilityClick(property)}
                    className={`p-0 h-auto ${property.status === "Visible" ? "text-red-600" : "text-green-600"} hover:underline`}
                  >
                    [{property.status === "Visible" ? "Hide" : "Show"}]
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedProperty?.status === "Visible" ? "Confirm Hide" : "Confirm Show"}</DialogTitle>
              <DialogDescription>
                Are you sure you want to {selectedProperty?.status === "Visible" ? "hide" : "show"} "
                {selectedProperty?.name}"?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant={selectedProperty?.status === "Visible" ? "destructive" : "default"}
                onClick={handleConfirmToggle}
              >
                {selectedProperty?.status === "Visible" ? "Hide" : "Show"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
