'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import { debounce } from 'lodash';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Cấu hình axios retry cho lỗi 429 và lỗi mạng
axiosRetry(axios, {
  retries: 5,
  retryDelay: (retryCount) => retryCount * 1500,
  retryCondition: (error) => error.response?.status === 429 || error.code === 'ERR_NETWORK',
});

// Dynamic imports cho react-leaflet để tránh SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });

const MapEvents = dynamic(
  () =>
    import('react-leaflet').then((mod) => {
      const MapEvents: React.FC<{
        onPositionChange: (lat: number, lng: number) => void;
      }> = ({ onPositionChange }) => {
        mod.useMapEvents({
          click(e) {
            onPositionChange(e.latlng.lat, e.latlng.lng);
          },
        });
        return null;
      };
      return MapEvents;
    }),
  { ssr: false }
);

// Hàm lấy icon cho marker (home icon)
const getMarkerIcon = async () => {
  const L = await import('leaflet');
  return new L.Icon({
    iconUrl: 'https://img.icons8.com/plasticine/100/exterior.png',
    iconSize: [38, 45],
    iconAnchor: [19, 45],
    popupAnchor: [0, -45],
  });
};

// Hàm suy luận địa chỉ từ query
const inferAddressFromQuery = (query: string): AddressData => {
  const parts = query.split(',').map((part) => part.trim()).filter((part) => part);
  let address = parts[0] || '';
  let district = '';
  let city = '';
  let country = 'Vietnam';
  let postcode = '';

  if (parts.length > 1) {
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i].toLowerCase();
      if (part.includes('quận') || part.includes('huyện')) {
        district = parts[i];
      } else if (part.includes('thành phố') || part.includes('tp') || part.includes('tỉnh')) {
        city = parts[i];
      } else if (part.includes('vietnam') || part.includes('vn')) {
        country = parts[i];
      } else if (part.match(/^\d{5,6}$/)) {
        postcode = part;
        if (i > 1) country = parts[i - 1] || country;
      }
    }
    if (!district && parts.length > 1) district = parts[1];
    if (!city && parts.length > 2) city = parts[2];
  }

  return {
    address,
    district,
    city,
    country,
    postcode,
    latitude: null,
    longitude: null,
  };
};

// Hàm xử lý dữ liệu địa chỉ từ LocationIQ
const getAddressComponents = (data: any): AddressData => {
  const addressParts = [];
  if (data.address?.house_number && data.address?.road) {
    addressParts.push(`${data.address.house_number} ${data.address.road}`);
  } else if (data.address?.road) {
    addressParts.push(data.address.road);
  } else {
    addressParts.push(data.display_name?.split(',')[0] || '');
  }

  const countryCodeUpper = data.address?.country_code?.toUpperCase() || '';
  let district = '';

  if (countryCodeUpper === 'VN') {
    if (data.address?.county || data.address?.state_district) {
      district = data.address.county || data.address.state_district;
      if (data.address?.suburb && !data.address.suburb.includes('arrondissement') && data.address.suburb !== district) {
        addressParts.push(data.address.suburb);
      }
    } else if (data.address?.suburb && !data.address.suburb.includes('arrondissement')) {
      district = data.address.suburb;
    }
  } else {
    district = data.address.county || data.address.state_district || data.address.suburb || '';
    if (data.address?.suburb && data.address.suburb !== district) {
      addressParts.push(data.address.suburb);
    }
  }

  return {
    address: addressParts.join(', ') || '',
    district: district || '',
    city: data.address?.city || data.address?.town || data.address?.village || '',
    country: data.address?.country || '',
    postcode: data.address?.postcode || '',
    latitude: data.lat ? parseFloat(data.lat) : null,
    longitude: data.lon ? parseFloat(data.lon) : null,
  };
};

// Tọa độ mặc định
const defaultCenter: [number, number] = [10.7769, 106.7009];

