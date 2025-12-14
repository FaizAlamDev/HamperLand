import { INDIAN_STATES } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Textarea } from './ui/textarea'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'

interface CheckoutFormProps {
  name: string
  setName: (v: string) => void
  phone: string
  setPhone: (v: string) => void
  address: string
  setAddress: (v: string) => void
  city: string
  setCity: (v: string) => void
  stateText: string
  setStateText: (v: string) => void
  pincode: string
  setPincode: (v: string) => void
  paymentMethod: 'cod' | 'upi'
  setPaymentMethod: (v: 'cod' | 'upi') => void
}

export default function CheckoutForm({
  name,
  setName,
  phone,
  setPhone,
  address,
  setAddress,
  city,
  setCity,
  stateText,
  setStateText,
  pincode,
  setPincode,
  paymentMethod,
  setPaymentMethod,
}: CheckoutFormProps) {
  return (
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
              <Select value={stateText} onValueChange={(v) => setStateText(v)}>
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
  )
}
