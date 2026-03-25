"use client"

import { useState, useMemo } from "react"
import { Header } from "@/components/header"
import { EquipmentCard, type Equipment } from "@/components/equipment-card"
import { EquipmentFilter } from "@/components/equipment-filter"
import { BookingModal, type BookingData } from "@/components/booking-modal"
import { BookingsTable, type Booking } from "@/components/bookings-table"
import { StatCard } from "@/components/stats-cards"
import { 
  Calendar, 
  DollarSign, 
  Tractor, 
  Users, 
  Sprout,
  ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

// Sample equipment data
const equipmentData: Equipment[] = [
  {
    id: "1",
    name: "John Deere 6M Series Tractor",
    category: "tractor",
    pricePerHour: 75,
    pricePerDay: 450,
    rating: 4.9,
    reviews: 128,
    location: "Greenfield Farm, Iowa",
    available: true,
    image: "https://images.unsplash.com/photo-1605002255096-5e07de85e1c1?w=800&auto=format&fit=crop&q=60",
    features: ["140 HP", "4WD", "GPS Ready"],
  },
  {
    id: "2",
    name: "Case IH Combine Harvester",
    category: "harvester",
    pricePerHour: 150,
    pricePerDay: 900,
    rating: 4.8,
    reviews: 89,
    location: "Prairie Valley, Nebraska",
    available: true,
    image: "https://images.unsplash.com/photo-1598977123118-4e30ba3c4f5b?w=800&auto=format&fit=crop&q=60",
    features: ["Large Capacity", "Auto-Steer", "Yield Monitor"],
  },
  {
    id: "3",
    name: "Precision Seed Drill",
    category: "seeder",
    pricePerHour: 45,
    pricePerDay: 280,
    rating: 4.7,
    reviews: 56,
    location: "Harvest Hills, Kansas",
    available: true,
    image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&auto=format&fit=crop&q=60",
    features: ["24 Row", "Variable Rate", "GPS Mapping"],
  },
  {
    id: "4",
    name: "Self-Propelled Sprayer",
    category: "sprayer",
    pricePerHour: 85,
    pricePerDay: 520,
    rating: 4.6,
    reviews: 42,
    location: "Sunny Acres, California",
    available: false,
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&auto=format&fit=crop&q=60",
    features: ["1200 Gallon", "90ft Boom", "Auto Section"],
  },
  {
    id: "5",
    name: "Heavy-Duty Disc Harrow",
    category: "tillage",
    pricePerHour: 55,
    pricePerDay: 340,
    rating: 4.5,
    reviews: 34,
    location: "Rolling Fields, Missouri",
    available: true,
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=60",
    features: ["28ft Width", "Hydraulic", "Adjustable"],
  },
  {
    id: "6",
    name: "Kubota M7 Series Tractor",
    category: "tractor",
    pricePerHour: 65,
    pricePerDay: 400,
    rating: 4.8,
    reviews: 97,
    location: "Golden Wheat Farm, Oklahoma",
    available: true,
    image: "https://images.unsplash.com/photo-1592878849122-facb97520f9e?w=800&auto=format&fit=crop&q=60",
    features: ["170 HP", "CVT", "Climate Control"],
  },
]

// Sample bookings data
const sampleBookings: Booking[] = [
  {
    id: "b1",
    equipmentName: "John Deere 6M Series Tractor",
    equipmentImage: "https://images.unsplash.com/photo-1605002255096-5e07de85e1c1?w=400&auto=format&fit=crop&q=60",
    customerName: "Robert Miller",
    date: new Date(2026, 2, 28),
    startTime: "08:00",
    duration: 8,
    status: "confirmed",
    totalPrice: 450,
  },
  {
    id: "b2",
    equipmentName: "Case IH Combine Harvester",
    equipmentImage: "https://images.unsplash.com/photo-1598977123118-4e30ba3c4f5b?w=400&auto=format&fit=crop&q=60",
    customerName: "Sarah Johnson",
    date: new Date(2026, 2, 29),
    startTime: "06:00",
    duration: 24,
    status: "pending",
    totalPrice: 900,
  },
  {
    id: "b3",
    equipmentName: "Precision Seed Drill",
    equipmentImage: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&auto=format&fit=crop&q=60",
    customerName: "James Wilson",
    date: new Date(2026, 2, 25),
    startTime: "09:00",
    duration: 4,
    status: "completed",
    totalPrice: 180,
  },
]

// Chart data
const revenueData = [
  { month: "Jan", revenue: 4200 },
  { month: "Feb", revenue: 5800 },
  { month: "Mar", revenue: 7200 },
  { month: "Apr", revenue: 6400 },
  { month: "May", revenue: 8900 },
  { month: "Jun", revenue: 9500 },
]

export default function AgriRentPage() {
  const [currentView, setCurrentView] = useState<"browse" | "dashboard">("browse")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [bookings, setBookings] = useState<Booking[]>(sampleBookings)

  const filteredEquipment = useMemo(() => {
    return equipmentData.filter((eq) => {
      const matchesSearch = eq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.location.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "all" || eq.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory])

  const handleBookEquipment = (equipment: Equipment) => {
    setSelectedEquipment(equipment)
    setBookingModalOpen(true)
  }

  const handleSubmitBooking = async (data: BookingData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    const newBooking: Booking = {
      id: `b${Date.now()}`,
      equipmentName: data.equipmentName,
      equipmentImage: selectedEquipment?.image || "",
      customerName: data.name,
      date: data.date,
      startTime: data.startTime,
      duration: data.duration,
      status: "confirmed",
      totalPrice: data.totalPrice,
    }
    
    setBookings((prev) => [newBooking, ...prev])
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === "browse" ? (
          <>
            {/* Hero Section */}
            <section className="mb-10">
              <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl p-8 md:p-12">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
                    <Sprout className="w-4 h-4" />
                    Trusted by 5,000+ farmers
                  </div>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight text-balance mb-4">
                    Rent Farm Equipment When You Need It
                  </h1>
                  <p className="text-lg text-muted-foreground mb-6 text-pretty">
                    Access premium tractors, harvesters, and agricultural machinery at affordable rates. 
                    No ownership costs, just productivity.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button size="lg" className="gap-2">
                      Browse Equipment
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                    <Button size="lg" variant="outline">
                      List Your Equipment
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            {/* Filter Section */}
            <section className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Available Equipment</h2>
                  <p className="text-muted-foreground">{filteredEquipment.length} machines ready for rent</p>
                </div>
              </div>
              <EquipmentFilter
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </section>

            {/* Equipment Grid */}
            <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEquipment.map((equipment) => (
                <EquipmentCard
                  key={equipment.id}
                  equipment={equipment}
                  onBook={handleBookEquipment}
                />
              ))}
            </section>

            {filteredEquipment.length === 0 && (
              <div className="text-center py-16">
                <Tractor className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No equipment found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </>
        ) : (
          /* Dashboard View */
          <>
            <section className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Dashboard</h1>
              <p className="text-muted-foreground">Track your rentals and equipment performance</p>
            </section>

            {/* Stats Grid */}
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <StatCard
                title="Total Bookings"
                value={bookings.length}
                change={12}
                icon={Calendar}
              />
              <StatCard
                title="Active Rentals"
                value={bookings.filter(b => b.status === "confirmed").length}
                change={8}
                icon={Tractor}
                iconColor="text-accent"
              />
              <StatCard
                title="Total Revenue"
                value={`$${bookings.reduce((acc, b) => acc + b.totalPrice, 0).toLocaleString()}`}
                change={23}
                icon={DollarSign}
              />
              <StatCard
                title="Customers"
                value={new Set(bookings.map(b => b.customerName)).size}
                change={5}
                icon={Users}
                iconColor="text-chart-3"
              />
            </section>

            {/* Revenue Chart */}
            <section className="mb-8">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Revenue Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="oklch(0.52 0.15 145)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="oklch(0.52 0.15 145)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.02 140)" />
                        <XAxis 
                          dataKey="month" 
                          stroke="oklch(0.45 0.02 145)"
                          fontSize={12}
                        />
                        <YAxis 
                          stroke="oklch(0.45 0.02 145)"
                          fontSize={12}
                          tickFormatter={(value) => `$${value / 1000}k`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "oklch(1 0 0)",
                            border: "1px solid oklch(0.88 0.02 140)",
                            borderRadius: "8px",
                          }}
                          formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="oklch(0.52 0.15 145)"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorRevenue)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Bookings Table */}
            <section>
              <BookingsTable bookings={bookings} />
            </section>
          </>
        )}
      </main>

      {/* Booking Modal */}
      <BookingModal
        equipment={selectedEquipment}
        open={bookingModalOpen}
        onOpenChange={setBookingModalOpen}
        onSubmit={handleSubmitBooking}
      />
    </div>
  )
}
