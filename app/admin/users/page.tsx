"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { userApi } from "@/lib/api"
import type { User, PaginationParams } from "@/types/api"
import { ChevronDown, ChevronUp, Search, Plus } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { CreateUserForm } from "@/components/create-user-form"
import { EditUserForm } from "@/components/edit-user-form"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [params, setParams] = useState<PaginationParams>({
    limit: 20,
    page: 1,
    order_direction: "DESC",
    order_by: "id",
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const fetchUsers = async () => {
    try {
      const data = await userApi.getUsers({
        ...params,
        search: searchQuery || undefined,
      })
      setUsers(data)
    } catch (error) {
      console.error("Failed to fetch users:", error)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [params, searchQuery])

  const handleSort = (column: string) => {
    setParams((prev) => ({
      ...prev,
      order_by: column,
      order_direction: prev.order_by === column && prev.order_direction === "DESC" ? "ASC" : "DESC",
    }))
  }

  const SortIcon = ({ column }: { column: string }) => {
    if (params.order_by !== column) return null
    return params.order_direction === "DESC" ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />
  }

  const handleCreateSuccess = () => {
    setIsCreateDrawerOpen(false)
    fetchUsers()
  }

  const handleEditSuccess = () => {
    setEditingUser(null)
    fetchUsers()
  }

  return (
    <AdminLayout>
      <Card className="mb-6 bg-gradient-to-b from-white to-gray-50">
        <CardHeader>
          <CardTitle>Пользователи</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск пользователей..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full sm:w-[300px]"
              />
            </div>
            <div className="flex items-center gap-4">
              <Select
                value={String(params.limit)}
                onValueChange={(value) => setParams((prev) => ({ ...prev, limit: Number(value) }))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Строк на странице" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 строк</SelectItem>
                  <SelectItem value="20">20 строк</SelectItem>
                  <SelectItem value="50">50 строк</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setIsCreateDrawerOpen(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" /> Добавить
              </Button>
            </div>
          </div>
          <div className="rounded-md border shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead onClick={() => handleSort("firstName")} className="cursor-pointer">
                    <div className="flex items-center">
                      Имя
                      <SortIcon column="firstName" />
                    </div>
                  </TableHead>
                  <TableHead onClick={() => handleSort("email")} className="cursor-pointer">
                    <div className="flex items-center">
                      Email
                      <SortIcon column="email" />
                    </div>
                  </TableHead>
                  <TableHead onClick={() => handleSort("role")} className="cursor-pointer">
                    <div className="flex items-center">
                      Роль
                      <SortIcon column="role" />
                    </div>
                  </TableHead>
                  <TableHead onClick={() => handleSort("status")} className="cursor-pointer">
                    <div className="flex items-center">
                      Статус
                      <SortIcon column="status" />
                    </div>
                  </TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.status}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => setEditingUser(user)}>
                        Редактировать
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setParams((prev) => ({ ...prev, page: prev.page - 1 }))}
              disabled={params.page === 1}
              className="hover:bg-primary/10"
            >
              Предыдущая
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setParams((prev) => ({ ...prev, page: prev.page + 1 }))}
              className="hover:bg-primary/10"
            >
              Следующая
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Create User Drawer */}
      <Sheet open={isCreateDrawerOpen} onOpenChange={setIsCreateDrawerOpen}>
        <SheetContent side="right" className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Добавить пользователя</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <CreateUserForm onSuccess={handleCreateSuccess} onCancel={() => setIsCreateDrawerOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit User Drawer */}
      <Sheet open={editingUser !== null} onOpenChange={(open) => !open && setEditingUser(null)}>
        <SheetContent side="right" className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Редактировать пользователя</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {editingUser && (
              <EditUserForm
                userId={editingUser.id}
                initialData={editingUser}
                onSuccess={handleEditSuccess}
                onCancel={() => setEditingUser(null)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </AdminLayout>
  )
}

