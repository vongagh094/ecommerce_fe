export interface AddressData {
  address: string
  state: string | null
  city: string
  country: string
  postcode: string | null
  latitude: number | null
  longitude: number | null
}

export interface AddressMapProps {
  only_map?: boolean
  addressData: AddressData
  onSave?: (data: AddressData) => void
}
