const inspirationCategories = [
  {
    title: "Popular",
    destinations: [
      { name: "Canmore", type: "Apartment rentals" },
      { name: "Benalmádena", type: "Flat rentals" },
      { name: "Marbella", type: "Holiday rentals" },
      { name: "Mijas", type: "Holiday rentals" },
      { name: "Prescott", type: "Holiday rentals" },
      { name: "Scottsdale", type: "Holiday rentals" },
    ],
  },
  {
    title: "Arts and Culture",
    destinations: [
      { name: "Tucson", type: "Apartment rentals" },
      { name: "Jasper", type: "Cabin rentals" },
      { name: "Mountain View", type: "Holiday rentals" },
      { name: "Devonport", type: "Cottage rentals" },
      { name: "Mallacoota", type: "Holiday rentals" },
      { name: "Ibiza", type: "Holiday rentals" },
    ],
  },
  {
    title: "Outdoors",
    destinations: [
      { name: "Anaheim", type: "Beach house rentals" },
      { name: "Monterey", type: "Apartment rentals" },
      { name: "Paso Robles", type: "Cottage rentals" },
      { name: "Santa Barbara", type: "Cottage rentals" },
      { name: "Sonoma", type: "Cottage rentals" },
      { name: "Show more", type: "" },
    ],
  },
  {
    title: "Mountains",
    destinations: [
      { name: "Beach", type: "" },
      { name: "Unique stays", type: "" },
      { name: "Categories", type: "" },
      { name: "Things to do", type: "" },
    ],
  },
]

export function InspirationSection() {
  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8">Inspiration for future getaways</h2>

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
