"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircleIcon, BanIcon } from "lucide-react"
import { useUserManagementData } from "@/hooks/use-user-management-data"
import { Skeleton } from "@/components/ui/skeleton"
import type { User } from "@/types/admin"

export default function UserManagementTable() {
  const { users, loading, toggleUserStatus } = useUserManagementData()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const handleActionClick = (user: User) => {
    setSelectedUser(user)
    setIsDialogOpen(true)
  }

  const handleConfirmAction = () => {
    if (selectedUser) {
      toggleUserStatus(selectedUser.id)
      setIsDialogOpen(false)
      setSelectedUser(null)
    }
  }

  const getRoleColor = (role: User["role"]) => {
    switch (role) {
      case "Guest":
        return "bg-blue-100 text-blue-800"
      case "Host":
        return "bg-green-100 text-green-800"
      case "Both":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: User["status"]) => {
    return status === "Active" ? "text-green-600" : "text-red-600"
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Manager</CardTitle>
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
        <CardTitle>User Manager</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>User Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatarUrl || "/placeholder.svg"} />
                    <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {user.fullName}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phoneNumber}</TableCell>
                <TableCell>
                  <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                </TableCell>
                <TableCell className={getStatusColor(user.status)}>
                  <span className="flex items-center gap-1">
                    {user.status === "Active" ? (
                      <CheckCircleIcon className="h-4 w-4" />
                    ) : (
                      <BanIcon className="h-4 w-4" />
                    )}
                    {user.status}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="link"
                    className={user.status === "Active" ? "text-red-600" : "text-green-600"}
                    onClick={() => handleActionClick(user)}
                  >
                    [{user.status === "Active" ? "Ban" : "Unban"}]
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedUser?.status === "Active" ? "Confirm Ban" : "Confirm Unban"}</DialogTitle>
              <DialogDescription>
                Are you sure you want to {selectedUser?.status === "Active" ? "ban" : "unban"} "{selectedUser?.fullName}
                "? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant={selectedUser?.status === "Active" ? "destructive" : "default"}
                onClick={handleConfirmAction}
              >
                {selectedUser?.status === "Active" ? "Ban" : "Unban"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
