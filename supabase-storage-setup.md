# Supabase Storage Setup

## 1. Create Storage Bucket

1. Buka Supabase Dashboard
2. Navigate ke **Storage**
3. Klik **New bucket**
4. Nama bucket: `ecommerce-assets`
5. Set **Public bucket** ke **ON**
6. Klik **Create bucket**

## 2. Setup Storage Policies

Karena kita menggunakan service role key untuk upload melalui API route, kita hanya perlu policy untuk public read access. Upload akan dilakukan melalui API route yang menggunakan service role key.

Jalankan SQL berikut di Supabase SQL Editor:

```sql
-- Allow public read access (untuk menampilkan gambar)
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'ecommerce-assets');

-- Note: Upload akan dilakukan melalui API route yang menggunakan service role key
-- sehingga tidak perlu policy untuk INSERT/UPDATE/DELETE di sini
```

Atau, jika Anda ingin menggunakan anon key langsung dari client, Anda bisa menggunakan policy berikut (kurang aman):

```sql
-- Allow public read access
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'ecommerce-assets');

-- Allow public upload (tidak direkomendasikan untuk production)
CREATE POLICY "Public upload access" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'ecommerce-assets');

-- Allow public update
CREATE POLICY "Public update access" ON storage.objects
  FOR UPDATE USING (bucket_id = 'ecommerce-assets');

-- Allow public delete
CREATE POLICY "Public delete access" ON storage.objects
  FOR DELETE USING (bucket_id = 'ecommerce-assets');
```

## 3. Folder Structure

Bucket akan menyimpan file dalam struktur berikut:
- `products/{product_id}/{filename}`
- `reviews/{review_id}/{filename}`

## 4. Test Upload

Setelah setup, coba upload gambar melalui admin panel untuk memastikan semuanya bekerja dengan baik.

