interface AddressData {
  address: string;
  district: string;
  city: string;
  country: string;
  postcode: string;
  latitude: number | null;
  longitude: number | null;
}

interface AddressMapProps {
  only_map?: boolean;
  addressData: AddressData;
  onSave?: (data: AddressData) => void;
}