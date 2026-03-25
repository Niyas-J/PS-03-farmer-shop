"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Clock } from "lucide-react"

export interface Equipment {
  id: string
  name: string
  category: string
  pricePerHour: number
  pricePerDay: number
  rating: number
  reviews: number
  location: string
  available: boolean
  image: string
  features: string[]
}

interface EquipmentCardProps {
  equipment: Equipment
  onBook: (equipment: Equipment) => void
}

export function EquipmentCard({ equipment, onBook }: EquipmentCardProps) {
  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border/50">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={equipment.image}
          alt={equipment.name}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm text-card-foreground">
            {equipment.category}
          </Badge>
          {equipment.available ? (
            <Badge className="bg-primary text-primary-foreground">Available</Badge>
          ) : (
            <Badge variant="destructive">Booked</Badge>
          )}
        </div>
      </div>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-semibold text-lg text-foreground leading-tight">{equipment.name}</h3>
          <div className="flex items-center gap-1 text-accent shrink-0">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-medium">{equipment.rating}</span>
            <span className="text-xs text-muted-foreground">({equipment.reviews})</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
          <MapPin className="w-4 h-4" />
          <span>{equipment.location}</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {equipment.features.slice(0, 3).map((feature) => (
            <span
              key={feature}
              className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full"
            >
              {feature}
            </span>
          ))}
        </div>

        <div className="flex items-baseline gap-3 pt-3 border-t border-border">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-lg font-bold text-foreground">${equipment.pricePerHour}</span>
            <span className="text-sm text-muted-foreground">/hr</span>
          </div>
          <div className="text-sm text-muted-foreground">
            ${equipment.pricePerDay}/day
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-5 pt-0">
        <Button 
          className="w-full" 
          onClick={() => onBook(equipment)}
          disabled={!equipment.available}
        >
          {equipment.available ? "Book Now" : "Not Available"}
        </Button>
      </CardFooter>
    </Card>
  )
}
