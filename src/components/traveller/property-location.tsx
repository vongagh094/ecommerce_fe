import { Button } from "@/components/ui/button"
export function PropertyLocation() {
  return (
    <div className="border-t pt-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Where you'll be</h2>

      {/* Map Placeholder */}
      <div className="aspect-video bg-gray-200 rounded-lg mb-4 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white p-3 rounded-lg shadow-lg">
            <p className="text-sm text-gray-600">Map view</p>
          </div>
        </div>
        {/* You would integrate with Google Maps or similar here */}
      </div>

      <div>
        <h3 className="font-medium text-gray-900 mb-2">Bordeaux, Nouvelle-Aquitaine, France</h3>
        <p className="text-gray-700 text-sm leading-relaxed">
          Very dynamic and appreciated district by the people of Bordeaux thanks to rue St James and place Fernand
          Lafargue. Home to many historical monuments such as the Grosse Cloche, the Porte de Bourgogne and the Pont
          Cailhau, and cultural sites such as the Darwin ecosystem...
        </p>
        <Button variant="ghost" className="p-0 h-auto mt-2 text-gray-900 hover:text-gray-700">
          Show more
        </Button>
      </div>
    </div>
  )
}
