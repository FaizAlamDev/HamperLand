import type { OrderStatus } from '@/types'

const steps: OrderStatus[] = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED']

export default function OrderProgress({ status }: { status: OrderStatus }) {
  if (status === 'CANCELLED') {
    return (
      <div className="flex items-center justify-center rounded-lg border border-red-200 bg-red-50 py-3">
        <span className="font-medium text-red-700">Order Cancelled</span>
      </div>
    )
  }

  const currentIndex = steps.indexOf(status)

  return (
    <div className="flex items-center justify-between gap-2">
      {steps.map((step, index) => {
        const completed = index <= currentIndex

        return (
          <div key={step} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                  completed
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index + 1}
              </div>

              <span
                className={`mt-2 text-xs ${
                  completed ? 'font-medium text-gray-900' : 'text-gray-500'
                }`}
              >
                {step}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div
                className={`mx-2 h-1 flex-1 rounded ${
                  index < currentIndex ? 'bg-green-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
