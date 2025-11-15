import jsPDF from 'jspdf'
import { Order, Product } from './types'

export function generatePDF(order: Order, product: Product) {
  const doc = new jsPDF()
  
  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)
  
  // Professional color scheme
  const primary = [41, 98, 255] // Modern Blue
  const secondary = [45, 55, 72] // Dark Gray
  const accent = [16, 185, 129] // Green
  const lightBg = [249, 250, 251] // Light Gray
  const borderColor = [229, 231, 235] // Border Gray
  const textDark = [17, 24, 39]
  const textLight = [107, 114, 128]
  
  let currentY = 0
  
  // ========================================
  // HEADER SECTION - Modern Gradient Style
  // ========================================
  doc.setFillColor(primary[0], primary[1], primary[2])
  doc.rect(0, 0, pageWidth, 60, 'F')
  
  // Company Logo/Name
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(26)
  doc.setFont('helvetica', 'bold')
  doc.text('NEXT STORE', margin, 25)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Premium E-Commerce Platform', margin, 35)
  
  // Invoice Badge - Right side
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(pageWidth - margin - 65, 15, 65, 30, 3, 3, 'F')
  
  doc.setTextColor(primary[0], primary[1], primary[2])
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('INVOICE', pageWidth - margin - 32.5, 25, { align: 'center' })
  
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  const shortId = order.id.substring(0, 8).toUpperCase()
  doc.text(`#${shortId}`, pageWidth - margin - 32.5, 37, { align: 'center' })
  
  currentY = 75
  
  // ========================================
  // DATE SECTION
  // ========================================
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2])
  doc.roundedRect(margin, currentY, contentWidth, 20, 2, 2, 'F')
  
  const orderDate = new Date(order.created_at).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  
  doc.setTextColor(textLight[0], textLight[1], textLight[2])
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Tanggal Order:', margin + 8, currentY + 10)
  
  doc.setTextColor(textDark[0], textDark[1], textDark[2])
  doc.setFont('helvetica', 'bold')
  doc.text(orderDate, margin + 40, currentY + 10)
  
  currentY += 35
  
  // ========================================
  // CUSTOMER INFORMATION - Card Style
  // ========================================
  doc.setFillColor(255, 255, 255)
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2])
  doc.setLineWidth(0.5)
  doc.roundedRect(margin, currentY, contentWidth, 55, 3, 3, 'FD')
  
  // Card Header
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2])
  doc.roundedRect(margin, currentY, contentWidth, 12, 3, 3, 'F')
  
  doc.setTextColor(secondary[0], secondary[1], secondary[2])
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('INFORMASI PELANGGAN', margin + 8, currentY + 8)
  
  // Customer Details
  currentY += 22
  
  doc.setTextColor(textDark[0], textDark[1], textDark[2])
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text(order.customer_name, margin + 8, currentY)
  
  currentY += 10
  
  doc.setTextColor(textLight[0], textLight[1], textLight[2])
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('📞', margin + 8, currentY)
  doc.setTextColor(textDark[0], textDark[1], textDark[2])
  doc.text(order.phone_number, margin + 16, currentY)
  
  currentY += 8
  
  doc.setTextColor(textLight[0], textLight[1], textLight[2])
  doc.text('📍', margin + 8, currentY)
  doc.setTextColor(textDark[0], textDark[1], textDark[2])
  
  // Address with word wrap
  const addressLines = doc.splitTextToSize(order.address, contentWidth - 24)
  doc.text(addressLines, margin + 16, currentY)
  
  currentY += Math.max(addressLines.length * 5, 8) + 18
  
  // ========================================
  // PRODUCT SECTION - Modern Card
  // ========================================
  doc.setFillColor(255, 255, 255)
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2])
  doc.roundedRect(margin, currentY, contentWidth, 75, 3, 3, 'FD')
  
  // Product Header
  doc.setFillColor(...primary)
  doc.roundedRect(margin, currentY, contentWidth, 12, 3, 3, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('DETAIL PRODUK', margin + 8, currentY + 8)
  
  currentY += 24
  
  // Product Name
  doc.setTextColor(primary[0], primary[1], primary[2])
  doc.setFontSize(15)
  doc.setFont('helvetica', 'bold')
  const productName = product.name.length > 45 ? product.name.substring(0, 45) + '...' : product.name
  doc.text(productName, margin + 8, currentY)
  
  currentY += 10
  
  // Category Badge
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2])
  const categoryWidth = doc.getTextWidth(product.category.toUpperCase()) + 10
  doc.roundedRect(margin + 8, currentY - 4, categoryWidth, 8, 2, 2, 'F')
  doc.setTextColor(textLight[0], textLight[1], textLight[2])
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text(product.category.toUpperCase(), margin + 13, currentY + 1)
  
  currentY += 16
  
  // Product Info Grid
  const gridY = currentY
  const colWidth = contentWidth / 2
  
  // Left Column - Quantity
  doc.setTextColor(textLight[0], textLight[1], textLight[2])
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Kuantitas', margin + 8, gridY)
  
  doc.setTextColor(textDark[0], textDark[1], textDark[2])
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(`${order.quantity}`, margin + 8, gridY + 10)
  
  doc.setTextColor(textLight[0], textLight[1], textLight[2])
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Unit', margin + 8 + doc.getTextWidth(`${order.quantity}`) + 2, gridY + 10)
  
  // Right Column - Unit Price
  doc.setTextColor(textLight[0], textLight[1], textLight[2])
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Harga Satuan', margin + 8 + colWidth, gridY)
  
  doc.setTextColor(textDark[0], textDark[1], textDark[2])
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text(`Rp ${product.price.toLocaleString('id-ID')}`, margin + 8 + colWidth, gridY + 10)
  
  currentY += 35
  
  // ========================================
  // PRICING SUMMARY - Professional Layout
  // ========================================
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2])
  doc.roundedRect(margin, currentY, contentWidth, 65, 3, 3, 'F')
  
  const summaryX = margin + 8
  currentY += 15
  
  // Subtotal
  doc.setTextColor(textLight[0], textLight[1], textLight[2])
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Subtotal', summaryX, currentY)
  
  const subtotal = product.price * order.quantity
  doc.setTextColor(textDark[0], textDark[1], textDark[2])
  doc.setFont('helvetica', 'bold')
  doc.text(`Rp ${subtotal.toLocaleString('id-ID')}`, pageWidth - margin - 8, currentY, { align: 'right' })
  
  // Divider
  currentY += 8
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2])
  doc.setLineWidth(0.3)
  doc.line(summaryX, currentY, pageWidth - margin - 8, currentY)
  
  // Total - Highlighted
  currentY += 12
  doc.setFillColor(...primary)
  doc.roundedRect(margin, currentY - 6, contentWidth, 20, 2, 2, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('TOTAL BAYAR', summaryX, currentY + 6)
  
  doc.setFontSize(18)
  doc.text(`Rp ${order.total_price.toLocaleString('id-ID')}`, pageWidth - margin - 8, currentY + 6, { align: 'right' })
  
  currentY += 30
  
  // Payment Method (if available)
  if (order.payment_method) {
    doc.setTextColor(accent[0], accent[1], accent[2])
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(`✓ Metode Pembayaran: ${order.payment_method}`, summaryX, currentY)
    currentY += 6
  }
  
  currentY += 15
  
  // ========================================
  // IMPORTANT NOTES
  // ========================================
  doc.setFillColor(255, 255, 255)
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2])
  doc.roundedRect(margin, currentY, contentWidth, 45, 3, 3, 'FD')
  
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2])
  doc.roundedRect(margin, currentY, contentWidth, 10, 3, 3, 'F')
  
  doc.setTextColor(secondary[0], secondary[1], secondary[2])
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('ℹ️  Informasi Penting', margin + 8, currentY + 7)
  
  currentY += 18
  
  const notes = [
    '• Pesanan Anda akan segera kami proses',
    '• Estimasi pengiriman: 2-4 hari kerja',
    '• Simpan invoice ini sebagai bukti transaksi'
  ]
  
  doc.setTextColor(textLight[0], textLight[1], textLight[2])
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  
  notes.forEach((note, index) => {
    doc.text(note, margin + 8, currentY + (index * 7))
  })
  
  // ========================================
  // FOOTER - Professional
  // ========================================
  const footerY = pageHeight - 30
  
  doc.setFillColor(...secondary)
  doc.rect(0, footerY, pageWidth, 30, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Terima Kasih Atas Kepercayaan Anda! 🙏', pageWidth / 2, footerY + 10, { align: 'center' })
  
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('www.next-store.com  •  support@next-store.com  •  WhatsApp: +62 882-7912-6971', pageWidth / 2, footerY + 19, { align: 'center' })
  
  // Watermark
  doc.setTextColor(245, 245, 245)
  doc.setFontSize(60)
  doc.setFont('helvetica', 'bold')
  doc.saveGraphicsState()
  doc.setGState(new doc.GState({ opacity: 0.03 }))
  doc.text('NEXT STORE', pageWidth / 2, pageHeight / 2, {
    align: 'center',
    angle: 45
  })
  doc.restoreGraphicsState()
  
  // Save with professional filename
  const fileName = `INVOICE-${shortId}-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}