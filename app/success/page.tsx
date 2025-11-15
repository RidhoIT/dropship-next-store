'use client'

import { useState, useEffect } from 'react'

export const dynamic = 'force-dynamic'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Order, Product } from '@/lib/types'
import { generatePDF } from '@/lib/pdf'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'
import ThemeToggle from '@/components/ThemeToggle'

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get('orderId')

  const [order, setOrder] = useState<Order | null>(null)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderId) {
      fetchOrder()
    } else {
      toast.error('Order ID tidak ditemukan')
      router.push('/')
    }
  }, [orderId, router])

  const fetchOrder = async () => {
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (orderError) throw orderError

      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', orderData.product_id)
        .single()

      if (productError) throw productError

      setOrder(orderData)
      setProduct(productData)
    } catch (error: any) {
      toast.error('Gagal memuat data pesanan: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleWhatsApp = () => {
    if (!order || !product) return

    const message = `Halo, saya ingin konfirmasi pesanan saya:\n\n` +
      `Produk: ${product.name}\n` +
      `Jumlah: ${order.quantity}\n` +
      `Total Harga: Rp ${order.total_price.toLocaleString('id-ID')}\n` +
      `Nama: ${order.customer_name}\n` +
      `Alamat: ${order.address}\n` +
      `Telepon: ${order.phone_number}\n` +
      `Order ID: ${order.id}`

    const whatsappUrl = `https://wa.me/6288279126971?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleExportPDF = () => {
    if (!order || !product) return

    try {
      generatePDF(order, product)
      toast.success('PDF berhasil diunduh!')
    } catch (error: any) {
      toast.error('Gagal membuat PDF: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Memuat...</p>
        </div>
      </div>
    )
  }

  if (!order || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Data pesanan tidak ditemukan</h1>
          <Link href="/" className="text-primary-600 dark:text-primary-400 hover:underline">
            Kembali ke beranda
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-md sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/next-store.png"
                alt="Next Store E-commerce"
                width={40}
                height={40}
                className="w-10 h-10 object-contain"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent dark:from-primary-400 dark:to-primary-600">
                E-commerce Store
              </span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4 animate-bounce">
              <svg
                className="w-12 h-12 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Pesanan Berhasil!
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Terima kasih atas pesanan Anda. Pesanan Anda sedang diproses.
            </p>
          </div>

          {/* Order Details */}
          <div className="border-t border-b border-gray-200 dark:border-gray-700 py-6 my-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Detail Pesanan</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Order ID:</span>
                <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">{order.id.substring(0, 8)}...</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Produk:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{product.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Jumlah:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{order.quantity}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Harga Satuan:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  Rp {product.price.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">Total Harga:</span>
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  Rp {order.total_price.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-semibold rounded-full">
                  {order.status}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Informasi Pelanggan</h2>
            <div className="space-y-2 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p>
                <span className="text-gray-600 dark:text-gray-400">Nama:</span>{' '}
                <span className="font-semibold text-gray-900 dark:text-white">{order.customer_name}</span>
              </p>
              <p>
                <span className="text-gray-600 dark:text-gray-400">Alamat:</span>{' '}
                <span className="font-semibold text-gray-900 dark:text-white">{order.address}</span>
              </p>
              <p>
                <span className="text-gray-600 dark:text-gray-400">Telepon:</span>{' '}
                <span className="font-semibold text-gray-900 dark:text-white">{order.phone_number}</span>
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <button
              onClick={handleWhatsApp}
              className="flex items-center justify-center gap-3 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Konfirmasi via WhatsApp
            </button>

            <button
              onClick={handleExportPDF}
              className="flex items-center justify-center gap-3 bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Export PDF
            </button>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors"
            >
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
