"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { X, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

interface PropertyCreationModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Amenity {
  id: string
  name: string
  icon: string | null
}

interface PropertyCategory {
  name: string
  description: string | null
}

interface PropertyType {
  name: string
  description: string | null
}

const apiUrl = "http://127.0.0.1:8000"
const temporaryUserId = 1 // Giả định, cần lấy từ user session

export function PropertyCreationModal({ isOpen, onClose }: PropertyCreationModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [propertyData, setPropertyData] = useState({
    idImage: null as File | null,
    email: "",
    phone: "",
    category: "",
    propertyType: "",
    addressLine1: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    basePrice: 0,
    cancellationPolicy: "FLEXIBLE" as "FLEXIBLE" | "MODERATE" | "STRICT" | "SUPER_STRICT",
    guests: 1,
    bedrooms: 1,
    bathrooms: 1,
    images: [] as File[],
    selectedAmenities: [] as string[],
    title: "",
    description: "",
  })
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([])
  const [accommodationTypes, setAccommodationTypes] = useState<PropertyCategory[]>([])
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const idInputRef = useRef<HTMLInputElement>(null)

  // Fetch property types, categories, and amenities when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setIsLoading(true)
        setError(null)
        try {
          const typesResponse = await fetch(`${apiUrl}/property-types/available`)
          if (!typesResponse.ok) throw new Error("Không thể tải danh sách loại hình bất động sản")
          setPropertyTypes(await typesResponse.json())

          const categoriesResponse = await fetch(`${apiUrl}/property-categories/available`)
          if (!categoriesResponse.ok) throw new Error("Không thể tải danh sách danh mục")
          setAccommodationTypes(await categoriesResponse.json())

          const amenitiesResponse = await fetch(`${apiUrl}/property-amenities/available`)
          if (!amenitiesResponse.ok) throw new Error("Không thể tải danh sách tiện ích")
          setAmenities(await amenitiesResponse.json())
        } catch (err: any) {
          setError("Không thể tải dữ liệu: " + err.message)
          console.error("Lỗi khi tải dữ liệu:", err)
        } finally {
          setIsLoading(false)
        }
      }
      fetchData()
    }
  }, [isOpen])

  const handleNext = () => {
    if (currentStep < 9) setCurrentStep(currentStep + 1)
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleFinish = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Upload images (bao gồm cả ảnh giấy tờ và ảnh bất động sản)
      const imageUrls: { image_url: string; is_primary: boolean; title: string | null }[] = []

      // Upload ảnh giấy tờ
      if (propertyData.idImage) {
        if (!isValidImageFile(propertyData.idImage)) {
          throw new Error("Hình ảnh giấy tờ phải có định dạng jpg, jpeg, png hoặc gif")
        }
        const formData = new FormData()
        formData.append("file", propertyData.idImage)
        const idUploadResponse = await fetch(`${apiUrl}/upload`, {
          method: "POST",
          body: formData,
        })
        if (!idUploadResponse.ok) {
          const errorText = await idUploadResponse.text()
          throw new Error(`Không thể tải lên hình ảnh giấy tờ: ${errorText}`)
        }
        const { url } = await idUploadResponse.json()
        imageUrls.push({ image_url: `${apiUrl}${url}`, is_primary: false, title: "Identity Document" })
      }

      // Upload ảnh bất động sản
      for (const [index, image] of propertyData.images.entries()) {
        if (!isValidImageFile(image)) {
          throw new Error(`Hình ảnh bất động sản ${image.name} phải có định dạng jpg, jpeg, png hoặc gif`)
        }
        const formData = new FormData()
        formData.append("file", image)
        const imageUploadResponse = await fetch(`${apiUrl}/upload`, {
          method: "POST",
          body: formData,
        })
        if (!imageUploadResponse.ok) {
          const errorText = await imageUploadResponse.text()
          throw new Error(`Không thể tải lên hình ảnh bất động sản: ${errorText}`)
        }
        const { url } = await imageUploadResponse.json()
        imageUrls.push({ image_url: `${apiUrl}${url}`, is_primary: index === 0, title: null })
      }

      // Create property
      const propertyCreateData = {
        host_id: temporaryUserId,
        title: propertyData.title,
        description: propertyData.description,
        property_type: propertyData.propertyType,
        category: propertyData.category,
        max_guests: propertyData.guests,
        bedrooms: propertyData.bedrooms,
        bathrooms: propertyData.bathrooms,
        address_line1: propertyData.addressLine1,
        city: propertyData.city,
        state: propertyData.state,
        country: propertyData.country,
        postal_code: propertyData.postalCode,
        base_price: propertyData.basePrice,
        cleaning_fee: 0,
        cancellation_policy: propertyData.cancellationPolicy,
        instant_book: false,
        minimum_stay: 1,
        language: "en",
        status: "DRAFT",
        amenities: propertyData.selectedAmenities.map((amenity_id) => ({
          property_id: 0, // Will be set by backend
          amenity_id,
        })),
        images: imageUrls.map((img, index) => ({
          image_url: img.image_url,
          alt_text: null,
          title: img.title, // "Identity Document" cho ảnh giấy tờ, null cho ảnh bất động sản
          display_order: index,
          is_primary: img.is_primary,
        })),
      }

      const response = await fetch(`${apiUrl}/properties/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(propertyCreateData),
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Không thể tạo bất động sản: ${errorText}`)
      }
      const createdProperty = await response.json()
      console.log("Đã tạo bất động sản:", createdProperty)
      onClose()
      setCurrentStep(1)
    } catch (err: any) {
      setError("Lỗi: " + err.message)
      console.error("Lỗi khi tạo bất động sản:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const isValidImageFile = (file: File) => {
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif"]
    const extension = file.name.split(".").pop()?.toLowerCase()
    return extension && allowedExtensions.includes(`.${extension}`)
  }

  const handleInputChange = (field: keyof typeof propertyData, value: any) => {
    setPropertyData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCountChange = (field: "guests" | "bedrooms" | "bathrooms", increment: boolean) => {
    setPropertyData((prev) => ({
      ...prev,
      [field]: increment ? prev[field] + 1 : Math.max(1, prev[field] - 1),
    }))
  }

  const handleIdUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setPropertyData((prev) => ({ ...prev, idImage: event.target.files![0] }))
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files)
      setPropertyData((prev) => ({ ...prev, images: [...prev.images, ...files] }))
    }
  }

  const toggleAmenity = (amenityId: string) => {
    setPropertyData((prev) => ({
      ...prev,
      selectedAmenities: prev.selectedAmenities.includes(amenityId)
        ? prev.selectedAmenities.filter((id) => id !== amenityId)
        : [...prev.selectedAmenities, amenityId],
    }))
  }

  const renderStepContent = () => {
    if (isLoading) {
      return <div className="text-center py-8">Đang tải...</div>
    }
    if (error) {
      return <div className="text-red-500 text-center py-8">{error}</div>
    }

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Đầu tiên, hãy nhập thông tin và liên hệ của bạn!
              </h2>
              <p className="text-lg text-gray-700 mb-8">Tải lên hình ảnh giấy tờ tùy thân tại đây:</p>
              <div
                onClick={() => idInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-16 text-center cursor-pointer hover:border-gray-400 transition-colors bg-gray-50"
              >
                <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nhấn để tải lên hình ảnh giấy tờ</p>
                {propertyData.idImage && (
                  <p className="text-sm text-green-600 mt-2">✓ {propertyData.idImage.name}</p>
                )}
              </div>
              <input
                ref={idInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif"
                onChange={handleIdUpload}
                className="hidden"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cung cấp thông tin liên hệ của bạn:</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <span className="text-gray-700 w-16">Email:</span>
                  <Input
                    value={propertyData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="aaaaa.122@gmail.com"
                    className="flex-1 border-none shadow-none focus-visible:ring-0"
                  />
                </div>
                <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <span className="text-gray-700 w-16">Số điện thoại:</span>
                  <Input
                    value={propertyData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="0912244444"
                    className="flex-1 border-none shadow-none focus-visible:ring-0"
                  />
                </div>
              </div>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-gray-900">Loại hình bất động sản của bạn là gì?</h2>
            <div className="grid grid-cols-5 gap-6">
              {propertyTypes.map((type) => (
                <button
                  key={type.name}
                  onClick={() => handleInputChange("propertyType", type.name)}
                  className={`p-4 rounded-xl border-2 transition-all hover:border-gray-400 ${
                    propertyData.propertyType === type.name ? "border-gray-900 bg-gray-50" : "border-gray-200"
                  }`}
                >
                  <div className="text-3xl mb-2">🏠</div>
                  <div className="text-sm font-medium text-gray-700">{type.name}</div>
                </button>
              ))}
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-gray-900">Danh mục nào mô tả tốt nhất nơi của bạn?</h2>
            <div className="grid grid-cols-5 gap-6">
              {accommodationTypes.map((type) => (
                <button
                  key={type.name}
                  onClick={() => handleInputChange("category", type.name)}
                  className={`p-4 rounded-xl border-2 transition-all hover:border-gray-400 ${
                    propertyData.category === type.name ? "border-gray-900 bg-gray-50" : "border-gray-200"
                  }`}
                >
                  <div className="text-3xl mb-2">🏠</div>
                  <div className="text-sm font-medium text-gray-700">{type.name}</div>
                </button>
              ))}
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Nơi của bạn nằm ở đâu?</h2>
              <p className="text-gray-600">Địa chỉ của bạn sẽ được chia sẻ với khách hàng sau khi đặt chỗ.</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <span className="text-gray-700 w-24">Địa chỉ:</span>
                <Input
                  value={propertyData.addressLine1}
                  onChange={(e) => handleInputChange("addressLine1", e.target.value)}
                  placeholder="Số nhà, đường"
                  className="flex-1"
                />
              </div>
              <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <span className="text-gray-700 w-24">Thành phố:</span>
                <Input
                  value={propertyData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Thành phố"
                  className="flex-1"
                />
              </div>
              <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <span className="text-gray-700 w-24">Bang/Tỉnh:</span>
                <Input
                  value={propertyData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  placeholder="Bang hoặc tỉnh"
                  className="flex-1"
                />
              </div>
              <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <span className="text-gray-700 w-24">Quốc gia:</span>
                <Input
                  value={propertyData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  placeholder="Quốc gia"
                  className="flex-1"
                />
              </div>
              <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <span className="text-gray-700 w-24">Mã bưu điện:</span>
                <Input
                  value={propertyData.postalCode}
                  onChange={(e) => handleInputChange("postalCode", e.target.value)}
                  placeholder="Mã bưu điện"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        )
      case 5:
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-gray-900">Chính sách và giá cả</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <span className="text-gray-700 w-24">Giá cơ bản:</span>
                <Input
                  type="number"
                  value={propertyData.basePrice}
                  onChange={(e) => handleInputChange("basePrice", parseFloat(e.target.value) || 0)}
                  placeholder="Giá mỗi đêm (USD)"
                  className="flex-1"
                />
              </div>
              <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <span className="text-gray-700 w-24">Chính sách hủy:</span>
                <select
                  value={propertyData.cancellationPolicy}
                  onChange={(e) => handleInputChange("cancellationPolicy", e.target.value as "FLEXIBLE" | "MODERATE" | "STRICT" | "SUPER_STRICT")}
                  className="flex-1 border-none shadow-none focus-visible:ring-0"
                >
                  <option value="FLEXIBLE">Linh hoạt</option>
                  <option value="MODERATE">Trung bình</option>
                  <option value="STRICT">Nghiêm ngặt</option>
                  <option value="SUPER_STRICT">Siêu nghiêm ngặt</option>
                </select>
              </div>
            </div>
          </div>
        )
      case 6:
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-gray-900">
              Chia sẻ thêm thông tin chi tiết về nơi của bạn
            </h2>
            <div className="space-y-6 max-w-md mx-auto">
              {[
                { field: "guests", label: "Khách" },
                { field: "bedrooms", label: "Phòng ngủ" },
                { field: "bathrooms", label: "Phòng tắm" },
              ].map(({ field, label }) => (
                <div key={field} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <span className="text-gray-700 font-medium">{label}:</span>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleCountChange(field as "guests" | "bedrooms" | "bathrooms", false)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400"
                      disabled={propertyData[field as "guests" | "bedrooms" | "bathrooms"] <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-semibold">{propertyData[field as "guests" | "bedrooms" | "bathrooms"]}</span>
                    <button
                      onClick={() => handleCountChange(field as "guests" | "bedrooms" | "bathrooms", true)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      case 7:
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-gray-900">Tải lên một số hình ảnh về nơi của bạn:</h2>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-24 text-center cursor-pointer hover:border-gray-400 transition-colors bg-gray-50"
            >
              <Plus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nhấn để tải lên hình ảnh</p>
              {propertyData.images.length > 0 && (
                <p className="text-sm text-green-600 mt-2">✓ {propertyData.images.length} hình ảnh đã được tải lên</p>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            {propertyData.images.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Danh sách hình ảnh:</h3>
                {propertyData.images.map((image, index) => (
                  <div key={index} className="flex items-center space-x-4 p-2 border border-gray-200 rounded-lg">
                    <span className="text-gray-700 flex-1 truncate">{image.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setPropertyData((prev) => ({
                          ...prev,
                          images: prev.images.filter((_, i) => i !== index),
                        }))
                      }
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      case 8:
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Bạn cung cấp thêm những gì?</h2>
              <p className="text-gray-600">Danh sách tiện ích</p>
            </div>
            <div className="grid grid-cols-5 gap-6">
              {amenities.map((amenity) => (
                <button
                  key={amenity.id}
                  onClick={() => toggleAmenity(amenity.id)}
                  className={`p-4 rounded-xl border-2 transition-all hover:border-gray-400 ${
                    propertyData.selectedAmenities.includes(amenity.id)
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="text-2xl mb-2">{amenity.icon || "🛠️"}</div>
                  <div className="text-sm font-medium text-gray-700 text-center">{amenity.name}</div>
                </button>
              ))}
            </div>
          </div>
        )
      case 9:
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-gray-900">Đặt tên và mô tả cho nơi của bạn!</h2>
            <div className="space-y-6">
              <div className="p-6 border border-gray-200 rounded-lg">
                <div className="flex items-start space-x-4">
                  <span className="text-gray-700 font-medium mt-2">Tên:</span>
                  <Input
                    value={propertyData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Một homestay ấm cúng cho gia đình"
                    className="flex-1 border-none shadow-none focus-visible:ring-0 text-lg"
                  />
                </div>
              </div>
              <div className="p-6 border border-gray-200 rounded-lg">
                <div className="flex items-start space-x-4">
                  <span className="text-gray-700 font-medium mt-2">Mô tả:</span>
                  <textarea
                    value={propertyData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Bạn sẽ có khoảng thời gian tuyệt vời cùng gia đình tại đây"
                    className="flex-1 border-none shadow-none focus-visible:ring-0 text-lg resize-none h-24"
                  />
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl p-0 gap-0 max-h-[90vh] overflow-y-auto">
        <VisuallyHidden>
          <DialogTitle>Tạo bất động sản mới</DialogTitle>
        </VisuallyHidden>
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-blue-800 font-serif">Sky-high</h1>
              <div className="text-xs text-gray-500">YOUR HOLIDAY</div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="p-0 h-auto">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="min-h-[500px]">{renderStepContent()}</div>
          <div className="flex justify-between items-center pt-8 mt-8 border-t">
            {currentStep > 1 ? (
              <Button onClick={handleBack} className="bg-cyan-400 hover:bg-cyan-500 text-white px-8 py-3 rounded-lg">
                Quay lại
              </Button>
            ) : (
              <div></div>
            )}
            {currentStep < 9 ? (
              <Button
                onClick={handleNext}
                className="bg-cyan-400 hover:bg-cyan-500 text-white px-8 py-3 rounded-lg"
                disabled={
                  isLoading ||
                  (currentStep === 1 && (!propertyData.email || !propertyData.phone || !propertyData.idImage)) ||
                  (currentStep === 2 && !propertyData.propertyType) ||
                  (currentStep === 3 && !propertyData.category) ||
                  (currentStep === 4 &&
                    (!propertyData.addressLine1 ||
                      !propertyData.city ||
                      !propertyData.state ||
                      !propertyData.country ||
                      !propertyData.postalCode)) ||
                  (currentStep === 5 && (!propertyData.basePrice || !propertyData.cancellationPolicy)) ||
                  (currentStep === 9 && (!propertyData.title || !propertyData.description))
                }
              >
                Tiếp theo
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                className="bg-cyan-400 hover:bg-cyan-500 text-white px-8 py-3 rounded-lg"
                disabled={isLoading || !propertyData.title || !propertyData.description}
              >
                {isLoading ? "Đang tạo..." : "Hoàn tất!"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}