const AddressMap: React.FC<AddressMapProps> = ({
  only_map = false,
  addressData,
  onSave,
}) => {
  const [position, setPosition] = useState<[number, number]>(
    addressData.latitude && addressData.longitude
      ? [addressData.latitude, addressData.longitude]
      : defaultCenter
  );
  const [formData, setFormData] = useState<AddressData>({
    address: addressData.address || '',
    district: addressData.district || '',
    city: addressData.city || '',
    country: addressData.country || '',
    postcode: addressData.postcode || '',
    latitude: addressData.latitude || null,
    longitude: addressData.longitude || null,
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [markerIcon, setMarkerIcon] = useState<L.Icon | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingMode, setEditingMode] = useState<'address' | 'coords' | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Lấy icon cho marker
  useEffect(() => {
    getMarkerIcon().then((icon) => setMarkerIcon(icon)).catch((err) => {
      console.error('Lỗi khi tải marker icon:', err);
      setError('Không thể tải biểu tượng bản đồ.');
    });
  }, []);

  // Khởi tạo bản đồ dựa trên addressData
  useEffect(() => {
    const initializeMap = async () => {
      if (!process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY) {
        setError('API Key không được cấu hình.');
        return;
      }

      if (addressData.latitude && addressData.longitude) {
        setPosition([addressData.latitude, addressData.longitude]);
        setFormData({
          address: addressData.address || '',
          district: addressData.district || '',
          city: addressData.city || '',
          country: addressData.country || '',
          postcode: addressData.postcode || '',
          latitude: addressData.latitude,
          longitude: addressData.longitude,
        });
      } else if (addressData.address || addressData.district || addressData.city || addressData.country) {
        try {
          setError(null);
          setIsLoading(true);
          const queryParts = [
            addressData.address,
            addressData.district,
            addressData.city,
            addressData.country || 'Vietnam',
          ].filter(Boolean).join(', ');
          if (queryParts) {
            const response = await axios.get(
              `https://api.locationiq.com/v1/autocomplete?key=${process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY}&q=${encodeURIComponent(queryParts)}&limit=10&dedupe=1`
            );
            const data = response.data;
            if (data?.length > 0 && data[0].lat && data[0].lon) {
              setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
              setFormData({
                ...getAddressComponents(data[0]),
                latitude: parseFloat(data[0].lat),
                longitude: parseFloat(data[0].lon),
              });
              setSuggestions(data);
            } else {
              setFormData({
                address: addressData.address || '',
                district: addressData.district || '',
                city: addressData.city || '',
                country: addressData.country || '',
                postcode: addressData.postcode || '',
                latitude: null,
                longitude: null,
              });
            }
          }
        } catch (error) {
          console.error('Lỗi khi geocoding:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setPosition(defaultCenter);
        setFormData({
          address: addressData.address || '',
          district: addressData.district || '',
          city: addressData.city || '',
          country: addressData.country || '',
          postcode: addressData.postcode || '',
          latitude: null,
          longitude: null,
        });
      }
    };
    initializeMap();
  }, [addressData]);

  // Kiểm tra thay đổi dữ liệu
  const hasDataChanged = useMemo(() => {
    return (
      formData.address !== (addressData.address || '') ||
      formData.district !== (addressData.district || '') ||
      formData.city !== (addressData.city || '') ||
      formData.country !== (addressData.country || '') ||
      formData.postcode !== (addressData.postcode || '') ||
      formData.latitude !== addressData.latitude ||
      formData.longitude !== addressData.longitude
    );
  }, [formData, addressData]);

  useEffect(() => {
    setHasChanges(hasDataChanged);
  }, [hasDataChanged]);

  // Tìm kiếm địa chỉ với autocomplete và geocoding
  const debouncedGeocode = useCallback(
    debounce(async (query: string) => {
      if (!process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY || !query.trim()) {
        setSuggestions([]);
        return;
      }
      setIsLoading(true);
      const searchQuery = query.toLowerCase().includes('vietnam') ? query : `${query}, Vietnam`;
      try {
        const response = await axios.get(
          `https://api.locationiq.com/v1/autocomplete?key=${process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY}&q=${encodeURIComponent(searchQuery)}&limit=10&dedupe=1`
        );
        const data = response.data;
        if (data?.length) {
          setSuggestions(data);
          if (data[0].lat && data[0].lon) {
            setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
            setFormData({
              ...getAddressComponents(data[0]),
              latitude: parseFloat(data[0].lat),
              longitude: parseFloat(data[0].lon),
            });
          }
        } else {
          setSuggestions([]);
          const inferred = inferAddressFromQuery(query);
          setPosition(defaultCenter);
          setFormData({
            ...inferred,
            latitude: defaultCenter[0],
            longitude: defaultCenter[1],
          });
        }
      } catch (error) {
        setSuggestions([]);
        const inferred = inferAddressFromQuery(query);
        setPosition(defaultCenter);
        setFormData({
          ...inferred,
          latitude: defaultCenter[0],
          longitude: defaultCenter[1],
        });
      } finally {
        setIsLoading(false);
      }
    }, 750),
    []
  );

  // Xử lý tìm kiếm địa chỉ
  const handleSearchAddress = useCallback(async () => {
    if (!searchInputRef.current?.value) return;
    setEditingMode('address');
    setIsLoading(true);
    const query = searchInputRef.current.value;
    if (suggestions.length && suggestions[0].lat && suggestions[0].lon) {
      setPosition([parseFloat(suggestions[0].lat), parseFloat(suggestions[0].lon)]);
      setFormData({
        ...getAddressComponents(suggestions[0]),
        latitude: parseFloat(suggestions[0].lat),
        longitude: parseFloat(suggestions[0].lon),
      });
    } else {
      const inferred = inferAddressFromQuery(query);
      setPosition(defaultCenter);
      setFormData({
        ...inferred,
        latitude: defaultCenter[0],
        longitude: defaultCenter[1],
      });
    }
    setSuggestions([]);
    setIsLoading(false);
  }, [suggestions]);

  // Xử lý chọn gợi ý
  const handleSuggestionSelect = useCallback((suggestion: any) => {
    setPosition([parseFloat(suggestion.lat), parseFloat(suggestion.lon)]);
    setFormData({
      ...getAddressComponents(suggestion),
      latitude: parseFloat(suggestion.lat),
      longitude: parseFloat(suggestion.lon),
    });
    setSuggestions([]);
    if (searchInputRef.current) {
      searchInputRef.current.value = suggestion.display_name || '';
    }
  }, []);

  // Xử lý click trên bản đồ
  const handleMapClick = useCallback(
    debounce(async (lat: number, lng: number) => {
      if (!process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY) {
        setError('API Key không được cấu hình.');
        return;
      }
      setPosition([lat, lng]);
      setEditingMode('coords');
      setIsLoading(true);
      try {
        const response = await axios.get(
          `https://api.locationiq.com/v1/reverse?key=${process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY}&lat=${lat}&lon=${lng}&format=json`
        );
        const data = response.data;
        if (data?.lat && data?.lon && data?.address) {
          setFormData((prev) => getAddressComponents(data));
        } else {
          setFormData((prev) => ({
            ...prev,
            address: '',
            district: '',
            city: '',
            country: '',
            postcode: '',
            latitude: lat,
            longitude: lng,
          }));
        }
      } catch (error) {
        setFormData((prev) => ({
          ...prev,
          address: '',
          district: '',
          city: '',
          country: '',
          postcode: '',
          latitude: lat,
          longitude: lng,
        }));
      } finally {
        setIsLoading(false);
      }
    }, 750),
    []
  );

  // Xử lý kéo thả marker
  const handleMarkerDrag = useCallback(
    debounce(async (e: L.LeafletEvent) => {
      const marker = e.target as L.Marker;
      const { lat, lng } = marker.getLatLng();
      if (!process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY) {
        setError('API Key không được cấu hình.');
        return;
      }
      setPosition([lat, lng]);
      setEditingMode('coords');
      setIsLoading(true);
      try {
        const response = await axios.get(
          `https://api.locationiq.com/v1/reverse?key=${process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY}&lat=${lat}&lon=${lng}&format=json`
        );
        const data = response.data;
        if (data?.lat && data?.lon && data?.address) {
          setFormData((prev) => getAddressComponents(data));
        } else {
          setFormData((prev) => ({
            ...prev,
            address: '',
            district: '',
            city: '',
            country: '',
            postcode: '',
            latitude: lat,
            longitude: lng,
          }));
        }
      } catch (error) {
        setFormData((prev) => ({
          ...prev,
          address: '',
          district: '',
          city: '',
          country: '',
          postcode: '',
          latitude: lat,
          longitude: lng,
        }));
      } finally {
        setIsLoading(false);
      }
    }, 750),
    []
  );

  // Xử lý thay đổi input địa chỉ
  const handleAddressChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEditingMode('address');
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

  // Xử lý thay đổi tọa độ
  const handleCoordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEditingMode('coords');
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value ? parseFloat(value) : null,
      }));
      setPosition([
        name === 'latitude' && value ? parseFloat(value) : formData.latitude ?? defaultCenter[0],
        name === 'longitude' && value ? parseFloat(value) : formData.longitude ?? defaultCenter[1],
      ]);
    },
    [formData.latitude, formData.longitude]
  );

  // Xử lý lưu dữ liệu
  const handleSave = useCallback(() => {
    if (onSave && hasChanges) {
      onSave(formData);
    }
  }, [onSave, hasChanges, formData]);

  // Tạo chuỗi tóm tắt địa chỉ
  const addressSummary = useMemo(() => {
    const parts = [];
    if (formData.address) parts.push(formData.address);
    if (formData.district) parts.push(formData.district);
    if (formData.city) parts.push(formData.city);
    if (formData.country) parts.push(formData.country);
    if (formData.postcode) parts.push(`(${formData.postcode})`);
    let summary = parts.join(', ');
    if (formData.latitude && formData.longitude) {
      summary += ` (Lat: ${formData.latitude.toFixed(4)}, Lng: ${formData.longitude.toFixed(4)})`;
    }
    return summary || 'Không có dữ liệu vị trí';
  }, [formData]);

  // Hiển thị khi đang tải icon
  if (!markerIcon) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-96 bg-muted rounded-lg">
              <div className="text-center">
                <MapPin className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Đang tải bản đồ...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {!only_map && (
        <Card>
          <CardHeader>
            <CardTitle>Thông tin vị trí</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Label htmlFor="search">Tìm kiếm địa chỉ</Label>
              <div className="flex gap-2">
                <Input
                  id="search"
                  placeholder="VD: Lý Thường Kiệt, Quận 1, TP Hồ Chí Minh, Vietnam"
                  ref={searchInputRef}
                  onChange={(e) => debouncedGeocode(e.target.value)}
                />
                <Button onClick={handleSearchAddress} disabled={isLoading}>
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-gray-500" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8v-8H4z" />
                    </svg>
                  ) : (
                    'Tìm kiếm'
                  )}
                </Button>
              </div>
              {suggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto mt-1">
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSuggestionSelect(suggestion)}
                    >
                      {suggestion.display_name || 'Không có tên địa chỉ'}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="address">Địa chỉ (Số nhà, Tên đường, Phường/Xã)</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleAddressChange}
                  disabled={editingMode === 'coords'}
                />
              </div>
              <div>
                <Label htmlFor="district">Quận/Huyện</Label>
                <Input
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleAddressChange}
                  disabled={editingMode === 'coords'}
                />
              </div>
              <div>
                <Label htmlFor="city">Thành phố</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleAddressChange}
                  disabled={editingMode === 'coords'}
                />
              </div>
              <div>
                <Label htmlFor="country">Quốc gia</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleAddressChange}
                  disabled={editingMode === 'coords'}
                />
              </div>
              <div>
                <Label htmlFor="postcode">Mã bưu điện</Label>
                <Input
                  id="postcode"
                  name="postcode"
                  value={formData.postcode}
                  onChange={handleAddressChange}
                  disabled={editingMode === 'coords'}
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="latitude">Vĩ độ</Label>
                  <Input
                    id="latitude"
                    name="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude ?? ''}
                    onChange={handleCoordChange}
                    disabled={editingMode === 'address'}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="longitude">Kinh độ</Label>
                  <Input
                    id="longitude"
                    name="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude ?? ''}
                    onChange={handleCoordChange}
                    disabled={editingMode === 'address'}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && <p className="text-red-500 text-center">{error}</p>}

      {only_map && addressSummary && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{addressSummary}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="h-96 w-full">
            {position[0] && position[1] ? (
              <MapContainer
                center={position}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                className="rounded-lg"
                key={`${position[0]}-${position[1]}`}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker
                  position={position}
                  icon={markerIcon}
                  draggable={!only_map}
                  eventHandlers={{ dragend: handleMarkerDrag }}
                />
                {!only_map && <MapEvents onPositionChange={handleMapClick} />}
              </MapContainer>
            ) : (
              <div className="h-full flex items-center justify-center bg-muted rounded-lg">
                <div className="text-center">
                  <MapPin className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">Không có dữ liệu vị trí</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {!only_map && hasChanges && (
        <div className="flex justify-end">
          <Button onClick={handleSave}>Lưu thay đổi</Button>
        </div>
      )}
    </div>
  );
};

export default AddressMap;