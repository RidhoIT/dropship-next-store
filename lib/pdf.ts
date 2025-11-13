import jsPDF from 'jspdf'
import { Order, Product } from './types'

export function generatePDF(order: Order, product: Product) {
  const doc = new jsPDF()
  
  // Title
  doc.setFontSize(20)
  doc.text('Bukti Pesanan', 105, 20, { align: 'center' })
  
  // Order Details
  doc.setFontSize(12)
  let y = 40
  
  doc.text(`Order ID: ${order.id}`, 20, y)
  y += 10
  doc.text(`Tanggal: ${new Date(order.created_at).toLocaleDateString('id-ID')}`, 20, y)
  y += 15
  
  // Product Info
  doc.setFontSize(14)
  doc.text('Detail Produk', 20, y)
  y += 10
  doc.setFontSize(12)
  doc.text(`Nama: ${product.name}`, 20, y)
  y += 8
  doc.text(`Kategori: ${product.category}`, 20, y)
  y += 8
  doc.text(`Harga Satuan: Rp ${product.price.toLocaleString('id-ID')}`, 20, y)
  y += 10
  
  // Order Info
  doc.setFontSize(14)
  doc.text('Detail Pesanan', 20, y)
  y += 10
  doc.setFontSize(12)
  doc.text(`Jumlah: ${order.quantity}`, 20, y)
  y += 8
  doc.text(`Total Harga: Rp ${order.total_price.toLocaleString('id-ID')}`, 20, y)
  y += 8
  doc.text(`Status: ${order.status}`, 20, y)
  y += 15
  
  // Customer Info
  doc.setFontSize(14)
  doc.text('Informasi Pelanggan', 20, y)
  y += 10
  doc.setFontSize(12)
  doc.text(`Nama: ${order.customer_name}`, 20, y)
  y += 8
  doc.text(`Alamat: ${order.address}`, 20, y)
  y += 8
  doc.text(`Telepon: ${order.phone_number}`, 20, y)
  
  // Footer
  doc.setFontSize(10)
  doc.text(
    'Terima kasih atas pesanan Anda!',
    105,
    280,
    { align: 'center' }
  )
  
  // Save PDF
  doc.save(`order-${order.id}.pdf`)
}

