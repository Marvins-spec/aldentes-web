"use client"

import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  UtensilsCrossed, 
  Clock,
  ChefHat,
  User,
  CheckCircle2,
  Pizza,
  Cake
} from "lucide-react"

export function WaiterPage() {
  const { orders, updateOrderStatus } = useStore()
  
  const readyOrders = orders.filter(o => o.status === 'ready')
  const recentlyCompleted = orders
    .filter(o => o.status === 'completed')
    .slice(-5)
    .reverse()

  const handleServe = (orderId: string) => {
    updateOrderStatus(orderId, 'completed')
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-serif text-2xl text-foreground">Serving Station</h2>
        <p className="text-muted-foreground">
          {readyOrders.length} order{readyOrders.length !== 1 ? 's' : ''} ready for delivery
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Ready Orders - Main Area */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-ready animate-pulse" />
            <h3 className="font-semibold text-foreground">Ready for Pickup</h3>
          </div>
          
          {readyOrders.length === 0 ? (
            <div className="flex-1 flex items-center justify-center bg-card/50 rounded-xl border border-border">
              <div className="text-center">
                <UtensilsCrossed className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No orders ready for serving</p>
                <p className="text-sm text-muted-foreground/70">Orders will appear here when the kitchen marks them ready</p>
              </div>
            </div>
          ) : (
            <ScrollArea className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
                {readyOrders.map((order) => (
                  <Card 
                    key={order.id}
                    className="border-ready/30 bg-card hover:shadow-lg hover:shadow-ready/10 transition-all duration-300"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-medium text-card-foreground">
                          {order.id}
                        </CardTitle>
                        <Badge className="bg-ready/20 text-ready border-ready/30">
                          Ready
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        {order.tableNumber && (
                          <span className="px-2 py-1 bg-primary/10 text-primary rounded-md font-medium">
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
                    <CardContent className="space-y-4">
                      <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-card-foreground">
                                {item.name}
                                {item.size && <span className="text-muted-foreground ml-1">({item.size === 'large' ? 'L' : 'M'})</span>}
                              </span>
                              <span className="text-muted-foreground font-medium">x{item.quantity}</span>
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
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <ChefHat className="w-4 h-4" />
                          {order.chefName || 'Unknown Chef'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {order.createdAt.toLocaleTimeString()}
                        </span>
                      </div>

                      <Button 
                        className="w-full bg-ready hover:bg-ready/90 text-white" 
                        size="lg"
                        onClick={() => handleServe(order.id)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Serve Order
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Recently Completed */}
        <div className="flex flex-col bg-card/50 rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Recently Completed</h3>
            <p className="text-sm text-muted-foreground">Last 5 served orders</p>
          </div>
          <ScrollArea className="flex-1 p-4">
            {recentlyCompleted.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No completed orders yet
              </div>
            ) : (
              <div className="space-y-3">
                {recentlyCompleted.map((order) => (
                  <div 
                    key={order.id}
                    className="p-3 bg-muted/30 rounded-lg opacity-75"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm text-card-foreground">{order.id}</span>
                      <Badge variant="outline" className="text-xs">Completed</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {order.tableNumber && `Table ${order.tableNumber}`}
                      {order.tableNumber && order.customerName && ' • '}
                      {order.customerName}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''} • ${order.total.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
