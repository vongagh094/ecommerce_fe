'use client';

import Image from 'next/image';
import { Heart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useFavorite } from '@/hooks/use-favorite';
import { useState, useEffect } from 'react';

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

interface PropertyGridProps {
  properties: PropertyDisplay[];
  wishlists: Wishlist[];
  userId: number;
  onRemoveProperty?: (wishlistId: number, propertyId: number) => void;
  onAddToWishlist?: (propertyId: string, wishlistId: number) => void;
  onWishlistCreated?: (newWishlist: Wishlist) => void;
  setWishlists?: (wishlists: Wishlist[]) => void;
  selectedWishlistId?: number | null;
  showMessageModal?: (title: string, message: string, isError: boolean) => void;
}

export function PropertyGrid({
  properties: initialProperties,
  wishlists: initialWishlists,
  userId,
  onRemoveProperty,
  onAddToWishlist,
  onWishlistCreated,
  setWishlists,
  selectedWishlistId,
  showMessageModal,
}: PropertyGridProps) {
  const [properties, setProperties] = useState<PropertyDisplay[]>(initialProperties);
  const [wishlists, setLocalWishlists] = useState<Wishlist[]>(initialWishlists);
  const [visibleCount, setVisibleCount] = useState(12);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newWishlistName, setNewWishlistName] = useState('');

  const {
    properties: favoriteProperties,
    selectedProperty,
    isModalOpen,
    setIsModalOpen,
    handleAddToWishlist,
    togglePropertyFavorite,
  } = useFavorite({
    properties,
    wishlists,
    userId,
    onAddToWishlist,
    onRemoveProperty,
    setWishlists: setLocalWishlists,
    showMessageModal,
  });

  // Sync local properties with favoriteProperties
  useEffect(() => {
    setProperties(favoriteProperties);
    console.log('Properties updated in PropertyGrid:', favoriteProperties.map(p => ({ id: p.id, isFavorite: p.isFavorite })));
  }, [favoriteProperties]);

  const handleCreateWishlist = async () => {
    if (!newWishlistName.trim()) {
      showMessageModal?.('Error', 'Wishlist name cannot be empty', true);
      return;
    }
    try {
      console.log('Creating wishlist:', { name: newWishlistName });
      const response = await fetch(`/api/wishlist/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          name: newWishlistName,
          is_private: false,
        }),
      });
      if (!response.ok) {
        throw new Error(`API error: ${await response.text()}`);
      }
      const newWishlist = await response.json();
      onWishlistCreated?.(newWishlist);
      const updatedWishlists = [...wishlists, newWishlist];
      setLocalWishlists(updatedWishlists);
      setWishlists?.(updatedWishlists);
      setNewWishlistName('');
      setIsCreateModalOpen(false);
      if (selectedProperty) {
        await handleAddToWishlist(newWishlist.id);
      } else {
        showMessageModal?.('Success', `Wishlist "${newWishlistName}" created successfully`, false);
      }
    } catch (error) {
      console.error('Error creating wishlist:', error);
      showMessageModal?.('Error', 'Error creating wishlist', true);
    }
  };

  const loadMore = () => {
    setVisibleCount((prev) => prev + 12);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {properties.slice(0, visibleCount).map((property) => (
          <Link key={property.id} href={`/property/${property.id}`} className="group cursor-pointer block">
            <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
              <Image
                src={property.image || '/placeholder.svg'}
                alt={property.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Heart button clicked:', { id: property.id, isFavorite: property.isFavorite });
                  togglePropertyFavorite(property, selectedWishlistId || undefined);
                }}
                className="absolute top-3 right-3 p-2 hover:scale-110 transition-transform"
              >
                <Heart
                  className={`h-5 w-5 ${property.isFavorite ? 'fill-rose-500 text-rose-500' : 'fill-black/50 text-white'}`}
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
                <span className="font-semibold text-gray-900">{property.price}</span> for {property.nights} night
              </p>
            </div>
          </Link>
        ))}
      </div>

      {properties.length > 12 && visibleCount < properties.length && (
        <div className="text-center mt-12">
          <div className="mb-6">
            <h3 className="text-xl font-medium text-gray-900 mb-2">Continue exploring amazing views</h3>
          </div>
          <Button variant="outline" className="bg-gray-900 text-white hover:bg-gray-800 border-gray-900" onClick={loadMore}>
            Show more
          </Button>
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-gray-900">
              Add to Wishlist
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Wishlist</label>
              <select
                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                onChange={(e) => handleAddToWishlist(Number(e.target.value))}
              >
                <option value="">Choose a wishlist</option>
                {wishlists.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-600 mt-2">
                Or you can create a new wishlist to save "{selectedProperty?.title}".
              </p>
              <Button
                onClick={() => {
                  setIsModalOpen(false);
                  setIsCreateModalOpen(true);
                }}
                className="mt-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create New Wishlist
              </Button>
            </div>
          </div>
          <DialogFooter className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-gray-900">Create New Wishlist</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Wishlist Name</label>
              <Input
                value={newWishlistName}
                onChange={(e) => setNewWishlistName(e.target.value)}
                placeholder="Enter wishlist name"
                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900"
              />
            </div>
          </div>
          <DialogFooter className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setNewWishlistName('');
                setIsCreateModalOpen(false);
              }}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateWishlist}
              className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}