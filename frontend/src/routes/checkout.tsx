import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import useCartStore from '@/store/useCartStore'
import { type FormError } from '@/types'
import OrderSummary from '@/components/OrderSummary'
import CheckoutForm from '@/components/CheckoutForm'
import ErrorList from '@/components/ErrorList'
import { useCreateOrder } from '@/hooks/useOrders'

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

  const { mutateAsync: placeOrderMutation, isPending } = useCreateOrder()

  const placeOrder = async () => {
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

    const orderPayload = {
      items: items.map((i) => ({
        productId: i.productId,
        name: i.name,
        qty: i.qty,
        price: i.price,
        image: i.image,
      })),
      shippingAddress: {
        name: trimmedName,
        phone: trimmedPhone,
        address: trimmedAddress,
        city: trimmedCity,
        state: trimmedState,
        pincode: trimmedPincode,
      },
      paymentMethod,
      totals: { totalItems, totalPrice },
    }

    const data = await placeOrderMutation(orderPayload)

    clearCart()
    navigate({
      to: '/order-success/$orderId',
      params: { orderId: data.order.orderId },
    })
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
          placing={isPending}
        />
      </div>
    </div>
  )
}

export default CheckoutRoute
