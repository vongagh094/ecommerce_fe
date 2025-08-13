"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PropertyDisplay } from "@/types/index";

interface PropertyGridProps {
  properties: PropertyDisplay[];
  userId: number;
  onFavoriteToggle?: (propertyId: string, isFavorite: boolean) => Promise<void>;
  setMessageModalContent?: (content: { title: string; description: string; isError?: boolean }) => void;
  setIsMessageModalOpen?: (open: boolean) => void;
}

const apiUrl = "http://127.0.0.1:8000";

export function PropertyGrid({
  properties: initialProperties,
  userId,
  onFavoriteToggle,
  setMessageModalContent,
  setIsMessageModalOpen,
}: PropertyGridProps) {
  const [properties, setProperties] = useState<PropertyDisplay[]>(initialProperties);
  const [visibleCount, setVisibleCount] = useState(12);

  const handleToggleFavorite = useCallback(
    async (property: PropertyDisplay, action: "add" | "remove") => {
      const propertyId = property.id;
      try {
        console.log(`Checking wishlist for userId=${userId}`);
        const checkResponse = await fetch(`${apiUrl}/wishlist/check?user_id=${userId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!checkResponse.ok) {
          const errorData = await checkResponse.json().catch(() => ({}));
          console.error("Wishlist check error:", errorData);
          throw new Error(errorData.detail?.detail || `Không thể kiểm tra wishlist: HTTP ${checkResponse.status}`);
        }
        const checkData = await checkResponse.json();
        if (!checkData.exists && action === "add") {
          console.log("Wishlist does not exist, creating one...");
          const createResponse = await fetch(`${apiUrl}/wishlist/create?user_id=${userId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
          if (!createResponse.ok) {
            const errorData = await createResponse.json().catch(() => ({}));
            console.error("Wishlist creation error:", errorData);
            throw new Error(errorData.detail?.detail || `Không thể tạo wishlist: HTTP ${createResponse.status}`);
          }
          console.log("Wishlist created successfully");
        }

        const endpoint =
          action === "add"
            ? `${apiUrl}/wishlist/${userId}/add-property?property_id=${propertyId}`
            : `${apiUrl}/wishlist/${userId}/remove-property/${propertyId}`;
        const method = action === "add" ? "POST" : "DELETE";
        console.log(`Toggling favorite: propertyId=${propertyId}, action=${action}`);

        // Optimistic update
        if (action === "remove") {
          setProperties((prev) => prev.filter((p) => p.id !== propertyId));
        } else {
          setProperties((prev) =>
            prev.map((p) =>
              p.id === propertyId ? { ...p, isFavorite: true } : p
            )
          );
        }
        await onFavoriteToggle?.(propertyId, action === "add");
      } catch (error: any) {
        console.error(`handleToggleFavorite error: ${error.message}`);
        // Revert optimistic update
        if (action === "remove") {
          // Refetch will handle restoration if needed
        } else {
          setProperties((prev) =>
            prev.map((p) =>
              p.id === propertyId ? { ...p, isFavorite: false } : p
            )
          );
        }
        await onFavoriteToggle?.(propertyId, action !== "add");
        let description = error.message || `Không thể ${action === "add" ? "thêm" : "xóa"} bất động sản`;
        if (error.message.includes("Bất động sản đã có trong wishlist") || error.message.includes("đã tồn tại")) {
          description = "Bất động sản này đã có trong wishlist của bạn.";
        }
        setMessageModalContent?.({
          title: "Thông báo",
          description,
          isError: true,
        });
        setIsMessageModalOpen?.(true);
      }
    },
    [onFavoriteToggle, setMessageModalContent, setIsMessageModalOpen, userId]
  );

  const loadMore = () => {
    setVisibleCount((prev) => prev + 12);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {properties.slice(0, visibleCount).map((property) => (
          <div key={property.id} className="group cursor-pointer block">
            <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
              <Image
                src={property.image || "/placeholder.svg"}
                alt={property.title || "Property Image"}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleToggleFavorite(property, property.isFavorite ? "remove" : "add");
                }}
                className="absolute top-3 right-3 p-2 hover:scale-110 transition-transform"
              >
                <Heart
                  className={`h-5 w-5 ${
                    property.isFavorite
                      ? "fill-rose-500 text-rose-500"
                      : "fill-black/50 text-white"
                  }`}
                />
              </button>
              {property.isGuestFavorite && (
                <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-full text-xs font-medium">
                  Guest favorite
                </div>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900 truncate">{property.title}</h3>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-current text-gray-900" />
                  <span className="text-sm text-gray-900">{property.rating}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{property.price}</span> for{" "}
                {property.nights} night
              </p>
            </div>
          </div>
        ))}
      </div>

      {properties.length > 12 && visibleCount < properties.length && (
        <div className="text-center mt-12">
          <div className="mb-6">
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Tiếp tục khám phá những điểm đến tuyệt vời
            </h3>
          </div>
          <Button
            variant="outline"
            className="bg-gray-900 text-white hover:bg-gray-800 border-gray-900"
            onClick={loadMore}
          >
            Xem thêm
          </Button>
        </div>
      )}
    </div>
  );
}