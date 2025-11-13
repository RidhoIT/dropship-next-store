# App Summary - E-commerce Sederhana

## Gambaran Umum
Aplikasi e-commerce sederhana berbasis Next.js dengan Supabase sebagai backend. Aplikasi memiliki dua modul utama: **Pengunjung (Guest)** dan **Administrasi (Admin)**.

## Stack Teknologi
- **Frontend & Backend**: Next.js (dengan API Routes)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Authentication**: Static credentials untuk admin

---

## Modul Aplikasi

### 1. Modul Pengunjung (Guest)

#### Halaman Utama (Home)
- Menampilkan daftar lengkap semua produk
- Live search berdasarkan nama atau deskripsi
- Filter berdasarkan kategori, harga, atau stok

#### Halaman Pemesanan (`/order/:id`)
- Formulir pemesanan dengan input:
  - Nama pelanggan
  - Alamat lengkap
  - Nomor telepon
  - Jumlah (quantity)
- Menampilkan daftar ulasan/testimoni produk (gambar dan teks)

#### Halaman Sukses (`/success`)
- Konfirmasi keberhasilan pemesanan
- Tombol WhatsApp ke 088279126971 dengan pre-filled message detail order
- Export bukti pesanan ke PDF

---

### 2. Modul Administrasi (Admin)

#### Autentikasi
- **Username**: `adminridho`
- **Password**: `adminridho123`

#### Dashboard
- Statistik ringkasan:
  - Total Omset
  - Total Profit
  - Total Produk
  - Total Review
  - Grafik penjualan 7 hari terakhir

#### Manajemen Produk (CRUD)
- Create, Read, Update, Delete produk
- Upload multiple images per produk (Supabase Storage)

#### Manajemen Ulasan (CRUD)
- Create, Read, Update, Delete ulasan
- Upload multiple images per ulasan
- Approval system untuk menampilkan ulasan

#### Manajemen Pesanan (CRUD)
- List semua pesanan
- Update status pesanan (Baru, Diproses, Selesai, Batal)
- Delete pesanan

---

## Alur Aplikasi

### Alur Pemesanan (Guest)
1. Akses halaman utama → lihat daftar produk
2. Gunakan pencarian/filter untuk menemukan produk
3. Klik tombol beli/order pada produk
4. Isi formulir pemesanan (nama, alamat, telepon, quantity)
5. Submit order → data disimpan ke database
6. Redirect ke halaman sukses
7. Konfirmasi via WhatsApp atau export PDF

### Alur Admin
1. Akses halaman admin → redirect ke login
2. Login dengan kredensial statis
3. Masuk ke dashboard → lihat statistik
4. Navigasi ke halaman manajemen (produk/ulasan/pesanan)
5. Lakukan operasi CRUD sesuai kebutuhan

---

## Database Schema

### Tabel: `products`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID (PK) | Primary key auto-generated |
| name | text | Nama produk |
| description | text | Deskripsi produk |
| price | numeric(10,2) | Harga jual satuan |
| stock | int4 | Kuantitas stok |
| category | text | Kategori produk |
| images | jsonb | Array URL gambar `['url1', 'url2']` |
| created_at | timestamp | Waktu pembuatan |

### Tabel: `reviews`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID (PK) | Primary key auto-generated |
| product_id | UUID (FK) | Referensi ke products.id |
| reviewer_name | text | Nama pengulas |
| text_content | text | Isi ulasan |
| rating | int4 | Rating 1-5 (opsional) |
| images | jsonb | Array URL gambar ulasan |
| is_approved | boolean | Status approval (default: false) |
| created_at | timestamp | Waktu pembuatan |

### Tabel: `orders`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID (PK) | Primary key auto-generated |
| product_id | UUID (FK) | Referensi ke products.id |
| customer_name | text | Nama pelanggan |
| address | text | Alamat lengkap |
| phone_number | text | Nomor telepon |
| quantity | int4 | Jumlah pesanan |
| total_price | numeric(10,2) | Total harga (price × quantity) |
| status | text | Status: Baru/Diproses/Selesai/Batal |
| created_at | timestamp | Waktu pemesanan |

---

## Supabase Storage

### Bucket Configuration
- **Bucket name**: `ecommerce-assets`
- **Access**: Public untuk produk dan ulasan
- **Path structure**:
  - Products: `ecommerce-assets/products/{product_id}/...`
  - Reviews: `ecommerce-assets/reviews/{review_id}/...`

---

## Fitur Khusus

### WhatsApp Integration
- Nomor tujuan: **088279126971**
- Pre-filled message dengan detail order

### PDF Export
- Generate bukti pesanan dalam format PDF
- Berisi informasi lengkap pesanan

### Live Search
- Real-time pencarian produk
- Search berdasarkan nama dan deskripsi

### Multi-Image Upload
- Produk dan ulasan mendukung multiple images
- Stored di Supabase Storage sebagai JSONB array

---

## Database Indexes
- `reviews.product_id` - untuk pencarian ulasan per produk
- `orders.status` - untuk filter pesanan berdasarkan status
- `orders.product_id` - untuk pencarian pesanan per produk

---

## Constraints & Validations
- Price dan total_price harus ≥ 0
- Stock harus ≥ 0
- Quantity harus ≥ 1
- Rating harus 1-5
- Status order hanya: 'Baru', 'Diproses', 'Selesai', 'Batal'