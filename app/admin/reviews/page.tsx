'use client'

import { useState, useEffect } from 'react'

export const dynamic = 'force-dynamic'
import AdminLayout from '@/components/AdminLayout'
import { supabase } from '@/lib/supabase'
import { Review, Product } from '@/lib/types'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { uploadImages } from '@/lib/storage'

interface ProductOption {
  id: string
  name: string
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [products, setProducts] = useState<ProductOption[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [formData, setFormData] = useState({
    product_id: '',
    reviewer_name: '',
    text_content: '',
    rating: '',
    images: [] as File[],
    is_approved: false,
  })

  useEffect(() => {
    fetchReviews()
    fetchProducts()
  }, [])

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          products (
            id,
            name,
            category
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Transform data to ensure product is accessible
      const transformedData = (data || []).map((review: any) => {
        let product = null
        
        if (review.products) {
          if (Array.isArray(review.products)) {
            product = review.products.length > 0 ? review.products[0] : null
          } else {
            product = review.products
          }
        }
        
        return {
          ...review,
          product: product || null,
        }
      })
      
      setReviews(transformedData)
    } catch (error: any) {
      toast.error('Gagal memuat ulasan: ' + error.message)
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name')
        .order('name', { ascending: true })

      if (error) throw error
      setProducts((data || []) as ProductOption[])
    } catch (error: any) {
      console.error('Error fetching products:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      let imageUrls: string[] = []

      if (editingReview) {
        // Update review
        if (formData.images.length > 0) {
          imageUrls = await uploadImages(
            formData.images,
            `reviews/${editingReview.id}`
          )
        } else {
          imageUrls = editingReview.images || []
        }

        const { error } = await supabase
          .from('reviews')
          .update({
            product_id: formData.product_id,
            reviewer_name: formData.reviewer_name,
            text_content: formData.text_content,
            rating: formData.rating ? parseInt(formData.rating) : null,
            images: imageUrls,
            is_approved: formData.is_approved,
          })
          .eq('id', editingReview.id)

        if (error) throw error
        toast.success('Ulasan berhasil diupdate!')
      } else {
        // Create review
        const { data: newReview, error: createError } = await supabase
          .from('reviews')
          .insert([
            {
              product_id: formData.product_id,
              reviewer_name: formData.reviewer_name,
              text_content: formData.text_content,
              rating: formData.rating ? parseInt(formData.rating) : null,
              images: [],
              is_approved: formData.is_approved,
            },
          ])
          .select()
          .single()

        if (createError) throw createError

        if (formData.images.length > 0) {
          imageUrls = await uploadImages(
            formData.images,
            `reviews/${newReview.id}`
          )

          const { error: updateError } = await supabase
            .from('reviews')
            .update({ images: imageUrls })
            .eq('id', newReview.id)

          if (updateError) throw updateError
        }

        toast.success('Ulasan berhasil ditambahkan!')
      }

      setShowModal(false)
      resetForm()
      fetchReviews()
    } catch (error: any) {
      toast.error('Gagal menyimpan ulasan: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus ulasan ini?')) return

    try {
      const { error } = await supabase.from('reviews').delete().eq('id', id)

      if (error) throw error
      toast.success('Ulasan berhasil dihapus!')
      fetchReviews()
    } catch (error: any) {
      toast.error('Gagal menghapus ulasan: ' + error.message)
    }
  }

  const handleToggleApproval = async (review: Review) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: !review.is_approved })
        .eq('id', review.id)

      if (error) throw error
      toast.success(
        `Ulasan ${!review.is_approved ? 'disetujui' : 'tidak disetujui'}!`
      )
      fetchReviews()
    } catch (error: any) {
      toast.error('Gagal mengupdate status: ' + error.message)
    }
  }

  const handleEdit = (review: Review) => {
    setEditingReview(review)
    setFormData({
      product_id: review.product_id,
      reviewer_name: review.reviewer_name,
      text_content: review.text_content,
      rating: review.rating?.toString() || '',
      images: [],
      is_approved: review.is_approved,
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      product_id: '',
      reviewer_name: '',
      text_content: '',
      rating: '',
      images: [],
      is_approved: false,
    })
    setEditingReview(null)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="text-xl">Memuat ulasan...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manajemen Ulasan</h1>
          <button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tambah Ulasan
          </button>
        </div>

        {/* Reviews Table */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-gray-200 dark:border-gray-700 rounded-3xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50/70 dark:bg-gray-900/40">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Produk
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Reviewer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Ulasan
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/60 dark:bg-gray-900/40 divide-y divide-gray-200 dark:divide-gray-800">
              {reviews.map(review => (
                <tr
                  key={review.id}
                  className="hover:bg-primary-50/70 dark:hover:bg-gray-800/70 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {review.product?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {review.reviewer_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 max-w-xs">
                    <p className="line-clamp-2">{review.text_content}</p>
                    {review.images && review.images.length > 0 && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        ({review.images.length} gambar)
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {review.rating ? '★'.repeat(review.rating) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        review.is_approved
                          ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-200'
                      }`}
                    >
                      {review.is_approved ? 'Disetujui' : 'Menunggu'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleToggleApproval(review)}
                      className={`${
                        review.is_approved
                          ? 'text-yellow-600 hover:text-yellow-900 dark:text-yellow-300 dark:hover:text-yellow-200'
                          : 'text-green-600 hover:text-green-900 dark:text-green-300 dark:hover:text-green-200'
                      }`}
                    >
                      {review.is_approved ? 'Batalkan' : 'Setujui'}
                    </button>
                    <button
                      onClick={() => handleEdit(review)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 dark:bg-stone-900/80 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                {editingReview ? 'Edit Ulasan' : 'Tambah Ulasan'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Produk
                  </label>
                  <select
                    required
                    value={formData.product_id}
                    onChange={(e) =>
                      setFormData({ ...formData, product_id: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Pilih Produk</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id} className="dark:bg-gray-700">
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nama Reviewer
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.reviewer_name}
                    onChange={(e) =>
                      setFormData({ ...formData, reviewer_name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Isi Ulasan
                  </label>
                  <textarea
                    required
                    value={formData.text_content}
                    onChange={(e) =>
                      setFormData({ ...formData, text_content: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Rating (1-5, opsional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) =>
                      setFormData({ ...formData, rating: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Gambar (Multiple)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || [])
                      setFormData({ ...formData, images: files })
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_approved"
                    checked={formData.is_approved}
                    onChange={(e) =>
                      setFormData({ ...formData, is_approved: e.target.checked })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded bg-white dark:bg-gray-700"
                  />
                  <label
                    htmlFor="is_approved"
                    className="ml-2 block text-sm text-gray-900 dark:text-gray-200"
                  >
                    Setujui ulasan
                  </label>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      resetForm()
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Memproses...
                      </span>
                    ) : editingReview ? 'Update' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

