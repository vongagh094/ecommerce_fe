'use client';

import { useState, useEffect, useCallback, useMemo, act } from 'react';
import { Heart, Loader2, Trash2, Pencil, Lock, Globe } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PropertyGrid } from '@/components/traveller/property-grid';
import { Wishlist, WishlistProperty } from '@/types';

export default function WishlistsPage() {
  const [selectedWishlistId, setSelectedWishlistId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [currentProperties, setCurrentProperties] = useState<WishlistProperty[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<WishlistProperty | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'private' | 'public'>('private');
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editWishlistId, setEditWishlistId] = useState<number | null>(null);
  const [editWishlistName, setEditWishlistName] = useState('');
  const [messageModalContent, setMessageModalContent] = useState<{ title: string; description: string; isError?: boolean }>({ title: '', description: '' });
  const [confirmModalConfig, setConfirmModalConfig] = useState<{ wishlistId: number | null; onConfirm: () => void }>({ wishlistId: null, onConfirm: () => { } });
  const userId = 1; 

  useEffect(() => {
    fetchWishlists();
  }, []);

  const fetchWishlists = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/wishlist/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch wishlists');
      }
      const data = await response.json();
      console.log('Fetched wishlists:', data);
      setWishlists(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching wishlists:', error);
    }
    setLoading(false);
  }, [userId]);

  const mapProperties = useCallback((propertiesData: any[]) => {
    return propertiesData && Array.isArray(propertiesData) && propertiesData.length > 0
      ? propertiesData.map((p: any) => {
        if (p.title && p.base_price && p.property_id && p.wishlist_id && p.added_at) {
          return {
            wishlist_id: p.wishlist_id,
            property_id: p.property_id,
            added_at: p.added_at,
            property: {
              id: p.property_id.toString(),
              title: p.title,
              description: null,
              property_type: '',
              category: '',
              max_guests: 0,
              bedrooms: 0,
              bathrooms: 0,
              address_line1: '',
              city: '',
              state: '',
              country: '',
              postal_code: '',
              latitude: '',
              longitude: '',
              base_price: p.base_price,
              cancellation_policy: '',
              instant_book: false,
              minimum_stay: 0,
              status: '',
              hostId: '',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          };
        }
        return null;
      }).filter(p => p !== null)
      : [];
  }, []);

  const handleSelectWishlist = useCallback(async (wishlistId: number) => {
    setLoading(true);
    try {
      setSelectedWishlistId(wishlistId);
      const response = await fetch(`/api/wishlist/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'select', wishlistId }),
      });
      if (!response.ok) {
        throw new Error('Failed to select wishlist');
      }
      const data = await response.json();
      console.log('Selected wishlist data:', data);
      let selectedWishlistData: Wishlist;
      if (Array.isArray(data)) {
        selectedWishlistData = data.find((w: Wishlist) => w.id === wishlistId) || {
          id: wishlistId,
          user_id: userId,
          name: '',
          is_private: false,
          created_at: '',
          updated_at: '',
          properties: undefined,
        };
      } else {
        selectedWishlistData = data;
      }
      console.log('Selected wishlist properties:', selectedWishlistData.properties);
      const properties = mapProperties(selectedWishlistData.properties || []);
      setCurrentProperties(properties);
    } catch (error) {
      console.error('Error selecting wishlist:', error);
    }
    setLoading(false);
  }, [userId, mapProperties]);

  const handleDeleteWishlist = async (wishlistId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/wishlist/${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wishlistId }),
      });
      if (!response.ok) {
        throw new Error('Failed to delete wishlist');
      }
      await fetchWishlists();
      if (selectedWishlistId === wishlistId) {
        setSelectedWishlistId(null);
      }
    } catch (error) {
      console.error('Error deleting wishlist:', error);
    }
    setLoading(false);
  };

  const handleEditWishlist = async (wishlistId: number, newName: string) => {
    if (!newName.trim()) {
      return;
    }
    setLoading(true);
    try {
      const is_private = activeTab === 'private' ? true : false;
      const response = await fetch(`/api/wishlist/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', wishlistId, name: newName, is_private: is_private }),
      });
      if (!response.ok) {
        throw new Error('Failed to update wishlist');
      }
      await fetchWishlists(); 
    } catch (error) {
      console.error('Error editing wishlist:', error);
    }
    setLoading(false);
  };

  const handleTogglePrivacy = async (wishlistId: number, currentIsPrivate: boolean) => {
    setLoading(true);
    try {
      const newIsPrivate = !currentIsPrivate;
      const response = await fetch(`/api/wishlist/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          wishlistId,
          name: wishlists.find(w => w.id === wishlistId)?.name || '',
          is_private: newIsPrivate,
        }),
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      await fetchWishlists(); 
      if (selectedWishlistId === wishlistId) {
        setSelectedWishlistId(null);
      }
    } catch (error) {
      console.error('Error toggling wishlist privacy:', error);
    }
    setLoading(false);
  };

  const handleRemoveProperty = async (wishlistId: number, propertyId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/wishlist/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'removeProperty', wishlistId, propertyIds: [propertyId] }),
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const data = await response.json();
      const properties = mapProperties(data.properties || []);
      setCurrentProperties(properties);
    } catch (error) {
      console.error('Error removing property:', error);
    }
    setLoading(false);
    setIsModalOpen(false);
  };

  const handleOpenModal = (property: WishlistProperty) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  const handleOpenConfirmModal = (wishlistId: number) => {
    setConfirmModalConfig({
      wishlistId,
      onConfirm: () => {
        handleDeleteWishlist(wishlistId);
        setIsConfirmModalOpen(false);
      },
    });
    setIsConfirmModalOpen(true);
  };

  const handleOpenEditModal = (wishlistId: number, currentName: string) => {
    setEditWishlistId(wishlistId);
    setEditWishlistName(currentName);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (editWishlistId) {
      handleEditWishlist(editWishlistId, editWishlistName);
      setIsEditModalOpen(false);
      setEditWishlistId(null);
      setEditWishlistName('');
    }
  };

  const memoizedProperties = useMemo(() => {
    return currentProperties.map(wp => {
      console.log('Mapping property:', wp);
      const prop = wp.property || { title: 'Unnamed Property', base_price: 0 };
      return {
        id: wp.property_id ? wp.property_id.toString() : '',
        title: prop.title,
        price: `₫${(prop.base_price || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
        rating: 4.33,
        nights: 2,
        image: "/placeholder.svg?height=300&width=400",
        isFavorite: currentProperties.some(p => p.property_id === wp.property_id),
        isGuestFavorite: false,
      };
    });
  }, [currentProperties]);

  const filteredWishlists = wishlists.filter(w => w.is_private === (activeTab === 'private'));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-lg font-medium text-gray-700">Loading wishlists...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Your Wishlists</h1>
        </div>

        {selectedWishlistId === null ? (
          <>
            <div className="mb-6 flex space-x-4 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('private')}
                className={`pb-2 px-4 text-sm font-medium ${activeTab === 'private'
                    ? 'border-b-2 border-blue-500 text-blue-500'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Private Wishlists
              </button>
              <button
                onClick={() => setActiveTab('public')}
                className={`pb-2 px-4 text-sm font-medium ${activeTab === 'public'
                    ? 'border-b-2 border-blue-500 text-blue-500'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Public Wishlists
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWishlists.length === 0 ? (
                <div className="col-span-full bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100">
                  <Heart className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                  <p className="text-xl font-semibold text-gray-700 mb-4">
                    No {activeTab === 'private' ? 'private' : 'public'} wishlists yet
                  </p>
                  <p className="text-gray-500 mb-6">You cannot create a new wishlist. Please contact the administrator!</p>
                </div>
              ) : (
                filteredWishlists.map((wishlist) => (
                  <div
                    key={wishlist.id}
                    className={`group rounded-2xl p-6 shadow-lg border transition-all duration-300 cursor-pointer relative ${wishlist.is_private
                        ? 'bg-blue-50 border-blue-200 hover:shadow-xl'
                        : 'bg-white border-gray-100 hover:shadow-xl'
                      }`}
                    onClick={() => handleSelectWishlist(wishlist.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        {wishlist.is_private ? (
                          <Lock className="h-5 w-5 text-blue-500" />
                        ) : (
                          <Globe className="h-5 w-5 text-green-500" />
                        )}
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900 mb-2">{wishlist.name}</h2>
                          <p className="text-sm text-gray-500">
                            {wishlist.is_private ? 'Private' : 'Public'} · Created: {new Date(wishlist.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePrivacy(wishlist.id, wishlist.is_private);
                          }}
                          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                          title={wishlist.is_private ? 'Make Public' : 'Make Private'}
                        >
                          {wishlist.is_private ? (
                            <Globe className="h-5 w-5" />
                          ) : (
                            <Lock className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditModal(wishlist.id, wishlist.name);
                          }}
                          className="p-2 text-blue-500 hover:text-blue-600 transition-colors"
                        >
                          <Pencil className="h-5 w-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenConfirmModal(wishlist.id);
                          }}
                          className="p-2 text-red-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">
                {wishlists.find((w) => w.id === selectedWishlistId)?.name || 'Wishlist'}
              </h2>
              <button
                onClick={() => setSelectedWishlistId(null)}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
              >
                <svg
                  className="w-5 h-5 mr-2 -ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            </div>

            {currentProperties.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100">
                <Heart className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                <p className="text-xl font-semibold text-gray-700 mb-4">No properties in this wishlist</p>
                <p className="text-gray-500 mb-6">Add some properties by editing!</p>
              </div>
            ) : (
              <PropertyGrid
                properties={memoizedProperties}
                wishlists={wishlists}
                userId={userId}
                onRemoveProperty={handleRemoveProperty}
                selectedWishlistId={selectedWishlistId}
              />
            )}
          </div>
        )}

        {/* <WishlistModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          wishlists={wishlists}
          selectedProperty={selectedProperty}
          onRemoveProperty={handleRemoveProperty}
          selectedWishlistId={selectedWishlistId}
        /> */}

        <Dialog open={isMessageModalOpen} onOpenChange={setIsMessageModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className={messageModalContent.isError ? 'text-red-500' : 'text-green-500'}>
                {messageModalContent.title}
              </DialogTitle>
              <DialogDescription>{messageModalContent.description}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setIsMessageModalOpen(false)}>OK</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>Are you sure you want to delete this wishlist?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConfirmModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (confirmModalConfig.wishlistId) {
                    confirmModalConfig.onConfirm();
                  }
                }}
              >
                Yes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Wishlist Name</DialogTitle>
              <DialogDescription>Enter a new name for your wishlist.</DialogDescription>
            </DialogHeader>
            <div className="my-4">
              <Input
                value={editWishlistName}
                onChange={(e) => setEditWishlistName(e.target.value)}
                placeholder="Wishlist name"
                className="w-full"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}