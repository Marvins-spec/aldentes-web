"use client"

import { createContext, useContext, useState, useCallback, type ReactNode, useEffect } from 'react'
import { supabase } from "@/lib/supabase"

export interface MenuItem {
  id: string
  name: string
  price: number
  largePrice?: number
  category: 'pasta' | 'pizza' | 'drinks' | 'desserts' | 'setmenu'
  image: string
}

export interface SetMenuDetails {
  setName: string
  pizzaFlavor: string
  dessert: string
}

export interface OrderItem {
  id: string
  menuItemId: string
  name: string
  category: MenuItem['category']
  quantity: number
  price: number
  size?: 'medium' | 'large' | null
  isSet: boolean
  setDetails?: SetMenuDetails
}

export interface Order {
  id: string
  items: OrderItem[]
  tableNumber: string
  customerName: string
  total: number
  status: 'pending' | 'cooking' | 'ready' | 'completed'
  chefName?: string
  createdAt: Date
}

export interface StockItem {
  id: string
  name: string
  currentStock: number
  minStock: number
  unit: string
}

export interface Notification {
  id: string
  message: string
  type: 'order' | 'ready' | 'stock'
  timestamp: Date
}

interface StoreContextType {
  orders: Order[]
  menuItems: MenuItem[]
  stockItems: StockItem[]
  notifications: Notification[]
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => void
  updateOrderStatus: (orderId: string, status: Order['status'], chefName?: string) => void
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  clearNotification: (id: string) => void
}

const menuItemsData: MenuItem[] = [
  { id: 'p1', name: 'Grilled Salmon Lemon Butter', price: 390, category: 'pasta', image: '/menu/salmon.png' },
  { id: 'p2', name: 'Rosemary Lamb Chops', price: 390, category: 'pasta', image: '/menu/lamb.png' },
  { id: 'p3', name: 'Seafood Black Ink Pasta', price: 390, category: 'pasta', image: '/menu/pasta-black.png' },
  //{ id: 'p4', name: 'Lasagna Bolognese', price: 19.99, category: 'pasta', image: '/menu/lasagna.jpg' }, //
  //{ id: 'p5', name: 'Ravioli Ricotta', price: 17.99, category: 'pasta', image: '/menu/ravioli.jpg' },//
 // { id: 'p6', name: 'Linguine Pesto', price: 15.99, category: 'pasta', image: '/menu/pesto.jpg' },//

  { id: 'z1', name: 'Pizza Margherita', price: 390, largePrice: 440, category: 'pizza', image: '/menu/margherita.png' },
  { id: 'z2', name: 'Pizza Prosciutto', price: 390, largePrice: 440, category: 'pizza', image: '/menu/prosciutto.png' },
  { id: 'z3', name: 'Pizza Cheese', price: 390, largePrice: 440, category: 'pizza', image: '/menu/cheese.png' },
  { id: 'z4', name: 'Pizza Veggie Delight', price: 390, largePrice: 440, category: 'pizza', image: '/menu/veggie.png' },

  { id: 'd1', name: 'Cola', price: 260, category: 'drinks', image: '/menu/cola.png' },
  { id: 'd2', name: 'Italian Soda', price: 260, category: 'drinks', image: '/menu/italian-soda.png' },
  { id: 'd3', name: 'Sparkling Water', price: 150, category: 'drinks', image: '/menu/water.png' },

  { id: 's1', name: 'Tiramisu', price: 350, category: 'desserts', image: '/menu/tiramisu.png' },
  { id: 's2', name: 'Panna Cotta', price: 350, category: 'desserts', image: '/menu/panna-cotta.png' },

  { id: 'm1', name: 'Pizza Combo', price: 890, category: 'setmenu', image: '/menu/combo1.png' },
  { id: 'm2', name: 'Grand Mix Box', price: 1190, category: 'setmenu', image: '/menu/combo2.png' },
]
const stockItemsData: StockItem[] = [/* ❌ ไม่ต้องแก้ */]

const StoreContext = createContext<StoreContextType | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])

  // 🔥 โหลดจาก Supabase
  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    const mapped: Order[] = (data || []).map((o: any) => ({
      id: o.id,
      items: o.items || [],
      tableNumber: o.table_name || "-",
      customerName: o.customer_name || "-",
      total: (o.items || []).reduce((sum: number, item: any) => {
        return sum + (item.price || 0) * (item.quantity || 1)
      }, 0),
      status: o.status,
      chefName: o.chef || "",
      createdAt: new Date(o.created_at)
    }))

    setOrders(mapped)
  }

  // 🔥 เพิ่ม order → ลง DB
  const addOrder = useCallback(async (orderData: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
    const { error } = await supabase
      .from('orders')
      .insert({
        table_name: orderData.tableNumber,
        customer_name: orderData.customerName,
        items: orderData.items,
        status: 'pending',
        chef: null
      })

    if (error) {
      console.error(error)
      return
    }

    fetchOrders()
  }, [])

  // 🔥 update status → DB
  const updateOrderStatus = useCallback(async (orderId: string, status: Order['status'], chefName?: string) => {
    console.log("UPDATE:", orderId, status, chefName)

    const { data, error } = await supabase
      .from('orders')
      .update({
        status,
        chef: chefName || null
      })
      .eq('id', orderId)
      .select()

    console.log("UPDATE RESULT:", data)
    console.log("UPDATE ERROR:", error)

    if (error) {
      console.error(error)
      return
    }

    fetchOrders()
  }, [])

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    setNotifications(prev => [...prev, {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date(),
    }])
  }, [])

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  return (
    <StoreContext.Provider value={{
      orders,
      menuItems: menuItemsData,
      stockItems: stockItemsData,
      notifications,
      addOrder,
      updateOrderStatus,
      addNotification,
      clearNotification,
    }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider')
  }
  return context
}
