import type { FormError } from '@/types'

interface ErrorListProps {
  errors: FormError[]
  onDismiss: (id: number) => void
}

export default function ErrorList({ errors, onDismiss }: ErrorListProps) {
  if (errors.length === 0) return null

  return (
    <div className="mb-4 space-y-2">
      {errors.map((err) => (
        <div
          key={err.id}
          className="flex items-start justify-between rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm"
        >
          <p className="text-destructive">{err.message}</p>
          <button
            type="button"
            onClick={() => onDismiss(err.id)}
            className="ml-3 text-destructive/70 hover:text-destructive"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
