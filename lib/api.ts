/**
 * AgriRent API Client
 * ===================
 * Client-side API functions to connect with the Flask backend.
 * 
 * Configure the API_BASE_URL environment variable to point to your Flask server.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// =============================================================================
// Types
// =============================================================================

export interface Equipment {
  id: string
  name: string
  category: string
  pricePerHour: number
  pricePerDay: number
  rating: number
  reviews: number
  location: string
  available: boolean
  image: string
  features: string[]
}

export interface Booking {
  id: string
  equipmentId: string
  equipmentName: string
  equipmentImage: string
  customerName: string
  date: string
  startTime: string
  duration: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  totalPrice: number
  location?: string
}

export interface BookingRequest {
  equipmentId: string
  date: string
  startTime: string
  duration: number
  name: string
  phone: string
  location?: string
  totalPrice: number
}

export interface DashboardStats {
  totalBookings: number
  activeRentals: number
  totalRevenue: number
  equipmentCount: number
  recentBookings: Booking[]
  revenueByMonth: { month: string; revenue: number }[]
}

export interface EquipmentFilters {
  category?: string
  search?: string
  available?: boolean
  minPrice?: number
  maxPrice?: number
}

// =============================================================================
// API Error Handling
// =============================================================================

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new ApiError(response.status, error.error || 'Request failed')
  }
  return response.json()
}

// =============================================================================
// Equipment API
// =============================================================================

export async function getEquipment(filters?: EquipmentFilters): Promise<Equipment[]> {
  const params = new URLSearchParams()
  
  if (filters?.category && filters.category !== 'all') {
    params.append('category', filters.category)
  }
  if (filters?.search) {
    params.append('search', filters.search)
  }
  if (filters?.available !== undefined) {
    params.append('available', String(filters.available))
  }
  if (filters?.minPrice) {
    params.append('min_price', String(filters.minPrice))
  }
  if (filters?.maxPrice) {
    params.append('max_price', String(filters.maxPrice))
  }
  
  const url = `${API_BASE_URL}/equipment${params.toString() ? `?${params}` : ''}`
  const response = await fetch(url)
  return handleResponse<Equipment[]>(response)
}

export async function getEquipmentById(id: string): Promise<Equipment> {
  const response = await fetch(`${API_BASE_URL}/equipment/${id}`)
  return handleResponse<Equipment>(response)
}

export async function createEquipment(equipment: Omit<Equipment, 'id' | 'rating' | 'reviews'>): Promise<Equipment> {
  const response = await fetch(`${API_BASE_URL}/equipment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(equipment),
  })
  return handleResponse<Equipment>(response)
}

export async function updateEquipment(id: string, updates: Partial<Equipment>): Promise<Equipment> {
  const response = await fetch(`${API_BASE_URL}/equipment/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })
  return handleResponse<Equipment>(response)
}

export async function deleteEquipment(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/equipment/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new ApiError(response.status, 'Failed to delete equipment')
  }
}

// =============================================================================
// Bookings API
// =============================================================================

export async function getBookings(filters?: {
  status?: string
  equipmentId?: string
  fromDate?: string
  toDate?: string
}): Promise<Booking[]> {
  const params = new URLSearchParams()
  
  if (filters?.status) {
    params.append('status', filters.status)
  }
  if (filters?.equipmentId) {
    params.append('equipment_id', filters.equipmentId)
  }
  if (filters?.fromDate) {
    params.append('from_date', filters.fromDate)
  }
  if (filters?.toDate) {
    params.append('to_date', filters.toDate)
  }
  
  const url = `${API_BASE_URL}/bookings${params.toString() ? `?${params}` : ''}`
  const response = await fetch(url)
  return handleResponse<Booking[]>(response)
}

export async function getBookingById(id: string): Promise<Booking> {
  const response = await fetch(`${API_BASE_URL}/bookings/${id}`)
  return handleResponse<Booking>(response)
}

export async function createBooking(booking: BookingRequest): Promise<Booking> {
  const response = await fetch(`${API_BASE_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(booking),
  })
  return handleResponse<Booking>(response)
}

export async function updateBooking(id: string, updates: Partial<Booking>): Promise<Booking> {
  const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })
  return handleResponse<Booking>(response)
}

export async function cancelBooking(id: string): Promise<Booking> {
  const response = await fetch(`${API_BASE_URL}/bookings/${id}/cancel`, {
    method: 'POST',
  })
  return handleResponse<Booking>(response)
}

// =============================================================================
// Dashboard API
// =============================================================================

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await fetch(`${API_BASE_URL}/dashboard/stats`)
  return handleResponse<DashboardStats>(response)
}

export async function getEquipmentAvailability(
  equipmentId: string,
  fromDate: string,
  toDate: string
): Promise<{ bookedDates: string[] }> {
  const params = new URLSearchParams({
    equipment_id: equipmentId,
    from_date: fromDate,
    to_date: toDate,
  })
  
  const response = await fetch(`${API_BASE_URL}/dashboard/availability?${params}`)
  return handleResponse<{ bookedDates: string[] }>(response)
}

// =============================================================================
// SWR Fetcher (for use with SWR hooks)
// =============================================================================

export const fetcher = async <T>(url: string): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${url}`)
  return handleResponse<T>(response)
}
