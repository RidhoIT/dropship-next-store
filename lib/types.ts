export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  images: string[]
  created_at: string
}

export interface Review {
  id: string
  product_id: string
  reviewer_name: string
  text_content: string
  rating: number | null
  images: string[]
  is_approved: boolean
  created_at: string
  product?: Product
}

export interface Order {
  id: string
  product_id: string
  customer_name: string
  address: string
  phone_number: string
  quantity: number
  total_price: number
  payment_method?: string
  status: 'Baru' | 'Diproses' | 'Selesai' | 'Batal'
  created_at: string
  product?: Product
}

export interface DashboardStats {
  totalOmset: number
  totalProfit: number
  totalProducts: number
  totalReviews: number
  salesChart: { date: string; sales: number }[]
}

