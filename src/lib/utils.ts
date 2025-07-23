import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-")
}

export const validationBidAmount = (
    bidAmount: string,
    minimum_bid: number
) : string | null => {
    if (!bidAmount) return "Bid amount is required"
    if (isNaN(parseFloat(bidAmount))) return "Invalid bid amount"
    if (parseFloat(bidAmount) <= minimum_bid) return "Bid amount must be greater than 0"
    return null
}