import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import ServiceWorkerLayout from "./service-worker-layout"
import { ToastProvider  } from "@/components/ui/toast"
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sky-high - Find your perfect stay",
  description: "Discover amazing places to stay around the world",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <ToastProvider />
      <body className={inter.className}>
        <AuthProvider>
          <ServiceWorkerLayout>
            {children}
          </ServiceWorkerLayout>
        </AuthProvider>
      </body>
    </html>
  )
}
