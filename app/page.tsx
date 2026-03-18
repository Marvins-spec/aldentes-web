"use client"

import { useState } from "react"
import { StoreProvider } from "@/lib/store"
import { POSSidebar } from "@/components/pos-sidebar"
import { OrderTaker } from "@/components/order-taker"
import { ChefPage } from "@/components/chef-page"
import { WaiterPage } from "@/components/waiter-page"
import { StockPage } from "@/components/stock-page"

type PageId = 'orders' | 'chef' | 'waiter' | 'stock'

function POSApp() {
  const [activePage, setActivePage] = useState<PageId>('orders')

  return (
    <div className="min-h-screen bg-background">
      <POSSidebar activePage={activePage} onPageChange={(page) => setActivePage(page as PageId)} />
      
      <main className="ml-20 lg:ml-64 min-h-screen p-4 lg:p-6">
        <div className="h-[calc(100vh-2rem)] lg:h-[calc(100vh-3rem)]">
          {activePage === 'orders' && <OrderTaker />}
          {activePage === 'chef' && <ChefPage />}
          {activePage === 'waiter' && <WaiterPage />}
          {activePage === 'stock' && <StockPage />}
        </div>
      </main>
    </div>
  )
}

export default function Page() {
  return (
    <StoreProvider>
      <POSApp />
    </StoreProvider>
  )
}
