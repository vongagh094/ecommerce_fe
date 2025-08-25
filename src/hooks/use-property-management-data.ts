"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { PropertyDetails } from "@/types/property";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export function usePropertyManagementData() {
  const [properties, setProperties] = useState<PropertyDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [actionLoading, setActionLoading] = useState<Map<number, "toggle" | "delete">>(new Map());
  const [postActionMessage, setPostActionMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const limit = 50;

  const fetchProperties = async (currentOffset: number, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await axios.get(`${apiUrl}/properties-host/list`, {
        params: { limit, offset: currentOffset },
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      const data = response.data;
      const mappedProperties: PropertyDetails[] = data.map((prop: any) => ({
        id: prop.id || 0,
        title: prop.title || "Chưa có tiêu đề",
        location: `${prop.city ?? "Không rõ"}${prop.state ? `, ${prop.state}` : ""}${prop.country ? `, ${prop.country}` : ""}`,
        propertyType: prop.property_type || "Không rõ",
        category: prop.category || "Không rõ",
        status: prop.status || "DRAFT",
        maxGuests: prop.max_guests || 1,
        bedrooms: prop.bedrooms || null,
        bathrooms: prop.bathrooms || null,
        basePrice: prop.base_price || 0,
        cleaningFee: prop.cleaning_fee || null,
        cancellationPolicy: prop.cancellation_policy || "FLEXIBLE",
        instantBook: prop.instant_book || false,
        minimumStay: prop.minimum_stay || 1,
        images: prop.images?.map((img: any) => ({
          id: img.id || null,
          url: img.image_url || "/placeholder.svg?height=200&width=300",
          isPrimary: img.is_primary || false,
          displayOrder: img.display_order || 0,
          altText: img.alt_text || null,
          title: img.title || null,
        })) || [{ id: null, url: "/placeholder.svg?height=200&width=300", isPrimary: false, displayOrder: 0 }],
        amenities: prop.amenities?.map((a: any) => ({
          id: a.id || "",
          name: a.name || "Không rõ",
          category: a.category || "Không rõ",
          description: a.description || null,
        })) || null,
        host: prop.host
          ? {
            id: prop.host_id || prop.host.host_id || 0,
            rating: prop.host.host_rating_average || 0,
          }
          : null,
        createdAt: new Date(prop.created_at || Date.now()),
        updatedAt: prop.updated_at ? new Date(prop.updated_at) : null,
        postal_code: prop.postal_code || null,
        latitude: prop.latitude || null,
        longitude: prop.longitude || null,
        address_line1: prop.address_line1 || null,
        city: prop.city ?? "Không rõ",
        state: prop.state || null,
        country: prop.country || "Không rõ",
      }));

      setProperties((prev) => (append ? [...prev, ...mappedProperties] : mappedProperties));
      setHasMore(data.length === limit);
      setError(null);
    } catch (err) {
      const errorMessage = "Không thể tải danh sách bất động sản do lỗi máy chủ.";
      setError(errorMessage);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    const newOffset = offset + limit;
    setOffset(newOffset);
    fetchProperties(newOffset, true);
  };

  const togglePropertyStatus = async (propertyId: number) => {
    try {
      setActionLoading((prev) => new Map(prev).set(propertyId, "toggle"))
      setPostActionMessage(null)
      const property = properties.find((p) => p.id === propertyId)
      if (!property) return

      const newStatus = property.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
      const formData = new FormData()
      formData.append("data", JSON.stringify({ status: newStatus }))
      console.log("Sending toggle request for property", propertyId, "with FormData data:", { status: newStatus })

      const response = await fetch(`${apiUrl}/properties-host/update/${propertyId}`, {
        method: "PUT",
        body: formData,
      })

      const responseBody = await response.json()
      console.log("Toggle response status:", response.status, "Response body:", responseBody)

      if (!response.ok) {
        throw new Error(responseBody.detail?.detail || `Không thể cập nhật trạng thái bất động sản (HTTP ${response.status})`)
      }

      setProperties((prev) =>
        prev.map((p) =>
          p.id === propertyId
            ? {
              ...p,
              status: responseBody.status || newStatus,
            }
            : p
        )
      )
      setPostActionMessage({
        type: "success",
        message: `Bất động sản "${property.title}" đã được ${newStatus === "ACTIVE" ? "hiển thị" : "ẩn"}.`,
      })
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái bất động sản:", err)
      const errorMessage = err instanceof Error ? err.message : "Không thể cập nhật trạng thái bất động sản"
      setError(errorMessage)
      setPostActionMessage({ type: "error", message: errorMessage })
    } finally {
      setActionLoading((prev) => {
        const newMap = new Map(prev)
        newMap.delete(propertyId)
        return newMap
      })
    }
  }

  const deleteProperty = async (propertyId: number) => {
    try {
      setActionLoading((prev) => new Map(prev).set(propertyId, "delete"));
      setPostActionMessage(null);
      const property = properties.find((p) => p.id === propertyId);
      if (!property) return;

      await axios.delete(`${apiUrl}/properties-host/delete/${propertyId}`);

      setProperties((prev) => prev.filter((p) => p.id !== propertyId));
      setPostActionMessage({
        type: "success",
        message: `Bất động sản "${property.title}" đã được xóa.`,
      });
    } catch (err) {
      const errorMessage = "Không thể xóa bất động sản";
      setError(errorMessage);
      setPostActionMessage({ type: "error", message: errorMessage });
    } finally {
      setActionLoading((prev) => {
        const newMap = new Map(prev);
        newMap.delete(propertyId);
        return newMap;
      });
    }
  };

  useEffect(() => {
    fetchProperties(0);
  }, []);

  return {
    properties,
    loading,
    error,
    hasMore,
    loadingMore,
    actionLoading,
    postActionMessage,
    setPostActionMessage, // Added to fix the error
    fetchProperties,
    loadMore,
    togglePropertyStatus,
    deleteProperty,
  };
}