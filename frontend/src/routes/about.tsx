import { createFileRoute } from '@tanstack/react-router'
import { Phone, Mail, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/about')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-bold sm:text-4xl">About HamperLand</h1>
        <p className="mt-3 text-muted-foreground max-w-3xl">
          We sell thoughtfully curated hampers and decorative items —
          affordable, stylish, and perfect for Indian homes and gifting. Our
          mission is simple: bring beautiful decor and value-priced hampers to
          everyone, everywhere in India.
        </p>
      </header>

      <section className="mb-12 grid gap-6 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold">Hampers & Gifts</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Curated gift hampers for every occasion — festivals, corporate
            gifting, birthdays — at pocket-friendly rates.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold">Decorative Items</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Thoughtful home decor — candles, wall art, planters, and accents —
            selected for quality and affordability.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold">Affordable Pricing</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            We aim to keep prices low without compromising style — great value
            for everyday purchases and gifting.
          </p>
        </div>
      </section>

      <section className="mb-12 grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <h4 className="font-semibold">Quality curation</h4>
          <p className="mt-2 text-sm text-muted-foreground">
            Each product is hand-picked to balance design, durability and price.
            We focus on items that make a home feel welcoming.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h4 className="font-semibold">Pan-India reach</h4>
          <p className="mt-2 text-sm text-muted-foreground">
            Fast shipping to most PIN codes across India. Local offers and
            festival deals during key seasons.
          </p>
        </div>
      </section>

      <section className="rounded-lg border bg-card p-6">
        <h2 className="text-2xl font-bold">Contact Us</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We’d love to hear from you — questions, bulk orders, or partnership
          requests. Below are the easiest ways to reach us in India.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="flex items-start gap-3 rounded-md border p-4">
            <div className="mt-1">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">Phone / WhatsApp</p>
              <p className="text-sm text-muted-foreground">+91 00000 00000</p>
              <div className="mt-3 flex gap-2">
                <Button asChild size="sm" variant="outline">
                  <a href="tel:+910000000000">Call</a>
                </Button>
                <Button asChild size="sm">
                  <a
                    href="https://wa.me/910000000000"
                    target="_blank"
                    rel="noreferrer"
                  >
                    WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-md border p-4">
            <div className="mt-1">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">Email</p>
              <p className="text-sm text-muted-foreground">
                hamperland@example.com
              </p>
              <div className="mt-3">
                <Button asChild size="sm">
                  <a href="mailto:hamperland@example.com">Email Us</a>
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-md border p-4">
            <div className="mt-1">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">Address</p>
              <p className="text-sm text-muted-foreground">
                Kanpur, Uttar Pradesh, India
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Business hours: Mon-Sat, 10:00-18:00 IST
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
