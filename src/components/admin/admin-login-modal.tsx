"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Shield, AlertCircle } from "lucide-react"

interface AdminLoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AdminLoginModal({ isOpen, onClose }: AdminLoginModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { loginAsAdmin } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const success = await loginAsAdmin(email, password)
      if (success) {
        onClose()
        router.push("/admin")
      } else {
        setError("Invalid admin credentials")
      }
    } catch (err) {
      setError("An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setEmail("")
    setPassword("")
    setError("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Admin Login
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@skyhigh.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? "Logging in..." : "Login as Admin"}
            </Button>
          </div>
        </form>

        <div className="text-xs text-gray-500 text-center pt-4 border-t">
          <p>Demo credentials:</p>
          <p>Email: admin@skyhigh.com</p>
          <p>Password: admin123</p>
        </div>
      </DialogContent>
    </Dialog>
  )
} 