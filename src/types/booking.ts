export interface BookingCreate {
  auction_id?: string | null
  guest_id: number
  host_id: number
  property_id: number
  check_in_date: string
  check_out_date: string
  base_amount: number
  cleaning_fee?: number
  taxes?: number
}

export interface BookingUpdate {
  check_in_date?: string | null
  check_out_date?: string | null
  base_amount?: number | null
  cleaning_fee?: number | null
  taxes?: number | null
  booking_status?: string | null
  payment_status?: string | null
}

export interface BookingResponse {
  id: string
  auction_id?: string | null
  guest_id: number
  host_id: number
  property_id: number
  check_in_date: string
  check_out_date: string
  total_nights: number
  base_amount: number
  cleaning_fee: number
  taxes: number
  total_amount: number
  booking_status: string
  payment_status: string
  created_at: string
  updated_at: string
}