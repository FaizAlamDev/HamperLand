export type CreateProductInput = {
  name: string
  price: number
  description: string
  countInStock: number
  contentType: string
}

export type Product = {
  productId: string
  name: string
  image: string
  price: number
  description: string
  countInStock: number
}

export type CartItem = Product & { qty: number }

export type CartState = {
  items: CartItem[]
  addItem: (product: Product, qty?: number) => void
  removeItem: (id: string) => void
  updateQty: (id: string, qty: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

export type OrderStatus =
  | 'PLACED'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'

export type PaymentStatus = 'PENDING' | 'PAID'

export type PaymentMethod = 'COD' | 'UPI'

export type ShippingAddress = {
  name: string
  phone: string
  address: string
  city: string
  state: IndianState
  pincode: string
}

export type OrderTotals = {
  totalItems: number
  totalPrice: number
  total?: number
}

export type OrderItem = {
  productId: string
  name: string
  image: string
  price: number
  qty: number
}

export type Order = {
  orderId: string
  userId: string
  items: OrderItem[]
  shippingAddress: ShippingAddress

  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus

  orderStatus: OrderStatus

  totals: OrderTotals

  createdAt: string
  updatedAt: string
}

export type CreateOrderInput = {
  items: OrderItem[]
  shippingAddress: ShippingAddress
  paymentMethod: PaymentMethod
}

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Puducherry',
] as const

export type IndianState = (typeof INDIAN_STATES)[number]

export type FormError = {
  id: number
  message: string
}
