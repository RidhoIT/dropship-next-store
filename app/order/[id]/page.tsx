'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Product, Review } from '@/lib/types'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'
import ThemeToggle from '@/components/ThemeToggle'
import WhatsAppFAB from '@/components/WhatsAppFAB'

export default function OrderPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  const [formData, setFormData] = useState({
    customer_name: '',
    address: '',
    phone_number: '',
    quantity: 1,
    payment_method: 'COD',
  })

  useEffect(() => {
    if (productId) {
      fetchProduct()
      fetchReviews()
    }
  }, [productId])

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()

      if (error) throw error
      setProduct(data)
      setCurrentImageIndex(0) // Reset image index when product loads
    } catch (error: any) {
      toast.error('Gagal memuat produk: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const nextImage = () => {
    if (product && product.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images!.length)
    }
  }

  const prevImage = () => {
    if (product && product.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images!.length) % product.images!.length)
    }
  }

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setReviews(data || [])
    } catch (error: any) {
      console.error('Error fetching reviews:', error)
    }
  }

  const handleQuantityChange = (change: number) => {
    const newQuantity = formData.quantity + change
    if (newQuantity >= 1 && (!product || newQuantity <= product.stock)) {
      setFormData({ ...formData, quantity: newQuantity })
    }
  }

  // Fungsi untuk menghitung harga diskon
  const calculateDiscountPrice = (originalPrice: number) => {
    // Harga asli ditambah 100%, lalu diskon 50%
    const markedUpPrice = originalPrice * 2
    const discountPercentage = 50
    const finalPrice = markedUpPrice * (1 - discountPercentage / 100)
    const savingsAmount = markedUpPrice - finalPrice

    return {
      originalPrice: originalPrice,
      markedUpPrice: markedUpPrice,
      discountPrice: finalPrice,
      discountPercentage: discountPercentage,
      savingsAmount: savingsAmount
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!product) return

    if (formData.quantity > product.stock) {
      toast.error('Jumlah melebihi stok yang tersedia')
      return
    }

    if (formData.quantity < 1) {
      toast.error('Jumlah minimal 1')
      return
    }

    setSubmitting(true)

    try {
      const totalPrice = product.price * formData.quantity

      const { data, error } = await supabase
        .from('orders')
        .insert([
          {
            product_id: productId,
            customer_name: formData.customer_name,
            address: formData.address,
            phone_number: formData.phone_number,
            quantity: formData.quantity,
            total_price: totalPrice,
            payment_method: formData.payment_method,
            status: 'Baru',
          },
        ])
        .select()
        .single()

      if (error) throw error

      // Update product stock
      await supabase
        .from('products')
        .update({ stock: product.stock - formData.quantity })
        .eq('id', productId)

      toast.success('Pesanan berhasil dibuat!')
      router.push(`/success?orderId=${data.id}`)
    } catch (error: any) {
      toast.error('Gagal membuat pesanan: ' + error.message)
    } finally {
      setSubmitting(false)
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

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Produk tidak ditemukan</h1>
          <Link href="/" className="text-primary-600 dark:text-primary-400 hover:underline">
            Kembali ke beranda
          </Link>
        </div>
      </div>
    )
  }

  const descriptionSections = (product.description || '')
    .split(/\n\s*\n/)
    .map(section => section.trim())
    .filter(section => section.length > 0)

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
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
              />
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent dark:from-primary-400 dark:to-primary-600">
                <span className="hidden sm:inline">E-commerce Store</span>
                <span className="sm:hidden">Next Store</span>
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link
                href="/"
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Kembali
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Info */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{product.name}</h2>
            {product.images && product.images.length > 0 && (
              <div className="relative w-full mb-4 rounded-xl bg-gray-100 dark:bg-gray-700 aspect-square max-h-80 overflow-hidden">
                <Image
                  src={product.images[currentImageIndex]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain"
                  priority={true}
                />

                {/* Image Navigation */}
                {product.images.length > 1 && (
                  <>
                    {/* Previous Button */}
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {/* Next Button */}
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {/* Image Indicators */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                      {product.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                            index === currentImageIndex
                              ? 'bg-white'
                              : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Image Counter */}
                    <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                      {currentImageIndex + 1} / {product.images.length}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="mb-4">
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        index === currentImageIndex
                          ? 'border-primary-500 ring-2 ring-primary-300'
                          : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} - Gambar ${index + 1}`}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed space-y-3">
              {descriptionSections.length > 0 ? (
                descriptionSections.map((section, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 shadow-sm"
                  >
                    {section.split('\n').map((line, lineIndex) => (
                      <span key={lineIndex} className="block">
                        {line.trim()}
                      </span>
                    ))}
                  </div>
                ))
              ) : (
                <p className="italic text-gray-400">Deskripsi belum ditambahkan oleh admin.</p>
              )}
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4">
              {/* Flash Sale Banner */}
              <div className="bg-red-500 text-white text-center py-2 rounded-lg mb-4">
                <p className="text-sm font-bold">
                  FLASH SALE 50% OFF - HARI INI SAJA
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Harga Section */}
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Harga Spesial</p>
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-lg text-gray-400 line-through">
                      Rp {calculateDiscountPrice(product.price).markedUpPrice.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    Rp {product.price.toLocaleString('id-ID')}
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium mt-1">
                    Hemat Rp {calculateDiscountPrice(product.price).savingsAmount.toLocaleString('id-ID')}
                  </p>
                </div>

                {/* Ketersediaan Section */}
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ketersediaan</p>
                  <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    Stok Terbatas
                  </p>
                  {product.stock <= 10 && (
                    <p className="text-xs text-orange-500 dark:text-orange-400">
                      Sisa {product.stock} unit
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-sm font-semibold rounded-full">
                {product.category}
              </span>
            </div>
          </div>

          {/* Order Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Formulir Pemesanan</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nama Pelanggan
                </label>
                <input
                  type="text"
                  required
                  value={formData.customer_name}
                  onChange={(e) =>
                    setFormData({ ...formData, customer_name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Alamat Lengkap
                </label>
                <textarea
                  required
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                  placeholder="Masukkan alamat lengkap"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone_number}
                  onChange={(e) =>
                    setFormData({ ...formData, phone_number: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="08xxxxxxxxxx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Jumlah
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={formData.quantity <= 1}
                    className="w-8 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-semibold text-base"
                  >
                    -
                  </button>
                  <div className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-center">
                    <span className="text-base font-semibold text-gray-900 dark:text-white">
                      {formData.quantity}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    disabled={formData.quantity >= product.stock}
                    className="w-8 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-semibold text-base"
                  >
                    +
                  </button>
                </div>
                <p className="text-xs text-orange-600 dark:text-orange-400 font-medium mt-1">
                  {product.stock <= 10 ? '⚠️ Stok sangat terbatas! Sisa ' + product.stock + ' unit' : '⚡ Stok Terbatas'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Metode Pembayaran
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, payment_method: 'COD' })}
                    className={`p-3 rounded-lg border-2 font-medium transition-all ${
                      formData.payment_method === 'COD'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    💵 COD
                    <span className="block text-xs mt-1">Bayar di tempat</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, payment_method: 'Transfer Bank' })}
                    className={`p-3 rounded-lg border-2 font-medium transition-all ${
                      formData.payment_method === 'Transfer Bank'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    🏦 Transfer Bank
                    <span className="block text-xs mt-1">Transfer sekarang</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Harga Normal:</span>
                    <span className="text-sm text-gray-400 line-through">
                      Rp {(calculateDiscountPrice(product.price).markedUpPrice * formData.quantity).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Diskon:</span>
                    <span className="text-sm font-bold text-red-600 dark:text-red-400">
                      -Rp {(calculateDiscountPrice(product.price).savingsAmount * formData.quantity).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-700 dark:text-gray-300">Total Bayar:</span>
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">
                    Rp {(product.price * formData.quantity).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || formData.quantity > product.stock || formData.quantity < 1}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {submitting ? 'Memproses...' : 'Buat Pesanan'}
              </button>
            </form>
          </div>
        </div>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Ulasan & Testimoni</h2>
            <div className="space-y-6">
              {reviews.map(review => (
                <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{review.reviewer_name}</h4>
                    {review.rating && (
                      <div className="flex items-center space-x-1 text-yellow-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <svg
                            key={i}
                            className={`w-5 h-5 ${i < review.rating! ? 'fill-current' : 'text-gray-300 dark:text-gray-600'}`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">{review.text_content}</p>
                  {review.images && review.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                      {review.images.map((img, idx) => (
                        <div key={idx} className="relative w-full aspect-square rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden">
                          <Image
                            src={img}
                            alt={`Review ${idx + 1}`}
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
                            className="object-contain"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                    {new Date(review.created_at).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* WhatsApp FAB */}
      <WhatsAppFAB productName={product.name} />
    </div>
  )
}
