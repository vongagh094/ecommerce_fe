"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth0 } from "@auth0/auth0-react"
import { userApi } from "@/lib/api/user"

export default function UserProfilePage() {
  const { user, isAuthenticated, loginWithRedirect, logout, isLoading } = useAuth0()

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    gender: "other",
  })

  const [hostInfo, setHostInfo] = useState<{
    host_about: string | null
    host_review_count: number | null
    host_rating_average: number | null
    is_super_host: boolean | null
  } | null>(null)

  const [profileImage, setProfileImage] = useState("/placeholder.svg?height=96&width=96")
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: (user.name as string) || "",
        email: (user.email as string) || "",
      }))
      if (user.picture) setProfileImage(user.picture as string)
    }
  }, [user])

  useEffect(() => {
    const loadProfile = async () => {
      if (!isAuthenticated) return
      try {
        const profile = await userApi.getUserProfile()
        // Pre-fill additional fields from backend if present
        // remove trailing spaces from phone number and gender
        const phoneNumber = profile.phone_number?.trim() || ""
        const gender = profile.gender?.trim() as 'male' | 'female' | 'other' || "other"
        setFormData(prev => ({
          ...prev,
          name: profile.name || prev.name,
          email: profile.email || prev.email,
          phone: phoneNumber,
          gender: gender,
        }))
        if (profile.picture) setProfileImage(profile.picture)
        setHostInfo({
          host_about: profile.host_about,
          host_review_count: profile.host_review_count,
          host_rating_average: profile.host_rating_average,
          is_super_host: profile.is_super_host,
        })
      } catch (e) {
        // non-blocking
      }
    }
    loadProfile()
  }, [isAuthenticated])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveChanges = async () => {
    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    try {
      await userApi.updateProfile({
        name: formData.name,
        phone_number: formData.phone,
        gender: formData.gender as any,
        picture: profileImage && !profileImage.includes("placeholder.svg") ? profileImage : undefined,
      })
      setSaveSuccess(true)
    } catch (err: any) {
      setSaveError(err?.message || "Failed to save changes")
    } finally {
      setIsSaving(false)
      setTimeout(() => setSaveSuccess(false), 2500)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setProfileImage(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEditPhotoClick = () => {
    fileInputRef.current?.click()
  }

  if (isLoading) {
    return <div className="max-w-4xl mx-auto"><p>Loading profile…</p></div>
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">User profile</h1>
          <p className="text-gray-600">Please log in to view your profile.</p>
        </div>
        <Button onClick={() => loginWithRedirect({ appState: { returnTo: "/dashboard" } })} className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium">
          Log in
        </Button>
      </div>
    )
  }

  const initials = (user?.name || "").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "U"

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">User profile</h1>
          <p className="text-gray-600">Your information is shown here</p>
        </div>
        <Button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })} variant="outline">
          Log out
        </Button>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm">
        {/* Profile Photo */}
        <div className="flex flex-col items-center mb-8">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={profileImage || "/placeholder.svg"} alt="Profile" />
            <AvatarFallback className="text-xl">{initials}</AvatarFallback>
          </Avatar>
          <Button variant="ghost" className="text-blue-500 hover:text-blue-600" onClick={handleEditPhotoClick}>
            Edit Photo
          </Button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="h-12 bg-gray-50 border-gray-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <Input
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className="h-12 bg-gray-50 border-gray-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your email</label>
            <Input
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="h-12 bg-gray-50 border-gray-200"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => handleInputChange("gender", e.target.value)}
              className="w-full h-12 px-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Host Information (if any) */}
        {hostInfo && (hostInfo.host_about || hostInfo.host_review_count !== null || hostInfo.host_rating_average !== null || hostInfo.is_super_host !== null) && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Host Information</h2>
            {hostInfo.host_about && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">About</label>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-800 whitespace-pre-wrap">
                  {hostInfo.host_about}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-sm text-gray-600">Reviews</div>
                <div className="text-lg font-semibold">{hostInfo.host_review_count ?? 0}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-sm text-gray-600">Rating</div>
                <div className="text-lg font-semibold">{hostInfo.host_rating_average ?? 0}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-sm text-gray-600">Super Host</div>
                <div className="text-lg font-semibold">{hostInfo.is_super_host ? 'Yes' : 'No'}</div>
              </div>
            </div>
          </div>
        )}

        {saveError && (
          <p className="text-red-600 mb-4">{saveError}</p>
        )}
        {saveSuccess && (
          <p className="text-green-600 mb-4">Saved successfully.</p>
        )}

        {/* Save Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white px-8 py-3 rounded-lg font-medium"
          >
            {isSaving ? "Saving..." : "Save your changes"}
          </Button>
        </div>
      </div>
    </div>
  )
}
