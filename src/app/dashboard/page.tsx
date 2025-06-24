"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function UserProfilePage() {
  const [formData, setFormData] = useState({
    name: "Moni Roy",
    phone: "091123456",
    email: "jaskolski.brent@gmail.com",
    gender: "Female",
  })

  const [profileImage, setProfileImage] = useState("/placeholder.svg?height=96&width=96")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveChanges = () => {
    console.log("Saving changes:", formData)
    // Handle save logic here
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">User profile</h1>
        <p className="text-gray-600">Your information is shown here</p>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm">
        {/* Profile Photo */}
        <div className="flex flex-col items-center mb-8">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={profileImage || "/placeholder.svg"} alt="Profile" />
            <AvatarFallback className="text-xl">MR</AvatarFallback>
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
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => handleInputChange("gender", e.target.value)}
              className="w-full h-12 px-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleSaveChanges}
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium"
          >
            Save your changes
          </Button>
        </div>
      </div>
    </div>
  )
}
