"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tractor, Search, Menu, X, User, Bell } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface HeaderProps {
  currentView: "browse" | "dashboard"
  onViewChange: (view: "browse" | "dashboard") => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function Header({ currentView, onViewChange, searchQuery, onSearchChange }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Tractor className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">AgriRent</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Button
              variant={currentView === "browse" ? "secondary" : "ghost"}
              onClick={() => onViewChange("browse")}
              className="font-medium"
            >
              Browse Equipment
            </Button>
            <Button
              variant={currentView === "dashboard" ? "secondary" : "ghost"}
              onClick={() => onViewChange("dashboard")}
              className="font-medium"
            >
              Dashboard
            </Button>
          </nav>

          {/* Search (Desktop) */}
          <div className="hidden md:flex items-center gap-4 flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search equipment..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 bg-secondary border-0"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
            </Button>
            <Button variant="ghost" size="icon">
              <User className="w-5 h-5" />
            </Button>
            <Button>List Equipment</Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 border-t border-border bg-card",
          mobileMenuOpen ? "max-h-96" : "max-h-0"
        )}
      >
        <div className="px-4 py-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search equipment..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-secondary border-0"
            />
          </div>
          <Button
            variant={currentView === "browse" ? "secondary" : "ghost"}
            onClick={() => {
              onViewChange("browse")
              setMobileMenuOpen(false)
            }}
            className="w-full justify-start"
          >
            Browse Equipment
          </Button>
          <Button
            variant={currentView === "dashboard" ? "secondary" : "ghost"}
            onClick={() => {
              onViewChange("dashboard")
              setMobileMenuOpen(false)
            }}
            className="w-full justify-start"
          >
            Dashboard
          </Button>
          <Button className="w-full">List Equipment</Button>
        </div>
      </div>
    </header>
  )
}
