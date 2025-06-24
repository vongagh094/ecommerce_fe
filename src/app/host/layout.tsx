import type React from "react"
import { HostHeader } from "@/components/host/host-header"

export default function HostLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <HostHeader />
      {children}
    </div>
  )
}
