"use client"

import { useState, useEffect } from "react"
import { RestaurantLayout } from "@/components/restaurant-layout"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { orderApi } from "@/lib/api"
import type { Order } from "@/types/api"
import { Search, Download, ChevronDown, ChevronUp } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { format, parseISO } from "date-fns"
import { ru } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import * as XLSX from "xlsx/xlsx.mjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function OrderListPage() {
  const { toast } = useToast()
  const { selectedRestaurant } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [sortConfig, setSortConfig] = useState<{ key: keyof Order; direction: "asc" | "desc" }>({
    key: "date",
    direction: "desc",
  })
  const [dateRange, setDateRange] = useState({
    minDate: format(new Date(new Date().setMonth(new Date().getMonth() - 1)), "yyyy-MM-dd"),
    maxDate: format(new Date(), "yyyy-MM-dd"),
  })

  const fetchOrders = async () => {
    if (!selectedRestaurant) return
    setIsLoading(true)
    try {
      const data = await orderApi.getOrders({
        order_by: sortConfig.key,
        order_direction: sortConfig.direction.toUpperCase() as "ASC" | "DESC",
        search: searchQuery || undefined,
        restaurantId: selectedRestaurant.id,
        status: statusFilter || undefined,
        minDate: dateRange.minDate,
        maxDate: dateRange.maxDate,
      })
      setOrders(data)
    } catch (error) {
      console.error("Failed to fetch orders:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить заказы",
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
  }, [selectedRestaurant, searchQuery, statusFilter, dateRange, sortConfig])

  const handleSort = (key: keyof Order) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-500"
      case "rejected":
        return "bg-red-500"
      case "prepayment":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "accepted":
        return "Принят"
      case "rejected":
        return "Отклонен"
      case "prepayment":
        return "Предоплата"
      default:
        return status
    }
  }

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      orders.map((order) => ({
        ID: order.id,
        "ФИО клиента": order.fullName,
        Телефон: order.phonenumber,
        Дата: format(parseISO(order.date), "d MMMM yyyy", { locale: ru }),
        "Тип заказа": order.orderTypeName,
        "Количество гостей": order.chairCount,
        Цена: order.price,
        Скидка: order.discount,
        "Итоговая сумма": order.totalPayment,
        Статус: getStatusText(order.status),
        "Выездное мероприятие": order.offsite ? "Да" : "Нет",
        Примечание: order.note,
        Комментарий: order.comment,
      })),
    )
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders")

    // Generate Excel file as an array buffer
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })

    // Convert array buffer to Blob
    const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })

    // Create download link and trigger download
    const url = window.URL.createObjectURL(data)
    const link = document.createElement("a")
    link.href = url
    link.download = "orders.xlsx"
    link.click()

    // Clean up
    window.URL.revokeObjectURL(url)
  }

  if (!selectedRestaurant) {
    return <div>Пожалуйста, выберите ресторан</div>
  }

  return (
    <RestaurantLayout>
      <Card className="mb-6 bg-gradient-to-b from-white to-gray-50">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-center">
          <CardTitle className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Список заказов</CardTitle>
          <Button onClick={exportToExcel} className="bg-primary hover:bg-primary/90">
            <Download className="mr-2 h-4 w-4" />
            Экспорт в Excel
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск заказов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="accepted">Принятые</SelectItem>
                <SelectItem value="rejected">Отклоненные</SelectItem>
                <SelectItem value="prepayment">Предоплата</SelectItem>
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

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="rounded-md border shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]" onClick={() => handleSort("id")}>
                      ID{" "}
                      {sortConfig.key === "id" &&
                        (sortConfig.direction === "asc" ? (
                          <ChevronUp className="inline" />
                        ) : (
                          <ChevronDown className="inline" />
                        ))}
                    </TableHead>
                    <TableHead onClick={() => handleSort("fullName")}>
                      ФИО клиента{" "}
                      {sortConfig.key === "fullName" &&
                        (sortConfig.direction === "asc" ? (
                          <ChevronUp className="inline" />
                        ) : (
                          <ChevronDown className="inline" />
                        ))}
                    </TableHead>
                    <TableHead onClick={() => handleSort("date")}>
                      Дата{" "}
                      {sortConfig.key === "date" &&
                        (sortConfig.direction === "asc" ? (
                          <ChevronUp className="inline" />
                        ) : (
                          <ChevronDown className="inline" />
                        ))}
                    </TableHead>
                    <TableHead>Тип заказа</TableHead>
                    <TableHead className="text-right" onClick={() => handleSort("chairCount")}>
                      Гости{" "}
                      {sortConfig.key === "chairCount" &&
                        (sortConfig.direction === "asc" ? (
                          <ChevronUp className="inline" />
                        ) : (
                          <ChevronDown className="inline" />
                        ))}
                    </TableHead>
                    <TableHead className="text-right" onClick={() => handleSort("totalPayment")}>
                      Сумма{" "}
                      {sortConfig.key === "totalPayment" &&
                        (sortConfig.direction === "asc" ? (
                          <ChevronUp className="inline" />
                        ) : (
                          <ChevronDown className="inline" />
                        ))}
                    </TableHead>
                    <TableHead>Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.fullName}</TableCell>
                      <TableCell>{format(parseISO(order.date), "d MMMM yyyy", { locale: ru })}</TableCell>
                      <TableCell>{order.orderTypeName}</TableCell>
                      <TableCell className="text-right">{order.chairCount}</TableCell>
                      <TableCell className="text-right">{order.totalPayment} TMT</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(order.status)} text-white`}>
                          {getStatusText(order.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </RestaurantLayout>
  )
}

