import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import useCartStore from '@/store/useCartStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { INDIAN_STATES, type FormError } from '@/types'

export const Route = createFileRoute('/checkout')({
  component: CheckoutRoute,
})

function CheckoutRoute() {
  const items = useCartStore((s) => s.items)
  const getTotalItems = useCartStore((s) => s.getTotalItems)
  const getTotalPrice = useCartStore((s) => s.getTotalPrice)
  const clearCart = useCartStore((s) => s.clearCart)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [stateText, setStateText] = useState('')
  const [pincode, setPincode] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi'>('cod')

  const [placing, setPlacing] = useState(false)
  const navigate = useNavigate()

  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()

  const [errors, setErrors] = useState<FormError[]>([])

  const addError = (message: string) => {
    const id = Date.now() + Math.random()
    setErrors((prev) => [...prev, { id, message }])

    setTimeout(() => {
      setErrors((prev) => prev.filter((e) => e.id !== id))
    }, 5000)
  }

  const placeOrder = () => {
    if (items.length === 0) return
    setErrors([])

    let hasError = false
    const trimmedName = name.trim()
    const trimmedPhone = phone.trim()
    const trimmedAddress = address.trim()
    const trimmedCity = city.trim()
    const trimmedState = stateText.trim()
    const trimmedPincode = pincode.trim()

    if (!trimmedName) {
      addError('Full name is required.')
      hasError = true
    }

    if (!trimmedPhone) {
      addError('Phone number is required.')
      hasError = true
    } else if (!/^[0-9]{10}$/.test(trimmedPhone)) {
      addError('Phone number must be exactly 10 digits.')
      hasError = true
    }

    if (!trimmedAddress) {
      addError('Address is required.')
      hasError = true
    }

    if (!trimmedCity) {
      addError('City name is required.')
      hasError = true
    }

    if (!trimmedState) {
      addError('State is required.')
      hasError = true
    }

    if (!trimmedPincode) {
      addError('Pincode is required.')
      hasError = true
    } else if (!/^[0-9]{6}$/.test(trimmedPincode)) {
      addError('Pincode must be exactly 6 digits.')
      hasError = true
    }

    if (hasError) return

    setPlacing(true)

    // Simulate network latency until no backend
    setTimeout(() => {
      const orderId = `HL-${Math.random().toString(36).slice(2, 9).toUpperCase()}`
      const order = {
        id: orderId,
        items: items.map((i) => ({
          _id: i._id,
          name: i.name,
          qty: i.qty,
          price: i.price,
          image: i.image,
        })),
        shippingAddress: {
          name,
          phone,
          address,
          city,
          state: stateText,
          pincode,
        },
        paymentMethod,
        totals: { totalItems, totalPrice },
        createdAt: new Date().toISOString(),
      }

      try {
        sessionStorage.setItem(
          `hamperland-order-${orderId}`,
          JSON.stringify(order),
        )
      } catch (e) {
        console.warn('Could not write order to sessionStorage', e)
      }

      clearCart()
      setPlacing(false)
      navigate({ to: '/order-success/$orderId', params: { orderId } })
    }, 900)
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">Checkout</h1>
      {errors.length > 0 && (
        <div className="mb-4 space-y-2">
          {errors.map((err) => (
            <div
              key={err.id}
              className="flex items-start justify-between rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm"
            >
              <p className="text-destructive">{err.message}</p>
              <button
                type="button"
                onClick={() =>
                  setErrors((prev) => prev.filter((e) => e.id !== err.id))
                }
                className="ml-3 text-destructive/70 hover:text-destructive"
                aria-label="Dismiss error"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Input
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                placeholder="Phone (10 digits)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Textarea
                placeholder="Address (house, street, landmark)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
                <div className="sm:col-span-1">
                  <Input
                    placeholder="Type City Name"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>

                <div>
                  <Select
                    value={stateText}
                    onValueChange={(v) => setStateText(v)}
                  >
                    <SelectTrigger className="w-full h-10 px-3 text-sm font-normal">
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDIAN_STATES.map((st) => (
                        <SelectItem key={st} value={st}>
                          {st}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Input
                    placeholder="Pincode (6 digits)"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <RadioGroup
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v as 'cod' | 'upi')}
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="cod" id="pm-cod" />
                  <label htmlFor="pm-cod">Cash on Delivery (COD)</label>
                </div>

                <div className="flex items-center gap-3">
                  <RadioGroupItem value="upi" id="pm-upi" />
                  <label htmlFor="pm-upi">UPI</label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Items ({totalItems})</span>
                </div>

                <div className="mt-4 space-y-2 max-h-64 overflow-auto">
                  {items.map((i) => (
                    <div
                      key={i._id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={i.image}
                          alt={i.name}
                          className="w-12 h-10 object-cover rounded"
                        />
                        <div>
                          <div className="text-sm font-medium">{i.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Qty: {i.qty}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-semibold">
                        ₹{(i.qty * i.price).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Subtotal</span>
                  <span className="font-semibold">
                    ₹{totalPrice.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Shipping</span>
                  <span>₹0.00</span>
                </div>

                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>

                <Button
                  className="w-full"
                  onClick={placeOrder}
                  disabled={items.length === 0 || placing}
                >
                  {placing ? 'Placing order...' : 'Place Order'}
                </Button>

                <Link to="/cart">
                  <Button variant="ghost" className="w-full">
                    Back to Cart
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CheckoutRoute
