# Quick Setup Guide

## 1. Install Dependencies

```bash
npm install
```

## 2. Setup Supabase

1. Buat account di [Supabase](https://supabase.com)
2. Buat project baru
3. Copy environment variables dari Project Settings > API

## 3. Environment Variables

Buat file `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 4. Database Setup

1. Buka Supabase SQL Editor
2. Copy dan jalankan SQL dari file `supabase-schema.sql`

## 5. Storage Setup

1. Buka Supabase Dashboard > Storage
2. Buat bucket `ecommerce-assets` (public)
3. Setup policies (lihat `supabase-storage-setup.md`)

## 6. Run Development Server

```bash
npm run dev
```

## 7. Access Application

- **Guest**: http://localhost:3000
- **Admin**: http://localhost:3000/admin/login
  - Username: `adminridho`
  - Password: `adminridho123`

## 8. Test Application

1. Login sebagai admin
2. Tambah produk dengan gambar
3. Tambah ulasan untuk produk
4. Setujui ulasan
5. Buat pesanan sebagai guest
6. Update status pesanan di admin
7. Test WhatsApp dan PDF export di halaman success

## Troubleshooting

### Error: Cannot find module '@supabase/supabase-js'
- Jalankan `npm install`

### Error: SUPABASE_SERVICE_ROLE_KEY is not set
- Pastikan file `.env.local` sudah dibuat
- Pastikan environment variable sudah di-set dengan benar
- Restart development server

### Error: Failed to upload image
- Pastikan bucket `ecommerce-assets` sudah dibuat
- Pastikan bucket set ke public
- Pastikan policies sudah di-setup (lihat `supabase-storage-setup.md`)

### Error: Row Level Security policy
- Pastikan SQL schema sudah dijalankan dengan benar
- Pastikan policies sudah dibuat di Supabase SQL Editor

## Next Steps

1. Tambah produk melalui admin panel
2. Tambah ulasan dan setujui untuk ditampilkan
3. Test flow pemesanan sebagai guest
4. Customize design sesuai kebutuhan
5. Deploy ke production (Vercel, Netlify, dll)

