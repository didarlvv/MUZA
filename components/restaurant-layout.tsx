"use client"

import { useState, useEffect } from "react"
import { MainNav } from "@/components/main-nav"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { RestaurantSelector } from "@/components/restaurant-selector"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, LogOut } from "lucide-react"
import { Logo } from "./Logo"

interface RestaurantLayoutProps {
  children: React.ReactNode
}

export function RestaurantLayout({ children }: RestaurantLayoutProps) {
  const { logout, user, selectedRestaurant, setSelectedRestaurant } = useAuth()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  useEffect(() => {
    if (user?.restaurants && user.restaurants.length > 0 && !selectedRestaurant) {
      setSelectedRestaurant(user.restaurants[0])
    }
  }, [user, selectedRestaurant, setSelectedRestaurant])

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center w-full sm:w-auto justify-between mb-4 sm:mb-0">
              <div className="flex items-center">
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      className="mr-2 px-0 text-base hover:bg-transparent hover:text-primary focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
                    >
                      <Menu className="h-6 w-6" />
                      <span className="sr-only">Toggle Menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="pl-1 pr-0">
                    <div className="px-7">
                      <MainNav isAdmin={false} className="flex flex-col space-x-0 space-y-2" />
                    </div>
                  </SheetContent>
                </Sheet>
                <Logo className="h-8 w-auto text-primary mr-2" />
                <span className="text-xl font-bold text-gray-900">Restaurant Panel</span>
              </div>
            </div>
            <div className="hidden lg:block">
              <MainNav isAdmin={false} />
            </div>
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <RestaurantSelector
                onSelect={(restaurantId) => {
                  const selected = user?.restaurants.find((r) => r.id === restaurantId)
                  if (selected) {
                    setSelectedRestaurant(selected)
                  }
                }}
              />
              <Button onClick={handleLogout} variant="outline" className="flex items-center">
                <LogOut className="mr-2 h-4 w-4" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      <footer className="bg-white border-t py-6 px-4 mt-8">
        <div className="container mx-auto text-center text-sm text-gray-600">
          © 2023 Restaurant Management System. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

