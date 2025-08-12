"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { MessagingInterface } from "@/components/host/messaging-interface"

export default function HostMessagesPage() {
  const searchParams = useSearchParams()
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null)
  const [selectedGuestName, setSelectedGuestName] = useState<string | null>(null)

  useEffect(() => {
    const guestId = searchParams.get("guestId")
    const guestName = searchParams.get("guestName")

    if (guestId && guestName) {
      setSelectedGuestId(guestId)
      setSelectedGuestName(decodeURIComponent(guestName))
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gray-50">
      <MessagingInterface preselectedGuestId={selectedGuestId} preselectedGuestName={selectedGuestName} />
    </div>
  )
}
