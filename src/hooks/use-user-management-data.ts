"use client"

import { useState, useEffect } from "react"
import type { User } from "@/types/admin"

const apiUrl = process.env.NEXT_PUBLIC_API_URL
const limit = 100

export function useUserManagementData() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)


  const fetchUsers = async (newOffset: number = 0) => {
    setLoading(true)
    try {
      const response = await fetch(`${apiUrl}/users/list/profiles?offset=${newOffset}&limit=${limit}`)
      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }
      const data = await response.json()
      
      const mappedUsers: User[] = data.map((user: any) => ({
        id: user.id.toString(), // Convert number to string
        fullName: user.name,
        email: user.email,
        phoneNumber: user.phone_number || "",
        role: user.is_super_host ? "Host" : "Guest",
        status: user.is_active ? "Active" : "Inactive", // Use Inactive instead of Banned
        avatarUrl: user.picture || "/placeholder.svg?height=32&width=32",
      }))

      setUsers((prev) => (newOffset === 0 ? mappedUsers : [...prev, ...mappedUsers]))
      setHasMore(data.length === limit)
      setOffset(newOffset + data.length)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

const toggleUserStatus = async (id: string) => {
    try {
      const user = users.find(u => u.id === id)
      if (!user) return

      const newStatus = user.status === "Active" ? "Inactive" : "Active"
      const response = await fetch(`${apiUrl}/users/status/${id}?status=${newStatus === "Active" ? "true" : "false"}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to update user status")
      }

      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === id ? { ...u, status: newStatus } : u
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchUsers(offset)
    }
  }

  return { users, loading, error, hasMore, fetchUsers, toggleUserStatus, loadMore }
}