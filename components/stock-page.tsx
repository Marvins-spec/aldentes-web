"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  Search, 
  Package,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  ExternalLink
} from "lucide-react"

type StockStatus = 'ok' | 'low' | 'out'

function getStockStatus(current: number, min: number): StockStatus {
  if (current === 0) return 'out'
  if (current < min) return 'low'
  return 'ok'
}

export function StockPage() {
  const { stockItems, fetchStock } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [showLowStockOnly, setShowLowStockOnly] = useState(false)

  const filteredItems = stockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const status = getStockStatus(item.currentStock, item.minStock)
    const matchesFilter = !showLowStockOnly || status === 'low' || status === 'out'
    return matchesSearch && matchesFilter
  })

  const statusCounts = {
    ok: stockItems.filter(i => getStockStatus(i.currentStock, i.minStock) === 'ok').length,
    low: stockItems.filter(i => getStockStatus(i.currentStock, i.minStock) === 'low').length,
    out: stockItems.filter(i => getStockStatus(i.currentStock, i.minStock) === 'out').length,
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-serif text-2xl text-foreground">Inventory Management</h2>
        <p className="text-muted-foreground">Track ingredients and stock levels</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-ready/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-ready" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{statusCounts.ok}</p>
              <p className="text-sm text-muted-foreground">In Stock</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cooking/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-cooking" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{statusCounts.low}</p>
              <p className="text-sm text-muted-foreground">Low Stock</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{statusCounts.out}</p>
              <p className="text-sm text-muted-foreground">Out of Stock</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-input"
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="low-stock-filter"
            checked={showLowStockOnly}
            onCheckedChange={setShowLowStockOnly}
          />
          <Label htmlFor="low-stock-filter" className="text-sm text-muted-foreground cursor-pointer">
            Show low stock only
          </Label>
        </div>
        <Button
          onClick={async () => {
            await fetch('/api/sync-stock')
            fetchStock()
          }}
        >
          Sync Stock
        </Button>
      </div>

      {/* Table */}
      <div className="flex-1 bg-card border border-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 p-4 bg-muted/30 border-b border-border text-sm font-medium text-muted-foreground">
          <div>Ingredient</div>
          <div className="w-32 text-right">Current Stock</div>
          <div className="w-32 text-right">Min. Required</div>
          <div className="w-28 text-center">Status</div>
        </div>
        
        <div className="overflow-auto max-h-[calc(100%-3rem)]">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No items found</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const status = getStockStatus(item.currentStock, item.minStock)
              
              return (
                <div 
                  key={item.id}
                  className={cn(
                    "grid grid-cols-[1fr_auto_auto_auto] gap-4 p-4 border-b border-border/50 last:border-0",
                    "hover:bg-muted/20 transition-colors",
                    status === 'out' && "bg-destructive/5",
                    status === 'low' && "bg-cooking/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      status === 'ok' && "bg-ready",
                      status === 'low' && "bg-cooking",
                      status === 'out' && "bg-destructive"
                    )} />
                    <span className="text-card-foreground font-medium">{item.name}</span>
                  </div>
                  <div className={cn(
                    "w-32 text-right font-mono",
                    status === 'ok' && "text-card-foreground",
                    status === 'low' && "text-cooking",
                    status === 'out' && "text-destructive"
                  )}>
                    {item.currentStock} {item.unit}
                  </div>
                  <div className="w-32 text-right text-muted-foreground font-mono">
                    {item.minStock} {item.unit}
                  </div>
                  <div className="w-28 flex justify-center">
                    <Badge 
                      variant="secondary"
                      className={cn(
                        status === 'ok' && "bg-ready/20 text-ready border-ready/30",
                        status === 'low' && "bg-cooking/20 text-cooking border-cooking/30",
                        status === 'out' && "bg-destructive/20 text-destructive border-destructive/30"
                      )}
                    >
                      {status === 'ok' && 'OK'}
                      {status === 'low' && 'Low'}
                      {status === 'out' && 'Out'}
                    </Badge>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Package className="w-4 h-4" />
        <span>Stock เชื่อมกับ Google Sheets</span>
      </div>
    </div>
  )
}
