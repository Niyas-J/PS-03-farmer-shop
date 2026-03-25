"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const categories = [
  { id: "all", label: "All Equipment" },
  { id: "tractor", label: "Tractors" },
  { id: "harvester", label: "Harvesters" },
  { id: "seeder", label: "Seeders" },
  { id: "sprayer", label: "Sprayers" },
  { id: "tillage", label: "Tillage" },
]

interface EquipmentFilterProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export function EquipmentFilter({ selectedCategory, onCategoryChange }: EquipmentFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryChange(category.id)}
          className={cn(
            "transition-all",
            selectedCategory === category.id 
              ? "" 
              : "border-border hover:bg-secondary"
          )}
        >
          {category.label}
        </Button>
      ))}
    </div>
  )
}
