'use client'

import { useState, useEffect } from 'react'

export const dynamic = 'force-dynamic'
import AdminLayout from '@/components/AdminLayout'
import { supabase } from '@/lib/supabase'
import { DashboardStats } from '@/lib/types'
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
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
  const [orderStatusData, setOrderStatusData] = useState<{ name: string; value: number; color: string }[]>([])

  // Date filter states
  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date()
    date.setDate(date.getDate() - 30) // Default to 30 days ago
    return date.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0] // Default to today
  })

  useEffect(() => {
    fetchDashboardStats()
  }, []) // Remove [startDate, endDate] dependency since we have manual Filter button

  const fetchDashboardStats = async () => {
    try {
      // Fetch orders with date filter
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*, products(price)')
        .gte('created_at', startDate)
        .lte('created_at', endDate + 'T23:59:59.999Z')

      if (ordersError) throw ordersError

      // Fetch products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id')

      if (productsError) throw productsError

      // Fetch reviews with date filter
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('id')
        .gte('created_at', startDate)
        .lte('created_at', endDate + 'T23:59:59.999Z')

      if (reviewsError) throw reviewsError

      // Calculate stats
      const completedOrders = orders?.filter((o: any) => o.status === 'Selesai') || []
      const totalOmset = completedOrders.reduce((sum: number, o: any) => sum + parseFloat(o.total_price || 0), 0)
      const totalOrders = orders?.length || 0

      // Calculate profit (fix 50.000 per order)
      const totalProfit = completedOrders.length * 50000

      // Calculate sales for date range (show all days in the range)
      const salesChart: { date: string; sales: number; orders: number; profit: number }[] = []
      const start = new Date(startDate)
      const end = new Date(endDate)
      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

      // Show all days in the selected range
      for (let i = 0; i <= daysDiff; i++) {
        const date = new Date(start)
        date.setDate(date.getDate() + i)
        const dateStr = date.toISOString().split('T')[0]

        const dayOrders = orders?.filter((o: any) => {
          const orderDate = new Date(o.created_at).toISOString().split('T')[0]
          return orderDate === dateStr && o.status === 'Selesai'
        }) || []

        const daySales = dayOrders.reduce((sum: number, o: any) => sum + parseFloat(o.total_price || 0), 0)
        const dayProfit = dayOrders.length * 50000

        salesChart.push({
          date: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
          sales: daySales,
          orders: dayOrders.length,
          profit: dayProfit,
        })
      }

      // Calculate order status distribution
      const statusCounts = {
        Baru: 0,
        Diproses: 0,
        Selesai: 0,
        Batal: 0,
      }

      orders?.forEach((order: any) => {
        if (order.status in statusCounts) {
          statusCounts[order.status as keyof typeof statusCounts]++
        }
      })

      const statusData = [
        { name: 'Baru', value: statusCounts.Baru, color: '#3b82f6' },
        { name: 'Diproses', value: statusCounts.Diproses, color: '#f59e0b' },
        { name: 'Selesai', value: statusCounts.Selesai, color: '#10b981' },
        { name: 'Batal', value: statusCounts.Batal, color: '#ef4444' },
      ]

      setStats({
        totalOmset,
        totalProfit,
        totalProducts: products?.length || 0,
        totalReviews: reviews?.length || 0,
        totalOrders,
        salesChart,
      })

      setOrderStatusData(statusData)
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

        {/* Date Filter */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="flex-1 min-w-0">
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tanggal Mulai
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex-1 min-w-0">
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tanggal Akhir
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  &nbsp;
                </label>
                <button
                  onClick={() => {
                    const today = new Date()
                    const thirtyDaysAgo = new Date()
                    thirtyDaysAgo.setDate(today.getDate() - 30)
                    setStartDate(thirtyDaysAgo.toISOString().split('T')[0])
                    setEndDate(today.toISOString().split('T')[0])
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                >
                  Reset
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  &nbsp;
                </label>
                <button
                  onClick={() => {
                    fetchDashboardStats()
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Filter
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
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
                Total Orders
              </h3>
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 dark:text-orange-400 text-xl">📋</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {stats?.totalOrders || '0'}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Chart */}
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-900 dark:text-white">
              Grafik Penjualan ({new Date(startDate).toLocaleDateString('id-ID')} - {new Date(endDate).toLocaleDateString('id-ID')})
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
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                          <p className="font-semibold text-gray-900 mb-2">{data.date}</p>
                          <p className="text-blue-600">
                            Total Omset: Rp {data.sales.toLocaleString('id-ID')}
                          </p>
                          <p className="text-green-600">
                            Total Profit: Rp {data.profit.toLocaleString('id-ID')}
                          </p>
                          <p className="text-purple-600">
                            Total Orders: {data.orders}
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  name="Total Omset"
                  dot={{ fill: '#3b82f6', r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#10b981"
                  strokeWidth={3}
                  name="Total Profit"
                  dot={{ fill: '#10b981', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Order Status Pie Chart */}
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-900 dark:text-white">
              Status Order
            </h2>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0] as any
                      const total = orderStatusData.reduce((sum, item) => sum + item.value, 0)
                      const percentage = total > 0 ? ((data.value || 0) / total * 100).toFixed(1) : 0
                      return (
                        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                          <p className="font-semibold text-gray-900">{data.name}</p>
                          <p className="text-gray-600">Total: {data.value || 0} order</p>
                          <p className="text-gray-600">Persentase: {percentage}%</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

