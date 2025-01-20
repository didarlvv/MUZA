"use client"

import { useState, useEffect } from "react"
import { RestaurantLayout } from "@/components/restaurant-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { orderApi } from "@/lib/api"
import type { Order } from "@/types/api"
import { Search, Calendar, MapPin, Users } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { format, parseISO } from "date-fns"
import { ru } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"

export default function OrdersPage() {
  const { toast } = useToast()
  const { selectedRestaurant } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [dateRange, setDateRange] = useState({
    minDate: format(new Date(), "yyyy-MM-dd"),
    maxDate: format(new Date(new Date().setMonth(new Date().getMonth() + 1)), "yyyy-MM-dd"),
  })

  const fetchOrders = async () => {
    if (!selectedRestaurant) return
    setIsLoading(true)
    try {
      const data = await orderApi.getOrders({
        order_by: "date",
        order_direction: "ASC",
        search: searchQuery || undefined,
        restaurantId: selectedRestaurant.id,
        status: statusFilter || undefined,
        minDate: dateRange.minDate,
        maxDate: dateRange.maxDate,
      })
      setOrders(data)
    } catch (error) {
      console.error("Failed to fetch orders:", error)
      let errorMessage = "Не удалось загрузить заказы"
      if (error.response) {
        errorMessage += `: ${error.response.status} ${error.response.statusText}`
      }
      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (selectedRestaurant) {
      fetchOrders()
    }
  }, [selectedRestaurant, searchQuery, statusFilter, dateRange])

  const groupOrdersByDate = (orders: Order[]) => {
    return orders.reduce(
      (groups, order) => {
        const date = order.date
        if (!groups[date]) {
          groups[date] = []
        }
        groups[date].push(order)
        return groups
      },
      {} as Record<string, Order[]>,
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-500"
      case "rejected":
        return "bg-red-500"
      default:
        return "bg-yellow-500"
    }
  }

  const groupedOrders = groupOrdersByDate(orders)

  if (!selectedRestaurant) {
    return <div>Пожалуйста, выберите ресторан</div>
  }

  return (
    <RestaurantLayout>
      <Card className="mb-6 bg-gradient-to-b from-white to-gray-50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">Заказы</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск заказов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full sm:w-[300px]"
              />
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  <SelectItem value="accepted">Принятые</SelectItem>
                  <SelectItem value="rejected">Отклоненные</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={dateRange.minDate}
                onChange={(e) => setDateRange((prev) => ({ ...prev, minDate: e.target.value }))}
                className="w-[180px]"
              />
              <Input
                type="date"
                value={dateRange.maxDate}
                onChange={(e) => setDateRange((prev) => ({ ...prev, maxDate: e.target.value }))}
                className="w-[180px]"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedOrders).map(([date, dateOrders]) => (
                <div key={date} className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {format(parseISO(date), "d MMMM yyyy", { locale: ru })}
                  </h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {dateOrders.map((order) => (
                      <Card key={order.id} className="overflow-hidden transition-shadow duration-200 hover:shadow-lg">
                        <CardHeader className="pb-3 bg-gray-50">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg font-semibold text-gray-900">{order.fullName}</CardTitle>
                            <Badge className={`${getStatusColor(order.status)} text-white`}>
                              {order.status === "accepted"
                                ? "Принят"
                                : order.status === "rejected"
                                  ? "Отклонен"
                                  : "Ожидает"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="mr-2 h-4 w-4" />
                            {format(parseISO(order.date), "d MMMM yyyy", { locale: ru })}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="mr-2 h-4 w-4" />
                            {order.offsite ? "Выездное" : "В ресторане"}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="mr-2 h-4 w-4" />
                            {order.chairCount} гостей
                          </div>
                          <div className="pt-3 border-t border-gray-200">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Тип мероприятия:</span>
                              <span className="font-medium text-gray-900">{order.orderTypeName}</span>
                            </div>
                            <div className="flex justify-between text-sm mt-1">
                              <span className="text-gray-600">Цена:</span>
                              <span className="font-medium text-gray-900">{order.price} TMT</span>
                            </div>
                            {order.discount > 0 && (
                              <div className="flex justify-between text-sm mt-1">
                                <span className="text-gray-600">Скидка:</span>
                                <span className="font-medium text-green-600">{order.discount}%</span>
                              </div>
                            )}
                            {order.note && (
                              <div className="mt-3 text-sm text-gray-600">
                                <p className="font-medium">Примечание:</p>
                                <p className="mt-1">{order.note}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </RestaurantLayout>
  )
}

