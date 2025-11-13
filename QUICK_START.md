# Quick Start Guide

## ✅ Yang Sudah Dilakukan:

1. ✅ Environment variables sudah di-setup di `.env.local`
2. ✅ Dependencies sudah di-install
3. ✅ Database schema sudah dijalankan
4. ✅ Development server sedang berjalan

## 🔧 Yang Perlu Dilakukan:

### 1. Setup Storage Bucket (Penting untuk Upload Gambar)

1. Buka Supabase Dashboard: https://supabase.com/dashboard
2. Pilih project: **ridhogithub1's Project**
3. Klik **Storage** di sidebar kiri
4. Klik **New bucket**
5. Nama: `ecommerce-assets`
6. Set **Public bucket** ke **ON** ✅
7. Klik **Create bucket**

### 2. Setup Storage Policies

Jalankan SQL berikut di Supabase SQL Editor:

```sql
-- Allow public read access (untuk menampilkan gambar)
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'ecommerce-assets');
```

### 3. Dapatkan Service Role Key (Untuk Upload Gambar)

Lihat file `SERVICE_ROLE_KEY.md` untuk panduan lengkap.

**Quick steps:**
1. Supabase Dashboard > Settings > API
2. Copy **service_role** key
3. Update `.env.local` dengan key tersebut
4. Restart server

## 🚀 Akses Aplikasi:

- **Guest/Home**: http://localhost:3000
- **Admin Login**: http://localhost:3000/admin/login
  - Username: `adminridho`
  - Password: `adminridho123`

## 📝 Testing:

1. Login sebagai admin
2. Tambah produk (dengan gambar jika storage sudah setup)
3. Tambah ulasan untuk produk
4. Setujui ulasan agar tampil di halaman order
5. Buat pesanan sebagai guest
6. Update status pesanan di admin panel

## ⚠️ Troubleshooting:

### Error: SUPABASE_SERVICE_ROLE_KEY is not set
- Update `.env.local` dengan service role key
- Restart server

### Error: Failed to upload image
- Pastikan bucket `ecommerce-assets` sudah dibuat
- Pastikan bucket set ke public
- Pastikan policy sudah di-setup

### Error: Row Level Security
- Pastikan SQL schema sudah dijalankan dengan benar
- Cek di Supabase Dashboard > Authentication > Policies

