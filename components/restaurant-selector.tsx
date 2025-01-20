import React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/AuthContext"

interface RestaurantSelectorProps {
  onSelect: (restaurantId: number) => void
}

export function RestaurantSelector({ onSelect }: RestaurantSelectorProps) {
  const { user, selectedRestaurant } = useAuth()

  if (!user || !user.restaurants || user.restaurants.length === 0) {
    return null
  }

  return (
    <Select onValueChange={(value) => onSelect(Number(value))} value={selectedRestaurant?.id.toString()}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Выберите ресторан" />
      </SelectTrigger>
      <SelectContent>
        {user.restaurants.map((restaurant) => (
          <SelectItem key={restaurant.id} value={restaurant.id.toString()}>
            {restaurant.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

