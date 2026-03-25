"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MoreHorizontal, Eye, XCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"

export interface Booking {
  id: string
  equipmentName: string
  equipmentImage: string
  customerName: string
  date: Date
  startTime: string
  duration: number
  status: "confirmed" | "pending" | "completed" | "cancelled"
  totalPrice: number
}

interface BookingsTableProps {
  bookings: Booking[]
  onViewBooking?: (booking: Booking) => void
  onCancelBooking?: (booking: Booking) => void
}

const statusStyles = {
  confirmed: "bg-primary/10 text-primary border-primary/20",
  pending: "bg-accent/10 text-accent-foreground border-accent/20",
  completed: "bg-muted text-muted-foreground border-muted",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
}

export function BookingsTable({ bookings, onViewBooking, onCancelBooking }: BookingsTableProps) {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Recent Bookings</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[280px]">Equipment</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No bookings yet
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={booking.equipmentImage}
                          alt={booking.equipmentName}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <span className="font-medium text-foreground">{booking.equipmentName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">{booking.customerName}</TableCell>
                    <TableCell>
                      <div className="text-foreground">{format(booking.date, "MMM d, yyyy")}</div>
                      <div className="text-sm text-muted-foreground">{booking.startTime}</div>
                    </TableCell>
                    <TableCell className="text-foreground">
                      {booking.duration >= 8 
                        ? `${Math.ceil(booking.duration / 8)} day${Math.ceil(booking.duration / 8) > 1 ? 's' : ''}`
                        : `${booking.duration} hr${booking.duration > 1 ? 's' : ''}`
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusStyles[booking.status]}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-foreground">
                      ${booking.totalPrice}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewBooking?.(booking)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {booking.status === "pending" || booking.status === "confirmed" ? (
                            <DropdownMenuItem 
                              onClick={() => onCancelBooking?.(booking)}
                              className="text-destructive focus:text-destructive"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Cancel Booking
                            </DropdownMenuItem>
                          ) : null}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
