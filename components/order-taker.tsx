"use client"

import { useState } from "react"
import { useStore, type MenuItem, type OrderItem, type SetMenuDetails } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { 
  Plus, 
  Minus, 
  Trash2, 
  Send,
  Utensils,
  Pizza,
  Coffee,
  Cake,
  Package,
  Check
} from "lucide-react"

const categories = [
  { id: 'pasta', label: 'Pasta', icon: Utensils },
  { id: 'pizza', label: 'Pizza', icon: Pizza },
  { id: 'drinks', label: 'Drinks', icon: Coffee },
  { id: 'desserts', label: 'Desserts', icon: Cake },
  { id: 'setmenu', label: 'Set Menu', icon: Package },
] as const

type CategoryId = typeof categories[number]['id']

export function OrderTaker() {
  const { menuItems, addOrder } = useStore()
  const [activeCategory, setActiveCategory] = useState<CategoryId>('pasta')
  const [cart, setCart] = useState<OrderItem[]>([])
  const [tableNumber, setTableNumber] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Pizza size selection modal state
  const [pizzaSizeModal, setPizzaSizeModal] = useState<{
    open: boolean
    item: MenuItem | null
  }>({ open: false, item: null })

  // Set menu customization modal state
  const [setMenuModal, setSetMenuModal] = useState<{
    open: boolean
    item: MenuItem | null
    step: 1 | 2 | 3
    selectedPizza: string | null
    selectedDessert: string | null
    selectedDrink: string | null
  }>({ open: false, item: null, step: 1, selectedPizza: null, selectedDessert: null, selectedDrink: null })

  const filteredItems = menuItems.filter(item => item.category === activeCategory)
  const pizzaItems = menuItems.filter(item => item.category === 'pizza')
  const dessertItems = menuItems.filter(item => item.category === 'desserts')
  const drinkItems = menuItems.filter(item => item.category === 'drinks')
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleItemClick = (item: MenuItem) => {
    if (item.category === 'pizza') {
      // Open pizza size selection modal
      setPizzaSizeModal({ open: true, item })
    } else if (item.category === 'setmenu') {
      // Open set menu customization modal
      setSetMenuModal({
        open: true,
        item,
        step: 1,
        selectedPizza: null,
        selectedDessert: null,
        selectedDrink: null
      })
    } else {
      // Add regular item directly
      addRegularItemToCart(item)
    }
  }

  const addRegularItemToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.menuItemId === item.id && !i.isSet && !i.size)
      if (existing) {
        return prev.map(i => 
          i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, {
        id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        menuItemId: item.id,
        name: item.name,
        category: item.category,
        quantity: 1,
        price: item.price,
        isSet: false
      }]
    })
  }

  const addPizzaToCart = (size: 'medium' | 'large') => {
    if (!pizzaSizeModal.item) return
    const item = pizzaSizeModal.item
    const price = size === 'large' && item.largePrice ? item.largePrice : item.price
    
    setCart(prev => {
      // Check for existing pizza with same size
      const existing = prev.find(i => 
        i.menuItemId === item.id && i.size === size && !i.isSet
      )
      if (existing) {
        return prev.map(i => 
          i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, {
        id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        menuItemId: item.id,
        name: item.name,
        category: item.category,
        quantity: 1,
        price,
        size,
        isSet: false
      }]
    })
    setPizzaSizeModal({ open: false, item: null })
  }

  const addSetMenuToCart = () => {
    if (!setMenuModal.item || !setMenuModal.selectedPizza || !setMenuModal.selectedDessert || !setMenuModal.selectedDrink) return
    
    const setDetails: SetMenuDetails = {
      setName: setMenuModal.item.name,
      pizzaFlavor: setMenuModal.selectedPizza,
      dessert: setMenuModal.selectedDessert,
      drink: setMenuModal.selectedDrink,
      extra: "Wings & Fries"
    }

    setCart(prev => [...prev, {
      id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      menuItemId: setMenuModal.item!.id,
      name: setMenuModal.item!.name,
      category: 'setmenu',
      quantity: 1,
      price: setMenuModal.item!.price,
      isSet: true,
      setDetails
    }])

    setSetMenuModal({
      open: false,
      item: null,
      step: 1,
      selectedPizza: null,
      selectedDessert: null,
      selectedDrink: null
    })
  }

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta
            return newQty > 0 ? { ...item, quantity: newQty } : null
          }
          return item
        })
        .filter((item): item is OrderItem => item !== null)
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId))
  }

  const handleSubmit = async () => {
    if (cart.length === 0 || (!tableNumber && !customerName)) return
    
    setIsSubmitting(true)
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    addOrder({
      items: cart,
      tableNumber,
      customerName,
      total,
    })
    
    setCart([])
    setTableNumber('')
    setCustomerName('')
    setIsSubmitting(false)
  }

  const getCartItemDisplay = (item: OrderItem) => {
    if (item.isSet && item.setDetails) {
      return (
        <div>
          <h4 className="font-medium text-sm text-foreground">{item.name}</h4>
          <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
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
            {item.setDetails.extra && (
              <div className="flex items-center gap-1">
                <span>🍗</span>
                <span>{item.setDetails.extra}</span>
              </div>
            )}
          </div>
        </div>
      )
    }
    
    if (item.size) {
      return (
        <div>
          <h4 className="font-medium text-sm text-foreground truncate">
            {item.name} <span className="text-muted-foreground">({item.size === 'large' ? 'L' : 'M'})</span>
          </h4>
        </div>
      )
    }
    
    return <h4 className="font-medium text-sm text-foreground truncate">{item.name}</h4>
  }

  // Count items in cart for badge display
  const getCartCountForMenuItem = (menuItemId: string) => {
    return cart
      .filter(i => i.menuItemId === menuItemId)
      .reduce((sum, i) => sum + i.quantity, 0)
  }

  return (
    <div className="h-full flex gap-4">
      {/* Left - Categories */}
      <div className="w-20 lg:w-24 shrink-0 flex flex-col gap-2">
        {categories.map((cat) => {
          const Icon = cat.icon
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex flex-col items-center gap-2 p-3 lg:p-4 rounded-xl transition-all duration-200",
                "border border-border hover:border-primary/50",
                activeCategory === cat.id 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "bg-card text-card-foreground"
              )}
            >
              <Icon className="w-5 h-5 lg:w-6 lg:h-6" />
              <span className="text-xs lg:text-sm font-medium">{cat.label}</span>
            </button>
          )
        })}
      </div>

      {/* Center - Menu Items */}
      <div className="flex-1 min-w-0">
        <div className="mb-4">
          <h2 className="font-serif text-2xl text-foreground">
            {categories.find(c => c.id === activeCategory)?.label}
          </h2>
          <p className="text-sm text-muted-foreground">Select items to add to order</p>
        </div>
        
        <ScrollArea className="h-[calc(100%-4rem)]">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredItems.map((item) => {
              const cartCount = getCartCountForMenuItem(item.id)
              return (
                <Card
                  key={item.id}
                  className={cn(
                    "group cursor-pointer overflow-hidden transition-all duration-200",
                    "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5",
                    cartCount > 0 && "ring-2 ring-primary"
                  )}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover scale-90"
                      onError={(e) => {
                        e.currentTarget.src = "/menu/placeholder.jpg"
                      }}
                    />
                  
                    <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent z-10" />
                  
                    {cartCount > 0 && (
                      <Badge className="absolute top-2 right-2 z-20 bg-primary text-primary-foreground">
                        {cartCount}x
                      </Badge>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm text-card-foreground truncate">{item.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-primary font-semibold">${item.price.toFixed(2)}</p>
                      {item.largePrice && (
                        <p className="text-muted-foreground text-xs">/ ${item.largePrice.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Right - Cart */}
      <div className="w-72 lg:w-80 shrink-0 bg-card border border-border rounded-xl flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="font-serif text-xl text-card-foreground">Current Order</h2>
          <p className="text-sm text-muted-foreground">{cart.length} item(s)</p>
        </div>

        <ScrollArea className="flex-1 p-4">
          {cart.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
              No items added yet
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div 
                  key={item.id}
                  className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    {getCartItemDisplay(item)}
                    <p className="text-primary text-sm mt-1">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation()
                        updateQuantity(item.id, -1)
                      }}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation()
                        updateQuantity(item.id, 1)
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFromCart(item.id)
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t border-border space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total</span>
            <span className="text-2xl font-serif text-foreground">${total.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Table #"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="bg-input"
            />
            <Input
              placeholder="Customer"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="bg-input"
            />
          </div>

          <Button
            className="w-full"
            size="lg"
            disabled={cart.length === 0 || (!tableNumber && !customerName) || isSubmitting}
            onClick={handleSubmit}
          >
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Sending...' : 'Send to Kitchen'}
          </Button>
        </div>
      </div>

      {/* Pizza Size Selection Modal */}
      <Dialog open={pizzaSizeModal.open} onOpenChange={(open) => setPizzaSizeModal({ open, item: open ? pizzaSizeModal.item : null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Select Size</DialogTitle>
            <DialogDescription>
              {pizzaSizeModal.item?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <button
              onClick={() => addPizzaToCart('medium')}
              className={cn(
                "flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border",
                "hover:border-primary hover:bg-primary/5 transition-all duration-200"
              )}
            >
              <Pizza className="w-10 h-10 text-primary" />
              <div className="text-center">
                <p className="font-medium">Medium</p>
                <p className="text-primary font-semibold text-lg">
                  ${pizzaSizeModal.item?.price.toFixed(2)}
                </p>
              </div>
            </button>
            <button
              onClick={() => addPizzaToCart('large')}
              className={cn(
                "flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border",
                "hover:border-primary hover:bg-primary/5 transition-all duration-200"
              )}
            >
              <Pizza className="w-14 h-14 text-primary" />
              <div className="text-center">
                <p className="font-medium">Large</p>
                <p className="text-primary font-semibold text-lg">
                  ${pizzaSizeModal.item?.largePrice?.toFixed(2) || pizzaSizeModal.item?.price.toFixed(2)}
                </p>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Set Menu Customization Modal */}
      <Dialog 
        open={setMenuModal.open} 
        onOpenChange={(open) => {
          if (!open) {
            setSetMenuModal({ open: false, item: null, step: 1, selectedPizza: null, selectedDessert: null, selectedDrink: null })
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">{setMenuModal.item?.name}</DialogTitle>
            <DialogDescription>
              {setMenuModal.step === 1 && "Step 1: Choose your pizza"}
              {setMenuModal.step === 2 && "Step 2: Choose your dessert"}
              {setMenuModal.step === 3 && "Step 3: Choose your drink"}
              {setMenuModal.step === 4 && "Step 4: Confirm your selection"}
            </DialogDescription>
          </DialogHeader>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 py-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                  setMenuModal.step === step 
                    ? "bg-primary text-primary-foreground" 
                    : setMenuModal.step > step
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {setMenuModal.step > step ? <Check className="w-4 h-4" /> : step}
              </div>
            ))}
          </div>

          <div className="py-4">
            {/* Step 1: Choose Pizza */}
            {setMenuModal.step === 1 && (
              <div className="grid grid-cols-2 gap-3">
                {pizzaItems.map((pizza) => (
                  <button
                    key={pizza.id}
                    onClick={() => setSetMenuModal(prev => ({ ...prev, selectedPizza: pizza.name, step: 2 }))}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                      setMenuModal.selectedPizza === pizza.name
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <Pizza className="w-8 h-8 text-primary" />
                    <span className="text-sm font-medium text-center">{pizza.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Choose Dessert */}
            {setMenuModal.step === 2 && (
              <div className="grid grid-cols-2 gap-3">
                {dessertItems.map((dessert) => (
                  <button
                    key={dessert.id}
                    onClick={() => setSetMenuModal(prev => ({ ...prev, selectedDessert: dessert.name, step: 3 }))}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                      setMenuModal.selectedDessert === dessert.name
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <Cake className="w-8 h-8 text-primary" />
                    <span className="text-sm font-medium text-center">{dessert.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Step 3: Choose Drink */}
            {setMenuModal.step === 3 && (
              <div className="grid grid-cols-2 gap-3">
                {drinkItems.map((drink) => (
                  <button
                    key={drink.id}
                    onClick={() =>
                      setSetMenuModal(prev => ({
                        ...prev,
                        selectedDrink: drink.name,
                        step: 4 // ไป confirm
                      }))
                    }
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                      setMenuModal.selectedDrink === drink.name
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <Coffee className="w-8 h-8 text-primary" />
                    <span className="text-sm font-medium">{drink.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Step 4: Confirm */}
            {setMenuModal.step === 4 && (
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                  <h4 className="font-medium text-foreground">{setMenuModal.item?.name}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Pizza className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">Pizza:</span>
                      <span className="font-medium">{setMenuModal.selectedPizza}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Cake className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">Dessert:</span>
                      <span className="font-medium">{setMenuModal.selectedDessert}</span>
                    </div>
                    <div className="flex items-center gap-2">
                    <Coffee className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">Drink:</span>
                    <span className="font-medium">{setMenuModal.selectedDrink}</span>
                  </div>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <p className="text-primary font-semibold text-lg">${setMenuModal.item?.price.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSetMenuModal(prev => ({ ...prev, step: 1, selectedPizza: null, selectedDessert: null }))}
                  >
                    Start Over
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={addSetMenuToCart}
                  >
                    Add to Order
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Back button for step 2 */}
          {setMenuModal.step === 2 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSetMenuModal(prev => ({ ...prev, step: 1 }))}
              className="w-fit"
            >
              Back to pizza selection
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
