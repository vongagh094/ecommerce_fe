import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDown } from 'lucide-react'
import type { PropertySummary } from "@/types/host"

interface PropertySelectorProps {
  properties: PropertySummary[]
  selectedProperty: PropertySummary | null
  onPropertyChange: (property: PropertySummary) => void
}

export function PropertySelector({ properties, selectedProperty, onPropertyChange }: PropertySelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          {selectedProperty ? selectedProperty.name : "Choose which room"}
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {properties.map((property) => (
          <DropdownMenuItem key={property.id} onSelect={() => onPropertyChange(property)}>
            <div className="flex flex-col">
              <span>{property.name}</span>
              <span className="text-xs text-gray-500">{property.location}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
