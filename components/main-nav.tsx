"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface MainNavProps {
  isAdmin?: boolean
  className?: string
}

export function MainNav({ isAdmin, className }: MainNavProps) {
  const pathname = usePathname()

  const adminLinks = [
    {
      title: "Пользователи",
      href: "/admin/users",
    },
    {
      title: "Рестораны",
      href: "/admin/restaurants",
    },
  ]

  const restaurantLinks = [
    {
      title: "Заказы",
      href: "/restaurant/orders",
    },
    {
      title: "Список заказов",
      href: "/restaurant/order-list",
    },
    {
      title: "Типы заказов",
      href: "/restaurant/order-types",
    },
    {
      title: "Новый заказ",
      href: "/restaurant/orders/new",
    },
  ]

  const links = isAdmin ? adminLinks : restaurantLinks

  return (
    <nav className={cn("flex", className)}>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "flex items-center text-sm font-medium transition-colors hover:text-primary",
            pathname === link.href ? "text-primary" : "text-muted-foreground",
            className?.includes("flex-col") ? "justify-center h-12 w-full" : "px-4 py-2",
          )}
        >
          {link.title}
        </Link>
      ))}
    </nav>
  )
}

