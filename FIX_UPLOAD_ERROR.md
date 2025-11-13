# Fix Upload Error (500) - Permission Denied

Jika Anda mendapatkan error **"Permission denied"** saat upload gambar, ikuti langkah-langkah di **SETUP_STORAGE.md** untuk setup storage bucket dan policies.

**Quick Fix:**
1. Buka file `SETUP_STORAGE.md` untuk panduan lengkap
2. Atau jalankan SQL dari file `SUPABASE_STORAGE_POLICIES.sql` di Supabase SQL Editor

---

Jika Anda mendapatkan error 500 lainnya saat upload gambar, kemungkinan besar karena storage bucket belum dibuat atau policies belum di-setup.

## Langkah-langkah Fix:

### 1. Buat Storage Bucket

1. Buka Supabase Dashboard: https://supabase.com/dashboard
2. Pilih project: **ridhogithub1's Project**
3. Klik **Storage** di sidebar kiri
4. Klik **New bucket**
5. Nama bucket: `ecommerce-assets`
6. Set **Public bucket** ke **ON** ✅
7. Klik **Create bucket**

### 2. Setup Storage Policies

Jalankan SQL berikut di Supabase SQL Editor (Storage > Policies):

```sql
-- Allow public read access (untuk menampilkan gambar)
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'ecommerce-assets');

-- Allow authenticated upload (jika menggunakan anon key)
CREATE POLICY "Public upload access" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'ecommerce-assets');
```

**ATAU** jika Anda sudah mendapatkan service role key, update `.env.local`:

```
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Dan restart server.

### 3. Test Upload

Setelah setup:
1. Restart development server
2. Coba upload gambar melalui admin panel
3. Jika masih error, cek console untuk error message yang lebih detail

## Error Messages:

- **"Bucket not found"** → Bucket belum dibuat
- **"Permission denied"** → Policies belum di-setup
- **"SUPABASE_SERVICE_ROLE_KEY is not set"** → Service role key belum di-set (opsional, bisa menggunakan anon key dengan policies)

## Quick Fix:

Jika Anda ingin menggunakan anon key (tidak perlu service role key), jalankan SQL policies di atas dan pastikan bucket sudah dibuat dengan public access.

