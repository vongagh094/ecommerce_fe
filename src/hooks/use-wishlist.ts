import { useState, useCallback, useEffect } from 'react';

interface Wishlist {
  id: number;
  user_id: number;
  name: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

interface Property {
  id: number;
  title: string;
  description: string | null;
  city: string;
  base_price: number;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
}

interface WishlistProperty {
  wishlist_id: number;
  property_id: number;
  added_at: string;
  property: Property;
}

export const useWishlists = (userId: number = 1) => {
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [currentProperties, setCurrentProperties] = useState<WishlistProperty[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWishlists = useCallback(async () => {
    setLoading(true);
    try {
      console.log(`Fetching wishlists for user ${userId}`);
      const response = await fetch(`http://localhost:8000/wishlists/user/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch wishlists: ${response.status}`);
      }
      const data = await response.json();
      console.log('Wishlists fetched:', data);
      setWishlists(data);
      setError(null);
    } catch (err: any) {
      setError('Failed to fetch wishlists');
      console.error('Error fetching wishlists:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Fetching properties');
      const response = await fetch('http://localhost:8000/properties', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch properties: ${response.status}`);
      }
      const data = await response.json();
      console.log('Properties fetched:', data);
      setProperties(data);
      setError(null);
    } catch (err: any) {
      setError('Failed to fetch properties');
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWishlistProperties = useCallback(async (wishlistId: number) => {
    setLoading(true);
    try {
      console.log(`Fetching properties for wishlist ${wishlistId}`);
      const response = await fetch(`http://localhost:8000/wishlists/${wishlistId}/properties`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch properties: ${response.status}`);
      }
      const data = await response.json();
      console.log('Wishlist properties fetched:', data);
      setCurrentProperties(data);
      setError(null);
    } catch (err: any) {
      setError('Failed to fetch wishlist properties');
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addPropertyToWishlist = useCallback(async (wishlistId: number, propertyId: number) => {
    setLoading(true);
    try {
      console.log(`Adding property ${propertyId} to wishlist ${wishlistId}`);
      const response = await fetch(`http://localhost:8000/wishlists/${wishlistId}/properties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ property_id: propertyId }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to add property: ${response.status}`);
      }
      console.log(`Added property ${propertyId} to wishlist ${wishlistId}`);
      await fetchWishlistProperties(wishlistId);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error adding property:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchWishlistProperties]);

  const removePropertyFromWishlist = useCallback(async (wishlistId: number, propertyId: number) => {
    setLoading(true);
    try {
      console.log(`Removing property ${propertyId} from wishlist ${wishlistId}`);
      const response = await fetch(`http://localhost:8000/wishlists/${wishlistId}/properties/${propertyId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`Failed to remove property: ${response.status}`);
      }
      console.log(`Removed property ${propertyId} from wishlist ${wishlistId}`);
      await fetchWishlistProperties(wishlistId);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error removing property:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchWishlistProperties]);

  const createWishlist = useCallback(async (name: string, isPrivate: boolean = false) => {
    setLoading(true);
    try {
      console.log(`Creating wishlist: ${name}`);
      const response = await fetch('http://localhost:8000/wishlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, name, is_private: isPrivate }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to create wishlist: ${response.status}`);
      }
      const data = await response.json();
      console.log('Wishlist created:', data);
      setWishlists([...wishlists, data]);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error creating wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, wishlists]);

  const deleteWishlist = useCallback(async (wishlistId: number) => {
    setLoading(true);
    try {
      console.log(`Deleting wishlist ${wishlistId}`);
      const response = await fetch(`http://localhost:8000/wishlists/${wishlistId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`Failed to delete wishlist: ${response.status}`);
      }
      console.log(`Deleted wishlist ${wishlistId}`);
      setWishlists(wishlists.filter((w) => w.id !== wishlistId));
      setCurrentProperties([]);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error deleting wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, [wishlists]);

  useEffect(() => {
    fetchWishlists();
    fetchProperties();
  }, [fetchWishlists, fetchProperties]);

  return {
    wishlists,
    currentProperties,
    properties,
    loading,
    error,
    fetchWishlists,
    fetchProperties,
    fetchWishlistProperties,
    addPropertyToWishlist,
    removePropertyFromWishlist,
    createWishlist,
    deleteWishlist,
  };
};