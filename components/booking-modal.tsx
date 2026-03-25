"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Clock, MapPin, Loader2, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { Equipment } from "./equipment-card"

interface BookingModalProps {
  equipment: Equipment | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (booking: BookingData) => Promise<void>
}

export interface BookingData {
  equipmentId: string
  equipmentName: string
  date: Date
  startTime: string
  duration: number
  name: string
  phone: string
  location: string
  totalPrice: number
}

const timeSlots = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
]

const durationOptions = [
  { value: 1, label: "1 hour" },
  { value: 2, label: "2 hours" },
  { value: 4, label: "4 hours" },
  { value: 8, label: "Full day (8 hours)" },
  { value: 24, label: "24 hours" },
]

export function BookingModal({ equipment, open, onOpenChange, onSubmit }: BookingModalProps) {
  const [date, setDate] = useState<Date>()
  const [startTime, setStartTime] = useState<string>("")
  const [duration, setDuration] = useState<number>(1)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [pickupLocation, setPickupLocation] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  if (!equipment) return null

  const totalPrice = duration >= 8 
    ? Math.ceil(duration / 8) * equipment.pricePerDay 
    : duration * equipment.pricePerHour

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date || !startTime || !name || !phone) return

    setLoading(true)
    try {
      await onSubmit({
        equipmentId: equipment.id,
        equipmentName: equipment.name,
        date,
        startTime,
        duration,
        name,
        phone,
        location: pickupLocation || equipment.location,
        totalPrice,
      })
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onOpenChange(false)
        // Reset form
        setDate(undefined)
        setStartTime("")
        setDuration(1)
        setName("")
        setPhone("")
        setPickupLocation("")
      }, 2000)
    } catch {
      // Handle error
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Booking Confirmed!</h3>
            <p className="text-muted-foreground text-center">
              Your booking for {equipment.name} has been successfully placed.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Book Equipment</DialogTitle>
          <DialogDescription>
            Complete the form below to book {equipment.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Equipment Summary */}
          <div className="flex gap-4 p-4 bg-secondary/50 rounded-lg">
            <img
              src={equipment.image}
              alt={equipment.name}
              className="w-20 h-20 object-cover rounded-md"
            />
            <div className="flex-1">
              <h4 className="font-semibold text-foreground">{equipment.name}</h4>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="w-3.5 h-3.5" />
                {equipment.location}
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="font-bold text-primary">${equipment.pricePerHour}/hr</span>
                <span className="text-sm text-muted-foreground">${equipment.pricePerDay}/day</span>
              </div>
            </div>
          </div>

          {/* Date & Time Selection */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Select Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Start Time</Label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time">
                    {startTime && (
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {startTime}
                      </span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label>Duration</Label>
            <Select value={duration.toString()} onValueChange={(v) => setDuration(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {durationOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value.toString()}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Contact Information */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Pickup/Delivery Location (Optional)</Label>
            <Input
              id="location"
              placeholder="Your farm address"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
            />
          </div>

          {/* Price Summary */}
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-medium text-foreground">
                {durationOptions.find(d => d.value === duration)?.label}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
              <span className="font-semibold text-foreground">Total Price</span>
              <span className="text-2xl font-bold text-primary">${totalPrice}</span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!date || !startTime || !name || !phone || loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? "Processing..." : "Confirm Booking"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
