"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MapPin, RefreshCcw } from "lucide-react";
import { usePropertyManagementData } from "@/hooks/use-property-management-data";
import type { PropertyDetails } from "@/types/property";

export default function PropertyManagementTable() {
  const {
    properties,
    loading,
    error,
    hasMore,
    loadingMore,
    actionLoading,
    postActionMessage,
    setPostActionMessage,
    fetchProperties,
    loadMore,
    togglePropertyStatus,
    deleteProperty,
  } = usePropertyManagementData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<PropertyDetails | null>(null);
  const [actionType, setActionType] = useState<"toggle" | "delete">("toggle");
  const router = useRouter();

  const handleViewDetails = (propertyId: number) => {
    router.push(`/property/${propertyId}`);
  };

  const handleToggleVisibilityClick = (property: PropertyDetails) => {
    setSelectedProperty(property);
    setActionType("toggle");
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (property: PropertyDetails) => {
    setSelectedProperty(property);
    setActionType("delete");
    setIsDialogOpen(true);
  };

  const handleConfirmAction = () => {
    if (selectedProperty) {
      if (actionType === "toggle") {
        togglePropertyStatus(selectedProperty.id);
      } else if (actionType === "delete") {
        deleteProperty(selectedProperty.id);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { label: "Hiển thị", variant: "default" as const, className: "bg-green-500 text-white" },
      INACTIVE: { label: "Ẩn", variant: "secondary" as const, className: "bg-gray-500 text-white" },
      DRAFT: { label: "Bản nháp", variant: "outline" as const, className: "border-gray-400 text-gray-600" },
      SUSPENDED: { label: "Tạm ngưng", variant: "destructive" as const, className: "bg-red-500 text-white" },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: "outline" as const,
      className: "border-gray-400 text-gray-600",
    };
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  const formatLocation = (property: PropertyDetails) => {
    return property.location || "Không rõ";
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  if (loading && properties.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Card className="shadow-lg border-none">
          <CardHeader className="bg-gray-50">
            <CardTitle className="text-xl font-semibold text-gray-800">Quản Lý Bất Động Sản</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <Card className="shadow-lg border-none">
        <CardHeader className="bg-gray-50">
          <CardTitle className="text-xl font-semibold text-gray-800">Quản Lý Bất Động Sản</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-800">
                <RefreshCcw className="h-5 w-5" />
                <p>Lỗi: {error}</p>
              </div>
              <Button
                onClick={() => fetchProperties(0)}
                className="bg-red-600 hover:bg-red-700 text-white"
                size="sm"
                disabled={actionLoading.size > 0}
              >
                Thử lại
              </Button>
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="font-semibold text-gray-700">ID</TableHead>
                <TableHead className="font-semibold text-gray-700">Tiêu đề</TableHead>
                <TableHead className="font-semibold text-gray-700">Host ID</TableHead>
                <TableHead className="font-semibold text-gray-700">Vị trí</TableHead>
                <TableHead className="font-semibold text-gray-700">Giá</TableHead>
                <TableHead className="font-semibold text-gray-700">Loại</TableHead>
                <TableHead className="font-semibold text-gray-700">Trạng thái</TableHead>
                <TableHead className="font-semibold text-gray-700 text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((property) => (
                <TableRow key={property.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium text-gray-800">{property.id}</TableCell>
                  <TableCell className="font-medium text-gray-800">{property.title}</TableCell>
                  <TableCell>{property.host?.id ?? "N/A"}</TableCell>
                  <TableCell className="text-gray-600">{formatLocation(property)}</TableCell>
                  <TableCell className="text-gray-600">{formatPrice(property.basePrice)}</TableCell>
                  <TableCell className="text-gray-600">{property.propertyType}</TableCell>
                  <TableCell>{getStatusBadge(property.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(property.id)}
                        className="border-blue-500 text-blue-500 hover:bg-blue-50"
                        disabled={actionLoading.has(property.id)}
                      >
                        Xem
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleVisibilityClick(property)}
                        className={
                          property.status === "ACTIVE"
                            ? "border-orange-500 text-orange-500 hover:bg-orange-50"
                            : "border-green-500 text-green-500 hover:bg-green-50"
                        }
                        disabled={actionLoading.has(property.id)}
                      >
                        {actionLoading.get(property.id) === "toggle" ? (
                          <RefreshCcw className="h-4 w-4 animate-spin" />
                        ) : (
                          property.status === "ACTIVE" ? "Ẩn" : "Hiển thị"
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(property)}
                        className="border-red-500 text-red-500 hover:bg-red-50"
                        disabled={actionLoading.has(property.id)}
                      >
                        {actionLoading.get(property.id) === "delete" ? (
                          <RefreshCcw className="h-4 w-4 animate-spin" />
                        ) : (
                          "Xóa"
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {properties.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500 flex flex-col items-center gap-2">
              <MapPin className="h-8 w-8 text-gray-400" />
              <p>Không tìm thấy bất động sản</p>
            </div>
          )}
          {hasMore && (
            <div className="flex justify-center mt-6">
              <Button
                onClick={loadMore}
                disabled={loadingMore || actionLoading.size > 0}
                className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2"
              >
                {loadingMore ? "Đang tải..." : "Tải thêm"}
              </Button>
            </div>
          )}
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) setPostActionMessage(null);
            }}
          >
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold">
                  {actionType === "toggle"
                    ? `Xác nhận ${selectedProperty?.status === "ACTIVE" ? "Ẩn" : "Hiển thị"}`
                    : "Xác nhận xóa"}
                </DialogTitle>
                <DialogDescription>
                  {actionType === "toggle"
                    ? `Bạn có chắc muốn ${selectedProperty?.status === "ACTIVE" ? "ẩn" : "hiển thị"} bất động sản "${selectedProperty?.title}"?`
                    : `Bạn có chắc muốn xóa bất động sản "${selectedProperty?.title}"? Hành động này không thể hoàn tác.`}
                </DialogDescription>
              </DialogHeader>
              {postActionMessage && (
                <div
                  className={`p-4 rounded-lg ${
                    postActionMessage.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                  }`}
                >
                  <p>{postActionMessage.message}</p>
                </div>
              )}
              <DialogFooter className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setPostActionMessage(null);
                  }}
                  disabled={!!selectedProperty && actionLoading.has(selectedProperty.id)}
                >
                  {postActionMessage ? "Đóng" : "Hủy"}
                </Button>
                {!postActionMessage && (
                  <Button
                    variant={actionType === "delete" ? "destructive" : "default"}
                    onClick={handleConfirmAction}
                    className={actionType === "delete" ? "bg-red-600 hover:bg-red-700" : ""}
                    disabled={!!selectedProperty && actionLoading.has(selectedProperty.id)}
                  >
                    {selectedProperty && actionLoading.has(selectedProperty.id) ? (
                      <RefreshCcw className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    {actionType === "toggle" ? (selectedProperty?.status === "ACTIVE" ? "Ẩn" : "Hiển thị") : "Xóa"}
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}