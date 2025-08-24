import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import JSONbig from 'json-bigint';
import { PropertyCard } from '@/types';

interface WishlistHook {
  properties: PropertyCard[];
  error: string | null;
  isLoading: boolean;
  fetchProperties: (page: number) => Promise<void>;
  handleFavoriteToggle: (propertyId: string) => Promise<void>;
  addToWishlist: (userId: number, propertyId: string) => Promise<void>;
  removeFromWishlist: (userId: number, propertyId: string) => Promise<void>;
  checkWishlist: (userId: number) => Promise<boolean>;
  getWishlistProperties: (userId: number) => Promise<string[]>;
  currentPage: number;
  totalPages: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const JSONbigInt = JSONbig({ storeAsString: true });

const customAxios = axios.create({
  baseURL: apiUrl,
  responseType: 'text',
  transformResponse: [
    function (data) {
      if (!data) return data;
      try {
        console.log('Raw response data:', data);
        const parsed = JSONbigInt.parse(data);
        console.log('Parsed response data:', parsed);
        return parsed;
      } catch (err) {
        console.error('Lỗi parse JSON:', err);
        throw err;
      }
    },
  ],
});

export const useWishlist = (userId: number, fetchOnMount: boolean = false): WishlistHook => {
  const [properties, setProperties] = useState<PropertyCard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  const ensureWishlistExists = useCallback(async () => {
    try {
      console.log('Checking wishlist existence:', `/wishlist/check?user_id=${userId}`);
      const response = await customAxios.get(`/wishlist/check?user_id=${userId}`);
      console.log('Wishlist check response:', response.data);
      if (!response.data.exists) {
        console.log('Creating wishlist:', `/wishlist/create?user_id=${userId}`);
        await customAxios.post(`/wishlist/create?user_id=${userId}`);
      }
    } catch (err: any) {
      setError('Không thể tạo/kiểm tra wishlist: ' + (err.response?.data?.error?.message || err.message));
      throw err;
    }
  }, [userId]);

  const addToWishlist = useCallback(async (userId: number, propertyId: string) => {
    if (!propertyId) {
      setError('ID bất động sản không hợp lệ');
      throw new Error('ID bất động sản không hợp lệ');
    }
    setIsLoading(true);
    setError(null);
    try {
      await ensureWishlistExists();
      const requestUrl = `/wishlist/${userId}/add-property?property_id=${encodeURIComponent(propertyId)}`;
      console.log('Gửi yêu cầu thêm vào wishlist:', requestUrl, 'with propertyId:', propertyId);
      await customAxios.post(requestUrl, {});
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message?.detail || err.response?.data?.detail || err.message;
      console.error('Lỗi từ server:', errorMessage);
      if (err.response?.status === 404) {
        setError('Bất động sản không tồn tại');
      } else if (err.response?.status === 500) {
        setError('Lỗi server khi thêm bất động sản: ' + errorMessage);
      } else {
        setError('Không thể thêm bất động sản vào wishlist: ' + errorMessage);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [ensureWishlistExists]);

  const removeFromWishlist = useCallback(async (userId: number, propertyId: string) => {
    if (!propertyId) {
      setError('ID bất động sản không hợp lệ');
      throw new Error('ID bất động sản không hợp lệ');
    }
    setIsLoading(true);
    setError(null);
    try {
      const requestUrl = `/wishlist/${userId}/remove-property/${propertyId}`;
      console.log('Gửi yêu cầu xóa khỏi wishlist:', requestUrl, 'with propertyId:', propertyId);
      await customAxios.delete(requestUrl);
      console.log(`Successfully removed property ${propertyId} from wishlist`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message?.detail || err.response?.data?.detail || err.message;
      console.error('Lỗi từ server:', errorMessage);
      // Xử lý trường hợp backend trả 500 nhưng chứa '404' hoặc message không tồn tại
      if (err.response?.status === 404 || errorMessage.includes('404') || errorMessage.includes('Bất động sản không có trong wishlist')) {
        console.warn(`Property ${propertyId} not in wishlist or already removed, ignoring error`);
        return; // Bỏ qua lỗi, xem như thành công (property đã không còn)
      } else if (err.response?.status === 500) {
        setError('Lỗi server khi xóa bất động sản: ' + errorMessage);
      } else {
        setError('Không thể xóa bất động sản khỏi wishlist: ' + errorMessage);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkWishlist = useCallback(async (userId: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const requestUrl = `/wishlist/check?user_id=${userId}`;
      console.log('Kiểm tra wishlist:', requestUrl);
      const response = await customAxios.get(requestUrl);
      console.log('Wishlist check response:', response.data);
      return response.data.exists;
    } catch (err: any) {
      setError('Không thể kiểm tra wishlist: ' + (err.response?.data?.error?.message || err.message));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getWishlistProperties = useCallback(async (userId: number): Promise<string[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const requestUrl = `/wishlist/${userId}/properties`;
      console.log('Lấy danh sách bất động sản trong wishlist:', requestUrl);
      const response = await customAxios.get(requestUrl);
      const propertyIds = response.data.property_ids || [];
      console.log('Wishlist property IDs (after parse):', propertyIds);
      console.log('Wishlist property IDs types:', propertyIds.map((id: any) => typeof id));
      return propertyIds;
    } catch (err: any) {
      console.error('Lỗi khi lấy wishlist:', err);
      setError('Không thể lấy danh sách bất động sản trong wishlist: ' + (err.response?.data?.error?.message || err.message));
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchProperties = useCallback(async (page: number = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const requestUrl = `/wishlist/${userId}/properties?page=${page}&per_page=20`;
      console.log('Fetching wishlist properties:', requestUrl);
      const response = await customAxios.get(requestUrl);
      console.log('Wishlist properties response:', response.data);
      const propertyIds: string[] = response.data.property_ids || [];
      
      const fetchedProperties: PropertyCard[] = await Promise.all(
        propertyIds.map(async (id: string) => {
          try {
            const propResponse = await customAxios.get(`/properties/${id}`);
            console.log(`Fetched property details for ID ${id}:`, propResponse.data);
            return {
              ...propResponse.data,
              id: String(propResponse.data.id),
              isFavorite: true
            };
          } catch (fetchErr: any) {
            console.error(`Error fetching property ${id}:`, fetchErr);
            return null;
          }
        })
      );

      const validProperties = fetchedProperties.filter((prop): prop is PropertyCard => prop !== null);
      setProperties(validProperties);
      setCurrentPage(response.data.current_page || 1);
      setTotalPages(response.data.total_pages || 1);
      setTotal(response.data.total || 0);
      setHasNext(response.data.has_next || false);
      setHasPrev(response.data.has_prev || false);
    } catch (err: any) {
      console.error('Lỗi khi lấy danh sách bất động sản:', err);
      setError('Không thể lấy danh sách bất động sản: ' + (err.response?.data?.error?.message || err.message));
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const handleFavoriteToggle = useCallback(async (propertyId: string) => {
    if (!propertyId) {
      setError('ID bất động sản không hợp lệ');
      throw new Error('ID bất động sản không hợp lệ');
    }
    try {
      const isInWishlist = properties.some(p => p.id === propertyId);
      if (isInWishlist) {
        // Thử remove, nhưng nếu lỗi vì đã xóa (404-like), vẫn tiếp tục filter UI
        try {
          await removeFromWishlist(userId, propertyId);
        } catch (removeErr: any) {
          const errorMessage = removeErr.response?.data?.error?.message?.detail || removeErr.response?.data?.detail || removeErr.message;
          if (removeErr.response?.status === 404 ||
              removeErr.response?.status === 500 && (errorMessage.includes('404') || errorMessage.includes('Bất động sản không có trong wishlist'))) {
            console.warn(`Property ${propertyId} already removed from wishlist, proceeding with UI update`);
            // Không throw, tiếp tục filter
          } else {
            throw removeErr; // Throw lỗi khác để catch bên ngoài xử lý
          }
        }
        // Luôn filter properties sau remove (thành công hoặc đã xóa)
        setProperties(prev => prev.filter(p => p.id !== propertyId));
      } else {
        await addToWishlist(userId, propertyId);
        // Fetch property details to add to wishlist
        const response = await customAxios.get(`/properties/${propertyId}`);
        const newProperty: PropertyCard = {
          ...response.data,
          id: String(response.data.id),
          isFavorite: true
        };
        setProperties(prev => [...prev, newProperty]);
      }
    } catch (err: any) {
      throw new Error(err.message || 'Không thể cập nhật wishlist');
    }
  }, [properties, addToWishlist, removeFromWishlist, userId]);

  useEffect(() => {
    if (fetchOnMount) {
      fetchProperties(1);
    }
  }, [fetchProperties, fetchOnMount]);

  return { 
    properties, 
    error, 
    isLoading, 
    fetchProperties, 
    handleFavoriteToggle, 
    addToWishlist, 
    removeFromWishlist, 
    checkWishlist, 
    getWishlistProperties,
    currentPage,
    totalPages,
    total,
    hasNext,
    hasPrev
  };
};