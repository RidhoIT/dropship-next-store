# E-commerce Store

Aplikasi e-commerce sederhana berbasis Next.js dengan Supabase sebagai backend.

## Fitur

### Modul Pengunjung (Guest)
- Halaman utama dengan daftar produk
- Live search berdasarkan nama atau deskripsi
- Filter berdasarkan kategori, harga, atau stok
- Halaman pemesanan dengan formulir lengkap
- Halaman sukses dengan integrasi WhatsApp dan export PDF
- Menampilkan ulasan/testimoni produk

### Modul Administrasi (Admin)
- Login dengan kredensial statis
- Dashboard dengan statistik dan grafik penjualan
- Manajemen Produk (CRUD)
- Manajemen Ulasan (CRUD) dengan sistem approval
- Manajemen Pesanan (CRUD) dengan update status
- Upload multiple images untuk produk dan ulasan

## Stack Teknologi

- **Frontend & Backend**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Authentication**: Static credentials untuk admin
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **PDF**: jsPDF
- **Notifications**: React Hot Toast

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Supabase

1. Buat project di [Supabase](https://supabase.com)
2. Buat bucket storage dengan nama `ecommerce-assets` dan set ke public
3. Copy environment variables dari Supabase project settings

### 3. Environment Variables

Buat file `.env.local` di root project:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Database Schema

Jalankan SQL dari file `supabase-schema.sql` di Supabase SQL Editor, atau copy-paste SQL berikut:

```sql
-- Tabel Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  stock INT4 NOT NULL CHECK (stock >= 0),
  category TEXT NOT NULL,
  images JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabel Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL,
  text_content TEXT NOT NULL,
  rating INT4 CHECK (rating >= 1 AND rating <= 5),
  images JSONB DEFAULT '[]'::jsonb,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabel Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  quantity INT4 NOT NULL CHECK (quantity >= 1),
  total_price NUMERIC(10,2) NOT NULL CHECK (total_price >= 0),
  status TEXT NOT NULL CHECK (status IN ('Baru', 'Diproses', 'Selesai', 'Batal')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_product_id ON orders(product_id);
```

### 5. Setup Storage Bucket

Ikuti instruksi di file `supabase-storage-setup.md` atau lakukan langkah berikut:

1. Buka Supabase Dashboard > Storage
2. Buat bucket baru dengan nama `ecommerce-assets`
3. Set bucket ke public access
4. Setup policies untuk read access (lihat `supabase-storage-setup.md` untuk detail)

### 6. Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## Admin Credentials

- **Username**: `adminridho`
- **Password**: `adminridho123`

## Struktur Project

```
├── app/
│   ├── admin/           # Admin pages
│   │   ├── dashboard/   # Dashboard
│   │   ├── products/    # Product management
│   │   ├── reviews/     # Review management
│   │   ├── orders/      # Order management
│   │   └── login/       # Admin login
│   ├── order/           # Order page (guest)
│   ├── success/         # Success page (guest)
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page (guest)
├── components/          # Reusable components
│   └── AdminLayout.tsx  # Admin layout component
├── lib/                 # Utilities
│   ├── supabase.ts      # Supabase client
│   ├── types.ts         # TypeScript types
│   ├── storage.ts       # Storage utilities
│   ├── pdf.ts           # PDF generation
│   └── admin-auth.ts    # Admin authentication
└── app_summary.md       # Project requirements
```

## Fitur Khusus

### WhatsApp Integration
- Nomor tujuan: 088279126971
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

## Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint
```

## License

MIT

