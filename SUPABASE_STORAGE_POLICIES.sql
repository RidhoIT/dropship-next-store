-- Supabase Storage Policies untuk ecommerce-assets bucket
-- Jalankan SQL ini di Supabase SQL Editor (Dashboard > SQL Editor)

-- 1. Pastikan bucket sudah dibuat dengan nama 'ecommerce-assets' dan set ke PUBLIC

-- 2. Hapus policies lama jika ada (optional)
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Public upload access" ON storage.objects;
DROP POLICY IF EXISTS "Public update access" ON storage.objects;
DROP POLICY IF EXISTS "Public delete access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;

-- 3. Buat policies baru untuk public access (menggunakan anon key)

-- Policy untuk membaca file (public read)
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'ecommerce-assets');

-- Policy untuk upload file (public insert)
CREATE POLICY "Public upload access"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'ecommerce-assets');

-- Policy untuk update file (public update)
CREATE POLICY "Public update access"
ON storage.objects FOR UPDATE
USING (bucket_id = 'ecommerce-assets')
WITH CHECK (bucket_id = 'ecommerce-assets');

-- Policy untuk delete file (public delete)
CREATE POLICY "Public delete access"
ON storage.objects FOR DELETE
USING (bucket_id = 'ecommerce-assets');

-- Catatan:
-- Policies ini memberikan akses penuh ke bucket 'ecommerce-assets'
-- Untuk production, pertimbangkan untuk menggunakan service role key
-- atau membuat policies yang lebih ketat dengan authentication



