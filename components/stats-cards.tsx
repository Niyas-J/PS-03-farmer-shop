"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: LucideIcon
  iconColor?: string
}

export function StatCard({ 
  title, 
  value, 
  change, 
  changeLabel = "vs last month",
  icon: Icon,
  iconColor = "text-primary"
}: StatCardProps) {
  const isPositive = change && change > 0

  return (
    <Card className="border-border/50">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {typeof change === 'number' && (
              <div className="flex items-center gap-1.5">
                {isPositive ? (
                  <TrendingUp className="w-4 h-4 text-primary" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-destructive" />
                )}
                <span className={isPositive ? "text-primary text-sm font-medium" : "text-destructive text-sm font-medium"}>
                  {isPositive ? "+" : ""}{change}%
                </span>
                <span className="text-muted-foreground text-sm">{changeLabel}</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl bg-secondary ${iconColor}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface StatsCardsProps {
  stats: {
    totalBookings: number
    activeRentals: number
    totalRevenue: number
    equipmentCount: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  return null // Individual StatCards are used directly in the dashboard
}
