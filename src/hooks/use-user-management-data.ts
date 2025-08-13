"use client"

import { useState, useEffect } from "react"
import type { User } from "@/types/admin"

export function useUserManagementData() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

      const mockUsers: User[] = [
        {
          id: "111111",
          fullName: "BalajiNant",
          email: "aaaa@gmail.com",
          phoneNumber: "091122334",
          role: "Guest",
          status: "Active",
          avatarUrl: "/placeholder.svg?height=32&width=32",
        },
        {
          id: "222222",
          fullName: "NithyaMenon",
          email: "bbb@gmail.com",
          phoneNumber: "022334444",
          role: "Host",
          status: "Banned",
          avatarUrl: "/placeholder.svg?height=32&width=32",
        },
        {
          id: "111223",
          fullName: "MeeraGonzalez",
          email: "ccc@gmail.com",
          phoneNumber: "093378445",
          role: "Both",
          status: "Active",
          avatarUrl: "/placeholder.svg?height=32&width=32",
        },
        {
          id: "112223",
          fullName: "KarthikSubramanian",
          email: "ddd@gmail.com",
          phoneNumber: "093745566",
          role: "Host",
          status: "Banned",
          avatarUrl: "/placeholder.svg?height=32&width=32",
        },
        {
          id: "113334",
          fullName: "PriyaSharma",
          email: "priya@gmail.com",
          phoneNumber: "098765432",
          role: "Guest",
          status: "Active",
          avatarUrl: "/placeholder.svg?height=32&width=32",
        },
        {
          id: "114445",
          fullName: "RahulVerma",
          email: "rahul@gmail.com",
          phoneNumber: "091234567",
          role: "Host",
          status: "Active",
          avatarUrl: "/placeholder.svg?height=32&width=32",
        },
        {
          id: "115556",
          fullName: "AnjaliSingh",
          email: "anjali@gmail.com",
          phoneNumber: "099887766",
          role: "Both",
          status: "Banned",
          avatarUrl: "/placeholder.svg?height=32&width=32",
        },
      ]
      setUsers(mockUsers)
      setLoading(false)
    }
    fetchUsers()
  }, [])

  const toggleUserStatus = (id: string) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === id ? { ...user, status: user.status === "Active" ? "Banned" : "Active" } : user,
      ),
    )
  }

  return { users, loading, toggleUserStatus }
}
