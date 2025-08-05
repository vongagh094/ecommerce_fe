"use client";

import { useState, useCallback, useRef } from "react";
import { PropertyDisplay, WishlistResponseDTO } from "@/types/index";

const apiUrl = "http://127.0.0.1:8000";

export function useWishlist(userId: number, wishlistOnly: boolean = false) {
  const [properties, setProperties] = useState<PropertyDisplay[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isFetchingRef = useRef(false);

  const fetchProperties = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);
    try {
      console.log("Fetching wishlist property IDs...");
      const wishlistResponse = await fetch(`${apiUrl}/wishlist/${userId}/properties`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      let wishlistData: WishlistResponseDTO = { property_ids: [] };
      if (wishlistResponse.ok) {
        wishlistData = await wishlistResponse.json();
      } else {
        const errorData = await wishlistResponse.json().catch(() => ({}));
        console.warn("Wishlist fetch error:", errorData);
      }
      const wishlistPropertyIds = wishlistData.property_ids || [];
      console.log("Wishlist property IDs:", wishlistPropertyIds);

      if (wishlistOnly && wishlistPropertyIds.length === 0) {
        setProperties([]);
        setError("Danh sách yêu thích trống.");
        return;
      }

      console.log("Fetching properties...");
      const response = await fetch(`${apiUrl}/properties/list?limit=${wishlistOnly ? 100 : 12}&offset=0`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Properties fetch error:", errorData);
        throw new Error(
          errorData.detail?.detail || `Không thể tải danh sách bất động sản: HTTP ${response.status}`
        );
      }
      const data = await response.json();
      console.log("Properties response:", data);
      if (!Array.isArray(data)) {
        throw new Error("Dữ liệu bất động sản không phải là mảng");
      }
      const mappedProperties: PropertyDisplay[] = data
        .filter((property: any) => property.id && (!wishlistOnly || wishlistPropertyIds.includes(property.id)))
        .map((property: any) => ({
          id: property.id.toString(),
          title: property.title || "Untitled Property",
          price: `₫${(property.base_price || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
          rating: property.host?.host_rating_average || 4.5,
          nights: 1,
          image: property.images?.find((img: any) => img.is_primary)?.image_url || "/placeholder.svg",
          isFavorite: wishlistPropertyIds.includes(property.id),
          isGuestFavorite: property.is_guest_favorite || false,
        }));
      console.log("Mapped properties:", mappedProperties);
      setProperties(mappedProperties);
      if (mappedProperties.length === 0) {
        setError(wishlistOnly ? "Danh sách yêu thích trống." : "Không tìm thấy bất động sản nào.");
      }
    } catch (err: any) {
      console.error("fetchProperties error:", err);
      setError(err.message || (wishlistOnly ? "Không thể tải danh sách yêu thích." : "Không thể tải bất động sản."));
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [userId, wishlistOnly]);

  const handleFavoriteToggle = useCallback(
    async (propertyId: string, isFavorite: boolean) => {
      try {
        const endpoint = isFavorite
          ? `${apiUrl}/wishlist/${userId}/add-property?property_id=${propertyId}`
          : `${apiUrl}/wishlist/${userId}/remove-property/${propertyId}`;
        const method = isFavorite ? "POST" : "DELETE";
        console.log(`Toggling favorite: propertyId=${propertyId}, isFavorite=${isFavorite}`);

        // Optimistic update
        if (wishlistOnly && !isFavorite) {
          setProperties((prev) => prev.filter((p) => p.id !== propertyId));
        } else {
          setProperties((prev) =>
            prev.map((p) => (p.id === propertyId ? { ...p, isFavorite } : p))
          );
        }

        const response = await fetch(endpoint, {
          method,
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch (e) {
            errorData = { detail: { detail: `HTTP ${response.status}` } };
          }
          console.error("Favorite toggle error:", errorData);
          if (
            errorData.detail?.detail?.includes("Bất động sản đã có trong wishlist") ||
            errorData.detail?.detail?.includes("đã tồn tại")
          ) {
            return; // Property already in wishlist, no need to update
          }
          throw new Error(
            errorData.detail?.detail ||
              errorData.message ||
              `Không thể ${isFavorite ? "thêm vào" : "xóa khỏi"} wishlist: HTTP ${response.status}`
          );
        }

        const updatedWishlist: WishlistResponseDTO = await response.json();
        console.log("Updated wishlist:", updatedWishlist);

        // Update properties to reflect the new wishlist state
        setProperties((prev) =>
          wishlistOnly
            ? prev
                .filter((p) => updatedWishlist.property_ids.includes(parseInt(p.id)))
                .map((p) => ({
                  ...p,
                  isFavorite: true,
                }))
            : prev.map((p) => ({
                ...p,
                isFavorite: updatedWishlist.property_ids.includes(parseInt(p.id)),
              }))
        );
        setError(null);
      } catch (error: any) {
        console.error("handleFavoriteToggle error:", error.message, error);
        // Refetch to ensure consistency
        await fetchProperties();
        throw error; // Re-throw for PropertyGrid to handle
      }
    },
    [fetchProperties, userId, wishlistOnly]
  );

  return {
    properties,
    error,
    isLoading,
    fetchProperties,
    handleFavoriteToggle,
  };
}