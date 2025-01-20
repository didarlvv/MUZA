"use client"

import { useState } from "react"
import { MainNav } from "@/components/main-nav"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { Logo } from "./Logo"

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { logout } = useAuth()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center w-full sm:w-auto justify-between sm:justify-start mb-4 sm:mb-0">
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
                    <MainNav isAdmin={true} className="flex flex-col space-x-0 space-y-2" />
                  </div>
                </SheetContent>
              </Sheet>
              <Logo className="h-8 w-auto text-primary mr-2" />
              <span className="text-xl font-bold">Admin Panel</span>
            </div>
            <Button onClick={handleLogout} variant="outline" className="sm:hidden">
              Выйти
            </Button>
          </div>
          <div className="hidden lg:block">
            <MainNav isAdmin={true} />
          </div>
          <Button onClick={handleLogout} variant="outline" className="hidden sm:block">
            Выйти
          </Button>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      <footer className="bg-white border-t py-4 px-4 text-center text-sm text-gray-600">
        <div className="container mx-auto">© 2023 Restaurant Management System. All rights reserved.</div>
      </footer>
    </div>
  )
}

