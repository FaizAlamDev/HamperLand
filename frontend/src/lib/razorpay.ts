const RAZORPAY_CHECKOUT_URL = 'https://checkout.razorpay.com/v1/checkout.js'

export type RazorpayInstance = {
  open: () => void
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance
  }
}

let loadingPromise: Promise<void> | null = null

// Loads the Razorpay Checkout SDK once and resolves when window.Razorpay
// is available.
export const loadRazorpayCheckout = (): Promise<void> => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Razorpay requires a browser environment'))
  }
  if (window.Razorpay) return Promise.resolve()
  if (!loadingPromise) {
    loadingPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = RAZORPAY_CHECKOUT_URL
      script.onload = () => resolve()
      script.onerror = () => {
        // Allow retrying on next call if the load failed
        loadingPromise = null
        reject(new Error('Failed to load payment gateway'))
      }
      document.body.appendChild(script)
    })
  }
  return loadingPromise
}
