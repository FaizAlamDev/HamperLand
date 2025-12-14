import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import useCartStore from '@/store/useCartStore'
import { type FormError } from '@/types'
import OrderSummary from '@/components/OrderSummary'
import CheckoutForm from '@/components/CheckoutForm'
import ErrorList from '@/components/ErrorList'

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

  const dismissError = (id: number) => {
    setErrors((prev) => prev.filter((e) => e.id !== id))
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
          productId: i.productId,
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

      <ErrorList errors={errors} onDismiss={dismissError} />

      <div className="grid gap-6 lg:grid-cols-3">
        <CheckoutForm
          name={name}
          setName={setName}
          phone={phone}
          setPhone={setPhone}
          address={address}
          setAddress={setAddress}
          city={city}
          setCity={setCity}
          stateText={stateText}
          setStateText={setStateText}
          pincode={pincode}
          setPincode={setPincode}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
        />

        <OrderSummary
          items={items}
          totalItems={totalItems}
          totalPrice={totalPrice}
          placeOrder={placeOrder}
          placing={placing}
        />
      </div>
    </div>
  )
}

export default CheckoutRoute
