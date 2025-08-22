"use client"

import { useState } from "react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { CheckCircleIcon, BanIcon, RefreshCcw } from "lucide-react"
import { useUserManagementData } from "@/hooks/use-user-management-data"
import type { User } from "@/types/admin"

export default function UserManagementTable() {
  const { users, loading, error, hasMore, fetchUsers, toggleUserStatus, loadMore } = useUserManagementData()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const handleActionClick = (user: User) => {
    setSelectedUser(user)
    setIsDialogOpen(true)
  }

  const handleConfirmAction = async () => {
    if (selectedUser) {
      setActionLoading(selectedUser.id)
      await toggleUserStatus(selectedUser.id)
      setActionLoading(null)
      setIsDialogOpen(false)
      setSelectedUser(null)
    }
  }

  const getRoleColor = (role: User["role"]) => {
    switch (role) {
      case "Guest":
        return "bg-blue-500 text-white"
      case "Host":
        return "bg-green-500 text-white"
      case "Both":
        return "bg-purple-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getStatusColor = (status: User["status"]) => {
    return status === "Active" ? "text-green-600" : "text-red-600"
  }

  if (loading && users.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Card className="shadow-lg border-none">
          <CardHeader className="bg-gray-50">
            <CardTitle className="text-xl font-semibold text-gray-800">Quản Lý Người Dùng</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <Card className="shadow-lg border-none">
        <CardHeader className="bg-gray-50">
          <CardTitle className="text-xl font-semibold text-gray-800">Quản Lý Người Dùng</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-800">
                <RefreshCcw className="h-5 w-5" />
                <p>Lỗi: {error}</p>
              </div>
              <Button
                onClick={() => fetchUsers(0)}
                className="bg-red-600 hover:bg-red-700 text-white"
                size="sm"
                disabled={!!actionLoading}
              >
                Thử lại
              </Button>
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="font-semibold text-gray-700">ID</TableHead>
                <TableHead className="font-semibold text-gray-700">Tên</TableHead>
                <TableHead className="font-semibold text-gray-700">Email</TableHead>
                <TableHead className="font-semibold text-gray-700">Số Điện Thoại</TableHead>
                <TableHead className="font-semibold text-gray-700">Vai Trò</TableHead>
                <TableHead className="font-semibold text-gray-700">Trạng Thái</TableHead>
                <TableHead className="font-semibold text-gray-700 text-right">Hành Động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium text-gray-800">{user.id}</TableCell>
                  <TableCell className="flex items-center gap-2 font-medium text-gray-800">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatarUrl || "/placeholder.svg"} />
                      <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {user.fullName}
                  </TableCell>
                  <TableCell className="text-gray-600">{user.email}</TableCell>
                  <TableCell className="text-gray-600">{user.phoneNumber}</TableCell>
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
                      {user.status === "Active" ? "Hiển thị" : "Bị cấm"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleActionClick(user)}
                      className={
                        user.status === "Active"
                          ? "border-orange-500 text-orange-500 hover:bg-orange-50"
                          : "border-green-500 text-green-500 hover:bg-green-50"
                      }
                      disabled={actionLoading === user.id}
                    >
                      {actionLoading === user.id ? (
                        <RefreshCcw className="h-4 w-4 animate-spin" />
                      ) : user.status === "Active" ? "Cấm" : "Hiển thị"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {users.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500 flex flex-col items-center gap-2">
              <CheckCircleIcon className="h-8 w-8 text-gray-400" />
              <p>Không tìm thấy người dùng</p>
            </div>
          )}
          {hasMore && (
            <div className="flex justify-center mt-6">
              <Button
                onClick={loadMore}
                disabled={loading || !!actionLoading}
                className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2"
              >
                {loading ? "Đang tải..." : "Tải thêm"}
              </Button>
            </div>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold">
                  {selectedUser?.status === "Active" ? "Xác nhận Cấm" : "Xác nhận Hiển thị"}
                </DialogTitle>
                <DialogDescription>
                  Bạn có chắc muốn {selectedUser?.status === "Active" ? "cấm" : "hiển thị"} người dùng "{selectedUser?.fullName}"?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={!!selectedUser && actionLoading === selectedUser.id}
                >
                  Hủy
                </Button>
                <Button
                  variant={selectedUser?.status === "Active" ? "destructive" : "default"}
                  onClick={handleConfirmAction}
                  className={selectedUser?.status === "Active" ? "bg-red-600 hover:bg-red-700" : ""}
                  disabled={!!selectedUser && actionLoading === selectedUser.id}
                >
                  {selectedUser && actionLoading === selectedUser.id ? (
                    <RefreshCcw className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {selectedUser?.status === "Active" ? "Cấm" : "Hiển thị"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}