"use client"

import { cn } from "@/lib/utils"
import { useStore } from "@/lib/store"
import { 
  ShoppingCart, 
  ChefHat, 
  UtensilsCrossed, 
  Package,
  Bell,
  X
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"

interface POSSidebarProps {
  activePage: string
  onPageChange: (page: string) => void
}

const navItems = [
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'chef', label: 'Kitchen', icon: ChefHat },
  { id: 'waiter', label: 'Serving', icon: UtensilsCrossed },
  { id: 'stock', label: 'Stock', icon: Package },
]

export function POSSidebar({ activePage, onPageChange }: POSSidebarProps) {
  const { orders, notifications, clearNotification } = useStore()
  const [showNotifications, setShowNotifications] = useState(false)
  
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const readyOrders = orders.filter(o => o.status === 'ready').length

  return (
    <aside className="fixed left-0 top-0 h-screen w-20 lg:w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-50">
      {/* Logo */}
      <div className="p-4 lg:p-6 border-b border-sidebar-border">
        <h1 className="hidden lg:block font-serif text-2xl text-sidebar-foreground tracking-tight">
          {"Al Dente's"}
        </h1>
        <span className="lg:hidden font-serif text-xl text-sidebar-foreground block text-center">AD</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 lg:p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const badge = item.id === 'chef' ? pendingOrders : item.id === 'waiter' ? readyOrders : 0
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onPageChange(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 lg:px-4 py-3 rounded-lg transition-all duration-200",
                    "hover:bg-sidebar-accent group relative",
                    activePage === item.id 
                      ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                      : "text-sidebar-foreground"
                  )}
                >
                  <Icon className="w-5 h-5 mx-auto lg:mx-0" />
                  <span className="hidden lg:inline">{item.label}</span>
                  {badge > 0 && (
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "ml-auto hidden lg:flex",
                        activePage === item.id 
                          ? "bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground" 
                          : "bg-primary text-primary-foreground"
                      )}
                    >
                      {badge}
                    </Badge>
                  )}
                  {badge > 0 && (
                    <span className="lg:hidden absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                      {badge}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Notifications */}
      <div className="p-2 lg:p-4 border-t border-sidebar-border">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className={cn(
            "w-full flex items-center gap-3 px-3 lg:px-4 py-3 rounded-lg transition-all duration-200",
            "hover:bg-sidebar-accent relative",
            "text-sidebar-foreground"
          )}
        >
          <Bell className="w-5 h-5 mx-auto lg:mx-0" />
          <span className="hidden lg:inline">Notifications</span>
          {notifications.length > 0 && (
            <Badge variant="destructive" className="ml-auto hidden lg:flex">
              {notifications.length}
            </Badge>
          )}
          {notifications.length > 0 && (
            <span className="lg:hidden absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
              {notifications.length}
            </span>
          )}
        </button>

        {/* Notifications Panel */}
        {showNotifications && notifications.length > 0 && (
          <div className="absolute bottom-20 left-2 lg:left-4 right-2 lg:right-auto lg:w-60 bg-popover border border-border rounded-lg shadow-xl overflow-hidden">
            <div className="p-3 border-b border-border flex items-center justify-between">
              <span className="text-sm font-medium text-popover-foreground">Notifications</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={() => setShowNotifications(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="max-h-64">
              {notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className="p-3 border-b border-border/50 last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-popover-foreground">{notif.message}</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-5 w-5 p-0 shrink-0"
                      onClick={() => clearNotification(notif.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {notif.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </ScrollArea>
          </div>
        )}
      </div>
    </aside>
  )
}
