import type { PaymentStatus } from '@/types'

const styles: Record<PaymentStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  PAID: 'bg-green-100 text-green-700',
}

export default function PaymentStatusBadge({
  status,
}: {
  status: PaymentStatus
}) {
  return (
    <span
      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  )
}
