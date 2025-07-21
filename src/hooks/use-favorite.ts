'use client';

import { useState, useCallback } from 'react';

interface PropertyDisplay {
  id: string;
  title: string;
  price: string;
  rating: number;
  nights: number;
  image: string;
  isFavorite: boolean;
  isGuestFavorite: boolean;
}

interface Wishlist {
  id: number;
  user_id: number;
  name: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
  properties?: Array<{
    wishlist_id: number;
    property_id: number;
    added_at: string;
    title?: string;
    base_price?: number;
  }>;
}

interface UseFavoriteProps {
  properties: PropertyDisplay[];
  wishlists: Wishlist[];
  userId: number;
  onAddToWishlist?: (propertyId: string, wishlistId: number) => void;
  onRemoveProperty?: (wishlistId: number, propertyId: number) => void;
  setWishlists?: (wishlists: Wishlist[]) => void;
  showMessageModal?: (title: string, message: string, isError: boolean) => void;
}

export function useFavorite({
  properties: initialProperties,
  wishlists: initialWishlists,
  userId,
  onAddToWishlist,
  onRemoveProperty,
  setWishlists,
  showMessageModal,
}: UseFavoriteProps) {
  const [properties, setProperties] = useState<PropertyDisplay[]>(initialProperties);
  const [localWishlists, setLocalWishlists] = useState<Wishlist[]>(initialWishlists);
  const [selectedProperty, setSelectedProperty] = useState<PropertyDisplay | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddToWishlist = useCallback(
    async (wishlistId: number) => {
      if (!selectedProperty) {
        console.error('Invalid state: selectedProperty is null');
        showMessageModal?.('Error', 'No property selected', true);
        return;
      }
      const propertyId = Number(selectedProperty.id);
      console.log('Adding to wishlist:', { userId, wishlistId, propertyId });

      // Optimistic update
      const updatedProperties = properties.map(p =>
        p.id === selectedProperty.id ? { ...p, isFavorite: true } : p
      );
      setProperties(updatedProperties);

      const newProperty = {
        wishlist_id: wishlistId,
        property_id: propertyId,
        added_at: new Date().toISOString(),
        title: selectedProperty.title,
        base_price: parseFloat(selectedProperty.price.replace('$', '')),
      };
      const updatedWishlists = localWishlists.map(w =>
        w.id === wishlistId ? { ...w, properties: [...(w.properties || []), newProperty] } : w
      );
      setLocalWishlists(updatedWishlists);
      setWishlists?.(updatedWishlists);

      try {
        const response = await fetch(`/api/wishlist/${userId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'addProperty', wishlistId, propertyIds: [propertyId] }),
        });
        if (!response.ok) {
          throw new Error(`API error: ${await response.text()}`);
        }
        onAddToWishlist?.(selectedProperty.id, wishlistId);
        showMessageModal?.('Success', `Added "${selectedProperty.title}" to wishlist`, false);
      } catch (error) {
        console.error('Error adding to wishlist:', error);
        setProperties(properties);
        setLocalWishlists(localWishlists);
        setWishlists?.(localWishlists);
        showMessageModal?.('Error', 'Failed to add property to wishlist', true);
      }
      setIsModalOpen(false);
    },
    [selectedProperty, userId, properties, localWishlists, onAddToWishlist, setWishlists, showMessageModal]
  );

  const handleRemoveFromWishlist = useCallback(
    async (wishlistId: number, propertyId: number) => {
      console.log('Removing from wishlist:', { userId, wishlistId, propertyId });

      const originalProperties = [...properties];
      const originalWishlists = [...localWishlists];

      // Optimistic update for wishlists
      const updatedWishlists = localWishlists.map(w =>
        w.id === wishlistId ? { ...w, properties: w.properties?.filter(p => p.property_id !== propertyId) || [] } : w
      );
      setLocalWishlists(updatedWishlists);
      setWishlists?.(updatedWishlists);

      // Optimistic update for properties
      const isStillFavorite = updatedWishlists.some(w => w.properties?.some(p => p.property_id === propertyId));
      const updatedProperties = properties.map(p =>
        p.id === String(propertyId) ? { ...p, isFavorite: isStillFavorite } : p
      );
      setProperties(updatedProperties);

      try {
        const response = await fetch(`/api/wishlist/${userId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'removeProperty', wishlistId, propertyIds: [propertyId] }),
        });
        const responseText = await response.text();
        console.log('Remove API Response:', { status: response.status, body: responseText });
        if (!response.ok) {
          throw new Error(`API error: ${responseText}`);
        }
        onRemoveProperty?.(wishlistId, propertyId);
        showMessageModal?.('Success', `Removed property from wishlist`, false);
      } catch (error) {
        console.error('Error removing from wishlist:', error);
        setProperties(originalProperties);
        setLocalWishlists(originalWishlists);
        setWishlists?.(originalWishlists);
        showMessageModal?.('Error', 'Failed to remove property from wishlist', true);
      }
    },
    [userId, properties, localWishlists, onRemoveProperty, setWishlists, showMessageModal]
  );

  const togglePropertyFavorite = useCallback(
    async (property: PropertyDisplay, wishlistId?: number) => {
      const propertyId = Number(property.id);
      console.log('togglePropertyFavorite:', { id: property.id, isFavorite: property.isFavorite, wishlistId });

      if (property.isFavorite) {
        const wishlistsWithProperty = localWishlists.filter(w =>
          w.properties?.some(p => p.property_id === propertyId)
        );
        if (wishlistsWithProperty.length === 0) {
          console.warn('No wishlists found containing property:', property.id);
          showMessageModal?.('Error', 'Property not found in any wishlist', true);
          return;
        }

        try {
          // Remove from all wishlists
          for (const w of wishlistsWithProperty) {
            await handleRemoveFromWishlist(w.id, propertyId);
            console.log(`Removed property ${propertyId} from wishlist ${w.id}`);
          }

          // Force update isFavorite to false since property is removed from all wishlists
          const updatedProperties = properties.map(p =>
            p.id === property.id ? { ...p, isFavorite: false } : p
          );
          setProperties(updatedProperties);
          console.log('Updated properties after removal:', updatedProperties.map(p => ({ id: p.id, isFavorite: p.isFavorite })));

          showMessageModal?.('Success', `Removed "${property.title}" from all wishlists`, false);
        } catch (error) {
          console.error('Error during removal process:', error);
          showMessageModal?.('Error', 'Failed to remove property from wishlists', true);
        }
      } else {
        setSelectedProperty(property);
        setIsModalOpen(true);
      }
    },
    [properties, localWishlists, handleRemoveFromWishlist, showMessageModal]
  );

  return {
    properties,
    selectedProperty,
    isModalOpen,
    setIsModalOpen,
    handleAddToWishlist,
    handleRemoveFromWishlist,
    togglePropertyFavorite,
  };
}