"use client"

import { usePropertyTranslations } from "@/hooks/use-translations"

export function InspirationSection() {
  const t = usePropertyTranslations()
  
  const inspirationCategories = [
    {
      title: t('inspiration.popular'),
      destinations: [
        { name: "Canmore", type: t('inspiration.apartmentRentals') },
        { name: "Benalmádena", type: t('inspiration.flatRentals') },
        { name: "Marbella", type: t('inspiration.holidayRentals') },
        { name: "Mijas", type: t('inspiration.holidayRentals') },
        { name: "Prescott", type: t('inspiration.holidayRentals') },
        { name: "Scottsdale", type: t('inspiration.holidayRentals') },
      ],
    },
    {
      title: t('inspiration.artsAndCulture'),
      destinations: [
        { name: "Tucson", type: t('inspiration.apartmentRentals') },
        { name: "Jasper", type: t('inspiration.cabinRentals') },
        { name: "Mountain View", type: t('inspiration.holidayRentals') },
        { name: "Devonport", type: t('inspiration.cottageRentals') },
        { name: "Mallacoota", type: t('inspiration.holidayRentals') },
        { name: "Ibiza", type: t('inspiration.holidayRentals') },
      ],
    },
    {
      title: t('inspiration.outdoors'),
      destinations: [
        { name: "Anaheim", type: t('inspiration.beachHouseRentals') },
        { name: "Monterey", type: t('inspiration.apartmentRentals') },
        { name: "Paso Robles", type: t('inspiration.cottageRentals') },
        { name: "Santa Barbara", type: t('inspiration.cottageRentals') },
        { name: "Sonoma", type: t('inspiration.cottageRentals') },
        { name: t('inspiration.showMore'), type: "" },
      ],
    },
    {
      title: t('inspiration.mountains'),
      destinations: [
        { name: t('inspiration.beach'), type: "" },
        { name: t('inspiration.uniqueStays'), type: "" },
        { name: t('inspiration.categories'), type: "" },
        { name: t('inspiration.thingsToDo'), type: "" },
      ],
    },
  ]

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8">{t('inspiration.title')}</h2>

        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {inspirationCategories.map((category, index) => (
              <button
                key={category.title}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  index === 0
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {category.title}
              </button>
            ))}
          </nav>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {inspirationCategories[0].destinations.map((destination, index) => (
            <div key={index} className="space-y-1">
              <h3 className="font-medium text-gray-900">{destination.name}</h3>
              <p className="text-sm text-gray-600">{destination.type}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
