'use client'

import { useState, useEffect } from 'react'

export const dynamic = 'force-dynamic'
import AdminLayout from '@/components/AdminLayout'
import { supabase } from '@/lib/supabase'
import { DashboardStats } from '@/lib/types'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      // Fetch orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*, products(price)')
        .in('status', ['Baru', 'Diproses', 'Selesai'])

      if (ordersError) throw ordersError

      // Fetch products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id')

      if (productsError) throw productsError

      // Fetch reviews
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('id')

      if (reviewsError) throw reviewsError

      // Calculate stats
      const totalOmset = orders
        ?.filter((o: any) => o.status === 'Selesai')
        .reduce((sum: number, o: any) => sum + parseFloat(o.total_price || 0), 0) || 0

      // Calculate profit (assuming 30% profit margin)
      const totalProfit = totalOmset * 0.3

      // Calculate sales for last 7 days
      const salesChart: { date: string; sales: number }[] = []
      const today = new Date()
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        const daySales = orders
          ?.filter((o: any) => {
            const orderDate = new Date(o.created_at).toISOString().split('T')[0]
            return orderDate === dateStr && o.status === 'Selesai'
          })
          .reduce((sum: number, o: any) => sum + parseFloat(o.total_price || 0), 0) || 0

        salesChart.push({
          date: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
          sales: daySales,
        })
      }

      setStats({
        totalOmset,
        totalProfit,
        totalProducts: products?.length || 0,
        totalReviews: reviews?.length || 0,
        salesChart,
      })
    } catch (error: any) {
      toast.error('Gagal memuat statistik: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="text-xl">Memuat statistik...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-900 dark:text-white">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                Total Omset
              </h3>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 text-xl">💰</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              Rp {stats?.totalOmset.toLocaleString('id-ID') || '0'}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                Total Profit
              </h3>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400 text-xl">💵</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              Rp {stats?.totalProfit.toLocaleString('id-ID') || '0'}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                Total Produk
              </h3>
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 dark:text-purple-400 text-xl">📦</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats?.totalProducts || '0'}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                Total Review
              </h3>
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 dark:text-orange-400 text-xl">⭐</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {stats?.totalReviews || '0'}
            </p>
          </div>
        </div>

        {/* Sales Chart */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-900 dark:text-white">
            Grafik Penjualan 7 Hari Terakhir
          </h2>
          <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
            <LineChart data={stats?.salesChart || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                style={{ fill: '#6b7280' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fill: '#6b7280' }}
              />
              <Tooltip
                formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, 'Penjualan']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: '#111827',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#3b82f6"
                strokeWidth={3}
                name="Penjualan"
                dot={{ fill: '#3b82f6', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AdminLayout>
  )
}

