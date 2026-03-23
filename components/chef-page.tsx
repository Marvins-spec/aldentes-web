"use client"

import { useEffect } from "react"
import { useState } from "react"
import { useStore, type Order } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { 
  ChefHat, 
  Clock, 
  Check,
  ArrowRight,
  User,
  Pizza,
  Cake,
  Coffee
} from "lucide-react"

interface OrderCardProps {
  order: Order
  onAction?: () => void
  actionLabel?: string
  actionDisabled?: boolean
  showChef?: boolean
}

function OrderCard({ order, onAction, actionLabel, actionDisabled, showChef }: OrderCardProps) {
  const statusColors = {
    pending: 'bg-pending/20 text-pending border-pending/30',
    cooking: 'bg-cooking/20 text-cooking border-cooking/30',
    ready: 'bg-ready/20 text-ready border-ready/30',
    completed: 'bg-muted text-muted-foreground border-muted',
  }

  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-lg",
      order.status === 'cooking' && "ring-2 ring-cooking/50"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium text-card-foreground">
            {order.id}
          </CardTitle>
          <Badge className={statusColors[order.status]}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {order.tableNumber && (
            <span className="flex items-center gap-1">
              Table {order.tableNumber}
            </span>
          )}
          {order.customerName && (
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {order.customerName}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          {order.items.map((item, idx) => (
            <div key={idx} className="text-sm">
              <div className="flex items-center justify-between">
                <span className="text-card-foreground">
                  {item.name}
                  {item.size && <span className="text-muted-foreground ml-1">({item.size === 'large' ? 'L' : 'M'})</span>}
                </span>
                <span className="text-muted-foreground">x{item.quantity}</span>
              </div>
              {item.isSet && item.setDetails && (
                <div className="ml-3 mt-1 space-y-0.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Pizza className="w-3 h-3" />
                    <span>{item.setDetails.pizzaFlavor}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Cake className="w-3 h-3" />
                    <span>{item.setDetails.dessert}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Coffee className="w-3 h-3" />
                    <span>{item.setDetails.drink}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {showChef && order.chefName && (
          <div className="flex items-center gap-2 text-sm text-cooking">
            <ChefHat className="w-4 h-4" />
            <span>Cooking by: {order.chefName}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {order.createdAt.toLocaleTimeString()}
          </span>
        </div>

        {onAction && (
          <Button 
            className="w-full mt-2" 
            onClick={onAction}
            disabled={actionDisabled}
            variant={order.status === 'cooking' ? 'default' : 'secondary'}
          >
            {actionLabel}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export function ChefPage() {
  const { orders, updateOrderStatus } = useStore()
  const [chefName, setChefName] = useState('')
  const [isNameSet, setIsNameSet] = useState(false)
  
  // ✅ ต้องอยู่ตรงนี้
  useEffect(() => {
    const savedName = localStorage.getItem("chefName")
    if (savedName) {
      setChefName(savedName)
      setIsNameSet(true)
    }
  }, [])

  const pendingOrders = orders.filter(o => o.status === 'pending')
  const cookingOrders = orders.filter(o => o.status === 'cooking')
  const readyOrders = orders.filter(o => o.status === 'ready')

  const handleAcceptOrder = (orderId: string) => {
    if (!chefName.trim()) return
    updateOrderStatus(orderId, 'cooking', chefName)
  }

  const handleMarkReady = (orderId: string) => {
    updateOrderStatus(orderId, 'ready', chefName)
  }

  if (!isNameSet) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <ChefHat className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="font-serif text-2xl">Kitchen Station</CardTitle>
            <p className="text-muted-foreground">Enter your name to start accepting orders</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Enter your name"
              value={chefName}
              onChange={(e) => setChefName(e.target.value)}
              className="bg-input text-center text-lg"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && chefName.trim()) {
                  setIsNameSet(true)
                }
              }}
            />
            <Button 
              className="w-full" 
              size="lg"
              disabled={!chefName.trim()}
              onClick={() => {
              localStorage.setItem("chefName", chefName)
              setIsNameSet(true)
            }}
            >
              Start Cooking
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl text-foreground">Kitchen Display</h2>
          <p className="text-muted-foreground">
            Welcome, Chef <span className="text-primary font-medium">{chefName}</span>
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            localStorage.removeItem("chefName")
            setIsNameSet(false)
            setChefName("")
          }}
        >
          Change Chef
        </Button>
      </div>

      {/* Kanban Columns */}
      <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">
        {/* Pending Column */}
        <div className="flex flex-col bg-card/50 rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border bg-pending/10">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Pending</h3>
              <Badge variant="secondary" className="bg-pending/20 text-pending">
                {pendingOrders.length}
              </Badge>
            </div>
          </div>
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-3">
              {pendingOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onAction={() => handleAcceptOrder(order.id)}
                  actionLabel="Accept Order"
                />
              ))}
              {pendingOrders.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No pending orders
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Cooking Column */}
        <div className="flex flex-col bg-card/50 rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border bg-cooking/10">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Cooking</h3>
              <Badge variant="secondary" className="bg-cooking/20 text-cooking">
                {cookingOrders.length}
              </Badge>
            </div>
          </div>
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-3">
              {cookingOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onAction={() => handleMarkReady(order.id)}
                  actionLabel="Mark as Ready"
                  showChef
                />
              ))}
              {cookingOrders.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No orders being cooked
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Ready Column */}
        <div className="flex flex-col bg-card/50 rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border bg-ready/10">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Ready</h3>
              <Badge variant="secondary" className="bg-ready/20 text-ready">
                {readyOrders.length}
              </Badge>
            </div>
          </div>
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-3">
              {readyOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  showChef
                />
              ))}
              {readyOrders.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No orders ready
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
