# Setup Supabase Storage - Step by Step

## Error yang Anda Alami:
```
Permission denied. Please check storage policies in Supabase Dashboard > Storage > Policies.
```

## Solusi:

### Langkah 1: Buat Storage Bucket

1. Buka **Supabase Dashboard**: https://supabase.com/dashboard
2. Pilih project: **ridhogithub1's Project**
3. Klik **Storage** di sidebar kiri
4. Klik tombol **New bucket** (atau **Create bucket**)
5. Isi form:
   - **Name**: `ecommerce-assets`
   - **Public bucket**: **ON** ✅ (PENTING!)
   - **File size limit**: (biarkan default atau sesuaikan)
   - **Allowed MIME types**: (biarkan kosong untuk semua jenis file)
6. Klik **Create bucket**

### Langkah 2: Setup Storage Policies

Ada 2 cara:

#### **Cara 1: Menggunakan SQL (Recommended)**

1. Buka **Supabase Dashboard** > **SQL Editor**
2. Copy dan paste SQL dari file `SUPABASE_STORAGE_POLICIES.sql`
3. Klik **Run** atau tekan `Ctrl+Enter`
4. Pastikan tidak ada error

#### **Cara 2: Menggunakan UI**

1. Buka **Supabase Dashboard** > **Storage** > **Policies**
2. Pilih bucket `ecommerce-assets`
3. Klik **New Policy**
4. Buat 4 policies berikut:

**Policy 1: Public Read**
- Policy name: `Public read access`
- Allowed operation: `SELECT`
- Policy definition: `bucket_id = 'ecommerce-assets'`

**Policy 2: Public Upload**
- Policy name: `Public upload access`
- Allowed operation: `INSERT`
- Policy definition: `bucket_id = 'ecommerce-assets'`

**Policy 3: Public Update**
- Policy name: `Public update access`
- Allowed operation: `UPDATE`
- Policy definition: `bucket_id = 'ecommerce-assets'`

**Policy 4: Public Delete**
- Policy name: `Public delete access`
- Allowed operation: `DELETE`
- Policy definition: `bucket_id = 'ecommerce-assets'`

### Langkah 3: Verifikasi Setup

1. Pastikan bucket `ecommerce-assets` sudah dibuat
2. Pastikan bucket set ke **Public**
3. Pastikan semua 4 policies sudah dibuat
4. Restart development server:
   ```bash
   # Hentikan server (Ctrl+C)
   npm run dev
   ```

### Langkah 4: Test Upload

1. Login sebagai admin
2. Buka halaman **Produk**
3. Klik **Tambah Produk**
4. Isi form dan upload gambar
5. Klik **Simpan**

Jika masih error, cek:
- Apakah bucket sudah dibuat?
- Apakah bucket set ke public?
- Apakah policies sudah dibuat?
- Apakah sudah restart server?

## Troubleshooting

### Error: "Bucket not found"
→ Buat bucket `ecommerce-assets` di Storage

### Error: "Permission denied"
→ Setup policies menggunakan SQL di atas

### Error: "Row Level Security policy violation"
→ Pastikan policies sudah dibuat dengan benar

### Upload berhasil tapi gambar tidak muncul
→ Pastikan bucket set ke **Public**

## Catatan Keamanan

⚠️ **Untuk Development**: Policies di atas memberikan akses penuh ke bucket (public).

⚠️ **Untuk Production**: Pertimbangkan untuk:
- Menggunakan service role key (lebih aman)
- Membuat policies yang lebih ketat dengan authentication
- Membatasi file types dan sizes






